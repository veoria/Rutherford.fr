/**
 * Shared writes for the dev editors, plus the undo history behind the back
 * arrow in edit mode.
 *
 * Every mutation records how to reverse itself, so the arrow can step back
 * through text, photos, button destinations and colours in one stack. History
 * is a local working artifact and is not committed.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
export const HOME_DIR = join(ROOT, 'data/home');
export const MEDIA_PATH = join(HOME_DIR, 'media.json');
export const LINKS_PATH = join(HOME_DIR, 'links.json');
export const LAYOUT_PATH = join(HOME_DIR, 'layout.json');
export const CSS_PATH = join(ROOT, 'app/globals.css');
const HISTORY_PATH = join(HOME_DIR, '_history.json');

export const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T;
export const writeJson = (path: string, value: unknown) =>
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');

/** What the back arrow needs to undo one action. */
export type HistoryEntry =
  | { kind: 'copy'; label: string; section: string; edits: { path: string; value: string }[] }
  | { kind: 'media'; label: string; mediaKey: string; image: string }
  | { kind: 'link'; label: string; linkKey: string; href: string }
  | { kind: 'theme'; label: string; values: Record<string, string> }
  | { kind: 'layout'; label: string; layout: unknown };

const MAX_HISTORY = 50;

export function readHistory(): HistoryEntry[] {
  if (!existsSync(HISTORY_PATH)) return [];
  try {
    return readJson<HistoryEntry[]>(HISTORY_PATH);
  } catch {
    return [];
  }
}

/** Records the action that reverses what was just written. */
export function pushHistory(entry: HistoryEntry) {
  if (!existsSync(HOME_DIR)) mkdirSync(HOME_DIR, { recursive: true });
  const history = readHistory();
  history.push(entry);
  writeJson(HISTORY_PATH, history.slice(-MAX_HISTORY));
}

export function popHistory(): HistoryEntry | null {
  const history = readHistory();
  const entry = history.pop();
  if (!entry) return null;
  writeJson(HISTORY_PATH, history);
  return entry;
}

/* ------------------------------------------------------------------ theme */

/** The palette, in the order it makes sense to edit. */
export const THEME_TOKENS = [
  { name: 'bg', label: 'Page background' },
  { name: 'bg-soft', label: 'Soft background' },
  { name: 'text', label: 'Body text' },
  { name: 'muted', label: 'Secondary text' },
  { name: 'line', label: 'Borders and rules' },
  { name: 'accent', label: 'Accent' },
  { name: 'accent-soft', label: 'Accent, soft' },
];

const TOKEN_NAMES = new Set(THEME_TOKENS.map((t) => t.name));

/** Reads the palette declarations from the first `:root { ... }` block. */
export function readThemeTokens(): Record<string, string> {
  const block = /:root\s*\{([\s\S]*?)\}/.exec(readFileSync(CSS_PATH, 'utf8'));
  if (!block) return {};
  const out: Record<string, string> = {};
  for (const [, name, value] of block[1].matchAll(/--([a-z-]+)\s*:\s*([^;]+);/gi)) {
    if (TOKEN_NAMES.has(name)) out[name] = value.trim();
  }
  return out;
}

/**
 * Rewrites only the palette declarations inside `:root`. Everything else in
 * globals.css, including --shadow and --container, is left byte for byte.
 */
export function writeThemeTokens(values: Record<string, string>): Record<string, string> {
  const css = readFileSync(CSS_PATH, 'utf8');
  const block = /:root\s*\{([\s\S]*?)\}/.exec(css);
  if (!block) throw new Error('Could not find the :root block.');

  const previous = readThemeTokens();
  let inner = block[1];
  for (const [name, value] of Object.entries(values)) {
    if (!TOKEN_NAMES.has(name)) continue;
    const declaration = new RegExp(`(--${name}\\s*:\\s*)([^;]+)(;)`);
    if (!declaration.test(inner)) throw new Error(`--${name} is not declared in :root.`);
    inner = inner.replace(declaration, `$1${value}$3`);
  }

  writeFileSync(
    CSS_PATH,
    css.slice(0, block.index) + `:root {${inner}}` + css.slice(block.index + block[0].length),
    'utf8',
  );
  return previous;
}
