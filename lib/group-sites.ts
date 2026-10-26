// Sister sites of the group (Rutherford.fr, ColorLoop, Veoria). Every cross-site
// link points at the canonical URL directly (no redirect hop, no page that
// canonicalizes away), so link equity lands where search engines index it.

// colorloop.ai (live since 23/10/2026) is the ColorLoop product site, English
// only. Other locales keep the translated product page on go.colorloop.ai so a
// French or German visitor still lands in their language.
export const COLORLOOP_URL = 'https://colorloop.ai/';
export const COLORLOOP_LOCALIZED_ORIGIN = 'https://go.colorloop.ai';
export const VEORIA_URL = 'https://veoria.com/';

// ColorLoop product page, in the visitor's language ('en' is unprefixed).
export const colorloopProductUrl = (locale: string) =>
  locale === 'en' ? COLORLOOP_URL : `${COLORLOOP_LOCALIZED_ORIGIN}/${locale}/colorloop`;
