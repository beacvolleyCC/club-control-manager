# Club Control TEST — stage 5: Manager read RPCs, closed by default (2026-10-26)

**All mutations ONLY in the independent Supabase Free TEST project `szzoubvhlwnojtzqjebc`.** LIVE `snqsxlyhontaepembaic` was inspected with SELECT queries only. No external e-mail/push senders, additional charge, or LIVE deployment.

Migration: `cc_test_manager_read_rpcs_locked_20261026`.

Installed **13** function definitions in TEST:
- Reimplemented `private.cc_manager_current_account_v1()` as a STABLE, SECURITY DEFINER, strictly **read-only** function which requires `auth.uid()`, matching JWT email and an **already pre-linked** active manager account. It cannot automatically bind `auth_user_id`, nor produce LIVE-like audit side effects.
- Reviewed and reproduced 4 internal Manager permission helpers `cc_manager_can_v1`, `cc_manager_has_any_v1`, `cc_manager_require_v1`, `cc_manager_require_any_v1`.
- Reviewed and reproduced eight selected read-only Manager RPCs: `cc_manager_bootstrap_v1`, `cc_manager_teams_v1`, `cc_manager_overview_v1`, `cc_manager_players_v2`, `cc_manager_calendar_v3`, `cc_manager_events_v1`, `cc_manager_rsvp_matrix_v1`, `cc_manager_competition_results_v1`.
- All 13 new functions have explicit `REVOKE ALL ... FROM PUBLIC,anon,authenticated`. The `private` schema is not exposed to anon.

Readback:
- public/private PostgreSQL functions: **78** (LIVE: 337; includes platform/extension functions)
- TEST RLS policies: **11**.
- TEST public/private tables SELECT-accessible to `anon`: **0**; to `authenticated`: **0**.
- `cc_manager_%` RPCs executable by `anon`: **0**; by `authenticated`: **0**.
- TEST DB size: **~13 MB**.
- Explicit `SET LOCAL ROLE anon; SELECT private.cc_manager_current_account_v1()` attempt denied with `permission denied for schema private` as expected; note the SQL query tool surfaced expected denied access as an error, not a failed migration.

**Not yet operational:** No test Auth users, Manager accounts, seeds, test RLS functional cases or grants; the client apps are still DEMO-only. Other Manager read RPCs and LIVE side-effectful routines remain absent; no network/notification triggers activated.

Next: isolated fake player/team/calendar/RSVP synthetic data (not LIVE clones), dedicated TEST Auth users/admin links, access controls and per-team isolation tests. For web app integration, restore any additional needed read RPCs, then allowlist SELECT and EXECUTE minimally for authenticated and check both Manager and Player real staging behavior. Maintain 0 Ft costs and no LIVE write operations.