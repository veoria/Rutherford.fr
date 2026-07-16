# Playbook — Article blog hebdomadaire (SEO + GEO)

Recette suivie par la routine planifiée `weekly-blog-articles`. Objectif : publier chaque semaine 1 article de blog qui (a) réagit à l'actualité du secteur, (b) travaille le positionnement « le closed loop Rutherford/ColorLoop est déployé dans le monde entier », et (c) nourrit le SEO classique ET le GEO (moteurs génératifs : ChatGPT, Perplexity, AI Overviews).

Le blog est servi par les deux domaines (rutherford.fr/blog et go.colorloop.ai/blog) : un seul article alimente les deux plateformes.

## 0. Environnement de travail (obligatoire)

Le repo principal : `/Users/hugueslourmieres/Documents/Website v3/export-dropbox/rutherford-site-source-2026-04-23`. Ne JAMAIS modifier son working tree directement (Hugues ou FX peuvent travailler dedans). Créer un worktree temporaire basé sur origin/redesign :

```bash
cd "/Users/hugueslourmieres/Documents/Website v3/export-dropbox/rutherford-site-source-2026-04-23"
git fetch origin
git worktree add /tmp/blog-run --detach origin/redesign
cd /tmp/blog-run
```

À la fin (après push) :

```bash
cd "/Users/hugueslourmieres/Documents/Website v3/export-dropbox/rutherford-site-source-2026-04-23"
git worktree remove /tmp/blog-run --force
```

## 1. Veille actus (WebSearch)

Chercher les actualités des 7 à 14 derniers jours sur 3 ou 4 requêtes parmi :
- "offset printing industry news" · "drupa" ou salons (PRINTING United, Labelexpo)
- "PPWR packaging regulation news" · "Digital Product Passport printing"
- "paper prices printing industry" · "heatset web offset news"
- "Heidelberg OR Komori OR Manroland press announcement"
- "X-Rite OR MeasureColor release"

Choisir UN sujet avec un vrai angle pour un imprimeur offset. Une semaine sur deux, si l'actu est creuse, prendre un sujet evergreen international à la place (ex. : standardisation multi-sites, couleur de marque mondiale, G7 vs ISO selon les régions, audit couleur pour donneurs d'ordres).

## 2. Anti-doublon

Lire les slugs existants : `node -e "require('./data/blog-articles.json').forEach(a=>console.log(a.slug))"`. Si le sujet choisi recoupe un article existant, changer d'angle (réaction d'actualité, mise à jour chiffrée) ou changer de sujet.

## 3. Écrire l'article

Ajouter UNE entrée au début du tableau dans `data/blog-articles.json`, schéma exact (types dans `lib/blog.ts`) :

```jsonc
{
  "slug": "kebab-case-en-anglais",
  "title": "Titre EN, sentence case",
  "excerpt": "1 phrase EN, 140-160 caractères, mot-clé principal inclus",
  "lead": "2-3 phrases EN d'accroche",
  "image": "/images/blog/photo-<slug-existant>.jpg",   // choisir dans le pool existant, voir §5
  "publishedAt": "YYYY-MM-DD",                          // date du jour
  "category": "News | Standards | Production | Regulations | Sustainability",
  "paragraphs": ["3 à 4 paragraphes EN, résumé plat (fallback SEO)"],
  "body": [
    { "type": "p", "text": "…" },
    { "type": "h2", "text": "…" },
    { "type": "ul", "items": ["…"] },
    { "type": "h3", "text": "Question fréquente en forme de question ?" },  // GEO, voir §4
    { "type": "p", "text": "Réponse directe." }
  ],
  "i18n": {
    "fr": { "title": "…", "excerpt": "…", "lead": "…", "body": [ /* même structure */ ] }
  },
  "originalUrl": "https://rutherford.fr/blog/<slug>",
  "sources": [ { "label": "Nom de la source", "href": "https://…" } ]   // 2-3 vraies sources issues de la veille
}
```

Contenu : 800 à 1 200 mots EN. Traductions : **fr obligatoire**, de/it/es/pt bienvenues si le sujet est international (title/excerpt/lead au minimum). Le corps EN est la référence.

### Règles de style (non négociables)
- Suivre le glossaire de `CLAUDE.md` (racine du repo). FR : « closed loop » (anglicisme, jamais « boucle fermée »), « vis d'encrier » (jamais « clés d'encrage »), « gâche », « calage », « tirage », vouvoiement.
- Dans body, seul le lien markdown [label](href) est rendu : pas de **gras** ni d autre markdown.
- **Aucun tiret cadratin (—) ni demi-cadratin (–)** nulle part. Virgules ou deux-points.
- Produit d'abord : ne JAMAIS raconter l'histoire de l'entreprise, ne jamais écrire « since 2000 », « Dayton », « Rutherford Graphic Products ». Rutherford.fr est l'entité France/Europe, preuves = « 1,000+ systems in 30+ countries ».
- Positionnement hybride : ColorLoop mène ; X-Rite/MeasureColor/IntelliTrax2 cités comme écosystème de mesure, sans en faire le héros.
- Ton industriel B2B, concret (gâche, calage, DeltaE, traçabilité), pas de buzzwords.

### Angle « mondial » (chaque article)
Relier le sujet au déploiement international : au moins une phrase reliant l'actu aux ateliers multi-pays (Europe, Amérique du Nord, Asie, LATAM) et un lien interne vers une page marché (`/usa`, `/canada`, `/china`, `/japan`, `/latin-america`, `/uae`) quand pertinent.

## 4. SEO + GEO dans le corps

- 1 mot-clé principal (dans title, excerpt, premier h2) + 2-3 secondaires.
- **2 ou 3 sections h3 en forme de question** avec réponse directe en 2-4 phrases dessous (formats repris par les moteurs génératifs).
- Liens internes : 2 à 4 parmi `/console-validation` (Rutherford Check), `/roi`, `/offset360`, un article de blog connexe, une page marché.
- **Maillage pilier (obligatoire)** : tout article du cluster closed loop / couleur / calage / standards inclut un lien vers la page pilier `/closed-loop-color-control` (ancre du type « guide complet du closed loop »). Le glossaire `/glossary` peut aussi être lié quand un terme technique est central dans l'article.
- Sources externes réelles (issues de la veille) dans `sources`.
- GEO : ajouter l'article dans `public/llms.txt` sous une section `## Recent articles` (la créer sous « Key pages » si absente ; garder les 8 plus récents, format `- [Titre](https://rutherford.fr/blog/<slug>): résumé en 1 ligne`).

## 5. Image

Choisir la plus pertinente dans le pool existant : `ls public/images/blog/` + `public/images/` (presses : `manroland-press.jpg`, opérateurs : `stopplayingpiano-operator.jpg`, `support-hugues-console.jpg`, console : `Console offset.jpg`, produit : `colorloop-machine.png`). Ne jamais hotlinker une image externe. Ne pas générer d'image.

## 6. Vérifications avant commit

```bash
node -e "JSON.parse(require('fs').readFileSync('data/blog-articles.json'))" && echo JSON_OK
npx tsc --noEmit
grep -c '—' data/blog-articles.json   # ne doit pas avoir augmenté
```

`npx next build` UNIQUEMENT si aucun serveur dev ne tourne (`lsof -i :3001` vide) : un build pendant que la preview tourne corrompt `.next`. Si le port 3001 est occupé, sauter le build (tsc + JSON suffisent).

## 7. Publication (staging seulement)

```bash
git add data/blog-articles.json public/llms.txt
git commit -m "Blog: <titre court> (weekly auto article)"
git push origin HEAD:redesign
```

**INTERDIT de pousser sur main.** La mise en production est décidée par Hugues (il dit « push »). Si `git push origin HEAD:redesign` échoue (non fast-forward), refaire `git fetch origin` puis rebaser sur origin/redesign et réessayer une fois ; sinon abandonner proprement et le signaler.

## 8. Compte rendu final

Terminer par un résumé pour Hugues : sujet choisi et pourquoi (lien actu), slug, langues livrées, liens internes posés, et le rappel : « L'article est sur la branche redesign (staging). Dis "push" dans une session Claude pour le mettre en ligne sur rutherford.fr et go.colorloop.ai. »
