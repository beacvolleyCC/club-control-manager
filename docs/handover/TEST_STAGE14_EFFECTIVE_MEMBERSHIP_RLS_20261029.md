# Club Control TEST – Stage 14: Player team-membership effective-date RLS
Date: 2026-10-29 (Budapest). Scope: **TEST only** (`szzoubvhlwnojtzqjebc`).

## Result
Manager issue #81's missing membership start-date lower bound was reproduced, fixed,
and independently tested in the TEST PostgreSQL database. No change to LIVE, vNext
branches, PWA builds, or production data.

The two existing **private** functions were replaced using deployment SQL
`docs/security/TEST_RLS_MEMBERSHIP_DATE_DEPLOY_20261029.sql`:
- `private.current_team_ids()`: linked caller `auth.uid()`, active player,
  active team, active membership, `starts_on <= CURRENT_DATE` and
  `ends_on IS NULL OR ends_on >= CURRENT_DATE`.
- `private.player_in_my_team(uuid)`: target player active, target team active,
  target membership active and within the same inclusive dates; target's team
  must be among caller's current team IDs.

Downstream policies for `teams`, `events`, `availability` and
`players` continue to reference these helpers. No policy text, table-level
grants, function EXECUTE ACL or Manager module permission was changed.

Migration applied to Supabase TEST:
`20261029142152 cc_test_player_membership_effective_date_rls_fix_20261029`.
There are **24 TEST migrations** after this change.

## Proof / two independent levels of verification
1. **Reproduced prior bug with rollback**: future-start membership incorrectly
   exposed a team and its events using the old helper.
2. **Before deploy**, ran real authenticated-role PostgreSQL transactions against
   the candidate helpers inside `BEGIN; ... ROLLBACK`. All passed.
3. GitHub CI validated the exact deployed SQL against the reviewed candidate,
   its unmodified private signatures and restrictive, fixed-search-path
   definitions: **14/14 tests ×2 PASS**. The full RLS rollback SQL is saved.
4. **After deploy**, reran the RLS matrix directly against the **persisted**
   functions (without overriding them in the transaction). All passed, including:
   - valid active linked caller/teammate and team/event/RSVP SELECT policies;
   - unrelated player/team isolation;
   - future-start caller and future-start teammate denied;
   - expired and inactive membership denied;
   - inactive player/team denied;
   - current-day inclusive start/end accepted;
   - missing JWT denied;
   - no anonymous EXECUTE on either helper.
5. Re-ran the entire post-deploy regression from
   `tests/sql/TEST_RLS_MEMBERSHIP_POSTDEPLOY_ROLLBACK_20261029.sql`.
   Changes to synthetic dates, team/player flags, and RLS views all ROLLED BACK.
6. Readback confirmed counts: 3 teams, 19 players, 21 memberships, 11 events,
   66 RSVP, 0 audit_log, 0 push outbox. Existing function ACLs remained
   authenticated=true, anon=false.
7. GitHub Manager PWA safety and import smoke CI passed on the updated TEST HEAD.

## 11-point QA verdict
1. TEST/LIVE separation: PASS, checked.
2. Config/build and cache isolation: no code change; previously passing static QA.
3. No credentials or secrets disclosed: PASS.
4. Auth/JWT-null negative PostgreSQL: PASS; real browser Auth E2E PENDING.
5. Effective-date team/player RLS and cross-team denial: PASS.
6. RSVP access (SELECT) under current/future membership: PASS; live browser
   save/reload via HTTPS still PENDING Player issue #31.
7. Offline and concurrent RSVP races: no code change; previous Node CI passed,
   real iPhone PENDING.
8. Manager module rights unchanged: PASS by source/ACL checks;
   real browser acceptance PENDING.
9. Competition team/league context unchanged: PASS (no match data modified).
10. No external push/email/payment actions: PASS, 0 push outbox.
11. Independent database + double automated QA: PASS; iOS device QA pending.

## Residual Supabase advisor warnings
The project continues to report pre-existing advisories:
- [RLS enabled / no policy, 50 INFO](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
  (many intentionally closed tables; assess individually, not bulk grant).
- [Mutable function search path, 2 WARN](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable).
- [Extension in public, 1 WARN](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public).
- [Authenticated SECURITY DEFINER functions, 25 WARN](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- [Leaked password protection, 1 WARN](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
No blanket permission changes were made to resolve advisor warnings.

## Still outstanding
- Manager source 9/71 named `cc_manager_*` RPCs installed; some others
  are legacy/fallback, require domain classification. Implement safe writes next.
- Player 16/24 source-named RPCs installed; #31 hosted sign-in/save/reload
  acceptance pending.
- Deploy isolated Manager/Player TEST HTTPS PWA when desktop is available;
  complete real iPhone Auth, notifications and calendar smoke.
- Existing current/LIVE versions retained; rebuild module-by-module in
  `vnext/20261029-modular-rebuild` only after shared DB and TEST UI gates.
- Independently track the user-reported 2026-10-30 -> 2026-11-03 away-fixture
  manual-edit exception; no automatic LIVE match mutation or notification.
