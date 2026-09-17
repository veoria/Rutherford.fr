import type { MetadataRoute } from 'next';
import { articleLocales, getAllArticles } from '@/lib/blog';
import { ALL_COURSES } from '@/data/academy-courses';
import { PRESS_BRANDS_PAGES } from '@/data/press-brands';
import { ALL_REGIONS } from '@/data/regions';

const BASE = 'https://rutherford.fr';
const PREFIX_LOCALES = ['fr', 'de', 'it', 'es', 'pt'];

// Language alternates (hreflang) for a given canonical (English, unprefixed) path.
// Only the locales passed in are listed, so untranslated pages don't advertise
// duplicate English content under /fr, /de, etc.
function languages(path: string, locales: string[] = PREFIX_LOCALES): Record<string, string> {
  const suffix = path === '/' ? '' : path;
  return {
    en: `${BASE}${suffix || '/'}`,
    ...Object.fromEntries(locales.filter((l) => l !== 'en').map((l) => [l, `${BASE}/${l}${suffix}`])),
    'x-default': `${BASE}${suffix || '/'}`,
  };
}

type Entry = { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number; lastModified?: string | Date; locales?: string[] };

function entry({ path, changeFrequency, priority, lastModified, locales }: Entry): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE}${path}`,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency,
    priority,
    alternates: { languages: languages(path, locales) },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: '/', changeFrequency: 'weekly' as const, priority: 1 },
    { path: '/offset360', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/closed-loop-color-control', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/console-validation', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/roi', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/academy', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/glossary', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/blog', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/contact', changeFrequency: 'yearly' as const, priority: 0.5 },
    { path: '/support', changeFrequency: 'yearly' as const, priority: 0.3 },
  ].map(entry);

  const brandRoutes = PRESS_BRANDS_PAGES.map((brand) =>
    entry({ path: `/console-validation/${brand.slug}`, changeFrequency: 'monthly', priority: 0.8 }),
  );

  const courseRoutes = ALL_COURSES.map((course) =>
    entry({ path: `/academy/${course.id}`, changeFrequency: 'monthly', priority: 0.6 }),
  );

  const articleRoutes = getAllArticles().map((article) =>
    entry({
      path: `/blog/${article.slug}`,
      changeFrequency: 'yearly',
      priority: 0.5,
      lastModified: article.publishedAt,
      locales: articleLocales(article),
    }),
  );

  // Region conversion hubs (English-only for now → no hreflang language alternates).
  // /usa and /canada canonicalize to go.colorloop.ai (US market builds SEO on the
  // international domain), so they are left out of this rutherford.fr sitemap:
  // a sitemap should only list canonical URLs of its own host.
  const COLORLOOP_CANONICAL_REGIONS = new Set(['usa', 'canada']);
  const regionRoutes: MetadataRoute.Sitemap = ALL_REGIONS.filter(
    (region) => !COLORLOOP_CANONICAL_REGIONS.has(region.slug),
  ).map((region) => ({
    url: `${BASE}/${region.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...brandRoutes, ...courseRoutes, ...articleRoutes, ...regionRoutes];
}
