// Support tickets — SERVER-ONLY. Writes use the service-role client and are
// best-effort (a hiccup must not break a submission). Mirrors console-validations.

import { createSupabaseAdminClient } from '@/lib/supabase/server';

export type SupportStatus = 'new' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';

export type SupportTicketRecord = {
  userId: string | null;
  email: string;
  name: string | null;
  company: string | null;
  subject: string | null;
  anydesk: string | null;
  description: string;
  asanaTaskGid: string | null;
  photos: Record<string, string>;
  /** The press (Mon atelier) the ticket is about, already checked against the user's org. */
  pressId?: string | null;
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
        company: record.company,
        subject: record.subject,
        anydesk: record.anydesk,
        description: record.description,
        asana_task_gid: record.asanaTaskGid,
        photos: record.photos,
        press_id: record.pressId ?? null,
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
  if (/(attente|waiting|client|customer|hold|pending|relance|action)/.test(s)) return 'waiting_customer';
  if (/(cours|progress|doing|traitement|wip|assign|prise en charge)/.test(s)) return 'in_progress';
  return 'new';
}

/** Map the Asana "Progress" field value (Received / In progress / Action needed
 * / Resolved / Closed) to a client-facing status. Null when unset/unknown so the
 * caller can fall back to the column. */
export function statusFromProgress(value: string | null): SupportStatus | null {
  const s = (value ?? '').toLowerCase();
  if (!s) return null;
  if (s.includes('clos')) return 'closed';
  if (s.includes('resolved') || s.includes('résolu') || s.includes('resolu')) return 'resolved';
  if (s.includes('action') || s.includes('waiting') || s.includes('attente')) return 'waiting_customer';
  if (s.includes('progress') || s.includes('cours')) return 'in_progress';
  if (s.includes('received') || s.includes('reçu') || s.includes('recu') || s.includes('new')) return 'new';
  return null;
}

export async function getSupportTicketByAsanaTask(gid: string): Promise<{
  id: string;
  email: string;
  status: SupportStatus;
  lastAgentStoryGid: string | null;
  company: string | null;
  subject: string | null;
} | null> {
  const supabase = adminClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from('support_tickets')
      .select('id, email, status, last_agent_story_gid, company, subject')
      .eq('asana_task_gid', gid)
      .maybeSingle();
    return data
      ? {
          id: data.id as string,
          email: data.email as string,
          status: data.status as SupportStatus,
          lastAgentStoryGid: (data.last_agent_story_gid as string | null) ?? null,
          company: (data.company as string | null) ?? null,
          subject: (data.subject as string | null) ?? null,
        }
      : null;
  } catch {
    return null;
  }
}

/** Relay a team comment tagged for the customer: store it (for the tracker) and
 * remember the story gid so a webhook re-delivery doesn't email twice. */
export async function setAgentMessageByAsanaTask(
  gid: string,
  storyGid: string,
  message: string
): Promise<void> {
  const supabase = adminClient();
  if (!supabase) return;
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('support_tickets')
      .update({ agent_message: message, agent_message_at: now, last_agent_story_gid: storyGid, updated_at: now })
      .eq('asana_task_gid', gid);
    if (error) console.error('support agent-message update failed:', error.message);
  } catch (error) {
    console.error('support agent-message update threw:', error);
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

/** Store the Asana assignee's name so the client sees who is handling the
 * ticket. Best-effort. */
export async function setSupportAssigneeByAsanaTask(gid: string, assigneeName: string | null): Promise<void> {
  const supabase = adminClient();
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('support_tickets')
      .update({ assignee_name: assigneeName })
      .eq('asana_task_gid', gid);
    if (error) console.error('support assignee update failed:', error.message);
  } catch (error) {
    console.error('support assignee update threw:', error);
  }
}

/** Record the live assignee of a Support-project task (form ticket or task
 * created in Asana) and say whether it moved. Compare-and-set: the row only
 * moves away from a different value, so when Asana re-delivers the same change
 * only one delivery sees `changed`. `known` is false the first time a task is
 * seen — the previous assignee is then unknown. Fails closed (no change) on any
 * error, so a hiccup never pings twice. */
export async function recordSupportTaskAssignee(
  taskGid: string,
  assigneeGid: string | null
): Promise<{ changed: boolean; known: boolean }> {
  const supabase = adminClient();
  if (!supabase) return { changed: false, known: true };
  const value = assigneeGid ?? '';
  const now = new Date().toISOString();
  try {
    const moved = await supabase
      .from('support_task_assignees')
      .update({ assignee_gid: value, updated_at: now })
      .eq('task_gid', taskGid)
      .neq('assignee_gid', value)
      .select('task_gid');
    if (moved.error) throw new Error(moved.error.message);
    if ((moved.data?.length ?? 0) > 0) return { changed: true, known: true };

    const inserted = await supabase
      .from('support_task_assignees')
      .upsert({ task_gid: taskGid, assignee_gid: value, updated_at: now }, { onConflict: 'task_gid', ignoreDuplicates: true })
      .select('task_gid');
    if (inserted.error) throw new Error(inserted.error.message);
    // A row came back only if this call created it: first sighting of the task.
    return (inserted.data?.length ?? 0) > 0 ? { changed: true, known: false } : { changed: false, known: true };
  } catch (error) {
    console.error('support_task_assignees update failed:', error);
    return { changed: false, known: true };
  }
}

/** Append a message to a ticket's conversation thread. Best-effort. */
export async function insertSupportMessage(m: {
  ticketId: string;
  author: 'team' | 'customer';
  body: string | null;
  photos?: string[];
  asanaStoryGid?: string | null;
}): Promise<void> {
  const supabase = adminClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from('support_messages').insert({
      ticket_id: m.ticketId,
      author: m.author,
      body: m.body,
      photos: m.photos ?? [],
      asana_story_gid: m.asanaStoryGid ?? null,
    });
    if (error) console.error('support_messages insert failed:', error.message);
  } catch (error) {
    console.error('support_messages insert threw:', error);
  }
}
