import type { AppModule } from '@/data/academy-app';

// MeasureColor Reports: Dashboards, Root-Cause & Continuous Improvement.
// Condensed from data/academy-lessons.ts.
const modules: AppModule[] = [
  {
    index: 0,
    num: '01',
    title: 'The Reports module architecture: press to dashboard',
    time: '13 min',
    summary: 'How measurement data becomes management insight.',
    steps: [
      {
        kicker: 'Step 1 · It sits on Production',
        headline: 'Production captures; Reports aggregates',
        paragraphs: [
          `MeasureColor Reports is not standalone — it is a module on top of MeasureColor Production. Production captures the measurement events; Reports aggregates, visualizes and reports on them. Without Production feeding it, Reports has nothing to show.`,
          `The data flow has three stages: <b>capture</b> at the press (every measurement timestamped and tagged with job, operator, machine, template and the spectral data), <b>storage</b> in the Production database (a Microsoft SQL Server instance you host), and <b>query</b> by Reports to render dashboards.`,
        ],
        illustration: 'ill-dataflow.svg',
      },
      {
        kicker: 'Step 2 · Federated vs centralized',
        headline: 'An install-time choice you can\'t easily undo',
        paragraphs: [
          `For multi-site operations, each plant runs its own Production instance and database. Reports can either query each directly (<b>federated</b> — lower latency, harder governance) or pull a nightly sync into a central warehouse (<b>centralized</b> — the opposite). Real-time dashboards refresh every 1–5 minutes; scheduled reports email PDFs on a cadence.`,
          `Architecture decisions made at install dictate what you can do later: centralize if you intend to run cross-site KPIs; federate if plants operate independently.`,
        ],
        quiz: {
          q: 'MeasureColor Reports shows nothing on its own. Why?',
          options: [
            'It needs a live internet connection',
            "It's a module on top of Production — Production captures the measurements; Reports only aggregates and visualizes them",
            'It only works with handheld devices',
          ],
          answer: 1,
          ok: 'Right — no Production feeding it, no data to report.',
          no: 'Reports sits on Production: Production captures, Reports aggregates. No Production data → nothing to show.',
        },
      },
    ],
  },
  {
    index: 1,
    num: '02',
    title: 'Building dashboards that matter',
    time: '13 min',
    summary: 'Per machine, per operator, per brand — three axes.',
    steps: [
      {
        kicker: 'Step 1 · Machine & operator',
        headline: 'A dashboard that shows everything shows nothing',
        paragraphs: [
          `The useful dashboards slice along three axes. <b>Per machine</b> answers "is this press performing?" — average makeready ΔE00, makeready duration, paper waste per makeready, month trend. A press that drifts week to week needs preventive-maintenance scoping. <b>Per operator</b> answers "are operators consistent?" — comparing operators on the same machine across similar jobs surfaces training opportunities.`,
        ],
        capture: 'Reports — per-machine and per-operator dashboards',
      },
      {
        kicker: 'Step 2 · Brand owner',
        headline: 'The view you screen-share in a quarterly review',
        paragraphs: [
          `<b>Per brand-owner</b> answers "are we meeting customer specs?" — aggregate ΔE00 distribution per brand, rejects per quarter, audit-ready records. Build these three dashboards first and ignore the rest: every additional dashboard is operating expense, so only build what people actually use.`,
        ],
        quiz: {
          q: 'Reports ships many dashboards. Which three actually drive production management?',
          options: [
            'Per ink, per hour, per plate',
            'Per machine, per operator, per brand-owner',
            'Per font, per file size, per RIP',
          ],
          answer: 1,
          ok: 'Right — machine (is the press OK?), operator (are we consistent?), brand (are we meeting spec?).',
          no: 'The three that matter: per machine, per operator, per brand-owner.',
        },
      },
    ],
  },
  {
    index: 2,
    num: '03',
    title: 'Drill-down for root-cause analysis',
    time: '13 min',
    summary: 'From "rejects are up" to "this is what broke".',
    steps: [
      {
        kicker: 'Step 1 · A flat number tells you nothing',
        headline: 'Drill by the dimension that explains the most variance',
        paragraphs: [
          `"Reject rate up 30 % this quarter" is a problem statement, not a root cause. Reports lets you drill from the headline into machine, shift, operator, substrate, ink batch. Start with the dimension explaining the most variance — usually <b>machine</b> (one press drives most of the increase) — then <b>time</b>: a steady rise vs a discrete start date, which points to a specific event (a part change, a software update, a personnel change).`,
        ],
        capture: 'Reports — drill-down: machine → time → shift → substrate',
      },
      {
        kicker: 'Step 2 · Each drill is a hypothesis test',
        headline: 'A week of spreadsheets becomes a half-hour',
        paragraphs: [
          `Then drill into <b>shift</b> (all shifts or one? a single shift points to procedural drift) and <b>substrate</b> (only certain papers? batch or ink-paper interaction). Reports re-slices in seconds, so each drill is a fast hypothesis test. The goal isn't perfect attribution every time — it's to narrow the search space fast enough to fix it before the brand-owner audit notices.`,
        ],
        quiz: {
          q: 'Reject rate is up 30 % this quarter. What is the first drill-down to try?',
          options: [
            'Randomly sample jobs and eyeball them',
            'The dimension that explains the most variance — usually machine, then time (steady rise vs a specific start date)',
            'Ask each operator what they remember',
          ],
          answer: 1,
          ok: 'Right — biggest-variance dimension first (usually machine), then time, shift, substrate.',
          no: 'Drill by largest variance first — usually machine — then time/shift/substrate.',
        },
      },
    ],
  },
  {
    index: 3,
    num: '04',
    title: 'Brand-owner reporting: what to send, in which format',
    time: '13 min',
    summary: 'The supplier side of the contract conversation.',
    steps: [
      {
        kicker: 'Step 1 · What to send',
        headline: 'Quality reports are now contract terms',
        paragraphs: [
          `Major brand owners now ask suppliers for quarterly or monthly quality reports as standard contract terms — automate them and you win on cost. Common asks: aggregate ΔE00 distribution per ink per quarter, jobs delivered, rejects with root-cause notes, a certificate of conformance per job. Sophisticated owners also want a <b>PQX</b> file per delivery so they can re-verify your numbers.`,
        ],
        illustration: 'ill-formats.svg',
      },
      {
        kicker: 'Step 2 · Format & best practice',
        headline: 'Send it before they ask',
        paragraphs: [
          `<b>PDF</b> is universal and human-readable but hard to re-analyze; <b>PQX</b> (ISO 20616-1) is machine-readable and increasingly the contract standard; <b>CXF</b> carries spectral data for owners with their own color-science teams. Build the layout once and re-run per period.`,
          `The single best practice: send the report <i>before</i> the brand owner asks. Customers who receive a quality report unprompted at month-end develop trust that translates into longer contracts and less audit pressure.`,
        ],
        quiz: {
          q: 'Best single practice in supplier-to-brand-owner quality reporting?',
          options: [
            'Send a report only when the customer requests it',
            'Send it unprompted at month-end — it builds trust and reduces audit pressure',
            'Send raw spectral files with no summary',
          ],
          answer: 1,
          ok: 'Right — unprompted month-end reporting builds trust that translates into longer contracts.',
          no: 'Send it before they ask. Unprompted month-end reports build trust and lower audit pressure.',
        },
      },
    ],
  },
  {
    index: 4,
    num: '05',
    title: 'Benchmarking machines, operators, shifts, sites',
    time: '13 min',
    summary: 'Comparison as the foundation of improvement.',
    steps: [
      {
        kicker: 'Step 1 · Context, not isolation',
        headline: 'A number means nothing without its peer group',
        paragraphs: [
          `ΔE00 = 1.4 is good or bad only relative to what the same press, shift and operator usually achieve. Reports makes benchmarking the default: every metric is shown against its peer group. <b>Machine vs machine</b> surfaces equipment issues — if press B runs 0.4 ΔE worse than A and C on similar work, the press is the variable: a maintenance signal, not an operator one.`,
        ],
        capture: 'Reports — benchmark view (metric vs peer group)',
      },
      {
        kicker: 'Step 2 · Operator, shift, site',
        headline: 'Identify who could teach whom',
        paragraphs: [
          `<b>Operator vs operator</b> (identical jobs as the control) shows who runs tighter or faster — it identifies who could teach whom, not who to blame. <b>Shift vs shift</b> surfaces procedural drift. <b>Site vs site</b> is the most strategic but the hardest: the metrics must control for substrate mix, job mix and machine generation. Reports handles the slicing; the manager owns the interpretation.`,
        ],
        quiz: {
          q: 'Press B runs 0.4 ΔE worse than presses A and C on similar work. What does benchmarking suggest?',
          options: [
            "Coach press B's operators harder",
            'Scope preventive maintenance on press B — the machine is the variable, not the people',
            'Tighten everyone\'s tolerances',
          ],
          answer: 1,
          ok: 'Right — a machine-level gap is a maintenance signal, not an operator-coaching one.',
          no: 'Same work, machine-level gap → equipment signal (maintenance), not an operator one.',
        },
      },
    ],
  },
  {
    index: 5,
    num: '06',
    title: 'Driving continuous improvement loops with Reports',
    time: '13 min',
    summary: 'From dashboard observation to operational change.',
    steps: [
      {
        kicker: 'Step 1 · Observe & hypothesize',
        headline: 'Dashboards surface signal; they don\'t fix anything',
        paragraphs: [
          `Reports is the start of a continuous-improvement loop, not the end. The loop has four steps: <b>observe, hypothesize, act, verify</b>. Observe is the weekly headline scan — anything trending wrong gets flagged. Hypothesize happens in the drill-down: isolate the likely cause and write it as a falsifiable prediction — "if we change X, ΔE00 average should drop from 1.8 to under 1.5 within four weeks".`,
        ],
        illustration: 'ill-learning-curve.svg',
      },
      {
        kicker: 'Step 2 · Act & verify',
        headline: 'Next month\'s dashboard is the verdict',
        paragraphs: [
          `<b>Act</b> is the operational change — a maintenance procedure, an operator training session, a tolerance adjustment, a substrate qualification — logged with the hypothesis it tests. <b>Verify</b> is next month's dashboard: the prediction holds or it doesn't. Propagate what works; revise what doesn't. A pressroom that runs this loop monthly outperforms one that doesn't, even with identical equipment — the discipline is the differentiator.`,
        ],
        quiz: {
          q: 'Reports shows night-shift ΔE00 trending up. What turns that observation into improvement?',
          options: [
            'Noting it and moving on',
            'Running the loop: hypothesize a cause, act (training/maintenance/tolerance), then verify on next month\'s dashboard',
            'Buying a new press',
          ],
          answer: 1,
          ok: 'Right — observe → hypothesize → act → verify. The loop creates the improvement, not the dashboard alone.',
          no: 'Dashboards only surface signal. Improvement = observe → hypothesize → act → verify, monthly.',
        },
      },
    ],
  },
];

export default modules;
