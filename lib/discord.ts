// Discord notifications — SERVER-ONLY.
//
// Posts to a Discord channel via an incoming webhook so the team is pinged the
// moment a new console validation or support ticket arrives — independent of
// Asana's own notifications (which Asana suppresses for the token owner's own
// actions). Create the webhook in Discord: Channel settings → Integrations →
// Webhooks → New Webhook → copy URL into DISCORD_WEBHOOK_URL.
//
// Dormant-safe: no DISCORD_WEBHOOK_URL → no-op. Best-effort: a Discord hiccup is
// logged and swallowed, never failing the visitor's submission. "Logged" covers
// a refusal too: fetch only throws on a network failure, so a 4xx/5xx answer
// (webhook deleted, payload rejected, rate limit) is read and logged here —
// otherwise the alerts would stop without a single line in the logs.
//
// A webhook can only post in its channel — it cannot send a DM. To reach one
// person, the message mentions them, which pings them like a DM would.
// DISCORD_ASSIGNEE_MENTIONS maps an Asana user gid to a Discord user ID
// (numeric, not the username — Discord: Developer Mode → right-click the
// member → Copy User ID), comma-separated:
//   DISCORD_ASSIGNEE_MENTIONS=1204081517474278:123456789012345678

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const TIMEOUT_MS = 8000;
const BRAND_COLOR = 0x2433c9; // Rutherford blue

type EmbedField = { name: string; value: string; inline?: boolean };

/** Post one embed. Returns whether Discord accepted it. `mentionUserId` puts a
 * mention in the message content (mentions inside an embed never notify), and
 * allowed_mentions restricts the ping to that one user. */
async function postEmbed(
  title: string,
  fields: EmbedField[],
  opts: { mentionUserId?: string } = {}
): Promise<boolean> {
  if (!WEBHOOK_URL) return false;
  const mention = opts.mentionUserId;
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(mention ? { content: `<@${mention}>` } : {}),
        allowed_mentions: { parse: [], users: mention ? [mention] : [] },
        embeds: [{ title, color: BRAND_COLOR, fields }],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => '')).slice(0, 500);
      console.error(`Discord webhook refused (${res.status}) for "${title}":`, detail);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Discord webhook failed:', error);
    return false;
  }
}

const DISCORD_ID_RE = /^\d{15,22}$/;

/** Discord user ID to mention for an Asana assignee, from
 * DISCORD_ASSIGNEE_MENTIONS. Null when unmapped or malformed. */
export function discordUserForAsanaUser(asanaGid: string | null): string | null {
  if (!asanaGid) return null;
  for (const pair of (process.env.DISCORD_ASSIGNEE_MENTIONS ?? '').split(',')) {
    const [asana, discord] = pair.split(':').map((s) => s.trim());
    if (asana === asanaGid && discord && DISCORD_ID_RE.test(discord)) return discord;
  }
  return null;
}

const linkList = (links: { label: string; url: string | null | undefined }[]): string | null => {
  const parts = links.filter((l) => l.url).map((l) => `[${l.label}](${l.url})`);
  return parts.length ? parts.join(' · ') : null;
};

/** Ping the team on a new console-validation submission. No-op without a webhook. */
export async function notifyDiscordConsoleValidation(v: {
  dealId: number | null;
  company: string | null;
  country: string | null;
  machine: string | null;
  email: string;
  asanaUrl?: string | null;
  pipedriveUrl?: string | null;
}): Promise<void> {
  if (!WEBHOOK_URL) return;
  const fields: EmbedField[] = [];
  if (v.company) fields.push({ name: 'Société', value: v.company, inline: true });
  if (v.country) fields.push({ name: 'Pays', value: v.country, inline: true });
  if (v.machine) fields.push({ name: 'Presse', value: v.machine, inline: true });
  fields.push({ name: 'E-mail', value: v.email });
  const links = linkList([
    { label: 'Asana', url: v.asanaUrl },
    { label: 'Pipedrive', url: v.pipedriveUrl },
  ]);
  if (links) fields.push({ name: 'Liens', value: links });
  await postEmbed(`🆕 Nouvelle validation console${v.dealId ? ` — ID ${v.dealId}` : ''}`, fields);
}

/** Alert the team when the console-validations photo bucket crosses its storage
 * threshold (monthly cron). No-op without a webhook. */
export async function notifyDiscordStorageAlert(a: {
  usedGb: number;
  thresholdGb: number;
  objects: number;
  cleanupUrl?: string | null;
}): Promise<void> {
  if (!WEBHOOK_URL) return;
  const fields: EmbedField[] = [
    { name: 'Utilisé', value: `${a.usedGb.toFixed(1)} Go`, inline: true },
    { name: 'Seuil', value: `${a.thresholdGb} Go`, inline: true },
    { name: 'Objets', value: String(a.objects), inline: true },
  ];
  if (a.cleanupUrl) fields.push({ name: 'Nettoyage (simulation)', value: a.cleanupUrl });
  await postEmbed('⚠️ Stockage photos élevé — console-validations', fields);
}

/** Ping the team on a new support ticket. No-op without a webhook. */
export async function notifyDiscordSupport(t: {
  company: string | null;
  email: string;
  subject?: string | null;
  country?: string | null;
  asanaUrl?: string | null;
}): Promise<void> {
  if (!WEBHOOK_URL) return;
  const fields: EmbedField[] = [];
  if (t.company) fields.push({ name: 'Société', value: t.company, inline: true });
  if (t.country) fields.push({ name: 'Pays', value: t.country, inline: true });
  fields.push({ name: 'E-mail', value: t.email });
  if (t.subject) fields.push({ name: 'Sujet', value: t.subject });
  const links = linkList([{ label: 'Asana', url: t.asanaUrl }]);
  if (links) fields.push({ name: 'Liens', value: links });
  await postEmbed('🆘 Nouveau ticket support', fields);
}

/** Ping the team on a new contact form message. No-op without a webhook. */
export async function notifyDiscordContact(v: {
  name: string;
  email: string;
  company: string;
  country: string;
  topic: string;
  wantsCall: boolean;
  message: string;
}): Promise<void> {
  if (!WEBHOOK_URL) return;
  const fields: EmbedField[] = [];
  if (v.name) fields.push({ name: 'Nom', value: v.name, inline: true });
  if (v.company) fields.push({ name: 'Société', value: v.company, inline: true });
  if (v.country) fields.push({ name: 'Pays', value: v.country, inline: true });
  fields.push({ name: 'E-mail', value: v.email });
  fields.push({ name: 'Sujet', value: v.topic + (v.wantsCall ? ' · rappel demandé' : '') });
  fields.push({ name: 'Message', value: v.message.slice(0, 1000) });
  await postEmbed('✉️ Nouveau message de contact', fields);
}

/** Ping the person a support ticket was just assigned to in Asana, by mention.
 * No-op without a webhook. */
export async function notifyDiscordSupportAssigned(t: {
  discordUserId: string;
  assigneeName: string | null;
  reference: string;
  company: string | null;
  email: string;
  subject?: string | null;
  asanaUrl?: string | null;
}): Promise<void> {
  if (!WEBHOOK_URL) return;
  const fields: EmbedField[] = [];
  if (t.company) fields.push({ name: 'Société', value: t.company, inline: true });
  fields.push({ name: 'E-mail', value: t.email, inline: true });
  if (t.subject) fields.push({ name: 'Sujet', value: t.subject });
  const links = linkList([{ label: 'Asana', url: t.asanaUrl }]);
  if (links) fields.push({ name: 'Liens', value: links });
  const who = t.assigneeName ? ` à ${t.assigneeName}` : '';
  await postEmbed(`👤 Ticket support ${t.reference} attribué${who}`, fields, { mentionUserId: t.discordUserId });
}
