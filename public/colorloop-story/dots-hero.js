// The dots hero (16 Oct 2026), after playcolorguesser.com. The CSS lights the wordmark and raises the five ink dots (dots-hero.css);
// this script makes them alive:
//   - on arrival, once the dots are up, a wave of hops, left to right, each dot with its joyful face; its letter hops with it;
//   - on hover (mouse) a dot turns joyful and hops, and stays joyful while the pointer is on it; on tap it hops;
//   - now and then (every 6 to 9 s) one dot hops on its own, only while the hero is on screen and the tab is visible;
//   - the nav is dark (white logo, white buttons) while it sits over the night, back to paper below it (html.dh-top);
//   - the press band under the night rolls (a seamless roll that eases in and out, stops under the pointer, with focus, off screen).
// Reduced motion, ?static or html[data-motion="paused"]: no hops, no roll; a dot only changes face (a 150 ms fade).
(() => {
  const hero = document.querySelector('[data-dh]'); if (!hero) return;
  const root = document.documentElement;
  const night = hero.querySelector('.dh-night');
  const dots = [...hero.querySelectorAll('.dh-dot')], letters = [...hero.querySelectorAll('.dh-l')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => reduce.matches || root.dataset.motion === 'paused';
  const live = () => root.classList.toggle('dh-live', !still());
  if (reduce.addEventListener) reduce.addEventListener('change', live);
  new MutationObserver(live).observe(root, { attributes: true, attributeFilter: ['data-motion'] });

  // ================================================================ the nav over the night
  const nav = document.querySelector('.site-nav'), logo = nav && nav.querySelector('.brand img');
  const LOGO = logo && logo.getAttribute('src'), LOGO_W = 'assets/logo-white.png';
  function setTop(on) {
    root.classList.toggle('dh-top', on);
    if (logo) { const want = on ? LOGO_W : LOGO; if (logo.getAttribute('src') !== want) logo.setAttribute('src', want); }
  }
  const navH = nav ? Math.round(nav.getBoundingClientRect().height) || 64 : 64;
  new IntersectionObserver(([e]) => setTop(e.isIntersecting), { rootMargin: `-${navH}px 0px 0px 0px` }).observe(hero);   // the whole hero is night (16 Oct 2026)

  // ================================================================ on screen, tab visible
  let onScreen = true;
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; hero.classList.toggle('is-away', !onScreen); schedule(); }).observe(night);
  document.addEventListener('visibilitychange', schedule);

  // ================================================================ faces: the joyful one loads once the dots are up
  const joyOf = d => d.querySelector('.dh-joy');
  function loadJoy(d) {
    const j = joyOf(d); if (!j || j.getAttribute('src')) return;
    if (j.dataset.srcset) j.srcset = j.dataset.srcset;
    j.src = j.dataset.src;
  }
  const joyReady = d => { const j = joyOf(d); return !!(j && j.complete && j.naturalWidth); };
  function happy(d, on) {
    if (on && !joyReady(d)) { loadJoy(d); const j = joyOf(d); if (j) j.addEventListener('load', () => { if (d._want) d.classList.add('is-happy'); }, { once: true }); }
    d._want = on;
    d.classList.toggle('is-happy', on && joyReady(d));
  }

  // ================================================================ the hop
  const HOLD = 1200;
  function ping(i) {
    const l = letters[i]; if (!l || still()) return;
    l.classList.remove('is-ping'); void l.offsetWidth; l.classList.add('is-ping');
  }
  letters.forEach(l => l.addEventListener('animationend', e => { if (e.animationName === 'dh-ping') l.classList.remove('is-ping'); }));
  function hop(d, keep) {
    const fig = d.querySelector('.dh-fig');
    happy(d, true);
    clearTimeout(d._t);
    if (!keep) d._t = setTimeout(() => { if (!d._hover) happy(d, false); }, HOLD);
    if (still()) return;
    if (fig.classList.contains('dh-hop')) return;          // one hop at a time: a hop is never cut short
    fig.classList.add('dh-hop');
    ping(+d.dataset.dot);
  }
  dots.forEach(d => {
    const fig = d.querySelector('.dh-fig');
    fig.addEventListener('animationend', e => { if (e.animationName === 'dh-hop') fig.classList.remove('dh-hop'); });
    d.addEventListener('pointerenter', e => { if (e.pointerType !== 'mouse') return; d._hover = true; hop(d, true); });
    d.addEventListener('pointerleave', e => {
      if (e.pointerType !== 'mouse') return; d._hover = false; clearTimeout(d._t);
      d._t = setTimeout(() => happy(d, false), 450);
    });
    d.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; hop(d); });
  });

  // ================================================================ arrival: the joyful faces load during the rise; each dot hops as
  // it reaches the top (the end of its dh-rise), so the hops make a wave; if the rise is already over, a wave 95 ms apart
  setTimeout(() => dots.forEach(loadJoy), 300);
  let waved = false;
  function arrive() {
    if (waved || document.hidden || !onScreen) return;      // waits for the hero to be seen (schedule() calls back)
    waved = true;
    if (still()) return;
    dots.forEach((d, i) => {
      const go = () => { if (!d._hover) hop(d); };
      const rise = d.getAnimations ? d.getAnimations().find(a => a.animationName === 'dh-rise' && a.playState === 'running') : null;
      if (rise) rise.finished.then(go, () => {}); else setTimeout(go, i * 95);
    });
  }

  // ================================================================ now and then, one dot hops on its own
  let idleT = 0, last = -1;
  function schedule() {
    clearTimeout(idleT);
    if (!waved) { arrive(); if (!waved) return; }
    if (document.hidden || !onScreen || still() || !dots.length) return;   // the 3D hero has no dots (19 Oct 2026)
    idleT = setTimeout(() => {
      let i; do { i = Math.floor(Math.random() * dots.length); } while (i === last && dots.length > 1);
      last = i; if (!dots[i]._hover) hop(dots[i]);
      schedule();
    }, 6000 + Math.random() * 3000);
  }
  arrive();
  setTimeout(schedule, 2400);                               // the first idle hop comes well after the wave

  // ================================================================ the demo of the tests: a pointer tries shades behind the logo, then the real one
  (function demo() {
    const d = document.querySelector('[data-dh-demo]'); if (!d) return;   // the games card sits at the end of the home since 21 Oct 2026
    const card = d.querySelector('.dh-demo-card'), chips = [...d.querySelectorAll('.dh-demo-chips i')], cur = d.querySelector('.dh-demo-cursor');
    const ORDER = [3, 0, 2, 1], REAL = 1;                    // three tries, then the real Coca-Cola red (the second shade)
    let timer = 0, step = 0, seen = false;
    const at = i => { const c = chips[i].getBoundingClientRect(), r = d.getBoundingClientRect(); return [c.left - r.left + c.width * .55, c.top - r.top + c.height * .55]; };
    const reset = () => { d.classList.remove('is-ok'); chips.forEach(c => c.classList.remove('is-on')); card.style.removeProperty('--bg'); step = 0; };
    function next() {
      timer = 0; if (!seen || document.hidden || still()) return;
      if (step >= ORDER.length) { reset(); timer = setTimeout(next, 700); return; }
      const i = ORDER[step++], [x, y] = at(i);
      d.classList.add('is-live'); cur.style.transform = `translate(${x}px,${y}px)`;
      timer = setTimeout(() => {
        chips.forEach((c, j) => c.classList.toggle('is-on', j === i)); card.style.setProperty('--bg', getComputedStyle(chips[i]).getPropertyValue('--c'));
        if (i === REAL) { d.classList.add('is-ok'); timer = setTimeout(next, 2200); } else timer = setTimeout(next, 650);
      }, 620);
    }
    if (still()) { chips[REAL].classList.add('is-on'); d.classList.add('is-ok'); card.style.setProperty('--bg', getComputedStyle(chips[REAL]).getPropertyValue('--c')); return; }   // still: the answer
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; clearTimeout(timer); timer = 0; if (seen) next(); }, { threshold: .4 }).observe(d);
    document.addEventListener('visibilitychange', () => { clearTimeout(timer); timer = 0; if (!document.hidden && seen) next(); });
  })();

  // ================================================================ the press band
  (function setupBand() {
    const band = hero.querySelector('.ph-band'), marquee = band && band.querySelector('.ph-marquee'), track = band && band.querySelector('.ph-track');
    if (!track) return;
    const SPEED = () => (innerWidth < 700 ? 20 : 26);   // px per second
    let river = null, rate = 0, raf = 0, lastB = 0, hold = true, hovering = false, focused = false, offscreen = false;
    const want = () => (hold || hovering || focused || offscreen || document.hidden ? 0 : 1);
    function steer(now) {                                 // the playback rate eases toward its target (in about 1.2 s, out about .45 s)
      raf = 0; if (!river) return;
      const dt = lastB ? Math.min(64, now - lastB) : 16; lastB = now;
      const target = want();
      rate += (target - rate) * (1 - Math.exp(-dt / (target > rate ? 300 : 140)));
      if (Math.abs(target - rate) < .004) rate = target;
      if (rate === 0) { river.pause(); lastB = 0; return; }
      river.updatePlaybackRate(rate); if (river.playState !== 'running') river.play();
      if (rate !== target) raf = requestAnimationFrame(steer); else lastB = 0;
    }
    const nudge = () => { if (!raf && river) raf = requestAnimationFrame(steer); };
    function setRiver() {
      if (still()) { root.classList.remove('ph-roll'); if (river) { river.cancel(); river = null; } return; }
      root.classList.add('ph-roll');
      const setW = track.firstElementChild.getBoundingClientRect().width; if (!setW) return;
      const duration = Math.max(8000, setW / SPEED() * 1000);
      if (river) { const p = river.currentTime / river.effect.getTiming().duration; river.effect.updateTiming({ duration }); river.currentTime = p * duration; return; }
      river = track.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration, iterations: Infinity, easing: 'linear' });
      river.pause(); rate = 0;
      const fadePx = parseFloat(getComputedStyle(marquee).getPropertyValue('--ph-fade')) || 0;
      river.currentTime = Math.max(0, (setW - fadePx) / setW) * duration;
      nudge();
    }
    marquee.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hovering = true; nudge(); } });
    marquee.addEventListener('pointerleave', () => { hovering = false; nudge(); });
    band.addEventListener('focusin', () => { focused = true; nudge(); });
    band.addEventListener('focusout', () => { focused = false; nudge(); });
    new IntersectionObserver(([e]) => { offscreen = !e.isIntersecting; nudge(); }).observe(band);
    document.addEventListener('visibilitychange', nudge);
    let rw = innerWidth;
    addEventListener('resize', () => { if (Math.abs(innerWidth - rw) > 40) { rw = innerWidth; setRiver(); } }, { passive: true });
    const onPrefs = () => { setRiver(); nudge(); };
    if (reduce.addEventListener) reduce.addEventListener('change', onPrefs);
    new MutationObserver(onPrefs).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
    setRiver();
    setTimeout(() => { hold = false; nudge(); }, 2200);  // rolls once the dots have said hello
  })();
})();

// ColorLoop in action, under the hero (moved from hero-3d.js, 20 Oct 2026): the clips play on their own while on screen (not with reduced motion)
(() => {
  const clips = [...document.querySelectorAll('.dh-clip video')]; if (!clips.length || !('IntersectionObserver' in window)) return;
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'paused';
  const io = new IntersectionObserver(es => es.forEach(e => { const c = e.target;
    if (e.isIntersecting && !still()) { if (!c.getAttribute('src')) c.src = c.dataset.src; const p = c.play(); if (p && p.catch) p.catch(() => {}); } else c.pause(); }), { rootMargin: '120px 0px' });
  clips.forEach(c => io.observe(c));
})();
