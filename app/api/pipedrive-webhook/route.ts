import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';
import {
  asanaTaskUrl,
  createInstallTask,
  findInstallTaskByDealId,
  installBoardEnabled,
} from '@/lib/asana';
import { getWonDeal, pipedriveDealUrl } from '@/lib/pipedrive';
import { claimWonDeal, installNotes, settleWonDeal } from '@/lib/install-tasks';
import { notifyDiscordInstallTask } from '@/lib/discord';
import { recordAudit } from '@/lib/admin-audit';

export const dynamic = 'force-dynamic';

// Pipedrive → Asana "Install": a deal moving to WON opens the install cycle.
// This replaces the last remaining Zap. Pipedrive authenticates its webhooks
// with HTTP Basic credentials chosen when the webhook is created — set the same
// pair here. Without them the route stays inert rather than letting anyone
// create cards on the board.
const USER = process.env.PIPEDRIVE_WEBHOOK_USER;
const PASSWORD = process.env.PIPEDRIVE_WEBHOOK_PASSWORD;

function authorized(request: NextRequest): boolean {
  const expected = Buffer.from(`Basic ${Buffer.from(`${USER}:${PASSWORD}`).toString('base64')}`);
  const got = Buffer.from(request.headers.get('authorization') ?? '');
  return got.length === expected.length && timingSafeEqual(got, expected);
}

const skip = (reason: string, extra?: Record<string, unknown>) =>
  NextResponse.json({ ok: true, skipped: reason, ...extra });

export async function POST(request: NextRequest) {
  if (!USER || !PASSWORD) {
    console.warn('[pipedrive-webhook] PIPEDRIVE_WEBHOOK_USER / _PASSWORD unset — event ignored');
    return skip('not_configured');
  }
  if (!authorized(request)) return new NextResponse('Unauthorized', { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return skip('unparseable_body');
  }

  // v1 payloads say `object` / `current`, v2 says `entity` / `data`. Both carry
  // a `previous`, but v2's holds *only the fields that changed* — which is
  // exactly what tells us the status is what moved.
  const meta = body?.meta ?? {};
  const entity = String(meta.entity ?? meta.object ?? '');
  const current = body?.data ?? body?.current ?? null;
  const previous = body?.previous ?? null;
  if (entity !== 'deal' || !current) return skip('not_a_deal');

  const statusChanged = previous ? Object.prototype.hasOwnProperty.call(previous, 'status') : false;
  const isCreate = /add|create/i.test(String(meta.action ?? ''));
  // Only a *transition* into won counts. Editing a deal that is already won
  // repeats "status: won" on every event; without this the board would collect
  // a card per edit. When the payload doesn't let us tell, we stay put — a
  // missed card is a phone call, a duplicate card is a duplicate shipment.
  const becameWon =
    current.status === 'won' && (statusChanged ? previous.status !== 'won' : isCreate);
  if (!becameWon) return skip('not_a_won_transition');

  const dealId = Number(current.id ?? meta.entity_id ?? meta.id ?? 0);
  if (!dealId) return skip('no_deal_id');

  if (!installBoardEnabled()) {
    console.warn(`[pipedrive-webhook] deal ${dealId} won but ASANA_INSTALL_PROJECT is unset — ignored`);
    return skip('install_board_disabled', { dealId });
  }

  // Claim first: the database, not the payload, decides who creates the card.
  if (!(await claimWonDeal(dealId, String(current.title ?? '')))) {
    return skip('already_handled', { dealId });
  }

  // Second guard, for the parallel-run period: the Zap's own cards aren't in our
  // database, but they're on the board carrying the same ID marker.
  const existing = await findInstallTaskByDealId(dealId);
  if (existing) {
    await settleWonDeal(dealId, existing);
    return skip('already_on_board', { dealId, asanaTaskGid: existing });
  }

  const deal = await getWonDeal(dealId, current);
  if (!deal) {
    await settleWonDeal(dealId, null); // release, so a redelivery can retry
    return skip('deal_unreadable', { dealId });
  }

  // The board's whole convention hangs off the `IDxxxx` marker in the name —
  // deals created outside the console-validation flow may not carry it.
  const title = deal.title || String(current.title ?? '').trim() || `Deal ${dealId}`;
  const name = new RegExp(`ID${dealId}(\\D|$)`).test(title) ? title : `${title} - ID${dealId}`;

  const gid = await createInstallTask({
    name,
    notes: installNotes(deal),
    dealId,
    dueOn: deal.delivery,
  });
  await settleWonDeal(dealId, gid);

  // The back-office journal is where an admin finds out this ran at all — the
  // board itself only shows the card, not who put it there. A failure is logged
  // too: a won deal without a card is exactly what someone needs to notice.
  await recordAudit({
    actorId: null,
    actorEmail: 'pipedrive-webhook',
    action: gid ? 'install.task_created' : 'install.task_failed',
    targetType: 'install',
    targetId: String(dealId),
    summary: gid
      ? `Deal gagné ID ${dealId}${deal.orgName ? ` (${deal.orgName})` : ''} — tâche Install créée : ${name}`
      : `Deal gagné ID ${dealId}${deal.orgName ? ` (${deal.orgName})` : ''} — création de la tâche Install échouée`,
    metadata: { dealId, asanaTaskGid: gid, taskName: name, delivery: deal.delivery },
  });

  if (!gid) return skip('asana_create_failed', { dealId });

  await notifyDiscordInstallTask({
    dealId,
    name,
    orgName: deal.orgName,
    delivery: deal.delivery,
    asanaUrl: asanaTaskUrl(gid),
    pipedriveUrl: pipedriveDealUrl(dealId),
  });

  return NextResponse.json({ ok: true, dealId, asanaTaskGid: gid });
}
