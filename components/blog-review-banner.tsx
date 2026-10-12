import type { BlogArticle } from '@/lib/blog';

/** dd/mm/yyyy, the way FX and Hugues read dates. */
export function frDate(iso?: string): string {
  if (!iso) return 'date à fixer';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Staging strip on an article that production does not show yet. */
export function BlogReviewBanner({ article }: { article: BlogArticle }) {
  return (
    <div
      role="note"
      style={{
        background: '#1d1d1f',
        color: '#f5f5f7',
        fontSize: 14,
        lineHeight: 1.45,
        padding: '10px 16px',
        textAlign: 'center',
      }}
    >
      <strong style={{ color: '#ffd60a' }}>Aperçu, article à valider.</strong> Publication prévue le{' '}
      {frDate(article.publishedAt)}. Il n&apos;apparaît pas sur rutherford.fr tant qu&apos;il n&apos;est pas validé.{' '}
      <a href="/blog/review" style={{ color: '#6fb1ff', textDecoration: 'underline' }}>
        Tous les articles à valider
      </a>
    </div>
  );
}
