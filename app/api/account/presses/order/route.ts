import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getWorkshopAccess, reorderPresses } from '@/lib/presses';

export const dynamic = 'force-dynamic';

// "Mon atelier" — save the press order the client arranged. Any active member
// of a client org may reorder: it only changes how the pressroom is displayed.
export async function PUT(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const access = await getWorkshopAccess(user.id);
  if (!access || access.orgType !== 'client') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  let ids: unknown;
  try {
    ids = ((await request.json()) as { ids?: unknown }).ids;
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }
  if (!Array.isArray(ids) || ids.length > 500 || !ids.every((id) => typeof id === 'string')) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const ok = await reorderPresses(access.orgId, ids as string[]);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'failed' }, { status: 500 });
}
