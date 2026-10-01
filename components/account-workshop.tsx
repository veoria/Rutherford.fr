'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { AccountSubnav } from '@/components/account-subnav';
import { PressSchematic, type PressFormat } from '@/components/press-schematic';
import { type Locale, useLanguage } from '@/components/language-provider';
import { COUNTRIES } from '@/data/onboarding-options';
import { localizedCountryName } from '@/lib/countries';
import { PRESS_BRANDS_PAGES } from '@/data/press-brands';
import {
  COLOR_PRESETS,
  CONSOLE_HINTS,
  MAX_COLORS,
  MIN_COLORS,
  MODEL_HINTS,
  PRESS_MANUFACTURERS,
  PRODUCTION_PROFILES,
  PROFILE_LABELS,
  SHEET_FORMATS,
  formatCopy,
  pressTitle,
  type ProductionProfile,
  type SheetFormat,
} from '@/data/press-config';

// "Mon atelier" — the client's own presses, grouped by site (plant). The press
// configurator is the ROI estimator's (format, colors, production profile, with
// the same live press schematic), so a client describes each machine the way
// the site already talks about it. Any member adds/edits presses; owners and
// admins also manage sites and delete.

export type WorkshopPress = {
  id: string;
  siteId: string | null;
  name: string | null;
  manufacturer: string;
  model: string | null;
  sheetFormat: SheetFormat;
  colors: number;
  coater: boolean;
  perfecting: boolean;
  productionProfile: ProductionProfile | null;
  console: string | null;
  year: number | null;
  notes: string | null;
};

export type WorkshopSite = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  address: string | null;
  postalCode: string | null;
};

type Copy = {
  title: string;
  sub: string;
  statPresses: (n: number) => string;
  statSites: (n: number) => string;
  statUnits: (n: number) => string;
  addPress: string;
  addSite: string;
  editSite: string;
  allSites: string;
  unplaced: string;
  emptyTitle: string;
  emptySub: string;
  siteEmpty: string;
  membersNote: string;
  card: { edit: string; remove: string; check: string; coater: string; perfecting: string; units: (n: number) => string };
  editor: {
    titleNew: string;
    titleEdit: string;
    stepMachine: string;
    stepConfig: string;
    stepPlace: string;
    manufacturer: string;
    other: string;
    otherPh: string;
    model: string;
    modelPh: (hint: string) => string;
    format: string;
    colors: string;
    coater: string;
    perfecting: string;
    profile: string;
    profileNone: string;
    site: string;
    siteNone: string;
    name: string;
    namePh: string;
    console: string;
    consolePh: (hint: string) => string;
    year: string;
    notes: string;
    quantity: string;
    quantityHint: string;
    save: string;
    saving: string;
    cancel: string;
    remove: string;
    confirmRemove: string;
    error: string;
  };
  siteEditor: {
    titleNew: string;
    titleEdit: string;
    name: string;
    namePh: string;
    city: string;
    postalCode: string;
    address: string;
    country: string;
    countryNone: string;
    save: string;
    remove: string;
    confirmRemove: string;
  };
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const COPY: Record<Locale, Copy> = {
  en: {
    title: 'My pressroom',
    sub: 'Every press in your plants, equipped or not. It is what our team uses to prepare validations, quotes and support.',
    statPresses: (n) => plural(n, 'press', 'presses'),
    statSites: (n) => plural(n, 'plant', 'plants'),
    statUnits: (n) => plural(n, 'printing unit', 'printing units'),
    addPress: 'Add a press',
    addSite: 'Add a plant',
    editSite: 'Edit plant',
    allSites: 'All plants',
    unplaced: 'Unassigned',
    emptyTitle: 'Describe your pressroom',
    emptySub: 'Add your presses one by one — brand, format, number of colors — and place them in your plants. Two minutes per machine.',
    siteEmpty: 'No press in this plant yet.',
    membersNote: 'Plants are managed by your account admins.',
    card: { edit: 'Edit', remove: 'Delete', check: 'Check console compatibility', coater: 'Coater', perfecting: 'Perfecting', units: (n) => plural(n, 'color', 'colors') },
    editor: {
      titleNew: 'Add a press',
      titleEdit: 'Edit press',
      stepMachine: 'Machine',
      stepConfig: 'Configuration',
      stepPlace: 'Location & details',
      manufacturer: 'Manufacturer',
      other: 'Other',
      otherPh: 'Manufacturer name',
      model: 'Model',
      modelPh: (h) => `e.g. ${h}`,
      format: 'Sheet format',
      colors: 'Colors',
      coater: 'Inline coater',
      perfecting: 'Perfecting',
      profile: 'Production profile',
      profileNone: 'Not specified',
      site: 'Plant',
      siteNone: 'Not assigned',
      name: 'Internal name',
      namePh: 'e.g. Press 3, Hall B',
      console: 'Console',
      consolePh: (h) => `e.g. ${h}`,
      year: 'Year',
      notes: 'Notes',
      quantity: 'Identical presses',
      quantityHint: 'Same configuration, numbered automatically.',
      save: 'Save',
      saving: 'Saving…',
      cancel: 'Cancel',
      remove: 'Delete this press',
      confirmRemove: 'Delete this press from your pressroom?',
      error: 'Could not save. Check the fields and try again.',
    },
    siteEditor: {
      titleNew: 'Add a plant',
      titleEdit: 'Edit plant',
      name: 'Plant name',
      namePh: 'e.g. Lyon plant',
      city: 'City',
      postalCode: 'Postal code',
      address: 'Address',
      country: 'Country',
      countryNone: 'Select a country',
      save: 'Save',
      remove: 'Delete this plant',
      confirmRemove: 'Delete this plant? Its presses stay in your pressroom, unassigned.',
    },
  },
  fr: {
    title: 'Mon atelier',
    sub: 'Toutes les presses de vos sites, équipées ou non. C’est la base dont notre équipe se sert pour préparer validations, devis et support.',
    statPresses: (n) => plural(n, 'presse', 'presses'),
    statSites: (n) => plural(n, 'site', 'sites'),
    statUnits: (n) => plural(n, 'groupe imprimant', 'groupes imprimants'),
    addPress: 'Ajouter une presse',
    addSite: 'Ajouter un site',
    editSite: 'Modifier le site',
    allSites: 'Tous les sites',
    unplaced: 'Non affecté',
    emptyTitle: 'Décrivez votre atelier',
    emptySub: 'Ajoutez vos presses une à une — constructeur, format, nombre de couleurs — et rangez-les par site. Deux minutes par machine.',
    siteEmpty: 'Aucune presse sur ce site pour l’instant.',
    membersNote: 'Les sites sont gérés par les administrateurs du compte.',
    card: { edit: 'Modifier', remove: 'Supprimer', check: 'Vérifier la compatibilité console', coater: 'Vernis', perfecting: 'Retiration', units: (n) => plural(n, 'couleur', 'couleurs') },
    editor: {
      titleNew: 'Ajouter une presse',
      titleEdit: 'Modifier la presse',
      stepMachine: 'Machine',
      stepConfig: 'Configuration',
      stepPlace: 'Emplacement et détails',
      manufacturer: 'Constructeur',
      other: 'Autre',
      otherPh: 'Nom du constructeur',
      model: 'Modèle',
      modelPh: (h) => `ex. ${h}`,
      format: 'Format de feuille',
      colors: 'Couleurs',
      coater: 'Groupe vernis',
      perfecting: 'Retiration',
      profile: 'Profil de production',
      profileNone: 'Non précisé',
      site: 'Site',
      siteNone: 'Non affecté',
      name: 'Nom interne',
      namePh: 'ex. Presse 3, Hall B',
      console: 'Console',
      consolePh: (h) => `ex. ${h}`,
      year: 'Année',
      notes: 'Notes',
      quantity: 'Presses identiques',
      quantityHint: 'Même configuration, numérotées automatiquement.',
      save: 'Enregistrer',
      saving: 'Enregistrement…',
      cancel: 'Annuler',
      remove: 'Supprimer cette presse',
      confirmRemove: 'Supprimer cette presse de votre atelier ?',
      error: 'Enregistrement impossible. Vérifiez les champs et réessayez.',
    },
    siteEditor: {
      titleNew: 'Ajouter un site',
      titleEdit: 'Modifier le site',
      name: 'Nom du site',
      namePh: 'ex. Usine de Lyon',
      city: 'Ville',
      postalCode: 'Code postal',
      address: 'Adresse',
      country: 'Pays',
      countryNone: 'Choisir un pays',
      save: 'Enregistrer',
      remove: 'Supprimer ce site',
      confirmRemove: 'Supprimer ce site ? Ses presses restent dans votre atelier, non affectées.',
    },
  },
  de: {
    title: 'Meine Druckerei',
    sub: 'Alle Druckmaschinen Ihrer Werke, ausgestattet oder nicht. Darauf stützt sich unser Team für Validierungen, Angebote und Support.',
    statPresses: (n) => plural(n, 'Druckmaschine', 'Druckmaschinen'),
    statSites: (n) => plural(n, 'Werk', 'Werke'),
    statUnits: (n) => plural(n, 'Druckwerk', 'Druckwerke'),
    addPress: 'Druckmaschine hinzufügen',
    addSite: 'Werk hinzufügen',
    editSite: 'Werk bearbeiten',
    allSites: 'Alle Werke',
    unplaced: 'Nicht zugeordnet',
    emptyTitle: 'Beschreiben Sie Ihre Druckerei',
    emptySub: 'Erfassen Sie Ihre Druckmaschinen einzeln — Hersteller, Format, Farbenzahl — und ordnen Sie sie Ihren Werken zu. Zwei Minuten pro Maschine.',
    siteEmpty: 'Noch keine Druckmaschine in diesem Werk.',
    membersNote: 'Werke werden von den Administratoren des Kontos verwaltet.',
    card: { edit: 'Bearbeiten', remove: 'Löschen', check: 'Konsolenkompatibilität prüfen', coater: 'Lackwerk', perfecting: 'Wendung', units: (n) => plural(n, 'Farbe', 'Farben') },
    editor: {
      titleNew: 'Druckmaschine hinzufügen',
      titleEdit: 'Druckmaschine bearbeiten',
      stepMachine: 'Maschine',
      stepConfig: 'Konfiguration',
      stepPlace: 'Standort und Details',
      manufacturer: 'Hersteller',
      other: 'Andere',
      otherPh: 'Name des Herstellers',
      model: 'Modell',
      modelPh: (h) => `z. B. ${h}`,
      format: 'Bogenformat',
      colors: 'Farben',
      coater: 'Lackwerk',
      perfecting: 'Wendung',
      profile: 'Produktionsprofil',
      profileNone: 'Keine Angabe',
      site: 'Werk',
      siteNone: 'Nicht zugeordnet',
      name: 'Interne Bezeichnung',
      namePh: 'z. B. Maschine 3, Halle B',
      console: 'Konsole',
      consolePh: (h) => `z. B. ${h}`,
      year: 'Baujahr',
      notes: 'Notizen',
      quantity: 'Identische Maschinen',
      quantityHint: 'Gleiche Konfiguration, automatisch nummeriert.',
      save: 'Speichern',
      saving: 'Wird gespeichert…',
      cancel: 'Abbrechen',
      remove: 'Diese Druckmaschine löschen',
      confirmRemove: 'Diese Druckmaschine aus Ihrer Druckerei löschen?',
      error: 'Speichern nicht möglich. Bitte prüfen Sie die Felder und versuchen Sie es erneut.',
    },
    siteEditor: {
      titleNew: 'Werk hinzufügen',
      titleEdit: 'Werk bearbeiten',
      name: 'Name des Werks',
      namePh: 'z. B. Werk Lyon',
      city: 'Ort',
      postalCode: 'Postleitzahl',
      address: 'Adresse',
      country: 'Land',
      countryNone: 'Land wählen',
      save: 'Speichern',
      remove: 'Dieses Werk löschen',
      confirmRemove: 'Dieses Werk löschen? Seine Druckmaschinen bleiben in Ihrer Druckerei, ohne Zuordnung.',
    },
  },
  it: {
    title: 'La mia sala stampa',
    sub: 'Tutte le macchine da stampa dei Suoi stabilimenti, equipaggiate o no. È la base che il nostro team usa per validazioni, preventivi e supporto.',
    statPresses: (n) => plural(n, 'macchina', 'macchine'),
    statSites: (n) => plural(n, 'stabilimento', 'stabilimenti'),
    statUnits: (n) => plural(n, 'gruppo stampa', 'gruppi stampa'),
    addPress: 'Aggiungi una macchina',
    addSite: 'Aggiungi uno stabilimento',
    editSite: 'Modifica lo stabilimento',
    allSites: 'Tutti gli stabilimenti',
    unplaced: 'Non assegnato',
    emptyTitle: 'Descriva la Sua sala stampa',
    emptySub: 'Aggiunga le macchine una per una — costruttore, formato, numero di colori — e le assegni ai Suoi stabilimenti. Due minuti per macchina.',
    siteEmpty: 'Ancora nessuna macchina in questo stabilimento.',
    membersNote: 'Gli stabilimenti sono gestiti dagli amministratori dell’account.',
    card: { edit: 'Modifica', remove: 'Elimina', check: 'Verifica compatibilità console', coater: 'Gruppo vernice', perfecting: 'Bianca-volta', units: (n) => plural(n, 'colore', 'colori') },
    editor: {
      titleNew: 'Aggiungi una macchina',
      titleEdit: 'Modifica la macchina',
      stepMachine: 'Macchina',
      stepConfig: 'Configurazione',
      stepPlace: 'Posizione e dettagli',
      manufacturer: 'Costruttore',
      other: 'Altro',
      otherPh: 'Nome del costruttore',
      model: 'Modello',
      modelPh: (h) => `es. ${h}`,
      format: 'Formato foglio',
      colors: 'Colori',
      coater: 'Gruppo vernice',
      perfecting: 'Bianca-volta',
      profile: 'Profilo di produzione',
      profileNone: 'Non specificato',
      site: 'Stabilimento',
      siteNone: 'Non assegnato',
      name: 'Nome interno',
      namePh: 'es. Macchina 3, Capannone B',
      console: 'Console',
      consolePh: (h) => `es. ${h}`,
      year: 'Anno',
      notes: 'Note',
      quantity: 'Macchine identiche',
      quantityHint: 'Stessa configurazione, numerate automaticamente.',
      save: 'Salva',
      saving: 'Salvataggio…',
      cancel: 'Annulla',
      remove: 'Elimina questa macchina',
      confirmRemove: 'Eliminare questa macchina dalla Sua sala stampa?',
      error: 'Impossibile salvare. Verifichi i campi e riprovi.',
    },
    siteEditor: {
      titleNew: 'Aggiungi uno stabilimento',
      titleEdit: 'Modifica lo stabilimento',
      name: 'Nome dello stabilimento',
      namePh: 'es. Stabilimento di Lione',
      city: 'Città',
      postalCode: 'CAP',
      address: 'Indirizzo',
      country: 'Paese',
      countryNone: 'Scelga un paese',
      save: 'Salva',
      remove: 'Elimina questo stabilimento',
      confirmRemove: 'Eliminare questo stabilimento? Le sue macchine restano nella sala stampa, non assegnate.',
    },
  },
  es: {
    title: 'Mi sala de prensa',
    sub: 'Todas las prensas de sus plantas, equipadas o no. Es la base que usa nuestro equipo para preparar validaciones, presupuestos y soporte.',
    statPresses: (n) => plural(n, 'prensa', 'prensas'),
    statSites: (n) => plural(n, 'planta', 'plantas'),
    statUnits: (n) => plural(n, 'cuerpo impresor', 'cuerpos impresores'),
    addPress: 'Añadir una prensa',
    addSite: 'Añadir una planta',
    editSite: 'Editar la planta',
    allSites: 'Todas las plantas',
    unplaced: 'Sin asignar',
    emptyTitle: 'Describa su sala de prensa',
    emptySub: 'Añada sus prensas una a una — fabricante, formato, número de colores — y asígnelas a sus plantas. Dos minutos por máquina.',
    siteEmpty: 'Todavía no hay prensas en esta planta.',
    membersNote: 'Las plantas las gestionan los administradores de la cuenta.',
    card: { edit: 'Editar', remove: 'Eliminar', check: 'Verificar compatibilidad de consola', coater: 'Barniz', perfecting: 'Retiración', units: (n) => plural(n, 'color', 'colores') },
    editor: {
      titleNew: 'Añadir una prensa',
      titleEdit: 'Editar la prensa',
      stepMachine: 'Máquina',
      stepConfig: 'Configuración',
      stepPlace: 'Ubicación y detalles',
      manufacturer: 'Fabricante',
      other: 'Otro',
      otherPh: 'Nombre del fabricante',
      model: 'Modelo',
      modelPh: (h) => `p. ej. ${h}`,
      format: 'Formato de pliego',
      colors: 'Colores',
      coater: 'Torre de barniz',
      perfecting: 'Retiración',
      profile: 'Perfil de producción',
      profileNone: 'Sin especificar',
      site: 'Planta',
      siteNone: 'Sin asignar',
      name: 'Nombre interno',
      namePh: 'p. ej. Prensa 3, Nave B',
      console: 'Consola',
      consolePh: (h) => `p. ej. ${h}`,
      year: 'Año',
      notes: 'Notas',
      quantity: 'Prensas idénticas',
      quantityHint: 'Misma configuración, numeradas automáticamente.',
      save: 'Guardar',
      saving: 'Guardando…',
      cancel: 'Cancelar',
      remove: 'Eliminar esta prensa',
      confirmRemove: '¿Eliminar esta prensa de su sala de prensa?',
      error: 'No se pudo guardar. Revise los campos e inténtelo de nuevo.',
    },
    siteEditor: {
      titleNew: 'Añadir una planta',
      titleEdit: 'Editar la planta',
      name: 'Nombre de la planta',
      namePh: 'p. ej. Planta de Lyon',
      city: 'Ciudad',
      postalCode: 'Código postal',
      address: 'Dirección',
      country: 'País',
      countryNone: 'Elija un país',
      save: 'Guardar',
      remove: 'Eliminar esta planta',
      confirmRemove: '¿Eliminar esta planta? Sus prensas siguen en su sala de prensa, sin asignar.',
    },
  },
  pt: {
    title: 'A minha sala de impressão',
    sub: 'Todas as máquinas das suas fábricas, equipadas ou não. É a base que a nossa equipa usa para validações, orçamentos e suporte.',
    statPresses: (n) => plural(n, 'máquina', 'máquinas'),
    statSites: (n) => plural(n, 'fábrica', 'fábricas'),
    statUnits: (n) => plural(n, 'corpo de impressão', 'corpos de impressão'),
    addPress: 'Adicionar uma máquina',
    addSite: 'Adicionar uma fábrica',
    editSite: 'Editar a fábrica',
    allSites: 'Todas as fábricas',
    unplaced: 'Não atribuído',
    emptyTitle: 'Descreva a sua sala de impressão',
    emptySub: 'Adicione as suas máquinas uma a uma — fabricante, formato, número de cores — e atribua-as às suas fábricas. Dois minutos por máquina.',
    siteEmpty: 'Ainda não há máquinas nesta fábrica.',
    membersNote: 'As fábricas são geridas pelos administradores da conta.',
    card: { edit: 'Editar', remove: 'Eliminar', check: 'Verificar compatibilidade da consola', coater: 'Verniz', perfecting: 'Retiração', units: (n) => plural(n, 'cor', 'cores') },
    editor: {
      titleNew: 'Adicionar uma máquina',
      titleEdit: 'Editar a máquina',
      stepMachine: 'Máquina',
      stepConfig: 'Configuração',
      stepPlace: 'Localização e detalhes',
      manufacturer: 'Fabricante',
      other: 'Outro',
      otherPh: 'Nome do fabricante',
      model: 'Modelo',
      modelPh: (h) => `p. ex. ${h}`,
      format: 'Formato de folha',
      colors: 'Cores',
      coater: 'Torre de verniz',
      perfecting: 'Retiração',
      profile: 'Perfil de produção',
      profileNone: 'Não especificado',
      site: 'Fábrica',
      siteNone: 'Não atribuído',
      name: 'Nome interno',
      namePh: 'p. ex. Máquina 3, Pavilhão B',
      console: 'Consola',
      consolePh: (h) => `p. ex. ${h}`,
      year: 'Ano',
      notes: 'Notas',
      quantity: 'Máquinas idênticas',
      quantityHint: 'Mesma configuração, numeradas automaticamente.',
      save: 'Guardar',
      saving: 'A guardar…',
      cancel: 'Cancelar',
      remove: 'Eliminar esta máquina',
      confirmRemove: 'Eliminar esta máquina da sua sala de impressão?',
      error: 'Não foi possível guardar. Verifique os campos e tente novamente.',
    },
    siteEditor: {
      titleNew: 'Adicionar uma fábrica',
      titleEdit: 'Editar a fábrica',
      name: 'Nome da fábrica',
      namePh: 'p. ex. Fábrica de Lyon',
      city: 'Cidade',
      postalCode: 'Código postal',
      address: 'Morada',
      country: 'País',
      countryNone: 'Escolha um país',
      save: 'Guardar',
      remove: 'Eliminar esta fábrica',
      confirmRemove: 'Eliminar esta fábrica? As suas máquinas continuam na sala de impressão, sem atribuição.',
    },
  },
};

export function workshopCopy(locale: Locale): Copy {
  return COPY[locale] ?? COPY.en;
}

/** The schematic knows three widths; B3 draws as the compact B2 line. */
export function schematicFormat(f: SheetFormat): PressFormat {
  return f === 'b3' ? 'b2' : f;
}

// Card framing: the press line without the ROI overlay's empty margins.
const CARD_VIEWBOX = '220 70 860 450';

const brandSlug = (manufacturer: string) => PRESS_BRANDS_PAGES.find((b) => b.name === manufacturer)?.slug ?? null;

/** Console Validation deep link for one press (brand page + prefilled model). */
export function compatibilityHref(p: Pick<WorkshopPress, 'manufacturer' | 'model'>): string {
  const slug = brandSlug(p.manufacturer);
  const q = p.model ? `?model=${encodeURIComponent(p.model)}` : '';
  return `${slug ? `/console-validation/${slug}` : '/console-validation'}${q}#submit`;
}

type Filter = 'all' | 'none' | string;

export function AccountWorkshop({
  presses: initialPresses,
  sites,
  canManageSites,
  preview = false,
}: {
  presses: WorkshopPress[];
  sites: WorkshopSite[];
  canManageSites: boolean;
  preview?: boolean;
}) {
  const { locale } = useLanguage();
  const t = workshopCopy(locale);
  const router = useRouter();
  const [presses, setPresses] = useState<WorkshopPress[]>(initialPresses);
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<WorkshopPress | 'new' | null>(null);
  const [siteEditing, setSiteEditing] = useState<WorkshopSite | 'new' | null>(null);

  const siteById = useMemo(() => new Map(sites.map((s) => [s.id, s])), [sites]);
  const unplacedCount = presses.filter((p) => !p.siteId || !siteById.has(p.siteId)).length;
  const visible = presses.filter((p) =>
    filter === 'all' ? true : filter === 'none' ? !p.siteId || !siteById.has(p.siteId) : p.siteId === filter
  );
  const units = presses.reduce((sum, p) => sum + p.colors + (p.coater ? 1 : 0), 0);
  const currentSite = filter !== 'all' && filter !== 'none' ? siteById.get(filter) ?? null : null;
  const canEdit = !preview;

  return (
    <main className="page-shell" id="top">
      <SiteNav current="account" />
      {preview ? null : <AccountSubnav current="atelier" />}
      <section className="ws-section">
        <div className="container ws-wrap">
          <header className="ws-head">
            <div>
              <h1 className="ws-title">{t.title}</h1>
              <p className="ws-sub">{t.sub}</p>
              <div className="ws-stats">
                <span className="ws-stat">{t.statPresses(presses.length)}</span>
                <span className="ws-stat">{t.statSites(sites.length)}</span>
                {presses.length ? <span className="ws-stat">{t.statUnits(units)}</span> : null}
              </div>
            </div>
            {canEdit ? (
              <div className="ws-head-actions">
                {canManageSites ? (
                  <button type="button" className="button button-light" onClick={() => setSiteEditing('new')}>
                    {t.addSite}
                  </button>
                ) : null}
                <button type="button" className="button button-accent" onClick={() => setEditing('new')}>
                  + {t.addPress}
                </button>
              </div>
            ) : null}
          </header>

          {sites.length || unplacedCount !== presses.length ? (
            <div className="ws-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={filter === 'all'} className={`ws-tab${filter === 'all' ? ' is-active' : ''}`} onClick={() => setFilter('all')}>
                {t.allSites} <span className="ws-tab-n">{presses.length}</span>
              </button>
              {sites.map((s) => (
                <button
                  type="button"
                  role="tab"
                  key={s.id}
                  aria-selected={filter === s.id}
                  className={`ws-tab${filter === s.id ? ' is-active' : ''}`}
                  onClick={() => setFilter(s.id)}
                >
                  {s.name} <span className="ws-tab-n">{presses.filter((p) => p.siteId === s.id).length}</span>
                </button>
              ))}
              {unplacedCount && sites.length ? (
                <button type="button" role="tab" aria-selected={filter === 'none'} className={`ws-tab${filter === 'none' ? ' is-active' : ''}`} onClick={() => setFilter('none')}>
                  {t.unplaced} <span className="ws-tab-n">{unplacedCount}</span>
                </button>
              ) : null}
            </div>
          ) : null}

          {currentSite ? (
            <div className="ws-site-bar">
              <span className="ws-site-loc">
                {[currentSite.address, currentSite.postalCode, currentSite.city, currentSite.country ? localizedCountryName(currentSite.country, locale) : null]
                  .filter(Boolean)
                  .join(', ')}
              </span>
              {canEdit && canManageSites ? (
                <button type="button" className="ws-link" onClick={() => setSiteEditing(currentSite)}>
                  {t.editSite}
                </button>
              ) : null}
            </div>
          ) : null}

          {!presses.length ? (
            <div className="ws-empty">
              <div className="ws-empty-art" aria-hidden="true">
                <PressSchematic format="b1" colors={6} />
              </div>
              <div className="ws-empty-body">
                <h2>{t.emptyTitle}</h2>
                <p>{t.emptySub}</p>
                {canEdit ? (
                  <button type="button" className="button button-accent" onClick={() => setEditing('new')}>
                    + {t.addPress}
                  </button>
                ) : null}
                {canEdit && !canManageSites ? <p className="ws-note">{t.membersNote}</p> : null}
              </div>
            </div>
          ) : visible.length ? (
            <div className="ws-grid">
              {visible.map((p) => (
                <PressCard
                  key={p.id}
                  press={p}
                  site={p.siteId ? siteById.get(p.siteId) ?? null : null}
                  t={t}
                  locale={locale}
                  onEdit={canEdit ? () => setEditing(p) : undefined}
                />
              ))}
            </div>
          ) : (
            <p className="ws-site-empty">{t.siteEmpty}</p>
          )}
        </div>
      </section>

      {editing ? (
        <PressEditor
          t={t}
          locale={locale}
          sites={sites}
          initial={editing === 'new' ? null : editing}
          defaultSiteId={currentSite?.id ?? null}
          canDelete={canManageSites}
          onClose={() => setEditing(null)}
          onSaved={(saved, removedId) => {
            setPresses((list) => {
              let next = removedId ? list.filter((x) => x.id !== removedId) : list;
              for (const s of saved) {
                const i = next.findIndex((x) => x.id === s.id);
                next = i >= 0 ? next.map((x) => (x.id === s.id ? s : x)) : [...next, s];
              }
              return next;
            });
            setEditing(null);
            router.refresh();
          }}
        />
      ) : null}

      {siteEditing ? (
        <SiteEditor
          t={t}
          locale={locale}
          initial={siteEditing === 'new' ? null : siteEditing}
          onClose={() => setSiteEditing(null)}
          onSaved={(removed) => {
            setSiteEditing(null);
            if (removed) setFilter('all');
            router.refresh();
          }}
        />
      ) : null}

      <SiteFooter />
    </main>
  );
}

// ── Press card ──

export function PressCard({
  press: p,
  site,
  t,
  locale,
  onEdit,
  compact = false,
}: {
  press: WorkshopPress;
  site: WorkshopSite | null;
  t: Copy;
  locale: Locale;
  onEdit?: () => void;
  compact?: boolean;
}) {
  const fmt = formatCopy(locale)[p.sheetFormat];
  const machine = [p.manufacturer, p.model].filter(Boolean).join(' ');
  const title = pressTitle(p);
  return (
    <article className={`ws-card${compact ? ' is-compact' : ''}`}>
      <div className="ws-card-art" aria-hidden="true">
        <PressSchematic format={schematicFormat(p.sheetFormat)} colors={p.colors} viewBox={CARD_VIEWBOX} />
      </div>
      <div className="ws-card-body">
        <div className="ws-card-top">
          <div>
            <h3 className="ws-card-t">{title}</h3>
            {title !== machine ? <p className="ws-card-m">{machine}</p> : null}
          </div>
          {onEdit ? (
            <button type="button" className="ws-link" onClick={onEdit}>
              {t.card.edit}
            </button>
          ) : null}
        </div>
        <div className="ws-chips">
          <span className="ws-chip">
            {fmt.label} · {fmt.dims}
          </span>
          <span className="ws-chip">{t.card.units(p.colors)}</span>
          {p.coater ? <span className="ws-chip">{t.card.coater}</span> : null}
          {p.perfecting ? <span className="ws-chip">{t.card.perfecting}</span> : null}
          {p.productionProfile ? <span className="ws-chip is-soft">{PROFILE_LABELS[locale][p.productionProfile]}</span> : null}
        </div>
        {!compact ? (
          <dl className="ws-meta">
            {site ? (
              <div>
                <dt>{t.editor.site}</dt>
                <dd>{site.name}</dd>
              </div>
            ) : null}
            {p.console ? (
              <div>
                <dt>{t.editor.console}</dt>
                <dd>{p.console}</dd>
              </div>
            ) : null}
            {p.year ? (
              <div>
                <dt>{t.editor.year}</dt>
                <dd>{p.year}</dd>
              </div>
            ) : null}
          </dl>
        ) : site ? (
          <p className="ws-card-site">{site.name}</p>
        ) : null}
        {!compact ? (
          <a className="ws-card-cta" href={compatibilityHref(p)}>
            {t.card.check} <span aria-hidden="true">→</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}

// ── Press editor (the ROI configurator, plus identity and location) ──

type Draft = {
  manufacturer: string;
  otherManufacturer: string;
  model: string;
  sheetFormat: SheetFormat;
  colors: number;
  coater: boolean;
  perfecting: boolean;
  productionProfile: ProductionProfile | '';
  siteId: string;
  name: string;
  console: string;
  year: string;
  notes: string;
  quantity: number;
};

function toDraft(p: WorkshopPress | null, defaultSiteId: string | null): Draft {
  if (!p) {
    return {
      manufacturer: PRESS_MANUFACTURERS[0],
      otherManufacturer: '',
      model: '',
      sheetFormat: 'b1',
      colors: 4,
      coater: false,
      perfecting: false,
      productionProfile: '',
      siteId: defaultSiteId ?? '',
      name: '',
      console: '',
      year: '',
      notes: '',
      quantity: 1,
    };
  }
  const known = PRESS_MANUFACTURERS.includes(p.manufacturer);
  return {
    manufacturer: known ? p.manufacturer : 'other',
    otherManufacturer: known ? '' : p.manufacturer,
    model: p.model ?? '',
    sheetFormat: p.sheetFormat,
    colors: p.colors,
    coater: p.coater,
    perfecting: p.perfecting,
    productionProfile: p.productionProfile ?? '',
    siteId: p.siteId ?? '',
    name: p.name ?? '',
    console: p.console ?? '',
    year: p.year ? String(p.year) : '',
    notes: p.notes ?? '',
    quantity: 1,
  };
}

function PressEditor({
  t,
  locale,
  sites,
  initial,
  defaultSiteId,
  canDelete,
  onClose,
  onSaved,
}: {
  t: Copy;
  locale: Locale;
  sites: WorkshopSite[];
  initial: WorkshopPress | null;
  defaultSiteId: string | null;
  canDelete: boolean;
  onClose: () => void;
  onSaved: (saved: WorkshopPress[], removedId?: string) => void;
}) {
  const e = t.editor;
  const [d, setD] = useState<Draft>(() => toDraft(initial, defaultSiteId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const formats = formatCopy(locale);
  const manufacturer = d.manufacturer === 'other' ? d.otherManufacturer.trim() : d.manufacturer;
  const hintKey = d.manufacturer === 'other' ? '' : d.manufacturer;

  const save = async () => {
    if (!manufacturer) {
      setError(true);
      return;
    }
    setBusy(true);
    setError(false);
    const body = {
      manufacturer,
      model: d.model,
      sheetFormat: d.sheetFormat,
      colors: d.colors,
      coater: d.coater,
      perfecting: d.perfecting,
      productionProfile: d.productionProfile || null,
      siteId: d.siteId || null,
      name: d.name,
      console: d.console,
      year: d.year ? Number(d.year) : null,
      notes: d.notes,
      quantity: d.quantity,
    };
    try {
      const res = await fetch(initial ? `/api/account/presses?id=${encodeURIComponent(initial.id)}` : '/api/account/presses', {
        method: initial ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('save');
      const json = (await res.json()) as { press?: WorkshopPress; presses?: WorkshopPress[] };
      onSaved(json.presses ?? (json.press ? [json.press] : []));
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!initial || !window.confirm(e.confirmRemove)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/account/presses?id=${encodeURIComponent(initial.id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete');
      onSaved([], initial.id);
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  return (
    <div className="ws-modal" role="dialog" aria-modal="true" aria-labelledby="ws-editor-title">
      <button type="button" className="ws-modal-backdrop" aria-label={e.cancel} onClick={onClose} />
      <div className="ws-modal-panel ws-editor">
        <header className="ws-modal-head">
          <h2 id="ws-editor-title">{initial ? e.titleEdit : e.titleNew}</h2>
          <button type="button" className="ws-modal-x" aria-label={e.cancel} onClick={onClose}>
            ×
          </button>
        </header>

        <div className="ws-editor-preview" aria-hidden="true">
          <PressSchematic format={schematicFormat(d.sheetFormat)} colors={d.colors} />
          <div className="ws-editor-caption">
            <strong>{[manufacturer, d.model].filter(Boolean).join(' ') || e.titleNew}</strong>
            <span>
              {formats[d.sheetFormat].label} · {t.card.units(d.colors)}
              {d.coater ? ` · ${t.card.coater}` : ''}
              {d.perfecting ? ` · ${t.card.perfecting}` : ''}
            </span>
          </div>
        </div>

        <div className="ws-editor-body">
          <fieldset className="ws-step">
            <legend>1 · {e.stepMachine}</legend>
            <div className="ws-field">
              <span className="ws-label">{e.manufacturer}</span>
              <div className="ws-seg ws-seg-wrap" role="group" aria-label={e.manufacturer}>
                {[...PRESS_MANUFACTURERS, 'other'].map((m) => (
                  <button key={m} type="button" className={d.manufacturer === m ? 'is-active' : ''} onClick={() => set('manufacturer', m)}>
                    {m === 'other' ? e.other : m}
                  </button>
                ))}
              </div>
              {d.manufacturer === 'other' ? (
                <input className="ws-input" value={d.otherManufacturer} placeholder={e.otherPh} maxLength={80} onChange={(ev) => set('otherManufacturer', ev.target.value)} />
              ) : null}
            </div>
            <label className="ws-field">
              <span className="ws-label">{e.model}</span>
              <input
                className="ws-input"
                value={d.model}
                maxLength={120}
                placeholder={MODEL_HINTS[hintKey] ? e.modelPh(MODEL_HINTS[hintKey]) : ''}
                onChange={(ev) => set('model', ev.target.value)}
              />
            </label>
          </fieldset>

          <fieldset className="ws-step">
            <legend>2 · {e.stepConfig}</legend>
            <div className="ws-field">
              <span className="ws-label">{e.format}</span>
              <div className="ws-seg" role="group" aria-label={e.format}>
                {SHEET_FORMATS.map((f) => (
                  <button key={f} type="button" className={d.sheetFormat === f ? 'is-active' : ''} onClick={() => set('sheetFormat', f)}>
                    <strong>{formats[f].label}</strong>
                    <small>{formats[f].dims}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="ws-field">
              <span className="ws-label">{e.colors}</span>
              <div className="ws-colors">
                <div className="ws-seg" role="group" aria-label={e.colors}>
                  {COLOR_PRESETS.map((n) => (
                    <button key={n} type="button" className={d.colors === n ? 'is-active' : ''} onClick={() => set('colors', n)}>
                      {n}
                    </button>
                  ))}
                </div>
                <div className="ws-stepper">
                  <button type="button" aria-label="−" disabled={d.colors <= MIN_COLORS} onClick={() => set('colors', Math.max(MIN_COLORS, d.colors - 1))}>
                    −
                  </button>
                  <span aria-live="polite">{d.colors}</span>
                  <button type="button" aria-label="+" disabled={d.colors >= MAX_COLORS} onClick={() => set('colors', Math.min(MAX_COLORS, d.colors + 1))}>
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="ws-toggles">
              <label className="ws-toggle">
                <input type="checkbox" checked={d.coater} onChange={(ev) => set('coater', ev.target.checked)} />
                <span>{e.coater}</span>
              </label>
              <label className="ws-toggle">
                <input type="checkbox" checked={d.perfecting} onChange={(ev) => set('perfecting', ev.target.checked)} />
                <span>{e.perfecting}</span>
              </label>
            </div>
            <div className="ws-field">
              <span className="ws-label">{e.profile}</span>
              <div className="ws-seg ws-seg-wrap" role="group" aria-label={e.profile}>
                {PRODUCTION_PROFILES.map((pr) => (
                  <button key={pr} type="button" className={d.productionProfile === pr ? 'is-active' : ''} onClick={() => set('productionProfile', d.productionProfile === pr ? '' : pr)}>
                    {PROFILE_LABELS[locale][pr]}
                  </button>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset className="ws-step">
            <legend>3 · {e.stepPlace}</legend>
            <div className="ws-row">
              <label className="ws-field">
                <span className="ws-label">{e.site}</span>
                <select className="ws-input" value={d.siteId} onChange={(ev) => set('siteId', ev.target.value)}>
                  <option value="">{e.siteNone}</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ws-field">
                <span className="ws-label">{e.name}</span>
                <input className="ws-input" value={d.name} maxLength={80} placeholder={e.namePh} onChange={(ev) => set('name', ev.target.value)} />
              </label>
            </div>
            <div className="ws-row">
              <label className="ws-field">
                <span className="ws-label">{e.console}</span>
                <input
                  className="ws-input"
                  value={d.console}
                  maxLength={120}
                  placeholder={CONSOLE_HINTS[hintKey] ? e.consolePh(CONSOLE_HINTS[hintKey]) : ''}
                  onChange={(ev) => set('console', ev.target.value)}
                />
              </label>
              <label className="ws-field ws-field-narrow">
                <span className="ws-label">{e.year}</span>
                <input className="ws-input" inputMode="numeric" value={d.year} maxLength={4} onChange={(ev) => set('year', ev.target.value.replace(/\D/g, ''))} />
              </label>
            </div>
            <label className="ws-field">
              <span className="ws-label">{e.notes}</span>
              <textarea className="ws-input" rows={2} value={d.notes} maxLength={1000} onChange={(ev) => set('notes', ev.target.value)} />
            </label>
            {!initial ? (
              <div className="ws-field">
                <span className="ws-label">{e.quantity}</span>
                <div className="ws-colors">
                  <div className="ws-stepper">
                    <button type="button" aria-label="−" disabled={d.quantity <= 1} onClick={() => set('quantity', Math.max(1, d.quantity - 1))}>
                      −
                    </button>
                    <span aria-live="polite">{d.quantity}</span>
                    <button type="button" aria-label="+" disabled={d.quantity >= 20} onClick={() => set('quantity', Math.min(20, d.quantity + 1))}>
                      +
                    </button>
                  </div>
                  <small className="ws-hint">{e.quantityHint}</small>
                </div>
              </div>
            ) : null}
          </fieldset>
        </div>

        <footer className="ws-modal-foot">
          {initial && canDelete ? (
            <button type="button" className="ws-danger" disabled={busy} onClick={remove}>
              {e.remove}
            </button>
          ) : (
            <span />
          )}
          <div className="ws-foot-actions">
            {error ? <span className="ws-error">{e.error}</span> : null}
            <button type="button" className="button button-light" onClick={onClose}>
              {e.cancel}
            </button>
            <button type="button" className="button button-accent" disabled={busy} onClick={save}>
              {busy ? e.saving : e.save}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ── Site editor (owners/admins) ──

function SiteEditor({
  t,
  locale,
  initial,
  onClose,
  onSaved,
}: {
  t: Copy;
  locale: Locale;
  initial: WorkshopSite | null;
  onClose: () => void;
  onSaved: (removed: boolean) => void;
}) {
  const s = t.siteEditor;
  const [f, setF] = useState({
    name: initial?.name ?? '',
    city: initial?.city ?? '',
    postalCode: initial?.postalCode ?? '',
    address: initial?.address ?? '',
    country: initial?.country ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const countries = useMemo(
    () => [...COUNTRIES].sort((a, b) => localizedCountryName(a, locale).localeCompare(localizedCountryName(b, locale), locale)),
    [locale]
  );

  const send = async (method: 'POST' | 'PATCH' | 'DELETE') => {
    setBusy(true);
    setError(false);
    try {
      const url = initial ? `/api/account/sites?id=${encodeURIComponent(initial.id)}` : '/api/account/sites';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method === 'DELETE' ? undefined : JSON.stringify(f),
      });
      if (!res.ok) throw new Error('site');
      onSaved(method === 'DELETE');
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  return (
    <div className="ws-modal" role="dialog" aria-modal="true" aria-labelledby="ws-site-title">
      <button type="button" className="ws-modal-backdrop" aria-label={t.editor.cancel} onClick={onClose} />
      <div className="ws-modal-panel ws-site-editor">
        <header className="ws-modal-head">
          <h2 id="ws-site-title">{initial ? s.titleEdit : s.titleNew}</h2>
          <button type="button" className="ws-modal-x" aria-label={t.editor.cancel} onClick={onClose}>
            ×
          </button>
        </header>
        <div className="ws-editor-body">
          <label className="ws-field">
            <span className="ws-label">{s.name}</span>
            <input className="ws-input" value={f.name} maxLength={160} placeholder={s.namePh} onChange={(ev) => setF({ ...f, name: ev.target.value })} />
          </label>
          <label className="ws-field">
            <span className="ws-label">{s.address}</span>
            <input className="ws-input" value={f.address} maxLength={300} onChange={(ev) => setF({ ...f, address: ev.target.value })} />
          </label>
          <div className="ws-row">
            <label className="ws-field ws-field-narrow">
              <span className="ws-label">{s.postalCode}</span>
              <input className="ws-input" value={f.postalCode} maxLength={40} onChange={(ev) => setF({ ...f, postalCode: ev.target.value })} />
            </label>
            <label className="ws-field">
              <span className="ws-label">{s.city}</span>
              <input className="ws-input" value={f.city} maxLength={120} onChange={(ev) => setF({ ...f, city: ev.target.value })} />
            </label>
          </div>
          <label className="ws-field">
            <span className="ws-label">{s.country}</span>
            <select className="ws-input" value={f.country} onChange={(ev) => setF({ ...f, country: ev.target.value })}>
              <option value="">{s.countryNone}</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {localizedCountryName(c, locale)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <footer className="ws-modal-foot">
          {initial ? (
            <button type="button" className="ws-danger" disabled={busy} onClick={() => window.confirm(s.confirmRemove) && send('DELETE')}>
              {s.remove}
            </button>
          ) : (
            <span />
          )}
          <div className="ws-foot-actions">
            {error ? <span className="ws-error">{t.editor.error}</span> : null}
            <button type="button" className="button button-light" onClick={onClose}>
              {t.editor.cancel}
            </button>
            <button type="button" className="button button-accent" disabled={busy || !f.name.trim()} onClick={() => send(initial ? 'PATCH' : 'POST')}>
              {busy ? t.editor.saving : s.save}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
