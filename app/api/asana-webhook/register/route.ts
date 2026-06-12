import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';

// One-time admin helper to register (or confirm) the Asana webhook that drives
// status updates + verdict emails. Visit it once, signed in as an admin, on the
// production domain:  GET /api/asana-webhook/register
//
// It uses the app's existing ASANA_ACCESS_TOKEN, is idempotent (won't create a
// duplicate if one already points at the same target), and after creation Asana
// hits /api/asana-webhook with the handshake secret — which that route logs so
// you can copy it into ASANA_WEBHOOK_SECRET and redeploy.

export const dynamic = 'force-dynamic';

const TOKEN = process.env.ASANA_ACCESS_TOKEN;
const PROJECT = process.env.ASANA_CONSOLE_VALIDATION_PROJECT || '1124959442904601';
const WORKSPACE = process.env.ASANA_WORKSPACE || '15445560112122';
const DEFAULT_TARGET = 'https://rutherford.fr/api/asana-webhook';
const ASANA = 'https://app.asana.com/api/1.0';

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
  const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

  try {
    // Idempotency: skip if a webhook already targets this endpoint for the board.
    const listRes = await fetch(
      `${ASANA}/webhooks?workspace=${WORKSPACE}&resource=${PROJECT}&opt_fields=target,active`,
      { headers, cache: 'no-store' }
    );
    const list = await listRes.json();
    if (!listRes.ok) {
      return NextResponse.json({ error: 'Could not list webhooks', detail: list }, { status: 502 });
    }
    const existing = (list?.data ?? []).find((w: any) => w?.target === target);
    if (existing) {
      return NextResponse.json({
        ok: true,
        alreadyRegistered: true,
        target,
        webhook: existing,
        note: 'A webhook already points at this target — nothing to do.',
      });
    }

    // Create it. Asana will handshake /api/asana-webhook (which logs the secret).
    const createRes = await fetch(`${ASANA}/webhooks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ data: { resource: PROJECT, target } }),
      cache: 'no-store',
    });
    const created = await createRes.json();
    if (!createRes.ok) {
      return NextResponse.json({ error: 'Asana rejected the webhook', detail: created }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      registered: true,
      target,
      webhook: created?.data ?? created,
      note: 'Webhook created. Check the Vercel runtime logs for "[asana-webhook] handshake received" to get the secret, set ASANA_WEBHOOK_SECRET, and redeploy.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    );
  }
}
