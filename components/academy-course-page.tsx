'use client';

import { useRef, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { type Locale, useLanguage } from '@/components/language-provider';
import { Celebration, type CelebrationContent } from '@/components/academy-celebration';
import type { AcademyCourse } from '@/data/academy-courses';
import { getLessonsForCourse } from '@/data/academy-lessons';
import type { CourseAccess } from '@/lib/entitlements';
import { coursePercent, newlyCrossedPaliers, type Palier } from '@/lib/gamification';
// Type-only import: erased at build, so the server-only answer key is NOT bundled.
import type { PublicQuiz } from '@/data/academy-quizzes';
import { getCourseApp } from '@/data/academy-app';
import { AcademyPlayer } from '@/components/academy-player';

type QuizResultClient = {
  score: number;
  total: number;
  passed: boolean;
  results: {
    id: string;
    correct: number[];
    your: number[];
    isCorrect: boolean;
    explanation: string;
    moduleRef?: number;
  }[];
};

type QuizCopy = {
  kicker: string;
  title: string;
  intro: (n: number, pct: number) => string;
  gateNote: string;
  start: string;
  selectOne: string;
  selectMany: string;
  submit: string;
  submitting: string;
  answerAll: string;
  submitError: string;
  retake: string;
  passLine: (score: number, total: number, pct: number) => string;
  failLine: (score: number, total: number, pct: number) => string;
  passSub: string;
  failSub: (pct: number) => string;
  reviewModule: (n: number) => string;
  alreadyPassedTitle: string;
  alreadyPassedSub: (score: number, total: number, pct: number) => string;
  viewCertificate: string;
  celebrateTitle: string;
};

const QUIZ_COPY: Record<Locale, QuizCopy> = {
  en: {
    kicker: 'Final assessment',
    title: 'Validate your knowledge',
    intro: (n, pct) => `${n} questions. Score ${pct}% or more to pass and unlock your certificate.`,
    gateNote: 'Work through the modules above first — then test yourself.',
    start: 'Start the assessment',
    selectOne: 'Select one answer',
    selectMany: 'Select all that apply',
    submit: 'Submit answers',
    submitting: 'Grading…',
    answerAll: 'Answer every question before submitting.',
    submitError: 'Something went wrong. Please try again.',
    retake: 'Retake the assessment',
    passLine: (s, t, pct) => `Passed — ${s}/${t} (${pct}%)`,
    failLine: (s, t, pct) => `${s}/${t} (${pct}%) — not yet`,
    passSub: 'Certificate unlocked. You will find it on your account.',
    failSub: (pct) => `You need ${pct}% to pass. Review the explanations and try again.`,
    reviewModule: (n) => `Review module ${String(n).padStart(2, '0')}`,
    alreadyPassedTitle: 'Assessment passed',
    alreadyPassedSub: (s, t, pct) => `You passed with ${s}/${t} (${pct}%).`,
    viewCertificate: 'View your certificate',
    celebrateTitle: 'Assessment passed!',
  },
  fr: {
    kicker: 'Évaluation finale',
    title: 'Validez vos connaissances',
    intro: (n, pct) => `${n} questions. Obtenez ${pct}% ou plus pour réussir et débloquer votre certificat.`,
    gateNote: 'Parcourez d’abord les modules ci-dessus, puis testez-vous.',
    start: 'Commencer l’évaluation',
    selectOne: 'Sélectionnez une réponse',
    selectMany: 'Sélectionnez toutes les bonnes réponses',
    submit: 'Valider mes réponses',
    submitting: 'Correction…',
    answerAll: 'Répondez à toutes les questions avant de valider.',
    submitError: 'Une erreur est survenue. Veuillez réessayer.',
    retake: 'Repasser l’évaluation',
    passLine: (s, t, pct) => `Réussi — ${s}/${t} (${pct}%)`,
    failLine: (s, t, pct) => `${s}/${t} (${pct}%) — pas encore`,
    passSub: 'Certificat débloqué. Vous le retrouverez sur votre compte.',
    failSub: (pct) => `Il faut ${pct}% pour réussir. Relisez les explications et réessayez.`,
    reviewModule: (n) => `Revoir le module ${String(n).padStart(2, '0')}`,
    alreadyPassedTitle: 'Évaluation réussie',
    alreadyPassedSub: (s, t, pct) => `Vous avez réussi avec ${s}/${t} (${pct}%).`,
    viewCertificate: 'Voir votre certificat',
    celebrateTitle: 'Évaluation réussie !',
  },
  de: {
    kicker: 'Abschlussprüfung',
    title: 'Bestätigen Sie Ihr Wissen',
    intro: (n, pct) => `${n} Fragen. Erreichen Sie ${pct}% oder mehr, um zu bestehen und Ihr Zertifikat freizuschalten.`,
    gateNote: 'Arbeiten Sie zuerst die Module oben durch — dann prüfen Sie sich.',
    start: 'Prüfung starten',
    selectOne: 'Wählen Sie eine Antwort',
    selectMany: 'Wählen Sie alle zutreffenden Antworten',
    submit: 'Antworten absenden',
    submitting: 'Auswertung…',
    answerAll: 'Beantworten Sie jede Frage, bevor Sie absenden.',
    submitError: 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
    retake: 'Prüfung wiederholen',
    passLine: (s, t, pct) => `Bestanden — ${s}/${t} (${pct}%)`,
    failLine: (s, t, pct) => `${s}/${t} (${pct}%) — noch nicht`,
    passSub: 'Zertifikat freigeschaltet. Sie finden es in Ihrem Konto.',
    failSub: (pct) => `Sie benötigen ${pct}% zum Bestehen. Lesen Sie die Erklärungen und versuchen Sie es erneut.`,
    reviewModule: (n) => `Modul ${String(n).padStart(2, '0')} ansehen`,
    alreadyPassedTitle: 'Prüfung bestanden',
    alreadyPassedSub: (s, t, pct) => `Sie haben mit ${s}/${t} (${pct}%) bestanden.`,
    viewCertificate: 'Zertifikat ansehen',
    celebrateTitle: 'Prüfung bestanden!',
  },
  it: {
    kicker: 'Valutazione finale',
    title: 'Convalidi le sue conoscenze',
    intro: (n, pct) => `${n} domande. Ottenga il ${pct}% o più per superare e sbloccare il suo certificato.`,
    gateNote: 'Prima affronti i moduli qui sopra, poi si metta alla prova.',
    start: 'Inizia la valutazione',
    selectOne: 'Selezioni una risposta',
    selectMany: 'Selezioni tutte le risposte corrette',
    submit: 'Invia le risposte',
    submitting: 'Correzione…',
    answerAll: 'Risponda a tutte le domande prima di inviare.',
    submitError: 'Si è verificato un errore. Riprovi.',
    retake: 'Ripeti la valutazione',
    passLine: (s, t, pct) => `Superata — ${s}/${t} (${pct}%)`,
    failLine: (s, t, pct) => `${s}/${t} (${pct}%) — non ancora`,
    passSub: 'Certificato sbloccato. Lo troverà nel suo account.',
    failSub: (pct) => `Le serve il ${pct}% per superare. Rilegga le spiegazioni e riprovi.`,
    reviewModule: (n) => `Rivedi il modulo ${String(n).padStart(2, '0')}`,
    alreadyPassedTitle: 'Valutazione superata',
    alreadyPassedSub: (s, t, pct) => `Ha superato con ${s}/${t} (${pct}%).`,
    viewCertificate: 'Vedi il suo certificato',
    celebrateTitle: 'Valutazione superata!',
  },
  es: {
    kicker: 'Evaluación final',
    title: 'Valide sus conocimientos',
    intro: (n, pct) => `${n} preguntas. Obtenga ${pct}% o más para aprobar y desbloquear su certificado.`,
    gateNote: 'Primero repase los módulos de arriba y luego póngase a prueba.',
    start: 'Empezar la evaluación',
    selectOne: 'Seleccione una respuesta',
    selectMany: 'Seleccione todas las correctas',
    submit: 'Enviar respuestas',
    submitting: 'Corrigiendo…',
    answerAll: 'Responda todas las preguntas antes de enviar.',
    submitError: 'Algo salió mal. Inténtelo de nuevo.',
    retake: 'Repetir la evaluación',
    passLine: (s, t, pct) => `Aprobado — ${s}/${t} (${pct}%)`,
    failLine: (s, t, pct) => `${s}/${t} (${pct}%) — todavía no`,
    passSub: 'Certificado desbloqueado. Lo encontrará en su cuenta.',
    failSub: (pct) => `Necesita ${pct}% para aprobar. Repase las explicaciones e inténtelo de nuevo.`,
    reviewModule: (n) => `Repasar el módulo ${String(n).padStart(2, '0')}`,
    alreadyPassedTitle: 'Evaluación aprobada',
    alreadyPassedSub: (s, t, pct) => `Aprobó con ${s}/${t} (${pct}%).`,
    viewCertificate: 'Ver su certificado',
    celebrateTitle: '¡Evaluación aprobada!',
  },
};

type ProgressCopy = {
  progressTitle: string;
  modulesDone: (done: number, total: number) => string;
  markDone: string;
  markedDone: string;
  palierTitle: Record<Palier, string>;
  xpGain: (n: number) => string;
  certificateUnlocked: string;
};

const PROGRESS_COPY: Record<Locale, ProgressCopy> = {
  en: {
    progressTitle: 'Your progress',
    modulesDone: (d, t) => `${d} / ${t} modules`,
    markDone: 'Mark module complete',
    markedDone: 'Module completed',
    palierTitle: { 25: 'Off to a great start!', 50: 'Halfway there!', 75: 'Almost there!', 100: 'Course complete!' },
    xpGain: (n) => `+${n} XP`,
    certificateUnlocked: 'Certificate unlocked — see your account',
  },
  fr: {
    progressTitle: 'Votre progression',
    modulesDone: (d, t) => `${d} / ${t} modules`,
    markDone: 'Marquer le module comme terminé',
    markedDone: 'Module terminé',
    palierTitle: { 25: 'Bien démarré !', 50: 'À mi-parcours !', 75: 'Dernière ligne droite !', 100: 'Cours terminé !' },
    xpGain: (n) => `+${n} XP`,
    certificateUnlocked: 'Certificat débloqué — voir votre compte',
  },
  de: {
    progressTitle: 'Ihr Fortschritt',
    modulesDone: (d, t) => `${d} / ${t} Module`,
    markDone: 'Modul als abgeschlossen markieren',
    markedDone: 'Modul abgeschlossen',
    palierTitle: { 25: 'Guter Start!', 50: 'Halbzeit!', 75: 'Fast geschafft!', 100: 'Kurs abgeschlossen!' },
    xpGain: (n) => `+${n} XP`,
    certificateUnlocked: 'Zertifikat freigeschaltet — siehe Ihr Konto',
  },
  it: {
    progressTitle: 'I suoi progressi',
    modulesDone: (d, t) => `${d} / ${t} moduli`,
    markDone: 'Segna il modulo come completato',
    markedDone: 'Modulo completato',
    palierTitle: { 25: 'Ottimo inizio!', 50: 'A metà strada!', 75: 'Quasi finito!', 100: 'Corso completato!' },
    xpGain: (n) => `+${n} XP`,
    certificateUnlocked: 'Certificato sbloccato — vada al suo account',
  },
  es: {
    progressTitle: 'Su progreso',
    modulesDone: (d, t) => `${d} / ${t} módulos`,
    markDone: 'Marcar módulo como completado',
    markedDone: 'Módulo completado',
    palierTitle: { 25: '¡Buen comienzo!', 50: '¡A mitad de camino!', 75: '¡Ya casi está!', 100: '¡Curso completado!' },
    xpGain: (n) => `+${n} XP`,
    certificateUnlocked: 'Certificado desbloqueado — vea su cuenta',
  },
};

const FREE_COURSE_LIST: { id: string; title: string }[] = [
  { id: 'fundamentals', title: 'Offset Color Management Fundamentals' },
  { id: 'measurement-essentials', title: 'Press-Side Measurement Essentials' },
  { id: 'where-color-hurts', title: 'Where Color Hurts' },
];

const PREMIUM_COURSE_LIST: { id: string; title: string }[] = [
  { id: 'closed-loop-flagship', title: 'The Complete Closed-Loop Color Masterclass' },
  { id: 'measurecolor-production', title: 'MeasureColor Production' },
  { id: 'measurecolor-reports', title: 'MeasureColor Reports' },
  { id: 'intellitrax2', title: 'IntelliTrax2 & IntelliTrax2 Pro' },
  { id: 'colorloop-ai', title: 'ColorLoop AI' },
  { id: 'offset360', title: 'Offset360 in Practice' },
];

type Props = {
  course: AcademyCourse;
  access: CourseAccess;
  videoUrl: string | null;
  completedLessons?: number[];
  quiz?: PublicQuiz | null;
  quizPassed?: boolean;
  quizBest?: { score: number; total: number } | null;
  initialModule?: number;
};

export function AcademyCoursePage({
  course,
  access,
  videoUrl,
  completedLessons = [],
  quiz = null,
  quizPassed = false,
  quizBest = null,
  initialModule = 0,
}: Props) {
  const { locale } = useLanguage();
  const tp = PROGRESS_COPY[locale];
  const tq = QUIZ_COPY[locale];
  const tone = course.tone;
  const siblings = tone === 'premium' ? PREMIUM_COURSE_LIST : FREE_COURSE_LIST;
  const lessons = getLessonsForCourse(course.id);
  const totalModules = lessons?.length ?? 0;
  const [openLesson, setOpenLesson] = useState<number>(initialModule);
  const [checkoutLoading, setCheckoutLoading] = useState<null | 'course' | 'pass'>(null);
  const [completed, setCompleted] = useState<Set<number>>(() => new Set(completedLessons));
  const [celebration, setCelebration] = useState<CelebrationContent | null>(null);
  const celebrationSeq = useRef(0);
  const toggleLesson = (index: number) => setOpenLesson((current) => (current === index ? -1 : index));
  const coursePct = coursePercent({ completedCount: completed.size, total: totalModules });
  // New step-based player (Phase 1): present only for courses that have step content.
  const app = getCourseApp(course.id, locale);
  const appNextIndex = app ? app.modules.findIndex((_, i) => !completed.has(i)) : -1;
  const [playerModule, setPlayerModule] = useState<number | null>(null);

  // Final-assessment (QCM) state.
  const quizPassPct = quiz ? Math.round(quiz.passThreshold * 100) : 0;
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number[]>>({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResultClient | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [passed, setPassed] = useState(quizPassed);

  const selectAnswer = (qid: string, optionIndex: number, multiple: boolean) => {
    setQuizAnswers((prev) => {
      const current = prev[qid] ?? [];
      if (multiple) {
        const next = current.includes(optionIndex)
          ? current.filter((x) => x !== optionIndex)
          : [...current, optionIndex];
        return { ...prev, [qid]: next };
      }
      return { ...prev, [qid]: [optionIndex] };
    });
  };

  const reviewModule = (moduleRef: number) => {
    setOpenLesson(moduleRef - 1);
    if (typeof document !== 'undefined') {
      document.getElementById('course-content')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const startQuizRetake = () => {
    setQuizResult(null);
    setQuizAnswers({});
    setQuizError(null);
    setQuizStarted(true);
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    const unanswered = quiz.questions.some((q) => !(quizAnswers[q.id]?.length));
    if (unanswered) {
      setQuizError(tq.answerAll);
      return;
    }
    setQuizError(null);
    setQuizSubmitting(true);
    try {
      const res = await fetch('/api/account/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug: course.id, answers: quizAnswers }),
      });
      if (!res.ok) throw new Error('quiz request failed');
      const json = (await res.json()) as QuizResultClient;
      setQuizResult(json);
      if (json.passed && !passed) {
        setPassed(true);
        celebrationSeq.current += 1;
        setCelebration({
          id: celebrationSeq.current,
          variant: 'course',
          title: tq.celebrateTitle,
          subtitle: course.certificate ? tp.certificateUnlocked : tp.xpGain(50),
        });
      }
    } catch {
      setQuizError(tq.submitError);
    } finally {
      setQuizSubmitting(false);
    }
  };

  const toggleComplete = async (index: number) => {
    const willComplete = !completed.has(index);
    const before = new Set(completed);
    const after = new Set(completed);
    if (willComplete) after.add(index);
    else after.delete(index);
    setCompleted(after);

    if (willComplete) {
      const oldPct = coursePercent({ completedCount: before.size, total: totalModules });
      const newPct = coursePercent({ completedCount: after.size, total: totalModules });
      const crossed = newlyCrossedPaliers(oldPct, newPct);
      if (crossed.length > 0) {
        const top = crossed[crossed.length - 1];
        const finished = top === 100;
        const gained = 10 + (finished ? 50 : 0);
        celebrationSeq.current += 1;
        setCelebration({
          id: celebrationSeq.current,
          variant: finished ? 'course' : 'palier',
          title: tp.palierTitle[top],
          subtitle: finished && course.certificate ? tp.certificateUnlocked : tp.xpGain(gained),
        });
      }
    }

    try {
      const res = await fetch('/api/account/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug: course.id, lessonIndex: index, completed: willComplete }),
      });
      if (!res.ok) throw new Error('progress request failed');
      const json = (await res.json()) as { completedLessons?: number[] };
      if (Array.isArray(json.completedLessons)) setCompleted(new Set(json.completedLessons));
    } catch {
      setCompleted(before); // revert optimistic update on failure
    }
  };

  // Open the player on a module, respecting the gate (previous module done).
  const openPlayer = (index: number) => {
    if (index !== 0 && !completed.has(index - 1)) return;
    setPlayerModule(index);
  };
  // Completion from the player: persist + always celebrate. Every validated
  // module gets a toast/confetti, upgraded to the palier/course celebration
  // when a 25/50/75/100% threshold is crossed.
  const completeFromPlayer = (index: number) => {
    if (completed.has(index)) return;
    const before = new Set(completed);
    const after = new Set(completed);
    after.add(index);
    setCompleted(after);

    const oldPct = coursePercent({ completedCount: before.size, total: totalModules });
    const newPct = coursePercent({ completedCount: after.size, total: totalModules });
    const crossed = newlyCrossedPaliers(oldPct, newPct);
    const top = crossed.length > 0 ? crossed[crossed.length - 1] : null;
    const finished = top === 100;
    celebrationSeq.current += 1;
    setCelebration({
      id: celebrationSeq.current,
      variant: finished ? 'course' : 'palier',
      title: top ? tp.palierTitle[top] : tp.markedDone,
      subtitle: finished && course.certificate ? tp.certificateUnlocked : tp.xpGain(10 + (finished ? 50 : 0)),
    });

    void fetch('/api/account/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseSlug: course.id, lessonIndex: index, completed: true }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('progress request failed');
        return res.json() as Promise<{ completedLessons?: number[] }>;
      })
      .then((json) => {
        if (Array.isArray(json.completedLessons)) setCompleted(new Set(json.completedLessons));
      })
      .catch(() => setCompleted(before));
  };

  const handleCheckout = async (target: 'course' | 'pass') => {
    setCheckoutLoading(target);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          target === 'course'
            ? { courseSlug: course.id, mode: 'payment' }
            : { courseSlug: 'academy-pass', mode: 'payment' }
        ),
      });
      if (res.status === 401) {
        window.location.href = `/account/sign-in?next=${encodeURIComponent(`/academy/${course.id}`)}`;
        return;
      }
      const { url, error } = await res.json();
      if (url) window.location.href = url;
      else if (error) alert(error);
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <main className="page-shell" id="top">
      <SiteNav current="academy" />

      <section className="academy-course-hero section">
        <div className="container academy-course-hero-shell">
          <a className="academy-course-back" href="/academy">
            <span aria-hidden="true">←</span> Back to Rutherford Academy
          </a>

          <div className="academy-course-hero-grid">
            <div className="academy-course-hero-copy">
              <p className="section-kicker">
                {tone === 'premium' ? 'Premium masterclass' : 'Free introductory course'}
              </p>
              <h1 className="academy-course-title">{course.title}</h1>
              <p className="academy-course-lead">{course.description}</p>
              <ul className="academy-course-meta">
                <li>
                  <span>Duration</span>
                  <strong>{course.duration}</strong>
                </li>
                <li>
                  <span>Modules</span>
                  <strong>{course.modules}</strong>
                </li>
                <li>
                  <span>Price</span>
                  <strong>{course.price ?? 'Free'}</strong>
                </li>
                {course.certificate ? (
                  <li>
                    <span>Certificate</span>
                    <strong>{course.certificate}</strong>
                  </li>
                ) : null}
              </ul>
              {course.flagship ? <span className="academy-course-flag">Flagship masterclass</span> : null}
              {access.hasAccess && tone === 'premium' ? (
                <p className="academy-course-access-badge">
                  ✓ {access.source === 'pass' ? 'Academy Pass active' : 'Enrolled'}
                </p>
              ) : null}
            </div>
            <figure className="academy-course-video">
              {videoUrl ? (
                <video src={`${videoUrl}#t=0.1`} controls playsInline preload="metadata" />
              ) : (
                <div className="academy-course-video-locked">
                  <span className="academy-course-video-locked-icon" aria-hidden="true">
                    🔒
                  </span>
                  {access.signedIn ? (
                    <>
                      <p className="academy-course-video-locked-text">
                        Unlock this masterclass to watch the full video.
                      </p>
                      <a className="button button-accent" href="#course-content">
                        Unlock the course
                      </a>
                    </>
                  ) : (
                    <>
                      <p className="academy-course-video-locked-text">
                        Create your free account to watch the video.
                      </p>
                      <a
                        className="button button-accent"
                        href={`/account/sign-in?next=${encodeURIComponent(`/academy/${course.id}`)}`}
                      >
                        Create free account
                      </a>
                    </>
                  )}
                </div>
              )}
            </figure>
          </div>
        </div>
      </section>

      <section className="academy-course-body section">
        <div className="container academy-course-body-shell">
          <div className="academy-course-syllabus-block">
            <h2>Course syllabus</h2>
            <ol className="academy-course-syllabus">
              {course.syllabus.map((item, index) => (
                <li key={index}>
                  <span className="academy-course-syllabus-index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <aside className="academy-course-cta-card">
            {tone === 'premium' && !access.hasAccess ? (
              <>
                <h3>Enroll in this masterclass</h3>
                <p>Lifetime access, certificate on completion, private Q&amp;A with Rutherford engineers.</p>
                <p className="academy-course-cta-price">{course.price}</p>
                <button
                  type="button"
                  className="button button-accent academy-course-cta-button"
                  onClick={() => handleCheckout('course')}
                  disabled={checkoutLoading !== null}
                >
                  {checkoutLoading === 'course' ? 'Loading…' : 'Buy this course'} <span aria-hidden="true">→</span>
                </button>
                <button
                  type="button"
                  className="button button-light academy-course-cta-button"
                  onClick={() => handleCheckout('pass')}
                  disabled={checkoutLoading !== null}
                >
                  {checkoutLoading === 'pass' ? 'Loading…' : 'Get the Academy Pass (€399)'}
                </button>
                <p className="academy-course-cta-sub">
                  {access.signedIn
                    ? 'You will be redirected to Stripe to complete the purchase.'
                    : (
                      <>
                        Already a member?{' '}
                        <a href={`/account/sign-in?next=${encodeURIComponent(`/academy/${course.id}`)}`}>Sign in</a>
                      </>
                    )}
                </p>
              </>
            ) : tone === 'premium' ? (
              <>
                <h3>You&rsquo;re enrolled</h3>
                <p>Full access to every module below, lifetime updates, and your certificate on completion.</p>
                <a className="button button-dark academy-course-cta-button" href="/account">
                  Go to your account <span aria-hidden="true">→</span>
                </a>
              </>
            ) : access.hasAccess ? (
              <>
                <h3>Watch the full course</h3>
                <p>Free for every press team. Track your progress and earn your certificate.</p>
                <p className="academy-course-cta-price">Free</p>
                <a className="button button-dark academy-course-cta-button" href="#course-content">
                  Start the course <span aria-hidden="true">→</span>
                </a>
                <p className="academy-course-cta-sub">
                  Ready for the next step? See the{' '}
                  <a href="/academy#premium">premium masterclasses</a>.
                </p>
              </>
            ) : (
              <>
                <h3>Create your free account</h3>
                <p>This course is free. Create an account to unlock the full lesson and track your progress.</p>
                <p className="academy-course-cta-price">Free</p>
                <a
                  className="button button-accent academy-course-cta-button"
                  href={`/account/sign-in?next=${encodeURIComponent(`/academy/${course.id}`)}`}
                >
                  Create free account <span aria-hidden="true">→</span>
                </a>
                <p className="academy-course-cta-sub">
                  Already have an account?{' '}
                  <a href={`/account/sign-in?next=${encodeURIComponent(`/academy/${course.id}`)}`}>Sign in</a>
                </p>
              </>
            )}
          </aside>
        </div>
      </section>

      {lessons && lessons.length > 0 ? (
        access.hasAccess ? (
          <section className="academy-course-lessons section" id="course-content">
            <div className="container academy-course-lessons-shell">
              <header className="academy-section-head academy-section-head-left">
                <p className="section-kicker">Course content</p>
                <h2>The full lesson, module by module</h2>
                <p>
                  The video is the introduction. The complete written course is below, structured to match the syllabus.
                  Read it in one sitting or come back module by module.
                </p>
              </header>
              <div className="academy-progress-panel">
                <div className="academy-progress-head">
                  <span className="academy-progress-label">{tp.progressTitle}</span>
                  <span className="academy-progress-count">
                    {tp.modulesDone(completed.size, totalModules)} · {coursePct}%
                  </span>
                </div>
                <div
                  className="academy-progress-track"
                  role="progressbar"
                  aria-valuenow={coursePct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span className="academy-progress-fill" style={{ width: `${coursePct}%` }} />
                </div>
              </div>
              {app ? (
                <ol className="academy-modlist">
                  {app.modules.map((m, index) => {
                    const done = completed.has(index);
                    const unlocked = index === 0 || completed.has(index - 1);
                    const isNext = unlocked && !done && index === appNextIndex;
                    return (
                      <li
                        key={index}
                        className={`academy-modrow ${done ? 'is-done' : isNext ? 'is-next' : !unlocked ? 'is-locked' : ''}`}
                      >
                        <button
                          type="button"
                          className="academy-modrow-btn"
                          onClick={() => openPlayer(index)}
                          disabled={!unlocked}
                        >
                          <span className="academy-modrow-num" aria-hidden="true">
                            {done ? '✓' : m.num}
                          </span>
                          <span className="academy-modrow-txt">
                            <b>{m.title}</b>
                            <span>
                              {m.summary} · {m.time}
                            </span>
                          </span>
                          <span className="academy-modrow-act" aria-hidden="true">
                            {done ? '✓' : isNext ? 'Start →' : unlocked ? 'Open' : '🔒'}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              ) : (
              <ol className="academy-course-lessons-list">
                {lessons.map((lesson, index) => {
                  const isOpen = openLesson === index;
                  const isDone = completed.has(index);
                  const headId = `lesson-head-${index}`;
                  const bodyId = `lesson-body-${index}`;
                  return (
                    <li
                      key={index}
                      className={`academy-course-lesson ${isOpen ? 'is-open' : ''} ${isDone ? 'is-complete' : ''}`}
                    >
                      <button
                        type="button"
                        id={headId}
                        className="academy-course-lesson-head"
                        onClick={() => toggleLesson(index)}
                        aria-expanded={isOpen}
                        aria-controls={bodyId}
                      >
                        <span className="academy-course-lesson-meta">
                          <span className="academy-course-lesson-index" aria-hidden="true">
                            Module {String(index + 1).padStart(2, '0')}
                          </span>
                          {isDone ? (
                            <span className="academy-course-lesson-flag" aria-hidden="true">
                              ✓ {tp.markedDone}
                            </span>
                          ) : (
                            <span className="academy-course-lesson-step" aria-hidden="true">
                              {index + 1} / {lessons.length}
                            </span>
                          )}
                        </span>
                        <h3 className="academy-course-lesson-title">{lesson.title}</h3>
                        <p className="academy-course-lesson-summary">{lesson.summary}</p>
                        <span className="academy-course-lesson-chevron" aria-hidden="true">
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>
                      <div
                        id={bodyId}
                        role="region"
                        aria-labelledby={headId}
                        className="academy-course-lesson-body"
                        hidden={!isOpen}
                      >
                        {lesson.body.map((para, paraIndex) => (
                          <p key={paraIndex}>{para}</p>
                        ))}
                        <button
                          type="button"
                          className={`academy-course-lesson-done ${isDone ? 'is-done' : ''}`}
                          onClick={() => toggleComplete(index)}
                          aria-pressed={isDone}
                        >
                          <span className="academy-course-lesson-done-box" aria-hidden="true">
                            {isDone ? '✓' : ''}
                          </span>
                          {isDone ? tp.markedDone : tp.markDone}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
              )}
            </div>
          </section>
        ) : tone === 'premium' ? (
          <section className="academy-course-paywall section" id="course-content">
            <div className="container academy-course-paywall-shell">
              <header className="academy-section-head">
                <p className="section-kicker">Course content</p>
                <h2>Unlock the full masterclass</h2>
                <p>
                  The video above is the introduction. The complete {lessons.length}-module written course is locked
                  behind purchase. Pick the option that fits your needs.
                </p>
              </header>

              <ol className="academy-course-paywall-list">
                {lessons.map((lesson, index) => (
                  <li key={index} className="academy-course-paywall-item">
                    <span className="academy-course-paywall-lock" aria-hidden="true">
                      🔒
                    </span>
                    <span className="academy-course-paywall-index">
                      Module {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="academy-course-paywall-title">{lesson.title}</span>
                  </li>
                ))}
              </ol>

              <div className="academy-course-paywall-actions">
                <button
                  type="button"
                  className="button button-accent"
                  onClick={() => handleCheckout('course')}
                  disabled={checkoutLoading !== null}
                >
                  {checkoutLoading === 'course' ? 'Loading…' : `Buy this course — ${course.price}`}
                </button>
                <button
                  type="button"
                  className="button button-light"
                  onClick={() => handleCheckout('pass')}
                  disabled={checkoutLoading !== null}
                >
                  {checkoutLoading === 'pass' ? 'Loading…' : 'Get the Academy Pass — €399'}
                </button>
              </div>
              {!access.signedIn ? (
                <p className="academy-course-paywall-signin">
                  Already enrolled?{' '}
                  <a href={`/account/sign-in?next=${encodeURIComponent(`/academy/${course.id}`)}`}>Sign in</a>{' '}
                  to access your courses.
                </p>
              ) : null}
            </div>
          </section>
        ) : (
          <section className="academy-course-paywall section" id="course-content">
            <div className="container academy-course-paywall-shell">
              <header className="academy-section-head">
                <p className="section-kicker">Course content</p>
                <h2>Create your free account to unlock</h2>
                <p>
                  The video above is the introduction. The complete {lessons.length}-module course is free — create
                  your account to read it and track your progress.
                </p>
              </header>

              <ol className="academy-course-paywall-list">
                {lessons.map((lesson, index) => (
                  <li key={index} className="academy-course-paywall-item">
                    <span className="academy-course-paywall-lock" aria-hidden="true">
                      🔒
                    </span>
                    <span className="academy-course-paywall-index">
                      Module {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="academy-course-paywall-title">{lesson.title}</span>
                  </li>
                ))}
              </ol>

              <div className="academy-course-paywall-actions">
                <a
                  className="button button-accent"
                  href={`/account/sign-in?next=${encodeURIComponent(`/academy/${course.id}`)}`}
                >
                  Create free account →
                </a>
              </div>
              <p className="academy-course-paywall-signin">
                Already have an account?{' '}
                <a href={`/account/sign-in?next=${encodeURIComponent(`/academy/${course.id}`)}`}>Sign in</a>
              </p>
            </div>
          </section>
        )
      ) : null}

      {access.hasAccess && quiz ? (
        <section className="academy-assessment section" id="assessment">
          <div className="container academy-assessment-shell">
            <header className="academy-section-head academy-section-head-left">
              <p className="section-kicker">{tq.kicker}</p>
              <h2>{tq.title}</h2>
              <p>{tq.intro(quiz.questions.length, quizPassPct)}</p>
            </header>

            {!quizStarted && !quizResult ? (
              passed ? (
                <div className="academy-assessment-passed">
                  <span className="academy-assessment-passed-icon" aria-hidden="true">
                    ✓
                  </span>
                  <div className="academy-assessment-passed-copy">
                    <p className="academy-assessment-passed-title">{tq.alreadyPassedTitle}</p>
                    {quizBest ? (
                      <p className="academy-assessment-passed-sub">
                        {tq.alreadyPassedSub(
                          quizBest.score,
                          quizBest.total,
                          quizBest.total ? Math.round((quizBest.score / quizBest.total) * 100) : 0
                        )}
                      </p>
                    ) : null}
                  </div>
                  <div className="academy-assessment-passed-actions">
                    <a className="button button-light" href="/account">
                      {tq.viewCertificate}
                    </a>
                    <button type="button" className="button button-light" onClick={startQuizRetake}>
                      {tq.retake}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="academy-assessment-cta">
                  <p className="academy-assessment-note">{tq.gateNote}</p>
                  <button type="button" className="button button-accent" onClick={() => setQuizStarted(true)}>
                    {tq.start} <span aria-hidden="true">→</span>
                  </button>
                </div>
              )
            ) : null}

            {quizStarted || quizResult ? (
              <>
                <ol className="academy-assessment-list">
                  {quiz.questions.map((q, qi) => {
                    const res = quizResult?.results.find((r) => r.id === q.id);
                    const selected = quizAnswers[q.id] ?? [];
                    return (
                      <li
                        key={q.id}
                        className={`academy-assessment-q ${
                          res ? (res.isCorrect ? 'is-correct' : 'is-wrong') : ''
                        }`}
                      >
                        <p className="academy-assessment-q-prompt">
                          <span className="academy-assessment-q-num" aria-hidden="true">
                            {qi + 1}
                          </span>
                          {q.prompt}
                        </p>
                        <p className="academy-assessment-q-hint">{q.multiple ? tq.selectMany : tq.selectOne}</p>
                        <ul className="academy-assessment-options">
                          {q.options.map((opt, oi) => {
                            const checked = selected.includes(oi);
                            let optClass = '';
                            if (res) {
                              if (res.correct.includes(oi)) optClass = 'is-answer';
                              else if (res.your.includes(oi)) optClass = 'is-chosen-wrong';
                            } else if (checked) {
                              optClass = 'is-selected';
                            }
                            return (
                              <li key={oi}>
                                <label className={`academy-assessment-option ${optClass}`}>
                                  <input
                                    type={q.multiple ? 'checkbox' : 'radio'}
                                    name={q.id}
                                    checked={checked}
                                    disabled={Boolean(quizResult)}
                                    onChange={() => selectAnswer(q.id, oi, q.multiple)}
                                  />
                                  <span>{opt}</span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                        {res ? (
                          <div className="academy-assessment-explain">
                            <p>{res.explanation}</p>
                            {res.moduleRef ? (
                              <button
                                type="button"
                                className="academy-assessment-review"
                                onClick={() => reviewModule(res.moduleRef as number)}
                              >
                                {tq.reviewModule(res.moduleRef)}
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>

                {quizResult ? (
                  <div className={`academy-assessment-result ${quizResult.passed ? 'is-pass' : 'is-fail'}`}>
                    <p className="academy-assessment-result-line">
                      {quizResult.passed
                        ? tq.passLine(
                            quizResult.score,
                            quizResult.total,
                            Math.round((quizResult.score / quizResult.total) * 100)
                          )
                        : tq.failLine(
                            quizResult.score,
                            quizResult.total,
                            Math.round((quizResult.score / quizResult.total) * 100)
                          )}
                    </p>
                    <p className="academy-assessment-result-sub">
                      {quizResult.passed ? tq.passSub : tq.failSub(quizPassPct)}
                    </p>
                    <div className="academy-assessment-actions">
                      {quizResult.passed ? (
                        <a className="button button-accent" href="/account">
                          {tq.viewCertificate}
                        </a>
                      ) : null}
                      <button type="button" className="button button-light" onClick={startQuizRetake}>
                        {tq.retake}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="academy-assessment-actions">
                    {quizError ? <p className="academy-assessment-error">{quizError}</p> : null}
                    <button
                      type="button"
                      className="button button-accent"
                      onClick={submitQuiz}
                      disabled={quizSubmitting}
                    >
                      {quizSubmitting ? tq.submitting : tq.submit}
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="academy-course-siblings section">
        <div className="container">
          <header className="academy-section-head">
            <p className="section-kicker">{tone === 'premium' ? 'Other masterclasses' : 'Other free courses'}</p>
            <h2>Continue your learning path</h2>
          </header>
          <ul className="academy-course-siblings-list">
            {siblings
              .filter((s) => s.id !== course.id)
              .map((s) => (
                <li key={s.id}>
                  <a href={`/academy/${s.id}`}>
                    <span className="academy-course-siblings-arrow" aria-hidden="true">
                      →
                    </span>
                    {s.title}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </section>

      {app && playerModule !== null ? (
        <AcademyPlayer
          courseTitle={course.title}
          modules={app.modules}
          completedModules={[...completed]}
          startModule={playerModule}
          onClose={() => setPlayerModule(null)}
          onModuleComplete={completeFromPlayer}
        />
      ) : null}
      <Celebration content={celebration} onDismiss={() => setCelebration(null)} />

      <SiteFooter />
    </main>
  );
}
