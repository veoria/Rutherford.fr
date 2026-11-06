/**
 * Destinations of the homepage buttons and CTAs, lifted out of the components
 * so /dev/edit can retarget them without touching code.
 *
 * The brand explainer cards are not here: their href already travels with the
 * card copy in data/home/brand-explainer-section.json.
 */

import LINKS from '@/data/home/links.json';

export type HomeLinkKey = keyof typeof LINKS;

/** Prefixes an internal path with the locale (/fr/roi, /fr#about); external links are untouched. */
export function localizeHref(href: string, locale: string): string {
  if (locale === 'en' || !href.startsWith('/') || href.startsWith('//')) return href;
  if (href === '/') return `/${locale}`;
  if (href.startsWith('/#')) return `/${locale}${href.slice(1)}`;
  return `/${locale}${href}`;
}

export function homeLink(key: HomeLinkKey, locale = 'en'): string {
  return localizeHref(LINKS[key], locale);
}

export { LINKS as HOME_LINKS };
