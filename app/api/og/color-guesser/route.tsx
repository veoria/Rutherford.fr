import { ImageResponse } from 'next/og';
import type { Locale } from '@/components/language-provider';
import { SHARE_TAGLINE, parseShared, rankFor } from '@/lib/color-guesser';

// Share image for a color guesser score: /api/og/color-guesser?s=4&t=5&b=coca-cola,dhl,...&l=fr
export const runtime = 'edge';

const LOCALES: Locale[] = ['en', 'fr', 'de', 'it', 'es', 'pt'];

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const result = parseShared({ s: params.get('s'), t: params.get('t'), b: params.get('b') });
  const l = params.get('l') as Locale | null;
  const locale: Locale = l && LOCALES.includes(l) ? l : 'en';
  const score = result?.score ?? 0;
  const total = result?.total ?? 5;
  const brands = result?.brands ?? [];

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#ffffff', fontFamily: 'sans-serif' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 14, display: 'flex' }}>
          {['#00A3E0', '#E4007C', '#FFD100', '#111418'].map((c) => (
            <div key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', width: 560 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', color: '#111111' }}>
            <span style={{ fontSize: 168, fontWeight: 800, letterSpacing: -8, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 72, fontWeight: 700, color: '#676767', marginLeft: 8 }}>/{total}</span>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#111111', marginTop: 18, lineHeight: 1.15 }}>
            {rankFor(score, total, locale)}
          </div>
          <div style={{ fontSize: 28, color: '#676767', marginTop: 18, lineHeight: 1.3 }}>{SHARE_TAGLINE[locale]}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#111111', marginTop: 36 }}>Rutherford.fr</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingRight: 72, flex: 1, marginTop: 150 }}>
          {brands.map((b) => (
            <div key={b.slug} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ width: '100%', height: 300, borderRadius: 16, background: b.real }} />
              <div style={{ fontSize: 16, color: '#676767', marginTop: 12, textAlign: 'center', whiteSpace: 'nowrap' }}>{b.brand.length > 12 ? `${b.brand.slice(0, 11)}…` : b.brand}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
