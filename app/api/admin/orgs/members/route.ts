import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { requireAdminWrite } from '@/lib/admin-access';
import {
  adminRemoveMember,
  adminRevokeInvitation,
  adminUpdateMemberRole,
  createInvitation,
  getOrgMembersForAdmin,
  type MemberRole,
} from '@/lib/organizations';
import { teamInviteEmail } from '@/lib/team-emails';
import { sendMail } from '@/lib/msgraph';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** List an org's active members + pending invites. */
export async function GET(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const orgId = new URL(request.url).searchParams.get('orgId') ?? '';
  if (!orgId) return NextResponse.json({ error: 'missing_org' }, { status: 400 });
  return NextResponse.json(await getOrgMembersForAdmin(orgId));
}

/** Invite a member to any org (kind=member). */
export async function POST(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }
  const orgId = typeof body.orgId === 'string' ? body.orgId : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const role: MemberRole = body.role === 'admin' ? 'admin' : 'member';
  if (!orgId) return NextResponse.json({ error: 'missing_org' }, { status: 400 });
  if (!EMAIL_RE.test(email) || email.length > 200) return NextResponse.json({ error: 'bad_email' }, { status: 400 });

  const invite = await createInvitation({ orgId, email, role, kind: 'member', invitedBy: gate.userId });
  if (!invite) return NextResponse.json({ error: 'failed' }, { status: 500 });

  // Notify the invitee — best effort, never blocks the invitation.
  try {
    const admin = createSupabaseAdminClient();
    const { data: org } = await admin.from('organizations').select('name').eq('id', orgId).maybeSingle();
    const {
      data: { user },
    } = await createSupabaseServerClient().auth.getUser();
    const mail = teamInviteEmail('member', (org?.name as string | null) ?? null, user?.email ?? 'Rutherford');
    await sendMail({ to: email, subject: mail.subject, html: mail.html });
  } catch {
    /* email is best-effort */
  }

  return NextResponse.json({ ok: true });
}

/** Change a member's role (owner / admin / member). */
export async function PATCH(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }
  const orgId = typeof body.orgId === 'string' ? body.orgId : '';
  const userId = typeof body.userId === 'string' ? body.userId : '';
  const role: MemberRole | null =
    body.role === 'owner' ? 'owner' : body.role === 'admin' ? 'admin' : body.role === 'member' ? 'member' : null;
  if (!orgId || !userId || !role) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const ok = await adminUpdateMemberRole(orgId, userId, role);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'failed' }, { status: 400 });
}

/** Remove a member (?orgId=&userId=) or revoke an invite (?invitationId=). */
export async function DELETE(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const url = new URL(request.url);
  const invitationId = url.searchParams.get('invitationId');
  if (invitationId) {
    const ok = await adminRevokeInvitation(invitationId);
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'failed' }, { status: 400 });
  }
  const orgId = url.searchParams.get('orgId') ?? '';
  const userId = url.searchParams.get('userId') ?? '';
  if (orgId && userId) {
    const ok = await adminRemoveMember(orgId, userId);
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'failed' }, { status: 400 });
  }
  return NextResponse.json({ error: 'bad_request' }, { status: 400 });
}
