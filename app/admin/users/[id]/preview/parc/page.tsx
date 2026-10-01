import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPreviewTarget, requirePreviewAccess, safePreviewBack } from '@/lib/admin-preview';
import { getPartnerFleet } from '@/lib/partner-fleet';
import { AccountFleet } from '@/components/account-fleet';

export const metadata: Metadata = {
  title: 'Aperçu parc revendeur — Admin Rutherford',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// Read-only « Parc clients » of the previewed reseller / distributor.
export default async function PreviewFleetRoute({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { back?: string };
}) {
  await requirePreviewAccess(`/admin/users/${params.id}/preview/parc`);
  const target = await getPreviewTarget(params.id);
  if (!target || (target.accountType !== 'reseller' && target.accountType !== 'distributor')) notFound();

  return (
    <AccountFleet
      fleet={await getPartnerFleet(target.userId)}
      previewCtx={{
        userId: target.userId,
        accountType: target.accountType,
        back: safePreviewBack(searchParams.back),
        name: target.fullName,
      }}
    />
  );
}
