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
};

export function AcademyCoursePage({ course, access, videoUrl, completedLessons = [] }: Props) {
  const { locale } = useLanguage();
  const tp = PROGRESS_COPY[locale];
  const tone = course.tone;
  const siblings = tone === 'premium' ? PREMIUM_COURSE_LIST : FREE_COURSE_LIST;
  const lessons = getLessonsForCourse(course.id);
  const totalModules = lessons?.length ?? 0;
  const [openLesson, setOpenLesson] = useState<number>(0);
  const [checkoutLoading, setCheckoutLoading] = useState<null | 'course' | 'pass'>(null);
  const [completed, setCompleted] = useState<Set<number>>(() => new Set(completedLessons));
  const [celebration, setCelebration] = useState<CelebrationContent | null>(null);
  const celebrationSeq = useRef(0);
  const toggleLesson = (index: number) => setOpenLesson((current) => (current === index ? -1 : index));
  const coursePct = coursePercent({ completedCount: completed.size, total: totalModules });

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

      <Celebration content={celebration} onDismiss={() => setCelebration(null)} />

      <SiteFooter />
    </main>
  );
}
