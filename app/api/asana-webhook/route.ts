import { NextResponse, type NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { getConsoleValidationTaskState } from '@/lib/asana';
import { addDealNote } from '@/lib/pipedrive';
import { sendMail } from '@/lib/msgraph';
import { canConnectEmail, cannotConnectEmail } from '@/lib/console-validation-emails';
import {
  updateConsoleValidationStatusByAsanaTask,
  type ConsoleValidationStatus,
} from '@/lib/console-validations';

export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.ASANA_WEBHOOK_SECRET;

// Board section → customer status. Sections other than these are ignored.
const SECTION_STATUS: Record<string, ConsoleValidationStatus> = {
  'Can be connected': 'can_be_connected',
  Rejected: 'rejected',
  'In progress': 'changes_requested',
};

const extractEmail = (notes: string) => notes.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] ?? null;
const extractDealId = (name: string) => {
  const m = name.match(/ID(\d+)/);
  return m ? Number(m[1]) : null;
};

export async function POST(request: NextRequest) {
  const raw = await request.text();

  // Asana sends X-Hook-Secret once when the webhook is created — echo it back to
  // complete the handshake. (Store that value in ASANA_WEBHOOK_SECRET afterwards.)
  const handshake = request.headers.get('x-hook-secret');
  if (handshake) {
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
  // learn its live section.
  const taskGids = new Set<string>();
  for (const event of events) {
    if (event?.resource?.resource_type === 'task' && (event.action === 'changed' || event.action === 'added')) {
      const gid = event.resource.gid;
      if (gid) taskGids.add(String(gid));
    }
  }

  for (const gid of taskGids) {
    const state = await getConsoleValidationTaskState(gid);
    if (!state?.sectionName) continue;
    const status = SECTION_STATUS[state.sectionName];
    if (!status) continue;

    await updateConsoleValidationStatusByAsanaTask(gid, status);

    const email = extractEmail(state.notes);
    const dealId = extractDealId(state.name);
    const name = state.name;

    if (status === 'can_be_connected') {
      if (email) {
        const mail = canConnectEmail(name);
        await sendMail({ to: email, subject: mail.subject, html: mail.html, bcc: mail.bcc });
      }
      await addDealNote(
        dealId,
        `Based on the pictures and information received by Console Validation ID ${dealId ?? ''}, this press can be connected. ${email ?? ''}`
      );
    } else if (status === 'rejected') {
      if (email) {
        const mail = cannotConnectEmail(name);
        await sendMail({ to: email, subject: mail.subject, html: mail.html });
      }
      await addDealNote(
        dealId,
        `Based on the pictures and information received by Console Validation ID ${dealId ?? ''}, this press cannot be connected. - ${email ?? ''}`
      );
    } else if (status === 'changes_requested') {
      // No client email — internal nudge only (mirrors the existing Zap D).
      await addDealNote(
        dealId,
        `Please contact FX. We need more information and pictures to confirm if we can connect it or not. ID ${dealId ?? ''} - ${email ?? ''}`
      );
    }
  }

  return NextResponse.json({ ok: true });
}
