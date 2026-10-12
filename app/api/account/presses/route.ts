import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createPresses, deletePress, getWorkshopAccess, parsePressInput, updatePress } from '@/lib/presses';

export const dynamic = 'force-dynamic';

// "Mon atelier" — the client declares and maintains its own presses. Any
// active member of a client org may add or edit presses; deleting is limited
// to owners/admins so a member can't wipe the pressroom by mistake.

async function access() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) } as const;
  const acc = await getWorkshopAccess(user.id);
  if (!acc || acc.orgType !== 'client') {
    return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }) } as const;
  }
  return { user, acc } as const;
}

async function readBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = (await request.json()) as unknown;
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Create one press, or `quantity` identical ones. */
export async function POST(request: NextRequest) {
  const a = await access();
  if ('error' in a) return a.error;
  const body = await readBody(request);
  if (!body) return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  const parsed = parsePressInput(body);
  if (!parsed.ok) return NextResponse.json({ error: 'invalid', field: parsed.field }, { status: 400 });
  const quantity = Number(body.quantity ?? 1);
  const presses = await createPresses(a.acc.orgId, a.user.id, parsed.input, Number.isFinite(quantity) ? quantity : 1);
  return presses ? NextResponse.json({ presses }) : NextResponse.json({ error: 'failed' }, { status: 500 });
}

/** Update a press (?id=). */
export async function PATCH(request: NextRequest) {
  const a = await access();
  if ('error' in a) return a.error;
  const id = new URL(request.url).searchParams.get('id') ?? '';
  const body = await readBody(request);
  if (!id || !body) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const parsed = parsePressInput(body);
  if (!parsed.ok) return NextResponse.json({ error: 'invalid', field: parsed.field }, { status: 400 });
  const press = await updatePress(a.acc.orgId, id, parsed.input);
  return press ? NextResponse.json({ press }) : NextResponse.json({ error: 'not_found' }, { status: 404 });
}

/** Delete a press (?id=) — owners/admins only. */
export async function DELETE(request: NextRequest) {
  const a = await access();
  if ('error' in a) return a.error;
  if (!a.acc.canManageSites) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!id) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const ok = await deletePress(a.acc.orgId, id);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'not_found' }, { status: 404 });
}
