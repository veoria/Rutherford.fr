// Organizations & team membership — SERVER-ONLY.
//
// Reads and writes use the service-role client; the API layer verifies the
// caller is an owner/admin of the org before mutating. Dormant-safe: returns
// empty/no-op when Supabase isn't configured.

import { createSupabaseAdminClient } from '@/lib/supabase/server';

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
    const { data } = await supabase
      .from('organization_members')
      .select('org_id, role, organizations(name, type)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .in('role', ['owner', 'admin'])
      .maybeSingle();
    if (!data) return null;
    const org = (data as { organizations?: { name?: string; type?: string } | null }).organizations ?? null;
    return { orgId: data.org_id as string, role: data.role as MemberRole, orgName: org?.name ?? null, orgType: org?.type ?? null };
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
    const { data: invites } = await supabase
      .from('invitations')
      .select('id, org_id, role, kind')
      .eq('status', 'pending')
      .ilike('email', email);
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

export type ResellerClientOrg = {
  orgId: string;
  name: string;
  country: string | null;
  memberCount: number;
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
    if (ids.length) {
      const { data: mems } = await supabase
        .from('organization_members')
        .select('org_id')
        .in('org_id', ids)
        .eq('status', 'active');
      for (const m of (mems ?? []) as { org_id: string }[]) counts.set(m.org_id, (counts.get(m.org_id) ?? 0) + 1);
    }
    return list.map((c) => ({ orgId: c.id, name: c.name, country: c.country, memberCount: counts.get(c.id) ?? 0 }));
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
    return list.map((r) => ({ orgId: r.id, name: r.name, country: r.country, memberCount: counts.get(r.id) ?? 0 }));
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
