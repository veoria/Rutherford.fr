import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Daily IndexNow push (wired via vercel.json crons). Notifies Bing (and every
// IndexNow-enabled engine) of the current URL set so Copilot and Bing index
// changes within hours instead of weeks. The key file is served from
// public/<key>.txt on both hosts, so both rutherford.fr and go.colorloop.ai
// can be submitted with the same key.
//
// Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Fails closed.
const INDEXNOW_KEY = 'bfd94a4287603e20a2d8ede4b9c172f8';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

// go.colorloop.ai has no sitemap of its own (the app sitemap lists only
// rutherford.fr canonicals), so its canonical pages are listed by hand.
const COLORLOOP_PATHS = ['/', '/offset360', '/usa', '/canada', '/colorloop', '/blog'];

async function submit(host: string, urlList: string[]): Promise<number> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  return res.status;
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Pull the live sitemap and extract every <loc> for the rutherford.fr batch.
  const sitemapRes = await fetch('https://rutherford.fr/sitemap.xml', { cache: 'no-store' });
  if (!sitemapRes.ok) {
    return NextResponse.json({ error: `sitemap fetch failed (${sitemapRes.status})` }, { status: 502 });
  }
  const xml = await sitemapRes.text();
  const rutherfordUrls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => m[1]).slice(0, 10000);

  const colorloopUrls = COLORLOOP_PATHS.map((p) => new URL(p, 'https://go.colorloop.ai').href);

  const [rutherfordStatus, colorloopStatus] = await Promise.all([
    submit('rutherford.fr', rutherfordUrls),
    submit('go.colorloop.ai', colorloopUrls),
  ]);

  return NextResponse.json({
    ok: true,
    rutherford: { urls: rutherfordUrls.length, status: rutherfordStatus },
    colorloop: { urls: colorloopUrls.length, status: colorloopStatus },
  });
}
