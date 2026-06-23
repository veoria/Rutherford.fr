// SERVER-ONLY: who may open the back-office, and what they may do there.
//
// Access to /admin requires BOTH:
//   1. a team-domain account (rutherford.fr / veoria.fr / studiodelaroche.fr)
//      OR the explicit is_admin flag, and
//   2. a session stepped up to AAL2 (2FA completed this session).
//
// "canManage" (edit / delete / change account type / toggle admin) stays
// restricted to is_admin. Team members without the flag get a read-only view.
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { accountTypeFromDomain } from '@/lib/account-type';

export type AdminAccess =
  | { ok: true; userId: string; canManage: boolean }
  | { ok: false; reason: 'unauthenticated' | 'forbidden' | 'needs_2fa_setup' | 'needs_2fa_challenge' };

export async function getAdminAccess(): Promise<AdminAccess> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'unauthenticated' };

  const isTeam = accountTypeFromDomain(user.email ?? '') === 'team';
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  const isAdmin = Boolean(profile?.is_admin);

  if (!isTeam && !isAdmin) return { ok: false, reason: 'forbidden' };

  // Require 2FA this session.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== 'aal2') {
    return { ok: false, reason: aal?.nextLevel === 'aal2' ? 'needs_2fa_challenge' : 'needs_2fa_setup' };
  }

  return { ok: true, userId: user.id, canManage: isAdmin };
}

/**
 * Stricter gate for write endpoints: must be is_admin AND at AAL2. Returns the
 * caller's id on success. Never trusts anything from the client.
 */
export async function requireAdminWrite(): Promise<
  { ok: true; userId: string } | { ok: false; error: string; status: number }
> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthorized', status: 401 };

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_admin) return { ok: false, error: 'forbidden', status: 403 };

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== 'aal2') return { ok: false, error: 'mfa_required', status: 403 };

  return { ok: true, userId: user.id };
}
