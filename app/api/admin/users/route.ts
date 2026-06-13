import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { isAccountType } from '@/data/account-types';
import { isJobTitleKey, isKnownCountry } from '@/data/onboarding-options';

export const dynamic = 'force-dynamic';

// Verify the caller is a signed-in admin. RLS lets a user self-read is_admin.
async function requireAdmin() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, error: 'unauthorized', status: 401 } as const;
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!data?.is_admin) return { user: null, error: 'forbidden', status: 403 } as const;
  return { user, error: null, status: 200 } as const;
}

/** Update a user's profile fields, account type, or admin flag. */
export async function PATCH(request: NextRequest) {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }

  const id = typeof body.id === 'string' ? body.id : '';
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });

  const patch: Record<string, unknown> = {};

  if (typeof body.full_name === 'string') patch.full_name = body.full_name.trim().slice(0, 200) || null;
  if (typeof body.company === 'string') patch.company = body.company.trim().slice(0, 200) || null;

  if (typeof body.country === 'string') {
    const c = body.country.trim();
    if (c && !isKnownCountry(c)) return NextResponse.json({ error: 'bad_country' }, { status: 400 });
    patch.country = c || null;
  }
  if (typeof body.job_title === 'string') {
    const j = body.job_title.trim();
    if (j && !isJobTitleKey(j)) return NextResponse.json({ error: 'bad_job_title' }, { status: 400 });
    patch.job_title = j || null;
  }
  if (typeof body.account_type === 'string') {
    if (!isAccountType(body.account_type)) return NextResponse.json({ error: 'bad_account_type' }, { status: 400 });
    patch.account_type = body.account_type;
  }
  if (typeof body.is_admin === 'boolean') {
    // Lockout guard: an admin can't strip their own admin rights.
    if (body.is_admin === false && id === gate.user.id) {
      return NextResponse.json({ error: 'cannot_self_demote' }, { status: 400 });
    }
    patch.is_admin = body.is_admin;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });
  }
  patch.updated_at = new Date().toISOString();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('profiles').update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Delete a user. Cascades to academy data; console_validations are kept
 * (user_id is set null), so request history survives. */
export async function DELETE(request: NextRequest) {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });
  if (id === gate.user.id) return NextResponse.json({ error: 'cannot_delete_self' }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
