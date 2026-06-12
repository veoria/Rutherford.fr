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
