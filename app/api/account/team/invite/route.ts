import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createInvitation, getManageableOrg } from '@/lib/organizations';
import { teamInviteEmail } from '@/lib/team-emails';
import { sendMail } from '@/lib/msgraph';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Invite a member (or, for resellers/distributors, a client) to the caller's
 * org. Owner/admin only. */
export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const role = body.role === 'admin' ? 'admin' : 'member';
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: 'bad_email' }, { status: 400 });
  }
  if (email.toLowerCase() === (user.email ?? '').toLowerCase()) {
    return NextResponse.json({ error: 'self_invite' }, { status: 400 });
  }

  const kind = body.kind === 'client' ? 'client' : body.kind === 'reseller' ? 'reseller' : 'member';

  const manage = await getManageableOrg(user.id);
  if (!manage) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  // Resellers/distributors invite clients; only distributors invite resellers.
  if (kind === 'client' && manage.orgType !== 'reseller' && manage.orgType !== 'distributor') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (kind === 'reseller' && manage.orgType !== 'distributor') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const invite = await createInvitation({
    orgId: manage.orgId,
    email,
    role,
    kind,
    invitedBy: user.id,
  });
  if (!invite) return NextResponse.json({ error: 'failed' }, { status: 500 });

  const mail = teamInviteEmail(kind, manage.orgName, user.email ?? 'Rutherford');
  await sendMail({ to: email, subject: mail.subject, html: mail.html });

  return NextResponse.json({ ok: true });
}
