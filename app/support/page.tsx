import type { Metadata } from 'next';
import { SupportPage } from '@/components/support-page';

export const metadata: Metadata = {
  alternates: { canonical: '/support' },
};

export default function SupportRoute() {
  return <SupportPage />;
}
