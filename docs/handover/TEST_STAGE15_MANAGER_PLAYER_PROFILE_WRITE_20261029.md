# Club Control TEST – Stage 15: Manager Player profile write
Date: 2026-10-29 (Europe/Budapest). Scope: **TEST Supabase only** `szzoubvhlwnojtzqjebc`.

## Actual deployment
- `public.cc_manager_player_update_v1(p_payload jsonb)` is now installed.
- TEST migration: `cc_test_manager_player_update_audited_v1_20261029` (25 TEST migrations).
- Code matches the existing Manager player editor `app.js` call.
- Writes the player's `players` base fields and `player_private` license/medical fields as one database function, with one audit row.
- No direct authenticated/anon UPDATE or INSERT on `players`, `player_private`, or `audit_log`. No client credentials/secret keys.
- Anonymous EXECUTE blocked, authenticated EXECUTE granted. Function has empty fixed search_path and validates linked Manager Auth and `competition.players/edit` for every **currently effective** target membership.
- A player with no effective team cannot be edited. The player's email and Auth user link are immutable. Future-start memberships cannot confer write access.

## Validation and discoveries
1. Initial rollback script exposed a malformed SQL date-pattern line in the draft. Fixed candidate source before any TEST migration and removed accidentally duplicated draft body.
2. Actual PostgreSQL role-scoped rollback QA exercised protected-field rejection, required-field rejection, email immutability, invalid jersey and medical dates, positive player+private write, a single audit row, unrelated team denial, missing Auth and anon denial.
3. The first cross-team QA fixture needed to use the target player's immutable email, calculated **before** switching to authenticated RLS role. Corrected test fixture; not a product workaround.
4. The existing database index `team_memberships_one_active_per_player` enforces **one active membership row per player**, regardless of its effective dates. A synthetic multiple-active-team QA fixture was rejected with SQLSTATE 23505. This is a legitimate current database invariant, NOT changed. Instead we added positive uniqueness assertion and a future-only membership denial. The backend nevertheless checks every effective team defensively if the schema ever evolves.
5. Fixed rollback SQL passed real PostgreSQL checks without persisting any user, medical, jersey or license update.
6. GitHub `CC TEST Manager player profile write security` 10 static tests **twice** passed. Manager PWA/import smoke passed.
7. Deployed the reviewed SQL, then repeated the same PostgreSQL QA **against the installed RPC**, without recreating the function. It passed including rollback.
8. [CI security workflow](https://github.com/beacvolleyCC/club-control-manager/actions/workflows/manager-player-update-security-20261029.yml).
9. Source and test files:
   - `docs/security/TEST_MANAGER_PLAYER_UPDATE_CANDIDATE_20261029.sql`
   - `docs/security/TEST_MANAGER_PLAYER_UPDATE_DEPLOY_20261029.sql`
   - `tests/sql/TEST_MANAGER_PLAYER_UPDATE_ROLLBACK_20261029.sql`
   - `tests/sql/TEST_MANAGER_PLAYER_UPDATE_POSTDEPLOY_ROLLBACK_20261029.sql`
   - `tests/manager-player-update-security-20261029.test.cjs`

## API readiness snapshot
Manager named RPCs **10/71** exist; this is a static name inventory that includes legacy and fallback strings. Player named RPCs **16/24** exist. Not every undeployed token represents a necessary new endpoint; consolidate before blindly porting them.

## Remaining issues (not yet done)
- Verify `public.cc_manager_players_v2` read helper: its lateral team_memberships query currently applies `active=true` and `ends_on`, but **not `starts_on <= CURRENT_DATE`**. The Player RLS #81 private helpers were fixed in Stage14, but Manager roster read is a separate effective-date compatibility issue; isolate a narrow TEST-only patch with role-based positive/negative tests.
- Manager `cc_manager_player_transfer_v1` and `cc_manager_test_player_reassign_v1` are separate sensitive writes, NOT implemented. Require deciding how historical/future memberships coexist with the one-active-row unique index. Do not remove that index automatically.
- Manager `cc_manager_player_avatar_update_v1` and creating/archiving players need separate scoped APIs.
- Web-hosted TEST PWA, real Auth/RSVP, iPhone and browser integration remain pending (#31).
- Do not activate notifications or deploy to LIVE. The user-reported away fixture exception is tracked separately.

## Safety and release
- No change to `main`, LIVE Supabase `snqsxlyhontaepembaic`, Player TEST or either vNext branch.
- The new Manager WRITE endpoint is reachable in TEST Supabase, but live-browser use remains unverified until TEST PWA hosting.
- Per-module release remains gated on double QA, 11-point safety QA, real Auth E2E, and explicit user approval before any LIVE patch.
