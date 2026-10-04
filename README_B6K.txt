CLUB CONTROL MANAGER V0.5.2B6K
==============================
Scope: standings/mobile geometry + coach RSVP location/editability + finance matrix containment.

Fixes:
- Overview no longer contains editable coach RSVP columns; coach RSVP lives in Csapatok -> Rács.
- Csapatok -> Rács coach selector supports ✓ / · / ✕ (going / unknown / not_going).
- New/empty coach cells are editable when the current Manager is allowed to edit them; server-side MGR021 permission remains authoritative.
- Full admin may edit all coach rows; ordinary coach remains limited by MGR021 to their own row.
- Mobile standings use a compact sticky rank/team pair and their own horizontal scroll surface.
- Finance competition matrix owns horizontal scroll; finance filters/header stay in viewport width.
- Overview matrix width calculation no longer reserves space for coach columns.

Backend:
- No new SQL in B6K.
- Requires MGR021 for coach availability permissions/write.
- MGR022 remains required for the BEAC finance reconciliation introduced in B6J.

config.js is intentionally NOT included.
