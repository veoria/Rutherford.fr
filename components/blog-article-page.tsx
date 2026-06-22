'use client';

import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { useLanguage } from '@/components/language-provider';
import type { BlogArticle } from '@/lib/blog';

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
        <div className="container article-layout">
          <figure className="article-media">
            {article.image ? <img src={article.image} alt={article.title} /> : null}
          </figure>

          <article className="article-content">
            {article.paragraphs.map((paragraph, index) => (
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
        </div>

        <div className="container">
          <div style={{ background: '#f5f5f7', border: '1px solid #e7e7e0', borderRadius: '18px', padding: '30px 24px', textAlign: 'center', margin: '8px 0 4px' }}>
            <h2 style={{ margin: '0 0 18px', fontSize: '22px', lineHeight: '28px', letterSpacing: '-0.3px', color: '#16130f' }}>{labels.ctaTitle}</h2>
            <a className="button button-accent" href="/console-validation" style={{ margin: '0 6px 8px' }}>{labels.ctaCheck}</a>
            <a className="button button-light" href="/roi" style={{ margin: '0 6px 8px' }}>{labels.ctaRoi}</a>
          </div>
        </div>

        <div className="container article-actions">
          <a className="button button-light" href="/blog">
            {labels.back}
          </a>
          <a className="button button-accent" href={article.originalUrl} target="_blank" rel="noreferrer">
            {labels.original}
          </a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
