import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAccess } from '@/lib/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { dropboxEnabled, dropboxDiagnostics, dropboxMoveFolder, getAccessToken } from '@/lib/dropbox';
import { recordAudit } from '@/lib/admin-audit';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const BASE_FOLDER = (process.env.DROPBOX_FOLDER || '/Dossier RUTHERFORD/Prospects information').replace(/\/+$/, '');
const PATH_ROOT = process.env.DROPBOX_PATH_ROOT;

/**
 * Admin diagnostic + repair for the Dropbox integration.
 *
 *   GET /api/admin/dropbox-debug
 *     Read-only. Reports the authenticated Dropbox account, its namespaces
 *     (personal "home" vs. shared "team space"), the configured base folder /
 *     path-root, and a listing of the base folder in each namespace — so you can
 *     see WHERE the console-validation folders landed and the exact
 *     DROPBOX_PATH_ROOT value to set so writes target the team space.
 *
 *   POST /api/admin/dropbox-debug?move=1[&from=<member folder name>]
 *     Relocate the already-created folders out of the member's personal home and
 *     into the team-space base folder. Run this AFTER setting DROPBOX_PATH_ROOT
 *     to the team root namespace and redeploying. The member folder name
 *     defaults to the account display name (override with ?from=). Shared links
 *     survive the move; idempotent (a folder already moved just errors "not
 *     found" and is reported, never duplicated destructively).
 */
export async function GET(request: NextRequest) {
  return handle(request, false);
}

// The folder relocation is a mutation — POST only, so a crafted link opened by
// an authenticated admin can't trigger it via ambient cookies.
export async function POST(request: NextRequest) {
  return handle(request, true);
}

async function handle(request: NextRequest, allowMove: boolean) {
  const access = await getAdminAccess();
  if (!access.ok || !access.canManage) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (!dropboxEnabled()) {
    return NextResponse.json({ error: 'Dropbox not configured (set the DROPBOX_* env vars)' }, { status: 400 });
  }

  const params = request.nextUrl.searchParams;
  const moveRequested = ['1', 'true', 'yes'].includes((params.get('move') || '').toLowerCase());
  if (moveRequested && !allowMove) {
    return NextResponse.json(
      { error: 'move requires POST', hint: 'Re-run the same URL as a POST request to relocate the folders.' },
      { status: 405 }
    );
  }
  const move = moveRequested && allowMove;

  const diagnostics = await dropboxDiagnostics();
  if (!move) return NextResponse.json(diagnostics);

  // --- Relocate mode -------------------------------------------------------
  // Once DROPBOX_PATH_ROOT is set we operate from the team-space root, where the
  // member's personal home is mounted under their name. So the personal copy of
  // "<base>/<leaf>" is reachable at "/<member>/<base>/<leaf>" and we move it to
  // "<base>/<leaf>" (the team space). The stored DB path already equals the
  // team-space path, so no row update is needed.
  if (!PATH_ROOT) {
    return NextResponse.json(
      { error: 'Set DROPBOX_PATH_ROOT to the team root namespace and redeploy before relocating.', diagnostics },
      { status: 400 }
    );
  }
  const memberFolder = (params.get('from') || diagnostics.account?.name || '').trim().replace(/^\/+|\/+$/g, '');
  if (!memberFolder) {
    return NextResponse.json({ error: 'Could not determine the personal-folder name; pass ?from=<exact name>.' }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const token = await getAccessToken();
  const { data: rows } = await admin
    .from('console_validations')
    .select('id, company, pipedrive_deal_id, dropbox_folder')
    .not('dropbox_folder', 'is', null)
    .order('created_at', { ascending: true });

  const results: { deal: number | null; company: string | null; status: string }[] = [];
  for (const r of rows ?? []) {
    const company = (r.company as string | null) ?? null;
    const deal = (r.pipedrive_deal_id as number | null) ?? null;
    const stored = ((r.dropbox_folder as string | null) ?? '').trim();
    if (!stored.startsWith(`${BASE_FOLDER}/`)) {
      results.push({ deal, company, status: `skipped — "${stored}" not under ${BASE_FOLDER}` });
      continue;
    }
    const from = `/${memberFolder}${stored}`; // personal copy, seen from the team-space root
    const to = stored; // same path, now resolved in the team space
    const moved = await dropboxMoveFolder(token, from, to);
    results.push({
      deal,
      company,
      status: moved.ok ? `moved → ${moved.path ?? to}` : `ERROR ${moved.status ?? ''}: ${moved.error ?? ''}`.trim(),
    });
  }

  const movedCount = results.filter((x) => x.status.startsWith('moved')).length;
  await recordAudit({
    actorId: access.userId,
    action: 'dropbox.move',
    targetType: 'dropbox',
    targetId: BASE_FOLDER,
    summary: `Dropbox : ${movedCount} dossier(s) déplacé(s) depuis /${memberFolder}${BASE_FOLDER}`,
    metadata: { moved: movedCount, from: `/${memberFolder}${BASE_FOLDER}` },
  });
  return NextResponse.json({ moved: movedCount, from: `/${memberFolder}${BASE_FOLDER}`, to: BASE_FOLDER, results });
}
