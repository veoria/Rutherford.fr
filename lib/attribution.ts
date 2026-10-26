// Lead attribution: where did this lead (console validation, contact, ROI
// calculator, newsletter) actually come from?
//
// Captured once per session on the first page the visitor lands on, so the
// original source survives any navigation before they reach the form. Stored in
// sessionStorage (first-party, cleared when the tab closes) and sent along with
// the form submission only. It is not a cross-site tracker, so it does not sit
// behind the cookie banner: without it a deal lands in Pipedrive with no idea
// whether it came from LinkedIn, a blog article or a trade show QR code.

const KEY = 'rf-attribution';

export type Attribution = {
  source?: string; // utm_source, e.g. linkedin
  medium?: string; // utm_medium, e.g. social
  campaign?: string; // utm_campaign, e.g. console-check
  content?: string; // utm_content, e.g. post-operator-checklist
  term?: string; // utm_term
  referrer?: string; // referring hostname when there is no UTM
  landing?: string; // first path seen this session
  at?: string; // ISO timestamp of first touch
  // Upstream journey handed over by a partner site (colorloop.ai adds cl_*
  // parameters to every link pointing at the console validation form).
  ref?: string; // cl_ref, the site that sent the visitor (e.g. colorloop.ai)
  channel?: string; // cl_channel, first-touch channel on that site
  lastChannel?: string; // cl_last_channel
  refLanding?: string; // cl_landing, first page seen on that site
  firstAt?: string; // cl_first_at, first visit date on that site
};

const UPSTREAM_PARAMS = ['utm_source', 'utm_campaign', 'cl_ref', 'cl_channel'];

const clean = (v: string | null): string | undefined => {
  const s = (v ?? '').trim().slice(0, 120);
  return s || undefined;
};

/**
 * Records the first touch of the session. Safe to call on every route change:
 * once a session has an attribution, it is never overwritten (first touch wins,
 * which is what tells you which channel actually opened the door).
 */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    const existing = sessionStorage.getItem(KEY);
    if (existing) {
      // First touch wins, except when the session started without any source
      // and this page arrives tagged (e.g. a colorloop.ai "Check your press"
      // link after the visitor browsed rutherford.fr directly).
      const prev = JSON.parse(existing) as Attribution;
      const tagged = UPSTREAM_PARAMS.some((k) => params.get(k));
      if (!tagged || prev.source || prev.ref) return;
    }

    let referrer: string | undefined;
    try {
      // Internal navigations are not a source.
      const host = document.referrer ? new URL(document.referrer).hostname : '';
      if (host && host !== window.location.hostname) referrer = host;
    } catch {
      /* malformed referrer, ignore */
    }

    const data: Attribution = {
      source: clean(params.get('utm_source')),
      medium: clean(params.get('utm_medium')),
      campaign: clean(params.get('utm_campaign')),
      content: clean(params.get('utm_content')),
      term: clean(params.get('utm_term')),
      referrer,
      landing: window.location.pathname.slice(0, 200),
      at: new Date().toISOString(),
      ref: clean(params.get('cl_ref')),
      channel: clean(params.get('cl_channel')),
      lastChannel: clean(params.get('cl_last_channel')),
      refLanding: clean(params.get('cl_landing')),
      firstAt: clean(params.get('cl_first_at')),
    };

    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* private mode or storage disabled: attribution is a nice-to-have */
  }
}

/**
 * Server side: rebuilds an Attribution from an untrusted request body field,
 * clamping every value. Null when the client sent nothing usable.
 */
export function parseAttribution(raw: unknown): Attribution | null {
  if (!raw || typeof raw !== 'object') return null;
  const a = raw as Record<string, unknown>;
  const field = (v: unknown) => clean(typeof v === 'string' ? v : null);
  return {
    source: field(a.source),
    medium: field(a.medium),
    campaign: field(a.campaign),
    content: field(a.content),
    referrer: field(a.referrer),
    landing: field(a.landing),
    ref: field(a.ref),
    channel: field(a.channel),
    lastChannel: field(a.lastChannel),
    refLanding: field(a.refLanding),
    firstAt: field(a.firstAt),
  };
}

/**
 * Business introducer: leads sent by colorloop.ai, or by a landing-page
 * campaign (utm_campaign lp_*), are credited to Hugues.
 */
export function introducerOf(a: Attribution | null | undefined): string | null {
  if (!a) return null;
  if (a.ref?.toLowerCase() === 'colorloop.ai' || a.campaign?.toLowerCase().startsWith('lp_')) return 'Hugues';
  return null;
}

/** Detailed "Key: value" lines for the CRM note, only the fields present. */
export function attributionLines(a: Attribution | null | undefined): string[] {
  if (!a) return [];
  const rows: [string, string | undefined][] = [
    ['Apporteur', introducerOf(a) ?? undefined],
    ['Site d\'origine', a.ref],
    ['Canal', a.channel],
    ['Dernier canal', a.lastChannel],
    ['utm_source', a.source],
    ['utm_medium', a.medium],
    ['utm_campaign', a.campaign],
    ['utm_content', a.content],
    ['Page d\'arrivée (origine)', a.refLanding],
    ['Première visite', a.firstAt],
    ['Page d\'arrivée (rutherford.fr)', a.landing],
  ];
  return rows.filter(([, v]) => v).map(([k, v]) => `${k} : ${v}`);
}

/** Reads the session's first touch, or null when there is nothing to report. */
export function readAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

/**
 * One-line summary for a Pipedrive note or a Discord alert.
 * Falls back to the referring host, then to "direct".
 */
export function formatAttribution(a: Attribution | null | undefined): string {
  if (!a) return 'direct';
  const parts: string[] = [];
  if (a.source) parts.push(a.source);
  if (a.medium) parts.push(`(${a.medium})`);
  if (a.campaign) parts.push(`campaign: ${a.campaign}`);
  if (a.content) parts.push(`content: ${a.content}`);
  if (!parts.length && a.ref) parts.push(`via ${a.ref}`);
  if (!parts.length && a.referrer) parts.push(`referrer: ${a.referrer}`);
  if (!parts.length) parts.push('direct');
  // Landing on the form itself (/check redirects there, localized or not) says nothing.
  if (a.landing && !/^\/(?:[a-z]{2}\/)?console-validation$/.test(a.landing)) parts.push(`landed on ${a.landing}`);
  return parts.join(' ');
}
