import type { AppModule } from '@/data/academy-app';

// Where Color Hurts: From Makeready to Saleable Sheet — step content.
// Condensed from data/academy-lessons.ts (post-#23 corrections).
const modules: AppModule[] = [
  {
    index: 0,
    num: '01',
    title: 'Anatomy of a makeready: 800 sheets, 120 minutes, €450 on the floor',
    time: '8 min',
    summary: 'The cost stack of one makeready, multiplied by your year.',
    steps: [
      {
        kicker: 'Step 1 · The cost stack',
        headline: 'One makeready, added up honestly',
        paragraphs: [
          `Take a B1 6-color sheetfed press on premium coated 250 g/m² at €1 200/tonne. A B1 sheet (0.707 m²) weighs ≈177 g — about <b>€0.21</b> a sheet. An 800-sheet makeready to first good copy is ≈<b>€170 in paper</b> alone.`,
          `Add press time: a loaded B1 6-color costs ≈<b>€150/h</b>, so a 120-minute makeready burns <b>€300</b> — and the press isn't earning while it's set up. Add blanket washes, ink mileage and energy, and <b>€450–€500 per makeready</b> is conservative.`,
        ],
        illustration: 'makeready-cost.svg',
      },
      {
        kicker: 'Step 2 · Multiply by the year',
        headline: 'The number that walks off the floor',
        paragraphs: [
          `Three makereadies a day, five days a week, 45 weeks = 675 makereadies a year. At €450 each, that's <b>≈€303 750 per year — per press</b> — as paper waste, ink waste and unbilled press time. For a 3-press shop, triple it.`,
          `Closed-loop color management cuts both the sheet count and the time, typically by <b>30–55 %</b> in real installations. The math does the rest.`,
        ],
        quiz: {
          q: 'A 120-minute, 800-sheet makeready costs ≈€450. Across 675 makereadies a year, that is roughly…',
          options: ['≈€30,000 — a rounding error', '≈€300,000 per press per year', '≈€3M per press per year'],
          answer: 1,
          ok: 'Right — ≈€303,750 per press per year. Closed-loop targets 30–55 % of it.',
          no: '675 × €450 ≈ €300,000 per press per year — that\'s the prize.',
        },
      },
    ],
  },
  {
    index: 1,
    num: '02',
    title: 'The "good copy" myth',
    time: '7 min',
    summary: 'Why subjective approval is the silent margin killer.',
    steps: [
      {
        kicker: 'Step 1 · The variance',
        headline: '"Good" = the moment an operator says so',
        paragraphs: [
          `On most presses, a job becomes "good" the moment an operator decides it is — and that decision varies by operator, shift, mood, and what's next in the queue. None of those variables are written into the brand-owner spec.`,
          `You can see it in the data: two operators, same job, same press, consecutive days. The faster one passes a sheet at ΔE00 = 3.2; the cautious one next shift won't pass until 1.8. Both may be in tolerance — but the slower path burned extra paper and time.`,
        ],
        illustration: 'ill-variance.svg',
      },
      {
        kicker: 'Step 2 · The compounding cost',
        headline: 'Take the verdict out of the operator\'s head',
        paragraphs: [
          `It compounds the other way too: a fast operator passing 3.2 against a 2.5 tolerance pushes borderline jobs through. Three months later the brand owner aggregates your deliveries and asks why your average sits above spec. That conversation costs contracts.`,
          `The fix isn't to slow everyone down — it's to move the pass/fail decision from judgment to measurement (closed-loop, or a strip reader feeding a console): same target, same tolerance, same data trail, every time. The operator still runs the press; they just stop being the color-decision variance.`,
        ],
        quiz: {
          q: 'Two shifts, same job: one passes at ΔE00 3.2, the next won\'t pass above 1.8. The root problem is…',
          options: [
            'One operator is simply wrong',
            'The pass/fail decision is subjective — not anchored to a measured target and tolerance',
            'The press is mechanically unstable',
          ],
          answer: 1,
          ok: 'Right — anchor pass/fail to a measured target + tolerance and the variance disappears.',
          no: 'Same job, two verdicts → the decision method is subjective. Anchor it to measurement.',
        },
      },
    ],
  },
  {
    index: 2,
    num: '03',
    title: 'Drift, contamination, fountain solution, paper batch',
    time: '8 min',
    summary: 'The four silent killers of color stability.',
    steps: [
      {
        kicker: 'Step 1 · The four killers',
        headline: 'None of them are visible sheet-to-sheet',
        paragraphs: [
          `<b>Drift</b>: slow movement over the run — fountains warm, blankets compress, paper takes up humidity, plates wear. Invisible sheet-to-sheet, but cyan can move 0.3 D over 10 000 sheets. <b>Contamination</b>: blanket residue, fountain carryover, paper dust, dried ink — each event shifts color. A clean press is a stable press.`,
          `<b>Fountain solution</b>: conductivity, pH, alcohol and temperature change how ink transfers and dries — check it only on Mondays and Fridays will look different. <b>Paper batch</b>: same grade, different gloss/absorption/OBA loading; your profile was built on the average, so an outlier batch prints out of spec on a perfect press.`,
        ],
        illustration: 'ill-killers.svg',
      },
      {
        kicker: 'Step 2 · What the loop can and can\'t do',
        headline: 'Correct drift; diagnose the rest',
        paragraphs: [
          `A closed-loop system catches <b>drift</b> in real time because it measures every (or every Nth) sheet against target. It <i>cannot</i> fix contamination — a wash-up is still needed — but it detects the onset and alerts the operator.`,
          `Fountain and paper variability aren't fixed by the color system either, but they're far easier to diagnose once it separates "an ink-key move fixes this" from "something else is going on".`,
        ],
        quiz: {
          q: 'Which of the four can a closed-loop system actually correct on its own?',
          options: ['Contamination', 'Slow ink drift over the run, via continuous ink-key correction', 'A bad paper batch'],
          answer: 1,
          ok: 'Right — it corrects drift. Contamination, fountain and paper it can flag, but the fix is physical.',
          no: 'It corrects drift; the others it detects and alerts on, but can\'t fix (wash-up, chemistry, substrate).',
        },
      },
    ],
  },
  {
    index: 3,
    num: '04',
    title: 'Self-financed automation',
    time: '7 min',
    summary: 'The capital case in three numbers.',
    steps: [
      {
        kicker: 'Step 1 · Three returns',
        headline: 'Paper saved, press time recovered, rejects reduced',
        paragraphs: [
          `A closed-loop system costs a fraction of the press it sits on, and the case rests on three measurable returns. <b>Paper</b>: a 55 % cut on an 800-sheet makeready saves 440 sheets — ≈297 000 sheets and <b>≈€63 000 per press per year</b> at €0.21 a sheet.`,
          `<b>Press time</b>: a 38 % cut on a 120-minute makeready saves 46 minutes — 513 hours a year, <b>≈€77 000</b> of recovered capacity at €150/h (you take on more work without buying another press).`,
        ],
        illustration: 'ill-autonomy.svg',
      },
      {
        kicker: 'Step 2 · Payback',
        headline: '9 to 18 months, before the contract effects',
        paragraphs: [
          `The third return is <b>reject reduction</b>: closed-loop produces audit-ready data trails, so "here is the measurement record" replaces "we think it was fine". Rejects fall, audit risk falls, renewals go smoother.`,
          `A typical installation pays for itself in <b>9 to 18 months</b> on a single press — and that's conservative, counting only paper and press time, ignoring the contract value of being a measurably consistent supplier.`,
        ],
        quiz: {
          q: 'The capital case for closed-loop rests on three measurable returns. Which trio?',
          options: [
            'Faster RIP, cheaper plates, less ink mixing',
            'Paper saved, press time recovered, reject/audit reduction',
            'Lower energy, fewer operators, less floor space',
          ],
          answer: 1,
          ok: 'Right — paper saved + recovered press time + reject reduction. Typical payback 9–18 months.',
          no: 'It\'s paper saved, press time recovered, and reject reduction.',
        },
      },
    ],
  },
];

export default modules;
