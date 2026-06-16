import { NextResponse, type NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { authEmail } from '@/lib/auth-emails';
import { msgraphEnabled, sendMail } from '@/lib/msgraph';

// Supabase "Send Email Hook": instead of Supabase mailing its plain default
// templates, it POSTs here and we send the branded, localized Rutherford email
// from our own mailbox (lib/msgraph). Requests are signed with the Standard
// Webhooks scheme using the symmetric secret minted by Supabase.
//
// Env:
//   SEND_EMAIL_HOOK_SECRET   the hook secret from Supabase ("v1,whsec_…")
//   NEXT_PUBLIC_SUPABASE_URL  used to build the verification link

export const dynamic = 'force-dynamic';

const HOOK_SECRET = process.env.SEND_EMAIL_HOOK_SECRET ?? '';
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');

// The Supabase secret is delivered as "v1,whsec_<base64>" — the signing key is
// the base64-decoded remainder.
function signingKey(): Buffer | null {
  if (!HOOK_SECRET) return null;
  const b64 = HOOK_SECRET.replace(/^v1,/, '').replace(/^whsec_/, '');
  try {
    const key = Buffer.from(b64, 'base64');
    return key.length ? key : null;
  } catch {
    return null;
  }
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

// Standard Webhooks verification: signature = base64(HMAC-SHA256(key,
// "<id>.<timestamp>.<body>")). The header may list several space-separated
// "v1,<sig>" values; any match passes. A ±5-minute window blocks replays.
function verify(rawBody: string, headers: Headers): boolean {
  const key = signingKey();
  const id = headers.get('webhook-id');
  const ts = headers.get('webhook-timestamp');
  const sigHeader = headers.get('webhook-signature');
  if (!key || !id || !ts || !sigHeader) return false;

  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > 300) return false;

  const expected = createHmac('sha256', key).update(`${id}.${ts}.${rawBody}`).digest('base64');
  return sigHeader
    .split(' ')
    .map((part) => part.split(',', 2)[1] ?? part)
    .some((sig) => safeEqual(sig, expected));
}

type HookPayload = {
  user: { email?: string | null; user_metadata?: Record<string, unknown> | null } | null;
  email_data: {
    token?: string;
    token_hash?: string;
    redirect_to?: string;
    email_action_type?: string;
    site_url?: string;
  };
};

export async function POST(request: NextRequest) {
  const raw = await request.text();

  if (!verify(raw, request.headers)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let payload: HookPayload;
  try {
    payload = JSON.parse(raw) as HookPayload;
  } catch {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }

  const to = payload.user?.email ?? '';
  const data = payload.email_data ?? {};
  const action = data.email_action_type ?? 'default';
  const localeRaw = payload.user?.user_metadata?.locale;
  const locale = typeof localeRaw === 'string' ? localeRaw : null;

  // Build the same verification link Supabase's default templates use, pointing
  // at the project's auth server. Reauthentication carries a code, not a link.
  const verifyUrl =
    data.token_hash && SUPABASE_URL
      ? `${SUPABASE_URL}/auth/v1/verify?token=${encodeURIComponent(data.token_hash)}` +
        `&type=${encodeURIComponent(action)}` +
        `&redirect_to=${encodeURIComponent(data.redirect_to || data.site_url || SUPABASE_URL)}`
      : '';

  const { subject, html } = authEmail({ action, locale, url: verifyUrl, token: data.token });

  // Fail loudly when mail isn't configured: better that Supabase surfaces the
  // error (and the user retries) than silently dropping a confirmation email.
  if (!msgraphEnabled()) {
    return NextResponse.json({ error: 'mail transport not configured' }, { status: 500 });
  }

  try {
    await sendMail({ to, subject, html }, { throwOnError: true });
  } catch {
    return NextResponse.json({ error: 'send failed' }, { status: 502 });
  }

  return NextResponse.json({});
}
