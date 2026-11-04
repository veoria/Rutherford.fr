import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ColorLoopHome } from '@/components/colorloop-home';

// The same page on a light ground, for comparison with /colorloop-home.
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--clh-font' });

export const metadata: Metadata = {
  title: 'Rutherford.fr | ColorLoop home, light (preview)',
  robots: { index: false, follow: false },
};

export default function ColorLoopHomeLightPage() {
  return (
    <div className={inter.variable}>
      <ColorLoopHome tone="light" />
    </div>
  );
}
