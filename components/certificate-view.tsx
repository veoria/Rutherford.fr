'use client';

import { type Locale, useLanguage } from '@/components/language-provider';

type Props = {
  slug: string;
  recipientName: string;
  company: string | null;
  courseTitle: string;
  distinction: string | null;
  durationLabel: string;
  modules: number;
  scorePct: number | null;
  issuedDate: string | null;
  reference: string;
};

type CertCopy = {
  kicker: string;
  heading: string;
  awardedTo: string;
  forCompleting: string;
  assessmentPassed: (pct: number) => string;
  modulesWord: string;
  issuedOn: (date: string) => string;
  referenceLabel: string;
  issuer: string;
  download: string;
  back: string;
  hint: string;
};

const COPY: Record<Locale, CertCopy> = {
  en: {
    kicker: 'Rutherford Academy',
    heading: 'Certificate of completion',
    awardedTo: 'This certifies that',
    forCompleting: 'has successfully completed',
    assessmentPassed: (pct) => `Final assessment passed — score ${pct}%`,
    modulesWord: 'modules',
    issuedOn: (d) => `Issued on ${d}`,
    referenceLabel: 'Certificate ID',
    issuer: 'Rutherford Academy · rutherford.fr — closed-loop color management',
    download: 'Download PDF',
    back: 'Back to your account',
    hint: 'Your certificate downloads as a one-page PDF, ready to share.',
  },
  fr: {
    kicker: 'Rutherford Academy',
    heading: 'Certificat de réussite',
    awardedTo: 'Ce certificat atteste que',
    forCompleting: 'a suivi avec succès',
    assessmentPassed: (pct) => `Évaluation finale réussie — score ${pct}%`,
    modulesWord: 'modules',
    issuedOn: (d) => `Délivré le ${d}`,
    referenceLabel: 'N° de certificat',
    issuer: 'Rutherford Academy · rutherford.fr — gestion de la couleur closed-loop',
    download: 'Télécharger le PDF',
    back: 'Retour à votre compte',
    hint: 'Votre certificat est téléchargé en PDF d’une page, prêt à partager.',
  },
  de: {
    kicker: 'Rutherford Academy',
    heading: 'Abschlusszertifikat',
    awardedTo: 'Hiermit wird bestätigt, dass',
    forCompleting: 'erfolgreich abgeschlossen hat',
    assessmentPassed: (pct) => `Abschlussprüfung bestanden — Ergebnis ${pct}%`,
    modulesWord: 'Module',
    issuedOn: (d) => `Ausgestellt am ${d}`,
    referenceLabel: 'Zertifikat-Nr.',
    issuer: 'Rutherford Academy · rutherford.fr — Closed-Loop-Farbmanagement',
    download: 'PDF herunterladen',
    back: 'Zurück zu Ihrem Konto',
    hint: 'Ihr Zertifikat wird als einseitiges PDF heruntergeladen, bereit zum Teilen.',
  },
  it: {
    kicker: 'Rutherford Academy',
    heading: 'Certificato di completamento',
    awardedTo: 'Si certifica che',
    forCompleting: 'ha completato con successo',
    assessmentPassed: (pct) => `Valutazione finale superata — punteggio ${pct}%`,
    modulesWord: 'moduli',
    issuedOn: (d) => `Rilasciato il ${d}`,
    referenceLabel: 'N. certificato',
    issuer: 'Rutherford Academy · rutherford.fr — gestione del colore closed-loop',
    download: 'Scarica il PDF',
    back: 'Torna al suo account',
    hint: 'Il suo certificato viene scaricato come PDF di una pagina, pronto da condividere.',
  },
  es: {
    kicker: 'Rutherford Academy',
    heading: 'Certificado de finalización',
    awardedTo: 'Por la presente se certifica que',
    forCompleting: 'ha completado con éxito',
    assessmentPassed: (pct) => `Evaluación final aprobada — puntuación ${pct}%`,
    modulesWord: 'módulos',
    issuedOn: (d) => `Emitido el ${d}`,
    referenceLabel: 'N.º de certificado',
    issuer: 'Rutherford Academy · rutherford.fr — gestión del color closed-loop',
    download: 'Descargar PDF',
    back: 'Volver a su cuenta',
    hint: 'Su certificado se descarga como PDF de una página, listo para compartir.',
  },
};

function formatDate(value: string | null, locale: Locale) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

export function CertificateView({
  slug,
  recipientName,
  company,
  courseTitle,
  distinction,
  durationLabel,
  modules,
  scorePct,
  issuedDate,
  reference,
}: Props) {
  const { locale } = useLanguage();
  const t = COPY[locale];

  return (
    <main className="certificate-page">
      <div className="certificate-actions no-print">
        <a className="button button-accent" href={`/account/certificate/${slug}/pdf?lang=${locale}`}>
          {t.download}
        </a>
        <a className="button button-light" href="/account">
          {t.back}
        </a>
        <p className="certificate-hint">{t.hint}</p>
      </div>

      <article className="certificate-sheet">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="certificate-logo" src="/images/rutherford-logo-black.png" alt="Rutherford" />
        <p className="certificate-kicker">{t.kicker}</p>
        <h1 className="certificate-heading">{t.heading}</h1>

        <p className="certificate-line">{t.awardedTo}</p>
        <p className="certificate-name">{recipientName}</p>
        {company ? <p className="certificate-company">{company}</p> : null}

        <p className="certificate-line">{t.forCompleting}</p>
        <p className="certificate-course">{courseTitle}</p>
        {distinction ? <p className="certificate-distinction">{distinction}</p> : null}
        {scorePct != null ? <p className="certificate-score">{t.assessmentPassed(scorePct)}</p> : null}
        <p className="certificate-meta">
          {durationLabel} · {modules} {t.modulesWord}
        </p>

        <div className="certificate-footer">
          <div className="certificate-footer-block">
            {issuedDate ? <p className="certificate-date">{t.issuedOn(formatDate(issuedDate, locale))}</p> : null}
            <p className="certificate-ref">
              {t.referenceLabel}: <strong>{reference}</strong>
            </p>
          </div>
          <div className="certificate-seal-block" aria-hidden="true">
            <span className="certificate-seal">
              <svg className="gicon" viewBox="0 0 24 24">
                <path d="M12 2a6 6 0 0 1 4.2 10.3l1 5.7-3.2-1.6L12 18l-2 -1.6L6.8 18l1-5.7A6 6 0 0 1 12 2Zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
              </svg>
            </span>
            <span className="certificate-seal-label">Rutherford Academy</span>
          </div>
        </div>

        <p className="certificate-issuer">{t.issuer}</p>
      </article>
    </main>
  );
}
