import { notFound } from 'next/navigation';

import { EditOverlay } from '@/components/dev/edit-overlay';
import HomePage from '@/components/home-page';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Homepage, edit mode (dev)',
  robots: { index: false, follow: false },
};

/**
 * The real homepage with an editing surface on top. The homepage components are
 * imported unmodified: the overlay finds what is editable by matching the page
 * against data/home, so nothing here changes what production renders.
 *
 * Outside development this route renders the 404 page.
 */
export default function DevEditPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <>
      <HomePage />
      <EditOverlay />
    </>
  );
}
