# Stage 16 — Manager roster effective membership date (#82) — TEST-only
Date: 2026-10-29; tested target: Supabase TEST `szzoubvhlwnojtzqjebc`.

## What changed
- Replaced only the existing `public.cc_manager_players_v2(uuid,text)` function.
- Membership selection now requires `tm.active=true AND tm.starts_on<=CURRENT_DATE AND (tm.ends_on IS NULL OR tm.ends_on>=CURRENT_DATE)`.
- Current roster display requires active team `t.active=true` and a non-null effective `m.team_id`.
- Preserved the existing Manager `competition.players/view` global/team permission checks and all response fields. Existing `authenticated` EXECUTE remains true and `anon` false; no table grants were changed.

## Verification
1. Original future-start membership leak reproduced on TEST with a real Manager JWT, `SET LOCAL ROLE authenticated`, and `BEGIN/ROLLBACK`.
2. Candidate fixed the leak; real rollback QA tested valid global and team-scoped access, future/expired/inactive membership, inactive team, inclusive current-day start/end, and missing JWT.
3. GitHub regression workflow [success](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40962956336): 5 static security checks run twice, no errors.
4. Migration applied **TEST only**: `20261029220440 cc_test_manager_roster_effective_membership_date_v1_20261029`.
5. Post-deploy verification independently ran the same PostgreSQL access matrix **without recreating the function**. PASS.
6. Post-deploy DB readback: start-date/team-active predicates present; `anon` execute false, `authenticated` execute true; 19 players, 21 team memberships, 66 RSVPs, 0 audit records, 26 TEST migrations.
7. Manager PWA and import CI green on TEST branch.
8. SQL: `docs/security/TEST_MANAGER_PLAYERS_V2_EFFECTIVE_DATE_CANDIDATE_20261029.sql`.
9. Rollback suites: `tests/sql/TEST_MANAGER_PLAYERS_V2_EFFECTIVE_DATE_ROLLBACK_20261029.sql` and `tests/sql/TEST_MANAGER_PLAYERS_V2_POSTDEPLOY_ROLLBACK_20261029.sql`.

## Open release gates
- LIVE databases and Manager/Player `main` unchanged. No production deploy.
- Browser/iOS authenticated TEST PWA QA still pending, especially Player #31.
- Team transfer and history-aware memberships are separate work. Current unique index allows only one active membership per player.
- No impact on the already corrected LIVE Radzeer SE vs BEAC II November 3 away fixture.

## QA note
PostgreSQL positive/negative permissions and rollback QA PASS, GitHub static regression PASS. Real mobile/browser tests NOT claimed as done.
