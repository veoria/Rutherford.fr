import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ACCOUNT_ENABLED } from '@/lib/features';
import { Suspense } from 'react';
import { UpdatePasswordPage } from '@/components/update-password-page';

export const metadata: Metadata = {
  title: 'Set a new password | Rutherford',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function UpdatePasswordRoute() {
  if (!ACCOUNT_ENABLED) notFound();
  return (
    <Suspense>
      <UpdatePasswordPage />
    </Suspense>
  );
}
