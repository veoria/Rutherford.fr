import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { isJobTitleKey, isKnownCountry } from '@/data/onboarding-options';
import { deriveAccountType } from '@/lib/account-type';
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

  const { data: existing } = await supabase
    .from('profiles')
    .select('full_name, onboarded_at')
    .eq('id', user.id)
    .maybeSingle();

  const fullName = fullNameIn || ((existing?.full_name as string | null) ?? '');

  if (
    !country ||
    !company ||
    !jobTitle ||
    !fullName ||
    !isKnownCountry(country) ||
    !isJobTitleKey(jobTitle) ||
    company.length > 200 ||
    fullName.length > 200
  ) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }
  if (notif && (!EMAIL_RE.test(notif) || notif.length > 200)) {
    return NextResponse.json({ error: 'Invalid notification email' }, { status: 400 });
  }

  const accountType = await deriveAccountType(user.email ?? '');
  const firstOnboarding = !existing?.onboarded_at;

  const base = {
    full_name: fullName.slice(0, 200),
    country,
    company,
    job_title: jobTitle,
    notification_email: notif || null,
    onboarded_at: existing?.onboarded_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // account_type isn't in the authenticated UPDATE grant (see 20260606 / 20260613),
  // so only the service-role client can set it. Fall back to a user-session write
  // (without account_type) when the admin key isn't configured.
  const admin = HAS_ADMIN ? createSupabaseAdminClient() : null;
  const writer = admin ?? supabase;
  const update = admin ? { ...base, account_type: accountType } : base;

  const { error } = await writer.from('profiles').update(update).eq('id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (firstOnboarding) {
    await syncLeadToPipedrive({
      email: user.email ?? '',
      name: fullName || null,
      company,
      country,
      jobTitle,
    });
  }

  return NextResponse.json({ ok: true, account_type: accountType });
}
