# Club Control Manager V0.5.2B5M — Unified Player / Roster UI

Date: 2026-10-02
Baseline: V0.5.2B5L
Scope: frontend-only player/roster UI unification + player list grouping.

## Included
- Reference-style wide player card:
  - animal avatar + license number
  - large jersey number
  - surname in uppercase + given name
  - medical / position / jersey / shorts / display-name chips
  - team + membership date
  - training/match attendance stats
  - large right chevron
- Same player card component used in:
  - Játékosok
  - Csapatok roster
  - Meccs detailed roster
  - Edzés detailed roster
  - expandable event rosters
- Játékosok filter adds:
  - Összesített lista
  - Csapatonként
  - existing multi-team selection
  - existing name/email/license search
  - existing medical filter
- Grouped mode renders selected teams as separate roster sections.

## 11× review
1. Product/function — PASS static. Requested list/group modes and shared card component implemented.
2. UX/IA — PASS static. Grouped/combined mode lives in Filters; multi-team filter remains.
3. UI/visual consistency — PASS static. One shared card renderer is used across relevant Manager roster surfaces.
4. Frontend/PWA — PASS. `node --check app.js` and `sw.js`; cache/build bumped to B5M.
5. Backend/API — PASS/no change. No RPC signature or backend code changed.
6. DB/data integrity — PASS/no change. No database write path changed.
7. Architecture — PASS. Event roster rows are enriched from canonical loaded player data before rendering.
8. Security — PASS/no change. No secrets or direct table writes added.
9. QA/performance/accessibility — PASS static. Keyboard-open cards, responsive CSS, zero duplicate HTML IDs.
10. DevOps/rollback — PASS. Frontend-only four-file replacement; rollback is B5L.
11. Motion/interaction — PASS static. Existing RSVP sliders remain unchanged; BRSZ sync function remains byte-identical.

## Regression locks
- `runCompetitionSourceSync_`: byte-identical to B5L.
- `ccCompetitionRsvpSlider_`: byte-identical to B5L.
- No Edge Function / SQL migration required.
- `config.js` is NOT included and must not be replaced.

## Runtime smoke after deploy
1. Játékosok → Szűrők → Nézet → Összesített lista.
2. Switch to Csapatonként; verify team sections stack vertically.
3. Select 2 teams; verify only those two roster sections remain.
4. Search by name/email; verify grouped results filter correctly.
5. Csapatok → verify same wide cards.
6. Open a match and training → verify same wide cards + existing RSVP controls.
7. BRSZ refresh button still functions.
