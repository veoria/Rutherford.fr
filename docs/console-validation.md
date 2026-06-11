# Console validation — lead routing

How a submission on **rutherford.fr/console-validation** is handled, and how to
connect each downstream service.

## Flow

1. The visitor fills the form (`components/console-validation-page.tsx`) and
   uploads up to five photos straight from their phone.
2. The browser POSTs `multipart/form-data` to `app/api/console-validation/route.ts`.
3. The route validates the fields, then:
   - **Photos →** Dropbox if configured, otherwise Supabase Storage (fallback).
     Either way it produces clickable links + a folder reference.
   - **Asana →** one task in the *Console Validation V2* board (`lib/asana.ts`).
   - **Pipedrive →** Person + Organization + Note (`lib/pipedrive.ts`).
4. The visitor sees the thank-you screen.

Every integration is **dormant-safe**: leave its env vars blank and that step is
skipped without breaking the others. With nothing configured at all, photos
still land in Supabase Storage so no lead is ever lost.

## Environment variables

Set these in **Vercel → Project (`rutherford`) → Settings → Environment
Variables** (Production + Preview), and locally in `.env.local`. Template:
`.env.local.example`.

### Dropbox (photo storage)

Recommended: a long-lived **refresh token** (Dropbox access tokens now expire
after ~4h; the route exchanges the refresh token for a fresh one per upload).

1. https://www.dropbox.com/developers/apps → **Create app** → *Scoped access* →
   *Full Dropbox* (or *App folder* if you prefer an isolated folder).
2. **Permissions** tab — enable `files.content.write`, `files.content.read`,
   `sharing.write`. Submit.
3. **Settings** tab — copy the **App key** and **App secret**.
4. Generate a refresh token once (OAuth with `token_access_type=offline`):
   - Open `https://www.dropbox.com/oauth2/authorize?client_id=APP_KEY&response_type=code&token_access_type=offline`,
     approve, copy the `code`.
   - Exchange it:
     ```
     curl https://api.dropbox.com/oauth2/token \
       -d code=THE_CODE -d grant_type=authorization_code \
       -u APP_KEY:APP_SECRET
     ```
   - The JSON `refresh_token` is what you store.

```
DROPBOX_REFRESH_TOKEN=...
DROPBOX_APP_KEY=...
DROPBOX_APP_SECRET=...
# DROPBOX_FOLDER=/Console Validations   # optional, this is the default
```

For a one-off test you can instead drop a raw `DROPBOX_ACCESS_TOKEN=` (Settings
tab → *Generate access token*), but it stops working after ~4h.

### Asana (task per request)

Tasks are created in **Console Validation V2** (project `1124959442904601`),
landing in the **To do list** column (section `1124959442904602`) — the same
board, with the same note layout, that Typeform used to feed.

1. Asana → **Settings → Apps → Developer apps → Personal access tokens** →
   *Create new token*.
2. The token's user must be a member of the board.

```
ASANA_ACCESS_TOKEN=...
# ASANA_CONSOLE_VALIDATION_PROJECT / ASANA_CONSOLE_VALIDATION_SECTION
# default to the live board — only set them to retarget.
```

### Pipedrive (CRM)

```
PIPEDRIVE_API_TOKEN=...          # Pipedrive → Personal preferences → API
# PIPEDRIVE_DOMAIN=veoria        # optional subdomain → veoria.pipedrive.com
```

## Verifying

After setting the vars and redeploying, submit a test request and confirm:

- a folder under *Console Validations/* in Dropbox with the photos + `request.json`,
- a new task in *Console Validation V2 → To do list*,
- a Note on the Person/Organization in Pipedrive.

Server-side failures are logged (`console-validation … failed`) and visible in
the Vercel runtime logs without ever failing the visitor's submission.
