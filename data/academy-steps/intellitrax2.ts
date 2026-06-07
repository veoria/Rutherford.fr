import type { AppModule } from '@/data/academy-app';

// IntelliTrax2 & IntelliTrax2 Pro: Automated Scanning Mastery — step content.
// Condensed from data/academy-lessons.ts (post-#23 corrections).
const modules: AppModule[] = [
  {
    index: 0,
    num: '01',
    title: 'IntelliTrax2 (2900) vs IntelliTrax2 Pro (2900PRO)',
    time: '15 min',
    summary: 'Two scan-head variants for two operational profiles.',
    steps: [
      {
        kicker: 'Step 1 · The two variants',
        headline: 'Standard 2900 vs Pro 2900PRO',
        paragraphs: [
          `<b>IntelliTrax2 (2900)</b> is the standard scanner — successor to the original IntelliTrax (2246, now discontinued). It covers most sheetfed: fast automated scans of a pulled sheet, bar height down to 2 mm (Small Spot; 3 mm Medium), simultaneous M0/M1, M3 via the optional Polarizer head (3 mm min), and 45°/0° ring geometry (ISO 5-4).`,
          `<b>IntelliTrax2 Pro (2900PRO)</b>, introduced March 2021, targets higher throughput and tighter quality — enhancements around uptime, single-pass condition flexibility, and deeper integration with MeasureColor Production.`,
        ],
        illustration: 'ill-devices.svg',
      },
      {
        kicker: 'Step 2 · Choosing on TCO',
        headline: 'Utilization decides, not capital cost',
        paragraphs: [
          `Single-shift, moderate volume, consistent substrate → the 2900 is enough. Multi-shift commercial work, frequent substrate changes, brand owners wanting M1 <i>and</i> M3 in the same job, or 24×5 operation → the Pro. Both share the same maintenance cadence, so the Pro's premium amortizes over utilization: 2 000 scanner-hours/year recovers it quickly, 500 may not. Same software stack, so 2900 → Pro later is not a replatform.`,
        ],
        quiz: {
          q: 'When is the IntelliTrax2 Pro the better fit over the standard 2900?',
          options: [
            "Always — it's the newer model",
            'High-throughput / multi-shift work, frequent substrate changes, or M1+M3 in the same job',
            'Only on digital presses',
          ],
          answer: 1,
          ok: "Right — the Pro's premium amortizes over high utilization; a low-hours line may not recover it.",
          no: 'The Pro fits high-utilization / multi-shift / M1+M3 work; a low-volume single shift is fine on the 2900.',
        },
      },
    ],
  },
  {
    index: 1,
    num: '02',
    title: 'Hardware setup: tracks, sheet positioning, calibration',
    time: '15 min',
    summary: 'The physical install that determines reliability for a decade.',
    steps: [
      {
        kicker: 'Step 1 · Track & positioning',
        headline: 'Pick the longest track; respect the 38 mm edge',
        paragraphs: [
          `IntelliTrax2 sits on a track beside or above the console — lengths run 29 in (74 cm) to 65 in (165 cm) by max sheet size. Pick the longest you can; retrofitting later costs far more than the marginal cost at install. Sheet positioning is critical: the bar must be within 38 mm of the sheet edge, so impositions must respect it.`,
          `Mechanical alignment matters too: the head must be parallel to the sheet plane at the right working distance. Out-of-spec alignment shows up as edge-of-sheet repeatability problems — operator-side patches scan clean, gripper-side drift.`,
        ],
        capture: 'IntelliTrax2 scan track + console installation',
      },
      {
        kicker: 'Step 2 · Calibration & power',
        headline: 'A reference sample you keep for the instrument\'s life',
        paragraphs: [
          `Install calibration is white-tile, black, and instrument-to-instrument matching against a reference sample — that sample is your ground truth for the instrument's life, so store it carefully and re-verify annually. Power and network needs are modest: 100–240 VAC, 50/60 Hz, plus Ethernet. Put a UPS on the controller PC — a power glitch mid-scan can corrupt the current job's data.`,
        ],
        quiz: {
          q: 'Out-of-spec mechanical alignment of the scan head typically shows up as…',
          options: [
            'The whole sheet failing at once',
            'Edge-of-sheet repeatability problems — operator-side patches clean, gripper-side drift',
            'Slower scans only',
          ],
          answer: 1,
          ok: 'Right — alignment errors show as one-side drift; verify at commissioning and after nearby mechanical work.',
          no: 'Misalignment shows as edge-of-sheet (one-side) repeatability, not a uniform fail.',
        },
      },
    ],
  },
  {
    index: 2,
    num: '03',
    title: 'Geometry and the single-pass M0/M1/M3 strategy',
    time: '15 min',
    summary: 'The optical choices baked into every measurement.',
    steps: [
      {
        kicker: 'Step 1 · Geometry & the heads',
        headline: 'Which conditions you get depends on the head',
        paragraphs: [
          `IntelliTrax2 uses <b>45°/0° ring illumination</b> — lit from the full 360° around the 45° cone, read at normal — minimizing directional artifacts (ISO 5-4). Which conditions you capture depends on the head: the Small Spot (2 mm) and Medium (3 mm) heads capture <b>M0 and M1 simultaneously</b> in one pass; the Polarizer head (3 mm min) adds <b>M3</b>, reading polarized and unpolarized in a single scan.`,
          `The trade-off: you cannot combine 2 mm patches with polarized measurement — the Polarizer head needs 3 mm.`,
        ],
        illustration: 'ill-geometry.svg',
      },
      {
        kicker: 'Step 2 · Single-pass value & specs',
        headline: 'One pulled sheet satisfies a legacy and a modern spec',
        paragraphs: [
          `Single-pass dual-condition matters operationally: without it you'd scan each sheet twice. One pulled sheet can satisfy both a legacy M0 contract and a modern M1 OBA-aware spec. Spectral range is 400–700 nm at 10 nm; inter-instrument agreement averages 0.3 ΔEab, max 0.45 (X-Rite published — the realistic ceiling for bar scanning).`,
          `For contracts specifying <b>M2</b>, note IntelliTrax2 derives M2 in software from M1/M0 rather than directly — adequate for production, though a dedicated M2 spectro is preferable for primary characterization.`,
        ],
        quiz: {
          q: 'You need 2 mm color-bar patches AND polarized (M3) readings in the same pass. Possible?',
          options: [
            'Yes, always',
            "No — the Polarizer head needs 3 mm patches, so you can't combine 2 mm with polarized",
            'Only on the 2900PRO',
          ],
          answer: 1,
          ok: 'Right — 2 mm is the Small Spot head; polarized needs the 3 mm Polarizer head. Pick one constraint.',
          no: 'No — polarized (M3) needs the 3 mm Polarizer head; 2 mm is Small-Spot only.',
        },
      },
    ],
  },
  {
    index: 3,
    num: '04',
    title: 'Color bars sized for 2 mm: what fits, what breaks',
    time: '15 min',
    summary: 'The smallest patches in the industry, and their constraints.',
    steps: [
      {
        kicker: 'Step 1 · What fits at 2 mm',
        headline: 'Less printable area stolen, more patches',
        paragraphs: [
          `IntelliTrax2 reads patches down to 2 mm (Small Spot) or 3 mm (Medium / Polarizer) vs the 4–5 mm of legacy systems — so bars steal less printable area and fit more patches. What fits: solids C/M/Y/K, 75 / 50 / 25 / 5 % tones, gray balance, overprints R/G/B, and per-zone bars across the full width. A 32-zone bar plus globals fits comfortably on a B1.`,
        ],
        illustration: 'ill-colorbar.svg',
      },
      {
        kicker: 'Step 2 · What breaks & the trade-off',
        headline: 'Register tightens; repeatability eases',
        paragraphs: [
          `At 2 mm, ink misregister (0.05–0.1 mm) shows as patch-to-patch variation, so tight register is a precondition. Don't confuse patch width with zone width: each patch (3–4 mm wide) sits at the zone pitch (~30–38 mm), so the bar spans the full ~1 m live width on B1. The trade-off: 2 mm patches have lower repeatability than 4 mm (smaller integration window).`,
        ],
        quiz: {
          q: 'For an occasional press fingerprint where you want maximum statistical confidence, which patch size?',
          options: [
            '2 mm — smaller is always better',
            '4 mm — larger patches give higher repeatability; save 2 mm for routine production',
            'It makes no difference',
          ],
          answer: 1,
          ok: 'Right — bigger patches = higher repeatability. 2 mm for routine production, 4 mm for fingerprinting.',
          no: 'Use 4 mm for fingerprinting (higher repeatability); 2 mm is the routine-production size.',
        },
      },
    ],
  },
  {
    index: 4,
    num: '05',
    title: 'Maintenance: non-contact, UV LED life, certification',
    time: '15 min',
    summary: 'The recurring costs that protect your data.',
    steps: [
      {
        kicker: 'Step 1 · Non-contact & UV LED',
        headline: 'No rollers to wear; the UV source ages',
        paragraphs: [
          `Non-contact measurement is a structural advantage: the head doesn't touch the sheet — no contact wear, no ink transfer, no scratches — which is why scanners outlive handhelds at equal duty. The dominant aging factor is <b>UV-LED life</b>: output decreases with hours, M1 readings drift, inter-instrument agreement degrades. Annual recertification (X-Rite or a certified partner) restores calibration and resets the drift clock.`,
        ],
        capture: 'IntelliTrax2 maintenance / certification record',
      },
      {
        kicker: 'Step 2 · Certification & routine',
        headline: 'The cert paperwork travels with the data',
        paragraphs: [
          `Certification is also contractual — some brand owners require evidence of recent certification before accepting reports, so keep the paperwork in MeasureColor metadata, not a separate file. Routine maintenance is light: wipe the white reference daily, check the track weekly, verify alignment quarterly. X-Rite has 40+ certified partners globally (on-site typically within 24 h); negotiate the service contract upfront — reactive service costs more than proactive.`,
        ],
        quiz: {
          q: "What's the dominant aging factor on IntelliTrax2, and the fix?",
          options: [
            'Roller wear — replace the rollers',
            'UV-LED output decline (M1 drifts, IIA degrades) — annual recertification restores calibration',
            'Sheet scratches — replace the platen',
          ],
          answer: 1,
          ok: "Right — it's non-contact (no rollers/platen); UV-LED aging is the driver, fixed by annual recertification.",
          no: "It's UV-LED aging (drifts M1/IIA), fixed by annual recertification. Non-contact means no rollers to wear.",
        },
      },
    ],
  },
  {
    index: 5,
    num: '06',
    title: 'Migrating from legacy IntelliTrax (2246)',
    time: '15 min',
    summary: 'The discontinued generation and the upgrade path.',
    steps: [
      {
        kicker: 'Step 1 · Why migrate, what carries over',
        headline: 'Templates and tolerances come with you',
        paragraphs: [
          `The original IntelliTrax (model 2246) is explicitly discontinued: parts are scarce and 2246 service expertise is winding down — plan the migration before it becomes urgent. The good news: software workflows carry over. The same MeasureColor Production install supports a 2900 or 2900PRO after the hardware swap; job templates, color bars and tolerance libraries are device-agnostic and don't need rebuilding.`,
        ],
        capture: 'Legacy IntelliTrax 2246 → IntelliTrax2 upgrade',
      },
      {
        kicker: 'Step 2 · What changes & planning',
        headline: 'Plan the window; recover the cost within a year',
        paragraphs: [
          `What changes: faster scans (under 10 s vs 15–20), tighter minimum patch (2 mm vs 4 mm), single-pass dual-condition measurement, and broader IIA specs. The operator delta is small — a 2246 operator picks up the 2900 within a shift. Plan the window carefully: ~half a day for the swap plus ~half a day calibration/verification; schedule it in a low-demand window, not the week before a brand-owner audit. Migration cost is typically 15–25 % of an original purchase, usually recovered within a year on productivity alone.`,
        ],
        quiz: {
          q: 'Migrating from a 2246 to a 2900 — do you rebuild your job templates and tolerance libraries?',
          options: [
            'Yes, from scratch',
            "No — they're device-agnostic above the hardware layer; the same MeasureColor Production carries them over",
            'Only the tolerances',
          ],
          answer: 1,
          ok: "Right — templates/bars/tolerances are device-agnostic; the swap isn't a software replatform.",
          no: 'No — they carry over; templates and tolerances live above the hardware abstraction layer.',
        },
      },
    ],
  },
];

export default modules;
