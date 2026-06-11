import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { syncConsoleValidationToPipedrive } from '@/lib/pipedrive';
import { dropboxEnabled, uploadConsoleValidation } from '@/lib/dropbox';
import { createConsoleValidationTask } from '@/lib/asana';

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

  const folder = `${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}-${slug(companyName)}`;
  const record = {
    email,
    companyName,
    country,
    machineName,
    notes,
    photos: photos.map((p) => p.field),
    source: 'rutherford.fr/console-validation',
    submittedAt: new Date().toISOString(),
    userAgent: request.headers.get('user-agent') ?? null,
  };

  // Photos land in Dropbox when it is configured, otherwise in Supabase
  // Storage. Either way we end up with clickable links to drop into Asana / the
  // CRM, plus a human-readable reference to the folder.
  let photoLinks: Record<string, string> = {};
  let folderLink: string | null = null;
  let storageRef = folder;
  let photoCount = 0;
  let stored = false;

  if (dropboxEnabled()) {
    try {
      const result = await uploadConsoleValidation(folder, photos, JSON.stringify(record, null, 2));
      photoLinks = result.links;
      folderLink = result.folderLink;
      storageRef = result.folderPath;
      photoCount = result.count;
      stored = true;
    } catch (error) {
      console.error('console-validation Dropbox upload failed, falling back to Supabase:', error);
    }
  }

  if (!stored) {
    const supabase = createSupabaseAdminClient();

    // The bucket is created lazily so the route works on a fresh Supabase
    // project without manual setup; createBucket fails silently if it exists.
    await supabase.storage.createBucket(BUCKET, { public: false }).catch(() => {});

    const uploaded: string[] = [];
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
      uploaded.push(path);
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
      if (signed?.signedUrl) photoLinks[field] = signed.signedUrl;
    }
    photoCount = uploaded.length;
    record.photos = uploaded;

    const { error: jsonError } = await supabase.storage
      .from(BUCKET)
      .upload(`${folder}/request.json`, JSON.stringify(record, null, 2), {
        contentType: 'application/json',
        upsert: true,
      });
    if (jsonError) {
      console.error('console-validation request.json upload failed:', jsonError.message);
      return NextResponse.json({ error: 'Could not store the request, please retry' }, { status: 500 });
    }
  }

  // Asana task in the "Console Validation V2" board — dormant without a token.
  await createConsoleValidationTask({
    email,
    company: companyName,
    country,
    machine: machineName,
    notes,
    photoLinks,
    folderLink,
  });

  // CRM sync is best-effort and dormant without PIPEDRIVE_API_TOKEN.
  await syncConsoleValidationToPipedrive({
    email,
    company: companyName,
    country,
    machine: machineName,
    notes,
    photoCount,
    storagePath: storageRef,
    photosLink: folderLink,
  });

  return NextResponse.json({ ok: true });
}
