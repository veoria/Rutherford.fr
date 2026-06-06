'use client';

import { useEffect, useRef, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { type Locale, useLanguage } from '@/components/language-provider';
import { Celebration, type CelebrationContent } from '@/components/academy-celebration';
import { coursePercent, isCourseComplete, overallStats } from '@/lib/gamification';

type EnrolledCourse = {
  slug: string;
  title: string;
  duration: string;
  modules: number;
  tone: 'free' | 'premium';
  source: 'free' | 'purchase' | 'pass' | 'grant';
  grantedAt: string;
  expiresAt: string | null;
  completedCount: number;
  completedAt: string | null;
  certificateLabel: string | null;
};

type PassSubscription = {
  status: 'active' | 'past_due' | 'canceled' | 'incomplete';
  currentPeriodEnd: string | null;
  cancelAt: string | null;
};

type Props = {
  user: { email: string; fullName: string | null; avatarUrl: string | null };
  enrolledCourses: EnrolledCourse[];
  passSubscription: PassSubscription | null;
  streak: number;
  catalog: { total: number; freeSlugs: string[] };
};

type BadgeId = 'first-module' | 'first-course' | 'streak' | 'foundations' | 'flagship' | 'completionist';

type AccountCopy = {
  accountKicker: string;
  signOut: string;
  // Pass
  passKicker: string;
  passActiveTitle: string;
  passInactiveTitle: string;
  active: string;
  cancelsOn: (date: string) => string;
  renewsOn: (date: string) => string;
  lifetime: string;
  manageSub: string;
  passPitch: string;
  seePass: string;
  // Courses
  coursesKicker: string;
  continueLearning: string;
  noCourses: string;
  emptyBody: string;
  freeCourses: string;
  premiumMasterclasses: string;
  modules: string;
  continueCta: string;
  reviewCta: string;
  notStarted: string;
  inProgress: string;
  completed: string;
  sourceLabel: Record<EnrolledCourse['source'], string>;
  // Progress overview
  progressKicker: string;
  progressTitle: string;
  levelWord: string;
  xpUnit: string;
  rankNames: string[];
  xpToNext: (n: number, rank: string) => string;
  maxLevelReached: string;
  statModules: string;
  statCourses: string;
  statCertificates: string;
  statStreak: string;
  // Rewards
  rewardsKicker: string;
  rewardsTitle: string;
  rewardsLocked: string;
  earnedLabel: string;
  badges: Record<BadgeId, { name: string; desc: string }>;
  // Certificates
  certificatesKicker: string;
  certificatesTitle: string;
  noCertificates: string;
  viewCertificate: string;
  certHeading: string;
  certAwardedTo: string;
  certCompleted: string;
  certIssued: (date: string) => string;
  certPrint: string;
  certClose: string;
  // Account-page celebrations (milestones reached since the last visit)
  celebrateLevelUp: (rank: string) => string;
  celebrateBadgeSub: string;
};

const COPY: Record<Locale, AccountCopy> = {
  en: {
    accountKicker: 'Your account',
    signOut: 'Sign out',
    passKicker: 'Academy Pass',
    passActiveTitle: 'Pass active',
    passInactiveTitle: 'Get unlimited access to every masterclass',
    active: 'Active',
    cancelsOn: (d) => `Cancels on ${d}`,
    renewsOn: (d) => `Renews on ${d}`,
    lifetime: 'Lifetime access — no renewal required.',
    manageSub: 'Manage subscription',
    passPitch: 'Six premium masterclasses, six certificates, lifetime access, private Q&A community.',
    seePass: 'See the Pass',
    coursesKicker: 'Your courses',
    continueLearning: 'Continue learning',
    noCourses: 'No courses yet',
    emptyBody:
      'You don’t have any enrolled courses yet. Start with a free intro course or browse the premium masterclasses.',
    freeCourses: 'Free courses',
    premiumMasterclasses: 'Premium masterclasses',
    modules: 'modules',
    continueCta: 'Continue',
    reviewCta: 'Review',
    notStarted: 'Not started',
    inProgress: 'In progress',
    completed: 'Completed',
    sourceLabel: { free: 'Free', purchase: 'Purchased', pass: 'Academy Pass', grant: 'Granted' },
    progressKicker: 'Progress',
    progressTitle: 'Your learning journey',
    levelWord: 'Level',
    xpUnit: 'XP',
    rankNames: ['Apprentice', 'Operator', 'Colorist', 'Color Expert', 'Closed-Loop Master'],
    xpToNext: (n, rank) => `${n} XP to ${rank}`,
    maxLevelReached: 'Top rank reached',
    statModules: 'Modules completed',
    statCourses: 'Courses completed',
    statCertificates: 'Certificates',
    statStreak: 'Day streak',
    rewardsKicker: 'Rewards',
    rewardsTitle: 'Badges you’ve earned',
    rewardsLocked: 'Locked',
    earnedLabel: 'Earned',
    badges: {
      'first-module': { name: 'First step', desc: 'Complete your first module.' },
      'first-course': { name: 'First course', desc: 'Complete an entire course.' },
      streak: { name: 'Consistency', desc: 'Learn 3 days in a row.' },
      foundations: { name: 'Foundations', desc: 'Complete the three free courses.' },
      flagship: { name: 'Closed-loop', desc: 'Complete the closed-loop masterclass.' },
      completionist: { name: 'The full library', desc: 'Complete every course.' },
    },
    certificatesKicker: 'Certificates',
    certificatesTitle: 'Your certificates',
    noCertificates: 'Finish a course to earn your first certificate.',
    viewCertificate: 'View certificate',
    certHeading: 'Certificate of completion',
    certAwardedTo: 'This certifies that',
    certCompleted: 'has completed',
    certIssued: (d) => `Issued on ${d}`,
    certPrint: 'Print',
    certClose: 'Close',
    celebrateLevelUp: (rank) => `New rank: ${rank}`,
    celebrateBadgeSub: 'New badge earned',
  },
  fr: {
    accountKicker: 'Votre compte',
    signOut: 'Se déconnecter',
    passKicker: 'Academy Pass',
    passActiveTitle: 'Pass actif',
    passInactiveTitle: 'Accédez à toutes les masterclasses sans limite',
    active: 'Actif',
    cancelsOn: (d) => `Résiliation le ${d}`,
    renewsOn: (d) => `Renouvellement le ${d}`,
    lifetime: 'Accès à vie — aucun renouvellement nécessaire.',
    manageSub: 'Gérer l’abonnement',
    passPitch:
      'Six masterclasses premium, six certificats, accès à vie, communauté privée de questions-réponses.',
    seePass: 'Voir le Pass',
    coursesKicker: 'Vos cours',
    continueLearning: 'Continuez votre apprentissage',
    noCourses: 'Aucun cours pour l’instant',
    emptyBody:
      'Vous n’avez encore aucun cours. Commencez par un cours d’introduction gratuit ou parcourez les masterclasses premium.',
    freeCourses: 'Cours gratuits',
    premiumMasterclasses: 'Masterclasses premium',
    modules: 'modules',
    continueCta: 'Continuer',
    reviewCta: 'Revoir',
    notStarted: 'À commencer',
    inProgress: 'En cours',
    completed: 'Terminé',
    sourceLabel: { free: 'Gratuit', purchase: 'Acheté', pass: 'Academy Pass', grant: 'Accordé' },
    progressKicker: 'Progression',
    progressTitle: 'Votre parcours d’apprentissage',
    levelWord: 'Niveau',
    xpUnit: 'XP',
    rankNames: ['Apprenti', 'Opérateur', 'Coloriste', 'Expert couleur', 'Maître closed-loop'],
    xpToNext: (n, rank) => `${n} XP avant ${rank}`,
    maxLevelReached: 'Rang maximum atteint',
    statModules: 'Modules terminés',
    statCourses: 'Cours terminés',
    statCertificates: 'Certificats',
    statStreak: 'Série de jours',
    rewardsKicker: 'Récompenses',
    rewardsTitle: 'Vos badges',
    rewardsLocked: 'À débloquer',
    earnedLabel: 'Obtenu',
    badges: {
      'first-module': { name: 'Premier pas', desc: 'Terminez votre premier module.' },
      'first-course': { name: 'Premier cours', desc: 'Terminez un cours entier.' },
      streak: { name: 'Régularité', desc: 'Apprenez 3 jours d’affilée.' },
      foundations: { name: 'Fondations', desc: 'Terminez les trois cours gratuits.' },
      flagship: { name: 'Closed-loop', desc: 'Terminez la masterclass closed-loop.' },
      completionist: { name: 'Bibliothèque complète', desc: 'Terminez tous les cours.' },
    },
    certificatesKicker: 'Certificats',
    certificatesTitle: 'Vos certificats',
    noCertificates: 'Terminez un cours pour obtenir votre premier certificat.',
    viewCertificate: 'Voir le certificat',
    certHeading: 'Certificat de réussite',
    certAwardedTo: 'Ce certificat atteste que',
    certCompleted: 'a suivi avec succès',
    certIssued: (d) => `Délivré le ${d}`,
    certPrint: 'Imprimer',
    certClose: 'Fermer',
    celebrateLevelUp: (rank) => `Nouveau rang : ${rank}`,
    celebrateBadgeSub: 'Nouveau badge obtenu',
  },
  de: {
    accountKicker: 'Ihr Konto',
    signOut: 'Abmelden',
    passKicker: 'Academy Pass',
    passActiveTitle: 'Pass aktiv',
    passInactiveTitle: 'Unbegrenzter Zugang zu allen Masterclasses',
    active: 'Aktiv',
    cancelsOn: (d) => `Endet am ${d}`,
    renewsOn: (d) => `Verlängerung am ${d}`,
    lifetime: 'Lebenslanger Zugang — keine Verlängerung erforderlich.',
    manageSub: 'Abonnement verwalten',
    passPitch: 'Sechs Premium-Masterclasses, sechs Zertifikate, lebenslanger Zugang, private Q&A-Community.',
    seePass: 'Pass ansehen',
    coursesKicker: 'Ihre Kurse',
    continueLearning: 'Setzen Sie das Lernen fort',
    noCourses: 'Noch keine Kurse',
    emptyBody:
      'Sie haben noch keine Kurse gebucht. Beginnen Sie mit einem kostenlosen Einführungskurs oder entdecken Sie die Premium-Masterclasses.',
    freeCourses: 'Kostenlose Kurse',
    premiumMasterclasses: 'Premium-Masterclasses',
    modules: 'Module',
    continueCta: 'Weiter',
    reviewCta: 'Ansehen',
    notStarted: 'Nicht begonnen',
    inProgress: 'Läuft',
    completed: 'Abgeschlossen',
    sourceLabel: { free: 'Kostenlos', purchase: 'Gekauft', pass: 'Academy Pass', grant: 'Gewährt' },
    progressKicker: 'Fortschritt',
    progressTitle: 'Ihr Lernweg',
    levelWord: 'Stufe',
    xpUnit: 'XP',
    rankNames: ['Einsteiger', 'Bediener', 'Kolorist', 'Farbexperte', 'Closed-Loop-Meister'],
    xpToNext: (n, rank) => `${n} XP bis ${rank}`,
    maxLevelReached: 'Höchster Rang erreicht',
    statModules: 'Abgeschlossene Module',
    statCourses: 'Abgeschlossene Kurse',
    statCertificates: 'Zertifikate',
    statStreak: 'Tage-Serie',
    rewardsKicker: 'Auszeichnungen',
    rewardsTitle: 'Ihre Abzeichen',
    rewardsLocked: 'Gesperrt',
    earnedLabel: 'Erhalten',
    badges: {
      'first-module': { name: 'Erster Schritt', desc: 'Schließen Sie Ihr erstes Modul ab.' },
      'first-course': { name: 'Erster Kurs', desc: 'Schließen Sie einen ganzen Kurs ab.' },
      streak: { name: 'Beständigkeit', desc: 'Lernen Sie 3 Tage in Folge.' },
      foundations: { name: 'Grundlagen', desc: 'Schließen Sie die drei kostenlosen Kurse ab.' },
      flagship: { name: 'Closed-Loop', desc: 'Schließen Sie die Closed-Loop-Masterclass ab.' },
      completionist: { name: 'Komplette Bibliothek', desc: 'Schließen Sie alle Kurse ab.' },
    },
    certificatesKicker: 'Zertifikate',
    certificatesTitle: 'Ihre Zertifikate',
    noCertificates: 'Schließen Sie einen Kurs ab, um Ihr erstes Zertifikat zu erhalten.',
    viewCertificate: 'Zertifikat ansehen',
    certHeading: 'Abschlusszertifikat',
    certAwardedTo: 'Hiermit wird bestätigt, dass',
    certCompleted: 'erfolgreich abgeschlossen hat',
    certIssued: (d) => `Ausgestellt am ${d}`,
    certPrint: 'Drucken',
    certClose: 'Schließen',
    celebrateLevelUp: (rank) => `Neuer Rang: ${rank}`,
    celebrateBadgeSub: 'Neues Abzeichen erhalten',
  },
  it: {
    accountKicker: 'Il suo account',
    signOut: 'Esci',
    passKicker: 'Academy Pass',
    passActiveTitle: 'Pass attivo',
    passInactiveTitle: 'Accesso illimitato a tutte le masterclass',
    active: 'Attivo',
    cancelsOn: (d) => `Termina il ${d}`,
    renewsOn: (d) => `Si rinnova il ${d}`,
    lifetime: 'Accesso a vita — nessun rinnovo necessario.',
    manageSub: 'Gestisci l’abbonamento',
    passPitch:
      'Sei masterclass premium, sei certificati, accesso a vita, community privata di domande e risposte.',
    seePass: 'Scopri il Pass',
    coursesKicker: 'I suoi corsi',
    continueLearning: 'Continui a imparare',
    noCourses: 'Ancora nessun corso',
    emptyBody:
      'Non ha ancora alcun corso. Inizi con un corso introduttivo gratuito o esplori le masterclass premium.',
    freeCourses: 'Corsi gratuiti',
    premiumMasterclasses: 'Masterclass premium',
    modules: 'moduli',
    continueCta: 'Continua',
    reviewCta: 'Rivedi',
    notStarted: 'Da iniziare',
    inProgress: 'In corso',
    completed: 'Completato',
    sourceLabel: { free: 'Gratuito', purchase: 'Acquistato', pass: 'Academy Pass', grant: 'Concesso' },
    progressKicker: 'Progressi',
    progressTitle: 'Il suo percorso di apprendimento',
    levelWord: 'Livello',
    xpUnit: 'XP',
    rankNames: ['Apprendista', 'Operatore', 'Colorista', 'Esperto colore', 'Maestro closed-loop'],
    xpToNext: (n, rank) => `${n} XP per ${rank}`,
    maxLevelReached: 'Rango massimo raggiunto',
    statModules: 'Moduli completati',
    statCourses: 'Corsi completati',
    statCertificates: 'Certificati',
    statStreak: 'Serie di giorni',
    rewardsKicker: 'Riconoscimenti',
    rewardsTitle: 'I suoi badge',
    rewardsLocked: 'Da sbloccare',
    earnedLabel: 'Ottenuto',
    badges: {
      'first-module': { name: 'Primo passo', desc: 'Completi il suo primo modulo.' },
      'first-course': { name: 'Primo corso', desc: 'Completi un corso intero.' },
      streak: { name: 'Costanza', desc: 'Studi per 3 giorni di fila.' },
      foundations: { name: 'Fondamenta', desc: 'Completi i tre corsi gratuiti.' },
      flagship: { name: 'Closed-loop', desc: 'Completi la masterclass closed-loop.' },
      completionist: { name: 'Libreria completa', desc: 'Completi tutti i corsi.' },
    },
    certificatesKicker: 'Certificati',
    certificatesTitle: 'I suoi certificati',
    noCertificates: 'Completi un corso per ottenere il suo primo certificato.',
    viewCertificate: 'Vedi certificato',
    certHeading: 'Certificato di completamento',
    certAwardedTo: 'Si certifica che',
    certCompleted: 'ha completato',
    certIssued: (d) => `Rilasciato il ${d}`,
    certPrint: 'Stampa',
    certClose: 'Chiudi',
    celebrateLevelUp: (rank) => `Nuovo rango: ${rank}`,
    celebrateBadgeSub: 'Nuovo badge ottenuto',
  },
  es: {
    accountKicker: 'Su cuenta',
    signOut: 'Cerrar sesión',
    passKicker: 'Academy Pass',
    passActiveTitle: 'Pass activo',
    passInactiveTitle: 'Acceso ilimitado a todas las masterclasses',
    active: 'Activo',
    cancelsOn: (d) => `Se cancela el ${d}`,
    renewsOn: (d) => `Se renueva el ${d}`,
    lifetime: 'Acceso de por vida — sin renovación.',
    manageSub: 'Gestionar suscripción',
    passPitch:
      'Seis masterclasses premium, seis certificados, acceso de por vida, comunidad privada de preguntas y respuestas.',
    seePass: 'Ver el Pass',
    coursesKicker: 'Sus cursos',
    continueLearning: 'Continúe aprendiendo',
    noCourses: 'Aún no hay cursos',
    emptyBody:
      'Todavía no tiene ningún curso. Empiece con un curso de introducción gratuito o explore las masterclasses premium.',
    freeCourses: 'Cursos gratuitos',
    premiumMasterclasses: 'Masterclasses premium',
    modules: 'módulos',
    continueCta: 'Continuar',
    reviewCta: 'Repasar',
    notStarted: 'Sin empezar',
    inProgress: 'En curso',
    completed: 'Completado',
    sourceLabel: { free: 'Gratis', purchase: 'Comprado', pass: 'Academy Pass', grant: 'Concedido' },
    progressKicker: 'Progreso',
    progressTitle: 'Su recorrido de aprendizaje',
    levelWord: 'Nivel',
    xpUnit: 'XP',
    rankNames: ['Aprendiz', 'Operador', 'Colorista', 'Experto en color', 'Maestro closed-loop'],
    xpToNext: (n, rank) => `${n} XP para ${rank}`,
    maxLevelReached: 'Rango máximo alcanzado',
    statModules: 'Módulos completados',
    statCourses: 'Cursos completados',
    statCertificates: 'Certificados',
    statStreak: 'Racha de días',
    rewardsKicker: 'Recompensas',
    rewardsTitle: 'Sus insignias',
    rewardsLocked: 'Por desbloquear',
    earnedLabel: 'Conseguido',
    badges: {
      'first-module': { name: 'Primer paso', desc: 'Complete su primer módulo.' },
      'first-course': { name: 'Primer curso', desc: 'Complete un curso entero.' },
      streak: { name: 'Constancia', desc: 'Aprenda 3 días seguidos.' },
      foundations: { name: 'Fundamentos', desc: 'Complete los tres cursos gratuitos.' },
      flagship: { name: 'Closed-loop', desc: 'Complete la masterclass closed-loop.' },
      completionist: { name: 'Biblioteca completa', desc: 'Complete todos los cursos.' },
    },
    certificatesKicker: 'Certificados',
    certificatesTitle: 'Sus certificados',
    noCertificates: 'Complete un curso para conseguir su primer certificado.',
    viewCertificate: 'Ver certificado',
    certHeading: 'Certificado de finalización',
    certAwardedTo: 'Por la presente se certifica que',
    certCompleted: 'ha completado',
    certIssued: (d) => `Emitido el ${d}`,
    certPrint: 'Imprimir',
    certClose: 'Cerrar',
    celebrateLevelUp: (rank) => `Nuevo rango: ${rank}`,
    celebrateBadgeSub: 'Nueva insignia conseguida',
  },
};

/* --- Scoped, filled icons (the global svg{} rule is overridden by .gicon) --- */
function IconSpark() {
  return (
    <svg className="gicon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l1.8 5.4a4 4 0 0 0 2.8 2.8L22 12l-5.4 1.8a4 4 0 0 0-2.8 2.8L12 22l-1.8-5.4a4 4 0 0 0-2.8-2.8L2 12l5.4-1.8a4 4 0 0 0 2.8-2.8L12 2z" />
    </svg>
  );
}
function IconTrophy() {
  return (
    <svg className="gicon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 4h12v2h3v3a4 4 0 0 1-4 4h-.4A6 6 0 0 1 13 16.9V19h3v2H8v-2h3v-2.1A6 6 0 0 1 7.4 13H7a4 4 0 0 1-4-4V6h3V4Zm0 4H5v1a2 2 0 0 0 1 1.7V8Zm12 0v2.7A2 2 0 0 0 19 9V8h-1Z" />
    </svg>
  );
}
function IconFlame() {
  return (
    <svg className="gicon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2c2 3 6 5 6 9a6 6 0 1 1-12 0c0-1.6.7-2.8 1.6-3.8.3 1 1 1.8 2 1.8 1.2 0 1.6-1.2 1-2.6-.7-1.7-.3-3.4 1.4-4.4Z" />
    </svg>
  );
}
function IconLayers() {
  return (
    <svg className="gicon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 2 7l10 5 10-5-10-5Zm-8 9 8 4 8-4 2 1-10 5L2 12l2-1Zm0 5 8 4 8-4 2 1-10 5L2 17l2-1Z" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg className="gicon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.9 6.1 21.8l1.2-6.6L2.5 9l6.6-.9L12 2Z" />
    </svg>
  );
}
function IconMedal() {
  return (
    <svg className="gicon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 2h8l-2.2 5.2a6 6 0 1 1-3.6 0L8 2Zm4 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 2.2 1 2 2.2.2-1.7 1.5.5 2.1L12 17l-2 1 .5-2.1-1.7-1.5 2.2-.2 1-2Z" />
    </svg>
  );
}
function IconSeal() {
  return (
    <svg className="gicon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a6 6 0 0 1 4.2 10.3l1 5.7-3.2-1.6L12 18l-2 -1.6L6.8 18l1-5.7A6 6 0 0 1 12 2Zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
    </svg>
  );
}

const BADGE_ICONS: Record<BadgeId, () => JSX.Element> = {
  'first-module': IconSpark,
  'first-course': IconTrophy,
  streak: IconFlame,
  foundations: IconLayers,
  flagship: IconStar,
  completionist: IconMedal,
};

function formatDate(value: string | null, locale: Locale) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return null;
  }
}

export function AccountPage({ user, enrolledCourses, passSubscription, streak, catalog }: Props) {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const hasActivePass = passSubscription?.status === 'active';
  const [certCourse, setCertCourse] = useState<EnrolledCourse | null>(null);
  const [celebration, setCelebration] = useState<CelebrationContent | null>(null);
  const celebrationSeq = useRef(0);

  const stats = overallStats(
    enrolledCourses.map((c) => ({ completedCount: c.completedCount, total: c.modules }))
  );
  const completedSlugs = new Set(
    enrolledCourses
      .filter((c) => isCourseComplete({ completedCount: c.completedCount, total: c.modules }))
      .map((c) => c.slug)
  );
  const certificates = enrolledCourses.filter((c) => c.completedAt);
  const rankName = t.rankNames[stats.level.level - 1] ?? t.rankNames[t.rankNames.length - 1];
  const nextRankName = stats.level.isMax ? '' : t.rankNames[stats.level.level] ?? '';
  const ringPct = stats.level.percentIntoLevel;

  const badges: { id: BadgeId; earned: boolean }[] = [
    { id: 'first-module', earned: stats.completedModules >= 1 },
    { id: 'first-course', earned: stats.coursesCompleted >= 1 },
    { id: 'streak', earned: streak >= 3 },
    {
      id: 'foundations',
      earned: catalog.freeSlugs.length > 0 && catalog.freeSlugs.every((s) => completedSlugs.has(s)),
    },
    { id: 'flagship', earned: completedSlugs.has('closed-loop-flagship') },
    { id: 'completionist', earned: catalog.total > 0 && completedSlugs.size >= catalog.total },
  ];

  // Celebrate milestones reached since the last visit: opening the account is
  // itself a moment of reward (level up, or a freshly earned badge). We compare
  // against a small localStorage snapshot and seed silently on the first visit.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const KEY = 'rutherford-academy-progress';
    const earnedBadgeIds = badges.filter((b) => b.earned).map((b) => b.id);
    const snapshot = { level: stats.level.level, badges: earnedBadgeIds };

    let prev: { level: number; badges: string[] } | null = null;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) prev = JSON.parse(raw);
    } catch {
      prev = null;
    }

    if (prev) {
      if (snapshot.level > prev.level) {
        celebrationSeq.current += 1;
        setCelebration({
          id: celebrationSeq.current,
          variant: 'level',
          title: t.celebrateLevelUp(rankName),
          subtitle: `${t.levelWord} ${snapshot.level}`,
        });
      } else {
        const fresh = earnedBadgeIds.find((id) => !prev!.badges.includes(id)) as BadgeId | undefined;
        if (fresh) {
          celebrationSeq.current += 1;
          setCelebration({
            id: celebrationSeq.current,
            variant: 'course',
            title: t.badges[fresh].name,
            subtitle: t.celebrateBadgeSub,
          });
        }
      }
    }

    try {
      window.localStorage.setItem(KEY, JSON.stringify(snapshot));
    } catch {
      /* storage unavailable — skip persistence */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenPortal = async () => {
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    if (!res.ok) return;
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  const hasCourses = enrolledCourses.length > 0;

  return (
    <main className="page-shell" id="top">
      <SiteNav />

      <section className="account-hero section">
        <div className="container account-hero-shell">
          <div className="account-hero-identity">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="account-hero-avatar" src={user.avatarUrl} alt="" />
            ) : (
              <div className="account-hero-avatar account-hero-avatar-placeholder" aria-hidden="true">
                {(user.fullName || user.email).slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="section-kicker">{t.accountKicker}</p>
              <h1 className="account-hero-title">{user.fullName ?? user.email}</h1>
              <p className="account-hero-sub">{user.email}</p>
            </div>
          </div>
          <form action="/api/auth/sign-out" method="post">
            <button type="submit" className="button button-light account-signout">
              {t.signOut}
            </button>
          </form>
        </div>
      </section>

      {hasCourses ? (
        <section className="account-progress section">
          <div className="container">
            <header className="account-section-head">
              <p className="section-kicker">{t.progressKicker}</p>
              <h2>{t.progressTitle}</h2>
            </header>

            <div className="account-level-card">
              <div
                className="account-level-ring"
                style={{ background: `conic-gradient(var(--accent) ${ringPct}%, #e7e7e0 ${ringPct}%)` }}
                aria-hidden="true"
              >
                <div className="account-level-ring-inner">
                  <span className="account-level-num">{stats.level.level}</span>
                  <span className="account-level-word">{t.levelWord}</span>
                </div>
              </div>
              <div className="account-level-info">
                <p className="account-level-rank">{rankName}</p>
                <div className="account-xp-row">
                  <span className="account-xp-value">
                    {stats.xp} {t.xpUnit}
                  </span>
                  <span className="account-xp-next">
                    {stats.level.isMax ? t.maxLevelReached : t.xpToNext(stats.level.xpToNext, nextRankName)}
                  </span>
                </div>
                <div
                  className="account-xp-track"
                  role="progressbar"
                  aria-valuenow={ringPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span className="account-xp-fill" style={{ width: `${ringPct}%` }} />
                </div>
              </div>
            </div>

            <ul className="account-stat-grid">
              <li className="account-stat">
                <span className="account-stat-icon" aria-hidden="true">
                  <IconLayers />
                </span>
                <span className="account-stat-value">
                  {stats.completedModules} / {stats.totalModules}
                </span>
                <span className="account-stat-label">{t.statModules}</span>
              </li>
              <li className="account-stat">
                <span className="account-stat-icon" aria-hidden="true">
                  <IconTrophy />
                </span>
                <span className="account-stat-value">
                  {stats.coursesCompleted} / {enrolledCourses.length}
                </span>
                <span className="account-stat-label">{t.statCourses}</span>
              </li>
              <li className="account-stat">
                <span className="account-stat-icon" aria-hidden="true">
                  <IconSeal />
                </span>
                <span className="account-stat-value">{certificates.length}</span>
                <span className="account-stat-label">{t.statCertificates}</span>
              </li>
              <li className={`account-stat account-stat-streak ${streak > 0 ? 'is-active' : ''}`}>
                <span className="account-stat-icon" aria-hidden="true">
                  <IconFlame />
                </span>
                <span className="account-stat-value">{streak}</span>
                <span className="account-stat-label">{t.statStreak}</span>
              </li>
            </ul>
          </div>
        </section>
      ) : null}

      <section className="account-pass section">
        <div className="container">
          <header className="account-section-head">
            <p className="section-kicker">{t.passKicker}</p>
            <h2>{hasActivePass ? t.passActiveTitle : t.passInactiveTitle}</h2>
          </header>
          {hasActivePass ? (
            <div className="account-pass-card">
              <div>
                <p className="account-pass-status">{t.active}</p>
                {passSubscription?.currentPeriodEnd ? (
                  <p className="account-pass-detail">
                    {passSubscription?.cancelAt
                      ? t.cancelsOn(formatDate(passSubscription.cancelAt, locale) ?? '')
                      : t.renewsOn(formatDate(passSubscription.currentPeriodEnd, locale) ?? '')}
                  </p>
                ) : (
                  <p className="account-pass-detail">{t.lifetime}</p>
                )}
              </div>
              <button type="button" className="button button-light" onClick={handleOpenPortal}>
                {t.manageSub}
              </button>
            </div>
          ) : (
            <div className="account-pass-card">
              <div>
                <p className="account-pass-detail">{t.passPitch}</p>
              </div>
              <a className="button button-accent" href="/academy#bundle">
                {t.seePass} →
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="account-courses section">
        <div className="container">
          <header className="account-section-head">
            <p className="section-kicker">{t.coursesKicker}</p>
            <h2>{hasCourses ? t.continueLearning : t.noCourses}</h2>
          </header>
          {!hasCourses ? (
            <div className="account-empty">
              <p>{t.emptyBody}</p>
              <div className="account-empty-actions">
                <a className="button button-dark" href="/academy#free">
                  {t.freeCourses}
                </a>
                <a className="button button-accent" href="/academy#premium">
                  {t.premiumMasterclasses}
                </a>
              </div>
            </div>
          ) : (
            <ul className="account-course-list">
              {enrolledCourses.map((course) => {
                const pct = coursePercent({ completedCount: course.completedCount, total: course.modules });
                const complete = isCourseComplete({
                  completedCount: course.completedCount,
                  total: course.modules,
                });
                const statusLabel = complete
                  ? t.completed
                  : course.completedCount > 0
                    ? t.inProgress
                    : t.notStarted;
                const statusKind = complete ? 'done' : course.completedCount > 0 ? 'progress' : 'new';
                return (
                  <li key={course.slug} className={`account-course-card ${complete ? 'is-complete' : ''}`}>
                    <div className="account-course-meta">
                      <span className="account-course-source">{t.sourceLabel[course.source]}</span>
                      <span className={`account-course-status account-course-status-${statusKind}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <h3 className="account-course-title">
                      <a href={`/academy/${course.slug}`}>{course.title}</a>
                    </h3>
                    <div className="account-course-progress">
                      <div
                        className="account-course-track"
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <span className="account-course-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="account-course-progress-text">
                        {course.completedCount} / {course.modules} {t.modules} · {pct}%
                      </span>
                    </div>
                    {complete && course.completedAt ? (
                      <button
                        type="button"
                        className="account-course-cert"
                        onClick={() => setCertCourse(course)}
                      >
                        <span className="account-course-cert-icon" aria-hidden="true">
                          <IconSeal />
                        </span>
                        {t.viewCertificate}
                      </button>
                    ) : null}
                    <a className="account-course-cta" href={`/academy/${course.slug}`}>
                      {complete ? t.reviewCta : t.continueCta} <span aria-hidden="true">→</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {hasCourses ? (
        <section className="account-rewards section">
          <div className="container">
            <header className="account-section-head">
              <p className="section-kicker">{t.rewardsKicker}</p>
              <h2>{t.rewardsTitle}</h2>
            </header>
            <ul className="account-badge-grid">
              {badges.map((b) => {
                const meta = t.badges[b.id];
                const Icon = BADGE_ICONS[b.id];
                return (
                  <li key={b.id} className={`account-badge ${b.earned ? 'is-earned' : 'is-locked'}`}>
                    <span className="account-badge-icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <span className="account-badge-name">{meta.name}</span>
                    <span className="account-badge-desc">{meta.desc}</span>
                    <span className="account-badge-state">{b.earned ? t.earnedLabel : t.rewardsLocked}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}

      {hasCourses ? (
        <section className="account-certificates section">
          <div className="container">
            <header className="account-section-head">
              <p className="section-kicker">{t.certificatesKicker}</p>
              <h2>{t.certificatesTitle}</h2>
            </header>
            {certificates.length === 0 ? (
              <p className="account-cert-empty">{t.noCertificates}</p>
            ) : (
              <ul className="account-cert-grid">
                {certificates.map((c) => (
                  <li key={c.slug} className="account-cert-card">
                    <span className="account-cert-seal" aria-hidden="true">
                      <IconSeal />
                    </span>
                    <div className="account-cert-body">
                      <p className="account-cert-course">{c.title}</p>
                      {c.certificateLabel ? (
                        <p className="account-cert-distinction">{c.certificateLabel}</p>
                      ) : null}
                      <p className="account-cert-date">{t.certIssued(formatDate(c.completedAt, locale) ?? '')}</p>
                    </div>
                    <button
                      type="button"
                      className="button button-light account-cert-view"
                      onClick={() => setCertCourse(c)}
                    >
                      {t.viewCertificate}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : null}

      <Celebration content={celebration} onDismiss={() => setCelebration(null)} />

      {certCourse ? (
        <div className="cert-modal" role="dialog" aria-modal="true" onClick={() => setCertCourse(null)}>
          <div className="cert-modal-inner" onClick={(e) => e.stopPropagation()}>
            <div className="certificate-sheet">
              <p className="certificate-brand">Rutherford Academy</p>
              <p className="certificate-heading">{t.certHeading}</p>
              <p className="certificate-line">{t.certAwardedTo}</p>
              <p className="certificate-name">{user.fullName || user.email}</p>
              <p className="certificate-line">{t.certCompleted}</p>
              <p className="certificate-course">{certCourse.title}</p>
              {certCourse.certificateLabel ? (
                <p className="certificate-distinction">{certCourse.certificateLabel}</p>
              ) : null}
              <div className="certificate-seal" aria-hidden="true">
                <IconSeal />
              </div>
              <p className="certificate-date">{t.certIssued(formatDate(certCourse.completedAt, locale) ?? '')}</p>
            </div>
            <div className="cert-modal-actions">
              <button type="button" className="button button-accent" onClick={() => window.print()}>
                {t.certPrint}
              </button>
              <button type="button" className="button button-light" onClick={() => setCertCourse(null)}>
                {t.certClose}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <SiteFooter />
    </main>
  );
}
