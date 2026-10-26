import type { Metadata } from 'next';
import { ConsoleCheckPreview } from '@/components/console-check-preview';

// Visual test of the next console validation; not linked, not indexed, sends nothing.
export const metadata: Metadata = {
  title: 'Console validation (test)',
  robots: { index: false, follow: false },
};

export default function ConsoleValidationPreviewPage() {
  return <ConsoleCheckPreview />;
}
