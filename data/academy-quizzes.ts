// Final-assessment (QCM) content for Rutherford Academy.
//
// SERVER-ONLY: this file contains the correct answers. Never import it from a
// 'use client' module — the browser must only ever receive the sanitized
// PublicQuiz (see toPublicQuiz), and scoring happens server-side so a pass
// cannot be forged. Questions are written in English to match the (English)
// lesson content; the surrounding UI chrome is localized separately.

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  /** Indices of the correct option(s). Length > 1 means multiple correct. */
  correct: number[];
  explanation: string;
  /** 1-based module this question relates to, for "review the module" links. */
  moduleRef?: number;
};

export type CourseQuiz = {
  /** Fraction of questions required to pass, 0..1. */
  passThreshold: number;
  questions: QuizQuestion[];
};

/** Question shape safe to ship to the browser (no answers, no explanations). */
export type PublicQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  multiple: boolean;
  moduleRef?: number;
};

export type PublicQuiz = {
  passThreshold: number;
  questions: PublicQuizQuestion[];
};

export const COURSE_QUIZZES: Record<string, CourseQuiz> = {
  // Pilot — "Offset Color Management Fundamentals" (free, 5 modules).
  fundamentals: {
    passThreshold: 0.8,
    questions: [
      {
        id: 'q1',
        prompt: 'On a production press, what is the most defensible definition of "good color"?',
        options: [
          'Whatever the operator on shift approves by eye',
          'A measured match to a target, within a defined ΔE tolerance, verified by a measurement device',
          'The densest sheet the press is able to produce',
          'Whatever the brand owner accepted on the previous job',
        ],
        correct: [1],
        explanation:
          'Good color must be anchored to a target, carry a ΔE tolerance, and be verified by measurement — not by subjective operator approval, which changes with the person and the shift.',
        moduleRef: 1,
      },
      {
        id: 'q2',
        prompt:
          'ISO 12647-2 — the part brand owners usually cite for packaging — covers which process, and what does it define?',
        options: [
          'Flexo; it defines anilox volumes',
          'Sheetfed offset; it defines paper classes (PT1–PT5), TVI curves and CIELAB aim points',
          'Digital toner; it defines screening angles',
          'Gravure; it defines cylinder engraving depths',
        ],
        correct: [1],
        explanation:
          '12647-2 is the offset part. It defines paper classes PT1–PT5, target tonal value increase (TVI) curves, and CIELAB aim points for the solids.',
        moduleRef: 2,
      },
      {
        id: 'q3',
        prompt:
          'Which measurement condition uses a D50 illuminant with the UV component included, and is the modern default for papers with optical brighteners?',
        options: ['M0', 'M1', 'M2', 'M3'],
        correct: [1],
        explanation:
          'M1 (D50, UV included, per ISO 13655) is the modern default and the right choice for OBA-containing stock. M0 is legacy tungsten, M2 excludes UV, and M3 is polarized.',
        moduleRef: 3,
      },
      {
        id: 'q4',
        prompt: 'Why is the M3 (polarized) condition useful when reading a sheet during the run?',
        options: [
          'It adds UV to exaggerate optical brighteners',
          'It removes surface gloss, so wet ink reads closer to how it will read dry',
          'It is the only condition brand owners will accept',
          'It measures faster than the other conditions',
        ],
        correct: [1],
        explanation:
          'M3 is polarized: it removes surface gloss, which is why it is handy on wet ink during the run. It typically reads a higher density than M0/M1/M2.',
        moduleRef: 3,
      },
      {
        id: 'q5',
        prompt: 'On the press floor, which of these statements are correct? (Select all that apply.)',
        options: [
          'Operators work in density because it responds directly to ink-key movement',
          'ΔE00 (CIEDE2000) is the modern color-difference metric cited in brand specifications',
          'Density and ΔE are the same measurement under two different names',
          'ΔE 1976 is preferred over ΔE00 for modern tolerances',
        ],
        correct: [0, 1],
        explanation:
          'Density drives ink-key decisions; ΔE00 is the perceptually-correlated metric brand owners specify. They are different things, and ΔE00 superseded the older ΔE 1976.',
        moduleRef: 4,
      },
      {
        id: 'q6',
        prompt: 'What is the anchor of the G7 calibration methodology?',
        options: [
          'Maximum solid ink density',
          'Gray balance and the neutral print density curve',
          "The brand owner's PANTONE book",
          'Dot gain on the yellow channel only',
        ],
        correct: [1],
        explanation:
          'G7 is anchored on gray balance: if the CMY grays neutralize and the neutral density curve matches target, the rest of the gamut follows. It is process-agnostic.',
        moduleRef: 5,
      },
    ],
  },

  'measurement-essentials': {
    passThreshold: 0.8,
    questions: [
      {
        id: 'q1',
        prompt: 'Which device class sits at the press delivery and scans every sheet in under 10 seconds?',
        options: [
          'Handheld spectrophotometer (e.g. eXact 2)',
          'Strip reader / scanning table',
          'Inline scanner (e.g. IntelliTrax2)',
          'Densitometer pen',
        ],
        correct: [2],
        explanation:
          'Inline scanners like IntelliTrax2 sit at the delivery and scan every sheet in under 10 seconds — the right answer when you run multiple jobs per shift.',
        moduleRef: 1,
      },
      {
        id: 'q2',
        prompt: 'Why is 45°/0° the standard measurement geometry for graphic arts?',
        options: [
          'It is the fastest geometry',
          'It most closely simulates how the eye views a print under typical lighting (ISO 5-4)',
          'It needs no calibration',
          'It ignores optical brighteners',
        ],
        correct: [1],
        explanation:
          '45°/0° illuminates at 45° and reads at normal (0°), which best simulates how the eye views a print. ISO 5-4 specifies it for printed surfaces.',
        moduleRef: 2,
      },
      {
        id: 'q3',
        prompt: 'What does a polarized (M3) reading do?',
        options: [
          'Adds UV to exaggerate brighteners',
          'Removes surface gloss, so wet ink reads closer to how it will read dry',
          'Always lowers density values',
          'Measures only the black channel',
        ],
        correct: [1],
        explanation:
          'Polarization removes the specular (gloss) component, giving a "wet-like" reading; it typically raises density by 0.05–0.20 D.',
        moduleRef: 2,
      },
      {
        id: 'q4',
        prompt: 'How small a color-bar patch height can IntelliTrax2 read?',
        options: ['0.5 mm', '2 mm', '5 mm', '10 mm'],
        correct: [1],
        explanation:
          'IntelliTrax2 reads patches down to 2 mm — much tighter than the 4–5 mm of legacy inline systems — so bars steal less printable area.',
        moduleRef: 3,
      },
      {
        id: 'q5',
        prompt: 'Repeatability versus reproducibility — which statement is correct?',
        options: [
          'Reproducibility (across instruments/operators) is always worse than repeatability; the metric is Inter-Instrument Agreement (IIA)',
          'Repeatability is always worse than reproducibility',
          'They are the same thing',
          'Reproducibility applies only to handhelds',
        ],
        correct: [0],
        explanation:
          'Repeatability is one instrument repeating itself; reproducibility (across instruments/operators) is always worse, measured as Inter-Instrument Agreement.',
        moduleRef: 4,
      },
      {
        id: 'q6',
        prompt: 'Which are sound practices for managing inter-instrument disagreement? (Select all that apply.)',
        options: [
          'Designate a reference instrument per customer and document the offsets',
          'Schedule annual recertification of measurement devices',
          'Ignore the gap — it averages out',
          'Use a different illuminant on each device',
        ],
        correct: [0, 1],
        explanation:
          'The fixes are procedural (a documented reference instrument and offsets) and hardware (annual recertification). Ignoring the gap or mixing illuminants makes it worse.',
        moduleRef: 4,
      },
    ],
  },

  'where-color-hurts': {
    passThreshold: 0.8,
    questions: [
      {
        id: 'q1',
        prompt: 'In the course B1 6-color example, roughly what does one makeready cost (paper + press time + sundries)?',
        options: ['About €50', 'About €450–500', 'About €5,000', 'It is negligible'],
        correct: [1],
        explanation:
          '≈€428 paper (800 sheets) + €300 press time (120 min at €150/h) plus sundries lands at a conservative €450–500 per makeready.',
        moduleRef: 1,
      },
      {
        id: 'q2',
        prompt: 'What is the fix for the "good copy" myth (subjective approval)?',
        options: [
          'Slow every operator down',
          'Base the pass/fail decision on measurement against a target and tolerance, not subjective judgment',
          'Let the fastest operator decide',
          'Raise the customer tolerance',
        ],
        correct: [1],
        explanation:
          'The fix is to take the pass/fail decision out of subjective judgment and make it the same way every time: against the same target and tolerance, with a data trail.',
        moduleRef: 2,
      },
      {
        id: 'q3',
        prompt: 'Which of these are among the four "silent killers" of color stability? (Select all that apply.)',
        options: [
          'Drift over the run',
          'Fountain solution chemistry',
          'Operator height',
          'Paper batch variability',
        ],
        correct: [0, 1, 3],
        explanation:
          'The four silent killers are drift, contamination, fountain solution, and paper batch variability.',
        moduleRef: 3,
      },
      {
        id: 'q4',
        prompt: 'What is the capital case for closed-loop built on?',
        options: [
          'Tax credits',
          'Paper saved, press time recovered, and brand-owner reject reduction — typically a 9–18 month payback',
          'Charging higher prices',
          'Cutting headcount',
        ],
        correct: [1],
        explanation:
          'The three measurable returns are paper saved, press time recovered, and reduced brand-owner rejects, typically paying back in 9–18 months on one press.',
        moduleRef: 4,
      },
      {
        id: 'q5',
        prompt: 'By how much does closed-loop typically reduce makeready waste in real installations?',
        options: ['5–10%', '30–55%', 'Over 90%', 'It does not reduce waste'],
        correct: [1],
        explanation:
          'Real installations typically cut makeready waste by 30–55% (and makeready time by 25–40%).',
        moduleRef: 1,
      },
    ],
  },

  'closed-loop-flagship': {
    passThreshold: 0.8,
    questions: [
      {
        id: 'q1',
        prompt: 'A closed loop has three components. Which set?',
        options: [
          'Sensor, decision layer, actuator',
          'Plate, blanket, cylinder',
          'Prepress, press, postpress',
          'Ink, water, paper',
        ],
        correct: [0],
        explanation:
          'Every closed loop is a sensor (measurement), a decision layer (compare to target), and an actuator (ink-key servo). Remove one and the loop opens.',
        moduleRef: 1,
      },
      {
        id: 'q2',
        prompt: 'How does the Rutherford system fit on the press?',
        options: [
          'It replaces the OEM console entirely',
          'It runs alongside the OEM console (a second touchscreen) and overlays closed-loop logic',
          'It works only offline',
          'It removes the ink keys',
        ],
        correct: [1],
        explanation:
          'Rutherford installs alongside the press OEM console on a second touchscreen; the operator keeps their familiar interface.',
        moduleRef: 2,
      },
      {
        id: 'q3',
        prompt: 'On Heidelberg presses, Rutherford controls the ink keys via…?',
        options: [
          'LogoTronic / ECS XML',
          'Prinect Press Center via INK-Net',
          'Komori PDC',
          'Manroland InkDriver',
        ],
        correct: [1],
        explanation:
          'Heidelberg integration is through the Prinect Press Center via INK-Net. LogoTronic/ECS is KBA, PDC is Komori, InkDriver is Manroland.',
        moduleRef: 3,
      },
      {
        id: 'q4',
        prompt: 'Why does CIP3 / CIP4 presetting work?',
        options: [
          'Ink-key opening is proportional to the dot coverage of the zone summed across the sheet',
          'Every zone always gets equal ink',
          'It measures the printed sheet',
          'It replaces the plates',
        ],
        correct: [0],
        explanation:
          'Ink demand for a zone is proportional to its total dot coverage across the sheet, so CIP3/CIP4 coverage data pre-positions the ink keys.',
        moduleRef: 4,
      },
      {
        id: 'q5',
        prompt: 'If the brand-owner contract is ΔE00 < 2.0, what should the production target be?',
        options: [
          'Exactly 2.0',
          'Tighter — e.g. ΔE00 < 1.4 — to buffer drift and instrument differences',
          'Looser — e.g. 3.0',
          'No production target is needed',
        ],
        correct: [1],
        explanation:
          'Production targets must sit tighter than the contract to absorb measurement uncertainty and in-run drift — roughly ΔE00 < 1.4 against a 2.0 contract.',
        moduleRef: 5,
      },
      {
        id: 'q6',
        prompt: 'What is the purpose of a "fail-fast" trigger?',
        options: [
          'To speed up the press',
          'To alert the operator when corrections are not working — the cause may be a wrong plate, wrong ink, or contamination',
          'To shut down the building',
          'To loosen tolerances automatically',
        ],
        correct: [1],
        explanation:
          'When ΔE stays far off target for several sheets, the issue is usually not ink-key position — fail-fast alerts the operator instead of blindly correcting.',
        moduleRef: 5,
      },
      {
        id: 'q7',
        prompt: 'Extended Color Gamut (ECG) 7-color printing typically adds which inks to CMYK?',
        options: [
          'Orange, green, violet',
          'Red, blue, white',
          'Gold, silver, bronze',
          'Light cyan, light magenta, gray',
        ],
        correct: [0],
        explanation:
          'ECG adds orange, green and violet to CMYK, covering more brand spot colors in process (commonly via Equinox separation).',
        moduleRef: 7,
      },
      {
        id: 'q8',
        prompt: 'When scaling closed-loop across a fleet, what must be standardized first for comparable data?',
        options: [
          'The color bar (same layout, patches, position) across every machine',
          'The coffee brand',
          'The shift names',
          'Nothing needs standardizing',
        ],
        correct: [0],
        explanation:
          'Standardization starts with the color bar — same layout, patch sequence, dimensions and position — otherwise machine-to-machine data is not comparable.',
        moduleRef: 8,
      },
    ],
  },

  'measurecolor-production': {
    passThreshold: 0.8,
    questions: [
      {
        id: 'q1',
        prompt: 'Where does MeasureColor Production store its data by default?',
        options: [
          'In a mandatory vendor cloud',
          'Inside your own network (local SQL) — no mandatory cloud',
          'On the measurement device',
          'In the press console',
        ],
        correct: [1],
        explanation:
          'MeasureColor stores data inside your network by default; central aggregation, if used, is on your own servers, not a vendor cloud.',
        moduleRef: 1,
      },
      {
        id: 'q2',
        prompt: 'What is the most reliable source of per-patch targets?',
        options: [
          'Generic ISO / GRACoL values',
          'A measured press fingerprint on the same substrate the job will run on',
          'The operator preference',
          'The ink supplier datasheet',
        ],
        correct: [1],
        explanation:
          'A measured fingerprint on the production substrate is the most reliable target; generic ISO/GRACoL values work only as a looser starting point.',
        moduleRef: 2,
      },
      {
        id: 'q3',
        prompt: 'Which is the open ISO 20616 format for exchanging measurement data with brand owners?',
        options: ['ICC', 'PQX', 'PDF', 'JPEG'],
        correct: [1],
        explanation:
          'PQX (Print Quality eXchange, ISO 20616-1) is open and vendor-neutral and carries both values and measurement conditions — the format brand owners increasingly request.',
        moduleRef: 3,
      },
      {
        id: 'q4',
        prompt: 'Which statement about ICC profiles is correct?',
        options: [
          'They are the measurement record of a specific sheet',
          'They characterize what a device or process produces in general — not a per-sheet measurement',
          'They are identical to PQX',
          'They store ink-key positions',
        ],
        correct: [1],
        explanation:
          'ICC profiles describe what a device/process produces in general; they are not per-sheet measurement records. Use them for soft-proofing and characterization.',
        moduleRef: 3,
      },
      {
        id: 'q5',
        prompt: 'The daily operator routine in MeasureColor is which three steps?',
        options: ['Measure, judge, document', 'Wash, ink, print', 'Open, close, lock', 'Scan, email, delete'],
        correct: [0],
        explanation:
          'Measure the sheet, judge pass/fail per patch, and document — the data trail is stored automatically against the job ID.',
        moduleRef: 4,
      },
      {
        id: 'q6',
        prompt: 'A sheet looks fine but the software flags a ΔE failure. Likely causes? (Select all that apply.)',
        options: [
          'The wrong job template is loaded',
          'Device calibration has expired',
          'The color bar is misaligned (reading the wrong patch)',
          'The paper is too white to measure',
        ],
        correct: [0, 1, 2],
        explanation:
          'False-positive failures usually trace to the wrong template, expired calibration, or a misaligned bar — or a measurement-condition mismatch (M0 vs M1).',
        moduleRef: 6,
      },
    ],
  },

  'measurecolor-reports': {
    passThreshold: 0.8,
    questions: [
      {
        id: 'q1',
        prompt: 'What is the relationship between MeasureColor Reports and Production?',
        options: [
          'Reports is a standalone product',
          'Reports is a module on top of Production — without Production feeding it, it shows nothing',
          'Production sits on top of Reports',
          'They are unrelated products',
        ],
        correct: [1],
        explanation:
          'Production captures the measurement events; Reports aggregates and visualizes them. Reports cannot work without Production feeding it data.',
        moduleRef: 1,
      },
      {
        id: 'q2',
        prompt: 'Which three dashboard axes does the course recommend building first?',
        options: [
          'Per machine, per operator, per brand owner',
          'Per hour, per minute, per second',
          'Per ink, per plate, per blanket',
          'Per invoice, per email, per call',
        ],
        correct: [0],
        explanation:
          'Build per-machine, per-operator and per-brand-owner dashboards first; every extra dashboard is operating expense, so only build what people use.',
        moduleRef: 2,
      },
      {
        id: 'q3',
        prompt: 'In root-cause drill-down, where do you usually start?',
        options: [
          'The dimension that explains the most variance (often the machine), then time, shift, substrate',
          'Always the operator',
          'At random',
          'The coffee machine',
        ],
        correct: [0],
        explanation:
          'Start with the dimension explaining the most variance — usually the machine — then drill into time, shift and substrate. Each drill is a hypothesis test.',
        moduleRef: 3,
      },
      {
        id: 'q4',
        prompt: 'What is the single best practice in supplier-to-brand-owner reporting?',
        options: [
          'Send a report only when asked',
          'Send the quality report before the brand owner asks',
          'Never send reports',
          'Send only PDFs, never data',
        ],
        correct: [1],
        explanation:
          'Sending an unprompted quality report at period-end builds trust that translates into longer contracts and less audit pressure.',
        moduleRef: 4,
      },
      {
        id: 'q5',
        prompt: 'Why does Reports show every metric against its peer group?',
        options: [
          'To use more screen space',
          'Because a single number means nothing without context (peer comparison)',
          'To slow the dashboard down',
          'Because brand owners require it',
        ],
        correct: [1],
        explanation:
          'ΔE00 = 1.4 is good or bad only relative to what the same press/shift/operator normally achieves — benchmarking is the default view.',
        moduleRef: 5,
      },
      {
        id: 'q6',
        prompt: 'The continuous-improvement loop has which four steps?',
        options: [
          'Observe, hypothesize, act, verify',
          'Plan, print, pack, post',
          'Measure, ignore, repeat, hope',
          'Buy, sell, trade, hold',
        ],
        correct: [0],
        explanation:
          'Observe the dashboards, hypothesize a cause with a falsifiable prediction, act, then verify against next period’s data.',
        moduleRef: 6,
      },
    ],
  },

  intellitrax2: {
    passThreshold: 0.8,
    questions: [
      {
        id: 'q1',
        prompt: 'When is IntelliTrax2 Pro (2900PRO) the better fit than the standard 2900?',
        options: [
          'Single-shift, low volume, one substrate',
          'Multi-shift, frequent substrate changes, brands needing M1 plus M3 in one job, 24×5 operation',
          'When you never measure',
          'Only for digital presses',
        ],
        correct: [1],
        explanation:
          'The Pro targets higher throughput and tighter demands — multi-shift, frequent substrate changes, dual-condition jobs and 24×5 utilization.',
        moduleRef: 1,
      },
      {
        id: 'q2',
        prompt: 'IntelliTrax2 needs the color bar within how far of the sheet edge?',
        options: ['Within 38 mm', 'Within 200 mm', 'Exactly at the centre', 'Distance does not matter'],
        correct: [0],
        explanation:
          'The scan head must engage the bar within 38 mm of the sheet edge — impositions must respect this or the bar will not scan reliably.',
        moduleRef: 2,
      },
      {
        id: 'q3',
        prompt: 'Which is true of IntelliTrax2 measurement conditions?',
        options: [
          'It supports only M0',
          'It can capture two conditions in a single pass (M0/M1, M0/M3, or M1/M3)',
          'M1 excludes UV',
          'M3 is unpolarized',
        ],
        correct: [1],
        explanation:
          'IntelliTrax2 captures two conditions in one pass, so a single scan can satisfy a legacy M0 contract and a modern M1 brand spec at once.',
        moduleRef: 3,
      },
      {
        id: 'q4',
        prompt: 'What is a precondition for reliable tight-tolerance 2 mm patch measurement?',
        options: [
          'Very large sheets',
          'Tight register — misregister shows up as patch-to-patch variation',
          'A handheld backup',
          'Disabling UV',
        ],
        correct: [1],
        explanation:
          'At 2 mm, a 0.05–0.1 mm misregister shows up as patch-to-patch variation, so tight register is a precondition for tight-tolerance reads.',
        moduleRef: 4,
      },
      {
        id: 'q5',
        prompt: 'What is the dominant aging factor for IntelliTrax2, addressed by annual recertification?',
        options: [
          'Roller wear',
          'UV LED output decline (which drifts M1 readings)',
          'Ink build-up on the platen',
          'Track rust',
        ],
        correct: [1],
        explanation:
          'The UV LED ages with operating hours, drifting M1 readings; annual recertification restores calibration and resets the drift clock.',
        moduleRef: 5,
      },
      {
        id: 'q6',
        prompt: 'Migrating from the discontinued IntelliTrax (2246) to a 2900/PRO — what carries over?',
        options: [
          'Nothing; rebuild everything',
          'Job templates, color bars and tolerance libraries (device-agnostic above the hardware layer)',
          'Only the power cable',
          'The old scan times',
        ],
        correct: [1],
        explanation:
          'Templates, color bars and tolerance libraries are device-agnostic and carry over; you gain faster scans, 2 mm patches and dual-condition single-pass.',
        moduleRef: 6,
      },
    ],
  },

  'colorloop-ai': {
    passThreshold: 0.8,
    questions: [
      {
        id: 'q1',
        prompt: 'What is ColorLoop AI?',
        options: [
          'A generative model like ChatGPT',
          'A supervised learning system trained on your pressroom’s historical measurement data',
          'A random number generator',
          'A cloud-only chatbot',
        ],
        correct: [1],
        explanation:
          'It is supervised learning trained on your shop’s history — it learns which ink-key positions achieved good color on similar past jobs.',
        moduleRef: 1,
      },
      {
        id: 'q2',
        prompt: 'What does ColorLoop AI actually do?',
        options: [
          'Replaces the closed-loop controller',
          'Predicts starting ink-key positions; the closed-loop layer still does the actual control',
          'Removes the need for measurement',
          'Designs the artwork',
        ],
        correct: [1],
        explanation:
          'The AI is a starting-point predictor; the closed-loop system remains the actual color controller. Remove the loop and the prediction is just a guess.',
        moduleRef: 1,
      },
      {
        id: 'q3',
        prompt: 'A pressroom not yet running closed-loop should enable the AI layer when?',
        options: [
          'Immediately, before closed-loop',
          'After closed-loop is in production and 6–12 months of history is accumulated',
          'Never',
          'Only on new presses',
        ],
        correct: [1],
        explanation:
          'The model needs history. Get closed-loop into production first, accumulate 6–12 months of measurements, then enable the AI layer.',
        moduleRef: 2,
      },
      {
        id: 'q4',
        prompt: 'How does predictive positioning reduce waste versus purely reactive correction?',
        options: [
          'It prints faster',
          'It gets the first sheet closer to target, so the closed loop needs fewer correction cycles (fewer waste sheets)',
          'It removes the need for ink',
          'It lowers the tolerance',
        ],
        correct: [1],
        explanation:
          'A better starting position means fewer correction iterations before reaching target — and fewer iterations means fewer waste sheets.',
        moduleRef: 3,
      },
      {
        id: 'q5',
        prompt: 'What is the correct order of ColorLoop staged autonomy?',
        options: [
          'Advisory, then assisted, then supervised autonomous, then fully autonomous',
          'Fully autonomous from day one',
          'Assisted, then advisory, then manual',
          'There are no stages',
        ],
        correct: [0],
        explanation:
          'Adoption runs advisory → assisted (one click) → supervised autonomous → fully autonomous; high-stakes work often stays at supervised.',
        moduleRef: 5,
      },
    ],
  },

  offset360: {
    passThreshold: 0.8,
    questions: [
      {
        id: 'q1',
        prompt: 'Offset360 bundles which three technologies?',
        options: [
          'Rutherford closed-loop control, IntelliTrax2 inline scanning, and MeasureColor Production/Reports',
          'Three different presses',
          'Three inks',
          'Three RIPs',
        ],
        correct: [0],
        explanation:
          'Offset360 is the pre-integrated bundle of Rutherford closed-loop control, IntelliTrax2 inline scanning, and MeasureColor Production/Reports.',
        moduleRef: 1,
      },
      {
        id: 'q2',
        prompt: 'Why run NTP (time synchronization) across all three Offset360 systems?',
        options: [
          'To save power',
          'So timestamps are consistent and the shared data trail makes sense (a common source of "weird data" otherwise)',
          'To speed up scanning',
          'It is not needed',
        ],
        correct: [1],
        explanation:
          'All three layers need consistent timestamps for the data trail to line up — NTP against one source prevents the classic "weird data" complaints.',
        moduleRef: 2,
      },
      {
        id: 'q3',
        prompt: 'What is the Offset360 end-to-end job flow?',
        options: [
          'Prepress → setup → measure → correct → report',
          'Print → pray → ship',
          'Measure → bill → forget',
          'Setup → report → measure',
        ],
        correct: [0],
        explanation:
          'One job runs prepress → setup (CIP3 + learned offsets) → measure (IntelliTrax2) → correct (Rutherford) → report (MeasureColor), with one data trail throughout.',
        moduleRef: 3,
      },
      {
        id: 'q4',
        prompt: 'Real Offset360 installations report payback on a single B1 press in roughly…?',
        options: ['1 month', '9–18 months', '10 years', 'Never'],
        correct: [1],
        explanation:
          'Single-press payback is typically 9–18 months from recovered makeready time and paper waste, before counting contract-retention effects.',
        moduleRef: 4,
      },
      {
        id: 'q5',
        prompt: 'Which are named Offset360 implementation pitfalls? (Select all that apply.)',
        options: [
          'Skipping the prepress (CIP3) alignment',
          'Under-investing in operator training',
          'Ignoring the press mechanical-maintenance baseline',
          'Measuring color too accurately',
        ],
        correct: [0, 1, 2],
        explanation:
          'The named pitfalls include skipping prepress alignment, under-training operators, and ignoring the press maintenance baseline — not "measuring too accurately".',
        moduleRef: 5,
      },
    ],
  },
};

export function getQuizForCourse(slug: string): CourseQuiz | undefined {
  return COURSE_QUIZZES[slug];
}

export function courseHasQuiz(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(COURSE_QUIZZES, slug);
}

/** Strip answers/explanations so the question set is safe to send to the client. */
export function toPublicQuiz(quiz: CourseQuiz): PublicQuiz {
  return {
    passThreshold: quiz.passThreshold,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options,
      multiple: q.correct.length > 1,
      moduleRef: q.moduleRef,
    })),
  };
}
