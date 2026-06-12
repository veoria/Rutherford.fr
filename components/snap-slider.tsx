'use client';

import { Children, useEffect, useRef, useState } from 'react';

/**
 * Mobile-only horizontal snap slider. On desktop the wrapped element keeps its
 * original grid layout (pass the existing grid class via `className`); under
 * 640px the `snap-slider` class turns it into a swipeable scroll-snap track.
 *
 * While swiping, each card exposes a continuous `--dist` custom property
 * (0 = centered, 1 = a full viewport away) that the CSS uses to scale and
 * fade non-active cards. Dots reflect the snapped card.
 */
export function SnapSlider({ className, children }: { className: string; children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = Children.count(children);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const update = () => {
      // No horizontal overflow = desktop grid; reset and bail.
      if (track.scrollWidth <= track.clientWidth + 4) {
        Array.from(track.children).forEach((c) => (c as HTMLElement).style.removeProperty('--dist'));
        return;
      }
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      Array.from(track.children).forEach((child, i) => {
        const c = child as HTMLElement;
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
        c.style.setProperty('--dist', Math.min(d / track.clientWidth, 1).toFixed(3));
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActive(best);
    };
    update();
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      track.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [count]);

  return (
    <>
      <div className={`${className} snap-slider`} ref={trackRef}>
        {children}
      </div>
      <div className="snap-slider-dots" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className={i === active ? 'is-active' : undefined} />
        ))}
      </div>
    </>
  );
}
