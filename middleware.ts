import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// 'en' is served unprefixed at the root (canonical / x-default).
// These locales get a URL prefix and are rewritten to the same pages.
const PREFIX_LOCALES = ['fr', 'de', 'it', 'es'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const seg = pathname.split('/')[1];
  const localized = PREFIX_LOCALES.includes(seg);
  const locale = localized ? seg : 'en';

  // Expose the resolved locale + original path to server components (layout/pages).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);
  requestHeaders.set('x-pathname', pathname);

  // For /fr, /de, /it, /es: rewrite to the unprefixed page (no route duplication).
  let rewriteUrl: URL | undefined;
  if (localized) {
    rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathname.slice(seg.length + 1) || '/';
  }

  return updateSession(request, { rewriteUrl, requestHeaders });
}

export const config = {
  matcher: [
    // run on every route except static assets, _next, api/stripe/webhook (raw body needed)
    '/((?!_next/static|_next/image|favicon.ico|videos|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$|api/stripe/webhook).*)',
  ],
};
