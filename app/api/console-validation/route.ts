import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';
import { addDealNote, createConsoleValidationDeal } from '@/lib/pipedrive';
import { dropboxEnabled, uploadConsoleValidation } from '@/lib/dropbox';
import { createConsoleValidationTask } from '@/lib/asana';
import { sendMail } from '@/lib/msgraph';
import { acknowledgementEmail } from '@/lib/console-validation-emails';
import { insertConsoleValidation } from '@/lib/console-validations';

export const dynamic = 'force-dynamic';

const BUCKET = 'console-validations';
const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB per photo
const SIGNED_URL_TTL = 60 * 60 * 24 * 365; // 1 year, so the Asana/CRM links keep working
const PHOTO_FIELDS = ['consolePhoto', 'pressPhoto', 'insideConsolePhoto', 'keysPhoto', 'platePhoto'] as const;

const slug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'request';

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const email = String(form.get('email') ?? '').trim();
  const companyName = String(form.get('companyName') ?? '').trim();
  const country = String(form.get('country') ?? '').trim();
  const machineName = String(form.get('machineName') ?? '').trim();
  const notes = String(form.get('notes') ?? '').trim();
  const refCode = String(form.get('ref') ?? '').trim().slice(0, 100) || null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
  }
  if (!companyName || companyName.length > 200) {
    return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
  }
  if (!country || country.length > 100 || !machineName || machineName.length > 200 || notes.length > 5000) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  const photos: { field: string; file: File }[] = [];
  for (const field of PHOTO_FIELDS) {
    const value = form.get(field);
    if (value instanceof File && value.size > 0) {
      if (value.size > MAX_PHOTO_BYTES) {
        return NextResponse.json({ error: `Photo "${field}" exceeds 10 MB` }, { status: 400 });
      }
      if (!value.type.startsWith('image/')) {
        return NextResponse.json({ error: `"${field}" must be an image` }, { status: 400 });
      }
      photos.push({ field, file: value });
    }
  }

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

  // 2) Photos → Dropbox (folder named after the deal) or Supabase Storage.
  let photoLinks: Record<string, string> = {};
  let folderLink: string | null = null;
  let storageRef = title;
  let photoCount = 0;
  let stored = false;

  if (dropboxEnabled()) {
    try {
      const result = await uploadConsoleValidation(title, photos, infosTxt);
      photoLinks = result.links;
      folderLink = result.folderLink;
      storageRef = result.folderPath;
      photoCount = result.count;
      stored = true;
    } catch (error) {
      console.error('console-validation Dropbox upload failed, falling back to Supabase:', error);
    }
  }

  if (!stored && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createSupabaseAdminClient();
    await supabase.storage.createBucket(BUCKET, { public: false }).catch(() => {});
    const folder = `${submittedAt.slice(0, 10)}-${Date.now().toString(36)}-${slug(companyName)}`;
    for (const { field, file } of photos) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const path = `${folder}/${field}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: true });
      if (error) {
        console.error('console-validation photo upload failed:', field, error.message);
        continue;
      }
      photoCount += 1;
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
      if (signed?.signedUrl) photoLinks[field] = signed.signedUrl;
    }
    await supabase.storage
      .from(BUCKET)
      .upload(`${folder}/infos.txt`, new TextEncoder().encode(infosTxt), {
        contentType: 'text/plain; charset=utf-8',
        upsert: true,
      })
      .catch(() => {});
    storageRef = folder;
  }

  // 3) Asana task (To do list), 4) acknowledgement email, 5) deal note + row.
  const asanaTaskGid = await createConsoleValidationTask({ title, email, notes, photoLinks, folderLink });

  const ack = acknowledgementEmail(companyName);
  await sendMail({ to: email, subject: ack.subject, html: ack.html });

  await addDealNote(
    dealId,
    [
      'Console validation request received via rutherford.fr/console-validation.',
      `Photos: ${photoCount}`,
      folderLink ? `Dropbox: <a href="${folderLink}">folder</a>` : `Storage: ${storageRef}`,
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
    dropboxLink: folderLink,
    asanaTaskGid,
    photos: photoLinks,
  });

  return NextResponse.json({ ok: true });
}
