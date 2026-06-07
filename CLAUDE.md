# Rutherford.fr — project guide for Claude

You're working on the Rutherford.fr public website (Next.js 14 App Router, multilingual via `useLanguage` provider). This file is the source of truth for **brand voice, tone, terminology, and translations** across all locales (en / fr / de / it / es).

When writing, editing, or translating anything user-facing, follow this guide before reaching for general translation conventions.

---

## 1. Business context

Rutherford.fr is a French / European company specializing in **closed-loop color management for offset and flexo printing**. Audience: printers, packaging converters, brand owners, decision-makers in graphic arts.

Sister company: **Veoria** (industrial printing technology, inline color control for label printing).

Software platform: **ColorLoop** (sometimes called **ColorLoop Connect**) — Rutherford's modern offset production software.

Long-time **X-Rite PANTONE partner**. Compatible with **MeasureColor** and **IntelliTrax2** measurement tools.

The company has been operating for 25+ years, in 30+ countries, with 1,000+ deployed systems.

---

## 2. Brand names — NEVER translate or alter

These are product / company names. Always keep exact spelling and casing across every locale.

- **Rutherford**, **Rutherford.fr**
- **ColorLoop**, **ColorLoop.ai**, **ColorLoop Connect**
- **EasySet**, **EasyLoop** (Rutherford's operator-driven presetting / closed-loop line, pre-ColorLoop)
- **Veoria**, **Veoria.fr** (lowercase `.fr`)
- **MeasureColor**
- **IntelliTrax2**, **IntelliTrax** (older model)
- **X-Rite**, **X-Rite PANTONE**, **PANTONE**
- **GMG**, **Esko**, **Equinox**, **CIP3**, **CIP4**, **IntelliLoop**
- **PPWR**, **DPP** (EU regulations — always uppercase, never translated)

Press / equipment manufacturers also stay verbatim: **Heidelberg**, **Komori**, **Koenig & Bauer**, **Manroland**, **Mitsubishi**, **Ryobi**, **Goss**, **Presstek**.

Client names also stay verbatim: **Avery Dennison**, **DS Smith**, **Huhtamaki**, **MM Packaging**, **Printwell**, **WestRock**, **Yuto**, **LEFRANCQ**, **Wauters B'Pack**, **Viappiani**, **Autajon**, **GS Monaco**, **Forbes Monaco**, **Moderna Printing**, **ColorConsulting**.

---

## 3. Tone & voice

- **Industrial B2B**, professional, confident, no startup buzzwords. Avoid "disrupt", "revolutionary", "next-gen", "game-changer", "unleash", "leverage", "synergy".
- **Concrete**, outcome-driven: speak in terms of makeready time, waste reduction, color accuracy, production stability.
- **Plural / formal address** by default in all locales:
  - **fr** → vouvoiement (`vous`), never `tu`. Prefer impersonal turns when neutral ("Décrivez votre console" rather than "vous décrivez").
  - **de** → Sie-Form, never du.
  - **it** → Lei (or impersonal); never `tu`.
  - **es** → usted; never `tú`.
- **No emoji clutter**. The 🌱 in the hero kicker is the only intentional one — don't add others without explicit ask.

---

## 4. Terminology glossary — keep these consistent everywhere

The English term in **bold** is the source. Use the locale row below it; don't substitute synonyms.

### Color & process

| EN                          | FR                                     | DE                              | IT                                  | ES                                    |
|-----------------------------|----------------------------------------|---------------------------------|-------------------------------------|---------------------------------------|
| **offset (printing)**       | offset                                 | Offsetdruck                     | offset                              | offset                                |
| **flexo (printing)**        | flexo                                  | Flexodruck                      | flexo                               | flexografía / flexo                   |
| **closed-loop**             | closed-loop *(keep EN)*                | Closed-Loop *(keep EN)*         | closed-loop *(keep EN)*             | closed-loop *(keep EN)*               |
| **color management**        | gestion de la couleur                  | Farbmanagement                  | gestione del colore                 | gestión del color                     |
| **color control**           | contrôle couleur (or contrôle de la couleur) | Farbsteuerung / Farbkontrolle | controllo colore                    | control del color                     |
| **color consistency**       | constance couleur                      | Farbkonstanz                    | consistenza colore                  | consistencia del color                |
| **color accuracy**          | précision couleur                      | Farbgenauigkeit                 | precisione colore                   | precisión del color                   |
| **color drift**             | dérive couleur                         | Farbabweichung                  | deriva colore                       | deriva del color                      |
| **spot color**              | couleur d'accompagnement / ton direct  | Sonderfarbe                     | tinta piatta                        | tinta directa                         |
| **extended gamut**          | gamme étendue                          | erweiterter Farbraum            | gamma estesa                        | gama extendida                        |
| **DeltaE / ΔE**             | DeltaE                                 | DeltaE                          | DeltaE                              | DeltaE                                |
| **calibration**             | calibration                            | Kalibrierung                    | calibrazione                        | calibración                           |

### Press & production

| EN                          | FR                                     | DE                              | IT                                  | ES                                    |
|-----------------------------|----------------------------------------|---------------------------------|-------------------------------------|---------------------------------------|
| **press (the machine)**     | presse                                 | Druckmaschine *(or Presse)*     | macchina (da stampa)                | prensa                                |
| **pressroom**               | atelier d'impression / atelier         | Druckerei *(the room/shop)*     | pressroom *(stays EN)* / sala stampa | sala de prensa / pressroom *(EN ok)*  |
| **press console**           | console (presse) / pupitre de commande | Druckpult / Bedienpult          | pulpito di stampa / console         | consola de prensa / pupitre           |
| **printer (the company/operator)** | imprimeur                       | Drucker / Druckerei *(company)* | stampatore                          | impresor                              |
| **converter (packaging)**   | converter (packaging)                  | Verpackungsverarbeiter / Verarbeiter | converter / converter packaging | convertidor / converter               |
| **brand owner**             | marque / annonceur                     | Markeninhaber                   | brand                               | marca / propietario de marca          |
| **makeready**               | calage                                 | Einrichten                      | avviamento                          | puesta a punto                        |
| **makeready waste**         | gâche au calage                        | Einrichtungs-Makulatur          | scarto di avviamento                | desperdicio de puesta a punto         |
| **waste (paper/ink)**       | gâche                                  | Makulatur                       | scarto                              | desperdicio (de papel/tinta)          |
| **setup time**              | temps de calage                        | Einrichtungszeit                | tempo di avviamento                 | tiempo de puesta a punto              |
| **rerun**                   | relance                                | Nachdruck                       | riavvio / ristampa                  | rerun / reimpresión                   |
| **shift**                   | équipe                                 | Schicht                         | turno                               | turno                                 |
| **sheetfed offset**         | offset feuille à feuille               | Bogenoffset                     | offset foglio                       | offset pliego                         |
| **web offset**              | offset rotative                        | Rollenoffset                    | offset bobina                       | offset rotativa                       |
| **ink keys**                | clés d'encrage                         | Farbzonenschrauben              | chiavi di inchiostro                | llaves de tinta                       |
| **ink zone**                | zone d'encrage                         | Farbzone                        | zona di inchiostro                  | zona de tinta                         |
| **paper / substrate**       | papier / substrat                      | Papier / Bedruckstoff           | carta / supporto                    | papel / sustrato                      |
| **plate**                   | plaque                                 | Druckplatte                     | lastra                              | placa                                 |
| **measurement device**      | dispositif de mesure                   | Messgerät                       | dispositivo di misura               | dispositivo de medición               |

### Workflow & business

| EN                          | FR                                     | DE                              | IT                                  | ES                                    |
|-----------------------------|----------------------------------------|---------------------------------|-------------------------------------|---------------------------------------|
| **workflow**                | workflow *(keep EN)*                   | Workflow *(keep EN)*            | workflow *(keep EN)*                | flujo de trabajo / workflow           |
| **production standard**     | standard de production                 | Produktionsstandard             | standard di produzione              | estándar de producción                |
| **standardization**         | standardisation                        | Standardisierung                | standardizzazione                   | estandarización                       |
| **repeatability**           | répétabilité                           | Wiederholbarkeit                | ripetibilità                        | repetibilidad                         |
| **traceability**            | traçabilité                            | Rückverfolgbarkeit              | tracciabilità                       | trazabilidad                          |
| **compliance**              | conformité                             | Konformität                     | conformità                          | conformidad                           |
| **audit**                   | audit                                  | Audit                           | audit                               | auditoría                             |
| **case study / testimonial**| cas client / témoignage                | Referenz / Testimonial          | case study / testimonianza          | caso práctico / testimonio            |
| **deploy / deployment**     | déployer / déploiement                 | bereitstellen / Bereitstellung  | implementare / installazione        | desplegar / despliegue                |
| **rollout**                 | déploiement                            | Rollout                         | rollout                             | despliegue                            |
| **assessment / qualification** | qualification / évaluation          | Qualifizierung / Bewertung      | qualificazione / valutazione        | cualificación / evaluación            |

### Regulations & ecology

| EN                          | FR                                     | DE                              | IT                                  | ES                                    |
|-----------------------------|----------------------------------------|---------------------------------|-------------------------------------|---------------------------------------|
| **PPWR**                    | PPWR                                   | PPWR                            | PPWR                                | PPWR                                  |
| **DPP** (Digital Product Passport) | passeport produit numérique     | Digitaler Produktpass           | passaporto digitale di prodotto     | pasaporte digital de producto         |
| **recycled content**        | contenu recyclé                        | Recyclinganteil                 | contenuto riciclato                 | contenido reciclado                   |
| **recyclability**           | recyclabilité                          | Recyclingfähigkeit              | riciclabilità                       | reciclabilidad                        |
| **ink, paper and energy**   | encre, papier et énergie               | Farbe, Papier und Energie       | inchiostro, carta ed energia        | tinta, papel y energía                |

---

## 5. Translations to avoid

These are common machine-translation pitfalls that show up on the live site or might creep in.

### French
- ❌ "imprimante" when talking about the company / operator → ✅ **imprimeur**
- ❌ "imprimante offset" for the machine → ✅ **presse offset**
- ❌ "déchet" for paper waste → ✅ **gâche**
- ❌ "réglage" for makeready → ✅ **calage**
- ❌ "tu / ton / ta" → use **vous / votre** (vouvoiement industriel)
- ❌ "scaler" → ✅ **passer à l'échelle**, OR keep "scaler" only if surrounded by tech vocab
- ❌ "scrap" → ✅ **gâche**
- ❌ "feuilles vendables" sounds odd in solo → prefer "feuilles bonnes" or "production conforme" depending on context

### German
- ❌ "Drucker" (= the person/printer machine confusion) → use **Druckerei** for the company, **Druckmaschine** for the machine, **Bediener** for the operator
- ❌ "Verschwendung" for makeready waste → ✅ **Makulatur**
- ❌ "Du / Dein" → ✅ **Sie / Ihr**
- ❌ "Setup" alone for makeready → ✅ **Einrichten / Einrichtung**
- ❌ "Effizienz steigern" overused → vary with **optimieren**, **verbessern**, **stabiler machen**

### Italian
- ❌ "stampante" for the company / press → ✅ **stampatore** / **macchina da stampa**
- ❌ "rifiuto" / "spreco" for makeready waste → ✅ **scarto**
- ❌ "tu / tuo" → ✅ **Lei / Suo** or impersonale
- ❌ "set up" anglicismo per makeready → ✅ **avviamento**

### Spanish
- ❌ "impresora" (printer the device) when talking about the company / operator → ✅ **impresor**
- ❌ "residuo" / "desperdicio de papel" indistinctly → ✅ **gâche / desperdicio de puesta a punto** (specifically for makeready waste)
- ❌ "tú / tuyo" → ✅ **usted / su**
- ❌ "rerun" leave in Latin-America contexts is fine; in Spain → **reimpresión**

---

## 6. Standard messages — phrase library

When the same idea reappears across pages, use these consistent phrasings.

### Hero / value props

| EN | FR | DE | IT | ES |
|----|----|----|----|----|
| Improve color control | Améliorer le contrôle couleur | Farbsteuerung verbessern | Migliorare il controllo colore | Mejorar el control del color |
| Reduce makeready waste | Réduire la gâche au calage | Makulatur beim Einrichten reduzieren | Ridurre lo scarto di avviamento | Reducir el desperdicio de puesta a punto |
| Save ink, paper and energy | Économisez encre, papier et énergie | Farbe, Papier und Energie sparen | Risparmia inchiostro, carta ed energia | Ahorre tinta, papel y energía |
| Closed-loop workflow expertise | Expertise closed-loop | Closed-Loop-Workflow-Expertise | Expertise closed-loop | Experiencia closed-loop |

### CTAs

| EN | FR | DE | IT | ES |
|----|----|----|----|----|
| Request console validation | Demander une validation console | Konsolenvalidierung anfragen | Richiedi validazione console | Solicitar validación de consola |
| Request an audit | Demander un audit | Audit anfragen | Richiedi un audit | Solicitar una auditoría |
| Discover ColorLoop | Découvrir ColorLoop | ColorLoop entdecken | Scopri ColorLoop | Descubrir ColorLoop |
| Talk to an expert | Parlez à un expert | Sprechen Sie mit einem Experten | Parla con un esperto | Hable con un experto |
| Read the blog | Lire le blog | Blog lesen | Leggi il blog | Leer el blog |
| Watch testimonial | Voir le témoignage | Testimonial ansehen | Guarda il video | Ver testimonio |
| Back to home | Retour à l'accueil | Zurück zur Startseite | Torna alla home | Volver al inicio |

---

## 7. When in doubt

- Prefer the **technical / industrial** term over the marketing one.
- Stay close to the EN source semantically, but write **idiomatically** in the target locale (don't translate word-for-word).
- If the EN term is a de-facto industry standard (closed-loop, workflow, makeready, color management, DeltaE), check this guide before translating — sometimes leaving it in EN is the right call (closed-loop, DeltaE always; workflow and makeready depending on context).
- Brand and product names are **never translated, never reformatted**.

---

## 8. Style notes (non-translation)

- **Sentence case** for headlines: only the first word + proper nouns capitalized (the brand explainer headline "L'expertise, le logiciel et la technologie derrière Rutherford" is correct).
- **Numbers**: use the locale's thousand separator (1,000 EN / 1 000 FR / 1.000 DE/IT/ES).
- **Quotes**: use locale-appropriate marks where possible — `« … »` (FR), `„ … "` (DE), `« … »` or `" … "` (IT), `« … »` or `" … "` (ES). Never mix.
- **Em-dash style**: use a real `—` (U+2014) with a space on each side. The website already does this consistently.

---

When asked to translate or rewrite copy, **load the relevant glossary row first**, check for the avoid-list pitfalls, then write in the project's existing tone. If a term is missing from this guide and matters for the message, propose an addition rather than guessing silently.
