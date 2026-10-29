# Club Control TEST Stage18 – designated test-player instant reassignment
Date: 2026-10-29. Target: isolated TEST Supabase `szzoubvhlwnojtzqjebc`, **not LIVE**.

## Implemented
- `public.cc_manager_test_player_reassign_v1(p_player_id uuid,p_team_id uuid)` deployed.
- TEST migration `20261029221847 cc_test_manager_designated_test_player_reassign_v1_20261029`.
- Matches existing Manager UI route for test players; modifies **only current active team membership's team_id**. Does not create or delete membership history or edit RSVPs.
- Limited to designated existing TEST player ID, prelinked Auth account and server-side test name marker. This is intentionally narrower than the Manager UI's textual test marker.
- Requires authenticated Manager `competition.players/edit` for BOTH source and target teams, active source/target and effective current membership.
- Rejects a future confirmed old-team 'going' RSVP, same-team transfer, non-test player or absent Auth.
- One audit record on success; no push/email/new event.
- `anon` EXECUTE false, `authenticated` true. No direct table write grant.

## Validation
1. Real PostgreSQL rollback QA with synthetic transfer and unrelated-player denial: PASS.
2. GitHub Actions [Stage18 static security QA](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40964839055): **6/6 tests twice PASS**.
3. Candidate deployed to separate TEST DB; re-ran rollback QA against installed function without recreating it: PASS.
4. Manager PWA safety and Manager import smoke CI green.
5. Postdeploy baseline: **28** TEST migrations; **19** players, **21** memberships, **66** RSVPs, **0** audit rows, **0** pushes. The designated test player remains on the same team with the original three membership rows.
6. LIVE Manager/Player/Supabase and modular vNext branches unchanged.

## Files
- SQL: `docs/security/TEST_MANAGER_TEST_PLAYER_REASSIGN_STAGE18_20261029.sql`
- PostgreSQL candidate QA: `tests/sql/TEST_MANAGER_TEST_PLAYER_REASSIGN_STAGE18_ROLLBACK_20261029.sql`
- Postdeploy QA: `tests/sql/TEST_MANAGER_TEST_PLAYER_REASSIGN_STAGE18_POSTDEPLOY_ROLLBACK_20261029.sql`
- Node: `tests/manager-test-player-reassign-stage18-20261029.test.cjs`.

## Remaining gates
- HTTPS/real iPhone Manager+Player Auth/RSVP end-to-end acceptance remains pending.
- Manager UI's name-based test marker could route **other** test-named players to this intentionally restricted RPC; for future multiple test users, provide explicit server-side designation and harmonize Manager UI.
- Regular competition-player transfers are handled separately by Stage17 today-only audited RPC; date scheduling needs a separate design.
