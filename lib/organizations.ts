// Organizations & team membership — SERVER-ONLY.
//
// Reads and writes use the service-role client; the API layer verifies the
// caller is an owner/admin of the org before mutating. Dormant-safe: returns
// empty/no-op when Supabase isn't configured.

import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { companyDomainFromEmail } from '@/lib/account-type';
import { countSystemsForOrgs } from '@/lib/client-systems';

export type MemberRole = 'owner' | 'admin' | 'member';

export type OrgMember = {
  userId: string;
  name: string | null;
  email: string;
  role: MemberRole;
};

export type PendingInvite = {
  id: string;
  email: string;
  role: MemberRole;
  createdAt: string;
};

export type Team = {
  org: { id: string; name: string; type: string; logoUrl: string | null } | null;
  members: OrgMember[];
  pending: PendingInvite[];
  myRole: MemberRole | null;
};

const EMPTY: Team = { org: null, members: [], pending: [], myRole: null };
const ROLE_RANK: Record<string, number> = { owner: 0, admin: 1, member: 2 };

function admin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createSupabaseAdminClient();
}

/** The signed-in user's org, its active members and pending invitations. */
export async function getTeamForUser(userId: string): Promise<Team> {
  const supabase = admin();
  if (!supabase) return EMPTY;
  try {
    const { data: prof } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .maybeSingle();
    const orgId = (prof?.organization_id as string | null) ?? null;
    if (!orgId) return EMPTY;

    const [{ data: org }, { data: memberRows }, { data: invites }] = await Promise.all([
      supabase.from('organizations').select('id, name, type, logo_url').eq('id', orgId).maybeSingle(),
      supabase.from('organization_members').select('user_id, role').eq('org_id', orgId).eq('status', 'active'),
      supabase.from('invitations').select('id, email, role, created_at').eq('org_id', orgId).eq('status', 'pending'),
    ]);

    const rows = (memberRows ?? []) as { user_id: string; role: MemberRole }[];
    const ids = rows.map((m) => m.user_id).filter(Boolean);
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);
    const nameById = new Map((profs ?? []).map((p: { id: string; full_name: string | null }) => [p.id, p.full_name]));
    const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const emailById = new Map(((list?.users ?? []) as { id: string; email?: string | null }[]).map((u) => [u.id, u.email ?? '']));

    const members: OrgMember[] = rows
      .map((m) => ({
        userId: m.user_id,
        name: nameById.get(m.user_id) ?? null,
        email: emailById.get(m.user_id) ?? '',
        role: m.role,
      }))
      .sort((a, b) => (ROLE_RANK[a.role] ?? 9) - (ROLE_RANK[b.role] ?? 9));

    const myRole = (rows.find((m) => m.user_id === userId)?.role as MemberRole | undefined) ?? null;

    return {
      org: org
        ? {
            id: (org as { id: string }).id,
            name: (org as { name: string }).name,
            type: (org as { type: string }).type,
            logoUrl: ((org as { logo_url: string | null }).logo_url) ?? null,
          }
        : null,
      members,
      pending: ((invites ?? []) as { id: string; email: string; role: MemberRole; created_at: string }[]).map((i) => ({
        id: i.id,
        email: i.email,
        role: i.role,
        createdAt: i.created_at,
      })),
      myRole,
    };
  } catch {
    return EMPTY;
  }
}

/** Create a pending invitation. Returns its token (for the accept link). */
export async function createInvitation(opts: {
  orgId: string;
  email: string;
  role: MemberRole;
  kind?: 'member' | 'client' | 'reseller';
  invitedBy: string;
}): Promise<{ token: string } | null> {
  const supabase = admin();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        org_id: opts.orgId,
        email: opts.email.trim().toLowerCase(),
        role: opts.role,
        kind: opts.kind ?? 'member',
        invited_by: opts.invitedBy,
      })
      .select('token')
      .single();
    if (error || !data) return null;
    return { token: data.token as string };
  } catch {
    return null;
  }
}

/** Returns the org where the user is owner/admin (for invite authorization). */
export async function getManageableOrg(
  userId: string
): Promise<{ orgId: string; role: MemberRole; orgName: string | null; orgType: string | null } | null> {
  const supabase = admin();
  if (!supabase) return null;
  try {
    const { data: rows } = await supabase
      .from('organization_members')
      .select('org_id, role, organizations(name, type)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .in('role', ['owner', 'admin']);
    if (!rows?.length) return null;
    // A user can hold owner/admin in several orgs (own org + accepted admin
    // invite); prefer the profile's home org so UI and mutations agree.
    let row = rows[0];
    if (rows.length > 1) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userId)
        .maybeSingle();
      const homeOrg = (prof?.organization_id as string | null) ?? null;
      row = rows.find((r) => (r.org_id as string) === homeOrg) ?? rows[0];
    }
    const org = (row as { organizations?: { name?: string; type?: string } | null }).organizations ?? null;
    return { orgId: row.org_id as string, role: row.role as MemberRole, orgName: org?.name ?? null, orgType: org?.type ?? null };
  } catch {
    return null;
  }
}

/** On sign-in, turn any pending member-invitations for this email into active
 * memberships. (client/reseller linking is handled in a later phase.) */
export async function acceptPendingInvitations(userId: string, email: string): Promise<void> {
  const supabase = admin();
  if (!supabase || !email) return;
  try {
    // Exact match only — invitations store emails lowercased, and an ilike
    // pattern would let '%'/'_' in an address match someone else's invitation.
    // Expired invitations (null = legacy rows without expiry) are never accepted.
    const { data: invites } = await supabase
      .from('invitations')
      .select('id, org_id, role, kind')
      .eq('status', 'pending')
      .eq('email', email.trim().toLowerCase())
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
    for (const inv of (invites ?? []) as { id: string; org_id: string; role: MemberRole; kind: string }[]) {
      if (inv.kind === 'member') {
        await supabase
          .from('organization_members')
          .upsert({ org_id: inv.org_id, user_id: userId, role: inv.role, status: 'active' }, { onConflict: 'org_id,user_id' });
      } else if (inv.kind === 'client' || inv.kind === 'reseller') {
        // Link the accepting user's own org up the chain: a client links to the
        // inviting reseller, a reseller to the inviting distributor.
        const { data: prof } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', userId)
          .maybeSingle();
        const myOrg = (prof?.organization_id as string | null) ?? null;
        if (myOrg) {
          const column = inv.kind === 'client' ? 'reseller_org_id' : 'distributor_org_id';
          await supabase.from('organizations').update({ [column]: inv.org_id }).eq('id', myOrg);
        }
      } else {
        continue;
      }
      await supabase.from('invitations').update({ status: 'accepted' }).eq('id', inv.id);
    }
  } catch {
    /* best-effort */
  }
}

const XRITE_ORG_NAME = 'X-Rite PANTONE';

/** X-Rite staff (@xrite.com) share one canonical distributor organization so
 * they see the same reseller network. New members join as 'member' — promote to
 * admin manually. Best-effort; called on sign-in. */
export async function ensureSharedXriteOrg(userId: string, email: string): Promise<void> {
  const supabase = admin();
  if (!supabase || !email.toLowerCase().endsWith('@xrite.com')) return;
  try {
    // Find (or create) the canonical X-Rite distributor org.
    const { data: existingRows } = await supabase
      .from('organizations')
      .select('id')
      .eq('type', 'distributor')
      .eq('name', XRITE_ORG_NAME)
      .limit(1);
    let orgId = (existingRows?.[0]?.id as string | null) ?? null;
    if (!orgId) {
      const { data: created } = await supabase
        .from('organizations')
        .insert({ name: XRITE_ORG_NAME, type: 'distributor' })
        .select('id')
        .single();
      orgId = (created?.id as string | null) ?? null;
    }
    if (!orgId) return;

    // Point the profile at the shared org and add a membership without
    // downgrading an existing, manually-set role.
    await supabase.from('profiles').update({ organization_id: orgId }).eq('id', userId);
    await supabase
      .from('organization_members')
      .upsert(
        { org_id: orgId, user_id: userId, role: 'member', status: 'active' },
        { onConflict: 'org_id,user_id', ignoreDuplicates: true }
      );
  } catch {
    /* best-effort */
  }
}

/** Ensure a user owns a personal organization so it surfaces in the back-office.
 * Creates one (named after their company, typed by their account_type) when they
 * belong to none, links the profile and adds them as owner. If they already own
 * their org, keeps its type aligned with their account_type. Never retypes a
 * shared org they're only a member of. Best-effort; returns the org id. */
export async function ensurePersonalOrg(userId: string): Promise<string | null> {
  const supabase = admin();
  if (!supabase) return null;
  try {
    const { data: prof } = await supabase
      .from('profiles')
      .select('organization_id, company, country, account_type, full_name')
      .eq('id', userId)
      .maybeSingle();
    if (!prof) return null;
    const at = prof.account_type as string;
    const type = at === 'reseller' || at === 'distributor' || at === 'team' ? at : 'client';
    const orgId = (prof.organization_id as string | null) ?? null;

    if (!orgId) {
      // Share one organization across colleagues who sign up with the same
      // company email domain; free webmail domains stay individual.
      const { data: userRes } = await supabase.auth.admin.getUserById(userId);
      const companyDomain = companyDomainFromEmail(userRes?.user?.email ?? '');

      const joinExisting = async (foundId: string): Promise<string> => {
        await supabase
          .from('organization_members')
          .upsert(
            { org_id: foundId, user_id: userId, role: 'member', status: 'active' },
            { onConflict: 'org_id,user_id', ignoreDuplicates: true }
          );
        await supabase.from('profiles').update({ organization_id: foundId }).eq('id', userId);
        return foundId;
      };

      if (companyDomain) {
        const { data: existing } = await supabase
          .from('organizations')
          .select('id')
          .eq('email_domain', companyDomain)
          .maybeSingle();
        if (existing?.id) return joinExisting(existing.id as string);
      }

      const name = (
        (prof.company as string | null)?.trim() ||
        (prof.full_name as string | null)?.trim() ||
        'Mon compte'
      ).slice(0, 200);
      const { data: created, error } = await supabase
        .from('organizations')
        .insert({ name, type, country: (prof.country as string | null) ?? null, email_domain: companyDomain })
        .select('id')
        .single();
      if (error || !created) {
        // Lost a race to a colleague who just created the org for this domain.
        if (companyDomain) {
          const { data: again } = await supabase
            .from('organizations')
            .select('id')
            .eq('email_domain', companyDomain)
            .maybeSingle();
          if (again?.id) return joinExisting(again.id as string);
        }
        return null;
      }
      const newId = created.id as string;
      await supabase
        .from('organization_members')
        .upsert(
          { org_id: newId, user_id: userId, role: 'owner', status: 'active' },
          { onConflict: 'org_id,user_id', ignoreDuplicates: true }
        );
      await supabase.from('profiles').update({ organization_id: newId }).eq('id', userId);
      return newId;
    }

    // Already linked — align the org type, but only if this user owns it.
    const { data: mem } = await supabase
      .from('organization_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .maybeSingle();
    if ((mem?.role as string | null) === 'owner') {
      await supabase.from('organizations').update({ type, updated_at: new Date().toISOString() }).eq('id', orgId);
    }
    return orgId;
  } catch {
    return null;
  }
}

export type ResellerClientOrg = {
  orgId: string;
  name: string;
  country: string | null;
  memberCount: number;
  // Installed base of the client org (client_systems): total systems and how
  // many have a pending update — the reseller's cue to plan an intervention.
  systems: number;
  updates: number;
};

/** Client orgs managed by this reseller (organizations.reseller_org_id = my org). */
export async function getResellerClients(userId: string): Promise<ResellerClientOrg[]> {
  const supabase = admin();
  if (!supabase) return [];
  try {
    const { data: prof } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .maybeSingle();
    const myOrg = (prof?.organization_id as string | null) ?? null;
    if (!myOrg) return [];
    const { data: clients } = await supabase
      .from('organizations')
      .select('id, name, country')
      .eq('reseller_org_id', myOrg);
    const list = (clients ?? []) as { id: string; name: string; country: string | null }[];
    const ids = list.map((c) => c.id);
    const counts = new Map<string, number>();
    let systemCounts = new Map<string, { systems: number; updates: number }>();
    if (ids.length) {
      const [{ data: mems }, sysCounts] = await Promise.all([
        supabase.from('organization_members').select('org_id').in('org_id', ids).eq('status', 'active'),
        countSystemsForOrgs(ids),
      ]);
      for (const m of (mems ?? []) as { org_id: string }[]) counts.set(m.org_id, (counts.get(m.org_id) ?? 0) + 1);
      systemCounts = sysCounts;
    }
    return list.map((c) => ({
      orgId: c.id,
      name: c.name,
      country: c.country,
      memberCount: counts.get(c.id) ?? 0,
      systems: systemCounts.get(c.id)?.systems ?? 0,
      updates: systemCounts.get(c.id)?.updates ?? 0,
    }));
  } catch {
    return [];
  }
}

/** Reseller orgs in this distributor's network (distributor_org_id = my org). */
export async function getDistributorResellers(userId: string): Promise<ResellerClientOrg[]> {
  const supabase = admin();
  if (!supabase) return [];
  try {
    const { data: prof } = await supabase.from('profiles').select('organization_id').eq('id', userId).maybeSingle();
    const myOrg = (prof?.organization_id as string | null) ?? null;
    if (!myOrg) return [];
    const { data: resellers } = await supabase
      .from('organizations')
      .select('id, name, country')
      .eq('distributor_org_id', myOrg);
    const list = (resellers ?? []) as { id: string; name: string; country: string | null }[];
    const counts = new Map<string, number>();
    if (list.length) {
      const { data: clients } = await supabase
        .from('organizations')
        .select('reseller_org_id')
        .in(
          'reseller_org_id',
          list.map((r) => r.id)
        );
      for (const c of (clients ?? []) as { reseller_org_id: string | null }[]) {
        if (c.reseller_org_id) counts.set(c.reseller_org_id, (counts.get(c.reseller_org_id) ?? 0) + 1);
      }
    }
    return list.map((r) => ({ orgId: r.id, name: r.name, country: r.country, memberCount: counts.get(r.id) ?? 0, systems: 0, updates: 0 }));
  } catch {
    return [];
  }
}

async function actorManages(
  supabase: NonNullable<ReturnType<typeof admin>>,
  actorUserId: string,
  orgId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', actorUserId)
    .eq('status', 'active')
    .maybeSingle();
  const role = (data?.role as MemberRole | undefined) ?? null;
  return role === 'owner' || role === 'admin';
}

/** Change a member's role (owner/admin only; never the owner or yourself). */
export async function updateMemberRole(
  actorUserId: string,
  orgId: string,
  memberUserId: string,
  role: 'admin' | 'member'
): Promise<boolean> {
  const supabase = admin();
  if (!supabase || memberUserId === actorUserId) return false;
  try {
    if (!(await actorManages(supabase, actorUserId, orgId))) return false;
    const { data: target } = await supabase
      .from('organization_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', memberUserId)
      .maybeSingle();
    if (!target || target.role === 'owner') return false;
    const { error } = await supabase
      .from('organization_members')
      .update({ role })
      .eq('org_id', orgId)
      .eq('user_id', memberUserId);
    return !error;
  } catch {
    return false;
  }
}

/** Remove a member (owner/admin only; never the owner or yourself). */
export async function removeMember(actorUserId: string, orgId: string, memberUserId: string): Promise<boolean> {
  const supabase = admin();
  if (!supabase || memberUserId === actorUserId) return false;
  try {
    if (!(await actorManages(supabase, actorUserId, orgId))) return false;
    const { data: target } = await supabase
      .from('organization_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', memberUserId)
      .maybeSingle();
    if (!target || target.role === 'owner') return false;
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('org_id', orgId)
      .eq('user_id', memberUserId);
    return !error;
  } catch {
    return false;
  }
}

/** Revoke a pending invitation (owner/admin of its org only). */
export async function revokeInvitation(actorUserId: string, invitationId: string): Promise<boolean> {
  const supabase = admin();
  if (!supabase) return false;
  try {
    const { data: inv } = await supabase
      .from('invitations')
      .select('org_id, status')
      .eq('id', invitationId)
      .maybeSingle();
    if (!inv || inv.status !== 'pending') return false;
    if (!(await actorManages(supabase, actorUserId, inv.org_id as string))) return false;
    const { error } = await supabase.from('invitations').update({ status: 'revoked' }).eq('id', invitationId);
    return !error;
  } catch {
    return false;
  }
}

export type AdminOrg = {
  id: string;
  name: string;
  resellerOrgId: string | null;
  resellerName: string | null;
};

/** Client orgs + the reseller-org options, for the admin attribution view. */
export async function getOrgsForAdmin(): Promise<{ clients: AdminOrg[]; resellers: { id: string; name: string }[] }> {
  const supabase = admin();
  if (!supabase) return { clients: [], resellers: [] };
  try {
    const { data: orgs } = await supabase.from('organizations').select('id, name, type, reseller_org_id');
    const all = (orgs ?? []) as { id: string; name: string; type: string; reseller_org_id: string | null }[];
    const nameById = new Map(all.map((o) => [o.id, o.name]));
    const resellers = all.filter((o) => o.type === 'reseller').map((o) => ({ id: o.id, name: o.name }));
    const clients = all
      .filter((o) => o.type === 'client')
      .map((o) => ({
        id: o.id,
        name: o.name,
        resellerOrgId: o.reseller_org_id,
        resellerName: o.reseller_org_id ? nameById.get(o.reseller_org_id) ?? null : null,
      }));
    return { clients, resellers };
  } catch {
    return { clients: [], resellers: [] };
  }
}

/** Admin: set (or clear) a client org's managing reseller. */
export async function setClientReseller(clientOrgId: string, resellerOrgId: string | null): Promise<boolean> {
  const supabase = admin();
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('organizations')
      .update({ reseller_org_id: resellerOrgId })
      .eq('id', clientOrgId);
    return !error;
  } catch {
    return false;
  }
}

export type AdminOrgFull = {
  id: string;
  name: string;
  type: string;
  country: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  logoUrl: string | null;
  resellerOrgId: string | null;
  resellerName: string | null;
  distributorOrgId: string | null;
  distributorName: string | null;
  memberCount: number;
};

/** Every org with full detail + active-member counts, for the org back-office. */
export async function listOrgsForAdmin(): Promise<AdminOrgFull[]> {
  const supabase = admin();
  if (!supabase) return [];
  try {
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id, name, type, country, address, postal_code, city, logo_url, reseller_org_id, distributor_org_id')
      .order('name');
    const all = (orgs ?? []) as {
      id: string;
      name: string;
      type: string;
      country: string | null;
      address: string | null;
      postal_code: string | null;
      city: string | null;
      logo_url: string | null;
      reseller_org_id: string | null;
      distributor_org_id: string | null;
    }[];
    const nameById = new Map(all.map((o) => [o.id, o.name]));
    const counts = new Map<string, number>();
    const ids = all.map((o) => o.id);
    if (ids.length) {
      const { data: mems } = await supabase
        .from('organization_members')
        .select('org_id')
        .in('org_id', ids)
        .eq('status', 'active');
      for (const m of (mems ?? []) as { org_id: string }[]) counts.set(m.org_id, (counts.get(m.org_id) ?? 0) + 1);
    }
    return all.map((o) => ({
      id: o.id,
      name: o.name,
      type: o.type,
      country: o.country,
      address: o.address,
      postalCode: o.postal_code,
      city: o.city,
      logoUrl: o.logo_url,
      resellerOrgId: o.reseller_org_id,
      resellerName: o.reseller_org_id ? nameById.get(o.reseller_org_id) ?? null : null,
      distributorOrgId: o.distributor_org_id,
      distributorName: o.distributor_org_id ? nameById.get(o.distributor_org_id) ?? null : null,
      memberCount: counts.get(o.id) ?? 0,
    }));
  } catch {
    return [];
  }
}

export type OrgInput = {
  name: string;
  type?: string;
  country?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  resellerOrgId?: string | null;
  distributorOrgId?: string | null;
};

/** Admin: create an organization. Returns its id (or null on failure). */
export async function createOrg(input: OrgInput): Promise<{ id: string } | null> {
  const supabase = admin();
  if (!supabase) return null;
  const name = input.name.trim();
  if (!name) return null;
  try {
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name: name.slice(0, 200),
        type: input.type ?? 'client',
        country: input.country ?? null,
        address: input.address ?? null,
        postal_code: input.postalCode ?? null,
        city: input.city ?? null,
        reseller_org_id: input.resellerOrgId ?? null,
        distributor_org_id: input.distributorOrgId ?? null,
      })
      .select('id')
      .single();
    if (error || !data) return null;
    return { id: data.id as string };
  } catch {
    return null;
  }
}

type OrgPatch = Partial<{
  name: string;
  type: string;
  country: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  logo_url: string | null;
  reseller_org_id: string | null;
  distributor_org_id: string | null;
}>;

/** Admin: update an organization's editable fields. */
export async function updateOrg(id: string, patch: OrgPatch): Promise<boolean> {
  const supabase = admin();
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('organizations')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/** Admin: any org's active members + pending invites (no membership needed). */
export async function getOrgMembersForAdmin(
  orgId: string
): Promise<{ members: OrgMember[]; pending: PendingInvite[] }> {
  const supabase = admin();
  if (!supabase || !orgId) return { members: [], pending: [] };
  try {
    const [{ data: memberRows }, { data: invites }] = await Promise.all([
      supabase.from('organization_members').select('user_id, role').eq('org_id', orgId).eq('status', 'active'),
      supabase.from('invitations').select('id, email, role, created_at').eq('org_id', orgId).eq('status', 'pending'),
    ]);
    const rows = (memberRows ?? []) as { user_id: string; role: MemberRole }[];
    const ids = rows.map((m) => m.user_id).filter(Boolean);
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);
    const nameById = new Map((profs ?? []).map((p: { id: string; full_name: string | null }) => [p.id, p.full_name]));
    const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const emailById = new Map(
      ((list?.users ?? []) as { id: string; email?: string | null }[]).map((u) => [u.id, u.email ?? ''])
    );
    const members: OrgMember[] = rows
      .map((m) => ({
        userId: m.user_id,
        name: nameById.get(m.user_id) ?? null,
        email: emailById.get(m.user_id) ?? '',
        role: m.role,
      }))
      .sort((a, b) => (ROLE_RANK[a.role] ?? 9) - (ROLE_RANK[b.role] ?? 9));
    const pending: PendingInvite[] = (
      (invites ?? []) as { id: string; email: string; role: MemberRole; created_at: string }[]
    ).map((i) => ({ id: i.id, email: i.email, role: i.role, createdAt: i.created_at }));
    return { members, pending };
  } catch {
    return { members: [], pending: [] };
  }
}

/** Admin: set any member's role. Won't leave an org with zero owners. */
export async function adminUpdateMemberRole(
  orgId: string,
  memberUserId: string,
  role: MemberRole
): Promise<boolean> {
  const supabase = admin();
  if (!supabase) return false;
  try {
    const { data: rows } = await supabase
      .from('organization_members')
      .select('user_id, role')
      .eq('org_id', orgId)
      .eq('status', 'active');
    const members = (rows ?? []) as { user_id: string; role: MemberRole }[];
    const target = members.find((m) => m.user_id === memberUserId);
    if (!target) return false;
    if (target.role === 'owner' && role !== 'owner' && members.filter((m) => m.role === 'owner').length <= 1) {
      return false; // don't orphan the org
    }
    const { error } = await supabase
      .from('organization_members')
      .update({ role })
      .eq('org_id', orgId)
      .eq('user_id', memberUserId);
    return !error;
  } catch {
    return false;
  }
}

/** Admin: remove any member. Won't remove an org's last owner. */
export async function adminRemoveMember(orgId: string, memberUserId: string): Promise<boolean> {
  const supabase = admin();
  if (!supabase) return false;
  try {
    const { data: rows } = await supabase
      .from('organization_members')
      .select('user_id, role')
      .eq('org_id', orgId)
      .eq('status', 'active');
    const members = (rows ?? []) as { user_id: string; role: MemberRole }[];
    const target = members.find((m) => m.user_id === memberUserId);
    if (!target) return false;
    if (target.role === 'owner' && members.filter((m) => m.role === 'owner').length <= 1) return false;
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('org_id', orgId)
      .eq('user_id', memberUserId);
    return !error;
  } catch {
    return false;
  }
}

/** Admin: revoke a pending invitation in any org. */
export async function adminRevokeInvitation(invitationId: string): Promise<boolean> {
  const supabase = admin();
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('invitations')
      .update({ status: 'revoked' })
      .eq('id', invitationId)
      .eq('status', 'pending');
    return !error;
  } catch {
    return false;
  }
}
