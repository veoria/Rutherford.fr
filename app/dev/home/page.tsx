import { notFound } from 'next/navigation';

import { HomeEditor } from '@/components/dev/home-editor';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Homepage editor (dev)',
  robots: { index: false, follow: false },
};

/**
 * Local tool for editing the homepage copy and photography. It writes to the
 * working tree, so outside development the route renders the 404 page.
 */
export default function DevHomePage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return <HomeEditor />;
}
