// SERVER-ONLY: shared plumbing of the admin « view as client » pages under
// /admin/users/[id]/preview/* — the admin gate, the safe « Retour admin »
// target, and who is being previewed.

import { notFound, redirect } from 'next/navigation';
import { getAdminAccess } from '@/lib/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import type { AccountType } from '@/data/account-types';

/** Same gate as the account detail page; redirects or 404s when not allowed. */
export async function requirePreviewAccess(next: string): Promise<void> {
  const access = await getAdminAccess();
  if (access.ok) return;
  if (access.reason === 'unauthenticated') redirect(`/account/sign-in?next=${encodeURIComponent(next)}`);
  if (access.reason === 'needs_2fa_challenge') redirect(`/account/verify-2fa?next=${encodeURIComponent(next)}`);
  if (access.reason === 'needs_2fa_setup') redirect(`/account/security?next=${encodeURIComponent(next)}`);
  notFound(); // forbidden — don't reveal the route exists
}

/** « Retour admin » target: internal /admin paths only, never off-site. */
export function safePreviewBack(back: string | undefined): string | undefined {
  return back && /^\/admin(?![/\\][/\\])[\w/-]*$/.test(back) ? back : undefined;
}

export type PreviewTarget = {
  userId: string;
  fullName: string | null;
  accountType: AccountType;
  orgId: string | null;
};

/** The previewed user's identity, account type and organization. */
export async function getPreviewTarget(userId: string): Promise<PreviewTarget | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('profiles')
    .select('full_name, account_type, organization_id')
    .eq('id', userId)
    .maybeSingle();
  if (!data) return null;
  const p = data as { full_name: string | null; account_type: string | null; organization_id: string | null };
  return {
    userId,
    fullName: p.full_name,
    accountType: ((p.account_type as AccountType) ?? 'client') as AccountType,
    orgId: p.organization_id,
  };
}
