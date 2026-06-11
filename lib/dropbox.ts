// Dropbox upload — SERVER-ONLY.
//
// Stores console-validation photos in Dropbox so the sales team finds them
// next to the leads they already manage. Dormant-safe: when no Dropbox
// credentials are set, dropboxEnabled() is false and the API route transparently
// falls back to Supabase Storage.
//
// Two auth modes are supported:
//   1. Long-lived refresh token (recommended). Dropbox access tokens now expire
//      after ~4h, so we exchange a refresh token for a fresh access token on
//      every submission.
//        DROPBOX_REFRESH_TOKEN + DROPBOX_APP_KEY + DROPBOX_APP_SECRET
//   2. A raw access token (handy for a quick test, but it will stop working
//      once the 4h window closes).
//        DROPBOX_ACCESS_TOKEN
//
// Env:
//   DROPBOX_REFRESH_TOKEN / DROPBOX_APP_KEY / DROPBOX_APP_SECRET  (preferred)
//   DROPBOX_ACCESS_TOKEN                                          (alternative)
//   DROPBOX_FOLDER   (optional base path, default "/Console Validations")

const ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;
const REFRESH_TOKEN = process.env.DROPBOX_REFRESH_TOKEN;
const APP_KEY = process.env.DROPBOX_APP_KEY;
const APP_SECRET = process.env.DROPBOX_APP_SECRET;
const BASE_FOLDER = (process.env.DROPBOX_FOLDER || '/Console Validations').replace(/\/+$/, '');

const TIMEOUT_MS = 20000;

export function dropboxEnabled(): boolean {
  return Boolean(ACCESS_TOKEN || (REFRESH_TOKEN && APP_KEY && APP_SECRET));
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
    if (!res.ok) throw new Error(`Dropbox token refresh → ${res.status}`);
    const json = await res.json();
    return json.access_token as string;
  }
  if (ACCESS_TOKEN) return ACCESS_TOKEN;
  throw new Error('Dropbox not configured');
}

async function uploadFile(
  token: string,
  path: string,
  body: ArrayBuffer | Uint8Array
): Promise<void> {
  const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({ path, mode: 'add', autorename: true, mute: true }),
    },
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Dropbox upload ${path} → ${res.status} ${await res.text().catch(() => '')}`);
}

// Returns a shareable URL for a Dropbox path. If a link already exists Dropbox
// replies 409 with the existing link in the error payload, which we recover.
async function createSharedLink(token: string, path: string): Promise<string | null> {
  const res = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  if (res.ok) {
    const json = await res.json();
    return (json.url as string) ?? null;
  }
  if (res.status === 409) {
    const json = await res.json().catch(() => null);
    const existing = json?.error?.shared_link_already_exists?.metadata?.url;
    if (existing) return existing as string;
  }
  return null;
}

export type DropboxUpload = {
  /** field id → shared link, for every photo we managed to share. */
  links: Record<string, string>;
  /** shared link to the whole request folder, when available. */
  folderLink: string | null;
  /** Dropbox path of the request folder (used as a human-readable reference). */
  folderPath: string;
  /** number of photos uploaded. */
  count: number;
};

/**
 * Upload all photos (+ a request.json manifest) for one console-validation
 * request into "<DROPBOX_FOLDER>/<folder>/" and return per-photo share links.
 * Throws on a hard failure (auth/network) so the caller can fall back to
 * Supabase Storage.
 */
export async function uploadConsoleValidation(
  folder: string,
  photos: { field: string; file: File }[],
  requestJson: string
): Promise<DropboxUpload> {
  const token = await getAccessToken();
  const folderPath = `${BASE_FOLDER}/${folder}`;
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

  // Manifest is best-effort — losing it must not fail an otherwise-good upload.
  await uploadFile(token, `${folderPath}/request.json`, new TextEncoder().encode(requestJson)).catch(
    () => {}
  );

  const folderLink = await createSharedLink(token, folderPath).catch(() => null);

  return { links, folderLink, folderPath, count };
}
