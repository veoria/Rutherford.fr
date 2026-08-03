/**
 * Dev-only API for the brand palette.
 *
 * The seven colours live in the `:root` block at the top of app/globals.css and
 * carry the whole design: --accent alone appears 206 times. Rather than layering
 * an override on top, the declarations are rewritten in place, so the stylesheet
 * stays the single source of truth and nothing is injected at runtime.
 *
 * The write is recorded on the undo stack, so the back arrow puts the previous
 * palette back.
 */

import { NextResponse } from 'next/server';

import { THEME_TOKENS, pushHistory, readThemeTokens, writeThemeTokens } from '../store';

export const dynamic = 'force-dynamic';

const NAMES = new Set(THEME_TOKENS.map((t) => t.name));
const HEX = /^#[0-9a-f]{6}$/i;

const isProd = () => process.env.NODE_ENV === 'production';

export async function GET() {
  if (isProd()) return new NextResponse('Not found', { status: 404 });

  const values = readThemeTokens();
  return NextResponse.json({
    tokens: THEME_TOKENS.map((token) => ({ ...token, value: values[token.name] ?? '' })),
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

  const entries = Object.entries(body.values ?? {}).filter(([name]) => NAMES.has(name));
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

  let previous: Record<string, string>;
  try {
    previous = writeThemeTokens(Object.fromEntries(entries));
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  const changed = entries.filter(([name, value]) => previous[name] !== value).map(([name]) => name);
  if (changed.length > 0) {
    pushHistory({
      kind: 'theme',
      label: changed.length === 1 ? `colour --${changed[0]}` : `${changed.length} colours`,
      values: Object.fromEntries(changed.map((name) => [name, previous[name]])),
    });
  }

  return NextResponse.json({ ok: true, changed, previous });
}
