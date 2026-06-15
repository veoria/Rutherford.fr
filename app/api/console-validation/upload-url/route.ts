import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const BUCKET = 'console-validations';
const FIELDS = new Set(['consolePhoto', 'pressPhoto', 'insideConsolePhoto', 'keysPhoto', 'platePhoto']);

const clean = (value: string, max: number) => value.replace(/[^a-z0-9-]/gi, '').slice(0, max);

// Mint a one-shot signed URL so the browser can upload a full-resolution photo
// straight to Supabase Storage — bypassing Vercel's 4.5 MB function body limit
// and keeping the original quality. The path is constrained to a tmp/ area.
export async function POST(request: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const field = String(body.field ?? '');
  // The 5 intake photo fields, a reply photo (reply1..reply9), or a support
  // ticket photo (support1..support9).
  if (!FIELDS.has(field) && !/^reply[1-9]$/.test(field) && !/^support[1-9]$/.test(field)) {
    return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
  }

  const uploadId = clean(String(body.uploadId ?? ''), 60);
  if (!uploadId) return NextResponse.json({ error: 'Invalid uploadId' }, { status: 400 });

  const ext = (clean(String(body.ext ?? 'jpg'), 5) || 'jpg').toLowerCase();

  const supabase = createSupabaseAdminClient();
  // Lazy bucket creation with an image-only, size-capped policy so the public
  // signed-upload endpoint can't be used to stash arbitrary large files.
  await supabase.storage
    .createBucket(BUCKET, {
      public: false,
      fileSizeLimit: '25MB',
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
    })
    .catch(() => {});

  const path = `tmp/${uploadId}/${field}.${ext}`;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    console.error('console-validation upload-url failed:', error?.message);
    return NextResponse.json({ error: 'Could not create upload URL' }, { status: 500 });
  }

  return NextResponse.json({ path, token: data.token });
}
