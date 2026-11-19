import { createHmac, timingSafeEqual } from 'crypto';

// A console validation now opens its Pipedrive deal as soon as the printer
// leaves their contact details (step 1). The browser keeps a signed token for
// that deal, so the final submission (photos) completes the same deal instead
// of opening a second one, even when it happens days later from a phone.

const SECRET = process.env.CONSOLE_LEAD_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const sign = (dealId: number, email: string) =>
  createHmac('sha256', SECRET).update(`${dealId}:${email.trim().toLowerCase()}`).digest('base64url').slice(0, 32);

export function leadToken(dealId: number | null, email: string): string | null {
  if (!SECRET || !dealId) return null;
  return `${dealId}.${sign(dealId, email)}`;
}

/** The deal id behind a token, or null when it is missing, malformed or not this email's. */
export function dealFromLeadToken(token: unknown, email: string): number | null {
  if (!SECRET || typeof token !== 'string') return null;
  const m = /^(\d{1,12})\.([A-Za-z0-9_-]{32})$/.exec(token.trim());
  if (!m) return null;
  const dealId = Number(m[1]);
  const expected = Buffer.from(sign(dealId, email));
  const given = Buffer.from(m[2]);
  return expected.length === given.length && timingSafeEqual(expected, given) ? dealId : null;
}

/** Optional phone number: digits, spaces and + ( ) . - only, 6 to 30 characters. */
export function cleanPhone(v: unknown): string | null {
  const s = typeof v === 'string' ? v.trim() : '';
  return /^[+()\d][\d\s().-]{5,29}$/.test(s) ? s : null;
}
