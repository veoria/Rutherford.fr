import articles from '@/data/blog-articles.json';

export type BlogBody = Array<
  | { type: 'h2' | 'h3' | 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'figure'; src: string; alt?: string; caption?: string }
>;

/** Per-locale translation of an article's text (title/lead/excerpt/body). Falls back to EN. */
export type ArticleTranslation = {
  title?: string;
  excerpt?: string;
  lead?: string;
  body?: BlogBody;
};

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
  body?: BlogBody;
  /** Translations keyed by locale (de/fr/it/es). Missing fields fall back to the English base. */
  i18n?: Record<string, ArticleTranslation>;
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
  /**
   * Waiting for validation (FX, through Asana). Shown on staging with a
   * preview banner and listed at /blog/review; left out of production
   * everywhere until the flag is removed and the change is pushed.
   */
  review?: boolean;
};

// Articles carried over from the previous site have no known publication date:
// they keep publishedAt undefined rather than an invented one, so the sitemap,
// the BlogPosting schema and the index only show real dates. The JSON order
// (newest first) drives the listing.
const allArticles = articles as BlogArticle[];

// Only the redesign branch (staging) and local dev show articles under review.
// Keyed on the branch rather than VERCEL_ENV so a preview build of any other
// project or branch can never expose an unvalidated article.
export const SHOW_REVIEW_ARTICLES =
  process.env.NODE_ENV === 'development' || process.env.VERCEL_GIT_COMMIT_REF === 'redesign';

const blogArticles = SHOW_REVIEW_ARTICLES ? allArticles : allArticles.filter((article) => !article.review);

export function getAllArticles(): BlogArticle[] {
  return blogArticles;
}

/** Articles waiting for validation, oldest planned date first. Empty outside staging. */
export function getReviewArticles(): BlogArticle[] {
  if (!SHOW_REVIEW_ARTICLES) return [];
  return allArticles
    .filter((article) => article.review)
    .sort((a, b) => (a.publishedAt ?? '').localeCompare(b.publishedAt ?? ''));
}

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return blogArticles.find((article) => article.slug === slug);
}

/** Locales with a real translation of the article (English base always counts). */
export function articleLocales(article: BlogArticle): Array<'en' | 'fr' | 'de' | 'it' | 'es' | 'pt'> {
  const translated = Object.entries(article.i18n ?? {})
    .filter(([, t]) => Boolean(t?.title))
    .map(([locale]) => locale) as Array<'fr' | 'de' | 'it' | 'es' | 'pt'>;
  return ['en', ...translated];
}
