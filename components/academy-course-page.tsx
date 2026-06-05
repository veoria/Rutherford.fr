'use client';

import { useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import type { AcademyCourse } from '@/data/academy-courses';
import { getLessonsForCourse } from '@/data/academy-lessons';
import type { CourseAccess } from '@/lib/entitlements';

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
};

export function AcademyCoursePage({ course, access }: Props) {
  const tone = course.tone;
  const siblings = tone === 'premium' ? PREMIUM_COURSE_LIST : FREE_COURSE_LIST;
  const lessons = getLessonsForCourse(course.id);
  const [openLesson, setOpenLesson] = useState<number>(0);
  const [checkoutLoading, setCheckoutLoading] = useState<null | 'course' | 'pass'>(null);
  const toggleLesson = (index: number) => setOpenLesson((current) => (current === index ? -1 : index));

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
              <video
                src={`${course.videoSrc}#t=0.1`}
                controls
                playsInline
                preload="metadata"
              />
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
              <ol className="academy-course-lessons-list">
                {lessons.map((lesson, index) => {
                  const isOpen = openLesson === index;
                  const headId = `lesson-head-${index}`;
                  const bodyId = `lesson-body-${index}`;
                  return (
                    <li key={index} className={`academy-course-lesson ${isOpen ? 'is-open' : ''}`}>
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
                          <span className="academy-course-lesson-step" aria-hidden="true">
                            {index + 1} / {lessons.length}
                          </span>
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

      <SiteFooter />
    </main>
  );
}
