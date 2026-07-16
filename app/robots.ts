import type { MetadataRoute } from 'next';

// Account pages are private; everything else is crawlable. AI crawlers are
// allowed explicitly (not just via *): being ingested and cited by ChatGPT,
// Claude, Perplexity, Copilot and AI Overviews is a real acquisition channel
// (GEO), so the door is opened by name.
const PRIVATE = ['/account/', '/api/'];

const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'meta-externalagent',
  'Amazonbot',
  'Bytespider',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: PRIVATE,
      })),
    ],
    sitemap: ['https://rutherford.fr/sitemap.xml', 'https://go.colorloop.ai/sitemap-colorloop.xml'],
  };
}
