// Plain data module (no 'use client') so it can be used by BOTH the client
// Offset360Page component and the server route (localized metadata / JSON-LD).
import type { Locale } from '@/components/language-provider';

export type Offset360Copy = {
  metaTitle: string;
  metaDescription: string;
  heroLede: string;
  watchFilm: string;
  talkToExpert: string;
  videoTitle: string;
  problemEyebrow: string;
  problemTitleMain: string;
  problemTitleEm: string;
  problemBody: string;
  ideaEyebrow: string;
  ideaTitle: string;
  ideaLede: string;
  learnMore: string;
  bundle: { role: string; description: string; imageAlt: string }[];
  features: { eyebrow: string; title: string; body: string; chips: string[]; imageAlt: string }[];
  stepsEyebrow: string;
  stepsTitle: string;
  steps: { title: string; body: string }[];
  roiEyebrow: string;
  roiPrefix: string;
  roiSub: string;
  numberLabels: string[];
  deployEyebrow: string;
  deployTitle: string;
  process: { title: string; body: string }[];
  includedEyebrow: string;
  includedTitle: string;
  included: string[];
  reassurePre: string;
  reassureStrong: string;
  reassurePost: string;
  faqEyebrow: string;
  faqTitle: string;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaBody: string;
  ctaPrimary: string;
  ctaSecondary: string;
  quoteCta: string;
  breadcrumbHome: string;
};

export const OFFSET360_COPY: Record<Locale, Offset360Copy> = {
  en: {
    metaTitle: 'Offset360 | Closed-loop color for sheetfed offset',
    metaDescription:
      'Offset360 is the X-Rite + Rutherford closed-loop bundle for sheetfed offset: IntelliTrax2 scanning, MeasureColor reporting, and Rutherford ColorLoop closed-loop control on the press.',
    heroLede: 'The closed-loop bundle for sheetfed offset. Scan, compare, correct, without leaving the console.',
    watchFilm: 'Watch the film',
    talkToExpert: 'Talk to an expert',
    videoTitle: 'Offset360, closed-loop color for sheetfed offset',
    problemEyebrow: 'The real bottleneck',
    problemTitleMain: 'Often the problem isn’t the press.',
    problemTitleEm: 'It’s the reading system in front of it.',
    problemBody:
      'Obsolete or closed OEM measurement tools leave color inconsistent, waste material and stretch every makeready. Offset360 replaces guesswork with a connected, press-side reading system, without buying a new press.',
    ideaEyebrow: 'The idea',
    ideaTitle: 'Three pieces. One loop.',
    ideaLede:
      'Two best-in-class X-Rite products and one Rutherford software, combined into a single workflow, plus the expert support to keep it performing.',
    learnMore: 'Learn more',
    bundle: [
      {
        role: 'Press-side scanning',
        description:
          'The first desktop automated scanning system. Reads a full color bar in under ten seconds, bars down to 2 mm, contactless.',
        imageAlt: 'IntelliTrax2 scanner',
      },
      {
        role: 'Process control & reporting',
        description:
          'One platform for offset, flexo and digital. Real-time ΔE, ChromaTrack ink-density guidance, audit-ready reports.',
        imageAlt: 'Operator running MeasureColor at the press console',
      },
      {
        role: 'Closed-loop presetting',
        description:
          'Turns measurement data into ink-key corrections and pushes them to the console. The loop closes, automatically.',
        imageAlt: 'Rutherford ColorLoop on an iMac',
      },
    ],
    features: [
      {
        eyebrow: 'Reading',
        title: 'IntelliTrax2 reads the sheet, not the operator’s eye.',
        body:
          'A desktop automated spectrophotometer that scans the full control strip across the sheet in seconds. Contactless optics prevent smudges and scratches, a look-ahead sensor aligns the bar automatically, and every zone is captured under M0, M1 or M3 in a single pass.',
        chips: ['Scan < 10 s', 'Bars from 2 mm', '45°/0° geometry', 'M0 / M1 / M3', 'Inter-instrument 0.3 ΔE avg', 'Non-contact'],
        imageAlt: 'IntelliTrax2 scanning a printed sheet',
      },
      {
        eyebrow: 'Process control',
        title: 'MeasureColor turns measurements into decisions.',
        body:
          'A client-server platform unifying offset, flexo and digital. ChromaTrack calculates the optimal ink-density correction and the expected ΔE before the operator touches a key. Jobs set up in under 30 seconds, and quality data flows into customizable, audit-ready reports, your data, on your server.',
        chips: ['Job setup < 30 s', 'Real-time ΔE / density', 'ChromaTrack guidance', 'PQX · CXF · CGATS export', 'Offset · flexo · digital'],
        imageAlt: 'Offset360 bundle in a Rutherford pressroom',
      },
      {
        eyebrow: 'Closed-loop',
        title: 'Rutherford ColorLoop closes the loop on the console.',
        body:
          'CIP3 / CIP4 presets load before the press starts. As IntelliTrax2 and MeasureColor read and compare, ColorLoop converts the deltas into ink-key corrections and pushes them straight to the console. The operator validates, and the press holds color through the run, on any major press brand.',
        chips: ['CIP3 / CIP4 presetting', 'Automatic ink-key correction', 'Heidelberg · Komori · KBA · Manroland', 'Press-agnostic'],
        imageAlt: 'Rutherford ColorLoop interface in action',
      },
    ],
    stepsEyebrow: 'How it runs',
    stepsTitle: 'The Offset360 loop.',
    steps: [
      { title: 'Preset', body: 'CIP3 / CIP4 ink-key presets load automatically. No manual punch-in.' },
      { title: 'Scan', body: 'IntelliTrax2 reads the color bar across the sheet in seconds.' },
      { title: 'Compare', body: 'MeasureColor computes ΔE against the brand reference and flags out-of-tolerance zones.' },
      { title: 'Correct', body: 'ColorLoop pushes the corrections to the console. The operator validates. The loop closes.' },
    ],
    roiEyebrow: 'Return on investment',
    roiPrefix: 'up to ',
    roiSub:
      'lower initial cost than a new measurement setup, Offset360 modernizes color control through flexible financing, with no new-press investment.',
    numberLabels: ['Makeready waste', 'Setup time', 'In-run color stability', 'Traceable sheets'],
    deployEyebrow: 'How we deploy it',
    deployTitle: 'A guided rollout, not a drop-shipment.',
    process: [
      {
        title: 'Connect & collaborate',
        body: 'X-Rite color experts and Rutherford map your production objectives and your real color challenges, together.',
      },
      {
        title: 'Assess & configure',
        body: 'Your current setup is evaluated for compatibility, the ideal configuration is designed, and measurable performance targets are set.',
      },
      {
        title: 'Proof of concept & support',
        body: 'Installation, team training and results validation. Targets not met? You can stop. Annual audits keep performance on track.',
      },
    ],
    includedEyebrow: 'What’s included',
    includedTitle: 'Everything to run a closed loop.',
    included: [
      'IntelliTrax2 scanning system',
      'MeasureColor process-control software',
      'Rutherford ColorLoop closed-loop technology',
      'Expert color-consultant support',
      'Annual performance audit, included',
      'Professional installation & training',
    ],
    reassurePre: 'Open and flexible by design. Offset360 works with ',
    reassureStrong: 'any press brand and any workflow',
    reassurePost: ', no vendor lock-in, no rip-and-replace.',
    faqEyebrow: 'Offset360 FAQ',
    faqTitle: 'Offset360, answered.',
    ctaEyebrow: 'Next step',
    ctaTitle: 'Stop losing money on makeready.',
    ctaBody:
      'Every uncontrolled makeready costs sheets, ink and press time. Check your press eligibility for free: a few photos, two minutes, answer within one business day.',
    ctaPrimary: 'Test your eligibility for free',
    ctaSecondary: 'Learn more on X-Rite',
    quoteCta: 'Request a quote',
    breadcrumbHome: 'Home',
  },

  fr: {
    metaTitle: 'Offset360 | Couleur closed-loop pour offset feuille à feuille',
    metaDescription:
      'Offset360 est le bundle closed-loop X-Rite + Rutherford pour l’offset feuille à feuille : lecture IntelliTrax2, reporting MeasureColor et contrôle closed-loop Rutherford ColorLoop sur la presse.',
    heroLede: 'Le bundle closed-loop pour l’offset feuille à feuille. Mesurer, comparer, corriger, sans quitter le pupitre.',
    watchFilm: 'Voir le film',
    talkToExpert: 'Parlez à un expert',
    videoTitle: 'Offset360, la couleur closed-loop pour offset feuille à feuille',
    problemEyebrow: 'Le vrai goulot d’étranglement',
    problemTitleMain: 'Souvent, le problème ne vient pas de la presse.',
    problemTitleEm: 'C’est le système de lecture placé devant.',
    problemBody:
      'Des outils de mesure OEM obsolètes ou fermés entraînent une couleur instable, gaspillent de la matière et allongent chaque calage. Offset360 remplace l’à-peu-près par un système de lecture connecté au pied de la presse, sans acheter de nouvelle presse.',
    ideaEyebrow: 'L’idée',
    ideaTitle: 'Trois briques. Une boucle.',
    ideaLede:
      'Deux produits X-Rite de référence et un logiciel Rutherford, réunis dans un seul workflow, plus l’accompagnement expert pour le maintenir performant.',
    learnMore: 'En savoir plus',
    bundle: [
      {
        role: 'Lecture au pied de la presse',
        description:
          'Le premier système de lecture automatisé de bureau. Lit une barre de contrôle complète en moins de dix secondes, barres jusqu’à 2 mm, sans contact.',
        imageAlt: 'Scanner IntelliTrax2',
      },
      {
        role: 'Contrôle du process & reporting',
        description:
          'Une plateforme unique pour offset, flexo et numérique. ΔE en temps réel, guidage densité ChromaTrack, rapports prêts pour l’audit.',
        imageAlt: 'Opérateur utilisant MeasureColor au pupitre de la presse',
      },
      {
        role: 'Préréglage closed-loop',
        description:
          'Transforme les mesures en corrections de clés d’encrage et les envoie au pupitre. La boucle se ferme, automatiquement.',
        imageAlt: 'Rutherford ColorLoop sur un iMac',
      },
    ],
    features: [
      {
        eyebrow: 'Lecture',
        title: 'IntelliTrax2 lit la feuille, pas l’œil de l’opérateur.',
        body:
          'Un spectrophotomètre automatisé de bureau qui lit la bande de contrôle complète sur toute la feuille en quelques secondes. L’optique sans contact évite maculage et rayures, un capteur d’anticipation aligne la barre automatiquement, et chaque zone est mesurée en M0, M1 ou M3 en un seul passage.',
        chips: ['Scan < 10 s', 'Barres dès 2 mm', 'Géométrie 45°/0°', 'M0 / M1 / M3', 'Inter-instruments 0,3 ΔE moy.', 'Sans contact'],
        imageAlt: 'IntelliTrax2 en train de lire une feuille imprimée',
      },
      {
        eyebrow: 'Contrôle du process',
        title: 'MeasureColor transforme les mesures en décisions.',
        body:
          'Une plateforme client-serveur qui unifie offset, flexo et numérique. ChromaTrack calcule la correction de densité optimale et le ΔE attendu avant même que l’opérateur ne touche une clé. Les jobs se configurent en moins de 30 secondes, et les données qualité alimentent des rapports personnalisables prêts pour l’audit, vos données, sur votre serveur.',
        chips: ['Job configuré < 30 s', 'ΔE / densité en temps réel', 'Guidage ChromaTrack', 'Export PQX · CXF · CGATS', 'Offset · flexo · numérique'],
        imageAlt: 'Bundle Offset360 dans un atelier Rutherford',
      },
      {
        eyebrow: 'Closed-loop',
        title: 'Rutherford ColorLoop ferme la boucle au pupitre.',
        body:
          'Les préréglages CIP3 / CIP4 se chargent avant le démarrage de la presse. Pendant qu’IntelliTrax2 et MeasureColor lisent et comparent, ColorLoop convertit les écarts en corrections de clés d’encrage et les envoie directement au pupitre. L’opérateur valide, et la presse tient la couleur pendant tout le tirage, sur toutes les grandes marques de presses.',
        chips: ['Préréglage CIP3 / CIP4', 'Correction automatique des clés d’encrage', 'Heidelberg · Komori · KBA · Manroland', 'Toutes marques de presses'],
        imageAlt: 'Interface Rutherford ColorLoop en action',
      },
    ],
    stepsEyebrow: 'Le fonctionnement',
    stepsTitle: 'La boucle Offset360.',
    steps: [
      { title: 'Préréglage', body: 'Les préréglages de clés d’encrage CIP3 / CIP4 se chargent automatiquement. Aucune saisie manuelle.' },
      { title: 'Lecture', body: 'IntelliTrax2 lit la barre de contrôle sur toute la feuille en quelques secondes.' },
      { title: 'Comparaison', body: 'MeasureColor calcule le ΔE par rapport à la référence de la marque et signale les zones hors tolérance.' },
      { title: 'Correction', body: 'ColorLoop envoie les corrections au pupitre. L’opérateur valide. La boucle se ferme.' },
    ],
    roiEyebrow: 'Retour sur investissement',
    roiPrefix: 'jusqu’à ',
    roiSub:
      'de coût initial en moins par rapport à un nouveau système de mesure. Offset360 modernise le contrôle couleur grâce à un financement flexible, sans investir dans une nouvelle presse.',
    numberLabels: ['Gâche au calage', 'Temps de calage', 'Stabilité couleur en tirage', 'Feuilles traçables'],
    deployEyebrow: 'Le déploiement',
    deployTitle: 'Un déploiement accompagné, pas une simple livraison.',
    process: [
      {
        title: 'Connecter & collaborer',
        body: 'Les experts couleur X-Rite et Rutherford cartographient vos objectifs de production et vos vrais défis couleur, ensemble.',
      },
      {
        title: 'Évaluer & configurer',
        body: 'Votre installation actuelle est évaluée pour la compatibilité, la configuration idéale est conçue, et des objectifs de performance mesurables sont fixés.',
      },
      {
        title: 'Preuve de concept & accompagnement',
        body: 'Installation, formation des équipes et validation des résultats. Objectifs non atteints ? Vous pouvez arrêter. Des audits annuels maintiennent la performance.',
      },
    ],
    includedEyebrow: 'Ce qui est inclus',
    includedTitle: 'Tout pour faire tourner le closed-loop.',
    included: [
      'Système de lecture IntelliTrax2',
      'Logiciel de contrôle du process MeasureColor',
      'Technologie closed-loop Rutherford ColorLoop',
      'Accompagnement par un expert couleur',
      'Audit de performance annuel, inclus',
      'Installation professionnelle & formation',
    ],
    reassurePre: 'Ouvert et flexible par conception. Offset360 fonctionne avec ',
    reassureStrong: 'toutes les marques de presses et tous les workflows',
    reassurePost: ', sans dépendance fournisseur, sans tout remplacer.',
    faqEyebrow: 'FAQ Offset360',
    faqTitle: 'Offset360, en clair.',
    ctaEyebrow: 'Prochaine étape',
    ctaTitle: 'Arrêtez de perdre de l’argent au calage.',
    ctaBody:
      'Chaque calage non maîtrisé coûte des feuilles, de l’encre et du temps machine. Testez gratuitement l’éligibilité de votre presse : quelques photos, deux minutes, réponse sous un jour ouvré.',
    ctaPrimary: 'Testez gratuitement votre éligibilité',
    ctaSecondary: 'En savoir plus sur X-Rite',
    quoteCta: 'Demander un devis',
    breadcrumbHome: 'Accueil',
  },

  de: {
    metaTitle: 'Offset360 | Closed-Loop-Farbe für den Bogenoffset',
    metaDescription:
      'Offset360 ist das X-Rite + Rutherford Closed-Loop-Paket für den Bogenoffset: IntelliTrax2-Messung, MeasureColor-Reporting und Rutherford ColorLoop Closed-Loop-Steuerung an der Druckmaschine.',
    heroLede: 'Das Closed-Loop-Paket für den Bogenoffset. Messen, vergleichen, korrigieren, ohne das Druckpult zu verlassen.',
    watchFilm: 'Film ansehen',
    talkToExpert: 'Sprechen Sie mit einem Experten',
    videoTitle: 'Offset360, Closed-Loop-Farbe für den Bogenoffset',
    problemEyebrow: 'Der wahre Engpass',
    problemTitleMain: 'Oft liegt das Problem nicht an der Druckmaschine.',
    problemTitleEm: 'Sondern am Messsystem davor.',
    problemBody:
      'Veraltete oder geschlossene OEM-Messsysteme führen zu instabiler Farbe, Makulatur und längerem Einrichten. Offset360 ersetzt das Rätselraten durch ein vernetztes Messsystem direkt an der Druckmaschine, ohne Neuinvestition in eine Druckmaschine.',
    ideaEyebrow: 'Die Idee',
    ideaTitle: 'Drei Komponenten. Ein Loop.',
    ideaLede:
      'Zwei führende X-Rite-Produkte und eine Rutherford-Software, vereint in einem Workflow, plus Experten-Support, damit alles leistungsfähig bleibt.',
    learnMore: 'Mehr erfahren',
    bundle: [
      {
        role: 'Messung an der Druckmaschine',
        description:
          'Das erste automatisierte Desktop-Messsystem. Liest einen kompletten Farbkontrollstreifen in unter zehn Sekunden, Streifen bis 2 mm, berührungslos.',
        imageAlt: 'IntelliTrax2-Scanner',
      },
      {
        role: 'Prozesskontrolle & Reporting',
        description:
          'Eine Plattform für Offset, Flexo und Digital. ΔE in Echtzeit, ChromaTrack-Dichteführung, auditfähige Reports.',
        imageAlt: 'Bediener mit MeasureColor am Druckpult',
      },
      {
        role: 'Closed-Loop-Voreinstellung',
        description:
          'Wandelt Messdaten in Farbzonen-Korrekturen um und sendet sie ans Druckpult. Der Loop schließt sich, automatisch.',
        imageAlt: 'Rutherford ColorLoop auf einem iMac',
      },
    ],
    features: [
      {
        eyebrow: 'Messung',
        title: 'IntelliTrax2 liest den Bogen, nicht das Auge des Bedieners.',
        body:
          'Ein automatisiertes Desktop-Spektralfotometer, das den kompletten Kontrollstreifen über den ganzen Bogen in Sekunden misst. Berührungslose Optik verhindert Verschmieren und Kratzer, ein Look-Ahead-Sensor richtet den Streifen automatisch aus, und jede Zone wird in einem Durchgang unter M0, M1 oder M3 erfasst.',
        chips: ['Scan < 10 s', 'Streifen ab 2 mm', '45°/0°-Geometrie', 'M0 / M1 / M3', 'Inter-Instrument Ø 0,3 ΔE', 'Berührungslos'],
        imageAlt: 'IntelliTrax2 beim Messen eines Druckbogens',
      },
      {
        eyebrow: 'Prozesskontrolle',
        title: 'MeasureColor macht aus Messungen Entscheidungen.',
        body:
          'Eine Client-Server-Plattform, die Offset, Flexo und Digital vereint. ChromaTrack berechnet die optimale Dichtekorrektur und das erwartete ΔE, bevor der Bediener eine Taste berührt. Jobs sind in unter 30 Sekunden angelegt, und Qualitätsdaten fließen in anpassbare, auditfähige Reports, Ihre Daten, auf Ihrem Server.',
        chips: ['Jobanlage < 30 s', 'ΔE / Dichte in Echtzeit', 'ChromaTrack-Führung', 'PQX · CXF · CGATS-Export', 'Offset · Flexo · Digital'],
        imageAlt: 'Offset360-Paket in einer Rutherford-Druckerei',
      },
      {
        eyebrow: 'Closed-Loop',
        title: 'Rutherford ColorLoop schließt den Loop am Druckpult.',
        body:
          'CIP3 / CIP4-Voreinstellungen laden, bevor die Druckmaschine anläuft. Während IntelliTrax2 und MeasureColor messen und vergleichen, wandelt ColorLoop die Abweichungen in Farbzonen-Korrekturen um und sendet sie direkt ans Druckpult. Der Bediener bestätigt, und die Maschine hält die Farbe über die gesamte Auflage, auf allen großen Maschinenfabrikaten.',
        chips: ['CIP3 / CIP4-Voreinstellung', 'Automatische Farbzonen-Korrektur', 'Heidelberg · Komori · KBA · Manroland', 'Herstellerunabhängig'],
        imageAlt: 'Rutherford ColorLoop-Oberfläche in Aktion',
      },
    ],
    stepsEyebrow: 'So läuft es',
    stepsTitle: 'Der Offset360-Loop.',
    steps: [
      { title: 'Voreinstellung', body: 'CIP3 / CIP4-Farbzonen-Voreinstellungen laden automatisch. Keine manuelle Eingabe.' },
      { title: 'Messung', body: 'IntelliTrax2 liest den Farbkontrollstreifen über den ganzen Bogen in Sekunden.' },
      { title: 'Vergleich', body: 'MeasureColor berechnet das ΔE gegen die Markenreferenz und markiert Zonen außerhalb der Toleranz.' },
      { title: 'Korrektur', body: 'ColorLoop sendet die Korrekturen ans Druckpult. Der Bediener bestätigt. Der Loop schließt sich.' },
    ],
    roiEyebrow: 'Return on Investment',
    roiPrefix: 'bis zu ',
    roiSub:
      'geringere Anfangskosten als ein neues Messsystem. Offset360 modernisiert die Farbsteuerung über flexible Finanzierung, ohne Investition in eine neue Druckmaschine.',
    numberLabels: ['Einrichtungs-Makulatur', 'Einrichtungszeit', 'Farbstabilität im Fortdruck', 'Rückverfolgbare Bogen'],
    deployEyebrow: 'So führen wir es ein',
    deployTitle: 'Ein begleiteter Rollout, keine bloße Lieferung.',
    process: [
      {
        title: 'Verbinden & zusammenarbeiten',
        body: 'X-Rite-Farbexperten und Rutherford erfassen gemeinsam Ihre Produktionsziele und Ihre realen Farbherausforderungen.',
      },
      {
        title: 'Bewerten & konfigurieren',
        body: 'Ihre aktuelle Installation wird auf Kompatibilität geprüft, die ideale Konfiguration entworfen und messbare Leistungsziele werden festgelegt.',
      },
      {
        title: 'Proof of Concept & Support',
        body: 'Installation, Teamschulung und Ergebnisvalidierung. Ziele nicht erreicht? Sie können aussteigen. Jährliche Audits halten die Leistung auf Kurs.',
      },
    ],
    includedEyebrow: 'Was enthalten ist',
    includedTitle: 'Alles für den Closed-Loop.',
    included: [
      'IntelliTrax2-Messsystem',
      'MeasureColor-Prozesskontrollsoftware',
      'Rutherford ColorLoop Closed-Loop-Technologie',
      'Begleitung durch Farbexperten',
      'Jährliches Performance-Audit, inklusive',
      'Professionelle Installation & Schulung',
    ],
    reassurePre: 'Offen und flexibel konzipiert. Offset360 funktioniert mit ',
    reassureStrong: 'jedem Maschinenfabrikat und jedem Workflow',
    reassurePost: ', ohne Herstellerbindung, ohne Komplettaustausch.',
    faqEyebrow: 'Offset360 FAQ',
    faqTitle: 'Offset360, erklärt.',
    ctaEyebrow: 'Nächster Schritt',
    ctaTitle: 'Schluss mit Geldverlust beim Einrichten.',
    ctaBody:
      'Jedes unkontrollierte Einrichten kostet Bogen, Farbe und Maschinenzeit. Prüfen Sie kostenlos die Eignung Ihrer Druckmaschine: ein paar Fotos, zwei Minuten, Antwort innerhalb eines Werktags.',
    ctaPrimary: 'Eignung kostenlos prüfen',
    ctaSecondary: 'Mehr auf X-Rite erfahren',
    quoteCta: 'Angebot anfragen',
    breadcrumbHome: 'Startseite',
  },

  it: {
    metaTitle: 'Offset360 | Colore closed-loop per offset foglio',
    metaDescription:
      'Offset360 è il bundle closed-loop X-Rite + Rutherford per l’offset foglio: lettura IntelliTrax2, reporting MeasureColor e controllo closed-loop Rutherford ColorLoop sulla macchina.',
    heroLede: 'Il bundle closed-loop per l’offset foglio. Misurare, confrontare, correggere, senza lasciare il pulpito.',
    watchFilm: 'Guarda il video',
    talkToExpert: 'Parla con un esperto',
    videoTitle: 'Offset360, colore closed-loop per offset foglio',
    problemEyebrow: 'Il vero collo di bottiglia',
    problemTitleMain: 'Spesso il problema non è la macchina da stampa.',
    problemTitleEm: 'È il sistema di lettura davanti.',
    problemBody:
      'Strumenti di misura OEM obsoleti o chiusi rendono il colore incostante, sprecano materiale e allungano ogni avviamento. Offset360 sostituisce le approssimazioni con un sistema di lettura connesso a bordo macchina, senza acquistare una nuova macchina da stampa.',
    ideaEyebrow: 'L’idea',
    ideaTitle: 'Tre elementi. Un loop.',
    ideaLede:
      'Due prodotti X-Rite di riferimento e un software Rutherford, riuniti in un unico workflow, più il supporto esperto per mantenerlo performante.',
    learnMore: 'Scopri di più',
    bundle: [
      {
        role: 'Lettura a bordo macchina',
        description:
          'Il primo sistema di scansione automatizzato da banco. Legge una barra colore completa in meno di dieci secondi, barre fino a 2 mm, senza contatto.',
        imageAlt: 'Scanner IntelliTrax2',
      },
      {
        role: 'Controllo di processo & reporting',
        description:
          'Una piattaforma per offset, flexo e digitale. ΔE in tempo reale, guida densità ChromaTrack, report pronti per l’audit.',
        imageAlt: 'Operatore con MeasureColor al pulpito di stampa',
      },
      {
        role: 'Preset closed-loop',
        description:
          'Trasforma le misure in correzioni delle chiavi di inchiostro e le invia al pulpito. Il loop si chiude, automaticamente.',
        imageAlt: 'Rutherford ColorLoop su un iMac',
      },
    ],
    features: [
      {
        eyebrow: 'Lettura',
        title: 'IntelliTrax2 legge il foglio, non l’occhio dell’operatore.',
        body:
          'Uno spettrofotometro automatizzato da banco che legge l’intera striscia di controllo sul foglio in pochi secondi. L’ottica senza contatto evita sbavature e graffi, un sensore look-ahead allinea la barra automaticamente e ogni zona viene acquisita in M0, M1 o M3 in un solo passaggio.',
        chips: ['Scan < 10 s', 'Barre da 2 mm', 'Geometria 45°/0°', 'M0 / M1 / M3', 'Inter-strumento 0,3 ΔE medio', 'Senza contatto'],
        imageAlt: 'IntelliTrax2 mentre legge un foglio stampato',
      },
      {
        eyebrow: 'Controllo di processo',
        title: 'MeasureColor trasforma le misure in decisioni.',
        body:
          'Una piattaforma client-server che unifica offset, flexo e digitale. ChromaTrack calcola la correzione di densità ottimale e il ΔE atteso prima ancora che l’operatore tocchi una chiave. I job si configurano in meno di 30 secondi e i dati qualità alimentano report personalizzabili e pronti per l’audit, i vostri dati, sul vostro server.',
        chips: ['Setup job < 30 s', 'ΔE / densità in tempo reale', 'Guida ChromaTrack', 'Export PQX · CXF · CGATS', 'Offset · flexo · digitale'],
        imageAlt: 'Bundle Offset360 in una sala stampa Rutherford',
      },
      {
        eyebrow: 'Closed-loop',
        title: 'Rutherford ColorLoop chiude il loop al pulpito.',
        body:
          'I preset CIP3 / CIP4 si caricano prima dell’avvio della macchina. Mentre IntelliTrax2 e MeasureColor leggono e confrontano, ColorLoop converte gli scostamenti in correzioni delle chiavi di inchiostro e le invia direttamente al pulpito. L’operatore convalida e la macchina mantiene il colore per tutta la tiratura, su tutte le principali marche di macchine.',
        chips: ['Preset CIP3 / CIP4', 'Correzione automatica chiavi di inchiostro', 'Heidelberg · Komori · KBA · Manroland', 'Indipendente dalla macchina'],
        imageAlt: 'Interfaccia Rutherford ColorLoop in azione',
      },
    ],
    stepsEyebrow: 'Come funziona',
    stepsTitle: 'Il loop Offset360.',
    steps: [
      { title: 'Preset', body: 'I preset CIP3 / CIP4 delle chiavi di inchiostro si caricano automaticamente. Nessun inserimento manuale.' },
      { title: 'Lettura', body: 'IntelliTrax2 legge la barra colore su tutto il foglio in pochi secondi.' },
      { title: 'Confronto', body: 'MeasureColor calcola il ΔE rispetto al riferimento del brand e segnala le zone fuori tolleranza.' },
      { title: 'Correzione', body: 'ColorLoop invia le correzioni al pulpito. L’operatore convalida. Il loop si chiude.' },
    ],
    roiEyebrow: 'Ritorno sull’investimento',
    roiPrefix: 'fino al ',
    roiSub:
      'di costo iniziale in meno rispetto a un nuovo sistema di misura. Offset360 modernizza il controllo colore con un finanziamento flessibile, senza investire in una nuova macchina.',
    numberLabels: ['Scarto di avviamento', 'Tempo di avviamento', 'Stabilità colore in tiratura', 'Fogli tracciabili'],
    deployEyebrow: 'Come lo implementiamo',
    deployTitle: 'Un rollout guidato, non una semplice consegna.',
    process: [
      {
        title: 'Connettere & collaborare',
        body: 'Gli esperti colore X-Rite e Rutherford mappano i vostri obiettivi di produzione e le vere sfide colore, insieme.',
      },
      {
        title: 'Valutare & configurare',
        body: 'L’installazione attuale viene valutata per la compatibilità, si progetta la configurazione ideale e si fissano obiettivi di prestazione misurabili.',
      },
      {
        title: 'Proof of concept & supporto',
        body: 'Installazione, formazione dei team e validazione dei risultati. Obiettivi non raggiunti? Potete fermarvi. Audit annuali mantengono le prestazioni.',
      },
    ],
    includedEyebrow: 'Cosa è incluso',
    includedTitle: 'Tutto per far girare il closed-loop.',
    included: [
      'Sistema di scansione IntelliTrax2',
      'Software di controllo di processo MeasureColor',
      'Tecnologia closed-loop Rutherford ColorLoop',
      'Supporto di un consulente colore esperto',
      'Audit di prestazione annuale, incluso',
      'Installazione professionale & formazione',
    ],
    reassurePre: 'Aperto e flessibile per progettazione. Offset360 funziona con ',
    reassureStrong: 'qualsiasi marca di macchina e qualsiasi workflow',
    reassurePost: ', senza vincoli di fornitore, senza sostituire tutto.',
    faqEyebrow: 'FAQ Offset360',
    faqTitle: 'Offset360, in chiaro.',
    ctaEyebrow: 'Prossimo passo',
    ctaTitle: 'Basta perdere denaro in avviamento.',
    ctaBody:
      'Ogni avviamento non controllato costa fogli, inchiostro e tempo macchina. Verificate gratuitamente l’idoneità della vostra macchina: qualche foto, due minuti, risposta entro un giorno lavorativo.',
    ctaPrimary: 'Verifica gratuita di idoneità',
    ctaSecondary: 'Scopri di più su X-Rite',
    quoteCta: 'Richiedi un preventivo',
    breadcrumbHome: 'Home',
  },

  es: {
    metaTitle: 'Offset360 | Color closed-loop para offset pliego',
    metaDescription:
      'Offset360 es el bundle closed-loop X-Rite + Rutherford para offset pliego: lectura IntelliTrax2, informes MeasureColor y control closed-loop Rutherford ColorLoop en la prensa.',
    heroLede: 'El bundle closed-loop para offset pliego. Medir, comparar, corregir, sin salir de la consola.',
    watchFilm: 'Ver el vídeo',
    talkToExpert: 'Hable con un experto',
    videoTitle: 'Offset360, color closed-loop para offset pliego',
    problemEyebrow: 'El verdadero cuello de botella',
    problemTitleMain: 'A menudo el problema no es la prensa.',
    problemTitleEm: 'Es el sistema de lectura delante de ella.',
    problemBody:
      'Los instrumentos de medición OEM obsoletos o cerrados dejan el color inconsistente, desperdician material y alargan cada puesta a punto. Offset360 sustituye las aproximaciones por un sistema de lectura conectado junto a la prensa, sin comprar una prensa nueva.',
    ideaEyebrow: 'La idea',
    ideaTitle: 'Tres piezas. Un solo loop.',
    ideaLede:
      'Dos productos X-Rite de referencia y un software Rutherford, reunidos en un único workflow, más el acompañamiento experto para mantenerlo al máximo rendimiento.',
    learnMore: 'Más información',
    bundle: [
      {
        role: 'Lectura junto a la prensa',
        description:
          'El primer sistema de escaneado automatizado de sobremesa. Lee una barra de control completa en menos de diez segundos, barras de hasta 2 mm, sin contacto.',
        imageAlt: 'Escáner IntelliTrax2',
      },
      {
        role: 'Control de proceso y reporting',
        description:
          'Una plataforma para offset, flexo y digital. ΔE en tiempo real, guía de densidad ChromaTrack, informes listos para auditoría.',
        imageAlt: 'Operario con MeasureColor en la consola de prensa',
      },
      {
        role: 'Preajuste closed-loop',
        description:
          'Convierte las mediciones en correcciones de llaves de tinta y las envía a la consola. El loop se cierra, automáticamente.',
        imageAlt: 'Rutherford ColorLoop en un iMac',
      },
    ],
    features: [
      {
        eyebrow: 'Lectura',
        title: 'IntelliTrax2 lee el pliego, no el ojo del operario.',
        body:
          'Un espectrofotómetro automatizado de sobremesa que lee la tira de control completa en todo el pliego en segundos. La óptica sin contacto evita manchas y arañazos, un sensor de anticipación alinea la barra automáticamente y cada zona se captura en M0, M1 o M3 en una sola pasada.',
        chips: ['Escaneo < 10 s', 'Barras desde 2 mm', 'Geometría 45°/0°', 'M0 / M1 / M3', 'Inter-instrumento 0,3 ΔE prom.', 'Sin contacto'],
        imageAlt: 'IntelliTrax2 leyendo un pliego impreso',
      },
      {
        eyebrow: 'Control de proceso',
        title: 'MeasureColor convierte las mediciones en decisiones.',
        body:
          'Una plataforma cliente-servidor que unifica offset, flexo y digital. ChromaTrack calcula la corrección de densidad óptima y el ΔE esperado antes de que el operario toque una llave. Los trabajos se configuran en menos de 30 segundos y los datos de calidad alimentan informes personalizables y listos para auditoría, sus datos, en su servidor.',
        chips: ['Trabajo listo < 30 s', 'ΔE / densidad en tiempo real', 'Guía ChromaTrack', 'Exportación PQX · CXF · CGATS', 'Offset · flexo · digital'],
        imageAlt: 'Bundle Offset360 en una sala de prensa Rutherford',
      },
      {
        eyebrow: 'Closed-loop',
        title: 'Rutherford ColorLoop cierra el loop en la consola.',
        body:
          'Los preajustes CIP3 / CIP4 se cargan antes de que arranque la prensa. Mientras IntelliTrax2 y MeasureColor leen y comparan, ColorLoop convierte las desviaciones en correcciones de llaves de tinta y las envía directamente a la consola. El operario valida y la prensa mantiene el color durante toda la tirada, en cualquier gran marca de prensa.',
        chips: ['Preajuste CIP3 / CIP4', 'Corrección automática de llaves de tinta', 'Heidelberg · Komori · KBA · Manroland', 'Independiente de la prensa'],
        imageAlt: 'Interfaz Rutherford ColorLoop en acción',
      },
    ],
    stepsEyebrow: 'Cómo funciona',
    stepsTitle: 'El loop Offset360.',
    steps: [
      { title: 'Preajuste', body: 'Los preajustes CIP3 / CIP4 de llaves de tinta se cargan automáticamente. Sin introducción manual.' },
      { title: 'Lectura', body: 'IntelliTrax2 lee la barra de control en todo el pliego en segundos.' },
      { title: 'Comparación', body: 'MeasureColor calcula el ΔE frente a la referencia de la marca y señala las zonas fuera de tolerancia.' },
      { title: 'Corrección', body: 'ColorLoop envía las correcciones a la consola. El operario valida. El loop se cierra.' },
    ],
    roiEyebrow: 'Retorno de la inversión',
    roiPrefix: 'hasta un ',
    roiSub:
      'menos de coste inicial que un nuevo sistema de medición. Offset360 moderniza el control del color con financiación flexible, sin invertir en una prensa nueva.',
    numberLabels: ['Desperdicio de puesta a punto', 'Tiempo de puesta a punto', 'Estabilidad del color en tirada', 'Pliegos trazables'],
    deployEyebrow: 'Cómo lo desplegamos',
    deployTitle: 'Un despliegue acompañado, no una simple entrega.',
    process: [
      {
        title: 'Conectar y colaborar',
        body: 'Los expertos en color de X-Rite y Rutherford trazan juntos sus objetivos de producción y sus verdaderos retos de color.',
      },
      {
        title: 'Evaluar y configurar',
        body: 'Se evalúa la compatibilidad de su instalación actual, se diseña la configuración ideal y se fijan objetivos de rendimiento medibles.',
      },
      {
        title: 'Prueba de concepto y soporte',
        body: 'Instalación, formación de los equipos y validación de resultados. ¿Objetivos no alcanzados? Puede parar. Auditorías anuales mantienen el rendimiento.',
      },
    ],
    includedEyebrow: 'Qué incluye',
    includedTitle: 'Todo para un closed-loop completo.',
    included: [
      'Sistema de escaneado IntelliTrax2',
      'Software de control de proceso MeasureColor',
      'Tecnología closed-loop Rutherford ColorLoop',
      'Acompañamiento de un consultor de color experto',
      'Auditoría de rendimiento anual, incluida',
      'Instalación profesional y formación',
    ],
    reassurePre: 'Abierto y flexible por diseño. Offset360 funciona con ',
    reassureStrong: 'cualquier marca de prensa y cualquier workflow',
    reassurePost: ', sin dependencia del proveedor, sin sustituirlo todo.',
    faqEyebrow: 'FAQ Offset360',
    faqTitle: 'Offset360, en claro.',
    ctaEyebrow: 'Siguiente paso',
    ctaTitle: 'Deje de perder dinero en la puesta a punto.',
    ctaBody:
      'Cada puesta a punto sin control cuesta pliegos, tinta y tiempo de máquina. Compruebe gratis la elegibilidad de su prensa: unas fotos, dos minutos, respuesta en un día laborable.',
    ctaPrimary: 'Pruebe gratis su elegibilidad',
    ctaSecondary: 'Más información en X-Rite',
    quoteCta: 'Solicitar un presupuesto',
    breadcrumbHome: 'Inicio',
  },

  pt: {
    metaTitle: 'Offset360 | Cor closed-loop para offset de folhas',
    metaDescription:
      'O Offset360 é o bundle closed-loop X-Rite + Rutherford para offset de folhas: leitura IntelliTrax2, relatórios MeasureColor e controlo closed-loop Rutherford ColorLoop na máquina.',
    heroLede: 'O bundle closed-loop para offset de folhas. Medir, comparar, corrigir, sem sair da consola.',
    watchFilm: 'Ver o vídeo',
    talkToExpert: 'Fale com um especialista',
    videoTitle: 'Offset360, cor closed-loop para offset de folhas',
    problemEyebrow: 'O verdadeiro estrangulamento',
    problemTitleMain: 'Muitas vezes o problema não é a máquina.',
    problemTitleEm: 'É o sistema de leitura à sua frente.',
    problemBody:
      'Instrumentos de medição OEM obsoletos ou fechados deixam a cor inconsistente, desperdiçam material e prolongam cada acerto. O Offset360 substitui a tentativa e erro por um sistema de leitura ligado junto à máquina, sem comprar uma máquina nova.',
    ideaEyebrow: 'A ideia',
    ideaTitle: 'Três peças. Um loop.',
    ideaLede:
      'Dois produtos X-Rite de referência e um software Rutherford, reunidos num único workflow, mais o acompanhamento especializado para o manter a render.',
    learnMore: 'Saber mais',
    bundle: [
      {
        role: 'Leitura junto à máquina',
        description:
          'O primeiro sistema de leitura automatizado de secretária. Lê uma barra de cores completa em menos de dez segundos, barras até 2 mm, sem contacto.',
        imageAlt: 'Scanner IntelliTrax2',
      },
      {
        role: 'Controlo de processo & relatórios',
        description:
          'Uma plataforma para offset, flexo e digital. ΔE em tempo real, orientação de densidade ChromaTrack, relatórios prontos para auditoria.',
        imageAlt: 'Operador com o MeasureColor na consola da máquina',
      },
      {
        role: 'Pré-ajuste closed-loop',
        description:
          'Converte as medições em correções das zonas de tinta e envia-as para a consola. O loop fecha-se, automaticamente.',
        imageAlt: 'Rutherford ColorLoop num iMac',
      },
    ],
    features: [
      {
        eyebrow: 'Leitura',
        title: 'O IntelliTrax2 lê a folha, não o olho do operador.',
        body:
          'Um espetrofotómetro automatizado de secretária que lê a tira de controlo completa em toda a folha em segundos. A ótica sem contacto evita borrões e riscos, um sensor de antecipação alinha a barra automaticamente e cada zona é capturada em M0, M1 ou M3 numa única passagem.',
        chips: ['Leitura < 10 s', 'Barras desde 2 mm', 'Geometria 45°/0°', 'M0 / M1 / M3', 'Inter-instrumentos 0,3 ΔE méd.', 'Sem contacto'],
        imageAlt: 'IntelliTrax2 a ler uma folha impressa',
      },
      {
        eyebrow: 'Controlo de processo',
        title: 'O MeasureColor transforma medições em decisões.',
        body:
          'Uma plataforma cliente-servidor que unifica offset, flexo e digital. O ChromaTrack calcula a correção de densidade ideal e o ΔE esperado antes de o operador tocar numa zona. Os trabalhos configuram-se em menos de 30 segundos e os dados de qualidade alimentam relatórios personalizáveis e prontos para auditoria, os seus dados, no seu servidor.',
        chips: ['Trabalho pronto < 30 s', 'ΔE / densidade em tempo real', 'Orientação ChromaTrack', 'Exportação PQX · CXF · CGATS', 'Offset · flexo · digital'],
        imageAlt: 'Bundle Offset360 numa gráfica Rutherford',
      },
      {
        eyebrow: 'Closed-loop',
        title: 'O Rutherford ColorLoop fecha o loop na consola.',
        body:
          'Os pré-ajustes CIP3 / CIP4 carregam antes de a máquina arrancar. Enquanto o IntelliTrax2 e o MeasureColor leem e comparam, o ColorLoop converte os desvios em correções das zonas de tinta e envia-as diretamente para a consola. O operador valida e a máquina mantém a cor durante toda a tiragem, em todas as grandes marcas de máquinas.',
        chips: ['Pré-ajuste CIP3 / CIP4', 'Correção automática das zonas de tinta', 'Heidelberg · Komori · KBA · Manroland', 'Independente da máquina'],
        imageAlt: 'Interface Rutherford ColorLoop em ação',
      },
    ],
    stepsEyebrow: 'Como funciona',
    stepsTitle: 'O loop Offset360.',
    steps: [
      { title: 'Pré-ajuste', body: 'Os pré-ajustes CIP3 / CIP4 das zonas de tinta carregam automaticamente. Sem introdução manual.' },
      { title: 'Leitura', body: 'O IntelliTrax2 lê a barra de cores em toda a folha em segundos.' },
      { title: 'Comparação', body: 'O MeasureColor calcula o ΔE face à referência da marca e sinaliza as zonas fora de tolerância.' },
      { title: 'Correção', body: 'O ColorLoop envia as correções para a consola. O operador valida. O loop fecha-se.' },
    ],
    roiEyebrow: 'Retorno do investimento',
    roiPrefix: 'até ',
    roiSub:
      'menos de custo inicial do que um novo sistema de medição. O Offset360 moderniza o controlo de cor com financiamento flexível, sem investir numa máquina nova.',
    numberLabels: ['Maculatura de acerto', 'Tempo de acerto', 'Estabilidade de cor na tiragem', 'Folhas rastreáveis'],
    deployEyebrow: 'Como o implementamos',
    deployTitle: 'Uma implementação acompanhada, não uma simples entrega.',
    process: [
      {
        title: 'Ligar & colaborar',
        body: 'Os especialistas de cor da X-Rite e a Rutherford mapeiam consigo os seus objetivos de produção e os verdadeiros desafios de cor.',
      },
      {
        title: 'Avaliar & configurar',
        body: 'A sua instalação atual é avaliada quanto à compatibilidade, desenha-se a configuração ideal e definem-se objetivos de desempenho mensuráveis.',
      },
      {
        title: 'Prova de conceito & suporte',
        body: 'Instalação, formação das equipas e validação de resultados. Objetivos não atingidos? Pode parar. Auditorias anuais mantêm o desempenho.',
      },
    ],
    includedEyebrow: 'O que está incluído',
    includedTitle: 'Tudo para pôr o closed-loop a funcionar.',
    included: [
      'Sistema de leitura IntelliTrax2',
      'Software de controlo de processo MeasureColor',
      'Tecnologia closed-loop Rutherford ColorLoop',
      'Acompanhamento por um consultor de cor especializado',
      'Auditoria de desempenho anual, incluída',
      'Instalação profissional & formação',
    ],
    reassurePre: 'Aberto e flexível por conceção. O Offset360 funciona com ',
    reassureStrong: 'qualquer marca de máquina e qualquer workflow',
    reassurePost: ', sem dependência de fornecedor, sem substituir tudo.',
    faqEyebrow: 'FAQ Offset360',
    faqTitle: 'Offset360, em claro.',
    ctaEyebrow: 'Próximo passo',
    ctaTitle: 'Pare de perder dinheiro no acerto.',
    ctaBody:
      'Cada acerto sem controlo custa folhas, tinta e tempo de máquina. Verifique gratuitamente a elegibilidade da sua máquina: algumas fotos, dois minutos, resposta num dia útil.',
    ctaPrimary: 'Teste gratuitamente a sua elegibilidade',
    ctaSecondary: 'Saber mais na X-Rite',
    quoteCta: 'Pedir um orçamento',
    breadcrumbHome: 'Início',
  },
};
