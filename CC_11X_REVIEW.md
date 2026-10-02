# Manager V0.5.2B5Q — roster/filter/mass-sport UX correction

1. Product — PASS static: Player directory gains working team/search/medical filters plus grouping and sortable measured fields; competition matrix is read-only overview; actual attendance is edited only in event detail.
2. UX — PASS static: unified filled-triangle dropdown language; mass training rows have inline collapsible rosters; mass event detail has per-athlete disclosure plus Mind kinyit / Mind becsuk.
3. UI — PASS static: player name typography reduced to surname semibold + given name regular; mass gray person stripe removed; level-colour gradient replaces it; Overview match cards are overflow-contained.
4. Frontend/PWA — PASS static: app.js passes Node syntax check; CSS brace counts match; cache/build bumped to B5Q.
5. Backend/API — PASS by existing contract: no new RPC required; existing Manager scoped RPCs retained. Event roster notes are displayed when returned by the existing roster RPC.
6. Data integrity — PASS by contract: no direct table writes added; attendance writes keep existing RPC and status values; team/event IDs unchanged.
7. Architecture — PASS: existing shared player/event card renderers retained; new disclosure/filter helpers are additive.
8. Security — PASS static: no service_role/secret added to frontend; permissions checks remain in place.
9. QA/accessibility — PASS static: dropdowns retain native select semantics; disclosure/roster controls are buttons with aria-expanded; duplicate static HTML IDs: 0.
10. DevOps — PASS: frontend-only Manager release; config.js intentionally excluded.
11. Motion/interaction — PASS static: Player-style attendance slider code retained; competition overview grid has no accidental write controls.

Regression locks:
- runCompetitionSourceSync_: SHA256-equivalent function body vs B5P — PASS
- BRSZ Edge/Browser Helper — NOT MODIFIED
- MGR015 schedule identity backend — NOT MODIFIED
- player-animals.webp (approved 60-avatar atlas) — byte-identical to B5P — PASS
- live authenticated browser smoke — PENDING
