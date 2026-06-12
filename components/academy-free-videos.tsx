'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Item = { videoId: string; title: string };

const VIDEOS: Item[] = [
  { videoId: 'bldZIIdvXLE', title: 'Rutherford Academy, Free video 1' },
  { videoId: 'bj-KzGZgKfU', title: 'Rutherford Academy, Free video 2' },
  { videoId: 'h9r5lFubArU', title: 'Rutherford Academy, Free video 3' },
  { videoId: 'jtb1OhiArq8', title: 'Rutherford Academy, Free video 4' },
];

function thumbUrl(id: string) {
  return `https://i.ytimg.com/vi_webp/${id}/maxresdefault.webp`;
}

function fallbackThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function VideoCard({ item, isPlaying, onPlay }: { item: Item; isPlaying: boolean; onPlay: () => void }) {
  const [src, setSrc] = useState(thumbUrl(item.videoId));
  useEffect(() => setSrc(thumbUrl(item.videoId)), [item.videoId]);

  if (isPlaying) {
    return (
      <div className="academy-video-card academy-video-card-playing">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${item.videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={item.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button type="button" className="academy-video-card" onClick={onPlay} aria-label={`Play: ${item.title}`}>
      <img
        src={src}
        alt={item.title}
        loading="lazy"
        className="academy-video-thumb"
        onError={() => {
          if (src !== fallbackThumb(item.videoId)) setSrc(fallbackThumb(item.videoId));
        }}
      />
      <span className="academy-video-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}

export function AcademyFreeVideos() {
  const [active, setActive] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const slide = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.querySelector<HTMLElement>('.academy-video-card');
    const step = firstCard ? firstCard.offsetWidth + 18 : track.clientWidth * 0.6;
    track.scrollBy({ left: step * direction, behavior: 'smooth' });
  }, []);

  return (
    <section className="academy-free-videos section">
      <div className="container">
        <header className="academy-section-head">
          <p className="section-kicker">Free videos</p>
          <h2>Watch short videos from the Rutherford team</h2>
          <p>
            Four free Rutherford masterclass episodes on color management, closed-loop production, and pressroom
            standardization. No signup required.
          </p>
        </header>

        <div className="academy-videos-slider">
          <button
            type="button"
            className="academy-videos-arrow academy-videos-arrow-left"
            onClick={() => slide(-1)}
            aria-label="Previous video"
          >
            <span aria-hidden="true">‹</span>
          </button>

          <div className="academy-videos-track" ref={trackRef}>
            {VIDEOS.map((item) => (
              <VideoCard
                key={item.videoId}
                item={item}
                isPlaying={active === item.videoId}
                onPlay={() => setActive(item.videoId)}
              />
            ))}
          </div>

          <button
            type="button"
            className="academy-videos-arrow academy-videos-arrow-right"
            onClick={() => slide(1)}
            aria-label="Next video"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
    </section>
  );
}
