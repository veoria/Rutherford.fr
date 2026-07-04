// Client systems (installed base) — SERVER-ONLY.
//
// The rows behind the account hub's "Mon système" panel: license, AnyDesk id,
// installed vs latest version. Managed by the Rutherford team in the org
// back-office; members read their own org's rows (RLS), but we serve them via
// the service-role client alongside the rest of the hub. Dormant-safe: returns
// empty/no-op when Supabase isn't configured.

import { createSupabaseAdminClient } from '@/lib/supabase/server';
import type { AccountInstallation } from '@/components/account-installations';
import { getRestrictedSiteIds } from '@/lib/sites';

export const LICENSE_STATUSES = ['active', 'trial', 'expired', 'suspended'] as const;
export type LicenseStatus = (typeof LICENSE_STATUSES)[number];

export function isLicenseStatus(value: string): value is LicenseStatus {
  return (LICENSE_STATUSES as readonly string[]).includes(value);
}

export type ClientSystemRecord = {
  id: string;
  orgId: string;
  siteId: string | null;
  product: string;
  machine: string | null;
  licenseKey: string | null;
  licenseStatus: LicenseStatus;
  licenseExpiresAt: string | null; // ISO date
  anydeskId: string | null;
  installedVersion: string | null;
  latestVersion: string | null;
  notes: string | null;
  updatedAt: string;
};

/** An update is available when both versions are set and differ. */
export function hasUpdateAvailable(s: Pick<ClientSystemRecord, 'installedVersion' | 'latestVersion'>): boolean {
  const installed = (s.installedVersion ?? '').trim();
  const latest = (s.latestVersion ?? '').trim();
  return Boolean(installed && latest && installed !== latest);
}

/** Shape a record for the account hub's "Mon système" cards. */
export function toAccountInstallation(r: ClientSystemRecord): AccountInstallation {
  return {
    id: r.id,
    siteId: r.siteId,
    product: r.product,
    machine: r.machine,
    licenseKey: r.licenseKey,
    licenseStatus: r.licenseStatus,
    licenseExpiresAt: r.licenseExpiresAt,
    anydeskId: r.anydeskId,
    installedVersion: r.installedVersion,
    latestVersion: r.latestVersion,
    updateAvailable: hasUpdateAvailable(r),
  };
}

function admin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createSupabaseAdminClient();
}

type Row = {
  id: string;
  org_id: string;
  site_id: string | null;
  product: string;
  machine: string | null;
  license_key: string | null;
  license_status: string;
  license_expires_at: string | null;
  anydesk_id: string | null;
  installed_version: string | null;
  latest_version: string | null;
  notes: string | null;
  updated_at: string;
};

function toRecord(r: Row): ClientSystemRecord {
  return {
    id: r.id,
    orgId: r.org_id,
    siteId: r.site_id,
    product: r.product,
    machine: r.machine,
    licenseKey: r.license_key,
    licenseStatus: isLicenseStatus(r.license_status) ? r.license_status : 'active',
    licenseExpiresAt: r.license_expires_at,
    anydeskId: r.anydesk_id,
    installedVersion: r.installed_version,
    latestVersion: r.latest_version,
    notes: r.notes,
    updatedAt: r.updated_at,
  };
}

const SELECT =
  'id, org_id, site_id, product, machine, license_key, license_status, license_expires_at, anydesk_id, installed_version, latest_version, notes, updated_at';

/** The signed-in user's systems, via their primary organization, filtered to
 * the sites they may see (site_members restriction; empty = all sites). A
 * restricted user does not see systems that aren't placed on a site. */
export async function getSystemsForUser(userId: string): Promise<ClientSystemRecord[]> {
  const supabase = admin();
  if (!supabase) return [];
  try {
    const { data: prof } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .maybeSingle();
    const orgId = (prof?.organization_id as string | null) ?? null;
    if (!orgId) return [];
    const [systems, restricted] = await Promise.all([getSystemsForOrg(orgId), getRestrictedSiteIds(userId)]);
    if (!restricted.length) return systems;
    const allowed = new Set(restricted);
    const scoped = systems.filter((s) => s.siteId && allowed.has(s.siteId));
    // A restriction that matches none of this org's systems (e.g. it only
    // covers another org) shouldn't blank the hub — fall back to all.
    return scoped.length ? scoped : systems;
  } catch {
    return [];
  }
}

/** All systems of one org (admin org drawer + the user's own hub). */
export async function getSystemsForOrg(orgId: string): Promise<ClientSystemRecord[]> {
  const supabase = admin();
  if (!supabase || !orgId) return [];
  try {
    const { data } = await supabase
      .from('client_systems')
      .select(SELECT)
      .eq('org_id', orgId)
      .order('created_at', { ascending: true });
    return ((data ?? []) as Row[]).map(toRecord);
  } catch {
    return [];
  }
}

/** Per-org counts (systems + pending updates) for the reseller clients view. */
export async function countSystemsForOrgs(
  orgIds: string[]
): Promise<Map<string, { systems: number; updates: number }>> {
  const counts = new Map<string, { systems: number; updates: number }>();
  const supabase = admin();
  if (!supabase || !orgIds.length) return counts;
  try {
    const { data } = await supabase
      .from('client_systems')
      .select('org_id, installed_version, latest_version')
      .in('org_id', orgIds);
    for (const r of (data ?? []) as Pick<Row, 'org_id' | 'installed_version' | 'latest_version'>[]) {
      const cur = counts.get(r.org_id) ?? { systems: 0, updates: 0 };
      cur.systems += 1;
      if (hasUpdateAvailable({ installedVersion: r.installed_version, latestVersion: r.latest_version })) {
        cur.updates += 1;
      }
      counts.set(r.org_id, cur);
    }
    return counts;
  } catch {
    return counts;
  }
}

export type ClientSystemInput = {
  product: string;
  siteId?: string | null;
  machine?: string | null;
  licenseKey?: string | null;
  licenseStatus?: LicenseStatus;
  licenseExpiresAt?: string | null;
  anydeskId?: string | null;
  installedVersion?: string | null;
  latestVersion?: string | null;
  notes?: string | null;
};

/** Admin: add a system to an org. Returns its id (or null on failure). */
export async function createSystem(orgId: string, input: ClientSystemInput): Promise<{ id: string } | null> {
  const supabase = admin();
  const product = input.product.trim();
  if (!supabase || !orgId || !product) return null;
  try {
    const { data, error } = await supabase
      .from('client_systems')
      .insert({
        org_id: orgId,
        site_id: input.siteId ?? null,
        product: product.slice(0, 120),
        machine: input.machine ?? null,
        license_key: input.licenseKey ?? null,
        license_status: input.licenseStatus ?? 'active',
        license_expires_at: input.licenseExpiresAt ?? null,
        anydesk_id: input.anydeskId ?? null,
        installed_version: input.installedVersion ?? null,
        latest_version: input.latestVersion ?? null,
        notes: input.notes ?? null,
      })
      .select('id')
      .single();
    if (error || !data) return null;
    return { id: data.id as string };
  } catch {
    return null;
  }
}

type SystemPatch = Partial<{
  site_id: string | null;
  product: string;
  machine: string | null;
  license_key: string | null;
  license_status: LicenseStatus;
  license_expires_at: string | null;
  anydesk_id: string | null;
  installed_version: string | null;
  latest_version: string | null;
  notes: string | null;
}>;

/** Admin: update a system's editable fields. */
export async function updateSystem(id: string, patch: SystemPatch): Promise<boolean> {
  const supabase = admin();
  if (!supabase || !id) return false;
  try {
    const { error } = await supabase
      .from('client_systems')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/** Admin: remove a system. */
export async function deleteSystem(id: string): Promise<boolean> {
  const supabase = admin();
  if (!supabase || !id) return false;
  try {
    const { error } = await supabase.from('client_systems').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}
