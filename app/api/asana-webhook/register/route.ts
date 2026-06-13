import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';

// One-time admin helper to register (or confirm) the Asana webhook(s) that drive
// status updates + verdict emails. Visit it once, signed in as an admin, on the
// production domain:  GET /api/asana-webhook/register
//
// It registers a webhook for the Console Validation board and, when
// ASANA_SUPPORT_PROJECT is set, for the Support Ticket project too — both point
// at the same /api/asana-webhook endpoint (which routes support vs. console
// tasks). It uses the app's existing ASANA_ACCESS_TOKEN, is idempotent (won't
// duplicate a webhook already pointing at the same target), and after creation
// Asana hits /api/asana-webhook with the handshake secret — which that route
// logs so you can copy it into ASANA_WEBHOOK_SECRET and redeploy.

export const dynamic = 'force-dynamic';

const TOKEN = process.env.ASANA_ACCESS_TOKEN;
const PROJECT = process.env.ASANA_CONSOLE_VALIDATION_PROJECT || '1124959442904601';
const SUPPORT_PROJECT = process.env.ASANA_SUPPORT_PROJECT;
const WORKSPACE = process.env.ASANA_WORKSPACE || '15445560112122';
const DEFAULT_TARGET = 'https://rutherford.fr/api/asana-webhook';
const ASANA = 'https://app.asana.com/api/1.0';

type Headers = Record<string, string>;

// Register (or confirm) a webhook for one project, idempotently.
async function ensureWebhook(project: string, label: string, target: string, headers: Headers) {
  const listRes = await fetch(
    `${ASANA}/webhooks?workspace=${WORKSPACE}&resource=${project}&opt_fields=target,active`,
    { headers, cache: 'no-store' }
  );
  const list = await listRes.json();
  if (!listRes.ok) {
    return { project, label, error: 'Could not list webhooks', detail: list };
  }
  const existing = (list?.data ?? []).find((w: any) => w?.target === target);
  if (existing) {
    return { project, label, alreadyRegistered: true, target, webhook: existing };
  }

  // Create it. Asana will handshake /api/asana-webhook (which logs the secret).
  const createRes = await fetch(`${ASANA}/webhooks`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data: { resource: project, target } }),
    cache: 'no-store',
  });
  const created = await createRes.json();
  if (!createRes.ok) {
    return { project, label, error: 'Asana rejected the webhook', detail: created };
  }
  return { project, label, registered: true, target, webhook: created?.data ?? created };
}

export async function GET(request: NextRequest) {
  // Admin gate: identify the signed-in user, then confirm is_admin via service role.
  const {
    data: { user },
  } = await createSupabaseServerClient().auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }
  const { data: profile } = await createSupabaseAdminClient()
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Admins only' }, { status: 403 });
  }

  if (!TOKEN) {
    return NextResponse.json({ error: 'ASANA_ACCESS_TOKEN is not set' }, { status: 500 });
  }

  const target = request.nextUrl.searchParams.get('target') || DEFAULT_TARGET;
  const headers: Headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

  const projects: { gid: string; label: string }[] = [{ gid: PROJECT, label: 'console-validation' }];
  if (SUPPORT_PROJECT) projects.push({ gid: SUPPORT_PROJECT, label: 'support' });

  try {
    const results = [];
    for (const p of projects) {
      results.push(await ensureWebhook(p.gid, p.label, target, headers));
    }
    return NextResponse.json({
      ok: true,
      target,
      results,
      supportProjectConfigured: Boolean(SUPPORT_PROJECT),
      note: SUPPORT_PROJECT
        ? 'Registered/confirmed for both projects. For any freshly created webhook, check the Vercel runtime logs for "[asana-webhook] handshake received" to get the secret, set ASANA_WEBHOOK_SECRET, and redeploy.'
        : 'ASANA_SUPPORT_PROJECT is not set — only the console board was handled. Set it (gid of the Support Ticket project) and re-run to register the support webhook.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    );
  }
}
