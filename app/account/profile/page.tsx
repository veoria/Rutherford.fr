import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AccountProfile } from '@/components/account-profile';
import { getCurrentUserAndProfile } from '@/lib/profile';
import { getManageableOrg } from '@/lib/organizations';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { isJobTitleKey, isTeamRoleKey } from '@/data/onboarding-options';

export const metadata: Metadata = {
  title: 'My profile | Rutherford',
};

export const dynamic = 'force-dynamic';

const HAS_ADMIN = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);

export default async function ProfileRoute() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user) {
    redirect('/account/sign-in?next=/account/profile');
  }

  const accountType = profile?.account_type ?? 'client';

  // Company logo + whether this user may change it (owner/admin of their org).
  // Resolved server-side with the admin client so it's reliable — the previous
  // browser-side membership read could silently fail under RLS.
  let logoUrl: string | null = null;
  let canManageLogo = false;
  if (HAS_ADMIN) {
    try {
      const admin = createSupabaseAdminClient();
      const { data: pr } = await admin
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .maybeSingle();
      const orgId = (pr?.organization_id as string | null) ?? null;
      if (orgId) {
        const { data: org } = await admin.from('organizations').select('logo_url').eq('id', orgId).maybeSingle();
        logoUrl = (org?.logo_url as string | null) ?? null;
      }
      canManageLogo = Boolean(await getManageableOrg(user.id));
    } catch {
      /* best-effort — falls back to read-only logo */
    }
  }
  // Keep the stored role only if it belongs to the taxonomy this account edits in
  // (internal team roles for team accounts, printing roles otherwise) — so a
  // legacy value from the other set surfaces as "pick a role" instead of sticking.
  const storedRole = profile?.job_title ?? '';
  const jobTitle =
    accountType === 'team'
      ? isTeamRoleKey(storedRole)
        ? storedRole
        : ''
      : isJobTitleKey(storedRole)
        ? storedRole
        : '';

  return (
    <AccountProfile
      email={user.email ?? ''}
      accountType={accountType}
      avatarUrl={profile?.avatar_url ?? null}
      logoUrl={logoUrl}
      canManageLogo={canManageLogo}
      defaults={{
        fullName: profile?.full_name ?? '',
        country: profile?.country ?? '',
        company: profile?.company ?? '',
        jobTitle,
        notificationEmail: profile?.notification_email ?? '',
      }}
    />
  );
}
