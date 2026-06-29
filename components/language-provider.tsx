'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Locale = 'en' | 'fr' | 'de' | 'it' | 'es' | 'pt';

const SUPPORTED_LOCALES: Locale[] = ['en', 'fr', 'de', 'it', 'es', 'pt'];

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLocale = 'en',
}: {
  children: React.ReactNode;
  /** Locale resolved server-side from the URL (en at root, fr/de/it/es on prefixed paths). */
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = initialLocale;
    // When the URL already pins a locale (prefixed path), it is authoritative
    // (also keeps state in sync on client-side navigation between locales).
    if (initialLocale !== 'en') {
      setLocaleState(initialLocale);
      window.localStorage.setItem('rutherford-locale', initialLocale);
      return;
    }
    // At the root (en), honor a previously stored / browser preference client-side.
    const stored = window.localStorage.getItem('rutherford-locale') as Locale | null;
    const browserLocale = window.navigator.language.slice(0, 2) as Locale;
    const nextLocale = SUPPORTED_LOCALES.includes(stored as Locale)
      ? (stored as Locale)
      : SUPPORTED_LOCALES.includes(browserLocale)
        ? browserLocale
        : 'en';

    setLocaleState(nextLocale);
    document.documentElement.lang = nextLocale;
    window.localStorage.setItem('rutherford-locale', nextLocale);
  }, [initialLocale]);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    document.documentElement.lang = nextLocale;
    window.localStorage.setItem('rutherford-locale', nextLocale);
  };

  const contextValue = useMemo(() => ({ locale, setLocale }), [locale]);

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
}
