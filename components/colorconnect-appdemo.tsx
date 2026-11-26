'use client';

// A click-through ColorConnect inside the iMac. Real screens from the demo recording (demo data only);
// invisible buttons sit on the real menu items, job cards and arrows, so the visitor moves around the app
// with the mouse. Screens swap instantly, with no transition. Positions are in % of the 1600 x 900 screen.

import { useEffect, useState } from 'react';

const IMG = '/images/colorconnect';

type Spot = { to: Key; x: number; y: number; w: number; h: number; label: string; hint?: boolean };
type Key = 'floor' | 'jobs' | 'offset' | 'zones1' | 'zones3' | 'flexo' | 'inks' | 'ppwr';
type Screen = { src: string; title: string; body: string; spots: Spot[] };

// The menu is the same on every screen except the shop-floor TV view.
const MENU: Spot[] = [
  { to: 'floor', x: 0.6, y: 12.9, w: 12, h: 3.2, label: 'Overview' },
  { to: 'jobs', x: 0.6, y: 16.4, w: 12, h: 3.2, label: 'Projects' },
  { to: 'inks', x: 0.6, y: 47.6, w: 12, h: 3.2, label: 'Inks and substrates' },
  { to: 'ppwr', x: 0.6, y: 68.1, w: 12, h: 3.2, label: 'PPWR' },
];

const SCREENS: Record<Key, Screen> = {
  floor: {
    src: 'screen-floor.webp',
    title: 'Every press, live.',
    body: 'The shop-floor screen shows which presses run, their speed and their score. Click a press to open its job.',
    spots: [
      { to: 'offset', x: 1.7, y: 20.5, w: 23.2, h: 37, label: 'Open the job on the Heidelberg press', hint: true },
      { to: 'flexo', x: 1.7, y: 60, w: 23.2, h: 37, label: 'Open the job on the Nilpeter press' },
      { to: 'jobs', x: 93.1, y: 1.6, w: 5.2, h: 3.4, label: 'Exit the TV view' },
    ],
  },
  jobs: {
    src: 'tour16-jobs.webp',
    title: 'Every job, prepared.',
    body: 'Prepress drops the files in a folder, as today. Each job arrives with its preview, inks and ink coverage.',
    spots: [
      { to: 'offset', x: 71.6, y: 20.2, w: 27.2, h: 44, label: 'Open the offset job Demo_DRUPA', hint: true },
      { to: 'flexo', x: 14.6, y: 66.7, w: 27.2, h: 32.5, label: 'Open the flexo job demo job' },
      ...MENU,
    ],
  },
  offset: {
    src: 'tour16-offset.webp',
    title: 'Ready for the offset press.',
    body: 'Press, schedule, substrate and ink per color. At the console, ColorLoop finds the same job, with nothing to retype.',
    spots: [
      { to: 'zones1', x: 35.7, y: 24.3, w: 4.6, h: 2.6, label: 'Open the ColorLoop tab', hint: true },
      { to: 'jobs', x: 14.8, y: 9.6, w: 7.6, h: 2.4, label: 'Back to projects' },
      ...MENU,
    ],
  },
  zones1: {
    src: 'tour16-zones-1.webp',
    title: 'Sheet 1, straight off the press.',
    body: 'Every ink zone of every measured sheet. Red and yellow are out of tolerance. Click the arrow to see sheet 3.',
    spots: [
      { to: 'zones3', x: 32.8, y: 6.9, w: 2.1, h: 3.2, label: 'Next sheet', hint: true },
      ...MENU,
    ],
  },
  zones3: {
    src: 'tour16-zones-3.webp',
    title: 'Sheet 3, into tolerance.',
    body: 'ColorLoop corrected after each measurement. Two sheets later, the zones are green, and the job keeps the whole history.',
    spots: [
      { to: 'zones1', x: 18.4, y: 6.9, w: 2.1, h: 3.2, label: 'Previous sheet' },
      ...MENU.map((m) => (m.to === 'jobs' ? { ...m, hint: true } : m)),
    ],
  },
  flexo: {
    src: 'tour16-flexo.webp',
    title: 'Flexo, measured inline.',
    body: 'DeltaOne measures the running web. ΔE per ink, speed and every measurement stay with the job.',
    spots: [
      { to: 'jobs', x: 14.6, y: 9.3, w: 7.6, h: 2.6, label: 'Back to projects' },
      { to: 'inks', x: 0.6, y: 47.6, w: 12, h: 3.2, label: 'Inks and substrates', hint: true },
      ...MENU.filter((m) => m.to !== 'inks'),
    ],
  },
  inks: {
    src: 'tour16-inks.webp',
    title: 'Inks and substrates, documented.',
    body: 'Each ink carries its composition and compliance data. A non-compliant color shows at once.',
    spots: [
      { to: 'ppwr', x: 0.6, y: 68.1, w: 12, h: 3.2, label: 'PPWR', hint: true },
      ...MENU.filter((m) => m.to !== 'ppwr'),
    ],
  },
  ppwr: {
    src: 'tour16-ppwr.webp',
    title: 'Evidence from your own jobs.',
    body: 'A PPWR evaluation per job, from data your production already creates. ColorConnect helps you prepare evidence. It does not certify.',
    spots: [
      { to: 'floor', x: 0.6, y: 12.9, w: 12, h: 3.2, label: 'Overview', hint: true },
      ...MENU.filter((m) => m.to !== 'floor'),
    ],
  },
};

const ORDER: Key[] = ['floor', 'jobs', 'offset', 'zones1', 'zones3', 'flexo', 'inks', 'ppwr'];
const CHIPS: { key: Key; label: string }[] = [
  { key: 'floor', label: 'Press floor' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'offset', label: 'Offset job' },
  { key: 'zones1', label: 'Ink zones' },
  { key: 'flexo', label: 'Flexo job' },
  { key: 'inks', label: 'Inks' },
  { key: 'ppwr', label: 'PPWR' },
];

export function AppDemo() {
  const [cur, setCur] = useState<Key>('floor');
  const [clicks, setClicks] = useState(0);
  const s = SCREENS[cur];

  // Preload every screen so a click swaps the picture at once.
  useEffect(() => {
    ORDER.forEach((k) => {
      const i = new Image();
      i.src = `${IMG}/${SCREENS[k].src}`;
    });
  }, []);

  const go = (k: Key) => {
    setCur(k);
    setClicks((c) => c + 1);
  };

  return (
    <div className="cc-demo">
      <div className="cc-imac cc-imac-tour">
        <div className="cc-imac-screen cc-demo-screen">
          {ORDER.map((k) => (
            <img
              key={k}
              src={`${IMG}/${SCREENS[k].src}`}
              alt={k === cur ? `ColorConnect: ${SCREENS[k].title}` : ''}
              aria-hidden={k !== cur}
              width={1600}
              height={900}
              className={k === cur ? 'is-on' : undefined}
              decoding="async"
            />
          ))}
          {s.spots.map((sp) => (
            <button
              key={`${cur}-${sp.label}`}
              type="button"
              className={`cc-spot${sp.hint && clicks < 6 ? ' is-hint' : ''}`}
              style={{ left: `${sp.x}%`, top: `${sp.y}%`, width: `${sp.w}%`, height: `${sp.h}%` }}
              aria-label={sp.label}
              title={sp.label}
              onClick={() => go(sp.to)}
            />
          ))}
        </div>
        <img className="cc-imac-bezel" src={`${IMG}/device-imac-blue-bezel.webp`} alt="" width={1800} height={1532} />
      </div>
      <div className="cc-app-caption" aria-live="polite">
        <h3>{s.title}</h3>
        <p>{s.body}</p>
      </div>
      <nav className="cc-demo-chips" aria-label="ColorConnect screens">
        {CHIPS.map((c) => (
          <button key={c.key} type="button" className={c.key === cur || (c.key === 'zones1' && cur === 'zones3') ? 'is-on' : undefined} onClick={() => go(c.key)}>
            {c.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
