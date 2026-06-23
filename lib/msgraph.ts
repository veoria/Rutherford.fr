// Microsoft Graph mail — SERVER-ONLY.
//
// Sends the client-facing console-validation emails via the team's Microsoft
// 365 mailbox (app-only / client-credentials flow). Dormant-safe: a no-op
// without credentials, and it never throws so a mail hiccup can't break the
// request handling.
//
// Env:
//   MSGRAPH_TENANT_ID / MSGRAPH_CLIENT_ID / MSGRAPH_CLIENT_SECRET
//   MAIL_FROM   (the sending mailbox, e.g. "noreply@rutherford.fr" — the app
//                registration needs Mail.Send application permission on it)

const TENANT = process.env.MSGRAPH_TENANT_ID;
const CLIENT_ID = process.env.MSGRAPH_CLIENT_ID;
const CLIENT_SECRET = process.env.MSGRAPH_CLIENT_SECRET;
const MAIL_FROM = process.env.MAIL_FROM;

const TIMEOUT_MS = 10000;

export function msgraphEnabled(): boolean {
  return Boolean(TENANT && CLIENT_ID && CLIENT_SECRET && MAIL_FROM);
}

async function getToken(): Promise<string> {
  const res = await fetch(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`MS Graph token → ${res.status}`);
  return (await res.json()).access_token as string;
}

export type Mail = { to: string; subject: string; html: string; bcc?: string[] };

export async function sendMail(mail: Mail, opts?: { throwOnError?: boolean }): Promise<void> {
  if (!msgraphEnabled() || !mail.to) return;
  try {
    const token = await getToken();
    const res = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(MAIL_FROM!)}/sendMail`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {
            subject: mail.subject,
            body: { contentType: 'HTML', content: mail.html },
            toRecipients: [{ emailAddress: { address: mail.to } }],
            bccRecipients: (mail.bcc ?? []).map((address) => ({ emailAddress: { address } })),
          },
          saveToSentItems: true,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: 'no-store',
      }
    );
    if (!res.ok) throw new Error(`MS Graph sendMail → ${res.status} ${await res.text().catch(() => '')}`);
  } catch (error) {
    console.error('MS Graph sendMail failed:', error);
    // Most callers fire-and-forget so a mail hiccup never breaks request
    // handling. The auth-email hook opts in to rethrow so Supabase surfaces the
    // failure and the user can retry, rather than silently getting no email.
    if (opts?.throwOnError) throw error;
  }
}
