'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { CONSENT_KEY } from '@/components/cookie-consent';

// PostHog product analytics. Same consent model as GoogleAnalytics: nothing
// loads until the visitor accepts the cookie banner ('rf-consent' event).
// EU data residency (eu.i.posthog.com) unless overridden via env.
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

// App Router keeps the page alive across client-side navigations, so $pageview
// must be captured manually on every route change (initial load included).
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !posthog.__loaded) return;
    const search = searchParams?.toString();
    posthog.capture('$pageview', {
      $current_url: window.location.origin + pathname + (search ? `?${search}` : ''),
    });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogAnalytics() {
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

  useEffect(() => {
    if (!granted || !POSTHOG_KEY || posthog.__loaded) return;
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // handled by PageviewTracker (SPA navigations)
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
    });
    posthog.capture('$pageview');
  }, [granted]);

  if (!POSTHOG_KEY || !granted) return null;

  return (
    <Suspense fallback={null}>
      <PageviewTracker />
    </Suspense>
  );
}
