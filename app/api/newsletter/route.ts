import { NextResponse, type NextRequest } from 'next/server';
import { subscribeNewsletterInPipedrive } from '@/lib/pipedrive';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCALES = ['en', 'fr', 'de', 'it', 'es', 'pt'];

/**
 * Public newsletter signup. Requires the consent flag; a filled honeypot field
 * is answered with a silent success so bots learn nothing. Syncs to PipeDrive
 * (marketing status "subscribed") for Pipedrive Campaigns.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const payload = (body ?? {}) as Record<string, unknown>;
  if (typeof payload.website === 'string' && payload.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const consent = payload.consent === true;
  const locale = typeof payload.locale === 'string' && LOCALES.includes(payload.locale) ? payload.locale : 'en';
  const source = typeof payload.source === 'string' ? payload.source.slice(0, 120) : 'site';

  if (!email || !EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ error: 'consent_required' }, { status: 400 });
  }

  await subscribeNewsletterInPipedrive({ email, locale, source });
  return NextResponse.json({ ok: true });
}
