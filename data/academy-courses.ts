export type AcademyCourse = {
  id: string;
  tone: 'free' | 'premium';
  title: string;
  duration: string;
  modules: number;
  description: string;
  syllabus: string[];
  videoSrc: string;
  price?: string;
  certificate?: string;
  flagship?: boolean;
};

export const FREE_COURSES: AcademyCourse[] = [
  {
    id: 'fundamentals',
    tone: 'free',
    title: 'Offset Color Management Fundamentals',
    duration: '45 min',
    modules: 5,
    description: 'The shared vocabulary every press team needs.',
    videoSrc: '/videos/academy/fundamentals.mp4',
    syllabus: [
      'What "good color" actually means on a press',
      'ISO 12647 in 10 minutes: substrates, TVI, primaries',
      'M0, M1, M2, M3: when to measure under which illuminant',
      'ΔE, ΔE 00, density: what to trust on the press floor',
      'The role of standards (G7, GRACoL, FOGRA) without the jargon',
    ],
  },
  {
    id: 'measurement-essentials',
    tone: 'free',
    title: 'Press-Side Measurement Essentials',
    duration: '35 min',
    modules: 4,
    description: 'From manual densitometer to automated scanning.',
    videoSrc: '/videos/academy/measurement-essentials.mp4',
    syllabus: [
      'Handheld vs automated scanning vs true inline: pros, cons, cost',
      'The geometry that matters: 45°/0°, polarization, UV filtering',
      'Color bars decoded: what to put on the sheet and why',
      'Repeatability vs reproducibility: the trap that costs you hours',
    ],
  },
  {
    id: 'where-color-hurts',
    tone: 'free',
    title: 'Where Color Hurts: From Makeready to Saleable Sheet',
    duration: '30 min',
    modules: 4,
    description: 'The hidden cost of inconsistency.',
    videoSrc: '/videos/academy/where-color-hurts.mp4',
    syllabus: [
      'Anatomy of a makeready: 800 sheets, 120 minutes, €450 on the floor',
      'The "good copy" myth: why subjective approval is killing your margin',
      'Drift, contamination, fountain solution, paper batch: the four silent killers',
      'Self-financed automation: how reduced waste pays for the system',
    ],
  },
];

export const PREMIUM_COURSES: AcademyCourse[] = [
  {
    id: 'closed-loop-flagship',
    tone: 'premium',
    title: 'The Complete Closed-Loop Color Masterclass',
    duration: '120 min',
    modules: 8,
    price: '€149',
    flagship: true,
    description: 'The definitive course on building a closed-loop offset operation, from setup to scale.',
    certificate: 'Rutherford Closed-Loop Expert',
    videoSrc: '/videos/academy/closed-loop-flagship.mp4',
    syllabus: [
      'The closed-loop concept: sensor, decision, actuator',
      'Anatomy of the Rutherford system: console interface, ink-zone control, learning logic',
      'Integrating with your press brand: Heidelberg, KBA, Komori, Manroland workflows',
      'CIP3/CIP4 presetting: turning prepress data into ink-key opens',
      'Spectral targets and ΔE strategy in production',
      'Operator workflow: what changes day one vs week one vs month three',
      'Closed-loop on extended gamut (ECG, 7-color)',
      'Scaling across presses, shifts, sites',
    ],
  },
  {
    id: 'measurecolor-production',
    tone: 'premium',
    title: 'MeasureColor Production: From Setup to Daily Operation',
    duration: '90 min',
    modules: 6,
    price: '€119',
    description: 'Master the measurement workflow that runs the pressroom.',
    videoSrc: '/videos/academy/measurecolor-production.mp4',
    syllabus: [
      'Installing and configuring MeasureColor Production',
      'Job templates, color bars, tolerances',
      'PQX, CXF, MIF, ICC, CGATS: what each format gives you',
      'Daily operator routine: measure, judge, document',
      'Integration with your MIS / job management via open XML',
      'Troubleshooting common errors and false positives',
    ],
  },
  {
    id: 'measurecolor-reports',
    tone: 'premium',
    title: 'MeasureColor Reports: Dashboards, Root-Cause & Continuous Improvement',
    duration: '80 min',
    modules: 6,
    price: '€119',
    description: 'Turn measurement data into management decisions.',
    videoSrc: '/videos/academy/measurecolor-reports.mp4',
    syllabus: [
      'The Reports module architecture: data flow from press to dashboard',
      'Building the dashboards that matter (per machine, per operator, per brand)',
      'Drill-down for root-cause analysis: finding the failure pattern',
      'Brand-owner reporting: what to send, in which format',
      'Benchmarking machines, operators, shifts, sites',
      'Driving continuous improvement loops with Reports',
    ],
  },
  {
    id: 'intellitrax2',
    tone: 'premium',
    title: 'IntelliTrax2 & IntelliTrax2 Pro: Automated Scanning Mastery',
    duration: '90 min',
    modules: 6,
    price: '€129',
    description: 'Get every advantage out of X-Rite’s flagship scanning hardware.',
    videoSrc: '/videos/academy/intellitrax2.mp4',
    syllabus: [
      'IntelliTrax2 (model 2900) vs IntelliTrax2 Pro (model 2900PRO): when to pick which',
      'Hardware setup: tracks, sheet positioning, calibration',
      'Geometry and conditions: 45°/0°, M0/M1/M3 single-pass strategy',
      'Color bars sized for 2 mm: what fits, what breaks',
      'Maintenance: non-contact best practices, UV LED life, certification cycles',
      'Migrating from legacy IntelliTrax (discontinued): what to expect',
    ],
  },
  {
    id: 'colorloop-ai',
    tone: 'premium',
    title: 'ColorLoop AI: Predictive Setup for Modern Offset',
    duration: '70 min',
    modules: 5,
    price: '€99',
    description: 'Rutherford’s own software: the new generation.',
    videoSrc: '/videos/academy/colorloop-ai.mp4',
    syllabus: [
      'What "AI-guided makeready" actually means (and what it doesn’t)',
      'Training the model on your jobs: first 30, 90, 365 days',
      'Predictive ink-key positioning vs reactive correction',
      'ColorLoop’s data layer: connecting press, measurement, MIS',
      'From operator decision to autonomous correction: staged adoption',
    ],
  },
  {
    id: 'offset360',
    tone: 'premium',
    title: 'Offset360 in Practice: Rutherford + IntelliTrax2 + MeasureColor',
    duration: '60 min',
    modules: 5,
    price: '€99',
    description: 'The X-Rite + Rutherford solution bundle, in real production conditions.',
    videoSrc: '/videos/academy/offset360.mp4',
    syllabus: [
      'The Offset360 architecture: what each component does',
      'Wiring the three systems together',
      'End-to-end job flow: prepress → setup → measure → correct → report',
      'Real-world ROI: calage, gâche, brand reports',
      'Common implementation pitfalls and how to avoid them',
    ],
  },
];

export const ALL_COURSES: AcademyCourse[] = [...FREE_COURSES, ...PREMIUM_COURSES];

export function getCourseBySlug(slug: string): AcademyCourse | undefined {
  return ALL_COURSES.find((c) => c.id === slug);
}
