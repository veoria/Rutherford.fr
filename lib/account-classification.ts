// SERVER-ONLY — account-type derivation with a traced source (brief § 2.3.a).
//
// Order: e-mail domain (team / X-Rite) → partner_domains table (reseller by
// company domain, no CRM call) → Pipedrive person label → 'unqualified'.
// 'unqualified' keeps the safe 'client' access level but surfaces the account
// in the admin "à qualifier" queue instead of silently guessing.
//
// Lives apart from lib/account-type.ts to avoid a circular import
// (partner-domains needs companyDomainFromEmail from account-type).

import type { AccountType } from '@/data/account-types';
import { accountTypeFromDomain } from '@/lib/account-type';
import { isPartnerEmailDomain } from '@/lib/partner-domains';
import { getPersonLabelByEmail } from '@/lib/pipedrive';

export type AccountTypeSource = 'domain' | 'crm' | 'crm_domain' | 'admin' | 'unqualified';

export const CONFIRMED_SOURCES: readonly AccountTypeSource[] = ['domain', 'crm', 'crm_domain', 'admin'];

/** Whether a stored source counts as confirmed. NULL (legacy rows classified
 * before the qualification migration) is treated as confirmed. */
export function isConfirmedSource(source: string | null | undefined): boolean {
  return source == null || (CONFIRMED_SOURCES as readonly string[]).includes(source);
}

/**
 * Full derivation with provenance. Never throws — a CRM hiccup yields
 * 'unqualified', never a silent downgrade. Callers updating an EXISTING
 * profile must keep the current type when the result is 'unqualified' and the
 * stored source is confirmed (see isConfirmedSource).
 */
export async function deriveAccountTypeWithSource(
  email: string
): Promise<{ type: AccountType; source: AccountTypeSource }> {
  const byDomain = accountTypeFromDomain(email);
  if (byDomain) return { type: byDomain, source: 'domain' };

  if (await isPartnerEmailDomain(email)) return { type: 'reseller', source: 'crm_domain' };

  try {
    const label = await getPersonLabelByEmail(email);
    if (label) return { type: label, source: 'crm' };
  } catch {
    /* fall through */
  }
  return { type: 'client', source: 'unqualified' };
}
