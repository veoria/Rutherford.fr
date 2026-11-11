import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// ColorMix (colorloop.ai) keeps its data for a Rutherford account as JSON files
// in the private 'cmx' bucket, one folder per account (supabase/migrations/
// 20261111_colormix_storage.sql). Exported and erased with the account.
const CMX_BUCKET = 'cmx';
const CMX_FILES = ['colors.json', 'maps.json', 'kitchen.json', 'library.json'];

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

/** The account's ColorMix files, parsed, by name; null when it has none. */
async function colormixData(admin: AdminClient, userId: string): Promise<Record<string, unknown> | null> {
  const { data: listed } = await admin.storage.from(CMX_BUCKET).list(userId, { limit: 100 });
  const names = (listed ?? []).map((f) => f.name).filter((n) => n.endsWith('.json'));
  if (!names.length) return null;
  const out: Record<string, unknown> = {};
  await Promise.all(
    names.map(async (name) => {
      const { data: blob } = await admin.storage.from(CMX_BUCKET).download(`${userId}/${name}`);
      if (!blob) return;
      try {
        out[name] = JSON.parse(await blob.text());
      } catch {
        out[name] = null;
      }
    })
  );
  return out;
}

/** GDPR data export — downloads everything we hold about the signed-in user. */
export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Explicit user_id filters everywhere: RLS also grants reseller/admin-wide
  // visibility on console_validations, and "my data" must only export own rows.
  const [profile, cv, progress, quiz, access, membership] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('console_validations').select('*').eq('user_id', user.id),
    supabase.from('course_progress').select('*').eq('user_id', user.id),
    supabase.from('quiz_attempts').select('*').eq('user_id', user.id),
    supabase.from('user_course_access').select('*').eq('user_id', user.id),
    supabase.from('organization_members').select('*').eq('user_id', user.id),
  ]);

  // ColorMix files are private to their owner; the export reads them with the
  // service role (best-effort: the rest of the export never waits on it).
  let colormix: Record<string, unknown> | null = null;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      colormix = await colormixData(createSupabaseAdminClient(), user.id);
    } catch {
      colormix = null;
    }
  }

  const payload = {
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email, created_at: user.created_at },
    profile: profile.data ?? null,
    console_validations: cv.data ?? [],
    course_progress: progress.data ?? [],
    quiz_attempts: quiz.data ?? [],
    course_access: access.data ?? [],
    organization_memberships: membership.data ?? [],
    colormix,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="rutherford-mes-donnees-${new Date().toISOString().slice(0, 10)}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}

/** GDPR erasure — the user deletes their own account.
 * Cascades to academy data; console_validations are kept with user_id set null
 * (request history survives, detached). */
export async function DELETE() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  const adminClient = createSupabaseAdminClient();

  // Erasure includes the public avatar files — they would otherwise stay
  // publicly addressable after the account is gone.
  await adminClient.storage
    .from('account-media')
    .remove(['png', 'jpg', 'webp', 'gif'].map((ext) => `avatars/${user.id}.${ext}`));

  // ColorMix keeps its files under cmx/<user id>/: they go with the account.
  const { data: cmxFiles } = await adminClient.storage.from(CMX_BUCKET).list(user.id, { limit: 100 });
  const cmxPaths = [...new Set([...CMX_FILES, ...(cmxFiles ?? []).map((f) => f.name)])].map((n) => `${user.id}/${n}`);
  await adminClient.storage.from(CMX_BUCKET).remove(cmxPaths);

  const { error } = await adminClient.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.auth.signOut().catch(() => {});
  return NextResponse.json({ ok: true });
}
