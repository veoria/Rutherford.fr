import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ACCOUNT_ENABLED } from '@/lib/features';
import { AccountHub, type ResellerClient } from '@/components/account-hub';
import type { ClientSystem } from '@/components/account-systems';
import type { AccountInstallation, AccountSite } from '@/components/account-installations';
import type { AccountType } from '@/data/account-types';
import type { WorkshopPress } from '@/components/account-workshop';
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

export default function AccountHubDemoRoute({ searchParams }: { searchParams: { type?: string; preview?: string } }) {
  if (!ACCOUNT_ENABLED) notFound();
  const preview = searchParams.preview === '1';

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
        { orgId: 'r1', name: 'ColorConsulting', country: 'Italy', memberCount: 3, systems: 0, updates: 0 },
        { orgId: 'r2', name: 'GS Monaco', country: 'Monaco', memberCount: 1, systems: 0, updates: 0 },
      ]
    : [];

  const resellerClients: ResellerClient[] =
    accountType === 'reseller'
      ? [
          { name: 'Moderna Printing', country: 'Belgium', presses: 2, eligible: 1, open: 1, systems: 2, updates: 1 },
          { name: 'Viappiani', country: 'Italy', presses: 1, eligible: 0, open: 1, systems: 1 },
        ]
      : accountType === 'distributor'
        ? [
            { name: 'Autajon', country: 'France', presses: 3, eligible: 2, open: 1 },
            { name: 'WestRock', country: 'USA', presses: 2, eligible: 1, open: 0 },
          ]
        : [];

  const systems: ClientSystem[] =
    accountType === 'client'
      ? [
          { machine: 'Heidelberg Speedmaster CD102-6+L', company: 'Acme Print', country: 'France', status: 'can_be_connected', dealId: 2391, count: 2 },
          { machine: 'Komori Lithrone GL-840', company: 'Acme Print', country: 'France', status: 'in_review', dealId: 2392, count: 1 },
        ]
      : [];

  // "Mon système" sample — two plants (usines), license / AnyDesk / update states.
  const sites: AccountSite[] =
    accountType === 'client'
      ? [
          { id: 's1', name: 'Site de Lyon', city: 'Lyon', country: 'France', anydeskId: '111 222 333' },
          { id: 's2', name: 'Site de Lille', city: 'Lille', country: 'France', anydeskId: null },
        ]
      : [];
  const installations: AccountInstallation[] =
    accountType === 'client'
      ? [
          {
            id: 'i1',
            siteId: 's1',
            product: 'ColorLoop',
            machine: 'Heidelberg Speedmaster CD102-6+L',
            licenseKey: 'CL-2026-ACME-0042',
            licenseStatus: 'active',
            licenseExpiresAt: '2027-02-01',
            anydeskId: '123 456 789',
            installedVersion: '3.2.1',
            latestVersion: '3.4.0',
            updateAvailable: true,
          },
          {
            id: 'i2',
            siteId: 's1',
            product: 'MeasureColor',
            machine: 'Komori Lithrone GL-840',
            licenseKey: 'MC-2025-ACME-0007',
            licenseStatus: 'active',
            licenseExpiresAt: null,
            anydeskId: '987 654 321',
            installedVersion: '23.1',
            latestVersion: '23.1',
            updateAvailable: false,
          },
          {
            id: 'i3',
            siteId: 's2',
            product: 'ColorLoop Connect',
            machine: 'Manroland R700',
            licenseKey: 'CLC-2026-ACME-0015',
            licenseStatus: 'trial',
            licenseExpiresAt: '2026-09-30',
            anydeskId: '444 555 666',
            installedVersion: '3.3.0',
            latestVersion: '3.4.0',
            updateAvailable: true,
          },
        ]
      : [];

  // Sample pressroom (client view): two plants, presses declared in Mon atelier.
  const presses: WorkshopPress[] =
    accountType === 'client'
      ? [
          { id: 'p1', siteId: sites[0]?.id ?? null, name: null, manufacturer: 'Heidelberg', model: 'Speedmaster CD 102', sheetFormat: 'b1', colors: 6, coater: true, perfecting: false, productionProfile: 'packaging', console: 'CP2000', year: 2014, notes: null },
          { id: 'p2', siteId: sites[0]?.id ?? null, name: null, manufacturer: 'Komori', model: 'Lithrone GL-840', sheetFormat: 'b1', colors: 8, coater: false, perfecting: true, productionProfile: 'commercial', console: null, year: 2017, notes: null },
          { id: 'p3', siteId: sites[1]?.id ?? null, name: null, manufacturer: 'Manroland', model: 'R700', sheetFormat: 'b1', colors: 5, coater: true, perfecting: false, productionProfile: 'luxe', console: null, year: null, notes: null },
        ]
      : [];

  return (
    <AccountHub
      accountType={accountType}
      team={team}
      selfId="demo"
      networkResellers={networkResellers}
      email={isXrite ? 'demo@xrite.com' : 'demo@acme.com'}
      memberSince="2026-02-01"
      profile={{ fullName: 'Demo User', avatarUrl: null, country: 'France', company, jobTitle: 'Sales' }}
      consoleStat={{ eligible: 2, open: 1 }}
      supportStat={{ status: 'in_progress', newMessage: true }}
      resellerClients={resellerClients}
      systems={systems}
      installations={installations}
      sites={sites}
      presses={presses}
      preview={preview}
    />
  );
}
