'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { CONSENT_KEY } from '@/components/cookie-consent';

// LinkedIn Insight Tag: website demographics, retargeting audiences and
// conversion tracking for the Rutherford.fr page. Same consent model as
// GoogleAnalytics: nothing loads until the visitor accepts the cookie banner.
// Dormant until NEXT_PUBLIC_LINKEDIN_PARTNER_ID is set.
export function LinkedInInsight() {
  const partnerId = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID;
  const [granted, setGranted] = useState(false);

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

  if (!partnerId || !granted) return null;

  return (
    <Script id="linkedin-insight" strategy="afterInteractive">
      {`
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push('${partnerId}');
        (function(l) {
          if (!l) {
            window.lintrk = function(a, b) { window.lintrk.q.push([a, b]); };
            window.lintrk.q = [];
          }
          var s = document.getElementsByTagName('script')[0];
          var b = document.createElement('script');
          b.type = 'text/javascript';
          b.async = true;
          b.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
          s.parentNode.insertBefore(b, s);
        })(window.lintrk);
      `}
    </Script>
  );
}
