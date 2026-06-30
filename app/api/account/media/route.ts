import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { getManageableOrg } from '@/lib/organizations';

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

/** Upload a profile photo (kind=avatar, own) or company logo (kind=logo,
 * owner/admin of the org). Stored in the public account-media bucket; the
 * profile/org url is updated. */
export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }
  const file = form.get('file');
  const kind = form.get('kind');
  if (!(file instanceof File) || (kind !== 'avatar' && kind !== 'logo')) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) return NextResponse.json({ error: 'bad_type' }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'too_large' }, { status: 413 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 });
  }

  const admin = createSupabaseAdminClient();

  if (kind === 'avatar') {
    const path = `avatars/${user.id}.${ext}`;
    const { error } = await admin.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const url = `${admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
    await admin.from('profiles').update({ avatar_url: url }).eq('id', user.id);
    return NextResponse.json({ ok: true, url });
  }

  // logo — only an owner/admin can set their org's logo.
  const manage = await getManageableOrg(user.id);
  if (!manage) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const path = `logos/${manage.orgId}.${ext}`;
  const { error } = await admin.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const url = `${admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
  await admin.from('organizations').update({ logo_url: url }).eq('id', manage.orgId);
  return NextResponse.json({ ok: true, url });
}
