'use client';

/**
 * Local cover editor for blog articles. Dev only, see app/dev/covers/page.tsx.
 *
 * Pick an article, drop in a photo (or pick one from public/images), pan and
 * zoom to frame it, save. The crop is rendered to a 1920x1080 JPEG in the
 * browser and posted to /api/dev/covers, which writes the file and updates
 * data/blog-articles.json.
 *
 * Two frames matter on the site: the article hero is 16/9 and the blog index
 * card is 1.25/1. The editor crops to 16/9 and draws the card's safe area on
 * top, so nothing important ends up outside the thumbnail.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Article = {
  slug: string;
  title: string;
  image: string;
  publishedAt?: string;
  category?: string;
};

type BankImage = { path: string; name: string; kind: 'photo' | 'graphic' };

const EXPORT_WIDTH = 1920;
const EXPORT_HEIGHT = 1080;
const STAGE_WIDTH = 720;
const STAGE_HEIGHT = 405;
/** Blog index cards are 1.25/1, so this much of the 16/9 frame survives there. */
const CARD_SAFE_WIDTH = STAGE_HEIGHT * 1.25;

export function CoverEditor() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [bank, setBank] = useState<BankImage[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [bankFilter, setBankFilter] = useState('');
  const [showGraphics, setShowGraphics] = useState(false);

  const [source, setSource] = useState<HTMLImageElement | null>(null);
  const [sourceLabel, setSourceLabel] = useState('');
  /** Set when the source came from the bank untouched, so we can save it as is. */
  const [bankPath, setBankPath] = useState<string | null>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState<{ kind: 'idle' | 'busy' | 'ok' | 'error'; message: string }>({
    kind: 'idle',
    message: '',
  });
  /** What the cover was before the last save, so a wrong click stays reversible. */
  const [lastSave, setLastSave] = useState<{ slug: string; previous: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const article = useMemo(
    () => articles.find((a) => a.slug === selected) ?? null,
    [articles, selected],
  );

  const load = useCallback(async () => {
    const res = await fetch('/api/dev/covers', { cache: 'no-store' });
    if (!res.ok) {
      setStatus({ kind: 'error', message: 'Could not load the article list.' });
      return;
    }
    const data = (await res.json()) as { articles: Article[]; bank: BankImage[] };
    setArticles(data.articles);
    setBank(data.bank);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Base scale that makes the image cover the 16/9 stage at zoom 1. */
  const baseScale = useMemo(() => {
    if (!source) return 1;
    return Math.max(STAGE_WIDTH / source.naturalWidth, STAGE_HEIGHT / source.naturalHeight);
  }, [source]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    ctx.fillStyle = '#f2f2ed';
    ctx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

    if (!source) return;

    const scale = baseScale * zoom;
    const w = source.naturalWidth * scale;
    const h = source.naturalHeight * scale;
    const x = (STAGE_WIDTH - w) / 2 + offset.x;
    const y = (STAGE_HEIGHT - h) / 2 + offset.y;

    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, x, y, w, h);
  }, [source, baseScale, zoom, offset]);

  useEffect(() => {
    draw();
  }, [draw]);

  const useImage = useCallback((src: string, label: string, fromBank: string | null) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setSource(img);
      setSourceLabel(label);
      setBankPath(fromBank);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setStatus({ kind: 'idle', message: '' });
    };
    img.onerror = () => setStatus({ kind: 'error', message: `Could not load ${label}` });
    img.src = src;
  }, []);

  const pickArticle = useCallback(
    (a: Article) => {
      setSelected(a.slug);
      useImage(encodeURI(a.image), a.image, a.image);
    },
    [useImage],
  );

  const onFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      useImage(url, file.name, null);
    },
    [useImage],
  );

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!source) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    setOffset({ x: drag.ox + (event.clientX - drag.x), y: drag.oy + (event.clientY - drag.y) });
  };

  const endDrag = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  };

  // Non-passive wheel listener, otherwise the page scrolls while zooming.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom((z) => Math.min(6, Math.max(1, z * (event.deltaY > 0 ? 0.94 : 1.06))));
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  const exportDataUrl = useCallback(() => {
    if (!source) return null;
    const out = document.createElement('canvas');
    out.width = EXPORT_WIDTH;
    out.height = EXPORT_HEIGHT;
    const ctx = out.getContext('2d');
    if (!ctx) return null;

    const ratio = EXPORT_WIDTH / STAGE_WIDTH;
    const scale = baseScale * zoom * ratio;
    const w = source.naturalWidth * scale;
    const h = source.naturalHeight * scale;
    const x = (EXPORT_WIDTH - w) / 2 + offset.x * ratio;
    const y = (EXPORT_HEIGHT - h) / 2 + offset.y * ratio;

    ctx.fillStyle = '#f2f2ed';
    ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, x, y, w, h);
    return out.toDataURL('image/jpeg', 0.9);
  }, [source, baseScale, zoom, offset]);

  const post = useCallback(
    async (payload: { slug: string; dataUrl?: string; image?: string }) => {
      setStatus({ kind: 'busy', message: 'Saving…' });
      const res = await fetch('/api/dev/covers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string; image?: string; previous?: string };

      if (!res.ok) {
        setStatus({ kind: 'error', message: data.error ?? 'Save failed.' });
        return null;
      }

      setStatus({ kind: 'ok', message: `Saved to ${data.image}` });
      await load();
      return data;
    },
    [load],
  );

  const save = useCallback(
    async (mode: 'crop' | 'asis') => {
      if (!article) return;

      const payload: { slug: string; dataUrl?: string; image?: string } = { slug: article.slug };
      if (mode === 'asis' && bankPath) {
        payload.image = bankPath;
      } else {
        const dataUrl = exportDataUrl();
        if (!dataUrl) {
          setStatus({ kind: 'error', message: 'Nothing to export.' });
          return;
        }
        payload.dataUrl = dataUrl;
      }

      const data = await post(payload);
      if (data?.previous) setLastSave({ slug: article.slug, previous: data.previous });
    },
    [article, bankPath, exportDataUrl, post],
  );

  const undo = useCallback(async () => {
    if (!lastSave) return;
    const data = await post({ slug: lastSave.slug, image: lastSave.previous });
    if (data) setLastSave(null);
  }, [lastSave, post]);

  const visibleArticles = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) => a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q),
    );
  }, [articles, filter]);

  const usedImages = useMemo(
    () => new Set(articles.map((a) => decodeURIComponent(a.image))),
    [articles],
  );

  const visibleBank = useMemo(() => {
    const q = bankFilter.trim().toLowerCase();
    return bank
      .filter((b) => (showGraphics ? true : b.kind === 'photo'))
      .filter((b) => (q ? b.path.toLowerCase().includes(q) : true));
  }, [bank, bankFilter, showGraphics]);

  return (
    <div className="ce">
      {/* Injected raw: as a text child React escapes the quotes in the font
          stack, which then mismatches on hydration. */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="ce-top">
        <div>
          <h1>Blog cover editor</h1>
          <p>
            Local only. Saving writes the file into <code>public/images/blog/covers/</code> and
            updates <code>data/blog-articles.json</code>. Commit when you are happy with it.
          </p>
        </div>
        <a className="ce-link" href="/blog" target="_blank" rel="noreferrer">
          Open /blog
        </a>
      </header>

      <div className="ce-grid">
        <aside className="ce-panel">
          <h2>Articles ({articles.length})</h2>
          <input
            className="ce-input"
            placeholder="Filter by title or slug"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
          <ul className="ce-list">
            {visibleArticles.map((a) => (
              <li key={a.slug}>
                <button
                  type="button"
                  className={`ce-row${a.slug === selected ? ' is-active' : ''}`}
                  onClick={() => pickArticle(a)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={encodeURI(a.image)} alt="" />
                  <span>
                    <strong>{a.title}</strong>
                    <em>
                      {a.publishedAt ?? 'no date'} · {a.slug}
                    </em>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="ce-stage-wrap">
          {!article ? (
            <p className="ce-empty">Pick an article on the left to start.</p>
          ) : (
            <>
              <h2>{article.title}</h2>
              <p className="ce-meta">
                Current cover: <code>{article.image}</code>
              </p>

              <div className="ce-stage">
                <canvas
                  ref={canvasRef}
                  width={STAGE_WIDTH}
                  height={STAGE_HEIGHT}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                />
                <div className="ce-safe" style={{ width: CARD_SAFE_WIDTH }} aria-hidden="true">
                  <span>blog card safe area</span>
                </div>
              </div>

              <div className="ce-controls">
                <label>
                  Zoom
                  <input
                    type="range"
                    min={1}
                    max={6}
                    step={0.01}
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                  />
                  <output>{zoom.toFixed(2)}x</output>
                </label>
                <button
                  type="button"
                  className="ce-btn ghost"
                  onClick={() => {
                    setZoom(1);
                    setOffset({ x: 0, y: 0 });
                  }}
                >
                  Reset framing
                </button>
              </div>

              <p className="ce-hint">
                Drag the image to pan, scroll on it to zoom. The dashed frame is what survives on
                the blog index card, the full frame is the article hero.
              </p>

              <div className="ce-actions">
                <label className="ce-btn">
                  Upload a photo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(event) => onFile(event.target.files?.[0])}
                  />
                </label>
                <button
                  type="button"
                  className="ce-btn primary"
                  disabled={!source || status.kind === 'busy'}
                  onClick={() => save('crop')}
                >
                  Save this crop
                </button>
                {bankPath && zoom === 1 && offset.x === 0 && offset.y === 0 ? (
                  <button
                    type="button"
                    className="ce-btn ghost"
                    disabled={status.kind === 'busy'}
                    onClick={() => save('asis')}
                    title="Assign the original file without re-encoding it"
                  >
                    Use original file
                  </button>
                ) : null}
                {lastSave && lastSave.slug === article.slug ? (
                  <button
                    type="button"
                    className="ce-btn ghost"
                    disabled={status.kind === 'busy'}
                    onClick={undo}
                    title={`Put ${lastSave.previous} back`}
                  >
                    Undo last save
                  </button>
                ) : null}
              </div>

              {sourceLabel ? (
                <p className="ce-meta">
                  Source: <code>{sourceLabel}</code>
                  {source ? ` (${source.naturalWidth} x ${source.naturalHeight})` : null}
                </p>
              ) : null}

              {status.message ? (
                <p className={`ce-status is-${status.kind}`}>{status.message}</p>
              ) : null}
            </>
          )}
        </section>

        <aside className="ce-panel">
          <h2>Image bank ({visibleBank.length})</h2>
          <input
            className="ce-input"
            placeholder="Filter by filename"
            value={bankFilter}
            onChange={(event) => setBankFilter(event.target.value)}
          />
          <label className="ce-check">
            <input
              type="checkbox"
              checked={showGraphics}
              onChange={(event) => setShowGraphics(event.target.checked)}
            />
            Show logos and graphics too
          </label>
          <div className="ce-bank">
            {visibleBank.map((b) => {
              const used = usedImages.has(decodeURIComponent(b.path));
              return (
                <button
                  key={b.path}
                  type="button"
                  className={`ce-thumb${used ? ' is-used' : ''}`}
                  title={`${b.path}${used ? ' (already a cover)' : ''}`}
                  disabled={!article}
                  onClick={() => useImage(encodeURI(b.path), b.path, b.path)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={encodeURI(b.path)} alt="" loading="lazy" />
                  {used ? <span className="ce-badge">used</span> : null}
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

const CSS = `
.ce { font: 14px/1.5 system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif; color: #16160f; background: #fbfbf7; min-height: 100vh; padding: 24px; box-sizing: border-box; }
.ce * { box-sizing: border-box; }
.ce-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 20px; }
.ce-top h1 { font-size: 22px; margin: 0 0 4px; }
.ce-top p { margin: 0; color: #6b6b5f; max-width: 62ch; }
.ce code { background: #ecece4; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.ce-link { color: #16160f; font-weight: 600; text-decoration: none; border: 1px solid #d6d6cb; border-radius: 8px; padding: 8px 14px; background: #fff; white-space: nowrap; }
.ce-grid { display: grid; grid-template-columns: 320px minmax(0, 1fr) 300px; gap: 20px; align-items: start; }
@media (max-width: 1300px) { .ce-grid { grid-template-columns: 1fr; } }
.ce-panel { background: #fff; border: 1px solid #e4e4db; border-radius: 12px; padding: 14px; }
.ce-panel h2, .ce-stage-wrap h2 { font-size: 15px; margin: 0 0 10px; }
.ce-input { width: 100%; padding: 8px 10px; border: 1px solid #d6d6cb; border-radius: 8px; margin-bottom: 10px; font: inherit; }
.ce-check { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b6b5f; margin-bottom: 10px; }
.ce-list { list-style: none; margin: 0; padding: 0; max-height: 70vh; overflow: auto; }
.ce-row { display: flex; gap: 10px; align-items: center; width: 100%; text-align: left; background: none; border: 0; border-radius: 8px; padding: 6px; cursor: pointer; font: inherit; }
.ce-row:hover { background: #f2f2ea; }
.ce-row.is-active { background: #16160f; color: #fff; }
.ce-row img { width: 56px; height: 45px; object-fit: cover; border-radius: 5px; flex: 0 0 auto; background: #ecece4; }
.ce-row span { display: block; min-width: 0; }
.ce-row strong { display: block; font-size: 13px; font-weight: 600; }
.ce-row em { display: block; font-style: normal; font-size: 11px; opacity: 0.6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ce-stage-wrap { background: #fff; border: 1px solid #e4e4db; border-radius: 12px; padding: 18px; }
.ce-empty { color: #6b6b5f; margin: 0; }
.ce-meta { color: #6b6b5f; font-size: 12px; margin: 0 0 10px; }
.ce-stage { position: relative; width: ${STAGE_WIDTH}px; max-width: 100%; margin-bottom: 14px; }
.ce-stage canvas { display: block; width: 100%; height: auto; border-radius: 10px; background: #f2f2ed; cursor: grab; touch-action: none; }
.ce-stage canvas:active { cursor: grabbing; }
.ce-safe { position: absolute; top: 0; bottom: 0; left: 50%; transform: translateX(-50%); border: 2px dashed rgba(255,255,255,0.9); border-radius: 6px; pointer-events: none; box-shadow: 0 0 0 1px rgba(0,0,0,0.35) inset; }
.ce-safe span { position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%); font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; color: #fff; background: rgba(0,0,0,0.55); padding: 2px 8px; border-radius: 999px; white-space: nowrap; }
.ce-controls { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; flex-wrap: wrap; }
.ce-controls label { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #6b6b5f; }
.ce-controls input[type=range] { width: 240px; }
.ce-controls output { font-variant-numeric: tabular-nums; min-width: 48px; }
.ce-hint { font-size: 12px; color: #6b6b5f; margin: 0 0 14px; }
.ce-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
.ce-btn { display: inline-flex; align-items: center; border: 1px solid #d6d6cb; background: #fff; border-radius: 8px; padding: 9px 16px; font: inherit; font-weight: 600; cursor: pointer; }
.ce-btn:hover { background: #f2f2ea; }
.ce-btn.primary { background: #16160f; color: #fff; border-color: #16160f; }
.ce-btn.primary:hover { background: #2a2a1f; }
.ce-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.ce-status { font-size: 13px; margin: 0; padding: 9px 12px; border-radius: 8px; }
.ce-status.is-ok { background: #e6f4ea; color: #14532d; }
.ce-status.is-error { background: #fdeaea; color: #7f1d1d; }
.ce-status.is-busy { background: #f2f2ea; color: #6b6b5f; }
.ce-bank { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; max-height: 70vh; overflow: auto; }
.ce-thumb { position: relative; padding: 0; border: 1px solid #e4e4db; border-radius: 6px; overflow: hidden; background: #ecece4; cursor: pointer; aspect-ratio: 1.25 / 1; }
.ce-thumb:hover { border-color: #16160f; }
.ce-thumb:disabled { opacity: 0.5; cursor: not-allowed; }
.ce-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ce-thumb.is-used { opacity: 0.45; }
.ce-badge { position: absolute; top: 3px; right: 3px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.04em; background: rgba(0,0,0,0.7); color: #fff; padding: 1px 5px; border-radius: 999px; }
`;
