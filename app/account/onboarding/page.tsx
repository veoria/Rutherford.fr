import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { OnboardingForm } from '@/components/onboarding-form';
import { getCurrentUserAndProfile, isOnboarded } from '@/lib/profile';

export const metadata: Metadata = {
  title: 'Complete your profile — Rutherford Academy',
};

export const dynamic = 'force-dynamic';

// Only allow internal redirect targets (no open redirects).
function safeNext(next?: string | string[]): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (value && value.startsWith('/') && !value.startsWith('//')) return value;
  return '/account';
}

export default async function OnboardingRoute({
  searchParams,
}: {
  searchParams: { next?: string | string[] };
}) {
  if (process.env.NEXT_PUBLIC_ACADEMY_ENABLED !== 'true') notFound();

  const next = safeNext(searchParams.next);
  const { user, profile } = await getCurrentUserAndProfile();

  if (!user) {
    redirect(`/account/sign-in?next=${encodeURIComponent('/account/onboarding')}`);
  }
  if (isOnboarded(profile)) {
    redirect(next);
  }

  const metaName =
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === 'string' && user.user_metadata.name) ||
    '';
  const defaultName = profile?.full_name || metaName || '';

  // Pre-fill the company for X-Rite staff (the only domain we co-brand).
  const defaultCompany = (user.email ?? '').toLowerCase().endsWith('@xrite.com') ? 'X-Rite PANTONE' : '';

  return (
    <OnboardingForm next={next} needsName={!defaultName} defaultName={defaultName} defaultCompany={defaultCompany} />
  );
}
