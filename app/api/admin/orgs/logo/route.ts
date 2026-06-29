import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { requireAdminWrite } from '@/lib/admin-access';

export const dynamic = 'force-dynamic';

const BUCKET = 'account-media';
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const EXT_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  // SVG is intentionally excluded: it can carry inline <script>, and this bucket
  // is public, so an uploaded SVG would be a stored-XSS vector.
};

/** Admin: upload/replace any organization's logo — the source for co-branded
 * console-validation invites. Stored in the public account-media bucket. */
export async function POST(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }
  const file = form.get('file');
  const orgId = form.get('orgId');
  if (!(file instanceof File) || typeof orgId !== 'string' || !orgId) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) return NextResponse.json({ error: 'bad_type' }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'too_large' }, { status: 413 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 });
  }

  const admin = createSupabaseAdminClient();
  const path = `logos/${orgId}.${ext}`;
  const { error } = await admin.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const url = `${admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
  await admin.from('organizations').update({ logo_url: url, updated_at: new Date().toISOString() }).eq('id', orgId);
  return NextResponse.json({ ok: true, url });
}
