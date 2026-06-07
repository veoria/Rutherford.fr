import type { AppModule } from '@/data/academy-app';

// Press-Side Measurement Essentials — step content for the player.
// Condensed from data/academy-lessons.ts (post-#23 corrections) into the
// idea -> illustration -> formative micro-quiz format. Module index is 0-based
// and matches course_progress.lesson_index.
const modules: AppModule[] = [
  {
    index: 0,
    num: '01',
    title: 'Handheld vs automated scanning vs true inline',
    time: '9 min',
    summary: 'Three device classes, three different jobs.',
    steps: [
      {
        kicker: 'Step 1 · The classes',
        headline: 'Handheld, scanning table, automated scanner — and true inline',
        paragraphs: [
          `<b>Handheld spectros</b> (X-Rite eXact 2 family) are the swiss-army knives: single-patch reads, mobile, low entry cost, no host PC. Right when you measure infrequently, verify one patch, or check a job at the customer site. <b>Strip readers</b> sit beside the press and scan the full-width color bar in a few seconds — the speed/cost balance for mid-volume sheetfed.`,
          `<b>Automated scanning</b> (IntelliTrax2 / IntelliTrax2 Pro) is the press-side high end — but it is <b>not inline</b>: the operator pulls a sheet from the delivery and places it on the scan track; only the <i>reading</i> is automated, not the sampling. <b>True inline</b> is a separate class: cameras/spectros mounted inside the press that read continuously without pulling sheets.`,
        ],
        illustration: 'ill-devices.svg',
      },
      {
        kicker: 'Step 2 · The choice',
        headline: 'Match the device to your volume, not the brochure',
        paragraphs: [
          `It is never "which is best" — it is "which fits your volume and your tolerance". A 50-makeready-per-week shop on tight ΔE specs needs automated scanning at minimum; a 5-per-week shop on forgiving work lives happily with a handheld. Most real shops own at least two classes and use them for different jobs.`,
        ],
        quiz: {
          q: 'An automated scanner like IntelliTrax2 reads the whole bar in seconds — so why is it still not an "inline" system?',
          options: [
            'It only reads one patch at a time',
            'The operator still pulls the sheet and places it on the track off-press — only the reading is automated',
            'It is mounted inside the press and reads every sheet',
          ],
          answer: 1,
          ok: 'Right — it automates the reading, not the sampling. True inline reads continuously, inside the press.',
          no: 'Inline = inside the press, continuous. IntelliTrax2 is off-press: the operator pulls and places the sheet.',
        },
      },
    ],
  },
  {
    index: 1,
    num: '02',
    title: 'The geometry that matters: 45°/0°, polarization, UV',
    time: '9 min',
    summary: 'Three optical choices that drive your results.',
    steps: [
      {
        kicker: 'Step 1 · Geometry & polarization',
        headline: '45°/0° reads like the eye; polarization is a density trick',
        paragraphs: [
          `<b>45°/0°</b> lights the sample at 45° and reads at normal (0°) — it best simulates how the eye sees a print (ISO 5-4). IntelliTrax2 uses 45°/0° ring illumination to kill directional artifacts.`,
          `<b>Polarization</b> removes surface gloss, giving a "wet" density reading even on a dry sheet — handy to compare wet press readings to dry. It raises density ~0.05–0.20 D and varies between instruments (worsening inter-instrument agreement). The rule: polarized (<b>M3</b>) data is for <b>density only</b> — never for G7 or any ΔE check against ISO / GRACoL / FOGRA aims, which are all defined unpolarized.`,
        ],
        illustration: 'ill-geometry.svg',
      },
      {
        kicker: 'Step 2 · UV — and the varnish trap',
        headline: 'M1 reads the paper the way your customer sees it',
        paragraphs: [
          `Most papers carry optical brighteners that fluoresce under UV. <b>M1</b> (D50, UV included) reads the sheet as your customer's D50 booth shows it — the default for current work. <b>M2</b> (UV-cut) is mainly a diagnostic.`,
          `Don't confuse UV-in-the-measurement with UV in the <i>process</i> (UV varnish, LED-UV inks). Golden rule: <b>never varnish or coat over the control strip</b> — coating shifts gloss, density and L*a*b*, and your targets are defined on bare ink. Plan a varnish knockout over the bar; and a conventional-drying fingerprint is <i>not</i> valid for a press converted to LED-UV.`,
        ],
        quiz: {
          q: "You're running a G7 calibration and checking ΔE against FOGRA aims. Which measurement condition must you NOT use?",
          options: ['M1 (D50, UV included)', 'M3 (polarized)', 'M0 (legacy tungsten)'],
          answer: 1,
          ok: 'Correct — M3 is polarized and density-only; G7 and ISO/GRACoL/FOGRA aims are unpolarized, so use M1.',
          no: 'M3 is polarized — a density tool. Reference aims are unpolarized; G7 requires M1.',
        },
      },
    ],
  },
  {
    index: 2,
    num: '03',
    title: 'Color bars decoded: what to put on the sheet and why',
    time: '9 min',
    summary: 'The bar is the bridge between press and measurement.',
    steps: [
      {
        kicker: 'Step 1 · What the bar carries',
        headline: 'No bar, nothing to read',
        paragraphs: [
          `A color bar is the strip of patches on every sheet (gripper or tail): solids per ink, percentage tints, gray-balance patches, overprints, and dedicated patches for any spot colors. Without it, automated measurement has nothing to find.`,
          `Common systems — System Brunner, GMI / Bestcolor, X-Rite Standard, or customer-specific bars — differ in patch sequence, size and special tests. The right one depends on customer requirements and your device.`,
        ],
        illustration: 'ill-colorbar.svg',
      },
      {
        kicker: 'Step 2 · The two placement rules',
        headline: 'Patch height, zone pitch, and the 38 mm edge',
        paragraphs: [
          `IntelliTrax2 reads patches down to <b>2 mm</b> (Small Spot head; 3 mm Medium). One patch (or group) sits per ink zone at the zone pitch (~30–38 mm by OEM), so the bar spans the full live width — about a metre on B1 — even though each patch is only 3–4 mm wide.`,
          `Prepress owns two musts: a <b>varnish-free reserve</b> over the bar, and the <b>edge distance</b> — IntelliTrax2 must engage the bar within ~38 mm of the sheet edge. Too far in and it won't scan; too close to the edge and it can't position.`,
        ],
        quiz: {
          q: 'Prepress pushes the color bar 60 mm in from the sheet edge "to keep it safe". What breaks?',
          options: [
            'Nothing — further in is always safer',
            'The scan head must engage the bar within ~38 mm of the edge, so it can\'t position reliably',
            'The patches become too tall to read',
          ],
          answer: 1,
          ok: 'Right — it\'s an edge-distance constraint (~38 mm), not a safety margin.',
          no: 'It\'s about the scanner\'s edge distance (~38 mm) — too far in and the head can\'t engage the bar.',
        },
      },
    ],
  },
  {
    index: 3,
    num: '04',
    title: 'Repeatability vs reproducibility',
    time: '8 min',
    summary: 'The trap that costs you hours.',
    steps: [
      {
        kicker: 'Step 1 · Two different numbers',
        headline: 'Same instrument twice, vs two different instruments',
        paragraphs: [
          `<b>Repeatability</b> is the variation when one instrument reads the same sample repeatedly — intrinsic to the device (a modern handheld ≈ 0.05 ΔE on white; IntelliTrax2 ≤ 0.15 ΔE). <b>Reproducibility</b> is the variation across <i>different</i> instruments, operators, times — always worse. The metric is Inter-Instrument Agreement (IIA): a good spectro reports ≈ 0.3 ΔE average / 0.45 max.`,
          `Why it bites: the brand owner's handheld in their lab will read a different number than your scanner at the press — on the <i>same</i> sample. Miss this and you'll chase a phantom drift that is really just instrument disagreement.`,
        ],
        illustration: 'ill-repeat.svg',
      },
      {
        kicker: 'Step 2 · The fix',
        headline: 'Pick a reference instrument, document the offsets, recertify',
        paragraphs: [
          `The fix is procedural: name the reference instrument for each customer relationship, calibrate the others against it on known samples, and document the offsets. Then you can say "our scanner read 1.3, our handheld 1.6, both agree with your 1.8 within IIA."`,
          `The other fix is hardware: scheduled <b>annual recertification</b> of every device. UV LED sources drift, sensors age, tile references wear — skip it and you slowly walk away from your own reference.`,
        ],
        quiz: {
          q: 'Your scanner reads ΔE00 1.3; the brand owner\'s handheld reads 1.8 on the same sheet. First conclusion?',
          options: [
            'The press drifted overnight',
            'Likely inter-instrument agreement — different instruments disagree; establish a reference and document the offset',
            'Your scanner is broken',
          ],
          answer: 1,
          ok: 'Exactly — IIA (~0.3–0.45 ΔE) explains the gap. Reference instrument + documented offsets settle it.',
          no: 'Same sheet, two instruments → that\'s reproducibility/IIA, not press drift.',
        },
      },
    ],
  },
];

export default modules;
