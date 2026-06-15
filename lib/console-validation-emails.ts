// Client-facing transactional emails for the console-validation journey.
//
// Production build of the "Direction C · Color signature" design handoff:
// a white document-grade card with a six-ink spectrum cap rail, a status dot
// whose color signals state, color-chip data rows, and a blue accent-underlined
// word in the headline. Authored as HTML tables + inline styles with web-safe
// font fallbacks so it holds up in Outlook/Gmail (the prototype's flex/grid and
// gradient-text do not). Each builder returns { subject, html }.

const BCC_TEAM = ['fx@rutherford.fr', 'fabrice@rutherford.fr'];

const SITE = 'https://rutherford.fr';
const LOGO = `${SITE}/images/rutherford-logo-email.png`; // 1200×275 wordmark + swirl
const SUPPORT = 'contact@rutherford.fr';

// Every email points back to the customer's tracking page in their account —
// the request status lives there, and "schedule installation" only makes sense
// after an order, so a single consistent CTA is clearer.
const TRACK_CTA = { label: 'Track your request', href: `${SITE}/account/console-validations` };

// ── Design tokens (from the handoff) ──────────────────────────────────────
const BLUE = '#2433C9';
const INK = '#181410';
const BODY = '#544C46';
const MUTED = '#9A8E82';
const CANVAS = '#ECEBE8';
const CARD_BORDER = '#E9E6E1';
const DATA_BORDER = '#ECEAE5';
const DIVIDER = '#F1EFEA';
const CHIP_EMPTY = '#D8D2C8';
const FOOT_BRAND = '#6B6058';
const EYEBROW = '#2E2BB8';
const SWATCH = ['#29ABE2', '#2E9E47', '#F7941D', '#EC0E8C', '#ED1C24', '#2E2BB8'];

const DOT: Record<Tone, string> = { info: '#2E9E47', ok: '#2E9E47', warn: '#E5A100', no: '#D33A2C' };
const VALUE_TONE: Record<string, string> = { ok: '#1F8A4C', warn: '#B07D12', no: '#C4332B' };
// Soft background tint for a toned cell, so the Status box reads its state at a glance.
const FILL_TONE: Record<string, string> = { ok: '#E5F4EB', warn: '#FAF1E0', no: '#FBE9E7' };

// Font stacks — web font first, then the fallback the design is built to hold on.
const F_SANS = "'Geist',Arial,Helvetica,sans-serif";
const F_BODY = "'Manrope',Arial,Helvetica,sans-serif";
const F_MONO = "'JetBrains Mono','Courier New',monospace";

const FOOTLINE = 'Rutherford.fr — closed-loop color management for offset &amp; flexo printing.';
const FOOTMETA = '25+ years · 30+ countries · 1,000+ systems deployed · Made in France';

type Tone = 'info' | 'ok' | 'warn' | 'no';
type Row = { k: string; v: string; mono?: boolean };
type Cell = { k: string; v: string; tone?: 'ok' | 'warn' | 'no' };

const esc = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── Building blocks ───────────────────────────────────────────────────────

function spectrumRail(height: number): string {
  const cells = SWATCH.map(
    (c) =>
      `<td width="16.66%" height="${height}" style="background:${c};height:${height}px;line-height:${height}px;font-size:0;">&nbsp;</td>`
  ).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>${cells}</tr></table>`;
}

function tableBlock(rows: Row[]): string {
  const body = rows
    .map((r, i) => {
      const bb = i < rows.length - 1 ? `border-bottom:1px solid ${DIVIDER};` : '';
      const valueFont = r.mono ? F_MONO : F_BODY;
      return `<tr>
        <td width="12" valign="middle" style="padding:12px 0 12px 16px;${bb}"><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${SWATCH[i % SWATCH.length]};">&nbsp;</span></td>
        <td valign="middle" style="padding:12px 12px;font-family:${F_MONO};font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:${MUTED};${bb}">${esc(r.k)}</td>
        <td valign="middle" style="padding:12px 16px 12px 0;font-family:${valueFont};font-size:14.5px;font-weight:600;color:${INK};${bb}">${esc(r.v)}</td>
      </tr>`;
    })
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${DATA_BORDER};border-radius:10px;border-collapse:separate;margin:20px 0 22px;">${body}</table>`;
}

function stripBlock(cells: Cell[]): string {
  const width = Math.round(100 / cells.length);
  const tds = cells
    .map((s, i) => {
      const br = i < cells.length - 1 ? `border-right:1px solid ${DIVIDER};` : '';
      const color = s.tone ? VALUE_TONE[s.tone] : INK;
      const bg = s.tone ? `background:${FILL_TONE[s.tone]};` : '';
      return `<td width="${width}%" valign="top" style="padding:14px 16px;${bg}${br}">
        <div style="font-family:${F_MONO};font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:${MUTED};">${esc(s.k)}</div>
        <div style="font-family:${F_BODY};font-size:15px;font-weight:600;color:${color};margin-top:5px;">${esc(s.v)}</div>
      </td>`;
    })
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${DATA_BORDER};border-radius:10px;border-collapse:separate;margin:20px 0 22px;"><tr>${tds}</tr></table>`;
}

function cta(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="left" bgcolor="${BLUE}" style="border-radius:999px;">
    <!--[if mso]>&nbsp;<![endif]-->
    <a href="${href}" style="display:inline-block;background:${BLUE};color:#ffffff;font-family:${F_BODY};font-weight:600;font-size:14.5px;line-height:1;padding:13px 24px;border-radius:999px;text-decoration:none;white-space:nowrap;">${esc(label)} &rarr;</a>
    <!--[if mso]>&nbsp;<![endif]-->
  </td></tr></table>`;
}

// ── The renderer ──────────────────────────────────────────────────────────

type EmailSpec = {
  subject: string;
  preheader: string;
  eyebrow: string;
  tone: Tone;
  headline: { pre: string; accent: string; post: string };
  /** Color for the accent word + its underline (defaults to brand blue). */
  accentColor?: string;
  /** Optional co-brand line under the header (e.g. "Invited by [reseller]"). */
  coBrand?: { prefix: string; label: string; logoUrl: string | null };
  /** Body paragraphs — may contain <strong>. Caller is responsible for escaping. */
  body: string[];
  dataBlock?: string;
  secondary?: { label: string; href: string };
  cta: { label: string; href: string };
};

function render(spec: EmailSpec): string {
  const dot = DOT[spec.tone];
  const accent = spec.accentColor ?? BLUE;
  const headline = `${esc(spec.headline.pre)}<span style="color:${accent};border-bottom:3px solid ${accent};padding-bottom:1px;">${esc(
    spec.headline.accent
  )}</span>${esc(spec.headline.post)}`;
  const paragraphs = spec.body
    .map(
      (p) =>
        `<p style="font-family:${F_BODY};font-size:15px;line-height:1.6;color:${BODY};margin:0 0 14px;">${p}</p>`
    )
    .join('');
  const secondary = spec.secondary
    ? `<a href="${spec.secondary.href}" style="font-family:${F_BODY};display:inline-block;font-size:13px;font-weight:600;color:${BLUE};text-decoration:none;margin:0 0 20px;white-space:nowrap;">${esc(
        spec.secondary.label
      )} &rarr;</a><br>`
    : '';
  const coBrand = spec.coBrand
    ? `<div style="margin-top:16px;padding-top:14px;border-top:1px solid ${DIVIDER};">
        <span style="font-family:${F_MONO};font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:${MUTED};vertical-align:middle;">${esc(
          spec.coBrand.prefix
        )}</span>&nbsp;&nbsp;${
          spec.coBrand.logoUrl
            ? `<img src="${spec.coBrand.logoUrl}" alt="${esc(spec.coBrand.label)}" height="18" style="height:18px;width:auto;vertical-align:middle;display:inline-block;">`
            : `<span style="font-family:${F_BODY};font-size:13px;font-weight:700;color:${INK};vertical-align:middle;">${esc(spec.coBrand.label)}</span>`
        }
      </div>`
    : '';

  return `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<title>${esc(spec.subject)}</title>
<!--[if mso]><style>* { font-family:Arial,Helvetica,sans-serif !important; }</style><![endif]-->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@600&family=Manrope:wght@400;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table { border-collapse:collapse; }
  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  a { text-decoration:none; }
  @media only screen and (max-width:600px) {
    .rf-pad { padding:22px 22px 20px !important; }
    .rf-foot { padding:4px 22px 22px !important; }
    .rf-h1 { font-size:23px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${CANVAS};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${CANVAS};">${esc(
    spec.preheader
  )}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CANVAS};">
    <tr><td align="center" style="padding:28px;">
      <table role="presentation" width="580" cellpadding="0" cellspacing="0" border="0" style="width:580px;max-width:580px;background:#ffffff;border:1px solid ${CARD_BORDER};border-radius:14px;overflow:hidden;">
        <tr><td style="font-size:0;line-height:0;">${spectrumRail(6)}</td></tr>
        <tr><td class="rf-pad" style="padding:26px 34px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td align="left" valign="middle"><img src="${LOGO}" alt="Rutherford.fr" height="24" style="display:block;height:24px;width:auto;"></td>
            <td align="right" valign="middle"><span style="font-family:${F_MONO};font-size:9px;letter-spacing:.16em;color:${MUTED};border:1px solid #E5E1DB;border-radius:999px;padding:4px 11px;white-space:nowrap;">CLOSED-LOOP COLOR</span></td>
          </tr></table>
          ${coBrand}

          <div style="margin-top:24px;font-family:${F_MONO};font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:${EYEBROW};font-weight:600;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${dot};vertical-align:middle;margin-right:8px;">&nbsp;</span>${esc(
              spec.eyebrow
            )}
          </div>

          <h1 class="rf-h1" style="font-family:${F_SANS};font-weight:600;font-size:26px;line-height:1.16;letter-spacing:-.022em;color:${INK};margin:12px 0 15px;">${headline}</h1>

          ${paragraphs}
          ${spec.dataBlock ?? ''}
          ${secondary}
          ${cta(spec.cta.label, spec.cta.href)}
        </td></tr>
        <tr><td class="rf-foot" style="padding:4px 34px 24px;">
          <div style="margin-bottom:14px;font-size:0;line-height:0;">${spectrumRail(3)}</div>
          <div style="font-family:${F_BODY};font-size:12px;color:${FOOT_BRAND};margin-bottom:5px;">${FOOTLINE}</div>
          <div style="font-family:${F_MONO};font-size:10px;color:${MUTED};line-height:1.7;letter-spacing:.02em;">${FOOTMETA} · Data stays in the EU</div>
          <div style="font-family:${F_MONO};font-size:10px;color:${MUTED};line-height:1.7;letter-spacing:.02em;"><a href="mailto:${SUPPORT}?subject=Email%20preferences" style="color:${BLUE};text-decoration:none;">Manage emails</a> · <a href="mailto:${SUPPORT}?subject=Unsubscribe" style="color:${BLUE};text-decoration:none;">Unsubscribe</a></div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Data helpers ──────────────────────────────────────────────────────────

const reference = (dealId: number | null) => (dealId ? `ID ${dealId}` : '');

/** Pull a clean press label out of the deal title ("ID2370 - France - FX - Heidelberg CD 74-5"). */
function derivePress(name: string): string {
  const parts = name
    .split(/\s[-–]\s/)
    .map((s) => s.trim())
    .filter((s) => s && !/^ID\s*\d+$/i.test(s));
  return parts[parts.length - 1] || name.trim();
}

const reviewedDate = () =>
  new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// ── Public builders ───────────────────────────────────────────────────────

export type AckLead = {
  company: string;
  country: string;
  machine: string;
  dealId: number | null;
};

/** 02 · Confirmation — request received. */
export function acknowledgementEmail(lead: AckLead): { subject: string; html: string } {
  const ref = reference(lead.dealId);
  const rows: Row[] = [];
  if (ref) rows.push({ k: 'Reference', v: ref, mono: true });
  rows.push({ k: 'Company', v: lead.company });
  rows.push({ k: 'Country', v: lead.country });
  rows.push({ k: 'Press', v: lead.machine });

  return {
    subject: `We've received your console validation${ref ? ` — ref ${ref}` : ''}`,
    html: render({
      subject: `We've received your console validation${ref ? ` — ref ${ref}` : ''}`,
      preheader: 'Reviewed within one business day.',
      eyebrow: `REQUEST RECEIVED${ref ? ` · REF ${ref}` : ''}`,
      tone: 'info',
      headline: { pre: "Thank you — we've ", accent: 'received', post: ' your request.' },
      body: [
        'Your console validation request is in. Our team reviews every submission and comes back within <strong>one business day</strong> with your press eligibility and the next steps.',
        'Please keep your reference for any follow-up.',
      ],
      dataBlock: tableBlock(rows),
      cta: TRACK_CTA,
    }),
  };
}

export type ResultLead = { name: string; dealId: number | null };

/** 05 · Approved — press is eligible. */
export function canConnectEmail(lead: ResultLead): { subject: string; html: string; bcc: string[] } {
  const ref = reference(lead.dealId);
  const press = derivePress(lead.name);
  const cells: Cell[] = [{ k: 'Status', v: 'Eligible', tone: 'ok' }, { k: 'Press', v: press }];
  if (ref) cells.push({ k: 'Reference', v: ref });

  return {
    subject: 'Good news — your press is eligible for closed-loop color',
    bcc: BCC_TEAM,
    html: render({
      subject: 'Good news — your press is eligible for closed-loop color',
      preheader: `${press} · confirmed compatible.`,
      eyebrow: `ELIGIBILITY CONFIRMED${ref ? ` · REF ${ref}` : ''}`,
      tone: 'ok',
      headline: { pre: 'Good news — your press is ', accent: 'eligible', post: '.' },
      accentColor: VALUE_TONE.ok,
      body: [
        `We've reviewed your console validation and confirmed that your <strong>${esc(
          press
        )}</strong> is compatible with Rutherford closed-loop color.`,
        "The next step is to schedule installation with our team. We'll align on timing, on-site requirements, and your first calibration run.",
      ],
      dataBlock: stripBlock(cells),
      cta: TRACK_CTA,
    }),
  };
}

/** 06 · Not eligible — press isn't currently supported. */
export function cannotConnectEmail(lead: ResultLead): { subject: string; html: string } {
  const ref = reference(lead.dealId);
  const press = derivePress(lead.name);
  const cells: Cell[] = [
    { k: 'Status', v: 'Not eligible', tone: 'no' },
    { k: 'Press', v: press },
    { k: 'Reviewed', v: reviewedDate() },
  ];

  return {
    subject: `Your console review is complete${ref ? ` — ref ${ref}` : ''}`,
    html: render({
      subject: `Your console review is complete${ref ? ` — ref ${ref}` : ''}`,
      preheader: "This press isn't currently supported — but that can change.",
      eyebrow: `REVIEW COMPLETE${ref ? ` · REF ${ref}` : ''}`,
      tone: 'no',
      headline: { pre: "This press isn't currently ", accent: 'eligible', post: '.' },
      body: [
        `We've finished reviewing your submission. Your <strong>${esc(
          press
        )}</strong> console isn't currently supported for Rutherford closed-loop color.`,
        "This isn't always final — we add support for new consoles regularly, and in some cases a press becomes eligible after a hardware or software update. Our team can walk you through the specifics and any options for your setup.",
      ],
      dataBlock: stripBlock(cells),
      cta: TRACK_CTA,
    }),
  };
}

// ── Invitation (reseller / distributor / team invites a client) ─────────────

type EmailLocale = 'en' | 'fr' | 'de' | 'it' | 'es';

type InviteCopy = {
  subject: (company: string) => string;
  preheader: string;
  eyebrow: string;
  headline: { pre: string; accent: string; post: string };
  intro: (companyHtml: string) => string;
  closing: string;
  cta: string;
  invitedBy: string;
};

const INVITE_COPY: Record<EmailLocale, InviteCopy> = {
  en: {
    subject: (c) => `${c} invites you to a free console validation`,
    preheader: 'Check whether your press can run closed-loop — about 2 minutes.',
    eyebrow: 'CONSOLE VALIDATION · INVITATION',
    headline: { pre: 'Is your press ready for ', accent: 'closed-loop', post: '?' },
    intro: (c) =>
      `<strong>${c}</strong> invites you to run a free console validation. With a few details about your press, Rutherford's experts confirm whether it can be connected to automate color control and cut makeready waste.`,
    closing: 'It takes about two minutes and commits you to nothing.',
    cta: 'Start my console validation',
    invitedBy: 'Invited by',
  },
  fr: {
    subject: (c) => `${c} vous invite à une validation console gratuite`,
    preheader: 'Vérifiez si votre presse peut passer en closed-loop — environ 2 minutes.',
    eyebrow: 'VALIDATION CONSOLE · INVITATION',
    headline: { pre: 'Votre presse est-elle prête pour le ', accent: 'closed-loop', post: ' ?' },
    intro: (c) =>
      `<strong>${c}</strong> vous invite à réaliser une validation console gratuite. En quelques informations sur votre presse, les experts Rutherford vérifient si elle peut être connectée pour automatiser le contrôle couleur et réduire la gâche au calage.`,
    closing: 'Cela prend environ deux minutes et ne vous engage à rien.',
    cta: 'Démarrer ma validation console',
    invitedBy: 'Invité par',
  },
  de: {
    subject: (c) => `${c} lädt Sie zu einer kostenlosen Konsolenvalidierung ein`,
    preheader: 'Prüfen Sie, ob Ihre Druckmaschine Closed-Loop-fähig ist — etwa 2 Minuten.',
    eyebrow: 'KONSOLENVALIDIERUNG · EINLADUNG',
    headline: { pre: 'Ist Ihre Druckmaschine bereit für ', accent: 'Closed-Loop', post: '?' },
    intro: (c) =>
      `<strong>${c}</strong> lädt Sie zu einer kostenlosen Konsolenvalidierung ein. Mit wenigen Angaben zu Ihrer Maschine prüfen die Rutherford-Experten, ob sie für die automatische Farbsteuerung angebunden werden kann und die Makulatur beim Einrichten reduziert.`,
    closing: 'Es dauert etwa zwei Minuten und ist unverbindlich.',
    cta: 'Konsolenvalidierung starten',
    invitedBy: 'Eingeladen von',
  },
  it: {
    subject: (c) => `${c} la invita a una validazione console gratuita`,
    preheader: 'Verifichi se la sua macchina può funzionare in closed-loop — circa 2 minuti.',
    eyebrow: 'VALIDAZIONE CONSOLE · INVITO',
    headline: { pre: 'La sua macchina è pronta per il ', accent: 'closed-loop', post: '?' },
    intro: (c) =>
      `<strong>${c}</strong> la invita a effettuare una validazione console gratuita. Con poche informazioni sulla sua macchina, gli esperti Rutherford verificano se può essere collegata per automatizzare il controllo colore e ridurre lo scarto di avviamento.`,
    closing: 'Richiede circa due minuti e non comporta alcun impegno.',
    cta: 'Avvia la validazione console',
    invitedBy: 'Invito da',
  },
  es: {
    subject: (c) => `${c} le invita a una validación de consola gratuita`,
    preheader: 'Compruebe si su prensa puede funcionar en closed-loop — unos 2 minutos.',
    eyebrow: 'VALIDACIÓN DE CONSOLA · INVITACIÓN',
    headline: { pre: '¿Está su prensa lista para el ', accent: 'closed-loop', post: '?' },
    intro: (c) =>
      `<strong>${c}</strong> le invita a realizar una validación de consola gratuita. Con unos pocos datos sobre su prensa, los expertos de Rutherford comprueban si puede conectarse para automatizar el control del color y reducir el desperdicio de puesta a punto.`,
    closing: 'Lleva unos dos minutos y no supone ningún compromiso.',
    cta: 'Iniciar mi validación de consola',
    invitedBy: 'Invitado por',
  },
};

/** Invitation email a reseller / distributor / team member sends to a client. */
export function consoleInviteEmail(opts: {
  locale: string;
  inviterCompany: string;
  inviterLogoUrl: string | null;
  note: string | null;
  url: string;
}): { subject: string; html: string } {
  const loc = (['en', 'fr', 'de', 'it', 'es'].includes(opts.locale) ? opts.locale : 'en') as EmailLocale;
  const c = INVITE_COPY[loc];
  const body = [c.intro(esc(opts.inviterCompany))];
  if (opts.note && opts.note.trim()) {
    body.push(`<em style="color:${BODY};">&ldquo;${esc(opts.note.trim())}&rdquo;</em>`);
  }
  body.push(c.closing);
  const subject = c.subject(opts.inviterCompany);
  return {
    subject,
    html: render({
      subject,
      preheader: c.preheader,
      eyebrow: c.eyebrow,
      tone: 'info',
      headline: c.headline,
      body,
      cta: { label: c.cta, href: opts.url },
      coBrand: { prefix: c.invitedBy, label: opts.inviterCompany, logoUrl: opts.inviterLogoUrl },
    }),
  };
}

/** 04 · More info needed — review started, the team needs extra details. */
export function moreInfoEmail(lead: ResultLead): { subject: string; html: string } {
  const ref = reference(lead.dealId);
  const press = derivePress(lead.name);
  return {
    subject: `We need a little more to finish your review${ref ? ` — ref ${ref}` : ''}`,
    html: render({
      subject: `We need a little more to finish your review${ref ? ` — ref ${ref}` : ''}`,
      preheader: 'A few extra details before we can confirm eligibility.',
      eyebrow: `MORE INFORMATION NEEDED${ref ? ` · REF ${ref}` : ''}`,
      tone: 'warn',
      headline: { pre: 'We need a little ', accent: 'more', post: ' to finish your review.' },
      body: [
        `Your submission${press ? ` for <strong>${esc(press)}</strong>` : ''} is almost there. Before we can confirm eligibility, our team needs a few additional details about your press and console.`,
        'Open your request to add the details — a comment and any extra photos. Your request stays open and we resume the review as soon as they arrive.',
      ],
      cta: TRACK_CTA,
    }),
  };
}
