CLUB CONTROL MANAGER V0.5.2B6E
==============================
Base: B6D + installed MGR016.

CHANGES
- Overview RSVP grid Player-parity: 82 px late override removed; player columns are 42 px desktop / 38 px mobile.
- Edzések and Meccsek use the same compact card geometry: icon → event type → team + attendance count → date/time → opponent (match) or court number (training).
- Csapatok gets a new Rács tab with the whole season, Player-like geometry and coach actual-attendance editing after an event has started.
- Overview standings now use the same full table/columns/horizontal scroll as the standalone Manager Tabella and Player.
- Top primary navigation stays on one horizontal line and scrolls left/right; Beállítások no longer wraps.
- Whole Manager page cannot be dragged sideways. Only explicit tables/grids/navs scroll horizontally.
- Player-style pull-to-refresh added to the Manager page.
- Finance months are September–June (July/August removed).
- Competition license column is one unit wide; each month remains two units (pass + coach fee).
- Settings > Admin permissions includes a club-level Pénzügyek permission with View/Edit controls.

REPLACE IN MANAGER REPO
- app.js
- index.html
- styles.css
- sw.js
- assets/team-logos/ remains from B6D; no changes required but included in package.

DO NOT REPLACE
- config.js

BACKEND
- MGR016 must already be installed.
- Run MGR017 once before B6E so the new finance permission is available and finance RPCs enforce it.
