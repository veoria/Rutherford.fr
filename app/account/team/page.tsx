import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isOnboarded } from '@/lib/profile';
import { getDistributorResellers, getTeamForUser } from '@/lib/organizations';
import { getResellerClientsView } from '@/lib/reseller-clients';
import { AccountTeam } from '@/components/account-team';
import type { AccountType } from '@/data/account-types';

export const metadata: Metadata = {
  title: 'Your team | Rutherford',
};

export const dynamic = 'force-dynamic';


export default async function AccountTeamRoute() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/account/sign-in?next=/account/team');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, country, company, job_title, onboarded_at, account_type, is_admin')
    .eq('id', user.id)
    .maybeSingle();
  if (!isOnboarded(profile)) {
    redirect('/account/onboarding?next=/account/team');
  }

  const accountType = ((profile?.account_type as AccountType) ?? 'client') as AccountType;

  // Reseller → clients: shared aggregation (validations + org-linked clients,
  // systems/updates included) — one implementation with the hub.
  const resellerClients = await getResellerClientsView(user.id, accountType);

  const team = await getTeamForUser(user.id);
  const networkResellers = accountType === 'distributor' ? await getDistributorResellers(user.id) : [];

  return (
    <AccountTeam
      accountType={accountType}
      team={team}
      selfId={user.id}
      networkResellers={networkResellers}
      clients={resellerClients}
    />
  );
}
