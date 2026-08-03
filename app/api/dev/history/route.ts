/**
 * Dev-only undo stack behind the back arrow in edit mode.
 *
 * GET  -> what the arrow would undo next, and how deep the stack goes
 * POST -> undo the last action
 *
 * Every editing endpoint records the action that reverses what it just wrote,
 * so text, photos, button destinations, colours and section layout all step
 * back through the same stack.
 */

import { NextResponse } from 'next/server';
import { existsSync } from 'node:fs';

import {
  LAYOUT_PATH,
  LINKS_PATH,
  MEDIA_PATH,
  popHistory,
  readHistory,
  readJson,
  writeJson,
  writeThemeTokens,
} from '../store';

import { join } from 'node:path';

export const dynamic = 'force-dynamic';

const HOME_DIR = join(process.cwd(), 'data/home');
const isProd = () => process.env.NODE_ENV === 'production';

type Json = Record<string, unknown>;

/** Writes a dotted path back into a nested object, in place. */
function setAtPath(target: unknown, path: string, next: string) {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let node = target as Record<string, unknown>;
  for (let i = 0; i < keys.length - 1; i += 1) {
    node = node[keys[i]] as Record<string, unknown>;
    if (node == null) throw new Error(`Unknown path: ${path}`);
  }
  node[keys[keys.length - 1]] = next;
}

export async function GET() {
  if (isProd()) return new NextResponse('Not found', { status: 404 });
  const history = readHistory();
  const next = history[history.length - 1] ?? null;
  return NextResponse.json({ depth: history.length, next: next ? { label: next.label } : null });
}

export async function POST() {
  if (isProd()) return new NextResponse('Not found', { status: 404 });

  const entry = popHistory();
  if (!entry) return NextResponse.json({ error: 'Nothing left to undo.' }, { status: 400 });

  try {
    switch (entry.kind) {
      case 'copy': {
        const path = join(HOME_DIR, `${entry.section}.json`);
        if (!existsSync(path)) throw new Error(`Missing ${entry.section}.json`);
        const data = readJson<Json>(path);
        for (const edit of entry.edits) setAtPath(data.en, edit.path, edit.value);
        writeJson(path, data);
        break;
      }
      case 'media': {
        const media = readJson<Record<string, string>>(MEDIA_PATH);
        media[entry.mediaKey] = entry.image;
        writeJson(MEDIA_PATH, media);
        break;
      }
      case 'link': {
        const links = readJson<Record<string, string>>(LINKS_PATH);
        links[entry.linkKey] = entry.href;
        writeJson(LINKS_PATH, links);
        break;
      }
      case 'theme': {
        writeThemeTokens(entry.values);
        break;
      }
      case 'layout': {
        writeJson(LAYOUT_PATH, entry.layout);
        break;
      }
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, undone: entry.label, depth: readHistory().length });
}
