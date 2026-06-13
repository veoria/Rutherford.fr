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
