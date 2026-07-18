import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getAdminAccess } from '@/lib/admin-access';
import { getAdminOverview } from '@/lib/admin';
import { listAuditLog } from '@/lib/admin-audit';
import { getOrgsForAdmin, listOrgsForAdmin } from '@/lib/organizations';
import { AdminDashboard } from '@/components/admin-dashboard';

export const metadata: Metadata = {
  title: 'Admin — Rutherford Academy',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminRoute() {
  // Access = team domain (or is_admin) AND 2FA this session. Team members get a
  // read-only view; managing stays gated to is_admin (canManage).
  const access = await getAdminAccess();
  if (!access.ok) {
    if (access.reason === 'unauthenticated') redirect('/account/sign-in?next=/admin');
    if (access.reason === 'needs_2fa_challenge') redirect('/account/verify-2fa?next=/admin');
    if (access.reason === 'needs_2fa_setup') redirect('/account/security?next=/admin');
    notFound(); // forbidden — don't reveal the route exists
  }

  const [overview, orgs, orgsFull, auditLog] = await Promise.all([
    getAdminOverview(),
    getOrgsForAdmin(),
    listOrgsForAdmin(),
    listAuditLog(200),
  ]);
  return (
    <AdminDashboard
      overview={overview}
      orgs={orgs}
      orgsFull={orgsFull}
      auditLog={auditLog}
      selfId={access.userId}
      canManage={access.canManage}
    />
  );
}
