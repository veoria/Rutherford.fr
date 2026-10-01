import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AccountHub, type ResellerClient } from '@/components/account-hub';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isOnboarded } from '@/lib/profile';
import { getDistributorResellers, getTeamForUser } from '@/lib/organizations';
import { getResellerClientsView, OPEN_CV } from '@/lib/reseller-clients';
import { getSystemsForUser, toAccountInstallation } from '@/lib/client-systems';
import { getVisibleSitesForUser, toAccountSite } from '@/lib/sites';
import { getPressesForOrg } from '@/lib/presses';
import type { AccountType } from '@/data/account-types';
import type { ClientSystem } from '@/components/account-systems';

export const metadata: Metadata = {
  title: 'Your partner account | Rutherford',
  description: 'Your presses, validations and clients, in one login.',
  openGraph: {
    title: 'Your partner account | Rutherford',
    description: 'Your presses, validations and clients, in one login.',
    url: 'https://rutherford.fr/account',
    siteName: 'Rutherford.fr',
    images: [{ url: '/images/og-account.png', width: 1200, height: 630, alt: 'Your presses, validations and clients. One login.' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your partner account | Rutherford',
    description: 'Your presses, validations and clients, in one login.',
    images: ['/images/og-account.png'],
  },
};

export const dynamic = 'force-dynamic';


export default async function AccountHubRoute() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/account/sign-in?next=/account');
  }

  const [{ data: profile }, { data: ownCv }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, avatar_url, country, company, job_title, job_roles, onboarded_at, account_type, is_admin')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('console_validations')
        .select('machine, country, company, status, created_at, pipedrive_deal_id')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
    ]);

  // Lead-capture gate: complete the profile before the account hub.
  if (!isOnboarded(profile)) {
    redirect('/account/onboarding?next=/account');
  }

  const accountType = ((profile?.account_type as AccountType) ?? 'client') as AccountType;

  // Own console validations — the Console Validation tile stat + "My presses".
  const ownRows = (ownCv ?? []) as {
    machine: string | null;
    country: string | null;
    company: string | null;
    status: string;
    created_at: string;
    pipedrive_deal_id: number | null;
  }[];
  const ownStatuses = ownRows.map((r) => r.status);
  const cvEligible = ownStatuses.filter((s) => s === 'can_be_connected').length;
  const cvOpen = ownStatuses.filter((s) => OPEN_CV.includes(s)).length;

  // One system per distinct machine, keeping the latest status (rows are ordered
  // newest-first) and counting how many validations that press has had.
  const sysByMachine = new Map<string, ClientSystem>();
  for (const r of ownRows) {
    const machine = (r.machine ?? '').trim();
    if (!machine) continue;
    const key = machine.toLowerCase();
    const existing = sysByMachine.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      sysByMachine.set(key, {
        machine,
        company: r.company,
        country: r.country,
        status: r.status,
        dealId: r.pipedrive_deal_id,
        count: 1,
      });
    }
  }
  const systems = [...sysByMachine.values()];

  // The next four reads are mutually independent — start them together and await
  // as a group instead of in series. Each block keeps its original logic and
  // error handling; only the sequencing changes.

  // Support tile: an open ticket's status + a "new message" badge when the latest
  // message on an open ticket came from our team.
  const supportSummaryP = (async (): Promise<{ status: string | null; newMessage: boolean }> => {
    try {
      const { data: stRows } = await supabase
        .from('support_tickets')
        .select('id, status, updated_at')
        .order('updated_at', { ascending: false });
      const openTickets = ((stRows ?? []) as { id: string; status: string }[]).filter((r) =>
        ['new', 'in_progress', 'waiting_customer'].includes(r.status)
      );
      if (!openTickets.length) return { status: null, newMessage: false };
      const status = openTickets.find((r) => r.status === 'waiting_customer')?.status ?? openTickets[0].status;
      const { data: msgRows } = await supabase
        .from('support_messages')
        .select('ticket_id, author, created_at')
        .in(
          'ticket_id',
          openTickets.map((r) => r.id)
        )
        .order('created_at', { ascending: false });
      const seen = new Set<string>();
      let newMessage = false;
      for (const msg of (msgRows ?? []) as { ticket_id: string; author: string }[]) {
        if (seen.has(msg.ticket_id)) continue;
        seen.add(msg.ticket_id);
        if (msg.author === 'team') newMessage = true;
      }
      return { status, newMessage };
    } catch {
      // support tables optional — leave defaults
      return { status: null, newMessage: false };
    }
  })();

  // Reseller → clients: shared aggregation (validations + org-linked clients).
  const resellerClientsP = getResellerClientsView(user.id, accountType);

  const teamP = getTeamForUser(user.id);
  const networkResellersP =
    accountType === 'distributor' ? getDistributorResellers(user.id) : Promise.resolve([]);
  // "Mon système" — the installed base (license, AnyDesk, updates) the
  // Rutherford team maintains on the user's organization. The section is
  // client-only (per-role visibility matrix), so skip the read otherwise.
  const installationsP =
    accountType === 'client'
      ? getSystemsForUser(user.id).then((rows) => rows.map(toAccountInstallation))
      : Promise.resolve([]);

  const [{ status: supportStatus, newMessage: supportNewMessage }, resellerClients, team, networkResellers, installations] =
    await Promise.all([supportSummaryP, resellerClientsP, teamP, networkResellersP, installationsP]);

  // Plants (usines) the user may see — owners/admins see all their org's sites,
  // other members are narrowed by any site_members restriction. Sites feed the
  // client-only "Mon système" section, so skip the read for other types.
  const orgId = team.org?.id ?? null;
  const canManageOrg = team.myRole === 'owner' || team.myRole === 'admin';
  const [sites, pressRecords] =
    accountType === 'client' && orgId
      ? await Promise.all([
          getVisibleSitesForUser(user.id, orgId, canManageOrg).then((rows) => rows.map(toAccountSite)),
          getPressesForOrg(orgId),
        ])
      : [[], []];
  // "Mon atelier" preview — same visibility rule as /account/atelier: presses
  // on the plants this user may see, plus the unassigned ones.
  const visibleSiteIds = new Set(sites.map((s) => s.id));
  const presses = pressRecords
    .filter((p) => !p.siteId || visibleSiteIds.has(p.siteId))
    .map(({ createdAt: _createdAt, ...p }) => p);

  return (
    <AccountHub
      accountType={accountType}
      team={team}
      selfId={user.id}
      networkResellers={networkResellers}
      email={user.email ?? ''}
      memberSince={(user.created_at as string) ?? null}
      profile={{
        fullName: profile?.full_name ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        country: profile?.country ?? null,
        company: profile?.company ?? null,
        jobTitle: (profile?.job_title as string | null) ?? null,
      }}
      consoleStat={{ eligible: cvEligible, open: cvOpen }}
      supportStat={{ status: supportStatus, newMessage: supportNewMessage }}
      resellerClients={resellerClients}
      systems={systems}
      installations={installations}
      sites={sites}
      presses={presses}
    />
  );
}
