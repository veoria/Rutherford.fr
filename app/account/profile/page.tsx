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

  // Company-card context, resolved server-side with the admin client so it's
  // reliable — browser-side membership reads could silently fail under RLS:
  // - logo + whether this user may change it (owner/admin of their org);
  // - org name + whether this user may rename it (owner only, brief § 3.2) —
  //   same derivation as getTeamForUser (profiles.organization_id + active
  //   membership row), the org being the source of truth for the company name.
  let logoUrl: string | null = null;
  let canManageLogo = false;
  let orgName: string | null = null;
  let canRenameOrg = false;
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
        const [{ data: org }, { data: membership }] = await Promise.all([
          admin.from('organizations').select('name, logo_url').eq('id', orgId).maybeSingle(),
          admin
            .from('organization_members')
            .select('role')
            .eq('org_id', orgId)
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle(),
        ]);
        logoUrl = (org?.logo_url as string | null) ?? null;
        orgName = ((org?.name as string | null) ?? '').trim() || null;
        canRenameOrg = ((membership?.role as string | null) ?? null) === 'owner';
      }
      canManageLogo = Boolean(await getManageableOrg(user.id));
    } catch {
      /* best-effort — falls back to read-only logo and free-text company */
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
      orgName={orgName}
      canRenameOrg={canRenameOrg}
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
