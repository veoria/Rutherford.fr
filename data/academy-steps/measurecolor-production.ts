import type { AppModule } from '@/data/academy-app';

// MeasureColor Production: From Setup to Daily Operation — step content.
// Condensed from data/academy-lessons.ts. Product-UI steps use `capture`
// placeholders (a screenshot to drop in later); conceptual steps use SVGs.
const modules: AppModule[] = [
  {
    index: 0,
    num: '01',
    title: 'Installing and configuring MeasureColor Production',
    time: '15 min',
    summary: 'From license activation to first measured sheet.',
    steps: [
      {
        kicker: 'Step 1 · Install & network',
        headline: 'App, local SQL database, device service',
        paragraphs: [
          `MeasureColor Production runs on Windows workstations on your local network. The installer sets up the application, a local SQL database, and a service that talks to your instruments. Licensing is per workstation; an enterprise license covers multiple seats.`,
          `Network topology matters more than people expect: the workstation must reach the instruments (USB or network), the database (local or central), and any MIS endpoint. Plan VLAN segmentation and firewall rules <i>before</i> commissioning, not after.`,
        ],
        capture: 'MeasureColor Production — installation / workstation configuration screen',
      },
      {
        kicker: 'Step 2 · Pairing & calibration',
        headline: 'Three calibrations before production, white tile daily',
        paragraphs: [
          `Device pairing is the first concrete step: an eXact 2 connects by USB and is detected in seconds; IntelliTrax2 connects over Ethernet to the X-Rite service. A new install runs all three calibrations — <b>white-tile</b> (ties the instrument to its reference), <b>black</b> (dark response), <b>spectral</b> (wavelength accuracy). Routine production runs only white tile, typically per shift.`,
          `Data residency is a feature, not a fix: MeasureColor stores its data inside your network by default. There is no mandatory cloud component — even central multi-plant aggregation runs on <i>your</i> servers.`,
        ],
        capture: 'Device pairing + white-tile calibration dialog',
        quiz: {
          q: 'By default, where does MeasureColor store its measurement data?',
          options: [
            'In a mandatory vendor cloud',
            'Inside your own network (local or your central SQL database) — no mandatory cloud',
            'Only on the instrument itself',
          ],
          answer: 1,
          ok: 'Right — data residency is a feature: it stays on your servers by default.',
          no: 'By default it lives on your network / SQL database — there is no mandatory cloud component.',
        },
      },
    ],
  },
  {
    index: 1,
    num: '02',
    title: 'Job templates, color bars, tolerances',
    time: '15 min',
    summary: 'The reusable assets that drive every measurement.',
    steps: [
      {
        kicker: 'Step 1 · Templates',
        headline: '30 seconds per sheet vs 5 minutes',
        paragraphs: [
          `A job template defines the bar layout (patch sequence and dimensions), the targets per patch (CIELAB or spectral), the tolerances per patch, and the reporting outputs. A well-built library is the difference between measuring a sheet in 30 seconds and 5 minutes. Templates are versioned — build per customer/bar, don't rebuild per job.`,
          `Targets come from your fingerprint: the most reliable source is a measured press fingerprint on the <i>same substrate</i> the job will run on. Generic ISO 12647 or GRACoL aims work as a starting point but always sit looser than a measured fingerprint.`,
        ],
        capture: 'Job template editor — bar layout, per-patch targets and tolerances',
      },
      {
        kicker: 'Step 2 · Tolerances',
        headline: 'Calibrate tolerances to capability, not aspiration',
        paragraphs: [
          `Use ΔE00 for solids and grays, ΔH for chromatic spot and brand colors — but tolerance grays in ΔE/ΔCh, not ΔH, because hue angle is unstable at low chroma — and density for ink-key feedback. The tighter the tolerance, the more often the operator reacts; set them to your shop's actual capability, not aspirational numbers.`,
          `Templates are living assets: quarterly, review your top 10 by failure-mode distribution. A patch that fails often may need a tolerance review or a target update.`,
        ],
        quiz: {
          q: "Where should a template's per-patch targets ideally come from?",
          options: [
            'Generic ISO 12647 / GRACoL aim points',
            'A measured press fingerprint taken on the same substrate the job will run on',
            "The operator's preference on the day",
          ],
          answer: 1,
          ok: 'Right — a measured fingerprint on the real substrate. Generic aims are looser and only a starting point.',
          no: 'Use a measured fingerprint on the actual substrate; generic ISO/GRACoL aims sit looser.',
        },
      },
    ],
  },
  {
    index: 2,
    num: '03',
    title: 'PQX, CXF, MIF, ICC, CGATS: file format reference',
    time: '15 min',
    summary: 'What each format gives you and when to use which.',
    steps: [
      {
        kicker: 'Step 1 · The exchange formats',
        headline: 'PQX for reports, CXF for spectral, MIF in-house',
        paragraphs: [
          `<b>PQX</b> (Print Quality eXchange, ISO 20616-1) is open and vendor-neutral and carries both values <i>and</i> measurement conditions — the format brand owners increasingly request for supplier reporting. <b>CXF</b> (Color Exchange Format, ISO 17972; CXF/X-4 for characterization) carries full spectral data — use it when sharing reflectance with prepress. <b>MIF</b> is MeasureColor's native format, most flexible, full job context — use it for internal movement.`,
        ],
        illustration: 'ill-formats.svg',
      },
      {
        kicker: 'Step 2 · ICC vs CGATS',
        headline: 'A profile is not a measurement record',
        paragraphs: [
          `<b>ICC</b> profiles encode the characterization of a device or condition — they describe what a process produces in general, <i>not</i> what was measured on a specific sheet. Use ICC for prepress soft-proofing and characterization, not as a measurement record. <b>CGATS</b> (e.g. CGATS.17) is text-based, human-readable and widely supported — the workhorse for legacy round-trips.`,
          `Open standards reduce lock-in: MeasureColor imports and exports all five. Choose by the receiver, not the sender.`,
        ],
        quiz: {
          q: 'A brand owner wants machine-readable data they can re-verify, with the measurement conditions included. Which format?',
          options: ['An ICC profile', 'PQX (ISO 20616-1)', 'A PDF screenshot'],
          answer: 1,
          ok: 'Right — PQX is the open, vendor-neutral supplier-reporting format, conditions included.',
          no: 'PQX carries values + conditions and is machine-readable. An ICC profile is a characterization, not a measurement record.',
        },
      },
    ],
  },
  {
    index: 3,
    num: '04',
    title: 'Daily operator routine: measure, judge, document',
    time: '15 min',
    summary: 'The three-step loop that runs every job.',
    steps: [
      {
        kicker: 'Step 1 · Measure & judge',
        headline: 'The software gives the data; the operator owns the decision',
        paragraphs: [
          `<b>Measure</b>: pull a sheet and scan it — under 10 seconds for a full B1 bar on IntelliTrax2, ~90 seconds with a handheld and bar. <b>Judge</b>: the software shows pass/fail per patch, ΔE00 per ink, density deltas and the trend over the last N sheets. The operator decides — acceptable, needs an ink-key move, or a non-correctable problem (contamination, wrong plate, fountain issue).`,
        ],
        illustration: 'ill-jobflow.svg',
      },
      {
        kicker: 'Step 2 · Document',
        headline: 'The data trail builds itself',
        paragraphs: [
          `<b>Document</b>: the measurement is stored automatically against the job ID and timestamped — no manual logging. At job end, the operator generates a PDF or PQX report signed with their ID. The routine is identical job to job, which is its strength: outcome variance then comes from the press, ink and substrate — not from procedure.`,
          `A team is slow at first; after a month it's under a minute per sheet on most jobs, and the time pays back in faster makereadies and fewer rejects.`,
        ],
        quiz: {
          q: 'In the measure-judge-document routine, who owns the pass/fail decision?',
          options: [
            'The software decides automatically',
            'The operator — the software supplies pass/fail, ΔE00 and trend; the operator judges, including "this is not ink-key-correctable"',
            'The brand owner, remotely',
          ],
          answer: 1,
          ok: 'Right — the software supplies the data; the operator judges. Documentation is then automatic against the job ID.',
          no: 'The software gives the data; the operator owns the decision. Then documentation is automatic.',
        },
      },
    ],
  },
  {
    index: 4,
    num: '05',
    title: 'Integration with your MIS via open XML',
    time: '15 min',
    summary: 'Linking quality data to the system that runs the shop.',
    steps: [
      {
        kicker: 'Step 1 · Both directions',
        headline: 'Push the job in, push the quality summary back',
        paragraphs: [
          `A pressroom MIS (HIFLOW, EFI Pace, Optimus, Cerm) tracks jobs, schedules, costs and customers. Without integration, measurements live in their own world. <b>MIS → MeasureColor</b>: when a job is scheduled, push the job ID, customer, substrate and required template — the operator doesn't hunt for the template, it's pre-loaded. <b>MeasureColor → MIS</b>: on completion, push the quality summary back for billing, customer reporting and trends.`,
        ],
        illustration: 'ill-dataflow.svg',
      },
      {
        kicker: 'Step 2 · Protocol & payoff',
        headline: 'One-time effort, ongoing payoff',
        paragraphs: [
          `The protocol is XML over HTTP for most modern systems, with JDF/JMF as the standard envelope; older systems use a watched folder for flat files. After commissioning, the MIS becomes the single source of truth for what was scheduled vs delivered, and quality reports become a byproduct of running the job. In multi-site shops, this link is the bridge that lets central management see across plants.`,
        ],
        quiz: {
          q: 'What does pushing the scheduled job (ID, substrate, template) from MIS to MeasureColor buy you?',
          options: [
            'Nothing operational',
            'The right template is pre-loaded from the job ID — the operator stops hunting for it, removing a common setup error',
            'It replaces the measurement device',
          ],
          answer: 1,
          ok: 'Right — pre-loading the template from the job ID removes the classic wrong-template error.',
          no: 'It pre-loads the correct template from the job ID, eliminating the wrong-template mistake.',
        },
      },
    ],
  },
  {
    index: 5,
    num: '06',
    title: 'Troubleshooting common errors and false positives',
    time: '15 min',
    summary: 'The top issues, and why they happen.',
    steps: [
      {
        kicker: 'Step 1 · False-positive ΔE',
        headline: 'The sheet looks fine but the software flags it',
        paragraphs: [
          `The most common complaint: press and sheet look fine, software flags failure. Usual causes — <b>wrong template</b> (ran with the previous job's), <b>expired calibration</b> on the device, or a <b>misaligned bar</b> (head positioned 2 mm off, reading the wrong patch). Fix mismatched templates by enforcing selection from the MIS-pushed job ID, with documented-reason overrides only.`,
        ],
        capture: 'MeasureColor — patch failure flag / detail view',
      },
      {
        kicker: 'Step 2 · Drift & conditions',
        headline: 'The biggest false-alarm source is mismatched conditions',
        paragraphs: [
          `Hardware drift is real: IntelliTrax2 UV-LED drift is gradual (skip recertification and expect ~3 %/year); handheld polarizers wear (replace every 18–24 months in heavy use); a dirty white reference on a scanning table fakes drift (wipe it daily).`,
          `But the single biggest source of false alarms is <b>mismatched conditions</b> — an M0 reading compared against an M1 target, or polarized vs unpolarized. The template should pin the condition; a mismatch should error out, not silently produce nonsense.`,
        ],
        quiz: {
          q: 'The single biggest source of false ΔE alarms in production is…',
          options: [
            'Cheap ink',
            'Mismatched measurement conditions — e.g. an M0 reading compared to an M1 target, or polarized vs unpolarized',
            'Too many patches on the bar',
          ],
          answer: 1,
          ok: 'Right — pin the condition in the template; a mismatch should error, not silently produce nonsense.',
          no: "It's mismatched conditions (M0 vs M1, polarized vs unpolarized). Pin the condition in the template.",
        },
      },
    ],
  },
];

export default modules;
