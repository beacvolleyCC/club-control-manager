CLUB CONTROL MANAGER V0.5.2B6D
==============================
Base: B6C + B6B/B6A/B5T functionality retained.

MAIN CHANGES
- Overview: single dropdown team context (Mind / Női I / Női II / Férfi).
  It drives attendance, upcoming data and standings. Mind shows all three contexts.
- Overview standings: MGR014 remains primary, MGR016 canonical fallback prevents an empty
  Tabella when the older wrapper is unavailable.
- Attendance grid: Player-parity compact max-content geometry; desktop no longer stretches
  player cells to fill the whole panel.
- Competition event cards reordered: icon -> event type -> team/headcount -> date -> detail;
  compact two-row mobile layout.
- Teams: compact team filter + edit row, summary moved below roster, new Felszerelés tab.
- Equipment: jersey number/size, shorts size, price, production, payment and handover status.
- Mass sport: whole training row opens detail; registration gate moved into detail; four actions;
  equal summary boxes; neutral attendance slider, full green/red after selection; cleaned roster detail.
- Landscape safe-area / Dynamic Island handling.
- New top-level Pénzügyek: Versenycsapatok / Bérletek / Beállítások / Napló.
- Competition finance matrix: competition license + monthly pass/tagdíj + coach fee.
  Canonical automatic data remains base; Manager can make audited overrides with method/date/payee/note.
- Finance settings feed Player P14F.
- Finance audit combines payment override history with finance-settings and equipment audit.
- Pass analytics includes sold count, revenue/month chart and current registration context.

REPLACE IN MANAGER REPO
- app.js
- index.html
- styles.css
- sw.js
- assets/team-logos/ (replace/add the folder)

DO NOT REPLACE
- config.js

BACKEND
- Install MGR016 first. MGR015 remains installed and must NOT be rerun.
