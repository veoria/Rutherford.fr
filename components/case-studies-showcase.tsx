'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage, type Locale } from '@/components/language-provider';
import COPY_DATA from '@/data/home/case-studies-showcase.json';

type CaseKey =
  | 'wauters'
  | 'viappiani'
  | 'autajon'
  | 'lefrancq'
  | 'gsmonaco'
  | 'moderna'
  | 'colorconsulting'
  | 'printwell'
  | 'avery';

type CaseStudy = {
  key: CaseKey;
  company: string;
  videoId: string;
  videoTitle: string;
};

const caseStudies: CaseStudy[] = [
  { key: 'wauters', company: "Wauters B'Pack", videoId: 'yAZbtKzN_j0', videoTitle: "Wauters B'Pack, Advancing color precision" },
  { key: 'viappiani', company: 'Viappiani Printing', videoId: 'r7_4EdplcdE', videoTitle: 'Viappiani Printing, Precision, speed & less waste' },
  { key: 'autajon', company: 'Autajon Packaging Milan', videoId: 'FTjkGK2K-wI', videoTitle: 'Autajon Packaging Milan, Color consistency & efficiency' },
  { key: 'lefrancq', company: 'LEFRANCQ Packaging', videoId: '78a006Kulok', videoTitle: 'LEFRANCQ Packaging, We can’t run the press without it' },
  { key: 'gsmonaco', company: 'GS Monaco & Forbes Monaco', videoId: 'XjgKPUguTfw', videoTitle: 'GS Monaco & Forbes Monaco' },
  { key: 'moderna', company: 'Moderna Printing', videoId: 'vYN1mjCK9VU', videoTitle: 'Moderna Printing, Reduced waste, smarter startups' },
  { key: 'colorconsulting', company: 'ColorConsulting Italy', videoId: 'w4sA1QzEvOs', videoTitle: 'ColorConsulting Italy' },
  { key: 'printwell', company: 'Printwell USA', videoId: 'ut247z4ren8', videoTitle: 'Printwell USA' },
  { key: 'avery', company: 'Avery Dennison Queretaro', videoId: '0bUlKQ-lIZs', videoTitle: 'Avery Dennison Queretaro' },
];

function thumbnail(videoId: string) {
  return `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`;
}

function fallbackThumbnail(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

type CaseCopy = { challenge: string; result: string };

type Copy = {
  kicker: string;
  headline: string;
  intro: string;
  challengeLabel: string;
  resultLabel: string;
  cta: string;
  prev: string;
  next: string;
  cases: Record<CaseKey, CaseCopy>;
};

const COPY = COPY_DATA as Record<Locale, Copy>;

function CaseMedia({
  study,
  isPlaying,
  onPlay,
  ctaLabel,
}: {
  study: CaseStudy;
  isPlaying: boolean;
  onPlay: () => void;
  ctaLabel: string;
}) {
  const [src, setSrc] = useState(thumbnail(study.videoId));

  useEffect(() => {
    setSrc(thumbnail(study.videoId));
  }, [study.videoId]);

  if (isPlaying) {
    return (
      <div className="case-study-media case-study-media-playing">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${study.videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={study.videoTitle}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="case-study-media"
      onClick={onPlay}
      aria-label={`${ctaLabel}, ${study.company}`}
    >
      <img
        src={src}
        alt={study.videoTitle}
        loading="lazy"
        className="case-study-thumb"
        onError={() => {
          if (src !== fallbackThumbnail(study.videoId)) {
            setSrc(fallbackThumbnail(study.videoId));
          }
        }}
      />
      <span className="case-study-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}

export function CaseStudiesShowcase() {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const slide = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.querySelector<HTMLElement>('.case-study-card');
    const step = firstCard ? firstCard.offsetWidth + 22 : track.clientWidth * 0.6;
    track.scrollBy({ left: step * direction, behavior: 'smooth' });
  }, []);

  return (
    <section className="section case-studies-section" id="cases">
      <div className="container case-studies-shell">
        <header className="case-studies-header">
          <p className="section-kicker">{t.kicker}</p>
          <h2 className="case-studies-headline">{t.headline}</h2>
          <p className="case-studies-intro">{t.intro}</p>
        </header>

        <div className="case-studies-slider">
          <button
            type="button"
            className="case-studies-arrow case-studies-arrow-left"
            onClick={() => slide(-1)}
            aria-label={t.prev}
          >
            <span aria-hidden="true">‹</span>
          </button>

          <div className="case-studies-track" ref={trackRef}>
            {caseStudies.map((study) => {
              const copy = t.cases[study.key];
              const isPlaying = activeVideoId === study.videoId;
              return (
                <article className="case-study-card" key={study.videoId}>
                  <CaseMedia
                    study={study}
                    isPlaying={isPlaying}
                    onPlay={() => setActiveVideoId(study.videoId)}
                    ctaLabel={t.cta}
                  />
                  <div className="case-study-body">
                    <h3>{study.company}</h3>
                    <dl className="case-study-detail">
                      <div>
                        <dt>{t.challengeLabel}</dt>
                        <dd>{copy.challenge}</dd>
                      </div>
                      <div>
                        <dt>{t.resultLabel}</dt>
                        <dd>{copy.result}</dd>
                      </div>
                    </dl>
                    {!isPlaying ? (
                      <button
                        type="button"
                        className="case-study-cta"
                        onClick={() => setActiveVideoId(study.videoId)}
                      >
                        {t.cta} <span aria-hidden="true">→</span>
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          <button
            type="button"
            className="case-studies-arrow case-studies-arrow-right"
            onClick={() => slide(1)}
            aria-label={t.next}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
    </section>
  );
}
