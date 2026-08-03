'use client';

/**
 * Homepage editor. Dev only, see app/dev/home/page.tsx.
 *
 * Left: the sections, in page order. Right: every English text field of the
 * selected section, plus its photography with the same pan-and-zoom framing as
 * the cover editor.
 *
 * English is the only locale exposed. Each edited field lands in
 * data/home/_pending-translation.json, which is the list of what still needs
 * carrying over to FR, DE, IT, ES and PT.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MediaCropper, type CropperHandle } from '@/components/dev/media-cropper';

type Field = { path: string; value: string };
type Media = { key: string; value: string };
type Section = { id: string; label: string; fields: Field[]; media: Media[] };
type Pending = { section: string; path: string; en: string };
type BankImage = { id: string; url: string; name: string; root: string; kind: string; publicPath?: string };
type Root = { id: string; label: string };

type Status = { kind: 'idle' | 'busy' | 'ok' | 'error'; message: string };

export function HomeEditor() {
  const [sections, setSections] = useState<Section[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle', message: '' });

  const [bank, setBank] = useState<BankImage[]>([]);
  const [roots, setRoots] = useState<Root[]>([]);
  const [rootFilter, setRootFilter] = useState('all');
  const [bankFilter, setBankFilter] = useState('');
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [pickedUrl, setPickedUrl] = useState<string | null>(null);
  const [pickedPublicPath, setPickedPublicPath] = useState<string | null>(null);

  const cropper = useRef<CropperHandle | null>(null);
  const objectUrl = useRef<string | null>(null);

  const load = useCallback(async () => {
    const [homeRes, bankRes] = await Promise.all([
      fetch('/api/dev/home', { cache: 'no-store' }),
      fetch('/api/dev/covers', { cache: 'no-store' }),
    ]);
    if (!homeRes.ok) {
      setStatus({ kind: 'error', message: 'Could not load the homepage sections.' });
      return;
    }
    const home = (await homeRes.json()) as { sections: Section[]; pending: Pending[] };
    setSections(home.sections);
    setPending(home.pending ?? []);
    if (bankRes.ok) {
      const b = (await bankRes.json()) as { bank: BankImage[]; roots: Root[] };
      setBank(b.bank);
      setRoots(b.roots ?? []);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(
    () => () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    [],
  );

  const section = useMemo(
    () => sections.find((s) => s.id === selected) ?? null,
    [sections, selected],
  );

  const pickSection = useCallback((next: Section) => {
    setSelected(next.id);
    setDraft(Object.fromEntries(next.fields.map((f) => [f.path, f.value])));
    setEditingMedia(null);
    setPickedUrl(null);
    setStatus({ kind: 'idle', message: '' });
  }, []);

  const dirty = useMemo(() => {
    if (!section) return [];
    return section.fields.filter((f) => draft[f.path] !== undefined && draft[f.path] !== f.value);
  }, [section, draft]);

  const saveCopy = useCallback(async () => {
    if (!section || dirty.length === 0) return;
    setStatus({ kind: 'busy', message: 'Saving…' });
    const res = await fetch('/api/dev/home', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        section: section.id,
        edits: dirty.map((f) => ({ path: f.path, value: draft[f.path] })),
      }),
    });
    const data = (await res.json()) as { error?: string; changed?: number };
    if (!res.ok) {
      setStatus({ kind: 'error', message: data.error ?? 'Save failed.' });
      return;
    }
    setStatus({
      kind: 'ok',
      message: `${data.changed} field(s) saved. Reload the homepage to see it.`,
    });
    await load();
  }, [section, dirty, draft, load]);

  const saveMedia = useCallback(
    async (mode: 'crop' | 'asis') => {
      if (!editingMedia) return;
      setStatus({ kind: 'busy', message: 'Saving…' });

      const payload: { mediaKey: string; dataUrl?: string; image?: string } = {
        mediaKey: editingMedia.key,
      };
      if (mode === 'asis' && pickedPublicPath) {
        payload.image = pickedPublicPath;
      } else {
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
      setEditingMedia(null);
      setPickedUrl(null);
      await load();
    },
    [editingMedia, pickedPublicPath, load],
  );

  const visibleBank = useMemo(() => {
    const q = bankFilter.trim().toLowerCase();
    return bank
      .filter((b) => (rootFilter === 'all' ? true : b.root === rootFilter))
      .filter((b) => b.kind === 'photo')
      .filter((b) => (q ? b.name.toLowerCase().includes(q) : true))
      .slice(0, 120);
  }, [bank, bankFilter, rootFilter]);

  const pendingForSection = useCallback(
    (id: string) => pending.filter((p) => p.section === id).length,
    [pending],
  );

  return (
    <div className="he">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="he-top">
        <div>
          <h1>Homepage editor</h1>
          <p>
            Local only. English copy and photography live in <code>data/home/</code>. Saving writes
            there; the other five languages are untouched until they are brought back in line.
          </p>
        </div>
        <div className="he-top-actions">
          {pending.length > 0 ? (
            <span className="he-pending-badge">{pending.length} field(s) awaiting translation</span>
          ) : null}
          <a className="he-link" href="/" target="_blank" rel="noreferrer">
            Open the homepage
          </a>
        </div>
      </header>

      <div className="he-grid">
        <aside className="he-panel">
          <h2>Sections</h2>
          <ul className="he-list">
            {sections.map((s) => {
              const waiting = pendingForSection(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`he-row${s.id === selected ? ' is-active' : ''}`}
                    onClick={() => pickSection(s)}
                  >
                    <span>
                      <strong>{s.label}</strong>
                      <em>
                        {s.fields.length} text · {s.media.length} media
                      </em>
                    </span>
                    {waiting ? <span className="he-dot" title={`${waiting} awaiting translation`} /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="he-main">
          {!section ? (
            <p className="he-empty">Pick a section on the left.</p>
          ) : editingMedia ? (
            <>
              <h2>
                {section.label} · <code>{editingMedia.key.split('.').pop()}</code>
              </h2>
              <p className="he-meta">
                Current: <code>{editingMedia.value}</code>
              </p>

              <MediaCropper ref={cropper} src={pickedUrl ?? encodeURI(editingMedia.value)} />

              <p className="he-hint">
                Drag to pan, scroll to zoom. Exported at 1920 x 1080.
              </p>

              <div className="he-actions">
                <label className="he-btn">
                  Upload a photo
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
                <button type="button" className="he-btn primary" onClick={() => saveMedia('crop')}>
                  Save this crop
                </button>
                {pickedPublicPath ? (
                  <button type="button" className="he-btn" onClick={() => saveMedia('asis')}>
                    Use original file
                  </button>
                ) : null}
                <button
                  type="button"
                  className="he-btn ghost"
                  onClick={() => {
                    setEditingMedia(null);
                    setPickedUrl(null);
                  }}
                >
                  Back to the text
                </button>
              </div>

              <div className="he-bankbar">
                <div className="he-chips">
                  <button
                    type="button"
                    className={`he-chip${rootFilter === 'all' ? ' is-active' : ''}`}
                    onClick={() => setRootFilter('all')}
                  >
                    All
                  </button>
                  {roots.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`he-chip${rootFilter === r.id ? ' is-active' : ''}`}
                      onClick={() => setRootFilter(r.id)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <input
                  className="he-input"
                  placeholder="Filter by filename"
                  value={bankFilter}
                  onChange={(event) => setBankFilter(event.target.value)}
                />
              </div>

              <div className="he-bank">
                {visibleBank.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className="he-thumb"
                    title={b.name}
                    onClick={() => {
                      setPickedUrl(b.url);
                      setPickedPublicPath(b.publicPath ?? null);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.url} alt="" loading="lazy" decoding="async" />
                    <span className="he-name">{b.name}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2>{section.label}</h2>

              {section.media.length > 0 ? (
                <div className="he-media">
                  {section.media.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      className="he-mediacard"
                      onClick={() => {
                        setEditingMedia(m);
                        setPickedUrl(null);
                        setPickedPublicPath(null);
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={encodeURI(m.value)} alt="" />
                      <span>{m.key.split('.').pop()}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="he-fields">
                {section.fields.map((f) => {
                  const value = draft[f.path] ?? f.value;
                  const changed = value !== f.value;
                  const long = f.value.length > 90;
                  return (
                    <label key={f.path} className={`he-field${changed ? ' is-changed' : ''}`}>
                      <span className="he-path">{f.path}</span>
                      {long ? (
                        <textarea
                          rows={Math.min(8, Math.ceil(value.length / 80) + 1)}
                          value={value}
                          onChange={(event) =>
                            setDraft((d) => ({ ...d, [f.path]: event.target.value }))
                          }
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(event) =>
                            setDraft((d) => ({ ...d, [f.path]: event.target.value }))
                          }
                        />
                      )}
                    </label>
                  );
                })}
              </div>

              <div className="he-actions is-sticky">
                <button
                  type="button"
                  className="he-btn primary"
                  disabled={dirty.length === 0 || status.kind === 'busy'}
                  onClick={saveCopy}
                >
                  {dirty.length === 0 ? 'No changes' : `Save ${dirty.length} change(s)`}
                </button>
                {dirty.length > 0 ? (
                  <button
                    type="button"
                    className="he-btn ghost"
                    onClick={() =>
                      setDraft(Object.fromEntries(section.fields.map((f) => [f.path, f.value])))
                    }
                  >
                    Discard
                  </button>
                ) : null}
              </div>
            </>
          )}

          {status.message ? <p className={`he-status is-${status.kind}`}>{status.message}</p> : null}
        </section>
      </div>
    </div>
  );
}

const CSS = `
.he { font: 14px/1.5 system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif; color: #16160f; background: #fbfbf7; min-height: 100vh; padding: 24px; box-sizing: border-box; }
.he * { box-sizing: border-box; }
.he-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 20px; }
.he-top h1 { font-size: 22px; margin: 0 0 4px; }
.he-top p { margin: 0; color: #6b6b5f; max-width: 70ch; }
.he-top-actions { display: flex; align-items: center; gap: 10px; }
.he code { background: #ecece4; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.he-link { color: #16160f; font-weight: 600; text-decoration: none; border: 1px solid #d6d6cb; border-radius: 8px; padding: 8px 14px; background: #fff; white-space: nowrap; }
.he-pending-badge { font-size: 12px; background: #fff3cd; color: #7a5c00; border: 1px solid #f0d999; border-radius: 999px; padding: 5px 11px; white-space: nowrap; }
.he-grid { display: grid; grid-template-columns: 250px minmax(0, 1fr); gap: 20px; align-items: start; }
.he-panel, .he-main { background: #fff; border: 1px solid #e4e4db; border-radius: 12px; padding: 16px; }
.he-panel h2, .he-main h2 { font-size: 15px; margin: 0 0 10px; }
.he-list { list-style: none; margin: 0; padding: 0; }
.he-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; text-align: left; background: none; border: 0; border-radius: 8px; padding: 8px; cursor: pointer; font: inherit; }
.he-row:hover { background: #f2f2ea; }
.he-row.is-active { background: #16160f; color: #fff; }
.he-row strong { display: block; font-size: 13px; font-weight: 600; }
.he-row em { display: block; font-style: normal; font-size: 11px; opacity: 0.6; }
.he-dot { width: 8px; height: 8px; border-radius: 50%; background: #e0a800; flex: 0 0 auto; }
.he-empty { color: #6b6b5f; margin: 0; }
.he-meta { color: #6b6b5f; font-size: 12px; margin: 0 0 12px; }
.he-hint { font-size: 12px; color: #6b6b5f; margin: 10px 0 14px; }
.he-media { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #eeeee7; }
.he-mediacard { position: relative; display: block; width: 150px; padding: 0; border: 1px solid #e4e4db; border-radius: 8px; overflow: hidden; background: #ecece4; cursor: pointer; }
.he-mediacard:hover { border-color: #16160f; }
.he-mediacard img { display: block; width: 100%; height: 94px; object-fit: cover; }
.he-mediacard span { display: block; font-size: 10px; padding: 4px 6px; background: #fff; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.he-fields { display: flex; flex-direction: column; gap: 12px; }
.he-field { display: block; }
.he-path { display: block; font-size: 11px; color: #8a8a7c; margin-bottom: 3px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.he-field input, .he-field textarea { width: 100%; font: inherit; padding: 8px 10px; border: 1px solid #d6d6cb; border-radius: 8px; background: #fff; resize: vertical; }
.he-field input:focus, .he-field textarea:focus { outline: 2px solid #16160f; outline-offset: -1px; }
.he-field.is-changed input, .he-field.is-changed textarea { border-color: #e0a800; background: #fffdf5; }
.he-field.is-changed .he-path::after { content: ' modified'; color: #b58500; }
.he-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
.he-actions.is-sticky { position: sticky; bottom: 0; background: #fff; padding: 14px 0 4px; border-top: 1px solid #eeeee7; margin-top: 20px; }
.he-btn { display: inline-flex; align-items: center; border: 1px solid #d6d6cb; background: #fff; border-radius: 8px; padding: 9px 16px; font: inherit; font-weight: 600; cursor: pointer; }
.he-btn:hover { background: #f2f2ea; }
.he-btn.primary { background: #16160f; color: #fff; border-color: #16160f; }
.he-btn.primary:hover { background: #2a2a1f; }
.he-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.he-status { font-size: 13px; margin: 14px 0 0; padding: 9px 12px; border-radius: 8px; }
.he-status.is-ok { background: #e6f4ea; color: #14532d; }
.he-status.is-error { background: #fdeaea; color: #7f1d1d; }
.he-status.is-busy { background: #f2f2ea; color: #6b6b5f; }
.he-bankbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin: 20px 0 10px; padding-top: 16px; border-top: 1px solid #eeeee7; }
.he-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.he-chip { font: inherit; font-size: 11px; padding: 4px 9px; border: 1px solid #d6d6cb; background: #fff; border-radius: 999px; cursor: pointer; }
.he-chip.is-active { background: #16160f; color: #fff; border-color: #16160f; }
.he-input { padding: 7px 10px; border: 1px solid #d6d6cb; border-radius: 8px; font: inherit; min-width: 200px; }
.he-bank { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; max-height: 46vh; overflow-y: auto; }
.he-thumb { position: relative; display: block; width: 100%; height: 0; padding: 0 0 78% 0; border: 1px solid #e4e4db; border-radius: 8px; overflow: hidden; background: #ecece4; cursor: pointer; }
.he-thumb:hover { border-color: #16160f; }
.he-thumb img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.he-name { position: absolute; left: 0; right: 0; bottom: 0; font-size: 9px; color: #fff; background: linear-gradient(transparent, rgba(0,0,0,0.75)); padding: 10px 5px 3px; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-stage { position: relative; max-width: 100%; margin-bottom: 12px; }
.mc-stage canvas { display: block; width: 100%; height: auto; border-radius: 10px; background: #f2f2ed; cursor: grab; touch-action: none; }
.mc-stage canvas:active { cursor: grabbing; }
.mc-safe { position: absolute; top: 0; bottom: 0; left: 50%; transform: translateX(-50%); border: 2px dashed rgba(255,255,255,0.9); border-radius: 6px; pointer-events: none; box-shadow: 0 0 0 1px rgba(0,0,0,0.35) inset; }
.mc-controls { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.mc-controls label { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #6b6b5f; }
.mc-controls input[type=range] { width: 240px; }
.mc-controls output { font-variant-numeric: tabular-nums; min-width: 48px; }
.mc-reset { font: inherit; font-weight: 600; border: 1px solid #d6d6cb; background: #fff; border-radius: 8px; padding: 7px 14px; cursor: pointer; }
`;
