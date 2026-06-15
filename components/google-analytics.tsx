'use client';

import { Suspense, useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { CONSENT_KEY } from '@/components/cookie-consent';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function PageviewTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || typeof window.gtag !== 'function') return;
    const search = searchParams?.toString();
    const url = pathname + (search ? `?${search}` : '');
    window.gtag('config', measurementId, { page_path: url });
  }, [pathname, searchParams, measurementId]);

  return null;
}

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_ID;
  const [granted, setGranted] = useState(false);

  // Only load gtag once analytics consent is granted (see CookieConsent).
  useEffect(() => {
    const read = () => {
      try {
        setGranted(localStorage.getItem(CONSENT_KEY) === 'granted');
      } catch {
        setGranted(false);
      }
    };
    read();
    window.addEventListener('rf-consent', read);
    return () => window.removeEventListener('rf-consent', read);
  }, []);

  if (!measurementId || !granted) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: true });
        `}
      </Script>
      <Suspense fallback={null}>
        <PageviewTracker measurementId={measurementId} />
      </Suspense>
    </>
  );
}
