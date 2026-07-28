# Liens UTM — console validation

Depuis le commit « Lead attribution », chaque demande de console validation arrive
dans Pipedrive avec une ligne `Source :` qui dit d'où vient le lead. Encore
faut-il baliser les liens qu'on publie.

**Règle simple : ne jamais publier `rutherford.fr/check` nu.** Toujours coller un
des liens ci-dessous.

## Les liens prêts à l'emploi

| Canal | Lien à coller |
|---|---|
| LinkedIn (post) | `https://rutherford.fr/check?utm_source=linkedin&utm_medium=social&utm_campaign=console-check` |
| LinkedIn (commentaire) | `https://rutherford.fr/check?utm_source=linkedin&utm_medium=comment&utm_campaign=console-check` |
| LinkedIn (message privé) | `https://rutherford.fr/check?utm_source=linkedin&utm_medium=dm&utm_campaign=outbound` |
| TikTok (bio + posts) | `https://rutherford.fr/check?utm_source=tiktok&utm_medium=social&utm_campaign=console-check` |
| Instagram (bio) | `https://rutherford.fr/check?utm_source=instagram&utm_medium=bio&utm_campaign=console-check` |
| YouTube (description) | `https://rutherford.fr/check?utm_source=youtube&utm_medium=video&utm_campaign=console-check` |
| Newsletter Pipedrive | `https://rutherford.fr/check?utm_source=pipedrive&utm_medium=email&utm_campaign=<nom-campagne>` |
| Email de relance | `https://rutherford.fr/check?utm_source=pipedrive&utm_medium=email&utm_campaign=nurture` |
| Signature email | `https://rutherford.fr/check?utm_source=email&utm_medium=signature&utm_campaign=always-on` |
| QR code salon | `https://rutherford.fr/check?utm_source=tradeshow&utm_medium=qr&utm_campaign=<nom-salon>` |
| Revendeur (ex. PrintControl) | `https://rutherford.fr/check?utm_source=partner&utm_medium=referral&utm_campaign=printcontrol` |

## Pour distinguer deux posts du même canal

Ajouter `utm_content` avec un identifiant court du post :

```
...&utm_content=operator-checklist
...&utm_content=mitsubishi-retrofit
...&utm_content=keep-the-rhythm
```

C'est ce qui permet de dire « le post checklist opérateur a rapporté 4 demandes,
le post rétrofit Mitsubishi zéro », et donc de savoir quoi refaire.

## Ce que ça donne dans Pipedrive

La note du deal contient désormais une ligne :

```
Source   : linkedin (social) campaign: console-check content: operator-checklist
```

Sans UTM, la ligne retombe sur le domaine référent (`referrer: google.com`),
puis sur `direct` en dernier recours.

## Le seul geste manuel restant

**Activer Vercel Web Analytics** dans le dashboard du projet `website5`
(Analytics → Enable). Le composant `<Analytics />` est déjà monté dans le code,
mais tant que l'interrupteur est off, aucune donnée n'est collectée et l'API
répond « Web Analytics not found ». C'est cookieless, donc ça compte aussi les
visiteurs qui refusent le bandeau (là où GA et PostHog sont aveugles).
