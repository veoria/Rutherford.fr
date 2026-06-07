export type Lesson = {
  title: string;
  summary: string;
  body: string[];
};

export type CourseLessons = Record<string, Lesson[]>;

export const COURSE_LESSONS: CourseLessons = {
  fundamentals: [
    {
      title: 'What "good color" actually means on a press',
      summary: 'Move from subjective approval to measurable consistency.',
      body: [
        'Walk through almost any pressroom and you will hear the same conversation in different accents: "Is this OK?". An operator looks at the sheet, glances at the proof, leans back, and decides. That decision is the most expensive judgment call in the building, and it changes every time the operator changes.',
        '"Good color" cannot mean "the operator approves it". On a busy press with three shifts, four operators and a dozen brand owners, that definition guarantees variance. Brand owners notice the variance long before you do, and they push the cost back to you in rejected pallets, audits, and lost contracts.',
        'A workable definition of good color has three parts. First, it is anchored to a target — typically a fingerprint or a brand-owner reference, expressed in spectral or CIELAB values. Second, it carries a tolerance — a ΔE budget that says "anything inside this range passes". Third, it is verified with a measurement device, not an eye.',
        'The cost of moving from "operator approves" to "device measures" is small. The benefit is that you can defend the decision, audit it, repeat it, and improve it. Everything else in this course is downstream of that one shift.',
      ],
    },
    {
      title: 'ISO 12647 in 10 minutes',
      summary: 'The standard your brand owners assume you follow.',
      body: [
        'ISO 12647 is the family of process control standards for graphic technology printing. The part you care about depends on your process: 12647-2 for offset, 12647-3 for newsprint, 12647-6 for flexo. For sheetfed offset packaging, 12647-2 is the document brand owners cite when they write specifications.',
        'The standard does three useful things at once. It defines printing substrate classes — PS1 through PS8 in the current ISO 12647-2:2013 (the older 2004 edition used paper types PT1–PT5, still quoted in legacy contracts) — so that you and your customer can agree on which substrate behavior you are aiming for. It defines target tonal value increase (TVI) curves so that the dot gain on press lands on a predictable curve. And it defines aim points for the solids (cyan, magenta, yellow, black) in CIELAB terms, again per paper class.',
        'You do not need to memorize the tables. You need to know that they exist, that your prepress and press fingerprints should be tied to them, and that any deviation should be a deliberate choice, not an accident. When a brand owner says "we want ISO 12647-2 PT1 with G7 calibration", you should know which substrate class that maps to in your shop and which fingerprint you will print against.',
        'The most common mistake is treating ISO as a destination instead of a baseline. The standard sets the floor. Brand-owner expectations now routinely sit tighter than 12647 tolerances. Plan for the floor and aim higher.',
      ],
    },
    {
      title: 'M0, M1, M2, M3: choosing your measurement condition',
      summary: 'Same sheet, different illuminant, different number.',
      body: [
        'Every spectrophotometer reads color under a defined illuminant and observer. The illuminant matters because most modern papers contain optical brightening agents (OBAs) that fluoresce under UV light. Read the same sheet under different conditions and you will get different numbers — sometimes meaningfully different.',
        'M0 is the legacy condition: a tungsten illuminant (CIE Standard Illuminant A). It is what densitometers and older spectros used by default. It still exists, mostly because contracts written before 2010 reference it.',
        'M1 is the modern default: D50 illuminant with UV component included. It is the right choice for any paper containing OBAs, which is most coated commercial and packaging stock today. ISO 13655:2009 specifies M1, and any new equipment installed in the last decade defaults to it.',
        'M2 is D50 with UV excluded. Good to know, rarely used in daily offset production: its real uses are OBA diagnostics (the gap between an M1 and an M2 reading of the paper white is the brightener signature) and substrates without OBAs (films, foils). Treat it as an aside, not a daily tool.',
        'M3 is polarized — a density tool for reading wet ink during a press run because it removes surface gloss. M3 typically produces higher density values than M0/M1/M2 by 0.05 to 0.20 D depending on ink and coating. Critical rule: never use M3 for G7 calibration or for any ΔE comparison against ISO 12647-2 / GRACoL / FOGRA aims — those reference datasets are measured unpolarized (G7 requires ISO 13655 M1; M0 on legacy datasets). M3 is for ink-film control on the run; M1 is for color conformance. Never mix them.',
        'Modern scanning systems like IntelliTrax2 can capture M0 and M1 simultaneously in one pass (Small and Medium Spot heads); the optional Polarizer head adds M3, reading polarized and unpolarized data in a single scan. One pulled sheet can therefore satisfy both a legacy specification and a modern OBA-aware measurement.',
      ],
    },
    {
      title: 'ΔE, ΔE 00, density: what to trust on the press floor',
      summary: 'Three numbers, three different jobs.',
      body: [
        'Density measures the reflectance of a single channel — cyan, magenta, yellow, or black — on the printed sheet. It is fast, robust, and the variable that ink-key adjustments push directly. Operators have used density for fifty years for one good reason: when density is high, you give less ink; when it is low, you give more. Density is the press floor language for "more or less ink".',
        'ΔE is the perceptual color difference between two CIELAB readings. ΔE 1976 was the original formula and is now considered too lenient at low chroma and too strict at high chroma. ΔE 94 and ΔE 2000 refined it. ΔE 00 (CIEDE2000) is the modern industry standard because it correlates much better with what the eye actually perceives.',
        'Brand owners typically specify ΔE 00 tolerances. A tight specification might require ΔE 00 < 2 on solids and ΔE 00 < 1.5 on grays. Looser specifications go to ΔE 00 < 4. Visibility depends on hue, context and viewing conditions: in a side-by-side comparison a trained eye can spot ΔE 00 ≈ 1–2 on critical colors, while from memory even larger gaps can pass.',
        'On the press, the operator works with density because density responds to ink-key movement. The quality system works with ΔE 00 because that is what the brand owner contract says. The bridge between the two is what closed-loop color management automates: read ΔE 00 against the target, decide which densities need to move, and adjust the ink keys.',
      ],
    },
    {
      title: 'G7, GRACoL, FOGRA: the methodologies that frame your work',
      summary: 'Three names you will hear, one shared goal.',
      body: [
        'G7 is a calibration methodology developed by Idealliance in the US. Its anchor is gray balance: if your CMY grays neutralize and your neutral print density curve matches the target, the rest of the gamut follows. G7 is process-agnostic; you can apply it to offset, flexo, digital, even gravure. Most North American shops are G7-anchored.',
        'GRACoL (General Requirements for Applications in Commercial Offset Lithography) is the US characterization for high-quality sheetfed offset on premium coated paper. GRACoL 2013 (CGATS21) is the modern reference, and its aim points are widely tied to G7 methodology.',
        'FOGRA is the German research institute. Their characterization data sets — FOGRA39, FOGRA51, FOGRA52, FOGRA55 — define aim points and proofing characteristics for European offset production on various substrate classes, each characterizing a printing condition compliant with ISO 12647-2 (the standard itself defines the aims; the FOGRA datasets describe conforming conditions).',
        'Practically: a US packaging printer is likely calibrated to GRACoL with G7 methodology. A European packaging printer is likely calibrated to ISO 12647-2 against a FOGRA characterization. Both are valid; the difference matters when you serve customers across the Atlantic. Brand owners often specify which characterization their production should target.',
        'Pick one, document it, train against it, and measure against it. Switching methodologies in the middle of a project is the fastest way to lose trust with a brand owner. The course is methodology-agnostic — what matters is that you have one, not which one.',
      ],
    },
  ],
  'measurement-essentials': [
    {
      title: 'Handheld vs automated scanning vs true inline',
      summary: 'Three device classes, three different jobs.',
      body: [
        'Handheld spectrophotometers — X-Rite eXact 2, eXact 2 Plus, eXact 2 Xp — are the swiss-army knives of color measurement. Single-patch reads, mobile, low entry cost, no host computer required. They are the right device when you measure infrequently, when you need to verify a specific patch, or when you check a job at the customer site.',
        'Strip readers (scanning tables) sit beside the press and scan color bars across the full sheet width. They take a sheet from the operator, scan it in a few seconds, and feed the result back to a console or to ink-key correction software. They strike the balance between speed and capital cost, and are common in mid-volume sheetfed shops.',
        'Automated scanning systems like X-Rite IntelliTrax2 (model 2900) and IntelliTrax2 Pro (model 2900PRO) are the high end of press-side measurement — but they are not inline: the system is semi-automatic and works off-press. The operator pulls a sheet from the delivery and places it on the scan track; the head then scans the full color bar automatically in seconds. Only the reading is automated, not the sampling.',
        'True inline systems are a separate class entirely: cameras or spectros mounted inside the press (e.g. in-press measurement systems offered by press OEMs) that read continuously during the run without pulling sheets. They carry their own trade-offs in cost, patch requirements and serviceability, and are not interchangeable with off-press scanning in either workflow or data.',
        'The choice is not "which is best" — it is "which fits your volume and your tolerance". A 50-makeready-per-week shop running tight ΔE specs needs automated scanning at minimum. A 5-makeready-per-week shop printing forgiving work can live with a handheld. Most real shops own at least two device classes and use them for different jobs.',
      ],
    },
    {
      title: 'The geometry that matters: 45°/0°, polarization, UV',
      summary: 'Three optical choices that drive your results.',
      body: [
        'A 45°/0° geometry illuminates the sample at 45° and reads it at 0° (normal). This is the standard for graphic arts because it most closely simulates how the human eye views a print under typical lighting. ISO 5-4:2009 specifies the geometry for spectro measurement of printed surfaces. IntelliTrax2 uses 45°/0° ring illumination (the sample is lit from all 360° around the 45° cone) to minimize directional artifacts.',
        'Polarization is an optical filter that removes the specular component — the surface gloss — from the measurement. Polarized readings give you the "wet" ink density even on a dry sheet, which is useful when you compare wet press readings to dry sheets. Polarization typically raises density values by 0.05–0.20 D, and polarizer quality and orientation vary between instruments, which tends to worsen inter-instrument agreement. And the rule that matters: polarized (M3) data is for density only — never for G7 calibration or ΔE checks against ISO/GRACoL/FOGRA aims, which are all defined unpolarized.',
        'UV filtering matters because most modern papers contain optical brighteners that fluoresce under UV. A measurement that includes UV (M1) reads the paper as your customer sees it under D50 viewing booths. A measurement that excludes UV (M2) reads the substrate "as if" it had no brighteners — a diagnostic tool more than a production condition. M1 is the default for any current work.',
        'Do not confuse this "UV in the measurement light" with UV in the process — UV varnish, dispersion coating, UV/H-UV/LED-UV inks. That is a separate subject with its own golden rule: never varnish or coat over the control strip. Coating shifts gloss, density and L*a*b*, and your targets (fingerprint, ISO/G7 aims, brand tolerances) are defined on bare ink — measuring through varnish creates false drift. Plan a varnish knockout over the bar zone in prepress; if the customer requires post-varnish numbers, build separate post-coating targets measured in the same state. A varnish layer also absorbs UV and damps OBA fluorescence, so even the paper white reads differently through it. And UV-cured inks have no conventional dry-back: a fingerprint made with conventional drying is not valid for a press converted to LED-UV.',
        'The geometry, polarization, and UV choices are not independent — they are stacked on each measurement. Every spectro reports them in the metadata. When two readings disagree, the first place to look is the measurement condition, not the ink.',
      ],
    },
    {
      title: 'Color bars decoded: what to put on the sheet and why',
      summary: 'The bar is the bridge between press and measurement.',
      body: [
        'A color bar is the strip of test patches placed on every press sheet, typically along the gripper edge or tail. It contains solids for each ink, percentage tints for tonal value, gray balance patches, overprints, and sometimes special control patches for spot colors. Without a color bar, automated measurement cannot tell what to read.',
        'Common color bar systems include System Brunner, GMI / Bestcolor, X-Rite Standard, and customer-specific bars. They differ in patch sequence, patch size, and inclusion of special tests. The right choice depends on your customer requirements and your measurement device capabilities.',
        'Patch height matters. IntelliTrax2 can read patches as small as 2 mm high with the Small Spot head (3 mm with the standard Medium head) — significantly tighter than the 4–5 mm minimum of older scanning systems. Smaller bars steal less printable area, but they require precise sheet positioning on the track. Patch width is typically 3–4 mm; what follows the ink zones is the pitch between patches, not the patch width — one patch (or patch group) positioned per zone, so the bar spans the full live sheet width (zone widths vary by press OEM, roughly 30–38 mm).',
        'The varnish rule belongs here too: if the job carries a UV or dispersion coating, the imposition must include a varnish-free reserve over the color bar — together with the scanner edge-distance constraint, it is one of the two bar-placement decisions prepress must get right.',
        'The edge zone — the distance between the sheet edge and the start of the color bar — matters because it determines where the scan head can position. IntelliTrax2 needs to engage the bar within 38 mm of the sheet edge. Plan the imposition accordingly: a color bar pushed too close to the edge will not scan reliably; a color bar pushed too far in steals printable area.',
        'Spot colors deserve their own discussion. If you run Pantone or custom brand colors, add dedicated solid and tint patches for each, not just the four-color overprint. A spot-color bar should mirror the structure of the process-color bar but for the extra inks in the job.',
      ],
    },
    {
      title: 'Repeatability vs reproducibility',
      summary: 'The trap that costs you hours.',
      body: [
        'Repeatability is the variation when the same instrument reads the same sample multiple times in a row, by the same operator, under the same conditions. It is an intrinsic property of the instrument. A modern handheld spectro has repeatability around 0.05 ΔE on white; a modern automated scanning system like IntelliTrax2 reports 0.15 ΔE max on white. These are tight enough for most production work.',
        'Reproducibility is the variation when different instruments — or different operators, different times, different temperatures — read the same sample. Reproducibility is always worse than repeatability. The relevant industry metric is Inter-Instrument Agreement (IIA), and a good modern spectro reports IIA in the 0.3 ΔE average / 0.45 ΔE maximum range.',
        'Why this matters: a brand owner with a handheld in their lab will read a different number than your scanning system reads at the press, even on the same sample. If you do not understand the gap, you will spend hours chasing a phantom drift that is actually just inter-instrument disagreement.',
        'The fix is procedural, not technical. Establish which instrument is the reference for each customer relationship, calibrate the others against it on known samples, and document the offsets. When the brand owner says "we measured 1.8 ΔE on your latest delivery", you should be able to say "our scanning system measured 1.3 ΔE; our handheld measured 1.6 ΔE; both agree with you within IIA tolerance".',
        'The other fix is hardware: scheduled annual recertification of every measurement device through the manufacturer (or a certified service partner). UV LED sources drift, sensors age, and tile references wear. Without recertification, you are slowly walking away from your own reference.',
      ],
    },
  ],
  'where-color-hurts': [
    {
      title: 'Anatomy of a makeready: 800 sheets, 120 minutes, €450 on the floor',
      summary: 'The cost stack of one makeready, multiplied by your year.',
      body: [
        'Take a typical B1 6-color sheetfed press, premium coated 250 g/m² paper at €1 200 per tonne. A B1 sheet (707 × 1000 mm = 0.707 m²) weighs ≈177 g, so one sheet costs roughly €0.21. A makeready that consumes 800 sheets to first good copy costs ≈€170 in paper alone before you count anything else.',
        'Add press time. A loaded sheetfed B1 6-color press costs €150 per hour to run, sometimes more. A 120-minute makeready burns €300 in press time. The press is not earning while it is being set up — and the operator is paid either way.',
        'Add the smaller items: a plate change is rarely needed during makeready, but blanket washes consume cleaning solution and operator attention. Ink mileage on makeready sheets is not zero. Energy costs are not zero. Add it all up and €450–€500 per makeready is a conservative number.',
        'Multiply by your annual volume. A press running 3 makereadies per day, 5 days per week, 45 weeks per year, completes 675 makereadies. At €450 each, that is €303 750 per year — per press — that walks off the floor as paper waste, ink waste, and press time you did not bill.',
        'For a 3-press operation, the math triples. For a packaging shop with 8 presses across 2 sites, the annual cost of makeready is the salary of a small department. Closed-loop color management aims to reduce both the sheet count and the time, typically by 30 to 55 % in real installations. The math does the rest.',
      ],
    },
    {
      title: 'The "good copy" myth',
      summary: 'Why subjective approval is the silent margin killer.',
      body: [
        'On most presses, the moment a job becomes "good" is the moment an operator decides it is good. That decision varies by operator, by shift, by mood, by how rushed the operator feels, and by what the next job in the queue looks like. None of those variables are written into the brand-owner specification.',
        'You can see the variance in the makeready data if you collect it. Two operators on the same job, same press, same paper, on consecutive days, will produce different "first good copy" decisions. The faster operator might pass a sheet at ΔE 00 = 3.2; the more cautious operator on the next shift will not pass until ΔE 00 = 1.8. Both might be inside customer tolerance — but the slower operator spent extra paper and extra time getting there.',
        'The cost compounds in the other direction too. A fast operator who passes ΔE 00 = 3.2 against a customer tolerance of ΔE 00 = 2.5 may push a borderline job through. Three months later, the brand owner aggregates measurements across the supply chain and asks why your average is sitting above their specification. The conversation is uncomfortable; the cost is your contract.',
        'The fix is not to slow everyone down or to micromanage. The fix is to take the "pass / fail" decision out of subjective judgment and put it into measurement. A closed-loop system, or even a strip reader feeding a console, makes the decision the same way every time: against the same target, with the same tolerance, with the same data trail. The operator stays in charge of the press — but stops being the variance source for the color decision.',
      ],
    },
    {
      title: 'Drift, contamination, fountain solution, paper batch',
      summary: 'The four silent killers of color stability.',
      body: [
        'Drift is the slow movement of color over the run. Ink fountains warm up, blankets compress, papers absorb humidity, plates wear at the lead edge. None of these changes are visible sheet-to-sheet, but over 10 000 sheets the cyan can move 0.3 D and the magenta in the opposite direction. By the end of the run, an operator who matched the first sheet to the proof is no longer matching the proof at all.',
        'Contamination is the introduction of foreign material into the ink film: blanket residue, fountain solution carryover, paper dust, dried ink from the rollers. Each contamination event shifts color slightly. A clean press is a stable press, and that is the boring truth behind most "magic" results from veteran pressrooms.',
        'Fountain solution is its own chapter. Conductivity, pH, alcohol concentration, and temperature each affect how the ink film transfers and dries. A fountain solution that drifts out of range during the day shifts your color even when your ink keys have not moved. Many pressrooms only check fountain chemistry on Mondays — and wonder why Fridays look different.',
        'Paper batch variability is the silent ambush. Two pallets of the same nominal paper grade from the same mill can have different surface gloss, different absorption rates, different OBA loadings. Your color profile was built against the average; an outlier batch will print outside specification even when the press is perfect. This is where measurement of the paper itself — before the run — pays for itself.',
        'A closed-loop system catches drift in real time because it measures every sheet (or every Nth sheet) against the target. It cannot fix contamination — a wash-up is still required — but it can detect the moment contamination starts and alert the operator. Fountain and paper variability cannot be fixed by the color system, but they are easier to diagnose when the color system separates "ink-key adjustment can fix this" from "something else is going on".',
      ],
    },
    {
      title: 'Self-financed automation: how reduced waste pays for the system',
      summary: 'The capital case in three numbers.',
      body: [
        'A closed-loop color management system costs less than most people assume — typically a fraction of the price of the press it sits on. The capital case is built on three measurable returns: paper saved, press time recovered, and brand-owner reject reduction.',
        'Paper saved is the most direct. A 55 % reduction in makeready sheet waste on the B1 6-color baseline above (800 sheets per makeready) saves 440 sheets per makeready, 297 000 sheets per year, around €63 000 in paper per press per year (at ≈€0.21 per sheet) — a substantial share of the system cost on its own.',
        'Press time recovered is the second lever. A 38 % reduction in makeready time on a 120-minute baseline saves 46 minutes per makeready, 31 000 minutes per year, 513 hours of press time. At €150 per hour, that is €77 000 of capacity. The capacity does not appear as cash directly — it appears as the ability to take on more work without buying another press.',
        'Reject reduction is the third lever, harder to measure but real. Closed-loop systems produce data trails that brand owners can audit. The conversation when something goes wrong becomes "here is the measurement record" instead of "we think it was fine". Reject rates fall, audit risk falls, contract renewals go smoother.',
        'A typical installation pays for itself in 9 to 18 months on a single press, before any contract effects. The math is conservative — those numbers assume only paper and press time, and ignore the contract value of being a measurably consistent supplier. The premium course on closed-loop color goes into the full ROI methodology; this course is the warm-up.',
      ],
    },
  ],
  'closed-loop-flagship': [
    {
      title: 'The closed-loop concept: sensor, decision, actuator',
      summary: 'Three components, one feedback loop.',
      body: [
        'Every closed-loop system, whether in a chemical plant, an aircraft autopilot, or a printing press, has the same three components: a sensor that reads what is actually happening, a decision layer that compares the reading to a target and chooses an action, and an actuator that executes the action. Remove any one and the loop opens.',
        'In a sheetfed offset closed-loop installation, the sensor is the spectral measurement device — typically an automated scanning system like IntelliTrax2 reading sheets the operator pulls from the delivery at regular intervals. The loop runs on sampled pulled sheets, not on every printed sheet. The decision layer compares the measured ΔE 00 per ink zone against the target and decides which zones need more ink and which need less. The actuator is the ink-key servo that physically opens or closes the zone on the next pull.',
        'Open-loop production is the alternative: the operator looks at the sheet, decides subjectively whether it is good, and adjusts the keys manually when something looks off. The operator is both sensor and decision layer in this model, and their judgment varies by shift, by mood, by the day.',
        'The economic case for closing the loop comes from removing that variance. A measurement-driven decision is the same every time. Ink-key correction within 5 seconds of measurement is faster than any operator can do manually. Multiplied across a year of makereadies, this compounds into the ROI numbers the free courses opened with: 30 to 55 % less waste, 25 to 40 % less makeready time.',
      ],
    },
    {
      title: 'Anatomy of the Rutherford system',
      summary: 'Where each layer of the loop physically lives.',
      body: [
        'The Rutherford system installs alongside the press without replacing the press OEM\'s native console. The operator keeps their familiar interface. Rutherford sits on a second screen, typically a touchscreen mounted near the existing console, and overlays the existing controls with closed-loop logic.',
        'The console interface shows the live ΔE 00 heatmap per ink zone, current density and density-target deltas, and recommended corrections. The operator can accept the system\'s decisions, override them, or run the system fully autonomous depending on shift confidence and job risk level.',
        'Ink-zone control is the link between Rutherford\'s decisions and the press. On Heidelberg presses, Rutherford talks to the Prinect Press Center via INK-Net. On KBA presses, it integrates with LogoTronic via ECS XML. On Komori, the path is via PDC. On Manroland, through the InkDriver protocol. Each integration is one-time; once it is in place, the operator does not see the protocol, only the result.',
        'Learning logic is the Rutherford-specific layer. The system records what worked on similar jobs in the past, same substrate, same ink set, same coverage profile, and pre-positions ink keys before the first sheet rolls. After 30 jobs on similar work, the cold-start drops dramatically. After 90 jobs, the system has a confident first-sheet correction. After a year, it predicts.',
      ],
    },
    {
      title: 'Integrating with your press brand: Heidelberg, KBA, Komori, Manroland',
      summary: 'One closed-loop concept, four different press-OEM realities.',
      body: [
        'Heidelberg presses are the most common installation target in Europe. The Prinect ecosystem exposes a stable XML schema (INK-Net) for ink-key control. CIP3 preset import is straightforward via the PPF or JDF route. Rutherford has been integrated with Heidelberg consoles for over two decades; expect a clean install with minimal press downtime.',
        'KBA (now Koenig & Bauer) machines use LogoTronic for press control. The integration surface is ECS XML, which exposes ink-key set points and reads back actual positions. Older Rapida-series presses required custom adapters; modern Rapida 75 / 105 / 145 generations have ECS as a standard interface.',
        'Komori machines integrate via Komori PDC (Print Density Control) or KP-Connect on newer presses. The Rutherford layer reads PQS color-bar measurements and writes back ink-key corrections to the H-UV or G-Series consoles. Komori also provides their own closed-loop layer; Rutherford typically replaces or complements it depending on customer choice.',
        'Manroland Sheetfed uses Pecom or InkDriver. Their proprietary control software requires a specific adapter; once installed, the protocol is reliable but the initial commissioning is slower than Heidelberg installations.',
        'Across all four, the operator-facing experience is the same: Rutherford touchscreen on the right, native console on the left, closed-loop running behind both.',
      ],
    },
    {
      title: 'CIP3 / CIP4 presetting: turning prepress data into ink-key opens',
      summary: 'The first sheet is decided before the press starts.',
      body: [
        'CIP3 is the industry consortium that defined the PPF (Print Production Format) file in the mid-1990s. CIP4 is its successor, defining JDF (Job Definition Format) and JMF (Job Messaging Format). Both encode the dot coverage of each color separation across the press sheet, divided into ink-zone columns.',
        'The math is simple: ink demand for a zone is proportional to the total dot coverage of that zone summed across the sheet. A zone covered 80 % needs roughly twice the ink-key opening of a zone covered 40 %. The press OEM consoles have used this principle for thirty years to pre-position ink keys before the makeready starts.',
        'Where Rutherford adds value is in calibrating the relationship. The raw coverage-to-opening formula varies by ink, by substrate, by press, by ambient temperature. Rutherford\'s learning logic adjusts the formula based on what actually happened on previous similar jobs, so the first sheet lands closer to target than a vanilla CIP3 preset would deliver.',
        'In production, this is the difference between a 600-sheet makeready (vanilla CIP3) and a 250-sheet makeready (CIP3 + Rutherford learned offsets). The same prepress data, processed with site-specific learning, produces a meaningfully better starting point.',
      ],
    },
    {
      title: 'Spectral targets and ΔE strategy in production',
      summary: 'Tolerances that work in real shifts.',
      body: [
        'Brand-owner specifications usually arrive as a list of solids in CIELAB or spectral form, plus a ΔE 00 budget per channel. A typical packaging specification might read: C ΔE 00 < 2.0, M ΔE 00 < 2.0, Y ΔE 00 < 2.5, K ΔE 00 < 2.5, spot colors ΔE 00 < 1.5. Those are the contractual numbers.',
        'Production targets need to sit tighter than the contractual numbers. If contract is ΔE 00 < 2.0, production should aim for ΔE 00 < 1.4. The buffer absorbs measurement uncertainty, instrument drift between your shop and the brand owner\'s lab, and the natural drift of an in-process run.',
        'Closed-loop systems work best when tolerances are defined per channel and per region of the gamut. Solids tighter than midtones; grays tightest of all (gray balance is the most visible failure mode); spot colors negotiated case by case. Rutherford lets you express tolerances at this granularity and applies different correction aggressiveness based on which target is at risk.',
        'Fail-fast triggers are the safety layer. If ΔE 00 exceeds the production target by more than twice for three consecutive sheets, the system should alert the operator rather than blindly continue correcting. The trigger catches scenarios where the issue is not "wrong ink-key position" but "wrong plate", "wrong ink", or "contaminated fountain", situations no amount of ink-key correction will fix.',
      ],
    },
    {
      title: 'Operator workflow: day one versus week one versus month three',
      summary: 'The cultural arc of every closed-loop install.',
      body: [
        'Day one of a closed-loop install is hostile. Experienced press operators have spent years mastering ink-key adjustment by feel; they read the closed-loop screen as an attempt to deskill them. Expect frequent overrides, suspicion of the recommendations, and a tendency to "fight the system". Plan for it. Schedule day one for a low-pressure job, not a brand-owner audit.',
        'Week one shifts the dynamic. Operators notice the system catching subtle drift that the eye missed, or holding stability through a substrate-batch change. Confidence builds slowly. The shift lead becomes critical here: if the most respected operator on the floor publicly endorses the system, adoption accelerates across the shift.',
        'Month three is the inflection point. By this time the learning logic has accumulated enough job history to be visibly better than vanilla presetting on common work. Makereadies are shorter; rejects are rarer; the data trail is intact. Operators stop overriding except on genuinely unusual jobs. This is the milestone where ROI starts showing in monthly waste reports.',
        'Year one is the new normal. Closed-loop is part of the workflow; new hires are trained on it from their first shift. The conversation shifts from "is this working" to "how do we extend this to the second press, second site, extended gamut work". Plan the rollout with this arc in mind; do not promise month-three results in week one.',
      ],
    },
    {
      title: 'Closed-loop on extended gamut (ECG, 7-color)',
      summary: 'More inks, more channels, more discipline required.',
      body: [
        'Extended Color Gamut workflows print with seven inks instead of four: typically CMYK plus orange, green, and violet. The expanded gamut covers more brand spot colors directly in process, eliminating the need to mix custom inks for short-run jobs. The trade-off is operational complexity: seven channels of ink-key control, seven calibration curves, seven targets.',
        'Closed-loop on ECG is harder than on 4-color in three ways. First, the measurement device must read all seven inks reliably; not all spectros handle high-chroma orange and violet well. IntelliTrax2 reads ECG inks without clipping; older scanning systems struggle.',
        'Second, trapping behavior in ECG is more complex. Three additional inks mean more overprint combinations, more sensitivity to ink sequence, and more places for trapping errors to cascade. The closed-loop system needs to recognize when a target deviation is caused by trapping rather than ink density and decline to over-correct.',
        'Third, the prepress workflow has to feed the press a clean ECG separation. Esko Equinox is one of the most widely used conversion technologies (GMG and others exist); Equinox-aware RIPs produce ECG separations from CMYK or RGB inputs. The closed-loop layer reads the resulting ECG color bars and corrects per channel.',
        'Bottom line: ECG closed-loop works in production today on packaging presses, but it requires a pressroom that has already mastered 4-color closed-loop and a prepress team comfortable with extended gamut separation.',
      ],
    },
    {
      title: 'Scaling across presses, shifts, sites',
      summary: 'From one machine to a multi-site standard.',
      body: [
        'A single closed-loop installation is a project. A fleet deployment is a program. The two require different management. Single installations focus on machine commissioning, operator training, and first-month ROI tracking. Fleet deployments focus on standardization, governance, and central reporting.',
        'Standardization across presses starts with the color bar. Same bar layout, same patch sequence, same dimensions, same position on the sheet across every machine. Without this, your data is not comparable; with it, you can benchmark machine A against machine B on identical metrics.',
        'Shift standardization is procedural. Each shift uses the same tolerances, the same fail-fast triggers, the same approval workflow. The shift lead owns adherence; the plant manager owns the policy. Closed-loop systems make divergence visible: if night-shift ΔE 00 averages are consistently higher than day-shift, the data will say so.',
        'Multi-site governance answers three questions: who owns the targets, who is allowed to change tolerances, and who issues the brand-owner report. The cleanest setup centralizes target management (one person in quality owns the master target library) and decentralizes execution (each plant runs its own production). MeasureColor Reports provides the aggregation layer for this model.',
        'Ten years into a fleet deployment, the closed-loop system is invisible to the operator (it just works) and central to the business case (audit-ready data, defensible KPIs, faster new-customer onboarding). That is the destination this masterclass aims at.',
      ],
    },
  ],
  'measurecolor-production': [
    {
      title: 'Installing and configuring MeasureColor Production',
      summary: 'From license activation to first measured sheet.',
      body: [
        'MeasureColor Production runs on Windows workstations on your local network. The installer sets up the application, a local SQL database, and a service that talks to your measurement devices. License activation is per workstation; an enterprise license covers multiple seats.',
        'Network topology matters more than people expect. The measurement workstation needs to reach the instruments (USB or network), the database (local or central), and any MIS integration endpoint. Plan VLAN segmentation and firewall rules before commissioning, not after.',
        'Device pairing is the first concrete configuration. Connect an eXact 2 handheld via USB and the application detects it within seconds. For IntelliTrax2, the connection is typically over Ethernet to a controller running the X-Rite service. Both flows are guided by the application; manual driver installation is rarely required.',
        'Calibration is the last step before production use. White-tile calibration ties your instrument to its reference; black calibration sets the dark response; spectral calibration verifies the wavelength accuracy. A new install should run all three; routine production runs only white tile, typically daily or per-shift.',
        'Data residency is a feature, not a fix. MeasureColor stores its data inside your network by default. There is no mandatory cloud component. If you choose to aggregate data centrally across multiple plants, the central database is yours, on your servers, not a vendor cloud.',
      ],
    },
    {
      title: 'Job templates, color bars, tolerances',
      summary: 'The reusable assets that drive every measurement.',
      body: [
        'A job template in MeasureColor defines the color bar layout (patch sequence and dimensions), the targets per patch (CIELAB or spectral), the tolerances per patch, and the reporting outputs. A well-designed template library is the difference between an operator measuring a sheet in 30 seconds versus 5 minutes.',
        'Color bar layout follows your existing pressroom practice. If you use System Brunner Mini-Spot, define a template that matches its patch positions. If you use a customer-specific bar (some brand owners insist on their own), build a template per customer. Templates are versioned; do not rebuild them per job.',
        'Targets per patch come from your fingerprint. The most reliable source is a measured press fingerprint taken under controlled conditions on the same substrate the production will run on. Generic targets from ISO 12647 or GRACoL work as a starting point but always sit looser than a measured fingerprint.',
        'Tolerances are where customer requirements meet operational reality. A typical setup uses ΔE 00 for solids and grays, ΔH for chromatic spot and brand colors (hue angle is unstable at low chroma, so grays are toleranced in ΔE/ΔCh, not ΔH), and density for ink-key feedback. The tighter the tolerance, the more often the operator will need to react; calibrate tolerances to your shop\'s actual capability, not aspirational targets.',
        'Templates evolve. Quarterly review your top 10 templates and look at failure-mode distribution. If a specific patch fails frequently, it might need a tolerance review or a target update. The template library is a living asset, not a one-time setup.',
      ],
    },
    {
      title: 'PQX, CXF, MIF, ICC, CGATS: file format reference',
      summary: 'What each format gives you and when to use which.',
      body: [
        'PQX (Print Quality eXchange) is the ISO 20616-1:2017 standard for exchanging measurement data between systems. It is the format brand owners increasingly request for supplier reporting because it is open, vendor-neutral, and includes both measurement values and the measurement conditions (instrument, illuminant, geometry). Use PQX for brand-owner reports.',
        'CXF (Color Exchange Format) is the X-Rite-led ISO 17972 standard for exchanging color data, including spectral information. CXF/X-4 specifically targets characterization data exchange. Use CXF when sharing spectral data with prepress tools that need full reflectance curves.',
        'MIF (Measurement Interchange Format) is MeasureColor\'s native exchange format and is the most flexible for in-house workflows. It captures the full job context including templates, tolerances, and metadata. Use MIF for internal data movement; switch to PQX or CXF for external sharing.',
        'ICC profiles encode the color characterization of a device or condition. They are the foundation of color management but are not measurement records; they describe what a device or process produces in general, not what was measured on a specific sheet. Use ICC for prepress soft-proofing and process characterization.',
        'CGATS (Committee for Graphic Arts Technologies Standards) defines text-based exchange formats including CGATS.17, the workhorse format for round-tripping measurement data between systems. It is human-readable and widely supported. Use CGATS for legacy integrations or anywhere a CSV-equivalent is needed.',
        'Open standards reduce vendor lock-in. MeasureColor supports all five for import and export. Choose the format based on the receiver, not the sender.',
      ],
    },
    {
      title: 'Daily operator routine: measure, judge, document',
      summary: 'The three-step loop that runs every job.',
      body: [
        'Step one is measurement. The operator pulls a sheet from the delivery, places it on the scanning table or under the inline scanner, and triggers a scan. With IntelliTrax2 this takes under 10 seconds for a full B1 color bar. With a handheld and a Bestrack-style bar, allow 90 seconds for a competent operator.',
        'Step two is judgment. The software shows pass / fail per patch, ΔE 00 per ink, density deltas, and trend over the last N sheets. The operator decides: is this an acceptable sheet, a sheet that needs an ink-key adjustment, or a sheet indicating a non-correctable problem (contamination, wrong plate, fountain issue)? The software gives the data; the operator owns the decision.',
        'Step three is documentation. The measurement is automatically stored against the job ID and timestamped. No manual logging required; the data trail builds itself. At the end of the job, the operator (or supervisor) can generate a quality report PDF or PQX for the customer, signed off with the operator\'s ID.',
        'This routine is unchanged from job to job, which is its strength. Every job, every shift, every operator follows the same three steps. The variance in outcomes comes from the press, the ink, the substrate, not from procedural differences.',
        'A team running this routine for the first time will be slow. After a month, the routine takes under a minute per sheet on most jobs. The time pays back many times over in faster makereadies and lower reject rates.',
      ],
    },
    {
      title: 'Integration with your MIS / job management via open XML',
      summary: 'Linking quality data to the system that runs the shop.',
      body: [
        'A pressroom MIS (Management Information System) like HIFLOW, EFI Pace, Optimus, or Cerm tracks jobs, schedules, costs, and customer information. Without integration, MeasureColor measurements live in their own world and the MIS has no visibility into quality.',
        'Integration goes both ways. From MIS to MeasureColor: when a job is scheduled, push the job ID, customer, substrate, and required template to the measurement workstation. The operator does not hunt for the right template; it is pre-loaded. From MeasureColor to MIS: when a job completes, push the quality summary back to the MIS for billing, customer reporting, and trend analysis.',
        'The protocol is XML over HTTP for most modern MIS systems, with JDF/JMF as the standardized envelope. Older systems may require flat-file exchange via a watched folder. MeasureColor supports both.',
        'The integration is one-time effort with ongoing payoff. After commissioning, the MIS becomes the single source of truth for what was scheduled and what was delivered. Quality reports stop being a separate process; they are a byproduct of running the job.',
        'In multi-site deployments, the MIS-MeasureColor link is also the bridge that lets central management see across plants. A brand owner whose work runs in three of your sites can receive one aggregated quality report at the end of the quarter.',
      ],
    },
    {
      title: 'Troubleshooting common errors and false positives',
      summary: 'The top issues, and why they happen.',
      body: [
        'False positive ΔE failure is the most common operator complaint. The press looks fine, the sheet looks fine, but the software flags failure. The usual causes are: wrong template (job ran with the previous job\'s template), expired calibration on the measurement device, or a misaligned color bar (scan head positioned 2 mm off, reading the wrong patch).',
        'Mismatched job templates happen when the MIS link drops or when the operator manually picks the wrong template. The fix is to enforce template selection from the MIS-pushed job ID, with the operator able to override only with a documented reason.',
        'UV LED drift on IntelliTrax2 is gradual. The UV source ages, the M1 readings drift, and what was a clean ΔE 00 = 1.5 yesterday reads ΔE 00 = 2.4 today. Annual recertification through X-Rite or a certified partner is the answer. If you skip recertification, expect 3 % per year measurement drift.',
        'Polarizer wear on handhelds shows up as inconsistent density on glossy stocks. The polarizer is a consumable in M3-only handheld measurements; budget for replacement every 18 to 24 months in heavy use.',
        'Sample-pad cleanliness on scanning tables: a contaminated white reference under the scan head produces false drift over a run. Daily wipe of the reference tile with a lint-free cloth is the cheapest reliability improvement available.',
        'The single biggest source of false alarms in production is mismatched conditions: M0 measurement compared against M1 target, or polarized compared against unpolarized. The template should pin the measurement condition; mismatches should error out, not silently produce nonsense.',
      ],
    },
  ],
  'measurecolor-reports': [
    {
      title: 'The Reports module architecture: data flow from press to dashboard',
      summary: 'How measurement data becomes management insight.',
      body: [
        'MeasureColor Reports is not a standalone product; it is a module that sits on top of MeasureColor Production. Production captures the measurement events; Reports aggregates, visualizes, and reports on them. Without Production feeding it, Reports has nothing to show.',
        'The data flow has three stages. Capture happens at the press: every measurement is timestamped, tagged with job ID, operator ID, machine ID, template, and the spectral data itself. Storage is in the Production database, a Microsoft SQL Server instance that you host on your network. Reports queries this database to render its dashboards.',
        'For multi-site operations, each plant runs its own Production instance with its own database. Reports can either query each instance directly (federated) or pull a nightly sync into a central data warehouse (centralized). The federated model has lower latency but harder governance; the centralized model is the opposite. Pick based on your IT comfort with cross-site database access.',
        'Real-time dashboards refresh on a configurable interval, typically 1 to 5 minutes during production hours. Historical reports run on demand or on schedule. A quarterly customer report might be a scheduled job that emails the PDF to the customer\'s quality team on the 1st of every month.',
        'Architecture decisions made at install dictate what you can do later. Centralize your databases if you intend to run cross-site KPIs; federate if each plant operates independently. Both are valid; both are hard to change after the fact.',
      ],
    },
    {
      title: 'Building dashboards that matter (per machine, per operator, per brand)',
      summary: 'Three axes of insight, one dashboard structure.',
      body: [
        'A dashboard that tries to show everything shows nothing. The Reports module ships with several stock dashboards; the useful ones for production management slice along three axes: per machine, per operator, per brand owner.',
        'Per machine dashboards answer "is this press performing?". The headline numbers are average makeready ΔE 00, makeready duration, paper waste per makeready, and trend over the last month. A press that drifts from week to week needs preventive maintenance scoping; a stable press needs no intervention.',
        'Per operator dashboards answer "are operators consistent with each other?". Comparing operators on the same machine across similar jobs surfaces training opportunities. If one operator consistently runs tighter ΔE than peers, what are they doing differently? If another consistently runs longer makereadies, where is the time going?',
        'Per brand-owner dashboards answer "are we meeting customer specs?". Aggregate ΔE 00 distribution per brand, count of rejects per quarter, audit-ready records. This is the dashboard you screen-share when a brand-owner quality manager asks for a quarterly review.',
        'Build the three dashboards first, ignore the rest. Every additional dashboard is operating expense; only build what people actually use.',
      ],
    },
    {
      title: 'Drill-down for root-cause analysis: finding the failure pattern',
      summary: 'From "rejects are up this quarter" to "this is what broke".',
      body: [
        'A flat number tells you nothing. "Reject rate up 30 % this quarter" is a problem statement, not a root cause. The Reports module lets you drill from the headline into the specifics: which machine, which shift, which operator, which substrate, which ink batch.',
        'The investigation starts with the dimension that explains the most variance. Usually that is machine: one of your presses is responsible for most of the reject increase. From there, drill into time: is the increase steady or did it start on a specific date? A discrete start date suggests a specific event, a part change, a software update, a personnel change.',
        'Then drill into shift: is the problem present on all shifts or only one? Shift-specific issues often trace to procedural drift; one team did something differently and it took weeks to surface.',
        'Then drill into substrate: same press, same shift, but only certain papers? That points to substrate batch issues or ink-paper interaction.',
        'Each drill is a hypothesis test. The Reports module accelerates the testing by letting you re-slice the data in seconds. What used to take a week of manual spreadsheet work is now a half-hour investigation.',
        'The goal is not perfect attribution every time. The goal is to narrow the search space fast enough that a fix can be deployed before the brand-owner audit notices.',
      ],
    },
    {
      title: 'Brand-owner reporting: what to send, in which format',
      summary: 'The supplier-side of the contract conversation.',
      body: [
        'Brand-owner reporting requirements have tightened steadily over the last decade. Major brand owners now ask their print suppliers and converters for quarterly or monthly quality reports as standard contract terms. The supplier that can produce these reports automatically wins on operational cost; the supplier that produces them manually loses time and accuracy.',
        'What to send depends on the contract. Common asks: aggregate ΔE 00 distribution per ink per quarter, count of jobs delivered, count of rejects with root-cause notes, certificate of conformance per job. Sophisticated brand owners also ask for PQX files attached to each delivery so they can re-verify your numbers in their own systems.',
        'Format matters. PDF is universal and human-readable but hard to re-analyze. PQX (ISO 20616-1) is machine-readable and increasingly the standard for contract-driven supplier reporting. CXF carries spectral data and is the format of choice for brand owners with their own color science teams.',
        'Reports lets you build the layout once and re-run it per period. The cover page has your logo and contract reference; the body has the aggregated metrics; the appendix has the per-job detail. Output is PDF for human consumption, PQX as a parallel attachment for machine consumption.',
        'The single best practice in supplier-to-brand-owner reporting is to send the report before the brand owner asks. Customers who receive a quality report unprompted at month-end develop trust that translates into longer contracts and less audit pressure.',
      ],
    },
    {
      title: 'Benchmarking machines, operators, shifts, sites',
      summary: 'Comparison as the foundation of continuous improvement.',
      body: [
        'A single measurement number means nothing without context. ΔE 00 = 1.4 is good or bad depending on what the same press, same shift, same operator typically achieves. Reports makes benchmarking the default view: every metric is shown against its peer group, not in isolation.',
        'Machine-vs-machine benchmarking surfaces equipment-level issues. If press B routinely runs 0.4 ΔE worse than presses A and C on similar work, the press is the variable. That is a preventive maintenance scoping signal, not an operator coaching signal.',
        'Operator-vs-operator benchmarking surfaces training opportunities. Comparing operators on identical jobs across machines (job type as the control) shows who is achieving tighter results and who is achieving them faster. The data does not assign blame; it identifies who could teach whom.',
        'Shift-vs-shift benchmarking surfaces procedural drift. The night shift often shows different patterns from day shift; different staffing, different urgency, different inputs. If the gap is large, the procedure is not being followed; if the gap is small but consistent, the procedure is working as intended even with different people.',
        'Site-vs-site benchmarking is the most strategic. Once you can fairly compare two plants on the same metrics, you can identify best practices in one and propagate them to the other. The hardest part is fairness: the metrics must control for substrate mix, job mix, and machine generation. Reports handles the slicing; the manager owns the interpretation.',
      ],
    },
    {
      title: 'Driving continuous improvement loops with Reports',
      summary: 'From dashboard observation to operational change.',
      body: [
        'Dashboards alone do not improve anything. They surface signal; the improvement comes from acting on signal. Reports is the start of a continuous-improvement loop, not the end. The loop has four steps: observe, hypothesize, act, verify.',
        'Observation is the dashboard scan. Once a week, a quality lead reviews the headline numbers across machines, operators, and brand owners. Anything trending wrong gets flagged for investigation. Everything stable gets a green check.',
        'Hypothesizing happens in the drill-down. The team isolates the most likely cause, a machine, a shift, a substrate, a contract change, and documents it as a working hypothesis. The hypothesis includes a falsifiable prediction: "if we change X, ΔE 00 average should drop from 1.8 to under 1.5 within four weeks".',
        'Acting is the operational change. It might be a maintenance procedure, an operator training session, a tolerance adjustment, or a substrate qualification protocol. Each action is logged with the hypothesis it tests.',
        'Verification is the next month\'s dashboard. The hypothesis prediction either holds or it does not. If it holds, the change is propagated and the hypothesis closes. If it does not, the team revises the hypothesis or restores the previous configuration. Either way, the team learns.',
        'A pressroom that runs this loop monthly will outperform a pressroom that does not, even with identical equipment. The discipline is the differentiator.',
      ],
    },
  ],
  'intellitrax2': [
    {
      title: 'IntelliTrax2 (model 2900) versus IntelliTrax2 Pro (2900PRO): which to pick',
      summary: 'Two scan-head variants for two operational profiles.',
      body: [
        'IntelliTrax2 (model 2900) is the standard scanning system, introduced as the successor to the original IntelliTrax (model 2246, now discontinued). It covers the majority of sheetfed offset use cases: fast automated scans of a pulled sheet, color-bar height down to 2 mm (Small Spot head — the standard Medium head reads from 3 mm), simultaneous M0/M1 capture, M3 via the optional Polarizer head (3 mm min), 45°/0° ring geometry per ISO 5-4:2009.',
        'IntelliTrax2 Pro (model 2900PRO) was introduced in March 2021. It targets pressrooms with higher throughput requirements or tighter quality demands. The Pro variant typically ships with enhancements around uptime, single-pass condition flexibility, and integration depth with quality software like MeasureColor Production.',
        'Choice criteria: if you run a single-shift packaging line with moderate volume and consistent substrate, the standard 2900 is sufficient. If you run multi-shift commercial work with frequent substrate changes, brand owners demanding M1 plus M3 in the same job, or 24 by 5 operation, the Pro is the better fit.',
        'Total cost of ownership matters more than capital cost. Both models have the same maintenance cadence; the Pro\'s incremental cost amortizes over its higher utilization. A press that runs the scanner 2 000 hours per year will recover a Pro premium quickly; a press at 500 hours per year may not.',
        'X-Rite\'s authorized service partners can advise on the model-fit conversation. Both models share the same software stack, so migrating from 2900 to 2900PRO later is not a software-replatform event.',
      ],
    },
    {
      title: 'Hardware setup: tracks, sheet positioning, calibration',
      summary: 'The physical install that determines reliability for the next ten years.',
      body: [
        'IntelliTrax2 sits on a track adjacent to or above the operator console. Track lengths range from 29 inches (74 cm) to 65 inches (165 cm) depending on the maximum sheet size you run. Pick the longest track your space and budget allow; the marginal cost of a longer track at install is much lower than retrofitting later when a customer wants larger sheets.',
        'Sheet positioning is critical. The scanner expects the color bar to be within 38 mm of the sheet edge. Your imposition templates must respect this constraint; a color bar pushed too far into the printable area will not scan reliably. Most prepress teams handle this once they understand the constraint, but the first job on the new system frequently exposes an imposition oversight.',
        'Mechanical alignment of the scanner to the console matters. The scan head needs to be parallel to the sheet plane and at the right working distance. Out-of-spec alignment shows up as edge-of-sheet repeatability problems; patches at the operator side scan cleanly, patches at the gripper side drift. X-Rite\'s installation engineers verify alignment at commissioning; revisit it after any mechanical work nearby.',
        'Calibration on install includes white-tile, black, and instrument-to-instrument matching against a reference sample. The reference sample is your "ground truth" for the lifetime of the instrument; store it carefully. Periodic re-verification (typically annual) against the same reference catches drift early.',
        'Power and network requirements are modest: 100-240 VAC, 50/60 Hz, plus an Ethernet connection. UPS on the controller PC is recommended; a power glitch during a scan can corrupt the current job\'s data.',
      ],
    },
    {
      title: 'Geometry and conditions: 45°/0° and the M0/M1/M3 single-pass strategy',
      summary: 'The optical choices baked into every measurement.',
      body: [
        'IntelliTrax2 uses 45°/0° ring illumination, meaning the sample is lit from a 45° cone around its full 360° azimuth and read at 0° (normal). This geometry minimizes directional artifacts from press anisotropy and matches ISO 5-4:2009. It is the right geometry for graphic-arts measurement and the assumed default in modern color management.',
        'M0, M1, M3 are the measurement conditions IntelliTrax2 supports — but which ones you get depends on the scan head. The Small Spot head (2 mm patches) and Medium Spot head (3 mm, the standard) capture M0 and M1 simultaneously in one pass. The Polarizer head (3 mm min) adds M3, reading polarized and unpolarized data in a single scan. Note the trade-off: you cannot combine 2 mm patches with polarized measurement — the polarizer head needs 3 mm.',
        'Single-pass dual-condition matters operationally. Without it, you would need to scan each sheet twice, once per condition, doubling the operator time. With it, one pulled sheet satisfies both a legacy contract (M0) and a modern OBA-aware brand spec (M1) in the same scan.',
        'Spectral range is 400-700 nm at 10 nm intervals, the graphic-arts standard. Inter-instrument agreement averages 0.3 ΔEab with a maximum of 0.45 ΔEab; these are the X-Rite published numbers and represent the realistic ceiling for automated bar scanning today.',
        'For brand-owner contracts that specify M2 (D50 UV-cut), note that IntelliTrax2 captures M2 as a software-derived condition from M1 and M0 data, not directly. The accuracy is typically adequate for production use but a dedicated M2 spectro might be preferred for primary characterization work.',
      ],
    },
    {
      title: 'Color bars sized for 2 mm: what fits, what breaks',
      summary: 'The smallest patches in the industry, and their constraints.',
      body: [
        'IntelliTrax2 reads patches as small as 2 mm in height (small patch) or 3 mm (medium or polarizer patch). This is significantly tighter than legacy scanning systems, which typically required 4-5 mm. Smaller bars steal less printable area and let you fit more patches on the same sheet width.',
        'What fits at 2 mm: solid C, M, Y, K, three-quarter tone (75 %), midtone (50 %), quarter-tone (25 %), highlight (5 %), gray balance (CMY equal to K), overprint solids (R, G, B), and per-zone bars across the full sheet width. A 32-zone bar plus the global patches fits comfortably on a B1 sheet at the gripper or tail edge.',
        'What breaks at 2 mm: ink trapping is visible. The smaller the patch, the more an ink misregister (typically 0.05-0.1 mm) shows up as patch-to-patch variation rather than within-patch variation. Tight register is a precondition for tight-tolerance 2 mm measurement.',
        'Patch width matters too — but do not confuse patch width with zone width. Each ink zone gets its own patch (or patch group) positioned within that zone, so the patches are spaced at the zone pitch (roughly 30–38 mm depending on press OEM) and the bar spans the full live width of the sheet — around a metre on B1 — even though each individual patch is only 3–4 mm wide.',
        'The trade-off is repeatability. 2 mm patches have lower repeatability than 4 mm patches because the sensor integration window is smaller. For routine production, 2 mm is fine; for press fingerprinting (where you only do it occasionally and want maximum statistical confidence), use 4 mm bars on a dedicated test run.',
      ],
    },
    {
      title: 'Maintenance: non-contact, UV LED life, certification cycles',
      summary: 'The recurring costs that protect your data.',
      body: [
        'Non-contact measurement is one of IntelliTrax2\'s structural advantages. The scan head does not touch the sheet, so there is no contact wear, no transfer of ink to the sensor, and no scratches on the sheet. This is the main reason scanning systems outlive handheld spectros in equivalent duty cycles.',
        'UV LED life is the dominant aging factor. The UV light source ages with operating hours; output gradually decreases, M1 readings drift, and inter-instrument agreement degrades. Annual recertification through X-Rite or a certified service partner restores the calibration and resets the drift clock.',
        'Certification cycles are also a contractual reality. Some brand owners require evidence of recent instrument certification before accepting supplier reports. The certification paperwork should travel with the data trail; keep it in MeasureColor metadata, not in a separate filing system.',
        'Routine maintenance is light: wipe the white reference tile daily with a lint-free cloth, check the track for debris weekly, verify alignment quarterly. The non-contact design means there are no rollers, no platens, no consumables in the data path.',
        'Service partners are the operational reality of running IntelliTrax2 in production. X-Rite has 40+ certified partners globally; the partner ecosystem is mature enough that most pressrooms can get a technician on-site within 24 hours when needed. Negotiate the service contract terms upfront; reactive service is more expensive than proactive maintenance.',
      ],
    },
    {
      title: 'Migrating from legacy IntelliTrax (model 2246): what to expect',
      summary: 'The discontinued generation, the upgrade path, the operator transition.',
      body: [
        'The original IntelliTrax (model 2246) is explicitly discontinued by X-Rite. The official support page directs users to upgrade to IntelliTrax2. New parts are increasingly scarce; the service partner network is winding down dedicated 2246 expertise. If you still run 2246 in production, plan the migration before it becomes urgent.',
        'The good news: software-level workflows carry over. If you run MeasureColor Production with a 2246, the same Production install supports a 2900 or 2900PRO after the hardware swap. Job templates, color bars, and tolerance libraries do not need to be rebuilt; they are device-agnostic above the hardware abstraction layer.',
        'What changes: faster scans (under 10 seconds versus 15-20 on 2246), tighter minimum patch size (2 mm versus 4 mm), single-pass dual-condition measurement (M0/M1, M0/M3, M1/M3 versus single condition on 2246), and broader inter-instrument agreement specifications.',
        'What the operator notices on day one: faster cycle time, cleaner data display, tighter measurement tolerances. The training delta is small; a 2246 operator picks up 2900 operation within a shift.',
        'Plan the migration window carefully. The hardware swap requires press downtime (typically half a day) plus calibration and verification on the new instrument (another half day). Schedule it during a known low-demand window; do not migrate the week before a major brand-owner audit.',
        'Total cost of migration is typically 15-25 % of an original purchase, depending on track length and software entitlements. Most pressrooms recover the migration cost within a year through the productivity delta alone, before factoring in the avoided risk of running unsupported hardware.',
      ],
    },
  ],
  'colorloop-ai': [
    {
      title: 'What "AI-guided makeready" actually means (and what it does not)',
      summary: 'Cutting through the hype to the working definition.',
      body: [
        'ColorLoop\'s AI is not a generative model and is not the same technology that powers ChatGPT. It is a supervised learning system trained on the historical measurement data of your pressroom. It learns the relationship between job inputs (substrate, ink set, coverage profile, ambient conditions) and the ink-key positions that achieved good color on previous similar jobs.',
        'What it does: predict starting ink-key positions for a new job based on the closest historical match. The prediction is then refined by real-time closed-loop correction during makeready. The combined effect is fewer correction cycles before reaching target color.',
        'What it does not do: replace the closed-loop layer beneath it. The AI is a starting-point predictor; the closed-loop system is the actual color controller. If you remove the closed-loop, the AI prediction alone is a guess. If you remove the AI, the closed-loop still works, just with a generic CIP3-based starting position instead of a learned one.',
        'The honest framing: AI-guided makeready typically saves 15-30 % of additional time and waste on top of vanilla closed-loop. Vanilla closed-loop already saved 30-55 % over open-loop. The AI is a refinement, not a revolution.',
        'For pressrooms not yet running closed-loop, the AI is the wrong place to start. Get closed-loop in production first, accumulate 6-12 months of measurement history, then enable the AI layer. The AI needs that history to be useful.',
      ],
    },
    {
      title: 'Training the model on your jobs: 30, 90, 365 days',
      summary: 'The learning curve, with realistic expectations per phase.',
      body: [
        'Day zero of ColorLoop AI is the cold start. The model has no history of your shop; it falls back to a generic CIP3 starting position and the closed-loop layer does the rest. Performance is roughly equivalent to standard closed-loop without AI.',
        'After 30 days (typically 90-120 makereadies), the model has seen enough of your common substrates and ink combinations to make useful starting predictions on familiar work. Expected gain over generic CIP3: 10-15 % faster to target on jobs similar to recent history.',
        'After 90 days (300+ makereadies), the model has covered most of your routine production. It also has learned the substrate-specific quirks: how this paper batch behaves versus the previous one, how this ink set drifts versus that one. Gain over generic CIP3: 20-25 %.',
        'After 365 days (around 700–900 makereadies on a 3-per-day, 5-day pattern), the model has seen the seasonal effects (humidity changes, ink supplier batches over time, operator rotation) and edge cases. Gain over generic CIP3: 25-35 %. The model continues to improve beyond a year, but the curve flattens.',
        'New press? New substrate? New ink supplier? The model needs additional training data for the new variable. Plan for 30-60 days of slightly degraded prediction after any major input change, then back to the previous learning rate.',
      ],
    },
    {
      title: 'Predictive ink-key positioning versus reactive correction',
      summary: 'Anticipating the curve versus chasing it.',
      body: [
        'Reactive correction is what every closed-loop system does: measure the sheet, compare to target, move the ink keys, measure the next sheet. The cycle is fast (5-10 seconds per iteration) and usually converges within 10-30 sheets. The "30 sheets" matter; they are the waste sheets between "press started" and "press in target".',
        'Predictive positioning aims to eliminate part of that waste. If the AI predicts the right ink-key opening before the press starts, the first sheet is already close to target. The closed-loop layer then has less correction to apply, fewer iterations to run, and fewer waste sheets to produce.',
        'The math is multiplicative. If the AI gets you 70 % of the way to target instead of 40 %, the closed-loop loop runs fewer cycles. Fewer cycles equal fewer sheets. Fewer sheets equal lower waste cost per makeready.',
        'Where predictive shines: jobs that are similar to recent history. Where it stalls: genuinely new work the model has not seen before. The system knows the difference; it reports confidence with each prediction, so the operator knows when to trust the predicted starting position versus when to fall back to a manual approach.',
        'Practical operator experience: jobs that used to take 20 minutes of makeready now take 12-15. The press operators notice the saved time before they notice the saved paper, but both effects compound across a year.',
      ],
    },
    {
      title: 'ColorLoop\'s data layer: connecting press, measurement, MIS',
      summary: 'The pipes between systems that make the AI work.',
      body: [
        'AI is only as good as its training data. ColorLoop\'s data layer is the integration tissue that feeds the model: press telemetry from the OEM console, measurements from IntelliTrax2 or MeasureColor, job metadata from the MIS, and environmental data (temperature, humidity) from in-room sensors.',
        'Press telemetry includes ink-key positions, fountain solution chemistry, blanket pressure, plate temperature, register data, and impressions per minute. Most modern presses expose this via standard protocols (JDF/JMF, OPC UA, or OEM-specific XML). ColorLoop reads it continuously during the run.',
        'Measurement data is the ground truth. Every measurement event becomes a training example: given inputs X, the resulting color was Y. The model learns the mapping from inputs to outputs across thousands of examples.',
        'MIS metadata adds the business context: customer, substrate, ink batch, deadline pressure. The model uses this for similarity matching (find me the historical jobs that look most like this one) and for tracking outcomes (which customers achieve consistent results, which substrates trigger more variance).',
        'Environmental data closes the loop on physical effects. A 5 °C temperature swing between morning and afternoon shifts changes ink viscosity and substrate behavior; the model needs to know it.',
        'The data layer is the single biggest determinant of ColorLoop\'s effectiveness. A pressroom with rich press telemetry and clean MIS data will see the AI deliver visible results within 30 days. A pressroom with patchy telemetry will take 90+ days to reach the same level of useful prediction.',
      ],
    },
    {
      title: 'From operator decision to autonomous correction: staged adoption',
      summary: 'The cultural change, paced over months.',
      body: [
        'Autonomy is not a switch you flip. It is a continuum, and the right place on the continuum depends on the job, the operator confidence, and the brand-owner risk profile. ColorLoop supports four stages, and most pressrooms cycle through all four during adoption.',
        'Stage one: advisory. The system displays its prediction and recommended actions, but the operator executes every adjustment manually. Use stage one for the first 4-8 weeks of operation while operators learn what the system is telling them.',
        'Stage two: assisted. The operator approves each recommendation with a single click before the system executes. This is the "one human in the loop" mode that satisfies most quality-management policies. Stay here for 2-4 months while building data and trust.',
        'Stage three: supervised autonomous. The system executes corrections automatically; the operator monitors a live feed and intervenes only on alerts. This is the production-mode for routine work after 6+ months of accumulated history.',
        'Stage four: fully autonomous. The system runs the makeready end-to-end, including correction decisions, with the operator handling exceptions and physical interventions (paper jams, plate changes). Reach this stage cautiously and only on well-understood job categories; high-stakes brand-owner work often stays at stage three indefinitely.',
        'Each stage transition is a deliberate decision, not a feature toggle. Document the criteria for moving to the next stage (e.g., 30 consecutive jobs in stage two with no escalations) and review them quarterly with operations and quality leadership.',
      ],
    },
  ],
  'offset360': [
    {
      title: 'The Offset360 architecture: what each component does',
      summary: 'Three layers, one outcome.',
      body: [
        'Offset360 is not a product in the catalog sense; it is a solution bundle that X-Rite assembles from three independent technologies. The first layer is Rutherford closed-loop control: ink-key actuation, decision logic, operator console. The second layer is IntelliTrax2 automated scanning: the measurement that feeds the loop. The third layer is MeasureColor Production and Reports: the software backbone for quality data capture, storage, and reporting.',
        'The three layers are independently capable. You can buy IntelliTrax2 without Offset360 (many pressrooms do). You can buy MeasureColor without IntelliTrax2 (using handhelds or strip readers). You can buy Rutherford closed-loop with a different measurement device. Offset360 is the configuration where all three are sourced together and pre-integrated.',
        'The advantage of the bundle is integration. The three vendors have spent years aligning their interfaces, so the install is faster, the data flow is cleaner, and the support model is unified. If something breaks, you call one number, not three.',
        'The trade-off is choice. A bespoke installation (IntelliTrax2 plus a different software stack, or a different scanner plus MeasureColor) gives you more flexibility but requires more integration work. For most packaging and commercial offset operations, the bundle is the right choice. For specialty applications, bespoke can be worth the extra effort.',
        'The Offset360 landing page lives at xrite.com/page/offset360, which is also the canonical reference for the current bundle composition.',
      ],
    },
    {
      title: 'Wiring the three systems together',
      summary: 'The integration topology, link by link.',
      body: [
        'IntelliTrax2 sits press-side on its scan track, next to the console: the operator pulls a sheet from the delivery and places it on the track for the automated read. The system connects via Ethernet to its dedicated controller PC, which also hosts (or is networked to) MeasureColor Production. The measurement data flows from scanner to controller to MeasureColor in under a second per scanned sheet.',
        'MeasureColor Production sits on a Windows workstation near the operator. Its SQL database can be local (single-machine install) or central (multi-machine, multi-site install). For Offset360, single-machine is the norm; central is an upgrade path.',
        'Rutherford\'s console interface connects to MeasureColor via a documented API. When MeasureColor records a measurement, it pushes the result to Rutherford within the same network. Rutherford\'s decision engine reads the measurement, computes the ink-key corrections, and pushes them to the press OEM console (Prinect, LogoTronic, PDC, Pecom).',
        'Network segmentation matters. The press OEM console is usually on a dedicated industrial VLAN; the measurement workstation is usually on the office VLAN; the IntelliTrax2 controller can be on either. Document the VLAN choices at install; they affect firewall rules, latency, and IT support burden.',
        'Time synchronization is non-trivial. All three layers need consistent timestamps for the data trail to make sense. Run NTP on all systems against the same time source. This sounds boring; it is the single most common source of "weird data" complaints in multi-system installations.',
      ],
    },
    {
      title: 'End-to-end job flow: prepress → setup → measure → correct → report',
      summary: 'One job, five stages, one data trail.',
      body: [
        'Prepress is stage zero. The job arrives from the customer, gets imposed, separated, and ripped. The RIP outputs the plates plus a CIP3 PPF file (or a CIP4 JDF). The PPF contains the dot coverage per zone per separation, the input that determines ink-key opening before the press starts.',
        'Setup is stage one. The CIP3 file imports into the press console; Rutherford reads it and applies learned offsets to refine the predicted ink-key positions. The operator loads the plates, mounts the inks, calls up the job template from MeasureColor.',
        'Measure is stage two. The press starts; the operator pulls sheets from the delivery at regular intervals and runs them across IntelliTrax2; the spectral data flows to MeasureColor. Seconds after the pulled sheet hits the track, the system has ΔE 00 per ink per zone.',
        'Correct is stage three. The measurement data flows to Rutherford, which computes the next ink-key adjustment, sends it to the OEM console, which moves the keys before the next sheet pulls. The cycle repeats; ΔE 00 converges toward target.',
        'Report is stage four. When the job ends, MeasureColor aggregates the data: total sheets measured, sheets in tolerance, sheets out of tolerance, operator ID, makeready duration. A PDF report goes to the customer along with the delivery; a PQX record goes into the MeasureColor Reports archive for trend analysis.',
        'The job has one data trail across all five stages. That continuity is what makes audits painless, what makes ROI calculations possible, and what makes the brand-owner conversation factual rather than rhetorical.',
      ],
    },
    {
      title: 'Real-world ROI: calage, gâche, brand reports',
      summary: 'Three named benefits, with the math behind each.',
      body: [
        'Makeready time reduction is the most measurable benefit. A B1 6-color press averaging 120 minutes of makeready before Offset360 typically drops to 75-85 minutes after. At 3 makereadies per day, 225 production days per year (675 makereadies), and €150/h press cost, a 40-minute saving is worth €67,500 per press per year in recovered press time.',
        'Paper waste reduction is the second benefit. Sheet count per makeready drops from a typical 800 to a typical 350-450. At ≈€0.21 per sheet (B1 250 g/m² at €1 200/t) and 675 makereadies per year, a 400-sheet saving per makeready is worth ≈€57,000 per press per year in paper alone.',
        'Brand-owner reporting is the third benefit and the hardest to quantify in euros. The supplier that delivers PDF or PQX quality reports on schedule, with audit-grade data trails, has fewer contract renegotiations, lower audit risk, and longer customer relationships. A single avoided contract loss can be worth more than the entire system payback.',
        'Real installations report payback periods of 9-18 months on a single B1 press, before factoring in the contract-retention effects. Multi-press deployments see faster payback on incremental presses because the per-machine integration cost amortizes against shared software infrastructure.',
        'The case studies behind these numbers, Avery Dennison Queretaro, WestRock MPS, Moderna Printing, LEFRANCQ Packaging, are documented in Rutherford\'s public materials. The numbers are conservative and reproducible; they are not best-case scenarios.',
      ],
    },
    {
      title: 'Common implementation pitfalls and how to avoid them',
      summary: 'The mistakes that turn an Offset360 install into a slog.',
      body: [
        'Pitfall one: skipping the prepress alignment. CIP3 files coming out of the RIP need to match the ink-key zone layout on the press. A mismatch (wrong sheet size assumed, wrong gripper margin) defeats the whole presetting layer. Audit the prepress-to-press handoff in week one of any new install.',
        'Pitfall two: under-investing in operator training. Operators who do not understand what the system is doing override its recommendations and erode the value proposition. Plan for a full week of operator training per shift, not the half-day the vendor budget might suggest. Have shift leads attend deeper sessions and become the in-house experts.',
        'Pitfall three: ignoring the press maintenance baseline. Closed-loop systems can compensate for some variability but cannot fix a misaligned press, a worn blanket, or a contaminated dampening system. If the underlying press is in poor mechanical condition, the closed-loop system will be the canary, not the cure. Sort the mechanicals before installing.',
        'Pitfall four: rushing the brand-owner conversation. Customers should be brought into the conversation early. "We are installing Offset360 in Q2; your jobs will be measured under M1 going forward; we will be sending you PQX reports starting in Q3." A surprised brand owner is a defensive brand owner; a prepared one is a collaborator.',
        'Pitfall five: under-budgeting for ongoing service. Recertification, calibration, occasional adapter swaps, the recurring service cost of a multi-vendor system is non-trivial. Negotiate it upfront, include it in the operations budget, and treat it as a fixed cost like press maintenance, not a variable cost to be deferred.',
        'Avoid these five and the install runs smoothly. Fall into any of them and the project becomes a quarterly status meeting that nobody wants to attend.',
      ],
    },
  ],
};

export function getLessonsForCourse(slug: string): Lesson[] | undefined {
  return COURSE_LESSONS[slug];
}
