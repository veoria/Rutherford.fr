import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getAdminAccess } from '@/lib/admin-access';
import { getAdminUserDetail } from '@/lib/admin';
import { AdminUserDetail } from '@/components/admin-user-detail';

export const metadata: Metadata = {
  title: 'Compte — Admin Rutherford',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminUserRoute({ params }: { params: { id: string } }) {
  const next = `/admin/users/${params.id}`;
  const access = await getAdminAccess();
  if (!access.ok) {
    if (access.reason === 'unauthenticated') redirect(`/account/sign-in?next=${next}`);
    if (access.reason === 'needs_2fa_challenge') redirect(`/account/verify-2fa?next=${next}`);
    if (access.reason === 'needs_2fa_setup') redirect(`/account/security?next=${next}`);
    notFound(); // forbidden — don't reveal the route exists
  }

  const user = await getAdminUserDetail(params.id);
  if (!user) notFound();
  return <AdminUserDetail user={user} />;
}
