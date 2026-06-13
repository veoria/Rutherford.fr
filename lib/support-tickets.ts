// Support tickets — SERVER-ONLY. Writes use the service-role client and are
// best-effort (a hiccup must not break a submission). Mirrors console-validations.

import { createSupabaseAdminClient } from '@/lib/supabase/server';

export type SupportStatus = 'new' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';

export type SupportTicketRecord = {
  userId: string | null;
  email: string;
  name: string | null;
  anydesk: string | null;
  description: string;
  asanaTaskGid: string | null;
  photos: Record<string, string>;
};

function adminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createSupabaseAdminClient();
}

export async function insertSupportTicket(record: SupportTicketRecord): Promise<string | null> {
  const supabase = adminClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: record.userId,
        email: record.email,
        name: record.name,
        anydesk: record.anydesk,
        description: record.description,
        asana_task_gid: record.asanaTaskGid,
        photos: record.photos,
      })
      .select('id')
      .single();
    if (error) {
      console.error('support_tickets insert failed:', error.message);
      return null;
    }
    return data?.id ?? null;
  } catch (error) {
    console.error('support_tickets insert threw:', error);
    return null;
  }
}

/** Map an Asana column / section name to a ticket status (keyword, FR/EN). */
export function supportStatusFromSection(section: string | null, completed: boolean): SupportStatus {
  const s = (section ?? '').toLowerCase();
  if (/(clos|closed|fermé|ferme|archiv)/.test(s)) return 'closed';
  if (completed || /(résolu|resolu|resolved|done|terminé|termine)/.test(s)) return 'resolved';
  if (/(attente|waiting|client|customer|hold|pending|relance)/.test(s)) return 'waiting_customer';
  if (/(cours|progress|doing|traitement|wip|assign|prise en charge)/.test(s)) return 'in_progress';
  return 'new';
}

export async function getSupportTicketByAsanaTask(
  gid: string
): Promise<{ id: string; email: string; status: SupportStatus } | null> {
  const supabase = adminClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from('support_tickets')
      .select('id, email, status')
      .eq('asana_task_gid', gid)
      .maybeSingle();
    return data ? { id: data.id as string, email: data.email as string, status: data.status as SupportStatus } : null;
  } catch {
    return null;
  }
}

export async function updateSupportStatusByAsanaTask(gid: string, status: SupportStatus): Promise<void> {
  const supabase = adminClient();
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('asana_task_gid', gid);
    if (error) console.error('support status update failed:', error.message);
  } catch (error) {
    console.error('support status update threw:', error);
  }
}
