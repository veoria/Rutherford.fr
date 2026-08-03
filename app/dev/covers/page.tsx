import { notFound } from 'next/navigation';

import { CoverEditor } from '@/components/dev/cover-editor';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blog cover editor (dev)',
  robots: { index: false, follow: false },
};

/**
 * Local tool for framing blog cover images. It writes to the working tree, so
 * it only exists while `next dev` is running: in a production build the route
 * renders the 404 page.
 */
export default function DevCoversPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return <CoverEditor />;
}
