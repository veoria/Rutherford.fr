// ColorLoop home v3 (7 Oct 2026): explanatory motion driven by the scroll position. Native scrolling only: no wheel or touch
// listeners, no scroll-snap; the scroll position is only read (ColorLoopStory.go, a review hook, is the one exception).
// The default CSS is the static version; the live layout needs motion allowed, Pause animations off and a viewport at least
// 561 px tall (home-story.css decides it at first paint, live() below mirrors it). Scenes: the ring (#look-closer), the story
// stage (#overview), what it saves (#savings), the console check (#check). Each frame reads scrollY once, then writes
// transforms, opacity, canvas pixels, text and classes only. Reviewers: ?static, ?story=story|savings|check&t=VALUE, ?calibrate.
(() => {
'use strict';
const D = document, root = D.documentElement, Q = new URLSearchParams(location.search);
const $ = (s, r = D) => r.querySelector(s), $$ = (s, r = D) => [...r.querySelectorAll(s)];
root.classList.add('hs-js');
if (Q.has('static')) root.classList.add('hs-static');

// ---------- helpers (easings from the hero film, hero.js) ----------
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), P = (t, a, d) => cl((t - a) / d), lerp = (a, b, k) => a + (b - a) * k;
const E = {
  out: x => 1 - (1 - x) ** 3, in: x => x * x * x, in2: x => x * x,
  inOut: x => x < .5 ? 4 * x * x * x : 1 - (2 - 2 * x) ** 3 / 2,
  back: x => { const c = 1.9; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2; },
};
const ss = (a, b, x) => { const k = cl((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const rr = (p, x, y, w, h, r) => {   // rounded rectangle on a Path2D or a 2D context (arcTo fallback)
  if (p.roundRect) return p.roundRect(x, y, w, h, r);
  const [a, b, c, d] = Array.isArray(r) ? r : [r, r, r, r];
  p.moveTo(x + a, y); p.arcTo(x + w, y, x + w, y + h, b); p.arcTo(x + w, y + h, x, y + h, c); p.arcTo(x, y + h, x, y, d); p.arcTo(x, y, x + w, y, a); p.closePath();
};
const cache = new WeakMap();
const css = (el, k, v) => {   // writes a style only when its value changes
  let c = cache.get(el); if (!c) cache.set(el, c = {});
  if (c[k] === v) return; c[k] = v;
  if (k[0] === '-') el.style.setProperty(k, v); else el.style[k] = v;
};
const f3 = x => (Math.round(x * 1000) / 1000).toString();
const idle = () => new Promise(r => window.requestIdleCallback ? requestIdleCallback(() => r(), { timeout: 500 }) : setTimeout(r, 1));
const dev = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);

// ---------- motion policy: the same condition as the live block of home-story.css ----------
const MQ = matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 561px)'), WIDE = matchMedia('(min-width: 1024px)');
const NEST = !!(window.CSS && CSS.supports('selector(&)'));   // the live block of home-story.css uses CSS nesting
const live = () => NEST && MQ.matches && root.dataset.motion !== 'paused' && !root.classList.contains('hs-static');

// ---------- driver ----------
const probe = D.createElement('i');   // 100svh: the iOS toolbar never shifts the mapping
probe.style.cssText = 'position:absolute;left:0;top:0;width:0;height:100svh;visibility:hidden;pointer-events:none';
D.body.appendChild(probe);
let vh = innerHeight, wide = WIDE.matches, isLive = live(), raf = 0, last = 0, pinned = false;
const scenes = [], byId = {}, dpr = () => Math.min(devicePixelRatio || 1, 2);
const docTop = el => el.getBoundingClientRect().top + scrollY;
function geometry() { vh = probe.offsetHeight || innerHeight; wide = WIDE.matches; scenes.forEach(s => { if (s.ready) { s.measure(); s.drawn = null; if (!isLive) s.still(); } }); kick(); }
function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
function frame(now) {
  raf = 0;
  const dt = Math.min(64, now - last), y = scrollY; last = now;
  let moving = false, pin = false;
  if (isLive) for (const s of scenes) {
    if (!s.ready) continue;
    if (s.pin && s.pin(y)) pin = true;
    if (!s.on) continue;
    const t = s.value(y), d = t - s.shown;
    if (s.shown == null || Math.abs(d) > .6 || s.key === 'story') s.shown = t; else s.shown += d * (1 - Math.exp(-dt / 90));
    if (Math.abs(t - s.shown) < 5e-4) s.shown = t; else moving = true;
    if (s.playing && s.playing()) moving = true;
    if (s.shown !== s.drawn) { s.drawn = s.shown; s.render(s.shown); }
  }
  if (pin !== pinned) { pinned = pin; root.toggleAttribute('data-hs-pinned', pin); }
  if (!isLive) staticKeep = nearest();
  if (moving && !D.hidden) raf = requestAnimationFrame(frame);
}
function start(s) {
  return s.started || (s.started = Promise.resolve().then(() => s.init()).then(() => {
    s.ready = true; s.measure(); if (!isLive) s.still(); kick();
  }).catch(e => { if (dev) console.warn('home-story', s.key, e); }));
}
function register(s) { if (!s) return; Object.assign(s, { on: false, ready: false, shown: null, drawn: null }); scenes.push(s); byId[s.key] = s; s.sec.__hs = s; }
// the element to keep in view when the layout switches (pause toggle, reduced motion, resize)
// (the pause toggle switches the CSS first, so the static layout's beat is recorded while scrolling, not at the switch)
let staticKeep = null;
function nearest() {
  for (const s of scenes) {
    if (!s.ready || !s.beats) continue;
    const r = s.sec.getBoundingClientRect();
    if (r.top > innerHeight / 2 || r.bottom < innerHeight / 2) continue;
    let best = null, bd = 1e9;
    s.beats.forEach(b => { const q = b.getBoundingClientRect(), d = Math.abs(q.top + q.height / 2 - innerHeight / 2); if (d < bd) { bd = d; best = b; } });
    return best;
  }
  return null;
}
function keeper() {
  if (!isLive) return staticKeep;
  for (const s of scenes) {
    if (!s.ready || !s.beats || s.shown == null) continue;
    const r = s.sec.getBoundingClientRect();
    if (r.top < innerHeight / 2 && r.bottom > innerHeight / 2) return s.current();
  }
  return null;
}
function policy() {
  const now = live(); if (now === isLive) return kick();
  const keep = keeper();
  isLive = now; pinned = false; root.removeAttribute('data-hs-pinned');
  requestAnimationFrame(() => {
    geometry();
    scenes.forEach(s => { s.shown = s.drawn = null; if (s.ready && !isLive) s.still(); });
    if (keep) scrollTo({ top: Math.round(docTop(keep) + keep.offsetHeight / 2 - innerHeight / 2), behavior: 'instant' });   // not scrollIntoView: it would add the beats' scroll-margin
    kick();
  });
}

// ---------- look closer: the ring is drawn by scroll in CSS; a one-shot draw where view timelines are missing ----------
(() => {
  const ring = $('#look-closer .ls-ring'); if (!ring || !('IntersectionObserver' in window)) return;
  if (!(window.CSS && CSS.supports('animation-timeline: view()'))) {
    ring.classList.add('lc-armed');
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { ring.classList.add('lc-drawn'); io.disconnect(); } }, { threshold: .35 });
    io.observe(ring);
  }
  // the five greet once when the ring reaches the middle of the screen (its words are lit by then), again after it has left the screen;
  // agents.js would greet earlier, while the arcs still draw: its greeting is held back here
  const row = $('.loop-agents', ring); if (!row) return;
  let mine = false, armed = true, timer = 0;
  new MutationObserver(() => { if (row.classList.contains('is-greeting') !== mine) row.classList.toggle('is-greeting', mine); })
    .observe(row, { attributes: true, attributeFilter: ['class'] });
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting || e.intersectionRatio < .5 || !armed || !isLive) return;
    armed = false; mine = true; row.classList.add('is-greeting');
    clearTimeout(timer); timer = setTimeout(() => { mine = false; row.classList.remove('is-greeting'); }, 1500);
  }, { rootMargin: '0px 0px -50% 0px', threshold: .5 }).observe(ring);
  new IntersectionObserver(([e]) => { if (!e.isIntersecting) armed = true; }).observe(ring);
})();

// ---------- 01 the story stage: the real screen, re-created over its own pixels ----------
register((() => {
  const sec = D.getElementById('overview'), stage = sec && $('.hs-stage', sec); if (!stage) return null;
  const track = $('.hs-track', sec), device = $('.hs-device', sec), cam = $('.hs-cam', sec), shot = $('.hs-shot', sec), cv = $('.hs-canvas', sec);
  const agent = $('.hs-agent', sec), toasts = $$('.hs-toast', sec), setup = $('.hs-setup', sec), endCard = $('.hs-end', sec);
  const beats = $$('.hs-beat', sec), rail = $$('.hs-rail a', sec), calibrate = Q.has('calibrate');
  // 21 Oct 2026 (FX, Valentina): no scroll story. Three tabs; a click plays that step on the screen (Preset 1-2, Measure 2-3,
  // Correct 3-4.5, which ends on every zone green and the operator card). The first view plays the three steps once, in order.
  const SPAN = [null, [1, 2, 3200], [2, 3, 3600], [3, 4.5, 4200]];
  const play = { step: 1, t0: 0, auto: false, started: false };
  const T0 = () => SPAN[play.step][0];
  function show(step) {
    rail.forEach((a, i) => { const on = i + 1 === step; if (a.hasAttribute('aria-current') !== on) on ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current'); });
    beats.forEach((b, k) => b.classList.toggle('is-on', k === 0 || k === step));
  }
  function go(step, auto) { play.step = step; play.t0 = performance.now(); play.auto = auto; play.started = true; show(step); kick(); }
  rail.forEach((a, i) => a.addEventListener('click', e => { e.preventDefault(); go(i + 1, false); }));
  new IntersectionObserver(([e], o) => { if (e.isIntersecting && !play.started) { o.disconnect(); go(1, true); } }, { threshold: .45 }).observe(sec);
  // geometry of the real screen, in image units (1200 x 763, measured on colorloop-m90a-gen6-camera.webp)
  const PX = z => z < 32 ? 121 + z * 30.48 : 1107, PW = z => z < 32 ? 29 : 31.5, PY = u => 150 + u * 89.8;
  const PAL = { g: [0, 173, 97], y: [249, 220, 146], r: [250, 149, 162], n: [130, 129, 129] };
  const G = '#00AD61', GB = '#004F2C', YL = '#F9DC92', YB = '#EFAE00', NEU = '#4A4542', BAND = '#3B3636';
  const UNIT = ['#C9C9CC', '#008BE3', '#D9007B', '#EACC00', '#FF8C00', '#F4B900'], INK = ['#2B2726', ...UNIT.slice(1)];
  const TABS = [[26, 149, 'Preset'], [175, 151, 'ColorLoop'], [326, 149, 'Measure']];
  // the scan is linear (a scanner moves at a constant speed): scroll and head move together, no jump mid-bar
  const sweep = (T, t0, d) => 121 + 975 * lerp(-.03, 1.03, P(T, t0, d));
  const passAt = (x, t0, d) => t0 + d * cl(((x - 121) / 975 + .03) / 1.06);
  let pills = [], nums = D.createElement('canvas'), ctx = null, head = '#1A1613', tabOn = '#F3FAFC', tabOff = '#CED5D3', Y = [], Yin = 0, trackTop = 0, stickyTop = 64, cssW = 0, anchor = 0;

  function camera(T) {   // [scale, tx, ty] in image units; the frame is 1200 x 823 (the screen plus a band for the sheet)
    let s = 1, x = 600, y = 0;
    if (wide) return [1, 0, 0];   // desktop: the device stays still, one moving element at a time
    const k1 = E.inOut(P(T, 2.12, .1)) * (1 - E.inOut(P(T, 2.82, .1))), k2 = E.inOut(P(T, 3.06, .1)) * (1 - E.inOut(P(T, 3.8, .08)));
    if (k1 > 0) { s = 1 + .6 * k1; x = sweep(T, 2.2, .6); y = 823 * (1 - s); }   // follow the scanner, sheet and rows 4 to 6 in view
    else if (k2 > 0) {   // the corrections: a lighter zoom anchored left, so the unit names (1 Black ... 6 P1375C) stay readable
      s = 1 + .35 * k2; y = cl(411.5 - 453 * s, 823 * (1 - s), 0);
      return [s, 0, y];
    }
    return [s, cl(600 - x * s, 1200 * (1 - s), 0), y];
  }
  // a zone changes state by filling bottom-up at full opacity (no see-through mix of two colors); finished, it gets its band and number
  function paint(g, p, fill, band, a, bg = true) {
    if (a <= 0) return;
    g.globalAlpha = 1;
    if (a < 1) { g.save(); g.clip(p.path); g.fillStyle = fill; g.fillRect(p.x, p.y + 69 * (1 - a), p.w, 69 * a); g.restore(); return; }
    if (bg) {
      g.fillStyle = BAND; g.fillRect(p.x - 1.2, p.y - 1, p.w + 2.4, 72.5);
      // the zone number under a painted pill loses its state color too: a neutral copy, drawn once per size (nums)
      const K = nums.width / 1200; g.drawImage(nums, (p.x - 1) * K, 0, (p.w + 2) * K, nums.height, p.x - 1, p.y + 71, p.w + 2, 10);
    }
    g.fillStyle = fill; g.fill(p.path);
    if (band) { g.fillStyle = band; g.fill(p.band); }
  }
  function draw(T) {
    // desktop: the canvas holds only the overlays, the real image stays underneath and the whole device is pushed in CSS (render);
    // phone: the canvas also redraws the image, so its camera can crop in on the scanner and on the corrections
    const g = ctx, K = cv.width / 1200, cam3 = camera(T), [s, tx, ty] = wide ? [1, 0, 0] : cam3, lw = 1200 / cssW / s;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    g.setTransform(K * s, 0, 0, K * s, K * tx, K * ty);
    g.globalAlpha = 1; if (!wide) g.drawImage(shot, 0, 0, 1200, 763);
    // the ink zones: reset for a new job, preset bars, the real values once measured, then the corrections
    const drain = 1 - P(T, 2.08, .02);   // the preset bars cut away when the view switches to Measure, like an interface
    for (const p of pills) {
      const kN = E.inOut(P(T, .6 + p.z * .006 + p.u * .012, .06));
      if (kN <= 0) continue;
      if (T < p.t1) {
        paint(g, p, NEU, null, kN);
        const h = p.h0 * E.out(P(T, 1.1 + p.z * .012 + p.u * .02, .18)) * drain * 69;
        if (h > .5) { g.fillStyle = UNIT[p.u]; g.beginPath(); rr(g, p.x + 3, p.y + 69 - h, 23, h, 4); g.fill(); }
      } else if (T >= 3.1 && (p.st === 'y' || p.st === 'r')) {
        const k1 = E.inOut(P(T, 3.1 + p.z * .005 + p.u * .012, .05));
        if (p.st === 'y') { if (k1 > 0) paint(g, p, G, GB, k1); }
        else if (k1 > 0) {
          paint(g, p, YL, YB, k1);
          const k2 = E.inOut(P(T, 3.54 + p.z * .005 + p.u * .012, .05));
          if (k2 > 0) paint(g, p, G, GB, k2, false);
        }
      }
      const fl = Math.max(T >= p.t1 ? .35 * (1 - P(T, p.t1, .04)) : 0, T >= p.t2 ? .35 * (1 - P(T, p.t2, .04)) : 0);
      if (fl > 0) { g.globalAlpha = fl; g.fillStyle = '#fff'; g.fill(p.path); }
    }
    // the header patch hides "No correction done" while the screen is an illustration
    const back = (a, b) => P(T, a, b);   // no hand-back to the real screen mid-story: it read as a glitch
    const ha = back(.55, .07);
    if (ha > 0) { g.globalAlpha = ha; g.fillStyle = head; g.fillRect(684, 98, 152, 26); }
    // the tabs: Preset for the preset, Measure for the scan, ColorLoop for the corrections
    const ta = back(.58, .06);
    if (ta > 0) {
      const pos = 1 - E.inOut(P(T, .64, .1)) + 2 * E.inOut(P(T, 2, .1)) - E.inOut(P(T, 2.82, .08)), i = Math.min(1, Math.floor(pos)), f = pos - i;
      g.globalAlpha = ta; g.fillStyle = tabOff; g.fillRect(26, 688, 449, 37);
      g.fillStyle = tabOn; g.fillRect(lerp(TABS[i][0], TABS[i + 1][0], f), 688, lerp(TABS[i][1], TABS[i + 1][1], f), 37);
      g.font = '400 15px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      TABS.forEach(([x, w, label], k) => { g.fillStyle = k === Math.round(pos) ? '#2F7EF2' : '#1D1D1F'; g.fillText(label, x + w / 2, 707); });
    }
    // the printed sheet's color bar slides out from under the screen; one patch per ink zone
    const sk = E.out(P(T, 2.04, .16));
    if (sk > 0) {
      const oy = -44 * (1 - sk);
      g.save(); g.beginPath(); g.rect(0, 751, 1200, 72); g.clip();
      g.globalAlpha = sk * .5; g.fillStyle = '#16181626'; g.fillRect(108, 777 + oy, 1002, 38);
      g.globalAlpha = sk; g.fillStyle = '#FBFBF8'; g.fillRect(105, 772 + oy, 1006, 40);
      for (let z = 0; z < 32; z++) { g.fillStyle = INK[z % 6]; g.fillRect(PX(z) + 4, 782 + oy, 21, 20); }
      g.restore();
    }
    // the scanning head: one patch read, one column on the screen (the beam), pull after pull
    const second = T >= 3, hx = second ? sweep(T, 3.38, .12) : sweep(T, 2.2, .6);
    const hk = second ? P(T, 3.34, .04) * (1 - P(T, 3.52, .04)) : P(T, 2.14, .06) * (1 - P(T, 2.8, .06));
    if (hk > 0) {
      // one patch feeds one column: the column lights up and a beam runs from the patch to the top row
      g.globalAlpha = hk * .16; g.fillStyle = '#19AAE3'; g.fillRect(hx - 15, 145, 30, 524);
      g.globalAlpha = hk * .85; g.strokeStyle = '#19AAE3'; g.lineWidth = lw * 2; g.beginPath(); g.moveTo(hx, 766); g.lineTo(hx, 145); g.stroke();
      g.globalAlpha = hk; g.fillStyle = '#1D1D1F'; g.beginPath(); rr(g, hx - 32, 767, 64, 50, 10); g.fill();
      g.fillStyle = '#19AAE3'; g.beginPath(); g.arc(hx, 776, 3, 0, 7); g.fill();
      g.globalAlpha = hk * .25; g.beginPath(); g.arc(hx, 776, 7, 0, 7); g.fill();
    }
    if (calibrate) { g.globalAlpha = 1; g.strokeStyle = '#ff00ff'; g.lineWidth = lw; pills.forEach(p => g.stroke(p.path)); }
    g.globalAlpha = 1;
    return cam3;
  }
  return {
    key: 'story', sec, beats,
    async init() {
      shot.loading = 'eager';
      await shot.decode();
      // read only the pixel rows that are sampled (one per unit row, the header, the tabs): a tiny readback, no long task
      const ROWS = [0, 1, 2, 3, 4, 5].map(u => Math.round(PY(u) + 10)).concat(110, 696);
      const o = D.createElement('canvas'); o.width = 1200; o.height = ROWS.length;
      const og = o.getContext('2d');
      ROWS.forEach((y, i) => og.drawImage(shot, 0, y, 1200, 1, 0, i, 1200, 1));
      const px = og.getImageData(0, 0, 1200, ROWS.length).data;
      const at = (x, y) => { const i = (ROWS.indexOf(Math.round(y)) * 1200 + Math.round(x)) * 4; return [px[i], px[i + 1], px[i + 2]]; };
      const hex = c => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
      head = hex(at(680, 110)); tabOff = hex(at(40, 696)); tabOn = hex(at(190, 696));
      // each pill takes the nearest of the four screen colors: the canvas matches the real image by construction
      for (let u = 0; u < 6; u++) for (let z = 0; z < 33; z++) {
        const x = PX(z), y = PY(u), w = PW(z), c = at(x + 14, y + 10);
        let st = 'g', bd = 1e9;
        for (const k in PAL) { const q = PAL[k], d = (q[0] - c[0]) ** 2 + (q[1] - c[1]) ** 2 + (q[2] - c[2]) ** 2; if (d < bd) { bd = d; st = k; } }
        const path = new Path2D(), band = new Path2D(); rr(path, x, y, w, 69, 7); rr(band, x, y + 60, w, 9, [0, 0, 7, 7]);
        const cx = x + w / 2;
        pills.push({ u, z, x, y, w, st, path, band, t1: passAt(cx, 2.2, .6), t2: passAt(cx, 3.38, .12),
          h0: st === 'n' || z === 32 ? 0 : .2 + .6 * (.5 + .5 * Math.sin(z * .37 + u * 1.7) * Math.cos(z * .11 + u)) });
      }
      if (D.fonts && D.fonts.load) await D.fonts.load('400 15px Inter').catch(() => {});
      ctx = cv.getContext('2d');
    },
    measure() {
      trackTop = docTop(track); stickyTop = parseFloat(getComputedStyle(stage).top) || 64;
      const stageH = stage.offsetHeight;
      anchor = wide ? .5 * vh : stickyTop + stageH + .2 * (vh - stickyTop - stageH);
      root.style.setProperty('--hs-anchor', Math.round(anchor) + 'px'); root.style.setProperty('--hs-sb', Math.round(stickyTop + stageH) + 'px');
      Y = beats.map(b => docTop(b) - anchor); Y[5] = trackTop + track.offsetHeight - stageH - stickyTop; Yin = trackTop - vh;
      if (dev && isLive && !(Y[4] < Y[5])) console.warn('home-story: the operator beat ends after the pin releases', Y);
      if (dev && isLive && wide && Y[0] < trackTop - stickyTop - 2) console.warn('home-story: the story starts before the stage pins', Y[0], trackTop - stickyTop);
      cssW = cam.clientWidth;
      const z = dpr(), w = Math.round(cssW * z), h = Math.round(cssW * 823 / 1200 * z);
      if (w && (cv.width !== w || cv.height !== h)) {
        cv.width = w; cv.height = h;
        const K = w / 1200, n = nums.getContext('2d'); nums.width = w; nums.height = Math.ceil(10 * K);
        n.setTransform(K, 0, 0, K, 0, 0); n.fillStyle = BAND; n.fillRect(0, 0, 1200, 10);
        n.fillStyle = '#C9C9CE'; n.font = '500 8.6px Inter, system-ui, sans-serif'; n.textAlign = 'center'; n.textBaseline = 'middle';
        for (let z = 0; z < 33; z++) n.fillText(z < 32 ? String(z + 1) : 'S', PX(z) + PW(z) / 2, 5.2);
      }
    },
    value() {
      if (!play.started) return T0();
      const [a, b, d] = SPAN[play.step], k = cl((performance.now() - play.t0) / d);
      if (k >= 1 && play.auto && play.step < 3) { play.step++; play.t0 = performance.now(); show(play.step); return T0(); }
      return a + (b - a) * k;
    },
    range() { return [Yin, Y[5] + vh / 2]; },
    pin: () => false,
    playing: () => play.started && (play.auto && play.step < 3 || performance.now() - play.t0 < SPAN[play.step][2] + 50),
    current() { return beats[cl(Math.floor(this.shown == null ? 0 : this.shown), 0, 4)]; },
    still() { cam.classList.remove('is-ready'); },
    render(T) {
      const ek = E.out(P(T, -1, .6)), floor = wide ? .18 : .4, wd = wide ? .35 : .2;
      css(cam, '--cy', f3(32 * (1 - ek)) + 'px'); css(cam, '--co', f3(ek));
      beats.forEach((b, k) => {
        const a = k ? k + .12 : -2, z = k < 4 ? k + .88 : 9, d = T < a ? a - T : T > z ? T - z : 0;
        css(b, '--o', f3(floor + (1 - floor) * (1 - ss(0, wd, d))));
      });
      rail.forEach((a, i) => css(a, '--p', f3(i + 1 === play.step ? cl((T - SPAN[i + 1][0]) / (SPAN[i + 1][1] - SPAN[i + 1][0])) : 0)));
      if (setup) { css(setup, '--a', f3(E.out(P(T, 1.05, .045)))); css(setup, '--m', f3(P(T, 1.05, .9))); setup.classList.toggle('ok', T >= 1.1); }
      toasts[0].classList.toggle('on', T >= 1 && T < 1.5); toasts[1].classList.toggle('on', T >= 1.8 && T < 2.06);
      const l = T < .58 ? '0' : '1';
      if (device.dataset.l !== l) device.dataset.l = l;
      device.classList.toggle('tag-on', (T >= 2.04 && T < 2.95) || (T >= 3.34 && T < 3.52));
      // the ending, drawn like the rest (no photo): every zone green, a soft green glow, then the operator card
      css(cam, '--glow', f3(E.inOut(P(T, 3.9, .3))));
      css(endCard, '--ek', f3(E.out(P(T, 4.12, .3))));
      if (!ctx || !cssW) return;
      const [s, tx, ty] = draw(T);
      cam.classList.toggle('is-ready', !wide);
      // the green character (green = on target) lands on the screen once every zone is green, and stays
      const ak = P(T, 3.84, .06), u = cssW / 1200;
      if (T >= 3.84) {
        css(agent, 'transform', `translate(${f3((860 * s + tx - 860) * u)}px,${f3((67 * s + ty - 67 - 260 * (1 - ak * ak)) * u)}px) scale(${f3(s)})`);
        css(agent, 'opacity', f3(Math.min(1, ak * 4)));
      } else css(agent, 'opacity', '0');
      agent.classList.toggle('land', T >= 3.9);
    },
  };
})());

// ---------- 02 what it saves: two makeready piles and two time bars, drawn at the published maximums ----------
register((() => {
  const sec = D.getElementById('savings'), cv = sec && $('.sv-canvas', sec); if (!cv) return null;
  const grid = $('.sv-grid', sec), figs = $$('.sv-fig', sec), caps = $$('.sv-big', sec), bars = $$('.sv-bar', sec), bracket = $('.sv-bracket', sec);
  // big numbers: written final in the HTML; in the live layout they count once when they come into view (never mid-count when paused)
  const counters = $$('[data-count-to]', sec).map(el => ({ el, from: +el.dataset.countFrom, to: +el.dataset.countTo, text: el.textContent, pre: el.textContent.replace(/[\d,]/g, ''), done: false, raf: 0 }));
  const fmt = (c, v) => c.pre + Math.round(v).toLocaleString('en-US');
  const finish = c => { cancelAnimationFrame(c.raf); c.raf = 0; c.done = true; c.el.textContent = c.text; c.el.classList.add('go'); const n = c.el.closest('.sv-n'); if (n) n.classList.add('done'); };
  function count(c) {
    if (c.done || c.raf) return;
    if (!isLive) return finish(c);
    const t0 = performance.now(), dur = c.to > 1000 ? 1400 : 1100; c.el.classList.add('go');
    const step = now => {
      if (!isLive || D.hidden) return finish(c);
      const k = Math.min(1, (now - t0) / dur);
      c.el.textContent = fmt(c, lerp(c.from, c.to, E.out(k)));
      if (k < 1) c.raf = requestAnimationFrame(step); else finish(c);
    };
    c.raf = requestAnimationFrame(step);
  }
  const cio = 'IntersectionObserver' in window && new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; const c = counters.find(q => q.el === e.target); if (c) { count(c); cio.unobserve(c.el); }
  }), { rootMargin: '0px 0px -18% 0px', threshold: 1 });
  // the hero film's pile (hero.js), two piles in a three-quarter view; 40 sheets without ColorLoop, 14 with it (65% less)
  const W = 640, SC = .37, AX = [.85 * SC, .18 * SC], BX = [-.38 * SC, .36 * SC], SW = 600, SD = 420, TH = 5;
  const PILES = [{ ox: 120, n: 40, ok: 37 }, { ox: 390, n: 14, ok: 11 }], OY = 284;
  const TINTS = [null, '#FFD9EC', '#D9F0FF', '#FFF4C2', '#E8E8E8', '#FFE3D1', '#E6F7E0'];
  const landAt = i => .6 * (i / 39) ** .7;
  let g = null, arts = [], pTop = 0, off = 0;
  const PT = (ox, u, v, z) => [ox + AX[0] * u + BX[0] * v, OY + AX[1] * u + BX[1] * v - z];
  function makeArt(tint) {
    const c = D.createElement('canvas'); c.width = SW; c.height = SD;
    const a = c.getContext('2d'), dot = (x, y, r, f) => { a.fillStyle = f; a.beginPath(); a.arc(x, y, r, 0, 7); a.fill(); };
    const txt = (x, y, w, n) => { a.fillStyle = '#c9ccca'; for (let i = 0; i < n; i++) a.fillRect(x, y + i * 12, i === n - 1 ? w * .6 : w, 5); };
    a.fillStyle = '#fff'; a.fillRect(0, 0, SW, SD);
    const gr = a.createLinearGradient(0, 22, 0, 132); gr.addColorStop(0, '#19AAE3'); gr.addColorStop(1, '#FAA1DB');
    a.fillStyle = gr; a.fillRect(24, 22, 268, 112); dot(226, 62, 24, '#FBCB05');
    a.save(); a.beginPath(); a.rect(24, 22, 268, 112); a.clip(); a.fillStyle = '#64A932'; a.beginPath(); a.ellipse(110, 140, 150, 48, 0, Math.PI, 0); a.fill(); a.restore();
    a.fillStyle = '#1D1D1F'; a.fillRect(24, 146, 150, 10); txt(24, 166, 230, 3);
    a.globalCompositeOperation = 'multiply'; dot(390, 92, 62, '#F50C0C'); dot(452, 116, 50, '#FAA1DB'); dot(520, 76, 34, '#19AAE3'); a.globalCompositeOperation = 'source-over';
    a.fillStyle = '#1D1D1F'; a.fillRect(308, 166, 170, 10); txt(308, 184, 250, 1);
    a.fillStyle = '#F50C0C'; a.fillRect(24, 228, 268, 30); a.fillStyle = '#1D1D1F'; a.fillRect(24, 272, 200, 12); txt(24, 296, 260, 5);
    a.fillStyle = '#19AAE3'; a.fillRect(308, 204, 268, 104); a.fillStyle = '#fff'; a.fillRect(326, 226, 150, 12); a.fillRect(326, 248, 110, 12);
    a.fillStyle = '#FBCB05'; a.fillRect(308, 308, 268, 16); txt(308, 334, 260, 3);
    for (let z = 0; z < 32; z++) { a.fillStyle = ['#141416', '#19AAE3', '#E5197E', '#FBCB05', '#FFCD00', '#FF9E1B'][z % 6]; a.fillRect(24 + z * 17.25, 386, 15.5, 18); }
    if (tint) { a.globalCompositeOperation = 'multiply'; a.globalAlpha = .35; a.fillStyle = tint; a.fillRect(0, 0, SW, SD); }
    return c;
  }
  const poly = (pts, fill) => { g.beginPath(); pts.forEach(([x, y], k) => k ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = fill; g.fill(); };
  // the side faces of a waste sheet take about a quarter of its color cast: the piles show the off-color sheets under the OK ones
  const tintRGB = TINTS.map(t => t && [1, 3, 5].map(k => parseInt(t.slice(k, k + 2), 16)));
  const side = (cast, r, gg, b) => { const t = tintRGB[cast]; if (!t) return `rgb(${r},${gg},${b})`; const m = (v, k) => Math.round(v + (t[k] * v / 255 - v) * 1.2); return `rgb(${m(r, 0)},${m(gg, 1)},${m(b, 2)})`; };
  function sheet(ox, i, z, cast, du = 0, dv = 0, r = 0, top = true) {
    const sh = 248 - Math.round(((i * 7919) % 13) / 13 * 7), u0 = ((i * 37) % 11 - 5) * 1.1 + du, v0 = ((i * 53) % 9 - 4) * 1.1 + dv;
    if (!r) {
      poly([PT(ox, u0, SD + v0, z), PT(ox, SW + u0, SD + v0, z), PT(ox, SW + u0, SD + v0, z + TH), PT(ox, u0, SD + v0, z + TH)], side(cast, sh, sh - 1, sh - 6));
      poly([PT(ox, SW + u0, v0, z), PT(ox, SW + u0, SD + v0, z), PT(ox, SW + u0, SD + v0, z + TH), PT(ox, SW + u0, v0, z + TH)], side(cast, sh - 22, sh - 23, sh - 30));
    }
    if (!top) return;
    const [x0, y0] = PT(ox, 0, 0, z + TH), K = cv.width / W;
    g.save(); g.setTransform(K * AX[0], K * AX[1], K * BX[0], K * BX[1], K * x0, K * y0); g.translate(u0, v0);
    if (r) { g.translate(SW / 2, SD / 2); g.rotate(r); g.translate(-SW / 2, -SD / 2); }
    g.drawImage(arts[cast] || arts[0], 0, 0, SW, SD);
    g.strokeStyle = '#16161619'; g.lineWidth = 1.6; g.strokeRect(0, 0, SW, SD); g.restore();
  }
  function piles(c) {
    const K = cv.width / W;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(K, 0, 0, K, 0, 0);
    const tops = [];
    PILES.forEach((p, pi) => {
      let n = 0; while (n < p.n && landAt(n) <= c) n++;
      // the floor shadow (a gradient, no blur filter)
      const [sx, sy] = PT(p.ox, SW / 2, SD / 2, 0), gr = g.createRadialGradient(sx, sy + 4, 4, sx, sy + 4, 150);
      gr.addColorStop(0, '#2a2a1e33'); gr.addColorStop(1, '#2a2a1e00'); g.save(); g.translate(sx, sy + 4); g.scale(1, .42); g.translate(-sx, -sy - 4); g.fillStyle = gr; g.fillRect(sx - 160, sy - 160, 320, 330); g.restore();
      const cast = i => i >= p.ok ? 0 : 1 + (i * 5 + pi * 2) % 6;
      for (let i = 0; i < n; i++) sheet(p.ox, i, i * TH, cast(i), 0, 0, 0, i >= n - 3);
      // the sheet in the air floats down onto the pile
      for (let i = n; i < p.n; i++) {
        const k = (c - landAt(i) + .03) / .03; if (k <= 0) break;
        const q = (1 - k) * (1 - k);
        g.save(); g.globalAlpha = Math.min(1, k * 3); sheet(p.ox, i, n * TH + 230 * q, cast(i), 150 * q, -40 * q, (i % 2 ? 1 : -1) * .1 * q); g.restore();
      }
      tops.push([p.ox, OY - n * TH]);   // the back corner of the top sheet: the highest point of the pile
    });
    // a printer's dimension line: the difference between the two piles is the waste ColorLoop saves
    const d = E.inOut(P(c, .62, .14));
    if (d > 0) {
      const x = 330, [ , yb] = tops[1], [ , yt] = tops[0], ye = lerp(yb, yt, d);
      g.globalAlpha = Math.min(1, d * 4); g.strokeStyle = '#1D1D1F'; g.lineWidth = 1.5;
      g.setLineDash([3, 4]); g.beginPath(); g.moveTo(tops[0][0] + 8, yt); g.lineTo(x + 10, yt); g.moveTo(tops[1][0] - 8, yb); g.lineTo(x - 10, yb); g.stroke(); g.setLineDash([]);
      g.beginPath(); g.moveTo(x, yb); g.lineTo(x, ye); g.moveTo(x - 6, yb + 6); g.lineTo(x + 6, yb - 6);
      if (d >= 1) { g.moveTo(x - 6, yt + 6); g.lineTo(x + 6, yt - 6); }
      g.stroke(); g.globalAlpha = 1;
    }
  }
  return {
    key: 'savings', sec,
    async init() {
      g = cv.getContext('2d');
      counters.forEach(c => { if (isLive && !c.done) { c.el.textContent = fmt(c, c.from); if (cio) cio.observe(c.el); else finish(c); } else finish(c); });
      for (const t of TINTS) { await idle(); arts.push(makeArt(t)); }   // casts are pre-baked in idle time (no ctx.filter)
    },
    measure() {
      const fp = wide ? grid : figs[0];
      pTop = docTop(fp); off = wide ? 0 : (docTop(figs[1]) - pTop) / (.7 * vh);
      const w = Math.round(cv.clientWidth * dpr()), h = Math.round(cv.clientHeight * dpr());
      if (w && (cv.width !== w || cv.height !== h)) { cv.width = w; cv.height = h; }
    },
    value(y) { return cl((vh - (pTop - y)) / (.7 * vh), 0, 1 + off); },
    range() { return [pTop - vh, pTop + vh]; },
    still() { counters.forEach(finish); this.render(1 + off); },
    render(v) {
      const cP = cl(v), cB = cl(v - off);
      if (cv.width) piles(cP);
      // one bar after the other, so no in-between frame suggests two near-equal times
      css(bars[0], '--w', f3(P(cB, .15, .3))); css(bars[1], '--w', f3(P(cB, .5, .165))); css(bracket, '--w', f3(E.out(P(cB, .68, .1))));
      caps.forEach(c => c.classList.toggle('on', cB >= .8));
    },
  };
})());

// ---------- the console check: four gestures on a phone (the hero film's scene 7, by scroll) ----------
register((() => {
  const sec = D.getElementById('check'), phone = sec && $('.hc-phone', sec); if (!phone) return null;
  const h = id => D.getElementById('hc-' + id), track = $('.hc-track', sec), stage = $('.hc-stage', sec), box = $('.hc-box', sec), steps = $$('.hc-steps li', sec);
  const S = { phone: 34.75, type: 35.65, typeDur: .75, load: 36.55, tap1: 37.15, cam: 37.5, focus: [37.8, 38.9], shut: [38.1, 39.2], pan: 38.45, panDur: .45,
    send: 39.9, tap3: 40.55, sent: 41.1, order: 42, globe: 42.2, chime: 42.6 };
  const SEG = [[0, 35.05, 35.4], [1, 35.4, 37.45], [2, 37.5, 39.85], [3, 39.9, 41.35], [3.6, 41.35, 41.95], [4, 42, 44.3], [5, 44.3, 44.3]];   // T to film seconds (scene 7)
  const URL = 'rutherford.fr/check';
  // the capture is 590 px wide, shown 378 px wide from y 121: its "Submit your information" button is at y 653 of the capture
  const PAGE_SCROLL = 112, PAGE_BTN = 121 + 653 * 378 / 590;
  let el = {}, trackTop = 0, trackH = 0, stageH = 0, stickyTop = 64;
  const rise = (e, t, t0, dur, dist, extra = '') => { const k = E.out(P(t, t0, dur)); css(e, 'opacity', f3(k)); css(e, 'transform', `translateY(${f3((1 - k) * dist)}px)${extra}`); };
  function seek(t) {
    const pk = E.out(P(t, S.phone, .8));   // the phone is already in place when the pin starts: no fade, a short rise
    css(phone, 'translate', `0 ${f3((1 - pk) * 24)}px`);
    // screens push in from the right, as in an app
    const ent = [-Infinity, S.cam, S.send, S.order]; let camK = 0;
    el.scr.forEach((s, k) => {
      const kin = k ? E.inOut(P(t, ent[k], .5)) : 1, kout = k < 3 ? E.inOut(P(t, ent[k + 1], .5)) : 0;
      css(s, 'visibility', kin > 0 && kout < 1 ? 'inherit' : 'hidden'); css(s, 'zIndex', String(k + 1));
      css(s, 'transform', `translateX(${f3((1 - kin) * 378 - kout * 120)}px)`); css(s, 'boxShadow', kin < 1 ? '-18px 0 40px rgba(0,0,0,.14)' : 'none');
      if (k === 1) camK = kin * (1 - kout);
    });
    css(el.status, 'color', camK > .5 ? '#fff' : '#1D1D1F');
    // a. type the address, the page loads, tap Start
    const nc = Math.round(URL.length * P(t, S.type, S.typeDur));
    if (el.addrT.textContent.length !== nc) el.addrT.textContent = URL.slice(0, nc);
    css(el.addrPh, 'opacity', t < S.type ? '1' : '0');
    css(el.caret, 'opacity', t < S.type - .35 || t >= S.load ? '0' : t > S.type && t < S.type + S.typeDur ? '1' : Math.floor((t - S.type) * 3.4) & 1 ? '0' : '1');
    const kk = E.inOut(P(t, S.type - .4, .3)) * (1 - E.inOut(P(t, S.load - .2, .3)));
    css(el.kbd, 'transform', `translateY(${f3((1 - kk) * 100)}%)`);
    const typing = t >= S.type && t < S.type + S.typeDur + .04 && nc > 0, go = t >= S.type + S.typeDur + .1 && t < S.type + S.typeDur + .25;
    el.keys.forEach(k => k.classList.toggle('hc-hit', (typing && k.dataset.k === URL[nc - 1]) || (go && k.classList.contains('hc-go'))));
    css(el.load, 'transform', `scaleX(${f3(E.out(P(t, S.load - .3, .5)))})`); css(el.load, 'opacity', f3(1 - P(t, S.load + .25, .2)));
    // the real rutherford.fr/check page loads, then scrolls a little before the tap on its button
    const ps = PAGE_SCROLL * E.inOut(P(t, S.load + .2, .38));
    rise(el.page, t, S.load, .5, 18); css(el.real, 'transform', `translateY(${f3(-ps)}px)`);
    // b. the camera: focus, shutter, the photo drops into the thumbnail; pan to the console; again
    css(el.world, 'transform', `translateX(${f3(-378 * E.inOut(P(t, S.pan, S.panDur)))}px)`);
    css(el.tagA, 'opacity', f3(1 - P(t, S.pan, .15))); css(el.tagB, 'opacity', f3(P(t, S.pan + .3, .15)));   // one label at a time
    let fop = 0;
    S.focus.forEach((f, k) => {
      if (t < f || t > f + 1) return;
      fop = P(t, f, .08) * (1 - P(t, f + .7, .15)) * (t > f + .12 && t < f + .2 ? .35 : 1);
      css(el.focus, 'transform', `translateY(${k ? -59 : 0}px) scale(${f3(1.35 - .35 * E.out(P(t, f, .12)))})`);
    });
    css(el.focus, 'opacity', f3(fop));
    css(el.flash, 'opacity', f3(S.shut.reduce((m, s) => Math.max(m, t >= s ? .4 * (1 - E.out(P(t, s, .34))) : 0), 0)));
    css(el.shutter, 'transform', `scale(${f3(1 - .14 * S.shut.reduce((m, s) => Math.max(m, Math.sin(Math.PI * P(t, s - .08, .2))), 0))})`);
    let snapOn = false;
    S.shut.forEach((s, k) => {
      if (t < s || t >= s + .52) return;
      // from the viewfinder (0, 104, 378 x 540) into the thumbnail (42, 690, 46 x 66), as one transform
      const q = E.inOut(P(t, s + .06, .42)), sx = lerp(1, 46 / 378, q), sy = lerp(1, 66 / 540, q);
      css(el.snap, 'transform', `translate(${f3(42 * q)}px,${f3(586 * q)}px) scale(${f3(sx)},${f3(sy)})`);
      css(el.snapP, 'visibility', k ? 'hidden' : 'inherit'); css(el.snapC, 'visibility', k ? 'inherit' : 'hidden');
      snapOn = true;
    });
    css(el.snap, 'opacity', snapOn ? '1' : '0');
    const second = t >= S.shut[1] + .48;
    css(el.thumb, 'opacity', t >= S.shut[0] + .48 ? '1' : '0');
    css(el.thumbP, 'visibility', second ? 'hidden' : 'inherit'); css(el.thumbC, 'visibility', second ? 'inherit' : 'hidden');
    css(el.thumbN, 'opacity', second ? '1' : '0'); css(el.thumbN, 'transform', `scale(${f3(E.back(P(t, S.shut[1] + .48, .35)))})`);
    // c. send: the plane flies off, the button fills, then the check
    const pq = E.in(P(t, S.tap3 + .02, .35));
    css(el.plane, 'transform', `translate(${f3(pq * 280)}px,${f3(-pq * 110)}px) rotate(${f3(-pq * 18)}deg)`); css(el.plane, 'opacity', f3(1 - P(t, S.tap3 + .22, .15)));
    const word = t < S.tap3 + .12 ? 'Send' : 'Sending'; if (el.sendL.firstChild.textContent !== word) el.sendL.firstChild.textContent = word;
    css(el.prog, 'transform', `scaleX(${f3(E.inOut(P(t, S.tap3 + .1, S.sent - S.tap3 - .15)))})`);
    css(el.sendBtn, 'opacity', f3(1 - P(t, S.sent, .25))); css(el.sendBtn, 'transform', `scale(${f3(1 - .05 * Math.sin(Math.PI * P(t, S.tap3 - .04, .24)))})`);
    css(el.sendBody, 'opacity', f3(1 - P(t, S.sent - .1, .25)));
    const sk = E.out(P(t, S.sent, .5));
    css(el.sent, 'opacity', f3(P(t, S.sent, .2))); css(el.sent, 'transform', `translateY(${f3((1 - sk) * 24)}px)`);
    css(el.sentSvg, 'transform', `scale(${f3(.6 + .4 * E.back(P(t, S.sent, .45)))})`);
    css(el.sentChk, 'strokeDashoffset', f3(150 * (1 - E.out(P(t, S.sent + .15, .35)))));
    // d. order: the logo, the globe with five ink pins, the check, available worldwide
    rise(el.ologo, t, S.order + .2, .5, 16);
    css(el.globe, 'opacity', f3(P(t, S.globe, .15))); css(el.globe, 'transform', `scale(${f3(.7 + .3 * E.back(P(t, S.globe, .55)))})`);
    el.pins.forEach((c, i) => css(c, 'transform', `scale(${f3(E.back(P(t, S.globe + .25 + i * .07, .35)))})`));
    css(el.gbadge, 'transform', `scale(${f3(E.back(P(t, S.chime, .5)))})`);
    rise(el.oworld, t, S.chime + .1, .5, 16); rise(el.order, t, S.chime + .3, .5, 16);
    // a finger tap: on Start, on the shutter (twice), on Send
    let tpo = 0;
    [[S.tap1, PAGE_BTN - PAGE_SCROLL], [S.shut[0] - .06, 724], [S.shut[1] - .06, 724], [S.tap3, 729]].forEach(([a, y]) => {
      const k = (t - a) / .45; if (k < -.2 || k > 1) return;
      tpo = k < 0 ? (k + .2) / .2 : 1 - E.in2(k);
      css(el.tap, 'transform', `translate(189px,${y}px) scale(${f3(.75 + .45 * E.out(cl(k)))})`);
    });
    css(el.tap, 'opacity', f3(tpo));
  }
  return {
    key: 'check', sec, beats: steps,
    init() {
      // the keyboard (letters, then . / .com go) and the console drawing's ink keys, as in the film (hero.js)
      const kbd = h('kbd');
      ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].forEach((r, k) => {
        kbd.insertAdjacentHTML('beforeend', `<div class="hc-krow" style="padding:0 ${[0, 19, 56][k]}px">${[...r].map(c => `<i data-k="${c}">${c}</i>`).join('')}</div>`);
      });
      kbd.insertAdjacentHTML('beforeend', '<div class="hc-krow"><i class="hc-g" style="flex:1.3">123</i><i data-k=".">.</i><i data-k="/">/</i><i class="hc-g" style="flex:1.7">.com</i><i class="hc-go" style="flex:1.7">go</i></div>');
      const keys = h('keys'), KC = ['#19AAE3', '#FAA1DB', '#FBCB05', 'currentColor'];
      let svg = '';
      for (let r = 0; r < 4; r++) {
        const y = 258 + r * 38; svg += `<circle cx="96" cy="${y + 12}" r="10" fill="${KC[r]}"/>`;
        for (let k = 0; k < 15; k++) {
          const v = .3 + .7 * (.5 + .5 * Math.sin(k * .8 + r * 1.9)), x = 124 + k * 28;
          svg += `<rect x="${x}" y="${y}" width="20" height="24" rx="4" fill="currentColor" opacity=".14"/><rect x="${x}" y="${(y + 24 * (1 - v)).toFixed(1)}" width="20" height="${(24 * v).toFixed(1)}" rx="4" fill="${KC[r]}"/>`;
        }
      }
      keys.innerHTML = svg;
      const snap = h('snap'), thumb = h('thumb');
      el = { scr: ['scr-web', 'scr-cam', 'scr-send', 'scr-order'].map(h), status: h('status'), addrT: h('addr-t'), addrPh: h('addr-ph'), caret: h('addr-caret'),
        kbd, keys: $$('i', kbd), load: h('loadbar'), page: h('page'), real: h('real'), world: h('world'), tagA: h('camtag-a'), tagB: h('camtag-b'),
        focus: h('focus'), flash: h('flash'), shutter: h('shutter').firstChild, snap, snapP: $('.hc-art-p', snap), snapC: $('.hc-art-c', snap),
        thumb, thumbP: $('.hc-art-p', thumb), thumbC: $('.hc-art-c', thumb), thumbN: h('thumb-n'), plane: h('plane'), sendL: h('send-l'), prog: h('prog'),
        sendBtn: h('pbtn-send'), sendBody: h('sendbody'), sent: h('sent'), sentSvg: $('svg', h('sent')), sentChk: h('sent-chk'), ologo: h('ologo'), globe: h('globe'),
        pins: [...h('pins').children], gbadge: h('gbadge'), oworld: h('oworld'), order: h('pbtn-order'), tap: h('tap') };
      el.snap.style.transformOrigin = '0 0'; el.sentChk.style.strokeDasharray = '150';
      el.pins.forEach(c => { c.style.transformBox = 'fill-box'; c.style.transformOrigin = '50% 50%'; });
    },
    measure() {
      trackTop = docTop(track); trackH = track.offsetHeight; stageH = stage.offsetHeight; stickyTop = parseFloat(getComputedStyle(stage).top) || 64;
      if (box.clientHeight) { css(phone, '--k', f3(box.clientHeight / 828)); box.classList.add('on'); }
    },
    value(y) { return cl(6 * cl((y - (trackTop - stickyTop)) / Math.max(1, trackH - stageH)) - .35, 0, 5); },   // a short hold at both ends
    range() { return [trackTop - stickyTop - 1, trackTop - stickyTop + trackH - stageH + 1]; },
    pin: y => y >= trackTop - stickyTop && y <= trackTop - stickyTop + trackH - stageH,
    current() { return steps[cl(Math.floor(this.shown || 0) - 1, 0, 3)]; },
    still() { this.render(5); },
    render(T) {
      steps.forEach((li, i) => {
        const k = i + 1;
        // the last step never turns to done: the scene ends on it, as an invitation
        li.classList.toggle('is-future', T < k); li.classList.toggle('is-active', T >= k && (T < k + 1 || k === 4)); li.classList.toggle('is-done', T >= k + 1 && k < 4);
        if (i < 3) css(li, '--f', f3(E.inOut(P(T, k + .75, .25))));
      });
      let i = 0; while (i < SEG.length - 2 && T >= SEG[i + 1][0]) i++;
      const [t0, a, b] = SEG[i]; seek(lerp(a, b, cl((T - t0) / (SEG[i + 1][0] - t0))));
    },
  };
})());

// ---------- wiring ----------
if (!scenes.length) return;
const io = new IntersectionObserver(es => es.forEach(e => { const s = e.target.__hs; s.on = e.isIntersecting; if (s.on) start(s); }), { rootMargin: '100% 0px' });
scenes.forEach(s => io.observe(s.sec));
addEventListener('scroll', kick, { passive: true });
addEventListener('load', geometry);
if (D.fonts && D.fonts.ready) D.fonts.ready.then(geometry);
let bw = 0, bh = 0;
new ResizeObserver(() => { const w = D.body.clientWidth, hh = D.body.scrollHeight; if (w !== bw || Math.abs(hh - bh) > 1) { bw = w; bh = hh; geometry(); } }).observe(D.body);
MQ.addEventListener('change', policy);
if (window.ColorLoopMotion) ColorLoopMotion.subscribe(policy);
else new MutationObserver(policy).observe(root, { attributes: true, attributeFilter: ['data-motion', 'class'] });
D.addEventListener('visibilitychange', kick);

// review and QA hooks: ColorLoopStory.go('story', 2.5) scrolls to that moment; ?story=story&t=2.5 does it on load
window.ColorLoopStory = {
  async go(id, v) {
    const s = byId[id]; if (!s) return null;
    await start(s); geometry();
    let [lo, hi] = s.range();
    for (let i = 0; i < 48; i++) { const m = (lo + hi) / 2; if (s.value(m) < v) lo = m; else hi = m; }
    scrollTo({ top: Math.ceil(hi), behavior: 'instant' });
    s.on = true; s.shown = null; kick();
    return Math.ceil(hi);
  },
  value: id => byId[id] ? byId[id].shown : null,
};
if (Q.has('story')) addEventListener('load', () => setTimeout(() => ColorLoopStory.go(Q.get('story'), parseFloat(Q.get('t')) || 0), 60));
})();
