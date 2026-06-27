// Discord notifications — SERVER-ONLY.
//
// Posts to a Discord channel via an incoming webhook so the team is pinged the
// moment a new console validation or support ticket arrives — independent of
// Asana's own notifications (which Asana suppresses for the token owner's own
// actions). Create the webhook in Discord: Channel settings → Integrations →
// Webhooks → New Webhook → copy URL into DISCORD_WEBHOOK_URL.
//
// Dormant-safe: no DISCORD_WEBHOOK_URL → no-op. Best-effort: a Discord hiccup is
// logged and swallowed, never failing the visitor's submission.

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const TIMEOUT_MS = 8000;
const BRAND_COLOR = 0x2433c9; // Rutherford blue

type EmbedField = { name: string; value: string; inline?: boolean };

async function postEmbed(title: string, fields: EmbedField[]): Promise<void> {
  if (!WEBHOOK_URL) return;
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [{ title, color: BRAND_COLOR, fields }] }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Discord webhook failed:', error);
  }
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
