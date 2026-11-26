import type { Metadata } from 'next';
import { ColorConnectPage } from '@/components/colorconnect-page';

// Preview page: kept out of the index until Hugues validates it.
export const metadata: Metadata = {
  title: 'ColorConnect | Your whole print shop on one screen',
  description:
    'The print shop portal for offset and flexo pressrooms: jobs prepared from your prepress files, every press live on one screen, color history from ColorLoop presses, PPWR and DPP evidence from your own jobs.',
  robots: { index: false, follow: false },
};

export default function ColorConnectRoute() {
  return <ColorConnectPage />;
}
