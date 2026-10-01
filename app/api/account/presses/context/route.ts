import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getPressSupportContext } from '@/lib/presses';

export const dynamic = 'force-dynamic';

// Support form prefill: the press a « Support » button was clicked on (title,
// plant, AnyDesk, company, equipment). Only for a press of the caller's org.
export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id') ?? '';
  const ctx = id ? await getPressSupportContext(user.id, id) : null;
  if (!ctx) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const { teamLines: _teamLines, ...publicCtx } = ctx;
  return NextResponse.json({ press: publicCtx });
}
