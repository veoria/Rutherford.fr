// Sister sites of the group (Rutherford.fr, ColorLoop, Veoria). Every cross-site
// link points at the canonical URL directly (no redirect hop, no page that
// canonicalizes away), so link equity lands where search engines index it.

// colorloop.ai (live since 23/10/2026) is the ColorLoop product site. Since
// 4/11/2026 it has French, Spanish, Italian and Portuguese versions under a
// locale prefix; German visitors get the English pages.
export const COLORLOOP_URL = 'https://colorloop.ai/';
export const COLORLOOP_LOCALIZED_ORIGIN = 'https://go.colorloop.ai';
export const VEORIA_URL = 'https://veoria.com/';

const COLORLOOP_LOCALES = ['fr', 'es', 'it', 'pt'];

// ColorLoop product site, in the visitor's language ('en' is unprefixed).
export const colorloopProductUrl = (locale: string) =>
  COLORLOOP_LOCALES.includes(locale) ? `${COLORLOOP_URL}${locale}/` : COLORLOOP_URL;
