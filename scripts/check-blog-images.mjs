#!/usr/bin/env node
// Guards the blog cover images: every article must have its own, and it must
// exist on disk. Two articles sharing a cover looks like a mistake in the index
// grid, which is exactly how it reads to a visitor.
//
// Run: node scripts/check-blog-images.mjs
// Exits 1 on any problem, so the weekly publishing routines can gate on it.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const articles = JSON.parse(readFileSync(join(root, 'data/blog-articles.json'), 'utf8'));

const byImage = new Map();
const missing = [];
const noImage = [];

for (const a of articles) {
  const img = a.image;
  if (!img) {
    noImage.push(a.slug);
    continue;
  }
  // Public paths may be percent-encoded in the JSON; the file on disk is not.
  const onDisk = join(root, 'public', decodeURIComponent(img));
  if (!existsSync(onDisk)) missing.push(`${a.slug} -> ${img}`);
  byImage.set(img, [...(byImage.get(img) ?? []), a.slug]);
}

const duplicates = [...byImage.entries()].filter(([, slugs]) => slugs.length > 1);

let failed = false;

if (duplicates.length) {
  failed = true;
  console.error(`\n✖ ${duplicates.length} cover image(s) used by more than one article:`);
  for (const [img, slugs] of duplicates) {
    console.error(`  ${img}`);
    for (const s of slugs) console.error(`      ${s}`);
  }
}

if (missing.length) {
  failed = true;
  console.error(`\n✖ ${missing.length} cover image(s) missing from public/:`);
  for (const m of missing) console.error(`  ${m}`);
}

if (noImage.length) {
  failed = true;
  console.error(`\n✖ ${noImage.length} article(s) with no cover image:`);
  for (const s of noImage) console.error(`  ${s}`);
}

if (failed) {
  console.error('\nPick an unused image from public/images. Duplicates are visible in the blog grid.\n');
  process.exit(1);
}

console.log(`✓ ${articles.length} articles, ${byImage.size} distinct cover images, all present.`);
