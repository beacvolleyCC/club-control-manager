# Club Control TEST – Stage 12 security and parity audit
Date: 2026-10-28 (Budapest). All changes in the TEST branches only.
This document records a point-in-time audit, not a release approval.

## Actual branch changes
- Manager TEST: review-only SQL candidate at `docs/security/TEST_RLS_MEMBERSHIP_DATE_CANDIDATE_DO_NOT_APPLY_20261028.sql`.
  Explicitly **not deployed** to any Supabase project; it is outside the migration directory.
- Manager TEST: synthetic date/membership negative and positive model tests at
  `tests/manager-membership-date-rls-candidate-20261028.test.cjs`, executed twice
  by the Manager PWA-safety GitHub workflow. These are NOT real PostgreSQL RLS tests.
- Player TEST: `rsvp-reliability.js` only clears a visible failure after a successful
  acknowledged write to the same event. An unrelated successful event cannot hide
  that failure. Ten Node VM tests exercise rollback, retries, queued writes,
  cross-event isolation and notes. The RSVP and bundle tests run twice in CI.
- Player issue #31 remains open pending actual hosted TEST sign-in/RSVP acceptance.

## Supabase TEST read-only audit
Project ref: `szzoubvhlwnojtzqjebc`. No schema/data mutations performed.
- 3 teams, 19 players, 21 memberships, 11 events, 66 availability rows (snapshot).
- No future-dated memberships existed in the snapshot (0). Two memberships were
  expired and two inactive. Therefore the future-start exposure must be verified
  with isolated synthetic fixtures before the RLS issue can be closed.
- Existing private.current_team_ids() does NOT test starts_on or teams.active.
- Existing private.player_in_my_team(target_player uuid) does NOT test target
  starts_on, ends_on, target player active or teams.active.
- Existing helper functions are SECURITY DEFINER with empty search_path and
  auth.uid-scoped current-team selection. The audited private helpers were not
  executable by anon; existing authenticated EXECUTE privileges were retained.
- events SELECT and availability SELECT/INSERT/UPDATE RLS depend on these helpers.
- No broadening of table grants, RLS policies or function execution rights was done.

## Confirmed Manager / Player API entry points
The public `cc_manager_*` set currently contains eight authenticated-only
read endpoints: `cc_manager_bootstrap_v1`, `cc_manager_teams_v1`,
`cc_manager_overview_v1`, `cc_manager_players_v2`,
`cc_manager_calendar_v3`, `cc_manager_events_v1`,
`cc_manager_rsvp_matrix_v1`, `cc_manager_competition_results_v1`.
None grants EXECUTE to anon.
No `cc_manager_*`-named write RPC was found in this catalog. This does NOT prove
that no other custom write path exists; inspect direct-table client writes and
other function families before designing Manager write parity.

Player has authenticated-only `cc_player_*` endpoints for bootstrap/profile,
medical status, team avatar directory, notifications (read/dismiss),
competition standings/league and team statistics, official snapshot bridge,
and competition schedule. The TEST catalog showed no anon EXECUTE for those.
Presence does not prove full LIVE parity or real-device success.

## Gate for Manager Issue #81
1. Independent review of the two proposed SQL definitions against current TEST definitions and grants.
2. Run privileged preflight that confirms exact TEST project and signatures.
3. In a separate synthetic TEST transaction, test own active current BB2 membership,
   future-start membership, expired membership, inactive membership, inactive
   linked player, inactive team, unrelated team, missing Auth, and cross-team
   availability write denial; check both read and write authorization.
4. Verify anon denial and Manager module privileges remain unchanged.
5. Only then consider applying an approved migration to TEST; review RLS and
   repeat negative tests. Never apply to LIVE without explicit approval.

## 11-point QA snapshot (not a release certificate)
1. TEST-only GitHub: PASS; LIVE main heads unchanged at
   Manager `90df6cfd3f630f10bea9c2acae769047d2154f04` and
   Player `51fb2248c379d47c80bfb56aec3dd4e510a5885e`.
2. PWA config/cache identity: STATIC PASS via independent TEST workflows;
   on-device installation not checked.
3. No secrets or athlete-private files in the TEST static bundle: STATIC PASS.
4. Auth bootstrap, logout/relogin: DB profile read previously passed; on-device PENDING.
5. Membership RLS for future start and inactive teams: BLOCKED (#81; plan only).
6. Player RSVP yes/no/neutral/note persisted through actual backend reload: PENDING
   real authenticated end-to-end; Node simulation PASS.
7. Offline/failed writes, stale response and per-event race: Node VM PASS (10/10 x2);
   on-device network/RLS behavior PENDING.
8. Manager team picker/calendar/RSVP matrix/results: read RPC smoke passed earlier;
   full UI and write parity PENDING.
9. Separate women's BB1, BB2/B and men's A competition contexts: synthetic
   source and regression QA; full official snapshots and real-device validation PENDING.
10. Push/SMTP/payment: no activation; TEST has zero push outbox records.
11. Double QA: Manager static plan and Player RSVP/bundle suites run twice in CI;
    no manual iOS acceptance yet. No Cloudflare Pages deployment authorized.

## Safe next development
- Resolve #81 with independently reviewed, TEST-only real RLS integration tests;
  do not override a prior security access blocker.
- Plan Manager writes by module, first confirming their actual current DB contracts
  and authorization, rather than adding broad table grants.
- Keep Player #31 open until a dedicated hosted TEST HTTPS URL exists and actual
  authenticated save/reload, denial and rapid-toggle tests pass.
- Keep official competition class/team boundaries disjoint.
- Cloudflare Pages setup deferred until desktop access; do not invent a TEST URL.
