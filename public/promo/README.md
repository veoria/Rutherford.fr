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

## Technical note (hosting on the site)

This folder does **not modify any existing page, route or component** of the site.

`next.config.js` contains a global `*.html → /` redirect. Served by Next, the file would
therefore be redirected to the homepage. That does not matter for the usage above (direct
open / recording). To make it reachable at a public URL on the deployed site, two options
**without touching the rest of the site**:

- rename it to `.htm` (the redirect only catches `.html`), or
- add an exception to the redirect rule in `next.config.js`.
