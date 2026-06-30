import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';
import { SupportPortal, type SupportMessage, type SupportRow } from '@/components/support-portal';
import { teamOrgFromEmail } from '@/lib/account-type';

export const metadata: Metadata = {
  title: 'Your support tickets | Rutherford',
};

export const dynamic = 'force-dynamic';

const HAS_ADMIN = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);

export default async function AccountSupportRoute() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/account/sign-in?next=/account/support');
  }

  // RLS scopes this to the visitor's own tickets (by account or by email).
  const { data } = await supabase
    .from('support_tickets')
    .select(
      'id, user_id, email, company, subject, anydesk, description, status, created_at, updated_at, photos, customer_reply_at, agent_message, agent_message_at, assignee_name'
    )
    .order('created_at', { ascending: false });

  const ticketRows = data ?? [];

  // Resolve each ticket's country from the customer's profile (org country as a
  // fallback), server-side with the admin client so it doesn't depend on RLS.
  const countryByUser = new Map<string, string>();
  const userIds = [...new Set(ticketRows.map((r) => r.user_id as string | null).filter(Boolean))] as string[];
  if (HAS_ADMIN && userIds.length) {
    try {
      const admin = createSupabaseAdminClient();
      const { data: profs } = await admin.from('profiles').select('id, country, organization_id').in('id', userIds);
      const orgIds = [
        ...new Set((profs ?? []).map((p) => p.organization_id as string | null).filter(Boolean)),
      ] as string[];
      const orgCountry = new Map<string, string>();
      if (orgIds.length) {
        const { data: orgs } = await admin.from('organizations').select('id, country').in('id', orgIds);
        for (const o of orgs ?? []) if (o.country) orgCountry.set(o.id as string, o.country as string);
      }
      for (const p of profs ?? []) {
        const c =
          (p.country as string | null) ||
          (p.organization_id ? orgCountry.get(p.organization_id as string) ?? null : null);
        if (c) countryByUser.set(p.id as string, c);
      }
    } catch {
      /* best-effort — country stays null */
    }
  }

  // Conversation thread for these tickets (RLS also scopes this to the user).
  const ids = ticketRows.map((r) => r.id as string);
  const byTicket = new Map<string, SupportMessage[]>();
  if (ids.length) {
    const { data: msgs } = await supabase
      .from('support_messages')
      .select('ticket_id, author, body, photos, created_at')
      .in('ticket_id', ids)
      .order('created_at', { ascending: true });
    for (const msg of msgs ?? []) {
      const tid = msg.ticket_id as string;
      const arr = byTicket.get(tid) ?? [];
      const photos = Array.isArray(msg.photos)
        ? (msg.photos as unknown[]).filter((v): v is string => typeof v === 'string')
        : [];
      arr.push({
        author: msg.author === 'team' ? 'team' : 'customer',
        body: (msg.body as string | null) ?? null,
        photos,
        createdAt: msg.created_at as string,
      });
      byTicket.set(tid, arr);
    }
  }

  const rows: SupportRow[] = ticketRows.map((row) => {
    const photos = row.photos && typeof row.photos === 'object' ? (row.photos as Record<string, string>) : {};
    return {
      id: row.id as string,
      reference: `#${String(row.id).slice(0, 8)}`,
      company: (row.company as string | null) ?? null,
      contactEmail: (row.email as string | null) ?? null,
      country: row.user_id ? countryByUser.get(row.user_id as string) ?? null : null,
      subject: (row.subject as string | null) ?? null,
      anydesk: (row.anydesk as string | null) ?? null,
      description: (row.description as string | null) ?? '',
      status: row.status as SupportRow['status'],
      createdAt: row.created_at as string,
      updatedAt: (row.updated_at as string | null) ?? (row.created_at as string),
      // Original request attachments only — reply photos (keys "reply-…") already
      // show inside their own conversation messages.
      photos: Object.entries(photos)
        .filter(([k, v]) => !k.startsWith('reply-') && typeof v === 'string')
        .map(([, v]) => v),
      customerReplyAt: (row.customer_reply_at as string | null) ?? null,
      agentMessage: (row.agent_message as string | null) ?? null,
      agentMessageAt: (row.agent_message_at as string | null) ?? null,
      assigneeName: (row.assignee_name as string | null) ?? null,
      messages: byTicket.get(row.id as string) ?? [],
    };
  });

  // A Rutherford team member can view/reply here too — flip the thread labels so
  // the customer side shows the client (not "You") from their perspective.
  const viewerIsTeam = Boolean(teamOrgFromEmail(user.email ?? ''));

  return <SupportPortal rows={rows} viewerIsTeam={viewerIsTeam} />;
}
