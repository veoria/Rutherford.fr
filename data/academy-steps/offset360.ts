import type { AppModule } from '@/data/academy-app';

// Offset360 in Practice: Rutherford + IntelliTrax2 + MeasureColor — step content.
// Condensed from data/academy-lessons.ts (post-#23 corrections).
const modules: AppModule[] = [
  {
    index: 0,
    num: '01',
    title: 'The Offset360 architecture: what each component does',
    time: '12 min',
    summary: 'Three layers, one outcome.',
    steps: [
      {
        kicker: 'Step 1 · Three layers',
        headline: 'A bundle, not a single product',
        paragraphs: [
          `Offset360 is not a catalog product — it's a solution bundle X-Rite assembles from three independent technologies. The first layer is <b>Rutherford closed-loop control</b>: ink-key actuation, decision logic, operator console. The second is <b>IntelliTrax2 automated scanning</b>: the measurement that feeds the loop. The third is <b>MeasureColor Production and Reports</b>: the software backbone for quality capture, storage and reporting.`,
        ],
        illustration: 'ill-offset360.svg',
      },
      {
        kicker: 'Step 2 · Bundle vs bespoke',
        headline: 'Integration bought, choice traded',
        paragraphs: [
          `The three layers are independently capable — you can buy IntelliTrax2 without Offset360, MeasureColor without IntelliTrax2, or Rutherford closed-loop with a different device. Offset360 is the configuration where all three are sourced together and <b>pre-integrated</b>: faster install, cleaner data flow, and one support number instead of three. The trade-off is choice — a bespoke stack is more flexible but needs more integration work. For most packaging and commercial offset, the bundle is the right call.`,
        ],
        quiz: {
          q: 'What is Offset360, precisely?',
          options: [
            'A single new measurement device',
            'A pre-integrated bundle of three independent layers — Rutherford closed-loop, IntelliTrax2 scanning, MeasureColor Production + Reports',
            'A cloud subscription service',
          ],
          answer: 1,
          ok: 'Right — three independently-capable layers, sourced together and pre-integrated (one support number).',
          no: "It's a bundle of three independent layers (Rutherford + IntelliTrax2 + MeasureColor), pre-integrated.",
        },
      },
    ],
  },
  {
    index: 1,
    num: '02',
    title: 'Wiring the three systems together',
    time: '12 min',
    summary: 'The integration topology, link by link.',
    steps: [
      {
        kicker: 'Step 1 · The topology',
        headline: 'Scanner → controller → MeasureColor → Rutherford → console',
        paragraphs: [
          `IntelliTrax2 sits press-side on its track; the operator pulls a sheet onto it for the read. It connects via Ethernet to a controller PC that hosts or networks to MeasureColor Production; data flows scanner → controller → MeasureColor in under a second per sheet. MeasureColor runs on a Windows workstation near the operator, its SQL database local (the Offset360 norm) or central.`,
          `Rutherford's console connects to MeasureColor via a documented API: MeasureColor pushes each measurement, Rutherford computes the ink-key corrections and pushes them to the OEM console (Prinect, LogoTronic, PDC, Pecom).`,
        ],
        illustration: 'ill-dataflow.svg',
      },
      {
        kicker: 'Step 2 · The boring plumbing',
        headline: 'NTP everything to one clock',
        paragraphs: [
          `Network segmentation matters: the OEM console usually sits on a dedicated industrial VLAN, the measurement workstation on the office VLAN. And time synchronization is non-trivial — all three layers need consistent timestamps for the data trail to make sense, so run NTP against the same source. It sounds boring; it is the single most common source of "weird data" complaints in multi-system installations.`,
        ],
        quiz: {
          q: "The single most common source of 'weird data' complaints in a multi-system Offset360 install is…",
          options: [
            'Slow Ethernet',
            'Inconsistent clocks — run NTP on all three layers against the same time source',
            'Too many color bars on the sheet',
          ],
          answer: 1,
          ok: 'Right — without consistent timestamps the data trail stops making sense; NTP everything to one source.',
          no: "It's time synchronization — run NTP on all systems against one source for a coherent data trail.",
        },
      },
    ],
  },
  {
    index: 2,
    num: '03',
    title: 'End-to-end job flow: prepress to report',
    time: '12 min',
    summary: 'One job, five stages, one data trail.',
    steps: [
      {
        kicker: 'Step 1 · Prepress → setup → measure',
        headline: 'The first sheet is decided in prepress',
        paragraphs: [
          `<b>Prepress</b> (stage 0): the job is imposed, separated and ripped, producing plates plus a CIP3 PPF (or CIP4 JDF) with dot coverage per zone per separation. <b>Setup</b> (stage 1): the CIP3 file imports into the console; Rutherford applies learned offsets to refine the positions; the operator loads plates and inks and calls up the MeasureColor template. <b>Measure</b> (stage 2): the press starts, the operator pulls sheets at intervals across IntelliTrax2, and seconds later there is ΔE00 per ink per zone.`,
        ],
        illustration: 'ill-jobflow.svg',
      },
      {
        kicker: 'Step 2 · Correct → report',
        headline: 'One data trail across all five stages',
        paragraphs: [
          `<b>Correct</b> (stage 3): the measurement flows to Rutherford, which computes the next ink-key adjustment and sends it to the OEM console before the next pull; ΔE00 converges. <b>Report</b> (stage 4): at job end MeasureColor aggregates sheets measured, in/out of tolerance, operator ID and duration — a PDF goes to the customer with the delivery, a PQX into the Reports archive. The job has one continuous data trail across all five stages, which is what makes audits painless and ROI computable.`,
        ],
        quiz: {
          q: 'What makes Offset360 audits painless and ROI calculable?',
          options: [
            'More operators per shift',
            'One continuous data trail across all five stages (prepress → setup → measure → correct → report)',
            'Faster plate-making',
          ],
          answer: 1,
          ok: 'Right — one job, one data trail across five stages: factual audits, computable ROI.',
          no: "It's the single continuous data trail across all five stages that makes audits and ROI possible.",
        },
      },
    ],
  },
  {
    index: 3,
    num: '04',
    title: 'Real-world ROI: calage, gâche, brand reports',
    time: '12 min',
    summary: 'Three named benefits, with the math behind each.',
    steps: [
      {
        kicker: 'Step 1 · Time & paper',
        headline: 'Recovered press time and saved paper',
        paragraphs: [
          `<b>Makeready time</b> is the most measurable benefit: a B1 6-color averaging 120 minutes typically drops to 75–85. At 3 makereadies/day, 225 production days (675/year) and €150/h, a 40-minute saving is worth ≈<b>€67,500 per press per year</b> in recovered press time. <b>Paper waste</b>: sheet count drops from ~800 to ~350–450; at ≈€0.21/sheet and 675 makereadies, a 400-sheet saving is worth ≈<b>€57,000 per press per year</b>.`,
        ],
        illustration: 'makeready-cost.svg',
      },
      {
        kicker: 'Step 2 · Brand reports & payback',
        headline: '9 to 18 months, before contract effects',
        paragraphs: [
          `The third benefit, <b>brand-owner reporting</b>, is hardest to quantify but real: a supplier delivering PDF/PQX reports on schedule with audit-grade trails has fewer renegotiations, lower audit risk and longer relationships — one avoided contract loss can exceed the entire system payback. Real installations report <b>9–18 months</b> payback on a single B1 press before contract effects. The documented case studies — Avery Dennison Queretaro, WestRock MPS, Moderna Printing, LEFRANCQ Packaging — use conservative, reproducible numbers.`,
        ],
        quiz: {
          q: 'Across real Offset360 installs, typical payback on a single B1 press (before contract-retention effects) is…',
          options: [
            '3–5 years',
            '9–18 months, from recovered press time + paper savings alone',
            'Immediate, within the first week',
          ],
          answer: 1,
          ok: 'Right — 9–18 months on paper + press time alone; brand-report and contract effects are upside on top.',
          no: '9–18 months on a single press, from press time + paper. The contract effects are conservative upside.',
        },
      },
    ],
  },
  {
    index: 4,
    num: '05',
    title: 'Common implementation pitfalls and how to avoid them',
    time: '12 min',
    summary: 'The mistakes that turn an install into a slog.',
    steps: [
      {
        kicker: 'Step 1 · Pitfalls 1–3',
        headline: 'Prepress alignment, training, the press baseline',
        paragraphs: [
          `<b>1 — Skipping prepress alignment</b>: CIP3 files must match the press ink-zone layout; a mismatch (wrong sheet size, wrong gripper margin) defeats the whole presetting layer — audit the prepress-to-press handoff in week one. <b>2 — Under-investing in training</b>: operators who don't understand the system override it and erode the value; budget a full week per shift, with shift leads going deeper as in-house experts. <b>3 — Ignoring the press maintenance baseline</b>: closed-loop compensates for some variability but cannot fix a misaligned press, a worn blanket or contaminated dampening — sort the mechanicals first, or the loop is the canary, not the cure.`,
        ],
      },
      {
        kicker: 'Step 2 · Pitfalls 4–5',
        headline: 'The brand-owner conversation, and ongoing service',
        paragraphs: [
          `<b>4 — Rushing the brand-owner conversation</b>: bring customers in early ("we're installing Offset360 in Q2; your jobs will be measured under M1; PQX reports start in Q3") — a surprised brand owner is a defensive one. <b>5 — Under-budgeting ongoing service</b>: recertification, calibration and occasional adapter swaps are non-trivial in a multi-vendor system — negotiate it upfront and treat it as a fixed cost like press maintenance, not a deferrable variable.`,
        ],
        quiz: {
          q: 'A closed-loop / Offset360 system is installed on a press with a worn blanket and contaminated dampening. What happens?',
          options: [
            'The system fixes the mechanical problems automatically',
            "It can't fix mechanicals — it becomes the canary, not the cure; sort the press baseline before installing",
            'Color is unaffected by mechanical condition',
          ],
          answer: 1,
          ok: "Right — closed-loop compensates for some variability but can't fix mechanics. Fix the baseline first.",
          no: "It can't fix mechanical faults — it flags them (canary), not cures them. Sort mechanicals before install.",
        },
      },
    ],
  },
];

export default modules;
