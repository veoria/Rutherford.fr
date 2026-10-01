import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ACCOUNT_ENABLED } from '@/lib/features';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isOnboarded } from '@/lib/profile';
import { ensurePersonalOrg } from '@/lib/organizations';
import { getAttributedPartnerNames, getPressesForOrg, getWorkshopAccess } from '@/lib/presses';
import { getVisibleSitesForUser } from '@/lib/sites';
import { getSystemsForOrg } from '@/lib/client-systems';
import { AccountWorkshop, type WorkshopSite } from '@/components/account-workshop';

export const metadata: Metadata = {
  title: 'My pressroom | Rutherford',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AccountWorkshopRoute() {
  if (!ACCOUNT_ENABLED) notFound();
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/account/sign-in?next=/account/atelier');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, country, company, job_title, job_roles, onboarded_at, account_type')
    .eq('id', user.id)
    .maybeSingle();
  if (!isOnboarded(profile)) {
    redirect('/account/onboarding?next=/account/atelier');
  }
  // The pressroom is a client space (per-role visibility matrix): partners
  // follow their clients' presses from the hub, not as their own.
  if ((profile?.account_type ?? 'client') !== 'client') {
    redirect('/account');
  }

  let access = await getWorkshopAccess(user.id);
  if (!access) {
    await ensurePersonalOrg(user.id);
    access = await getWorkshopAccess(user.id);
  }

  const [siteRecords, pressRecords, systems, partnerNames] = access
    ? await Promise.all([
        getVisibleSitesForUser(user.id, access.orgId, access.canManageSites),
        getPressesForOrg(access.orgId),
        getSystemsForOrg(access.orgId),
        getAttributedPartnerNames(access.orgId),
      ])
    : [[], [], [], []];
  const equipmentByPress = new Map<string, number>();
  for (const sys of systems) {
    if (sys.pressId) equipmentByPress.set(sys.pressId, (equipmentByPress.get(sys.pressId) ?? 0) + 1);
  }

  const sites: WorkshopSite[] = siteRecords.map((s) => ({
    id: s.id,
    name: s.name,
    city: s.city,
    country: s.country,
    address: s.address,
    postalCode: s.postalCode,
    anydeskId: s.anydeskId,
  }));
  // A member restricted to some plants only sees those plants' presses (plus
  // the unassigned ones, which belong to nobody yet).
  const visibleSiteIds = new Set(sites.map((s) => s.id));
  const presses = pressRecords
    .filter((p) => !p.siteId || visibleSiteIds.has(p.siteId))
    .map(({ createdAt: _createdAt, ...p }) => ({ ...p, equipment: equipmentByPress.get(p.id) ?? 0 }));

  return (
    <AccountWorkshop
      presses={presses}
      sites={sites}
      canManageSites={access?.canManageSites ?? false}
      partnerNames={partnerNames}
    />
  );
}
