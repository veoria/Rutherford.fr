// Asana sync — SERVER-ONLY.
//
// Creates one task in the "Console Validation V2" board per website
// console-validation request (the board previously fed by Typeform), and reads
// a task's current section back for the webhook that mirrors approvals.
// Dormant-safe: a no-op without ASANA_ACCESS_TOKEN, and create never throws.
//
// Env:
//   ASANA_ACCESS_TOKEN                 (required — a Personal Access Token)
//   ASANA_CONSOLE_VALIDATION_PROJECT   (optional, defaults to the live board)
//   ASANA_CONSOLE_VALIDATION_SECTION   (optional, defaults to the "To do list" column)
//   ASANA_FX_GID                       (optional, assignee — defaults to FX)
//   ASANA_FOLLOWER_GID                 (optional, extra follower — Shajith)

const TOKEN = process.env.ASANA_ACCESS_TOKEN;
const PROJECT = process.env.ASANA_CONSOLE_VALIDATION_PROJECT || '1124959442904601';
const SECTION = process.env.ASANA_CONSOLE_VALIDATION_SECTION || '1124959442904602';
const ASSIGNEE = process.env.ASANA_FX_GID || '21871830348447';
const FOLLOWER = process.env.ASANA_FOLLOWER_GID;

const BASE = 'https://app.asana.com/api/1.0';

/** Task UI URL for the admin back-office. */
export function asanaTaskUrl(gid: string | null): string | null {
  return gid ? `https://app.asana.com/0/0/${gid}` : null;
}
const TIMEOUT_MS = 10000;

const PHOTO_LABELS: [field: string, label: string][] = [
  ['consolePhoto', 'Console photo'],
  ['pressPhoto', 'Press photo'],
  ['keysPhoto', 'Number of keys'],
  ['insideConsolePhoto', 'Computer / inside console'],
  ['platePhoto', 'Plate number'],
];

export function asanaEnabled(): boolean {
  return Boolean(TOKEN);
}

async function asana(method: 'GET' | 'POST', path: string, body?: unknown): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify({ data: body }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Asana ${method} ${path} → ${res.status} ${await res.text().catch(() => '')}`);
  return res.json();
}

export type ConsoleValidationTask = {
  title: string; // full task name, incl. "- ID{deal}"
  email: string;
  notes: string;
  photoLinks: Record<string, string>;
  folderLink: string | null;
};

/** Create the task; returns its gid (stored so the webhook can map it back). */
export async function createConsoleValidationTask(task: ConsoleValidationTask): Promise<string | null> {
  if (!TOKEN) return null;
  try {
    const lines = [`e-mail : ${task.email}`];
    for (const [field, label] of PHOTO_LABELS) {
      const link = task.photoLinks[field];
      if (link) lines.push(`${label} : ${link}`);
    }
    if (task.folderLink) lines.push(`All photos : ${task.folderLink}`);
    if (task.notes) lines.push(`Notes : ${task.notes}`);
    lines.push('Source : rutherford.fr/console-validation');

    const created = await asana('POST', '/tasks', {
      name: task.title || 'Console validation request',
      notes: lines.join('\n'),
      projects: [PROJECT],
      due_on: new Date().toISOString().slice(0, 10),
      ...(ASSIGNEE ? { assignee: ASSIGNEE } : {}),
      ...(FOLLOWER ? { followers: [FOLLOWER] } : {}),
    });

    const gid = created?.data?.gid as string | undefined;
    if (gid && SECTION) {
      await asana('POST', `/sections/${SECTION}/addTask`, { task: gid }).catch(() => {});
    }
    return gid ?? null;
  } catch (error) {
    console.error('Asana console-validation sync failed:', error);
    return null;
  }
}

/** Post a comment (story) on a task — used to relay a customer's reply. No-op
 * without a token; never throws. Returns whether it succeeded. */
export async function addConsoleValidationTaskComment(taskGid: string, text: string): Promise<boolean> {
  if (!TOKEN || !taskGid || !text.trim()) return false;
  try {
    await asana('POST', `/tasks/${taskGid}/stories`, { text });
    return true;
  } catch (error) {
    console.error('Asana add-comment failed:', error);
    return false;
  }
}

export type AsanaTaskState = {
  name: string;
  notes: string;
  sectionName: string | null;
  // The verdict lives in the task's Approval status (the board uses Asana
  // approvals: pending / approved / changes_requested / rejected), and the
  // approver is whoever completed the approval.
  approvalStatus: string | null;
  completedByName: string | null;
  completedAt: string | null;
};

/**
 * Read a task's name, notes, section, approval status and approver. Used by the
 * webhook (Asana events are diffs, so we re-fetch to learn the live state).
 * Returns null when not configured or on failure.
 */
export async function getConsoleValidationTaskState(taskGid: string): Promise<AsanaTaskState | null> {
  if (!TOKEN) return null;
  try {
    const res = await asana(
      'GET',
      `/tasks/${taskGid}?opt_fields=name,notes,approval_status,completed_at,completed_by.name,memberships.section.name,memberships.project.gid`
    );
    const data = res?.data;
    if (!data) return null;
    const membership = (data.memberships ?? []).find((m: any) => m?.project?.gid === PROJECT);
    return {
      name: data.name ?? '',
      notes: data.notes ?? '',
      sectionName: membership?.section?.name ?? null,
      approvalStatus: data.approval_status ?? null,
      completedByName: data.completed_by?.name ?? null,
      completedAt: data.completed_at ?? null,
    };
  } catch (error) {
    console.error('Asana task fetch failed:', error);
    return null;
  }
}

const SUPPORT_PROJECT = process.env.ASANA_SUPPORT_PROJECT;

// Custom fields on the Support Ticket project that we populate from intake.
const SUPPORT_FIELD_EMAIL = '1208065131606487'; // text
const SUPPORT_FIELD_COUNTRY = '1208065359722148'; // enum
// "Progress" enum field — the team drives the ticket status here, and a new
// ticket is created as "Received". The webhook maps this value to the
// client-facing status. (Field gid is stable across label renames.)
const SUPPORT_FIELD_PROGRESS = '1215692125740415';
const SUPPORT_PROGRESS_RECEIVED = '1215692125740416';
// Country enum option gids — must match the project's "Country" field options
// (and the names in lib/support-countries.ts).
const SUPPORT_COUNTRY_OPTIONS: Record<string, string> = {
  Mexico: '1208065359722149',
  Chile: '1208065359722150',
  India: '1208065359722151',
  China: '1208065359722152',
  France: '1208065359722153',
  UK: '1208065359722154',
  USA: '1208065359722155',
  Italy: '1208065359722156',
  Spain: '1208065359722157',
  Russia: '1208065359722158',
  Thailand: '1208065359722159',
  Japan: '1208065359722160',
  Germany: '1208065359722161',
  Uruguay: '1208065359722162',
  'South Africa': '1208065359722163',
  'Saudi Arabia': '1208065359722164',
  UAE: '1208065359722165',
  Indonesia: '1208065359722166',
  Nouméa: '1208065359722167',
  Other: '1208065359722168',
};

const supportSummary = (description: string) => {
  const first = (description.split('\n')[0] ?? '').trim();
  return first.length > 60 ? `${first.slice(0, 60)}…` : first;
};

export type SupportTask = {
  email: string;
  anydesk: string;
  description: string;
  company?: string;
  subject?: string;
  // Must match a SUPPORT_COUNTRY_OPTIONS key to set the Asana Country field.
  country?: string;
};

/** Create a support ticket task in the Asana Support project. Returns its gid.
 * No-op (null) without a token or ASANA_SUPPORT_PROJECT; never throws. */
export async function createSupportTask(task: SupportTask): Promise<string | null> {
  if (!TOKEN || !SUPPORT_PROJECT) return null;
  try {
    const lines = [`e-mail : ${task.email}`];
    if (task.anydesk) lines.push(`AnyDesk : ${task.anydesk}`);
    if (task.description) lines.push('', task.description);
    lines.push('', 'Source : rutherford.fr/support');

    // Task name: "[Company] – short summary" (subject if given, else 1st line).
    const summary = (task.subject?.trim() || supportSummary(task.description)) || 'Support';
    const company = task.company?.trim();
    const name = company ? `[${company}] – ${summary}` : summary;

    const customFields: Record<string, string> = {
      [SUPPORT_FIELD_EMAIL]: task.email,
      [SUPPORT_FIELD_PROGRESS]: SUPPORT_PROGRESS_RECEIVED,
    };
    const countryGid = task.country ? SUPPORT_COUNTRY_OPTIONS[task.country] : undefined;
    if (countryGid) customFields[SUPPORT_FIELD_COUNTRY] = countryGid;

    const created = await asana('POST', '/tasks', {
      name,
      notes: lines.join('\n'),
      projects: [SUPPORT_PROJECT],
      custom_fields: customFields,
      ...(ASSIGNEE ? { assignee: ASSIGNEE } : {}),
      ...(FOLLOWER ? { followers: [FOLLOWER] } : {}),
    });
    return (created?.data?.gid as string) ?? null;
  } catch (error) {
    console.error('Asana support task create failed:', error);
    return null;
  }
}

/** Post a comment on a support task — used to relay a customer's reply so the
 * assignee/followers are notified. No-op without a token; never throws. */
export async function addSupportTaskComment(taskGid: string, text: string): Promise<boolean> {
  if (!TOKEN || !taskGid || !text.trim()) return false;
  try {
    await asana('POST', `/tasks/${taskGid}/stories`, { text });
    return true;
  } catch (error) {
    console.error('Asana support add-comment failed:', error);
    return false;
  }
}

/** Attach an actual image file (not a link) to a support task. The bytes are
 * read server-side and streamed to Asana's multipart endpoint, so this isn't
 * bound by the request body limit. No-op without a token; never throws. */
export async function addSupportTaskAttachment(
  taskGid: string,
  filename: string,
  file: Blob
): Promise<boolean> {
  if (!TOKEN || !taskGid) return false;
  try {
    const form = new FormData();
    form.append('parent', taskGid);
    form.append('file', file, filename);
    const res = await fetch(`${BASE}/attachments`, {
      method: 'POST',
      // No Content-Type — let fetch set the multipart boundary.
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: form,
      signal: AbortSignal.timeout(30000),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('Asana support attachment failed:', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (error) {
    console.error('Asana support attachment threw:', error);
    return false;
  }
}

export type AsanaStory = { text: string; isComment: boolean; createdByName: string | null };

/** Read a story (comment / activity) by gid. Used by the webhook to relay a
 * team comment tagged for the customer. Null when not configured / on failure. */
export async function getStory(storyGid: string): Promise<AsanaStory | null> {
  if (!TOKEN) return null;
  try {
    const res = await asana('GET', `/stories/${storyGid}?opt_fields=text,type,resource_subtype,created_by.name`);
    const d = res?.data;
    if (!d) return null;
    return {
      text: d.text ?? '',
      isComment: d.type === 'comment' || d.resource_subtype === 'comment_added',
      createdByName: d.created_by?.name ?? null,
    };
  } catch (error) {
    console.error('Asana story fetch failed:', error);
    return null;
  }
}

export type SupportTaskState = {
  name: string;
  sectionName: string | null;
  completed: boolean;
  assigneeName: string | null;
  progress: string | null;
};

/** Read a support task's "Progress" field, column, completion and assignee, for
 * the webhook. Null when not configured / on failure. */
export async function getSupportTaskState(taskGid: string): Promise<SupportTaskState | null> {
  if (!TOKEN || !SUPPORT_PROJECT) return null;
  try {
    const res = await asana(
      'GET',
      `/tasks/${taskGid}?opt_fields=name,completed,assignee.name,memberships.section.name,memberships.project.gid,custom_fields.gid,custom_fields.enum_value.name`
    );
    const data = res?.data;
    if (!data) return null;
    const membership = (data.memberships ?? []).find((m: any) => m?.project?.gid === SUPPORT_PROJECT);
    const progressField = (data.custom_fields ?? []).find((c: any) => c?.gid === SUPPORT_FIELD_PROGRESS);
    return {
      name: data.name ?? '',
      sectionName: membership?.section?.name ?? null,
      completed: Boolean(data.completed),
      assigneeName: data.assignee?.name ?? null,
      progress: progressField?.enum_value?.name ?? null,
    };
  } catch (error) {
    console.error('Asana support task fetch failed:', error);
    return null;
  }
}
