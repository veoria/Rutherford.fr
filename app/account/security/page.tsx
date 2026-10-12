import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ACCOUNT_ENABLED } from '@/lib/features';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AccountSecurity } from '@/components/account-security';

export const metadata: Metadata = {
  title: 'Security | Rutherford',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function SecurityRoute() {
  if (!ACCOUNT_ENABLED) notFound();

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/account/sign-in?next=/account/security');
  }

  return <AccountSecurity />;
}
