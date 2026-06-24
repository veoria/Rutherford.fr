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
    en: { sources: 'Sources', back: 'Back to all articles', original: 'Original page', ctaTitle: 'Is your press ready for closed-loop color?', ctaCheck: 'Check your eligibility', ctaRoi: 'Calculate your ROI', relatedTitle: 'Go further with the matching training' },
    fr: { sources: 'Sources', back: 'Retour aux articles', original: "Page d'origine", ctaTitle: 'Votre presse est-elle prête pour le closed-loop ?', ctaCheck: 'Vérifier votre éligibilité', ctaRoi: 'Calculer votre ROI', relatedTitle: 'Aller plus loin avec la formation associée' },
    de: { sources: 'Quellen', back: 'Zurück zu allen Artikeln', original: 'Originalseite', ctaTitle: 'Ist Ihre Druckmaschine bereit für Closed-Loop?', ctaCheck: 'Eignung prüfen', ctaRoi: 'ROI berechnen', relatedTitle: 'Mit der passenden Schulung weitermachen' },
    it: { sources: 'Fonti', back: 'Torna a tutti gli articoli', original: 'Pagina originale', ctaTitle: 'La tua macchina è pronta per il closed-loop?', ctaCheck: "Verifica l'idoneità", ctaRoi: 'Calcola il ROI', relatedTitle: 'Approfondisci con la formazione correlata' },
    es: { sources: 'Fuentes', back: 'Volver a todos los artículos', original: 'Página original', ctaTitle: '¿Tu prensa está lista para closed-loop?', ctaCheck: 'Comprobar elegibilidad', ctaRoi: 'Calcular tu ROI', relatedTitle: 'Profundiza con la formación relacionada' },
  }[locale];

  // Localized content (falls back to the English base when a field is missing).
  const tr = article.i18n?.[locale];
  const title = tr?.title ?? article.title;
  const lead = tr?.lead ?? article.lead;
  const body = tr?.body ?? article.body;
  const lhref = (p: string) => (locale === 'en' ? p : `/${locale}${p}`);

  // Related Rutherford Academy training per article (hands-on training, not a certification, no Idealliance link).
  const academyEnabled = process.env.NEXT_PUBLIC_ACADEMY_ENABLED === 'true';
  const RELATED_COURSE: Record<string, { id: string; title: string }> = {
    'closed-loop-color-control-offset-guide': { id: 'closed-loop-flagship', title: 'The Complete Closed-Loop Color Masterclass' },
    'reduce-makeready-waste-offset-press': { id: 'where-color-hurts', title: 'Where Color Hurts: From Makeready to Saleable Sheet' },
    'iso-12647-2-explained-press-operators': { id: 'fundamentals', title: 'Offset Color Management Fundamentals' },
    'delta-e-tolerance-print-guide': { id: 'measurement-essentials', title: 'Press-Side Measurement Essentials' },
    'cip3-cip4-ink-presetting-makeready': { id: 'colorloop-ai', title: 'ColorLoop AI: Predictive Setup for Modern Offset' },
    'g7-vs-iso-12647-offset-color': { id: 'fundamentals', title: 'Offset Color Management Fundamentals' },
    'm0-m1-m2-m3-measurement-conditions-print': { id: 'measurement-essentials', title: 'Press-Side Measurement Essentials' },
    'ppwr-dpp-readiness-checklist-packaging-printers': { id: 'measurecolor-reports', title: 'MeasureColor Reports' },
  };
  const related = academyEnabled ? RELATED_COURSE[article.slug] : undefined;

  return (
    <main className="page-shell">
      <SiteNav current="blog" />

      <section className="article-hero section">
        <div className="container article-hero-inner">
          <p className="section-kicker">{article.category}</p>
          <h1>{title}</h1>
          <p>{lead}</p>
        </div>
      </section>

      <section className="section article-section">
        <div className="container">
          <div className="article-reading">
            {article.image ? (
              <figure className="article-figure">
                <img src={article.image} alt={title} />
              </figure>
            ) : null}

            <article className="article-content">
              {body?.length
                ? body.map((block, index) => {
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

              {related ? (
                <aside className="article-related">
                  <p className="article-related-kicker">{labels.relatedTitle}</p>
                  <a className="article-related-link" href={lhref(`/academy/${related.id}`)}>
                    {related.title} <span aria-hidden="true">&rarr;</span>
                  </a>
                </aside>
              ) : null}

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
                <a className="button button-accent" href={lhref('/console-validation')}>{labels.ctaCheck}</a>
                <a className="button button-light" href={lhref('/roi')}>{labels.ctaRoi}</a>
              </div>
            </div>

            <div className="article-actions">
              <a className="article-textlink" href={lhref('/blog')}>
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
