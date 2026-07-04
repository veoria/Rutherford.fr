import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminWrite } from '@/lib/admin-access';
import { getRestrictedSiteIds, setMemberSites } from '@/lib/sites';

export const dynamic = 'force-dynamic';

/** The site ids a member is currently restricted to within an org (for the
 * member's site-access editor). Empty array = sees all the org's sites. */
export async function GET(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const params = new URL(request.url).searchParams;
  const userId = params.get('userId') ?? '';
  if (!userId) return NextResponse.json({ error: 'missing_user' }, { status: 400 });
  return NextResponse.json({ siteIds: await getRestrictedSiteIds(userId) });
}

/** Set a member's site restriction within an org. `siteIds: []` clears it
 * (the member sees all the org's sites again). */
export async function PATCH(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }
  const userId = typeof body.userId === 'string' ? body.userId : '';
  const orgId = typeof body.orgId === 'string' ? body.orgId : '';
  if (!userId || !orgId) return NextResponse.json({ error: 'missing_params' }, { status: 400 });
  const siteIds = Array.isArray(body.siteIds) ? body.siteIds.filter((v): v is string => typeof v === 'string') : [];

  const ok = await setMemberSites(userId, orgId, siteIds);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'failed' }, { status: 500 });
}
