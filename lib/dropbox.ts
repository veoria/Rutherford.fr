// Dropbox upload — SERVER-ONLY.
//
// Stores each console-validation request in the team's Dropbox: a folder named
// after the Pipedrive deal, containing the photos and an infos.txt recap.
// Dormant-safe — when no credentials are set, dropboxEnabled() is false and the
// API route falls back to Supabase Storage.
//
// Auth (preferred = refresh token, since Dropbox access tokens expire in ~4h):
//   DROPBOX_REFRESH_TOKEN + DROPBOX_APP_KEY + DROPBOX_APP_SECRET
//   DROPBOX_ACCESS_TOKEN                                          (quick test only)
//
// Location & team space:
//   DROPBOX_FOLDER       base path (default "/Dossier RUTHERFORD/Prospects information")
//   DROPBOX_PATH_ROOT    team namespace id, to write into a Team space folder
//   DROPBOX_SELECT_USER  team_member_id, when using a team-scoped token

const ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;
const REFRESH_TOKEN = process.env.DROPBOX_REFRESH_TOKEN;
const APP_KEY = process.env.DROPBOX_APP_KEY;
const APP_SECRET = process.env.DROPBOX_APP_SECRET;
const BASE_FOLDER = (process.env.DROPBOX_FOLDER || '/Dossier RUTHERFORD/Prospects information').replace(/\/+$/, '');
const PATH_ROOT = process.env.DROPBOX_PATH_ROOT;
const SELECT_USER = process.env.DROPBOX_SELECT_USER;

const TIMEOUT_MS = 20000;

export function dropboxEnabled(): boolean {
  return Boolean(ACCESS_TOKEN || (REFRESH_TOKEN && APP_KEY && APP_SECRET));
}

// Dropbox path segments can't contain "/"; keep the rest of the deal title.
export function dropboxSafeName(name: string): string {
  return name.replace(/\//g, '-').replace(/\s+/g, ' ').trim().slice(0, 200) || 'request';
}

// The Dropbox-API-Arg header must be ASCII; escape any non-ASCII to \uXXXX
// (per UTF-16 code unit, so surrogate pairs survive too).
function dbxArg(obj: unknown): string {
  const s = JSON.stringify(obj);
  let out = '';
  for (let i = 0; i < s.length; i += 1) {
    const code = s.charCodeAt(i);
    out += code > 0x7f ? '\\u' + code.toString(16).padStart(4, '0') : s[i];
  }
  return out;
}

function teamHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (PATH_ROOT) headers['Dropbox-API-Path-Root'] = JSON.stringify({ '.tag': 'namespace_id', namespace_id: PATH_ROOT });
  if (SELECT_USER) headers['Dropbox-API-Select-User'] = SELECT_USER;
  return headers;
}

async function getAccessToken(): Promise<string> {
  if (REFRESH_TOKEN && APP_KEY && APP_SECRET) {
    const res = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${APP_KEY}:${APP_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: REFRESH_TOKEN }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Dropbox token refresh → ${res.status} ${await res.text().catch(() => '')}`);
    return (await res.json()).access_token as string;
  }
  if (ACCESS_TOKEN) return ACCESS_TOKEN;
  throw new Error('Dropbox not configured');
}

async function uploadFile(token: string, path: string, body: ArrayBuffer | Uint8Array): Promise<void> {
  const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': dbxArg({ path, mode: 'add', autorename: true, mute: true }),
      ...teamHeaders(),
    },
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Dropbox upload ${path} → ${res.status} ${await res.text().catch(() => '')}`);
}

// Returns a shareable URL; if a link already exists Dropbox replies 409 with the
// existing link in the error payload, which we recover.
async function createSharedLink(token: string, path: string): Promise<string | null> {
  const res = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...teamHeaders() },
    body: JSON.stringify({ path }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  if (res.ok) return ((await res.json()).url as string) ?? null;
  if (res.status === 409) {
    const json = await res.json().catch(() => null);
    const existing = json?.error?.shared_link_already_exists?.metadata?.url;
    if (existing) return existing as string;
  }
  return null;
}

export type DropboxUpload = {
  links: Record<string, string>;
  folderLink: string | null;
  folderPath: string;
  count: number;
};

/**
 * Upload the photos and an infos.txt recap into "<BASE_FOLDER>/<folderName>/".
 * Throws on a hard failure (auth/network) so the caller can fall back to
 * Supabase Storage.
 */
export async function uploadConsoleValidation(
  folderName: string,
  photos: { field: string; file: File }[],
  infosTxt: string
): Promise<DropboxUpload> {
  const token = await getAccessToken();
  const folderPath = `${BASE_FOLDER}/${dropboxSafeName(folderName)}`;
  const links: Record<string, string> = {};
  let count = 0;

  for (const { field, file } of photos) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `${folderPath}/${field}.${ext}`;
    await uploadFile(token, path, await file.arrayBuffer());
    count += 1;
    const link = await createSharedLink(token, path).catch(() => null);
    if (link) links[field] = link;
  }

  await uploadFile(token, `${folderPath}/infos.txt`, new TextEncoder().encode(infosTxt)).catch(() => {});

  const folderLink = await createSharedLink(token, folderPath).catch(() => null);
  return { links, folderLink, folderPath, count };
}
