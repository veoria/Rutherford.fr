/**
 * Dev-only API for the brand palette.
 *
 * The seven colours live in the `:root` block at the top of app/globals.css and
 * are used through the stylesheet: --accent alone appears 206 times. Rather
 * than layering an override on top, this rewrites those declarations in place,
 * so the stylesheet stays the single source of truth and nothing has to be
 * injected at runtime.
 *
 * Only the known token names are touched; --shadow, --container and every rule
 * below the block are left exactly as they were.
 */

import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const dynamic = 'force-dynamic';

const CSS_PATH = join(process.cwd(), 'app/globals.css');

/** The palette, in the order it makes sense to edit. Not exported: a route file
 *  may only export its handlers and Next's own config keys. */
const TOKENS = [
  { name: 'bg', label: 'Page background', role: 'surface' },
  { name: 'bg-soft', label: 'Soft background', role: 'surface' },
  { name: 'text', label: 'Body text', role: 'ink' },
  { name: 'muted', label: 'Secondary text', role: 'ink' },
  { name: 'line', label: 'Borders and rules', role: 'line' },
  { name: 'accent', label: 'Accent', role: 'accent' },
  { name: 'accent-soft', label: 'Accent, soft', role: 'accent' },
] as const;

const NAMES = new Set(TOKENS.map((t) => t.name));
const HEX = /^#[0-9a-f]{6}$/i;

const isProd = () => process.env.NODE_ENV === 'production';

/** Reads the declarations inside the first `:root { ... }` block. */
function readTokens(css: string): Record<string, string> {
  const block = /:root\s*\{([\s\S]*?)\}/.exec(css);
  if (!block) return {};
  const out: Record<string, string> = {};
  for (const [, name, value] of block[1].matchAll(/--([a-z-]+)\s*:\s*([^;]+);/gi)) {
    if (NAMES.has(name as never)) out[name] = value.trim();
  }
  return out;
}

export async function GET() {
  if (isProd()) return new NextResponse('Not found', { status: 404 });

  const values = readTokens(readFileSync(CSS_PATH, 'utf8'));
  return NextResponse.json({
    tokens: TOKENS.map((token) => ({ ...token, value: values[token.name] ?? '' })),
  });
}

export async function POST(request: Request) {
  if (isProd()) return new NextResponse('Not found', { status: 404 });

  let body: { values?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const values = body.values ?? {};
  const entries = Object.entries(values).filter(([name]) => NAMES.has(name as never));
  if (entries.length === 0) {
    return NextResponse.json({ error: 'No known colour supplied.' }, { status: 400 });
  }
  for (const [name, value] of entries) {
    if (!HEX.test(value)) {
      return NextResponse.json(
        { error: `${name} must be a 6 digit hex colour, got "${value}"` },
        { status: 400 },
      );
    }
  }

  const css = readFileSync(CSS_PATH, 'utf8');
  const block = /:root\s*\{([\s\S]*?)\}/.exec(css);
  if (!block) {
    return NextResponse.json({ error: 'Could not find the :root block.' }, { status: 500 });
  }

  const before = readTokens(css);
  let body_ = block[1];
  for (const [name, value] of entries) {
    const declaration = new RegExp(`(--${name}\\s*:\\s*)([^;]+)(;)`);
    if (!declaration.test(body_)) {
      return NextResponse.json({ error: `--${name} is not declared in :root.` }, { status: 400 });
    }
    body_ = body_.replace(declaration, `$1${value}$3`);
  }

  const next = css.slice(0, block.index) + `:root {${body_}}` + css.slice(block.index + block[0].length);
  writeFileSync(CSS_PATH, next, 'utf8');

  return NextResponse.json({
    ok: true,
    changed: entries.filter(([name, value]) => before[name] !== value).map(([name]) => name),
    previous: before,
  });
}
