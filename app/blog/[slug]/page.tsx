import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogArticlePage } from '@/components/blog-article-page';
import { getAllArticles, getArticleBySlug } from '@/lib/blog';

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

  return {
    title: `${article.title} | Rutherford Blog`,
    description: article.lead,
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
    openGraph: {
      title: `${article.title} | Rutherford Blog`,
      description: article.lead,
      type: 'article',
      url: `/blog/${article.slug}`,
      images: article.image ? [{ url: article.image, alt: article.title }] : undefined,
    },
  };
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
    datePublished: article.publishedAt,
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
      <BlogArticlePage article={article} />
    </>
  );
}
