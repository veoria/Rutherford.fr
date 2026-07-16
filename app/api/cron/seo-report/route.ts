import { NextResponse, type NextRequest } from 'next/server';
import { sendMail } from '@/lib/msgraph';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Weekly SEO watchdog (Monday morning, wired via vercel.json crons). Runs
// PageSpeed Insights on the key pages, checks that sitemap / robots.txt /
// llms.txt are healthy, and emails the digest. Nobody has to "think to check":
// the report lands in the inbox, per the group SEO/GEO playbook.
//
// Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Fails closed.
const SITE = 'https://rutherford.fr';
const REPORT_TO = process.env.SEO_REPORT_TO || 'hello@veoria.fr';

const KEY_PAGES: { label: string; url: string }[] = [
  { label: 'Home', url: `${SITE}/` },
  { label: 'Offset360', url: `${SITE}/offset360` },
  { label: 'ColorLoop', url: `${SITE}/colorloop` },
  { label: 'ROI', url: `${SITE}/roi` },
  { label: 'Blog', url: `${SITE}/blog` },
];

type PageScores = { label: string; url: string; perf: number | null; seo: number | null; a11y: number | null };

async function pageSpeed(label: string, url: string): Promise<PageScores> {
  const api = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  api.searchParams.set('url', url);
  api.searchParams.set('strategy', 'mobile');
  for (const c of ['performance', 'seo', 'accessibility']) api.searchParams.append('category', c);
  if (process.env.PAGESPEED_API_KEY) api.searchParams.set('key', process.env.PAGESPEED_API_KEY);

  try {
    const res = await fetch(api, { cache: 'no-store', signal: AbortSignal.timeout(120000) });
    if (!res.ok) throw new Error(`PSI ${res.status}`);
    const data = await res.json();
    const cat = data?.lighthouseResult?.categories ?? {};
    const pct = (s: unknown) => (typeof s === 'number' ? Math.round(s * 100) : null);
    return { label, url, perf: pct(cat.performance?.score), seo: pct(cat.seo?.score), a11y: pct(cat.accessibility?.score) };
  } catch {
    return { label, url, perf: null, seo: null, a11y: null };
  }
}

async function checkText(url: string): Promise<{ ok: boolean; body: string }> {
  try {
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    return { ok: res.ok, body: res.ok ? await res.text() : '' };
  } catch {
    return { ok: false, body: '' };
  }
}

const toneColor = (v: number | null) => (v === null ? '#9A8E82' : v >= 90 ? '#1F8A4C' : v >= 70 ? '#B07D12' : '#C4332B');
const cell = (v: number | null) =>
  `<td style="padding:8px 12px;border-bottom:1px solid #ECEAE5;text-align:center;font-weight:600;color:${toneColor(v)}">${v === null ? 'n/a' : v}</td>`;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const [scores, sitemap, robots, llms] = await Promise.all([
    Promise.all(KEY_PAGES.map((p) => pageSpeed(p.label, p.url))),
    checkText(`${SITE}/sitemap.xml`),
    checkText(`${SITE}/robots.txt`),
    checkText(`${SITE}/llms.txt`),
  ]);

  const urlCount = sitemap.ok ? (sitemap.body.match(/<loc>/g) || []).length : 0;
  const aiBotsOpen = robots.ok && robots.body.includes('GPTBot') && robots.body.includes('ClaudeBot');
  const llmsArticles = llms.ok ? (llms.body.match(/^- \[/gm) || []).length : 0;

  const okBadge = (ok: boolean, label: string) =>
    `<span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;background:${ok ? '#E5F4EB' : '#FBE9E7'};color:${ok ? '#1F8A4C' : '#C4332B'}">${label}: ${ok ? 'OK' : 'KO'}</span>`;

  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;color:#181410">
    <h2 style="margin:24px 0 4px">Rapport SEO hebdo, rutherford.fr</h2>
    <p style="margin:0 0 16px;color:#544C46">${date}. Scores PageSpeed mobile (performance / SEO / accessibilite).</p>
    <table style="border-collapse:collapse;width:100%;background:#fff;border:1px solid #E9E6E1;border-radius:8px">
      <tr style="background:#F7F6F3">
        <th style="padding:8px 12px;text-align:left">Page</th>
        <th style="padding:8px 12px">Perf</th>
        <th style="padding:8px 12px">SEO</th>
        <th style="padding:8px 12px">A11y</th>
      </tr>
      ${scores
        .map(
          (s) => `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #ECEAE5"><a href="${s.url}" style="color:#2433C9;text-decoration:none">${s.label}</a></td>
        ${cell(s.perf)}${cell(s.seo)}${cell(s.a11y)}
      </tr>`,
        )
        .join('')}
    </table>
    <p style="margin:16px 0 8px">
      ${okBadge(sitemap.ok, 'Sitemap')} ${okBadge(robots.ok, 'Robots')} ${okBadge(llms.ok, 'llms.txt')} ${okBadge(aiBotsOpen, 'Bots IA')}
    </p>
    <ul style="color:#544C46;line-height:1.6">
      <li>${urlCount} URLs dans le sitemap</li>
      <li>${llmsArticles} entrees listees dans llms.txt</li>
    </ul>
    <p style="color:#9A8E82;font-size:12px">Rapport automatique du lundi matin (cron Vercel). Pages suivies : home, /offset360, /colorloop, /roi, /blog.</p>
  </div>`;

  await sendMail({
    to: REPORT_TO,
    subject: `Rapport SEO rutherford.fr, semaine du ${date}`,
    html,
  });

  return NextResponse.json({
    ok: true,
    scores,
    sitemapUrls: urlCount,
    robotsOk: robots.ok,
    llmsOk: llms.ok,
    llmsArticles,
    sentTo: REPORT_TO,
  });
}
