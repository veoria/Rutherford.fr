'use client';

import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { AccountSubnav } from '@/components/account-subnav';
import { ManagePanel, type ResellerClient } from '@/components/account-hub';
import type { AccountType } from '@/data/account-types';
import type { ResellerClientOrg, Team } from '@/lib/organizations';

// Dedicated "My team" page — the same management panel as the hub, full width,
// with the shared account sub-nav.
export function AccountTeam(props: {
  accountType: AccountType;
  team: Team;
  selfId: string;
  networkResellers: ResellerClientOrg[];
  clients: ResellerClient[];
}) {
  return (
    <main className="page-shell">
      <SiteNav current="account" />
      <AccountSubnav current="team" />
      <section className="section">
        <div className="container ah-team-page">
          <ManagePanel {...props} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
