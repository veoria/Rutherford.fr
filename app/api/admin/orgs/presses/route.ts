import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminWrite } from '@/lib/admin-access';
import { recordAudit } from '@/lib/admin-audit';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { createPresses, deletePress, parsePressInput, updatePress } from '@/lib/presses';
import { pressTitle } from '@/data/press-config';

export const dynamic = 'force-dynamic';

// Admin: maintain a client's « Mon atelier » on their behalf (from the « view
// as client » preview). Same validation as the client API; ?orgId= names the
// client org, which must be of type client.

async function clientOrg(orgId: string): Promise<boolean> {
  if (!orgId) return false;
  const { data } = await createSupabaseAdminClient().from('organizations').select('type').eq('id', orgId).maybeSingle();
  return (data as { type?: string } | null)?.type === 'client';
}

async function readBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = (await request.json()) as unknown;
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Create one press (or `quantity` identical ones) in the client org. */
export async function POST(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const orgId = new URL(request.url).searchParams.get('orgId') ?? '';
  if (!(await clientOrg(orgId))) return NextResponse.json({ error: 'missing_org' }, { status: 400 });
  const body = await readBody(request);
  if (!body) return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  const parsed = parsePressInput(body);
  if (!parsed.ok) return NextResponse.json({ error: 'invalid', field: parsed.field }, { status: 400 });
  const quantity = Number(body.quantity ?? 1);
  const presses = await createPresses(orgId, gate.userId, parsed.input, Number.isFinite(quantity) ? quantity : 1);
  if (!presses) return NextResponse.json({ error: 'failed' }, { status: 500 });
  await recordAudit({
    actorId: gate.userId,
    action: 'org.press_create',
    targetType: 'organization',
    targetId: orgId,
    summary: `Presse ajoutée pour le client : ${pressTitle(parsed.input)}${presses.length > 1 ? ` (×${presses.length})` : ''}`,
    metadata: { pressIds: presses.map((p) => p.id) },
  });
  return NextResponse.json({ presses });
}

/** Update a press (?orgId=&id=). */
export async function PATCH(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const url = new URL(request.url);
  const orgId = url.searchParams.get('orgId') ?? '';
  const id = url.searchParams.get('id') ?? '';
  if (!id || !(await clientOrg(orgId))) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const body = await readBody(request);
  if (!body) return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  const parsed = parsePressInput(body);
  if (!parsed.ok) return NextResponse.json({ error: 'invalid', field: parsed.field }, { status: 400 });
  const press = await updatePress(orgId, id, parsed.input);
  if (!press) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  await recordAudit({
    actorId: gate.userId,
    action: 'org.press_update',
    targetType: 'organization',
    targetId: orgId,
    summary: `Presse modifiée pour le client : ${pressTitle(parsed.input)}`,
    metadata: { pressId: id },
  });
  return NextResponse.json({ press });
}

/** Delete a press (?orgId=&id=). */
export async function DELETE(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const url = new URL(request.url);
  const orgId = url.searchParams.get('orgId') ?? '';
  const id = url.searchParams.get('id') ?? '';
  if (!id || !(await clientOrg(orgId))) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const ok = await deletePress(orgId, id);
  if (!ok) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  await recordAudit({
    actorId: gate.userId,
    action: 'org.press_delete',
    targetType: 'organization',
    targetId: orgId,
    summary: 'Presse supprimée de l’atelier du client',
    metadata: { pressId: id },
  });
  return NextResponse.json({ ok: true });
}
