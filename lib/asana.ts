// Asana sync — SERVER-ONLY.
//
// Creates one task in the "Console Validation V2" board per website
// console-validation request, mirroring the convention the team already uses
// (the board was previously fed by Typeform). Dormant-safe: a no-op without
// ASANA_ACCESS_TOKEN, and it never throws so a project-management hiccup can't
// break a submission.
//
// Env:
//   ASANA_ACCESS_TOKEN                 (required to activate — a Personal Access Token)
//   ASANA_CONSOLE_VALIDATION_PROJECT   (optional, defaults to the live board)
//   ASANA_CONSOLE_VALIDATION_SECTION   (optional, defaults to the "To do list" column)

const TOKEN = process.env.ASANA_ACCESS_TOKEN;
// "Console Validation V2" board and its "To do list" column.
const PROJECT = process.env.ASANA_CONSOLE_VALIDATION_PROJECT || '1124959442904601';
const SECTION = process.env.ASANA_CONSOLE_VALIDATION_SECTION || '1124959442904602';

const BASE = 'https://app.asana.com/api/1.0';
const TIMEOUT_MS = 10000;

// Form field id → label used in the existing board notes.
const PHOTO_LABELS: [field: string, label: string][] = [
  ['consolePhoto', 'Console photo'],
  ['pressPhoto', 'Press photo'],
  ['keysPhoto', 'Number of keys'],
  ['insideConsolePhoto', 'Computer / inside console'],
  ['platePhoto', 'Plate number'],
];

export type ConsoleValidationTask = {
  email: string;
  company: string;
  country: string;
  machine: string;
  notes: string;
  photoLinks: Record<string, string>;
  folderLink: string | null;
};

export function asanaEnabled(): boolean {
  return Boolean(TOKEN);
}

async function asana(path: string, body: unknown): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: body }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Asana POST ${path} → ${res.status} ${await res.text().catch(() => '')}`);
  return res.json();
}

export async function createConsoleValidationTask(lead: ConsoleValidationTask): Promise<void> {
  if (!TOKEN) return;
  try {
    const title = [lead.country, lead.company, lead.machine]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(' - ');

    const lines = [`e-mail : ${lead.email}`];
    for (const [field, label] of PHOTO_LABELS) {
      const link = lead.photoLinks[field];
      if (link) lines.push(`${label} : ${link}`);
    }
    if (lead.folderLink) lines.push(`All photos : ${lead.folderLink}`);
    if (lead.notes) lines.push(`Notes : ${lead.notes}`);
    lines.push('Source : rutherford.fr/console-validation');

    const created = await asana('/tasks', {
      name: title || 'Console validation request',
      notes: lines.join('\n'),
      projects: [PROJECT],
    });

    // Best-effort: move the task into the "To do list" column.
    const taskId = created?.data?.gid;
    if (taskId && SECTION) {
      await asana(`/sections/${SECTION}/addTask`, { task: taskId }).catch(() => {});
    }
  } catch (error) {
    console.error('Asana console-validation sync failed:', error);
  }
}
