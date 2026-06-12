import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';
import { addConsoleValidationTaskComment } from '@/lib/asana';
import { addDealNote } from '@/lib/pipedrive';

// Customer reply to a console validation (used by the in-account "provide more
// details" form). Verifies ownership via RLS, relays the comment + photos to the
// Asana task, and reopens the review (status → in_review).
export const dynamic = 'force-dynamic';

const BUCKET = 'console-validations';
const SIGNED_URL_TTL = 60 * 60 * 24 * 365; // 1 year

const validReplyPath = (p: unknown): p is string =>
  typeof p === 'string' && /^tmp\/[a-z0-9-]+\/reply[1-9]\.[a-z0-9]+$/i.test(p);

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Not available' }, { status: 503 });
  }

  const rls = createSupabaseServerClient();
  const {
    data: { user },
  } = await rls.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const comment = String(body.comment ?? '').trim().slice(0, 5000);
  const photoPaths: string[] = Array.isArray(body.photos)
    ? body.photos.map((p: any) => p?.path).filter(validReplyPath).slice(0, 9)
    : [];
  if (!comment && photoPaths.length === 0) {
    return NextResponse.json({ error: 'Add a comment or at least one photo' }, { status: 400 });
  }

  // RLS scopes this select to the visitor's own requests — ownership check.
  const { data: row } = await rls
    .from('console_validations')
    .select('id, asana_task_gid, dropbox_folder, pipedrive_deal_id, email')
    .eq('id', params.id)
    .maybeSingle();
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const dealId = (row.pipedrive_deal_id as number | null) ?? null;
  const ref = dealId ? `ID-${dealId}` : String(row.id).slice(0, 8);

  // Move the reply photos into the dossier folder and sign shareable links.
  const admin = createSupabaseAdminClient();
  const folder = (row.dropbox_folder as string | null) || `replies/${row.id}`;
  const links: string[] = [];
  const stamp = Date.now().toString(36);
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    let n = 0;
    for (const p of photoPaths) {
      n += 1;
      const ext = p.split('.').pop() || 'jpg';
      const dest = `${folder}/reply-${stamp}-${n}.${ext}`;
      const { error: moveErr } = await admin.storage.from(BUCKET).move(p, dest);
      const finalPath = moveErr ? p : dest;
      const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(finalPath, SIGNED_URL_TTL);
      if (signed?.signedUrl) links.push(signed.signedUrl);
    }
  }

  // Relay to Asana as a comment so the reviewer is notified.
  if (row.asana_task_gid) {
    const lines = [
      `Customer reply — ${ref}${row.email ? ` (${row.email})` : ''}`,
      comment || '(no comment)',
      ...links.map((l, i) => `Photo ${i + 1}: ${l}`),
    ];
    await addConsoleValidationTaskComment(String(row.asana_task_gid), lines.join('\n'));
  }
  await addDealNote(
    dealId,
    `Customer added details via the account — ${ref}.${comment ? ` "${comment.slice(0, 200)}"` : ''} Photos: ${links.length}`
  );

  // Reopen the review and record the latest customer note.
  await admin
    .from('console_validations')
    .update({ status: 'in_review', customer_reply: comment || null, customer_reply_at: new Date().toISOString() })
    .eq('id', row.id);

  return NextResponse.json({ ok: true });
}
