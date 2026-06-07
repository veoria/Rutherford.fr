'use client';

import { type ComponentType, useEffect, useState } from 'react';
import { type Locale, useLanguage } from '@/components/language-provider';
import { IllVariance } from '@/components/academy-illustrations/ill-variance';

/** Illustrations are served from public/academy/illustrations/. */
const ASSET = (file: string) => `/academy/illustrations/${file}`;

// Illustrations migrated to inline SVG (animatable, crisp at any size). Names
// not listed here fall back to the static <img> from /academy/illustrations/.
const REACT_ILLUSTRATIONS: Record<string, ComponentType<{ className?: string }>> = {
  'ill-variance.svg': IllVariance,
};

const LABELS: Record<Locale, { enlarge: string; close: string }> = {
  en: { enlarge: 'Enlarge illustration', close: 'Close' },
  fr: { enlarge: "Agrandir l'illustration", close: 'Fermer' },
  de: { enlarge: 'Illustration vergrößern', close: 'Schließen' },
  it: { enlarge: "Ingrandisci l'illustrazione", close: 'Chiudi' },
  es: { enlarge: 'Ampliar la ilustración', close: 'Cerrar' },
};

/**
 * Academy diagram. Renders the SVG at container width and, on tap, opens a
 * fullscreen lightbox where the (dense, label-heavy) diagram is shown larger
 * than the viewport and can be panned — the key affordance for reading these
 * on mobile.
 *
 * It is also the single seam for later per-name localized / responsive
 * variants (multilingual Academy) without touching the player.
 */
export function AcademyIllustration({ name, label }: { name: string; label?: string }) {
  const { locale } = useLanguage();
  const t = LABELS[locale] ?? LABELS.en;
  const [zoom, setZoom] = useState(false);
  const Inline = REACT_ILLUSTRATIONS[name];

  // While zoomed, swallow Esc / arrows in the capture phase so the underlying
  // player doesn't also close or page behind the lightbox.
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.stopImmediatePropagation();
        if (e.key === 'Escape') setZoom(false);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [zoom]);

  return (
    <>
      <button type="button" className="academy-illus" onClick={() => setZoom(true)} aria-label={t.enlarge}>
        {Inline ? (
          <Inline className="academy-illus-img" />
        ) : (
          <img className="academy-illus-img" src={ASSET(name)} alt={label ?? ''} loading="lazy" />
        )}
        <span className="academy-illus-zoom" aria-hidden="true">
          ⤢
        </span>
      </button>
      {zoom ? (
        <div className="academy-illus-lightbox" role="dialog" aria-modal="true" onClick={() => setZoom(false)}>
          <button type="button" className="academy-illus-close" onClick={() => setZoom(false)} aria-label={t.close}>
            ✕
          </button>
          {Inline ? (
            <Inline className="academy-illus-lightbox-img" />
          ) : (
            <img className="academy-illus-lightbox-img" src={ASSET(name)} alt={label ?? ''} />
          )}
        </div>
      ) : null}
    </>
  );
}
