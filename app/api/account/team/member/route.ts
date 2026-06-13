import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getManageableOrg, removeMember, revokeInvitation, updateMemberRole } from '@/lib/organizations';

export const dynamic = 'force-dynamic';

async function caller() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Change a member's role (owner/admin of the caller's org only). */
export async function PATCH(request: NextRequest) {
  const user = await caller();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }
  const memberUserId = typeof body.userId === 'string' ? body.userId : '';
  const role = body.role === 'admin' ? 'admin' : body.role === 'member' ? 'member' : null;
  if (!memberUserId || !role) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const manage = await getManageableOrg(user.id);
  if (!manage) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const ok = await updateMemberRole(user.id, manage.orgId, memberUserId, role);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'failed' }, { status: 400 });
}

/** Remove a member (?userId=) or revoke a pending invitation (?invitationId=). */
export async function DELETE(request: NextRequest) {
  const user = await caller();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const invitationId = url.searchParams.get('invitationId');
  if (invitationId) {
    const ok = await revokeInvitation(user.id, invitationId);
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'failed' }, { status: 400 });
  }

  const memberUserId = url.searchParams.get('userId');
  if (memberUserId) {
    const manage = await getManageableOrg(user.id);
    if (!manage) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    const ok = await removeMember(user.id, manage.orgId, memberUserId);
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'failed' }, { status: 400 });
  }

  return NextResponse.json({ error: 'bad_request' }, { status: 400 });
}
