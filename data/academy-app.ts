// Step-based micro-content for the new Academy player (Phase 1 of the UX rework).
//
// This complements — it does NOT replace — the existing data:
//   - data/academy-courses.ts  → course metadata (title, free/premium, price)
//   - data/academy-lessons.ts  → long-form reference prose
//   - data/academy-quizzes.ts  → SERVER-ONLY graded final exam (certificate)
//
// The player consumes these condensed `steps[]`. Each module is broken into a
// few steps (idea → illustration → a short formative micro-quiz). The micro-
// quiz is CLIENT-SIDE and formative: it only gates progression to the next
// step inside the player. It is intentionally separate from the anti-cheat,
// server-graded final exam in academy-quizzes.ts, which still drives the
// certificate. So keeping the micro-quiz answer index here is by design.
//
// `module.index` is 0-based and matches course_progress.lesson_index, so
// finishing a module's steps marks it complete via POST /api/account/progress
// and unlocks the next module.
//
// Illustrations live in public/academy/illustrations/ and are referenced here
// by bare filename; the player prefixes `/academy/illustrations/`.
//
// Paragraph strings may contain inline <b>/<i> and the entities &lt; / &gt;;
// the player renders them as trusted, controlled rich text.

export type StepQuiz = {
  q: string;
  options: string[];
  /** Index into `options` of the correct choice (formative, client-side). */
  answer: number;
  /** Feedback shown after a correct / incorrect pick. */
  ok: string;
  no: string;
};

export type AppStep = {
  /** Short kicker, e.g. 'Step 1 · The problem'. */
  kicker: string;
  headline: string;
  /** Paragraphs; may contain inline <b>/<i> and &lt;/&gt; entities. */
  paragraphs: string[];
  /** Illustration filename in public/academy/illustrations/, if any. */
  illustration?: string;
  /** Product-capture placeholder caption (see docs Captures-Requises.md), if any. */
  capture?: string;
  /** Optional formative micro-quiz gating progression to the next step. */
  quiz?: StepQuiz;
};

export type AppModule = {
  /** 0-based; matches course_progress.lesson_index. */
  index: number;
  /** Display number, e.g. '01'. */
  num: string;
  title: string;
  time: string;
  summary: string;
  steps: AppStep[];
};

export type CourseApp = {
  /** Matches AcademyCourse.id in data/academy-courses.ts. */
  courseId: string;
  modules: AppModule[];
};

// Phase 1 ships `fundamentals` end-to-end to validate the player pipeline.
// Courses 2–9 are transcribed in a later phase once this is signed off.
export const COURSE_APP: Record<string, CourseApp> = {
  fundamentals: {
    courseId: 'fundamentals',
    modules: [
      {
        index: 0,
        num: '01',
        title: 'What "good color" actually means on a press',
        time: '9 min',
        summary: 'From subjective approval to measurable consistency.',
        steps: [
          {
            kicker: 'Step 1 · The problem',
            headline: '"Is this OK?" — the most expensive judgment call',
            paragraphs: [
              `Walk through almost any pressroom and you will hear the same conversation: <b>"Is this OK?"</b>. An operator looks at the sheet, glances at the proof, and decides. That decision changes every time the operator changes — and on a press with three shifts and a dozen brand owners, it guarantees variance. Your customers find it before you do, and push the cost back as rejected pallets, audits and lost contracts.`,
            ],
            illustration: 'ill-variance.svg',
            quiz: {
              q: 'Same job, same press: night shift passes the sheet, day shift rejects it. What is actually broken?',
              options: [
                'The day-shift operator is too picky',
                'The pass/fail decision depends on the person, not on data',
                'The press drifted overnight — it always does',
              ],
              answer: 1,
              ok: 'Exactly — the variance source is the decision itself, not the people making it.',
              no: 'Three verdicts on the same sheet: the problem is the decision method.',
            },
          },
          {
            kicker: 'Step 2 · The fix',
            headline: 'Target. Tolerance. Measurement.',
            paragraphs: [
              `A workable definition of good color has three parts. It is anchored to a <b>target</b> — a fingerprint or brand reference in CIELAB or spectral values. It carries a <b>tolerance</b> — a ΔE budget that says "anything inside passes". And it is <b>verified by a measurement device</b>, not an eye. Three parts, no opinions.`,
            ],
            illustration: 'ill-definition.svg',
            quiz: {
              q: 'The most defensible definition of "good color" on a production press is:',
              options: [
                'Whatever the operator on shift approves by eye',
                'A measured match to a target, within a defined ΔE tolerance, verified by a device',
                'The densest sheet the press can produce',
              ],
              answer: 1,
              ok: `That's the whole course in one line — target + tolerance + measurement.`,
              no: 'Look for the answer with all three parts: target, tolerance, device.',
            },
          },
          {
            kicker: 'Step 3 · The payoff',
            headline: 'Defend it. Audit it. Repeat it. Improve it.',
            paragraphs: [
              `The cost of moving from "operator approves" to "device measures" is small. The benefit: every verdict is the same on every shift, and every sheet leaves a record — job ID, operator, timestamp, ΔE. When a brand owner challenges a delivery, the conversation becomes factual instead of rhetorical.`,
            ],
            illustration: 'ill-payoff.svg',
            quiz: {
              q: 'A brand owner challenges a delivery from last March. With a measured workflow, you…',
              options: [
                'Ask the operator if he remembers the job',
                'Pull the measurement record for that job ID and settle it with data',
                'Offer a discount to avoid the discussion',
              ],
              answer: 1,
              ok: `Module validated — that data trail is what you'll build in the MeasureColor courses.`,
              no: 'The whole point of measuring: the record exists. Settle it with data.',
            },
          },
        ],
      },
      {
        index: 1,
        num: '02',
        title: 'ISO 12647 in 10 minutes',
        time: '10 min',
        summary: 'The standard your brand owners assume you follow.',
        steps: [
          {
            kicker: 'Step 1 · The standard',
            headline: 'One family, one part per process',
            paragraphs: [
              `ISO 12647 is the family of process control standards for printing — the part you care about is <b>12647-2: sheetfed offset</b>, the document brand owners cite in packaging specs. It defines <b>substrate classes</b> (PS1–PS8 in the 2013 edition; legacy contracts still say PT1–PT5), target <b>TVI curves</b>, and <b>CIELAB aim points</b> per class.`,
            ],
            illustration: 'ill-iso-family.svg',
            quiz: {
              q: 'ISO 12647-2 — the part brand owners cite for offset packaging — defines:',
              options: [
                'Anilox volumes for flexo',
                'Substrate classes (PS1–PS8), TVI curves and CIELAB aim points',
                'Screening angles for digital toner',
              ],
              answer: 1,
              ok: 'Right — substrate classes, TVI and aims, per class.',
              no: `It's the offset part: substrate classes, TVI curves, CIELAB aims.`,
            },
          },
          {
            kicker: 'Step 2 · How to use it',
            headline: 'ISO is the floor, not the destination',
            paragraphs: [
              `You don't need to memorize the tables — you need your fingerprints tied to them, and any deviation to be deliberate. The common mistake is treating ISO as the target: the standard sets the <b>floor</b>, brand specs sit tighter, and your production target should sit tighter still, to buffer drift and instrument differences.`,
            ],
            illustration: 'ill-floor.svg',
            quiz: {
              q: 'Your contract says ΔE00 < 2.0 and ISO would allow more. Where should your production target sit?',
              options: [
                `At the ISO tolerance — it's the official standard`,
                'Exactly at 2.0 — why do better than the contract?',
                'Tighter than 2.0 — the buffer absorbs drift and instrument gaps',
              ],
              answer: 2,
              ok: 'Module validated — plan for the floor, aim higher.',
              no: 'Aim tighter than the contract: drift and instrument gaps will eat the margin.',
            },
          },
        ],
      },
      {
        index: 2,
        num: '03',
        title: 'M0, M1, M3: measurement conditions',
        time: '9 min',
        summary: 'Same sheet, different illuminant, different number.',
        steps: [
          {
            kicker: 'Step 1 · Why conditions exist',
            headline: 'Same sheet, different number',
            paragraphs: [
              `Every spectro reads under a defined illuminant — and most modern papers contain <b>optical brighteners (OBAs)</b> that fluoresce under UV. <b>M1</b> (D50 + UV included) is the modern default: it reads the sheet the way your customer's booth shows it. <b>M0</b> is legacy tungsten; <b>M2</b> (UV-cut) is mainly a diagnostic — the M1−M2 gap on paper white <i>is</i> the OBA signature.`,
            ],
            illustration: 'ill-oba.svg',
            quiz: {
              q: `Your handheld and the brand owner's lab disagree on the same sheet. What do you check first?`,
              options: [
                'The ink batch — it must have drifted',
                'The measurement condition (M0 vs M1) on both instruments',
                'Nothing — labs are always right',
              ],
              answer: 1,
              ok: 'Exactly — mismatched conditions create phantom drift.',
              no: 'Same condition on both sides? M0 vs M1 alone can explain the gap.',
            },
          },
          {
            kicker: 'Step 2 · The rule that matters',
            headline: 'M3 is a density tool — never for G7',
            paragraphs: [
              `<b>M3 is polarized</b>: it strips surface gloss, so wet ink reads closer to dry — a press-side <b>density</b> tool. The critical rule: <b>never use M3 for G7 calibration or any ΔE check against ISO / GRACoL / FOGRA aims</b> — those datasets are measured unpolarized (G7 requires ISO 13655 M1). M3 to dose the ink; M1 to judge the color.`,
            ],
            illustration: 'm-conditions.svg',
            quiz: {
              q: `You're running a G7 calibration. Which measurement condition?`,
              options: [
                'M3 — polarized, it removes gloss',
                'M1 — D50 + UV, no polarizer',
                `Either — they're interchangeable`,
              ],
              answer: 1,
              ok: 'Module validated — G7 is unpolarized M1.',
              no: 'Never M3 for G7 — the reference data is unpolarized.',
            },
          },
        ],
      },
      {
        index: 3,
        num: '04',
        title: 'ΔE, ΔE00, density: what to trust',
        time: '9 min',
        summary: 'Three numbers, three different jobs.',
        steps: [
          {
            kicker: 'Step 1 · Two languages',
            headline: 'Density moves keys. ΔE00 judges contracts.',
            paragraphs: [
              `<b>Density</b> reads one channel at a time and responds directly to the ink key: high → less ink, low → more. It is the press-floor language. <b>ΔE00</b> is the perceptual difference vs the target — the metric brand owners write into contracts (a tight spec: ΔE00 &lt; 2 on solids; a trained eye spots ≈1–2 side-by-side).`,
            ],
            illustration: 'ill-density-de.svg',
            quiz: {
              q: 'Why do operators work in density while brand specs are written in ΔE00?',
              options: [
                'Density is more modern than ΔE00',
                'Density responds directly to ink-key movement; ΔE00 correlates with what the eye perceives',
                'They are the same measurement under two names',
              ],
              answer: 1,
              ok: 'Right — two languages, two different jobs.',
              no: 'Density drives the keys, ΔE00 judges the color.',
            },
          },
          {
            kicker: 'Step 2 · The bridge',
            headline: 'Closed-loop is the translator',
            paragraphs: [
              `On press, the operator works in density because density responds to the keys. The quality system works in ΔE00 because that's what the contract says. The bridge is what closed-loop automates: <b>read ΔE00 vs target → decide which densities move → adjust the keys</b> — the same way every time, with a data trail.`,
            ],
            illustration: 'closed-loop.svg',
            quiz: {
              q: 'In the loop, what exactly does the decision layer do?',
              options: [
                'It approves the sheet by eye, but faster',
                'It compares ΔE00 to the target and translates the gap into ink-key (density) moves',
                'It replaces the press console entirely',
              ],
              answer: 1,
              ok: 'Module validated — ΔE00 in, density moves out.',
              no: 'Measure ΔE00 vs target → decide density moves → actuate.',
            },
          },
        ],
      },
      {
        index: 4,
        num: '05',
        title: 'G7, GRACoL, FOGRA',
        time: '8 min',
        summary: 'Three names you will hear, one shared goal.',
        steps: [
          {
            kicker: 'Step 1 · The G7 idea',
            headline: 'Neutralize the grays, the gamut follows',
            paragraphs: [
              `<b>G7</b> is a calibration methodology (Idealliance). Its anchor is <b>gray balance</b>: if the CMY grays neutralize and the neutral print density curve matches target, the rest of the gamut follows. Process-agnostic — offset, flexo, digital — and gray balance is the most <i>visible</i> failure mode, which is why it makes such a strong anchor.`,
            ],
            illustration: 'ill-gray-balance.svg',
            quiz: {
              q: 'What is the anchor of the G7 calibration methodology?',
              options: [
                'Maximum solid ink density',
                'Gray balance and the neutral print density curve',
                `The brand owner's PANTONE book`,
              ],
              answer: 1,
              ok: 'Correct — neutralize the grays and the gamut follows.',
              no: 'G7 is anchored on gray balance.',
            },
          },
          {
            kicker: 'Step 2 · The landscape',
            headline: `Pick one. Document it. Don't switch mid-project.`,
            paragraphs: [
              `<b>GRACoL 2013</b> (CGATS.21) is the US characterization for premium sheetfed offset, usually paired with G7. <b>FOGRA</b> datasets (39, 51, 52, 55) characterize European conditions conforming to ISO 12647-2. Both are valid. What matters most is that you <i>have</i> one, documented and trained — not which one.`,
            ],
            illustration: 'ill-standards-map.svg',
            quiz: {
              q: 'Mid-project, a colleague suggests switching from FOGRA51 aims to GRACoL "because the press looks closer". You…',
              options: [
                'Switch — closer is better',
                'Refuse: changing methodology mid-project breaks the customer reference and their trust',
                'Average the two target sets',
              ],
              answer: 1,
              ok: 'Course complete 🎓 — you speak pressroom color now.',
              no: 'Never switch mid-project — finish on the approved reference.',
            },
          },
        ],
      },
    ],
  },
};

export function getCourseApp(slug: string): CourseApp | undefined {
  return COURSE_APP[slug];
}
