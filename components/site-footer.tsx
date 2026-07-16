'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage, type Locale } from '@/components/language-provider';
import { SocialLinks } from '@/components/social-links';
import type { SocialLink } from '@/components/social-links';

// The language selector lives in the footer now (country is auto-detected, so
// the header no longer needs it). FR first to match the design.
const NAV_PREFIX_LOCALES = ['fr', 'de', 'it', 'es', 'pt'];
const FOOTER_LANGS: { code: Locale; label: string }[] = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'it', label: 'IT' },
  { code: 'es', label: 'ES' },
  { code: 'pt', label: 'PT' },
];

const socialLinks: SocialLink[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/rutherford-graphic-products-llc' },
  { label: 'Instagram', href: 'https://www.instagram.com/rutherfordgraphic/' },
  { label: 'YouTube', href: 'https://www.youtube.com/channel/UChiClIodg9rbuTDnInE4GmQ' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@rutherfordgraphic' },
];

const platformLinks = [
  { label: 'ColorLoop.ai', href: 'https://colorloop.ai/' },
  { label: 'Veoria.fr', href: 'https://veoria.fr/' },
  { label: 'PPWRConnect.com', href: 'https://ppwrconnect.com/' },
];

type ResourceKey = 'blog' | 'glossary' | 'support' | 'console' | 'contact';
type CompanyKey = 'about' | 'colorloop' | 'offset360' | 'cases';

type Copy = {
  tagline: string;
  platforms: string;
  resources: string;
  company: string;
  follow: string;
  rights: string;
  langAuto: string;
  resourceLabels: Record<ResourceKey, string>;
  companyLabels: Record<CompanyKey, string>;
};

const COPY: Record<Locale, Copy> = {
  en: {
    tagline: 'Offset printing expertise, software, and technology, helping printers modernize production control.',
    platforms: 'Platforms',
    resources: 'Resources',
    company: 'Company',
    follow: 'Follow',
    rights: 'All rights reserved',
    langAuto: 'Language · auto-detected',
    resourceLabels: { blog: 'Blog', glossary: 'Glossary', support: 'Support', console: 'Console Validation', contact: 'Contact' },
    companyLabels: { about: 'About Rutherford', colorloop: 'ColorLoop', offset360: 'Offset360', cases: 'Case Studies' },
  },
  fr: {
    tagline: 'Expertise offset, logiciel et technologie, pour moderniser le contrôle de production.',
    platforms: 'Plateformes',
    resources: 'Ressources',
    company: 'Entreprise',
    follow: 'Suivre',
    rights: 'Tous droits réservés',
    langAuto: 'Langue · détectée automatiquement',
    resourceLabels: { blog: 'Blog', glossary: 'Glossaire', support: 'Support', console: 'Validation console', contact: 'Contact' },
    companyLabels: { about: 'À propos', colorloop: 'ColorLoop', offset360: 'Offset360', cases: 'Cas clients' },
  },
  de: {
    tagline: 'Offset-Expertise, Software und Technologie, zur Modernisierung der Produktionssteuerung.',
    platforms: 'Plattformen',
    resources: 'Ressourcen',
    company: 'Unternehmen',
    follow: 'Folgen',
    rights: 'Alle Rechte vorbehalten',
    langAuto: 'Sprache · automatisch erkannt',
    resourceLabels: { blog: 'Blog', glossary: 'Glossar', support: 'Support', console: 'Konsolenvalidierung', contact: 'Kontakt' },
    companyLabels: { about: 'Über Rutherford', colorloop: 'ColorLoop', offset360: 'Offset360', cases: 'Referenzen' },
  },
  it: {
    tagline: 'Competenza offset, software e tecnologia, per modernizzare il controllo della produzione.',
    platforms: 'Piattaforme',
    resources: 'Risorse',
    company: 'Azienda',
    follow: 'Seguici',
    rights: 'Tutti i diritti riservati',
    langAuto: 'Lingua · rilevata automaticamente',
    resourceLabels: { blog: 'Blog', glossary: 'Glossario', support: 'Supporto', console: 'Validazione console', contact: 'Contatti' },
    companyLabels: { about: 'Chi è Rutherford', colorloop: 'ColorLoop', offset360: 'Offset360', cases: 'Case Study' },
  },
  es: {
    tagline: 'Experiencia offset, software y tecnología, para modernizar el control de producción.',
    platforms: 'Plataformas',
    resources: 'Recursos',
    company: 'Empresa',
    follow: 'Seguir',
    rights: 'Todos los derechos reservados',
    langAuto: 'Idioma · detección automática',
    resourceLabels: { blog: 'Blog', glossary: 'Glosario', support: 'Soporte', console: 'Validación de consola', contact: 'Contacto' },
    companyLabels: { about: 'Sobre Rutherford', colorloop: 'ColorLoop', offset360: 'Offset360', cases: 'Casos prácticos' },
  },
  pt: {
    tagline: 'Experiência em offset, software e tecnologia, para modernizar o controlo da produção.',
    platforms: 'Plataformas',
    resources: 'Recursos',
    company: 'Empresa',
    follow: 'Seguir',
    rights: 'Todos os direitos reservados',
    langAuto: 'Idioma · detetado automaticamente',
    resourceLabels: { blog: 'Blog', glossary: 'Glossário', support: 'Apoio', console: 'Validação de consola', contact: 'Contacto' },
    companyLabels: { about: 'Sobre a Rutherford', colorloop: 'ColorLoop', offset360: 'Offset360', cases: 'Casos de sucesso' },
  },
};

export function SiteFooter() {
  const { locale, setLocale } = useLanguage();
  const router = useRouter();
  const pathname = usePathname() || '/';
  const t = COPY[locale];
  const year = new Date().getFullYear();

  const navSeg = pathname.split('/')[1];
  const basePath = NAV_PREFIX_LOCALES.includes(navSeg) ? pathname.slice(navSeg.length + 1) || '/' : pathname;
  const switchLocale = (code: Locale) => {
    const target = code === 'en' ? basePath || '/' : `/${code}${basePath === '/' ? '' : basePath}`;
    setLocale(code);
    router.push(target);
  };

  const resourceLinks: { key: ResourceKey; href: string }[] = [
    { key: 'blog', href: '/blog' },
    { key: 'glossary', href: '/glossary' },
    { key: 'support', href: '/support' },
    { key: 'console', href: '/console-validation' },
    { key: 'contact', href: 'mailto:contact@rutherford.fr' },
  ];

  const companyLinks: { key: CompanyKey; href: string }[] = [
    { key: 'about', href: '/#about' },
    { key: 'colorloop', href: '/colorloop' },
    { key: 'offset360', href: '/offset360' },
    { key: 'cases', href: '/#cases' },
  ];

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-shell">
          <div className="footer-grid">
            <div className="footer-brand">
              <a className="footer-brand-wordmark" href="/" aria-label="Rutherford.fr">
                <Image
                  src="/images/rutherford-logo-white.png"
                  alt="Rutherford.fr"
                  width={900}
                  height={300}
                  sizes="(max-width: 768px) 200px, 240px"
                  priority={false}
                />
              </a>
              <div className="footer-brand-social">
                <p className="footer-column-label">{t.follow}</p>
                <SocialLinks links={socialLinks} className="footer-socials" />
              </div>
            </div>

            <nav className="footer-columns" aria-label="Footer">
              <section className="footer-column">
                <h3 className="footer-column-label">{t.company}</h3>
                <ul>
                  {companyLinks.map((link) => (
                    <li key={link.key}>
                      <a href={link.href}>{t.companyLabels[link.key]}</a>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="footer-column">
                <h3 className="footer-column-label">{t.resources}</h3>
                <ul>
                  {resourceLinks.map((link) => {
                    const external = link.href.startsWith('http');
                    return (
                      <li key={link.key}>
                        <a
                          href={link.href}
                          {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        >
                          {t.resourceLabels[link.key]}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="footer-column">
                <h3 className="footer-column-label">{t.platforms}</h3>
                <ul>
                  {platformLinks.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} target="_blank" rel="noreferrer">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </nav>
          </div>

          <div className="footer-lang">
            <span className="footer-lang-label">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3a14 14 0 0 1 3.6 9 14 14 0 0 1-3.6 9 14 14 0 0 1-3.6-9 14 14 0 0 1 3.6-9z" />
              </svg>
              {t.langAuto}
            </span>
            <div className="footer-lang-pills">
              {FOOTER_LANGS.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  className={`footer-lang-pill ${option.code === locale ? 'is-active' : ''}`}
                  aria-pressed={option.code === locale}
                  onClick={() => switchLocale(option.code)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-bottom-text">
              © {year} Rutherford.fr. {t.rights}
            </p>
            <p className="footer-legal-links">
              <a href="/confidentialite">Confidentialité</a>
              <a href="/mentions-legales">Mentions légales</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
