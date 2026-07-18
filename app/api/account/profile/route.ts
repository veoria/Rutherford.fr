import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { isJobTitleKey, isKnownCountry, isTeamRoleKey, isValidPartnerRoles } from '@/data/onboarding-options';
import { teamOrgFromEmail } from '@/lib/account-type';
import { deriveAccountTypeWithSource, isConfirmedSource, type AccountTypeSource } from '@/lib/account-classification';
import type { AccountType } from '@/data/account-types';
import { syncLeadToPipedrive } from '@/lib/pipedrive';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HAS_ADMIN = Boolean(
  process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL
);

/**
 * Create/update the signed-in user's profile (also serves the onboarding step).
 * Editable: name, country, company, role, notification email. account_type is
 * DERIVED here server-side — never accepted from the client.
 */
export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const p = (body ?? {}) as Record<string, unknown>;
  const country = typeof p.country === 'string' ? p.country.trim() : '';
  const company = typeof p.company === 'string' ? p.company.trim() : '';
  const jobTitle = typeof p.job_title === 'string' ? p.job_title.trim() : '';
  const fullNameIn = typeof p.full_name === 'string' ? p.full_name.trim() : '';
  const notif = typeof p.notification_email === 'string' ? p.notification_email.trim() : '';
  const marketingConsent = p.marketing_consent === true;

  const { data: existing } = await supabase
    .from('profiles')
    .select('full_name, onboarded_at, account_type, account_type_source')
    .eq('id', user.id)
    .maybeSingle();

  const fullName = fullNameIn || ((existing?.full_name as string | null) ?? '');

  // Internal team: company + country are fixed by the email domain and the role
  // uses the internal taxonomy. We ignore any client-sent company/country and
  // never touch the CRM.
  const teamOrg = teamOrgFromEmail(user.email ?? '');
  if (teamOrg) {
    if (!fullName || fullName.length > 200 || !isTeamRoleKey(jobTitle)) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }
    if (notif && (!EMAIL_RE.test(notif) || notif.length > 200)) {
      return NextResponse.json({ error: 'Invalid notification email' }, { status: 400 });
    }
    const base = {
      full_name: fullName.slice(0, 200),
      country: teamOrg.country,
      company: teamOrg.company,
      job_title: jobTitle,
      notification_email: notif || null,
      onboarded_at: existing?.onboarded_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const admin = HAS_ADMIN ? createSupabaseAdminClient() : null;
    const writer = admin ?? supabase;
    const update = admin
      ? { ...base, account_type: 'team' as const, account_type_source: 'domain' as const }
      : base;
    const { error } = await writer.from('profiles').update(update).eq('id', user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, account_type: 'team' });
  }

  if (
    !country ||
    !company ||
    !fullName ||
    !isKnownCountry(country) ||
    company.length > 200 ||
    fullName.length > 200
  ) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }
  if (notif && (!EMAIL_RE.test(notif) || notif.length > 200)) {
    return NextResponse.json({ error: 'Invalid notification email' }, { status: 400 });
  }

  // Classification with provenance (brief § 2.3.a): a confirmed derivation is
  // stamped; an 'unqualified' result never overwrites a confirmed stored type
  // (no silent downgrade on a CRM outage) — it only stamps client + 'unqualified'
  // when the stored source isn't confirmed either.
  const derived = await deriveAccountTypeWithSource(user.email ?? '');
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

  // Role referential per resolved type. Partners (reseller / distributor) use
  // the multi-valued job_roles; clients keep the single printing job_title. A
  // partner whose profile still carries a legacy printer job_title and submits
  // job_roles goes through here too — that IS the requalification path.
  const jobRolesIn = p.job_roles;
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
    // Declared partner on a client/unqualified account (brief § 2.3.a): the
    // user says they're a reseller/distributor. Store the reseller-referential
    // roles — a client-typed account WITH job_roles is the signal for the
    // admin "à qualifier" queue. The declaration alone never sets the type.
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

  const firstOnboarding = !existing?.onboarded_at;

  const base = {
    full_name: fullName.slice(0, 200),
    country,
    company,
    ...roleFields,
    notification_email: notif || null,
    onboarded_at: existing?.onboarded_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // account_type / account_type_source aren't in the authenticated UPDATE grant
  // (see 20260606 / 20260613 / 20260718), so only the service-role client can
  // set them. Fall back to a user-session write (without the classification)
  // when the admin key isn't configured.
  const admin = HAS_ADMIN ? createSupabaseAdminClient() : null;
  const writer = admin ?? supabase;
  const update = admin && stamp ? { ...base, ...stamp } : base;

  const { error } = await writer.from('profiles').update(update).eq('id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Lead → CRM only with explicit marketing consent (GDPR).
  if (firstOnboarding && marketingConsent) {
    await syncLeadToPipedrive({
      email: user.email ?? '',
      name: fullName || null,
      company,
      country,
      jobTitle: roleFields.job_title ?? (roleFields.job_roles ?? []).join(', '),
    });
  }

  return NextResponse.json({ ok: true, account_type: accountType });
}
