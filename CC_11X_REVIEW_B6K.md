# Club Control Manager V0.5.2B6K — 11× QA

Date: 2026-10-04
Baseline: V0.5.2B6J + installed MGR021/MGR022 contracts
Scope: mobile standings/finance containment; coach RSVP moved to Teams grid; not-going editability.

## 1. Product / Business — PASS (static)
- Coach RSVP editing lives in Csapatok → Rács, not Overview.
- Coach states are going / unknown / not_going.
- Full-admin vs own-row authority remains server-side in MGR021.

## 2. UX / Information Architecture — PASS (static)
- Overview remains read-oriented for players/events.
- Coach attendance intent is edited in the team season grid.
- Finance filters/header remain outside the horizontally scrollable matrix.

## 3. UI / Design System — PASS (static)
- Coach selector uses compact Player-style ✓ / · / ✕ control.
- Mobile standings sticky columns are reduced to rank + compact team width.
- Standings and finance matrices own horizontal scrolling.

## 4. Frontend / PWA / Device — PASS static; LIVE SMOKE PENDING
- app.js syntax PASS.
- sw.js syntax PASS.
- cache/build bumped to B6K.
- config.js intentionally excluded.
- Physical iPhone/Android/desktop smoke still required.

## 5. Backend / API — PASS by existing contract; LIVE SMOKE PENDING
- No new SQL required.
- Coach write uses cc_manager_coach_availability_set_v1 from MGR021.
- not_going is already an accepted backend state.

## 6. Database / Data Integrity — PASS by contract
- No schema/data mutation in this frontend build.
- Existing coach availability rows remain canonical.
- No fee/attendance data rewriting added.

## 7. Architecture / Integration — PASS
- Overview matrix and Teams grid use the same canonical event/player data.
- Coach editing is no longer duplicated across Overview and Teams.
- MGR022 remains the finance reconciliation backend from B6J.

## 8. Security / Permissions — PASS by source review; LIVE ROLE SMOKE PENDING
- Empty/new coach cells no longer default to uneditable for authorized users.
- Client fallback mirrors full-admin / own-row intent.
- MGR021 remains authoritative and rejects edits to another coach for non-admins.

## 9. QA / Performance / Accessibility — PASS static
- Duplicate HTML IDs: 0.
- CSS brace balance: PASS.
- CSS parser errors: 0.
- Coach buttons have aria-label/title for all three states.
- Wide table scroll is contained locally.

## 10. DevOps / Release / Rollback — PASS static
- Frontend-only B6K replacement.
- B6J remains rollback baseline.
- ZIP integrity and SHA256 verified at packaging.

## 11. Motion / Interaction — PASS static; TOUCH SMOKE PENDING
- Coach controls use direct tap targets and do not trigger row navigation.
- Horizontal table gestures remain on local scroll containers.
- Pull-to-refresh exclusion list still includes standings, finance and grid scroll surfaces.

## Live checks after deploy
1. iPhone: Tabella starts flush-left and scrolls only inside the table.
2. iPhone: Pénzügyek → Versenycsapatok header/filter does not move horizontally; matrix does.
3. Csapatok → Rács: full admin can set ✓ / · / ✕ for every coach.
4. Coach account: only own coach cells are editable.
5. Overview: no coach edit columns remain.
