import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPreviewTarget, requirePreviewAccess, safePreviewBack } from '@/lib/admin-preview';
import { getAttributedPartnerNames, getPressesForOrg } from '@/lib/presses';
import { getSitesForOrg } from '@/lib/sites';
import { getSystemsForOrg } from '@/lib/client-systems';
import { AccountWorkshop, type WorkshopSite } from '@/components/account-workshop';

export const metadata: Metadata = {
  title: 'Aperçu atelier client — Admin Rutherford',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// Read-only « Mon atelier » of the previewed client, with their real data.
export default async function PreviewWorkshopRoute({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { back?: string };
}) {
  await requirePreviewAccess(`/admin/users/${params.id}/preview/atelier`);
  const target = await getPreviewTarget(params.id);
  if (!target || target.accountType !== 'client' || !target.orgId) notFound();

  const [siteRecords, pressRecords, systems, partnerNames] = await Promise.all([
    getSitesForOrg(target.orgId),
    getPressesForOrg(target.orgId),
    getSystemsForOrg(target.orgId),
    getAttributedPartnerNames(target.orgId),
  ]);
  const sites: WorkshopSite[] = siteRecords.map((s) => ({
    id: s.id,
    name: s.name,
    city: s.city,
    country: s.country,
    address: s.address,
    postalCode: s.postalCode,
    anydeskId: s.anydeskId,
  }));
  const presses = pressRecords.map(({ createdAt: _createdAt, ...p }) => ({
    ...p,
    equipment: systems.filter((sys) => sys.pressId === p.id).length,
  }));

  return (
    <AccountWorkshop
      presses={presses}
      sites={sites}
      canManageSites={false}
      partnerNames={partnerNames}
      previewCtx={{
        userId: target.userId,
        accountType: target.accountType,
        back: safePreviewBack(searchParams.back),
        name: target.fullName,
      }}
    />
  );
}
