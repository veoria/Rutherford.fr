import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { SignInPage } from '@/components/sign-in-page';

export const metadata: Metadata = {
  title: 'Sign in | Rutherford Academy',
  description: 'Sign in to access your enrolled courses and progress.',
};

export const dynamic = 'force-dynamic';

export default function SignInRoute() {
  if (process.env.NEXT_PUBLIC_ACADEMY_ENABLED !== 'true') notFound();
  return (
    <Suspense>
      <SignInPage />
    </Suspense>
  );
}
