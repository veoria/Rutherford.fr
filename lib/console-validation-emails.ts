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
// after an order, so a single consistent CTA is clearer. The label is localized
// (see STATUS_COPY); the destination is the same in every language.
const TRACK_HREF = `${SITE}/account/console-validations`;

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
// Reference-ID callout — a light blue tint derived from the brand blue.
const REF_BG = '#F3F4FD';
const REF_BORDER = '#D7DBF6';

// Font stacks — web font first, then the fallback the design is built to hold on.
const F_SANS = "'Geist',Arial,Helvetica,sans-serif";
const F_BODY = "'Manrope',Arial,Helvetica,sans-serif";
const F_MONO = "'JetBrains Mono','Courier New',monospace";

const FOOTLINE = 'Rutherford.fr — closed-loop color management for offset &amp; flexo printing.';
const FOOTMETA = '25+ years · 30+ countries · 1,000+ systems deployed';

type Tone = 'info' | 'ok' | 'warn' | 'no';
type Cell = { k: string; v: string; tone?: 'ok' | 'warn' | 'no' };

export type EmailLocale = 'en' | 'fr' | 'de' | 'it' | 'es';
const EMAIL_LOCALES: EmailLocale[] = ['en', 'fr', 'de', 'it', 'es'];
/** Coerce any incoming string to a supported locale, defaulting to English. */
export const normalizeLocale = (value: string | null | undefined): EmailLocale =>
  EMAIL_LOCALES.includes(value as EmailLocale) ? (value as EmailLocale) : 'en';

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

// A high-visibility reference-ID callout: a light-blue card with a blue accent
// bar and the ID set large in mono, so it can't be missed. Unlike a data row or
// the eyebrow, this is the one element the customer can't scroll past.
function referenceBanner(label: string, value: string, note: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;margin:18px 0 22px;">
    <tr><td style="background:${REF_BG};border:1px solid ${REF_BORDER};border-left:4px solid ${BLUE};border-radius:10px;padding:16px 20px;">
      <div style="font-family:${F_MONO};font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:${MUTED};">${esc(
        label
      )}</div>
      <div style="font-family:${F_MONO};font-size:27px;font-weight:600;letter-spacing:.01em;color:${BLUE};line-height:1.15;margin-top:5px;">${esc(
        value
      )}</div>
      <div style="font-family:${F_BODY};font-size:12.5px;line-height:1.5;color:${BODY};margin-top:8px;">${esc(
        note
      )}</div>
    </td></tr>
  </table>`;
}

function cta(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="left" bgcolor="${BLUE}" style="border-radius:999px;">
    <!--[if mso]>&nbsp;<![endif]-->
    <a href="${href}" style="display:inline-block;background:${BLUE};color:#ffffff;font-family:${F_BODY};font-weight:600;font-size:14.5px;line-height:1;padding:13px 24px;border-radius:999px;text-decoration:none;white-space:nowrap;">${esc(label)} &rarr;</a>
    <!--[if mso]>&nbsp;<![endif]-->
  </td></tr></table>`;
}

// ── The renderer ──────────────────────────────────────────────────────────

export type EmailSpec = {
  subject: string;
  preheader: string;
  eyebrow: string;
  tone: Tone;
  /** Transactional auth/security mails omit the manage/unsubscribe footer line. */
  transactional?: boolean;
  headline: { pre: string; accent: string; post: string };
  /** Color for the accent word + its underline (defaults to brand blue). */
  accentColor?: string;
  /** Optional co-brand line under the header (e.g. "Invited by [reseller]"). */
  coBrand?: { prefix: string; label: string; logoUrl: string | null };
  /** Prominent reference-ID callout, rendered just under the headline. The deal
   * ID the customer quotes on orders and follow-ups — given top billing. */
  reference?: { label: string; value: string; note: string };
  /** Body paragraphs — may contain <strong>. Caller is responsible for escaping. */
  body: string[];
  dataBlock?: string;
  secondary?: { label: string; href: string };
  cta: { label: string; href: string };
};

export function render(spec: EmailSpec): string {
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

          ${spec.reference ? referenceBanner(spec.reference.label, spec.reference.value, spec.reference.note) : ''}
          ${paragraphs}
          ${spec.dataBlock ?? ''}
          ${secondary}
          ${cta(spec.cta.label, spec.cta.href)}
        </td></tr>
        <tr><td class="rf-foot" style="padding:4px 34px 24px;">
          <div style="margin-bottom:14px;font-size:0;line-height:0;">${spectrumRail(3)}</div>
          <div style="font-family:${F_BODY};font-size:12px;color:${FOOT_BRAND};margin-bottom:5px;">${FOOTLINE}</div>
          <div style="font-family:${F_MONO};font-size:10px;color:${MUTED};line-height:1.7;letter-spacing:.02em;">${FOOTMETA}</div>
          ${
            spec.transactional
              ? ''
              : `<div style="font-family:${F_MONO};font-size:10px;color:${MUTED};line-height:1.7;letter-spacing:.02em;"><a href="mailto:${SUPPORT}?subject=Email%20preferences" style="color:${BLUE};text-decoration:none;">Manage emails</a> · <a href="mailto:${SUPPORT}?subject=Unsubscribe" style="color:${BLUE};text-decoration:none;">Unsubscribe</a></div>`
          }
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

// ── Localized copy for the status emails ──────────────────────────────────
// One entry per locale. Dynamic parts (reference, press, company/country) are
// interpolated by the builders; `press`-bearing bodies receive the already
// escaped, <strong>-wrapped press label so each language can position it.

type Headline = { pre: string; accent: string; post: string };
type StatusCopy = {
  fields: { status: string; company: string; country: string; press: string };
  values: { received: string; eligible: string; notEligible: string; moreInfo: string };
  refLabel: string;
  refNote: string;
  track: string;
  ack: { subject: (ref: string) => string; preheader: string; eyebrow: string; headline: Headline; body: string[] };
  approved: { subject: string; preheader: (press: string) => string; eyebrow: string; headline: Headline; body: (press: string) => string[] };
  rejected: { subject: (ref: string) => string; preheader: string; eyebrow: string; headline: Headline; body: (press: string) => string[] };
  moreInfo: { subject: (ref: string) => string; preheader: string; eyebrow: string; headline: Headline; body: (press: string) => string[] };
  agent: { subject: string; preheader: string; eyebrow: string; headline: Headline };
};

const STATUS_COPY: Record<EmailLocale, StatusCopy> = {
  en: {
    fields: { status: 'Status', company: 'Company', country: 'Country', press: 'Press' },
    values: { received: 'Received', eligible: 'Eligible', notEligible: 'Not eligible', moreInfo: 'More info needed' },
    refLabel: 'Your reference',
    refNote: 'Quote this reference on any order or when you follow up on this validation.',
    track: 'Track your request',
    ack: {
      subject: (ref) => `We've received your console validation${ref ? ` — ref ${ref}` : ''}`,
      preheader: 'Reviewed within one business day.',
      eyebrow: 'REQUEST RECEIVED',
      headline: { pre: "Thank you — we've ", accent: 'received', post: ' your request.' },
      body: [
        'Your console validation request is in. Our team reviews every submission and comes back within <strong>one business day</strong> with your press eligibility and the next steps.',
      ],
    },
    approved: {
      subject: 'Good news — your press is eligible for closed-loop color',
      preheader: (press) => `${press} · confirmed compatible.`,
      eyebrow: 'ELIGIBILITY CONFIRMED',
      headline: { pre: 'Good news — your press is ', accent: 'eligible', post: '.' },
      body: (press) => [
        `We've reviewed your console validation and confirmed that your ${press} is compatible with Rutherford closed-loop color.`,
        "The next step is to schedule installation with our team. We'll align on timing, on-site requirements, and your first calibration run.",
      ],
    },
    rejected: {
      subject: (ref) => `Your console review is complete${ref ? ` — ref ${ref}` : ''}`,
      preheader: "This press isn't currently supported — but that can change.",
      eyebrow: 'REVIEW COMPLETE',
      headline: { pre: "This press isn't currently ", accent: 'eligible', post: '.' },
      body: (press) => [
        `We've finished reviewing your submission. Your ${press} console isn't currently supported for Rutherford closed-loop color.`,
        "This isn't always final — we add support for new consoles regularly, and in some cases a press becomes eligible after a hardware or software update. Our team can walk you through the specifics and any options for your setup.",
      ],
    },
    moreInfo: {
      subject: (ref) => `We need a little more to finish your review${ref ? ` — ref ${ref}` : ''}`,
      preheader: 'A few extra details before we can confirm eligibility.',
      eyebrow: 'MORE INFORMATION NEEDED',
      headline: { pre: 'We need a little ', accent: 'more', post: ' to finish your review.' },
      body: (press) => [
        `Your submission${press ? ` for ${press}` : ''} is almost there. Before we can confirm eligibility, our team needs a few additional details about your press and console.`,
        'Open your request to add the details — a comment and any extra photos. Your request stays open and we resume the review as soon as they arrive.',
      ],
    },
    agent: {
      subject: 'A message about your console validation',
      preheader: 'Your reviewer sent you a message.',
      eyebrow: 'NEW MESSAGE',
      headline: { pre: 'A message from ', accent: 'our team', post: '.' },
    },
  },
  fr: {
    fields: { status: 'Statut', company: 'Société', country: 'Pays', press: 'Presse' },
    values: { received: 'Reçue', eligible: 'Éligible', notEligible: 'Non éligible', moreInfo: 'Infos requises' },
    refLabel: 'Votre référence',
    refNote: 'Indiquez cette référence sur toute commande ou lors du suivi de cette validation.',
    track: 'Suivre ma demande',
    ack: {
      subject: (ref) => `Nous avons bien reçu votre validation console${ref ? ` — réf. ${ref}` : ''}`,
      preheader: 'Étudiée sous un jour ouvré.',
      eyebrow: 'DEMANDE REÇUE',
      headline: { pre: 'Merci — nous avons bien ', accent: 'reçu', post: ' votre demande.' },
      body: [
        'Votre demande de validation console est bien enregistrée. Notre équipe étudie chaque dossier et revient vers vous sous <strong>un jour ouvré</strong> avec l’éligibilité de votre presse et les prochaines étapes.',
      ],
    },
    approved: {
      subject: 'Bonne nouvelle — votre presse est éligible au closed-loop',
      preheader: (press) => `${press} · compatibilité confirmée.`,
      eyebrow: 'ÉLIGIBILITÉ CONFIRMÉE',
      headline: { pre: 'Bonne nouvelle — votre presse est ', accent: 'éligible', post: '.' },
      body: (press) => [
        `Nous avons étudié votre validation console et confirmons que votre ${press} est compatible avec le closed-loop Rutherford.`,
        'La prochaine étape consiste à planifier l’installation avec notre équipe. Nous définirons ensemble le calendrier, les prérequis sur site et votre première calibration.',
      ],
    },
    rejected: {
      subject: (ref) => `Votre analyse console est terminée${ref ? ` — réf. ${ref}` : ''}`,
      preheader: 'Cette presse n’est pas prise en charge actuellement — mais cela peut évoluer.',
      eyebrow: 'ANALYSE TERMINÉE',
      headline: { pre: 'Cette presse n’est pas actuellement ', accent: 'éligible', post: '.' },
      body: (press) => [
        `Nous avons terminé l’analyse de votre dossier. La console de votre ${press} n’est pas prise en charge actuellement pour le closed-loop Rutherford.`,
        'Ce n’est pas toujours définitif — nous ajoutons régulièrement la prise en charge de nouvelles consoles, et dans certains cas une presse devient éligible après une mise à jour matérielle ou logicielle. Notre équipe peut vous détailler les spécificités et les options pour votre configuration.',
      ],
    },
    moreInfo: {
      subject: (ref) => `Quelques infos pour finaliser votre analyse${ref ? ` — réf. ${ref}` : ''}`,
      preheader: 'Quelques détails avant de confirmer l’éligibilité.',
      eyebrow: 'INFORMATIONS COMPLÉMENTAIRES',
      headline: { pre: 'Il nous faut un peu ', accent: 'plus', post: ' pour finaliser votre analyse.' },
      body: (press) => [
        `Votre dossier${press ? ` pour ${press}` : ''} est presque complet. Avant de confirmer l’éligibilité, notre équipe a besoin de quelques précisions sur votre presse et votre console.`,
        'Ouvrez votre demande pour ajouter ces éléments — un commentaire et d’éventuelles photos supplémentaires. Votre demande reste ouverte et nous reprenons l’analyse dès leur réception.',
      ],
    },
    agent: {
      subject: 'Un message concernant votre validation console',
      preheader: 'Votre interlocuteur vous a envoyé un message.',
      eyebrow: 'NOUVEAU MESSAGE',
      headline: { pre: 'Un message de ', accent: 'notre équipe', post: '.' },
    },
  },
  de: {
    fields: { status: 'Status', company: 'Unternehmen', country: 'Land', press: 'Maschine' },
    values: { received: 'Eingegangen', eligible: 'Geeignet', notEligible: 'Nicht geeignet', moreInfo: 'Infos nötig' },
    refLabel: 'Ihre Referenz',
    refNote: 'Geben Sie diese Referenz bei jeder Bestellung oder Rückfrage zu dieser Validierung an.',
    track: 'Anfrage verfolgen',
    ack: {
      subject: (ref) => `Wir haben Ihre Konsolenvalidierung erhalten${ref ? ` — Ref. ${ref}` : ''}`,
      preheader: 'Innerhalb eines Werktags geprüft.',
      eyebrow: 'ANFRAGE EINGEGANGEN',
      headline: { pre: 'Vielen Dank — wir haben Ihre Anfrage ', accent: 'erhalten', post: '.' },
      body: [
        'Ihre Anfrage zur Konsolenvalidierung ist eingegangen. Unser Team prüft jede Einreichung und meldet sich innerhalb von <strong>einem Werktag</strong> mit der Eignung Ihrer Druckmaschine und den nächsten Schritten.',
      ],
    },
    approved: {
      subject: 'Gute Nachricht — Ihre Druckmaschine ist Closed-Loop-fähig',
      preheader: (press) => `${press} · Kompatibilität bestätigt.`,
      eyebrow: 'EIGNUNG BESTÄTIGT',
      headline: { pre: 'Gute Nachricht — Ihre Druckmaschine ist ', accent: 'geeignet', post: '.' },
      body: (press) => [
        `Wir haben Ihre Konsolenvalidierung geprüft und bestätigen, dass Ihre ${press} mit Rutherford Closed-Loop-Farbsteuerung kompatibel ist.`,
        'Der nächste Schritt ist die Terminplanung der Installation mit unserem Team. Wir stimmen Zeitplan, Anforderungen vor Ort und Ihre erste Kalibrierung ab.',
      ],
    },
    rejected: {
      subject: (ref) => `Ihre Konsolenprüfung ist abgeschlossen${ref ? ` — Ref. ${ref}` : ''}`,
      preheader: 'Diese Druckmaschine wird derzeit nicht unterstützt — das kann sich ändern.',
      eyebrow: 'PRÜFUNG ABGESCHLOSSEN',
      headline: { pre: 'Diese Druckmaschine ist derzeit nicht ', accent: 'geeignet', post: '.' },
      body: (press) => [
        `Wir haben die Prüfung Ihrer Einreichung abgeschlossen. Die Konsole Ihrer ${press} wird derzeit nicht für Rutherford Closed-Loop-Farbsteuerung unterstützt.`,
        'Das ist nicht immer endgültig — wir ergänzen regelmäßig die Unterstützung neuer Konsolen, und in manchen Fällen wird eine Druckmaschine nach einem Hardware- oder Software-Update geeignet. Unser Team erläutert Ihnen gerne die Details und mögliche Optionen für Ihre Konfiguration.',
      ],
    },
    moreInfo: {
      subject: (ref) => `Wir benötigen noch ein paar Angaben für Ihre Prüfung${ref ? ` — Ref. ${ref}` : ''}`,
      preheader: 'Noch ein paar Angaben, bevor wir die Eignung bestätigen können.',
      eyebrow: 'WEITERE ANGABEN ERFORDERLICH',
      headline: { pre: 'Wir brauchen noch ', accent: 'etwas mehr', post: ', um Ihre Prüfung abzuschließen.' },
      body: (press) => [
        `Ihre Einreichung${press ? ` für ${press}` : ''} ist fast vollständig. Bevor wir die Eignung bestätigen können, benötigt unser Team noch einige Angaben zu Ihrer Druckmaschine und Konsole.`,
        'Öffnen Sie Ihre Anfrage, um die Angaben zu ergänzen — einen Kommentar und ggf. weitere Fotos. Ihre Anfrage bleibt offen und wir setzen die Prüfung fort, sobald sie eingehen.',
      ],
    },
    agent: {
      subject: 'Eine Nachricht zu Ihrer Konsolenvalidierung',
      preheader: 'Ihr Prüfer hat Ihnen eine Nachricht gesendet.',
      eyebrow: 'NEUE NACHRICHT',
      headline: { pre: 'Eine Nachricht von ', accent: 'unserem Team', post: '.' },
    },
  },
  it: {
    fields: { status: 'Stato', company: 'Azienda', country: 'Paese', press: 'Macchina' },
    values: { received: 'Ricevuta', eligible: 'Idonea', notEligible: 'Non idonea', moreInfo: 'Info richieste' },
    refLabel: 'Il suo riferimento',
    refNote: 'Indichi questo riferimento su ogni ordine o per il follow-up di questa validazione.',
    track: 'Segui la richiesta',
    ack: {
      subject: (ref) => `Abbiamo ricevuto la sua validazione console${ref ? ` — rif. ${ref}` : ''}`,
      preheader: 'Esaminata entro un giorno lavorativo.',
      eyebrow: 'RICHIESTA RICEVUTA',
      headline: { pre: 'Grazie — abbiamo ', accent: 'ricevuto', post: ' la sua richiesta.' },
      body: [
        'La sua richiesta di validazione console è stata registrata. Il nostro team esamina ogni richiesta e risponde entro <strong>un giorno lavorativo</strong> con l’idoneità della sua macchina e i passaggi successivi.',
      ],
    },
    approved: {
      subject: 'Buone notizie — la sua macchina è idonea al closed-loop',
      preheader: (press) => `${press} · compatibilità confermata.`,
      eyebrow: 'IDONEITÀ CONFERMATA',
      headline: { pre: 'Buone notizie — la sua macchina è ', accent: 'idonea', post: '.' },
      body: (press) => [
        `Abbiamo esaminato la sua validazione console e confermiamo che la sua ${press} è compatibile con il closed-loop Rutherford.`,
        'Il passo successivo è pianificare l’installazione con il nostro team. Definiremo insieme tempistiche, requisiti in loco e la sua prima calibrazione.',
      ],
    },
    rejected: {
      subject: (ref) => `La sua analisi console è completata${ref ? ` — rif. ${ref}` : ''}`,
      preheader: 'Questa macchina non è attualmente supportata — ma può cambiare.',
      eyebrow: 'ANALISI COMPLETATA',
      headline: { pre: 'Questa macchina non è al momento ', accent: 'idonea', post: '.' },
      body: (press) => [
        `Abbiamo completato l’analisi della sua richiesta. La console della sua ${press} non è attualmente supportata per il closed-loop Rutherford.`,
        'Non è sempre definitivo — aggiungiamo regolarmente il supporto per nuove console e, in alcuni casi, una macchina diventa idonea dopo un aggiornamento hardware o software. Il nostro team può illustrarle i dettagli e le opzioni per la sua configurazione.',
      ],
    },
    moreInfo: {
      subject: (ref) => `Servono ancora alcune informazioni per la sua analisi${ref ? ` — rif. ${ref}` : ''}`,
      preheader: 'Ancora qualche dettaglio prima di confermare l’idoneità.',
      eyebrow: 'ALTRE INFORMAZIONI NECESSARIE',
      headline: { pre: 'Ci serve ', accent: 'qualcosa in più', post: ' per completare la sua analisi.' },
      body: (press) => [
        `La sua richiesta${press ? ` per ${press}` : ''} è quasi completa. Prima di confermare l’idoneità, il nostro team ha bisogno di alcuni dettagli aggiuntivi sulla sua macchina e console.`,
        'Apra la sua richiesta per aggiungere i dettagli — un commento ed eventuali foto aggiuntive. La sua richiesta resta aperta e riprendiamo l’analisi non appena li riceviamo.',
      ],
    },
    agent: {
      subject: 'Un messaggio sulla sua validazione console',
      preheader: 'Il suo referente le ha inviato un messaggio.',
      eyebrow: 'NUOVO MESSAGGIO',
      headline: { pre: 'Un messaggio dal ', accent: 'nostro team', post: '.' },
    },
  },
  es: {
    fields: { status: 'Estado', company: 'Empresa', country: 'País', press: 'Prensa' },
    values: { received: 'Recibida', eligible: 'Apta', notEligible: 'No apta', moreInfo: 'Faltan datos' },
    refLabel: 'Su referencia',
    refNote: 'Indique esta referencia en cualquier pedido o al hacer el seguimiento de esta validación.',
    track: 'Seguir mi solicitud',
    ack: {
      subject: (ref) => `Hemos recibido su validación de consola${ref ? ` — ref. ${ref}` : ''}`,
      preheader: 'Revisada en un día hábil.',
      eyebrow: 'SOLICITUD RECIBIDA',
      headline: { pre: 'Gracias — hemos ', accent: 'recibido', post: ' su solicitud.' },
      body: [
        'Su solicitud de validación de consola está registrada. Nuestro equipo revisa cada envío y responde en <strong>un día hábil</strong> con la aptitud de su prensa y los próximos pasos.',
      ],
    },
    approved: {
      subject: 'Buenas noticias — su prensa es apta para el closed-loop',
      preheader: (press) => `${press} · compatibilidad confirmada.`,
      eyebrow: 'APTITUD CONFIRMADA',
      headline: { pre: 'Buenas noticias — su prensa es ', accent: 'apta', post: '.' },
      body: (press) => [
        `Hemos revisado su validación de consola y confirmamos que su ${press} es compatible con el closed-loop de Rutherford.`,
        'El siguiente paso es programar la instalación con nuestro equipo. Acordaremos el calendario, los requisitos en planta y su primera calibración.',
      ],
    },
    rejected: {
      subject: (ref) => `Su análisis de consola ha finalizado${ref ? ` — ref. ${ref}` : ''}`,
      preheader: 'Esta prensa no es compatible por ahora — pero puede cambiar.',
      eyebrow: 'ANÁLISIS FINALIZADO',
      headline: { pre: 'Esta prensa no es actualmente ', accent: 'apta', post: '.' },
      body: (press) => [
        `Hemos finalizado el análisis de su solicitud. La consola de su ${press} no es compatible por ahora con el closed-loop de Rutherford.`,
        'No siempre es definitivo: añadimos compatibilidad con nuevas consolas con regularidad y, en algunos casos, una prensa pasa a ser apta tras una actualización de hardware o software. Nuestro equipo puede explicarle los detalles y las opciones para su configuración.',
      ],
    },
    moreInfo: {
      subject: (ref) => `Necesitamos algunos datos más para su análisis${ref ? ` — ref. ${ref}` : ''}`,
      preheader: 'Unos detalles más antes de confirmar la aptitud.',
      eyebrow: 'SE NECESITAN MÁS DATOS',
      headline: { pre: 'Necesitamos un ', accent: 'poco más', post: ' para completar su análisis.' },
      body: (press) => [
        `Su solicitud${press ? ` para ${press}` : ''} está casi lista. Antes de confirmar la aptitud, nuestro equipo necesita algunos datos adicionales sobre su prensa y su consola.`,
        'Abra su solicitud para añadir los datos — un comentario y las fotos adicionales que tenga. Su solicitud permanece abierta y reanudamos el análisis en cuanto los recibamos.',
      ],
    },
    agent: {
      subject: 'Un mensaje sobre su validación de consola',
      preheader: 'Su revisor le ha enviado un mensaje.',
      eyebrow: 'NUEVO MENSAJE',
      headline: { pre: 'Un mensaje de ', accent: 'nuestro equipo', post: '.' },
    },
  },
};

// ── Public builders ───────────────────────────────────────────────────────

export type AckLead = {
  company: string;
  country: string;
  machine: string;
  dealId: number | null;
};

/** 02 · Confirmation — request received. */
export function acknowledgementEmail(lead: AckLead, locale: EmailLocale = 'en'): { subject: string; html: string } {
  const c = STATUS_COPY[locale];
  const ref = reference(lead.dealId);
  // Same horizontal strip layout as the result emails, so Company / Country /
  // Press read consistently across the whole journey.
  const cells: Cell[] = [
    { k: c.fields.status, v: c.values.received },
    { k: c.fields.company, v: lead.company },
    { k: c.fields.country, v: lead.country },
    { k: c.fields.press, v: lead.machine },
  ];
  const subject = c.ack.subject(ref);

  return {
    subject,
    html: render({
      subject,
      preheader: c.ack.preheader,
      eyebrow: c.ack.eyebrow,
      tone: 'info',
      headline: c.ack.headline,
      reference: ref ? { label: c.refLabel, value: ref, note: c.refNote } : undefined,
      body: c.ack.body,
      dataBlock: stripBlock(cells),
      cta: { label: c.track, href: TRACK_HREF },
    }),
  };
}

export type ResultLead = {
  name: string;
  dealId: number | null;
  company?: string | null;
  country?: string | null;
  machine?: string | null;
};

// Press label: prefer the structured machine field, fall back to parsing the
// deal title. Country / Company come straight from the submission.
const leadPress = (lead: ResultLead) => (lead.machine && lead.machine.trim()) || derivePress(lead.name);
const trimmed = (s: string | null | undefined) => (s && s.trim() ? s.trim() : '');

/** 05 · Approved — press is eligible. */
export function canConnectEmail(lead: ResultLead, locale: EmailLocale = 'en'): { subject: string; html: string; bcc: string[] } {
  const c = STATUS_COPY[locale];
  const ref = reference(lead.dealId);
  const press = leadPress(lead);
  const cells: Cell[] = [{ k: c.fields.status, v: c.values.eligible, tone: 'ok' }];
  if (trimmed(lead.company)) cells.push({ k: c.fields.company, v: trimmed(lead.company) });
  if (trimmed(lead.country)) cells.push({ k: c.fields.country, v: trimmed(lead.country) });
  cells.push({ k: c.fields.press, v: press });

  return {
    subject: c.approved.subject,
    bcc: BCC_TEAM,
    html: render({
      subject: c.approved.subject,
      preheader: c.approved.preheader(press),
      eyebrow: c.approved.eyebrow,
      tone: 'ok',
      headline: c.approved.headline,
      accentColor: VALUE_TONE.ok,
      reference: ref ? { label: c.refLabel, value: ref, note: c.refNote } : undefined,
      body: c.approved.body(`<strong>${esc(press)}</strong>`),
      dataBlock: stripBlock(cells),
      cta: { label: c.track, href: TRACK_HREF },
    }),
  };
}

/** 06 · Not eligible — press isn't currently supported. */
export function cannotConnectEmail(lead: ResultLead, locale: EmailLocale = 'en'): { subject: string; html: string } {
  const c = STATUS_COPY[locale];
  const ref = reference(lead.dealId);
  const press = leadPress(lead);
  const cells: Cell[] = [{ k: c.fields.status, v: c.values.notEligible, tone: 'no' }];
  if (trimmed(lead.company)) cells.push({ k: c.fields.company, v: trimmed(lead.company) });
  if (trimmed(lead.country)) cells.push({ k: c.fields.country, v: trimmed(lead.country) });
  cells.push({ k: c.fields.press, v: press });

  return {
    subject: c.rejected.subject(ref),
    html: render({
      subject: c.rejected.subject(ref),
      preheader: c.rejected.preheader,
      eyebrow: c.rejected.eyebrow,
      tone: 'no',
      headline: c.rejected.headline,
      accentColor: VALUE_TONE.no,
      reference: ref ? { label: c.refLabel, value: ref, note: c.refNote } : undefined,
      body: c.rejected.body(`<strong>${esc(press)}</strong>`),
      dataBlock: stripBlock(cells),
      cta: { label: c.track, href: TRACK_HREF },
    }),
  };
}

// ── Invitation (reseller / distributor / team invites a client) ─────────────

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
  const loc = normalizeLocale(opts.locale);
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

/** Sent when a team member posts a "[client] …" comment on the validation's
 * Asana task — relays that message into the tracker thread. Free text → escape. */
export function consoleAgentMessageEmail(message: string, locale: EmailLocale = 'en'): { subject: string; html: string } {
  const c = STATUS_COPY[locale];
  return {
    subject: c.agent.subject,
    html: render({
      subject: c.agent.subject,
      preheader: c.agent.preheader,
      eyebrow: c.agent.eyebrow,
      tone: 'info',
      headline: c.agent.headline,
      body: [esc(message).replace(/\n/g, '<br>')],
      cta: { label: c.track, href: TRACK_HREF },
    }),
  };
}

/** 04 · More info needed — review started, the team needs extra details. */
export function moreInfoEmail(lead: ResultLead, locale: EmailLocale = 'en'): { subject: string; html: string } {
  const c = STATUS_COPY[locale];
  const ref = reference(lead.dealId);
  const press = leadPress(lead);
  const cells: Cell[] = [{ k: c.fields.status, v: c.values.moreInfo, tone: 'warn' }];
  if (trimmed(lead.company)) cells.push({ k: c.fields.company, v: trimmed(lead.company) });
  if (trimmed(lead.country)) cells.push({ k: c.fields.country, v: trimmed(lead.country) });
  if (press) cells.push({ k: c.fields.press, v: press });
  return {
    subject: c.moreInfo.subject(ref),
    html: render({
      subject: c.moreInfo.subject(ref),
      preheader: c.moreInfo.preheader,
      eyebrow: c.moreInfo.eyebrow,
      tone: 'warn',
      headline: c.moreInfo.headline,
      reference: ref ? { label: c.refLabel, value: ref, note: c.refNote } : undefined,
      body: c.moreInfo.body(press ? `<strong>${esc(press)}</strong>` : ''),
      dataBlock: stripBlock(cells),
      cta: { label: c.track, href: TRACK_HREF },
    }),
  };
}
