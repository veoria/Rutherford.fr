'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { type Locale, useLanguage } from '@/components/language-provider';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const NAV_PREFIX_LOCALES = ['fr', 'de', 'it', 'es'];

type SiteNavProps = {
  current?: 'home' | 'roi' | 'blog' | 'console-validation' | 'support' | 'academy' | 'account';
};

const ACADEMY_ENABLED = process.env.NEXT_PUBLIC_ACADEMY_ENABLED === 'true';

// Initials for the account chip — prefer the profile name, fall back to email.
const initials = (name: string | null, email: string): string => {
  const base = (name ?? '').trim();
  if (base) {
    const parts = base.split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || base.slice(0, 2).toUpperCase();
  }
  return email.trim().slice(0, 2).toUpperCase();
};

export function SiteNav({ current = 'home' }: SiteNavProps) {
  const { locale } = useLanguage();
  // Prefix internal marketing links with the current locale so navigation stays in-language.
  const lhref = (path: string) =>
    locale === 'en' || !path.startsWith('/') ? path : `/${locale}${path === '/' ? '' : path}`;
  const [open, setOpen] = useState(false);
  const [authedEmail, setAuthedEmail] = useState<string | null>(null);
  const [authedName, setAuthedName] = useState<string | null>(null);
  const academyEnabled = ACADEMY_ENABLED;

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const supabase = createSupabaseBrowserClient();
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      setAuthedEmail(data.user?.email ?? null);
      if (data.user) {
        const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', data.user.id).maybeSingle();
        if (active) setAuthedName((prof?.full_name as string | null) ?? null);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthedEmail(session?.user?.email ?? null);
      if (!session) setAuthedName(null);
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
      roi: string;
      cases: string;
      blog: string;
      academy: string;
      support: string;
      console: string;
      contact: string;
      openNav: string;
      mainNav: string;
      signIn: string;
      account: string;
    }
  > = {
    en: {
      home: 'Home', colorloop: 'ColorLoop', roi: 'ROI', cases: 'Case Studies', blog: 'Blog',
      academy: 'Academy', support: 'Support', console: 'Console Validation', contact: 'Contact',
      openNav: 'Open navigation', mainNav: 'Main navigation', signIn: 'Sign in', account: 'My account',
    },
    fr: {
      home: 'Accueil', colorloop: 'ColorLoop', roi: 'ROI', cases: 'Cas clients', blog: 'Blog',
      academy: 'Academy', support: 'Support', console: 'Validation console', contact: 'Contact',
      openNav: 'Ouvrir la navigation', mainNav: 'Navigation principale', signIn: 'Se connecter', account: 'Mon compte',
    },
    de: {
      home: 'Start', colorloop: 'ColorLoop', roi: 'ROI', cases: 'Referenzen', blog: 'Blog',
      academy: 'Academy', support: 'Support', console: 'Konsolenvalidierung', contact: 'Kontakt',
      openNav: 'Navigation öffnen', mainNav: 'Hauptnavigation', signIn: 'Anmelden', account: 'Mein Konto',
    },
    it: {
      home: 'Home', colorloop: 'ColorLoop', roi: 'ROI', cases: 'Case Study', blog: 'Blog',
      academy: 'Academy', support: 'Supporto', console: 'Validazione console', contact: 'Contatti',
      openNav: 'Apri navigazione', mainNav: 'Navigazione principale', signIn: 'Accedi', account: 'Account',
    },
    es: {
      home: 'Inicio', colorloop: 'ColorLoop', roi: 'ROI', cases: 'Casos prácticos', blog: 'Blog',
      academy: 'Academy', support: 'Soporte', console: 'Validación de consola', contact: 'Contacto',
      openNav: 'Abrir navegación', mainNav: 'Navegación principal', signIn: 'Iniciar sesión', account: 'Mi cuenta',
    },
  };

  const labels = navLabels[locale];

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brandmark" href={lhref('/')} aria-label="Rutherford.fr">
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

        <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label={labels.mainNav}>
          {/* Prominent account link — burger only (hidden on desktop) */}
          <a
            className={`mobile-nav-link ${authedEmail ? 'mobile-nav-link-dark' : 'mobile-nav-link-accent'} ${current === 'account' ? 'is-current' : ''}`}
            href={authedEmail ? '/account' : '/account/sign-in'}
            onClick={() => setOpen(false)}
          >
            {authedEmail ? labels.account : labels.signIn}
          </a>
          <a className={current === 'home' ? 'is-current' : undefined} href={lhref('/')} onClick={() => setOpen(false)}>
            {labels.home}
          </a>
          <a href={lhref('/#colorloop')} onClick={() => setOpen(false)}>
            {labels.colorloop}
          </a>
          <a className={current === 'roi' ? 'is-current' : undefined} href={lhref('/roi')} onClick={() => setOpen(false)}>
            {labels.roi}
          </a>
          <a className={current === 'blog' ? 'is-current' : undefined} href={lhref('/blog')} onClick={() => setOpen(false)}>
            {labels.blog}
          </a>
          {academyEnabled ? (
            <a className={current === 'academy' ? 'is-current' : undefined} href={lhref('/academy')} onClick={() => setOpen(false)}>
              {labels.academy}
            </a>
          ) : null}
          <a className={current === 'support' ? 'is-current' : undefined} href={lhref('/support')} onClick={() => setOpen(false)}>
            {labels.support}
          </a>
          <a href="mailto:contact@rutherford.fr" onClick={() => setOpen(false)}>
            {labels.contact}
          </a>
          {/* Console — burger only (desktop shows the button in header-actions) */}
          <a className="mobile-nav-link mobile-nav-link-dark" href={lhref('/console-validation')} onClick={() => setOpen(false)}>
            {labels.console}
          </a>
        </nav>

        <div className="header-actions">
          <a
            className={`button button-dark header-button ${current === 'console-validation' ? 'is-current' : ''}`}
            href={lhref('/console-validation')}
          >
            {labels.console}
          </a>

          <span className="header-divider" aria-hidden="true" />

          {authedEmail ? (
            <a className={`header-account-chip ${current === 'account' ? 'is-current' : ''}`} href="/account" aria-label={labels.account}>
              <span className="header-account-avatar">
                {initials(authedName, authedEmail)}
                <span className="header-account-dot" aria-hidden="true" />
              </span>
              <span className="header-account-name">{labels.account}</span>
              <span className="header-account-caret" aria-hidden="true">⌄</span>
            </a>
          ) : (
            <a className="header-account-cta" href="/account/sign-in">
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
              </svg>
              {labels.signIn}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
