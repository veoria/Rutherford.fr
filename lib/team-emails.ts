// Team / client invitation email. The actual send (Microsoft Graph) happens at
// the call site; this just builds { subject, html }. Shared by the team-invite
// API and the console-validation "submit on behalf of a client" flow.

const SITE = 'https://rutherford.fr';

export function teamInviteEmail(
  kind: 'member' | 'client' | 'reseller',
  orgName: string | null,
  inviter: string
): { subject: string; html: string } {
  const team = orgName || 'Rutherford';
  const signInUrl = `${SITE}/account/sign-in?next=/account`;
  const isClient = kind === 'client';
  const isReseller = kind === 'reseller';
  const subject = isReseller
    ? `${team} vous invite dans son réseau Rutherford`
    : isClient
      ? `${team} vous invite sur Rutherford`
      : `Invitation à rejoindre ${team} sur Rutherford`;
  const headline = isReseller
    ? `Rejoignez le réseau ${team}`
    : isClient
      ? `${team} vous invite sur Rutherford`
      : `Vous êtes invité·e à rejoindre ${team}`;
  const intro = isReseller
    ? `${inviter} (${team}) vous invite à rejoindre son réseau de revendeurs sur <strong>Rutherford</strong>.`
    : isClient
      ? `${inviter} (${team}) vous invite à suivre vos validations de presse et votre compte sur <strong>Rutherford</strong>.`
      : `${inviter} vous a invité·e à rejoindre son compte <strong>Rutherford</strong> — accès à l'espace équipe, aux validations de presse et à l'Academy.`;
  const cta = isReseller ? 'Rejoindre le réseau' : isClient ? 'Activer mon compte' : 'Rejoindre l’équipe';
  return {
    subject,
    html: `<!doctype html><html><body style="margin:0;background:#ECEBE8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ECEBE8;"><tr><td align="center" style="padding:28px;">
    <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #E9E6E1;border-radius:14px;">
      <tr><td style="height:6px;background:#2433C9;font-size:0;line-height:0;border-radius:14px 14px 0 0;">&nbsp;</td></tr>
      <tr><td style="padding:30px 34px;">
        <h1 style="margin:0 0 14px;font-size:22px;color:#181410;">${headline}</h1>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#544C46;">${intro}</p>
        <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#544C46;">Connectez-vous avec cette adresse e-mail pour continuer :</p>
        <a href="${signInUrl}" style="display:inline-block;background:#2433C9;color:#fff;font-weight:600;font-size:14.5px;padding:13px 24px;border-radius:999px;text-decoration:none;">${cta} &rarr;</a>
        <p style="margin:22px 0 0;font-size:12px;color:#9A8E82;">Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet e-mail.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
  };
}
