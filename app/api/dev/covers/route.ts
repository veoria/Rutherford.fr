/**
 * Dev-only API behind the /dev/covers cover editor.
 *
 * GET  -> the article list plus every image available under public/images
 * POST -> assigns a cover to an article, either an existing file from the bank
 *         or a freshly cropped JPEG uploaded as a data URL
 *
 * Both verbs 404 outside development. The editor writes to the working tree,
 * so it must never be reachable on a deployed site.
 */

import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { IMAGE_EXTENSIONS, IMAGE_ROOTS } from './roots';

export const dynamic = 'force-dynamic';

const ROOT = process.cwd();
const ARTICLES_PATH = join(ROOT, 'data/blog-articles.json');
const PUBLIC_DIR = join(ROOT, 'public');
const IMAGES_DIR = join(PUBLIC_DIR, 'images');
const OUT_DIR = join(IMAGES_DIR, 'blog/covers');

/** Files that are logos, icons or social cards rather than usable cover photos. */
const NOT_A_PHOTO =
  /(logo|pictogramme|picto|^ico-|^og-|^brand-|^printer-|screenshot|packshot|mockup|^how-rutherford)/i;

type Article = { slug: string; title: string; image: string; publishedAt?: string; category?: string };

type BankImage = {
  /** Stable identity: the public path, or the absolute path for external files. */
  id: string;
  /** What the browser loads. */
  url: string;
  name: string;
  root: string;
  kind: 'photo' | 'graphic';
  /** Present only for files Next can serve directly, i.e. assignable as is. */
  publicPath?: string;
};

function isProd() {
  return process.env.NODE_ENV === 'production';
}

function readArticles(): Article[] {
  return JSON.parse(readFileSync(ARTICLES_PATH, 'utf8'));
}

function writeArticles(articles: unknown) {
  writeFileSync(ARTICLES_PATH, `${JSON.stringify(articles, null, 2)}\n`, 'utf8');
}

/** Every usable image across the declared roots, grouped by root. */
function listBank(): BankImage[] {
  const out: BankImage[] = [];

  for (const root of IMAGE_ROOTS) {
    if (!existsSync(root.dir)) continue;

    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.')) continue;
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (!IMAGE_EXTENSIONS.test(entry.name)) continue;

        const publicPath = root.isPublic
          ? `/${full.slice(PUBLIC_DIR.length + 1).split('\\').join('/')}`
          : undefined;

        out.push({
          id: publicPath ?? full,
          url: publicPath
            ? encodeURI(publicPath)
            : `/api/dev/covers/file?p=${encodeURIComponent(full)}`,
          name: entry.name,
          root: root.id,
          kind: NOT_A_PHOTO.test(entry.name) ? 'graphic' : 'photo',
          publicPath,
        });
      }
    };

    walk(root.dir);
  }

  return out.sort((a, b) => a.root.localeCompare(b.root) || a.name.localeCompare(b.name));
}

export async function GET() {
  if (isProd()) return new NextResponse('Not found', { status: 404 });

  const articles = readArticles()
    .filter((a) => a && a.slug)
    .map(({ slug, title, image, publishedAt, category }) => ({
      slug,
      title,
      image,
      publishedAt,
      category,
    }))
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));

  const roots = IMAGE_ROOTS.filter((root) => existsSync(root.dir)).map(({ id, label }) => ({
    id,
    label,
  }));

  return NextResponse.json({ articles, bank: listBank(), roots });
}

export async function POST(request: Request) {
  if (isProd()) return new NextResponse('Not found', { status: 404 });

  let body: { slug?: string; image?: string; dataUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const slug = typeof body.slug === 'string' ? body.slug : '';
  if (!slug) return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });

  const articles = readArticles();
  const article = articles.find((a: Article) => a?.slug === slug);
  if (!article) return NextResponse.json({ error: `Unknown article: ${slug}` }, { status: 404 });

  let nextImage: string;

  if (body.dataUrl) {
    // Freshly cropped in the browser. Content-hash the bytes so re-crops get a
    // new filename and never hit a stale cache.
    const match = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(body.dataUrl);
    if (!match) return NextResponse.json({ error: 'Unsupported image data.' }, { status: 400 });

    const [, format, base64] = match;
    const bytes = Buffer.from(base64, 'base64');
    if (bytes.length > 12_000_000) {
      return NextResponse.json({ error: 'Image is larger than 12 MB.' }, { status: 413 });
    }

    const hash = createHash('sha1').update(bytes).digest('hex').slice(0, 8);
    const ext = format === 'jpeg' ? 'jpg' : format;
    const filename = `${slug}-${hash}.${ext}`;

    if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(join(OUT_DIR, filename), bytes);
    nextImage = `/images/blog/covers/${filename}`;
  } else if (typeof body.image === 'string' && body.image.startsWith('/images/')) {
    // Picked straight from the bank, no re-encoding.
    const onDisk = join(PUBLIC_DIR, decodeURIComponent(body.image));
    if (!onDisk.startsWith(IMAGES_DIR) || !existsSync(onDisk)) {
      return NextResponse.json({ error: `File not found: ${body.image}` }, { status: 400 });
    }
    nextImage = body.image;
  } else {
    return NextResponse.json({ error: 'Provide either dataUrl or image.' }, { status: 400 });
  }

  // The blog grid looks broken when two articles share a cover, and
  // scripts/check-blog-images.mjs fails the build on it. Catch it here instead.
  const clash = articles.find(
    (a: Article) => a?.slug !== slug && decodeURIComponent(a?.image ?? '') === decodeURIComponent(nextImage),
  );
  if (clash) {
    return NextResponse.json(
      { error: `That image is already the cover of "${clash.slug}". Pick another one.` },
      { status: 409 },
    );
  }

  const previous = article.image;
  article.image = nextImage;
  writeArticles(articles);

  return NextResponse.json({ ok: true, slug, image: nextImage, previous });
}
