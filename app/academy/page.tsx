import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AcademyPage } from '@/components/academy-page';

export const metadata: Metadata = {
  title: 'Rutherford Academy: Offset color management masterclasses',
  description:
    'Online courses and masterclasses on closed-loop color, MeasureColor, IntelliTrax2 and ColorLoop, built by Rutherford for offset printers, packaging converters and brand owners.',
};

export const dynamic = 'force-dynamic';

export default function AcademyRoute() {
  if (process.env.NEXT_PUBLIC_ACADEMY_ENABLED !== 'true') notFound();
  return <AcademyPage />;
}
