import type { AppModule } from '@/data/academy-app';

// ColorLoop AI: Predictive Setup for Modern Offset — step content.
// Condensed from data/academy-lessons.ts. ColorLoop is the automatic-learning
// layer above EasySet's operator-driven presetting.
const modules: AppModule[] = [
  {
    index: 0,
    num: '01',
    title: 'What "AI-guided makeready" actually means',
    time: '14 min',
    summary: 'Cutting through the hype to the working definition.',
    steps: [
      {
        kicker: 'Step 1 · What it is',
        headline: 'Supervised learning on your own job history',
        paragraphs: [
          `ColorLoop's AI is <b>not</b> a generative model and is not the technology behind ChatGPT. It is a supervised-learning system trained on <i>your</i> pressroom's historical measurement data: it learns the relationship between job inputs (substrate, ink set, coverage profile, ambient conditions) and the ink-key positions that achieved good color on similar past jobs.`,
          `What it does: predict the starting ink-key positions for a new job from the closest historical match, then let real-time closed-loop refine it during makeready — fewer correction cycles to target.`,
        ],
        illustration: 'ill-autonomy.svg',
      },
      {
        kicker: 'Step 2 · What it does not do',
        headline: 'A refinement on top of closed-loop, not a replacement',
        paragraphs: [
          `It does not replace the closed-loop beneath it. The AI is a starting-point predictor; the loop is the actual controller. Remove the loop and the AI alone is a guess. Remove the AI and the loop still works — it falls back to <b>EasySet</b>, where the operator records references and EasySet adjusts the curves. What ColorLoop adds is <b>automation</b>: it decides on its own what to record for the next learning cycle, removing the risk of learning from a job the operator recorded by mistake.`,
          `Honest framing: AI-guided makeready typically saves 15–30 % of <i>additional</i> time and waste on top of vanilla closed-loop (which already saved 30–55 %). Not running closed-loop yet? Get it in production first, accumulate 6–12 months of history, then enable the AI.`,
        ],
        quiz: {
          q: "What's the honest relationship between ColorLoop's AI and the closed-loop layer beneath it?",
          options: [
            'The AI replaces closed-loop',
            'The AI predicts the starting ink-key positions; the closed-loop is still the controller — remove it and the AI is just a guess',
            'They are the same thing',
          ],
          answer: 1,
          ok: 'Right — AI = starting-point predictor (~15–30 % on top); the loop controls. Get the loop running first.',
          no: 'The AI predicts the start; the closed-loop still controls. The AI is a refinement, not a replacement.',
        },
      },
    ],
  },
  {
    index: 1,
    num: '02',
    title: 'Training the model on your jobs: 30, 90, 365 days',
    time: '14 min',
    summary: 'The learning curve, with realistic expectations.',
    steps: [
      {
        kicker: 'Step 1 · Cold start to 90 days',
        headline: 'Useful within a month, broad by 90 days',
        paragraphs: [
          `Day zero is the cold start: no history, so the model falls back to a generic CIP3 position and the closed-loop does the rest — roughly standard closed-loop without AI. After <b>30 days</b> (~90–120 makereadies) it makes useful predictions on familiar work: +10–15 % faster to target vs generic CIP3. After <b>90 days</b> (300+ makereadies) it covers most routine production and substrate quirks: +20–25 %.`,
        ],
        illustration: 'ill-learning-curve.svg',
      },
      {
        kicker: 'Step 2 · A year, and resets',
        headline: 'New variable, new training window',
        paragraphs: [
          `After <b>365 days</b> (~700–900 makereadies at 3/day, 5 days) it has seen seasonal effects and edge cases: +25–35 % over generic CIP3, improving beyond a year but flattening. A new press, substrate or ink supplier needs fresh training data — expect 30–60 days of slightly degraded prediction after a major input change, then back to the previous rate.`,
        ],
        quiz: {
          q: "You switch to a new ink supplier. What happens to ColorLoop's predictions?",
          options: [
            'Nothing — the model is supplier-agnostic',
            'Expect 30–60 days of slightly degraded prediction while it learns the new variable, then back to rate',
            'It permanently resets to zero',
          ],
          answer: 1,
          ok: 'Right — a major input change needs fresh data: ~30–60 days degraded, then recovery.',
          no: 'A new variable (supplier/substrate/press) needs new data: ~30–60 days degraded, then back to rate.',
        },
      },
    ],
  },
  {
    index: 2,
    num: '03',
    title: 'Predictive ink-key positioning vs reactive correction',
    time: '14 min',
    summary: 'Anticipating the curve versus chasing it.',
    steps: [
      {
        kicker: 'Step 1 · Reactive',
        headline: 'Measure, compare, move, repeat — 10 to 30 sheets',
        paragraphs: [
          `Reactive correction is what every closed-loop does: measure the sheet, compare to target, move the keys, measure the next. The cycle is fast (5–10 s per iteration) and usually converges within 10–30 sheets — and those sheets are the waste between "press started" and "press in target".`,
        ],
        illustration: 'ill-loop4.svg',
      },
      {
        kicker: 'Step 2 · Predictive',
        headline: 'A better starting point means fewer cycles',
        paragraphs: [
          `Predictive positioning aims to eliminate part of that waste: if the AI predicts the right opening before the press starts, sheet one is already close, so the loop runs fewer iterations and produces fewer waste sheets. The effect is multiplicative — 70 % of the way to target instead of 40 % means fewer cycles. It shines on jobs similar to history and stalls on genuinely new work, so the system reports a <b>confidence</b> with each prediction. In practice, 20-minute makereadies drop to 12–15.`,
        ],
        quiz: {
          q: 'How does predictive positioning cut waste compared to reactive correction alone?',
          options: [
            'It removes the need for any measurement',
            'It starts sheet one already close to target, so the loop runs fewer correction cycles — fewer waste sheets',
            'It simply runs the press faster',
          ],
          answer: 1,
          ok: 'Right — a better start means fewer loop iterations, and it reports confidence so you know when to trust it.',
          no: 'It gets sheet one closer to target, so the loop needs fewer cycles — fewer waste sheets.',
        },
      },
    ],
  },
  {
    index: 3,
    num: '04',
    title: "ColorLoop's data layer: press, measurement, MIS",
    time: '14 min',
    summary: 'The pipes between systems that make the AI work.',
    steps: [
      {
        kicker: 'Step 1 · The inputs',
        headline: 'AI is only as good as its training data',
        paragraphs: [
          `The data layer feeds the model from four sources. <b>Press telemetry</b> — ink-key positions, fountain chemistry, blanket pressure, plate temperature, register, impressions/min — via JDF/JMF, OPC UA or OEM XML. <b>Measurement data</b> from IntelliTrax2 / MeasureColor is the ground truth (inputs X produced color Y). <b>MIS metadata</b> adds business context (customer, substrate, ink batch, deadline) for similarity matching. <b>Environmental data</b> (temperature, humidity) closes the loop on physical effects.`,
        ],
        illustration: 'ill-dataflow.svg',
      },
      {
        kicker: 'Step 2 · Data quality decides',
        headline: 'Rich telemetry → results in 30 days',
        paragraphs: [
          `A 5 °C swing between shifts changes ink viscosity and substrate behavior — the model needs to know. The data layer is the single biggest determinant of ColorLoop's effectiveness: a pressroom with rich telemetry and clean MIS data sees useful prediction within 30 days; one with patchy telemetry takes 90+ days to reach the same level.`,
        ],
        quiz: {
          q: "What most determines how fast ColorLoop's AI becomes useful?",
          options: [
            'The press brand',
            'The data layer — rich press telemetry + clean MIS data → results in ~30 days; patchy data → 90+ days',
            'The number of operators on shift',
          ],
          answer: 1,
          ok: 'Right — the AI is only as good as its training data; the data layer is the biggest determinant.',
          no: "It's the data layer: rich telemetry + clean MIS data accelerates it; patchy data slows it to 90+ days.",
        },
      },
    ],
  },
  {
    index: 4,
    num: '05',
    title: 'From operator decision to autonomous correction',
    time: '14 min',
    summary: 'The cultural change, paced over months.',
    steps: [
      {
        kicker: 'Step 1 · Advisory & assisted',
        headline: 'Autonomy is a continuum, not a switch',
        paragraphs: [
          `ColorLoop supports four stages. <b>Stage 1 — advisory</b>: the system shows its prediction and recommended actions, but the operator executes every adjustment manually (first 4–8 weeks). <b>Stage 2 — assisted</b>: the operator approves each recommendation with one click before it executes — the "one human in the loop" mode that satisfies most quality-management policies (2–4 months).`,
        ],
        illustration: 'ill-adoption.svg',
      },
      {
        kicker: 'Step 2 · Supervised & fully autonomous',
        headline: 'High-stakes work often stays supervised',
        paragraphs: [
          `<b>Stage 3 — supervised autonomous</b>: the system corrects automatically; the operator monitors and intervenes only on alerts (production mode after 6+ months of history). <b>Stage 4 — fully autonomous</b>: end-to-end, including correction decisions, with the operator handling exceptions and physical interventions — reach it cautiously and only on well-understood job categories; high-stakes brand-owner work often stays at stage 3 indefinitely. Each transition is a deliberate decision with documented criteria (e.g. 30 consecutive stage-2 jobs with no escalations), reviewed quarterly.`,
        ],
        quiz: {
          q: 'How should a pressroom move toward autonomous correction with ColorLoop?',
          options: [
            'Flip to fully autonomous on day one',
            'Through deliberate stages (advisory → assisted → supervised → fully autonomous) with documented criteria; high-stakes work often stays supervised',
            'Never use any autonomy at all',
          ],
          answer: 1,
          ok: "Right — it's a staged continuum with documented transition criteria; stage 4 is reserved for well-understood jobs.",
          no: "It's a staged continuum (advisory → assisted → supervised → autonomous), not a day-one switch.",
        },
      },
    ],
  },
];

export default modules;
