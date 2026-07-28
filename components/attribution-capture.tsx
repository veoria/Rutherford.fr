'use client';

import { Suspense, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureAttribution } from '@/lib/attribution';

// Records the session's first touch (UTM / referrer / landing page) so a console
// validation deal can say where it came from. Deliberately not gated behind the
// cookie banner: nothing is written unless the visitor later submits the form,
// and the data never leaves the first-party session.
function Capture() {
  const pathname = usePathname();
  useEffect(() => {
    captureAttribution();
  }, [pathname]);
  return null;
}

export function AttributionCapture() {
  return (
    <Suspense fallback={null}>
      <Capture />
    </Suspense>
  );
}
