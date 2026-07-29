// SERVER-ONLY — partner_domains table access (brief § 2.3.b).
//
// The table maps company e-mail domains to Pipedrive partner labels so
// deriveAccountTypeWithSource can classify a reseller colleague instantly at
// sign-in, without a per-person CRM call. Filled by /api/cron/partner-domains.

import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { companyDomainFromEmail } from '@/lib/account-type';
import { listPartnerEmailDomains } from '@/lib/pipedrive';

function admin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createSupabaseAdminClient();
}

/** Whether the address belongs to a known reseller domain. Webmail providers
 * are never matched (companyDomainFromEmail filters them). Never throws. */
export async function isPartnerEmailDomain(email: string): Promise<boolean> {
  const domain = companyDomainFromEmail(email);
  const supabase = admin();
  if (!domain || !supabase) return false;
  try {
    const { data } = await supabase
      .from('partner_domains')
      .select('domain')
      .eq('domain', domain)
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}

/** Refresh partner_domains from Pipedrive: upsert every harvested domain,
 * delete the ones that disappeared from the CRM. Returns counts for the cron
 * report. Free-webmail domains are excluded (an individual gmail address on a
 * reseller person must not turn every gmail user into a reseller). */
export async function syncPartnerDomains(): Promise<{ upserted: number; removed: number }> {
  const supabase = admin();
  if (!supabase) return { upserted: 0, removed: 0 };

  const harvested = await listPartnerEmailDomains();
  const rows = [...harvested.entries()]
    .filter(([domain]) => companyDomainFromEmail(`x@${domain}`) !== null)
    .map(([domain, label]) => ({ domain, pipedrive_label: label, synced_at: new Date().toISOString() }));

  if (rows.length) {
    const { error } = await supabase.from('partner_domains').upsert(rows, { onConflict: 'domain' });
    if (error) throw new Error(error.message);
  }

  // Remove stale rows only when the harvest looked healthy — an empty harvest
  // (CRM outage) must not wipe the table.
  let removed = 0;
  if (rows.length) {
    const keep = rows.map((r) => r.domain);
    const { data: existing } = await supabase.from('partner_domains').select('domain');
    const stale = ((existing ?? []) as { domain: string }[])
      .map((r) => r.domain)
      .filter((d) => !keep.includes(d));
    if (stale.length) {
      const { error } = await supabase.from('partner_domains').delete().in('domain', stale);
      if (!error) removed = stale.length;
    }
  }

  return { upserted: rows.length, removed };
}
