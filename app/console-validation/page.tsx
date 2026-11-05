import type { Metadata } from 'next';
import { SEO_COPY, localizedMetadata, requestLocale } from '@/lib/seo';
import type { Locale } from '@/components/language-provider';
import { ConsoleValidationPage, type ConsoleValidationFaqItem } from '@/components/console-validation-page';
import { getCvInvitationByToken } from '@/lib/console-invitations';

export function generateMetadata(): Metadata {
  return localizedMetadata({
    path: '/console-validation',
    title: SEO_COPY.consoleValidation.title,
    description: SEO_COPY.consoleValidation.description,
    image: { url: '/images/og-console-validation.png', alt: 'Is your press ready for closed-loop color?' },
  });
}

export const dynamic = 'force-dynamic';

// Rendered in the page and mirrored in the FAQPage JSON-LD, in the locale of
// the request (/fr, /de, … are rewritten here by the middleware).
const FAQ: Record<Locale, ConsoleValidationFaqItem[]> = {
  en: [
    {
      q: 'What is a console validation?',
      a: 'It is the free eligibility check for Rutherford closed-loop color. You send a few photos of your press console; Rutherford confirms within one business day whether your press qualifies and what the next step looks like.',
    },
    {
      q: 'Is the console validation really free?',
      a: 'Yes. It takes about two minutes, costs nothing and commits you to nothing. It simply tells you whether your console can run closed-loop color control.',
    },
    {
      q: 'Which press brands are compatible?',
      a: 'Rutherford ColorLoop is press-agnostic. Compatible console families include Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi, Ryobi, Goss and Presstek. The validation confirms your exact model and generation.',
    },
    {
      q: 'What happens after I submit the form?',
      a: 'Our team reviews your photos and comes back within one business day with your press eligibility, either for Rutherford ColorLoop on your existing measurement setup or for a complete measurement and closed-loop setup.',
    },
  ],
  fr: [
    {
      q: 'Qu’est-ce qu’une validation console ?',
      a: 'C’est la vérification d’éligibilité gratuite au closed-loop couleur Rutherford. Vous envoyez quelques photos de la console de votre presse ; Rutherford vous confirme sous un jour ouvré si votre presse est éligible et quelle est l’étape suivante.',
    },
    {
      q: 'La validation console est-elle vraiment gratuite ?',
      a: 'Oui. Elle prend environ deux minutes, ne coûte rien et ne vous engage à rien. Elle vous dit simplement si votre console peut piloter un contrôle couleur closed-loop.',
    },
    {
      q: 'Quelles marques de presses sont compatibles ?',
      a: 'Rutherford ColorLoop est indépendant du constructeur. Les familles de consoles compatibles comprennent Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi, Ryobi, Goss et Presstek. La validation confirme votre modèle et votre génération exacts.',
    },
    {
      q: 'Que se passe-t-il après l’envoi du formulaire ?',
      a: 'Notre équipe examine vos photos et vous répond sous un jour ouvré sur l’éligibilité de votre presse : soit Rutherford ColorLoop sur votre dispositif de mesure existant, soit une installation complète de mesure et de closed-loop.',
    },
  ],
  de: [
    {
      q: 'Was ist eine Konsolenvalidierung?',
      a: 'Die kostenlose Eignungsprüfung für die Closed-Loop-Farbregelung von Rutherford. Sie senden ein paar Fotos der Konsole Ihrer Druckmaschine; Rutherford bestätigt innerhalb eines Werktags, ob Ihre Druckmaschine geeignet ist und wie der nächste Schritt aussieht.',
    },
    {
      q: 'Ist die Konsolenvalidierung wirklich kostenlos?',
      a: 'Ja. Sie dauert etwa zwei Minuten, kostet nichts und verpflichtet Sie zu nichts. Sie sagt Ihnen einfach, ob Ihre Konsole eine Closed-Loop-Farbregelung betreiben kann.',
    },
    {
      q: 'Welche Druckmaschinenhersteller sind kompatibel?',
      a: 'Rutherford ColorLoop ist herstellerunabhängig. Zu den kompatiblen Konsolenfamilien gehören Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi, Ryobi, Goss und Presstek. Die Validierung bestätigt Ihr genaues Modell und Ihre Generation.',
    },
    {
      q: 'Was passiert nach dem Absenden des Formulars?',
      a: 'Unser Team prüft Ihre Fotos und meldet sich innerhalb eines Werktags mit der Eignung Ihrer Druckmaschine zurück: entweder für Rutherford ColorLoop auf Ihrer vorhandenen Messtechnik oder für eine komplette Mess- und Closed-Loop-Installation.',
    },
  ],
  it: [
    {
      q: 'Che cos’è una validazione console?',
      a: 'È la verifica di idoneità gratuita al closed-loop colore Rutherford. Invia qualche foto della console della sua macchina; Rutherford le conferma entro un giorno lavorativo se la macchina è idonea e quale è il passo successivo.',
    },
    {
      q: 'La validazione console è davvero gratuita?',
      a: 'Sì. Richiede circa due minuti, non costa nulla e non la impegna a nulla. Le dice semplicemente se la sua console può gestire un controllo colore closed-loop.',
    },
    {
      q: 'Quali marche di macchine sono compatibili?',
      a: 'Rutherford ColorLoop è indipendente dal costruttore. Le famiglie di console compatibili includono Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi, Ryobi, Goss e Presstek. La validazione conferma il suo modello e la sua generazione esatti.',
    },
    {
      q: 'Cosa succede dopo l’invio del modulo?',
      a: 'Il nostro team esamina le sue foto e le risponde entro un giorno lavorativo con l’idoneità della sua macchina: Rutherford ColorLoop sul suo dispositivo di misura esistente oppure un’installazione completa di misura e closed-loop.',
    },
  ],
  es: [
    {
      q: '¿Qué es una validación de consola?',
      a: 'Es la comprobación de compatibilidad gratuita con el closed-loop de color de Rutherford. Usted envía unas fotos de la consola de su prensa; Rutherford le confirma en un día laborable si su prensa es apta y cuál es el siguiente paso.',
    },
    {
      q: '¿La validación de consola es realmente gratuita?',
      a: 'Sí. Lleva unos dos minutos, no cuesta nada y no le compromete a nada. Simplemente le indica si su consola puede ejecutar un control del color closed-loop.',
    },
    {
      q: '¿Qué marcas de prensas son compatibles?',
      a: 'Rutherford ColorLoop es independiente del fabricante. Las familias de consolas compatibles incluyen Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi, Ryobi, Goss y Presstek. La validación confirma su modelo y generación exactos.',
    },
    {
      q: '¿Qué ocurre después de enviar el formulario?',
      a: 'Nuestro equipo revisa sus fotos y le responde en un día laborable con la compatibilidad de su prensa: Rutherford ColorLoop sobre su dispositivo de medición actual o una instalación completa de medición y closed-loop.',
    },
  ],
  pt: [
    {
      q: 'O que é uma validação de consola?',
      a: 'É a verificação de compatibilidade gratuita com o closed-loop de cor da Rutherford. Envia algumas fotos da consola da sua máquina; a Rutherford confirma num dia útil se a sua máquina é elegível e qual é o passo seguinte.',
    },
    {
      q: 'A validação de consola é mesmo gratuita?',
      a: 'Sim. Demora cerca de dois minutos, não custa nada e não o compromete a nada. Diz-lhe simplesmente se a sua consola pode correr um controlo de cor closed-loop.',
    },
    {
      q: 'Que marcas de máquinas são compatíveis?',
      a: 'O Rutherford ColorLoop é independente do fabricante. As famílias de consolas compatíveis incluem Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi, Ryobi, Goss e Presstek. A validação confirma o seu modelo e geração exatos.',
    },
    {
      q: 'O que acontece depois de enviar o formulário?',
      a: 'A nossa equipa analisa as suas fotos e responde num dia útil com a compatibilidade da sua máquina: o Rutherford ColorLoop sobre o seu dispositivo de medição atual ou uma instalação completa de medição e closed-loop.',
    },
  ],
};

export default async function ConsoleValidationRoute({
  searchParams,
}: {
  searchParams: { invite?: string };
}) {
  const locale = requestLocale();
  const faq = FAQ[locale] ?? FAQ.en;
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const token = typeof searchParams.invite === 'string' ? searchParams.invite : '';
  const inv = token ? await getCvInvitationByToken(token) : null;
  const invite = inv
    ? { token: inv.token, clientEmail: inv.clientEmail, company: inv.company, inviterCompany: inv.inviterCompany }
    : undefined;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <ConsoleValidationPage faq={faq} invite={invite} />
    </>
  );
}
