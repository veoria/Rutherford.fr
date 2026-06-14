import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SupportPortal, type SupportMessage, type SupportRow } from '@/components/support-portal';

export const metadata: Metadata = {
  title: 'Your support tickets | Rutherford',
};

export const dynamic = 'force-dynamic';

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
      'id, company, subject, anydesk, description, status, created_at, updated_at, photos, customer_reply_at, agent_message, agent_message_at, assignee_name'
    )
    .order('created_at', { ascending: false });

  const ticketRows = data ?? [];

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
      subject: (row.subject as string | null) ?? null,
      anydesk: (row.anydesk as string | null) ?? null,
      description: (row.description as string | null) ?? '',
      status: row.status as SupportRow['status'],
      createdAt: row.created_at as string,
      updatedAt: (row.updated_at as string | null) ?? (row.created_at as string),
      photos: Object.values(photos).filter((v): v is string => typeof v === 'string'),
      customerReplyAt: (row.customer_reply_at as string | null) ?? null,
      agentMessage: (row.agent_message as string | null) ?? null,
      agentMessageAt: (row.agent_message_at as string | null) ?? null,
      assigneeName: (row.assignee_name as string | null) ?? null,
      messages: byTicket.get(row.id as string) ?? [],
    };
  });

  return <SupportPortal rows={rows} />;
}
