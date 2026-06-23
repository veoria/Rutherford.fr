import articles from '@/data/blog-articles.json';

export type BlogArticle = {
  slug: string;
  title: string;
  excerpt: string;
  lead: string;
  image: string;
  publishedAt?: string;
  paragraphs: string[];
  /**
   * Optional structured editorial body (headings, subheadings, bullet lists).
   * When present, the article page renders this instead of the flat
   * `paragraphs`, for a magazine-style layout. `paragraphs` stays as the
   * fallback / SEO summary for articles that don't define a body.
   */
  body?: Array<
    | { type: 'h2' | 'h3' | 'p'; text: string }
    | { type: 'ul'; items: string[] }
    | { type: 'figure'; src: string; alt?: string; caption?: string }
  >;
  originalUrl: string;
  category: string;
  /**
   * Optional override for the article's destination URL. When set, the blog
   * index card routes to this URL instead of /blog/<slug>. Use for teaser
   * articles that should land users on a dedicated page (e.g. /offset360).
   */
  href?: string;
  sources?: Array<{
    label: string;
    href: string;
  }>;
};

const baseArticles = articles as BlogArticle[];

function buildPublishedDate(index: number) {
  const date = new Date(Date.UTC(2026, 3, 8));
  date.setUTCDate(date.getUTCDate() - index * 6);
  return date.toISOString().slice(0, 10);
}

const blogArticles = baseArticles.map((article, index) => ({
  ...article,
  publishedAt: article.publishedAt ?? buildPublishedDate(index),
}));

export function getAllArticles(): BlogArticle[] {
  return blogArticles;
}

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return blogArticles.find((article) => article.slug === slug);
}
