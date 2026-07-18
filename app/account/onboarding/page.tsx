import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { OnboardingForm } from '@/components/onboarding-form';
import { TeamOnboardingForm } from '@/components/team-onboarding-form';
import { getCurrentUserAndProfile, isOnboarded } from '@/lib/profile';
import { deriveAccountTypeWithSource } from '@/lib/account-classification';

export const metadata: Metadata = {
  title: 'Complete your profile — Rutherford Academy',
};

export const dynamic = 'force-dynamic';

// Only allow internal redirect targets (no open redirects).
function safeNext(next?: string | string[]): string {
  const value = Array.isArray(next) ? next[0] : next;
  // Reject protocol-relative ("//", "/\") and absolute URLs, not just "//".
  if (value && /^\/(?![/\\])/.test(value)) return value;
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

  // Classification with provenance (brief § 2.3.a): decides which role
  // referential the form shows. 'unqualified' (no domain, no CRM signal) asks
  // the explicit « Vous êtes : » question instead of guessing 'client'.
  const derived = await deriveAccountTypeWithSource(user.email ?? '');

  // Internal team (rutherford.fr / veoria.fr / studiodelaroche.fr): a dedicated
  // step — company + country come from the domain, so we only ask name + role.
  if (derived.type === 'team') {
    return <TeamOnboardingForm next={next} needsName={!defaultName} defaultName={defaultName} />;
  }

  // Pre-fill the company for X-Rite staff (the only domain we co-brand).
  const defaultCompany = (user.email ?? '').toLowerCase().endsWith('@xrite.com') ? 'X-Rite PANTONE' : '';

  return (
    <OnboardingForm
      next={next}
      needsName={!defaultName}
      defaultName={defaultName}
      defaultCompany={defaultCompany}
      accountType={derived.type}
      unqualified={derived.source === 'unqualified'}
    />
  );
}
