'use client';

import { type Locale, useLanguage } from '@/components/language-provider';

type Section = 'account' | 'academy' | 'console' | 'team' | 'support';

const LABELS: Record<Locale, Record<Section, string>> = {
  en: { account: 'My account', academy: 'Academy', console: 'Console Validation', team: 'My team', support: 'Support' },
  fr: { account: 'Mon compte', academy: 'Academy', console: 'Validation console', team: 'Mon équipe', support: 'Support' },
  de: { account: 'Mein Konto', academy: 'Academy', console: 'Konsolenvalidierung', team: 'Mein Team', support: 'Support' },
  it: { account: 'Il mio account', academy: 'Academy', console: 'Validazione console', team: 'Il mio team', support: 'Supporto' },
  es: { account: 'Mi cuenta', academy: 'Academy', console: 'Validación de consola', team: 'Mi equipo', support: 'Soporte' },
};

const SECTIONS: { key: Section; href: string }[] = [
  { key: 'academy', href: '/account/academy' },
  { key: 'console', href: '/account/console-validations' },
  { key: 'team', href: '/account/team' },
  { key: 'support', href: '/account/support' },
];

// Light, consistent sub-navigation across the My Account section: a "back to My
// account" link + the section tabs, with the current one highlighted.
export function AccountSubnav({ current }: { current: Section }) {
  const { locale } = useLanguage();
  const L = LABELS[locale];
  return (
    <nav className="acct-subnav" aria-label={L.account}>
      <div className="container acct-subnav-inner">
        <a className="acct-subnav-home" href="/account">
          <span aria-hidden="true">←</span> {L.account}
        </a>
        <span className="acct-subnav-sep" />
        <div className="acct-subnav-links">
          {SECTIONS.map((s) => (
            <a
              key={s.key}
              href={s.href}
              className={`acct-subnav-link${current === s.key ? ' is-active' : ''}`}
              aria-current={current === s.key ? 'page' : undefined}
            >
              {L[s.key]}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
