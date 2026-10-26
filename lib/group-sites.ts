// Sister sites of the group (Rutherford.fr, ColorLoop, Veoria). Every cross-site
// link points at the canonical URL directly (no redirect hop, no page that
// canonicalizes away), so link equity lands where search engines index it.
// When the new colorloop.ai marketing site launches, switch COLORLOOP_ORIGIN.

export const COLORLOOP_ORIGIN = 'https://go.colorloop.ai';
export const VEORIA_URL = 'https://veoria.com/';

// ColorLoop product page, in the visitor's language ('en' is unprefixed).
export const colorloopProductUrl = (locale: string) =>
  `${COLORLOOP_ORIGIN}${locale === 'en' ? '' : `/${locale}`}/colorloop`;
