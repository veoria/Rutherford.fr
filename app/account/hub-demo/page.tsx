import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AccountHub, type ResellerClient } from '@/components/account-hub';
import type { AccountType } from '@/data/account-types';
import type { ResellerClientOrg, Team } from '@/lib/organizations';

export const metadata: Metadata = {
  title: 'Account hub (demo) | Rutherford',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// Auth-free preview of the account hub so each role's view (notably the X-Rite
// distributor co-brand) can be reviewed without a session. Sample data only.
// Switch the role with ?type=client|reseller|distributor|team.
const TYPES: AccountType[] = ['client', 'reseller', 'distributor', 'team'];

export default function AccountHubDemoRoute({ searchParams }: { searchParams: { type?: string } }) {
  if (process.env.NEXT_PUBLIC_ACADEMY_ENABLED !== 'true') notFound();

  const accountType = (TYPES.includes(searchParams.type as AccountType) ? searchParams.type : 'distributor') as AccountType;
  const isXrite = accountType === 'distributor';
  const company = isXrite ? 'X-Rite PANTONE' : 'Acme Printing';

  const team: Team = {
    org: { id: 'demo-org', name: company, type: accountType, logoUrl: null },
    members: [
      { userId: 'demo', name: 'Demo User', email: isXrite ? 'demo@xrite.com' : 'demo@acme.com', role: 'admin' },
      { userId: 'm2', name: 'Marie Lévêque', email: isXrite ? 'marie@xrite.com' : 'marie@acme.com', role: 'member' },
    ],
    pending: [{ id: 'p1', email: isXrite ? 'new@xrite.com' : 'new@acme.com', role: 'member', createdAt: '2026-05-01' }],
    myRole: 'admin',
  };

  const networkResellers: ResellerClientOrg[] = isXrite
    ? [
        { orgId: 'r1', name: 'ColorConsulting', country: 'Italy', memberCount: 3 },
        { orgId: 'r2', name: 'GS Monaco', country: 'Monaco', memberCount: 1 },
      ]
    : [];

  const resellerClients: ResellerClient[] =
    accountType === 'reseller'
      ? [
          { name: 'Moderna Printing', country: 'Belgium', presses: 2, eligible: 1, open: 1 },
          { name: 'Viappiani', country: 'Italy', presses: 1, eligible: 0, open: 1 },
        ]
      : accountType === 'distributor'
        ? [
            { name: 'Autajon', country: 'France', presses: 3, eligible: 2, open: 1 },
            { name: 'WestRock', country: 'USA', presses: 2, eligible: 1, open: 0 },
          ]
        : [];

  return (
    <AccountHub
      accountType={accountType}
      team={team}
      selfId="demo"
      isAdmin={accountType === 'team'}
      networkResellers={networkResellers}
      email={isXrite ? 'demo@xrite.com' : 'demo@acme.com'}
      memberSince="2026-02-01"
      profile={{ fullName: 'Demo User', avatarUrl: null, country: 'France', company, jobTitle: 'Sales' }}
      academy={{
        level: 3,
        percentIntoLevel: 55,
        xp: 320,
        xpToNext: 80,
        isMax: false,
        completedModules: 7,
        totalModules: 20,
        certificates: 2,
      }}
      consoleStat={{ eligible: 2, open: 1 }}
      supportStat={{ status: 'in_progress', newMessage: true }}
      resume={{
        slug: 'closed-loop-flagship',
        title: 'The Complete Closed-Loop Color Masterclass',
        moduleIndex: 3,
        moduleTitle: 'Reading the press: density, ΔE and tolerances',
      }}
      resellerClients={resellerClients}
    />
  );
}
