import { notFound } from 'next/navigation';

import HomeV2 from '@/components/home-v2';

import '@/app/offset360/offset360.css';
import './home-v2.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Homepage v2 (dev preview)',
  robots: { index: false, follow: false },
};

/**
 * Preview of the rebuilt homepage, so it can be compared with the live one
 * before anything is swapped. Not reachable outside development.
 */
export default function DevHomeV2Page() {
  if (process.env.NODE_ENV === 'production') notFound();

  return <HomeV2 />;
}
