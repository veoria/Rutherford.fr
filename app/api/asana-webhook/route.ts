import { NextResponse, type NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { getConsoleValidationTaskState, getStory, getSupportTaskState } from '@/lib/asana';
import { addDealNote } from '@/lib/pipedrive';
import { sendMail } from '@/lib/msgraph';
import { canConnectEmail, cannotConnectEmail, moreInfoEmail } from '@/lib/console-validation-emails';
import { supportAgentMessageEmail, supportStatusEmail } from '@/lib/support-emails';
import {
  getConsoleValidationStatusByAsanaTask,
  getNotificationEmailByAsanaTask,
  updateConsoleValidationStatusByAsanaTask,
  type ConsoleValidationStatus,
} from '@/lib/console-validations';
import {
  getSupportTicketByAsanaTask,
  setAgentMessageByAsanaTask,
  supportStatusFromSection,
  updateSupportStatusByAsanaTask,
} from '@/lib/support-tickets';

export const dynamic = 'force-dynamic';

// One secret is minted per Asana webhook, and we may run two (the console board
// and the support project). Accept a comma-separated list and verify the
// signature against any of them. A single value stays backward-compatible.
const WEBHOOK_SECRETS = (process.env.ASANA_WEBHOOK_SECRET ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

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
  // complete the handshake. We also log it once so it can be added to
  // ASANA_WEBHOOK_SECRET (comma-separated when running more than one webhook),
  // then redeploy, to enable signature verification.
  const handshake = request.headers.get('x-hook-secret');
  if (handshake) {
    console.log('[asana-webhook] handshake received — add to ASANA_WEBHOOK_SECRET (comma-separated if multiple):', handshake);
    return new NextResponse(null, { status: 200, headers: { 'X-Hook-Secret': handshake } });
  }

  // Verify the HMAC signature of subsequent events when a secret is set. With
  // two webhooks the signature matches whichever secret minted that webhook, so
  // accept the event if it verifies against any configured secret.
  if (WEBHOOK_SECRETS.length) {
    const signature = request.headers.get('x-hook-signature') ?? '';
    const sigBuf = Buffer.from(signature);
    const ok = WEBHOOK_SECRETS.some((secret) => {
      const expBuf = Buffer.from(createHmac('sha256', secret).update(raw).digest('hex'));
      return sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf);
    });
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
  // Comments arrive as "story" events; keep each with its parent task so we can
  // relay the ones tagged for the customer.
  const storyEvents: { storyGid: string; taskGid: string }[] = [];
  for (const event of events) {
    if (event?.resource?.resource_type === 'task' && (event.action === 'changed' || event.action === 'added')) {
      const gid = event.resource.gid;
      if (gid) taskGids.add(String(gid));
    } else if (event?.resource?.resource_type === 'story' && event.action === 'added') {
      const storyGid = event.resource?.gid;
      const taskGid = event.parent?.gid;
      if (storyGid && taskGid) storyEvents.push({ storyGid: String(storyGid), taskGid: String(taskGid) });
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

  // Relay support comments a team member tagged for the customer ("[client] …").
  // Other comments stay internal. Dedupe on the story gid so a re-delivery
  // doesn't email twice.
  for (const { storyGid, taskGid } of storyEvents) {
    const ticket = await getSupportTicketByAsanaTask(taskGid);
    if (!ticket || ticket.lastAgentStoryGid === storyGid) continue;
    const story = await getStory(storyGid);
    if (!story || !story.isComment) continue;
    const m = story.text.match(/^\s*\[client\]\s*:?\s*([\s\S]+)/i);
    if (!m) continue;
    const message = m[1].trim();
    if (!message) continue;
    await setAgentMessageByAsanaTask(taskGid, storyGid, message);
    const mail = supportAgentMessageEmail(message, `#${ticket.id.slice(0, 8)}`);
    await sendMail({ to: ticket.email, subject: mail.subject, html: mail.html });
  }

  return NextResponse.json({ ok: true });
}
