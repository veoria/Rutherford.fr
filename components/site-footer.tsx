'use client';

import Image from 'next/image';
import { useLanguage, type Locale } from '@/components/language-provider';
import { SocialLinks } from '@/components/social-links';
import type { SocialLink } from '@/components/social-links';

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

type ResourceKey = 'blog' | 'support' | 'console' | 'contact';
type CompanyKey = 'about' | 'colorloop' | 'cases';

type Copy = {
  tagline: string;
  platforms: string;
  resources: string;
  company: string;
  follow: string;
  rights: string;
  resourceLabels: Record<ResourceKey, string>;
  companyLabels: Record<CompanyKey, string>;
};

const COPY: Record<Locale, Copy> = {
  en: {
    tagline: 'Offset printing expertise, software, and technology — helping printers modernize production control.',
    platforms: 'Platforms',
    resources: 'Resources',
    company: 'Company',
    follow: 'Follow',
    rights: 'All rights reserved',
    resourceLabels: { blog: 'Blog', support: 'Support', console: 'Console Validation', contact: 'Contact' },
    companyLabels: { about: 'About Rutherford', colorloop: 'ColorLoop', cases: 'Case Studies' },
  },
  fr: {
    tagline: 'Expertise offset, logiciel et technologie — pour moderniser le contrôle de production.',
    platforms: 'Plateformes',
    resources: 'Ressources',
    company: 'Entreprise',
    follow: 'Suivre',
    rights: 'Tous droits réservés',
    resourceLabels: { blog: 'Blog', support: 'Support', console: 'Validation console', contact: 'Contact' },
    companyLabels: { about: 'À propos', colorloop: 'ColorLoop', cases: 'Cas clients' },
  },
  de: {
    tagline: 'Offset-Expertise, Software und Technologie — zur Modernisierung der Produktionssteuerung.',
    platforms: 'Plattformen',
    resources: 'Ressourcen',
    company: 'Unternehmen',
    follow: 'Folgen',
    rights: 'Alle Rechte vorbehalten',
    resourceLabels: { blog: 'Blog', support: 'Support', console: 'Konsolenvalidierung', contact: 'Kontakt' },
    companyLabels: { about: 'Über Rutherford', colorloop: 'ColorLoop', cases: 'Referenzen' },
  },
  it: {
    tagline: 'Competenza offset, software e tecnologia — per modernizzare il controllo della produzione.',
    platforms: 'Piattaforme',
    resources: 'Risorse',
    company: 'Azienda',
    follow: 'Seguici',
    rights: 'Tutti i diritti riservati',
    resourceLabels: { blog: 'Blog', support: 'Supporto', console: 'Validazione console', contact: 'Contatti' },
    companyLabels: { about: 'Chi è Rutherford', colorloop: 'ColorLoop', cases: 'Case Study' },
  },
  es: {
    tagline: 'Experiencia offset, software y tecnología — para modernizar el control de producción.',
    platforms: 'Plataformas',
    resources: 'Recursos',
    company: 'Empresa',
    follow: 'Seguir',
    rights: 'Todos los derechos reservados',
    resourceLabels: { blog: 'Blog', support: 'Soporte', console: 'Validación de consola', contact: 'Contacto' },
    companyLabels: { about: 'Sobre Rutherford', colorloop: 'ColorLoop', cases: 'Casos prácticos' },
  },
};

export function SiteFooter() {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const year = new Date().getFullYear();

  const resourceLinks: { key: ResourceKey; href: string }[] = [
    { key: 'blog', href: '/blog' },
    { key: 'support', href: 'https://form.typeform.com/to/LZtPUH' },
    { key: 'console', href: 'https://form.typeform.com/to/elOTOK?typeform-source=rgproducts.typeform.com#english=xxxxx' },
    { key: 'contact', href: 'mailto:contact@rutherford.fr' },
  ];

  const companyLinks: { key: CompanyKey; href: string }[] = [
    { key: 'about', href: '/#about' },
    { key: 'colorloop', href: '/#colorloop' },
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

          <div className="footer-bottom">
            <p className="footer-bottom-text">
              © {year} Rutherford.fr — {t.rights}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
