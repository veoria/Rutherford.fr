import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  ConsoleValidationsPortal,
  type ConsoleValidationRow,
} from '@/components/console-validations-portal';

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

  // RLS scopes this to the visitor's own requests (by account or by email).
  const { data } = await supabase
    .from('console_validations')
    .select('id, company, country, machine, status, created_at, pipedrive_deal_id, reviewed_by, reviewed_at')
    .order('created_at', { ascending: false });

  const rows: ConsoleValidationRow[] = (data ?? []).map((row) => ({
    id: row.id as string,
    company: row.company as string | null,
    country: row.country as string | null,
    machine: row.machine as string | null,
    status: row.status as ConsoleValidationRow['status'],
    createdAt: row.created_at as string,
    reference: row.pipedrive_deal_id ? `ID-${row.pipedrive_deal_id}` : null,
    reviewedBy: (row.reviewed_by as string | null) ?? null,
    reviewedAt: (row.reviewed_at as string | null) ?? null,
  }));

  return <ConsoleValidationsPortal rows={rows} />;
}
