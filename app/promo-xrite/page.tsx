import type { Metadata } from 'next';
import { ANIMATION_HTML } from './animation';

// Hidden preview page (X-Rite distributor account): not linked from anywhere and
// excluded from indexing. The standalone animation is a full HTML document, so it
// is rendered inside an isolated <iframe srcDoc> to keep its styles and script
// away from the site.
export const metadata: Metadata = {
  title: 'X-Rite distributor account — preview | Rutherford',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-static';

export default function PromoXritePage() {
  return (
    <iframe
      title="Rutherford X-Rite distributor account — animated preview"
      srcDoc={ANIMATION_HTML}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 0,
        zIndex: 9999,
        background: '#f3f3ee',
      }}
    />
  );
}
