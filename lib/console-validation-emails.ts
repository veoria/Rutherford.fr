// Client-facing email templates for console validation.
//
// Plain, on-brand HTML — placeholders for the richer Mailchimp templates the
// team uses today (drop those in here when ready). Each returns { subject, html }.

const BCC_TEAM = ['fx@rutherford.fr', 'fabrice@rutherford.fr'];

function shell(body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f5f5f4;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1917">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;padding:32px">
      <tr><td style="font-size:18px;font-weight:700;letter-spacing:.02em">Rutherford</td></tr>
      <tr><td style="padding-top:16px;font-size:15px;line-height:1.6">${body}</td></tr>
      <tr><td style="padding-top:28px;font-size:12px;color:#78716c;line-height:1.5">
        Rutherford — closed-loop color management for offset &amp; flexo printing.<br>
        <a href="https://rutherford.fr" style="color:#78716c">rutherford.fr</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

export function acknowledgementEmail(name: string): { subject: string; html: string } {
  return {
    subject: 'We received your console validation',
    html: shell(
      `<p>Hello,</p>
       <p>Thank you — we have received your console validation request${name ? ` for <strong>${name}</strong>` : ''}.</p>
       <p>Our team reviews every submission and comes back within one business day with your press
       eligibility and the next steps.</p>
       <p>— The Rutherford team</p>`
    ),
  };
}

export function canConnectEmail(name: string): { subject: string; html: string; bcc: string[] } {
  return {
    subject: `Console validation ${name}`.trim(),
    bcc: BCC_TEAM,
    html: shell(
      `<p>Congratulations,</p>
       <p>Based on the pictures and information you sent, <strong>we can connect your console${name ? ` — ${name}` : ''}</strong>.</p>
       <p>Let's go forward together. We'll be in touch with the next steps.</p>
       <p>— The Rutherford team</p>`
    ),
  };
}

export function cannotConnectEmail(name: string): { subject: string; html: string } {
  return {
    subject: `Console validation ${name}`.trim(),
    html: shell(
      `<p>Hello,</p>
       <p>Based on the pictures and information you sent, <strong>we cannot connect this console${name ? ` — ${name}` : ''}</strong> as it is.</p>
       <p>But let's go forward together — feel free to submit another console validation request for a different press.</p>
       <p>— The Rutherford team</p>`
    ),
  };
}
