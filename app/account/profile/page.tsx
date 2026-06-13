import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AccountProfile } from '@/components/account-profile';
import { getCurrentUserAndProfile } from '@/lib/profile';
import { isJobTitleKey } from '@/data/onboarding-options';

export const metadata: Metadata = {
  title: 'My profile | Rutherford',
};

export const dynamic = 'force-dynamic';

export default async function ProfileRoute() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user) {
    redirect('/account/sign-in?next=/account/profile');
  }

  const jobTitle = profile?.job_title && isJobTitleKey(profile.job_title) ? profile.job_title : '';

  return (
    <AccountProfile
      email={user.email ?? ''}
      accountType={profile?.account_type ?? 'client'}
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
