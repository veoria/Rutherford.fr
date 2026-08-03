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
type Section = { id: string; label: string; fields: Field[]; media: Media[] };
type BankImage = { id: string; url: string; name: string; root: string; kind: string; publicPath?: string };
type Root = { id: string; label: string };

type TextTarget = { section: string; sectionLabel: string; path: string; original: string };
type MediaTarget = { key: string; value: string };

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
  const [editing, setEditing] = useState<{ target: TextTarget; el: HTMLElement } | null>(null);
  const [mediaTarget, setMediaTarget] = useState<MediaTarget | null>(null);
  const [status, setStatus] = useState<{ kind: 'idle' | 'busy' | 'ok' | 'error'; message: string }>({
    kind: 'idle',
    message: '',
  });

  const [pickedUrl, setPickedUrl] = useState<string | null>(null);
  const [pickedPublicPath, setPickedPublicPath] = useState<string | null>(null);
  const [rootFilter, setRootFilter] = useState('all');
  const [bankFilter, setBankFilter] = useState('');

  const cropper = useRef<CropperHandle | null>(null);
  const objectUrl = useRef<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const load = useCallback(async () => {
    const [home, covers] = await Promise.all([
      fetch('/api/dev/home', { cache: 'no-store' }),
      fetch('/api/dev/covers', { cache: 'no-store' }),
    ]);
    if (home.ok) setSections(((await home.json()) as { sections: Section[] }).sections);
    if (covers.ok) {
      const data = (await covers.json()) as { bank: BankImage[]; roots: Root[] };
      setBank(data.bank);
      setRoots(data.roots ?? []);
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
      if (el.closest('.eo-ui')) continue;
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
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
      if (img.closest('.eo-ui')) continue;
      const target = mediaIndex.get(cleanSrc(img.currentSrc || img.src));
      if (!target) continue;
      img.dataset.eoMedia = target.key;
      img.classList.add('eo-editable-media');
      images += 1;
    }

    return { texts, images };
  }, [textIndex, mediaIndex]);

  // The homepage lazy-loads sections, so re-decorate as things appear. The
  // count reports what is currently on the page, not what one pass just added.
  useEffect(() => {
    const run = () => {
      decorate();
      setStatus((current) => {
        if (current.kind === 'busy' || current.kind === 'error') return current;
        const texts = document.querySelectorAll('[data-eo-text]').length;
        const images = document.querySelectorAll('[data-eo-media]').length;
        return { kind: 'idle', message: `${texts} texts and ${images} photos editable on this page` };
      });
    };
    run();
    const observer = new MutationObserver(run);
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = window.setInterval(run, 1500);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
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
        setEditing({
          target: { section, sectionLabel: found.label, path, original: field.value },
          el: text,
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
          <a className="eo-btn" href="/dev/home">
            Field list
          </a>
        </div>
      </div>

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
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  commitText(event.currentTarget.value);
                }
              }}
            />
            <p className="eo-modal-foot">
              Enter to apply, Shift plus Enter for a line break, Escape to cancel. English only, the other
              languages stay as they are.
            </p>
            <div className="eo-modal-actions">
              <button type="button" className="eo-btn ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="eo-btn primary"
                onClick={() => commitText(inputRef.current?.value ?? editing.target.original)}
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
.eo-btn.ghost { background: transparent; color: #fff; border-color: rgba(255,255,255,0.35); }
.eo-btn.ghost:hover { background: rgba(255,255,255,0.12); }
.eo-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.eo-modal { position: fixed; inset: 0; z-index: 2147483001; background: rgba(22,22,15,0.55); display: flex; align-items: center; justify-content: center; padding: 24px; }
.eo-modal-card { background: #fff; border-radius: 14px; padding: 20px; width: 100%; max-width: 620px; max-height: 88vh; overflow: auto; }
.eo-modal-card.is-wide { max-width: 760px; }
.eo-modal-head { margin: 0 0 12px; font-size: 13px; color: #6b6b5f; }
.eo-modal-head code { background: #ecece4; padding: 1px 6px; border-radius: 4px; }
.eo-modal-card textarea { width: 100%; font: inherit; font-size: 15px; padding: 10px 12px; border: 1px solid #d6d6cb; border-radius: 10px; resize: vertical; }
.eo-modal-card textarea:focus { outline: 2px solid #e0a800; outline-offset: -1px; }
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
