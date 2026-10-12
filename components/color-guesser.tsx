'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useLanguage, type Locale } from '@/components/language-provider';
import BRANDS_DATA from '@/data/color-guesser.json';
import './color-guesser.css';

// Brand color quiz: two near-identical colors behind a brand logo, only one is
// the brand's real color. Colors, decoys (computed at about ΔE00 3) and logos
// come from ~/Documents/Rutherford-posts/2026-10-brand-color-quiz (export_web.py),
// sources for every brand color in its research.md.

type Brand = {
  slug: string;
  brand: string;
  real: string;
  decoy: string;
  deltaE: number;
  logo: string;
  logoWidth: number;
  logoHeight: number;
  light: boolean;
};

type Side = 'A' | 'B';
type Round = { brand: Brand; real: Side };

const BRANDS = BRANDS_DATA as Brand[];
const ROUNDS = 5;
const FRAME = 1080; // logo sizes in the data are given for a 1080 px wide frame
const INK = '#1C1C1E';

type Copy = {
  h1: string;
  lead: string;
  round: string;
  question: string;
  right: string;
  rightBody: string;
  wrong: string;
  wrongBody: string;
  gap: string;
  next: string;
  finish: string;
  doneTitle: string;
  doneBody: string;
  cta: string;
  again: string;
  option: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    h1: 'Which one is the real brand color?',
    lead: 'Two colors, one logo. Only one is the brand’s real color. Pick A or B.',
    round: 'Brand {n} of {total}',
    question: 'Which one is the real {brand} color?',
    right: 'Right.',
    rightBody: 'That’s the real {brand} color.',
    wrong: 'Not this one.',
    wrongBody: 'The real {brand} color was {letter}.',
    gap: 'The two are only ΔE {de} apart. On press, many brand owners ask for ΔE under 2, on every sheet of the run.',
    next: 'Next brand',
    finish: 'See your score',
    doneTitle: 'You found {score} of {total}.',
    doneBody:
      'Side by side, the eye can tell. Across 10,000 sheets, it can’t. That’s the job of a closed loop: it measures every sheet and corrects the ink keys before the color drifts.',
    cta: 'Request console validation',
    again: 'Play again',
    option: 'Option {letter}',
  },
  fr: {
    h1: 'Quelle est la vraie couleur de la marque ?',
    lead: 'Deux couleurs, un logo. Une seule est la vraie couleur de la marque. Choisissez A ou B.',
    round: 'Marque {n} sur {total}',
    question: 'Quelle est la vraie couleur {brand} ?',
    right: 'Bien vu.',
    rightBody: 'C’est bien la couleur {brand}.',
    wrong: 'Raté.',
    wrongBody: 'La vraie couleur {brand} était la {letter}.',
    gap: 'Les deux ne sont qu’à ΔE {de} l’une de l’autre. Sur presse, beaucoup de marques exigent moins de ΔE 2, sur chaque feuille du tirage.',
    next: 'Marque suivante',
    finish: 'Voir votre score',
    doneTitle: 'Vous en avez trouvé {score} sur {total}.',
    doneBody:
      'Côte à côte, l’œil fait la différence. Sur 10 000 feuilles, il ne peut plus suivre. C’est le rôle d’un closed-loop : il mesure chaque feuille et corrige les clés d’encrage avant que la couleur ne dérive.',
    cta: 'Demander une validation console',
    again: 'Rejouer',
    option: 'Option {letter}',
  },
  de: {
    h1: 'Welche ist die echte Markenfarbe?',
    lead: 'Zwei Farben, ein Logo. Nur eine ist die echte Farbe der Marke. Wählen Sie A oder B.',
    round: 'Marke {n} von {total}',
    question: 'Welche ist die echte {brand}-Farbe?',
    right: 'Richtig.',
    rightBody: 'Das ist die echte {brand}-Farbe.',
    wrong: 'Leider nicht.',
    wrongBody: 'Die echte {brand}-Farbe war {letter}.',
    gap: 'Die beiden liegen nur ΔE {de} auseinander. Im Druck verlangen viele Markeninhaber weniger als ΔE 2, auf jedem Bogen der Auflage.',
    next: 'Nächste Marke',
    finish: 'Ergebnis ansehen',
    doneTitle: 'Sie haben {score} von {total} gefunden.',
    doneBody:
      'Nebeneinander sieht das Auge den Unterschied. Über 10.000 Bogen kann es das nicht mehr. Genau dafür gibt es Closed-Loop: Jeder Bogen wird gemessen, und die Farbzonenschrauben werden korrigiert, bevor die Farbe abweicht.',
    cta: 'Konsolenvalidierung anfragen',
    again: 'Noch einmal spielen',
    option: 'Option {letter}',
  },
  it: {
    h1: 'Qual è il vero colore del brand?',
    lead: 'Due colori, un logo. Solo uno è il vero colore del brand. Scelga A o B.',
    round: 'Brand {n} di {total}',
    question: 'Qual è il vero colore {brand}?',
    right: 'Esatto.',
    rightBody: 'È proprio il colore {brand}.',
    wrong: 'Non questa volta.',
    wrongBody: 'Il vero colore {brand} era {letter}.',
    gap: 'I due colori distano solo ΔE {de}. In macchina, molti brand chiedono meno di ΔE 2, su ogni foglio della tiratura.',
    next: 'Brand successivo',
    finish: 'Vedi il punteggio',
    doneTitle: 'Ne ha trovati {score} su {total}.',
    doneBody:
      'Fianco a fianco, l’occhio vede la differenza. Su 10.000 fogli non ce la fa più. È il compito del closed-loop: misura ogni foglio e corregge le chiavi di inchiostro prima che il colore vada in deriva.',
    cta: 'Richiedi validazione console',
    again: 'Gioca ancora',
    option: 'Opzione {letter}',
  },
  es: {
    h1: '¿Cuál es el verdadero color de la marca?',
    lead: 'Dos colores, un logo. Solo uno es el color real de la marca. Elija A o B.',
    round: 'Marca {n} de {total}',
    question: '¿Cuál es el verdadero color de {brand}?',
    right: 'Correcto.',
    rightBody: 'Es el color real de {brand}.',
    wrong: 'Esta vez no.',
    wrongBody: 'El color real de {brand} era el {letter}.',
    gap: 'Los dos están a solo ΔE {de} de distancia. En prensa, muchas marcas exigen menos de ΔE 2, en cada pliego de la tirada.',
    next: 'Siguiente marca',
    finish: 'Ver su puntuación',
    doneTitle: 'Ha acertado {score} de {total}.',
    doneBody:
      'Uno al lado del otro, el ojo nota la diferencia. En 10.000 pliegos, ya no puede. Para eso está el closed-loop: mide cada pliego y corrige las llaves de tinta antes de que el color derive.',
    cta: 'Solicitar validación de consola',
    again: 'Jugar otra vez',
    option: 'Opción {letter}',
  },
  pt: {
    h1: 'Qual é a verdadeira cor da marca?',
    lead: 'Duas cores, um logótipo. Só uma é a cor real da marca. Escolha A ou B.',
    round: 'Marca {n} de {total}',
    question: 'Qual é a verdadeira cor da {brand}?',
    right: 'Certo.',
    rightBody: 'É a cor real da {brand}.',
    wrong: 'Desta vez não.',
    wrongBody: 'A cor real da {brand} era a {letter}.',
    gap: 'As duas estão a apenas ΔE {de} uma da outra. Em máquina, muitas marcas exigem menos de ΔE 2, em cada folha da tiragem.',
    next: 'Marca seguinte',
    finish: 'Ver a sua pontuação',
    doneTitle: 'Acertou {score} de {total}.',
    doneBody:
      'Lado a lado, o olho vê a diferença. Em 10 000 folhas, já não consegue. É para isso que serve o closed-loop: mede cada folha e corrige as chaves de tinta antes de a cor derivar.',
    cta: 'Pedir validação da consola',
    again: 'Jogar outra vez',
    option: 'Opção {letter}',
  },
};

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
}

// Same as fill(), but the brand name stays on one line.
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

function Mark({ ok }: { ok: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="cg-mark">
      {ok ? (
        <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function ColorGuesser({ consoleHref }: { consoleHref: string }) {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const [deck, setDeck] = useState<Round[]>(firstDeck);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Side | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDeck((current) => drawDeck(current[0].brand));
  }, []);

  const round = deck[index];
  const { brand } = round;
  const colorOf = (side: Side) => (side === round.real ? brand.real : brand.decoy);
  const letterColor = (side: Side) => (brand.light ? INK : colorOf(side));
  const isRight = picked !== null && picked === round.real;
  const last = index === deck.length - 1;
  const de = new Intl.NumberFormat(locale === 'en' ? 'en-US' : locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(
    brand.deltaE,
  );

  const pick = useCallback(
    (side: Side) => {
      if (picked || done) return;
      setPicked(side);
      if (side === round.real) setScore((s) => s + 1);
    },
    [picked, done, round.real],
  );

  const advance = useCallback(() => {
    if (!picked) return;
    if (last) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  }, [picked, last]);

  const restart = () => {
    setDeck(drawDeck());
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  // On a phone the verdict sits below the card: bring it into view after a pick.
  useEffect(() => {
    if (!picked && !done) return;
    const target = document.querySelector(done ? '.cg-done' : '.cg-result');
    if (!target) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    // Keyboard players continue with Enter.
    (target.querySelector('button') as HTMLButtonElement | null)?.focus({ preventScroll: true });
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

  const logoStyle = {
    width: `${(brand.logoWidth / FRAME) * 100}%`,
  };

  return (
    <div className="cg">
      <div className="cg-copy">
        <h1 className="cg-title">{t.h1}</h1>
        <p className="cg-lead">{t.lead}</p>

        {!done && (
          <div className="cg-ask" key={`${brand.slug}-${index}`}>
            <p className="cg-progress">{fill(t.round, { n: index + 1, total: deck.length })}</p>
            <p className="cg-question">{fillBrand(t.question, brand.brand)}</p>
          </div>
        )}

        {!done && picked && (
          <div className="cg-result" role="status">
            <p className="cg-verdict">
              <span className={isRight ? 'is-right' : 'is-wrong'}>{isRight ? t.right : t.wrong}</span>{' '}
              {isRight ? fillBrand(t.rightBody, brand.brand) : fillBrand(t.wrongBody, brand.brand, { letter: round.real })}
            </p>
            <p className="cg-gap">{fill(t.gap, { de })}</p>
            <button type="button" className="button button-dark cg-next" onClick={advance}>
              {last ? t.finish : t.next}
            </button>
          </div>
        )}

        {done && (
          <div className="cg-done" role="status">
            <p className="cg-score">{fill(t.doneTitle, { score, total: deck.length })}</p>
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

      <div className={`cg-card${picked ? ' is-revealed' : ''}`} aria-label={fill(t.question, { brand: brand.brand })}>
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
              disabled={Boolean(picked) || done}
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
      </div>
    </div>
  );
}
