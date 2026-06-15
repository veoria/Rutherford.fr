import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { UpdatePasswordPage } from '@/components/update-password-page';

export const metadata: Metadata = {
  title: 'Set a new password | Rutherford Academy',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function UpdatePasswordRoute() {
  if (process.env.NEXT_PUBLIC_ACADEMY_ENABLED !== 'true') notFound();
  return (
    <Suspense>
      <UpdatePasswordPage />
    </Suspense>
  );
}
