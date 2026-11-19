import { NextResponse, type NextRequest } from 'next/server';
import { addDealNote, createConsoleValidationDeal, linkDealParties } from '@/lib/pipedrive';
import { attributionLines, formatAttribution, parseAttribution } from '@/lib/attribution';
import { cleanPhone, leadToken } from '@/lib/console-lead';

export const dynamic = 'force-dynamic';

const escapeNote = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Step 1 of the console validation: the printer has left their contact details.
 * The lead goes to Pipedrive right away (deal + person + organization + note),
 * so the team can call back even if the photos never come. Returns a signed
 * token the final submission uses to complete this same deal.
 */
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const email = String(body.email ?? '').trim();
  const companyName = String(body.companyName ?? '').trim();
  const country = String(body.country ?? '').trim();
  const phone = cleanPhone(body.phone);
  const notes = String(body.notes ?? '').trim().slice(0, 1000);
  const refCode = String(body.ref ?? '').trim().slice(0, 100) || null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
  }
  if (!companyName || companyName.length > 200 || !country || country.length > 100) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  const attribution = parseAttribution(body.attribution);
  const deal = await createConsoleValidationDeal({ company: companyName, country, machine: '' });
  const dealId = deal?.id ?? null;
  await linkDealParties(dealId, { email, company: companyName, phone });
  await addDealNote(
    dealId,
    [
      '<b>Validation console commencée</b> (coordonnées reçues, photos pas encore envoyées).',
      `Email : ${escapeNote(email)}`,
      phone ? `Téléphone : ${escapeNote(phone)}` : 'Téléphone : non renseigné',
      `Société : ${escapeNote(companyName)}`,
      `Pays : ${escapeNote(country)}`,
      notes ? `Notes : ${escapeNote(notes)}` : null,
      refCode ? `Parrainage : ${escapeNote(refCode)}` : null,
      `Source : ${escapeNote(formatAttribution(attribution))}`,
      ...attributionLines(attribution).map(escapeNote),
    ]
      .filter(Boolean)
      .join('<br>')
  );

  return NextResponse.json({ ok: true, lead: leadToken(dealId, email), reference: dealId ? `ID ${dealId}` : null });
}
