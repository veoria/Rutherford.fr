'use client';

import { useEffect, useRef, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { AccountSubnav } from '@/components/account-subnav';
import { type Locale, useLanguage } from '@/components/language-provider';
import { Celebration, type CelebrationContent } from '@/components/academy-celebration';
import { coursePercent, isCourseComplete, overallStats } from '@/lib/gamification';

const CONSOLE_TRACKING_ENABLED = process.env.NEXT_PUBLIC_CONSOLE_TRACKING_ENABLED === 'true';

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
  hasQuiz: boolean;
  quizPassed: boolean;
  quizScore: number | null;
  quizTotal: number | null;
  certified: boolean;
  certifiedAt: string | null;
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
  streakBest: number;
  daily: { goalXp: number; todayXp: number };
  weekly: { iso: string; xp: number }[];
  activeDays: string[];
  resume: { slug: string; title: string; moduleIndex: number; moduleTitle: string } | null;
  catalog: { total: number; freeSlugs: string[] };
};

type BadgeId =
  | 'first-module'
  | 'first-course'
  | 'certified'
  | 'streak'
  | 'foundations'
  | 'flagship'
  | 'completionist';

type AccountCopy = {
  accountKicker: string;
  signOut: string;
  consoleValidations: string;
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
  resumeKicker: string;
  moduleWord: string;
  dailyGoalLabel: string;
  goalReached: string;
  calendarLabel: string;
  weeklyLabel: string;
  bestLabel: string;
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
  takeAssessment: string;
  assessmentToPass: string;
  certScoreLine: (pct: number) => string;
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
    consoleValidations: 'Console validations',
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
    resumeKicker: 'Continue where you left off',
    moduleWord: 'Module',
    dailyGoalLabel: 'Daily goal',
    goalReached: 'Goal reached!',
    calendarLabel: 'Last 14 days',
    weeklyLabel: 'This week',
    bestLabel: 'Best',
    rewardsKicker: 'Rewards',
    rewardsTitle: 'Badges you’ve earned',
    rewardsLocked: 'Locked',
    earnedLabel: 'Earned',
    badges: {
      'first-module': { name: 'First step', desc: 'Complete your first module.' },
      'first-course': { name: 'First course', desc: 'Complete an entire course.' },
      certified: { name: 'Certified', desc: 'Pass a final assessment.' },
      streak: { name: 'Consistency', desc: 'Learn 3 days in a row.' },
      foundations: { name: 'Foundations', desc: 'Complete the three free courses.' },
      flagship: { name: 'Closed-loop', desc: 'Complete the closed-loop masterclass.' },
      completionist: { name: 'The full library', desc: 'Complete every course.' },
    },
    certificatesKicker: 'Certificates',
    certificatesTitle: 'Your certificates',
    noCertificates: 'Finish a course to earn your first certificate.',
    viewCertificate: 'View certificate',
    takeAssessment: 'Take the assessment',
    assessmentToPass: 'Final assessment to pass',
    certScoreLine: (pct) => `Passed with ${pct}%`,
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
    consoleValidations: 'Validations console',
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
    resumeKicker: 'Reprenez où vous en étiez',
    moduleWord: 'Module',
    dailyGoalLabel: 'Objectif du jour',
    goalReached: 'Objectif atteint !',
    calendarLabel: '14 derniers jours',
    weeklyLabel: 'Cette semaine',
    bestLabel: 'Record',
    rewardsKicker: 'Récompenses',
    rewardsTitle: 'Vos badges',
    rewardsLocked: 'À débloquer',
    earnedLabel: 'Obtenu',
    badges: {
      'first-module': { name: 'Premier pas', desc: 'Terminez votre premier module.' },
      'first-course': { name: 'Premier cours', desc: 'Terminez un cours entier.' },
      certified: { name: 'Certifié', desc: 'Réussissez une évaluation finale.' },
      streak: { name: 'Régularité', desc: 'Apprenez 3 jours d’affilée.' },
      foundations: { name: 'Fondations', desc: 'Terminez les trois cours gratuits.' },
      flagship: { name: 'Closed-loop', desc: 'Terminez la masterclass closed-loop.' },
      completionist: { name: 'Bibliothèque complète', desc: 'Terminez tous les cours.' },
    },
    certificatesKicker: 'Certificats',
    certificatesTitle: 'Vos certificats',
    noCertificates: 'Terminez un cours pour obtenir votre premier certificat.',
    viewCertificate: 'Voir le certificat',
    takeAssessment: 'Passer l’évaluation',
    assessmentToPass: 'Évaluation finale à passer',
    certScoreLine: (pct) => `Réussi à ${pct} %`,
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
    consoleValidations: 'Konsolenvalidierungen',
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
    resumeKicker: 'Weiter, wo Sie aufgehört haben',
    moduleWord: 'Modul',
    dailyGoalLabel: 'Tagesziel',
    goalReached: 'Ziel erreicht!',
    calendarLabel: 'Letzte 14 Tage',
    weeklyLabel: 'Diese Woche',
    bestLabel: 'Bestwert',
    rewardsKicker: 'Auszeichnungen',
    rewardsTitle: 'Ihre Abzeichen',
    rewardsLocked: 'Gesperrt',
    earnedLabel: 'Erhalten',
    badges: {
      'first-module': { name: 'Erster Schritt', desc: 'Schließen Sie Ihr erstes Modul ab.' },
      'first-course': { name: 'Erster Kurs', desc: 'Schließen Sie einen ganzen Kurs ab.' },
      certified: { name: 'Zertifiziert', desc: 'Bestehen Sie eine Abschlussprüfung.' },
      streak: { name: 'Beständigkeit', desc: 'Lernen Sie 3 Tage in Folge.' },
      foundations: { name: 'Grundlagen', desc: 'Schließen Sie die drei kostenlosen Kurse ab.' },
      flagship: { name: 'Closed-Loop', desc: 'Schließen Sie die Closed-Loop-Masterclass ab.' },
      completionist: { name: 'Komplette Bibliothek', desc: 'Schließen Sie alle Kurse ab.' },
    },
    certificatesKicker: 'Zertifikate',
    certificatesTitle: 'Ihre Zertifikate',
    noCertificates: 'Schließen Sie einen Kurs ab, um Ihr erstes Zertifikat zu erhalten.',
    viewCertificate: 'Zertifikat ansehen',
    takeAssessment: 'Prüfung ablegen',
    assessmentToPass: 'Abschlussprüfung offen',
    certScoreLine: (pct) => `Bestanden mit ${pct}%`,
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
    consoleValidations: 'Validazioni console',
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
    resumeKicker: 'Riprenda da dove era rimasto',
    moduleWord: 'Modulo',
    dailyGoalLabel: 'Obiettivo del giorno',
    goalReached: 'Obiettivo raggiunto!',
    calendarLabel: 'Ultimi 14 giorni',
    weeklyLabel: 'Questa settimana',
    bestLabel: 'Record',
    rewardsKicker: 'Riconoscimenti',
    rewardsTitle: 'I suoi badge',
    rewardsLocked: 'Da sbloccare',
    earnedLabel: 'Ottenuto',
    badges: {
      'first-module': { name: 'Primo passo', desc: 'Completi il suo primo modulo.' },
      'first-course': { name: 'Primo corso', desc: 'Completi un corso intero.' },
      certified: { name: 'Certificato', desc: 'Superi una valutazione finale.' },
      streak: { name: 'Costanza', desc: 'Studi per 3 giorni di fila.' },
      foundations: { name: 'Fondamenta', desc: 'Completi i tre corsi gratuiti.' },
      flagship: { name: 'Closed-loop', desc: 'Completi la masterclass closed-loop.' },
      completionist: { name: 'Libreria completa', desc: 'Completi tutti i corsi.' },
    },
    certificatesKicker: 'Certificati',
    certificatesTitle: 'I suoi certificati',
    noCertificates: 'Completi un corso per ottenere il suo primo certificato.',
    viewCertificate: 'Vedi certificato',
    takeAssessment: 'Fai la valutazione',
    assessmentToPass: 'Valutazione finale da superare',
    certScoreLine: (pct) => `Superata con il ${pct}%`,
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
    consoleValidations: 'Validaciones de consola',
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
    resumeKicker: 'Continúe donde lo dejó',
    moduleWord: 'Módulo',
    dailyGoalLabel: 'Objetivo del día',
    goalReached: '¡Objetivo alcanzado!',
    calendarLabel: 'Últimos 14 días',
    weeklyLabel: 'Esta semana',
    bestLabel: 'Mejor',
    rewardsKicker: 'Recompensas',
    rewardsTitle: 'Sus insignias',
    rewardsLocked: 'Por desbloquear',
    earnedLabel: 'Conseguido',
    badges: {
      'first-module': { name: 'Primer paso', desc: 'Complete su primer módulo.' },
      'first-course': { name: 'Primer curso', desc: 'Complete un curso entero.' },
      certified: { name: 'Certificado', desc: 'Apruebe una evaluación final.' },
      streak: { name: 'Constancia', desc: 'Aprenda 3 días seguidos.' },
      foundations: { name: 'Fundamentos', desc: 'Complete los tres cursos gratuitos.' },
      flagship: { name: 'Closed-loop', desc: 'Complete la masterclass closed-loop.' },
      completionist: { name: 'Biblioteca completa', desc: 'Complete todos los cursos.' },
    },
    certificatesKicker: 'Certificados',
    certificatesTitle: 'Sus certificados',
    noCertificates: 'Complete un curso para conseguir su primer certificado.',
    viewCertificate: 'Ver certificado',
    takeAssessment: 'Hacer la evaluación',
    assessmentToPass: 'Evaluación final pendiente',
    certScoreLine: (pct) => `Aprobado con ${pct}%`,
    certHeading: 'Certificado de finalización',
    certAwardedTo: 'Por la presente se certifica que',
    certCompleted: 'ha completado',
    certIssued: (d) => `Emitido el ${d}`,
    certPrint: 'Imprimir',
    certClose: 'Cerrar',
    celebrateLevelUp: (rank) => `Nuevo rango: ${rank}`,
    celebrateBadgeSub: 'Nueva insignia conseguida',
  },
  pt: {
    accountKicker: 'A sua conta',
    signOut: 'Terminar sessão',
    consoleValidations: 'Validações de consola',
    passKicker: 'Academy Pass',
    passActiveTitle: 'Pass ativo',
    passInactiveTitle: 'Aceda sem limites a todas as masterclasses',
    active: 'Ativo',
    cancelsOn: (d) => `Cancela a ${d}`,
    renewsOn: (d) => `Renova a ${d}`,
    lifetime: 'Acesso vitalício, sem renovação necessária.',
    manageSub: 'Gerir subscrição',
    passPitch:
      'Seis masterclasses premium, seis certificados, acesso vitalício, comunidade privada de perguntas e respostas.',
    seePass: 'Ver o Pass',
    coursesKicker: 'Os seus cursos',
    continueLearning: 'Continue a aprender',
    noCourses: 'Ainda não há cursos',
    emptyBody:
      'Ainda não tem qualquer curso. Comece com um curso de introdução gratuito ou explore as masterclasses premium.',
    freeCourses: 'Cursos gratuitos',
    premiumMasterclasses: 'Masterclasses premium',
    modules: 'módulos',
    continueCta: 'Continuar',
    reviewCta: 'Rever',
    notStarted: 'Por começar',
    inProgress: 'Em curso',
    completed: 'Concluído',
    sourceLabel: { free: 'Gratuito', purchase: 'Comprado', pass: 'Academy Pass', grant: 'Atribuído' },
    progressKicker: 'Progresso',
    progressTitle: 'O seu percurso de aprendizagem',
    levelWord: 'Nível',
    xpUnit: 'XP',
    rankNames: ['Aprendiz', 'Operador', 'Colorista', 'Especialista de cor', 'Mestre closed-loop'],
    xpToNext: (n, rank) => `${n} XP para ${rank}`,
    maxLevelReached: 'Nível máximo atingido',
    statModules: 'Módulos concluídos',
    statCourses: 'Cursos concluídos',
    statCertificates: 'Certificados',
    statStreak: 'Sequência de dias',
    resumeKicker: 'Continue de onde ficou',
    moduleWord: 'Módulo',
    dailyGoalLabel: 'Objetivo do dia',
    goalReached: 'Objetivo atingido!',
    calendarLabel: 'Últimos 14 dias',
    weeklyLabel: 'Esta semana',
    bestLabel: 'Recorde',
    rewardsKicker: 'Recompensas',
    rewardsTitle: 'As suas insígnias',
    rewardsLocked: 'Por desbloquear',
    earnedLabel: 'Obtida',
    badges: {
      'first-module': { name: 'Primeiro passo', desc: 'Conclua o seu primeiro módulo.' },
      'first-course': { name: 'Primeiro curso', desc: 'Conclua um curso inteiro.' },
      certified: { name: 'Certificado', desc: 'Passe numa avaliação final.' },
      streak: { name: 'Constância', desc: 'Aprenda 3 dias seguidos.' },
      foundations: { name: 'Fundamentos', desc: 'Conclua os três cursos gratuitos.' },
      flagship: { name: 'Closed-loop', desc: 'Conclua a masterclass closed-loop.' },
      completionist: { name: 'Biblioteca completa', desc: 'Conclua todos os cursos.' },
    },
    certificatesKicker: 'Certificados',
    certificatesTitle: 'Os seus certificados',
    noCertificates: 'Conclua um curso para obter o seu primeiro certificado.',
    viewCertificate: 'Ver certificado',
    takeAssessment: 'Fazer a avaliação',
    assessmentToPass: 'Avaliação final pendente',
    certScoreLine: (pct) => `Aprovado com ${pct}%`,
    certHeading: 'Certificado de conclusão',
    certAwardedTo: 'Certifica-se que',
    certCompleted: 'concluiu',
    certIssued: (d) => `Emitido a ${d}`,
    certPrint: 'Imprimir',
    certClose: 'Fechar',
    celebrateLevelUp: (rank) => `Novo nível: ${rank}`,
    celebrateBadgeSub: 'Nova insígnia obtida',
  },
};

/* --- Scoped, filled icon (the global svg{} rule is overridden by .gicon) --- */
function IconSeal() {
  return (
    <svg className="gicon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a6 6 0 0 1 4.2 10.3l1 5.7-3.2-1.6L12 18l-2 -1.6L6.8 18l1-5.7A6 6 0 0 1 12 2Zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
    </svg>
  );
}

// Redesigned-Academy copy (heading, catalogue + certificate sections). The big
// COPY map above still drives the level/XP, pass and celebration strings.
const EXTRA: Record<
  Locale,
  {
    eyebrow: string;
    academyTitle: string;
    academySub: string;
    resumeWord: string;
    catalogTitle: string;
    coursesCount: (n: number) => string;
    certified: string;
    certsCount: (n: number) => string;
    download: string;
    of: string;
  }
> = {
  en: {
    eyebrow: 'Partner area',
    academyTitle: 'Academy',
    academySub: 'Offset & ColorLoop training — learn at your own pace and earn your certificates.',
    resumeWord: 'Resume',
    catalogTitle: 'All courses',
    coursesCount: (n) => `${n} course${n > 1 ? 's' : ''}`,
    certified: 'Certified',
    certsCount: (n) => `${n} earned`,
    download: 'Download',
    of: 'of',
  },
  fr: {
    eyebrow: 'Espace partenaire',
    academyTitle: 'Academy',
    academySub: 'Formations offset & ColorLoop — progressez à votre rythme et obtenez vos certificats.',
    resumeWord: 'Reprendre',
    catalogTitle: 'Tous les parcours',
    coursesCount: (n) => `${n} parcours`,
    certified: 'Certifié',
    certsCount: (n) => `${n} obtenu${n > 1 ? 's' : ''}`,
    download: 'Télécharger',
    of: 'sur',
  },
  de: {
    eyebrow: 'Partnerbereich',
    academyTitle: 'Academy',
    academySub: 'Offset- & ColorLoop-Schulungen — lernen Sie in Ihrem Tempo und erwerben Sie Ihre Zertifikate.',
    resumeWord: 'Fortsetzen',
    catalogTitle: 'Alle Kurse',
    coursesCount: (n) => `${n} Kurs${n > 1 ? 'e' : ''}`,
    certified: 'Zertifiziert',
    certsCount: (n) => `${n} erhalten`,
    download: 'Herunterladen',
    of: 'von',
  },
  it: {
    eyebrow: 'Area partner',
    academyTitle: 'Academy',
    academySub: 'Formazione offset & ColorLoop — avanzi al suo ritmo e ottenga i suoi certificati.',
    resumeWord: 'Riprendi',
    catalogTitle: 'Tutti i percorsi',
    coursesCount: (n) => `${n} percors${n > 1 ? 'i' : 'o'}`,
    certified: 'Certificato',
    certsCount: (n) => `${n} ottenut${n > 1 ? 'i' : 'o'}`,
    download: 'Scarica',
    of: 'di',
  },
  es: {
    eyebrow: 'Área de partner',
    academyTitle: 'Academy',
    academySub: 'Formación offset & ColorLoop — avance a su ritmo y obtenga sus certificados.',
    resumeWord: 'Reanudar',
    catalogTitle: 'Todos los cursos',
    coursesCount: (n) => `${n} curso${n > 1 ? 's' : ''}`,
    certified: 'Certificado',
    certsCount: (n) => `${n} obtenido${n > 1 ? 's' : ''}`,
    download: 'Descargar',
    of: 'de',
  },
  pt: {
    eyebrow: 'Área de parceiro',
    academyTitle: 'Academy',
    academySub: 'Formação offset & ColorLoop, avance ao seu ritmo e obtenha os seus certificados.',
    resumeWord: 'Retomar',
    catalogTitle: 'Todos os cursos',
    coursesCount: (n) => `${n} curso${n > 1 ? 's' : ''}`,
    certified: 'Certificado',
    certsCount: (n) => `${n} obtido${n > 1 ? 's' : ''}`,
    download: 'Descarregar',
    of: 'de',
  },
};

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function formatDate(value: string | null, locale: Locale) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return null;
  }
}

export function AccountPage({
  user,
  enrolledCourses,
  passSubscription,
  streak,
  daily,
  resume,
  catalog,
}: Props) {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const x = EXTRA[locale];
  const hasActivePass = passSubscription?.status === 'active';
  const [celebration, setCelebration] = useState<CelebrationContent | null>(null);
  const celebrationSeq = useRef(0);

  const stats = overallStats(
    enrolledCourses.map((c) => ({ completedCount: c.completedCount, total: c.modules, certified: c.certified }))
  );
  const completedSlugs = new Set(
    enrolledCourses
      .filter((c) => isCourseComplete({ completedCount: c.completedCount, total: c.modules }))
      .map((c) => c.slug)
  );
  // A certificate is earned when the course is "certified": passing its final
  // assessment, or — for courses without one yet — completing every module.
  const certificates = enrolledCourses.filter((c) => c.certified && c.certifiedAt);
  const rankName = t.rankNames[stats.level.level - 1] ?? t.rankNames[t.rankNames.length - 1];
  const nextRankName = stats.level.isMax ? '' : t.rankNames[stats.level.level] ?? '';
  const ringPct = stats.level.percentIntoLevel;

  const badges: { id: BadgeId; earned: boolean }[] = [
    { id: 'first-module', earned: stats.completedModules >= 1 },
    { id: 'first-course', earned: stats.coursesCompleted >= 1 },
    { id: 'certified', earned: enrolledCourses.some((c) => c.hasQuiz && c.quizPassed) },
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

  // Daily goal ring (kept for the mobile quick-resume bar).
  const dailyPct = daily.goalXp > 0 ? Math.min(100, Math.round((daily.todayXp / daily.goalXp) * 100)) : 0;
  const dailyMet = daily.todayXp >= daily.goalXp && daily.goalXp > 0;

  // Course that "Resume" points at — for its progress bar in the hero.
  const resumeCourse = resume ? enrolledCourses.find((co) => co.slug === resume.slug) ?? null : null;
  const resumePct = resumeCourse
    ? coursePercent({ completedCount: resumeCourse.completedCount, total: resumeCourse.modules })
    : 0;

  return (
    <main className="page-shell account-shell" id="top">
      <SiteNav current="account" />
      <AccountSubnav current="academy" />

      <section className="section profile-section">
        <div className="container acad-shell">
          <div className="acad-head">
            <div>
              <h1 className="profile-h1">{x.academyTitle}</h1>
              <p className="profile-sub">{x.academySub}</p>
            </div>
            <div className="acad-head-actions">
              {CONSOLE_TRACKING_ENABLED ? (
                <a className="button button-light" href="/account/console-validations">
                  {t.consoleValidations}
                </a>
              ) : null}
              <form action="/api/auth/sign-out" method="post">
                <button type="submit" className="button button-light account-signout">
                  {t.signOut}
                </button>
              </form>
            </div>
          </div>

          {hasCourses ? (
            <>
              {/* Level / XP banner */}
              <section className="acad-level">
                <div
                  className="acad-ring"
                  style={{ background: `conic-gradient(var(--accent) ${ringPct}%, #eef0f2 ${ringPct}%)` }}
                  aria-hidden="true"
                >
                  <div className="acad-ring-inner">
                    <span className="acad-ring-lvl">
                      {t.levelWord} {stats.level.level}
                    </span>
                    <span className="acad-ring-pct">{ringPct}%</span>
                  </div>
                </div>
                <div className="acad-level-main">
                  <div className="acad-xp">
                    {stats.xp} {t.xpUnit}
                  </div>
                  <div className="acad-xp-sub">
                    {stats.level.isMax ? t.maxLevelReached : t.xpToNext(stats.level.xpToNext, nextRankName)}
                  </div>
                  <div className="acad-xp-bar">
                    <span style={{ width: `${ringPct}%` }} />
                  </div>
                </div>
                <div className="acad-stats">
                  <div className="acad-stat">
                    <span className="acad-stat-n">{stats.completedModules}</span>
                    <span className="acad-stat-l">{t.statModules}</span>
                  </div>
                  <div className="acad-stat">
                    <span className="acad-stat-n acad-stat-ok">{certificates.length}</span>
                    <span className="acad-stat-l">{t.statCertificates}</span>
                  </div>
                  <div className="acad-stat">
                    <span className="acad-stat-n">{streak}</span>
                    <span className="acad-stat-l">{t.statStreak}</span>
                  </div>
                </div>
              </section>

              {/* Resume hero */}
              {resume ? (
                <a
                  className="acad-resume"
                  href={`/academy/${resume.slug}?m=${resume.moduleIndex}#course-content`}
                >
                  <span className={`acad-resume-thumb acad-thumb-${resumeCourse?.tone ?? 'free'}`} aria-hidden="true" />
                  <div className="acad-resume-main">
                    <p className="acad-resume-eyebrow">{x.resumeWord}</p>
                    <h2 className="acad-resume-title">{resume.title}</h2>
                    <p className="acad-resume-mod">
                      {t.moduleWord} {resume.moduleIndex + 1} {x.of} {resumeCourse?.modules ?? '—'} ·{' '}
                      {resume.moduleTitle}
                    </p>
                    <div className="acad-resume-bar">
                      <span style={{ width: `${resumePct}%` }} />
                    </div>
                  </div>
                  <span className="acad-resume-cta">
                    {x.resumeWord} <span aria-hidden="true">→</span>
                  </span>
                </a>
              ) : null}

              {/* Catalogue */}
              <div className="acad-sec-head">
                <h2 className="acad-sec-title">{x.catalogTitle}</h2>
                <span className="acad-sec-count">{x.coursesCount(enrolledCourses.length)}</span>
              </div>
              <div className="acad-grid">
                {enrolledCourses.map((course) => {
                  const pct = coursePercent({ completedCount: course.completedCount, total: course.modules });
                  const complete = isCourseComplete({
                    completedCount: course.completedCount,
                    total: course.modules,
                  });
                  const assessmentPending = course.hasQuiz && complete && !course.quizPassed;
                  let pillKind: 'done' | 'progress' | 'new';
                  let pillLabel: string;
                  if (course.certified) {
                    pillKind = 'done';
                    pillLabel = x.certified;
                  } else if (course.completedCount > 0 || assessmentPending) {
                    pillKind = 'progress';
                    pillLabel = t.inProgress;
                  } else {
                    pillKind = 'new';
                    pillLabel = t.notStarted;
                  }
                  return (
                    <a key={course.slug} className="acad-card" href={`/academy/${course.slug}`}>
                      <span className={`acad-card-top acad-thumb-${course.tone}`} aria-hidden="true" />
                      <div className="acad-card-body">
                        <div className="acad-card-meta">
                          <span className="acad-card-source">{t.sourceLabel[course.source]}</span>
                          <span className={`acad-pill acad-pill-${pillKind}`}>
                            {pillKind === 'done' ? <IconCheck /> : null}
                            {pillLabel}
                          </span>
                        </div>
                        <h3 className="acad-card-title">{course.title}</h3>
                        <div className="acad-card-bar">
                          <span className={pillKind === 'done' ? 'is-done' : ''} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="acad-card-modules">
                          {course.completedCount} / {course.modules} {t.modules}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Certificates */}
              <div className="acad-sec-head acad-sec-head-2">
                <h2 className="acad-sec-title">{t.certificatesTitle}</h2>
                <span className="acad-sec-count">{x.certsCount(certificates.length)}</span>
              </div>
              {certificates.length === 0 ? (
                <p className="account-cert-empty">{t.noCertificates}</p>
              ) : (
                <div className="acad-cert-grid">
                  {certificates.map((cert) => (
                    <section key={cert.slug} className="acad-cert">
                      <span className="acad-cert-icon" aria-hidden="true">
                        <IconSeal />
                      </span>
                      <div className="acad-cert-body">
                        <h3 className="acad-cert-title">{cert.title}</h3>
                        <p className="acad-cert-date">{t.certIssued(formatDate(cert.certifiedAt, locale) ?? '')}</p>
                      </div>
                      <a
                        className="acad-cert-dl"
                        href={`/account/certificate/${cert.slug}/pdf`}
                        target="_blank"
                        rel="noopener"
                      >
                        {x.download}
                      </a>
                    </section>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="account-empty acad-empty">
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
          )}

          {/* Academy Pass — kept (subscription status / upsell) */}
          <div className="acad-sec-head acad-sec-head-2">
            <h2 className="acad-sec-title">{hasActivePass ? t.passActiveTitle : t.passKicker}</h2>
          </div>
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

      <Celebration content={celebration} onDismiss={() => setCelebration(null)} />

      {hasCourses ? (
        <div className="account-mobilebar">
          <span className="account-mobilebar-goal">
            <span
              className="account-mobilebar-ring"
              style={{ background: `conic-gradient(var(--accent) ${dailyPct}%, rgba(0,0,0,0.12) ${dailyPct}%)` }}
              aria-hidden="true"
            />
            <span className="account-mobilebar-text">
              {dailyMet ? `${daily.todayXp} ${t.xpUnit}` : `${daily.todayXp}/${daily.goalXp} ${t.xpUnit}`}
            </span>
          </span>
          <a
            className="button button-accent account-mobilebar-cta"
            href={resume ? `/academy/${resume.slug}?m=${resume.moduleIndex}#course-content` : '/academy#free'}
          >
            {t.continueCta}
          </a>
        </div>
      ) : null}

      <SiteFooter />
    </main>
  );
}
