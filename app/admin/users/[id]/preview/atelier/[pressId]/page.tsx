import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPreviewTarget, requirePreviewAccess, safePreviewBack } from '@/lib/admin-preview';
import { getPressForOrg, getPressSupportHistory } from '@/lib/presses';
import { getSitesForOrg } from '@/lib/sites';
import { getSystemsForOrg, hasUpdateAvailable } from '@/lib/client-systems';
import { AccountPressDetail, type PressEquipment } from '@/components/account-press-detail';
import type { WorkshopSite } from '@/components/account-workshop';

export const metadata: Metadata = {
  title: 'Aperçu fiche presse — Admin Rutherford',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// Read-only press sheet of the previewed client (equipment, support history).
export default async function PreviewPressRoute({
  params,
  searchParams,
}: {
  params: { id: string; pressId: string };
  searchParams: { back?: string };
}) {
  const { canManage } = await requirePreviewAccess(`/admin/users/${params.id}/preview/atelier/${params.pressId}`);
  const target = await getPreviewTarget(params.id);
  if (!target || target.accountType !== 'client' || !target.orgId) notFound();
  const press = await getPressForOrg(target.orgId, params.pressId);
  if (!press) notFound();

  const [siteRecords, systems, history] = await Promise.all([
    getSitesForOrg(target.orgId),
    getSystemsForOrg(target.orgId),
    getPressSupportHistory(press.id, target.userId),
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
  const equipment: PressEquipment[] = systems
    .filter((s) => s.pressId === press.id)
    .map((s) => ({
      id: s.id,
      kind: s.kind,
      product: s.product,
      serialNumber: s.serialNumber,
      licenseStatus: s.licenseStatus,
      licenseExpiresAt: s.licenseExpiresAt,
      anydeskId: s.anydeskId,
      installedVersion: s.installedVersion,
      latestVersion: s.latestVersion,
      updateAvailable: hasUpdateAvailable(s),
    }));
  const { createdAt: _createdAt, ...pressProps } = press;

  return (
    <AccountPressDetail
      press={{ ...pressProps, equipment: equipment.length }}
      sites={sites}
      equipment={equipment}
      history={history.map(({ updatedAt: _u, ...h }) => h)}
      canDelete={false}
      previewCtx={{
        userId: target.userId,
        accountType: target.accountType,
        back: safePreviewBack(searchParams.back),
        name: target.fullName,
        editOrgId: canManage ? target.orgId : undefined,
      }}
    />
  );
}
