import type { Metadata } from 'next';
import { SEO_COPY, localizedMetadata } from '@/lib/seo';
import { BlogIndexPage } from '@/components/blog-index-page';
import { getAllArticles } from '@/lib/blog';

export function generateMetadata(): Metadata {
  return localizedMetadata({
    path: '/blog',
    title: SEO_COPY.blog.title,
    description: SEO_COPY.blog.description,
  });
}

export default function BlogPage() {
  const articles = getAllArticles();
  return <BlogIndexPage articles={articles} />;
}
