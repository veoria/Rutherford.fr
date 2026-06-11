'use client';

import { useMemo, useState } from 'react';
import { useLanguage, type Locale } from '@/components/language-provider';
import { PressSchematic } from '@/components/press-schematic';

type Profile = 'commercial' | 'packaging' | 'luxe';
type MachineFormat = 'b2' | 'b1' | 'vlf';
type ColorCount = 4 | 5 | 6 | 8;

type Copy = {
  kicker: string;
  headline: string;
  intro: string;
  figuresHeading: string;
  inputs: {
    calages: { label: string; hint: string };
    temps: { label: string; hint: string };
    gache: { label: string; hint: string };
    coutPresse: { label: string; hint: string };
  };
  machine: {
    profile: string;
    format: string;
    colors: string;
    profiles: Record<Profile, string>;
    formats: Record<MachineFormat, string>;
    sheetNote: (dims: string, cost: string, paper: string) => string;
  };
  table: {
    line: string;
    paper: string;
    press: string;
    total: string;
    annual: string;
    perYear: string;
    perMonth: string;
    sheets: string;
    hours: string;
  };
  disclaimer: string;
  cta: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    kicker: 'ROI estimator',
    headline: 'How much could ColorLoop save your pressroom?',
    intro:
      'Pick your production profile, press format and number of colors — then fine-tune your makeready figures. Every value stays adjustable.',
    figuresHeading: 'Fine-tune your figures',
    inputs: {
      calages: { label: 'Makereadies per day', hint: 'Set by the profile — adjust freely' },
      temps: { label: 'Makeready time (minutes)', hint: 'From wash-up to press-OK' },
      gache: { label: 'Makeready waste (sheets)', hint: 'Sheets to first good copy' },
      coutPresse: { label: 'Press cost per hour (€)', hint: 'Loaded hourly press cost' },
    },
    machine: {
      profile: 'Production profile',
      format: 'Sheet format',
      colors: 'Colors',
      profiles: { commercial: 'Commercial', packaging: 'Packaging — carton', luxe: 'Packaging — luxury' },
      formats: { b2: 'B2 — 53 × 75 cm', b1: 'B1 — 70 × 100 cm', vlf: 'Large format — 110 × 162 cm' },
      sheetNote: (dims, cost, paper) => `Sheet ${dims} · ≈ ${cost}/sheet (${paper})`,
    },
    table: {
      line: 'Item',
      paper: 'Paper saved',
      press: 'Press time recovered',
      total: 'Total saving',
      annual: 'Estimated annual saving',
      perYear: '/ year',
      perMonth: '/ month',
      sheets: 'sheets/year',
      hours: 'press hours/year',
    },
    disclaimer:
      'Estimated on 225 production days/year and ColorLoop targets of −55% sheet waste and −38% makeready time. Paper grammage and price are set by the selected production profile.',
    cta: 'Talk to a Rutherford expert',
  },
  fr: {
    kicker: 'Estimateur ROI',
    headline: 'Combien ColorLoop peut-il vous faire économiser ?',
    intro:
      'Choisissez votre profil de production, le format de presse et le nombre de couleurs — puis affinez vos chiffres de calage. Toutes les valeurs restent ajustables.',
    figuresHeading: 'Affinez vos chiffres',
    inputs: {
      calages: { label: 'Calages par jour', hint: 'Défini par le profil — ajustez librement' },
      temps: { label: 'Temps de calage (minutes)', hint: 'Du lavage au BAT presse OK' },
      gache: { label: 'Gâche par calage (feuilles)', hint: 'Feuilles jusqu’au premier bon' },
      coutPresse: { label: 'Coût horaire presse (€)', hint: 'Coût horaire presse chargé' },
    },
    machine: {
      profile: 'Profil de production',
      format: 'Format de feuille',
      colors: 'Couleurs',
      profiles: { commercial: 'Commercial', packaging: 'Packaging carton', luxe: 'Packaging luxe' },
      formats: { b2: 'B2 — 53 × 75 cm', b1: 'B1 — 70 × 100 cm', vlf: 'Grand format — 110 × 162 cm' },
      sheetNote: (dims, cost, paper) => `Feuille ${dims} · ≈ ${cost}/feuille (${paper})`,
    },
    table: {
      line: 'Poste',
      paper: 'Papier économisé',
      press: 'Temps presse récupéré',
      total: 'Économie totale',
      annual: 'Économie annuelle estimée',
      perYear: '/ an',
      perMonth: '/ mois',
      sheets: 'feuilles/an',
      hours: 'heures presse/an',
    },
    disclaimer:
      'Estimé sur 225 jours de production/an et les objectifs ColorLoop de −55 % gâche et −38 % temps de calage. Le grammage et le prix du papier dépendent du profil de production sélectionné.',
    cta: 'Parler à un expert Rutherford',
  },
  de: {
    kicker: 'ROI-Rechner',
    headline: 'Wie viel kann ColorLoop in Ihrer Druckerei sparen?',
    intro:
      'Wählen Sie Produktionsprofil, Druckformat und Farbenzahl — und verfeinern Sie dann Ihre Einrichtungswerte. Alle Werte bleiben einstellbar.',
    figuresHeading: 'Werte anpassen',
    inputs: {
      calages: { label: 'Einrichtungen pro Tag', hint: 'Vom Profil gesetzt — frei anpassbar' },
      temps: { label: 'Einrichtungszeit (Minuten)', hint: 'Vom Waschen bis Druck-OK' },
      gache: { label: 'Makulatur pro Einrichtung (Bogen)', hint: 'Bogen bis zum ersten Gutbogen' },
      coutPresse: { label: 'Stundensatz Presse (€)', hint: 'Belasteter Stundensatz' },
    },
    machine: {
      profile: 'Produktionsprofil',
      format: 'Bogenformat',
      colors: 'Farben',
      profiles: { commercial: 'Akzidenz', packaging: 'Verpackung — Karton', luxe: 'Verpackung — Luxus' },
      formats: { b2: 'B2 — 53 × 75 cm', b1: 'B1 — 70 × 100 cm', vlf: 'Großformat — 110 × 162 cm' },
      sheetNote: (dims, cost, paper) => `Bogen ${dims} · ≈ ${cost}/Bogen (${paper})`,
    },
    table: {
      line: 'Position',
      paper: 'Papier eingespart',
      press: 'Pressenzeit gewonnen',
      total: 'Gesamtersparnis',
      annual: 'Geschätzte jährliche Ersparnis',
      perYear: '/ Jahr',
      perMonth: '/ Monat',
      sheets: 'Bogen/Jahr',
      hours: 'Pressenstunden/Jahr',
    },
    disclaimer:
      'Geschätzt auf 225 Produktionstage/Jahr und ColorLoop-Zielen von −55 % Makulatur und −38 % Einrichtungszeit. Papiergewicht und -preis richten sich nach dem gewählten Produktionsprofil.',
    cta: 'Mit einem Rutherford-Experten sprechen',
  },
  it: {
    kicker: 'Stima ROI',
    headline: 'Quanto può farti risparmiare ColorLoop?',
    intro:
      'Scelga il profilo di produzione, il formato di stampa e il numero di colori — poi affini i parametri di avviamento. Tutti i valori restano regolabili.',
    figuresHeading: 'Affini i Suoi parametri',
    inputs: {
      calages: { label: 'Avviamenti al giorno', hint: 'Impostato dal profilo — regola liberamente' },
      temps: { label: 'Tempo di avviamento (minuti)', hint: 'Dal lavaggio al BAT pressa OK' },
      gache: { label: 'Scarto per avviamento (fogli)', hint: 'Fogli fino al primo buono' },
      coutPresse: { label: 'Costo orario macchina (€)', hint: 'Costo orario caricato' },
    },
    machine: {
      profile: 'Profilo di produzione',
      format: 'Formato foglio',
      colors: 'Colori',
      profiles: { commercial: 'Commerciale', packaging: 'Packaging — cartoncino', luxe: 'Packaging — lusso' },
      formats: { b2: 'B2 — 53 × 75 cm', b1: 'B1 — 70 × 100 cm', vlf: 'Grande formato — 110 × 162 cm' },
      sheetNote: (dims, cost, paper) => `Foglio ${dims} · ≈ ${cost}/foglio (${paper})`,
    },
    table: {
      line: 'Voce',
      paper: 'Carta risparmiata',
      press: 'Tempo macchina recuperato',
      total: 'Risparmio totale',
      annual: 'Risparmio annuo stimato',
      perYear: '/ anno',
      perMonth: '/ mese',
      sheets: 'fogli/anno',
      hours: 'ore macchina/anno',
    },
    disclaimer:
      'Stimato su 225 giorni di produzione/anno e sui target ColorLoop di −55 % scarto e −38 % tempo di avviamento. Grammatura e prezzo della carta dipendono dal profilo di produzione selezionato.',
    cta: 'Parla con un esperto Rutherford',
  },
  es: {
    kicker: 'Estimador de ROI',
    headline: '¿Cuánto puede ahorrarle ColorLoop a su sala de prensa?',
    intro:
      'Elija su perfil de producción, el formato de prensa y el número de colores — y luego ajuste sus cifras de puesta a punto. Todos los valores siguen siendo ajustables.',
    figuresHeading: 'Ajuste sus cifras',
    inputs: {
      calages: { label: 'Puestas a punto por día', hint: 'Definido por el perfil — ajuste libremente' },
      temps: { label: 'Tiempo de puesta a punto (minutos)', hint: 'Del lavado al BAT prensa OK' },
      gache: { label: 'Desperdicio por puesta (pliegos)', hint: 'Pliegos hasta el primer bueno' },
      coutPresse: { label: 'Coste hora prensa (€)', hint: 'Coste horario cargado' },
    },
    machine: {
      profile: 'Perfil de producción',
      format: 'Formato de pliego',
      colors: 'Colores',
      profiles: { commercial: 'Comercial', packaging: 'Packaging — cartón', luxe: 'Packaging — lujo' },
      formats: { b2: 'B2 — 53 × 75 cm', b1: 'B1 — 70 × 100 cm', vlf: 'Gran formato — 110 × 162 cm' },
      sheetNote: (dims, cost, paper) => `Pliego ${dims} · ≈ ${cost}/pliego (${paper})`,
    },
    table: {
      line: 'Concepto',
      paper: 'Papel ahorrado',
      press: 'Tiempo prensa recuperado',
      total: 'Ahorro total',
      annual: 'Ahorro anual estimado',
      perYear: '/ año',
      perMonth: '/ mes',
      sheets: 'pliegos/año',
      hours: 'horas prensa/año',
    },
    disclaimer:
      'Estimado sobre 225 días de producción/año y los objetivos ColorLoop de −55 % desperdicio y −38 % tiempo de puesta a punto. El gramaje y el precio del papel dependen del perfil de producción seleccionado.',
    cta: 'Hablar con un experto Rutherford',
  },
};

// Constants from the spec (docs/roi-calculator-spec.md)
const PRODUCTION_DAYS_PER_YEAR = 225; // 45 weeks × 5 days
const REDUCTION_PAPER = 0.55; // ColorLoop target: −55%
const REDUCTION_TIME = 0.38; // ColorLoop target: −38%

const PROFILE_ORDER: Profile[] = ['commercial', 'packaging', 'luxe'];
const MACHINE_FORMATS: MachineFormat[] = ['b2', 'b1', 'vlf'];
const COLOR_COUNTS: ColorCount[] = [4, 5, 6, 8];

// Production profile drives the "current state" makeready behaviour (paper +
// makereadies/day + time + waste at the profile's typical color count).
// Commercial figures are operator-validated (≤30 min, 10/day, 200 sheets);
// packaging carton keeps the KBA reference (120 min / 800 sheets); luxury is
// the most exacting. Color count modulates time/waste around the typical.
const PROFILES: Record<
  Profile,
  {
    grammageKgM2: number;
    eurPerKg: number;
    makereadiesPerDay: number;
    typicalColors: ColorCount;
    timeTypical: number;
    wasteTypical: number;
  }
> = {
  commercial: { grammageKgM2: 0.1, eurPerKg: 1.0, makereadiesPerDay: 10, typicalColors: 4, timeTypical: 30, wasteTypical: 200 },
  packaging: { grammageKgM2: 0.28, eurPerKg: 1.15, makereadiesPerDay: 3, typicalColors: 6, timeTypical: 120, wasteTypical: 800 },
  luxe: { grammageKgM2: 0.33, eurPerKg: 1.35, makereadiesPerDay: 2, typicalColors: 6, timeTypical: 150, wasteTypical: 950 },
};

// Sheet format drives sheet dimensions (→ sheet cost) and loaded press €/h.
const FORMATS: Record<MachineFormat, { sheetWidthMm: number; sheetCutMm: number; pressEurPerHour: number }> = {
  b2: { sheetWidthMm: 750, sheetCutMm: 530, pressEurPerHour: 110 },
  b1: { sheetWidthMm: 1000, sheetCutMm: 707, pressEurPerHour: 150 },
  vlf: { sheetWidthMm: 1620, sheetCutMm: 1100, pressEurPerHour: 220 },
};

const TIME_PER_EXTRA_COLOR = 0.06; // +6% makeready time per color above the profile's typical
const WASTE_PER_EXTRA_COLOR = 0.09; // +9% waste per color above the profile's typical

function colorFactor(perColor: number, colors: ColorCount, typical: ColorCount) {
  return 1 + perColor * (colors - typical);
}

// KBA sheet-cost model: width(m) × cut(m) × grammage(kg/m²) × price(€/kg).
function sheetCostEur(profile: Profile, format: MachineFormat) {
  const p = PROFILES[profile];
  const f = FORMATS[format];
  return (f.sheetWidthMm / 1000) * (f.sheetCutMm / 1000) * p.grammageKgM2 * p.eurPerKg;
}

function formatEur(locale: Locale, value: number) {
  const code =
    locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : locale === 'it' ? 'it-IT' : locale === 'es' ? 'es-ES' : 'en-US';
  return new Intl.NumberFormat(code, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

function formatNum(locale: Locale, value: number) {
  const code =
    locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : locale === 'it' ? 'it-IT' : locale === 'es' ? 'es-ES' : 'en-US';
  return new Intl.NumberFormat(code, { maximumFractionDigits: 0 }).format(value);
}

function formatEurPrecise(locale: Locale, value: number) {
  const code =
    locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : locale === 'it' ? 'it-IT' : locale === 'es' ? 'es-ES' : 'en-US';
  return new Intl.NumberFormat(code, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

type SliderProps = {
  id: string;
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

function SliderInput({ id, label, hint, value, min, max, step, onChange }: SliderProps) {
  return (
    <div className="roi-input">
      <label htmlFor={id} className="roi-input-label">
        {label}
      </label>
      <div className="roi-input-row">
        <input
          id={id}
          type="range"
          className="roi-input-range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <input
          aria-label={label}
          type="number"
          className="roi-input-number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (!Number.isFinite(next)) return;
            onChange(Math.min(Math.max(next, min), max));
          }}
        />
      </div>
      <p className="roi-input-hint">{hint}</p>
    </div>
  );
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

export function ColorLoopROI() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  // Defaults = Packaging carton × B1 × 6 colors (Rutherford's core audience).
  const [profile, setProfile] = useState<Profile>('packaging');
  const [machineFormat, setMachineFormat] = useState<MachineFormat>('b1');
  const [colorCount, setColorCount] = useState<ColorCount>(6);
  const [calages, setCalages] = useState(3);
  const [temps, setTemps] = useState(120);
  const [gache, setGache] = useState(800);
  const [coutPresse, setCoutPresse] = useState(150);

  // Selecting profile / format / colors prefills the four figures; the sliders
  // stay fully editable afterwards.
  const applyPreset = (nextProfile: Profile, nextFormat: MachineFormat, nextColors: ColorCount) => {
    const p = PROFILES[nextProfile];
    setProfile(nextProfile);
    setMachineFormat(nextFormat);
    setColorCount(nextColors);
    setCalages(p.makereadiesPerDay);
    setTemps(roundTo(p.timeTypical * colorFactor(TIME_PER_EXTRA_COLOR, nextColors, p.typicalColors), 5));
    setGache(roundTo(p.wasteTypical * colorFactor(WASTE_PER_EXTRA_COLOR, nextColors, p.typicalColors), 50));
    setCoutPresse(FORMATS[nextFormat].pressEurPerHour);
  };

  const fmt = FORMATS[machineFormat];
  const profileData = PROFILES[profile];
  const sheetCost = sheetCostEur(profile, machineFormat);
  const paperNote = `${formatNum(locale, profileData.grammageKgM2 * 1000)} g/m² · ${formatNum(locale, profileData.eurPerKg * 1000)} €/t`;

  const result = useMemo(() => {
    const calagesYear = PRODUCTION_DAYS_PER_YEAR * calages;
    const sheetsSaved = calagesYear * gache * REDUCTION_PAPER;
    const paperEur = sheetsSaved * sheetCost;
    const hoursSaved = (calagesYear * temps * REDUCTION_TIME) / 60;
    const pressEur = hoursSaved * coutPresse;
    const total = paperEur + pressEur;
    return { sheetsSaved, paperEur, hoursSaved, pressEur, total };
  }, [calages, temps, gache, coutPresse, sheetCost]);

  return (
    <section className="colorloop-roi" id="roi" aria-labelledby="colorloop-roi-title">
      <header className="colorloop-roi-header">
        <p className="section-kicker">{t.kicker}</p>
        <h3 id="colorloop-roi-title" className="colorloop-roi-headline">
          {t.headline}
        </h3>
        <p className="colorloop-roi-intro">{t.intro}</p>
      </header>

      <div className="roi-hero">
        <PressSchematic format={machineFormat} colors={colorCount} label={t.headline} />
        <div className="roi-hero-controls">
          <div className="roi-machine-group">
            <span className="roi-machine-group-label">{t.machine.format}</span>
            <div className="roi-seg" role="group" aria-label={t.machine.format}>
              {MACHINE_FORMATS.map((format) => (
                <button
                  key={format}
                  type="button"
                  className={machineFormat === format ? 'is-active' : ''}
                  onClick={() => applyPreset(profile, format, colorCount)}
                >
                  {t.machine.formats[format]}
                </button>
              ))}
            </div>
          </div>
          <div className="roi-machine-group">
            <span className="roi-machine-group-label">{t.machine.colors}</span>
            <div className="roi-seg" role="group" aria-label={t.machine.colors}>
              {COLOR_COUNTS.map((colors) => (
                <button
                  key={colors}
                  type="button"
                  className={colorCount === colors ? 'is-active' : ''}
                  onClick={() => applyPreset(profile, machineFormat, colors)}
                >
                  {colors}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="colorloop-roi-grid">
        <div className="colorloop-roi-inputs">
          <h4 className="colorloop-roi-figures-heading">{t.figuresHeading}</h4>
          <div className="roi-machine-group roi-profile-group">
            <span className="roi-machine-group-label">{t.machine.profile}</span>
            <div className="roi-seg" role="group" aria-label={t.machine.profile}>
              {PROFILE_ORDER.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={profile === p ? 'is-active' : ''}
                  onClick={() => applyPreset(p, machineFormat, colorCount)}
                >
                  {t.machine.profiles[p]}
                </button>
              ))}
            </div>
          </div>
          <p className="roi-sheet-note">
            {t.machine.sheetNote(
              `${formatNum(locale, fmt.sheetCutMm)} × ${formatNum(locale, fmt.sheetWidthMm)} mm`,
              formatEurPrecise(locale, sheetCost),
              paperNote
            )}
          </p>
          <SliderInput
            id="roi-calages"
            label={t.inputs.calages.label}
            hint={t.inputs.calages.hint}
            value={calages}
            min={1}
            max={15}
            step={1}
            onChange={setCalages}
          />
          <SliderInput
            id="roi-temps"
            label={t.inputs.temps.label}
            hint={t.inputs.temps.hint}
            value={temps}
            min={20}
            max={240}
            step={5}
            onChange={setTemps}
          />
          <SliderInput
            id="roi-gache"
            label={t.inputs.gache.label}
            hint={t.inputs.gache.hint}
            value={gache}
            min={100}
            max={2000}
            step={50}
            onChange={setGache}
          />
          <SliderInput
            id="roi-cout"
            label={t.inputs.coutPresse.label}
            hint={t.inputs.coutPresse.hint}
            value={coutPresse}
            min={50}
            max={400}
            step={10}
            onChange={setCoutPresse}
          />
        </div>

        <div className="colorloop-roi-result">
          <p className="colorloop-roi-result-label">{t.table.annual}</p>
          {/* hero figure: normalise the locale's narrow no-break space to a plain
              space so the big number reads clearly, e.g. "122 267 €" */}
          <div className="colorloop-roi-result-total">
            {formatEur(locale, result.total).replace(/[\u202f\u00a0]/g, ' ')}
          </div>
          <p className="colorloop-roi-result-month">
            ≈ {formatEur(locale, result.total / 12)} {t.table.perMonth}
          </p>

          <div className="colorloop-roi-breakdown">
            <div className="colorloop-roi-brk-row">
              <span className="colorloop-roi-brk-key">
                {t.table.paper}
                <small>
                  {formatNum(locale, result.sheetsSaved)} {t.table.sheets}
                </small>
              </span>
              <span className="colorloop-roi-brk-val">{formatEur(locale, result.paperEur)}</span>
            </div>
            <div className="colorloop-roi-brk-row">
              <span className="colorloop-roi-brk-key">
                {t.table.press}
                <small>
                  {formatNum(locale, result.hoursSaved)} {t.table.hours}
                </small>
              </span>
              <span className="colorloop-roi-brk-val">{formatEur(locale, result.pressEur)}</span>
            </div>
          </div>

          <p className="colorloop-roi-disclaimer">{t.disclaimer}</p>

          <a className="button button-dark colorloop-roi-cta" href="mailto:contact@rutherford.fr">
            {t.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
