import { NextResponse, type NextRequest } from 'next/server';
import { syncPartnerDomains } from '@/lib/partner-domains';

export const dynamic = 'force-dynamic';

/**
 * Daily partner-domains sync (wired via vercel.json crons, brief § 2.3.b):
 * harvests the e-mail domains of Pipedrive persons labelled Reseller / OEM /
 * Distributor into the partner_domains table, so sign-in classification can
 * match a reseller colleague by domain without a CRM call.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Fails closed
 * (401) when the secret is unset or mismatched — never anonymously callable.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 });
  }

  try {
    const { upserted, removed } = await syncPartnerDomains();
    return NextResponse.json({ ok: true, upserted, removed });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'sync failed' },
      { status: 500 }
    );
  }
}
