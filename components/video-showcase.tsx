'use client';

import Image from 'next/image';
import { useLanguage } from '@/components/language-provider';
import { useEffect, useState } from 'react';

const videos = [
  { id: 'r7_4EdplcdE', title: "Wauters B'Pack x Rutherford ENG" },
  { id: 'FTjkGK2K-wI', title: 'Testimonial - GS Monaco' },
  { id: '0bUlKQ-lIZs', title: 'LEFRANCQ Packaging' },
  { id: 'vYN1mjCK9VU', title: 'Testimonial - Moderna Printing' },
  { id: 'XjgKPUguTfw', title: 'ColorLoop Session 05' },
  { id: 'Zu79QlZnCPo', title: 'ColorLoop Session 06' },
  { id: '78a006Kulok', title: 'ColorLoop Session 07' },
  { id: 'ut247z4ren8', title: 'ColorLoop Session 08' },
  { id: 'bj-KzGZgKfU', title: 'ColorLoop Session 09' },
  { id: 'L5psrWuGNBg', title: 'ColorLoop Session 10' },
];

const brandLogos = [
  { src: '/images/brand-chanel.png', alt: 'Chanel' },
  { src: '/images/brand-apple.png', alt: 'Apple' },
  { src: '/images/brand-loreal.png', alt: "L'Oréal Paris" },
  { src: '/images/brand-louis-vuitton.png', alt: 'Louis Vuitton' },
  { src: '/images/brand-unilever.png', alt: 'Unilever' },
  { src: '/images/brand-pg.png', alt: 'Procter & Gamble' },
];

function thumbnail(videoId: string) {
  return `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`;
}

function fallbackThumbnail(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function VideoThumbnail({
  videoId,
  title,
  className,
}: {
  videoId: string;
  title: string;
  className?: string;
}) {
  const [src, setSrc] = useState(thumbnail(videoId));

  useEffect(() => {
    setSrc(thumbnail(videoId));
  }, [videoId]);

  return (
    <img
      className={className}
      src={src}
      alt={title}
      loading="lazy"
      onError={() => {
        if (src !== fallbackThumbnail(videoId)) {
          setSrc(fallbackThumbnail(videoId));
        }
      }}
    />
  );
}

export function VideoShowcase() {
  const { locale } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [playerEnabled, setPlayerEnabled] = useState(false);
  const activeVideo = videos[activeIndex];

  useEffect(() => {
    setPlayerEnabled(false);
  }, [activeIndex]);

  return (
    <section className="section videos-section" id="videos">
      <div className="container videos-shell">
        <div className="section-copy centered-copy videos-copy">
          <h2>{locale === 'fr' ? 'Case Studies' : 'Case Studies'}</h2>
        </div>

        <div className="videos-player-stage">
          <div className="videos-player">
            {playerEnabled ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0&modestbranding=1`}
                title={activeVideo.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                className="videos-player-preview"
                onClick={() => setPlayerEnabled(true)}
                aria-label={`${locale === 'fr' ? 'Lire la vidéo' : 'Play video'}: ${activeVideo.title}`}
              >
                <VideoThumbnail
                  videoId={activeVideo.id}
                  title={activeVideo.title}
                />
                <span className="videos-player-play" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className="videos-strip-shell">
          <div className="videos-strip-stage">
            <button
              type="button"
              className="videos-arrow videos-arrow-side videos-arrow-left"
              onClick={() => setActiveIndex((value) => (value - 1 + videos.length) % videos.length)}
              aria-label={locale === 'fr' ? 'Vidéos précédentes' : 'Previous videos'}
            >
              <span aria-hidden="true">‹</span>
            </button>

            <div className="videos-strip" aria-label={locale === 'fr' ? 'Liste des vidéos' : 'Video list'}>
              {videos.map((video, index) => (
                <button
                  type="button"
                  key={`thumb-${video.id}`}
                  className={`videos-thumb ${index === activeIndex ? 'is-active' : ''}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`${locale === 'fr' ? 'Aller à la vidéo' : 'Go to video'} ${index + 1}`}
                >
                  <span className="videos-thumb-media">
                    <VideoThumbnail
                      videoId={video.id}
                      title={video.title}
                      className="videos-thumb-image"
                    />
                    <span className="videos-thumb-play" aria-hidden="true" />
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="videos-arrow videos-arrow-side videos-arrow-right"
              onClick={() => setActiveIndex((value) => (value + 1) % videos.length)}
              aria-label={locale === 'fr' ? 'Vidéos suivantes' : 'Next videos'}
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>

          <div
            className="videos-dots"
            aria-label={locale === 'fr' ? 'Position du slideshow' : 'Slideshow position'}
          >
            {videos.map((video, index) => (
              <button
                type="button"
                key={video.id}
                className={`videos-dot ${index === activeIndex ? 'is-active' : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`${locale === 'fr' ? 'Aller à la vidéo' : 'Go to video'} ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="videos-brands-block">
          <div className="compatible-press-header">
            <p className="section-kicker">Brands</p>
            <h2>Brands</h2>
            <p>From luxury packaging to FMCG production, brand color consistency remains non-negotiable.</p>
          </div>

          <div className="compatible-press-marquee" aria-label="Brands requiring consistent color quality">
            <div className="compatible-press-track compatible-press-track-reverse">
              {[...brandLogos, ...brandLogos].map((brand, index) => (
                <span className="compatible-press-item compatible-press-item-brand" key={`${brand.alt}-${index}`}>
                  <Image
                    src={brand.src}
                    alt={index < brandLogos.length ? brand.alt : ''}
                    width={240}
                    height={90}
                    sizes="150px"
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
