import articles from '@/data/blog-articles.json';

export type BlogArticle = {
  slug: string;
  title: string;
  excerpt: string;
  lead: string;
  image: string;
  publishedAt?: string;
  paragraphs: string[];
  originalUrl: string;
  category: string;
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
