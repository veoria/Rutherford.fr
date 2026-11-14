import type { AppModule } from '@/data/academy-app';

// Measuring color on press (course id `measurement-essentials`, URL unchanged).
// 2026-11 rewrite: closer tone ("you"), pressroom scenes told by the Academy
// characters, Rutherford (sheetfed offset) and Veoria DeltaOne (web presses).
//
// Keep 4 modules in this order: module.index = course_progress.lesson_index,
// and ColorMix links to module 2 (index 1) for the M0-M3 lesson.
// DeltaOne facts come from https://veoria.com/product#datasheet only; do not
// attach an M0/M1/M2/M3 condition to DeltaOne.
const modules: AppModule[] = [
  {
    index: 0,
    num: '01',
    title: 'Three ways to read a color',
    time: '7 min',
    summary: 'Handheld, off-press scanning, true inline: which one, for which press.',
    steps: [
      {
        kicker: 'Step 1 · Handheld and scanning',
        headline: 'Your eye is great. It just can’t be emailed.',
        scene: {
          who: 'red',
          text: 'Monday, 6:10 am. Red pulls a sheet, holds it next to the proof under the booth and says “looks good to me”. Next door, Green hasn’t stopped the label press since Friday. Two pressrooms, two ways to read color.',
        },
        paragraphs: [
          `A <b>handheld spectrophotometer</b> reads one patch at a time. It’s cheap, mobile and perfect to check a job, a proof or a customer sample.`,
          `A <b>scanning system</b> reads the whole color bar of a sheet in seconds. Every Rutherford system on sheetfed offset is installed with an X-Rite <b>IntelliTrax2</b>, and many of our customers also run a Techkon <b>SpectroDrive</b>. You still pull the sheet and put it on the table, so it’s fast but not inline: the reading is automated, the sampling isn’t.`,
          `Then the loop closes: the scan tells which ink zones are off, and the Rutherford console moves the ink keys for you.`,
        ],
        illustration: 'ill-devices.svg',
      },
      {
        kicker: 'Step 2 · True inline',
        headline: 'On a web press, you measure while you print',
        scene: {
          who: 'green',
          text: 'Green runs labels at 150 m/min. Pulling a sample every five minutes would mean stopping or cutting the web. So the press measures itself.',
        },
        paragraphs: [
          `Veoria’s <b>DeltaOne</b> sits on the press, travels across the web, finds the color bar on either side by itself and measures it at up to <b>500 m/min</b>, without stopping anything.`,
          `It uses <b>multispectral imaging (MSI)</b>: a calibrated light, a camera that frames each patch, and <b>36 spectral bands</b>, 10 nm apart, from 380 to 730 nm. You get a full spectrum per patch, so L*a*b*, ΔE00 and density are computed from it, just like with a spectrophotometer.`,
          `At Eshuis, an eight-color flexo line in the Netherlands, DeltaOne cut press stops by 50%.`,
        ],
      },
      {
        kicker: 'Step 3 · Pick by process',
        headline: 'Sheet or web decides, not the brochure',
        paragraphs: [
          `<b>Sheetfed offset with ink keys</b>: scan the sheet, correct zone by zone. That’s the Rutherford world.`,
          `<b>Web presses</b> with even ink across the web (flexo, keyless offset, gravure, digital web): measure inline. That’s the DeltaOne world. DeltaOne isn’t made for sheetfed presses or ink-key offset, which need a reading per zone across the sheet.`,
          `Most shops still keep a handheld for spot checks and customer samples.`,
        ],
        quiz: {
          q: 'Green asks why the label line doesn’t just use the sheet scanner from the offset hall. Best answer?',
          options: [
            'The scanner is less accurate',
            'On a web press you’d have to stop or cut the web to sample; an inline system reads the running web',
            'Flexo inks can’t be measured with a spectrophotometer',
          ],
          answer: 1,
          ok: 'Exactly. Same physics, different sampling: inline reads while you print.',
          no: 'Both read color fine. The difference is how you get a sample: pulled sheet versus running web.',
        },
      },
      {
        kicker: 'From the pressroom',
        headline: 'LEFRANCQ: “We can’t run the press without it”',
        paragraphs: [
          `<b>Recap.</b> Handheld for spot checks. Off-press scanning for sheets and ink keys. Inline MSI for webs that never stop.`,
        ],
        video: { youtubeId: '78a006Kulok', title: 'LEFRANCQ Packaging, We can’t run the press without it' },
      },
    ],
  },
  {
    index: 1,
    num: '02',
    title: 'M0, M1, M2, M3: same sheet, four numbers',
    time: '8 min',
    summary: 'Which measurement condition, when, and how to switch.',
    steps: [
      {
        kicker: 'Step 1 · Why four conditions',
        headline: 'Before anyone argues, ask: which M?',
        scene: {
          who: 'pink',
          text: 'Pink, the brand owner, calls: “Your white is 2 ΔE off.” Red measured the same sheet this morning and found it perfect. Blue steps in: “Before anyone argues, which M?”',
        },
        paragraphs: [
          `Most papers contain <b>optical brighteners</b>. They take in UV light and give it back as blue, which makes white look whiter. So the amount of UV in the instrument’s light changes the number you read, most of all on the paper white and light tints.`,
          `ISO 13655 defines four measurement conditions so everyone knows which light was used.`,
        ],
        illustration: 'm-conditions.svg',
      },
      {
        kicker: 'Step 2 · The four, in one line each',
        headline: 'M0, M1, M2, M3',
        paragraphs: [
          `<b>M0</b>: the classic tungsten-like light, with an undefined amount of UV. Most pressrooms, and most of the references they print to, were built on M0, and many still are.`,
          `<b>M1</b>: D50 light including UV. It reads paper the way a D50 viewing booth shows it. It’s the condition of the current standards (ISO 12647-2:2013, FOGRA51/52, GRACoL 2013), and G7 requires it.`,
          `<b>M2</b>: UV cut. Reads the paper as if it had no brighteners. Mainly a diagnostic: the gap between M1 and M2 on the paper white shows how much brightener there is.`,
          `<b>M3</b>: M2 plus a polarizing filter that removes surface gloss, so wet and dry ink read alike. A density tool for the run. Never use it for ΔE against ISO, FOGRA or GRACoL aims, which are measured without polarization.`,
        ],
        illustration: 'ill-oba.svg',
      },
      {
        kicker: 'Step 3 · M0 or M1?',
        headline: 'There’s no wrong answer, only a wrong mix',
        paragraphs: [
          `<b>M0 is still perfectly valid</b> for process control when your targets, your press fingerprint and your customers’ specs are in M0 and nobody asks for a certification.`,
          `<b>Move to M1</b> when a customer specifies it, when you go for G7 or certify against the current ISO 12647-2 data, or when you print on papers loaded with brightener.`,
          `The one rule: <b>target and measurement use the same M</b>. An M1 reading against an M0 target is a false alarm waiting to happen.`,
        ],
        quiz: {
          q: 'Pink measures in M1, Red’s old handheld reads M0. They disagree on the paper white only. Most likely cause?',
          options: [
            'The press drifted between the two readings',
            'Different UV content: brighteners react differently under M1 and M0',
            'Pink’s instrument is broken',
          ],
          answer: 1,
          ok: 'Yes. Paper white is where brighteners show. Agree on one M and measure again.',
          no: 'Look where they disagree: only on white. That points to UV and brighteners, not ink.',
        },
      },
      {
        kicker: 'Step 4 · How Rutherford handles it',
        headline: 'Switch when your customers are ready',
        scene: {
          who: 'blue',
          text: 'You don’t have to choose today. Run on M0, build your M1 references, and switch when your customers ask for it.',
        },
        paragraphs: [
          `On a Rutherford system, M0 or M1 is <b>a setting in the software</b>. IntelliTrax2 reads two conditions in one scan (M0 and M1, for example) and the SpectroDrive offers M0 to M3, so you switch without touching the hardware.`,
          `One exception: the first-generation <b>IntelliTrax</b> works to the older standard and stays on M0. If M1 is on your roadmap, that’s the moment to move to IntelliTrax2.`,
          `<b>Recap.</b> Brighteners make UV matter. M0 still works when your references are in M0. M1 for G7 and the current standards. M2 is a diagnostic, M3 is for density only. Always write down the M.`,
        ],
      },
    ],
  },
  {
    index: 2,
    num: '03',
    title: 'The color bar: print it so you can measure it',
    time: '7 min',
    summary: 'What goes on the bar, on a sheet and on a web.',
    steps: [
      {
        kicker: 'Step 1 · What a bar carries',
        headline: 'No bar, no number',
        scene: {
          who: 'yellow',
          text: 'Prepress moved the bar 60 mm into the sheet “to keep it safe”. On the label job, the designer shrank it to save substrate. Both jobs come back with no readings. Yellow, from quality, is not amused.',
        },
        paragraphs: [
          `Solids for each ink, a few tints, gray-balance patches, overprints, and a patch for every spot color. Without them, no automated system has anything to read.`,
          `One rule for everyone: <b>never varnish or coat over the bar</b>. Coating changes gloss, density and L*a*b*, and your targets are defined on bare ink.`,
        ],
        illustration: 'ill-colorbar.svg',
      },
      {
        kicker: 'Step 2 · On a sheet',
        headline: 'Across the sheet, one patch per ink zone',
        paragraphs: [
          `The bar runs across the sheet, at the gripper or the tail, with patches repeating for every ink zone (zone width depends on the press, often 30 to 38 mm). Each zone gets its own reading, so each ink key gets its own correction.`,
          `IntelliTrax2 reads patches down to <b>2 mm</b> high with its small aperture. Keep the bar close to the edge: the scanner must find it within about <b>38 mm</b> of the sheet edge.`,
        ],
      },
      {
        kicker: 'Step 3 · On a web',
        headline: 'Along the web, sized for the speed',
        paragraphs: [
          `For DeltaOne, the bar runs <b>along the web</b>, in the printing direction, with a start mark so the system knows where it begins. It can mix CMYK, extended gamut and spot patches.`,
          `Patches can be as small as <b>2 × 2 mm</b> at low speed and get longer as the press goes faster, for example <b>2 × 5 mm at 240 m/min</b>. Use the bar layout made for your press and speed; don’t redraw it.`,
          `<b>Recap.</b> A bar on every job, never varnished. Sheet: across, one patch per ink zone, near the edge. Web: along the web, sized for the press speed.`,
        ],
        quiz: {
          q: 'A designer redraws the DeltaOne bar with 2 × 2 mm patches for a job that runs at 240 m/min. What happens?',
          options: [
            'Nothing, smaller is always better',
            'The patches are too short for that speed, so readings become unreliable or fail',
            'The press slows down automatically',
          ],
          answer: 1,
          ok: 'Right. Faster web, longer patches: use the bar made for that speed.',
          no: 'At speed, the camera needs a longer patch in the running direction: about 2 × 5 mm at 240 m/min.',
        },
      },
    ],
  },
  {
    index: 3,
    num: '04',
    title: 'Two instruments, two numbers',
    time: '7 min',
    summary: 'Repeatability, agreement between instruments, and who is right.',
    steps: [
      {
        kicker: 'Step 1 · Same sheet, two numbers',
        headline: 'Don’t touch the press yet',
        scene: {
          who: 'yellow',
          text: 'Yellow holds two reports. The press reads ΔE00 1.3, Pink’s lab reads 1.8 on the very same sheet. Red is ready to re-ink. Blue: “Don’t touch the press yet.”',
        },
        paragraphs: [
          `<b>Repeatability</b>: the same instrument reads the same patch again and again. Good instruments stay around 0.1 ΔE.`,
          `<b>Reproducibility</b>: two different instruments read the same patch. That gap is always bigger. Its name is <b>inter-instrument agreement</b> (IIA), typically around 0.3 ΔE on average for good instruments. DeltaOne is specified at 0.1 ΔE repeatability and 0.3 ΔE agreement.`,
        ],
        illustration: 'ill-repeat.svg',
      },
      {
        kicker: 'Step 2 · Pick a reference',
        headline: 'One reference instrument per customer',
        paragraphs: [
          `For each customer, decide which instrument is the reference, often the brand owner’s. Measure a few known samples on every device, write down the offsets, and align your devices to the reference.`,
          `DeltaOne has an <b>instrument matching</b> function for exactly this: it aligns its readings to a reference handheld (X-Rite, Techkon, Nix and others).`,
          `Then you can say: “our press read 1.3, our handheld 1.6, your lab 1.8, all within agreement.”`,
        ],
        quiz: {
          q: 'Press 1.3, brand owner 1.8, same sheet. First move?',
          options: [
            'Add ink until the press reads 1.8',
            'Check the M condition and the instrument offsets before touching the press',
            'Ask the brand owner to buy your instrument',
          ],
          answer: 1,
          ok: 'Exactly. Same sheet, two numbers: that’s the instruments talking, not the press.',
          no: 'The sheet didn’t change between the two readings. Check the M and instrument agreement first.',
        },
      },
      {
        kicker: 'Step 3 · Keep instruments honest',
        headline: 'Calibrate, recertify, repeat',
        paragraphs: [
          `Lights age, white references get dirty, sensors drift. Calibrate on the white reference as the maker asks (DeltaOne does it automatically on a white ceramic) and get handhelds and scanners <b>recertified every year</b>. Skip it and you slowly walk away from your own reference.`,
          `<b>Recap.</b> One reference instrument per customer. Align everything to it. Recertify every year.`,
        ],
      },
      {
        kicker: 'From the pressroom',
        headline: 'Wauters B’Pack: advancing color precision',
        paragraphs: [`How a packaging printer made measured color the rule, not the exception.`],
        video: { youtubeId: 'yAZbtKzN_j0', title: 'Wauters B’Pack, Advancing color precision' },
      },
    ],
  },
];

export default modules;
