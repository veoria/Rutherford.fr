import type { AppModule } from '@/data/academy-app';

// The Complete Closed-Loop Color Masterclass — step content.
// Condensed from data/academy-lessons.ts (post-#23 corrections). EasySet/
// EasyLoop is the operator-driven presetting/learning line; fully automatic
// learning is the ColorLoop layer (its own course).
const modules: AppModule[] = [
  {
    index: 0,
    num: '01',
    title: 'The closed-loop concept: sensor, decision, actuator',
    time: '15 min',
    summary: 'Three components, one feedback loop.',
    steps: [
      {
        kicker: 'Step 1 · The loop',
        headline: 'Sensor, decision, actuator — remove one and the loop opens',
        paragraphs: [
          `Every closed-loop system — chemical plant, autopilot, printing press — has the same three parts: a <b>sensor</b> that reads what's happening, a <b>decision</b> layer that compares the reading to a target and chooses an action, and an <b>actuator</b> that executes it.`,
          `In sheetfed offset: the sensor is a spectral scanner (typically IntelliTrax2) reading sheets the operator pulls at intervals — the loop runs on <b>sampled pulled sheets, not every printed sheet</b>. The decision layer compares measured ΔE00 per ink zone to target and decides which zones need more or less ink. The actuator is the ink-key servo that opens or closes the zone on the next pull.`,
        ],
        illustration: 'closed-loop.svg',
      },
      {
        kicker: 'Step 2 · Why close it',
        headline: 'A measured decision is the same every time',
        paragraphs: [
          `Open-loop is the alternative: the operator is both sensor and decision layer, and their judgment varies by shift and by mood. The economic case for closing the loop is removing that variance — a measurement-driven decision is identical every time, and correction lands within ~5 seconds.`,
          `Multiplied across a year of makereadies, this compounds into the numbers the free courses opened with: <b>30–55 % less waste, 25–40 % less makeready time</b>.`,
        ],
        quiz: {
          q: 'In a sheetfed closed-loop install, what is the "sensor" — and what does the loop actually run on?',
          options: [
            'A camera inside the press reading every printed sheet',
            'A spectral scanner (e.g. IntelliTrax2) reading sheets the operator pulls at intervals — sampled pulls, not every sheet',
            "The operator's trained eye",
          ],
          answer: 1,
          ok: 'Right — sampled pulled sheets feed the decision layer. This is not true inline measurement.',
          no: 'The sensor is the spectral scanner, on pulled sheets sampled at intervals — not every sheet, not the eye.',
        },
      },
    ],
  },
  {
    index: 1,
    num: '02',
    title: 'Anatomy of the Rutherford system',
    time: '15 min',
    summary: 'Where each layer of the loop physically lives.',
    steps: [
      {
        kicker: 'Step 1 · Where it lives',
        headline: 'Alongside the press, not instead of the console',
        paragraphs: [
          `Rutherford installs alongside the press <i>without</i> replacing the OEM's native console — the operator keeps their familiar interface. Rutherford sits on a second touchscreen near the console and overlays the existing controls with closed-loop logic.`,
          `The interface shows the live ΔE00 heatmap per ink zone, density and density-target deltas, and recommended corrections. The operator can accept the system's decisions, override them, or run fully autonomous depending on shift confidence and job risk.`,
        ],
        illustration: 'ill-loop4.svg',
      },
      {
        kicker: 'Step 2 · The learning layer',
        headline: 'On EasySet, learning is operator-driven',
        paragraphs: [
          `Ink-zone control links decisions to the press: Heidelberg via Prinect INK-Net, KBA via LogoTronic ECS XML, Komori via PDC, Manroland via InkDriver. Each integration is one-time; afterwards the operator sees only the result.`,
          `Learning is the Rutherford-specific layer — and on the <b>EasyLoop / EasySet</b> line it is <b>operator-driven, not automatic</b>: the operator chooses which jobs to record as references, and EasySet adjusts the presetting curves from that history. The discipline: record a <i>bad</i> job and EasySet faithfully learns the wrong curve. Fully automatic learning — where the system decides what to record — is the <b>ColorLoop</b> layer, covered in its own course.`,
        ],
        quiz: {
          q: 'On the EasyLoop / EasySet line, how does the system come to preset better over time?',
          options: [
            'It automatically decides which jobs to learn from',
            'The operator records chosen jobs as references, and EasySet adjusts the presetting curves from that history',
            'It downloads generic curves from the cloud',
          ],
          answer: 1,
          ok: 'Right — EasySet is operator-driven; record a bad job and it learns the wrong curve. Automatic learning is ColorLoop.',
          no: 'EasySet is operator-driven (you record references). Automatic "decide-what-to-record" learning is the ColorLoop layer.',
        },
      },
    ],
  },
  {
    index: 2,
    num: '03',
    title: 'Integrating with your press brand',
    time: '15 min',
    summary: 'One closed-loop concept, four press-OEM realities.',
    steps: [
      {
        kicker: 'Step 1 · Four OEM realities',
        headline: 'Heidelberg, KBA, Komori, Manroland',
        paragraphs: [
          `<b>Heidelberg</b> is the most common target in Europe: Prinect exposes a stable XML schema (INK-Net), CIP3 preset import via PPF or JDF, and Rutherford has been integrated for over two decades — expect a clean install. <b>KBA (Koenig & Bauer)</b> uses LogoTronic; the surface is ECS XML, standard on modern Rapida 75/105/145.`,
          `<b>Komori</b> integrates via PDC (Print Density Control) or KP-Connect, reading PQS color-bar data and writing back ink-key corrections; Komori also has its own loop that Rutherford complements or replaces. <b>Manroland Sheetfed</b> uses Pecom or InkDriver — reliable once installed, but slower to commission than Heidelberg.`,
        ],
        illustration: 'ill-dataflow.svg',
      },
      {
        kicker: 'Step 2 · Same experience',
        headline: 'The protocol differs; the operator experience does not',
        paragraphs: [
          `Across all four, the operator-facing experience is identical: Rutherford touchscreen on the right, native OEM console on the left, closed-loop running behind both. The integration protocol is a one-time commissioning detail the operator never sees.`,
        ],
        quiz: {
          q: 'Across Heidelberg, KBA, Komori and Manroland, what stays the same for the operator?',
          options: [
            'The ink-key control protocol',
            'The operator-facing experience — Rutherford touchscreen beside the native console, loop behind both',
            'Nothing — each press is a different workflow',
          ],
          answer: 1,
          ok: 'Right — the protocol differs per OEM, but the operator experience is identical.',
          no: 'The protocol differs per OEM; what stays identical is the operator experience.',
        },
      },
    ],
  },
  {
    index: 3,
    num: '04',
    title: 'CIP3 / CIP4 presetting: prepress data into ink-key opens',
    time: '15 min',
    summary: 'The first sheet is decided before the press starts.',
    steps: [
      {
        kicker: 'Step 1 · The format & the math',
        headline: 'Coverage per zone becomes ink-key opening',
        paragraphs: [
          `<b>CIP3</b> defined the PPF (Print Production Format) in the mid-1990s; <b>CIP4</b> succeeds it with JDF/JMF. Both encode the dot coverage of each separation across the sheet, divided into ink-zone columns.`,
          `The math is simple: ink demand for a zone is proportional to its total dot coverage — a zone covered 80 % needs roughly twice the opening of one covered 40 %. OEM consoles have pre-positioned ink keys this way for thirty years.`,
        ],
        illustration: 'ill-cip3.svg',
      },
      {
        kicker: 'Step 2 · Where Rutherford adds value',
        headline: '600-sheet vanilla vs 250-sheet calibrated',
        paragraphs: [
          `The raw coverage-to-opening formula varies by ink, substrate, press and ambient temperature. <b>EasySet</b> calibrates that relationship from the jobs the operator has recorded, so the first sheet lands closer to target than a vanilla CIP3 preset.`,
          `In production that's the difference between a ~600-sheet makeready (vanilla CIP3) and a ~250-sheet makeready (CIP3 + EasySet offsets from recorded jobs) — same prepress data, refined with site history.`,
        ],
        quiz: {
          q: 'Vanilla CIP3 already opens the keys from prepress coverage. What does EasySet add on top?',
          options: [
            'It replaces CIP3 entirely',
            'Site-specific offsets learned from recorded jobs, so the first sheet lands closer to target',
            'Nothing — CIP3 presetting is already optimal',
          ],
          answer: 1,
          ok: 'Right — same prepress data, calibrated with recorded history (~600 vanilla vs ~250 sheets).',
          no: 'EasySet calibrates the coverage→opening relationship from recorded jobs; CIP3 alone is generic.',
        },
      },
    ],
  },
  {
    index: 4,
    num: '05',
    title: 'Spectral targets and ΔE strategy in production',
    time: '15 min',
    summary: 'Tolerances that work in real shifts.',
    steps: [
      {
        kicker: 'Step 1 · Contract numbers',
        headline: 'Solids, a ΔE00 budget per channel',
        paragraphs: [
          `Brand-owner specs usually arrive as solids in CIELAB or spectral form plus a ΔE00 budget per channel — e.g. C ΔE00 < 2.0, M < 2.0, Y < 2.5, K < 2.5, spot colors < 1.5. Those are the contractual numbers.`,
        ],
        illustration: 'ill-density-de.svg',
      },
      {
        kicker: 'Step 2 · Production strategy',
        headline: 'Aim tighter than contract; fail fast on the rest',
        paragraphs: [
          `Production targets must sit <b>tighter</b> than the contract: if contract is ΔE00 < 2.0, aim for < 1.4. The buffer absorbs measurement uncertainty, instrument drift between your shop and the brand owner's lab, and in-run drift. Tolerances are best set per channel and per gamut region — solids tighter than midtones, grays tightest of all, spots negotiated case by case.`,
          `<b>Fail-fast triggers</b> are the safety layer: if ΔE00 exceeds the production target by more than 2× for three consecutive sheets, alert the operator rather than correct blindly — that pattern usually means wrong plate, wrong ink, or contaminated fountain, which no ink-key move will fix.`,
        ],
        quiz: {
          q: 'Your contract says ΔE00 < 2.0. Where should the production target sit, and why?',
          options: [
            'At 2.0 — match the contract exactly',
            'Tighter, ~1.4 — the buffer absorbs measurement uncertainty and drift between your shop and the lab',
            'Looser — 2.0 is already strict enough',
          ],
          answer: 1,
          ok: 'Right — aim tighter than contract; the buffer absorbs instrument and in-run drift.',
          no: 'Aim tighter (~1.4). The buffer absorbs measurement uncertainty and drift.',
        },
      },
    ],
  },
  {
    index: 5,
    num: '06',
    title: 'Operator workflow: day one vs week one vs month three',
    time: '15 min',
    summary: 'The cultural arc of every closed-loop install.',
    steps: [
      {
        kicker: 'Step 1 · The early days',
        headline: 'Day one is hostile; week one shifts',
        paragraphs: [
          `<b>Day one</b> is hostile: experienced operators read the closed-loop screen as an attempt to deskill them. Expect overrides and suspicion — schedule it for a low-pressure job, not a brand-owner audit.`,
          `<b>Week one</b> shifts the dynamic: operators see the system catch subtle drift the eye missed, or hold stability through a substrate-batch change. The shift lead is critical — if the most respected operator endorses it, adoption accelerates.`,
        ],
        illustration: 'ill-adoption.svg',
      },
      {
        kicker: 'Step 2 · The inflection',
        headline: 'Month three is where ROI shows',
        paragraphs: [
          `<b>Month three</b> is the inflection point: EasySet has enough recorded history to beat vanilla presetting on common work. Makereadies shorten, rejects rarefy, overrides stop except on unusual jobs — and ROI starts showing in monthly waste reports. <b>Year one</b> is the new normal: new hires are trained on it from shift one.`,
          `Plan the rollout with this arc in mind — do not promise month-three results in week one.`,
        ],
        quiz: {
          q: 'When does a closed-loop install typically become visibly better than manual presetting?',
          options: [
            'Day one, immediately',
            'Around month three, once EasySet has accumulated enough recorded-job history',
            'Only after several years',
          ],
          answer: 1,
          ok: "Right — month three is the inflection. Don't promise those results in week one.",
          no: 'Month three: enough recorded history to beat vanilla presetting. Day one is usually hostile.',
        },
      },
    ],
  },
  {
    index: 6,
    num: '07',
    title: 'Closed-loop on extended gamut (ECG, 7-color)',
    time: '15 min',
    summary: 'More inks, more channels, more discipline.',
    steps: [
      {
        kicker: 'Step 1 · More inks',
        headline: 'Seven inks cover more brand colors in-process',
        paragraphs: [
          `Extended Color Gamut prints with seven inks — CMYK plus orange, green and violet — covering more brand spot colors directly in process and eliminating custom-ink mixes for short runs. The trade-off is operational complexity: seven channels of ink-key control, seven calibration curves, seven targets.`,
        ],
        illustration: 'ill-ecg.svg',
      },
      {
        kicker: 'Step 2 · Three reasons it\'s harder',
        headline: 'Reading, trapping, separation',
        paragraphs: [
          `First, the device must read high-chroma orange and violet without clipping — IntelliTrax2 does; older scanners struggle. Second, <b>trapping</b> is more complex: more overprints and ink-sequence sensitivity, so the loop must recognise a trapping-caused deviation and decline to over-correct. Third, prepress must feed a clean ECG separation — <b>Esko Equinox</b> is widely used (GMG and others exist).`,
          `Bottom line: ECG closed-loop works in production today, but it needs a shop that has already mastered 4-color closed-loop and a prepress team comfortable with extended-gamut separation.`,
        ],
        quiz: {
          q: 'Why is closed-loop on extended gamut (7-color) harder than on CMYK?',
          options: [
            'The extra inks dry more slowly',
            'More channels, trickier trapping, and the device must read high-chroma orange/violet without clipping',
            "ECG colors can't be measured at all",
          ],
          answer: 1,
          ok: 'Right — added channels, trapping complexity, and high-chroma reads. Master 4-color closed-loop first.',
          no: "It's the added channels, trapping complexity and high-chroma measurement — not drying.",
        },
      },
    ],
  },
  {
    index: 7,
    num: '08',
    title: 'Scaling across presses, shifts, sites',
    time: '15 min',
    summary: 'From one machine to a multi-site standard.',
    steps: [
      {
        kicker: 'Step 1 · Project vs program',
        headline: 'A single install is a project; a fleet is a program',
        paragraphs: [
          `One installation focuses on commissioning, operator training and first-month ROI. A fleet deployment focuses on standardization, governance and central reporting — different management entirely.`,
          `Standardization starts with the <b>color bar</b>: same layout, patch sequence, dimensions and sheet position across every machine. Without it, your data isn't comparable; with it, you can benchmark machine A against machine B on identical metrics.`,
        ],
        illustration: 'ill-learning-curve.svg',
      },
      {
        kicker: 'Step 2 · Governance',
        headline: 'Centralize the targets, decentralize execution',
        paragraphs: [
          `Shift standardization is procedural: same tolerances, same fail-fast triggers, same approval workflow — the shift lead owns adherence, the plant manager owns policy, and the loop makes divergence visible.`,
          `Multi-site governance answers three questions: who owns the targets, who may change tolerances, who issues the brand-owner report. The cleanest setup centralizes target management (one quality owner of the master target library) and decentralizes execution; <b>MeasureColor Reports</b> provides the aggregation layer.`,
        ],
        quiz: {
          q: 'Scaling closed-loop across a fleet starts by standardizing what, first?',
          options: [
            'The press brand across sites',
            'The color bar — same layout, sequence, dimensions and position on every machine, so data is comparable',
            'The operators\' shift patterns',
          ],
          answer: 1,
          ok: "Right — without an identical bar across machines, the data isn't comparable. Standardize it first.",
          no: 'Start with the color bar: identical across machines, or you can\'t benchmark machine vs machine.',
        },
      },
    ],
  },
];

export default modules;
