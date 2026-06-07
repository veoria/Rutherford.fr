import type { AppModule } from '@/data/academy-app';

// Offset Color Management Fundamentals — contenu FR du player.
// Traduction de l'anglais (data/academy-app.ts) selon le glossaire CLAUDE.md.
// Structure identique à l'EN (index/num/illustration), seul le texte change ;
// l'ordre des options de quiz est préservé pour garder les index de réponse.
const modules: AppModule[] = [
  {
    index: 0,
    num: '01',
    title: 'Ce que « bonne couleur » veut vraiment dire sur presse',
    time: '9 min',
    summary: "De l'approbation subjective à une constance mesurable.",
    steps: [
      {
        kicker: 'Étape 1 · Le problème',
        headline: '« C’est bon ? » — le jugement le plus coûteux de l’atelier',
        paragraphs: [
          `Dans presque tous les ateliers, on entend la même conversation : <b>« C'est bon ? »</b>. Un opérateur regarde la feuille, jette un œil à l'épreuve, et décide. Cette décision change à chaque changement d'opérateur — et sur une presse à trois équipes et une dizaine de marques, elle garantit la variance. Vos clients la repèrent avant vous, et vous la refacturent en palettes rejetées, en audits et en contrats perdus.`,
        ],
        illustration: 'ill-variance.svg',
        quiz: {
          q: "Même travail, même presse : l'équipe de nuit valide la feuille, celle de jour la refuse. Qu'est-ce qui cloche réellement ?",
          options: [
            "L'opérateur de jour est trop exigeant",
            'La décision conforme/non conforme dépend de la personne, pas des données',
            "La presse a dérivé pendant la nuit — c'est inévitable",
          ],
          answer: 1,
          ok: "Exactement — la source de variance, c'est la décision elle-même, pas les personnes.",
          no: "Trois verdicts sur la même feuille : le problème, c'est la méthode de décision.",
        },
      },
      {
        kicker: 'Étape 2 · La solution',
        headline: 'Cible. Tolérance. Mesure.',
        paragraphs: [
          `Une définition exploitable de la bonne couleur tient en trois parties. Elle est ancrée à une <b>cible</b> — une empreinte ou une référence de marque, en valeurs CIELAB ou spectrales. Elle porte une <b>tolérance</b> — un budget de ΔE qui dit « tout ce qui est à l'intérieur passe ». Et elle est <b>vérifiée par un dispositif de mesure</b>, pas par l'œil. Trois parties, aucune opinion.`,
        ],
        illustration: 'ill-definition.svg',
        quiz: {
          q: 'La définition la plus défendable de la « bonne couleur » sur une presse de production, c’est :',
          options: [
            "Ce que l'opérateur en poste approuve à l'œil",
            'Une correspondance mesurée à une cible, dans une tolérance ΔE définie, vérifiée par un dispositif',
            'La feuille la plus dense que la presse peut produire',
          ],
          answer: 1,
          ok: 'Tout le cours en une ligne — cible + tolérance + mesure.',
          no: 'Cherchez la réponse avec les trois parties : cible, tolérance, dispositif.',
        },
      },
      {
        kicker: 'Étape 3 · Le bénéfice',
        headline: "La défendre. L'auditer. La répéter. L'améliorer.",
        paragraphs: [
          `Le coût du passage de « l'opérateur approuve » à « le dispositif mesure » est faible. Le bénéfice : chaque verdict est le même à chaque équipe, et chaque feuille laisse une trace — n° de travail, opérateur, horodatage, ΔE. Quand une marque conteste une livraison, la conversation devient factuelle plutôt que rhétorique.`,
        ],
        illustration: 'ill-payoff.svg',
        quiz: {
          q: 'Une marque conteste une livraison de mars dernier. Avec un workflow mesuré, vous…',
          options: [
            "Demandez à l'opérateur s'il se souvient du travail",
            'Sortez l’enregistrement de mesure pour ce n° de travail et tranchez avec les données',
            'Offrez une remise pour éviter la discussion',
          ],
          answer: 1,
          ok: "Module validé — cette trace de données, c'est ce que vous construirez dans les cours MeasureColor.",
          no: "Tout l'intérêt de mesurer : l'enregistrement existe. Tranchez avec les données.",
        },
      },
    ],
  },
  {
    index: 1,
    num: '02',
    title: 'ISO 12647 en 10 minutes',
    time: '10 min',
    summary: 'Le standard que vos marques supposent que vous suivez.',
    steps: [
      {
        kicker: 'Étape 1 · Le standard',
        headline: 'Une famille, une partie par procédé',
        paragraphs: [
          `ISO 12647 est la famille de standards de contrôle des procédés d'impression — la partie qui vous concerne est <b>12647-2 : offset feuille à feuille</b>, le document que les marques citent dans les cahiers des charges packaging. Elle définit des <b>classes de substrat</b> (PS1–PS8 dans l'édition 2013 ; les contrats anciens disent encore PT1–PT5), des <b>courbes d'engraissement (TVI)</b> cibles, et des <b>points de consigne CIELAB</b> par classe.`,
        ],
        illustration: 'ill-iso-family.svg',
        quiz: {
          q: 'ISO 12647-2 — la partie que les marques citent pour le packaging offset — définit :',
          options: [
            "Les volumes d'anilox pour la flexo",
            'Des classes de substrat (PS1–PS8), des courbes TVI et des points de consigne CIELAB',
            'Les angles de trame pour le toner numérique',
          ],
          answer: 1,
          ok: 'Oui — classes de substrat, TVI et consignes, par classe.',
          no: "C'est la partie offset : classes de substrat, courbes TVI, consignes CIELAB.",
        },
      },
      {
        kicker: 'Étape 2 · Comment l’utiliser',
        headline: "L'ISO est le plancher, pas la destination",
        paragraphs: [
          `Pas besoin de mémoriser les tableaux — il faut que vos empreintes y soient rattachées, et que tout écart soit délibéré. L'erreur courante est de traiter l'ISO comme la cible : le standard fixe le <b>plancher</b>, les exigences de marque sont plus serrées, et votre cible de production devrait l'être encore davantage, pour absorber la dérive et les écarts entre instruments.`,
        ],
        illustration: 'ill-floor.svg',
        quiz: {
          q: "Votre contrat dit ΔE00 < 2,0 et l'ISO en autoriserait plus. Où placer votre cible de production ?",
          options: [
            "À la tolérance ISO — c'est le standard officiel",
            'Exactement à 2,0 — pourquoi faire mieux que le contrat ?',
            'Plus serré que 2,0 — la marge absorbe la dérive et les écarts entre instruments',
          ],
          answer: 2,
          ok: 'Module validé — prévoyez le plancher, visez plus haut.',
          no: 'Visez plus serré que le contrat : la dérive et les écarts entre instruments grignoteront la marge.',
        },
      },
    ],
  },
  {
    index: 2,
    num: '03',
    title: 'M0, M1, M3 : conditions de mesure',
    time: '9 min',
    summary: 'Même feuille, illuminant différent, chiffre différent.',
    steps: [
      {
        kicker: 'Étape 1 · Pourquoi ces conditions existent',
        headline: 'Même feuille, chiffre différent',
        paragraphs: [
          `Chaque spectro lit sous un illuminant défini — et la plupart des papiers modernes contiennent des <b>azurants optiques (OBA)</b> qui fluorescent sous UV. <b>M1</b> (D50 + UV inclus) est le standard moderne : il lit la feuille comme la cabine de votre client la montre. <b>M0</b> est le tungstène historique ; <b>M2</b> (UV exclu) est surtout un diagnostic — l'écart M1−M2 sur le blanc papier <i>est</i> la signature des azurants.`,
        ],
        illustration: 'ill-oba.svg',
        quiz: {
          q: "Votre appareil portatif et le labo de la marque ne sont pas d'accord sur la même feuille. Que vérifiez-vous en premier ?",
          options: [
            "Le lot d'encre — il a dû dériver",
            'La condition de mesure (M0 vs M1) sur les deux instruments',
            'Rien — les labos ont toujours raison',
          ],
          answer: 1,
          ok: 'Exactement — des conditions discordantes créent une dérive fantôme.',
          no: 'Même condition des deux côtés ? À elle seule, M0 vs M1 peut expliquer l’écart.',
        },
      },
      {
        kicker: 'Étape 2 · La règle qui compte',
        headline: 'M3 est un outil de densité — jamais pour le G7',
        paragraphs: [
          `<b>M3 est polarisé</b> : il supprime le brillant de surface, donc l'encre fraîche se lit plus près du sec — un outil de <b>densité</b> côté presse. La règle critique : <b>n'utilisez jamais M3 pour une calibration G7 ni pour un contrôle ΔE face aux consignes ISO / GRACoL / FOGRA</b> — ces jeux de données sont mesurés sans polarisation (le G7 exige ISO 13655 M1). M3 pour doser l'encre ; M1 pour juger la couleur.`,
        ],
        illustration: 'm-conditions.svg',
        quiz: {
          q: 'Vous menez une calibration G7. Quelle condition de mesure ?',
          options: [
            'M3 — polarisé, il supprime le brillant',
            'M1 — D50 + UV, sans polariseur',
            "L'une ou l'autre — elles sont interchangeables",
          ],
          answer: 1,
          ok: 'Module validé — le G7, c’est du M1 sans polarisation.',
          no: 'Jamais M3 pour le G7 — les données de référence sont sans polarisation.',
        },
      },
    ],
  },
  {
    index: 3,
    num: '04',
    title: 'ΔE, ΔE00, densité : à quoi se fier',
    time: '9 min',
    summary: 'Trois chiffres, trois rôles différents.',
    steps: [
      {
        kicker: 'Étape 1 · Deux langages',
        headline: 'La densité bouge les clés. Le ΔE00 juge les contrats.',
        paragraphs: [
          `La <b>densité</b> lit un canal à la fois et répond directement à la clé d'encrage : haute → moins d'encre, basse → plus. C'est le langage de l'atelier. Le <b>ΔE00</b> est l'écart perceptuel par rapport à la cible — la métrique que les marques inscrivent dans les contrats (spec serrée : ΔE00 &lt; 2 sur les aplats ; un œil exercé repère ≈ 1–2 côte à côte).`,
        ],
        illustration: 'ill-density-de.svg',
        quiz: {
          q: 'Pourquoi les opérateurs travaillent-ils en densité alors que les specs de marque sont en ΔE00 ?',
          options: [
            'La densité est plus moderne que le ΔE00',
            "La densité répond directement au mouvement des clés d'encrage ; le ΔE00 correspond à ce que l'œil perçoit",
            'Ce sont la même mesure sous deux noms',
          ],
          answer: 1,
          ok: 'Oui — deux langages, deux rôles différents.',
          no: 'La densité pilote les clés, le ΔE00 juge la couleur.',
        },
      },
      {
        kicker: 'Étape 2 · Le pont',
        headline: 'Le closed-loop est le traducteur',
        paragraphs: [
          `Sur presse, l'opérateur travaille en densité car la densité répond aux clés. Le système qualité travaille en ΔE00 car c'est ce que dit le contrat. Le pont, c'est ce que le closed-loop automatise : <b>lire le ΔE00 vs la cible → décider quelles densités bouger → ajuster les clés</b> — de la même façon à chaque fois, avec une trace de données.`,
        ],
        illustration: 'closed-loop.svg',
        quiz: {
          q: 'Dans la boucle, que fait exactement la couche de décision ?',
          options: [
            "Elle approuve la feuille à l'œil, mais plus vite",
            "Elle compare le ΔE00 à la cible et traduit l'écart en mouvements de clés (densité)",
            'Elle remplace entièrement le pupitre de la presse',
          ],
          answer: 1,
          ok: 'Module validé — ΔE00 en entrée, mouvements de densité en sortie.',
          no: 'Mesurer le ΔE00 vs la cible → décider les mouvements de densité → actionner.',
        },
      },
    ],
  },
  {
    index: 4,
    num: '05',
    title: 'G7, GRACoL, FOGRA',
    time: '8 min',
    summary: 'Trois noms que vous entendrez, un objectif commun.',
    steps: [
      {
        kicker: "Étape 1 · L'idée du G7",
        headline: 'Neutralisez les gris, le gamut suit',
        paragraphs: [
          `Le <b>G7</b> est une méthodologie de calibration (Idealliance). Son ancrage, c'est l'<b>équilibre des gris</b> : si les gris CMJ neutralisent et que la courbe de densité du neutre atteint la cible, le reste du gamut suit. Indépendant du procédé — offset, flexo, numérique — et l'équilibre des gris est le mode de défaillance le plus <i>visible</i>, d'où sa force comme ancrage.`,
        ],
        illustration: 'ill-gray-balance.svg',
        quiz: {
          q: "Quel est l'ancrage de la méthodologie de calibration G7 ?",
          options: [
            'La densité maximale des aplats',
            "L'équilibre des gris et la courbe de densité du neutre",
            'Le nuancier PANTONE de la marque',
          ],
          answer: 1,
          ok: 'Correct — neutralisez les gris et le gamut suit.',
          no: "Le G7 s'ancre sur l'équilibre des gris.",
        },
      },
      {
        kicker: 'Étape 2 · Le paysage',
        headline: "Choisissez-en une. Documentez-la. N'en changez pas en cours de projet.",
        paragraphs: [
          `<b>GRACoL 2013</b> (CGATS.21) est la caractérisation US pour l'offset feuille premium, souvent associée au G7. Les jeux <b>FOGRA</b> (39, 51, 52, 55) caractérisent les conditions européennes conformes à l'ISO 12647-2. Les deux sont valables. Le plus important, c'est d'en <i>avoir</i> une, documentée et maîtrisée — pas laquelle.`,
        ],
        illustration: 'ill-standards-map.svg',
        quiz: {
          q: 'En cours de projet, un collègue propose de passer des consignes FOGRA51 à GRACoL « parce que la presse semble plus proche ». Vous…',
          options: [
            "Changez — plus proche, c'est mieux",
            'Refusez : changer de méthodologie en cours de projet casse la référence client et sa confiance',
            'Faites la moyenne des deux jeux de consignes',
          ],
          answer: 1,
          ok: 'Cours terminé 🎓 — vous parlez la couleur d’atelier maintenant.',
          no: 'Ne changez jamais en cours de projet — terminez sur la référence approuvée.',
        },
      },
    ],
  },
];

export default modules;
