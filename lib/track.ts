'use client';

import { track } from '@vercel/analytics';
import posthog from 'posthog-js';
import { readAttribution } from '@/lib/attribution';

// One call per conversion, sent to every analytics surface we run: GA4 and
// PostHog (both consent-gated, so they no-op until accepted), Vercel Web
// Analytics (cookieless) and the LinkedIn Insight Tag when a conversion id is
// configured for that event.
//
// GA4 and PostHog also get the session's first touch (lib/attribution) as
// lead_source / lead_medium / lead_campaign. Prefixed on purpose: GA4 reads
// plain source / medium / campaign parameters as campaign data and would
// rewrite the session's traffic source. Vercel only gets the caller's params,
// its Pro plan keeps 2 properties per custom event.

type ConversionName = 'newsletter_signup' | 'contact_submit' | 'console_validation_submit' | 'roi_lead_submit';

// LinkedIn Campaign Manager conversion ids, one env var per event (optional).
const LINKEDIN_CONVERSIONS: Partial<Record<ConversionName, string | undefined>> = {
  newsletter_signup: process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_NEWSLETTER,
  contact_submit: process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_CONTACT,
  console_validation_submit: process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_CONSOLE,
  roi_lead_submit: process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_ROI,
};

function attributionParams(): Record<string, string> {
  const a = readAttribution();
  return {
    lead_source: a?.source ?? a?.referrer ?? 'direct',
    ...(a?.medium ? { lead_medium: a.medium } : {}),
    ...(a?.campaign ? { lead_campaign: a.campaign } : {}),
  };
}

export function trackConversion(name: ConversionName, params: Record<string, string> = {}): void {
  if (typeof window === 'undefined') return;
  const w = window as any;
  try {
    const withSource = { ...attributionParams(), ...params };
    w.gtag?.('event', name, { event_category: 'lead', ...withSource });
    // posthog-js comes from npm, so there is no window.posthog: use the module
    // instance, once components/posthog-analytics has initialised it (consent).
    if (posthog.__loaded) posthog.capture(name, withSource);
    track(name, params);
    const conversionId = LINKEDIN_CONVERSIONS[name];
    if (conversionId) w.lintrk?.('track', { conversion_id: Number(conversionId) });
  } catch {
    /* analytics must never break a form */
  }
}
