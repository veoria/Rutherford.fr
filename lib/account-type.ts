// SERVER-ONLY: derive an account's classification from its email + the CRM.
//
// Rules (in order):
//   1. Email domain rutherford.fr / veoria.fr / studiodelaroche.fr → 'team'
//   2. Email domain xrite.com → 'distributor' (X-Rite is the only distributor)
//   3. Pipedrive person label (reseller vs client): Reseller / OEM /
//      Distributor → 'reseller'; Customer → 'client'
//   4. Default (incl. lead / prospect / source labels)            → 'client'
//
// account_type is never trusted from the client; it is computed here on sign-in
// (domain only — free) and when a profile is saved (full, incl. the CRM lookup).

import type { AccountType } from '@/data/account-types';
import { getPersonLabelByEmail } from '@/lib/pipedrive';

const TEAM_DOMAINS = ['rutherford.fr', 'veoria.fr', 'studiodelaroche.fr'];
const DISTRIBUTOR_DOMAINS = ['xrite.com'];

// Public webmail providers: colleagues on these do NOT share a company org
// (each address is an individual), so org auto-creation must never dedup by them.
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'outlook.com', 'outlook.fr', 'hotmail.com', 'hotmail.fr',
  'hotmail.co.uk', 'hotmail.it', 'live.com', 'live.fr', 'msn.com', 'icloud.com', 'me.com',
  'mac.com', 'yahoo.com', 'yahoo.fr', 'yahoo.co.uk', 'yahoo.it', 'ymail.com', 'aol.com',
  'gmx.com', 'gmx.de', 'gmx.net', 'proton.me', 'protonmail.com', 'pm.me', 'mail.com',
  'zoho.com', 'yandex.com', 'yandex.ru', 'qq.com', '163.com', '126.com', 'web.de',
  'free.fr', 'orange.fr', 'wanadoo.fr', 'laposte.net', 'sfr.fr', 'bbox.fr', 'neuf.fr',
  'libero.it', 't-online.de',
]);

// Company + country for an internal team member, keyed by email domain. Lets the
// dedicated team onboarding skip the company/country questions we already know.
const TEAM_ORG: Record<string, { company: string; country: string }> = {
  'rutherford.fr': { company: 'Rutherford', country: 'France' },
  'veoria.fr': { company: 'Veoria', country: 'France' },
  'studiodelaroche.fr': { company: 'Studio de la Roche', country: 'France' },
};

function domainOf(email: string): string {
  const at = email.lastIndexOf('@');
  return at === -1 ? '' : email.slice(at + 1).trim().toLowerCase();
}

/**
 * Domain-only classification — free, instant, reliable. Returns null when the
 * domain alone doesn't decide it (i.e. resellers / direct clients).
 */
export function accountTypeFromDomain(email: string): AccountType | null {
  const domain = domainOf(email);
  if (!domain) return null;
  if (TEAM_DOMAINS.includes(domain)) return 'team';
  if (DISTRIBUTOR_DOMAINS.includes(domain)) return 'distributor';
  return null;
}

/**
 * The company email domain for an address, or null when it's a public webmail
 * provider (or malformed). Used to share a single organization across colleagues
 * who sign up with the same company domain (e.g. two @digitalview.co.za users).
 */
export function companyDomainFromEmail(email: string): string | null {
  const domain = domainOf(email);
  if (!domain || !domain.includes('.')) return null;
  if (FREE_EMAIL_DOMAINS.has(domain)) return null;
  return domain;
}

/**
 * Company + country for an internal team member, derived from their email domain.
 * Returns null for non-team domains. The team onboarding/profile use this to fill
 * those fields server-side instead of asking for them.
 */
export function teamOrgFromEmail(email: string): { company: string; country: string } | null {
  return TEAM_ORG[domainOf(email)] ?? null;
}

/**
 * Positive-signal derivation: domain first, then the Pipedrive person label.
 * Returns null when nothing decides it (person unknown, CRM down) so callers
 * updating an EXISTING profile can keep the current type instead of silently
 * downgrading it to the 'client' default. Never throws.
 */
export async function deriveAccountTypeSignal(email: string): Promise<AccountType | null> {
  const byDomain = accountTypeFromDomain(email);
  if (byDomain) return byDomain;
  try {
    const label = await getPersonLabelByEmail(email);
    if (label) return label; // 'reseller' | 'client'
  } catch {
    /* fall through */
  }
  return null;
}

/**
 * Full derivation: domain first, then the Pipedrive person label. Defaults to
 * 'client'. Never throws — a CRM hiccup just yields 'client'. Use only where a
 * type MUST exist (first onboarding); profile saves use deriveAccountTypeSignal.
 */
export async function deriveAccountType(email: string): Promise<AccountType> {
  return (await deriveAccountTypeSignal(email)) ?? 'client';
}
