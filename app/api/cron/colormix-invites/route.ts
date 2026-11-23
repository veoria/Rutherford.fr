import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { msgraphEnabled, sendMail } from '@/lib/msgraph';
import { colormixBetaInviteEmail } from '@/lib/colormix-beta-emails';

export const dynamic = 'force-dynamic';

/**
 * ColorMix Kitchen beta — tells a person they have been accepted (wired via
 * vercel.json crons, every 10 minutes).
 *
 * Accepting someone only adds a row to `cmx_beta`; nothing else knows about
 * it, so this job picks up the rows whose `invite_mail_at` is still null and
 * sends each one the invitation email, once. It covers every way a row gets
 * there (the invitations page, the SQL editor).
 *
 * Once only: the row is claimed (`invite_mail_at` set, guarded on null)
 * BEFORE the send, and released if the send fails, so two overlapping runs
 * can't both mail the same person. Rows older than three days are left
 * alone, so a mailbox outage can't turn into a late surprise email.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Fails closed
 * (401) when the secret is unset or mismatched — never anonymously callable.
 */
const MAX_PER_RUN = 20;
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !msgraphEnabled()) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 });
  }

  const admin = createSupabaseAdminClient();
  const { data: rows, error } = await admin
    .from('cmx_beta')
    .select('email, name')
    .is('invite_mail_at', null)
    .eq('status', 'invited')
    .gte('invited_at', new Date(Date.now() - MAX_AGE_MS).toISOString())
    .order('invited_at', { ascending: true })
    .limit(MAX_PER_RUN);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;
  for (const row of rows ?? []) {
    const email = String(row.email ?? '').trim();
    if (!email) continue;

    const { data: claimed } = await admin
      .from('cmx_beta')
      .update({ invite_mail_at: new Date().toISOString() })
      .eq('email', row.email)
      .is('invite_mail_at', null)
      .select('email');
    if (!claimed?.length) continue;

    try {
      const { data: asked } = await admin
        .from('cmx_beta_requests')
        .select('lang')
        .eq('email', row.email)
        .maybeSingle();
      const mail = colormixBetaInviteEmail({ email, name: row.name, lang: asked?.lang });
      await sendMail(
        { to: email, subject: mail.subject, html: mail.html, replyTo: process.env.COLORMIX_BETA_REPLY_TO || undefined },
        { throwOnError: true }
      );
      sent += 1;
    } catch {
      failed += 1;
      await admin.from('cmx_beta').update({ invite_mail_at: null }).eq('email', row.email);
    }
  }

  return NextResponse.json({ ok: true, sent, failed });
}
