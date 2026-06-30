'use client';

import articles from '@/data/blog-articles.json';
import { useLanguage, type Locale } from '@/components/language-provider';

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
};

const RAW = articles as Article[];

type Copy = {
  kicker: string;
  headline: string;
  intro: string;
  readMore: string;
  seeAll: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    kicker: 'From the blog',
    headline: 'Latest insights',
    intro: 'Rutherford notes on offset production, color management, and industry shifts.',
    readMore: 'Read article',
    seeAll: 'See all articles',
  },
  fr: {
    kicker: 'Sur le blog',
    headline: 'Derniers articles',
    intro: 'Les notes Rutherford sur la production offset, la gestion couleur et les évolutions du secteur.',
    readMore: 'Lire l’article',
    seeAll: 'Voir tous les articles',
  },
  de: {
    kicker: 'Aus dem Blog',
    headline: 'Aktuelle Beiträge',
    intro: 'Rutherford-Notizen zu Offsetproduktion, Farbmanagement und Branchenentwicklungen.',
    readMore: 'Artikel lesen',
    seeAll: 'Alle Artikel ansehen',
  },
  it: {
    kicker: 'Dal blog',
    headline: 'Ultimi approfondimenti',
    intro: 'Note Rutherford su produzione offset, gestione del colore e cambiamenti del settore.',
    readMore: 'Leggi l’articolo',
    seeAll: 'Vedi tutti gli articoli',
  },
  es: {
    kicker: 'Del blog',
    headline: 'Últimos artículos',
    intro: 'Notas de Rutherford sobre producción offset, gestión del color y cambios del sector.',
    readMore: 'Leer el artículo',
    seeAll: 'Ver todos los artículos',
  },
  pt: {
    kicker: 'No blog',
    headline: 'Artigos recentes',
    intro: 'Notas da Rutherford sobre produção offset, gestão de cor e evoluções do setor.',
    readMore: 'Ler o artigo',
    seeAll: 'Ver todos os artigos',
  },
};

export function BlogPreviewSection() {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const latest = RAW.slice(0, 3);

  return (
    <section className="section blog-preview-section" id="blog-preview">
      <div className="container blog-preview-shell">
        <header className="blog-preview-header">
          <p className="section-kicker">{t.kicker}</p>
          <h2 className="blog-preview-headline">{t.headline}</h2>
          <p className="blog-preview-intro">{t.intro}</p>
        </header>

        <div className="blog-preview-grid">
          {latest.map((article) => (
            <article className="blog-preview-card" key={article.slug}>
              <a
                className="blog-preview-media"
                href={`/blog/${article.slug}`}
                aria-label={article.title}
              >
                <img
                  src={article.image}
                  alt=""
                  className="blog-preview-image"
                  loading="lazy"
                />
              </a>
              <div className="blog-preview-body">
                <p className="blog-preview-category">{article.category}</p>
                <h3>
                  <a href={`/blog/${article.slug}`}>{article.title}</a>
                </h3>
                <p className="blog-preview-excerpt">{article.excerpt}</p>
                <a className="blog-preview-cta" href={`/blog/${article.slug}`}>
                  {t.readMore} <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="blog-preview-footer">
          <a className="button button-outline-dark" href="/blog">
            {t.seeAll}
          </a>
        </div>
      </div>
    </section>
  );
}
