// Won Pipedrive deals → Install board — SERVER-ONLY.
//
// Two jobs: rebuild the description block the team reads on every Install card,
// and make sure a deal produces exactly one card. Pipedrive redelivers webhooks
// on any non-2xx, a deal can be re-won after being lost, and the team can flip a
// deal back and forth — so "won" is not a one-shot event and the handler needs a
// claim it can check before creating anything.

import { createSupabaseAdminClient } from '@/lib/supabase/server';
import type { WonDeal } from '@/lib/pipedrive';

/**
 * The Install description block, in the order the team reads it.
 *
 * This block is a CONTRACT, not free text. OrderTrack — the X-Rite-facing SaaS —
 * treats the Install board as its source of truth and parses these very lines
 * into its `orders` table: `Contact` → contact_name, `Products name` /
 * `Products code`, `PO` → po_number, `SO` → so_number, `Press interface`,
 * `Numbers of units` (it keeps the whole `6 - Keys : 32` remainder),
 * `Screen mount`, `Computer`, `PO RGP` → po_xrite. Country, customer and press
 * model come from the task NAME, split on ` - ` as
 * `Country - Company - Press - IDxxxx`.
 *
 * So: keep every line, keep the blank placeholders, keep the separators. A
 * tidier block would silently corrupt someone else's production data.
 */
export function installNotes(deal: WonDeal): string {
  const f = deal.fields;
  return [
    `Owner of the deal : ${deal.ownerName ?? ''}`,
    `Delivery : ${deal.delivery ?? ''}`,
    `Organisation : ${deal.orgName ?? ''}`,
    `Contact : ${deal.personName ?? ''}`,
    `Products name : ${deal.productNames.join(' - ')}`,
    `Products code : ${deal.productCodes.join(' - ')}`,
    `PO : ${f.PO ?? ''}`,
    `SO : ${f.SO ?? ''}`,
    `Press interface : ${f['Press interface'] ?? ''}`,
    `Press : ${f.Press ?? ''}`,
    `Numbers of units : ${f['Numbers of units'] ?? ''} - Keys : ${f.Keys ?? ''}`,
    // Constant in the Zap, not a Pipedrive field.
    'Screen mount : Desk or Wall',
    'Computer :',
    'AnyDesk :',
    'Tracking number :',
    'License number RGP :',
    'PO RGP :',
  ].join('\n');
}

function adminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createSupabaseAdminClient();
}

/**
 * Claim a deal before creating its task. The table's primary key is the deal id,
 * so a second delivery loses the insert and gets `false` back — the claim, not a
 * timestamp comparison, is what makes this exactly-once.
 * Returns true when the caller owns the creation. Without Supabase configured it
 * returns true and the Asana-side lookup remains the only guard.
 */
export async function claimWonDeal(dealId: number, dealTitle: string): Promise<boolean> {
  const supabase = adminClient();
  if (!supabase) return true;
  const { error } = await supabase
    .from('pipedrive_won_installs')
    .insert({ deal_id: dealId, deal_title: dealTitle });
  if (!error) return true;
  // 23505 = unique violation: someone already claimed this deal.
  if (error.code === '23505') return false;
  console.error('Won-deal claim failed:', error);
  // An unreachable database must not silently double-create; the Asana lookup
  // that runs next is the fallback guard.
  return true;
}

/** Record which task the claim produced (or drop the claim when creation failed,
 * so a later redelivery can try again). Best-effort. */
export async function settleWonDeal(dealId: number, asanaTaskGid: string | null): Promise<void> {
  const supabase = adminClient();
  if (!supabase) return;
  try {
    if (asanaTaskGid) {
      await supabase
        .from('pipedrive_won_installs')
        .update({ asana_task_gid: asanaTaskGid })
        .eq('deal_id', dealId);
    } else {
      await supabase.from('pipedrive_won_installs').delete().eq('deal_id', dealId);
    }
  } catch (error) {
    console.error('Won-deal settle failed:', error);
  }
}
