// Transactional emails for support tickets. Built as inline-styled HTML so they
// hold up in Outlook/Gmail. Each builder returns { subject, html }.

const SITE = 'https://rutherford.fr';
const TRACK = `${SITE}/account/support`;
const BLUE = '#2433C9';

function shell(headline: string, paragraphs: string[], ctaLabel: string): string {
  const body = paragraphs
    .map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#544C46;">${p}</p>`)
    .join('');
  return `<!doctype html><html><body style="margin:0;background:#ECEBE8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ECEBE8;"><tr><td align="center" style="padding:28px;">
    <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #E9E6E1;border-radius:14px;">
      <tr><td style="height:6px;background:${BLUE};font-size:0;line-height:0;border-radius:14px 14px 0 0;">&nbsp;</td></tr>
      <tr><td style="padding:30px 34px;">
        <h1 style="margin:0 0 14px;font-size:22px;color:#181410;">${headline}</h1>
        ${body}
        <a href="${TRACK}" style="display:inline-block;background:${BLUE};color:#fff;font-weight:600;font-size:14.5px;padding:13px 24px;border-radius:999px;text-decoration:none;">${ctaLabel} &rarr;</a>
        <p style="margin:22px 0 0;font-size:12px;color:#9A8E82;">Rutherford.fr — closed-loop color for offset &amp; flexo printing.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

const REF = (ref: string | null) => (ref ? ` — ${ref}` : '');

/** Sent on submission. */
export function supportAckEmail(ref: string | null): { subject: string; html: string } {
  return {
    subject: `We've received your support request${REF(ref)}`,
    html: shell('Support request received', [
      'Thank you — our team has your request and will get back to you shortly.',
      'You can follow your ticket and add details anytime from your account.',
    ], 'Track your ticket'),
  };
}

const STATUS_TEXT: Record<string, { label: string; line: string }> = {
  in_progress: { label: 'in progress', line: 'Our team is working on your ticket.' },
  waiting_customer: { label: 'waiting on you', line: 'We need a few details from you — open your ticket to reply.' },
  resolved: { label: 'resolved', line: 'We’ve marked your ticket as resolved. Reply if anything is still off.' },
  closed: { label: 'closed', line: 'Your ticket has been closed. Open a new request anytime.' },
};

/** Sent when the ticket's status changes (driven by the Asana column). */
export function supportStatusEmail(status: string, ref: string | null): { subject: string; html: string } | null {
  const s = STATUS_TEXT[status];
  if (!s) return null; // 'new' or unknown — no email
  return {
    subject: `Your support ticket is ${s.label}${REF(ref)}`,
    html: shell(`Your ticket is ${s.label}`, [s.line], 'Open my ticket'),
  };
}
