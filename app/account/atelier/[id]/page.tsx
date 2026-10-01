import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ACCOUNT_ENABLED } from '@/lib/features';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isOnboarded } from '@/lib/profile';
import { getPressForOrg, getPressSupportHistory, getWorkshopAccess } from '@/lib/presses';
import { getVisibleSitesForUser } from '@/lib/sites';
import { getSystemsForOrg, hasUpdateAvailable } from '@/lib/client-systems';
import { AccountPressDetail, type PressEquipment } from '@/components/account-press-detail';
import type { WorkshopSite } from '@/components/account-workshop';

export const metadata: Metadata = {
  title: 'Press | Rutherford',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AccountPressRoute({ params }: { params: { id: string } }) {
  if (!ACCOUNT_ENABLED) notFound();
  const next = `/account/atelier/${params.id}`;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/account/sign-in?next=${encodeURIComponent(next)}`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, country, company, job_title, job_roles, onboarded_at, account_type')
    .eq('id', user.id)
    .maybeSingle();
  if (!isOnboarded(profile)) {
    redirect(`/account/onboarding?next=${encodeURIComponent(next)}`);
  }
  if ((profile?.account_type ?? 'client') !== 'client') {
    redirect('/account');
  }

  const access = await getWorkshopAccess(user.id);
  if (!access) notFound();
  const press = await getPressForOrg(access.orgId, params.id);
  if (!press) notFound();

  const [siteRecords, systems, history] = await Promise.all([
    getVisibleSitesForUser(user.id, access.orgId, access.canManageSites),
    getSystemsForOrg(access.orgId),
    getPressSupportHistory(press.id, user.id),
  ]);
  // A member restricted to some plants can't open a press of another plant.
  if (press.siteId && !siteRecords.some((s) => s.id === press.siteId)) notFound();

  const sites: WorkshopSite[] = siteRecords.map((s) => ({
    id: s.id,
    name: s.name,
    city: s.city,
    country: s.country,
    address: s.address,
    postalCode: s.postalCode,
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
      canDelete={access.canManageSites}
    />
  );
}
