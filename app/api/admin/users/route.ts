import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { isAccountType } from '@/data/account-types';
import {
  isJobTitleKey,
  isKnownCountry,
  isTeamRoleKey,
  isValidPartnerRoles,
  partnerRoleKeysFor,
} from '@/data/onboarding-options';
import { ensurePersonalOrg } from '@/lib/organizations';
import { recordAudit } from '@/lib/admin-audit';
import { isSuperAdminEmail } from '@/lib/admin-access';

export const dynamic = 'force-dynamic';

const ACCOUNT_TYPE_FR: Record<string, string> = {
  client: 'client',
  reseller: 'revendeur',
  distributor: 'distributeur',
  team: 'équipe',
};

// Verify the caller is a signed-in admin with 2FA this session. RLS lets a user
// self-read is_admin; the AAL2 check matches the /admin access policy.
async function requireAdmin() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, error: 'unauthorized', status: 401 } as const;
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!data?.is_admin) return { user: null, error: 'forbidden', status: 403 } as const;
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== 'aal2') return { user: null, error: 'mfa_required', status: 403 } as const;
  return { user, error: null, status: 200 } as const;
}

/** Update a user's profile fields, account type, organization or admin flag —
 * or, with `action: 'qualify'`, qualify an account (brief § 2.3.a). Fields
 * absent from the body are NEVER touched: an unknown legacy value survives
 * every save unless the admin explicitly replaces it. */
export async function PATCH(request: NextRequest) {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }

  const id = typeof body.id === 'string' ? body.id : '';
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });

  const admin = createSupabaseAdminClient();

  // Qualification action: fixes the type AND stamps account_type_source =
  // 'admin' — a confirmed source the CRM derivation never downgrades.
  // account_type_source is service-role-only (not in the authenticated grant),
  // hence written here and only here. 'team' is domain-derived, never a
  // qualification outcome.
  if (body.action === 'qualify') {
    const t = typeof body.account_type === 'string' ? body.account_type : '';
    if (t !== 'client' && t !== 'reseller' && t !== 'distributor') {
      return NextResponse.json({ error: 'bad_account_type' }, { status: 400 });
    }
    const { error } = await admin
      .from('profiles')
      .update({ account_type: t, account_type_source: 'admin', updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await ensurePersonalOrg(id);
    await recordAudit({
      actorId: gate.user.id,
      actorEmail: gate.user.email ?? null,
      action: 'user.qualify',
      targetType: 'user',
      targetId: id,
      summary: `Compte qualifié : ${ACCOUNT_TYPE_FR[t] ?? t}`,
    });
    return NextResponse.json({ ok: true });
  }

  // Role fields are validated against the account type the row ends up with:
  // the type sent in this request, or the stored one otherwise. The stored type
  // is also what tells a real type CHANGE (→ stamp source 'admin') apart from
  // the drawer re-sending the current type on every save.
  const touchesType =
    typeof body.account_type === 'string' || typeof body.job_title === 'string' || body.job_roles !== undefined;
  let storedType: string | null = null;
  if (touchesType) {
    const { data: prof } = await admin.from('profiles').select('account_type').eq('id', id).maybeSingle();
    storedType = ((prof as { account_type: string | null } | null)?.account_type as string | null) ?? 'client';
  }
  const effectiveType =
    typeof body.account_type === 'string' && isAccountType(body.account_type) ? body.account_type : storedType;

  const patch: Record<string, unknown> = {};

  if (typeof body.full_name === 'string') patch.full_name = body.full_name.trim().slice(0, 200) || null;
  if (typeof body.company === 'string') patch.company = body.company.trim().slice(0, 200) || null;

  if (typeof body.country === 'string') {
    const c = body.country.trim();
    if (c && !isKnownCountry(c)) return NextResponse.json({ error: 'bad_country' }, { status: 400 });
    patch.country = c || null;
  }
  if (typeof body.job_title === 'string') {
    const j = body.job_title.trim();
    if (j) {
      // team → internal role keys, client → printer job titles. Partner types
      // use the multi-valued job_roles instead — a job_title write for them is
      // a client bug, not something to store.
      const valid =
        effectiveType === 'team'
          ? isTeamRoleKey(j)
          : partnerRoleKeysFor(effectiveType ?? 'client')
            ? false
            : isJobTitleKey(j);
      if (!valid) return NextResponse.json({ error: 'bad_job_title' }, { status: 400 });
    }
    patch.job_title = j || null;
  }
  if (body.job_roles !== undefined) {
    if (body.job_roles === null || (Array.isArray(body.job_roles) && body.job_roles.length === 0)) {
      patch.job_roles = null; // explicit clear
    } else if (isValidPartnerRoles(effectiveType ?? '', body.job_roles)) {
      patch.job_roles = body.job_roles;
    } else {
      return NextResponse.json({ error: 'bad_job_roles' }, { status: 400 });
    }
  }
  if (typeof body.account_type === 'string') {
    if (!isAccountType(body.account_type)) return NextResponse.json({ error: 'bad_account_type' }, { status: 400 });
    patch.account_type = body.account_type;
    // An explicit type CHANGE by an admin is a qualification decision: stamp
    // the source so the account leaves the « à qualifier » queue and a CRM
    // outage can never downgrade it again. Re-saving the unchanged type keeps
    // the stored source ('crm', 'unqualified'…) intact.
    if (body.account_type !== storedType) patch.account_type_source = 'admin';
  }
  if (typeof body.is_admin === 'boolean') {
    // Only the super-admin may grant/revoke the admin flag (« seul le vrai
    // admin nomme un administrateur »).
    if (!isSuperAdminEmail(gate.user.email)) {
      return NextResponse.json({ error: 'forbidden_admin_grant' }, { status: 403 });
    }
    // Lockout guard: an admin can't strip their own admin rights.
    if (body.is_admin === false && id === gate.user.id) {
      return NextResponse.json({ error: 'cannot_self_demote' }, { status: 400 });
    }
    // Admin is reserved to Rutherford team accounts.
    if (body.is_admin === true) {
      let targetType = effectiveType;
      if (!targetType) {
        const { data: tp } = await admin.from('profiles').select('account_type').eq('id', id).maybeSingle();
        targetType = ((tp as { account_type: string | null } | null)?.account_type as string | null) ?? 'client';
      }
      if (targetType !== 'team') {
        return NextResponse.json({ error: 'admin_requires_team' }, { status: 400 });
      }
    }
    patch.is_admin = body.is_admin;
  }
  // Organisation — l'org est la source de vérité pour « la société » (brief
  // § 3.2.1) : uuid d'une org existante, ou null pour détacher le profil (les
  // adhésions organization_members restent intactes dans ce cas).
  if (body.organization_id !== undefined) {
    if (body.organization_id === null) {
      patch.organization_id = null;
    } else if (typeof body.organization_id === 'string' && body.organization_id) {
      const { data: org } = await admin
        .from('organizations')
        .select('id')
        .eq('id', body.organization_id)
        .maybeSingle();
      if (!org) return NextResponse.json({ error: 'bad_organization' }, { status: 400 });
      patch.organization_id = body.organization_id;
    } else {
      return NextResponse.json({ error: 'bad_organization' }, { status: 400 });
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });
  }
  patch.updated_at = new Date().toISOString();

  const { error } = await admin.from('profiles').update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit — one entry per save, with a French summary of the salient change and
  // the changed field names in metadata. is_admin toggles and type changes are
  // called out explicitly (the most sensitive edits).
  const changed = Object.keys(patch).filter((k) => k !== 'updated_at');
  const bits: string[] = [];
  if ('account_type' in patch) bits.push(`type → ${ACCOUNT_TYPE_FR[patch.account_type as string] ?? patch.account_type}`);
  if ('is_admin' in patch) bits.push(patch.is_admin ? 'administrateur activé' : 'administrateur retiré');
  if ('organization_id' in patch) bits.push(patch.organization_id ? 'organisation rattachée' : 'organisation détachée');
  const otherFields = changed.filter((k) => !['account_type', 'account_type_source', 'is_admin', 'organization_id'].includes(k));
  if (otherFields.length) bits.push(`champs : ${otherFields.join(', ')}`);
  await recordAudit({
    actorId: gate.user.id,
    actorEmail: gate.user.email ?? null,
    action: 'is_admin' in patch ? 'user.set_admin' : 'user.update',
    targetType: 'user',
    targetId: id,
    summary: bits.join(' · ') || 'Modification du compte',
    metadata: { fields: changed },
  });

  // Rattachement à une org : garantir une adhésion active sans JAMAIS
  // rétrograder un rôle owner/admin existant (même motif que
  // ensureSharedXriteOrg) — on n'insère 'member' que si la ligne est absente,
  // et on ne touche qu'au statut si elle existe inactive.
  if (typeof patch.organization_id === 'string') {
    const orgId = patch.organization_id;
    const { data: mem } = await admin
      .from('organization_members')
      .select('status')
      .eq('org_id', orgId)
      .eq('user_id', id)
      .maybeSingle();
    if (!mem) {
      await admin
        .from('organization_members')
        .upsert(
          { org_id: orgId, user_id: id, role: 'member', status: 'active' },
          { onConflict: 'org_id,user_id', ignoreDuplicates: true }
        );
    } else if ((mem as { status?: string }).status !== 'active') {
      await admin.from('organization_members').update({ status: 'active' }).eq('org_id', orgId).eq('user_id', id);
    }
  }

  // Reflect a type change in the back-office org list: ensure the user has an
  // organization and align its type when they own it — sauf si la requête vient
  // de fixer explicitement l'organisation (y compris à null) : la décision de
  // l'admin est autoritaire et ensurePersonalOrg ne doit pas la ré-écraser en
  // recréant ou rattachant une org personnelle.
  if (typeof patch.account_type === 'string' && !('organization_id' in patch)) await ensurePersonalOrg(id);

  return NextResponse.json({ ok: true });
}

/** Delete a user. Cascades to academy data; console_validations are kept
 * (user_id is set null), so request history survives. */
export async function DELETE(request: NextRequest) {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });
  if (id === gate.user.id) return NextResponse.json({ error: 'cannot_delete_self' }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await recordAudit({
    actorId: gate.user.id,
    actorEmail: gate.user.email ?? null,
    action: 'user.delete',
    targetType: 'user',
    targetId: id,
    summary: 'Compte supprimé',
  });
  return NextResponse.json({ ok: true });
}

/** Suspend (ban) or reactivate a user's ability to sign in. Reversible — a
 * suspended user keeps all their data and can be reactivated at any time. */
export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }

  const id = typeof body.id === 'string' ? body.id : '';
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });
  if (id === gate.user.id) return NextResponse.json({ error: 'cannot_suspend_self' }, { status: 400 });

  const suspend = body.suspend === true;
  const admin = createSupabaseAdminClient();
  // 'none' clears the ban; a long duration suspends sign-in indefinitely.
  const { error } = await admin.auth.admin.updateUserById(id, {
    ban_duration: suspend ? '876000h' : 'none',
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await recordAudit({
    actorId: gate.user.id,
    actorEmail: gate.user.email ?? null,
    action: 'user.suspend',
    targetType: 'user',
    targetId: id,
    summary: suspend ? 'Compte suspendu' : 'Compte réactivé',
  });
  return NextResponse.json({ ok: true });
}
