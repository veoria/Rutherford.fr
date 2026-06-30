import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import type { AccountType } from '@/data/account-types';

export const dynamic = 'force-dynamic';

// Subnav shell data (area label + co-brand logo) for the signed-in user. The
// client used to do this as three sequential round-trips (getUser → profiles →
// organizations); resolving it server-side collapses that to a single fetch and
// runs the queries co-located with the database. Scoped to the caller's own id.
export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const { data: prof } = await admin
    .from('profiles')
    .select('organization_id, company, account_type')
    .eq('id', user.id)
    .maybeSingle();

  const accountType = ((prof?.account_type as AccountType | null) ?? 'client') as AccountType;
  const company = (prof?.company as string | null) ?? null;
  const orgId = (prof?.organization_id as string | null) ?? null;

  if (!orgId) {
    return NextResponse.json({ accountType, orgName: company, logoUrl: null });
  }

  const { data: org } = await admin
    .from('organizations')
    .select('logo_url, name')
    .eq('id', orgId)
    .maybeSingle();

  return NextResponse.json({
    accountType,
    orgName: (org?.name as string | null) ?? company,
    logoUrl: (org?.logo_url as string | null) ?? null,
  });
}
