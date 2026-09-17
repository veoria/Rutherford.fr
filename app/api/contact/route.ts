import { NextResponse, type NextRequest } from 'next/server';
import { notifyDiscordContact } from '@/lib/discord';
import { syncContactRequestToPipedrive } from '@/lib/pipedrive';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCALES = ['en', 'fr', 'de', 'it', 'es', 'pt'];
const TOPICS = ['retrofit', 'colorloop', 'quote', 'partnership', 'press', 'other'];

const str = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

/**
 * Public contact form. A filled honeypot gets a silent success. Messages go to
 * PipeDrive (Person + Organization + Note) and ping the team on Discord.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const payload = (body ?? {}) as Record<string, unknown>;
  if (str(payload.website, 200)) return NextResponse.json({ ok: true });

  const email = str(payload.email, 200).toLowerCase();
  const name = str(payload.name, 120);
  const company = str(payload.company, 200);
  const country = str(payload.country, 80);
  const phone = str(payload.phone, 40);
  const message = str(payload.message, 5000);
  const topic = TOPICS.includes(str(payload.topic, 40)) ? str(payload.topic, 40) : 'other';
  const locale = LOCALES.includes(str(payload.locale, 5)) ? str(payload.locale, 5) : 'en';
  const source = str(payload.source, 120);
  const wantsCall = payload.wantsCall === true;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json({ error: 'message_too_short' }, { status: 400 });
  }
  if (wantsCall && !phone) {
    return NextResponse.json({ error: 'phone_required' }, { status: 400 });
  }

  await Promise.all([
    syncContactRequestToPipedrive({ name, email, company, country, phone, topic, message, wantsCall, locale, source }),
    notifyDiscordContact({ name, email, company, country, topic, wantsCall, message }),
  ]);

  return NextResponse.json({ ok: true });
}
