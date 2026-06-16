# Promo — Reseller account (presentation animation)

Two standalone variants of the same reel — pick the vibe:

- **`reseller-account.html`** — calm "screencast" feel (cross-fades, simulated cursor).
- **`reseller-account-motion.html`** — **motion-design** version: boxes pop in with a
  spring and fly out between scenes (zoom toward camera with blur, off-page slides with
  rotation, shrink-to-zero).

Both present three sections of the Rutherford customer space through the eyes of a
**fictional reseller account**:

1. **My account** — the reseller hub "Atlas Graphic Solutions" and its 5 clients
   (Imprimerie Berton, Cartonnages Vasseur, Helvetica Print AG, Grafica Lombarda,
   Nordpack Druck).
2. **Console Validation** — press-validation tracking, with one request moving from
   "In review" to "Connectable".
3. **Support** — an in-progress support ticket, with activity timeline and conversation.

> ⚠️ Simulation. Every company and person mentioned is **fictional** and is not a real
> Rutherford customer.

## How to watch it

- **Simplest:** open either `.html` file directly in a browser (double-click). The
  files are 100% standalone — no dependencies, no server, work offline.
- It auto-plays on a loop; the dots at the bottom jump to a scene, and "Replay" restarts it.
- **To turn it into a video** (LinkedIn, sales deck…): open the file full-screen and use a
  screen recorder (QuickTime on Mac, the Xbox Game Bar on Windows, or OBS). Suggested
  format: 16:9.

## Hosted (hidden) page on the site

The motion-design reel is also served as a **hidden page** at **`/promo`**
(`rutherford.fr/promo`):

- Rendered by `app/promo/page.tsx` inside an isolated `<iframe srcDoc>`.
- `robots: noindex, nofollow` and **not linked** from any menu — reachable only with the URL.
- `app/promo/animation.ts` is auto-generated from `reseller-account-motion.html`
  (regenerate by copying the standalone file's content into that module).

The static `.html` files in this folder are **not** servable as-is on the deployed site
because `next.config.js` has a global `*.html → /` redirect — that is why the hosted
version goes through the `/promo` route instead. The `.html` files remain here purely for
local opening and screen-recording.
