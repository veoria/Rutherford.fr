import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminWrite } from '@/lib/admin-access';
import { reorderPresses } from '@/lib/presses';

export const dynamic = 'force-dynamic';

/** Admin: save the press order of a client's atelier (?orgId=). */
export async function PUT(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const orgId = new URL(request.url).searchParams.get('orgId') ?? '';
  if (!orgId) return NextResponse.json({ error: 'missing_org' }, { status: 400 });
  let ids: unknown;
  try {
    ids = ((await request.json()) as { ids?: unknown }).ids;
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }
  if (!Array.isArray(ids) || ids.length > 500 || !ids.every((id) => typeof id === 'string')) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  // reorderPresses only touches presses of this org.
  const ok = await reorderPresses(orgId, ids as string[]);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'failed' }, { status: 500 });
}
