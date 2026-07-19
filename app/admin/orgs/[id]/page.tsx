import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getAdminAccess } from '@/lib/admin-access';
import { getAdminOrgDetail } from '@/lib/admin';
import { listAuditLog } from '@/lib/admin-audit';
import { AdminOrgDetail } from '@/components/admin-org-detail';

export const metadata: Metadata = {
  title: 'Organisation — Rutherford Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminOrgRoute({ params }: { params: { id: string } }) {
  const next = `/admin/orgs/${params.id}`;
  const access = await getAdminAccess();
  if (!access.ok) {
    if (access.reason === 'unauthenticated') redirect(`/account/sign-in?next=${next}`);
    if (access.reason === 'needs_2fa_challenge') redirect(`/account/verify-2fa?next=${next}`);
    if (access.reason === 'needs_2fa_setup') redirect(`/account/security?next=${next}`);
    notFound(); // forbidden — don't reveal the route exists
  }

  const [org, auditLog] = await Promise.all([
    getAdminOrgDetail(params.id),
    listAuditLog(50, { type: 'organization', id: params.id }),
  ]);
  if (!org) notFound();
  return <AdminOrgDetail org={org} auditLog={auditLog} />;
}
