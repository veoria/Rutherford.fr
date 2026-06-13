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
  org: { id: string; name: string; type: string } | null;
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
      supabase.from('organizations').select('id, name, type').eq('id', orgId).maybeSingle(),
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
      org: (org as Team['org']) ?? null,
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
): Promise<{ orgId: string; role: MemberRole; orgName: string | null } | null> {
  const supabase = admin();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from('organization_members')
      .select('org_id, role, organizations(name)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .in('role', ['owner', 'admin'])
      .maybeSingle();
    if (!data) return null;
    const orgName = ((data as { organizations?: { name?: string } | null }).organizations?.name) ?? null;
    return { orgId: data.org_id as string, role: data.role as MemberRole, orgName };
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
      if (inv.kind !== 'member') continue;
      await supabase
        .from('organization_members')
        .upsert({ org_id: inv.org_id, user_id: userId, role: inv.role, status: 'active' }, { onConflict: 'org_id,user_id' });
      await supabase.from('invitations').update({ status: 'accepted' }).eq('id', inv.id);
    }
  } catch {
    /* best-effort */
  }
}
