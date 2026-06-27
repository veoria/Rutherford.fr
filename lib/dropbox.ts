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

function teamHeaders(pathRootOverride?: string | null): Record<string, string> {
  const headers: Record<string, string> = {};
  const pathRoot = pathRootOverride === undefined ? PATH_ROOT : pathRootOverride;
  if (pathRoot) headers['Dropbox-API-Path-Root'] = JSON.stringify({ '.tag': 'namespace_id', namespace_id: pathRoot });
  if (SELECT_USER) headers['Dropbox-API-Select-User'] = SELECT_USER;
  return headers;
}

export async function getAccessToken(): Promise<string> {
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

// ---------------------------------------------------------------------------
// Diagnostics & repair (admin /api/admin/dropbox-debug).
//
// A Dropbox Business account exposes two namespaces: the member's personal
// "home" and the shared "team space" (root). With a user token and NO path-root
// set, every write lands in the personal home — which is why the validation
// folders ended up under "<your name>/Dossier RUTHERFORD/Prospects information"
// instead of the team's "Dossier RUTHERFORD/Prospects information". The fix is
// to set DROPBOX_PATH_ROOT to the team's root_namespace_id (reported below).
// ---------------------------------------------------------------------------

export type DropboxListing = { ok: boolean; status?: number; error?: string; folders?: string[] };

export async function dropboxGetAccount(token: string): Promise<any | null> {
  const res = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export async function dropboxListFolder(token: string, path: string, pathRoot?: string | null): Promise<DropboxListing> {
  const res = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...teamHeaders(pathRoot) },
    body: JSON.stringify({ path, recursive: false, limit: 1000 }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) return { ok: false, status: res.status, error: json?.error_summary || `${res.status}` };
  const folders = (json?.entries ?? []).filter((e: any) => e['.tag'] === 'folder').map((e: any) => e.name as string);
  return { ok: true, folders };
}

export async function dropboxMoveFolder(
  token: string,
  fromPath: string,
  toPath: string,
  pathRoot?: string | null
): Promise<{ ok: boolean; status?: number; error?: string; path?: string }> {
  const res = await fetch('https://api.dropboxapi.com/2/files/move_v2', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...teamHeaders(pathRoot) },
    body: JSON.stringify({ from_path: fromPath, to_path: toPath, autorename: true }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) return { ok: false, status: res.status, error: json?.error_summary || `${res.status}` };
  return { ok: true, path: json?.metadata?.path_display ?? toPath };
}

export type DropboxDiagnostics = {
  account: { name: string | null; email: string | null; accountId: string | null; team: string | null } | null;
  namespaces: { rootNamespaceId: string | null; homeNamespaceId: string | null; isTeamSpace: boolean };
  config: { baseFolder: string; pathRoot: string | null; selectUser: string | null; usingRefreshToken: boolean };
  whereFoldersAre: { label: string; pathRoot: string | null; listing: DropboxListing }[];
  fix: string | null;
};

export async function dropboxDiagnostics(): Promise<DropboxDiagnostics> {
  const token = await getAccessToken();
  const account = await dropboxGetAccount(token);
  const root = account?.root_info ?? null;
  const homeNs = (root?.home_namespace_id as string | undefined) ?? null;
  const rootNs = (root?.root_namespace_id as string | undefined) ?? null;
  const isTeamSpace = Boolean(homeNs && rootNs && homeNs !== rootNs);

  const whereFoldersAre: { label: string; pathRoot: string | null; listing: DropboxListing }[] = [
    { label: 'configured (current env)', pathRoot: PATH_ROOT ?? null, listing: await dropboxListFolder(token, BASE_FOLDER) },
  ];
  if (homeNs) {
    whereFoldersAre.push({ label: 'personal home namespace', pathRoot: homeNs, listing: await dropboxListFolder(token, BASE_FOLDER, homeNs) });
  }
  if (rootNs && rootNs !== homeNs) {
    whereFoldersAre.push({ label: 'team space (root namespace)', pathRoot: rootNs, listing: await dropboxListFolder(token, BASE_FOLDER, rootNs) });
  }

  let fix: string | null = null;
  if (isTeamSpace && !PATH_ROOT) {
    fix = `Set DROPBOX_PATH_ROOT="${rootNs}" in Vercel (keep DROPBOX_FOLDER="${BASE_FOLDER}"), then redeploy — new validations land in the team space. Then call ?move=1 to relocate the existing folders.`;
  } else if (isTeamSpace && PATH_ROOT) {
    fix = `DROPBOX_PATH_ROOT is set to "${PATH_ROOT}" (team root is "${rootNs}"). New validations target the team space.`;
  } else if (!isTeamSpace) {
    fix = 'This token sees a single namespace (no separate team space). The base folder is written directly; verify DROPBOX_FOLDER and the authorising account.';
  }

  return {
    account: account
      ? {
          name: account?.name?.display_name ?? null,
          email: account?.email ?? null,
          accountId: account?.account_id ?? null,
          team: account?.team?.name ?? null,
        }
      : null,
    namespaces: { rootNamespaceId: rootNs, homeNamespaceId: homeNs, isTeamSpace },
    config: {
      baseFolder: BASE_FOLDER,
      pathRoot: PATH_ROOT ?? null,
      selectUser: SELECT_USER ?? null,
      usingRefreshToken: Boolean(REFRESH_TOKEN && APP_KEY && APP_SECRET),
    },
    whereFoldersAre,
    fix,
  };
}
