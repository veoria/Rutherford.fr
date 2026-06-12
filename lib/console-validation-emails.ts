// Client-facing email templates for console validation.
//
// On-brand with rutherford.fr: white card, near-black text (#111), Apple-blue
// accent (#0071e3), system font, the Rutherford wordmark up top. Table-based +
// inline styles for email-client compatibility. Each returns { subject, html }.

const BCC_TEAM = ['fx@rutherford.fr', 'fabrice@rutherford.fr'];
const LOGO = 'https://rutherford.fr/images/rutherford-logo-black.png';
const ACCENT = '#0071e3';

const esc = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function shell(body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f5f5f4;padding:24px 12px;font-family:-apple-system,'SF Pro Text','Helvetica Neue',Helvetica,Arial,sans-serif;color:#111111;-webkit-font-smoothing:antialiased">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e7e7e0;border-radius:18px;overflow:hidden">
      <tr><td style="padding:32px 36px 0">
        <img src="${LOGO}" alt="Rutherford" width="168" height="32" style="display:block;border:0;outline:none;text-decoration:none">
      </td></tr>
      <tr><td style="padding:24px 36px 32px">${body}</td></tr>
      <tr><td style="padding:22px 36px;background:#f7f7f3;border-top:1px solid #e7e7e0">
        <p style="margin:0;font-size:12px;line-height:1.6;color:#8a8a8a">
          Rutherford — closed-loop color management for offset &amp; flexo printing.<br>
          25+ years · 30+ countries · 1,000+ systems deployed ·
          <a href="https://rutherford.fr" style="color:${ACCENT};text-decoration:none">rutherford.fr</a>
        </p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;color:#111111">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#333333">${text}</p>`;
}

// Key/value recap box (skips empty values, no trailing separator).
function recap(rows: [label: string, value: string][]): string {
  const filled = rows.filter(([, value]) => value);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;background:#f7f7f3;border:1px solid #e7e7e0;border-radius:14px">
    ${filled
      .map(([label, value], i) => {
        const border = i < filled.length - 1 ? 'border-bottom:1px solid #ececec;' : '';
        return `<tr>
          <td style="padding:12px 18px;font-size:13px;color:#676767;width:36%;${border}">${esc(label)}</td>
          <td style="padding:12px 18px;font-size:14px;color:#111111;font-weight:600;${border}">${esc(value)}</td>
        </tr>`;
      })
      .join('')}
  </table>`;
}

function button(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:980px">${label}</a>`;
}

export type AckLead = {
  company: string;
  country: string;
  machine: string;
  dealId: number | null;
};

export function acknowledgementEmail(lead: AckLead): { subject: string; html: string } {
  const reference = lead.dealId ? `ID ${lead.dealId}` : '';
  return {
    subject: `We received your console validation${reference ? ` — ${reference}` : ''}`,
    html: shell(
      heading("Thank you — we've received your request") +
        paragraph(`Hello${lead.company ? ' ' + esc(lead.company) : ''},`) +
        paragraph(
          'Your console validation request is in. Our team reviews every submission and comes back within <strong>one business day</strong> with your press eligibility and the next steps.'
        ) +
        recap([
          ['Reference', reference],
          ['Company', lead.company],
          ['Country', lead.country],
          ['Machine', lead.machine],
        ]) +
        paragraph('Please keep this reference for any follow-up.') +
        button('Discover Rutherford', 'https://rutherford.fr') +
        paragraph('<br>— The Rutherford team')
    ),
  };
}

export type ResultLead = { name: string; dealId: number | null };

export function canConnectEmail(lead: ResultLead): { subject: string; html: string; bcc: string[] } {
  const reference = lead.dealId ? `ID ${lead.dealId}` : '';
  return {
    subject: `Good news — your console can be connected${reference ? ` (${reference})` : ''}`,
    bcc: BCC_TEAM,
    html: shell(
      heading('Congratulations — we can connect your console') +
        paragraph(
          `Based on the pictures and information you sent${lead.name ? ` for <strong>${esc(lead.name)}</strong>` : ''}, <strong>your press can run Rutherford closed-loop color control</strong>.`
        ) +
        recap([['Reference', reference]]) +
        paragraph("Let's go forward together — we'll be in touch with the next steps.") +
        button('Talk to an expert', 'https://rutherford.fr') +
        paragraph('<br>— The Rutherford team')
    ),
  };
}

export function cannotConnectEmail(lead: ResultLead): { subject: string; html: string } {
  const reference = lead.dealId ? `ID ${lead.dealId}` : '';
  return {
    subject: `Your console validation${reference ? ` — ${reference}` : ''}`,
    html: shell(
      heading('About your console validation') +
        paragraph(
          `Based on the pictures and information you sent${lead.name ? ` for <strong>${esc(lead.name)}</strong>` : ''}, <strong>we cannot connect this console</strong> as it is today.`
        ) +
        recap([['Reference', reference]]) +
        paragraph(
          "But let's go forward together — feel free to submit another console validation request for a different press."
        ) +
        button('Submit another request', 'https://rutherford.fr/console-validation') +
        paragraph('<br>— The Rutherford team')
    ),
  };
}
