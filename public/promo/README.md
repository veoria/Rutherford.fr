# Promo — Espace revendeur (animation de présentation)

`espace-revendeur.html` est une **animation autonome** qui présente trois sections de
l'espace client Rutherford à travers les yeux d'un **compte revendeur fictif** :

1. **Mon compte** — le hub revendeur « Atlas Graphic Solutions » et ses 5 clients
   (Imprimerie Berton, Cartonnages Vasseur, Helvetica Print AG, Grafica Lombarda,
   Nordpack Druck).
2. **Console Validation** — le suivi des validations de presse, avec un dossier qui
   passe de « En revue » à « Connectable ».
3. **Support** — un ticket de support en cours, avec timeline et conversation.

> ⚠️ Simulation. Toutes les entreprises et personnes citées sont **fictives** et ne
> figurent pas parmi les clients réels de Rutherford.

## Comment la regarder

- **Le plus simple :** ouvrez `espace-revendeur.html` directement dans un navigateur
  (double-clic). Le fichier est 100 % autonome — aucune dépendance, aucun serveur,
  fonctionne hors-ligne.
- L'animation se joue en boucle ; les puces en bas permettent de sauter à une scène,
  et « Rejouer » la relance.
- **Pour en faire une vidéo** (LinkedIn, présentation commerciale…) : ouvrez le fichier
  en plein écran et utilisez un enregistreur d'écran (QuickTime sur Mac, l'enregistreur
  Xbox sur Windows, ou OBS). Format conseillé : 16:9.

## Note technique (hébergement sur le site)

Ce dossier ne modifie **aucune page, route ou composant existant** du site.

Le `next.config.js` contient une redirection globale `*.html → /`. Servi par Next, le
fichier serait donc redirigé vers l'accueil. Ce n'est pas gênant pour l'usage ci-dessus
(ouverture directe / enregistrement). Si vous souhaitez le rendre accessible à une URL
publique sur le site déployé, deux options **sans toucher au reste du site** :

- le renommer en `.htm` (la redirection ne capture que `.html`), ou
- ajouter une exception à la règle de redirection dans `next.config.js`.
