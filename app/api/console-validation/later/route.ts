import { NextResponse, type NextRequest } from 'next/server';
import { addDealNote } from '@/lib/pipedrive';
import { dealFromLeadToken, cleanPhone } from '@/lib/console-lead';
import { consoleResumeEmail } from '@/lib/console-validation-emails';
import { sendMail } from '@/lib/msgraph';

export const dynamic = 'force-dynamic';

const LOCALES = ['en', 'fr', 'de', 'it', 'es', 'pt'];

/**
 * "Finish later from my phone": emails the printer a link that reopens the
 * form with their details filled in, straight on the press and photo steps.
 * Only works for a lead opened at step 1 (signed token tied to the email).
 */
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const email = String(body.email ?? '').trim();
  const dealId = dealFromLeadToken(body.lead, email);
  if (!dealId) return NextResponse.json({ error: 'Unknown request' }, { status: 400 });

  const locale = LOCALES.includes(body.locale) ? String(body.locale) : 'en';
  const companyName = String(body.companyName ?? '').trim().slice(0, 200);
  const country = String(body.country ?? '').trim().slice(0, 100);
  const phone = cleanPhone(body.phone);
  const notes = String(body.notes ?? '').trim().slice(0, 1000);

  const resume = Buffer.from(
    JSON.stringify({ lead: body.lead, email, companyName, country, phone, notes })
  ).toString('base64url');
  const origin = request.nextUrl.origin;
  const url = `${origin}${locale === 'en' ? '' : `/${locale}`}/console-validation?resume=${resume}#submit`;

  const mail = consoleResumeEmail({ locale, company: companyName, url });
  await sendMail({ to: email, subject: mail.subject, html: mail.html });
  await addDealNote(dealId, 'Le client a demandé à finir plus tard : lien de reprise envoyé par email.');
  return NextResponse.json({ ok: true });
}
