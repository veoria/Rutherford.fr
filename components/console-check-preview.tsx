'use client';

// Visual test of the next console validation (26/10/2026): the colorloop.ai
// "one question a screen" check with its 3D photo guides, in the Rutherford.fr
// look. Nothing is wired: no upload, no Pipedrive, no email. The fields and the
// photo set are those of the live form (components/console-validation-page.tsx)
// so the real connectors can be plugged in later without changing the CRM data.

import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import './console-check-preview.css';

const BRANDS = ['Heidelberg', 'Komori', 'Koenig & Bauer', 'Manroland', 'Mitsubishi', 'Ryobi', 'Goss', 'Presstek', 'Other'];
const INSIDE_BRANDS = ['Heidelberg', 'Komori', 'Mitsubishi'];

type PhotoId = 'consolePhoto' | 'pressPhoto' | 'keysPhoto' | 'insideConsolePhoto' | 'platePhoto';
type Photo = {
  id: PhotoId;
  title: string;
  hint: string;
  video?: string; // 3D guide, ends on the spot to photograph
  poster: string;
  optional?: boolean;
  conditional?: boolean; // only for the brands with a console cabinet worth seeing
};

// Same five fields as the live form; the 3D guides come from colorloop.ai.
const PHOTOS: Photo[] = [
  {
    id: 'consolePhoto',
    title: 'The whole console',
    hint: 'Step back and frame the full console, screens included.',
    video: '/images/console-check/zoom-1.mp4',
    poster: '/images/console-check/photo-1.webp',
  },
  {
    id: 'pressPhoto',
    title: 'The press',
    hint: 'The press with its brand, type and number of units visible.',
    poster: '/images/Brand:Type and numbers of units.png',
  },
  {
    id: 'keysPhoto',
    title: 'The ink-key count',
    hint: 'Show the ink keys of one unit on the console, so the count reads.',
    video: '/images/console-check/zoom-3.mp4',
    poster: '/images/console-check/photo-3.webp',
  },
  {
    id: 'insideConsolePhoto',
    title: 'Inside the cabinet',
    hint: 'Open the console cabinet and photograph the electronics inside.',
    video: '/images/console-check/zoom-2.mp4',
    poster: '/images/console-check/photo-2.webp',
    optional: true,
    conditional: true,
  },
  {
    id: 'platePhoto',
    title: 'The machine plate',
    hint: 'The plate on the press with its type, serial number and year.',
    video: '/images/console-check/zoom-4.mp4',
    poster: '/images/console-check/photo-4.webp',
    optional: true,
  },
];

type Screen =
  | { kind: 'intro' }
  | { kind: 'text'; key: 'email' | 'company' | 'country'; label: string; type: string; placeholder: string; autoComplete: string }
  | { kind: 'press' }
  | { kind: 'photo'; photo: Photo }
  | { kind: 'review' }
  | { kind: 'done' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ConsoleCheckPreview() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [values, setValues] = useState({ email: '', company: '', country: '', model: '' });
  const [brand, setBrand] = useState('');
  const [files, setFiles] = useState<Partial<Record<PhotoId, { name: string; url: string }>>>({});
  const [consent, setConsent] = useState(false);
  const [need, setNeed] = useState(false);
  const [note, setNote] = useState('');
  const focusRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const setFocus = (el: HTMLElement | null) => {
    focusRef.current = el;
  };

  const photos = PHOTOS.filter((p) => !p.conditional || INSIDE_BRANDS.includes(brand));
  const screens: Screen[] = [
    { kind: 'intro' },
    { kind: 'text', key: 'email', label: 'Your work email', type: 'email', placeholder: 'name@printer.com', autoComplete: 'email' },
    { kind: 'text', key: 'company', label: 'Your printing company', type: 'text', placeholder: 'Company name', autoComplete: 'organization' },
    { kind: 'text', key: 'country', label: 'Your country', type: 'text', placeholder: 'Country', autoComplete: 'country-name' },
    { kind: 'press' },
    ...photos.map((photo) => ({ kind: 'photo' as const, photo })),
    { kind: 'review' },
    { kind: 'done' },
  ];
  const screen = screens[Math.min(i, screens.length - 1)];
  const steps = screens.length - 2; // intro and done are not counted
  const progress = screen.kind === 'done' ? 100 : Math.max(0, ((i - 1) / (steps - 1)) * 100);

  // Focus the field of each new screen and replay the 3D guide (it ends on the spot).
  useEffect(() => {
    focusRef.current?.focus({ preventScroll: true });
    const v = videoRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (v && !reduce) {
      try {
        v.currentTime = 0;
      } catch {
        /* not loaded yet */
      }
      v.play().catch(() => {});
    }
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }, [i]);

  // Object URLs of the previews are released when the page goes away.
  useEffect(() => () => Object.values(files).forEach((f) => f && URL.revokeObjectURL(f.url)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const valid = (): boolean => {
    if (screen.kind === 'text') {
      const v = values[screen.key].trim();
      return screen.key === 'email' ? EMAIL_RE.test(v) : v.length > 0;
    }
    if (screen.kind === 'press') return Boolean(brand);
    if (screen.kind === 'photo') return screen.photo.optional || Boolean(files[screen.photo.id]);
    return true;
  };

  const go = (k: number) => {
    setDir(k > i ? 1 : -1);
    setNeed(false);
    setNote('');
    setI(k);
  };
  const next = () => {
    if (!valid()) {
      setNeed(true);
      if (screen.kind === 'photo') setNote('This photo is needed to check your console.');
      return;
    }
    go(i + 1);
  };

  const onEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      next();
    }
  };

  const onFile = (id: PhotoId) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFiles((prev) => {
      if (prev[id]) URL.revokeObjectURL(prev[id]!.url);
      return { ...prev, [id]: { name: file.name, url: URL.createObjectURL(file) } };
    });
    setNeed(false);
    setNote('');
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setNote('Please tick the box to agree, then send.');
      return;
    }
    // Test page: nothing leaves the browser.
    go(screens.length - 1);
  };

  const n = i; // screen number shown as "n / steps"
  const photoIndex = screen.kind === 'photo' ? photos.indexOf(screen.photo) + 1 : 0;

  return (
    <main className="page-shell cc-page">
      <SiteNav current="console-validation" />
      <section className="cc-app" aria-labelledby="cc-title">
        <div className="cc-bar" aria-hidden="true">
          <i style={{ width: `${progress}%` }} />
        </div>
        {i > 0 && screen.kind !== 'done' ? (
          <button type="button" className="cc-back" onClick={() => go(i - 1)} aria-label="Back">
            ←
          </button>
        ) : null}

        <form className="cc-form" onSubmit={send} noValidate>
          <div className={`cc-s${need ? ' is-need' : ''}`} key={i} style={{ ['--dir' as string]: dir }}>
            {screen.kind === 'intro' ? (
              <>
                <p className="cc-k">
                  Free console validation <span className="cc-test">Test page</span>
                </p>
                <h1 id="cc-title">
                  Is your press ready for closed-loop color<span>?</span>
                </h1>
                <p className="cc-lead">A few questions and a few photos of your console. Rutherford answers within one business day.</p>
                <ul className="cc-badges">
                  <li>Free</li>
                  <li>About 2 minutes</li>
                  <li>Reply within 1 business day</li>
                  <li>No commitment</li>
                </ul>
                <button type="button" className="cc-next" onClick={next} ref={setFocus}>
                  Start <span aria-hidden="true">→</span>
                </button>
                <p className="cc-tip">Best on your phone, at the press. At your desk, have your photos ready.</p>
              </>
            ) : null}

            {screen.kind === 'text' ? (
              <>
                <p className="cc-n">
                  {n} / {steps}
                </p>
                <label className="cc-q" htmlFor={`cc-${screen.key}`} id="cc-title">
                  {screen.label}
                </label>
                <input
                  id={`cc-${screen.key}`}
                  className="cc-in"
                  type={screen.type}
                  placeholder={screen.placeholder}
                  autoComplete={screen.autoComplete}
                  value={values[screen.key]}
                  aria-invalid={need}
                  onChange={(e) => setValues((v) => ({ ...v, [screen.key]: e.target.value }))}
                  onKeyDown={onEnter}
                  ref={setFocus}
                />
                <button type="button" className="cc-next" onClick={next}>
                  Next <span aria-hidden="true">→</span>
                </button>
              </>
            ) : null}

            {screen.kind === 'press' ? (
              <>
                <p className="cc-n">
                  {n} / {steps}
                </p>
                <h2 className="cc-q" id="cc-title">
                  Your press
                </h2>
                <div className="cc-chips" role="radiogroup" aria-label="Press brand">
                  {BRANDS.map((b, k) => (
                    <button
                      key={b}
                      type="button"
                      role="radio"
                      aria-checked={brand === b}
                      onClick={() => {
                        setBrand(b);
                        setNeed(false);
                      }}
                      ref={k === 0 ? setFocus : undefined}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <label className="cc-sub" htmlFor="cc-model">
                  Model and number of units <span>(optional)</span>
                </label>
                <input
                  id="cc-model"
                  className="cc-in cc-in-s"
                  type="text"
                  placeholder="e.g. Speedmaster XL 106, 6 units"
                  value={values.model}
                  onChange={(e) => setValues((v) => ({ ...v, model: e.target.value }))}
                  onKeyDown={onEnter}
                />
                <button type="button" className="cc-next" onClick={next}>
                  Next <span aria-hidden="true">→</span>
                </button>
              </>
            ) : null}

            {screen.kind === 'photo' ? (
              <div className="cc-photo">
                {screen.photo.video ? (
                  <video
                    className="cc-guide"
                    muted
                    playsInline
                    preload="auto"
                    poster={screen.photo.poster}
                    src={screen.photo.video}
                    width={600}
                    height={800}
                    aria-label={`Where to take it: ${screen.photo.title.toLowerCase()}, shown in 3D`}
                    ref={videoRef}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="cc-guide cc-guide-img" src={screen.photo.poster} alt={`Example: ${screen.photo.title.toLowerCase()}`} width={600} height={800} />
                )}
                <div className="cc-ph-t">
                  <p className="cc-n">
                    {n} / {steps} · Photo {photoIndex} of {photos.length}
                    {screen.photo.optional ? ' · optional' : ''}
                  </p>
                  <h2 className="cc-q" id="cc-title">
                    {screen.photo.title}
                  </h2>
                  <p className="cc-hint">{screen.photo.hint}</p>
                  <label className={`cc-shot${files[screen.photo.id] ? ' is-done' : ''}`}>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={onFile(screen.photo.id)}
                      ref={setFocus}
                    />
                    <span>{files[screen.photo.id] ? 'Change the photo' : 'Take or add the photo'}</span>
                  </label>
                  {files[screen.photo.id] ? (
                    <p className="cc-file">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={files[screen.photo.id]!.url} alt="Your photo" />
                      {files[screen.photo.id]!.name}
                    </p>
                  ) : null}
                  {note ? <p className="cc-note" role="alert">{note}</p> : null}
                  <button type="button" className="cc-next" onClick={next}>
                    {screen.photo.optional && !files[screen.photo.id] ? 'Skip' : 'Next'} <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            ) : null}

            {screen.kind === 'review' ? (
              <>
                <p className="cc-n">
                  {n} / {steps}
                </p>
                <h2 className="cc-q" id="cc-title">
                  Ready to send
                </h2>
                <dl className="cc-sum">
                  <dt>Email</dt>
                  <dd>{values.email || '·'}</dd>
                  <dt>Company</dt>
                  <dd>{values.company || '·'}</dd>
                  <dt>Country</dt>
                  <dd>{values.country || '·'}</dd>
                  <dt>Press</dt>
                  <dd>{[brand, values.model.trim()].filter(Boolean).join(', ') || '·'}</dd>
                  <dt>Photos</dt>
                  <dd>
                    {Object.keys(files).length} of {photos.length}
                  </dd>
                </dl>
                <label className="cc-consent">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} ref={setFocus} />
                  <span>
                    I agree that Rutherford uses this information and these photos to answer my request. <a href="/confidentialite">Privacy</a>
                  </span>
                </label>
                {note ? <p className="cc-note" role="alert">{note}</p> : null}
                <button type="submit" className="cc-next">
                  Send my validation <span aria-hidden="true">→</span>
                </button>
              </>
            ) : null}

            {screen.kind === 'done' ? (
              <>
                <p className="cc-k">Received</p>
                <h2 className="cc-q" id="cc-title" tabIndex={-1} ref={setFocus}>
                  Thank you<span>.</span>
                </h2>
                <p className="cc-lead">Rutherford answers within one business day.</p>
                <p className="cc-test cc-test-block">Test page: nothing was sent.</p>
                <a className="cc-next" href="/">
                  Back to home <span aria-hidden="true">→</span>
                </a>
              </>
            ) : null}
          </div>
        </form>
      </section>
      <SiteFooter />
    </main>
  );
}
