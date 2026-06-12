import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';
import { addDealNote, createConsoleValidationDeal } from '@/lib/pipedrive';
import { createConsoleValidationTask } from '@/lib/asana';
import { sendMail } from '@/lib/msgraph';
import { acknowledgementEmail } from '@/lib/console-validation-emails';
import { insertConsoleValidation } from '@/lib/console-validations';

export const dynamic = 'force-dynamic';

const BUCKET = 'console-validations';
const SIGNED_URL_TTL = 60 * 60 * 24 * 365; // 1 year, so the Asana/CRM links keep working
const PHOTO_FIELDS = new Set(['consolePhoto', 'pressPhoto', 'insideConsolePhoto', 'keysPhoto', 'platePhoto']);

const slug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'request';

// Photos are uploaded straight to Storage by the browser (see ../upload-url);
// here we only receive their references, so the body stays tiny.
type PhotoRef = { field: string; path: string };

const validPhoto = (p: any): p is PhotoRef =>
  p &&
  typeof p.field === 'string' &&
  PHOTO_FIELDS.has(p.field) &&
  typeof p.path === 'string' &&
  /^tmp\/[a-z0-9-]+\/[a-z]+\.[a-z0-9]+$/i.test(p.path);

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const email = String(body.email ?? '').trim();
  const companyName = String(body.companyName ?? '').trim();
  const country = String(body.country ?? '').trim();
  const machineName = String(body.machineName ?? '').trim();
  const notes = String(body.notes ?? '').trim();
  const refCode = String(body.ref ?? '').trim().slice(0, 100) || null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
  }
  if (!companyName || companyName.length > 200) {
    return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
  }
  if (!country || country.length > 100 || !machineName || machineName.length > 200 || notes.length > 5000) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  const photos: PhotoRef[] = Array.isArray(body.photos) ? body.photos.filter(validPhoto).slice(0, 5) : [];

  // Link the request to the visitor's account when they happen to be signed in.
  let userId: string | null = null;
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { data } = await createSupabaseServerClient().auth.getUser();
      userId = data.user?.id ?? null;
    }
  } catch {
    // Anonymous submission — fine.
  }

  // 1) Pipedrive Deal first: its id stamps the title that everything else reuses.
  const deal = await createConsoleValidationDeal({ company: companyName, country, machine: machineName });
  const baseTitle = [country, companyName, machineName].map((s) => s.trim()).filter(Boolean).join(' - ');
  const title = deal?.title ?? baseTitle;
  const dealId = deal?.id ?? null;

  const submittedAt = new Date().toISOString();
  const infosTxt = [
    'Console validation request',
    `Date     : ${submittedAt}`,
    `Company  : ${companyName}`,
    `Country  : ${country}`,
    `Machine  : ${machineName}`,
    `Email    : ${email}`,
    `Pipedrive: ${dealId ? `ID${dealId}` : 'n/a'}`,
    refCode ? `Referral : ${refCode}` : null,
    notes ? `Notes    : ${notes}` : null,
    '',
    `Photos   : ${photos.map((p) => p.field).join(', ') || 'none'}`,
  ]
    .filter(Boolean)
    .join('\n');

  // 2) Tidy the uploaded photos into a deal-named folder and build share links.
  const photoLinks: Record<string, string> = {};
  let photoCount = 0;
  let storageRef = `${submittedAt.slice(0, 10)}-${dealId ?? Date.now().toString(36)}-${slug(companyName)}`;

  if (process.env.SUPABASE_SERVICE_ROLE_KEY && photos.length) {
    const supabase = createSupabaseAdminClient();
    for (const { field, path } of photos) {
      const ext = path.split('.').pop() || 'jpg';
      const dest = `${storageRef}/${field}.${ext}`;
      const { error: moveError } = await supabase.storage.from(BUCKET).move(path, dest);
      const finalPath = moveError ? path : dest;
      photoCount += 1;
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(finalPath, SIGNED_URL_TTL);
      if (signed?.signedUrl) photoLinks[field] = signed.signedUrl;
    }
    await supabase.storage
      .from(BUCKET)
      .upload(`${storageRef}/infos.txt`, new TextEncoder().encode(infosTxt), {
        contentType: 'text/plain; charset=utf-8',
        upsert: true,
      })
      .catch(() => {});
  }

  // 3) Asana task (To do list), 4) acknowledgement email, 5) deal note + row.
  const asanaTaskGid = await createConsoleValidationTask({ title, email, notes, photoLinks, folderLink: null });

  const ack = acknowledgementEmail({ company: companyName, country, machine: machineName, dealId });
  await sendMail({ to: email, subject: ack.subject, html: ack.html });

  await addDealNote(
    dealId,
    [
      'Console validation request received via rutherford.fr/console-validation.',
      `Photos: ${photoCount}`,
      `Storage: ${storageRef}`,
    ].join('<br>')
  );

  await insertConsoleValidation({
    userId,
    refCode,
    email,
    company: companyName,
    country,
    machine: machineName,
    notes,
    pipedriveDealId: dealId,
    dropboxFolder: storageRef,
    dropboxLink: null,
    asanaTaskGid,
    photos: photoLinks,
  });

  return NextResponse.json({ ok: true });
}
