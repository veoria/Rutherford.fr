// SERVER-ONLY: the reseller/distributor "clients" view — validations submitted
// on behalf of clients (console_validations.reseller_id) merged with the
// org-linked clients (organizations.reseller_org_id). One implementation shared
// by the hub and the team page; they used to carry drifted copies (the team one
// silently dropped systems/updates).

import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { getResellerClients } from '@/lib/organizations';
import type { ResellerClient } from '@/components/account-hub';
import type { AccountType } from '@/data/account-types';

/** Console-validation statuses still requiring attention. */
export const OPEN_CV = ['submitted', 'in_review', 'changes_requested'];

const HAS_ADMIN = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);

export async function getResellerClientsView(
  userId: string,
  accountType: AccountType
): Promise<ResellerClient[]> {
  if (accountType !== 'reseller' && accountType !== 'distributor') return [];

  // Privileged read scoped to this reseller (the user RLS policy doesn't cover it).
  let clients: ResellerClient[] = [];
  if (HAS_ADMIN) {
    try {
      const { data } = await createSupabaseAdminClient()
        .from('console_validations')
        .select('company, country, machine, status, email, created_at')
        .eq('reseller_id', userId)
        // Une demande supprimée dans Asana (test, doublon) sort aussi de la
        // vue revendeur — ce read passe par le service role, hors RLS.
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      const byClient = new Map<string, ResellerClient>();
      for (const r of (data ?? []) as {
        company: string | null;
        country: string | null;
        status: string;
        email: string;
      }[]) {
        const key = (r.company || r.email || 'client').toLowerCase();
        const cur =
          byClient.get(key) ??
          ({ name: r.company || r.email, country: r.country, presses: 0, eligible: 0, open: 0 } as ResellerClient);
        cur.presses += 1;
        if (r.status === 'can_be_connected') cur.eligible += 1;
        if (OPEN_CV.includes(r.status)) cur.open += 1;
        byClient.set(key, cur);
      }
      clients = [...byClient.values()];
    } catch {
      clients = [];
    }
  }

  // Merge in the org-linked clients so attribution shows whichever exists,
  // carrying their installed systems / pending updates.
  const linked = await getResellerClients(userId);
  const byName = new Map(clients.map((c) => [c.name.toLowerCase(), c] as const));
  for (const l of linked) {
    const key = l.name.toLowerCase();
    const cur = byName.get(key) ?? { name: l.name, country: l.country, presses: 0, eligible: 0, open: 0 };
    cur.systems = l.systems;
    cur.updates = l.updates;
    byName.set(key, cur);
  }
  return [...byName.values()];
}
