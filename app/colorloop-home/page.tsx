import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ColorLoopHome } from '@/components/colorloop-home';

// ColorLoop's own text face, so the page reads as colorloop.ai's world.
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--clh-font' });

export const metadata: Metadata = {
  title: 'Rutherford.fr | ColorLoop home (preview)',
  robots: { index: false, follow: false },
};

export default function ColorLoopHomePage() {
  return (
    <div className={inter.variable}>
      <ColorLoopHome />
    </div>
  );
}
