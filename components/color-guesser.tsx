'use client';

import Image from 'next/image';
import { track } from '@vercel/analytics';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useLanguage, type Locale } from '@/components/language-provider';
import { BRANDS, ROUNDS, parseShared, rankFor, type Brand, type SharedResult } from '@/lib/color-guesser';
import './color-guesser.css';

// Brand color quiz: two near-identical colors behind a brand logo, only one is
// the brand's real color. Colors, decoys (computed at about ΔE00 3) and logos
// come from ~/Documents/Rutherford-posts/2026-10-brand-color-quiz (export_web.py),
// sources for every brand color in its research.md.

type Side = 'A' | 'B';
type Round = { brand: Brand; real: Side };
type Result = { brand: Brand; ok: boolean };

const FRAME = 1080; // logo sizes in the data are given for a 1080 px wide frame
const INK = '#1C1C1E';
const CMYK = ['#00A3E0', '#E4007C', '#FFD100', '#111418'];

type Copy = {
  h1: string;
  lead: string;
  progress: string;
  question: string;
  right: string;
  wrong: string;
  wrongBody: string;
  gap: string;
  gapShort: string;
  next: string;
  finish: string;
  barLabel: string;
  doneBody: string;
  cta: string;
  again: string;
  option: string;
  share: string;
  copy: string;
  copied: string;
  shareText: string;
  challenge: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    h1: 'Which one is the real brand color?',
    lead: 'Two colors, one logo. Only one is the brand’s real color. Pick A or B.',
    progress: 'Brand {n} of {total}',
    question: 'Which one is the real {brand} color?',
    right: 'Right.',
    wrong: 'Not this one.',
    wrongBody: 'It was {letter}.',
    gap: 'The two are only ΔE {de} apart. On press, many brand owners ask for ΔE under 2, on every sheet of the run.',
    gapShort: 'Only ΔE {de} apart.',
    next: 'Next brand',
    finish: 'See my score',
    barLabel: 'Your color bar',
    doneBody:
      'Side by side, the eye can tell. Across 10,000 sheets, it can’t. That’s the job of a closed loop: it measures every sheet and corrects the ink keys before the color drifts.',
    cta: 'Request console validation',
    again: 'Play again',
    option: 'Option {letter}',
    share: 'Share my score',
    copy: 'Copy link',
    copied: 'Link copied',
    shareText: 'I scored {score}/{total} on the Rutherford color guesser. Can you spot the real brand colors?',
    challenge: 'Someone scored {score}/{total}. Your turn.',
  },
  fr: {
    h1: 'Quelle est la vraie couleur de la marque ?',
    lead: 'Deux couleurs, un logo. Une seule est la vraie couleur de la marque. Choisissez A ou B.',
    progress: 'Marque {n} sur {total}',
    question: 'Quelle est la vraie couleur {brand} ?',
    right: 'Bien vu.',
    wrong: 'Raté.',
    wrongBody: 'C’était la {letter}.',
    gap: 'Les deux ne sont qu’à ΔE {de} l’une de l’autre. Sur presse, beaucoup de marques exigent moins de ΔE 2, sur chaque feuille du tirage.',
    gapShort: 'Seulement ΔE {de} d’écart.',
    next: 'Marque suivante',
    finish: 'Voir mon score',
    barLabel: 'Votre barre de contrôle',
    doneBody:
      'Côte à côte, l’œil fait la différence. Sur 10 000 feuilles, il ne peut plus suivre. C’est le rôle d’un closed-loop : il mesure chaque feuille et corrige les clés d’encrage avant que la couleur ne dérive.',
    cta: 'Demander une validation console',
    again: 'Rejouer',
    option: 'Option {letter}',
    share: 'Partager mon score',
    copy: 'Copier le lien',
    copied: 'Lien copié',
    shareText: 'J’ai fait {score}/{total} au color guesser de Rutherford. Saurez-vous trouver les vraies couleurs des marques ?',
    challenge: 'Quelqu’un a fait {score}/{total}. À vous de jouer.',
  },
  de: {
    h1: 'Welche ist die echte Markenfarbe?',
    lead: 'Zwei Farben, ein Logo. Nur eine ist die echte Farbe der Marke. Wählen Sie A oder B.',
    progress: 'Marke {n} von {total}',
    question: 'Welche ist die echte {brand}-Farbe?',
    right: 'Richtig.',
    wrong: 'Leider nicht.',
    wrongBody: 'Es war {letter}.',
    gap: 'Die beiden liegen nur ΔE {de} auseinander. Im Druck verlangen viele Markeninhaber weniger als ΔE 2, auf jedem Bogen der Auflage.',
    gapShort: 'Nur ΔE {de} Unterschied.',
    next: 'Nächste Marke',
    finish: 'Ergebnis ansehen',
    barLabel: 'Ihr Farbkontrollstreifen',
    doneBody:
      'Nebeneinander sieht das Auge den Unterschied. Über 10.000 Bogen kann es das nicht mehr. Genau dafür gibt es Closed-Loop: Jeder Bogen wird gemessen, und die Farbzonenschrauben werden korrigiert, bevor die Farbe abweicht.',
    cta: 'Konsolenvalidierung anfragen',
    again: 'Noch einmal spielen',
    option: 'Option {letter}',
    share: 'Ergebnis teilen',
    copy: 'Link kopieren',
    copied: 'Link kopiert',
    shareText: 'Ich habe {score}/{total} beim Rutherford Color Guesser erreicht. Erkennen Sie die echten Markenfarben?',
    challenge: 'Jemand hat {score}/{total} erreicht. Jetzt sind Sie dran.',
  },
  it: {
    h1: 'Qual è il vero colore del brand?',
    lead: 'Due colori, un logo. Solo uno è il vero colore del brand. Scelga A o B.',
    progress: 'Brand {n} di {total}',
    question: 'Qual è il vero colore {brand}?',
    right: 'Esatto.',
    wrong: 'Non questa volta.',
    wrongBody: 'Era la {letter}.',
    gap: 'I due colori distano solo ΔE {de}. In macchina, molti brand chiedono meno di ΔE 2, su ogni foglio della tiratura.',
    gapShort: 'Solo ΔE {de} di differenza.',
    next: 'Brand successivo',
    finish: 'Vedi il punteggio',
    barLabel: 'La Sua barra di controllo',
    doneBody:
      'Fianco a fianco, l’occhio vede la differenza. Su 10.000 fogli non ce la fa più. È il compito del closed-loop: misura ogni foglio e corregge le chiavi di inchiostro prima che il colore vada in deriva.',
    cta: 'Richiedi validazione console',
    again: 'Gioca ancora',
    option: 'Opzione {letter}',
    share: 'Condividi il punteggio',
    copy: 'Copia il link',
    copied: 'Link copiato',
    shareText: 'Ho fatto {score}/{total} al color guesser di Rutherford. Riconosce i veri colori dei brand?',
    challenge: 'Qualcuno ha fatto {score}/{total}. Tocca a Lei.',
  },
  es: {
    h1: '¿Cuál es el verdadero color de la marca?',
    lead: 'Dos colores, un logo. Solo uno es el color real de la marca. Elija A o B.',
    progress: 'Marca {n} de {total}',
    question: '¿Cuál es el verdadero color de {brand}?',
    right: 'Correcto.',
    wrong: 'Esta vez no.',
    wrongBody: 'Era el {letter}.',
    gap: 'Los dos están a solo ΔE {de} de distancia. En prensa, muchas marcas exigen menos de ΔE 2, en cada pliego de la tirada.',
    gapShort: 'Solo ΔE {de} de diferencia.',
    next: 'Siguiente marca',
    finish: 'Ver mi puntuación',
    barLabel: 'Su barra de control',
    doneBody:
      'Uno al lado del otro, el ojo nota la diferencia. En 10.000 pliegos, ya no puede. Para eso está el closed-loop: mide cada pliego y corrige las llaves de tinta antes de que el color derive.',
    cta: 'Solicitar validación de consola',
    again: 'Jugar otra vez',
    option: 'Opción {letter}',
    share: 'Compartir mi puntuación',
    copy: 'Copiar el enlace',
    copied: 'Enlace copiado',
    shareText: 'He sacado {score}/{total} en el color guesser de Rutherford. ¿Sabe reconocer los colores reales de las marcas?',
    challenge: 'Alguien ha sacado {score}/{total}. Le toca a usted.',
  },
  pt: {
    h1: 'Qual é a verdadeira cor da marca?',
    lead: 'Duas cores, um logótipo. Só uma é a cor real da marca. Escolha A ou B.',
    progress: 'Marca {n} de {total}',
    question: 'Qual é a verdadeira cor da {brand}?',
    right: 'Certo.',
    wrong: 'Desta vez não.',
    wrongBody: 'Era a {letter}.',
    gap: 'As duas estão a apenas ΔE {de} uma da outra. Em máquina, muitas marcas exigem menos de ΔE 2, em cada folha da tiragem.',
    gapShort: 'Apenas ΔE {de} de diferença.',
    next: 'Marca seguinte',
    finish: 'Ver a minha pontuação',
    barLabel: 'A sua barra de controlo',
    doneBody:
      'Lado a lado, o olho vê a diferença. Em 10 000 folhas, já não consegue. É para isso que serve o closed-loop: mede cada folha e corrige as chaves de tinta antes de a cor derivar.',
    cta: 'Pedir validação da consola',
    again: 'Jogar outra vez',
    option: 'Opção {letter}',
    share: 'Partilhar a pontuação',
    copy: 'Copiar a ligação',
    copied: 'Ligação copiada',
    shareText: 'Fiz {score}/{total} no color guesser da Rutherford. Consegue reconhecer as verdadeiras cores das marcas?',
    challenge: 'Alguém fez {score}/{total}. É a sua vez.',
  },
};

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
}

// Same as fill(), but the brand name stays on one line (Coca-Cola must not break at the hyphen).
function fillBrand(template: string, brand: string, values: Record<string, string | number> = {}) {
  const [before, after = ''] = fill(template, { ...values, brand: '\u0000' }).split('\u0000');
  return (
    <>
      {before}
      <span className="cg-brand">{brand}</span>
      {after}
    </>
  );
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Round 1 is fixed (Coca-Cola, real color on B) so the server render and the
// first client render match; the next rounds are drawn after mount.
function firstDeck(): Round[] {
  const first = BRANDS.find((b) => b.slug === 'coca-cola') ?? BRANDS[0];
  const rest = BRANDS.filter((b) => b !== first).slice(0, ROUNDS - 1);
  return [{ brand: first, real: 'B' }, ...rest.map((brand, i) => ({ brand, real: (i % 2 ? 'B' : 'A') as Side }))];
}

function drawDeck(keepFirst?: Brand): Round[] {
  const pool = shuffle(BRANDS.filter((b) => b !== keepFirst));
  const picked = keepFirst ? [keepFirst, ...pool.slice(0, ROUNDS - 1)] : pool.slice(0, ROUNDS);
  return picked.map((brand, i) => ({
    brand,
    real: keepFirst && i === 0 ? 'B' : Math.random() < 0.5 ? 'A' : 'B',
  }));
}

function Mark({ ok, className = 'cg-mark' }: { ok: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      {ok ? (
        <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      )}
    </svg>
  );
}

// CMYK dots thrown from the score once. Fixed geometry, so every render matches.
const BURST = Array.from({ length: 20 }, (_, i) => {
  const angle = (i / 20) * Math.PI * 2 + (i % 2 ? 0.18 : -0.12);
  const radius = 110 + ((i * 37) % 70);
  return {
    x: Math.round(Math.cos(angle) * radius),
    y: Math.round(Math.sin(angle) * radius * 0.8),
    size: 7 + ((i * 5) % 7),
    color: CMYK[i % 4],
    delay: (i % 5) * 18,
  };
});

export function ColorGuesser({ consoleHref }: { consoleHref: string }) {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const [deck, setDeck] = useState<Round[]>(firstDeck);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Side | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [done, setDone] = useState(false);
  const [shared, setShared] = useState<SharedResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setDeck((current) => drawDeck(current[0].brand));
    const q = new URLSearchParams(window.location.search);
    setShared(parseShared({ s: q.get('s'), t: q.get('t'), b: q.get('b') }));
    setCanShare(typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const round = deck[index];
  const { brand } = round;
  const score = results.filter((r) => r.ok).length;
  const colorOf = (side: Side) => (side === round.real ? brand.real : brand.decoy);
  const letterColor = (side: Side) => (brand.light ? INK : colorOf(side));
  const isRight = picked !== null && picked === round.real;
  const last = index === deck.length - 1;
  const numberLocale = locale === 'en' ? 'en-US' : locale;
  const de = new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(brand.deltaE);

  const pick = useCallback(
    (side: Side) => {
      if (picked || done) return;
      setPicked(side);
      setResults((r) => [...r, { brand, ok: side === round.real }]);
    },
    [picked, done, round.real, brand],
  );

  const advance = useCallback(() => {
    if (!picked) return;
    if (last) {
      setDone(true);
      track('color_guesser_complete', { score: results.filter((r) => r.ok).length });
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  }, [picked, last, results]);

  const restart = () => {
    setDeck(drawDeck());
    setIndex(0);
    setPicked(null);
    setResults([]);
    setDone(false);
    setCopied(false);
  };

  // Keep the keyboard flow going: Enter continues once the verdict is shown.
  useEffect(() => {
    if (picked && !done) nextRef.current?.focus({ preventScroll: true });
  }, [picked, done]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      const key = event.key.toLowerCase();
      if (key === 'a') pick('A');
      else if (key === 'b') pick('B');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pick]);

  const shareUrl = useMemo(() => {
    if (!done || typeof window === 'undefined') return '';
    const url = new URL(window.location.pathname, window.location.origin);
    url.searchParams.set('s', String(score));
    url.searchParams.set('t', String(results.length));
    url.searchParams.set('b', results.map((r) => r.brand.slug).join(','));
    url.searchParams.set('utm_source', 'share');
    url.searchParams.set('utm_medium', 'social');
    url.searchParams.set('utm_campaign', 'color-guesser');
    return url.toString();
  }, [done, score, results]);
  const shareText = fill(t.shareText, { score, total: results.length });

  const nativeShare = async () => {
    try {
      await navigator.share({ title: t.h1, text: shareText, url: shareUrl });
      track('color_guesser_share', { method: 'native' });
    } catch {
      /* the visitor closed the share sheet */
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      track('color_guesser_share', { method: 'copy' });
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      /* clipboard blocked by the browser: nothing to do */
    }
  };

  const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;

  const logoStyle = { width: `${(brand.logoWidth / FRAME) * 100}%` };

  return (
    <div className={`cg${done ? ' is-done' : ''}`}>
      <div className="cg-copy">
        {shared && !done && results.length === 0 && (
          <p className="cg-challenge">{fill(t.challenge, { score: shared.score, total: shared.total })}</p>
        )}
        <h1 className="cg-title">{t.h1}</h1>
        <p className="cg-lead">{t.lead}</p>

        {!done && (
          <div className="cg-ask">
            <ol className="cg-steps" aria-label={fill(t.progress, { n: index + 1, total: deck.length })}>
              {deck.map((r, i) => {
                const result = results[i];
                const state = result ? (result.ok ? 'is-ok' : 'is-ko') : i === index ? 'is-current' : '';
                return (
                  <li
                    key={`${r.brand.slug}-${i}`}
                    className={`cg-step ${state}`}
                    style={result ? ({ '--patch': r.brand.real } as CSSProperties) : undefined}
                  >
                    {result && <Mark ok={result.ok} className="cg-step-mark" />}
                  </li>
                );
              })}
            </ol>
            <p className="cg-question">{fillBrand(t.question, brand.brand)}</p>
            {picked && <p className="cg-gap">{fill(t.gap, { de })}</p>}
          </div>
        )}

        {done && (
          <div className="cg-done">
            <p className="cg-done-body">{t.doneBody}</p>
            <div className="cg-actions">
              <a className="button button-accent" href={consoleHref}>
                {t.cta}
              </a>
              <button type="button" className="button button-light" onClick={restart}>
                {t.again}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="cg-stage">
        {!done ? (
          <div className={`cg-card${picked ? ' is-revealed' : ''}`}>
            {(['A', 'B'] as Side[]).map((side) => {
              const real = side === round.real;
              const chosen = side === picked;
              return (
                <button
                  key={side}
                  type="button"
                  className={`cg-half${picked ? (real ? ' is-real' : ' is-decoy') : ''}${chosen ? ' is-chosen' : ''}`}
                  style={{ background: colorOf(side) }}
                  onClick={() => pick(side)}
                  disabled={Boolean(picked)}
                  aria-label={fill(t.option, { letter: side })}
                >
                  <span className="cg-bubble" style={{ color: letterColor(side) }}>
                    {picked && (real || chosen) ? <Mark ok={real} /> : side}
                  </span>
                </button>
              );
            })}
            <Image
              key={brand.slug}
              className="cg-logo"
              src={brand.logo}
              alt={brand.brand}
              width={brand.logoWidth * 2}
              height={brand.logoHeight * 2}
              style={logoStyle}
              sizes="(max-width: 760px) 70vw, 340px"
              priority={index === 0}
            />
            {picked && (
              <div className="cg-verdict" role="status">
                <p>
                  <span className={isRight ? 'is-right' : 'is-wrong'}>{isRight ? t.right : t.wrong}</span>
                  {!isRight && <> {fill(t.wrongBody, { letter: round.real })}</>}
                  <small className="cg-verdict-gap">{fill(t.gapShort, { de })}</small>
                </p>
                <button ref={nextRef} type="button" className="cg-next" onClick={advance}>
                  {last ? t.finish : t.next}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="cg-result" role="status">
            <p className="cg-bar-label">{t.barLabel}</p>
            <ol className="cg-bar">
              {results.map((r, i) => (
                <li key={`${r.brand.slug}-${i}`} style={{ '--i': i, '--patch': r.brand.real } as CSSProperties}>
                  <span className={`cg-patch${r.brand.light ? ' is-light' : ''}`}>
                    <Mark ok={r.ok} className="cg-patch-mark" />
                  </span>
                  <span className="cg-patch-name">{r.brand.brand}</span>
                </li>
              ))}
            </ol>

            <div className="cg-score-wrap">
              {score >= Math.ceil(results.length / 2) && (
                <div className="cg-burst" aria-hidden="true">
                  {BURST.map((d, i) => (
                    <span
                      key={i}
                      style={
                        {
                          '--x': `${d.x}px`,
                          '--y': `${d.y}px`,
                          '--s': `${d.size}px`,
                          '--c': d.color,
                          '--d': `${d.delay}ms`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </div>
              )}
              <p className="cg-score">
                {score}
                <span>/{results.length}</span>
              </p>
              <p className="cg-rank">{rankFor(score, results.length, locale)}</p>
            </div>

            <div className="cg-share">
              {canShare ? (
                <button type="button" className="cg-share-main" onClick={nativeShare}>
                  {t.share}
                </button>
              ) : (
                <a
                  className="cg-share-main"
                  href={linkedInHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('color_guesser_share', { method: 'linkedin' })}
                >
                  {t.share} · LinkedIn
                </a>
              )}
              <div className="cg-share-more">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('color_guesser_share', { method: 'whatsapp' })}
                >
                  WhatsApp
                </a>
                <button type="button" onClick={copyLink} aria-live="polite">
                  {copied ? t.copied : t.copy}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
