import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Verify2faPage } from '@/components/verify-2fa-page';

export const metadata: Metadata = {
  title: 'Security check | Rutherford',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function Verify2faRoute() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/account/sign-in');
  }
  return (
    <Suspense>
      <Verify2faPage />
    </Suspense>
  );
}
