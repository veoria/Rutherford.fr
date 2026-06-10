'use client';

import { useMemo, useState } from 'react';
import { useLanguage, type Locale } from '@/components/language-provider';

type Copy = {
  kicker: string;
  headline: string;
  intro: string;
  inputs: {
    calages: { label: string; hint: string };
    temps: { label: string; hint: string };
    gache: { label: string; hint: string };
    coutPresse: { label: string; hint: string };
  };
  machine: {
    label: string;
    format: string;
    colors: string;
    formats: { b2: string; b1: string; vlf: string };
    sheetNote: (dims: string, cost: string) => string;
  };
  table: {
    line: string;
    paper: string;
    press: string;
    total: string;
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
      'Pick your press — sheet format and number of colors — then fine-tune your makeready figures. Every value stays adjustable.',
    inputs: {
      calages: { label: 'Makereadies per day', hint: 'Median B1 6-color: 3' },
      temps: { label: 'Makeready time (minutes)', hint: 'From wash-up to press-OK' },
      gache: { label: 'Makeready waste (sheets)', hint: 'Sheets to first good copy' },
      coutPresse: { label: 'Press cost per hour (€)', hint: 'Loaded hourly press cost' },
    },
    machine: {
      label: 'Your press',
      format: 'Sheet format',
      colors: 'Colors',
      formats: { b2: 'B2 — 53 × 75 cm', b1: 'B1 — 70 × 100 cm', vlf: 'Large format — 110 × 162 cm' },
      sheetNote: (dims, cost) => `Sheet ${dims} · ≈ ${cost}/sheet (250 g/m², €1,200/t)`,
    },
    table: {
      line: 'Item',
      paper: 'Paper saved',
      press: 'Press time recovered',
      total: 'Total saving',
      perYear: '/ year',
      perMonth: '/ month',
      sheets: 'sheets/year',
      hours: 'press hours/year',
    },
    disclaimer:
      'Estimated on 225 production days/year and ColorLoop targets of −55% sheet waste and −38% makeready time. Paper at 250 g/m² and €1,200/t for the selected sheet format.',
    cta: 'Talk to a Rutherford expert',
  },
  fr: {
    kicker: 'Estimateur ROI',
    headline: 'Combien ColorLoop peut-il vous faire économiser ?',
    intro:
      'Choisissez votre presse — format de feuille et nombre de couleurs — puis affinez vos chiffres de calage. Toutes les valeurs restent ajustables.',
    inputs: {
      calages: { label: 'Calages par jour', hint: 'Médian B1 6c : 3' },
      temps: { label: 'Temps de calage (minutes)', hint: 'Du lavage au BAT presse OK' },
      gache: { label: 'Gâche par calage (feuilles)', hint: 'Feuilles jusqu’au premier bon' },
      coutPresse: { label: 'Coût horaire presse (€)', hint: 'Coût horaire presse chargé' },
    },
    machine: {
      label: 'Votre presse',
      format: 'Format de feuille',
      colors: 'Couleurs',
      formats: { b2: 'B2 — 53 × 75 cm', b1: 'B1 — 70 × 100 cm', vlf: 'Grand format — 110 × 162 cm' },
      sheetNote: (dims, cost) => `Feuille ${dims} · ≈ ${cost}/feuille (250 g/m², 1 200 €/t)`,
    },
    table: {
      line: 'Poste',
      paper: 'Papier économisé',
      press: 'Temps presse récupéré',
      total: 'Économie totale',
      perYear: '/ an',
      perMonth: '/ mois',
      sheets: 'feuilles/an',
      hours: 'heures presse/an',
    },
    disclaimer:
      'Estimé sur 225 jours de production/an et les objectifs ColorLoop de −55 % gâche et −38 % temps de calage. Papier 250 g/m² à 1 200 €/t pour le format de feuille sélectionné.',
    cta: 'Parler à un expert Rutherford',
  },
  de: {
    kicker: 'ROI-Rechner',
    headline: 'Wie viel kann ColorLoop in Ihrer Druckerei sparen?',
    intro:
      'Wählen Sie Ihre Druckmaschine — Bogenformat und Farbenzahl — und verfeinern Sie dann Ihre Einrichtungswerte. Alle Werte bleiben einstellbar.',
    inputs: {
      calages: { label: 'Einrichtungen pro Tag', hint: 'Median B1 6-Farben: 3' },
      temps: { label: 'Einrichtungszeit (Minuten)', hint: 'Vom Waschen bis Druck-OK' },
      gache: { label: 'Makulatur pro Einrichtung (Bogen)', hint: 'Bogen bis zum ersten Gutbogen' },
      coutPresse: { label: 'Stundensatz Presse (€)', hint: 'Belasteter Stundensatz' },
    },
    machine: {
      label: 'Ihre Druckmaschine',
      format: 'Bogenformat',
      colors: 'Farben',
      formats: { b2: 'B2 — 53 × 75 cm', b1: 'B1 — 70 × 100 cm', vlf: 'Großformat — 110 × 162 cm' },
      sheetNote: (dims, cost) => `Bogen ${dims} · ≈ ${cost}/Bogen (250 g/m², 1.200 €/t)`,
    },
    table: {
      line: 'Position',
      paper: 'Papier eingespart',
      press: 'Pressenzeit gewonnen',
      total: 'Gesamtersparnis',
      perYear: '/ Jahr',
      perMonth: '/ Monat',
      sheets: 'Bogen/Jahr',
      hours: 'Pressenstunden/Jahr',
    },
    disclaimer:
      'Geschätzt auf 225 Produktionstage/Jahr und ColorLoop-Zielen von −55 % Makulatur und −38 % Einrichtungszeit. Papier mit 250 g/m² zu 1.200 €/t für das gewählte Bogenformat.',
    cta: 'Mit einem Rutherford-Experten sprechen',
  },
  it: {
    kicker: 'Stima ROI',
    headline: 'Quanto può farti risparmiare ColorLoop?',
    intro:
      'Scelga la sua macchina — formato foglio e numero di colori — e poi affini i parametri di avviamento. Tutti i valori restano regolabili.',
    inputs: {
      calages: { label: 'Avviamenti al giorno', hint: 'Mediana B1 6c: 3' },
      temps: { label: 'Tempo di avviamento (minuti)', hint: 'Dal lavaggio al BAT pressa OK' },
      gache: { label: 'Scarto per avviamento (fogli)', hint: 'Fogli fino al primo buono' },
      coutPresse: { label: 'Costo orario macchina (€)', hint: 'Costo orario caricato' },
    },
    machine: {
      label: 'La sua macchina',
      format: 'Formato foglio',
      colors: 'Colori',
      formats: { b2: 'B2 — 53 × 75 cm', b1: 'B1 — 70 × 100 cm', vlf: 'Grande formato — 110 × 162 cm' },
      sheetNote: (dims, cost) => `Foglio ${dims} · ≈ ${cost}/foglio (250 g/m², 1.200 €/t)`,
    },
    table: {
      line: 'Voce',
      paper: 'Carta risparmiata',
      press: 'Tempo macchina recuperato',
      total: 'Risparmio totale',
      perYear: '/ anno',
      perMonth: '/ mese',
      sheets: 'fogli/anno',
      hours: 'ore macchina/anno',
    },
    disclaimer:
      'Stimato su 225 giorni di produzione/anno e sui target ColorLoop di −55 % scarto e −38 % tempo di avviamento. Carta da 250 g/m² a 1.200 €/t per il formato foglio selezionato.',
    cta: 'Parla con un esperto Rutherford',
  },
  es: {
    kicker: 'Estimador de ROI',
    headline: '¿Cuánto puede ahorrarle ColorLoop a su sala de prensa?',
    intro:
      'Elija su prensa — formato de pliego y número de colores — y luego ajuste sus cifras de puesta a punto. Todos los valores siguen siendo ajustables.',
    inputs: {
      calages: { label: 'Puestas a punto por día', hint: 'Mediana B1 6c: 3' },
      temps: { label: 'Tiempo de puesta a punto (minutos)', hint: 'Del lavado al BAT prensa OK' },
      gache: { label: 'Desperdicio por puesta (pliegos)', hint: 'Pliegos hasta el primer bueno' },
      coutPresse: { label: 'Coste hora prensa (€)', hint: 'Coste horario cargado' },
    },
    machine: {
      label: 'Su prensa',
      format: 'Formato de pliego',
      colors: 'Colores',
      formats: { b2: 'B2 — 53 × 75 cm', b1: 'B1 — 70 × 100 cm', vlf: 'Gran formato — 110 × 162 cm' },
      sheetNote: (dims, cost) => `Pliego ${dims} · ≈ ${cost}/pliego (250 g/m², 1.200 €/t)`,
    },
    table: {
      line: 'Concepto',
      paper: 'Papel ahorrado',
      press: 'Tiempo prensa recuperado',
      total: 'Ahorro total',
      perYear: '/ año',
      perMonth: '/ mes',
      sheets: 'pliegos/año',
      hours: 'horas prensa/año',
    },
    disclaimer:
      'Estimado sobre 225 días de producción/año y los objetivos ColorLoop de −55 % desperdicio y −38 % tiempo de puesta a punto. Papel de 250 g/m² a 1.200 €/t para el formato de pliego seleccionado.',
    cta: 'Hablar con un experto Rutherford',
  },
};

// Constants from the spec (docs/roi-calculator-spec.md)
const PRODUCTION_DAYS_PER_YEAR = 225; // 45 weeks × 5 days
const REDUCTION_PAPER = 0.55; // ColorLoop target: −55%
const REDUCTION_TIME = 0.38; // ColorLoop target: −38%
const PAPER_GRAMMAGE_KG_M2 = 0.25; // 250 g/m²
const PAPER_EUR_PER_KG = 1.2; // €1,200 / tonne

// Machine presets: generic press classes (sheet format × color count).
// The sheet dims drive the sheet cost (KBA model: width × cut × grammage ×
// €/kg — B1 ≈ €0.21 matches the Academy course math, large format ≈ €0.5346
// matches the Rutherford × X-Rite "ROI CIP - KBA" template). The makeready
// figures are editable benchmarks per class, scaled with the unit count.
type MachineFormat = 'b2' | 'b1' | 'vlf';
type ColorCount = 4 | 5 | 6 | 8;
const MACHINE_FORMATS: MachineFormat[] = ['b2', 'b1', 'vlf'];
const COLOR_COUNTS: ColorCount[] = [4, 5, 6, 8];

const MACHINES: Record<
  MachineFormat,
  {
    sheetWidthMm: number;
    sheetCutMm: number;
    pressEurPerHour: number;
    makereadiesPerDay: number;
    byColors: Record<ColorCount, { minutes: number; sheets: number }>;
  }
> = {
  b2: {
    sheetWidthMm: 750,
    sheetCutMm: 530,
    pressEurPerHour: 110,
    makereadiesPerDay: 4,
    byColors: {
      4: { minutes: 70, sheets: 430 },
      5: { minutes: 80, sheets: 490 },
      6: { minutes: 90, sheets: 550 },
      8: { minutes: 110, sheets: 670 },
    },
  },
  b1: {
    sheetWidthMm: 1000,
    sheetCutMm: 707,
    pressEurPerHour: 150,
    makereadiesPerDay: 3,
    byColors: {
      4: { minutes: 95, sheets: 620 },
      5: { minutes: 105, sheets: 710 },
      6: { minutes: 120, sheets: 800 },
      8: { minutes: 145, sheets: 980 },
    },
  },
  vlf: {
    sheetWidthMm: 1620,
    sheetCutMm: 1100,
    pressEurPerHour: 220,
    makereadiesPerDay: 2,
    byColors: {
      4: { minutes: 110, sheets: 740 },
      5: { minutes: 125, sheets: 840 },
      6: { minutes: 140, sheets: 950 },
      8: { minutes: 170, sheets: 1160 },
    },
  },
};

function sheetCostEur(format: MachineFormat) {
  const m = MACHINES[format];
  return (m.sheetWidthMm / 1000) * (m.sheetCutMm / 1000) * PAPER_GRAMMAGE_KG_M2 * PAPER_EUR_PER_KG;
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

export function ColorLoopROI() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  // Defaults = the B1 × 6-color preset (the spec's median operation).
  const [machineFormat, setMachineFormat] = useState<MachineFormat>('b1');
  const [colorCount, setColorCount] = useState<ColorCount>(6);
  const [calages, setCalages] = useState(3);
  const [temps, setTemps] = useState(120);
  const [gache, setGache] = useState(800);
  const [coutPresse, setCoutPresse] = useState(150);

  // Selecting a press class prefills the four figures; sliders stay editable.
  const applyPreset = (format: MachineFormat, colors: ColorCount) => {
    const machine = MACHINES[format];
    const preset = machine.byColors[colors];
    setMachineFormat(format);
    setColorCount(colors);
    setCalages(machine.makereadiesPerDay);
    setTemps(preset.minutes);
    setGache(preset.sheets);
    setCoutPresse(machine.pressEurPerHour);
  };

  const sheetCost = sheetCostEur(machineFormat);
  const machine = MACHINES[machineFormat];

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

      <div className="colorloop-roi-grid">
        <div className="colorloop-roi-inputs">
          <div className="roi-machine">
            <p className="roi-machine-label">{t.machine.label}</p>
            <div className="roi-machine-group">
              <span className="roi-machine-group-label">{t.machine.format}</span>
              <div className="roi-seg" role="group" aria-label={t.machine.format}>
                {MACHINE_FORMATS.map((format) => (
                  <button
                    key={format}
                    type="button"
                    className={machineFormat === format ? 'is-active' : ''}
                    onClick={() => applyPreset(format, colorCount)}
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
                    onClick={() => applyPreset(machineFormat, colors)}
                  >
                    {colors}
                  </button>
                ))}
              </div>
            </div>
            <p className="roi-sheet-note">
              {t.machine.sheetNote(
                `${formatNum(locale, machine.sheetCutMm)} × ${formatNum(locale, machine.sheetWidthMm)} mm`,
                formatEurPrecise(locale, sheetCost)
              )}
            </p>
          </div>
          <SliderInput
            id="roi-calages"
            label={t.inputs.calages.label}
            hint={t.inputs.calages.hint}
            value={calages}
            min={1}
            max={10}
            step={1}
            onChange={setCalages}
          />
          <SliderInput
            id="roi-temps"
            label={t.inputs.temps.label}
            hint={t.inputs.temps.hint}
            value={temps}
            min={30}
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
          <table className="colorloop-roi-table">
            <thead>
              <tr>
                <th scope="col">{t.table.line}</th>
                <th scope="col" className="colorloop-roi-table-num">
                  {t.table.perYear}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  <span className="colorloop-roi-row-label">{t.table.paper}</span>
                  <span className="colorloop-roi-row-sub">
                    {formatNum(locale, result.sheetsSaved)} {t.table.sheets}
                  </span>
                </th>
                <td className="colorloop-roi-table-num">{formatEur(locale, result.paperEur)}</td>
              </tr>
              <tr>
                <th scope="row">
                  <span className="colorloop-roi-row-label">{t.table.press}</span>
                  <span className="colorloop-roi-row-sub">
                    {formatNum(locale, result.hoursSaved)} {t.table.hours}
                  </span>
                </th>
                <td className="colorloop-roi-table-num">{formatEur(locale, result.pressEur)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">{t.table.total}</th>
                <td className="colorloop-roi-table-num colorloop-roi-table-total">
                  {formatEur(locale, result.total)}
                </td>
              </tr>
              <tr>
                <th scope="row" className="colorloop-roi-table-sub-row">
                  {t.table.perMonth}
                </th>
                <td className="colorloop-roi-table-num colorloop-roi-table-sub-row">
                  {formatEur(locale, result.total / 12)}
                </td>
              </tr>
            </tfoot>
          </table>

          <p className="colorloop-roi-disclaimer">{t.disclaimer}</p>

          <a className="button button-dark colorloop-roi-cta" href="mailto:contact@rutherford.fr">
            {t.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
