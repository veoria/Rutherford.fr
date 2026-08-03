/**
 * Dev-only API behind the /dev/home editor.
 *
 * GET  -> every homepage section with its English copy, plus the media map
 * POST -> writes English copy back into data/home/<section>.json, or assigns a
 *         new image to a media key
 *
 * English is the only locale the editor exposes. Every edited field is recorded
 * in data/home/_pending-translation.json so the other five locales can be
 * brought back in line deliberately rather than guessed at.
 */

import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const dynamic = 'force-dynamic';

const ROOT = process.cwd();
const HOME_DIR = join(ROOT, 'data/home');
const MEDIA_PATH = join(HOME_DIR, 'media.json');
const PENDING_PATH = join(HOME_DIR, '_pending-translation.json');
const PUBLIC_DIR = join(ROOT, 'public');
const IMAGES_DIR = join(PUBLIC_DIR, 'images');
const OUT_DIR = join(IMAGES_DIR, 'home');

/** Order and labels as the sections appear down the page. */
const SECTIONS: { id: string; label: string }[] = [
  { id: 'home-page', label: 'Hero' },
  { id: 'roi-teaser', label: 'ROI teaser' },
  { id: 'rutherford-identity-section', label: 'Identity' },
  { id: 'brand-explainer-section', label: 'Brand explainer' },
  { id: 'case-studies-showcase', label: 'Case studies' },
  { id: 'console-validation-cta', label: 'Console validation CTA' },
  { id: 'how-rutherford-helps', label: 'How Rutherford helps' },
  { id: 'colorloop-section', label: 'ColorLoop' },
  { id: 'audience-section', label: 'Audience' },
  { id: 'ppwr-section', label: 'PPWR' },
  { id: 'blog-preview-section', label: 'Blog preview' },
  { id: 'team-showcase', label: 'Team' },
  { id: 'site-footer', label: 'Footer (all pages)' },
];

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const isProd = () => process.env.NODE_ENV === 'production';

const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path: string, value: unknown) =>
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');

const sectionPath = (id: string) => join(HOME_DIR, `${id}.json`);

/** Flattens an object into dotted paths so the editor can render flat inputs. */
function flatten(value: Json, prefix = ''): { path: string; value: string }[] {
  if (typeof value === 'string') return [{ path: prefix, value }];
  if (Array.isArray(value)) return value.flatMap((v, i) => flatten(v, `${prefix}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k));
  }
  return [];
}

/** Writes a dotted path back into a nested object, in place. */
function setAtPath(target: Json, path: string, next: string) {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let node = target as Record<string, Json> | Json[];
  for (let i = 0; i < keys.length - 1; i += 1) {
    node = (node as Record<string, Json>)[keys[i]] as Record<string, Json> | Json[];
    if (node === undefined || node === null) throw new Error(`Unknown path: ${path}`);
  }
  const last = keys[keys.length - 1];
  if (typeof (node as Record<string, Json>)[last] !== 'string') {
    throw new Error(`Path is not a text field: ${path}`);
  }
  (node as Record<string, Json>)[last] = next;
}

export async function GET() {
  if (isProd()) return new NextResponse('Not found', { status: 404 });

  const media = readJson(MEDIA_PATH) as Record<string, string>;
  const pending = existsSync(PENDING_PATH) ? (readJson(PENDING_PATH) as Json[]) : [];

  const sections = SECTIONS.filter((s) => existsSync(sectionPath(s.id))).map((section) => {
    const data = readJson(sectionPath(section.id)) as Record<string, Json>;
    return {
      ...section,
      fields: flatten(data.en ?? {}),
      media: Object.entries(media)
        .filter(([key]) => key.startsWith(`${section.id}.`))
        .map(([key, value]) => ({ key, value })),
    };
  });

  return NextResponse.json({ sections, pending });
}

export async function POST(request: Request) {
  if (isProd()) return new NextResponse('Not found', { status: 404 });

  let body: {
    section?: string;
    edits?: { path: string; value: string }[];
    mediaKey?: string;
    image?: string;
    dataUrl?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  // ---- media assignment -------------------------------------------------
  if (body.mediaKey) {
    const media = readJson(MEDIA_PATH) as Record<string, string>;
    if (!(body.mediaKey in media)) {
      return NextResponse.json({ error: `Unknown media key: ${body.mediaKey}` }, { status: 404 });
    }

    let next: string;
    if (body.dataUrl) {
      const match = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(body.dataUrl);
      if (!match) return NextResponse.json({ error: 'Unsupported image data.' }, { status: 400 });
      const bytes = Buffer.from(match[2], 'base64');
      if (bytes.length > 12_000_000) {
        return NextResponse.json({ error: 'Image is larger than 12 MB.' }, { status: 413 });
      }
      const hash = createHash('sha1').update(bytes).digest('hex').slice(0, 8);
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const filename = `${body.mediaKey.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${hash}.${ext}`;
      if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
      writeFileSync(join(OUT_DIR, filename), bytes);
      next = `/images/home/${filename}`;
    } else if (typeof body.image === 'string' && body.image.startsWith('/images/')) {
      const onDisk = join(PUBLIC_DIR, decodeURIComponent(body.image));
      if (!onDisk.startsWith(IMAGES_DIR) || !existsSync(onDisk)) {
        return NextResponse.json({ error: `File not found: ${body.image}` }, { status: 400 });
      }
      next = body.image;
    } else {
      return NextResponse.json({ error: 'Provide either dataUrl or image.' }, { status: 400 });
    }

    const previous = media[body.mediaKey];
    media[body.mediaKey] = next;
    writeJson(MEDIA_PATH, media);
    return NextResponse.json({ ok: true, mediaKey: body.mediaKey, image: next, previous });
  }

  // ---- copy edits -------------------------------------------------------
  const id = body.section ?? '';
  if (!SECTIONS.some((s) => s.id === id) || !existsSync(sectionPath(id))) {
    return NextResponse.json({ error: `Unknown section: ${id}` }, { status: 404 });
  }
  if (!Array.isArray(body.edits) || body.edits.length === 0) {
    return NextResponse.json({ error: 'No edits supplied.' }, { status: 400 });
  }

  const data = readJson(sectionPath(id)) as Record<string, Json>;
  const applied: { path: string; from: string; to: string }[] = [];

  for (const edit of body.edits) {
    if (typeof edit?.path !== 'string' || typeof edit?.value !== 'string') continue;
    const before = flatten(data.en).find((f) => f.path === edit.path)?.value;
    if (before === undefined) {
      return NextResponse.json({ error: `Unknown field: ${edit.path}` }, { status: 400 });
    }
    if (before === edit.value) continue;
    try {
      setAtPath(data.en, edit.path, edit.value);
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    applied.push({ path: edit.path, from: before, to: edit.value });
  }

  if (applied.length === 0) return NextResponse.json({ ok: true, changed: 0 });

  writeJson(sectionPath(id), data);

  // Record what drifted, so the five other locales can be caught up on purpose.
  const pending = (existsSync(PENDING_PATH) ? readJson(PENDING_PATH) : []) as {
    section: string;
    path: string;
    en: string;
  }[];
  for (const change of applied) {
    const existing = pending.find((p) => p.section === id && p.path === change.path);
    if (existing) existing.en = change.to;
    else pending.push({ section: id, path: change.path, en: change.to });
  }
  writeJson(PENDING_PATH, pending);

  return NextResponse.json({ ok: true, changed: applied.length, applied, pending: pending.length });
}
