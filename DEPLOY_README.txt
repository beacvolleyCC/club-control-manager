CLUB CONTROL MANAGER PWA V0.4.1 — VERSENYSPORT PARITY READ-ONLY

IMPORTANT: DO NOT DEPLOY THIS FRONTEND UNTIL MGR002 HAS PASSED:
1. PREFLIGHT_MGR002_MANAGER_PARITY_READONLY.sql
2. MGR002_MANAGER_PARITY_READONLY_RPC_SAFE.sql
3. POSTINSTALL_QA_MGR002_READ_ONLY.sql

After MGR002 is green, this is a FULL REPLACEMENT DEPLOY over the current club-control-manager repository root:
- index.html
- app.js
- styles.css
- config.js
- manifest.webmanifest
- sw.js
- assets/player-animals.webp
- icons/*

V0.4.1 parity principle:
- old Manager = functionality and information-density reference
- Player = visual/design-system reference
- new Manager PWA = responsive/technical reference

Restored/kept in V0.4.1:
- full team/player names (no intentional shortening)
- Overview summary + RSVP matrix + next matches
- RSVP wording: Jövök / Nem jövök / Nincs válasz
- dense Trainings/Matches table with expandable roster
- full Player data table/cards with membership, license, medical, account and attendance
- Player animal avatars where available
- Day/Week/Month/Season calendar read views
- responsive desktop/tablet/mobile shell

Still intentionally NOT migrated:
- write/edit operations
- calendar drag/resize/save
- full court/resource availability configuration from legacy Sheet config
- Fees production parity
- Mass sport runtime parity
- Competition Core/BRSZ/MRSZ
- Training Planner (explicitly excluded)

The old Apps Script Manager remains the production fallback until write parity is proven.
