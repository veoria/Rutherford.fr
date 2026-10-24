'use client';

import Image from 'next/image';
import { track } from '@vercel/analytics';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useLanguage, type Locale } from '@/components/language-provider';
import { BRANDS, ROUNDS, hexToLab, parseShared, rankFor, readoutInkIsDark, type Brand, type SharedResult } from '@/lib/color-guesser';
import { sounds } from './color-guesser-sound';
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
  soundOff: string;
  soundOn: string;
  shareText: string;
  challenge: string;
  srScore: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    h1: 'Which one is the real brand color?',
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
    soundOff: 'Mute sound',
    soundOn: 'Turn sound on',
    shareText: 'I scored {score}/{total} on the Rutherford color guesser. Can you spot the real brand colors?',
    challenge: 'Someone scored {score}/{total}. Your turn.',
    srScore: 'Score {score} of {total}. {rank}',
  },
  fr: {
    h1: 'Quelle est la vraie couleur de la marque ?',
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
    soundOff: 'Couper le son',
    soundOn: 'Activer le son',
    shareText: 'J’ai fait {score}/{total} au color guesser de Rutherford. Saurez-vous trouver les vraies couleurs des marques ?',
    challenge: 'Quelqu’un a fait {score}/{total}. À vous de jouer.',
    srScore: 'Score : {score} sur {total}. {rank}',
  },
  de: {
    h1: 'Welche ist die echte Markenfarbe?',
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
    soundOff: 'Ton ausschalten',
    soundOn: 'Ton einschalten',
    shareText: 'Ich habe {score}/{total} beim Rutherford Color Guesser erreicht. Erkennen Sie die echten Markenfarben?',
    challenge: 'Jemand hat {score}/{total} erreicht. Jetzt sind Sie dran.',
    srScore: 'Ergebnis: {score} von {total}. {rank}',
  },
  it: {
    h1: 'Qual è il vero colore del brand?',
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
    soundOff: 'Disattiva l’audio',
    soundOn: 'Attiva l’audio',
    shareText: 'Ho fatto {score}/{total} al color guesser di Rutherford. Riconosce i veri colori dei brand?',
    challenge: 'Qualcuno ha fatto {score}/{total}. Tocca a Lei.',
    srScore: 'Punteggio: {score} su {total}. {rank}',
  },
  es: {
    h1: '¿Cuál es el verdadero color de la marca?',
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
    soundOff: 'Silenciar el sonido',
    soundOn: 'Activar el sonido',
    shareText: 'He sacado {score}/{total} en el color guesser de Rutherford. ¿Sabe reconocer los colores reales de las marcas?',
    challenge: 'Alguien ha sacado {score}/{total}. Le toca a usted.',
    srScore: 'Puntuación: {score} de {total}. {rank}',
  },
  pt: {
    h1: 'Qual é a verdadeira cor da marca?',
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
    soundOff: 'Desligar o som',
    soundOn: 'Ligar o som',
    shareText: 'Fiz {score}/{total} no color guesser da Rutherford. Consegue reconhecer as verdadeiras cores das marcas?',
    challenge: 'Alguém fez {score}/{total}. É a sua vez.',
    srScore: 'Pontuação: {score} de {total}. {rank}',
  },
};

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
}

// Same as fill(), but the brand name stays on one line (Coca-Cola must not break at the hyphen).
function fillBrand(template: string, brand: string, values: Record<string, string | number> = {}) {
  const [before, after = ''] = fill(template, {
    ...values,
    brand: '\u0000',
  }).split('\u0000');
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

// CMYK confetti. Fixed geometry, so the server and client renders match.
type Dot = {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  spin: number;
};

function makeBurst(count: number, inner: number, spread: number, flatten: number): Dot[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (i % 2 ? 0.18 : -0.12);
    const radius = inner + ((i * 37) % spread);
    return {
      x: Math.round(Math.cos(angle) * radius),
      y: Math.round(Math.sin(angle) * radius * flatten),
      size: 6 + ((i * 5) % 7),
      color: CMYK[i % 4],
      delay: (i % 5) * 18,
      spin: ((i * 53) % 180) - 90,
    };
  });
}

const HIT = makeBurst(24, 40, 84, 1);
const WIN = makeBurst(28, 110, 90, 0.8);

function Burst({ dots, className = 'cg-burst' }: { dots: Dot[]; className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      {dots.map((d, i) => (
        <i
          key={i}
          className={i % 3 === 0 ? 'is-strip' : undefined}
          style={
            {
              '--x': `${d.x}px`,
              '--y': `${d.y}px`,
              '--s': `${d.size}px`,
              '--c': d.color,
              '--d': `${d.delay}ms`,
              '--r': `${d.spin}deg`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

// What a spectrophotometer would report for the patch: hex, then L*a*b* (D50).
function Readout({ hex, dark, locale }: { hex: string; dark: boolean; locale: string }) {
  const fmt = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const [L, a, b] = hexToLab(hex);
  return (
    <span className={`cg-read${dark ? ' is-light' : ''}`} aria-hidden="true">
      <span className="cg-read-hex">{hex}</span>
      <span>L* {fmt.format(L)}</span>
      <span>a* {fmt.format(a)}</span>
      <span>b* {fmt.format(b)}</span>
    </span>
  );
}

function Speaker({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="cg-sound-icon">
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      {muted ? (
        <path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path
          d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

const SOUND_KEY = 'rf-color-guesser-muted';

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
  const [muted, setMuted] = useState(false);
  const [live, setLive] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const questionRef = useRef<HTMLHeadingElement | null>(null);
  const scoreRef = useRef<HTMLDivElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const sideNextRef = useRef<HTMLButtonElement | null>(null);
  const pendingFocus = useRef<'question' | 'score' | null>(null);
  const liveTimer = useRef(0);

  // One live region for the whole game: screen readers announce a region that already
  // exists when its text changes, not one inserted with its text.
  const announce = useCallback((text: string) => {
    setLive('');
    window.clearTimeout(liveTimer.current);
    liveTimer.current = window.setTimeout(() => setLive(text), 60);
  }, []);
  useEffect(() => () => window.clearTimeout(liveTimer.current), []);

  // Was the focus inside the game when a screen changed? Then it follows the game.
  const focusInGame = () => {
    const active = document.activeElement;
    return Boolean(rootRef.current && active && active !== document.body && rootRef.current.contains(active));
  };

  useEffect(() => {
    setDeck((current) => drawDeck(current[0].brand));
    const q = new URLSearchParams(window.location.search);
    setShared(parseShared({ s: q.get('s'), t: q.get('t'), b: q.get('b') }));
    setCanShare(typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches);
    try {
      setMuted(window.localStorage.getItem(SOUND_KEY) === '1');
    } catch {
      /* storage blocked: sound stays on */
    }
  }, []);

  const toggleSound = () => {
    setMuted((m) => {
      try {
        window.localStorage.setItem(SOUND_KEY, m ? '0' : '1');
      } catch {
        /* storage blocked: the choice lasts for this visit */
      }
      return !m;
    });
  };

  const round = deck[index];
  const { brand } = round;
  const score = results.filter((r) => r.ok).length;
  const colorOf = (side: Side) => (side === round.real ? brand.real : brand.decoy);
  const letterColor = (side: Side) => (brand.light ? INK : colorOf(side));
  const isRight = picked !== null && picked === round.real;
  const darkInk = readoutInkIsDark(brand.real, brand.decoy);
  const last = index === deck.length - 1;
  const numberLocale = locale === 'en' ? 'en-US' : locale;
  const de = new Intl.NumberFormat(numberLocale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(brand.deltaE);

  const pick = useCallback(
    (side: Side) => {
      if (picked || done) return;
      const ok = side === round.real;
      if (!muted) (ok ? sounds.right : sounds.wrong)();
      setPicked(side);
      setResults((r) => [...r, { brand, ok }]);
      announce(
        [ok ? t.right : t.wrong, ok ? '' : fill(t.wrongBody, { letter: round.real }), fill(t.gapShort, { de })].filter(Boolean).join(' '),
      );
    },
    [picked, done, round.real, brand, muted, announce, t, de],
  );

  const advance = useCallback(() => {
    if (!picked) return;
    const hadFocus = focusInGame();
    if (last) {
      const final = results.filter((r) => r.ok).length;
      // Lands with the result's confetti (cg-burst-win starts at 700 ms).
      if (!muted) sounds.finish(final >= Math.ceil(results.length / 2), 0.7);
      // The focus lands on the score; without focus in the game, the live region says it.
      if (hadFocus) pendingFocus.current = 'score';
      else announce(fill(t.srScore, { score: final, total: results.length, rank: rankFor(final, results.length, locale) }));
      setDone(true);
      track('color_guesser_complete', { score: final });
      return;
    }
    if (!muted) sounds.tick();
    pendingFocus.current = hadFocus ? 'question' : null;
    setIndex((i) => i + 1);
    setPicked(null);
  }, [picked, last, results, muted, announce, t, locale]);

  const restart = () => {
    pendingFocus.current = focusInGame() ? 'question' : null;
    setDeck(drawDeck());
    setIndex(0);
    setPicked(null);
    setResults([]);
    setDone(false);
    setCopied(false);
  };

  // After "Next brand" and "Play again" the focus goes to the new question, after
  // "See my score" to the score, never back to the top of the page.
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    (target === 'score' ? scoreRef.current : questionRef.current)?.focus({ preventScroll: true });
  }, [index, done, deck]);

  // Keep the keyboard flow going: Enter continues once the verdict is shown.
  useEffect(() => {
    if (!picked || done) return;
    // Two buttons, one shown: beside the card on a wide screen, inside it otherwise.
    const visible = [sideNextRef.current, nextRef.current].find((el) => el && el.offsetParent !== null);
    visible?.focus({ preventScroll: true });
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
    <div ref={rootRef} className={`cg${done ? ' is-done' : ''}`}>
      {/* The question sits right above the card; the page title stays for search
          engines and screen readers only. */}
      <h1 className="sr-only">{t.h1}</h1>
      {/* Once a side is picked the pill fades but keeps its place until the end
          screen, so the question and the card do not jump under the pointer. */}
      {shared && !done && (
        <p className={`cg-challenge${results.length > 0 ? ' is-gone' : ''}`} aria-hidden={results.length > 0 || undefined}>
          {fill(t.challenge, { score: shared.score, total: shared.total })}
        </p>
      )}
      {!done && (
        <h2 ref={questionRef} className="cg-question" tabIndex={-1}>
          {fillBrand(t.question, brand.brand)}
        </h2>
      )}

      <div className="cg-stage">
        {!done ? (
          <div className={`cg-card${picked ? ' is-revealed' : ''}${picked && !isRight ? ' is-miss' : ''}`}>
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
                    {picked && real && isRight && <Burst dots={HIT} />}
                  </span>
                  {picked && <Readout hex={colorOf(side)} dark={darkInk} locale={numberLocale} />}
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
              <div className="cg-verdict">
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
            {picked && (
              <button ref={sideNextRef} type="button" className="cg-next-side" onClick={advance}>
                {last ? t.finish : t.next}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M5 12h13M13 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="cg-result">
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

            <div ref={scoreRef} className="cg-score-wrap" tabIndex={-1}>
              {score >= Math.ceil(results.length / 2) && <Burst dots={WIN} className="cg-burst cg-burst-win" />}
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

        {/* At the end: the closed-loop message and the actions, beside the result on a wide screen. */}
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

      {!done && (
        <div className="cg-track">
          <div className="cg-track-row">
            <ol
              className="cg-steps"
              aria-label={fill(t.progress, {
                n: index + 1,
                total: deck.length,
              })}
            >
              {deck.map((r, i) => {
                const result = results[i];
                const state = result ? (result.ok ? 'is-ok' : 'is-ko') : i === index ? 'is-current' : '';
                return (
                  <li
                    key={`${r.brand.slug}-${i}`}
                    className={`cg-step ${state}${result && r.brand.light ? ' is-light' : ''}`}
                    style={result ? ({ '--patch': r.brand.real } as CSSProperties) : undefined}
                  >
                    {result && <Mark ok={result.ok} className="cg-step-mark" />}
                  </li>
                );
              })}
            </ol>
            <button
              type="button"
              className="cg-sound"
              onClick={toggleSound}
              aria-label={muted ? t.soundOn : t.soundOff}
              title={muted ? t.soundOn : t.soundOff}
            >
              <Speaker muted={muted} />
            </button>
          </div>
          {picked && <p className="cg-gap">{fill(t.gap, { de })}</p>}
        </div>
      )}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {live}
      </p>
    </div>
  );
}
