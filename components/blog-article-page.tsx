'use client';

import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { useLanguage } from '@/components/language-provider';
import type { BlogArticle } from '@/lib/blog';
import { Fragment, type ReactNode } from 'react';

/** Render inline [label](href) markdown links inside body text, so articles can carry references and links. */
function renderInline(text: string): ReactNode {
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const href = m[2];
    const external = /^https?:\/\//.test(href);
    out.push(
      <a key={`lnk-${i++}`} href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.map((node, idx) => <Fragment key={idx}>{node}</Fragment>);
}

export function BlogArticlePage({ article }: { article: BlogArticle }) {
  const { locale } = useLanguage();
  const labels = {
    en: { sources: 'Sources', back: 'Back to all articles', original: 'Original page', ctaTitle: 'Is your press ready for closed-loop color?', ctaCheck: 'Check your eligibility', ctaRoi: 'Calculate your ROI' },
    fr: { sources: 'Sources', back: 'Retour aux articles', original: "Page d'origine", ctaTitle: 'Votre presse est-elle prête pour le closed-loop ?', ctaCheck: 'Vérifier votre éligibilité', ctaRoi: 'Calculer votre ROI' },
    de: { sources: 'Quellen', back: 'Zurück zu allen Artikeln', original: 'Originalseite', ctaTitle: 'Ist Ihre Druckmaschine bereit für Closed-Loop?', ctaCheck: 'Eignung prüfen', ctaRoi: 'ROI berechnen' },
    it: { sources: 'Fonti', back: 'Torna a tutti gli articoli', original: 'Pagina originale', ctaTitle: 'La tua macchina è pronta per il closed-loop?', ctaCheck: "Verifica l'idoneità", ctaRoi: 'Calcola il ROI' },
    es: { sources: 'Fuentes', back: 'Volver a todos los artículos', original: 'Página original', ctaTitle: '¿Tu prensa está lista para closed-loop?', ctaCheck: 'Comprobar elegibilidad', ctaRoi: 'Calcular tu ROI' },
  }[locale];

  return (
    <main className="page-shell">
      <SiteNav current="blog" />

      <section className="article-hero section">
        <div className="container article-hero-inner">
          <p className="section-kicker">{article.category}</p>
          <h1>{article.title}</h1>
          <p>{article.lead}</p>
        </div>
      </section>

      <section className="section article-section">
        <div className="container">
          <div className="article-reading">
            {article.image ? (
              <figure className="article-figure">
                <img src={article.image} alt={article.title} />
              </figure>
            ) : null}

            <article className="article-content">
              {article.body?.length
                ? article.body.map((block, index) => {
                    const key = `${article.slug}-b-${index}`;
                    if (block.type === 'h2') return <h2 key={key} className="article-h2">{renderInline(block.text)}</h2>;
                    if (block.type === 'h3') return <h3 key={key} className="article-h3">{renderInline(block.text)}</h3>;
                    if (block.type === 'figure')
                      return (
                        <figure key={key} className="article-inline-figure">
                          <img src={block.src} alt={block.alt ?? ''} />
                          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
                        </figure>
                      );
                    if (block.type === 'ul')
                      return (
                        <ul key={key} className="article-ul">
                          {block.items.map((item, i) => (
                            <li key={`${key}-${i}`}>{renderInline(item)}</li>
                          ))}
                        </ul>
                      );
                    return <p key={key}>{renderInline(block.text)}</p>;
                  })
                : article.paragraphs.map((paragraph, index) => (
                    <p key={`${article.slug}-${index}`}>{paragraph}</p>
                  ))}

              {article.sources?.length ? (
                <div className="article-sources">
                  <h2>{labels.sources}</h2>
                  <ul>
                    {article.sources.map((source) => (
                      <li key={source.href}>
                        <a href={source.href} target="_blank" rel="noreferrer">
                          {source.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>

            <div className="article-cta">
              <h2>{labels.ctaTitle}</h2>
              <div className="article-cta-actions">
                <a className="button button-accent" href="/console-validation">{labels.ctaCheck}</a>
                <a className="button button-light" href="/roi">{labels.ctaRoi}</a>
              </div>
            </div>

            <div className="article-actions">
              <a className="article-textlink" href="/blog">
                <span aria-hidden="true">&larr;</span> {labels.back}
              </a>
              <a className="article-textlink" href={article.originalUrl} target="_blank" rel="noreferrer">
                {labels.original} <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
