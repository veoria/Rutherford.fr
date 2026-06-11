import type { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/blog';
import { ALL_COURSES } from '@/data/academy-courses';

const BASE = 'https://rutherford.fr';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/offset360`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/console-validation`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/academy`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/support`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const courseRoutes: MetadataRoute.Sitemap = ALL_COURSES.map((course) => ({
    url: `${BASE}/academy/${course.id}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const articleRoutes: MetadataRoute.Sitemap = getAllArticles().map((article) => ({
    url: `${BASE}/blog/${article.slug}`,
    lastModified: article.publishedAt,
    changeFrequency: 'yearly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...courseRoutes, ...articleRoutes];
}
