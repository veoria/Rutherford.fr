import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AccountProfile } from '@/components/account-profile';
import { getCurrentUserAndProfile } from '@/lib/profile';
import { isJobTitleKey, isTeamRoleKey } from '@/data/onboarding-options';

export const metadata: Metadata = {
  title: 'My profile | Rutherford',
};

export const dynamic = 'force-dynamic';

export default async function ProfileRoute() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user) {
    redirect('/account/sign-in?next=/account/profile');
  }

  const accountType = profile?.account_type ?? 'client';
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
