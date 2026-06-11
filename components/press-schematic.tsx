'use client';

// Animated isometric sheetfed-offset press for the ROI estimator.
//
// - `colorCount` adds/removes printing towers one by one (new towers slide in
//   from the feeder side, no fade).
// - `format` tweens the REAL geometry — overall size and machine width (large
//   format is mostly wider) — redrawn each frame, so it stays crisp (no CSS
//   scale blur).
// - Cylinders carry a rotating marker (CSS animation; existing towers keep
//   their phase across re-renders because elements are keyed and reused).
// - The console station (inspection desk + operator) is the owner-supplied
//   vector artwork, baked verbatim: it stays fixed while the press changes.

import { useEffect, useRef, useState } from 'react';

export type PressFormat = 'b2' | 'b1' | 'vlf';
export type PressColorCount = 4 | 5 | 6 | 8;

const OX = 250;
const OY = 372;
const C30 = Math.cos(Math.PI / 6);
const S30 = Math.sin(Math.PI / 6);
const PITCH = 1.32;
const TD = 0.86;
const HZ = 2.4;
const BASE = 0.16;
const BASE_U = 42;
const BASE_WB = 1.7;

const FORMAT_GEO: Record<PressFormat, { size: number; width: number }> = {
  b2: { size: 0.92, width: 0.86 },
  b1: { size: 1, width: 1 },
  vlf: { size: 1.13, width: 1.5 },
};

// Palette (matches the brand illustration).
const BT = '#39414f';
const BF = '#2b313d';
const BS = '#222732';
const GT = '#aab3c3';
const GF = '#828ca0';
const GS = '#5f6878';
const SR = '#566076';
const SF = '#c7cdd9';
const SHI = '#e9ecf2';
const SHU = '#6b7587';
const PAPER = '#fdfefe';
const PSIDE = '#dfe4ec';
const PEDGE = '#c3cbd6';
const SHADOW = '#bcdcef';
// C M Y K + Orange Green Violet + varnish — [top, front, side] per unit.
const INKS: [string, string, string][] = [
  ['#9ec7e9', '#70a4cb', '#4f82ab'],
  ['#fb6ba4', '#f9438a', '#cf2f6c'],
  ['#ffe06b', '#fdd637', '#e3b81f'],
  ['#525c70', '#3e4657', '#2b313d'],
  ['#f9b96d', '#f59a2e', '#d2781a'],
  ['#69cf95', '#34b06e', '#239256'],
  ['#b486d0', '#9159b5', '#6f3d92'],
  ['#dde2ea', '#b8c0cf', '#99a3b5'],
];

// Owner-supplied console-station artwork (static, trusted asset — exported
// from the approved Illustrator file and re-emitted as plain paths).
const STATION_PATHS = `<path d="M24.9,416.3 L32.1,420.5 L32.1,339.9 L24.9,335.7 L24.9,416.3 Z" fill="#222732"/><path d="M32.1,420.5 L92.1,385.9 L92.1,305.2 L32.1,339.9 L32.1,420.5 Z" fill="#2b313d"/><path d="M24.9,335.7 L84.9,301.0 L92.1,305.2 L32.1,339.9 L24.9,335.7 Z" fill="#39414f"/><path d="M32.1,420.4 L82.4,450.2 L82.4,415.8 L32.1,386.1 L32.1,420.4 Z" fill="#5f6878"/><path d="M82.4,450.2 L136.8,419.7 L136.8,387.0 L82.4,417.4 L82.4,450.2 Z" fill="#828ca0"/><path d="M35.0,389.1 L87.7,358.6 L136.8,387.0 L84.1,417.4 L35.0,389.1 Z" fill="#aab3c3"/><path d="M32.1,389.1 L84.1,419.1 L84.1,416.2 L32.1,386.1 L32.1,389.1 Z" fill="#828ca0"/><path d="M84.1,419.1 L144.2,385.0 L144.2,382.0 L84.1,416.2 L84.1,419.1 Z" fill="#aab3c3"/><path d="M32.1,386.1 L91.5,354.2 L144.2,382.0 L84.1,416.2 L32.1,386.1 Z" fill="#e6e9f0"/><path d="M53.2,385.7 L87.7,365.8 L116.8,382.6 L82.3,402.5 L53.2,385.7 Z" fill="#fdfefe"/><path d="M61.5,386.1 L88.8,370.4 L93.9,373.3 L66.6,389.1 L61.5,386.1 Z" fill="#70a4cb"/><path d="M69.6,390.7 L96.8,375.0 L101.9,377.9 L74.6,393.7 L69.6,390.7 Z" fill="#f9438a"/><path d="M77.6,395.4 L91.0,387.6 L96.8,391.0 L83.4,398.7 L77.6,395.4 Z" fill="#34b06e"/><path d="M93.2,386.3 L104.8,379.6 L110.7,383.0 L99.0,389.7 L93.2,386.3 Z" fill="#fdd637"/><path d="M92.0,363.6 L93.3,365.6 L104.2,350.8 L102.9,348.8 L92.0,363.6 Z" fill="#66646e"/><path d="M93.3,365.6 L95.6,366.2 L106.5,351.4 L104.2,350.8 L93.3,365.6 Z" fill="#363844"/><path d="M102.9,348.8 L105.2,349.4 L106.5,351.4 L104.2,350.8 L102.9,348.8 Z" fill="#222732"/><path d="M105.9,359.6 L105.9,363.1 L115.0,359.9 L120.8,357.8 L120.8,341.1 L117.4,342.3 L105.9,346.3 L105.9,351.4 L105.9,359.6 M103.9,365.5 C103.9,365.5 103.9,365.4 103.9,365.4 C103.8,365.4 103.8,365.4 103.8,365.4 L103.8,364.0 L103.8,354.6 L103.8,344.6 L105.9,343.8 L120.1,338.9 L121.9,338.3 C122.0,338.2 122.1,338.2 122.2,338.2 L122.2,359.1 L115.4,361.4 L103.9,365.5 Z" fill="#2b313d"/><path d="M122.2,338.2 C122.1,338.2 122.0,338.2 121.9,338.3 L120.1,338.9 L105.9,343.8 L103.8,344.6 L101.9,342.8 C101.8,342.7 101.7,342.6 101.6,342.5 C101.6,342.4 101.7,342.4 101.8,342.4 L105.4,341.1 L114.7,337.9 L120.1,336.1 L122.2,338.2 Z" fill="#39414f"/><path d="M103.8,344.6 L103.8,354.6 L103.8,364.0 L103.8,365.4 C103.8,365.4 103.8,365.4 103.9,365.4 C103.9,365.4 103.9,365.5 103.9,365.5 L103.7,365.5 L101.6,363.5 L101.6,342.5 C101.7,342.6 101.8,342.7 101.9,342.8 L103.8,344.6 Z" fill="#222732"/><path d="M105.9,359.6 L105.9,351.4 L105.9,346.3 L117.4,342.3 L120.8,341.1 L120.8,357.8 L115.0,359.9 L105.9,363.1 L105.9,359.6 Z" fill="#9ec7e9"/><path d="M113.5,448.9 L123.0,454.3 L123.0,421.6 L113.5,416.1 L113.5,448.9 Z" fill="#222732"/><path d="M123.0,454.3 L129.1,450.7 L129.1,418.0 L123.0,421.6 L123.0,454.3 Z" fill="#2b313d"/><path d="M113.5,416.1 L119.7,412.5 L129.1,418.0 L123.0,421.6 L113.5,416.1 Z" fill="#39414f"/><path d="M121.9,444.0 L131.3,449.5 L131.3,416.7 L121.9,411.3 L121.9,444.0 Z" fill="#222732"/><path d="M131.3,449.5 L137.5,445.9 L137.5,413.2 L131.3,416.7 L131.3,449.5 Z" fill="#2b313d"/><path d="M121.9,411.3 L128.0,407.7 L137.5,413.2 L131.3,416.7 L121.9,411.3 Z" fill="#39414f"/><path d="M110.2,417.1 L121.1,423.4 L121.1,394.9 L110.2,388.6 L110.2,417.1 Z" fill="#4f82ab"/><path d="M121.1,423.4 L140.8,412.1 L140.8,383.5 L121.1,394.9 L121.1,423.4 Z" fill="#70a4cb"/><path d="M110.2,388.6 L129.9,377.2 L140.8,383.5 L121.1,394.9 L110.2,388.6 Z" fill="#9ec7e9"/><path d="M122.8,386.2 C127.1,386.2 130.6,382.7 130.6,378.4 C130.6,374.1 127.1,370.6 122.8,370.6 C118.4,370.6 115.0,374.1 115.0,378.4 C115.0,382.7 118.4,386.2 122.8,386.2 Z" fill="#f0c39b"/><path d="M115.0,377.4 L115.0,377.3 L115.0,377.2 L115.0,377.0 L115.0,376.9 L115.1,376.8 L115.1,376.6 L115.1,376.5 L115.2,376.4 L115.2,376.2 L115.2,376.1 L115.3,376.0 L115.3,375.8 L115.4,375.7 L115.4,375.6 L115.4,375.4 L115.5,375.3 L115.5,375.2 L115.6,375.1 L115.7,375.0 L115.7,374.8 L115.8,374.7 L115.8,374.6 L115.9,374.5 L116.0,374.3 L116.1,374.2 L116.1,374.1 L116.2,374.0 L116.3,373.9 L116.4,373.8 L116.4,373.7 L116.5,373.6 L116.6,373.5 L116.7,373.3 L116.8,373.2 L116.9,373.1 L117.0,373.0 L117.0,372.9 L117.1,372.8 L117.2,372.7 L117.3,372.7 L117.4,372.6 L117.5,372.5 L117.6,372.4 L117.7,372.3 L117.8,372.2 L118.0,372.1 L118.1,372.0 L118.2,372.0 L118.3,371.9 L118.4,371.8 L118.5,371.7 L118.6,371.7 L118.7,371.6 L118.9,371.5 L119.0,371.5 L119.1,371.4 L119.2,371.3 L119.3,371.3 L119.5,371.2 L119.6,371.2 L119.7,371.1 L119.8,371.1 L120.0,371.0 L120.1,371.0 L120.2,370.9 L120.4,370.9 L120.5,370.8 L120.6,370.8 L120.7,370.8 L120.9,370.7 L121.0,370.7 L121.1,370.7 L121.3,370.6 L121.4,370.6 L121.5,370.6 L121.7,370.6 L121.8,370.6 L122.0,370.5 L122.1,370.5 L122.2,370.5 L122.4,370.5 L122.5,370.5 L122.6,370.5 L122.8,370.5 L122.9,370.5 L123.0,370.5 L123.2,370.5 L123.3,370.5 L123.4,370.5 L123.6,370.6 L123.7,370.6 L123.9,370.6 L124.0,370.6 L124.1,370.6 L124.3,370.7 L124.4,370.7 L124.5,370.7 L124.7,370.8 L124.8,370.8 L124.9,370.8 L125.0,370.9 L125.2,370.9 L125.3,371.0 L125.4,371.0 L125.6,371.0 L125.7,371.1 L125.8,371.2 L125.9,371.2 L126.1,371.3 L126.2,371.3 L126.3,371.4 L126.4,371.5 L126.5,371.5 L126.7,371.6 L126.8,371.7 L126.9,371.7 L127.0,371.8 L127.1,371.9 L127.2,372.0 L127.3,372.0 L127.5,372.1 L127.6,372.2 L127.7,372.3 L127.8,372.4 L127.9,372.5 L128.0,372.6 L128.1,372.6 L128.2,372.7 L128.3,372.8 L128.4,372.9 L128.5,373.0 L128.5,373.1 L128.6,373.2 L128.7,373.3 L128.8,373.5 L128.9,373.6 L129.0,373.7 L129.1,373.8 L129.1,373.9 L129.2,374.0 L129.3,374.1 L129.4,374.2 L129.4,374.3 L129.5,374.5 L129.6,374.6 L129.6,374.7 L129.7,374.8 L129.7,374.9 L129.8,375.1 L129.9,375.2 L129.9,375.3 L130.0,375.4 L130.0,375.6 L130.1,375.7 L130.1,375.8 L130.1,376.0 L130.2,376.1 L130.2,376.2 L130.3,376.4 L130.3,376.5 L130.3,376.6 L130.3,376.8 L130.4,376.9 L130.4,377.0 L130.4,377.2 L130.4,377.3 L130.5,377.4 L115.0,377.4 Z" fill="#3e4657"/><path d="M96.8,413.7 L99.9,418.0 L121.1,394.9 L110.2,388.6 L96.8,413.7 Z" fill="#1c6f9d"/>`;

type Geo = { u: number; wb: number };
type Pt = [number, number];
type Shape = { d: string; fill: string; opacity?: number };

function pt(g: Geo, a: number, b: number, z: number): Pt {
  return [OX + g.u * C30 * (a + b), OY + g.u * S30 * (b - a) - g.u * z];
}

function shape(points: Pt[], fill: string, opacity?: number): Shape {
  return { d: 'M' + points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L') + ' Z', fill, opacity };
}

function boxShapes(
  g: Geo,
  a0: number,
  b0: number,
  z0: number,
  da: number,
  db: number,
  dz: number,
  top: string,
  front: string,
  left: string
): Shape[] {
  return [
    shape([pt(g, a0, b0, z0), pt(g, a0, b0 + db, z0), pt(g, a0, b0 + db, z0 + dz), pt(g, a0, b0, z0 + dz)], left),
    shape(
      [pt(g, a0, b0 + db, z0), pt(g, a0 + da, b0 + db, z0), pt(g, a0 + da, b0 + db, z0 + dz), pt(g, a0, b0 + db, z0 + dz)],
      front
    ),
    shape(
      [pt(g, a0, b0, z0 + dz), pt(g, a0 + da, b0, z0 + dz), pt(g, a0 + da, b0 + db, z0 + dz), pt(g, a0, b0 + db, z0 + dz)],
      top
    ),
  ];
}

function pileShapes(g: Geo, a0: number, b0: number, z0: number, da: number, db: number, dz: number, bars: boolean): Shape[] {
  const out = boxShapes(g, a0, b0, z0, da, db, dz, PAPER, PSIDE, PEDGE);
  if (bars) {
    const zt = z0 + dz;
    out.push(
      shape(
        [pt(g, a0 + 0.18, b0 + 0.18, zt + 0.01), pt(g, a0 + da - 0.18, b0 + 0.18, zt + 0.01), pt(g, a0 + da - 0.18, b0 + 0.3, zt + 0.01), pt(g, a0 + 0.18, b0 + 0.3, zt + 0.01)],
        '#70a4cb'
      ),
      shape(
        [pt(g, a0 + 0.18, b0 + 0.42, zt + 0.01), pt(g, a0 + da - 0.18, b0 + 0.42, zt + 0.01), pt(g, a0 + da - 0.18, b0 + 0.54, zt + 0.01), pt(g, a0 + 0.18, b0 + 0.54, zt + 0.01)],
        '#f9438a'
      )
    );
  }
  return out;
}

function Paths({ shapes }: { shapes: Shape[] }) {
  return (
    <>
      {shapes.map((s, i) => (
        <path key={i} d={s.d} fill={s.fill} opacity={s.opacity} />
      ))}
    </>
  );
}

function Drum({ g, ac, zc, R }: { g: Geo; ac: number; zc: number; R: number }) {
  const [cx, cy] = pt(g, ac, g.wb, zc);
  const m = `matrix(${(C30 * g.u * R).toFixed(3)},${(-S30 * g.u * R).toFixed(3)},0,${(-g.u * R).toFixed(3)},${cx.toFixed(2)},${cy.toFixed(2)})`;
  return (
    <g transform={m}>
      <circle r="1" fill={SR} />
      <circle r="0.86" fill={SF} />
      <circle cx="-0.26" cy="-0.24" r="0.42" fill={SHI} opacity="0.55" />
      <circle r="0.3" fill={SHU} />
      <g className="ps-spin">
        <circle cx="0.6" cy="0" r="0.13" fill="#586278" />
      </g>
    </g>
  );
}

export function PressSchematic({ format, colorCount }: { format: PressFormat; colorCount: PressColorCount }) {
  const [geo, setGeo] = useState<Geo>({ u: BASE_U * FORMAT_GEO[format].size, wb: BASE_WB * FORMAT_GEO[format].width });
  const geoRef = useRef(geo);
  geoRef.current = geo;
  const raf = useRef<number | undefined>(undefined);
  const firstRender = useRef(true);

  // Tween the real geometry on format change (crisp redraw, no scale blur).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const from = { ...geoRef.current };
    const to = { u: BASE_U * FORMAT_GEO[format].size, wb: BASE_WB * FORMAT_GEO[format].width };
    const t0 = performance.now();
    if (raf.current !== undefined) cancelAnimationFrame(raf.current);
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 480);
      const e = 1 - Math.pow(1 - k, 3);
      setGeo({ u: from.u + (to.u - from.u) * e, wb: from.wb + (to.wb - from.wb) * e });
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current !== undefined) cancelAnimationFrame(raf.current);
    };
  }, [format]);

  // Towers added since the previous render slide in one by one.
  const prevColors = useRef<number>(colorCount);
  const enterFrom = colorCount > prevColors.current ? prevColors.current : null;
  useEffect(() => {
    prevColors.current = colorCount;
  }, [colorCount]);

  const g = geo;
  const wb = g.wb;
  const n = colorCount;
  const aLast = (n - 1) * PITCH;
  const aMax = aLast + TD + 1.7;

  const ground: Shape[] = [
    shape([pt(g, -4.3, wb + 1.4, 0), pt(g, aMax + 0.2, wb + 1.4, 0), pt(g, aMax + 0.5, -0.5, 0), pt(g, -4.0, -0.9, 0)], SHADOW, 0.5),
    ...boxShapes(g, -0.5, 0.12, -0.12, aLast + TD + 0.5, wb - 0.24, 0.3, BT, BF, BS),
    ...boxShapes(g, -0.5, 0.12, -0.12, aLast + TD + 0.5, 0.16, 0.3, BT, BF, BS),
  ];

  const aFeeder = aLast + TD + 0.45;
  const feeder: Shape[] = [
    ...boxShapes(g, aFeeder, 0.1, BASE, 1.15, wb - 0.2, 1.5, GT, GF, GS),
    ...pileShapes(g, aFeeder - 0.45, 0.35, BASE, 0.55, wb - 0.7, 0.62, false),
  ];

  const delivery: Shape[] = [
    ...boxShapes(g, -1.6, 0.1, BASE, 1.15, wb - 0.2, 1.05, GT, GF, GS),
    ...pileShapes(g, -1.4, 0.32, BASE + 1.05, 0.8, wb - 0.64, 0.5, true),
  ];

  // Far-to-near so nearer towers paint over farther ones.
  const towerIndices: number[] = [];
  for (let i = n - 1; i >= 0; i--) towerIndices.push(i);

  return (
    <svg className="press-schematic" viewBox="0 0 1140 560">
      <Paths shapes={ground} />
      <Paths shapes={feeder} />
      {towerIndices.map((i) => {
        const a0 = i * PITCH;
        const [top, front, side] = INKS[i];
        const entering = enterFrom !== null && i >= enterFrom;
        return (
          <g
            key={`tower-${i}`}
            className={`ps-tower${entering ? ' is-enter' : ''}`}
            style={entering ? { animationDelay: `${(i - (enterFrom as number)) * 120}ms` } : undefined}
          >
            <Paths shapes={boxShapes(g, a0, 0, BASE, TD, wb, HZ - BASE, top, front, side)} />
            <Drum g={g} ac={a0 + TD / 2} zc={0.74} R={0.34} />
            <Drum g={g} ac={a0 + TD / 2} zc={1.5} R={0.27} />
            <Paths shapes={boxShapes(g, a0 + 0.18, 0.46, HZ, 0.5, wb - 0.92, 0.16, SF, '#9aa3b4', '#9aa3b4')} />
          </g>
        );
      })}
      <Paths shapes={delivery} />
      {/* Static, trusted artwork string (no user input). */}
      <g dangerouslySetInnerHTML={{ __html: STATION_PATHS }} />
    </svg>
  );
}
