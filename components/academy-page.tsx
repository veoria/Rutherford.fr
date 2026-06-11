'use client';

import { AcademyFreeVideos } from '@/components/academy-free-videos';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { FREE_COURSES, PREMIUM_COURSES, type AcademyCourse } from '@/data/academy-courses';

const WHY_POINTS = [
  { value: '25+', label: 'years of pressroom experience' },
  { value: '1 000+', label: 'deployed systems' },
  { value: '30+', label: 'countries' },
  { value: 'X-Rite', label: 'PANTONE partner' },
];

function CourseCard({ course }: { course: AcademyCourse }) {
  const tone = course.tone;
  return (
    <article className={`academy-card academy-card-${tone} ${course.flagship ? 'is-flagship' : ''}`}>
      {course.flagship ? <span className="academy-card-flag">Flagship masterclass</span> : null}
      <header className="academy-card-head">
        <p className="academy-card-meta">
          <span>{course.duration}</span>
          <span aria-hidden="true">·</span>
          <span>{course.modules} modules</span>
        </p>
        <h3 className="academy-card-title">
          <a href={`/academy/${course.id}`}>{course.title}</a>
        </h3>
        <p className="academy-card-desc">{course.description}</p>
      </header>

      <ol className="academy-card-syllabus">
        {course.syllabus.map((item, index) => (
          <li key={index}>
            <span className="academy-card-index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>

      <footer className="academy-card-foot">
        {course.certificate ? (
          <p className="academy-card-cert">
            <span aria-hidden="true">●</span> Certificate: <strong>{course.certificate}</strong>
          </p>
        ) : null}
        <div className="academy-card-cta-row">
          {course.price ? (
            <span className="academy-card-price">{course.price}</span>
          ) : (
            <span className="academy-card-price-free">Free</span>
          )}
          <a
            className={`button ${tone === 'premium' ? 'button-accent' : 'button-dark'} academy-card-cta`}
            href={`/academy/${course.id}`}
          >
            {tone === 'premium' ? 'Watch & enroll' : 'Watch course'} <span aria-hidden="true">→</span>
          </a>
        </div>
      </footer>
    </article>
  );
}

export function AcademyPage() {
  return (
    <main className="page-shell" id="top">
      <SiteNav current="academy" />

      <figure className="academy-hero-banner">
        <img
          src="/images/academy/hero.jpg"
          alt="Rutherford team training on a press console"
          loading="eager"
        />
      </figure>

      <section className="academy-hero section">
        <div className="container academy-hero-shell">
          <h1 className="academy-hero-title">Rutherford&rsquo;s Academy 🎓</h1>
          <p className="academy-hero-lead">
            Offset color management, taught by people who run pressrooms.
          </p>
          <p className="academy-hero-sub">
            Online courses and masterclasses on closed-loop color, MeasureColor, IntelliTrax2 and ColorLoop: built by
            Rutherford for offset printers, packaging converters and brand owners. 25+ years of pressroom experience,
            distilled into structured curricula.
          </p>
          <div className="academy-hero-actions">
            <a className="button button-accent" href="#premium">
              Browse masterclasses
            </a>
            <a className="button button-light" href="#free">
              Start with a free course
            </a>
          </div>
        </div>
      </section>

      <AcademyFreeVideos />

      <section className="academy-section section" id="free">
        <div className="container">
          <header className="academy-section-head">
            <p className="section-kicker">Free introductory courses</p>
            <h2>Get the fundamentals right: at no cost</h2>
            <p>Three short courses to build the shared vocabulary every press team needs before tackling closed-loop.</p>
          </header>
          <div className="academy-grid academy-grid-free">
            {FREE_COURSES.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      <section className="academy-section academy-section-premium section" id="premium">
        <div className="container">
          <header className="academy-section-head">
            <p className="section-kicker">Premium masterclasses</p>
            <h2>Deep dives, certificates, real production wins</h2>
            <p>Six masterclasses covering the Rutherford / X-Rite / MeasureColor stack end to end.</p>
          </header>
          <div className="academy-grid academy-grid-premium">
            {PREMIUM_COURSES.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      <section className="academy-bundle section" id="bundle">
        <div className="container academy-bundle-shell">
          <div className="academy-bundle-copy">
            <p className="section-kicker">Bundle</p>
            <h2>Rutherford Academy Pass</h2>
            <p className="academy-bundle-sub">All six premium masterclasses, lifetime access, six certificates, private Q&amp;A community, quarterly live sessions with Rutherford engineers.</p>
            <ul className="academy-bundle-list">
              <li>38 modules · ~510 minutes of content</li>
              <li>6 certificates of expertise</li>
              <li>Lifetime access &amp; updates</li>
              <li>Private Q&amp;A community</li>
              <li>Quarterly live sessions with Rutherford engineers</li>
            </ul>
          </div>
          <aside className="academy-bundle-price">
            <p className="academy-bundle-price-old">Was €725</p>
            <p className="academy-bundle-price-new">€399</p>
            <p className="academy-bundle-price-promo">
              <strong>€349</strong> with code <code>EARLYBIRD50</code>
              <br />
              <span>First 50 enrollments</span>
            </p>
            <a className="button button-accent academy-bundle-cta" href="mailto:contact@rutherford.fr?subject=Rutherford%20Academy%20Pass">
              Get the Pass <span aria-hidden="true">→</span>
            </a>
          </aside>
        </div>
      </section>

      <section className="academy-why section">
        <div className="container academy-why-shell">
          <header className="academy-section-head">
            <p className="section-kicker">Why learn with us</p>
            <h2>Built from real pressroom experience</h2>
          </header>
          <dl className="academy-why-grid">
            {WHY_POINTS.map((point) => (
              <div className="academy-why-stat" key={point.label}>
                <dt>{point.value}</dt>
                <dd>{point.label}</dd>
              </div>
            ))}
          </dl>
          <p className="academy-why-foot">
            Rutherford has been pioneering closed-loop color control on offset presses since the 90s, with 1 000+ systems deployed across 30+ countries. We co-developed MeasureColor with ColorWare and continue to integrate with X-Rite PANTONE measurement tools.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
