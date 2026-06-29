import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAccess } from '@/lib/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const BUCKET = 'console-validations';
const GB = 1024 ** 3;

// Intake folders are named "YYYY-MM-DD-<dealId>-<slug>". The deal id ties a
// folder back to its console_validations row, so we only ever remove a folder
// whose request is confirmed in Dropbox (dropbox_link set) and old enough.
// Anything that doesn't match this exact shape (support/, replies, Dropbox-path
// keyed folders, tmp/) is left untouched.
const INTAKE_RE = /^\d{4}-\d{2}-\d{2}-(\d{3,})-/;

/**
 * Admin storage report + manual cleanup for the console-validations bucket.
 *
 *   GET /api/admin/storage
 *     Read-only usage report (objects, GB used, % of the 100 GB included).
 *
 *   GET /api/admin/storage?cleanup=1[&days=90][&limit=50]
 *     DRY-RUN: lists the intake folders that WOULD be removed — those whose
 *     request is confirmed in Dropbox and older than `days` (default 90).
 *
 *   GET /api/admin/storage?cleanup=1&confirm=1[&days=90][&limit=50]
 *     Actually delete those folders' objects. The full-resolution originals
 *     remain in Dropbox; nothing rendered in the UI depends on these. Bounded
 *     by `limit` (default 50) and re-runnable.
 */
export async function GET(request: NextRequest) {
  const access = await getAdminAccess();
  if (!access.ok || !access.canManage) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 });
  }

  const admin = createSupabaseAdminClient();
  const params = request.nextUrl.searchParams;
  const cleanup = ['1', 'true', 'yes'].includes((params.get('cleanup') || '').toLowerCase());
  const confirm = ['1', 'true', 'yes'].includes((params.get('confirm') || '').toLowerCase());
  const days = Math.min(Math.max(Number(params.get('days')) || 90, 0), 3650);
  const limit = Math.min(Math.max(Number(params.get('limit')) || 50, 1), 500);

  const { data: usage } = await admin.rpc('console_storage_usage');
  const u = Array.isArray(usage) ? usage[0] : usage;
  const totalBytes = Number(u?.bytes ?? 0);
  const totalObjects = Number(u?.objects ?? 0);
  const usedGb = Number((totalBytes / GB).toFixed(3));

  if (!cleanup) {
    return NextResponse.json({
      bucket: BUCKET,
      objects: totalObjects,
      usedGb,
      includedGb: 100,
      percentOfIncluded: Number(((totalBytes / GB / 100) * 100).toFixed(2)),
      hint: 'Add ?cleanup=1 for a dry-run of removable intake photos (Dropbox-confirmed, older than ?days=90), then &confirm=1 to delete.',
    });
  }

  // Deal ids whose request is confirmed in Dropbox and older than `days`.
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
  const { data: rows } = await admin
    .from('console_validations')
    .select('pipedrive_deal_id, dropbox_link, created_at')
    .not('dropbox_link', 'is', null)
    .lt('created_at', cutoff);
  const safeDeals = new Set(
    (rows ?? []).map((r) => (r.pipedrive_deal_id == null ? '' : String(r.pipedrive_deal_id))).filter(Boolean)
  );

  // Intake folders at the bucket root whose deal id is safe to remove.
  const { data: top } = await admin.storage.from(BUCKET).list('', { limit: 1000 });
  const targets = (top ?? [])
    .map((e) => ({ name: e.name, deal: INTAKE_RE.exec(e.name)?.[1] }))
    .filter((e): e is { name: string; deal: string } => Boolean(e.deal) && safeDeals.has(e.deal!))
    .slice(0, limit);

  const results: { folder: string; deal: string; files: number; bytes: number; deleted: boolean }[] = [];
  let freedBytes = 0;
  for (const t of targets) {
    const { data: files } = await admin.storage.from(BUCKET).list(t.name, { limit: 1000 });
    // Only the intake photos + infos.txt — never the customer-reply photos
    // ("reply-*"), which the in-account thread still renders.
    const deletable = (files ?? []).filter((f) => f.id !== null && !f.name.startsWith('reply-'));
    const paths = deletable.map((f) => `${t.name}/${f.name}`);
    const bytes = deletable.reduce((s, f) => s + Number((f.metadata as any)?.size ?? 0), 0);
    let deleted = false;
    if (confirm && paths.length) {
      const { error: rmErr } = await admin.storage.from(BUCKET).remove(paths);
      deleted = !rmErr;
      if (deleted) freedBytes += bytes;
    }
    results.push({ folder: t.name, deal: t.deal, files: paths.length, bytes, deleted });
  }

  const removableBytes = results.reduce((s, r) => s + r.bytes, 0);
  return NextResponse.json({
    mode: confirm ? 'deleted' : 'dry-run',
    days,
    usedGbBefore: usedGb,
    candidates: results.length,
    removableMb: Number((removableBytes / 1024 / 1024).toFixed(1)),
    freedMb: confirm ? Number((freedBytes / 1024 / 1024).toFixed(1)) : 0,
    note: confirm
      ? 'Deleted intake photos for Dropbox-confirmed requests. Originals remain in Dropbox.'
      : 'Dry-run only — add &confirm=1 to delete. Re-run until candidates reaches 0.',
    results,
  });
}
