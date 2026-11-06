import type { Metadata } from 'next';
import { localizedMetadata, requestLocale } from '@/lib/seo';
import { parseShared } from '@/lib/color-guesser';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { ColorGuesser } from '@/components/color-guesser';

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };

export function generateMetadata({ searchParams = {} }: PageProps): Metadata {
  const meta = localizedMetadata({
    path: '/color-guesser',
    title: {
      en: 'Color guesser: find the real brand color | Rutherford.fr',
      fr: 'Color guesser : trouvez la vraie couleur de la marque | Rutherford.fr',
      de: 'Color guesser: Finden Sie die echte Markenfarbe | Rutherford.fr',
      it: 'Color guesser: trovi il vero colore del brand | Rutherford.fr',
      es: 'Color guesser: encuentre el verdadero color de la marca | Rutherford.fr',
      pt: 'Color guesser: encontre a verdadeira cor da marca | Rutherford.fr',
    },
    description: {
      en: 'Two colors, one logo, only one is real. Test your eye on famous brand colors, then see why printers measure color instead of guessing.',
      fr: 'Deux couleurs, un logo, une seule est la vraie. Testez votre œil sur des couleurs de marques connues, puis voyez pourquoi les imprimeurs mesurent la couleur.',
      de: 'Zwei Farben, ein Logo, nur eine ist echt. Testen Sie Ihr Auge an bekannten Markenfarben und sehen Sie, warum Druckereien Farbe messen.',
      it: 'Due colori, un logo, solo uno è vero. Metta alla prova l’occhio sui colori dei grandi brand e scopra perché gli stampatori misurano il colore.',
      es: 'Dos colores, un logo, solo uno es real. Ponga a prueba su ojo con colores de marcas conocidas y descubra por qué los impresores miden el color.',
      pt: 'Duas cores, um logótipo, só uma é real. Teste o seu olho com cores de marcas conhecidas e veja porque é que as gráficas medem a cor.',
    },
  });
  // A shared score link previews with its own image (score, title, the five colors).
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;
  const shared = parseShared({ s: one(searchParams.s), t: one(searchParams.t), b: one(searchParams.b) });
  if (shared) {
    const q = new URLSearchParams({
      s: String(shared.score),
      t: String(shared.total),
      b: shared.brands.map((b) => b.slug).join(','),
      l: requestLocale(),
    });
    const image = { url: `/api/og/color-guesser?${q}`, width: 1200, height: 630 };
    meta.openGraph = { ...meta.openGraph, images: [image] };
    meta.twitter = { ...meta.twitter, card: 'summary_large_image', images: [image.url] };
  }
  return meta;
}

export default function ColorGuesserRoute() {
  const locale = requestLocale();
  const consoleHref = locale === 'en' ? '/console-validation' : `/${locale}/console-validation`;
  return (
    <main className="page-shell color-guesser-page">
      <SiteNav current="color-guesser" />
      <section className="section">
        <div className="container">
          <ColorGuesser consoleHref={consoleHref} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
