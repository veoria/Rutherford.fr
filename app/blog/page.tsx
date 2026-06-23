import type { Metadata } from 'next';
import { BlogIndexPage } from '@/components/blog-index-page';
import { getAllArticles } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog | Rutherford.fr',
  description: 'All Rutherford blog articles in a clean, searchable index.',
};

export default function BlogPage() {
  const articles = getAllArticles();
  return <BlogIndexPage articles={articles} />;
}
