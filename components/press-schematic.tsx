'use client';

import { useEffect, useRef } from 'react';

export type PressFormat = 'b2' | 'b1' | 'vlf';

// Format drives the dimetric scale (s) and the press width/depth (w). Changing
// format tweens U / WB so the press *widens* crisply (no CSS-scale blur), and
// the operator console scales with it.
const BASE_U = 42;
const BASE_WB = 1.7;
const PRESS_FMT: Record<PressFormat, { w: number; s: number }> = {
  b2: { w: 0.86, s: 0.92 },
  b1: { w: 1, s: 1 },
  vlf: { w: 1.5, s: 1.13 },
};

// Dimetric (30°) projection anchored so the press block sits centre-right and
// the console hugs its left edge. Feeder (paper in) is on the right, delivery
// (good sheets out) on the left — matching a sheetfed offset line seen head-on.
const OX = 505;
const OY = 372;
const C30 = Math.cos(Math.PI / 6);
const S30 = Math.sin(Math.PI / 6);
const PITCH = 1.32; // spacing between printing units (each color is a tower)
const TD = 0.86; // tower depth along the press axis
const HZ = 2.4; // tower height
const BASE = 0.16; // base rail height

// Palette: base rail, frame, ink towers (top / front / side faces), drums.
const BT = '#39414f';
const BF = '#2b313d';
const BS = '#222732';
const GT = '#aab3c3';
const GF = '#828ca0';
const GS = '#5f6878';
const SR = '#566076';
const SF = '#c7cdd9';
const SH = '#e9ecf2';
const SHU = '#6b7587';
const SSIDE = '#dfe4ec';
const SEDGE = '#c3cbd6';
const SHADOW = '#bcdcef';
const PAPER = '#fdfefe';

const INK3: Record<string, [string, string, string]> = {
  C: ['#9ec7e9', '#70a4cb', '#4f82ab'],
  M: ['#fb6ba4', '#f9438a', '#cf2f6c'],
  Y: ['#ffe06b', '#fdd637', '#e3b81f'],
  K: ['#525c70', '#3e4657', '#2b313d'],
  O: ['#f9b96d', '#f59a2e', '#d2781a'],
  G: ['#69cf95', '#34b06e', '#239256'],
  V: ['#b486d0', '#9159b5', '#6f3d92'],
  '+': ['#dde2ea', '#b8c0cf', '#99a3b5'],
};
const ORDER = ['C', 'M', 'Y', 'K', 'O', 'G', 'V', '+'];

// Operator console + screen + proof + standing operator, exported as a static
// vector (built from the client's reference). Anchored at its ground point so
// it scales in place with the press.
const ST_AX = 85;
const ST_AY = 452;
const STATION_BLOB = `<g id="console-station"><path d="M24.9,416.3 L32.1,420.5 L32.1,339.9 L24.9,335.7 L24.9,416.3 Z" fill="#222732"/><path d="M32.1,420.5 L92.1,385.9 L92.1,305.2 L32.1,339.9 L32.1,420.5 Z" fill="#2b313d"/><path d="M24.9,335.7 L84.9,301.0 L92.1,305.2 L32.1,339.9 L24.9,335.7 Z" fill="#39414f"/><path d="M32.1,420.4 L82.4,450.2 L82.4,415.8 L32.1,386.1 L32.1,420.4 Z" fill="#5f6878"/><path d="M82.4,450.2 L136.8,419.7 L136.8,387.0 L82.4,417.4 L82.4,450.2 Z" fill="#828ca0"/><path d="M35.0,389.1 L87.7,358.6 L136.8,387.0 L84.1,417.4 L35.0,389.1 Z" fill="#aab3c3"/><path d="M32.1,389.1 L84.1,419.1 L84.1,416.2 L32.1,386.1 L32.1,389.1 Z" fill="#828ca0"/><path d="M84.1,419.1 L144.2,385.0 L144.2,382.0 L84.1,416.2 L84.1,419.1 Z" fill="#aab3c3"/><path d="M32.1,386.1 L91.5,354.2 L144.2,382.0 L84.1,416.2 L32.1,386.1 Z" fill="#e6e9f0"/><path d="M53.2,385.7 L87.7,365.8 L116.8,382.6 L82.3,402.5 L53.2,385.7 Z" fill="#fdfefe"/><path d="M61.5,386.1 L88.8,370.4 L93.9,373.3 L66.6,389.1 L61.5,386.1 Z" fill="#70a4cb"/><path d="M69.6,390.7 L96.8,375.0 L101.9,377.9 L74.6,393.7 L69.6,390.7 Z" fill="#f9438a"/><path d="M77.6,395.4 L91.0,387.6 L96.8,391.0 L83.4,398.7 L77.6,395.4 Z" fill="#34b06e"/><path d="M93.2,386.3 L104.8,379.6 L110.7,383.0 L99.0,389.7 L93.2,386.3 Z" fill="#fdd637"/><path d="M92.0,363.6 L93.3,365.6 L104.2,350.8 L102.9,348.8 L92.0,363.6 Z" fill="#66646e"/><path d="M93.3,365.6 L95.6,366.2 L106.5,351.4 L104.2,350.8 L93.3,365.6 Z" fill="#363844"/><path d="M102.9,348.8 L105.2,349.4 L106.5,351.4 L104.2,350.8 L102.9,348.8 Z" fill="#222732"/><path d="M105.9,359.6 L105.9,363.1 L115.0,359.9 L120.8,357.8 L120.8,341.1 L117.4,342.3 L105.9,346.3 L105.9,351.4 L105.9,359.6 M103.9,365.5 C103.9,365.5 103.9,365.4 103.9,365.4 C103.8,365.4 103.8,365.4 103.8,365.4 L103.8,364.0 L103.8,354.6 L103.8,344.6 L105.9,343.8 L120.1,338.9 L121.9,338.3 C122.0,338.2 122.1,338.2 122.2,338.2 L122.2,359.1 L115.4,361.4 L103.9,365.5 Z" fill="#2b313d"/><path d="M122.2,338.2 C122.1,338.2 122.0,338.2 121.9,338.3 L120.1,338.9 L105.9,343.8 L103.8,344.6 L101.9,342.8 C101.8,342.7 101.7,342.6 101.6,342.5 C101.6,342.4 101.7,342.4 101.8,342.4 L105.4,341.1 L114.7,337.9 L120.1,336.1 L122.2,338.2 Z" fill="#39414f"/><path d="M103.8,344.6 L103.8,354.6 L103.8,364.0 L103.8,365.4 C103.8,365.4 103.8,365.4 103.9,365.4 C103.9,365.4 103.9,365.5 103.9,365.5 L103.7,365.5 L101.6,363.5 L101.6,342.5 C101.7,342.6 101.8,342.7 101.9,342.8 L103.8,344.6 Z" fill="#222732"/><path d="M105.9,359.6 L105.9,351.4 L105.9,346.3 L117.4,342.3 L120.8,341.1 L120.8,357.8 L115.0,359.9 L105.9,363.1 L105.9,359.6 Z" fill="#9ec7e9"/><path d="M113.5,448.9 L123.0,454.3 L123.0,421.6 L113.5,416.1 L113.5,448.9 Z" fill="#222732"/><path d="M123.0,454.3 L129.1,450.7 L129.1,418.0 L123.0,421.6 L123.0,454.3 Z" fill="#2b313d"/><path d="M113.5,416.1 L119.7,412.5 L129.1,418.0 L123.0,421.6 L113.5,416.1 Z" fill="#39414f"/><path d="M121.9,444.0 L131.3,449.5 L131.3,416.7 L121.9,411.3 L121.9,444.0 Z" fill="#222732"/><path d="M131.3,449.5 L137.5,445.9 L137.5,413.2 L131.3,416.7 L131.3,449.5 Z" fill="#2b313d"/><path d="M121.9,411.3 L128.0,407.7 L137.5,413.2 L131.3,416.7 L121.9,411.3 Z" fill="#39414f"/><path d="M110.2,417.1 L121.1,423.4 L121.1,394.9 L110.2,388.6 L110.2,417.1 Z" fill="#4f82ab"/><path d="M121.1,423.4 L140.8,412.1 L140.8,383.5 L121.1,394.9 L121.1,423.4 Z" fill="#70a4cb"/><path d="M110.2,388.6 L129.9,377.2 L140.8,383.5 L121.1,394.9 L110.2,388.6 Z" fill="#9ec7e9"/><path d="M122.8,386.2 C127.1,386.2 130.6,382.7 130.6,378.4 C130.6,374.1 127.1,370.6 122.8,370.6 C118.4,370.6 115.0,374.1 115.0,378.4 C115.0,382.7 118.4,386.2 122.8,386.2 Z" fill="#f0c39b"/><path d="M115.0,377.4 L115.0,377.3 L115.0,377.2 L115.0,377.0 L115.0,376.9 L115.1,376.8 L115.1,376.6 L115.1,376.5 L115.2,376.4 L115.2,376.2 L115.2,376.1 L115.3,376.0 L115.3,375.8 L115.4,375.7 L115.4,375.6 L115.4,375.4 L115.5,375.3 L115.5,375.2 L115.6,375.1 L115.7,375.0 L115.7,374.8 L115.8,374.7 L115.8,374.6 L115.9,374.5 L116.0,374.3 L116.1,374.2 L116.1,374.1 L116.2,374.0 L116.3,373.9 L116.4,373.8 L116.4,373.7 L116.5,373.6 L116.6,373.5 L116.7,373.3 L116.8,373.2 L116.9,373.1 L117.0,373.0 L117.0,372.9 L117.1,372.8 L117.2,372.7 L117.3,372.7 L117.4,372.6 L117.5,372.5 L117.6,372.4 L117.7,372.3 L117.8,372.2 L118.0,372.1 L118.1,372.0 L118.2,372.0 L118.3,371.9 L118.4,371.8 L118.5,371.7 L118.6,371.7 L118.7,371.6 L118.9,371.5 L119.0,371.5 L119.1,371.4 L119.2,371.3 L119.3,371.3 L119.5,371.2 L119.6,371.2 L119.7,371.1 L119.8,371.1 L120.0,371.0 L120.1,371.0 L120.2,370.9 L120.4,370.9 L120.5,370.8 L120.6,370.8 L120.7,370.8 L120.9,370.7 L121.0,370.7 L121.1,370.7 L121.3,370.6 L121.4,370.6 L121.5,370.6 L121.7,370.6 L121.8,370.6 L122.0,370.5 L122.1,370.5 L122.2,370.5 L122.4,370.5 L122.5,370.5 L122.6,370.5 L122.8,370.5 L122.9,370.5 L123.0,370.5 L123.2,370.5 L123.3,370.5 L123.4,370.5 L123.6,370.6 L123.7,370.6 L123.9,370.6 L124.0,370.6 L124.1,370.6 L124.3,370.7 L124.4,370.7 L124.5,370.7 L124.7,370.8 L124.8,370.8 L124.9,370.8 L125.0,370.9 L125.2,370.9 L125.3,371.0 L125.4,371.0 L125.6,371.0 L125.7,371.1 L125.8,371.2 L125.9,371.2 L126.1,371.3 L126.2,371.3 L126.3,371.4 L126.4,371.5 L126.5,371.5 L126.7,371.6 L126.8,371.7 L126.9,371.7 L127.0,371.8 L127.1,371.9 L127.2,372.0 L127.3,372.0 L127.5,372.1 L127.6,372.2 L127.7,372.3 L127.8,372.4 L127.9,372.5 L128.0,372.6 L128.1,372.6 L128.2,372.7 L128.3,372.8 L128.4,372.9 L128.5,373.0 L128.5,373.1 L128.6,373.2 L128.7,373.3 L128.8,373.5 L128.9,373.6 L129.0,373.7 L129.1,373.8 L129.1,373.9 L129.2,374.0 L129.3,374.1 L129.4,374.2 L129.4,374.3 L129.5,374.5 L129.6,374.6 L129.6,374.7 L129.7,374.8 L129.7,374.9 L129.8,375.1 L129.9,375.2 L129.9,375.3 L130.0,375.4 L130.0,375.6 L130.1,375.7 L130.1,375.8 L130.1,376.0 L130.2,376.1 L130.2,376.2 L130.3,376.4 L130.3,376.5 L130.3,376.6 L130.3,376.8 L130.4,376.9 L130.4,377.0 L130.4,377.2 L130.4,377.3 L130.5,377.4 L115.0,377.4 Z" fill="#3e4657"/><path d="M96.8,413.7 L99.9,418.0 L121.1,394.9 L110.2,388.6 L96.8,413.7 Z" fill="#1c6f9d"/></g>`;

type Pt = [number, number];

// Geometry factory bound to a given scale (U) and depth (WB). Recreated per
// draw — cheap, and keeps the projection free of shared mutable state.
function makeGeo(U: number, WB: number) {
  const P = (a: number, b: number, z: number): Pt => [OX + U * C30 * (a + b), OY + U * S30 * (b - a) - U * z];
  const pl = (p: Pt[], f: string, o?: number) =>
    `<path d="M${p.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' L')} Z" fill="${f}"${
      o !== undefined ? ` opacity="${o}"` : ''
    }/>`;
  const bx = (a0: number, b0: number, z0: number, da: number, db: number, dz: number, t: string, f: string, l: string) => {
    const left: Pt[] = [P(a0, b0, z0), P(a0, b0 + db, z0), P(a0, b0 + db, z0 + dz), P(a0, b0, z0 + dz)];
    const front: Pt[] = [P(a0, b0 + db, z0), P(a0 + da, b0 + db, z0), P(a0 + da, b0 + db, z0 + dz), P(a0, b0 + db, z0 + dz)];
    const top: Pt[] = [P(a0, b0, z0 + dz), P(a0 + da, b0, z0 + dz), P(a0 + da, b0 + db, z0 + dz), P(a0, b0 + db, z0 + dz)];
    return pl(left, l) + pl(front, f) + pl(top, t);
  };
  // A rotating offset cylinder: the matrix maps a unit circle to the iso
  // ellipse at the drum centre, and the inner <g> rotates around its own
  // local origin (the centre) — so the spin marker stays put, no swept arcs.
  const drum = (ac: number, zc: number, R: number) => {
    const [cx, cy] = P(ac, WB, zc);
    const m = `matrix(${(C30 * U * R).toFixed(3)},${(-S30 * U * R).toFixed(3)},0,${(-U * R).toFixed(3)},${cx.toFixed(
      2
    )},${cy.toFixed(2)})`;
    return (
      `<g transform="${m}"><circle r="1" fill="${SR}"/><circle r="0.86" fill="${SF}"/><circle cx="-0.26" cy="-0.24" r="0.42" fill="${SH}" opacity="0.55"/><circle r="0.3" fill="${SHU}"/>` +
      `<g><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="-360 0 0" dur="2.8s" repeatCount="indefinite"/><circle cx="0.6" cy="0" r="0.13" fill="#586278"/></g></g>`
    );
  };
  // A single printing unit (one color): the colored tower + two drums + a small
  // top deck.
  const unit = (a0: number, ink: string) => {
    const [t, f, s] = INK3[ink] ?? INK3['+'];
    const ac = a0 + TD / 2;
    return (
      bx(a0, 0, BASE, TD, WB, HZ - BASE, t, f, s) +
      drum(ac, 0.74, 0.34) +
      drum(ac, 1.5, 0.27) +
      bx(a0 + 0.18, 0.46, HZ, 0.5, WB - 0.92, 0.16, SF, '#9aa3b4', '#9aa3b4')
    );
  };
  const pileM = (a0: number, b0: number, z0: number, da: number, db: number, dz: number, bars: boolean) => {
    let g = bx(a0, b0, z0, da, db, dz, PAPER, SSIDE, SEDGE);
    if (bars) {
      const zt = z0 + dz;
      g += pl(
        [
          P(a0 + 0.18, b0 + 0.18, zt + 0.01),
          P(a0 + da - 0.18, b0 + 0.18, zt + 0.01),
          P(a0 + da - 0.18, b0 + 0.3, zt + 0.01),
          P(a0 + 0.18, b0 + 0.3, zt + 0.01),
        ],
        '#70a4cb'
      );
      g += pl(
        [
          P(a0 + 0.18, b0 + 0.42, zt + 0.01),
          P(a0 + da - 0.18, b0 + 0.42, zt + 0.01),
          P(a0 + da - 0.18, b0 + 0.54, zt + 0.01),
          P(a0 + 0.18, b0 + 0.54, zt + 0.01),
        ],
        '#f9438a'
      );
    }
    return g;
  };
  // The full line: floor shadow, base rail, feeder (right), the N color towers,
  // delivery pile (left), then the console scaled in place with the press.
  const buildPress = (n: number) => {
    const count = Math.max(4, Math.min(8, n));
    const aLast = (count - 1) * PITCH;
    const aMax = aLast + TD + 1.7;
    let g = pl([P(-4.3, WB + 1.4, 0), P(aMax + 0.2, WB + 1.4, 0), P(aMax + 0.5, -0.5, 0), P(-4.0, -0.9, 0)], SHADOW, 0.5);
    g += bx(-0.5, 0.12, -0.12, aLast + TD + 0.5, WB - 0.24, 0.3, BT, BF, BS) + bx(-0.5, 0.12, -0.12, aLast + TD + 0.5, 0.16, 0.3, BT, BF, BS);
    const aF = aLast + TD + 0.45;
    g += bx(aF, 0.1, BASE, 1.15, WB - 0.2, 1.5, GT, GF, GS) + pileM(aF - 0.45, 0.35, BASE, 0.55, WB - 0.7, 0.62, false);
    for (let i = count - 1; i >= 0; i--) g += `<g class="roi-tower" id="t${i}">${unit(i * PITCH, ORDER[i])}</g>`;
    g += bx(-1.6, 0.1, BASE, 1.15, WB - 0.2, 1.05, GT, GF, GS) + pileM(-1.4, 0.32, BASE + 1.05, 0.8, WB - 0.64, 0.5, true);
    const s = U / BASE_U;
    g += `<g transform="translate(${(255 + ST_AX * (1 - s)).toFixed(1)},${(ST_AY * (1 - s)).toFixed(1)}) scale(${s.toFixed(
      4
    )})">${STATION_BLOB}</g>`;
    return g;
  };
  return { unit, buildPress };
}

const SVGNS = 'http://www.w3.org/2000/svg';

type Props = {
  format: PressFormat;
  colors: number;
  label?: string;
};

export function PressSchematic({ format, colors, label }: Props) {
  const gRef = useRef<SVGGElement | null>(null);
  const uRef = useRef(BASE_U * PRESS_FMT[format].s);
  const wbRef = useRef(BASE_WB * PRESS_FMT[format].w);
  const colorsRef = useRef(colors);
  const prevColors = useRef(colors);
  const rafRef = useRef<number | null>(null);
  const didMountFormat = useRef(false);

  colorsRef.current = colors;

  // Color changes: redraw, then slide the added towers in (or the removed ones
  // out) one by one. The rest of the line — console, delivery, existing towers
  // — stays put; only the far-right towers and the feeder shift.
  useEffect(() => {
    const g = gRef.current;
    if (!g) return;
    const prev = prevColors.current;
    g.innerHTML = makeGeo(uRef.current, wbRef.current).buildPress(colors);

    if (colors > prev) {
      for (let i = prev; i < colors; i++) {
        const el = g.querySelector<SVGGElement>(`#t${i}`);
        if (el) {
          el.style.animationDelay = `${(i - prev) * 120}ms`;
          el.classList.add('enter');
        }
      }
    } else if (colors < prev) {
      const geo = makeGeo(uRef.current, wbRef.current);
      for (let i = prev - 1; i >= colors; i--) {
        const ghost = document.createElementNS(SVGNS, 'g') as SVGGElement;
        ghost.setAttribute('class', 'roi-tower exit');
        ghost.innerHTML = geo.unit(i * PITCH, ORDER[i]);
        ghost.style.animationDelay = `${(prev - 1 - i) * 120}ms`;
        g.appendChild(ghost);
        ghost.addEventListener('animationend', () => ghost.remove());
      }
    }
    prevColors.current = colors;
  }, [colors]);

  // Format changes: tween U / WB so the press widens crisply (the geometry is
  // re-emitted each frame), and redraw with the current color count.
  useEffect(() => {
    if (!didMountFormat.current) {
      didMountFormat.current = true;
      return;
    }
    const targetU = BASE_U * PRESS_FMT[format].s;
    const targetW = BASE_WB * PRESS_FMT[format].w;
    const startU = uRef.current;
    const startW = wbRef.current;
    const t0 = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const frame = (t: number) => {
      const k = Math.min(1, (t - t0) / 480);
      const e = 1 - Math.pow(1 - k, 3);
      uRef.current = startU + (targetU - startU) * e;
      wbRef.current = startW + (targetW - startW) * e;
      if (gRef.current) gRef.current.innerHTML = makeGeo(uRef.current, wbRef.current).buildPress(colorsRef.current);
      if (k < 1) rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [format]);

  return (
    <svg className="roi-press-svg" viewBox="0 0 1140 560" role="img" aria-label={label ?? 'Offset press'}>
      <g ref={gRef} />
    </svg>
  );
}
