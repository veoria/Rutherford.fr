import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  ConsoleValidationsPortal,
  type ConsoleValidationRow,
  type CvMessage,
} from '@/components/console-validations-portal';
import type { CvInviteItem } from '@/components/cv-invite';
import { listCvInvitations } from '@/lib/console-invitations';

export const metadata: Metadata = {
  title: 'Your console validations | Rutherford',
};

export const dynamic = 'force-dynamic';

export default async function ConsoleValidationsRoute() {
  // Gated independently of the Academy so the tracking portal can launch on its own.
  if (process.env.NEXT_PUBLIC_CONSOLE_TRACKING_ENABLED !== 'true') notFound();

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/account/sign-in?next=/account/console-validations');
  }

  // Drives the non-blocking "complete your profile" prompt.
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, country, company, job_title, account_type')
    .eq('id', user.id)
    .maybeSingle();
  const profileComplete = Boolean(
    profile?.full_name && profile?.country && profile?.company && profile?.job_title
  );

  // Resellers / distributors / team can invite a client to fill a validation.
  const accountType = (profile?.account_type as string | null) ?? 'client';
  const canInvite = accountType === 'reseller' || accountType === 'distributor' || accountType === 'team';
  const invitations: CvInviteItem[] = canInvite
    ? (await listCvInvitations(user.id)).map((i) => ({
        id: i.id,
        clientEmail: i.clientEmail,
        company: i.company,
        status: i.status,
        createdAt: i.createdAt,
      }))
    : [];

  // RLS scopes this to the visitor's own requests (by account or by email).
  const { data } = await supabase
    .from('console_validations')
    .select(
      'id, company, country, machine, status, created_at, pipedrive_deal_id, reviewed_by, reviewed_at, customer_reply_at'
    )
    .order('created_at', { ascending: false });

  const rows: ConsoleValidationRow[] = (data ?? []).map((row) => ({
    id: row.id as string,
    company: row.company as string | null,
    country: row.country as string | null,
    machine: row.machine as string | null,
    status: row.status as ConsoleValidationRow['status'],
    createdAt: row.created_at as string,
    reference: row.pipedrive_deal_id ? `ID ${row.pipedrive_deal_id}` : null,
    reviewedBy: (row.reviewed_by as string | null) ?? null,
    reviewedAt: (row.reviewed_at as string | null) ?? null,
    customerReplyAt: (row.customer_reply_at as string | null) ?? null,
  }));

  // Conversation threads for the visitor's validations (RLS-scoped).
  let messages: CvMessage[] = [];
  if (rows.length) {
    const { data: msgRows } = await supabase
      .from('console_validation_messages')
      .select('validation_id, author, body, photos, created_at')
      .in(
        'validation_id',
        rows.map((r) => r.id)
      )
      .order('created_at', { ascending: true });
    messages = ((msgRows ?? []) as {
      validation_id: string;
      author: string;
      body: string | null;
      photos: unknown;
      created_at: string;
    }[]).map((m) => ({
      validationId: m.validation_id,
      author: m.author === 'team' ? 'team' : 'customer',
      body: m.body,
      photos: Array.isArray(m.photos) ? (m.photos as string[]) : [],
      createdAt: m.created_at,
    }));
  }

  return (
    <ConsoleValidationsPortal
      rows={rows}
      profileComplete={profileComplete}
      canInvite={canInvite}
      invitations={invitations}
      messages={messages}
    />
  );
}
