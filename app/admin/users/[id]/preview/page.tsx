import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requirePreviewAccess, safePreviewBack } from '@/lib/admin-preview';
import { getAccountHubPreview } from '@/lib/account-preview';
import { AccountHub } from '@/components/account-hub';

export const metadata: Metadata = {
  title: 'Aperçu espace client — Admin Rutherford',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// Read-only "view as client": renders the client's own account hub with their
// real data, every action disabled. Same admin gate as the account detail page.
export default async function ClientPreviewRoute({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { back?: string };
}) {
  await requirePreviewAccess(`/admin/users/${params.id}/preview`);
  // « Retour admin » : là d'où l'aperçu a été ouvert (page org ou fiche user).
  const back = safePreviewBack(searchParams.back);

  const props = await getAccountHubPreview(params.id);
  if (!props) notFound();
  return <AccountHub {...props} preview previewBack={back} />;
}
