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
 * Company + country for an internal team member, derived from their email domain.
 * Returns null for non-team domains. The team onboarding/profile use this to fill
 * those fields server-side instead of asking for them.
 */
export function teamOrgFromEmail(email: string): { company: string; country: string } | null {
  return TEAM_ORG[domainOf(email)] ?? null;
}

/**
 * Full derivation: domain first, then the Pipedrive person label. Defaults to
 * 'client'. Never throws — a CRM hiccup just yields 'client'.
 */
export async function deriveAccountType(email: string): Promise<AccountType> {
  const byDomain = accountTypeFromDomain(email);
  if (byDomain) return byDomain;
  try {
    const label = await getPersonLabelByEmail(email);
    if (label) return label; // 'reseller' | 'client'
  } catch {
    /* fall through */
  }
  return 'client';
}
