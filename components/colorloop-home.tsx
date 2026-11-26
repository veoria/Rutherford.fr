'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage, type Locale } from '@/components/language-provider';
import { SiteNav } from '@/components/site-nav';
import HOME_LAYOUT from '@/data/home/layout.json';
import { homeLink } from '@/lib/home-links';
import PPWR_COPY from '@/data/home/ppwr-section.json';
import { STORY_MARKUP } from '@/components/colorloop-story-markup';
import { HERO_BOOT, HERO_DOTS } from '@/components/colorloop-hero-markup';
import { ROI_MARKUP } from '@/components/colorloop-roi-markup';
import ARTICLES from '@/data/blog-articles.json';
import './colorloop-home.css';

// The current homepage's blocks, in the order of data/home/layout.json, so the
// team can keep, hide or reorder them from /dev/edit as before. Two of them are
// redrawn here (outcomes without pictograms, PPWR as plain text) and the old
// ColorLoop block is dropped: everything about ColorLoop now lives at the top.
const SECTIONS = {
  'brand-explainer-section': dynamic(() => import('@/components/brand-explainer-section').then((m) => m.BrandExplainerSection), { ssr: true }),
  'case-studies-showcase': dynamic(() => import('@/components/case-studies-showcase').then((m) => m.CaseStudiesShowcase), { ssr: true }),
  'ppwr-section': Regulation,
};
const SiteFooter = dynamic(() => import('@/components/site-footer').then((m) => m.SiteFooter), { ssr: true });

const IMG = '/images/colorloop-ai';
const MEET_URL = 'https://rutherfordindustriesgraphiques-2bd706.pipedrive.com/scheduler/3KG0yJSy/meeting';
const CRA_URL = 'https://eur-lex.europa.eu/eli/reg/2024/2847/oj';

// colorloop.ai has en / fr / de / es / it / pt.
const CL_LOCALES: Locale[] = ['fr', 'de', 'es', 'it', 'pt'];
function colorloopUrl(locale: Locale, page = '') {
  const prefix = CL_LOCALES.includes(locale) ? `/${locale}` : '';
  return `https://colorloop.ai${prefix}/${page}`;
}
function localPath(locale: Locale, path: string) {
  return locale === 'en' ? path : `/${locale}${path}`;
}

const PRESSES = [
  ['heidelberg', 'Heidelberg'], ['komori', 'Komori'], ['koenig-bauer', 'Koenig & Bauer'], ['manroland', 'Manroland'],
  ['mitsubishi', 'Mitsubishi'], ['ryobi', 'Ryobi'], ['goss', 'Goss'], ['presstek', 'Presstek'],
] as const;

// Short films from colorloop.ai: a silent loop in the card, the YouTube Short on click.
const CLIPS = [
  { file: 'speedmaster-xl', yt: 'o5vBn7sEsWk', title: 'Speedmaster XL with ColorLoop', length: '0:26' },
  { file: 'press-loop-pink', yt: '1oJFkrJ7KZQ', title: 'ColorLoop on Manroland', length: '0:17' },
  { file: 'cylinder', yt: 'UvM4pLFD89M', title: 'ColorLoop on Heidelberg Speedmaster', length: '0:26' },
];
const FACES = ['r7_4EdplcdE', 'ut247z4ren8', 'yAZbtKzN_j0'];

type Copy = {
  title: [string, string];
  lead: string;
  promo3: string;
  primary: string;
  secondary: string;
  dotsAlt: string;
  pressesLabel: string;
  clipsTitle: string;
  clipsLead: string;
  clipsLink: string;
  playFilm: string;
  warnLabel: string;
  warnTitle: string;
  warnBody: string;
  warn: [string, string][];
  warnNote: string;
  warnCta: string;
  cfgTitle: string;
  cfgLead: string;
  cfgPlan: string;
  cfgYearly: [string, string];
  cfgMonthly: [string, string];
  promo: string;
  cfgPc: string;
  cfgPcMine: [string, string];
  cfgPcOurs: [string, string];
  cfgPresses: string;
  cfgToday: string;
  cfgThenYear: string;
  cfgThenMonth: string;
  cfgLicense: string;
  orderCta: string;
  checkCta: string;
  orderNote: string;
  meetCta: string;
  regulationCta: string;
  articlesTitle: string;
  articlesAll: string;
  whoTitle: string;
  whoBody: string;
  whoStats: [string, string][];
  whoLink: string;
};

const EN: Copy = {
  title: ['Rutherford customer?', 'Switch to ColorLoop'],
  lead: 'Same press, same console.',
  promo3: '3 months free',
  primary: 'Switch to ColorLoop',
  secondary: 'New to Rutherford?',
  dotsAlt: 'The five ColorLoop ink dots: red, pink, blue, yellow and green',
  pressesLabel: 'Works on these presses',
  clipsTitle: 'On real presses.',
  clipsLead: '1,000+ systems in 30+ countries.',
  clipsLink: 'Watch the customer stories',
  playFilm: 'Play the film',
  warnLabel: 'Cyber Resilience Act',
  warnTitle: 'An old PC is an open door to cyberattacks.',
  warnBody: 'EasySet, EasyLoop, IntelliSet, IntelliLoop: on a Windows that no longer gets updates, your press is exposed. ColorLoop closes the door.',
  warn: [
    ['Cyber Resilience Act', 'EU regulation 2024/2847 makes security a requirement for connected software: vulnerability reporting since September 11, 2026, main obligations from December 11, 2027.'],
    ['Windows 11', 'ColorLoop runs on Windows 11, the version Microsoft still updates. The ColorLoop PC ships with it.'],
    ['Updates included', 'Software, updates and support come with the subscription.'],
  ],
  warnNote: 'Cyber Resilience Act: obligations apply from December 11, 2027.',
  warnCta: 'Switch to ColorLoop',
  cfgTitle: 'Prepare your ColorLoop.',
  cfgLead: 'Three choices, then your console validation: Rutherford checks your setup and calls you to prepare the switch.',
  cfgPlan: 'Plan',
  cfgYearly: ['Yearly', '€5,300 per press and year'],
  cfgMonthly: ['Monthly', '€590 per press and month, no commitment'],
  promo: 'Promotion · 3 months free',
  cfgPc: 'PC',
  cfgPcMine: ['Keep my PC', 'Windows 10 or 11. ColorLoop is installed on it.'],
  cfgPcOurs: ['ColorLoop PC', 'Lenovo ThinkCentre M90a, Windows 11, ColorLoop installed. +€1,650 one-time.'],
  cfgPresses: 'Presses',
  cfgToday: 'Today, excl. VAT',
  cfgThenYear: 'then {x} a year',
  cfgThenMonth: 'then {x} a month',
  cfgLicense: 'Your Rutherford license stays yours.',
  orderCta: 'Order online',
  checkCta: 'Request console validation',
  orderNote: 'Ordering online reserves your offer. The installation is always prepared with us.',
  meetCta: 'Book a phone or video call',
  regulationCta: 'Discover PPWR Connect',
  articlesTitle: 'From the blog',
  articlesAll: 'See all articles',
  whoTitle: 'Closed-loop color control for offset, for 25 years.',
  whoBody: 'Rutherford connects offset press consoles to color measurement: Heidelberg Prinect and CP2000, Komori, Koenig & Bauer ErgoTronic, Manroland ColorPilot, Mitsubishi, Ryobi.',
  whoStats: [['25+', 'years'], ['30+', 'countries'], ['1,000+', 'systems installed']],
  whoLink: 'Read the closed-loop guide',
};

const FR: Copy = {
  title: ['Client Rutherford ?', 'Passez à ColorLoop'],
  lead: 'Même presse, même pupitre.',
  promo3: '3 mois offerts',
  primary: 'Passer à ColorLoop',
  secondary: 'Nouveau chez Rutherford ?',
  dotsAlt: 'Les cinq dots ColorLoop : rouge, rose, bleu, jaune et vert',
  pressesLabel: 'Compatible avec ces presses',
  clipsTitle: 'Sur de vraies presses.',
  clipsLead: '1 000+ systèmes dans 30+ pays.',
  clipsLink: 'Voir les témoignages clients',
  playFilm: 'Lancer le film',
  warnLabel: 'Cyber Resilience Act',
  warnTitle: 'Un vieux PC, c’est une porte ouverte aux cyberattaques.',
  warnBody: 'EasySet, EasyLoop, IntelliSet, IntelliLoop : sur un Windows qui n’est plus mis à jour, votre presse est exposée. ColorLoop referme la porte.',
  warn: [
    ['Cyber Resilience Act', 'Le règlement UE 2024/2847 fait de la sécurité une exigence pour les logiciels connectés : signalement des vulnérabilités depuis le 11 septembre 2026, obligations principales au 11 décembre 2027.'],
    ['Windows 11', 'ColorLoop tourne sous Windows 11, la version que Microsoft met encore à jour. Le PC ColorLoop est livré avec.'],
    ['Mises à jour incluses', 'Logiciel, mises à jour et support sont compris dans l’abonnement.'],
  ],
  warnNote: 'Cyber Resilience Act : obligations au 11 décembre 2027.',
  warnCta: 'Passer à ColorLoop',
  cfgTitle: 'Préparez votre ColorLoop.',
  cfgLead: 'Trois choix, puis la validation de votre console : Rutherford vérifie votre installation et vous rappelle pour préparer le passage à ColorLoop.',
  cfgPlan: 'Abonnement',
  cfgYearly: ['Annuel', '5 300 € HT par presse et par an'],
  cfgMonthly: ['Mensuel', '590 € HT par presse et par mois, sans engagement'],
  promo: 'Promotion · 3 mois offerts',
  cfgPc: 'PC',
  cfgPcMine: ['Je garde mon PC', 'Windows 10 ou 11. ColorLoop s’y installe.'],
  cfgPcOurs: ['PC ColorLoop', 'Lenovo ThinkCentre M90a, Windows 11, ColorLoop installé. +1 650 € HT en une fois.'],
  cfgPresses: 'Presses',
  cfgToday: 'Aujourd’hui, HT',
  cfgThenYear: 'puis {x} par an',
  cfgThenMonth: 'puis {x} par mois',
  cfgLicense: 'Votre licence Rutherford reste la vôtre.',
  orderCta: 'Commander en ligne',
  checkCta: 'Demander une validation console',
  orderNote: 'La commande en ligne réserve votre offre. L’installation se prépare toujours avec nous.',
  meetCta: 'Prendre rendez-vous, par téléphone ou en visio',
  regulationCta: 'Découvrir PPWR Connect',
  articlesTitle: 'Le blog',
  articlesAll: 'Voir tous les articles',
  whoTitle: 'Le contrôle couleur closed-loop pour l’offset, depuis 25 ans.',
  whoBody: 'Rutherford relie les pupitres de presse offset à la mesure couleur : Heidelberg Prinect et CP2000, Komori, Koenig & Bauer ErgoTronic, Manroland ColorPilot, Mitsubishi, Ryobi.',
  whoStats: [['25+', 'ans'], ['30+', 'pays'], ['1 000+', 'systèmes installés']],
  whoLink: 'Lire le guide du closed-loop',
};

const DE: Copy = {
  title: ['Rutherford-Kunde?', 'Wechseln Sie zu ColorLoop'],
  lead: 'Gleiche Druckmaschine, gleiches Pult.',
  promo3: '3 Monate gratis',
  primary: 'Zu ColorLoop wechseln',
  secondary: 'Neu bei Rutherford?',
  dotsAlt: 'Die fünf ColorLoop-Dots: Rot, Rosa, Blau, Gelb und Grün',
  pressesLabel: 'Läuft auf diesen Druckmaschinen',
  clipsTitle: 'Auf echten Druckmaschinen.',
  clipsLead: '1.000+ Systeme in 30+ Ländern.',
  clipsLink: 'Kundenreferenzen ansehen',
  playFilm: 'Film abspielen',
  warnLabel: 'Cyber Resilience Act',
  warnTitle: 'Ein alter PC ist ein offenes Tor für Cyberangriffe.',
  warnBody: 'EasySet, EasyLoop, IntelliSet, IntelliLoop: Auf einem Windows ohne Updates ist Ihre Druckmaschine angreifbar. ColorLoop schließt die Tür.',
  warn: [
    ['Cyber Resilience Act', 'Die EU-Verordnung 2024/2847 macht Sicherheit zur Pflicht für vernetzte Software: Meldung von Schwachstellen seit dem 11. September 2026, Hauptpflichten ab dem 11. Dezember 2027.'],
    ['Windows 11', 'ColorLoop läuft unter Windows 11, der Version, die Microsoft weiterhin aktualisiert. Der ColorLoop-PC wird damit geliefert.'],
    ['Updates inklusive', 'Software, Updates und Support sind im Abonnement enthalten.'],
  ],
  warnNote: 'Cyber Resilience Act: Pflichten ab dem 11. Dezember 2027.',
  warnCta: 'Zu ColorLoop wechseln',
  cfgTitle: 'Stellen Sie Ihr ColorLoop zusammen.',
  cfgLead: 'Drei Entscheidungen, dann die Konsolenvalidierung: Rutherford prüft Ihre Installation und ruft Sie an, um den Wechsel zu ColorLoop vorzubereiten.',
  cfgPlan: 'Abonnement',
  cfgYearly: ['Jährlich', '5.300 € pro Druckmaschine und Jahr'],
  cfgMonthly: ['Monatlich', '590 € pro Druckmaschine und Monat, ohne Bindung'],
  promo: 'Aktion · 3 Monate gratis',
  cfgPc: 'PC',
  cfgPcMine: ['Eigenen PC behalten', 'Windows 10 oder 11. ColorLoop wird darauf installiert.'],
  cfgPcOurs: ['ColorLoop-PC', 'Lenovo ThinkCentre M90a, Windows 11, ColorLoop installiert. +1.650 € einmalig.'],
  cfgPresses: 'Druckmaschinen',
  cfgToday: 'Heute, zzgl. MwSt.',
  cfgThenYear: 'danach {x} pro Jahr',
  cfgThenMonth: 'danach {x} pro Monat',
  cfgLicense: 'Ihre Rutherford-Lizenz bleibt Ihre.',
  orderCta: 'Online bestellen',
  checkCta: 'Konsolenvalidierung anfragen',
  orderNote: 'Die Online-Bestellung sichert Ihr Angebot. Die Installation bereiten wir immer gemeinsam mit Ihnen vor.',
  meetCta: 'Termin vereinbaren, per Telefon oder Video',
  regulationCta: 'PPWR Connect entdecken',
  articlesTitle: 'Aus dem Blog',
  articlesAll: 'Alle Artikel ansehen',
  whoTitle: 'Closed-Loop-Farbsteuerung für den Offsetdruck, seit 25 Jahren.',
  whoBody: 'Rutherford verbindet die Pulte von Offset-Druckmaschinen mit der Farbmessung: Heidelberg Prinect und CP2000, Komori, Koenig & Bauer ErgoTronic, Manroland ColorPilot, Mitsubishi, Ryobi.',
  whoStats: [['25+', 'Jahre'], ['30+', 'Länder'], ['1.000+', 'installierte Systeme']],
  whoLink: 'Den Closed-Loop-Leitfaden lesen',
};

const IT: Copy = {
  title: ['Cliente Rutherford?', 'Passi a ColorLoop'],
  lead: 'Stessa macchina, stesso pulpito.',
  promo3: '3 mesi gratis',
  primary: 'Passa a ColorLoop',
  secondary: 'Nuovo in Rutherford?',
  dotsAlt: 'I cinque dot ColorLoop: rosso, rosa, blu, giallo e verde',
  pressesLabel: 'Compatibile con queste macchine',
  clipsTitle: 'Su vere macchine da stampa.',
  clipsLead: '1.000+ sistemi in 30+ paesi.',
  clipsLink: 'Guardi le testimonianze dei clienti',
  playFilm: 'Avvia il video',
  warnLabel: 'Cyber Resilience Act',
  warnTitle: 'Un vecchio PC è una porta aperta agli attacchi informatici.',
  warnBody: 'EasySet, EasyLoop, IntelliSet, IntelliLoop: su un Windows non più aggiornato, la Sua macchina è esposta. ColorLoop chiude la porta.',
  warn: [
    ['Cyber Resilience Act', 'Il regolamento UE 2024/2847 rende la sicurezza un requisito per il software connesso: segnalazione delle vulnerabilità dall’11 settembre 2026, obblighi principali dall’11 dicembre 2027.'],
    ['Windows 11', 'ColorLoop funziona con Windows 11, la versione che Microsoft aggiorna ancora. Il PC ColorLoop viene fornito con Windows 11.'],
    ['Aggiornamenti inclusi', 'Software, aggiornamenti e assistenza sono compresi nell’abbonamento.'],
  ],
  warnNote: 'Cyber Resilience Act: obblighi dall’11 dicembre 2027.',
  warnCta: 'Passa a ColorLoop',
  cfgTitle: 'Prepari il Suo ColorLoop.',
  cfgLead: 'Tre scelte, poi la validazione della Sua console: Rutherford verifica l’installazione e La richiama per preparare il passaggio a ColorLoop.',
  cfgPlan: 'Abbonamento',
  cfgYearly: ['Annuale', '5.300 € per macchina all’anno'],
  cfgMonthly: ['Mensile', '590 € per macchina al mese, senza vincoli'],
  promo: 'Promozione · 3 mesi gratis',
  cfgPc: 'PC',
  cfgPcMine: ['Tengo il mio PC', 'Windows 10 o 11. ColorLoop viene installato sul PC.'],
  cfgPcOurs: ['PC ColorLoop', 'Lenovo ThinkCentre M90a, Windows 11, ColorLoop installato. +1.650 € una tantum.'],
  cfgPresses: 'Macchine',
  cfgToday: 'Oggi, IVA esclusa',
  cfgThenYear: 'poi {x} all’anno',
  cfgThenMonth: 'poi {x} al mese',
  cfgLicense: 'La Sua licenza Rutherford resta Sua.',
  orderCta: 'Ordina online',
  checkCta: 'Richiedi validazione console',
  orderNote: 'L’ordine online riserva la Sua offerta. L’installazione si prepara sempre insieme a noi.',
  meetCta: 'Fissi un appuntamento, al telefono o in video',
  regulationCta: 'Scopri PPWR Connect',
  articlesTitle: 'Dal blog',
  articlesAll: 'Tutti gli articoli',
  whoTitle: 'Il controllo colore closed-loop per l’offset, da 25 anni.',
  whoBody: 'Rutherford collega i pulpiti delle macchine offset alla misura del colore: Heidelberg Prinect e CP2000, Komori, Koenig & Bauer ErgoTronic, Manroland ColorPilot, Mitsubishi, Ryobi.',
  whoStats: [['25+', 'anni'], ['30+', 'paesi'], ['1.000+', 'sistemi installati']],
  whoLink: 'Legga la guida closed-loop',
};

const ES: Copy = {
  title: ['¿Cliente de Rutherford?', 'Pase a ColorLoop'],
  lead: 'Misma prensa, misma consola.',
  promo3: '3 meses gratis',
  primary: 'Pasar a ColorLoop',
  secondary: '¿Nuevo en Rutherford?',
  dotsAlt: 'Los cinco dots de ColorLoop: rojo, rosa, azul, amarillo y verde',
  pressesLabel: 'Compatible con estas prensas',
  clipsTitle: 'En prensas reales.',
  clipsLead: '1.000+ sistemas en 30+ países.',
  clipsLink: 'Ver los testimonios de clientes',
  playFilm: 'Ver el vídeo',
  warnLabel: 'Cyber Resilience Act',
  warnTitle: 'Un PC antiguo es una puerta abierta a los ciberataques.',
  warnBody: 'EasySet, EasyLoop, IntelliSet, IntelliLoop: con un Windows sin actualizaciones, su prensa está expuesta. ColorLoop cierra la puerta.',
  warn: [
    ['Cyber Resilience Act', 'El Reglamento UE 2024/2847 convierte la seguridad en un requisito para el software conectado: notificación de vulnerabilidades desde el 11 de septiembre de 2026, obligaciones principales a partir del 11 de diciembre de 2027.'],
    ['Windows 11', 'ColorLoop funciona con Windows 11, la versión que Microsoft sigue actualizando. El PC ColorLoop se entrega con él.'],
    ['Actualizaciones incluidas', 'Software, actualizaciones y soporte están incluidos en la suscripción.'],
  ],
  warnNote: 'Cyber Resilience Act: obligaciones a partir del 11 de diciembre de 2027.',
  warnCta: 'Pasar a ColorLoop',
  cfgTitle: 'Prepare su ColorLoop.',
  cfgLead: 'Tres elecciones y, después, la validación de su consola: Rutherford comprueba su instalación y le llama para preparar el paso a ColorLoop.',
  cfgPlan: 'Suscripción',
  cfgYearly: ['Anual', '5.300 € por prensa y año'],
  cfgMonthly: ['Mensual', '590 € por prensa y mes, sin permanencia'],
  promo: 'Promoción · 3 meses gratis',
  cfgPc: 'PC',
  cfgPcMine: ['Conservo mi PC', 'Windows 10 u 11. ColorLoop se instala en él.'],
  cfgPcOurs: ['PC ColorLoop', 'Lenovo ThinkCentre M90a, Windows 11, ColorLoop instalado. +1.650 €, pago único.'],
  cfgPresses: 'Prensas',
  cfgToday: 'Hoy, sin IVA',
  cfgThenYear: 'después {x} al año',
  cfgThenMonth: 'después {x} al mes',
  cfgLicense: 'Su licencia Rutherford sigue siendo suya.',
  orderCta: 'Pedir en línea',
  checkCta: 'Solicitar validación de consola',
  orderNote: 'El pedido en línea reserva su oferta. La instalación se prepara siempre con nosotros.',
  meetCta: 'Reservar una llamada o videollamada',
  regulationCta: 'Descubrir PPWR Connect',
  articlesTitle: 'Del blog',
  articlesAll: 'Ver todos los artículos',
  whoTitle: 'Control del color closed-loop para offset, desde hace 25 años.',
  whoBody: 'Rutherford conecta las consolas de prensa offset con la medición del color: Heidelberg Prinect y CP2000, Komori, Koenig & Bauer ErgoTronic, Manroland ColorPilot, Mitsubishi, Ryobi.',
  whoStats: [['25+', 'años'], ['30+', 'países'], ['1.000+', 'sistemas instalados']],
  whoLink: 'Leer la guía closed-loop',
};

const PT: Copy = {
  title: ['Cliente Rutherford?', 'Mude para o ColorLoop'],
  lead: 'A mesma máquina, a mesma consola.',
  promo3: '3 meses grátis',
  primary: 'Mudar para o ColorLoop',
  secondary: 'Novo na Rutherford?',
  dotsAlt: 'Os cinco dots do ColorLoop: vermelho, rosa, azul, amarelo e verde',
  pressesLabel: 'Compatível com estas máquinas',
  clipsTitle: 'Em máquinas reais.',
  clipsLead: '1.000+ sistemas em 30+ países.',
  clipsLink: 'Ver os testemunhos de clientes',
  playFilm: 'Ver o vídeo',
  warnLabel: 'Cyber Resilience Act',
  warnTitle: 'Um PC antigo é uma porta aberta a ciberataques.',
  warnBody: 'EasySet, EasyLoop, IntelliSet, IntelliLoop: num Windows sem atualizações, a sua máquina fica exposta. O ColorLoop fecha a porta.',
  warn: [
    ['Cyber Resilience Act', 'O Regulamento UE 2024/2847 torna a segurança um requisito para o software ligado à rede: notificação de vulnerabilidades desde 11 de setembro de 2026, obrigações principais a partir de 11 de dezembro de 2027.'],
    ['Windows 11', 'O ColorLoop funciona em Windows 11, a versão que a Microsoft continua a atualizar. O PC ColorLoop é entregue com ele.'],
    ['Atualizações incluídas', 'Software, atualizações e suporte estão incluídos na subscrição.'],
  ],
  warnNote: 'Cyber Resilience Act: obrigações a partir de 11 de dezembro de 2027.',
  warnCta: 'Mudar para o ColorLoop',
  cfgTitle: 'Prepare o seu ColorLoop.',
  cfgLead: 'Três escolhas e, depois, a validação da sua consola: a Rutherford verifica a sua instalação e liga-lhe para preparar a passagem para o ColorLoop.',
  cfgPlan: 'Subscrição',
  cfgYearly: ['Anual', '5.300 € por máquina e por ano'],
  cfgMonthly: ['Mensal', '590 € por máquina e por mês, sem fidelização'],
  promo: 'Promoção · 3 meses grátis',
  cfgPc: 'PC',
  cfgPcMine: ['Mantenho o meu PC', 'Windows 10 ou 11. O ColorLoop é instalado nele.'],
  cfgPcOurs: ['PC ColorLoop', 'Lenovo ThinkCentre M90a, Windows 11, ColorLoop instalado. +1.650 €, pagamento único.'],
  cfgPresses: 'Máquinas',
  cfgToday: 'Hoje, sem IVA',
  cfgThenYear: 'depois {x} por ano',
  cfgThenMonth: 'depois {x} por mês',
  cfgLicense: 'A sua licença Rutherford continua a ser sua.',
  orderCta: 'Encomendar online',
  checkCta: 'Pedir validação de consola',
  orderNote: 'A encomenda online reserva a sua oferta. A instalação prepara-se sempre connosco.',
  meetCta: 'Marcar uma chamada ou videochamada',
  regulationCta: 'Descobrir o PPWR Connect',
  articlesTitle: 'Do blog',
  articlesAll: 'Ver todos os artigos',
  whoTitle: 'Controlo de cor closed-loop para offset, há 25 anos.',
  whoBody: 'A Rutherford liga as consolas das máquinas offset à medição de cor: Heidelberg Prinect e CP2000, Komori, Koenig & Bauer ErgoTronic, Manroland ColorPilot, Mitsubishi, Ryobi.',
  whoStats: [['25+', 'anos'], ['30+', 'países'], ['1.000+', 'sistemas instalados']],
  whoLink: 'Ler o guia closed-loop',
};

const COPY: Record<Locale, Copy> = { en: EN, fr: FR, de: DE, it: IT, es: ES, pt: PT };

function useCopy() {
  const { locale } = useLanguage();
  return { locale, t: COPY[locale], upgradeUrl: colorloopUrl(locale, 'rutherford-customers#subscribe') };
}

/* ---------- colorloop.ai's scripts: plain script tags, appended once the markup is on the page ---------- */
function useScripts(srcs: string[]) {
  useEffect(() => {
    let cancelled = false;
    const added: HTMLScriptElement[] = [];
    (async () => {
      for (const src of srcs) {
        if (cancelled) return;
        await new Promise<void>((resolve) => {
          const el = document.createElement('script');
          el.src = src;
          el.onload = () => resolve();
          el.onerror = () => resolve();
          document.body.appendChild(el);
          added.push(el);
        });
      }
    })();
    return () => { cancelled = true; added.forEach((el) => el.remove()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/* ---------- The press films play on their own once in view ---------- */
function useClipsAutoplay() {
  useEffect(() => {
    const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('.clh-clip video'));
    if (!videos.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) {
          if (!v.src) v.src = v.dataset.src ?? '';
          v.play().catch(() => {});
        } else v.pause();
      });
    }, { threshold: 0.35 });
    videos.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);
}

/* ---------- The story: colorloop.ai's own section and script ---------- */
function Story({ locale }: { locale: Locale }) {
  const html = STORY_MARKUP[locale === 'fr' ? 'fr' : 'en'];
  useScripts(['/colorloop-story/motion.js', '/colorloop-story/home-story.js']);
  return (
    <>
      <link rel="stylesheet" href="/colorloop-story/home-story.css" />
      <div className="clh-story" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

/* ---------- Prepare your ColorLoop: plan, PC, presses, then order ---------- */
const PRICE = { yearly: 5300, monthly: 590, pc: 1650 };

function Configurator({ locale, t, upgradeUrl, checkUrl }: { locale: Locale; t: Copy; upgradeUrl: string; checkUrl: string }) {
  const [plan, setPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [pc, setPc] = useState<'mine' | 'ours'>('ours');
  const [presses, setPresses] = useState(1);
  const money = (n: number) => (locale === 'en' ? `€${n.toLocaleString('en-US')}` : `${n.toLocaleString(locale === 'fr' ? 'fr-FR' : 'de-DE')} €`);
  const recurring = (plan === 'yearly' ? PRICE.yearly : PRICE.monthly) * presses;
  const today = recurring + (pc === 'ours' ? PRICE.pc * presses : 0);
  const then = (plan === 'yearly' ? t.cfgThenYear : t.cfgThenMonth).replace('{x}', money(recurring));
  // The console validation carries the offer chosen here, so the team sees it with the lead.
  const offer = [plan === 'yearly' ? t.cfgYearly[0] : t.cfgMonthly[0], pc === 'ours' ? t.cfgPcOurs[0] : t.cfgPcMine[0], `${t.cfgPresses} ${presses}`].join(' · ');
  const validationUrl = `${checkUrl}?offer=${encodeURIComponent(offer)}#submit`;

  const Option = ({ on, onClick, label, detail, promo }: { on: boolean; onClick: () => void; label: string; detail: string; promo?: string }) => (
    <button type="button" className="clh-opt" aria-pressed={on} onClick={onClick}>
      <span className="clh-opt-check" aria-hidden="true" />
      <span className="clh-opt-body">
        <strong>{label}{promo ? <em className="clh-promo">{promo}</em> : null}</strong>
        <span>{detail}</span>
      </span>
    </button>
  );

  return (
    <section className="clh-cfg" id="prepare" aria-labelledby="clh-cfg-title">
      <div className="clh-wrap clh-cfg-grid">
        <div className="clh-cfg-copy">
          <h2 id="clh-cfg-title" className="clh-h2">{t.cfgTitle}</h2>
          <p className="clh-body">{t.cfgLead}</p>
          <img className="clh-cfg-pc" src={`${IMG}/pc-colorloop.webp`} alt="" width={1200} height={763} loading="lazy" />
        </div>
        <div className="clh-cfg-form">
          <p className="clh-cfg-k">{t.cfgPlan}</p>
          <div className="clh-opts">
            <Option on={plan === 'yearly'} onClick={() => setPlan('yearly')} label={t.cfgYearly[0]} detail={t.cfgYearly[1]} promo={t.promo} />
            <Option on={plan === 'monthly'} onClick={() => setPlan('monthly')} label={t.cfgMonthly[0]} detail={t.cfgMonthly[1]} />
          </div>
          <p className="clh-cfg-k">{t.cfgPc}</p>
          <div className="clh-opts">
            <Option on={pc === 'mine'} onClick={() => setPc('mine')} label={t.cfgPcMine[0]} detail={t.cfgPcMine[1]} />
            <Option on={pc === 'ours'} onClick={() => setPc('ours')} label={t.cfgPcOurs[0]} detail={t.cfgPcOurs[1]} />
          </div>
          <p className="clh-cfg-k">{t.cfgPresses}</p>
          <div className="clh-stepper" role="group" aria-label={t.cfgPresses}>
            <button type="button" aria-label="-" onClick={() => setPresses((n) => Math.max(1, n - 1))} disabled={presses <= 1}>−</button>
            <output>{presses}</output>
            <button type="button" aria-label="+" onClick={() => setPresses((n) => Math.min(10, n + 1))} disabled={presses >= 10}>+</button>
          </div>
          <div className="clh-total">
            <p><span>{t.cfgToday}</span><strong>{money(today)}</strong><span>{then}</span></p>
            <p className="clh-fine">{t.cfgLicense}</p>
            <div className="clh-actions clh-actions-left">
              <a className="clh-btn clh-btn-ink" href={validationUrl}>{t.checkCta}</a>
              <a className="clh-btn clh-btn-outline" href={upgradeUrl}>{t.orderCta}</a>
            </div>
            <p className="clh-fine">{t.orderNote}</p>
            <a className="clh-textlink" href={MEET_URL} target="_blank" rel="noopener">{t.meetCta}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- PPWR and DPP, as plain text ---------- */
function Regulation() {
  const { locale, t } = useCopy();
  const c = (PPWR_COPY as Record<Locale, { title: string; tagline: string; ppwrTitle: string; ppwrBody: string; dppTitle: string; dppBody: string }>)[locale];
  return (
    <section className="clh-reg" id="ppwr" aria-labelledby="clh-reg-title">
      <div className="clh-wrap clh-reg-grid">
        <div>
          <h2 id="clh-reg-title" className="clh-h2">{c.title}</h2>
          <p className="clh-body">{c.tagline}</p>
          <a className="clh-btn clh-btn-outline" href={homeLink('ppwr-section.ppwrConnect')} target="_blank" rel="noreferrer">{t.regulationCta}</a>
        </div>
        <dl className="clh-reg-list">
          <div><dt>{c.ppwrTitle}</dt><dd>{c.ppwrBody}</dd></div>
          <div><dt>{c.dppTitle}</dt><dd>{c.dppBody}</dd></div>
        </dl>
      </div>
    </section>
  );
}

/* ---------- ROI: colorloop.ai's estimator (FX), verbatim ---------- */
function Roi({ locale, checkUrl }: { locale: Locale; checkUrl: string }) {
  const html = ROI_MARKUP[locale].replace('https://rutherford.fr/console-validation', checkUrl);
  useScripts(['/colorloop-story/press-schematic.js', '/colorloop-story/pricing-roi.js']);
  return (
    <>
      <link rel="stylesheet" href="/colorloop-story/pricing-roi.css" />
      <div className="clh-roi" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

/* ---------- The latest articles, as a list ---------- */
type Article = { slug: string; title: string; excerpt: string; image: string; category: string; publishedAt?: string; review?: boolean; i18n?: Record<string, { title?: string; excerpt?: string }> };
// Every validated article, newest first; undated ones keep their order at the end.
const LATEST = (ARTICLES as Article[]).filter((a) => !a.review).sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));

function Articles() {
  const { locale, t } = useCopy();
  const fmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <section className="clh-articles" id="articles" aria-labelledby="clh-articles-title">
      <div className="clh-wrap">
        <h2 id="clh-articles-title" className="clh-h2">{t.articlesTitle}</h2>
        <div className="clh-posts">
          {LATEST.slice(0, 6).map((a) => (
            <article key={a.slug} className="clh-post">
              <a href={localPath(locale, `/blog/${a.slug}`)}>
                <img src={a.image} alt="" loading="lazy" width={240} height={160} />
                <div>
                  <p className="clh-post-meta">
                    <span>{a.category}</span>
                    {a.publishedAt ? <time dateTime={a.publishedAt}>{fmt.format(new Date(a.publishedAt))}</time> : null}
                  </p>
                  <h3>{a.i18n?.[locale]?.title ?? a.title}</h3>
                  <p className="clh-post-excerpt">{a.i18n?.[locale]?.excerpt ?? a.excerpt}</p>
                </div>
              </a>
            </article>
          ))}
        </div>
        <a className="clh-btn clh-btn-outline clh-posts-all" href={localPath(locale, '/blog')}>{t.articlesAll}</a>
      </div>
    </section>
  );
}

// The Rutherford blocks that stay, in this order (4 Nov 2026, Hugues: unclog the page).
// Dropped: the old ColorLoop block, the ROI teaser, the audiences, the slim band, the outcomes, the team; who we are is redrawn. Hidden ids from /dev/edit still apply.
const ORDER = [
  'roi',
  'case-studies-showcase',
  'brand-explainer-section',
  'ppwr-section',
  'articles',
];

function WarnArt({ cta, href }: { cta: string; href: string }) {
  // A brushed-metal padlock in two layers. The shackle drops in while the padlock travels up to the
  // middle of the screen; it locks with a short snap and a light sweep, then the call to action appears.
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--open', '0');
      el.classList.add('is-locked');
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const lock = el.firstElementChild as HTMLElement;
      const r = lock.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = r.top + r.height / 2;
      // starts once the padlock is fully in view, locks when its centre reaches 42 % of the screen height
      const p = Math.min(1, Math.max(0, (vh * 0.82 - center) / (vh * 0.4)));
      const eased = 1 - Math.pow(1 - p, 3);
      el.style.setProperty('--open', String(1 - eased));
      el.classList.toggle('is-locked', p >= 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="clh-lockwrap" ref={ref}>
      <div className="clh-lock3d" aria-hidden="true">
        <img className="clh-lock3d-shackle" src="/images/security/padlock-shackle.webp" alt="" width={1000} height={1000} loading="lazy" />
        <img className="clh-lock3d-body" src="/images/security/padlock-body.webp" alt="" width={1000} height={1000} loading="lazy" />
        <span className="clh-lock3d-sheen" />
      </div>
      <a className="clh-btn clh-btn-dark clh-lock-cta" href={href}>{cta}</a>
    </div>
  );
}

export function ColorLoopHome({ tone = 'light' }: { tone?: 'night' | 'light' }) {
  const { locale, t, upgradeUrl } = useCopy();
  const discoverUrl = colorloopUrl(locale);
  const checkUrl = localPath(locale, '/console-validation');
  const layout = HOME_LAYOUT as { order: string[]; hidden: string[] };
  const order = ORDER.filter((id) => !layout.hidden.includes(id));
  useClipsAutoplay();
  useScripts(['/colorloop-story/dots-hero.js']);

  return (
    <main className={`page-shell clh ${tone === 'light' ? 'clh-light' : ''}`} id="top">
      <SiteNav current="home" />

      <link rel="stylesheet" href="/colorloop-story/dots-hero.css" />
      <section className="clh-hero hero dots-hero" data-dh aria-labelledby="clh-title">
        <div className="dh-night">
          <div className="clh-raw" dangerouslySetInnerHTML={{ __html: HERO_BOOT }} />
          <img className="dh-wm clh-wordmark" src={`${IMG}/${tone === 'light' ? 'logo.png' : 'logo-white.png'}`} alt="ColorLoop" width={1207} height={268} />
          <div className="clh-copy">
            <h1 id="clh-title" className="clh-title">
              {t.title[0]}
              <br />
              {t.title[1]}
              <span className="clh-dot" aria-hidden="true">.</span>
            </h1>
            <p className="clh-lead">{t.lead} <span className="clh-promo clh-promo-hero">{t.promo3}</span></p>
            <div className="clh-actions">
              <a className="clh-btn" href="#prepare">{t.primary}</a>
              <a className="clh-textlink" href={discoverUrl}>{t.secondary}</a>
            </div>
          </div>
          <div className="clh-raw" dangerouslySetInnerHTML={{ __html: HERO_DOTS }} />
        </div>

        <div className="clh-presses">
          <div className="clh-marquee" aria-hidden="true">
            <ul>
              {[...PRESSES, ...PRESSES].map(([file, name], i) => (
                <li key={`${file}-${i}`}><img src={`${IMG}/presses/${file}.webp`} alt={i < PRESSES.length ? name : ''} loading="lazy" /></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="clh-clips-band">
          <div className="clh-wrap clh-clips">
            <div className="clh-clips-copy">
              <h2 className="clh-h2">{t.clipsTitle}</h2>
              <p className="clh-body">{t.clipsLead}</p>
              <a className="clh-faces-link" href="#cases">
                <span className="clh-faces" aria-hidden="true">
                  {FACES.map((id) => <img key={id} src={`${IMG}/faces/face-${id}.webp`} alt="" width={96} height={96} loading="lazy" />)}
                </span>
                <span>{t.clipsLink}</span>
              </a>
            </div>
            <ul className="clh-clip-list">
              {CLIPS.map((c) => (
                <li key={c.yt}>
                  <a className="clh-clip" href={`https://www.youtube.com/shorts/${c.yt}`} target="_blank" rel="noopener" aria-label={`${t.playFilm}: ${c.title}, ${c.length}`}>
                    <video muted loop playsInline preload="none" poster={`${IMG}/clips/${c.file}-poster.webp`} data-src={`${IMG}/clips/${c.file}.mp4`} aria-hidden="true" tabIndex={-1} />
                    <span className="clh-clip-t"><i aria-hidden="true" /><b>{c.title}</b><span>{c.length}</span></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>


      <section className="clh-warn clh-warn-calm" aria-labelledby="clh-warn-title" role="region">
        <div className="clh-wrap">
          <div className="clh-warn-grid">
            <div className="clh-warn-copy">
              <h2 id="clh-warn-title">{t.warnTitle}</h2>
              <p className="clh-warn-body">{t.warnBody}</p>
              <p className="clh-warn-cra">
                <a href={CRA_URL} rel="noopener">{t.warnNote}</a>
              </p>
            </div>
            <WarnArt cta={t.warnCta} href="#prepare" />
          </div>
        </div>
      </section>

      <Configurator locale={locale} t={t} upgradeUrl={upgradeUrl} checkUrl={checkUrl} />

      {order.map((id) => {
        if (id === 'roi') return <Roi key={id} locale={locale} checkUrl={checkUrl} />;
        if (id === 'articles') return <Articles key={id} />;
        const Section = SECTIONS[id as keyof typeof SECTIONS];
        return Section ? <Section key={id} /> : null;
      })}

      <SiteFooter />
    </main>
  );
}
