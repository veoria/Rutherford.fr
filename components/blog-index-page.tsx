'use client';
import { useMemo, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { useLanguage, type Locale } from '@/components/language-provider';
import { SiteNav } from '@/components/site-nav';
import type { BlogArticle } from '@/lib/blog';

export function BlogIndexPage({ articles }: { articles: BlogArticle[] }) {
  const { locale } = useLanguage();
  const copy: Record<Locale, { kicker: string; title: string; subtitle: string; indexed: string; search: string; all: string; noResults: string; dateLocale: string }> = {
    en: { kicker: 'Rutherford Journal', title: 'Our Articles', subtitle: 'News, case studies, product releases, testimonials and practical insights from the print floor.', indexed: 'articles', search: 'Search articles', all: 'All', noResults: 'No articles match your search.', dateLocale: 'en-GB' },
    fr: { kicker: 'Journal Rutherford', title: 'Nos articles', subtitle: 'Actualités, études de cas, lancements produits, témoignages et retours terrain.', indexed: 'articles', search: 'Rechercher un article', all: 'Tous', noResults: 'Aucun article ne correspond à votre recherche.', dateLocale: 'fr-FR' },
    de: { kicker: 'Rutherford Journal', title: 'Unsere Artikel', subtitle: 'Neuigkeiten, Fallstudien, Produktneuheiten, Erfahrungsberichte und praktische Einblicke aus der Druckproduktion.', indexed: 'Artikel', search: 'Artikel suchen', all: 'Alle', noResults: 'Keine Artikel gefunden.', dateLocale: 'de-DE' },
    it: { kicker: 'Rutherford Journal', title: 'I nostri articoli', subtitle: 'News, case study, release di prodotto, testimonianze e insight pratici dal reparto stampa.', indexed: 'articoli', search: 'Cerca un articolo', all: 'Tutti', noResults: 'Nessun articolo corrisponde alla ricerca.', dateLocale: 'it-IT' },
    es: { kicker: 'Journal Rutherford', title: 'Nuestros artículos', subtitle: 'Noticias, casos de estudio, lanzamientos de producto, testimonios e ideas prácticas desde la planta de impresión.', indexed: 'artículos', search: 'Buscar un artículo', all: 'Todos', noResults: 'Ningún artículo coincide con tu búsqueda.', dateLocale: 'es-ES' },
  };
  const t = copy[locale];
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const a of articles) {
      if (a.category && !seen.has(a.category)) { seen.add(a.category); list.push(a.category); }
    }
    return list;
  }, [articles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (cat !== 'all' && a.category !== cat) return false;
      if (!q) return true;
      return `${a.title} ${a.excerpt ?? ''} ${a.category ?? ''}`.toLowerCase().includes(q);
    });
  }, [articles, query, cat]);

  const fmtDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString(t.dateLocale, { day: '2-digit', month: 'short', year: 'numeric' }) : '';

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
          <div className="blog-toolbar">
            <div className="blog-search-wrap">
              <svg className="blog-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                className="blog-search"
                type="search"
                placeholder={t.search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={t.search}
              />
            </div>
            <div className="blog-chips">
              <button type="button" className={`blog-chip ${cat === 'all' ? 'is-active' : ''}`} onClick={() => setCat('all')}>{t.all}</button>
              {categories.map((c) => (
                <button type="button" key={c} className={`blog-chip ${cat === c ? 'is-active' : ''}`} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
          </div>

          <p className="blog-results"><strong>{filtered.length}</strong> {t.indexed}</p>

          {filtered.length ? (
            <div className="blog-list">
              {filtered.map((article) => {
                const href = article.href ?? `/blog/${article.slug}`;
                return (
                  <article className="blog-row" key={article.slug}>
                    <a className="blog-row-media" href={href} aria-label={article.title} tabIndex={-1}>
                      {article.image ? <img src={article.image} alt={article.title} loading="lazy" /> : null}
                    </a>
                    <div className="blog-row-body">
                      <p className="blog-row-meta">
                        <span className="blog-row-cat">{article.category}</span>
                        {article.publishedAt ? <span className="blog-row-dot">·</span> : null}
                        {article.publishedAt ? <time dateTime={article.publishedAt}>{fmtDate(article.publishedAt)}</time> : null}
                      </p>
                      <h2 className="blog-row-title"><a href={href}>{article.title}</a></h2>
                      <p className="blog-row-excerpt">{article.excerpt}</p>
                    </div>
                    <a className="blog-row-arrow" href={href} aria-label={article.title}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13m0 0-5-5m5 5-5 5" /></svg>
                    </a>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="blog-empty">{t.noResults}</p>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
