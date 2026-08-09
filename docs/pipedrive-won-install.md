# Deal gagné (Pipedrive) → tâche Install (Asana)

Remplace le dernier Zap encore actif. Quand un deal passe en **WON** dans
Pipedrive, une carte est créée dans le projet Asana **Install**, avec le même
nom et le même bloc de description que ceux que l'équipe lit depuis des années.

Dormant-safe comme le reste des intégrations : tant que `ASANA_INSTALL_PROJECT`
est vide, rien n'est créé — le Zap peut continuer à tourner.

## Flux — `app/api/pipedrive-webhook/route.ts`

1. **Authentification** : Pipedrive signe ses webhooks en HTTP Basic. Sans
   `PIPEDRIVE_WEBHOOK_USER` / `PIPEDRIVE_WEBHOOK_PASSWORD`, la route ignore tout
   (plutôt que de laisser n'importe qui créer des cartes sur le board).
2. **Filtre** : seule une *transition* vers `won` compte. Un deal déjà gagné
   qu'on modifie répète « status: won » à chaque événement ; sans ce filtre le
   board collectionnerait une carte par édition.
3. **Verrou** : `pipedrive_won_installs` (clé primaire = id du deal). Pipedrive
   rejoue un webhook tant qu'il n'a pas de 2xx, et un deal peut repasser gagné
   après avoir été perdu — c'est le verrou, pas l'horodatage, qui garantit une
   carte et une seule.
4. **Garde-fou parallèle** : recherche dans le board d'une carte portant déjà le
   marqueur `IDxxxx` ou le champ **ID** du deal. Les cartes du Zap ne sont pas
   dans notre base, mais elles sont sur le board — c'est ce qui permet de faire
   tourner les deux en parallèle sans doublon.
5. **Lecture du deal** (`getWonDeal`, `lib/pipedrive.ts`) : propriétaire,
   organisation, contact, produits (nom + code), date de livraison et les champs
   personnalisés du bloc.
6. **Création** (`createInstallTask`, `lib/asana.ts`) : carte dans *Install*,
   colonne **To control**, échéance = date de livraison, assignée à FX,
   Emilie en collaboratrice, champ **ID** = id du deal.
7. **Traces** : entrée `install.task_created` au journal d'audit (onglet
   **Journal** du back-office) et message Discord si `DISCORD_WEBHOOK_URL` est
   réglé. Un échec de création est journalisé en `install.task_failed` — un deal
   gagné sans carte est précisément ce qu'il faut voir.

Ce qui suit reste **automatisé dans Asana** et n'est pas touché : les règles du
board créent la sous-tâche « control order », renseignent PUPI / PO / SO quand la
carte change de colonne, puis créent la sous-tâche « License » au passage en
*To install*.

## Champs Pipedrive → bloc de description

Le bloc reproduit à l'identique celui du Zap, lignes vides comprises (l'équipe
les complète à la main au fil de l'install) :

```
Owner of the deal : …      propriétaire du deal
Delivery : …               champ « Delivery », sinon date de clôture prévue
Organisation : …           organisation liée
Contact : …                personne liée
Products name : …          produits du deal
Products code : …          codes catalogue des produits
PO : …                     champ personnalisé
SO : …                     champ personnalisé
Press interface : …        champ personnalisé
Press : …                  champ personnalisé
Numbers of units : … - Keys : …
Screen mount : …
Computer : …
AnyDesk : …
Tracking number :          laissé vide (rempli à la main)
License number RGP :       laissé vide
PO RGP :                   laissé vide
```

### Vérifier les noms exacts — `GET /api/admin/pipedrive-fields`

Les noms des champs personnalisés sont la seule chose que cette intégration ne
peut pas vérifier depuis un poste de développement : il faut le token Pipedrive.
D'où ce diagnostic admin, en lecture seule (réservé aux admins `canManage`) :

- `GET /api/admin/pipedrive-fields` → quel champ Pipedrive atterrit sur quelle
  ligne du bloc, la liste des libellés qui ne correspondent à **rien** (leur
  ligne sortira vide), et l'inventaire complet des champs de deal avec leur nom
  exact et leur clé — de quoi épingler celle qui diverge.
- `GET /api/admin/pipedrive-fields?deal=2410` → en plus, le nom de tâche et le
  bloc de description **exacts** que ce deal produirait. Rien n'est créé : c'est
  la répétition générale à regarder avant de couper le Zap.

À l'exécution, un libellé sans correspondance est aussi journalisé
(`[pipedrive] deal … : no Pipedrive field matches …`) dans les logs Vercel.

⚠️ Un déploiement *preview* n'a que les variables d'environnement de scope
Preview : si `PIPEDRIVE_API_TOKEN` n'existe qu'en Production, interrogez la route
sur rutherford.fr, pas sur l'URL de preview.

Les champs personnalisés sont résolus **par leur nom** via `/dealFields` au
moment de l'exécution, pas par leur clé de 40 caractères : renommer un champ
dans Pipedrive n'exige aucun déploiement, et une clé en dur ne peut pas pourrir
en silence. Un libellé qu'aucun champ ne satisfait laisse simplement sa ligne
vide. Si un champ porte chez vous un nom trop éloigné, épinglez-le :
`PIPEDRIVE_DEAL_FIELDS={"PO":"<clé>","Press interface":"<clé>"}`.

## Mise en service

0. **Contrôle des noms de champs** : une fois la branche déployée, ouvrir
   `https://rutherford.fr/api/admin/pipedrive-fields` (connecté en admin) et
   vérifier que `unmatched` est vide. Sinon, relever le nom exact dans
   `dealFields` et l'épingler via `PIPEDRIVE_DEAL_FIELDS`.
1. **Migration** : passer `supabase/migrations/20260809_pipedrive_won_installs.sql`
   dans le SQL editor.
2. **Variables** (Vercel → `rutherford-fr` → Production) :
   ```
   PIPEDRIVE_WEBHOOK_USER=…      # au choix
   PIPEDRIVE_WEBHOOK_PASSWORD=…  # au choix, long
   ASANA_INSTALL_PROJECT=731409919229383
   ```
   Les autres gids ont une valeur par défaut correcte : section *To control*
   `1201798768968949`, collaboratrice Emilie `774875611076804`, champ **ID**
   `1212566134774832`, workspace `15445560112122`.
   **Ne pas régler `ASANA_INSTALL_PROJECT` avant l'étape 4** : c'est lui qui
   arme le flux.
3. **Webhook Pipedrive** : Paramètres → Outils et applications → Webhooks →
   *Créer un webhook*. Événement `deal.change` (v2) ou `updated.deal` (v1), URL
   `https://rutherford.fr/api/pipedrive-webhook`, authentification HTTP Basic
   avec le couple de l'étape 2.
4. **Test en parallèle, Zap allumé** : régler `ASANA_INSTALL_PROJECT`,
   redéployer, passer un deal de test en gagné. Le garde-fou de l'étape 4 du
   flux fait que la carte du Zap gagne la course et que la nôtre ne se crée pas —
   vérifier le journal d'audit (`already_on_board` n'y laisse pas de trace, mais
   la réponse du webhook le dit dans les logs Vercel).
5. **Bascule** : couper le Zap (ne pas le supprimer — rollback), rejouer un deal
   gagné, vérifier la carte, le journal et le message Discord.

## Ce qui n'est pas fait

- La carte n'est pas rattachée à la ligne `console_validations` du client (il
  faudrait une colonne `asana_install_task_gid` et une décision sur ce que le
  client voit). Le brief § 2.5 prévoit la synchro Install → portail — c'est là
  que ça se branchera.
- Le back-office n'a pas d'onglet « Installs » : la seule surface est le journal
  d'audit. Suffisant pour surveiller la bascule, pas pour piloter le parc.
