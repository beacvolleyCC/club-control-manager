CLUB CONTROL MANAGER PWA V0.4 — VERSENYSPORT CORE READ-ONLY

FULL REPLACEMENT DEPLOY over the V0.3 repository root:
- index.html
- app.js
- styles.css
- config.js
- manifest.webmanifest
- sw.js
- icons/* (unchanged but safe to replace)

No new SQL migration is required for V0.4.
Requires already-installed MGR001 Manager PWA Foundation V1.

V0.4 real/live read modules:
- Versenysport / Áttekintés
- Versenysport / Edzések
- Versenysport / Meccsek
- Versenysport / Naptár (Day/Week/Month/Season; week grid desktop, agenda mobile)
- Versenysport / Csapatok (master/detail + roster)
- Versenysport / Játékosok (table/cards + detail dialog)
- Settings remains global

Still intentionally NOT migrated:
- write/edit operations
- Fees production parity
- Competition Core/BRSZ/MRSZ
- Mass sport runtime parity
- Training planner

IMPORTANT: old Apps Script Manager remains the production fallback during parity testing.
