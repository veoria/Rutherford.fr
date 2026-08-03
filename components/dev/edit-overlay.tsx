'use client';

/**
 * In-place editing surface for the real homepage. Dev only, see app/dev/edit.
 *
 * The homepage components are rendered untouched. This overlay finds what is
 * editable by matching what is on screen against the English copy in
 * data/home/*.json and the paths in data/home/media.json, so no component had
 * to be instrumented and nothing here can affect the production page.
 *
 * Text: click a matched element, type, press Enter. Escape cancels.
 * Images: click a matched image, pick or upload a photo, frame it, save.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MediaCropper, type CropperHandle } from '@/components/dev/media-cropper';
import { useLanguage } from '@/components/language-provider';

type Field = { path: string; value: string };
type Media = { key: string; value: string };
type Link = { key: string; value: string };
type Section = { id: string; label: string; fields: Field[]; media: Media[]; links: Link[] };
type BankImage = { id: string; url: string; name: string; root: string; kind: string; publicPath?: string };
type Root = { id: string; label: string };

type TextTarget = { section: string; sectionLabel: string; path: string; original: string };
type MediaTarget = { key: string; value: string };
type Token = { name: string; label: string; role: string; value: string };

/** Relative luminance, per WCAG 2.1. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio between two hex colours, 1 to 21. */
function contrast(a: string, b: string): number {
  if (!/^#[0-9a-f]{6}$/i.test(a) || !/^#[0-9a-f]{6}$/i.test(b)) return 0;
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** Collapses whitespace and unifies the quote characters JSX and JSON disagree on. */
const norm = (value: string) =>
  value
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Strips the Next image loader wrapper so a src can be compared to a data path. */
const cleanSrc = (src: string) => {
  try {
    const url = new URL(src, window.location.origin);
    const inner = url.searchParams.get('url');
    return decodeURIComponent(inner ?? url.pathname);
  } catch {
    return src;
  }
};

export function EditOverlay() {
  const { locale, setLocale } = useLanguage();

  // The editor writes English, so the page has to be showing English for the
  // matching to line up. At the root the provider otherwise follows the browser
  // or a stored preference, which is why this is forced here. The stored
  // preference itself is put back, so normal browsing keeps its language.
  useEffect(() => {
    const stored = window.localStorage.getItem('rutherford-locale');
    if (locale !== 'en') setLocale('en');
    if (stored) window.localStorage.setItem('rutherford-locale', stored);
    else window.localStorage.removeItem('rutherford-locale');
  }, [locale, setLocale]);

  const [sections, setSections] = useState<Section[]>([]);
  const [bank, setBank] = useState<BankImage[]>([]);
  const [roots, setRoots] = useState<Root[]>([]);

  const [edits, setEdits] = useState<Record<string, { section: string; path: string; value: string }>>({});
  const [editing, setEditing] = useState<{
    target: TextTarget;
    el: HTMLElement;
    link: Link | null;
  } | null>(null);
  const linkRef = useRef<HTMLInputElement | null>(null);
  const [mediaTarget, setMediaTarget] = useState<MediaTarget | null>(null);
  const [status, setStatus] = useState<{ kind: 'idle' | 'busy' | 'ok' | 'error'; message: string }>({
    kind: 'idle',
    message: '',
  });

  const [pickedUrl, setPickedUrl] = useState<string | null>(null);
  const [pickedPublicPath, setPickedPublicPath] = useState<string | null>(null);
  const [rootFilter, setRootFilter] = useState('all');
  const [bankFilter, setBankFilter] = useState('');

  const [tokens, setTokens] = useState<Token[]>([]);
  const [themeOpen, setThemeOpen] = useState(false);
  const [themeDraft, setThemeDraft] = useState<Record<string, string>>({});

  const [layout, setLayout] = useState<{ order: string[]; hidden: string[] }>({ order: [], hidden: [] });
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [history, setHistory] = useState<{ depth: number; next: { label: string } | null }>({
    depth: 0,
    next: null,
  });

  const cropper = useRef<CropperHandle | null>(null);
  const objectUrl = useRef<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const load = useCallback(async () => {
    const [home, covers, theme, hist] = await Promise.all([
      fetch('/api/dev/home', { cache: 'no-store' }),
      fetch('/api/dev/covers', { cache: 'no-store' }),
      fetch('/api/dev/theme', { cache: 'no-store' }),
      fetch('/api/dev/history', { cache: 'no-store' }),
    ]);
    if (hist.ok) setHistory(await hist.json());
    if (home.ok) {
      const data = (await home.json()) as {
        sections: Section[];
        layout: { order: string[]; hidden: string[] };
      };
      setSections(data.sections);
      setLayout(data.layout ?? { order: [], hidden: [] });
    }
    if (covers.ok) {
      const data = (await covers.json()) as { bank: BankImage[]; roots: Root[] };
      setBank(data.bank);
      setRoots(data.roots ?? []);
    }
    if (theme.ok) {
      const data = (await theme.json()) as { tokens: Token[] };
      setTokens(data.tokens);
      setThemeDraft(Object.fromEntries(data.tokens.map((t) => [t.name, t.value])));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Text value -> the field it comes from. Ambiguous values are dropped. */
  const textIndex = useMemo(() => {
    const seen = new Map<string, TextTarget | null>();
    for (const section of sections) {
      for (const field of section.fields) {
        const key = norm(field.value);
        if (key.length < 2) continue;
        if (seen.has(key)) seen.set(key, null);
        else
          seen.set(key, {
            section: section.id,
            sectionLabel: section.label,
            path: field.path,
            original: field.value,
          });
      }
    }
    return seen;
  }, [sections]);

  const mediaIndex = useMemo(() => {
    const map = new Map<string, MediaTarget>();
    for (const section of sections) {
      for (const item of section.media) map.set(decodeURIComponent(item.value), item);
    }
    return map;
  }, [sections]);

  /** Tags every matched element in the page so CSS and clicks can find them. */
  const decorate = useCallback(() => {
    if (textIndex.size === 0 && mediaIndex.size === 0) return;

    // A value can match a leaf and every wrapper above it. Collect all of them,
    // then keep only the deepest, otherwise a whole section lights up when you
    // meant to click one line.
    const candidates = new Map<string, HTMLElement[]>();
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
      if (el.dataset.eoText) continue;
      if (el.closest('.eo-ui')) continue;
      const key = norm(el.textContent ?? '');
      if (!key || !textIndex.has(key)) continue;
      candidates.set(key, [...(candidates.get(key) ?? []), el]);
    }

    let texts = 0;
    for (const [key, elements] of candidates) {
      const target = textIndex.get(key);
      if (!target) continue;
      const deepest = elements.filter((el) => !elements.some((other) => other !== el && el.contains(other)));
      for (const el of deepest) {
        el.dataset.eoText = `${target.section}|${target.path}`;
        el.classList.add('eo-editable');
        texts += 1;
      }
    }

    let images = 0;
    for (const img of Array.from(document.querySelectorAll<HTMLImageElement>('img'))) {
      if (img.dataset.eoMedia) continue;
      if (img.closest('.eo-ui')) continue;
      const target = mediaIndex.get(cleanSrc(img.currentSrc || img.src));
      if (!target) continue;
      img.dataset.eoMedia = target.key;
      img.classList.add('eo-editable-media');
      images += 1;
    }

    return { texts, images };
  }, [textIndex, mediaIndex]);

  // The homepage lazy-loads sections, so re-decorate as they appear.
  //
  // Decorating writes classes and data attributes, which the observer would see
  // as new mutations: left connected it re-triggers itself forever and pins the
  // CPU. So it is disconnected around each pass and the pass is debounced.
  useEffect(() => {
    let frame = 0;
    let observer: MutationObserver | null = null;

    const pass = () => {
      observer?.disconnect();
      decorate();
      setStatus((current) => {
        if (current.kind === 'busy' || current.kind === 'error') return current;
        const texts = document.querySelectorAll('[data-eo-text]').length;
        const images = document.querySelectorAll('[data-eo-media]').length;
        return { kind: 'idle', message: `${texts} texts and ${images} photos editable on this page` };
      });
      observer?.observe(document.body, { childList: true, subtree: true });
    };

    const schedule = () => {
      window.clearTimeout(frame);
      frame = window.setTimeout(pass, 250);
    };

    pass();
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer?.disconnect();
      window.clearTimeout(frame);
    };
  }, [decorate]);

  // Click handling, captured at the document so it beats the page's own links.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const el = event.target as HTMLElement | null;
      if (!el || el.closest('.eo-ui')) return;

      const img = el.closest<HTMLImageElement>('[data-eo-media]');
      if (img) {
        event.preventDefault();
        event.stopPropagation();
        const key = img.dataset.eoMedia as string;
        const current = mediaIndex.get(cleanSrc(img.currentSrc || img.src));
        setMediaTarget({ key, value: current?.value ?? '' });
        setPickedUrl(null);
        setPickedPublicPath(null);
        return;
      }

      const text = el.closest<HTMLElement>('[data-eo-text]');
      if (text) {
        event.preventDefault();
        event.stopPropagation();
        const [section, path] = (text.dataset.eoText as string).split('|');
        const found = sections.find((s) => s.id === section);
        const field = found?.fields.find((f) => f.path === path);
        if (!found || !field) return;

        // When the text sits inside a link, offer its destination as well.
        const anchor = text.closest('a');
        const href = anchor?.getAttribute('href') ?? null;
        const link = href ? found.links.find((l) => l.value === href) ?? null : null;

        setEditing({
          target: { section, sectionLabel: found.label, path, original: field.value },
          el: text,
          link,
        });
      }
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [sections, mediaIndex]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(
    () => () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    [],
  );

  /** Button destinations are written straight away: there is only one of them. */
  const saveLink = useCallback(async (key: string, href: string) => {
    setStatus({ kind: 'busy', message: 'Saving the link…' });
    const res = await fetch('/api/dev/home', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ linkKey: key, href }),
    });
    const data = (await res.json()) as { error?: string; href?: string };
    if (!res.ok) {
      setStatus({ kind: 'error', message: data.error ?? 'Save failed.' });
      return false;
    }
    setStatus({ kind: 'ok', message: `Link now points at ${data.href}` });
    return true;
  }, []);

  const commitText = useCallback(
    (value: string) => {
      if (!editing) return;
      const { section, path, original } = editing.target;
      const key = `${section}|${path}`;
      setEdits((current) => {
        const next = { ...current };
        if (value === original) delete next[key];
        else next[key] = { section, path, value };
        return next;
      });
      // Show it straight away; the file write happens on Save.
      editing.el.textContent = value;
      editing.el.classList.toggle('eo-dirty', value !== original);
      setEditing(null);
    },
    [editing],
  );

  const saveAll = useCallback(async () => {
    const list = Object.values(edits);
    if (list.length === 0) return;
    setStatus({ kind: 'busy', message: 'Saving…' });

    const bySection = new Map<string, { path: string; value: string }[]>();
    for (const edit of list) {
      bySection.set(edit.section, [...(bySection.get(edit.section) ?? []), { path: edit.path, value: edit.value }]);
    }

    for (const [section, sectionEdits] of bySection) {
      const res = await fetch('/api/dev/home', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ section, edits: sectionEdits }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setStatus({ kind: 'error', message: data.error ?? 'Save failed.' });
        return;
      }
    }

    setEdits({});
    setStatus({ kind: 'ok', message: `${list.length} change(s) saved` });
    window.setTimeout(() => window.location.reload(), 700);
  }, [edits]);

  const saveMedia = useCallback(
    async (mode: 'crop' | 'asis') => {
      if (!mediaTarget) return;
      setStatus({ kind: 'busy', message: 'Saving…' });
      const payload: { mediaKey: string; dataUrl?: string; image?: string } = { mediaKey: mediaTarget.key };
      if (mode === 'asis' && pickedPublicPath) payload.image = pickedPublicPath;
      else {
        const dataUrl = cropper.current?.getCrop();
        if (!dataUrl) {
          setStatus({ kind: 'error', message: 'Nothing to export.' });
          return;
        }
        payload.dataUrl = dataUrl;
      }

      const res = await fetch('/api/dev/home', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string; image?: string };
      if (!res.ok) {
        setStatus({ kind: 'error', message: data.error ?? 'Save failed.' });
        return;
      }
      setStatus({ kind: 'ok', message: `Saved to ${data.image}` });
      setMediaTarget(null);
      window.setTimeout(() => window.location.reload(), 700);
    },
    [mediaTarget, pickedPublicPath],
  );

  /** Steps back through the shared undo stack: text, photos, links, colours, layout. */
  const undo = useCallback(async () => {
    setStatus({ kind: 'busy', message: 'Undoing…' });
    const res = await fetch('/api/dev/history', { method: 'POST' });
    const data = (await res.json()) as { error?: string; undone?: string };
    if (!res.ok) {
      setStatus({ kind: 'error', message: data.error ?? 'Nothing to undo.' });
      return;
    }
    setStatus({ kind: 'ok', message: `Undone: ${data.undone}` });
    window.setTimeout(() => window.location.reload(), 700);
  }, []);

  const saveLayout = useCallback(
    async (next: { order: string[]; hidden: string[] }) => {
      setLayout(next);
      setStatus({ kind: 'busy', message: 'Saving the layout…' });
      const res = await fetch('/api/dev/home', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ layout: next }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus({ kind: 'error', message: data.error ?? 'Save failed.' });
        return;
      }
      setStatus({ kind: 'ok', message: 'Layout saved' });
      window.setTimeout(() => window.location.reload(), 700);
    },
    [],
  );

  /** Paints a colour straight onto the document, so the page previews live. */
  const previewToken = useCallback((name: string, value: string) => {
    setThemeDraft((current) => ({ ...current, [name]: value }));
    document.documentElement.style.setProperty(`--${name}`, value);
  }, []);

  const resetTheme = useCallback(() => {
    for (const token of tokens) document.documentElement.style.removeProperty(`--${token.name}`);
    setThemeDraft(Object.fromEntries(tokens.map((t) => [t.name, t.value])));
  }, [tokens]);

  const saveTheme = useCallback(async () => {
    setStatus({ kind: 'busy', message: 'Saving the palette…' });
    const res = await fetch('/api/dev/theme', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ values: themeDraft }),
    });
    const data = (await res.json()) as { error?: string; changed?: string[] };
    if (!res.ok) {
      setStatus({ kind: 'error', message: data.error ?? 'Save failed.' });
      return;
    }
    setStatus({ kind: 'ok', message: `${data.changed?.length ?? 0} colour(s) saved` });
    window.setTimeout(() => window.location.reload(), 800);
  }, [themeDraft]);

  const themeDirty = useMemo(
    () => tokens.filter((t) => themeDraft[t.name] && themeDraft[t.name] !== t.value),
    [tokens, themeDraft],
  );

  const visibleBank = useMemo(() => {
    const q = bankFilter.trim().toLowerCase();
    return bank
      .filter((b) => (rootFilter === 'all' ? true : b.root === rootFilter))
      .filter((b) => b.kind === 'photo')
      .filter((b) => (q ? b.name.toLowerCase().includes(q) : true))
      .slice(0, 90);
  }, [bank, bankFilter, rootFilter]);

  const dirtyCount = Object.keys(edits).length;

  return (
    <div className="eo-ui">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="eo-bar">
        <span className="eo-brand">Edit mode</span>
        <span className="eo-locale">English</span>
        <span className="eo-hint">{status.message || 'Click any text or photo to edit it'}</span>
        <div className="eo-bar-actions">
          <button
            type="button"
            className="eo-btn eo-undo"
            disabled={history.depth === 0 || status.kind === 'busy'}
            onClick={undo}
            title={history.next ? `Undo ${history.next.label}` : 'Nothing to undo'}
            aria-label="Undo the last change"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M9 7H15a5 5 0 0 1 0 10h-4M9 7 5.5 4M9 7l-3.5 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {history.depth > 0 ? <span className="eo-undo-count">{history.depth}</span> : null}
          </button>
          <button
            type="button"
            className={`eo-btn${sectionsOpen ? ' primary' : ''}`}
            onClick={() => setSectionsOpen((open) => !open)}
          >
            Sections
          </button>
          {dirtyCount > 0 ? (
            <button type="button" className="eo-btn ghost" onClick={() => window.location.reload()}>
              Discard
            </button>
          ) : null}
          <button
            type="button"
            className="eo-btn primary"
            disabled={dirtyCount === 0 || status.kind === 'busy'}
            onClick={saveAll}
          >
            {dirtyCount === 0 ? 'Nothing to save' : `Save ${dirtyCount} change(s)`}
          </button>
          <button
            type="button"
            className={`eo-btn${themeOpen ? ' primary' : ''}`}
            onClick={() => setThemeOpen((open) => !open)}
          >
            Colours
          </button>
          <a className="eo-btn" href="/dev/home">
            Field list
          </a>
        </div>
      </div>

      {sectionsOpen ? (
        <aside className="eo-theme">
          <p className="eo-theme-head">Sections</p>
          <p className="eo-theme-sub">
            Untick to take a section off the page, drag order with the arrows. Nothing is deleted: a
            hidden section keeps its text and photos and comes back the moment you tick it again.
          </p>

          <ol className="eo-sections">
            {layout.order.map((id, index) => {
              const section = sections.find((s) => s.id === id);
              const hidden = layout.hidden.includes(id);
              return (
                <li key={id} className={hidden ? 'is-hidden' : ''}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!hidden}
                      onChange={() =>
                        saveLayout({
                          order: layout.order,
                          hidden: hidden
                            ? layout.hidden.filter((h) => h !== id)
                            : [...layout.hidden, id],
                        })
                      }
                    />
                    <span>{section?.label ?? id}</span>
                  </label>
                  <span className="eo-move">
                    <button
                      type="button"
                      disabled={index === 0}
                      title="Move up"
                      onClick={() => {
                        const order = [...layout.order];
                        [order[index - 1], order[index]] = [order[index], order[index - 1]];
                        saveLayout({ order, hidden: layout.hidden });
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === layout.order.length - 1}
                      title="Move down"
                      onClick={() => {
                        const order = [...layout.order];
                        [order[index], order[index + 1]] = [order[index + 1], order[index]];
                        saveLayout({ order, hidden: layout.hidden });
                      }}
                    >
                      ↓
                    </button>
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="eo-theme-sub" style={{ margin: '10px 0 0' }}>
            The hero and the footer are fixtures and are not listed.
          </p>
        </aside>
      ) : null}

      {themeOpen ? (
        <aside className="eo-theme">
          <p className="eo-theme-head">Brand palette</p>
          <p className="eo-theme-sub">
            These seven colours drive the whole site: the accent alone is used 206 times. Changes
            preview live and only reach the stylesheet when you save.
          </p>

          {tokens.map((token) => {
            const value = themeDraft[token.name] ?? token.value;
            const changed = value !== token.value;
            return (
              <label key={token.name} className={`eo-swatch${changed ? ' is-changed' : ''}`}>
                <input
                  type="color"
                  value={value}
                  onChange={(event) => previewToken(token.name, event.target.value)}
                />
                <span className="eo-swatch-label">
                  <strong>{token.label}</strong>
                  <em>--{token.name}</em>
                </span>
                <input
                  className="eo-swatch-hex"
                  type="text"
                  value={value}
                  onChange={(event) => {
                    const next = event.target.value;
                    setThemeDraft((current) => ({ ...current, [token.name]: next }));
                    if (/^#[0-9a-f]{6}$/i.test(next)) previewToken(token.name, next);
                  }}
                />
              </label>
            );
          })}

          <div className="eo-contrast">
            {[
              ['Body text on the page', themeDraft.text, themeDraft.bg, 4.5],
              ['Secondary text on the page', themeDraft.muted, themeDraft.bg, 4.5],
              ['Accent on the page', themeDraft.accent, themeDraft.bg, 3],
            ].map(([label, fg, bg, min]) => {
              const ratio = contrast(String(fg ?? ''), String(bg ?? ''));
              const ok = ratio >= Number(min);
              return (
                <p key={String(label)} className={ok ? 'is-ok' : 'is-warn'}>
                  {String(label)}: {ratio ? ratio.toFixed(1) : '–'}:1{' '}
                  {ok ? 'readable' : `below the ${min}:1 minimum`}
                </p>
              );
            })}
          </div>

          <div className="eo-theme-actions">
            <button
              type="button"
              className="eo-btn primary"
              disabled={themeDirty.length === 0 || status.kind === 'busy'}
              onClick={saveTheme}
            >
              {themeDirty.length === 0 ? 'No change' : `Save ${themeDirty.length} colour(s)`}
            </button>
            <button type="button" className="eo-btn" onClick={resetTheme}>
              Reset
            </button>
          </div>
        </aside>
      ) : null}

      {editing ? (
        <div className="eo-modal" role="dialog" aria-label="Edit text">
          <div className="eo-modal-card">
            <p className="eo-modal-head">
              {editing.target.sectionLabel} <code>{editing.target.path}</code>
            </p>
            <textarea
              ref={inputRef}
              defaultValue={
                edits[`${editing.target.section}|${editing.target.path}`]?.value ?? editing.target.original
              }
              rows={Math.min(10, Math.ceil(editing.target.original.length / 70) + 1)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setEditing(null);
                // Enter inserts a line break, so applying needs the modifier.
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  commitText(event.currentTarget.value);
                }
              }}
            />
            {editing.link ? (
              <label className="eo-linkfield">
                <span>Where this button goes</span>
                <input
                  ref={linkRef}
                  type="text"
                  defaultValue={editing.link.value}
                  placeholder="/console-validation, https://…, mailto:…"
                />
              </label>
            ) : null}

            <p className="eo-modal-foot">
              Enter starts a new line. Cmd plus Enter applies, Escape cancels. English only, the other
              languages stay as they are.
            </p>
            <div className="eo-modal-actions">
              <button type="button" className="eo-btn ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="eo-btn primary"
                onClick={async () => {
                  const link = editing.link;
                  const nextHref = linkRef.current?.value.trim();
                  if (link && nextHref && nextHref !== link.value) {
                    const ok = await saveLink(link.key, nextHref);
                    if (!ok) return;
                  }
                  commitText(inputRef.current?.value ?? editing.target.original);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {mediaTarget ? (
        <div className="eo-modal" role="dialog" aria-label="Replace photo">
          <div className="eo-modal-card is-wide">
            <p className="eo-modal-head">
              Photo <code>{mediaTarget.key}</code>
            </p>

            <MediaCropper ref={cropper} src={pickedUrl ?? encodeURI(mediaTarget.value)} stageWidth={640} />

            <div className="eo-modal-actions">
              <label className="eo-btn">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
                    const url = URL.createObjectURL(file);
                    objectUrl.current = url;
                    setPickedUrl(url);
                    setPickedPublicPath(null);
                  }}
                />
              </label>
              <button type="button" className="eo-btn primary" onClick={() => saveMedia('crop')}>
                Save this crop
              </button>
              {pickedPublicPath ? (
                <button type="button" className="eo-btn" onClick={() => saveMedia('asis')}>
                  Use original
                </button>
              ) : null}
              <button type="button" className="eo-btn ghost" onClick={() => setMediaTarget(null)}>
                Cancel
              </button>
            </div>

            <div className="eo-bankbar">
              <button
                type="button"
                className={`eo-chip${rootFilter === 'all' ? ' is-active' : ''}`}
                onClick={() => setRootFilter('all')}
              >
                All
              </button>
              {roots.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`eo-chip${rootFilter === r.id ? ' is-active' : ''}`}
                  onClick={() => setRootFilter(r.id)}
                >
                  {r.label}
                </button>
              ))}
              <input
                className="eo-input"
                placeholder="Filter by filename"
                value={bankFilter}
                onChange={(event) => setBankFilter(event.target.value)}
              />
            </div>

            <div className="eo-bank">
              {visibleBank.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className="eo-thumb"
                  title={b.name}
                  onClick={() => {
                    setPickedUrl(b.url);
                    setPickedPublicPath(b.publicPath ?? null);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.url} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const CSS = `
body { padding-top: 46px; }
.eo-editable { outline: 1px dashed rgba(224,168,0,0.55); outline-offset: 2px; cursor: text; border-radius: 2px; transition: background 0.12s ease; }
.eo-editable:hover { background: rgba(224,168,0,0.16); outline-style: solid; }
.eo-editable.eo-dirty { background: rgba(224,168,0,0.28); outline: 2px solid #e0a800; }
.eo-editable-media { outline: 2px dashed rgba(22,22,15,0.5); outline-offset: -4px; cursor: pointer; }
.eo-editable-media:hover { outline: 3px solid #16160f; }
.eo-ui { font: 14px/1.5 system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
.eo-ui * { box-sizing: border-box; }
.eo-bar { position: fixed; top: 0; left: 0; right: 0; height: 46px; z-index: 2147483000; display: flex; align-items: center; gap: 14px; padding: 0 14px; background: #16160f; color: #fff; }
.eo-brand { font-weight: 700; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; background: #e0a800; color: #16160f; padding: 3px 9px; border-radius: 999px; }
.eo-locale { font-size: 11px; border: 1px solid rgba(255,255,255,0.35); border-radius: 999px; padding: 2px 9px; }
.eo-hint { font-size: 12px; opacity: 0.75; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.eo-bar-actions { display: flex; gap: 8px; }
.eo-btn { display: inline-flex; align-items: center; font: inherit; font-size: 13px; font-weight: 600; border: 1px solid #d6d6cb; background: #fff; color: #16160f; border-radius: 8px; padding: 7px 14px; cursor: pointer; text-decoration: none; }
.eo-btn:hover { background: #f2f2ea; }
.eo-btn.primary { background: #e0a800; border-color: #e0a800; }
/* Ghost is white-on-dark, which only works inside the bar. In the modals it
   sits on white, so it keeps the normal dark text. */
.eo-bar .eo-btn.ghost { background: transparent; color: #fff; border-color: rgba(255,255,255,0.35); }
.eo-bar .eo-btn.ghost:hover { background: rgba(255,255,255,0.12); }
.eo-modal .eo-btn.ghost { background: #fff; color: #16160f; border-color: #d6d6cb; }
.eo-modal .eo-btn.ghost:hover { background: #f2f2ea; }
.eo-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.eo-undo { padding: 7px 10px; gap: 5px; }
.eo-undo-count { font-size: 10px; background: #16160f; color: #fff; border-radius: 999px; padding: 0 5px; line-height: 15px; }
.eo-sections { list-style: none; margin: 0; padding: 0; counter-reset: s; }
.eo-sections li { display: flex; align-items: center; gap: 8px; padding: 5px 6px; border-radius: 8px; }
.eo-sections li:hover { background: #f7f7f3; }
.eo-sections li.is-hidden span { opacity: 0.45; text-decoration: line-through; }
.eo-sections label { display: flex; align-items: center; gap: 8px; flex: 1; font-size: 12px; cursor: pointer; min-width: 0; }
.eo-sections label span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.eo-move { display: flex; gap: 2px; flex: 0 0 auto; }
.eo-move button { font: inherit; font-size: 12px; line-height: 1; width: 22px; height: 22px; border: 1px solid #d6d6cb; background: #fff; border-radius: 6px; cursor: pointer; }
.eo-move button:hover:not(:disabled) { background: #f2f2ea; }
.eo-move button:disabled { opacity: 0.3; cursor: not-allowed; }
.eo-theme { position: fixed; top: 54px; right: 12px; z-index: 2147483000; width: 320px; max-height: calc(100vh - 70px); overflow-y: auto; background: #fff; border: 1px solid #d6d6cb; border-radius: 14px; padding: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.22); }
.eo-theme-head { margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #16160f; }
.eo-theme-sub { margin: 0 0 14px; font-size: 11px; line-height: 1.5; color: #6b6b5f; }
.eo-swatch { display: flex; align-items: center; gap: 10px; padding: 6px; border-radius: 9px; margin-bottom: 4px; }
.eo-swatch.is-changed { background: #fffaeb; }
.eo-swatch input[type=color] { width: 34px; height: 34px; padding: 0; border: 1px solid #d6d6cb; border-radius: 8px; background: none; cursor: pointer; flex: 0 0 auto; }
.eo-swatch-label { flex: 1; min-width: 0; }
.eo-swatch-label strong { display: block; font-size: 12px; font-weight: 600; color: #16160f; }
.eo-swatch-label em { display: block; font-style: normal; font-size: 10px; color: #8a8a7c; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.eo-swatch-hex { width: 82px; font: inherit; font-size: 11px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; padding: 5px 7px; border: 1px solid #d6d6cb; border-radius: 7px; flex: 0 0 auto; }
.eo-contrast { margin: 12px 0; padding: 10px; border-radius: 9px; background: #f7f7f3; }
.eo-contrast p { margin: 0 0 4px; font-size: 11px; line-height: 1.4; }
.eo-contrast p:last-child { margin-bottom: 0; }
.eo-contrast p.is-ok { color: #14532d; }
.eo-contrast p.is-warn { color: #9a3412; font-weight: 600; }
.eo-theme-actions { display: flex; gap: 8px; }
.eo-modal { position: fixed; inset: 0; z-index: 2147483001; background: rgba(22,22,15,0.55); display: flex; align-items: center; justify-content: center; padding: 24px; }
.eo-modal-card { background: #fff; border-radius: 14px; padding: 20px; width: 100%; max-width: 620px; max-height: 88vh; overflow: auto; }
.eo-modal-card.is-wide { max-width: 760px; }
.eo-modal-head { margin: 0 0 12px; font-size: 13px; color: #6b6b5f; }
.eo-modal-head code { background: #ecece4; padding: 1px 6px; border-radius: 4px; }
.eo-modal-card textarea { width: 100%; font: inherit; font-size: 15px; padding: 10px 12px; border: 1px solid #d6d6cb; border-radius: 10px; resize: vertical; }
.eo-modal-card textarea:focus { outline: 2px solid #e0a800; outline-offset: -1px; }
.eo-linkfield { display: block; margin-top: 12px; }
.eo-linkfield span { display: block; font-size: 11px; color: #8a8a7c; margin-bottom: 4px; }
.eo-linkfield input { width: 100%; font: inherit; font-size: 13px; padding: 8px 11px; border: 1px solid #d6d6cb; border-radius: 9px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.eo-linkfield input:focus { outline: 2px solid #e0a800; outline-offset: -1px; }
.eo-modal-foot { margin: 8px 0 0; font-size: 11px; color: #8a8a7c; }
.eo-modal-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
.eo-bankbar { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; margin: 16px 0 8px; padding-top: 14px; border-top: 1px solid #eeeee7; }
.eo-chip { font: inherit; font-size: 11px; padding: 4px 9px; border: 1px solid #d6d6cb; background: #fff; border-radius: 999px; cursor: pointer; }
.eo-chip.is-active { background: #16160f; color: #fff; border-color: #16160f; }
.eo-input { padding: 6px 10px; border: 1px solid #d6d6cb; border-radius: 8px; font: inherit; font-size: 12px; margin-left: auto; }
.eo-bank { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 6px; max-height: 240px; overflow-y: auto; }
.eo-thumb { position: relative; display: block; width: 100%; height: 0; padding: 0 0 78% 0; border: 1px solid #e4e4db; border-radius: 6px; overflow: hidden; background: #ecece4; cursor: pointer; }
.eo-thumb:hover { border-color: #16160f; }
.eo-thumb img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
`;
