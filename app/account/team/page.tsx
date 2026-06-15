import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';
import { isOnboarded } from '@/lib/profile';
import { getDistributorResellers, getResellerClients, getTeamForUser } from '@/lib/organizations';
import { AccountTeam } from '@/components/account-team';
import type { ResellerClient } from '@/components/account-hub';
import type { AccountType } from '@/data/account-types';

export const metadata: Metadata = {
  title: 'Your team | Rutherford',
};

export const dynamic = 'force-dynamic';

const OPEN_CV = ['submitted', 'in_review', 'changes_requested'];
const HAS_ADMIN = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);

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
    .select('full_name, country, company, job_title, onboarded_at, account_type')
    .eq('id', user.id)
    .maybeSingle();
  if (!isOnboarded(profile)) {
    redirect('/account/onboarding?next=/account/team');
  }

  const accountType = ((profile?.account_type as AccountType) ?? 'client') as AccountType;

  // Reseller → clients (from console_validations.reseller_id), merged with the
  // org-linked clients. Mirrors the hub.
  let resellerClients: ResellerClient[] = [];
  if ((accountType === 'reseller' || accountType === 'distributor') && HAS_ADMIN) {
    try {
      const { data } = await createSupabaseAdminClient()
        .from('console_validations')
        .select('company, country, machine, status, email, created_at')
        .eq('reseller_id', user.id)
        .order('created_at', { ascending: false });
      const byClient = new Map<string, ResellerClient>();
      for (const r of (data ?? []) as {
        company: string | null;
        country: string | null;
        status: string;
        email: string;
      }[]) {
        const key = (r.company || r.email || 'client').toLowerCase();
        const cur =
          byClient.get(key) ??
          ({ name: r.company || r.email, country: r.country, presses: 0, eligible: 0, open: 0 } as ResellerClient);
        cur.presses += 1;
        if (r.status === 'can_be_connected') cur.eligible += 1;
        if (OPEN_CV.includes(r.status)) cur.open += 1;
        byClient.set(key, cur);
      }
      resellerClients = [...byClient.values()];
    } catch {
      resellerClients = [];
    }
  }
  if (accountType === 'reseller' || accountType === 'distributor') {
    const linked = await getResellerClients(user.id);
    const byName = new Map(resellerClients.map((c) => [c.name.toLowerCase(), c] as const));
    for (const l of linked) {
      const key = l.name.toLowerCase();
      if (!byName.has(key)) byName.set(key, { name: l.name, country: l.country, presses: 0, eligible: 0, open: 0 });
    }
    resellerClients = [...byName.values()];
  }

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
