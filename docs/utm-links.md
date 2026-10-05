# Liens UTM : console validation

Chaque lead du site arrive dans Pipedrive avec une ligne `Source :` qui dit d'où
il vient : demande de console validation, formulaire de contact, calculateur ROI
et inscription newsletter. Encore faut-il baliser les liens qu'on publie.

**Règle simple : ne jamais publier `rutherford.fr/check` nu.** Toujours coller un
des liens ci-dessous.

## Liens permanents des profils

À coller une fois dans chaque profil, puis ne plus y toucher.

| Réseau | Profil officiel | Emplacement | Lien à coller |
|---|---|---|---|
| Facebook | `facebook.com/Rutherford.fr` | Bouton de la page | `https://rutherford.fr/check?utm_source=facebook&utm_medium=bio&utm_campaign=console-check&utm_content=page-button` |
| LinkedIn | `linkedin.com/company/rutherfordfr` | Bouton de la page | `https://rutherford.fr/check?utm_source=linkedin&utm_medium=bio&utm_campaign=console-check&utm_content=page-button` |
| Instagram | `instagram.com/rutherfordgraphic` | Bio | `https://rutherford.fr/check?utm_source=instagram&utm_medium=bio&utm_campaign=console-check` |
| TikTok | `tiktok.com/@rutherfordgraphic` | Bio | `https://rutherford.fr/check?utm_source=tiktok&utm_medium=bio&utm_campaign=console-check` |
| YouTube | `youtube.com/channel/UChiClIodg9rbuTDnInE4GmQ` (@rutherfordfr) | Liens de la chaîne | `https://rutherford.fr/check?utm_source=youtube&utm_medium=bio&utm_campaign=console-check` |
| YouTube | `youtube.com/channel/UChiClIodg9rbuTDnInE4GmQ` (@rutherfordfr) | Description des vidéos | `https://rutherford.fr/check?utm_source=youtube&utm_medium=video&utm_campaign=console-check` |

## Liens par publication

| Canal | Lien à coller |
|---|---|
| LinkedIn (post) | `https://rutherford.fr/check?utm_source=linkedin&utm_medium=social&utm_campaign=console-check` |
| LinkedIn (message privé) | `https://rutherford.fr/check?utm_source=linkedin&utm_medium=dm&utm_campaign=outbound` |
| Facebook (post) | `https://rutherford.fr/check?utm_source=facebook&utm_medium=social&utm_campaign=console-check` |
| Facebook (message privé) | `https://rutherford.fr/check?utm_source=facebook&utm_medium=dm&utm_campaign=outbound` |
| Instagram (post) | pas de lien : écrire « link in bio » (voir plus bas) |
| TikTok (post) | pas de lien : écrire « link in bio » (voir plus bas) |
| Newsletter Pipedrive | `https://rutherford.fr/check?utm_source=pipedrive&utm_medium=email&utm_campaign=<nom-campagne>` |
| Email de relance | `https://rutherford.fr/check?utm_source=pipedrive&utm_medium=email&utm_campaign=nurture` |
| Signature email | `https://rutherford.fr/check?utm_source=email&utm_medium=signature&utm_campaign=always-on` |
| QR code salon | `https://rutherford.fr/check?utm_source=tradeshow&utm_medium=qr&utm_campaign=<nom-salon>` |
| Revendeur (ex. PrintControl) | `https://rutherford.fr/check?utm_source=partner&utm_medium=referral&utm_campaign=printcontrol` |

### Instagram et TikTok : « link in bio »

Les liens ne sont pas cliquables dans les légendes Instagram et TikTok (ni dans
les commentaires). Inutile d'y coller une URL : la légende dit **« link in bio »**
et c'est le lien de la bio (tableau des profils) qui porte le suivi. Les leads
de ces posts arrivent donc avec `instagram (bio)` ou `tiktok (bio)`.

## Réponses aux commentaires

Quand on répond à un commentaire qui parle d'une presse (ou sous un post consacré
à une marque), on ne colle pas `/check` mais **la page de la marque** :

```
https://rutherford.fr/console-validation/<marque>?utm_source=<réseau>&utm_medium=comment&utm_campaign=console-check&utm_content=<marque>
```

- `<réseau>` : `linkedin`, `facebook` ou `youtube` (là où un lien en commentaire
  est cliquable ; sur Instagram et TikTok, répondre « link in bio »).
- `<marque>` : une des 8 pages existantes, à l'identique dans le chemin et dans
  `utm_content`.

| Marque | Valeur de `<marque>` |
|---|---|
| Heidelberg | `heidelberg` |
| Komori | `komori` |
| Koenig & Bauer | `koenig-bauer` |
| Manroland | `manroland` |
| Mitsubishi | `mitsubishi` |
| Ryobi | `ryobi` |
| Goss | `goss` |
| Presstek | `presstek` |

Exemple, réponse LinkedIn à une question sur une Rapida :

```
https://rutherford.fr/console-validation/koenig-bauer?utm_source=linkedin&utm_medium=comment&utm_campaign=console-check&utm_content=koenig-bauer
```

## Pour distinguer deux posts du même canal

Ajouter `utm_content` avec un identifiant court du post :

```
...&utm_content=operator-checklist
...&utm_content=mitsubishi-retrofit
...&utm_content=keep-the-rhythm
```

C'est ce qui permet de dire « le post checklist opérateur a rapporté 4 demandes,
le post rétrofit Mitsubishi zéro », et donc de savoir quoi refaire.

## Liens localisés

`rutherford.fr/fr/check`, `/de/check`, `/it/check`, `/es/check` et `/pt/check`
redirigent vers la console validation dans la langue correspondante
(`/fr/console-validation`, etc.), paramètres UTM conservés. Avant cette version
du site, ces adresses renvoyaient une 404 : vérifier qu'elle est en ligne avant
d'en publier une.

## Ce que ça donne dans Pipedrive

La source est le premier point d'entrée de la session (l'onglet du visiteur) :
s'il arrive par LinkedIn, lit trois articles puis remplit le formulaire, c'est
bien LinkedIn qui est crédité. S'il revient plus tard dans un nouvel onglet sans
UTM, la source sera `direct`.

### Console validation

- **Deal** `Pays - Société - Machine - ID{id}`.
- **Personne** liée au deal : cherchée par email, créée si elle n'existe pas
  (nom = email).
- **Organisation** liée au deal (et à la personne) : cherchée par nom exact de
  société, créée sinon.
- **Note du deal** :

```
Console validation request received via rutherford.fr/console-validation.
Email : prenom.nom@imprimerie.fr
Pays : France
Machine : Heidelberg Speedmaster XL 106
Parrainage : ABC123
Source : linkedin (bio) campaign: console-check content: page-button
Photos: 4
Storage: 2026-10-05-12345-imprimerie-dupont
```

La ligne `Parrainage` n'apparaît que si la demande vient d'un lien de parrainage.
La même ligne `Source` figure aussi dans le fichier `infos.txt` du dossier photos (Dropbox).

### Contact, calculateur ROI, newsletter

Personne (cherchée par email, créée sinon) + organisation quand une société est
renseignée, et une note qui porte la même ligne `Source :` :

| Formulaire | En-tête de la note | Particularité |
|---|---|---|
| Contact | **Demande de contact (site)** | sujet, pays, téléphone, rappel souhaité, message |
| Calculateur ROI | **Lead Calculateur ROI** | société seulement |
| Newsletter | **Inscription newsletter** | statut marketing « subscribed », ligne `Formulaire :` (footer, `blog:<article>`) distincte de la source |

### Lecture de la ligne Source

```
Source : linkedin (social) campaign: console-check content: operator-checklist
```

Sans UTM, la ligne retombe sur le domaine référent (`referrer: google.com`),
puis sur `direct` en dernier recours. Quand la première page vue n'est pas la
page `/console-validation` elle-même, la fin de ligne l'indique
(`landed on /blog/...`).

Si Pipedrive est indisponible, les formulaires aboutissent quand même : le lead
est simplement absent du CRM (la demande de console validation reste dans
Dropbox, Asana et l'espace compte).

## Analytics

Les événements `console_validation_submit`, `contact_submit`, `roi_lead_submit`
et `newsletter_signup` partent dans GA4 et PostHog (après acceptation du bandeau
cookies) avec `lead_source`, `lead_medium` et `lead_campaign`. Préfixés `lead_`
exprès : GA4 lit `source`, `medium` et `campaign` comme des données de campagne
et fausserait ses propres sources de trafic. Vercel Web Analytics reçoit les mêmes événements sans ces paramètres
(2 propriétés maximum par événement sur le plan Pro).

## Gestes manuels restants

**Activer Vercel Web Analytics** dans le dashboard du projet `website5`
(Analytics → Enable). Le composant `<Analytics />` est déjà monté dans le code,
mais tant que l'interrupteur est off, aucune donnée n'est collectée et l'API
répond « Web Analytics not found ». C'est cookieless, donc ça compte aussi les
visiteurs qui refusent le bandeau (là où GA et PostHog sont aveugles).

**Déclarer les dimensions dans GA4** (Admin → Définitions personnalisées →
dimension de portée « Événement ») pour `lead_source`, `lead_medium` et
`lead_campaign`, sinon elles n'apparaissent pas dans les rapports.
