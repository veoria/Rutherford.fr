/**
 * Destinations of the homepage buttons and CTAs, lifted out of the components
 * so /dev/edit can retarget them without touching code.
 *
 * The brand explainer cards are not here: their href already travels with the
 * card copy in data/home/brand-explainer-section.json.
 */

import LINKS from '@/data/home/links.json';

export type HomeLinkKey = keyof typeof LINKS;

export function homeLink(key: HomeLinkKey): string {
  return LINKS[key];
}

export { LINKS as HOME_LINKS };
