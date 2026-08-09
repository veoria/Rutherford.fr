import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAccess } from '@/lib/admin-access';
import { describeInstallFields, getWonDeal, pipedriveEnabled } from '@/lib/pipedrive';
import { installNotes } from '@/lib/install-tasks';

export const dynamic = 'force-dynamic';

/**
 * Admin diagnostic for the won-deal → Install mapping (read-only).
 *
 *   GET /api/admin/pipedrive-fields
 *     Which Pipedrive field lands on which line of the Install description
 *     block, which labels match nothing (their line comes out blank), and the
 *     full list of deal fields with their exact names and keys — so a name that
 *     differs can be read off and pinned via PIPEDRIVE_DEAL_FIELDS.
 *
 *   GET /api/admin/pipedrive-fields?deal=2410
 *     The same, plus the exact task name and description block that deal would
 *     produce. Nothing is created — this is the dry run to look at before
 *     turning the Zap off.
 */
export async function GET(request: NextRequest) {
  const access = await getAdminAccess();
  if (!access.ok || !access.canManage) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (!pipedriveEnabled()) {
    return NextResponse.json({ error: 'Pipedrive not configured (set PIPEDRIVE_API_TOKEN)' }, { status: 400 });
  }

  const report = await describeInstallFields();
  const dealId = Number(request.nextUrl.searchParams.get('deal') || 0);
  if (!dealId) return NextResponse.json(report);

  const deal = await getWonDeal(dealId);
  if (!deal) {
    return NextResponse.json({ ...report, preview: { dealId, error: 'deal unreadable' } }, { status: 404 });
  }
  const title = deal.title || `Deal ${dealId}`;
  return NextResponse.json({
    ...report,
    preview: {
      dealId,
      taskName: new RegExp(`ID${dealId}(\\D|$)`).test(title) ? title : `${title} - ID${dealId}`,
      dueOn: deal.delivery,
      notes: installNotes(deal),
    },
  });
}
