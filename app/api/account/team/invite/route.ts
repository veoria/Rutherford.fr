import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createInvitation, getManageableOrg } from '@/lib/organizations';
import { sendMail } from '@/lib/msgraph';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE = 'https://rutherford.fr';

function inviteEmail(orgName: string | null, inviter: string): { subject: string; html: string } {
  const team = orgName || 'une équipe';
  const signInUrl = `${SITE}/account/sign-in?next=/account`;
  return {
    subject: `Invitation à rejoindre ${team} sur Rutherford`,
    html: `<!doctype html><html><body style="margin:0;background:#ECEBE8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ECEBE8;"><tr><td align="center" style="padding:28px;">
    <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #E9E6E1;border-radius:14px;">
      <tr><td style="height:6px;background:#2433C9;font-size:0;line-height:0;border-radius:14px 14px 0 0;">&nbsp;</td></tr>
      <tr><td style="padding:30px 34px;">
        <h1 style="margin:0 0 14px;font-size:22px;color:#181410;">Vous êtes invité·e à rejoindre ${team}</h1>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#544C46;">
          ${inviter} vous a invité·e à rejoindre son compte <strong>Rutherford</strong> — accès à l'espace équipe, aux validations de presse et à l'Academy.
        </p>
        <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#544C46;">
          Connectez-vous avec cette adresse e-mail pour rejoindre l'équipe :
        </p>
        <a href="${signInUrl}" style="display:inline-block;background:#2433C9;color:#fff;font-weight:600;font-size:14.5px;padding:13px 24px;border-radius:999px;text-decoration:none;">Rejoindre l'équipe &rarr;</a>
        <p style="margin:22px 0 0;font-size:12px;color:#9A8E82;">Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet e-mail.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
  };
}

/** Invite a member to the caller's org (owner/admin only). */
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

  const manage = await getManageableOrg(user.id);
  if (!manage) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const invite = await createInvitation({
    orgId: manage.orgId,
    email,
    role,
    kind: 'member',
    invitedBy: user.id,
  });
  if (!invite) return NextResponse.json({ error: 'failed' }, { status: 500 });

  const mail = inviteEmail(manage.orgName, user.email ?? 'Un membre');
  await sendMail({ to: email, subject: mail.subject, html: mail.html });

  return NextResponse.json({ ok: true });
}
