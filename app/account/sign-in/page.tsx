import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { SignInPage } from '@/components/sign-in-page';

export const metadata: Metadata = {
  title: 'Your partner account | Rutherford',
  description: 'Sign in or create your free account: presses, validations and clients in one place.',
  openGraph: {
    title: 'Your partner account | Rutherford',
    description: 'Sign in or create your free account: presses, validations and clients in one place.',
    url: 'https://rutherford.fr/account/sign-in',
    siteName: 'Rutherford.fr',
    images: [{ url: '/images/og-account.png', width: 1200, height: 630, alt: 'Your presses, validations and clients. One login.' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your partner account | Rutherford',
    description: 'Sign in or create your free account: presses, validations and clients in one place.',
    images: ['/images/og-account.png'],
  },
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
