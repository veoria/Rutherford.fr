import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getAdminAccess } from '@/lib/admin-access';
import { getAdminOrgDetail } from '@/lib/admin';
import { listAuditLog } from '@/lib/admin-audit';
import { listOrgsForAdmin } from '@/lib/organizations';
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

  const [org, auditLog, orgsFull] = await Promise.all([
    getAdminOrgDetail(params.id),
    listAuditLog(50, { type: 'organization', id: params.id }),
    listOrgsForAdmin(),
  ]);
  if (!org) notFound();
  // Options d'attribution (revendeur/distributeur) ; l'édition n'est proposée
  // qu'aux admins gestionnaires (les mutations restent gardées côté serveur).
  const orgOptions = orgsFull.map((o) => ({ id: o.id, name: o.name, type: o.type }));
  return (
    <AdminOrgDetail org={org} auditLog={auditLog} orgOptions={orgOptions} canManage={access.canManage} />
  );
}
