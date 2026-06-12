import { NextResponse, type NextRequest } from 'next/server';
import { syncLeadToPipedrive } from '@/lib/pipedrive';

export const dynamic = 'force-dynamic';

// Good-enough shape check to reject obvious junk before hitting the CRM.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Public ROI lead capture. Pushes the visitor's email (+ company) to PipeDrive
 * as a Person/Organization/Note tagged "Calculateur ROI". No-op until
 * PIPEDRIVE_API_TOKEN is set; the CRM sync never throws.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const payload = (body ?? {}) as Record<string, unknown>;
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const company = typeof payload.company === 'string' ? payload.company.trim() : '';

  if (!email || !EMAIL_RE.test(email) || email.length > 200 || company.length > 200) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  await syncLeadToPipedrive({
    email,
    name: null,
    company,
    country: '',
    jobTitle: '',
    source: 'Calculateur ROI',
  });

  return NextResponse.json({ ok: true });
}
