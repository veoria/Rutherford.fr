'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useLanguage, type Locale } from '@/components/language-provider';

type Copy = {
  kicker: string;
  headline: string;
  body: string;
  ctaLabel: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    kicker: 'Made in France',
    headline: 'Our Team',
    body: 'Rutherford.fr and Veoria.fr are two sister companies based in France. Our team combines offset expertise, software engineering, and industrial printing technology to support printers, converters, and brands across Europe and beyond. Every project is handled directly from France, with people who know your press, your workflow, and your business.',
    ctaLabel: 'Talk to our team',
  },
  fr: {
    kicker: 'Fait en France',
    headline: 'Notre équipe',
    body: 'Rutherford.fr et Veoria.fr sont deux sociétés sœurs basées en France. Notre équipe réunit expertise offset, ingénierie logicielle et technologies d’impression industrielle pour accompagner imprimeurs, convertisseurs et marques en Europe et au-delà. Chaque projet est pris en charge directement depuis la France, par des personnes qui connaissent votre presse, votre workflow et votre métier.',
    ctaLabel: 'Parler à notre équipe',
  },
  de: {
    kicker: 'Made in France',
    headline: 'Unser Team',
    body: 'Rutherford.fr und Veoria.fr sind zwei Schwesterunternehmen aus Frankreich. Unser Team verbindet Offset-Expertise, Software-Engineering und industrielle Drucktechnologie, um Druckereien, Verarbeiter und Marken in Europa und darüber hinaus zu unterstützen. Jedes Projekt wird direkt aus Frankreich betreut, von Menschen, die Ihre Presse, Ihren Workflow und Ihr Geschäft kennen.',
    ctaLabel: 'Unser Team kontaktieren',
  },
  it: {
    kicker: 'Made in France',
    headline: 'Il nostro team',
    body: 'Rutherford.fr e Veoria.fr sono due società sorelle con sede in Francia. Il nostro team combina esperienza offset, ingegneria software e tecnologia di stampa industriale per supportare stampatori, converter e brand in Europa e nel mondo. Ogni progetto è gestito direttamente dalla Francia, da persone che conoscono la tua macchina, il tuo workflow e le esigenze del tuo business.',
    ctaLabel: 'Parla con il nostro team',
  },
  es: {
    kicker: 'Hecho en Francia',
    headline: 'Nuestro equipo',
    body: 'Rutherford.fr y Veoria.fr son dos empresas hermanas con sede en Francia. Nuestro equipo combina experiencia offset, ingeniería de software y tecnologías de impresión industrial para acompañar a impresores, convertidores y marcas en Europa y más allá. Cada proyecto se gestiona directamente desde Francia, por personas que conocen su prensa, su flujo de trabajo y su negocio.',
    ctaLabel: 'Hablar con nuestro equipo',
  },
};

const slides = [
  '/images/team-group-1.jpg',
  '/images/team-group-2.jpg',
  '/images/team-group-3.jpg',
  '/images/team-group-4.jpg',
];

export function TeamShowcase() {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="section team-section" id="team">
      <div className="team-background" aria-hidden="true">
        {slides.map((src, slideIndex) => (
          <div
            key={src}
            className={`team-background-slide ${slideIndex === index ? 'is-active' : ''}`}
          >
            <Image
              src={src}
              alt=""
              fill
              className="team-background-image"
              sizes="100vw"
              priority={slideIndex === 0}
            />
          </div>
        ))}
        <div className="team-background-overlay" />
      </div>

      <div className="container team-shell">
        <div className="team-content">
          <p className="section-kicker team-content-kicker">{t.kicker}</p>
          <h2 className="team-content-headline">{t.headline}</h2>
          <p className="team-content-body">{t.body}</p>
          <a className="button button-accent team-content-cta" href="mailto:contact@rutherford.fr">
            {t.ctaLabel}
          </a>
        </div>

      </div>
    </section>
  );
}
