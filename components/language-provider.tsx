'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Locale = 'en' | 'fr' | 'de' | 'it' | 'es';

const SUPPORTED_LOCALES: Locale[] = ['en', 'fr', 'de', 'it', 'es'];

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
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
  }, []);

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
