# CC-FOLYTATÁS — #68 / #19 menetrendütközések rendezése (2026-10-22)

**Release status: INTEGRATION TEST BRANCH ONLY.** Nothing merged to `main`; LIVE Supabase rows, pass balances, attendance and event notifications were not changed.

## Verified conflict and resolution

- The older [Manager #68](https://github.com/beacvolleyCC/club-control-manager/pull/68) and [Player #19](https://github.com/beacvolleyCC/player_application/pull/19) are both **unmergeable against current main** according to GitHub. Their proposed full-import validation requires **exactly 300 user fixtures and 8 scored results** split across five groups.
- The real canonical 2026/27 layer currently returns **298** unique matches and **13** played matches (the two newly staged protocols will bring this to 15 only after future release). The old `all.length!==300` guards cannot be promoted to authoritative match selectors; historical saved results, unique IDs, protocol links and rankings would be at risk.
- Current Manager `ccMrszMergedLeagueMatches_` and Player `ccMrszPlayerAllLeagueMatches_` already give a populated `canonicalMatches` set priority over legacy source arrays. The legacy 300-row source remains available only as fallback/editor evidence, not a replacement for canonical.
- `public.cc_competition_mrsz_screenshot_v1` LIVE read-only check saw **326** raw source rows and **zero** `ui20261018:%` rows; do not assume the stale 300-row fixture is currently stored in this table.
- Both source PRs change the root `app.js` and PWA assets (`index.html`/`sw.js`), which collide with later main fixes, the iOS calendar and official protocol components. **No direct cherry-pick of those whole files.**

## Safe improvements integrated and QA'd

### Player integration branch
`integration/20261022-player-calendar-protocol-qa`

1. `app.js`: fixed a line where the partial-results comment accidentally swallowed `setsFor+=...;setsAgainst+=...`. W/L, sets and points now remain consistent in partial results.
2. `app.js`: `ccPlayerResultsOnlyStandings_` excludes rows explicitly marked `__ccResultConflict`. They remain in the underlying evidence data.
3. `statistics.js`: `ccStatsSource_` excludes those conflict rows (a safe behavior from old PR #19), preventing fabricated form/trend statistics.
4. `tests/player-canonical-partial-stats-20261022.test.cjs`: verifies 3–1 → 3/1 sets, 93:86 points, team results, disputed match exclusion, and a synthetic 298-match canonical dataset taking precedence over an obsolete 300-row import. Also verifies no official rank is fabricated.
5. Integrated Player calendar, #2686/#2700 roster display, PWA versions, league context and existing tests remain green on [Actions 39861553068](https://github.com/beacvolleyCC/player_application/actions/runs/39861553068).

### Manager integration branch
`integration/20261022-manager-calendar-protocol-crosswalk-qa`

1. `app.js`: `ccMatchSourceFind_` now also searches `userMatches` for a **fully matching source system + source key + season**; it does not merge two matches or mutate canonical identities.
2. `tests/manager-canonical-legacy-compat-20261022.test.cjs`: asserts correct lookup, cross-season isolation and canonical 298-match precedence even if a synthetic stale 300-source feed is supplied.
3. `index.html` and `sw.js`: test branch PWA cache generation aligned to `20261022-integration-qa-v6`. Prior `20261020-mrsz-reports-v66` assertions were outdated after later `20261021-manager-login-null-fix-v5`. Two old Manager tests now dynamically compare the HTML version against actual Service Worker cache rather than pinning an old literal.
4. Existing Manager #72 calendar SQL, #73 read-only event crosswalk and #74 protocols were previously verified jointly in two independent PostgreSQL17 databases ([Actions 39843329518](https://github.com/beacvolleyCC/club-control-manager/actions/runs/39843329518)).
5. Current combined integration workflow also tests these changes, while the two existing Manager PWA regressions now pass. Final current-commit CI status must be rechecked before claiming all gates passed.

## Next gates before later release

- Reconcile #68 / #19's *remaining* full-schedule screen behavior against live canonical source and the five-league SQL contract, with read-only fixture date comparisons and unambiguous official fixture IDs. Do not force 300→298 or add 2 synthetic fixtures.
- Decide whether legacy 300-row user import should be shown in a **separate audit-only view**; never replace the canonical list on a count-only heuristic.
- Preserve the current partial standings disclaimer, archived results, the 7 unresolved Manager crosswalk events and every official protocol.
- After underlying database modules are ready: verify migrations in a transaction, real JWT permissions, Apple subscriptions, notifications and the 11-point QA on actual iPhone/Manager/Player.
- Keep Manager #68 and Player #19 open for source review; their GitHub merge conflicts are **not solved by this isolated regression work**.

## What must NOT happen yet

No Github merge to `main`, no Supabase migrations or Edge deployment, no PWA release, no fabricated official ranking, no changing existing `public.events` / `public.availability` rows, no guessing an official MRSZ PDF URL.

## 2026-10-22 késő esti read-only kontroll
Két ismételt LIVE SELECT mérés: **279 esemény, 668 jelentkezés, 298 canonical mérkőzés, 13 lejátszott és 0 új #2686/#2700 LIVE protokollforrás**. A jelentkezésszám a korábbi 667-ről 668-ra változott más rendszertevékenység közben; ezen a tesztágon semmilyen LIVE DML nem futott. A `public.availability` darabszáma dinamikus, kiadás előtt újra mérendő.

Zöld CI: Manager [kombinált 39862460668](https://github.com/beacvolleyCC/club-control-manager/actions/runs/39862460668), [aktuális meccs dátum 39862291638](https://github.com/beacvolleyCC/club-control-manager/actions/runs/39862291638), [jegyzőkönyvjelölések 39862267196](https://github.com/beacvolleyCC/club-control-manager/actions/runs/39862267196); Player [kombinált 39862532882](https://github.com/beacvolleyCC/player_application/actions/runs/39862532882). A tesztek a két integrációs fejlesztési ágon futottak; ezek nem LIVE E2E eredmények.
