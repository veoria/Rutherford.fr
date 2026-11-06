'use client';

import articles from '@/data/blog-articles.json';
import { useLanguage, type Locale } from '@/components/language-provider';
import COPY_DATA from '@/data/home/blog-preview-section.json';
import { homeLink, localizeHref } from '@/lib/home-links';
import { categoryLabel } from '@/lib/blog-categories';

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  i18n?: Record<string, { title?: string; excerpt?: string }>;
};

const RAW = articles as Article[];

type Copy = {
  kicker: string;
  headline: string;
  intro: string;
  readMore: string;
  seeAll: string;
};

const COPY = COPY_DATA as Record<Locale, Copy>;

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
          {latest.map((a) => {
            const article = { ...a, title: a.i18n?.[locale]?.title ?? a.title, excerpt: a.i18n?.[locale]?.excerpt ?? a.excerpt };
            const href = localizeHref(`/blog/${a.slug}`, locale);
            return (
            <article className="blog-preview-card" key={article.slug}>
              <a
                className="blog-preview-media"
                href={href}
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
                <p className="blog-preview-category">{categoryLabel(article.category, locale)}</p>
                <h3>
                  <a href={href}>{article.title}</a>
                </h3>
                <p className="blog-preview-excerpt">{article.excerpt}</p>
                <a className="blog-preview-cta" href={href}>
                  {t.readMore} <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
            );
          })}
        </div>

        <div className="blog-preview-footer">
          <a className="button button-outline-dark" href={homeLink('blog-preview-section.seeAll', locale)}>
            {t.seeAll}
          </a>
        </div>
      </div>
    </section>
  );
}
