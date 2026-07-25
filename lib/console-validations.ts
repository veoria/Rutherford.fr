// Console-validation records — SERVER-ONLY.
//
// The console_validations table is the source of truth for every request: the
// intake route writes a row, the Asana webhook updates its status, and the
// customer portal reads it back (RLS scopes each user to their own rows).
//
// Writes use the service-role client and are best-effort: a storage hiccup must
// not break a submission, so failures are logged and swallowed.

import { createSupabaseAdminClient } from '@/lib/supabase/server';

export type ConsoleValidationStatus =
  | 'submitted'
  | 'in_review'
  | 'can_be_connected'
  | 'rejected'
  | 'changes_requested';

export type ConsoleValidationRecord = {
  userId: string | null;
  resellerId: string | null;
  refCode: string | null;
  email: string;
  company: string;
  country: string;
  machine: string;
  notes: string;
  pipedriveDealId: number | null;
  dropboxFolder: string | null;
  dropboxLink: string | null;
  asanaTaskGid: string | null;
  photos: Record<string, string>;
};

function adminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createSupabaseAdminClient();
}

export async function insertConsoleValidation(record: ConsoleValidationRecord): Promise<string | null> {
  const supabase = adminClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('console_validations')
      .insert({
        user_id: record.userId,
        reseller_id: record.resellerId,
        ref_code: record.refCode,
        email: record.email,
        company: record.company,
        country: record.country,
        machine: record.machine,
        notes: record.notes,
        pipedrive_deal_id: record.pipedriveDealId,
        dropbox_folder: record.dropboxFolder,
        dropbox_link: record.dropboxLink,
        asana_task_gid: record.asanaTaskGid,
        photos: record.photos,
      })
      .select('id')
      .single();
    if (error) {
      console.error('console_validations insert failed:', error.message);
      return null;
    }
    return data?.id ?? null;
  } catch (error) {
    console.error('console_validations insert threw:', error);
    return null;
  }
}

/** Persist who handles the request — the Asana assignee and followers — on
 * every task change (even while pending). Best-effort; surfaced in the admin so
 * "validations X handles" is filterable. No-op when the gid isn't one of ours. */
export async function setConsoleValidationAssignee(
  asanaTaskGid: string,
  who: { assignee: string | null; followers: string[] }
): Promise<void> {
  const supabase = adminClient();
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('console_validations')
      .update({ assignee: who.assignee, followers: who.followers, updated_at: new Date().toISOString() })
      .eq('asana_task_gid', asanaTaskGid);
    if (error) console.error('console_validations assignee update failed:', error.message);
  } catch (error) {
    console.error('console_validations assignee update threw:', error);
  }
}

/** Hide (or restore) a request when its Asana task is trashed / untrashed.
 *
 * The board is where the team culls test submissions and duplicates, so a
 * deleted card must take the request off the client's tracker. The row is kept
 * (logical delete) — restoring the task in Asana brings it back. Filtering on
 * the current state makes it idempotent: a webhook re-delivery updates nothing
 * and returns null. No-op when the gid isn't one of ours (e.g. a support task).
 */
export async function setConsoleValidationDeletedByAsanaTask(
  asanaTaskGid: string,
  deleted: boolean
): Promise<{ id: string; email: string; company: string | null; pipedriveDealId: number | null } | null> {
  const supabase = adminClient();
  if (!supabase) return null;
  try {
    const now = new Date().toISOString();
    let query = supabase
      .from('console_validations')
      .update(
        deleted
          ? { deleted_at: now, deleted_source: 'asana', updated_at: now }
          : { deleted_at: null, deleted_source: null, updated_at: now }
      )
      .eq('asana_task_gid', asanaTaskGid);
    query = deleted ? query.is('deleted_at', null) : query.not('deleted_at', 'is', null);
    const { data, error } = await query.select('id, email, company, pipedrive_deal_id');
    if (error) {
      console.error('console_validations delete flag update failed:', error.message);
      return null;
    }
    const row = (data ?? [])[0];
    return row
      ? {
          id: row.id as string,
          email: row.email as string,
          company: (row.company as string | null) ?? null,
          pipedriveDealId: (row.pipedrive_deal_id as number | null) ?? null,
        }
      : null;
  } catch (error) {
    console.error('console_validations delete flag update threw:', error);
    return null;
  }
}

/** Current status for a task, so the webhook can skip no-op re-deliveries. */
export async function getConsoleValidationStatusByAsanaTask(
  asanaTaskGid: string
): Promise<ConsoleValidationStatus | null> {
  const supabase = adminClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from('console_validations')
      .select('status')
      .eq('asana_task_gid', asanaTaskGid)
      .maybeSingle();
    return (data?.status as ConsoleValidationStatus) ?? null;
  } catch {
    return null;
  }
}

export async function updateConsoleValidationStatusByAsanaTask(
  asanaTaskGid: string,
  status: ConsoleValidationStatus,
  reviewer?: { reviewedBy?: string | null; reviewedAt?: string | null }
): Promise<void> {
  const supabase = adminClient();
  if (!supabase) return;
  try {
    const patch: Record<string, unknown> = { status };
    if (reviewer?.reviewedBy !== undefined) patch.reviewed_by = reviewer.reviewedBy;
    if (reviewer?.reviewedAt !== undefined) patch.reviewed_at = reviewer.reviewedAt;
    const { error } = await supabase
      .from('console_validations')
      .update(patch)
      .eq('asana_task_gid', asanaTaskGid);
    if (error) console.error('console_validations status update failed:', error.message);
  } catch (error) {
    console.error('console_validations status update threw:', error);
  }
}

/** The address transactional emails should go to: the account's notification
 * email when set, else the fallback (submission / login email). */
export async function getNotificationEmail(userId: string | null, fallback: string): Promise<string> {
  if (!userId) return fallback;
  const supabase = adminClient();
  if (!supabase) return fallback;
  try {
    const { data } = await supabase
      .from('profiles')
      .select('notification_email')
      .eq('id', userId)
      .maybeSingle();
    const notif = (data?.notification_email as string | null)?.trim();
    return notif || fallback;
  } catch {
    return fallback;
  }
}

/** Same, resolved from the request's Asana task (used by the verdict webhook,
 * which only knows the task). Falls back to the submission email. */
export async function getNotificationEmailByAsanaTask(
  asanaTaskGid: string,
  fallback: string
): Promise<string> {
  const supabase = adminClient();
  if (!supabase) return fallback;
  try {
    const { data } = await supabase
      .from('console_validations')
      .select('user_id')
      .eq('asana_task_gid', asanaTaskGid)
      .maybeSingle();
    return getNotificationEmail((data?.user_id as string | null) ?? null, fallback);
  } catch {
    return fallback;
  }
}

/** Resolve a validation from its Asana task, for the comment-relay webhook and
 * the verdict emails (which need the client's company / country / press). */
export async function getConsoleValidationByAsanaTask(gid: string): Promise<{
  id: string;
  email: string;
  company: string | null;
  country: string | null;
  machine: string | null;
  lastAgentStoryGid: string | null;
} | null> {
  const supabase = adminClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from('console_validations')
      .select('id, email, company, country, machine, last_agent_story_gid')
      .eq('asana_task_gid', gid)
      .maybeSingle();
    return data
      ? {
          id: data.id as string,
          email: data.email as string,
          company: (data.company as string | null) ?? null,
          country: (data.country as string | null) ?? null,
          machine: (data.machine as string | null) ?? null,
          lastAgentStoryGid: (data.last_agent_story_gid as string | null) ?? null,
        }
      : null;
  } catch {
    return null;
  }
}

/** Remember the last relayed team-comment story gid (email dedup). Best-effort. */
export async function setConsoleValidationAgentStory(gid: string, storyGid: string): Promise<void> {
  const supabase = adminClient();
  if (!supabase) return;
  try {
    await supabase
      .from('console_validations')
      .update({ last_agent_story_gid: storyGid, updated_at: new Date().toISOString() })
      .eq('asana_task_gid', gid);
  } catch {
    /* best-effort */
  }
}

/** Append a message to a validation's conversation thread. Best-effort. */
export async function insertConsoleValidationMessage(m: {
  validationId: string;
  author: 'team' | 'customer';
  body: string | null;
  photos?: string[];
  asanaStoryGid?: string | null;
}): Promise<void> {
  const supabase = adminClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from('console_validation_messages').insert({
      validation_id: m.validationId,
      author: m.author,
      body: m.body,
      photos: m.photos ?? [],
      asana_story_gid: m.asanaStoryGid ?? null,
    });
    if (error) console.error('console_validation_messages insert failed:', error.message);
  } catch (error) {
    console.error('console_validation_messages insert threw:', error);
  }
}
