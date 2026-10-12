import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogArticlePage } from '@/components/blog-article-page';
import { BlogReviewBanner } from '@/components/blog-review-banner';
import { articleLocales, getAllArticles, getArticleBySlug } from '@/lib/blog';
import { localizedMetadata, type Localized } from '@/lib/seo';

type ArticlePageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: ArticlePageProps): Metadata {
  const article = getArticleBySlug(params.slug);
  if (!article) {
    return {
      title: 'Article not found | Rutherford.fr',
    };
  }

  const locales = articleLocales(article);
  const title: Record<string, string> = {};
  const description: Record<string, string> = {};
  for (const locale of locales) {
    const t = locale === 'en' ? undefined : article.i18n?.[locale];
    title[locale] = `${t?.title ?? article.title} | Rutherford Blog`;
    description[locale] = t?.lead ?? t?.excerpt ?? article.lead;
  }

  const metadata = localizedMetadata({
    path: `/blog/${article.slug}`,
    title: title as Localized,
    description: description as Localized,
    type: 'article',
    locales,
    image: article.image ? { url: article.image, alt: article.title } : undefined,
  });
  // An article under review only exists on staging: keep it out of any index.
  return article.review ? { ...metadata, robots: { index: false, follow: false } } : metadata;
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.lead,
    image: article.image ? `https://rutherford.fr${article.image}` : undefined,
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
    inLanguage: articleLocales(article),
    author: { '@type': 'Organization', name: 'Rutherford.fr', url: 'https://rutherford.fr' },
    publisher: { '@type': 'Organization', name: 'Rutherford.fr', url: 'https://rutherford.fr' },
    mainEntityOfPage: `https://rutherford.fr/blog/${article.slug}`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Rutherford.fr', item: 'https://rutherford.fr/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://rutherford.fr/blog' },
      { '@type': 'ListItem', position: 3, name: article.title, item: `https://rutherford.fr/blog/${article.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {article.review ? <BlogReviewBanner article={article} /> : null}
      <BlogArticlePage article={article} />
    </>
  );
}
