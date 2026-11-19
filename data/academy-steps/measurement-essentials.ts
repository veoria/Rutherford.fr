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
    time: '15 min',
    summary: 'Which light, which filter, which numbers: read the fine print behind every value.',
    steps: [
      {
        kicker: 'Step 1 · Why four conditions',
        headline: 'Before anyone argues, ask: which M?',
        scene: {
          who: 'pink',
          text: 'Pink, from quality control, takes the call: the customer’s lab says your white is 2 ΔE off. Red measured the same sheet this morning and found it perfect. Blue steps in: “Before anyone argues, which M?”',
        },
        paragraphs: [
          `Most papers contain <b>optical brighteners</b>. They take in UV light and give it back as blue, which makes white look whiter. So the amount of UV in the instrument’s light changes the number you read, most of all on the paper white and light tints.`,
          `ISO 13655 defines four measurement conditions so everyone knows which light was used.`,
        ],
        illustration: 'm-conditions.svg',
      },
      {
        kicker: 'Step 2 · D50 and the 2° observer',
        headline: 'A color number always comes with a light and an eye',
        scene: {
          who: 'yellow',
          text: 'L*a*b* is not a property of the ink alone. It’s the ink, seen under one light, by one standard eye. Change either and the numbers move.',
        },
        paragraphs: [
          `The instrument reads a <b>spectrum</b>: how much light the sheet reflects at each wavelength. To turn it into L*a*b*, the software needs two more things: an <b>illuminant</b> (the light you pretend the sheet is seen under) and an <b>observer</b> (a standard model of the human eye).`,
          `In graphic arts the pair is <b>D50 and the 2° observer</b>. D50 is a daylight at about 5000 K, the light of your viewing booth (ISO 3664). Paper, textile and screen people often use D65 and the 10° observer. Same spectrum, different numbers: never compare a D50/2° value with a D65/10° one.`,
          `Don’t mix the two ideas. <b>D50/2°</b> is the math applied to the spectrum. <b>M0 to M3</b> describe the real lamp inside the instrument, and above all its UV. You need both to know what a number means.`,
        ],
      },
      {
        kicker: 'Step 3 · The four, in one line each',
        headline: 'M0, M1, M2, M3',
        paragraphs: [
          `<b>M0</b>: the classic tungsten-like light, with an undefined amount of UV. Most pressrooms, and most of the references they print to, were built on M0, and many still are.`,
          `<b>M1</b>: D50 light including UV. It reads paper the way a D50 viewing booth shows it. It’s the condition of the current standards (ISO 12647-2:2013, FOGRA51/52, GRACoL 2013), and G7 requires it.`,
          `<b>M2</b>: UV cut. Reads the paper as if it had no brighteners.`,
          `<b>M3</b>: M2 plus a polarizing filter that removes surface gloss, so wet and dry ink read alike.`,
        ],
        illustration: 'ill-oba.svg',
      },
      {
        kicker: 'Step 4 · Why not M2 for color',
        headline: 'M2 measures a paper nobody sees',
        scene: {
          who: 'yellow',
          text: 'Cut the UV and the brighteners go to sleep. Your instrument now describes a duller, yellower paper than the one on your customer’s desk.',
        },
        paragraphs: [
          `Under a D50 booth, daylight or shop lighting, there is UV, the brighteners glow and the paper looks blue-white. <b>M2 switches that glow off</b>. The paper white reads yellower (a higher b*), and so do the light tints printed on it.`,
          `Two consequences. The number no longer matches <b>what the eye sees</b>. And it no longer matches <b>the aims you print to</b>, which were measured in M1 (current standards) or M0 (older ones). A ΔE computed from an M2 reading against those aims is off before the press prints a single sheet.`,
          `M2 still earns its place as a <b>diagnostic</b>: the gap between M1 and M2 on the paper white tells you how much brightener a stock contains. Handy when a new paper lot suddenly looks different.`,
        ],
      },
      {
        kicker: 'Step 5 · Why not M3 for color',
        headline: 'M3 removes the gloss your eye sees',
        paragraphs: [
          `Wet ink is glossy. As it dries, the surface gets rougher, scatters more light, and the density reading drops: that’s <b>dry-back</b>. The polarizing filters of M3 block that surface reflection, so <b>wet and dry ink read almost the same</b>. Great for steering density during the run.`,
          `But that surface reflection is part of what you see. Take it away and every color reads <b>darker and more saturated</b> than it looks, and solid densities come out higher than without the filter.`,
          `The aims of ISO 12647-2, FOGRA and GRACoL are measured <b>without polarization</b>. So an M3 L*a*b* or ΔE against them means nothing. Keep M3 for <b>density on wet ink</b>, and only against targets that were also set in M3.`,
        ],
        quiz: {
          q: 'Red checks a solid against the FOGRA51 aim and reads ΔE00 4, with the polarizing filter on. What do you tell him?',
          options: [
            'The press is 4 ΔE off, correct the ink keys',
            'The reading is M3 and the aim is M1: measure again without polarization before touching anything',
            'FOGRA51 is wrong for this paper',
          ],
          answer: 1,
          ok: 'Exactly. Same M on both sides first, then you decide.',
          no: 'Look at the filter. A polarized reading can’t be compared with an aim measured without polarization.',
        },
      },
      {
        kicker: 'Step 6 · Density has its fine print too',
        headline: 'Status E, Status T: same ink, two densities',
        scene: {
          who: 'red',
          text: 'Red reads 1.35 on the yellow solid. The spec from the US customer says 1.00. The sheet looks right. Who’s lying?',
        },
        paragraphs: [
          `Nobody. Density tells you how much light the ink absorbs, seen <b>through a color filter</b>: red for cyan, green for magenta, blue for yellow. The exact shape of those filters is called the <b>status</b> (ISO 5-3).`,
          `<b>Status T</b> uses wide filters. It’s the habit in North America. <b>Status E</b> is the European habit: same thing for cyan, magenta and black, but a <b>narrower blue filter for yellow</b>. On the same sheet, yellow reads clearly higher in Status E, often around 0.3. You may also meet <b>Status I</b> (very narrow filters) on some instruments.`,
          `Two more settings travel with a density: <b>absolute or paper-relative</b> (paper white subtracted or not), and <b>polarized or not</b> (that’s M3 again). A density target is only complete when it says all three.`,
        ],
        quiz: {
          q: 'A density target for yellow says “1.00”. What is missing before you can use it?',
          options: [
            'Nothing, density is density',
            'The status (T or E), paper-relative or absolute, and whether a polarizing filter is used',
            'The ΔE tolerance',
          ],
          answer: 1,
          ok: 'Yes. Without those three, 1.00 can be right or far off.',
          no: 'Remember Red’s yellow: 1.35 in Status E, 1.00 in Status T, same sheet.',
        },
      },
      {
        kicker: 'Step 7 · M0 or M1?',
        headline: 'There’s no wrong answer, only a wrong mix',
        paragraphs: [
          `<b>M0 is still perfectly valid</b> for process control when your targets, your press fingerprint and your customers’ specs are in M0 and nobody asks for a certification.`,
          `<b>Move to M1</b> when a customer specifies it, when you go for G7 or certify against the current ISO 12647-2 data, or when you print on papers loaded with brightener.`,
          `The one rule: <b>target and measurement use the same M</b>. An M1 reading against an M0 target is a false alarm waiting to happen.`,
        ],
        quiz: {
          q: 'The customer’s lab measures in M1, Red’s old handheld reads M0. They disagree on the paper white only. Most likely cause?',
          options: [
            'The press drifted between the two readings',
            'Different UV content: brighteners react differently under M1 and M0',
            'The lab’s instrument is broken',
          ],
          answer: 1,
          ok: 'Yes. Paper white is where brighteners show. Agree on one M and measure again.',
          no: 'Look where they disagree: only on white. That points to UV and brighteners, not ink.',
        },
      },
      {
        kicker: 'Step 8 · The ID card of a number',
        headline: 'Write the fine print next to every target',
        scene: {
          who: 'blue',
          text: 'A number without its conditions is a rumor. Give every target its ID card and most color arguments end before they start.',
        },
        paragraphs: [
          `For <b>color</b>: the M condition (M0 or M1), the illuminant and observer (D50/2°), the ΔE formula (ΔE00 today, ΔE76 in older specs) and the backing under the sheet (white or black).`,
          `For <b>density</b>: the status (E or T), absolute or paper-relative, polarized or not.`,
          `Put it on the job ticket, in the customer spec and in the measuring software. When two numbers disagree, compare the ID cards before you compare the sheets.`,
        ],
      },
      {
        kicker: 'Step 9 · How Rutherford handles it',
        headline: 'Switch when your customers are ready',
        scene: {
          who: 'blue',
          text: 'You don’t have to choose today. Run on M0, build your M1 references, and switch when your customers ask for it.',
        },
        paragraphs: [
          `On a Rutherford system, M0 or M1 is <b>a setting in the software</b>. IntelliTrax2 reads two conditions in one scan (M0 and M1, for example) and the SpectroDrive offers M0 to M3, so you switch without touching the hardware.`,
          `One exception: the first-generation <b>IntelliTrax</b> works to the older standard and stays on M0. If M1 is on your roadmap, that’s the moment to move to IntelliTrax2.`,
          `<b>Recap.</b> A color number needs its light (M), its math (D50/2°) and its formula. M0 still works when your references are in M0. M1 for G7 and the current standards. M2 is a brightener diagnostic and M3 a wet-ink density tool: neither is for color against standard aims. Density needs its status, E or T. Always write the fine print down.`,
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
