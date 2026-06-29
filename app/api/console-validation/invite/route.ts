import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';
import { sendMail } from '@/lib/msgraph';
import { consoleInviteEmail } from '@/lib/console-validation-emails';
import { createCvInvitation } from '@/lib/console-invitations';

export const dynamic = 'force-dynamic';

const SITE = 'https://rutherford.fr';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCALES = ['en', 'fr', 'de', 'it', 'es', 'pt'];

// A reseller / distributor / team member invites a client to fill out a console
// validation. Creates an invitation (token) and emails the client a link.
export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }

  const clientEmail = typeof body.clientEmail === 'string' ? body.clientEmail.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim().slice(0, 200) : '';
  const machine = typeof body.machine === 'string' ? body.machine.trim().slice(0, 200) : '';
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 1000) : '';
  const locale = typeof body.locale === 'string' && LOCALES.includes(body.locale) ? body.locale : 'en';

  if (!clientEmail || !EMAIL_RE.test(clientEmail) || clientEmail.length > 200) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  // Only resellers / distributors / team may invite. Resolve their company + logo.
  const admin = createSupabaseAdminClient();
  const { data: prof } = await admin
    .from('profiles')
    .select('account_type, company, organization_id')
    .eq('id', user.id)
    .maybeSingle();
  const at = prof?.account_type as string | undefined;
  if (at !== 'reseller' && at !== 'distributor' && at !== 'team') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let inviterCompany = (prof?.company as string | null) ?? 'Rutherford';
  // Distributor (X-Rite) co-brands with the X-Rite mark; resellers with their
  // org logo when set; team relies on the Rutherford header alone.
  let inviterLogoUrl: string | null = at === 'distributor' ? `${SITE}/images/xrite-logo-black.png` : null;
  const orgId = (prof?.organization_id as string | null) ?? null;
  if (orgId) {
    const { data: org } = await admin
      .from('organizations')
      .select('name, logo_url')
      .eq('id', orgId)
      .maybeSingle();
    if (org?.name) inviterCompany = org.name as string;
    if (at !== 'distributor' && org?.logo_url) inviterLogoUrl = org.logo_url as string;
  }

  const invite = await createCvInvitation({
    inviterId: user.id,
    inviterCompany,
    clientEmail,
    company: company || null,
    machine: machine || null,
    note: note || null,
    locale,
  });
  if (!invite) return NextResponse.json({ error: 'create_failed' }, { status: 500 });

  const url = `${SITE}/console-validation?invite=${invite.token}`;
  const mail = consoleInviteEmail({ locale, inviterCompany, inviterLogoUrl, note: note || null, url });
  await sendMail({ to: clientEmail, subject: mail.subject, html: mail.html });

  return NextResponse.json({ ok: true });
}
