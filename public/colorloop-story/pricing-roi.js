// pricing-roi.js (19 Oct 2026, v2): the ROI estimator of rutherford.fr/roi on pricing.html (COLORLOOP-FACTS.md section 6).
// 225 production days a year; ColorLoop targets −55% sheet waste and −38% makeready time. The profile and the format set the
// defaults (makereadies per day, makeready time, waste, paper, press cost); the sliders fine-tune them; each color above the
// profile's typical count adds 6% makeready time and 9% waste. The monthly saving is set against €590 a month (FX, 21 Oct 2026).
// The figures count to their new value (380 ms); with reduced motion or html[data-motion="paused"] they change at once.
(() => {
  const box = document.querySelector('[data-roi]'); if (!box) return;
  const DAYS = 225, WASTE = .55, TIME = .38, PRICE = 5300;
  const PROFILES = { commercial: { mr: 10, colors: 4, min: 30, waste: 200, g: 100, kg: 1.00 },
                     carton: { mr: 3, colors: 6, min: 120, waste: 800, g: 280, kg: 1.15 },
                     luxury: { mr: 2, colors: 6, min: 150, waste: 950, g: 330, kg: 1.35 } };
  const FORMATS = { b2: { w: .75, h: .53, cost: 110 }, b1: { w: 1.0, h: .707, cost: 150 }, xl: { w: 1.62, h: 1.1, cost: 220 } };
  const st = { profile: 'carton', format: 'b1', colors: 6, mr: 3, min: 120, waste: 800, cost: 150 };
  const root = document.documentElement, reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => reduce.matches || root.dataset.motion === 'paused';
  const LG = document.documentElement.lang, FR = LG === 'fr', ES = LG === 'es', IT = LG === 'it', PT = LG === 'pt', tr = (fr, es, en, it, pt) => FR ? fr : ES ? es : IT ? it : PT ? pt : en;   // the page's language (tools/i18n.py)
  const eur = n => FR || ES || IT || PT ? Math.round(n).toLocaleString(FR ? 'fr-FR' : ES ? 'es-ES' : IT ? 'it-IT' : 'pt-PT') + '\u00a0€' : '€' + Math.round(n).toLocaleString('en-US');
  const out = k => box.querySelector(`[data-out="${k}"]`);
  const colorsEl = box.querySelector('[data-colors]');
  const sliders = [...box.querySelectorAll('[data-s]')];
  const shown = { total: 0, paper: 0, time: 0, days: 0 };
  function syncSliders() {
    sliders.forEach(s => { s.value = st[s.dataset.s]; box.querySelector(`[data-sv="${s.dataset.s}"]`).textContent = st[s.dataset.s]; paint(s); });
  }
  function paint(s) { s.style.setProperty('--p', ((s.value - s.min) / (s.max - s.min) * 100).toFixed(1) + '%'); }
  function calc() {
    const p = PROFILES[st.profile], f = FORMATS[st.format], extra = Math.max(0, st.colors - p.colors);
    const min = st.min * (1 + .06 * extra), waste = st.waste * (1 + .09 * extra);
    const sheet = f.w * f.h * (p.g / 1000) * p.kg;
    const paper = DAYS * st.mr * waste * WASTE * sheet, time = DAYS * st.mr * (min * TIME / 60) * st.cost, total = paper + time;
    return { total, paper, time, days: Math.max(1, Math.ceil(PRICE / Math.max(1, total / DAYS))) };
  }
  let raf = 0;
  function render(to) {
    cancelAnimationFrame(raf);
    const from = { ...shown }, t0 = performance.now(), dur = still() ? 0 : 380;
    const step = now => {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3);
      for (const key of Object.keys(to)) shown[key] = from[key] + (to[key] - from[key]) * e;
      out('total').textContent = eur(shown.total); out('month').textContent = eur(shown.total / 12);
      out('paper').textContent = eur(shown.paper); out('time').textContent = eur(shown.time); if (out('day')) out('day').textContent = eur(shown.total / 12);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.k) {
      st[b.dataset.k] = b.dataset.v;
      if (b.dataset.k === 'profile') { const p = PROFILES[st.profile]; Object.assign(st, { colors: p.colors, mr: p.mr, min: p.min, waste: p.waste }); }
      if (b.dataset.k === 'format') st.cost = FORMATS[st.format].cost;
      box.querySelectorAll(`[data-k="${b.dataset.k}"]`).forEach(x => x.setAttribute('aria-checked', String(x === b)));
      syncSliders();
    }
    if (b.dataset.step) st.colors = Math.min(10, Math.max(1, st.colors + +b.dataset.step));
    colorsEl.textContent = st.colors;
    render(calc());
  });
  sliders.forEach(s => s.addEventListener('input', () => { st[s.dataset.s] = +s.value; box.querySelector(`[data-sv="${s.dataset.s}"]`).textContent = s.value; paint(s); render(calc()); }));
  box.addEventListener('keydown', e => {
    const b = e.target.closest('[role="radio"]'); if (!b || !/Arrow(Left|Right|Up|Down)/.test(e.key)) return;
    const all = [...box.querySelectorAll(`[data-k="${b.dataset.k}"]`)], i = all.indexOf(b), n = all[(i + (/Right|Down/.test(e.key) ? 1 : -1) + all.length) % all.length];
    e.preventDefault(); n.focus(); n.click();
  });
  // the press of rutherford.fr/roi, live: the format widens it, the colors add or remove towers
  const pg = box.querySelector('[data-press]'), FMAP = { b2: 'b2', b1: 'b1', xl: 'vlf' };
  const press = pg && window.PressSchematic ? window.PressSchematic(pg, { format: FMAP[st.format], colors: st.colors }) : null;
  box.addEventListener('click', () => { if (press) { press.setFormat(FMAP[st.format]); press.setColors(st.colors); } });
  // a shared estimate opens with its settings (pricing.html?roi=profile.format.colors.mr.min.waste.cost#roi)
  const q = new URLSearchParams(location.search).get('roi');
  if (q) {
    const [p, f, ...n] = q.split('.'), num = n.map(Number);
    if (PROFILES[p]) st.profile = p; if (FORMATS[f]) st.format = f;
    const lim = { colors: [1, 10], mr: [1, 20], min: [10, 240], waste: [50, 2000], cost: [60, 400] };
    ['colors', 'mr', 'min', 'waste', 'cost'].forEach((k, i) => { if (Number.isFinite(num[i])) st[k] = Math.min(lim[k][1], Math.max(lim[k][0], num[i])); });
    ['profile', 'format'].forEach(k => box.querySelectorAll(`[data-k="${k}"]`).forEach(x => x.setAttribute('aria-checked', String(x.dataset.v === st[k]))));
    colorsEl.textContent = st.colors; if (press) { press.setFormat(FMAP[st.format]); press.setColors(st.colors); }
  }
  // share (20 Oct 2026, v2): on phones the share sheet; elsewhere a small panel: copy the link, email, WhatsApp, LinkedIn.
  // The copy works without the clipboard permission too (a selected field), and says so.
  const shareBtn = box.querySelector('[data-share]'), shared = box.querySelector('[data-shared]');
  const shareUrl = () => location.origin + location.pathname + '?roi=' + [st.profile, st.format, st.colors, st.mr, st.min, st.waste, st.cost].join('.') + '#roi';
  const shareText = () => tr('Estimation ColorLoop pour notre presse\u00a0: environ ' + eur(calc().total) + ' par an. Faites le calcul avec vos chiffres\u00a0:', 'Estimación ColorLoop para nuestra máquina: unos ' + eur(calc().total) + ' al año. Haga el cálculo con sus propias cifras:', 'ColorLoop ROI estimate for our press: about ' + eur(calc().total) + ' a year. Try it with your own numbers:', 'Stima ColorLoop per la nostra macchina: circa ' + eur(calc().total) + ' all’anno. Faccia il calcolo con i suoi numeri:', 'Estimativa ColorLoop para a nossa máquina: cerca de ' + eur(calc().total) + ' por ano. Faça as contas com os seus números:');
  const touch = matchMedia('(hover: none) and (pointer: coarse)').matches;
  let panel = null;
  function copy(t) {
    const done = () => { shared.textContent = (tr('Lien copié. Collez-le dans un email ou un message.', 'Enlace copiado. Péguelo en un email o un mensaje.', 'Link copied. Paste it in an email or a message.', 'Link copiato. Lo incolli in un’email o in un messaggio.', 'Link copiado. Cole-o num email ou numa mensagem.')); };
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t).then(done, () => legacy(t, done));
    legacy(t, done);
  }
  function legacy(t, done) {
    const f = document.createElement('textarea'); f.value = t; f.setAttribute('readonly', ''); f.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(f); f.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    f.remove(); if (ok) done(); else shared.textContent = (tr('Sélectionnez et copiez\u00a0: ', 'Seleccione y copie: ', 'Select and copy: ', 'Selezioni e copi: ', 'Selecione e copie: ')) + t;
  }
  function openPanel() {
    const url = shareUrl(), text = shareText(), msg = text + ' ' + url;
    if (!panel) { panel = document.createElement('div'); panel.className = 'roi-sharepanel'; panel.setAttribute('role', 'group'); panel.setAttribute('aria-label', (tr('Partager cette estimation', 'Compartir esta estimación', 'Share this estimate', 'Condividi questa stima', 'Partilhar esta estimativa'))); shareBtn.parentNode.after(panel); }
    panel.innerHTML =
      '<button type="button" data-copy>' + (tr('Copier le lien', 'Copiar el enlace', 'Copy link', 'Copia il link', 'Copiar o link')) + '</button>' +
      `<a href="mailto:?subject=${encodeURIComponent(tr('Estimation ColorLoop', 'Estimación ColorLoop', 'ColorLoop ROI estimate', 'Stima ColorLoop', 'Estimativa ColorLoop'))}&body=${encodeURIComponent(msg)}">Email</a>` +
      `<a href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">WhatsApp</a>` +
      `<a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" target="_blank" rel="noopener">LinkedIn</a>`;
    panel.querySelector('[data-copy]').addEventListener('click', () => copy(msg));
    panel.hidden = false; shareBtn.setAttribute('aria-expanded', 'true'); shared.textContent = '';
  }
  if (shareBtn) {
    shareBtn.setAttribute('aria-expanded', 'false');
    shareBtn.addEventListener('click', async () => {
      if (touch && navigator.share) { try { await navigator.share({ title: tr('Estimation ColorLoop', 'Estimación ColorLoop', 'ColorLoop ROI estimate', 'Stima ColorLoop', 'Estimativa ColorLoop'), text: shareText(), url: shareUrl() }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
      if (panel && !panel.hidden) { panel.hidden = true; shareBtn.setAttribute('aria-expanded', 'false'); return; }
      openPanel();
    });
    box.addEventListener('click', e => { if (panel && !panel.hidden && !e.target.closest('[data-share],.roi-sharepanel') && e.target.closest('button[data-k],button[data-step]')) openPanel(); });   // settings changed: the links follow
    sliders.forEach(sl => sl.addEventListener('change', () => { if (panel && !panel.hidden) openPanel(); }));
  }
  syncSliders();
  const first = calc();
  Object.assign(shown, still() ? first : { total: 0, paper: 0, time: 0, days: 0 });
  if (still()) render(first);
  else new IntersectionObserver(([e], io) => { if (e.isIntersecting) { io.disconnect(); render(first); } }, { threshold: .3 }).observe(box.querySelector('.roi-out'));
})();
