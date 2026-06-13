import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupportTask } from '@/lib/asana';
import { sendMail } from '@/lib/msgraph';
import { supportAckEmail } from '@/lib/support-emails';
import { insertSupportTicket } from '@/lib/support-tickets';
import { getNotificationEmail } from '@/lib/console-validations';

export const dynamic = 'force-dynamic';

const BUCKET = 'console-validations';
const SIGNED_URL_TTL = 60 * 60 * 24 * 365;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validPhoto = (p: any): p is { field: string; path: string } =>
  p && typeof p.path === 'string' && /^tmp\/[a-z0-9-]+\/support[1-9]\.[a-z0-9]+$/i.test(p.path);

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const email = String(body.email ?? '').trim();
  const name = String(body.name ?? '').trim().slice(0, 200) || null;
  const anydesk = String(body.anydesk ?? '').trim().slice(0, 60) || null;
  const description = String(body.description ?? '').trim();

  if (!email || !EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
  }
  if (!description || description.length > 5000) {
    return NextResponse.json({ error: 'Please describe the problem' }, { status: 400 });
  }

  const photos = Array.isArray(body.photos) ? body.photos.filter(validPhoto).slice(0, 9) : [];

  // Link the ticket to the visitor's account when they're signed in.
  let userId: string | null = null;
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { data } = await createSupabaseServerClient().auth.getUser();
      userId = data.user?.id ?? null;
    }
  } catch {
    // anonymous — fine
  }

  // Move the uploaded photos into a ticket folder and sign shareable links.
  const photoLinks: Record<string, string> = {};
  const links: string[] = [];
  const storageRef = `support/${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}`;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && photos.length) {
    const supabase = createSupabaseAdminClient();
    for (const { field, path } of photos as { field: string; path: string }[]) {
      const ext = path.split('.').pop() || 'jpg';
      const dest = `${storageRef}/${field}.${ext}`;
      const { error: moveErr } = await supabase.storage.from(BUCKET).move(path, dest);
      const finalPath = moveErr ? path : dest;
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(finalPath, SIGNED_URL_TTL);
      if (signed?.signedUrl) {
        photoLinks[field] = signed.signedUrl;
        links.push(signed.signedUrl);
      }
    }
  }

  const asanaTaskGid = await createSupportTask({ email, anydesk: anydesk ?? '', description, photoLinks: links });

  const id = await insertSupportTicket({ userId, email, name, anydesk, description, asanaTaskGid, photos: photoLinks });

  const ref = id ? id.slice(0, 8) : null;
  const ack = supportAckEmail(ref ? `#${ref}` : null);
  await sendMail({ to: await getNotificationEmail(userId, email), subject: ack.subject, html: ack.html });

  return NextResponse.json({ ok: true, reference: ref });
}
