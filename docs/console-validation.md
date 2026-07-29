# Console validation — intake, status & customer portal

Replaces the old **Typeform + 4 Zaps** workflow with the website form
(`rutherford.fr/console-validation`) and direct API integrations. Every
integration is **dormant-safe**: leave its env vars blank and that step is
skipped without breaking the others.

## Flow

### Intake — `app/api/console-validation/route.ts` (replaces Zap A)
1. Visitor submits the form with up to five photos (`?ref=` reseller code is carried through).
2. **Pipedrive Deal first** (`lib/pipedrive.ts`, API v2) → the deal id stamps the
   title `Country - Company - Machine - ID{id}`. That id is the spine of the workflow.
3. **Dropbox** (`lib/dropbox.ts`) → folder named after the deal under
   `/Dossier RUTHERFORD/Prospects information`, with the photos + `infos.txt`.
   Falls back to Supabase Storage when Dropbox isn't configured.
4. **Asana task** (`lib/asana.ts`) in *Console Validation V2 → To do list*, named with
   the deal id, assignee FX, follower Shajith, photo links in the notes.
5. **Acknowledgement email** to the client (`lib/msgraph.ts` + `lib/console-validation-emails.ts`).
6. **Row** written to `console_validations` (Supabase) — the source of truth.

### Approval — `app/api/asana-webhook/route.ts` (replaces Zaps B/C/D)
When FX moves the card, Asana calls the webhook → it maps the section to a status,
updates the row, emails the client and adds a Pipedrive note:

| Section | Status | Client email | Pipedrive note |
|---|---|---|---|
| Can be connected | `can_be_connected` | "we can connect…" (BCC fx+fabrice) | "…can be connected" |
| Rejected | `rejected` | "we cannot connect…" | "…cannot be connected" |
| In progress | `changes_requested` | — | "Please contact FX. We need more info…" |

### Suppression — tests & doublons

Supprimer la tâche dans Asana (corbeille) retire la demande du suivi client.
Asana envoie un événement `deleted` sur la tâche → le webhook passe la ligne en
**suppression logique** (`deleted_at`, `deleted_source = 'asana'`) :

- elle disparaît de `/account/console-validations`, de la vue d'accueil du compte
  et de la vue revendeur (la policy RLS exclut `deleted_at not null`, les lectures
  service-role filtrent explicitement) ;
- la réponse client (`POST /api/console-validation/[id]/reply`) renvoie 404, la
  ligne n'étant plus lisible par son propriétaire ;
- rien n'est effacé : la ligne, le fil de messages, le Deal Pipedrive et le
  dossier Dropbox restent en place ;
- le back-office la conserve, hors liste par défaut — filtre **« Supprimées dans
  Asana »** de l'onglet Validations, badge sur la fiche compte, et une entrée
  `console_validation.hide` dans le journal admin ;
- **restaurer** la tâche depuis la corbeille Asana (`undeleted`) réaffiche la
  demande côté client (`console_validation.restore` au journal).

Seuls `deleted` / `undeleted` sur une tâche sont interprétés : `removed` se
déclenche aussi quand une carte change simplement de colonne. Les tickets de
support ne sont pas concernés (le webhook les laisse intacts).

### Customer portal — `/account/console-validations`
Signed-in clients/resellers track their requests and live status. Reuses the
Academy's Supabase auth. RLS scopes each user to their own rows (by `user_id`
**or** the email they registered with). Gated by `NEXT_PUBLIC_CONSOLE_TRACKING_ENABLED`.
The `reseller_id` / `ref_code` columns are in place for future reseller views.

## Data model

`console_validations` (migration applied to the Rutherford Academy project):
`id, user_id, reseller_id, ref_code, email, company, country, machine, notes,
status, pipedrive_deal_id, dropbox_folder, dropbox_link, asana_task_gid, photos,
deleted_at, deleted_source`.
Written by the service role only; read via RLS.

> `deleted_at` / `deleted_source` viennent de
> `supabase/migrations/20260725_console_validation_deletion_sync.sql` — à passer
> dans le SQL editor **avant** de déployer, sinon les lectures filtrées sur
> `deleted_at` échouent (colonne inconnue).

## Environment variables

Set in **Vercel → `rutherford-fr` (serves rutherford.fr) → Production**, and `.env.local`.
Template: `.env.local.example`.

```
# Portal
NEXT_PUBLIC_CONSOLE_TRACKING_ENABLED=true

# Pipedrive (Deal API v2 + Notes)
PIPEDRIVE_API_TOKEN= · PIPEDRIVE_DOMAIN= · PIPEDRIVE_PIPELINE_ID= · PIPEDRIVE_STAGE_ID= · PIPEDRIVE_OWNER_ID=

# Dropbox (refresh-token preferred; Team space needs PATH_ROOT/SELECT_USER)
DROPBOX_REFRESH_TOKEN= · DROPBOX_APP_KEY= · DROPBOX_APP_SECRET= · DROPBOX_FOLDER= · DROPBOX_PATH_ROOT= · DROPBOX_SELECT_USER=

# Asana (PAT; project/section/FX default to the live board)
ASANA_ACCESS_TOKEN= · ASANA_FOLLOWER_GID= (Shajith) · ASANA_WEBHOOK_SECRET=

# Microsoft Graph (Mail.Send application permission on MAIL_FROM)
MSGRAPH_TENANT_ID= · MSGRAPH_CLIENT_ID= · MSGRAPH_CLIENT_SECRET= · MAIL_FROM=
```

## Cutover from Typeform/Zapier

1. Set the env vars above + redeploy; merge this branch to `main`.
2. Find the ids: Pipedrive pipeline/stage(`Console Validation`)/owner(FX); Asana
   Shajith GID. Put them in env.
3. Register the **Asana webhook** on the *Console Validation V2* project pointing at
   `https://rutherford.fr/api/asana-webhook` (the route echoes the handshake; copy the
   `X-Hook-Secret` into `ASANA_WEBHOOK_SECRET`). Easiest: signed in as an admin, open
   `GET /api/asana-webhook/register` once — it registers the webhook with the app's
   `ASANA_ACCESS_TOKEN` (idempotent) and logs the handshake secret to the Vercel runtime
   logs (`[asana-webhook] handshake received …`) to copy into `ASANA_WEBHOOK_SECRET`.
4. Replace the email templates in `lib/console-validation-emails.ts` with the branded
   Mailchimp versions from Zaps B/C.
5. Test in parallel (Zaps stay ON) with a real submission.
6. Turn the 4 Zaps **off** (don't delete — rollback). The Pipedrive Deal actions in
   Zapier deprecate **2026-07-31**, so don't miss that window.

Server-side failures are logged (`… failed`) and visible in the Vercel runtime logs
without ever failing the visitor's submission.
