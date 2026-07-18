import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { accountTypeFromDomain } from '@/lib/account-type';
import { acceptPendingInvitations, ensureSharedXriteOrg } from '@/lib/organizations';

export const dynamic = 'force-dynamic';

/**
 * Post-sign-in housekeeping for flows that never pass through the OAuth /
 * magic-link callback (password sign-in, MFA verify): stamp the domain-derived
 * classification, accept pending invitations, place X-Rite staff in the shared
 * org. Mirrors the best-effort block in /api/auth/callback. Idempotent.
 */
export async function POST() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const byDomain = user.email ? accountTypeFromDomain(user.email) : null;
    if (byDomain && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      await createSupabaseAdminClient()
        .from('profiles')
        .update({ account_type: byDomain, account_type_source: 'domain' })
        .eq('id', user.id);
    }
    if (user.email) await acceptPendingInvitations(user.id, user.email);
    if (user.email) await ensureSharedXriteOrg(user.id, user.email);
  } catch {
    // Best-effort — never block the sign-in flow.
  }

  return NextResponse.json({ ok: true });
}
