'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { type Locale, useLanguage } from '@/components/language-provider';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type SiteNavProps = {
  current?: 'home' | 'blog' | 'console-validation' | 'support' | 'academy' | 'account';
};

const ACADEMY_ENABLED = process.env.NEXT_PUBLIC_ACADEMY_ENABLED === 'true';

export function SiteNav({ current = 'home' }: SiteNavProps) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const localeRef = useRef<HTMLDivElement | null>(null);
  const [authedEmail, setAuthedEmail] = useState<string | null>(null);
  const academyEnabled = ACADEMY_ENABLED;

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const supabase = createSupabaseBrowserClient();
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setAuthedEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthedEmail(session?.user?.email ?? null);
    });
    return () => {
      active = false;
      sub?.subscription.unsubscribe();
    };
  }, []);

  const navLabels: Record<
    Locale,
    {
      home: string;
      colorloop: string;
      cases: string;
      blog: string;
      academy: string;
      support: string;
      console: string;
      contact: string;
      openNav: string;
      mainNav: string;
      localeLabel: string;
      announcementBadge: string;
      announcementText: string;
      announcementCta: string;
    }
  > = {
    en: {
      home: 'Home',
      colorloop: 'ColorLoop',
      cases: 'Case Studies',
      blog: 'Blog',
      academy: 'Academy',
      support: 'Support',
      console: 'Console Validation',
      contact: 'Contact',
      openNav: 'Open navigation',
      mainNav: 'Main navigation',
      localeLabel: 'Language selector',
      announcementBadge: 'New',
      announcementText: 'Discover ColorLoop — Rutherford’s new software for offset production',
      announcementCta: 'Discover',
    },
    fr: {
      home: 'Accueil',
      colorloop: 'ColorLoop',
      cases: 'Cas clients',
      blog: 'Blog',
      academy: 'Academy',
      support: 'Support',
      console: 'Validation console',
      contact: 'Contact',
      openNav: 'Ouvrir la navigation',
      mainNav: 'Navigation principale',
      localeLabel: 'Sélecteur de langue',
      announcementBadge: 'Nouveau',
      announcementText: 'Découvrez ColorLoop — le nouveau logiciel Rutherford pour l’offset',
      announcementCta: 'Découvrir',
    },
    de: {
      home: 'Start',
      colorloop: 'ColorLoop',
      cases: 'Referenzen',
      blog: 'Blog',
      academy: 'Academy',
      support: 'Support',
      console: 'Konsolenvalidierung',
      contact: 'Kontakt',
      openNav: 'Navigation öffnen',
      mainNav: 'Hauptnavigation',
      localeLabel: 'Sprachauswahl',
      announcementBadge: 'Neu',
      announcementText: 'Entdecken Sie ColorLoop — Rutherfords neue Software für Offsetdruck',
      announcementCta: 'Entdecken',
    },
    it: {
      home: 'Home',
      colorloop: 'ColorLoop',
      cases: 'Case Study',
      blog: 'Blog',
      academy: 'Academy',
      support: 'Supporto',
      console: 'Validazione console',
      contact: 'Contatti',
      openNav: 'Apri navigazione',
      mainNav: 'Navigazione principale',
      localeLabel: 'Selettore lingua',
      announcementBadge: 'Novità',
      announcementText: 'Scopri ColorLoop, il nuovo software Rutherford per la produzione offset',
      announcementCta: 'Scopri di più',
    },
    es: {
      home: 'Inicio',
      colorloop: 'ColorLoop',
      cases: 'Casos prácticos',
      blog: 'Blog',
      academy: 'Academy',
      support: 'Soporte',
      console: 'Validación de consola',
      contact: 'Contacto',
      openNav: 'Abrir navegación',
      mainNav: 'Navegación principal',
      localeLabel: 'Selector de idioma',
      announcementBadge: 'Nuevo',
      announcementText: 'Descubra ColorLoop — el nuevo software Rutherford para offset',
      announcementCta: 'Descubrir',
    },
  };

  const languageOptions: { code: Locale; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'de', label: 'DE' },
    { code: 'it', label: 'IT' },
    { code: 'es', label: 'ES' },
  ];

  const labels = navLabels[locale];

  useEffect(() => {
    const close = () => {
      setOpen(false);
      setLocaleOpen(false);
    };
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!localeRef.current?.contains(event.target as Node)) {
        setLocaleOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  return (
    <>
      <header className="site-header">
      <div className="container header-inner">
        <a className="brandmark" href="/" aria-label="Rutherford.fr">
          <Image src="/images/rutherford-logo-black.png" alt="Rutherford.fr" width={300} height={58} sizes="184px" priority />
        </a>

        <button
          type="button"
          className={`menu-toggle ${open ? 'is-open' : ''}`}
          aria-label={labels.openNav}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`main-nav ${open ? 'is-open' : ''}`}
          aria-label={labels.mainNav}
        >
          <a className={current === 'home' ? 'is-current' : undefined} href="/" onClick={() => setOpen(false)}>
            {labels.home}
          </a>
          <a href="/#colorloop" onClick={() => setOpen(false)}>
            {labels.colorloop}
          </a>
          <a className={current === 'blog' ? 'is-current' : undefined} href="/blog" onClick={() => setOpen(false)}>
            {labels.blog}
          </a>
          {academyEnabled ? (
            <a className={current === 'academy' ? 'is-current' : undefined} href="/academy" onClick={() => setOpen(false)}>
              {labels.academy}
            </a>
          ) : null}
          {academyEnabled ? (
            <a
              className={`mobile-nav-link ${current === 'account' ? 'is-current' : ''}`}
              href={authedEmail ? '/account' : '/account/sign-in'}
              onClick={() => setOpen(false)}
            >
              {authedEmail ? 'Account' : 'Sign in'}
            </a>
          ) : null}
          <a href="mailto:contact@rutherford.fr" onClick={() => setOpen(false)}>
            {labels.contact}
          </a>
          <a
            className="mobile-nav-link mobile-nav-link-accent"
            href="https://form.typeform.com/to/LZtPUH" target="_blank" rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            {labels.support}
          </a>
          <a
            className="mobile-nav-link mobile-nav-link-dark"
            href="https://form.typeform.com/to/elOTOK?typeform-source=rgproducts.typeform.com#english=xxxxx" target="_blank" rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            {labels.console}
          </a>
        </nav>

        <div className="header-actions">
          <div className="locale-dropdown" ref={localeRef}>
            <button
              type="button"
              className={`locale-dropdown-trigger ${localeOpen ? 'is-open' : ''}`}
              aria-haspopup="menu"
              aria-expanded={localeOpen}
              onClick={() => setLocaleOpen((value) => !value)}
            >
              <span>{locale.toUpperCase()}</span>
              <span className="locale-dropdown-caret" aria-hidden="true">⌄</span>
            </button>

            {localeOpen ? (
              <div className="locale-dropdown-menu" role="menu" aria-label={labels.localeLabel}>
                {languageOptions.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    className={option.code === locale ? 'is-active' : undefined}
                    role="menuitemradio"
                    aria-checked={option.code === locale}
                    onClick={() => {
                      setLocale(option.code);
                      setLocaleOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {academyEnabled ? (
            <a
              className={`header-account-icon ${current === 'account' ? 'is-current' : ''}`}
              href={authedEmail ? '/account' : '/account/sign-in'}
              aria-label={authedEmail ? 'Your account' : 'Sign in'}
              title={authedEmail ? 'Your account' : 'Sign in'}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
              </svg>
              {authedEmail ? <span className="header-account-dot" aria-hidden="true" /> : null}
            </a>
          ) : null}
          <a
            className={`button button-accent header-button ${current === 'support' ? 'is-current' : ''}`}
            href="https://form.typeform.com/to/LZtPUH" target="_blank" rel="noreferrer"
          >
            {labels.support}
          </a>
          <a
            className={`button button-dark header-button ${current === 'console-validation' ? 'is-current' : ''}`}
            href="https://form.typeform.com/to/elOTOK?typeform-source=rgproducts.typeform.com#english=xxxxx" target="_blank" rel="noreferrer"
          >
            {labels.console}
          </a>
        </div>
      </div>

    </header>
    </>
  );
}
