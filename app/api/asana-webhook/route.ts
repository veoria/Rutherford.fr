import { NextResponse, type NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { getConsoleValidationTaskState, getSupportTaskState } from '@/lib/asana';
import { addDealNote } from '@/lib/pipedrive';
import { sendMail } from '@/lib/msgraph';
import { canConnectEmail, cannotConnectEmail, moreInfoEmail } from '@/lib/console-validation-emails';
import { supportStatusEmail } from '@/lib/support-emails';
import {
  getConsoleValidationStatusByAsanaTask,
  getNotificationEmailByAsanaTask,
  updateConsoleValidationStatusByAsanaTask,
  type ConsoleValidationStatus,
} from '@/lib/console-validations';
import {
  getSupportTicketByAsanaTask,
  supportStatusFromSection,
  updateSupportStatusByAsanaTask,
} from '@/lib/support-tickets';

export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.ASANA_WEBHOOK_SECRET;

// The board uses Asana's Approval feature: the task's approval status is the
// verdict, and whoever completes the approval is the validator.
const APPROVAL_STATUS: Record<string, ConsoleValidationStatus> = {
  approved: 'can_be_connected',
  changes_requested: 'changes_requested',
  rejected: 'rejected',
};

const extractEmail = (notes: string) => notes.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] ?? null;
const extractDealId = (name: string) => {
  const m = name.match(/ID(\d+)/);
  return m ? Number(m[1]) : null;
};

export async function POST(request: NextRequest) {
  const raw = await request.text();

  // Asana sends X-Hook-Secret once when the webhook is created — echo it back to
  // complete the handshake. We also log it once so it can be copied into
  // ASANA_WEBHOOK_SECRET (then redeploy) to enable signature verification.
  const handshake = request.headers.get('x-hook-secret');
  if (handshake) {
    console.log('[asana-webhook] handshake received — set ASANA_WEBHOOK_SECRET to:', handshake);
    return new NextResponse(null, { status: 200, headers: { 'X-Hook-Secret': handshake } });
  }

  // Verify the HMAC signature of subsequent events when the secret is set.
  if (WEBHOOK_SECRET) {
    const signature = request.headers.get('x-hook-signature') ?? '';
    const expected = createHmac('sha256', WEBHOOK_SECRET).update(raw).digest('hex');
    const ok =
      signature.length === expected.length &&
      timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!ok) return new NextResponse('Invalid signature', { status: 401 });
  }

  let events: any[] = [];
  try {
    events = JSON.parse(raw)?.events ?? [];
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Events are diffs; collect the task gids that changed, then re-fetch each to
  // learn its live approval state.
  const taskGids = new Set<string>();
  for (const event of events) {
    if (event?.resource?.resource_type === 'task' && (event.action === 'changed' || event.action === 'added')) {
      const gid = event.resource.gid;
      if (gid) taskGids.add(String(gid));
    }
  }

  for (const gid of taskGids) {
    // Support ticket? Its status is the Asana column (section) it sits in.
    const ticket = await getSupportTicketByAsanaTask(gid);
    if (ticket) {
      const sstate = await getSupportTaskState(gid);
      if (sstate) {
        const next = supportStatusFromSection(sstate.sectionName, sstate.completed);
        if (next !== ticket.status) {
          await updateSupportStatusByAsanaTask(gid, next);
          const mail = supportStatusEmail(next, `#${ticket.id.slice(0, 8)}`);
          if (mail) await sendMail({ to: ticket.email, subject: mail.subject, html: mail.html });
        }
      }
      continue;
    }

    const state = await getConsoleValidationTaskState(gid);
    if (!state) continue;
    const status = APPROVAL_STATUS[state.approvalStatus ?? ''];
    if (!status) continue; // still pending — no verdict yet

    // Approvals re-deliver several events; only act on an actual transition so
    // the client isn't emailed twice.
    const previous = await getConsoleValidationStatusByAsanaTask(gid);
    if (previous === status) continue;

    await updateConsoleValidationStatusByAsanaTask(gid, status, {
      reviewedBy: state.completedByName,
      reviewedAt: state.completedAt,
    });

    const email = extractEmail(state.notes);
    // Customer-facing verdict goes to their notification email when set.
    const notifyTo = email ? await getNotificationEmailByAsanaTask(gid, email) : '';
    const dealId = extractDealId(state.name);
    const name = state.name;
    const by = state.completedByName || 'the team';

    if (status === 'can_be_connected') {
      if (email) {
        const mail = canConnectEmail({ name, dealId });
        await sendMail({ to: notifyTo, subject: mail.subject, html: mail.html, bcc: mail.bcc });
      }
      await addDealNote(
        dealId,
        `Approved by ${by} — Console Validation ID ${dealId ?? ''}: this press can be connected. ${email ?? ''}`
      );
    } else if (status === 'rejected') {
      if (email) {
        const mail = cannotConnectEmail({ name, dealId });
        await sendMail({ to: notifyTo, subject: mail.subject, html: mail.html });
      }
      await addDealNote(
        dealId,
        `Rejected by ${by} — Console Validation ID ${dealId ?? ''}: this press cannot be connected. ${email ?? ''}`
      );
    } else if (status === 'changes_requested') {
      if (email) {
        const mail = moreInfoEmail({ name, dealId });
        await sendMail({ to: notifyTo, subject: mail.subject, html: mail.html });
      }
      await addDealNote(
        dealId,
        `Changes requested by ${by} — Console Validation ID ${dealId ?? ''}: more information/pictures needed. ${email ?? ''}`
      );
    }
  }

  return NextResponse.json({ ok: true });
}
