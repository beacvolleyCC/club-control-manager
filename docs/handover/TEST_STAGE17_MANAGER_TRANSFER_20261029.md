# Club Control TEST – Stage 17 Manager same-day player transfer
Date: 2026-10-29. Target: **TEST Supabase `szzoubvhlwnojtzqjebc` only**.

## Implemented
- `public.cc_manager_player_transfer_v1(p_player_id uuid,p_team_id uuid,p_starts_on date)`, exact API already called by the Manager player-transfer screen.
- Applied migration: `20261029221359 cc_test_manager_player_transfer_safe_today_v1_20261029`.
- One active membership per player maintained. The previous membership is deactivated with a recorded end date and is **not deleted**. A new target membership is inserted with today's date.
- Denies backdated/future transfer requests. Future-effective transfers require a separate scheduled transfer design.
- Checks authenticated Manager and `competition.players/edit` for **both** source and destination teams, active player and active teams.
- Refuses the transfer while the player has a confirmed `going` RSVP to a future active old-team event. No automatic transfer of any RSVP.
- Does not mutate availability, historical event records or athlete identity. Audit recorded within the same transaction; no email/push.
- `anon` RPC execute false; `authenticated` execute true. No direct table write permissions added.

## Verified
- PostgreSQL rollback matrix against the candidate: PASS, including successful date-now transfer, pre-existing RSVP preservation, cross-team denied, future-going RSVP denied, auth missing/anon denied, old membership retained, exactly one audit entry and no push.
- GitHub Actions [security QA](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40964201843): **6/6 checks twice PASS**.
- Applied function in TEST Supabase; reran PostgreSQL rollback matrix **without replacing function**: PASS.
- TEST baseline after verification: 27 migrations, 19 players, 21 memberships, 66 RSVPs, 0 audit rows, 0 push outbox rows. All synthetic transfers rolled back.
- Manager PWA safety CI and Manager import-intake smoke CI green.

## Important tradeoffs and next tasks
- Existing `team_memberships_one_active_per_player` partial index rules out multiple active membership rows. No schema/index change.
- If an old membership starts **today**, closing it with `ends_on=today` while `active=false` preserves the nondecreasing date constraint. The membership is not effective after deactivation. This is not a dated half-day membership system.
- A pending future confirmed old-team RSVP must be reviewed separately before moving the player. This conservative V1 avoids silently orphaning or migrating game commitment.
- The Manager UI has a **separate test-player instant reassignment** route `cc_manager_test_player_reassign_v1`; that is NOT implemented in this stage. It needs a separate audited design.
- Real hosted TEST PWA / iPhone auth and RSVP tests pending. LIVE Manager, LIVE Player, LIVE Supabase and vNext untouched.
- Next: implement safe test-player reassignment or UI messaging for day-only transfer and the future-RSVP block; plan effective-date transfer scheduling and historical roster semantics separately.

## Files
- Candidate: `docs/security/TEST_MANAGER_PLAYER_TRANSFER_STAGE17_CANDIDATE_20261029.sql`
- Real PostgreSQL QA: `tests/sql/TEST_MANAGER_PLAYER_TRANSFER_STAGE17_ROLLBACK_20261029.sql`
- Post-deploy QA: `tests/sql/TEST_MANAGER_PLAYER_TRANSFER_STAGE17_POSTDEPLOY_ROLLBACK_20261029.sql`
- Static CI: `tests/manager-player-transfer-stage17-20261029.test.cjs`
