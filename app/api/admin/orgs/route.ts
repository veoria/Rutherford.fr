import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { setClientReseller } from '@/lib/organizations';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthorized', status: 401 } as const;
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!data?.is_admin) return { error: 'forbidden', status: 403 } as const;
  return { error: null, status: 200 } as const;
}

/** Assign (or clear) a client org's managing reseller. */
export async function PATCH(request: NextRequest) {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }
  const clientOrgId = typeof body.clientOrgId === 'string' ? body.clientOrgId : '';
  const resellerOrgId = typeof body.resellerOrgId === 'string' && body.resellerOrgId ? body.resellerOrgId : null;
  if (!clientOrgId) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const ok = await setClientReseller(clientOrgId, resellerOrgId);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'failed' }, { status: 500 });
}
