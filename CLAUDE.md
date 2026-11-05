# Rutherford.fr — project guide for Claude

You're working on the Rutherford.fr public website (Next.js 14 App Router, multilingual via `useLanguage` provider). This file is the source of truth for **brand voice, tone, terminology, and translations** across all locales (en / fr / de / it / es / pt).

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
  - **es** → usted; never `tú` (Spain Spanish: avoid LatAm-only forms such as « día hábil », « Algo salió mal »).
  - **pt** → European Portuguese (pt-PT): formal third person (« o seu / a sua »), never `tu`; no Brazilian forms (equipa, ecrã, ficheiro, telemóvel — not equipe, tela, arquivo, celular).
  - **it, details** → body copy in Lei with a lowercase courtesy pronoun (« la sua macchina »), never `voi` / `vostro` and never `tu / tuo / ti`. Short CTA imperatives (Scopri, Richiedi, Calcola, Verifica) are an accepted UI convention, but never combine a `tu` imperative with a possessive in the same string — use a noun form instead (« Calcola il risparmio », « Verifica gratuita dell'idoneità »).
  - **fr** → « closed-loop » always keeps its hyphen (never « closed loop »).
- **No emoji clutter**. The 🌱 in the hero kicker is the only intentional one — don't add others without explicit ask.

---

## 4. Terminology glossary — keep these consistent everywhere

The English term in **bold** is the source. Use the locale row below it; don't substitute synonyms.

### Color & process

| EN                          | FR                                     | DE                              | IT                                  | ES                                    | PT |
|-----------------------------|----------------------------------------|---------------------------------|-------------------------------------|---------------------------------------|----|
| **offset (printing)**       | offset                                 | Offsetdruck                     | offset                              | offset                                | offset |
| **flexo (printing)**        | flexo                                  | Flexodruck                      | flexo                               | flexografía / flexo                   | flexografia / flexo |
| **closed-loop**             | closed-loop *(keep EN)*                | Closed-Loop *(keep EN)*         | closed-loop *(keep EN)*             | closed-loop *(keep EN)*               | closed-loop *(keep EN)* |
| **color management**        | gestion de la couleur                  | Farbmanagement                  | gestione del colore                 | gestión del color                     | gestão da cor |
| **color control**           | contrôle couleur (or contrôle de la couleur) | Farbsteuerung / Farbkontrolle | controllo colore                    | control del color                     | controlo de cor |
| **color consistency**       | constance couleur                      | Farbkonstanz                    | consistenza colore                  | consistencia del color                | consistência de cor |
| **color accuracy**          | précision couleur                      | Farbgenauigkeit                 | precisione colore                   | precisión del color                   | precisão de cor |
| **color drift**             | dérive couleur                         | Farbabweichung                  | deriva colore                       | deriva del color                      | deriva de cor |
| **spot color**              | couleur d'accompagnement / ton direct  | Sonderfarbe                     | tinta piatta                        | tinta directa                         | cor direta |
| **extended gamut**          | gamme étendue                          | erweiterter Farbraum            | gamma estesa                        | gama extendida                        | gama estendida |
| **DeltaE / ΔE**             | DeltaE                                 | DeltaE                          | DeltaE                              | DeltaE                                | DeltaE |
| **calibration**             | calibration                            | Kalibrierung                    | calibrazione                        | calibración                           | calibração |
| **closed-loop color control** | contrôle couleur closed-loop          | Closed-Loop-Farbregelung *(Regelung = closed loop; Farbsteuerung for generic color control)* | controllo colore closed-loop | control del color closed-loop | controlo de cor closed-loop |
| **dot gain / TVI**          | engraissement                          | Tonwertzunahme                  | aumento del valore tonale           | ganancia de punto                     | ganho de ponto |

### Press & production

| EN                          | FR                                     | DE                              | IT                                  | ES                                    | PT |
|-----------------------------|----------------------------------------|---------------------------------|-------------------------------------|---------------------------------------|----|
| **press (the machine)**     | presse                                 | Druckmaschine / Maschine *(avoid Presse: it reads as "the media")* | macchina (da stampa)                | prensa                                | máquina (de impressão) *(never prensa / impressora)* |
| **pressroom**               | atelier d'impression / atelier         | Drucksaal *(Druckerei = the company; never Druckraum)* | sala stampa                         | sala de prensa                        | sala de impressão |
| **press console**           | console (presse) / pupitre de commande | Druckpult / Bedienpult          | pulpito di stampa / console         | consola de prensa / pupitre           | consola (da máquina) |
| **printer (the company/operator)** | imprimeur                       | Drucker / Druckerei *(company)* | stampatore                          | impresor                              | gráfica *(company)* / impressor *(operator)* |
| **converter (packaging)**   | converter (packaging)                  | Verpackungsverarbeiter / Verarbeiter | converter / converter packaging | convertidor                           | transformador de embalagem |
| **brand owner**             | marque / annonceur                     | Markeninhaber                   | brand                               | marca / propietario de marca          | marca / dono da marca |
| **makeready**               | calage                                 | Einrichten                      | avviamento                          | puesta a punto                        | acerto |
| **makeready waste**         | gâche au calage                        | Einrichtungs-Makulatur          | scarto di avviamento                | desperdicio de puesta a punto         | maculatura de acerto |
| **waste (paper/ink)**       | gâche                                  | Makulatur                       | scarto                              | desperdicio (de papel/tinta)          | maculatura *(paper)* / desperdício *(generic)* |
| **setup time**              | temps de calage                        | Einrichtungszeit                | tempo di avviamento                 | tiempo de puesta a punto              | tempo de acerto |
| **rerun**                   | relance                                | Nachdruck                       | riavvio / ristampa                  | rerun / reimpresión                   | reimpressão |
| **shift**                   | équipe                                 | Schicht                         | turno                               | turno                                 | turno |
| **sheetfed offset**         | offset feuille à feuille               | Bogenoffset                     | offset foglio                       | offset pliego                         | offset de folha |
| **web offset**              | offset rotative                        | Rollenoffset                    | offset bobina                       | offset rotativa                       | offset de bobina |
| **ink keys**                | clés d'encrage / vis d'encrier *(both used in the pressroom; vis d'encrier preferred in technical text)* | Farbzonenschrauben              | chiavi di inchiostro                | llaves de tinta                       | chaves de tinta |
| **ink zone**                | zone d'encrage                         | Farbzone                        | zona di inchiostro                  | zona de tinta                         | zona de tinta |
| **paper / substrate**       | papier / substrat                      | Papier / Bedruckstoff           | carta / supporto                    | papel / sustrato                      | papel / suporte |
| **plate**                   | plaque                                 | Druckplatte                     | lastra                              | plancha                               | chapa |
| **measurement device**      | dispositif de mesure                   | Messgerät                       | dispositivo di misura               | dispositivo de medición               | equipamento de medição |
| **ink presetting**          | préréglage d'encrage *(never presetting)* | Farbvoreinstellung           | preimpostazione inchiostro          | preajuste de tinta                    | pré-ajuste de tinta |
| **OK sheet / press OK**     | bon à rouler *(BAT is prepress proof only)* | OK-Bogen                    | foglio OK                           | pliego OK *(never BAT)*               | folha OK *(never BAT)* |
| **good / saleable sheet**   | bonne feuille *(never feuille vendable)* | Gutbogen                      | foglio buono *(never foglio vendibile)* | pliego bueno                       | folha boa *(never folha vendável)* |
| **color bar**               | bande de contrôle                      | Kontrollstreifen                | barra di controllo                  | barra de control                      | barra de controlo |
| **press operator**          | conducteur                             | Maschinenführer / Bediener      | macchinista / operatore             | maquinista                            | impressor / operador |
| **commercial offset**       | offset de labeur                       | Akzidenzdruck                   | stampa commerciale                  | impresión comercial                   | impressão comercial |
| **desktop (instrument)**    | de table                               | Tisch-                          | da banco                            | de sobremesa                          | de bancada *(never de secretária)* |
| **retrofit**                | retrofit                               | Nachrüstung                     | retrofit                            | retrofit                              | retrofit |

### Workflow & business

| EN                          | FR                                     | DE                              | IT                                  | ES                                    | PT |
|-----------------------------|----------------------------------------|---------------------------------|-------------------------------------|---------------------------------------|----|
| **workflow**                | workflow *(keep EN)*                   | Workflow *(keep EN)*            | workflow *(keep EN)*                | flujo de trabajo / workflow           | workflow *(keep EN)* |
| **production standard**     | standard de production                 | Produktionsstandard             | standard di produzione              | estándar de producción                | padrão de produção |
| **standardization**         | standardisation                        | Standardisierung                | standardizzazione                   | estandarización                       | padronização |
| **repeatability**           | répétabilité                           | Wiederholbarkeit                | ripetibilità                        | repetibilidad                         | repetibilidade |
| **traceability**            | traçabilité                            | Rückverfolgbarkeit              | tracciabilità                       | trazabilidad                          | rastreabilidade |
| **compliance**              | conformité                             | Konformität                     | conformità                          | conformidad                           | conformidade |
| **audit**                   | audit                                  | Audit                           | audit                               | auditoría                             | auditoria |
| **case study / testimonial**| cas client / témoignage                | Referenz / Testimonial          | case study / testimonianza          | caso práctico / testimonio            | caso de sucesso / testemunho |
| **deploy / deployment**     | déployer / déploiement                 | bereitstellen / Bereitstellung  | implementare / installazione        | desplegar / despliegue                | instalar / instalação *(systems)*, implementar *(software)* |
| **rollout**                 | déploiement                            | Rollout                         | rollout                             | despliegue                            | implementação |
| **assessment / qualification** | qualification / évaluation          | Qualifizierung / Bewertung      | qualificazione / valutazione        | cualificación / evaluación            | qualificação / avaliação |
| **(press) eligibility**     | éligibilité / compatibilité            | Eignung                         | idoneità                            | compatibilidad / apta *(never elegible)* | compatibilidade / apta |

### Regulations & ecology

| EN                          | FR                                     | DE                              | IT                                  | ES                                    | PT |
|-----------------------------|----------------------------------------|---------------------------------|-------------------------------------|---------------------------------------|----|
| **PPWR**                    | PPWR                                   | PPWR                            | PPWR                                | PPWR                                  | PPWR |
| **DPP** (Digital Product Passport) | passeport produit numérique     | Digitaler Produktpass           | passaporto digitale di prodotto     | pasaporte digital de producto         | passaporte digital de produto |
| **recycled content**        | contenu recyclé                        | Recyclinganteil                 | contenuto riciclato                 | contenido reciclado                   | conteúdo reciclado |
| **recyclability**           | recyclabilité                          | Recyclingfähigkeit              | riciclabilità                       | reciclabilidad                        | reciclabilidade |
| **ink, paper and energy**   | encre, papier et énergie               | Farbe, Papier und Energie       | inchiostro, carta ed energia        | tinta, papel y energía                | tinta, papel e energia |

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

### French (additional)
- ❌ "presetting" → ✅ **préréglage (d'encrage)**
- ❌ "BAT presse OK" for press OK → ✅ **bon à rouler**
- ❌ "aux US" → ✅ **aux États-Unis**

### German (additional)
- ❌ "Presse" for the machine → ✅ **Druckmaschine / Maschine**
- ❌ "Druckraum" → ✅ **Drucksaal**
- ❌ Swiss "ss" (grosse, heisst) → ✅ **ß** (große, heißt)
- Compounds with a brand take a hyphen: **ColorLoop-Software**, **Rutherford-Experte**

### Italian (additional)
- ❌ "fustella" for a carton → ✅ **astuccio** (fustella = the cutting die)
- ❌ "referenza" (color reference) → ✅ **riferimento**
- ❌ "BAT" → ✅ **foglio OK**

### Spanish
- ❌ "impresora" (printer the device) when talking about the company / operator → ✅ **impresor**
- ❌ "residuo" / "desperdicio de papel" indistinctly → ✅ **gâche / desperdicio de puesta a punto** (specifically for makeready waste)
- ❌ "tú / tuyo" → ✅ **usted / su**
- ❌ "rerun" leave in Latin-America contexts is fine; in Spain → **reimpresión**
- ❌ "elegible / elegibilidad" (calque of eligible) → ✅ **apta / compatibilidad**
- ❌ "BAT", "pilotaje" (French leftovers) → ✅ **pliego OK**, **control / gestión**

### Portuguese (pt-PT)
- ❌ "prensa" / "impressora" for the machine → ✅ **máquina (de impressão)**
- ❌ "teclas de tinta" / "tinteiros" for ink keys → ✅ **chaves de tinta** (tinteiro = the ink fountain; « tinteiros » = printer cartridges in search)
- ❌ "relance" for rerun (= a glance) → ✅ **reimpressão**
- ❌ "BAT", "custo carregado", "construtor" (French calques) → ✅ **folha OK**, **custo horário completo**, **fabricante**
- Compounds in -alvo / -chave take a hyphen: **cor-alvo**, **valores-alvo**, **variável-chave**

---

## 6. Standard messages — phrase library

When the same idea reappears across pages, use these consistent phrasings.

### Hero / value props

| EN | FR | DE | IT | ES | PT |
|----|----|----|----|----|----|
| Improve color control | Améliorer le contrôle couleur | Farbsteuerung verbessern | Migliorare il controllo colore | Mejorar el control del color | Melhorar o controlo de cor |
| Reduce makeready waste | Réduire la gâche au calage | Makulatur beim Einrichten reduzieren | Ridurre lo scarto di avviamento | Reducir el desperdicio de puesta a punto | Reduzir a maculatura de acerto |
| Save ink, paper and energy | Économisez encre, papier et énergie | Farbe, Papier und Energie sparen | Risparmia inchiostro, carta ed energia | Ahorre tinta, papel y energía | Poupe tinta, papel e energia |
| Closed-loop workflow expertise | Expertise closed-loop | Closed-Loop-Workflow-Expertise | Expertise closed-loop | Experiencia closed-loop | Experiência closed-loop |

### CTAs

| EN | FR | DE | IT | ES | PT |
|----|----|----|----|----|----|
| Request console validation | Demander une validation console | Konsolenvalidierung anfragen | Richiedi validazione console | Solicitar validación de consola | Solicitar uma validação de consola |
| Request an audit | Demander un audit | Audit anfragen | Richiedi un audit | Solicitar una auditoría | Solicitar uma auditoria |
| Discover ColorLoop | Découvrir ColorLoop | ColorLoop entdecken | Scopri ColorLoop | Descubrir ColorLoop | Descobrir o ColorLoop |
| Talk to an expert | Parlez à un expert | Sprechen Sie mit einem Experten | Parla con un esperto | Hable con un experto | Fale com um especialista |
| Read the blog | Lire le blog | Blog lesen | Leggi il blog | Leer el blog | Ler o blog |
| Watch testimonial | Voir le témoignage | Testimonial ansehen | Guarda il video | Ver testimonio | Ver o testemunho |
| Back to home | Retour à l'accueil | Zurück zur Startseite | Torna alla home | Volver al inicio | Voltar ao início |

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
- **Quotes**: use locale-appropriate marks where possible — `« … »` with inner spaces (FR), `„ … "` (DE), `«…»` without inner spaces or `" … "` (IT), `«…»` without inner spaces (ES), `«…»` or `" … "` (PT). Never mix.
- **Apostrophes**: typographic `’` in all locales; don't mix with straight `'` inside one locale.
- **Percent**: `45 %` with a (non-breaking) space in FR / DE / ES / PT; `45%` with no space in IT and EN.
- **Em-dash style**: use a real `—` (U+2014) with a space on each side. The website already does this consistently.

---

When asked to translate or rewrite copy, **load the relevant glossary row first**, check for the avoid-list pitfalls, then write in the project's existing tone. If a term is missing from this guide and matters for the message, propose an addition rather than guessing silently.
