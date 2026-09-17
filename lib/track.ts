'use client';

import { track } from '@vercel/analytics';

// One call per conversion, sent to every analytics surface we run: GA4 and
// PostHog (both consent-gated, so they no-op until accepted), Vercel Web
// Analytics (cookieless) and the LinkedIn Insight Tag when a conversion id is
// configured for that event.

type ConversionName = 'newsletter_signup' | 'contact_submit' | 'console_validation_submit' | 'roi_lead_submit';

// LinkedIn Campaign Manager conversion ids, one env var per event (optional).
const LINKEDIN_CONVERSIONS: Partial<Record<ConversionName, string | undefined>> = {
  newsletter_signup: process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_NEWSLETTER,
  contact_submit: process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_CONTACT,
  console_validation_submit: process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_CONSOLE,
  roi_lead_submit: process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_ROI,
};

export function trackConversion(name: ConversionName, params: Record<string, string> = {}): void {
  if (typeof window === 'undefined') return;
  const w = window as any;
  try {
    w.gtag?.('event', name, { event_category: 'lead', ...params });
    w.posthog?.capture?.(name, params);
    track(name, params);
    const conversionId = LINKEDIN_CONVERSIONS[name];
    if (conversionId) w.lintrk?.('track', { conversion_id: Number(conversionId) });
  } catch {
    /* analytics must never break a form */
  }
}
