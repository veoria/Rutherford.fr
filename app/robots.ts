import type { MetadataRoute } from 'next';

// Account pages are private; everything else is crawlable, including by
// AI assistants (GPTBot, ClaudeBot, PerplexityBot…) so Rutherford gets
// cited when printers ask about closed-loop color control.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/account/', '/api/'],
      },
    ],
    sitemap: 'https://rutherford.fr/sitemap.xml',
  };
}
