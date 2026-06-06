import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAdminOverview } from '@/lib/admin';
import { AdminDashboard } from '@/components/admin-dashboard';

export const metadata: Metadata = {
  title: 'Admin — Rutherford Academy',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminRoute() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/account/sign-in?next=/admin');
  }

  // Role gate: only profiles flagged is_admin (self-read via RLS). Anyone else
  // gets a 404 so the route's existence isn't revealed.
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_admin) {
    notFound();
  }

  const overview = await getAdminOverview();
  return <AdminDashboard overview={overview} />;
}
