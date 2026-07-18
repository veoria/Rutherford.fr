# Brief — Refonte de l'espace compte & de l'admin

**Date : 18 juillet 2026 — Statut : draft à annoter — Périmètre : `/account/*`, `/admin/*`, API associées**

Ce brief consolide une revue complète de la zone compte (14 routes, ~8 400 lignes de composants, 9 routes API) et de l'admin (~2 700 lignes). Il est organisé en trois problèmes structurants qui appellent une refonte, puis en corrections indépendantes (sécurité, bugs, textes) qui peuvent partir tout de suite, et se termine par un découpage en lots et les décisions à trancher.

---

## 1. Constat global

L'espace compte a grandi par accrétion : Academy d'abord, puis le hub partenaire, puis les organisations/équipes, puis les sites (usines) et les systèmes installés, puis l'admin. Chaque couche est cohérente isolément, mais trois défauts de conception traversent l'ensemble :

1. **Un seul espace pour quatre métiers.** Le système connaît quatre types de comptes (`client`, `reseller`, `distributor`, `team`) mais presque tous les référentiels, formulaires et sections d'interface sont pensés pour l'imprimeur et servis tels quels aux trois autres profils.
2. **Deux sources de vérité pour « la société »** : `profiles.company` (texte libre) et `profiles.organization_id` (relation), jamais synchronisées, avec des surfaces qui lisent l'une ou l'autre.
3. **Un admin mono-composant** : six onglets en `useState` dans un seul fichier, sans URL, sans drill-down, avec des modales qui contiennent des workflows entiers et des mutations silencieuses.

---

## 2. Problème structurant n° 1 — Un espace, quatre métiers

### 2.1 Constat

Le code ne possède qu'un aiguillage binaire « team / tous les autres », à chaque étage :

| Référentiel | Où | Problème |
|---|---|---|
| Poste (« Conducteur de presse », « Prépresse »…) | `data/onboarding-options.ts:5-15`, formulaires `onboarding-form.tsx:381-386`, `account-profile.tsx:975-985` | Servi à l'identique aux revendeurs et distributeurs. Un commercial X-Rite doit se déclarer « Conducteur de presse ». |
| Poste — validation serveur | `app/api/account/onboarding/route.ts:36-66`, `app/api/account/profile/route.ts:52-88` | Le serveur **exige** un poste imprimerie pour tout compte non-team. Aucune contrainte en base (`job_title` texte libre, migration `20260605_onboarding.sql`). |
| Poste — admin | `admin-dashboard.tsx:270-280`, `admin-user-detail.tsx:201-210`, `app/api/admin/users/route.ts:49-53` | L'admin ne propose **que** les postes imprimerie : le rôle interne d'un membre de l'équipe est invisible (« — »), non modifiable, et un enregistrement du tiroir l'écrase. |
| Sites / « usines » | `20260704_sites.sql:19-22` (aucune restriction de type), tiroir org `admin-dashboard.tsx:1388-1390`, hub `account-hub.tsx:756` | Une org revendeur ou X-Rite peut recevoir des « usines » et des systèmes sous licence ; ses membres voient « Mon système / Toutes les usines ». |
| « Mes presses » | `account-hub.tsx:759`, données `app/account/page.tsx:59-63` | Rendu inconditionnel : un revendeur qui a soumis des validations **pour ses clients** les voit comme « Mes machines », avec des CTA à la première personne (« Connecter mes presses »). |
| Tuile Console | `account-hub.tsx:557`, libellé FR `:224` | « Vos validations de presse » affichée aux quatre types, y compris team. |
| Rangs Academy | `account-hub.tsx:101-108` | « Apprenti → Opérateur → Coloriste → Expert couleur → Maître closed-loop » pour tout le monde, y compris commerciaux et distributeurs. Aucun ciblage par rôle dans `data/academy-courses.ts`. |
| Placeholders société | `onboarding-form.tsx:40` etc. | « Imprimerie Dupont / Acme Printing » proposé aux inscriptions revendeur/distributeur. |
| Vocabulaire « partenaire » | `account-profile.tsx:56…`, `account-team.tsx:44…` | « Espace partenaire » codé en dur pour tous, y compris clients directs et équipe — alors que `data/account-eyebrow.ts:6-13` fait déjà la distinction pour la sous-nav. Deux conventions concurrentes. |

À noter aussi, côté modèle : Pipedrive mappe les étiquettes « Reseller / OEM / **Distributor** » vers `reseller` (`lib/pipedrive.ts:303-316`) ; le type `distributor` est réservé en dur au domaine `@xrite.com` (`lib/account-type.ts:52`). Un second distributeur est aujourd'hui impossible, et le co-branding distributeur a le logo X-Rite codé en dur (`account-hub.tsx:640`).

### 2.2 Cible proposée

**a) Quatre référentiels de postes** dans `data/onboarding-options.ts`, sélectionnés par `account_type`, validés côté API par type, avec contrainte (ou validation) en base :

- **client** — inchangé : Conducteur de presse, Prépresse / Photogravure, Responsable de production, Qualité / Responsable couleur, Achats, Direction, Marque / Acheteur packaging, Commercial / Marketing, Autre.
- **reseller** (nouveau) : Commercial, Technicien / Installateur, Support technique, Direction / Gérant, Marketing, Autre.
- **distributor** (nouveau) : Commercial, Spécialiste applications, Responsable produit, Marketing, Direction, Autre.
- **team** — inchangé : Commercial, Technique-Couleur, Support, Direction, Marketing, Opérations.

Prévoir la migration des valeurs existantes (un revendeur avec `operator` → à requalifier ou à conserver en lecture avec bandeau « à mettre à jour »).

**b) Sections du hub gatées par rôle.** Matrice de visibilité cible :

| Section | client | reseller | distributor | team |
|---|---|---|---|---|
| Mon système (licences, AnyDesk, usines) | ✔ | ✖ | ✖ | ✖ |
| Mes presses / validations « à moi » | ✔ | reformulé « Validations de mes clients » | idem reseller | ✖ |
| Tuile Console validation | ✔ | ✔ (voix client tiers) | ✔ (voix client tiers) | ✖ |
| Clients / Réseau (ManagePanel) | ✖ (Équipe seulement) | Clients | Réseau + revendeurs | Admin |
| Academy | parcours imprimeur | parcours commercial/technique (à créer) | idem | tout |

**c) Sites réservés aux orgs client** : garde `type === 'client'` sur les sections Usines/Systèmes du tiroir org admin et du hub ; contrainte ou vérification API côté `app/api/admin/orgs/sites` et `systems`. Si les revendeurs ont besoin de localisations, c'est un autre concept (« agences »), pas des usines.

**d) Vocabulaire par type** : généraliser le mécanisme de `data/account-eyebrow.ts` (déjà correct) à toutes les surfaces qui disent « partenaire », et différencier les rangs Academy par filière (imprimeur / commercial / technique) quand les parcours existeront.

### 2.3 Qualification des comptes — décisions actées (18/07/2026)

Aujourd'hui, la classification revendeur/client repose sur la recherche de la **personne** par e-mail dans Pipedrive (`lib/pipedrive.ts:281-320`) ; introuvable ou CRM en panne → `client` par défaut, silencieusement (`lib/account-type.ts:81-91`). Deux mécanismes sont actés pour remplacer ce défaut deviné :

**a) État « à qualifier ».**
- Nouvelle colonne `profiles.account_type_source` : `'domain' | 'crm' | 'crm_domain' | 'admin' | 'unqualified'`. Le `account_type` reste l'un des quatre types existants (aucun switch UI à toucher) ; « à qualifier » = `account_type = 'client'` (accès sûr par défaut) + `source = 'unqualified'`.
- Règles de re-dérivation : un type confirmé (`admin` ou `crm`) n'est **jamais** écrasé par un échec ou une absence de réponse CRM — seul un signal positif met à jour (corrige B3 proprement). La sauvegarde de profil ne rétrograde plus.
- Onboarding d'un compte non qualifié : une question explicite « Vous êtes : imprimeur / revendeur ou distributeur » choisit le référentiel de postes affiché ; la réponse est stockée (`declared_profile`) mais ne confirme pas le type à elle seule.
- Admin : segment/filtre « À qualifier » dans l'onglet Comptes + tuile KPI dédiée ; l'action « qualifier » fixe le type et passe `source = 'admin'`.

**b) Domaines revendeurs alimentés par Pipedrive.**
- Nouvelle table `partner_domains` (`domain` PK, id org Pipedrive, label, `synced_at`), alimentée par un job de synchronisation (cron quotidien) qui parcourt les organisations/personnes Pipedrive étiquetées Reseller / OEM / Distributor et en extrait les domaines e-mail (personnes + champ site web de l'org), en excluant les webmails publics (`FREE_EMAIL_DOMAINS`, `lib/account-type.ts:21-29`).
- `deriveAccountType` devient : domaine équipe/X-Rite → team/distributor ; domaine ∈ `partner_domains` → `reseller` (`source = 'crm_domain'`) ; sinon recherche de la personne (`source = 'crm'`) ; sinon **à qualifier** (plus jamais `client` deviné).
- Bénéfices : classification instantanée dès la connexion (chemin domaine, sans appel CRM), couverture des collègues d'un revendeur connus par leur domaine mais non fichés individuellement, et réduction mécanique de la file « à qualifier ».
- Cas limites : une étiquette personne contredit le domaine → la personne l'emporte ; domaines retirés du CRM → purgés à la synchro suivante.

---

## 3. Problème structurant n° 2 — Société vs Organisation

### 3.1 Constat

- `profiles.company` (texte libre, 200 car.) et `profiles.organization_id` (FK) ne sont **jamais** synchronisés. `ensurePersonalOrg` copie `company` dans le nom de l'org **une seule fois**, à la création (`lib/organizations.ts:281-288`).
- **L'admin ne peut pas changer l'organisation d'un utilisateur** : le PATCH `/api/admin/users` accepte `company` mais pas `organization_id` (`app/api/admin/users/route.ts:41-64`). D'où le champ « Société » libre dans le tiroir utilisateur (`admin-dashboard.tsx:255-258`) et la fiche (`admin-user-detail.tsx:184-187`).
- Surfaces divergentes : la table des comptes affiche `u.company ?? org.name` avec le logo de l'org à côté (`admin-dashboard.tsx:1844`) ; la fiche affiche les deux valeurs côte à côte, potentiellement contradictoires (`admin-user-detail.tsx:335` vs `:338-354`) ; la recherche, le tri et l'export CSV n'utilisent que le texte libre ; les surfaces client (équipe, réseaux, co-branding) ne lisent que l'org.
- **Écrasements croisés** : une correction « Société » en admin est écrasée au prochain enregistrement de profil par l'utilisateur (`app/api/account/profile/route.ts:99,113`), et réciproquement.
- **Le matching CRM Pipedrive se fait sur le texte libre** (`lib/pipedrive.ts:157,216`) : une faute de frappe rattache le lead à la mauvaise org CRM.
- **Double source d'appartenance** : accepter une invitation `member` écrit `organization_members` mais pas `profiles.organization_id` (`lib/organizations.ts:167-171`) ; or tout l'admin et la page équipe dérivent l'org de `profiles.organization_id` → un invité peut apparaître dans une org côté tiroir et dans une autre partout ailleurs.

### 3.2 Cible proposée

1. **L'organisation devient la source de vérité.** Le tiroir/fiche utilisateur admin remplace le champ « Société » par un **sélecteur d'organisation** (recherche + « Créer une organisation »), et le PATCH admin apprend `organization_id`.
2. `profiles.company` devient une donnée dérivée (affichage/export) ou est supprimée à terme ; le formulaire de profil côté utilisateur modifie le nom de **son** org s'il en est owner, sinon champ en lecture seule.
3. Réconciliation : l'acceptation d'invitation aligne `profiles.organization_id` ; script de rattrapage pour les divergences existantes.
4. Le matching Pipedrive s'appuie sur l'org (id CRM stocké sur l'organisation) plutôt que sur la chaîne libre.

---

## 4. Problème structurant n° 3 — L'admin

### 4.1 Constat d'ensemble

Tout l'admin vit dans un composant client unique à onglets `useState` (`admin-dashboard.tsx`, 2 200 lignes) : pas d'URL par onglet (retour navigateur = sortie de l'admin, refresh = retour à l'overview), pas de liens profonds, orgs en modale quand les utilisateurs ont une page. Les tuiles KPI annoncent des filtres qu'elles n'appliquent pas (« Academy Pass actifs » → onglet comptes non filtré, `admin-dashboard.tsx:1686-1690`).

Constats confirmés sur les deux exemples remontés :

- **Cours sans drill-down** : la table (`admin-dashboard.tsx:2151-2181`) n'est pas cliquable, alors que les identités par cours sont **déjà en mémoire** côté serveur (`lib/admin.ts:158-195`) et jetées au moment de l'agrégation (`:240-260`). Exposer `[{userId, nom, email, modules, quiz, certifié}]` par cours est un petit changement ; l'inverse (fiche utilisateur → ses cours) existe déjà.
- **Société texte libre** : cf. § 3.

Autres manques par écran :

- **Comptes** : pas de pagination (cap silencieux à 1 000 via `listUsers`, `lib/admin.ts:99`), pas de segment « Pass actifs », vues sauvegardées en localStorage/`window.prompt` seulement.
- **Validations & Support** : tables en lecture seule, sans détail (photos, fil de discussion — qui existent côté client), sans action de statut (tout passe par Asana), sans lien vers la fiche utilisateur (le type ne porte même pas `user_id`, `lib/admin.ts:45-74`).
- **Organisations** : pas de recherche/tri, pas de suppression, pas de page (modale seulement), membres non cliquables ; l'attribution revendeur a **deux** chemins d'édition concurrents (tiroir + table « Attribution clients ») ; un admin **lecture seule** peut ouvrir le tiroir org via la cellule société (non gaté `canManage`, `admin-dashboard.tsx:1838-1845`) et voit un formulaire éditable dont tous les fetchs échouent en silence — données faussement vides.
- **Feedback** : de nombreuses mutations avalent les erreurs sans retour ni rollback (attribution revendeur `:395-398`, rôles/retraits/révocations `:1098-1121`, accès sites `:927-940`).
- **Maintenance** : `/api/admin/storage`, `dropbox-debug`, `dropbox-backfill` n'ont **aucune UI** et déclenchent des actions destructives **en GET** (`storage/route.ts:33` : `?cleanup=1&confirm=1` supprime des objets) — un lien piégé cliqué par un admin authentifié suffit. À passer en POST avec écran de confirmation.
- **Pas de journal d'audit** : aucune trace de qui a modifié/suspendu/supprimé quoi ; la case « Administrateur » s'enregistre sans confirmation ni notification (`admin-dashboard.tsx:296-304`).
- **Doublons** : l'édition utilisateur est implémentée deux fois (~200 lignes copiées : tiroir `admin-dashboard.tsx:156-357` vs fiche `admin-user-detail.tsx:91-284`), avec les mêmes cartes de libellés dupliquées. Un `job_title` ou pays inconnu est **détruit silencieusement** à l'enregistrement (le select s'initialise à vide, l'API nullifie).

Le gating d'accès lui-même est **sain** : is_admin + AAL2 vérifiés partout, gardes anti-auto-suppression présentes.

### 4.2 Cible proposée (top 10 priorisé)

1. Sélecteur d'organisation sur la fiche utilisateur (+ PATCH `organization_id`, cf. § 3).
2. Drill-down Cours → liste des apprenants, liés à leurs fiches.
3. Onglets synchronisés à l'URL + orgs promues en pages (`/admin/orgs/[id]`).
4. Liens croisés partout : fiche → org, membres org → fiches, validations/support → fiches (ajouter `userId` aux types), cours → apprenants.
5. Validations & support actionnables dans l'admin (statut, détail, fil).
6. Journal d'audit (acteur, action, cible, avant/après) alimenté par toutes les mutations `/api/admin/*`, avec un onglet de consultation.
7. Maintenance : GET destructifs → POST + onglet dédié (usage stockage, dry-run, confirmation).
8. Unifier tiroir/fiche utilisateur en un composant ; corriger les écrasements silencieux (valeurs inconnues, propriété des champs admin vs profil).
9. Confirmations sur les actions destructives (retrait membre, rôles, suspension, attribution) + remontée d'erreurs (toasts).
10. Pagination serveur des comptes ; corriger l'entrée org en lecture seule ; tuiles KPI qui appliquent vraiment leurs filtres (+ segment « Pass »).

Champs libres à transformer en référentiels au passage : `client_systems.product` (datalist libre → enum des produits, orthographe des marques garantie), `client_systems.machine` (constructeur + modèle), `console_validations.company` (troisième chaîne société indépendante, à relier à l'org).

---

## 5. Corrections indépendantes de la refonte (à lancer sans attendre)

### 5.1 Sécurité

| # | Problème | Où | Correctif |
|---|---|---|---|
| S1 | Open redirect sur le callback d'auth (`?next=@evil.com`, sans code requis) — vecteur de phishing sur les URLs d'e-mails d'auth | `app/api/auth/callback/route.ts:11,45` | Valider `next` côté serveur (`/^\/(?![/\\])/`), repli `/account` |
| S2 | Injection de motif `ilike` sur l'acceptation d'invitations (`_`/`%` jokers → vol d'invitation et de rôle) | `lib/organizations.ts:162-166` | `.eq('email', email.toLowerCase())` |
| S3 | Export RGPD « mes données » : `console_validations` sans filtre → un revendeur exporte les données de ses clients, un admin toute la table | `app/api/account/data/route.ts:17` | `.eq('user_id', user.id)` |
| S4 | Injection HTML dans les e-mails d'invitation via le nom d'org (texte libre) ; ni rate-limit ni dédoublonnage | `lib/team-emails.ts:17-31` | Échapper `orgName`/`inviter`, plafond d'invitations |
| S5 | Actions destructives admin en GET (storage cleanup, Dropbox move/backfill) | `app/api/admin/storage/route.ts:33` et voisins | POST + confirmation (cf. § 4.2.7) |
| S6 | Suppression de compte : l'avatar public reste en ligne ; variantes d'extensions orphelines | `app/api/account/data/route.ts:47-62`, `media/route.ts:49-53` | Supprimer toutes les variantes |
| S7 | Expiration des invitations (30 j) jamais vérifiée | `lib/organizations.ts:162-189` | Filtrer `expires_at` |
| S8 | Auto-rattachement d'org par domaine e-mail sans approbation (sous-traitants, anciens…) | `lib/organizations.ts:272-279` | Décision produit à confirmer (cf. § 7) |

### 5.2 Bugs fonctionnels

| # | Problème | Où |
|---|---|---|
| B1 | Achat de cours + Pass actif = deux lignes → `maybeSingle()` erreur → **accès au cours refusé** au meilleur client | `lib/entitlements.ts:66-71` |
| B2 | La connexion par mot de passe n'accepte jamais les invitations (seul le callback OAuth/magic-link le fait) | `app/api/auth/callback/route.ts:36-38` vs `sign-in-page.tsx:400` |
| B3 | Enregistrer son profil pendant une panne Pipedrive rétrograde un revendeur en `client` — correctif immédiat : ne jamais écraser sur échec/absence CRM ; solution cible : § 2.3 | `app/api/account/profile/route.ts:109-113`, `lib/account-type.ts:81-91` |
| B4 | `getManageableOrg` plante pour un owner/admin de 2+ orgs → 403 sur invitations/membres/logo | `lib/organizations.ts:141-147` |
| B5 | Sous-nav : client admin créé sans garde `HAS_ADMIN` → 500 systémiques si la clé manque ; le client user-scoped suffirait | `app/api/account/subnav/route.ts:18` |
| B6 | Le quiz renvoie le corrigé complet à chaque tentative, sans limite d'essais | `app/api/account/quiz/route.ts:60-77` |
| B7 | Course-org X-Rite (doublons possibles) + re-pointage inconditionnel de l'org à chaque connexion | `lib/organizations.ts:204-224` |
| B8 | Agrégation clients revendeur copiée-collée hub/équipe, divergée (systems/updates perdus côté équipe) ; constantes dupliquées | `app/account/page.tsx:188-234` vs `app/account/team/page.tsx:41-78` |
| B9 | Mécanisme de token d'invitation entièrement câblé en base mais jamais utilisé (lien e-mail = sign-in générique) | `lib/organizations.ts:105-131`, `lib/team-emails.ts:13` |

### 5.3 Textes & traductions

Points bloquants (le reste en annexe des rapports d'audit) :

- **IT — tutoiement** : 9 chaînes du hub (`account-hub.tsx:310-321,475-480`) + bannière profil (`account-profile.tsx:18`) en « tu » ; le reste du fichier est en Lei.
- **FR — glossaire** : « suivi couleur en boucle fermée » → « contrôle couleur closed-loop » (`account-hub.tsx:455`).
- **ES — collision de rôles** : revendeur étiqueté « Distribuidor » (`account-hub.tsx:346`) → « Revendedor ».
- **Chaînes admin en dur, FR uniquement + emoji hors charte** : bannière aperçu et « ← Fiche admin » (`account-hub.tsx:628,630,695`).
- **Coquilles** : « invitaciónes » (`account-team.tsx:159`), « macchina/e », « idonea/e » (`console-validations-portal.tsx:265-266`).
- **Glossaire presse** : « Mes machines / Mis máquinas » → « Mes presses / Mis prensas » (`account-systems.tsx:79,101`).
- **IT — Support/Supporto/Assistenza** : trois variantes pour un concept (sous-nav, installations, systèmes, page support) — une décision règle quatre fichiers.
- **Non traduits** : erreurs Supabase brutes à la connexion (`sign-in-page.tsx:360…`), listes de pays (profil + onboarding), titres d'onglets (metadata statique EN).
- **Divers** : email/e-mail/correo incohérents sur la page profil, « En analyse » vs « En revue » pour un même statut, « Modifs » familier.

### 5.4 Structure

- Pages de démo publiques sans auth (`/account/demo`, `/account/hub-demo`) dont le seul point d'entrée est du code mort (`DEMO_AUTH = false`, `sign-in-page.tsx:15`) — à gater ou supprimer.
- Onglet Console toujours affiché alors que la route 404 si `NEXT_PUBLIC_CONSOLE_TRACKING_ENABLED` est vide (défaut documenté) ; `ACADEMY_ENABLED` éteint = page de connexion 404 = toute la zone compte inaccessible.
- Pas de `layout.tsx` partagé : sous-nav re-fetchée à chaque onglet, navigation `<a>` plein rechargement ; page sécurité sans sous-nav ; onglet « profile » jamais surligné.

---

## 6. Découpage proposé

| Lot | Contenu | Dépend de | Taille indicative |
|---|---|---|---|
| **0 — Sécurité & bugs** | S1-S7, B1-B5, B8 | rien | S ; diffs ciblés, sans design |
| **1 — Textes** | § 5.3 complet | rien | S |
| **2 — Référentiels par rôle & qualification** | postes reseller/distributor, validation par type (API + admin), migration des valeurs, gating usines/systèmes/« Mes presses », vocabulaire par type ; état « à qualifier » + table `partner_domains` et job de synchro Pipedrive (§ 2.3, acté) | décisions D2, D3 | M |
| **3 — Organisation source de vérité** | sélecteur d'org admin, PATCH `organization_id`, dérivation de `company`, réconciliation invitations, matching CRM par org | lot 0 (B4) | M |
| **4 — Admin v2** | top 10 du § 4.2 (URL, pages orgs, drill-down cours, liens croisés, audit log, maintenance POST, unification, confirmations, pagination) | lots 2-3 pour les formulaires | L |
| **5 — Parcours Academy par filière** | ciblage des cours et rangs par rôle | lot 2 | M/L, contenu compris |

Lots 0 et 1 peuvent partir immédiatement sur cette branche. Les lots 2-4 méritent une validation de ce brief (et des décisions ci-dessous) avant implémentation.

---

## 7. Décisions à trancher (bloquantes pour les lots 2-4)

**Actées le 18/07/2026** : l'état « à qualifier » (fin du `client` par défaut deviné) et l'alimentation des domaines revendeurs depuis Pipedrive — spécifiés au § 2.3, rattachés au lot 2.

- **D1 — Locale `pt`** : un sixième locale portugais est câblé partout (sous-nav, PDF, middleware) mais absent du CLAUDE.md — l'officialiser (ajouter glossaire/ton pt) ou le sortir du périmètre ?
- **D2 — Distributeurs non-X-Rite** : le type `distributor` est réservé au domaine `@xrite.com` et Pipedrive mappe « Distributor » → `reseller`. Prévoir plusieurs distributeurs (logo co-brand par org plutôt que codé en dur) ou entériner « distributeur = X-Rite » ?
- **D3 — Référentiels de postes** proposés au § 2.2.a : valider/amender les listes reseller et distributor.
- **D4 — Auto-rattachement par domaine e-mail** (S8) : conserver tel quel, ou exiger une approbation owner/admin ?
- **D5 — Pages de démo** : à conserver derrière une auth/flag, ou à supprimer ?
- **D6 — Quiz** : limite de tentatives et masquage du corrigé — quel niveau d'exigence pour la valeur des certificats ?
- **D7 — Sites pour non-clients** : les revendeurs ont-ils besoin d'un concept de localisation (« agences ») ou les sites restent-ils strictement client ?
