import type { Metadata } from 'next';
import { HomeStudio } from '@/components/home-studio';

export const metadata: Metadata = {
  title: 'Rutherford.fr | Studio (v2 preview)',
  robots: { index: false, follow: false },
};

export default function V2Page() {
  return <HomeStudio />;
}
