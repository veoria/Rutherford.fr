'use client';

import Image from 'next/image';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useLanguage, type Locale } from '@/components/language-provider';
import COPY_DATA from '@/data/home/rutherford-identity-section.json';

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            const duration = 1600;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - t, 3);
              setDisplay(Math.round(value * eased));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div className="rutherford-stat" ref={nodeRef}>
      <dt>
        <span className="rutherford-stat-value">{display.toLocaleString('en-US')}</span>
        <span className="rutherford-stat-suffix">{suffix}</span>
      </dt>
      <dd>{label}</dd>
    </div>
  );
}

type Segment = { text: string; accent?: boolean };

type Copy = {
  kicker: string;
  title: string;
  body: Segment[];
  years: string;
  countries: string;
  systems: string;
};

const COPY = COPY_DATA as Record<Locale, Copy>;

const printers = [
  { src: '/images/printer-avery-dennison.png', alt: 'Avery Dennison' },
  { src: '/images/printer-ds-smith.avif', alt: 'DS Smith' },
  { src: '/images/printer-huhtamaki.png', alt: 'Huhtamaki' },
  { src: '/images/printer-mm-packaging.png', alt: 'MM Packaging' },
  { src: '/images/printer-printwell.png', alt: 'Printwell' },
  { src: '/images/printer-westrock.png', alt: 'WestRock' },
  { src: '/images/printer-yuto.png', alt: 'Yuto' },
  { src: '/images/printer-rig.svg', alt: 'Rig' },
];

export function RutherfordIdentitySection() {
  const { locale } = useLanguage();
  const [slideIndex, setSlideIndex] = useState(0);
  const t = COPY[locale];

  const slides = [
    '/images/Team rutherford Slideshow/1team.jpg',
    '/images/Team rutherford Slideshow/2team.jpg',
    '/images/Team rutherford Slideshow/3team.jpg',
    '/images/Team rutherford Slideshow/4team.jpg',
    '/images/Team rutherford Slideshow/5team.jpg',
    '/images/Team rutherford Slideshow/6team.jpg',
    '/images/Team rutherford Slideshow/7team.jpg',
  ];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % slides.length);
    }, 3600);
    return () => window.clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="section rutherford-identity-section" id="who-we-are">
      <div className="rutherford-identity-background" aria-hidden="true">
        {slides.map((src, i) => (
          <div
            key={src}
            className={`rutherford-bg-slide ${i === slideIndex ? 'is-active' : ''}`}
          >
            <Image
              src={src}
              alt=""
              fill
              className="rutherford-bg-slide-image"
              sizes="100vw"
              priority={i === 0}
            />
          </div>
        ))}
        <div className="rutherford-bg-overlay" />
      </div>

      <div className="container rutherford-identity-shell">
        <div className="rutherford-identity-copy">
          <p className="section-kicker">{t.kicker}</p>
          <h2 className="rutherford-identity-headline">{t.title}</h2>
          <p className="rutherford-identity-body">
            {t.body.map((segment, index) => (
              <Fragment key={index}>
                {segment.accent ? (
                  <span className="rutherford-identity-accent">{segment.text}</span>
                ) : (
                  segment.text
                )}
              </Fragment>
            ))}
          </p>
        </div>


        <dl className="rutherford-stats-grid">
          <Stat value={25} suffix="+" label={t.years} />
          <Stat value={30} suffix="+" label={t.countries} />
          <Stat value={1000} suffix="+" label={t.systems} />
        </dl>

        <div className="rutherford-printers-marquee" aria-label="Printers we work with">
          <div className="rutherford-printers-track">
            {[...printers, ...printers].map((printer, idx) => (
              <span className="rutherford-printers-item" key={`${printer.alt}-${idx}`}>
                <Image
                  src={printer.src}
                  alt={idx < printers.length ? printer.alt : ''}
                  width={240}
                  height={90}
                  sizes="160px"
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
