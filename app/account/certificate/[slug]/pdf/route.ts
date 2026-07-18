import { NextResponse, type NextRequest } from 'next/server';
import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isOnboarded } from '@/lib/profile';
import { getCourseBySlug } from '@/data/academy-courses';
import { certReference, resolveCertification } from '@/lib/certificate';
import { RUTHERFORD_LOGO_PNG_BASE64 } from '@/lib/certificate-logo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOCALES = ['en', 'fr', 'de', 'it', 'es', 'pt'] as const;
type L = (typeof LOCALES)[number];

type PdfCopy = {
  heading: string;
  awardedTo: string;
  forCompleting: string;
  assessmentPassed: (pct: number) => string;
  modulesWord: string;
  issuedOn: (date: string) => string;
  referenceLabel: string;
  issuer: string;
};

const COPY: Record<L, PdfCopy> = {
  en: {
    heading: 'Certificate of completion',
    awardedTo: 'This certifies that',
    forCompleting: 'has successfully completed',
    assessmentPassed: (p) => `Final assessment passed — score ${p}%`,
    modulesWord: 'modules',
    issuedOn: (d) => `Issued on ${d}`,
    referenceLabel: 'Certificate ID',
    issuer: 'Rutherford Academy · rutherford.fr — closed-loop color management',
  },
  fr: {
    heading: 'Certificat de réussite',
    awardedTo: 'Ce certificat atteste que',
    forCompleting: 'a suivi avec succès',
    assessmentPassed: (p) => `Évaluation finale réussie — score ${p}%`,
    modulesWord: 'modules',
    issuedOn: (d) => `Délivré le ${d}`,
    referenceLabel: 'N° de certificat',
    issuer: 'Rutherford Academy · rutherford.fr — gestion de la couleur closed-loop',
  },
  de: {
    heading: 'Abschlusszertifikat',
    awardedTo: 'Hiermit wird bestätigt, dass',
    forCompleting: 'erfolgreich abgeschlossen hat',
    assessmentPassed: (p) => `Abschlussprüfung bestanden — Ergebnis ${p}%`,
    modulesWord: 'Module',
    issuedOn: (d) => `Ausgestellt am ${d}`,
    referenceLabel: 'Zertifikat-Nr.',
    issuer: 'Rutherford Academy · rutherford.fr — Closed-Loop-Farbmanagement',
  },
  it: {
    heading: 'Certificato di completamento',
    awardedTo: 'Si certifica che',
    forCompleting: 'ha completato con successo',
    assessmentPassed: (p) => `Valutazione finale superata — punteggio ${p}%`,
    modulesWord: 'moduli',
    issuedOn: (d) => `Rilasciato il ${d}`,
    referenceLabel: 'N. certificato',
    issuer: 'Rutherford Academy · rutherford.fr — gestione del colore closed-loop',
  },
  es: {
    heading: 'Certificado de finalización',
    awardedTo: 'Por la presente se certifica que',
    forCompleting: 'ha completado con éxito',
    assessmentPassed: (p) => `Evaluación final aprobada — puntuación ${p}%`,
    modulesWord: 'módulos',
    issuedOn: (d) => `Emitido el ${d}`,
    referenceLabel: 'N.º de certificado',
    issuer: 'Rutherford Academy · rutherford.fr — gestión del color closed-loop',
  },
  pt: {
    heading: 'Certificado de conclusão',
    awardedTo: 'Certifica-se que',
    forCompleting: 'concluiu com sucesso',
    assessmentPassed: (p) => `Avaliação final aprovada, classificação ${p}%`,
    modulesWord: 'módulos',
    issuedOn: (d) => `Emitido a ${d}`,
    referenceLabel: 'N.º de certificado',
    issuer: 'Rutherford Academy · rutherford.fr · gestão da cor closed-loop',
  },
};

// Standard PDF fonts use WinAnsi (≈ Latin-1). Keep that range plus common
// typographic marks; transliterate anything else (e.g. ł, č, ș) to ASCII so an
// unusual name can never crash PDF generation.
const KEEP = new Set([0x2018, 0x2019, 0x201c, 0x201d, 0x2013, 0x2014, 0x2022, 0x20ac, 0x2026, 0xb7]);
// Latin letters with no canonical decomposition (NFKD leaves them as-is), so
// map them explicitly. Accented letters that DO decompose (č, ą, ş, …) are
// handled by the NFKD path below.
const TRANSLIT: Record<string, string> = {
  Ł: 'L', ł: 'l', Œ: 'OE', œ: 'oe', Đ: 'D', đ: 'd', Ħ: 'H', ħ: 'h', ı: 'i', İ: 'I', ŉ: 'n',
};
function pdfSafe(input: string): string {
  let out = '';
  for (const ch of input) {
    const cp = ch.codePointAt(0) ?? 0;
    if ((cp >= 0x20 && cp <= 0xff) || KEEP.has(cp)) {
      out += ch;
    } else if (TRANSLIT[ch] !== undefined) {
      out += TRANSLIT[ch];
    } else {
      out += ch
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^\x20-\x7e]/g, '');
    }
  }
  return out;
}

function wrap(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
  const words = pdfSafe(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !current) current = candidate;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  if (process.env.NEXT_PUBLIC_ACADEMY_ENABLED !== 'true') {
    return new NextResponse('Not found', { status: 404 });
  }
  const course = getCourseBySlug(params.slug);
  if (!course) return new NextResponse('Not found', { status: 404 });

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse('Sign in required', { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, company, country, job_title, job_roles, onboarded_at')
    .eq('id', user.id)
    .maybeSingle();
  if (!isOnboarded(profile)) return new NextResponse('Onboarding required', { status: 403 });

  const { certified, issuedDate, scorePct } = await resolveCertification(supabase, user.id, course);
  if (!certified) return new NextResponse('Not certified', { status: 403 });

  const langParam = new URL(request.url).searchParams.get('lang');
  const lang: L = (LOCALES as readonly string[]).includes(langParam ?? '') ? (langParam as L) : 'en';
  const t = COPY[lang];

  const recipient = (profile?.full_name as string) || (user.email ?? '');
  const company = (profile?.company as string) || '';
  const reference = certReference(user.id, course.id);
  let dateText = '';
  if (issuedDate) {
    try {
      dateText = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(issuedDate)
      );
    } catch {
      dateText = issuedDate.slice(0, 10);
    }
  }

  // ---- Compose the PDF (A4 landscape) ----
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Rutherford Academy — ${course.title}`);
  const page = pdf.addPage([842, 595]);
  const W = 842;
  const H = 595;

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const gold = rgb(0.69, 0.5, 0.0);
  const goldLight = rgb(0.79, 0.64, 0.15);
  const dark = rgb(0.11, 0.11, 0.12);
  const gray = rgb(0.42, 0.42, 0.42);
  const accent = rgb(0.0, 0.44, 0.89);
  const green = rgb(0.18, 0.49, 0.2);

  // Cream background + double gold border.
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(1, 0.992, 0.969) });
  page.drawRectangle({ x: 24, y: 24, width: W - 48, height: H - 48, borderColor: gold, borderWidth: 3 });
  page.drawRectangle({ x: 34, y: 34, width: W - 68, height: H - 68, borderColor: goldLight, borderWidth: 1 });

  const center = (text: string, font: PDFFont, size: number, y: number, color = dark) => {
    const safe = pdfSafe(text);
    const w = font.widthOfTextAtSize(safe, size);
    page.drawText(safe, { x: (W - w) / 2, y, size, font, color });
  };

  // Logo (centered, top).
  let logoBottom = H - 96;
  try {
    const png = await pdf.embedPng(new Uint8Array(Buffer.from(RUTHERFORD_LOGO_PNG_BASE64, 'base64')));
    const logoW = 150;
    const logoH = logoW * (png.height / png.width);
    logoBottom = H - 72 - logoH;
    page.drawImage(png, { x: (W - logoW) / 2, y: logoBottom, width: logoW, height: logoH });
  } catch {
    // If the logo can't be embedded, fall back to a wordmark.
    center('RUTHERFORD', helvBold, 22, H - 90, dark);
    logoBottom = H - 96;
  }

  let y = logoBottom - 26;
  center('RUTHERFORD ACADEMY', helv, 9, y, gold);
  y -= 30;
  center(t.heading, helvBold, 24, y, dark);
  y -= 34;
  center(t.awardedTo, helv, 11, y, gray);
  y -= 28;
  center(recipient, helvBold, 22, y, dark);
  y -= 22;
  if (company) {
    center(company, helv, 11, y, gray);
    y -= 22;
  }
  center(t.forCompleting, helv, 11, y, gray);
  y -= 26;
  for (const line of wrap(helvBold, course.title, 16, 660)) {
    center(line, helvBold, 16, y, accent);
    y -= 22;
  }
  if (course.certificate) {
    y -= 2;
    center(course.certificate, helvBold, 11, y, gold);
    y -= 20;
  }
  if (scorePct != null) {
    center(t.assessmentPassed(scorePct), helv, 11, y, green);
    y -= 20;
  }
  center(`${course.duration} · ${course.modules} ${t.modulesWord}`, helv, 10, y, gray);

  // Footer: issue date + reference (left), seal label (right), issuer (centered).
  if (dateText) page.drawText(pdfSafe(t.issuedOn(dateText)), { x: 70, y: 86, size: 9, font: helv, color: gray });
  page.drawText(pdfSafe(`${t.referenceLabel}: ${reference}`), { x: 70, y: 72, size: 9, font: helv, color: gray });

  page.drawCircle({ x: W - 96, y: 96, size: 17, borderColor: gold, borderWidth: 1.5, color: rgb(0.98, 0.95, 0.86) });
  const sealLabel = pdfSafe('Rutherford Academy');
  const sealW = helvBold.widthOfTextAtSize(sealLabel, 8);
  page.drawText(sealLabel, { x: W - 96 - sealW / 2, y: 70, size: 8, font: helvBold, color: gold });

  center(t.issuer, helv, 8, 46, gray);

  const bytes = await pdf.save();
  const filename = `Rutherford-Academy-Certificate-${course.id}.pdf`;
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
