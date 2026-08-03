/**
 * Homepage photography, lifted out of the components so the /dev/home editor
 * can swap and reframe it. Logos, pictograms and product screenshots stay in
 * the components: replacing those is a brand-asset job, not a layout one.
 */

import MEDIA from '@/data/home/media.json';

export type HomeMediaKey = keyof typeof MEDIA;

export function homeMedia(key: HomeMediaKey): string {
  return MEDIA[key];
}

export { MEDIA as HOME_MEDIA };
