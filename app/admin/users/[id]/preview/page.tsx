import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getAdminAccess } from '@/lib/admin-access';
import { getAccountHubPreview } from '@/lib/account-preview';
import { AccountHub } from '@/components/account-hub';

export const metadata: Metadata = {
  title: 'Aperçu espace client — Admin Rutherford',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// Read-only "view as client": renders the client's own account hub with their
// real data, every action disabled. Same admin gate as the account detail page.
export default async function ClientPreviewRoute({ params }: { params: { id: string } }) {
  const next = `/admin/users/${params.id}/preview`;
  const access = await getAdminAccess();
  if (!access.ok) {
    if (access.reason === 'unauthenticated') redirect(`/account/sign-in?next=${next}`);
    if (access.reason === 'needs_2fa_challenge') redirect(`/account/verify-2fa?next=${next}`);
    if (access.reason === 'needs_2fa_setup') redirect(`/account/security?next=${next}`);
    notFound(); // forbidden — don't reveal the route exists
  }

  const props = await getAccountHubPreview(params.id);
  if (!props) notFound();
  return <AccountHub {...props} preview />;
}
