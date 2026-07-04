// Sites (usines) — SERVER-ONLY.
//
// A location level between the client organization and its installed systems.
// One client account can hold several plants; a user can be restricted to
// specific sites (site_members) or, with no restriction rows, see all of them.
// Managed by the Rutherford team in the org back-office. Dormant-safe: returns
// empty/no-op when Supabase isn't configured.

import { createSupabaseAdminClient } from '@/lib/supabase/server';
import type { AccountSite } from '@/components/account-installations';

export type SiteRecord = {
  id: string;
  orgId: string;
  name: string;
  country: string | null;
  city: string | null;
  address: string | null;
  postalCode: string | null;
  anydeskId: string | null;
  notes: string | null;
  updatedAt: string;
};

/** Shape a site for the account hub's "Mon système" plant selector. */
export function toAccountSite(s: SiteRecord): AccountSite {
  return { id: s.id, name: s.name, city: s.city, country: s.country, anydeskId: s.anydeskId };
}

function admin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createSupabaseAdminClient();
}

type Row = {
  id: string;
  org_id: string;
  name: string;
  country: string | null;
  city: string | null;
  address: string | null;
  postal_code: string | null;
  anydesk_id: string | null;
  notes: string | null;
  updated_at: string;
};

function toRecord(r: Row): SiteRecord {
  return {
    id: r.id,
    orgId: r.org_id,
    name: r.name,
    country: r.country,
    city: r.city,
    address: r.address,
    postalCode: r.postal_code,
    anydeskId: r.anydesk_id,
    notes: r.notes,
    updatedAt: r.updated_at,
  };
}

const SELECT = 'id, org_id, name, country, city, address, postal_code, anydesk_id, notes, updated_at';

/** All sites of one org (admin drawer + full hub, ordered by name). */
export async function getSitesForOrg(orgId: string): Promise<SiteRecord[]> {
  const supabase = admin();
  if (!supabase || !orgId) return [];
  try {
    const { data } = await supabase.from('sites').select(SELECT).eq('org_id', orgId).order('name');
    return ((data ?? []) as Row[]).map(toRecord);
  } catch {
    return [];
  }
}

/** The site ids a user is explicitly restricted to (empty = no restriction). */
export async function getRestrictedSiteIds(userId: string): Promise<string[]> {
  const supabase = admin();
  if (!supabase) return [];
  try {
    const { data } = await supabase.from('site_members').select('site_id').eq('user_id', userId);
    return ((data ?? []) as { site_id: string }[]).map((r) => r.site_id);
  } catch {
    return [];
  }
}

/**
 * The sites a user may see in their own org: all of the org's sites, unless the
 * user has explicit site_members rows AND is not an owner/admin, in which case
 * only the restricted subset. Mirrors the RLS policy but with the owner/admin
 * override applied here (RLS is intentionally simple).
 */
export async function getVisibleSitesForUser(
  userId: string,
  orgId: string,
  canManage: boolean
): Promise<SiteRecord[]> {
  const all = await getSitesForOrg(orgId);
  if (canManage) return all;
  const restricted = await getRestrictedSiteIds(userId);
  if (!restricted.length) return all;
  const allowed = new Set(restricted);
  const scoped = all.filter((s) => allowed.has(s.id));
  // A restriction that points only at other orgs' sites shouldn't hide this
  // org entirely — fall back to all when the intersection is empty.
  return scoped.length ? scoped : all;
}

export type SiteInput = {
  name: string;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  postalCode?: string | null;
  anydeskId?: string | null;
  notes?: string | null;
};

/** Admin: create a site under an org. Returns its id (or null on failure). */
export async function createSite(orgId: string, input: SiteInput): Promise<{ id: string } | null> {
  const supabase = admin();
  const name = input.name.trim();
  if (!supabase || !orgId || !name) return null;
  try {
    const { data, error } = await supabase
      .from('sites')
      .insert({
        org_id: orgId,
        name: name.slice(0, 160),
        country: input.country ?? null,
        city: input.city ?? null,
        address: input.address ?? null,
        postal_code: input.postalCode ?? null,
        anydesk_id: input.anydeskId ?? null,
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

type SitePatch = Partial<{
  name: string;
  country: string | null;
  city: string | null;
  address: string | null;
  postal_code: string | null;
  anydesk_id: string | null;
  notes: string | null;
}>;

/** Admin: update a site's editable fields. */
export async function updateSite(id: string, patch: SitePatch): Promise<boolean> {
  const supabase = admin();
  if (!supabase || !id) return false;
  try {
    const { error } = await supabase
      .from('sites')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/** Admin: remove a site. Systems on it fall back to site_id = null (FK). */
export async function deleteSite(id: string): Promise<boolean> {
  const supabase = admin();
  if (!supabase || !id) return false;
  try {
    const { error } = await supabase.from('sites').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/** Admin: the user ids restricted to a given site. */
export async function getSiteMemberIds(siteId: string): Promise<string[]> {
  const supabase = admin();
  if (!supabase || !siteId) return [];
  try {
    const { data } = await supabase.from('site_members').select('user_id').eq('site_id', siteId);
    return ((data ?? []) as { user_id: string }[]).map((r) => r.user_id);
  } catch {
    return [];
  }
}

/**
 * Admin: set a member's site restriction within an org. `siteIds` is the exact
 * set the user should be limited to; an empty array clears the restriction
 * (the member sees all the org's sites again). Only touches this org's sites.
 */
export async function setMemberSites(userId: string, orgId: string, siteIds: string[]): Promise<boolean> {
  const supabase = admin();
  if (!supabase || !userId || !orgId) return false;
  try {
    const orgSites = await getSitesForOrg(orgId);
    const valid = new Set(orgSites.map((s) => s.id));
    const wanted = [...new Set(siteIds.filter((id) => valid.has(id)))];

    // Clear any existing restriction rows for this org's sites, then re-insert.
    const orgSiteIds = orgSites.map((s) => s.id);
    if (orgSiteIds.length) {
      await supabase.from('site_members').delete().eq('user_id', userId).in('site_id', orgSiteIds);
    }
    if (wanted.length) {
      const rows = wanted.map((site_id) => ({ site_id, user_id: userId }));
      const { error } = await supabase.from('site_members').insert(rows);
      if (error) return false;
    }
    return true;
  } catch {
    return false;
  }
}
