import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SupportPortal, type SupportRow } from '@/components/support-portal';

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
      'id, company, subject, anydesk, description, status, created_at, updated_at, photos, customer_reply_at, agent_message, agent_message_at'
    )
    .order('created_at', { ascending: false });

  const rows: SupportRow[] = (data ?? []).map((row) => {
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
    };
  });

  return <SupportPortal rows={rows} />;
}
