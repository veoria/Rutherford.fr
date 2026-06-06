'use client';

import { useEffect, useMemo, useState } from 'react';

export type CelebrationContent = {
  /** Bump this to retrigger the animation for a new milestone. */
  id: number;
  title: string;
  subtitle?: string;
  variant?: 'palier' | 'course' | 'level';
};

const CONFETTI_COLORS = ['#0071e3', '#34a853', '#fbbc04', '#e94235', '#6fb1ff', '#1d1d1f'];
const PIECES = 64;
const AUTO_DISMISS_MS = 4200;

function TrophyIcon() {
  return (
    <svg className="gicon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 4h12v2h3v3a4 4 0 0 1-4 4h-.4A6 6 0 0 1 13 16.9V19h3v2H8v-2h3v-2.1A6 6 0 0 1 7.4 13H7a4 4 0 0 1-4-4V6h3V4Zm0 4H5v1a2 2 0 0 0 1 1.7V8Zm12 0v2.7A2 2 0 0 0 19 9V8h-1Z" />
    </svg>
  );
}

/**
 * One-shot celebration overlay: a confetti burst plus a centered toast. Render
 * it once near the page root and feed it a new `content` (with a fresh `id`)
 * each time a milestone is crossed. Purely decorative — confetti is
 * pointer-events:none and the whole thing collapses under reduced-motion.
 */
export function Celebration({
  content,
  onDismiss,
}: {
  content: CelebrationContent | null;
  onDismiss: () => void;
}) {
  const [shownId, setShownId] = useState<number | null>(null);

  useEffect(() => {
    if (!content) return;
    setShownId(content.id);
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [content, onDismiss]);

  // Fresh confetti each time a celebration is shown.
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.6 + Math.random() * 1.8,
        size: 6 + Math.random() * 8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotate: Math.random() * 360,
        round: Math.random() > 0.5,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shownId]
  );

  if (!content) return null;

  return (
    <div className={`celebrate celebrate-${content.variant ?? 'palier'}`} role="status" aria-live="polite">
      <div className="celebrate-confetti" aria-hidden="true">
        {pieces.map((p, i) => (
          <span
            key={i}
            className="celebrate-piece"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              borderRadius: p.round ? '50%' : '2px',
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              transform: `rotate(${p.rotate}deg)`,
            }}
          />
        ))}
      </div>
      <div className="celebrate-toast">
        <span className="celebrate-toast-icon" aria-hidden="true">
          <TrophyIcon />
        </span>
        <div className="celebrate-toast-copy">
          <p className="celebrate-toast-title">{content.title}</p>
          {content.subtitle ? <p className="celebrate-toast-sub">{content.subtitle}</p> : null}
        </div>
        <button type="button" className="celebrate-toast-close" onClick={onDismiss} aria-label="Close">
          ×
        </button>
      </div>
    </div>
  );
}
