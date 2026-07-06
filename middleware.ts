import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// 'en' is served unprefixed at the root (canonical / x-default).
// These locales get a URL prefix and are rewritten to the same pages.
const PREFIX_LOCALES = ['fr', 'de', 'it', 'es', 'pt'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const seg = pathname.split('/')[1];
  const localized = PREFIX_LOCALES.includes(seg);
  const locale = localized ? seg : 'en';

  // go.colorloop.ai is a ColorLoop-first marketing domain: its bare root should
  // land on the ColorLoop variant of the offset360 page, not the Rutherford home.
  // Only the bare root (or a locale root like /fr) redirects; deeper paths and
  // rutherford.fr are untouched. Temporary redirect — the domain strategy may change.
  const host = request.headers.get('host') ?? '';
  const isRoot = pathname === '/' || (localized && pathname === `/${seg}`);
  if (host.includes('colorloop.') && isRoot) {
    const target = request.nextUrl.clone();
    target.pathname = localized ? `/${seg}/offset360` : '/offset360';
    return NextResponse.redirect(target, 307);
  }

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
