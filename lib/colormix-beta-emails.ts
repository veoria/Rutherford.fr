// ColorMix Kitchen private beta — the "you are invited" email. SERVER-ONLY.
//
// Sent once per person when their row appears in `cmx_beta` (the list behind
// the Kitchen's gate on colorloop.ai). Same branded shell as every other
// Rutherford email (render() of console-validation-emails). French for a
// request made in French, English otherwise.

import { render } from '@/lib/console-validation-emails';

const esc = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

type Copy = {
  subject: string;
  preheader: string;
  eyebrow: string;
  headline: { pre: string; accent: string; post: string };
  hello: (firstName: string) => string;
  body: (email: string) => string[];
  cta: string;
  url: string;
};

const COPY: Record<'fr' | 'en', Copy> = {
  fr: {
    subject: 'Votre invitation à la bêta ColorMix Kitchen',
    preheader: 'Votre demande est acceptée : la Kitchen vous est ouverte.',
    eyebrow: 'ColorMix Kitchen · Bêta privée',
    headline: { pre: 'Vous êtes ', accent: 'invité', post: ' dans la Kitchen.' },
    hello: (n) => (n ? `Bonjour ${n},` : 'Bonjour,'),
    body: (email) => [
      'Votre demande est acceptée : la bêta privée de <strong>ColorMix Kitchen</strong> vous est ouverte.',
      `<strong>Pour entrer :</strong> ouvrez la Kitchen, saisissez votre adresse <strong>${email}</strong>, puis le code reçu par email. Aucun mot de passe. Vous acceptez les conditions de la bêta, et la Kitchen s’ouvre.`,
      'Vous y formulez un ton direct à partir de sa mesure, vous le pesez au gramme, vous faites un tirage d’essai et vous recevez la correction, par ajouts uniquement.',
      'La bêta est gratuite et encore en réglage. Vos retours nous aident à la régler : répondez simplement à cet email.',
    ],
    cta: 'Ouvrir la Kitchen',
    url: 'https://colorloop.ai/fr/color-mix.html#kitchen',
  },
  en: {
    subject: 'Your invitation to the ColorMix Kitchen beta',
    preheader: 'Your request is accepted: the Kitchen is open to you.',
    eyebrow: 'ColorMix Kitchen · Private beta',
    headline: { pre: 'You are ', accent: 'invited', post: ' to the Kitchen.' },
    hello: (n) => (n ? `Hello ${n},` : 'Hello,'),
    body: (email) => [
      'Your request is accepted: the private beta of <strong>ColorMix Kitchen</strong> is open to you.',
      `<strong>To get in:</strong> open the Kitchen, enter your address <strong>${email}</strong>, then the code you receive by email. No password. You accept the beta terms, and the Kitchen opens.`,
      'There you formulate a spot color from its measurement, weigh it in grams, pull a draw-down and get the correction, by additions only.',
      'The beta is free and still being tuned. Your feedback helps us tune it: just reply to this email.',
    ],
    cta: 'Open the Kitchen',
    url: 'https://colorloop.ai/color-mix.html#kitchen',
  },
};

export function colormixBetaInviteEmail(opts: {
  email: string;
  name?: string | null;
  lang?: string | null;
}): { subject: string; html: string } {
  const c = COPY[(opts.lang ?? '').toLowerCase().startsWith('fr') ? 'fr' : 'en'];
  const firstName = (opts.name ?? '').trim().split(/\s+/)[0] ?? '';
  return {
    subject: c.subject,
    html: render({
      subject: c.subject,
      preheader: c.preheader,
      eyebrow: c.eyebrow,
      tone: 'ok',
      transactional: true,
      headline: c.headline,
      body: [c.hello(esc(firstName)), ...c.body(esc(opts.email))],
      cta: { label: c.cta, href: c.url },
    }),
  };
}
