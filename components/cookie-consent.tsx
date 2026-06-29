'use client';

import { useEffect, useState } from 'react';
import { type Locale, useLanguage } from '@/components/language-provider';

// Consent for analytics cookies. Stored in localStorage; GoogleAnalytics reads
// it and only loads gtag once granted. Accepting/refusing fires 'rf-consent' so
// GA can start immediately without a reload.
export const CONSENT_KEY = 'rf-consent';

const COPY: Record<Locale, { text: string; learn: string; accept: string; refuse: string }> = {
  en: {
    text: 'We use analytics cookies to understand how the site is used and improve it.',
    learn: 'Learn more',
    accept: 'Accept',
    refuse: 'Refuse',
  },
  fr: {
    text: 'Nous utilisons des cookies de mesure d’audience pour comprendre l’usage du site et l’améliorer.',
    learn: 'En savoir plus',
    accept: 'Accepter',
    refuse: 'Refuser',
  },
  de: {
    text: 'Wir verwenden Analyse-Cookies, um die Nutzung der Website zu verstehen und sie zu verbessern.',
    learn: 'Mehr erfahren',
    accept: 'Akzeptieren',
    refuse: 'Ablehnen',
  },
  it: {
    text: 'Usiamo cookie di analisi per capire come viene usato il sito e migliorarlo.',
    learn: 'Scopri di più',
    accept: 'Accetta',
    refuse: 'Rifiuta',
  },
  es: {
    text: 'Usamos cookies de análisis para entender cómo se usa el sitio y mejorarlo.',
    learn: 'Más información',
    accept: 'Aceptar',
    refuse: 'Rechazar',
  },
  pt: {
    text: 'Utilizamos cookies de análise para perceber como o site é utilizado e melhorá-lo.',
    learn: 'Saber mais',
    accept: 'Aceitar',
    refuse: 'Recusar',
  },
};

export function CookieConsent() {
  const { locale } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) setShow(true);
    } catch {
      /* storage blocked — don't show */
    }
  }, []);

  const choose = (value: 'granted' | 'denied') => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event('rf-consent'));
    setShow(false);
  };

  if (!show) return null;
  const t = COPY[locale];
  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookies">
      <p className="cookie-banner-text">
        {t.text}{' '}
        <a href="/confidentialite">{t.learn}</a>
      </p>
      <div className="cookie-banner-actions">
        <button type="button" className="cookie-btn cookie-btn-ghost" onClick={() => choose('denied')}>
          {t.refuse}
        </button>
        <button type="button" className="cookie-btn cookie-btn-accent" onClick={() => choose('granted')}>
          {t.accept}
        </button>
      </div>
    </div>
  );
}
