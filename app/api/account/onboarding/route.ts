import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { isJobTitleKey, isKnownCountry, isTeamRoleKey, isValidPartnerRoles } from '@/data/onboarding-options';
import { teamOrgFromEmail } from '@/lib/account-type';
import { deriveAccountTypeWithSource, isConfirmedSource, type AccountTypeSource } from '@/lib/account-classification';
import type { AccountType } from '@/data/account-types';
import { syncLeadToPipedrive } from '@/lib/pipedrive';
import { ensurePersonalOrg } from '@/lib/organizations';

export const dynamic = 'force-dynamic';

const HAS_ADMIN = Boolean(
  process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL
);

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const payload = (body ?? {}) as Record<string, unknown>;
  const country = typeof payload.country === 'string' ? payload.country.trim() : '';
  const company = typeof payload.company === 'string' ? payload.company.trim() : '';
  const jobTitle = typeof payload.job_title === 'string' ? payload.job_title.trim() : '';
  const fullName = typeof payload.full_name === 'string' ? payload.full_name.trim() : '';
  const marketingConsent = payload.marketing_consent === true;

  // Classification with provenance (brief § 2.3.a). Domain answers instantly
  // for team / distributor; partner_domains then the CRM decide the rest.
  const derived = await deriveAccountTypeWithSource(user.email ?? '');

  // Internal team (rutherford.fr / veoria.fr / studiodelaroche.fr): company and
  // country are known from the domain — we only take the name + internal role,
  // and never push to the CRM.
  if (derived.type === 'team') {
    const org = teamOrgFromEmail(user.email ?? '');
    const teamRole = typeof payload.team_role === 'string' ? payload.team_role.trim() : '';
    if (!org || !isTeamRoleKey(teamRole)) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }
    const update: Record<string, unknown> = {
      country: org.country,
      company: org.company,
      job_title: teamRole,
      onboarded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (fullName) update.full_name = fullName.slice(0, 200);
    // account_type / account_type_source are service-role-only columns; stamp
    // them alongside the profile fields when the admin key is configured.
    const admin = HAS_ADMIN ? createSupabaseAdminClient() : null;
    const writer = admin ?? supabase;
    if (admin) {
      update.account_type = 'team';
      update.account_type_source = 'domain';
    }
    const { error } = await writer.from('profiles').update(update).eq('id', user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (!country || !company || !isKnownCountry(country) || company.length > 200) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  // Existing row: onboarded_at drives the one-shot CRM push; the stored
  // classification + source decide whether an 'unqualified' derivation may
  // overwrite (a confirmed type is never downgraded by a CRM miss).
  const { data: existing } = await supabase
    .from('profiles')
    .select('onboarded_at, full_name, account_type, account_type_source')
    .eq('id', user.id)
    .maybeSingle();
  const firstOnboarding = !existing?.onboarded_at;

  let accountType: AccountType;
  let stamp: { account_type: AccountType; account_type_source: AccountTypeSource } | null;
  if (derived.source !== 'unqualified') {
    accountType = derived.type;
    stamp = { account_type: derived.type, account_type_source: derived.source };
  } else if (isConfirmedSource(existing?.account_type_source as string | null | undefined)) {
    accountType = (existing?.account_type as AccountType | null) ?? 'client';
    stamp = null;
  } else {
    accountType = 'client';
    stamp = { account_type: 'client', account_type_source: 'unqualified' };
  }

  // Role referential per resolved type: partners submit the multi-valued
  // job_roles, clients the single printing job_title. On a client/unqualified
  // account, submitted job_roles (reseller referential) are the "declared
  // partner" signal for the admin "à qualifier" queue (brief § 2.3.a).
  const jobRolesIn = payload.job_roles;
  const isPartner = accountType === 'reseller' || accountType === 'distributor';
  let roleFields: { job_title: string | null; job_roles?: string[] };
  if (isPartner) {
    if (
      !Array.isArray(jobRolesIn) ||
      jobRolesIn.length > 10 ||
      !isValidPartnerRoles(accountType, jobRolesIn)
    ) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }
    roleFields = { job_title: null, job_roles: jobRolesIn };
  } else if (Array.isArray(jobRolesIn) && jobRolesIn.length > 0) {
    if (jobRolesIn.length > 10 || !isValidPartnerRoles('reseller', jobRolesIn)) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }
    roleFields = { job_title: null, job_roles: jobRolesIn };
  } else {
    if (!jobTitle || !isJobTitleKey(jobTitle)) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }
    roleFields = { job_title: jobTitle }; // job_roles left untouched
  }

  const update: Record<string, unknown> = {
    country,
    company,
    ...roleFields,
    marketing_consent: marketingConsent,
    marketing_consent_at: marketingConsent ? new Date().toISOString() : null,
    onboarded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (fullName) update.full_name = fullName.slice(0, 200);

  // account_type / account_type_source aren't in the authenticated UPDATE grant
  // (20260613 / 20260718): only the service-role client can stamp them. Without
  // the admin key the profile fields still save, classification unchanged.
  const admin = HAS_ADMIN ? createSupabaseAdminClient() : null;
  const writer = admin ?? supabase;
  const { error } = await writer
    .from('profiles')
    .update(admin && stamp ? { ...update, ...stamp } : update)
    .eq('id', user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Every standalone account gets an organization so it surfaces in the
  // back-office (Organisations) and can carry a logo, address and reseller
  // links. Idempotent — a no-op once the user already belongs to an org.
  await ensurePersonalOrg(user.id);

  // Lead capture → CRM, only with explicit marketing consent (GDPR). No-op
  // until PipeDrive is configured; never throws.
  if (firstOnboarding && marketingConsent) {
    await syncLeadToPipedrive({
      email: user.email ?? '',
      name: fullName || (existing?.full_name as string) || null,
      company,
      country,
      jobTitle: roleFields.job_title ?? (roleFields.job_roles ?? []).join(', '),
    });
  }

  return NextResponse.json({ ok: true });
}
