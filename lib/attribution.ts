// Lead attribution: where did this console validation request actually come from?
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
};

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
    if (sessionStorage.getItem(KEY)) return;

    const params = new URLSearchParams(window.location.search);
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
    };

    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* private mode or storage disabled: attribution is a nice-to-have */
  }
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
  if (!parts.length && a.referrer) parts.push(`referrer: ${a.referrer}`);
  if (!parts.length) parts.push('direct');
  if (a.landing && a.landing !== '/console-validation') parts.push(`landed on ${a.landing}`);
  return parts.join(' ');
}
