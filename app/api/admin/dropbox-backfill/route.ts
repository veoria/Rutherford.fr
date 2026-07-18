import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAccess } from '@/lib/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { dropboxEnabled, uploadConsoleValidation } from '@/lib/dropbox';
import { getConsoleValidationTaskState } from '@/lib/asana';
import { recordAudit } from '@/lib/admin-audit';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const BUCKET = 'console-validations';

/**
 * One-time backfill: create the Dropbox folder for past console validations that
 * predate the Dropbox integration (dropbox_link still null), reusing the photos
 * already sitting in Supabase Storage. Admin-only and idempotent — only rows
 * with no Dropbox link are touched, and a successful row is stamped with its
 * link so re-running continues with whatever is left. Re-run (or pass ?limit=)
 * until "remaining" reaches 0.
 *
 * The folder is named after the Asana task (so it matches Asana), falling back
 * to the reconstructed deal title.
 */
// Writes to Dropbox and stamps rows — POST only (state-changing requests must
// not ride a top-level GET navigation). GET documents the switch.
export async function GET() {
  return NextResponse.json(
    { error: 'backfill requires POST', hint: 'Re-run the same URL as a POST request (idempotent, ?limit= supported).' },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  const access = await getAdminAccess();
  if (!access.ok || !access.canManage) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (!dropboxEnabled()) {
    return NextResponse.json({ error: 'Dropbox not configured (set the DROPBOX_* env vars)' }, { status: 400 });
  }

  const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get('limit')) || 6, 1), 20);
  const admin = createSupabaseAdminClient();

  const { data: rows } = await admin
    .from('console_validations')
    .select('id, company, country, machine, email, pipedrive_deal_id, asana_task_gid, dropbox_folder')
    .is('dropbox_link', null)
    .order('created_at', { ascending: true })
    .limit(limit);

  const results: { deal: number | null; company: string | null; status: string }[] = [];

  for (const r of rows ?? []) {
    const company = (r.company as string | null) ?? null;
    const deal = (r.pipedrive_deal_id as number | null) ?? null;
    try {
      const folderRef = r.dropbox_folder as string | null;
      if (!folderRef) {
        results.push({ deal, company, status: 'skipped — no storage folder' });
        continue;
      }

      const { data: list } = await admin.storage.from(BUCKET).list(folderRef);
      const photoFiles = (list ?? []).filter((f) => f.name && f.name !== 'infos.txt' && !f.name.endsWith('/'));
      const uploads: { field: string; file: File }[] = [];
      for (const f of photoFiles) {
        const { data: blob } = await admin.storage.from(BUCKET).download(`${folderRef}/${f.name}`);
        if (blob) uploads.push({ field: f.name.replace(/\.[^.]+$/, ''), file: new File([blob], f.name) });
      }
      if (!uploads.length) {
        results.push({ deal, company, status: 'skipped — no readable photos in storage' });
        continue;
      }

      let infosTxt = '';
      const { data: infosBlob } = await admin.storage.from(BUCKET).download(`${folderRef}/infos.txt`);
      if (infosBlob) {
        infosTxt = await infosBlob.text();
      } else {
        infosTxt = [
          'Console validation request',
          `Company  : ${company ?? ''}`,
          `Country  : ${(r.country as string | null) ?? ''}`,
          `Machine  : ${(r.machine as string | null) ?? ''}`,
          `Email    : ${(r.email as string | null) ?? ''}`,
          `Pipedrive: ${deal ? `ID${deal}` : 'n/a'}`,
        ].join('\n');
      }

      // Name the folder after the Asana task, falling back to the deal title.
      let folderName: string | null = null;
      if (r.asana_task_gid) {
        const state = await getConsoleValidationTaskState(r.asana_task_gid as string).catch(() => null);
        folderName = state?.name?.trim() || null;
      }
      if (!folderName) {
        const base = [r.country, company, r.machine].map((s) => String(s ?? '').trim()).filter(Boolean).join(' - ');
        folderName = deal ? `${base} - ID${deal}` : base || `request-${String(r.id).slice(0, 8)}`;
      }

      const up = await uploadConsoleValidation(folderName, uploads, infosTxt);
      await admin
        .from('console_validations')
        .update({ dropbox_folder: up.folderPath, dropbox_link: up.folderLink, updated_at: new Date().toISOString() })
        .eq('id', r.id);
      results.push({ deal, company, status: `ok — ${up.count} photos${up.folderLink ? ' (linked)' : ''}` });
    } catch (error) {
      results.push({ deal, company, status: `ERROR: ${error instanceof Error ? error.message : 'unknown'}` });
    }
  }

  const { count: remaining } = await admin
    .from('console_validations')
    .select('id', { count: 'exact', head: true })
    .is('dropbox_link', null);

  const ok = results.filter((x) => x.status.startsWith('ok')).length;
  if (ok > 0) {
    await recordAudit({
      actorId: access.userId,
      action: 'dropbox.backfill',
      targetType: 'dropbox',
      targetId: BUCKET,
      summary: `Backfill Dropbox : ${ok} dossier(s) créé(s), ${remaining ?? '?'} restant(s)`,
      metadata: { processed: results.length, remaining: remaining ?? null },
    });
  }
  return NextResponse.json({ processed: results.length, remaining: remaining ?? null, results });
}
