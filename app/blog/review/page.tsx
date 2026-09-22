import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { frDate } from '@/components/blog-review-banner';
import { SHOW_REVIEW_ARTICLES, getReviewArticles } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Articles à valider | Rutherford Blog',
  robots: { index: false, follow: false },
};

// Staging only: FX opens this page from Asana, reads each article as it will
// look on the site, then validates it in Asana. Production answers 404.
export default function BlogReviewPage() {
  if (!SHOW_REVIEW_ARTICLES) notFound();
  const articles = getReviewArticles();

  return (
    <main className="page-shell">
      <SiteNav current="blog" />
      <section className="section">
        <div className="container" style={{ maxWidth: 880 }}>
          <p className="section-kicker">Staging</p>
          <h1 style={{ margin: '8px 0 12px' }}>Articles à valider</h1>
          <p style={{ color: '#6e6e73', marginBottom: 32 }}>
            Ces articles sont visibles uniquement ici, sur le staging, exactement comme ils apparaîtront sur le site.
            Ils n&apos;apparaissent pas sur rutherford.fr tant qu&apos;ils ne sont pas validés. Pour chacun, ouvrez la
            version anglaise et la version française, puis validez ou commentez la tâche correspondante dans Asana.
          </p>

          {articles.length === 0 ? (
            <p>Aucun article en attente de validation.</p>
          ) : (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 20 }}>
              {articles.map((article) => {
                const fr = article.i18n?.fr;
                return (
                  <li
                    key={article.slug}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 200px) 1fr',
                      gap: 20,
                      alignItems: 'start',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <a href={`/blog/${article.slug}`}>
                      <img
                        src={article.image}
                        alt=""
                        style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 10 }}
                      />
                    </a>
                    <div>
                      <p style={{ fontSize: 13, color: '#6e6e73', margin: 0 }}>
                        Publication prévue le {frDate(article.publishedAt)} · {article.category}
                      </p>
                      <h2 style={{ fontSize: 22, margin: '6px 0 4px' }}>{article.title}</h2>
                      {fr?.title ? <p style={{ margin: '0 0 8px', color: '#424245' }}>{fr.title}</p> : null}
                      <p style={{ margin: '0 0 12px', color: '#424245' }}>{fr?.excerpt ?? article.excerpt}</p>
                      <p style={{ margin: 0, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <a href={`/blog/${article.slug}`}>Lire en anglais →</a>
                        {fr?.body ? <a href={`/fr/blog/${article.slug}`}>Lire en français →</a> : null}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
