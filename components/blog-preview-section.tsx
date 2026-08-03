'use client';

import articles from '@/data/blog-articles.json';
import { useLanguage, type Locale } from '@/components/language-provider';
import COPY_DATA from '@/data/home/blog-preview-section.json';
import { homeLink } from '@/lib/home-links';

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
          <a className="button button-outline-dark" href={homeLink('blog-preview-section.seeAll')}>
            {t.seeAll}
          </a>
        </div>
      </div>
    </section>
  );
}
