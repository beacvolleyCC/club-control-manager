# Club Control vNext – isolated modular rebuild (2026-10-29)

## User-approved direction
The existing Manager and Player are maintained as separate legacy/current applications. Once the shared TEST database and authenticated TEST apps are ready, rebuild vNext module by module, on isolated branches. Patch only individually completed and accepted modules into the current system at a later stage.

## Repositories and boundaries
- Manager current TEST: `test/20261026-manager-document-intake`; snapshot: `80cf8aea056f87e9c279dda41e231669d0616d57`
- Player current TEST: `test/20261026-isolated-player-mobile`; snapshot: `70c2d77f62fd14d56c99b1051897844ff2ea63c2`
- Isolated rebuild branch in EACH existing repo: `vnext/20261029-modular-rebuild`
- LIVE: both `main` branches, GitHub Pages and Supabase `snqsxlyhontaepembaic` are out of bounds. No patch to LIVE without a new explicit request.
- TEST database: `szzoubvhlwnojtzqjebc`; do not let vNext introduce breaking schema changes while existing TEST apps still consume it. No staging database migration or real data import until the backend foundation review is complete.
- No new repository, paid Supabase branch, deployment, Cloudflare project, push, SMTP or payments required for this preparation.

## Phases
0. Finish and independently verify shared TEST database model, RLS (Manager #81), Manager read/write contract parity, Player required APIs, authenticated Player RSVP (#31), isolated TEST HTTPS environments when desktop is available.
1. New shell/navigation/login/roles/team switcher, with UI behavior planned module by module.
2. Team/roster/player directory.
3. Calendar/events/venues and event series.
4. RSVP, attendance, cancellations, waiting lists.
5. Mass sport/SPORT7/passes.
6. Competitive matches, source identities, standings.
7. Protocols, statistics, previous seasons.
8. Finance reporting and BEAC reconciliation.
9. In-app notifications, push, calendar subscriptions.
10. Settings, intake/import, audit.
Later: coach practice planning, score and rotation timeline, based on the user's UI sketch.

## Patch gate (per module)
- A complete, documented contract and explicit data owner.
- Role/team-specific access, active/effective-date membership checks, no cross-team/league leakage.
- Authenticated TEST integration QA, including denied writes, session expiry and logout.
- No exposed secrets or athlete-private files in built artifacts.
- 11-point QA plus two independent checks; passing CI is necessary, not sufficient.
- No backwards-incompatible DB operation against current TEST clients.
- User approves the completed module's UX and the patch target.
- Open reviewable PR/patch for one module at a time, only after approval.
- Separate explicit LIVE release approval after full regression and rollback plan.

## Source of truth
`docs/architecture/CC_MODULAR_REBUILD_ROADMAP_20261029.md` and
`docs/architecture/CC_TEST_API_CONTRACT_INVENTORY_20261029.json` on the Manager TEST branch.
The existing TEST-apps remain operational as currently configured; this branch is *not* a new public TEST PWA and contains no new deployed functionality.

## Safety CI
The vNext workflow only validates source/build guards and tests. It never deploys or mutates Supabase.
