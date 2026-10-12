import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ACCOUNT_ENABLED } from '@/lib/features';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isOnboarded } from '@/lib/profile';
import { getPartnerFleet } from '@/lib/partner-fleet';
import { AccountFleet } from '@/components/account-fleet';

export const metadata: Metadata = {
  title: 'Client fleet | Rutherford',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AccountFleetRoute() {
  if (!ACCOUNT_ENABLED) notFound();
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/account/sign-in?next=/account/parc');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, country, company, job_title, job_roles, onboarded_at, account_type')
    .eq('id', user.id)
    .maybeSingle();
  if (!isOnboarded(profile)) {
    redirect('/account/onboarding?next=/account/parc');
  }
  // Partner space only (per-role visibility matrix).
  const type = profile?.account_type ?? 'client';
  if (type !== 'reseller' && type !== 'distributor') {
    redirect('/account');
  }

  return <AccountFleet fleet={await getPartnerFleet(user.id)} />;
}
