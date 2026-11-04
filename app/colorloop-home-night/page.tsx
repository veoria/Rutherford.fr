import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ColorLoopHome } from '@/components/colorloop-home';

// The same page on the night ground, for comparison with /colorloop-home (light since 4 Nov 2026).
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--clh-font' });

export const metadata: Metadata = {
  title: 'Rutherford.fr | ColorLoop home, night (preview)',
  robots: { index: false, follow: false },
};

export default function ColorLoopHomeNightPage() {
  return (
    <div className={inter.variable}>
      <ColorLoopHome tone="night" />
    </div>
  );
}
