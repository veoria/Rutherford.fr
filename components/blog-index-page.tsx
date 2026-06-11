'use client';
import { SiteFooter } from '@/components/site-footer';
import { useLanguage, type Locale } from '@/components/language-provider';
import { SiteNav } from '@/components/site-nav';
import type { BlogArticle } from '@/lib/blog';

export function BlogIndexPage({ articles }: { articles: BlogArticle[] }) {
  const { locale } = useLanguage();
  const copy: Record<Locale, { kicker: string; title: string; subtitle: string; indexed: string; read: string; dateLocale: string }> = {
    en: { kicker: 'Rutherford Journal', title: 'Our Articles', subtitle: 'News, case studies, product releases, testimonials and practical insights from the print floor.', indexed: 'indexed articles', read: 'Read article', dateLocale: 'en-GB' },
    fr: { kicker: 'Journal Rutherford', title: 'Nos articles', subtitle: 'Actualités, études de cas, lancements produits, témoignages et retours terrain.', indexed: 'articles indexés', read: 'Lire l’article', dateLocale: 'fr-FR' },
    de: { kicker: 'Rutherford Journal', title: 'Unsere Artikel', subtitle: 'Neuigkeiten, Fallstudien, Produktneuheiten, Erfahrungsberichte und praktische Einblicke aus der Druckproduktion.', indexed: 'indizierte Artikel', read: 'Artikel lesen', dateLocale: 'de-DE' },
    it: { kicker: 'Rutherford Journal', title: 'I nostri articoli', subtitle: 'News, case study, release di prodotto, testimonianze e insight pratici dal reparto stampa.', indexed: 'articoli indicizzati', read: 'Leggi l’articolo', dateLocale: 'it-IT' },
    es: { kicker: 'Journal Rutherford', title: 'Nuestros artículos', subtitle: 'Noticias, casos de estudio, lanzamientos de producto, testimonios e ideas prácticas desde la planta de impresión.', indexed: 'artículos indexados', read: 'Leer artículo', dateLocale: 'es-ES' },
  };
  const t = copy[locale];
  return (
    <main className="page-shell">
      <SiteNav current="blog" />

      <section className="blog-hero section">
        <div className="container blog-hero-inner">
          <p className="section-kicker">{t.kicker}</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </section>

      <section className="section blog-index-section">
        <div className="container">
          <div className="blog-count">
            <strong>{articles.length}</strong>
            <span>{t.indexed}</span>
          </div>

          <div className="blog-grid">
            {articles.map((article) => (
              <article className="blog-card" key={article.slug}>
                {article.image ? (
                  <div className="blog-card-image">
                    <img src={article.image} alt={article.title} loading="lazy" />
                  </div>
                ) : null}
                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    <p className="section-kicker">{article.category}</p>
                    {article.publishedAt ? (
                      <time className="blog-card-date" dateTime={article.publishedAt}>
                        {new Date(article.publishedAt).toLocaleDateString(t.dateLocale, {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </time>
                    ) : null}
                  </div>
                  <h2>{article.title}</h2>
                  <p>{article.excerpt}</p>
                  <a className="button button-outline blog-card-button" href={`/blog/${article.slug}`}>
                    {t.read}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
