import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';
import { addSupportTaskComment } from '@/lib/asana';
import { insertSupportMessage } from '@/lib/support-tickets';

// Customer reply to a support ticket (the in-account "add details" form).
// Verifies ownership via RLS, relays the comment + photos to the Asana task, and
// records the reply. Status is left to the Asana column (synced by the webhook),
// so we don't fight it here.
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

  // RLS scopes this select to the visitor's own tickets — ownership check.
  const { data: row } = await rls
    .from('support_tickets')
    .select('id, asana_task_gid, email, photos, status')
    .eq('id', params.id)
    .maybeSingle();
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (row.status === 'closed') {
    return NextResponse.json({ error: 'This ticket is closed — please open a new request.' }, { status: 409 });
  }

  const ref = `#${String(row.id).slice(0, 8)}`;

  // Move the reply photos into the ticket folder and sign shareable links.
  const admin = createSupabaseAdminClient();
  const folder = `support/${row.id}/replies`;
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

  // Relay to Asana as a comment so the assignee/followers are notified.
  if (row.asana_task_gid) {
    const lines = [
      `Customer reply — ${ref}${row.email ? ` (${row.email})` : ''}`,
      comment || '(no comment)',
      ...links.map((l, i) => `Photo ${i + 1}: ${l}`),
    ];
    await addSupportTaskComment(String(row.asana_task_gid), lines.join('\n'));
  }

  // Persist the reply and surface the new photos in the account (merge into the
  // ticket's photo map). Status stays driven by the Asana column.
  const existing = (row.photos && typeof row.photos === 'object' ? row.photos : {}) as Record<string, string>;
  const merged = { ...existing };
  links.forEach((l, i) => {
    merged[`reply-${stamp}-${i + 1}`] = l;
  });

  await admin
    .from('support_tickets')
    .update({
      customer_reply: comment || null,
      customer_reply_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      photos: merged,
    })
    .eq('id', row.id);

  // Keep the message in the conversation thread shown in the account.
  await insertSupportMessage({ ticketId: String(row.id), author: 'customer', body: comment || null, photos: links });

  return NextResponse.json({ ok: true });
}
