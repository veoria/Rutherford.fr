'use client';

import { useLanguage, type Locale } from '@/components/language-provider';

type CardCopy = { title: string; body: string; ctaLabel?: string; href?: string };

type Copy = {
  kicker: string;
  headline: string;
  intro: string;
  rutherford: CardCopy;
  colorloop: CardCopy;
  veoria: CardCopy;
};

const COPY: Record<Locale, Copy> = {
  en: {
    kicker: 'How we work',
    headline: 'The expertise, software, and technology behind Rutherford',
    intro:
      'Rutherford combines offset print expertise, software, and technology to help modernize production control.',
    rutherford: {
      title: 'Rutherford.fr',
      body: 'Rutherford brings years of offset print expertise in color management, press-side workflow, and production consistency.',
      ctaLabel: 'Discover Rutherford',
      href: '/#who-we-are',
    },
    colorloop: {
      title: 'ColorLoop.ai',
      body: 'ColorLoop is Rutherford’s software platform for modern offset production control, built from real pressroom experience.',
      ctaLabel: 'Visit colorloop.ai',
      href: 'https://colorloop.ai/',
    },
    veoria: {
      title: 'Veoria.fr',
      body: 'VEORIA, Rutherford’s sister company, is a printing technology company focused on industrial printing systems and inline color control for label printing. Its engineering team developed the technology behind ColorLoop together with Rutherford’s offset printing expertise.',
      ctaLabel: 'Visit veoria.fr',
      href: 'https://veoria.fr/',
    },
  },
  fr: {
    kicker: 'Comment nous travaillons',
    headline: 'L’expertise, le logiciel et la technologie derrière Rutherford',
    intro:
      'Rutherford réunit expertise de l’impression offset, logiciel et technologie pour moderniser le contrôle de production.',
    rutherford: {
      title: 'Rutherford.fr',
      body: 'Rutherford apporte des années d’expertise offset en gestion de la couleur, workflow presse et constance de production.',
      ctaLabel: 'Découvrir Rutherford',
      href: '/#who-we-are',
    },
    colorloop: {
      title: 'ColorLoop.ai',
      body: 'ColorLoop est la plateforme logicielle de Rutherford pour le contrôle moderne de la production offset, conçue à partir d’une expérience terrain.',
      ctaLabel: 'Visiter colorloop.ai',
      href: 'https://colorloop.ai/',
    },
    veoria: {
      title: 'Veoria.fr',
      body: 'VEORIA, société sœur de Rutherford, est une entreprise de technologies d’impression spécialisée dans les systèmes industriels et le contrôle couleur inline pour l’étiquette. Ses équipes d’ingénierie ont développé la technologie de ColorLoop avec l’expertise offset de Rutherford.',
      ctaLabel: 'Visiter veoria.fr',
      href: 'https://veoria.fr/',
    },
  },
  de: {
    kicker: 'So arbeiten wir',
    headline: 'Die Expertise, Software und Technologie hinter Rutherford',
    intro:
      'Rutherford verbindet Offset-Druckexpertise, Software und Technologie, um die Produktionssteuerung zu modernisieren.',
    rutherford: {
      title: 'Rutherford.fr',
      body: 'Rutherford bringt jahrelange Offset-Druckexpertise in Farbmanagement, pressenseitigem Workflow und Produktionskonstanz.',
      ctaLabel: 'Rutherford entdecken',
      href: '/#who-we-are',
    },
    colorloop: {
      title: 'ColorLoop.ai',
      body: 'ColorLoop ist Rutherfords Softwareplattform für moderne Offset-Produktionssteuerung, entwickelt aus realer Druckraumerfahrung.',
      ctaLabel: 'colorloop.ai besuchen',
      href: 'https://colorloop.ai/',
    },
    veoria: {
      title: 'Veoria.fr',
      body: 'VEORIA, Rutherfords Schwesterunternehmen, ist ein Drucktechnologieunternehmen mit Fokus auf industrielle Drucksysteme und Inline-Farbkontrolle für den Etikettendruck. Das Engineering-Team hat die Technologie hinter ColorLoop gemeinsam mit Rutherfords Offset-Expertise entwickelt.',
      ctaLabel: 'veoria.fr besuchen',
      href: 'https://veoria.fr/',
    },
  },
  it: {
    kicker: 'Come lavoriamo',
    headline: 'Il know-how, il software e la tecnologia dietro Rutherford',
    intro:
      'Rutherford unisce competenza nella stampa offset, sviluppo software e tecnologia industriale per aiutare le aziende a modernizzare il controllo della produzione.',
    rutherford: {
      title: 'Rutherford.fr',
      body: 'Rutherford porta in sala stampa anni di esperienza in stampa offset, gestione del colore, workflow a bordo macchina e coerenza produttiva.',
      ctaLabel: 'Scopri Rutherford',
      href: '/#who-we-are',
    },
    colorloop: {
      title: 'ColorLoop.ai',
      body: 'ColorLoop è la piattaforma software Rutherford per il controllo moderno della produzione offset, sviluppata a partire dall’esperienza concreta maturata in sala stampa.',
      ctaLabel: 'Visita colorloop.ai',
      href: 'https://colorloop.ai/',
    },
    veoria: {
      title: 'Veoria.fr',
      body: 'VEORIA, società sorella di Rutherford, è un’azienda tecnologica dedicata alla stampa industriale e al controllo colore in linea per la produzione di etichette. Il suo team di ingegneri ha sviluppato la tecnologia alla base di ColorLoop insieme agli esperti Rutherford della stampa offset.',
      ctaLabel: 'Visita veoria.fr',
      href: 'https://veoria.fr/',
    },
  },
  es: {
    kicker: 'Cómo trabajamos',
    headline: 'La experiencia, el software y la tecnología detrás de Rutherford',
    intro:
      'Rutherford combina experiencia en impresión offset, software y tecnología para modernizar el control de producción.',
    rutherford: {
      title: 'Rutherford.fr',
      body: 'Rutherford aporta años de experiencia en impresión offset en gestión del color, flujo de trabajo junto a la prensa y consistencia de producción.',
      ctaLabel: 'Descubrir Rutherford',
      href: '/#who-we-are',
    },
    colorloop: {
      title: 'ColorLoop.ai',
      body: 'ColorLoop es la plataforma de software de Rutherford para el control moderno de la producción offset, construida desde la experiencia real en sala de prensa.',
      ctaLabel: 'Visitar colorloop.ai',
      href: 'https://colorloop.ai/',
    },
    veoria: {
      title: 'Veoria.fr',
      body: 'VEORIA, empresa hermana de Rutherford, es una compañía de tecnología de impresión centrada en sistemas industriales y control de color inline para la etiqueta. Su equipo de ingeniería desarrolló la tecnología de ColorLoop junto con la experiencia offset de Rutherford.',
      ctaLabel: 'Visitar veoria.fr',
      href: 'https://veoria.fr/',
    },
  },
  pt: {
    kicker: 'Como trabalhamos',
    headline: 'A expertise, o software e a tecnologia por trás da Rutherford',
    intro:
      'A Rutherford reúne experiência em impressão offset, software e tecnologia para ajudar a modernizar o controlo de produção.',
    rutherford: {
      title: 'Rutherford.fr',
      body: 'A Rutherford traz anos de expertise em offset, na gestão de cor, no workflow de impressão e na consistência de produção.',
      ctaLabel: 'Descobrir a Rutherford',
      href: '/#who-we-are',
    },
    colorloop: {
      title: 'ColorLoop.ai',
      body: 'ColorLoop é a plataforma de software da Rutherford para o controlo moderno da produção offset, concebida a partir da experiência no terreno.',
      ctaLabel: 'Visitar colorloop.ai',
      href: 'https://colorloop.ai/',
    },
    veoria: {
      title: 'Veoria.fr',
      body: 'A VEORIA, empresa irmã da Rutherford, é uma empresa de tecnologias de impressão especializada em sistemas industriais e no controlo de cor inline para etiquetas. As suas equipas de engenharia desenvolveram a tecnologia do ColorLoop em conjunto com a expertise em offset da Rutherford.',
      ctaLabel: 'Visitar veoria.fr',
      href: 'https://veoria.fr/',
    },
  },
};

const CARD_IMAGES: Record<'rutherford' | 'colorloop' | 'veoria', string> = {
  rutherford: '/images/Bundle Rutherford-4.jpg',
  colorloop: '/images/support-hugues-console.jpg',
  veoria: '/images/8Veoria label photos prod .jpg',
};

export function BrandExplainerSection() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  const cards: Array<{ key: 'rutherford' | 'colorloop' | 'veoria'; content: CardCopy }> = [
    { key: 'rutherford', content: t.rutherford },
    { key: 'colorloop', content: t.colorloop },
    { key: 'veoria', content: t.veoria },
  ];

  return (
    <section className="section brand-explainer-section" id="about">
      <div className="container brand-explainer-shell">
        <header className="brand-explainer-header">
          <p className="section-kicker">{t.kicker}</p>
          <h2 className="brand-explainer-headline">{t.headline}</h2>
          <p className="brand-explainer-intro">{t.intro}</p>
        </header>

        <div className="brand-explainer-grid">
          {cards.map(({ key, content }, index) => (
            <article key={key} className={`brand-explainer-card brand-explainer-card-${key}`}>
              <div className="brand-explainer-card-media">
                <img
                  src={CARD_IMAGES[key]}
                  alt=""
                  loading="lazy"
                  className="brand-explainer-card-image"
                />
              </div>
              <div className="brand-explainer-card-body">
                <p className="brand-explainer-card-label">0{index + 1}</p>
                <h3>
                  {content.href ? (
                    (() => {
                      const external = content.href.startsWith('http');
                      return (
                        <a
                          href={content.href}
                          {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        >
                          {content.title}
                        </a>
                      );
                    })()
                  ) : (
                    content.title
                  )}
                </h3>
                <p>{content.body}</p>
                {content.href && content.ctaLabel ? (
                  (() => {
                    const external = content.href.startsWith('http');
                    return (
                      <a
                        className="brand-explainer-card-cta"
                        href={content.href}
                        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      >
                        {content.ctaLabel} <span aria-hidden="true">→</span>
                      </a>
                    );
                  })()
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
