# Club Control TEST — stage 4: read-only Player RPC restoration (2026-10-26)

**Only TEST modified**: Supabase `szzoubvhlwnojtzqjebc`; LIVE `snqsxlyhontaepembaic` queried SELECT-only. Both are on Free tier; no paid services or outbound tasks.

Applied migrations:
1. `cc_test_deterministic_read_helpers_20261026`: 9 whitelisted immutable/STABLE invoker utilities including team-name normalization, match patch validation, monthly fee key, test marker/name filter, and BEAC pass parsing.
2. `cc_test_player_bootstrap_read_only_locked_20261026`: four read-only Player backend functions (`cc_player_bootstrap`, `cc_player_display_names`, `cc_player_bootstrap_filtered_v1`, `cc_player_display_names_filtered_v1`). One is marked VOLATILE in LIVE despite read-only SQL, so reviewed the function body instead of blindly requiring STABLE. All have explicit REVOKE EXECUTE from PUBLIC, anon and authenticated.

Verified:
- `private.cc_competition_team_key_v1('BEAC II.') = 'beacii'`, Corvinus = corvinus. Team/group records are not mixed.
- Teszt Játékos detection = true; October season key = 2026-10; guest product category = VENDÉG.
- TEST has 65 public/private functions (includes platform-provided citext functions), 11 RLS policies, zero anon-readable public application tables.
- **Zero** of the four new Player RPC functions can be executed by anon or authenticated as of the readback; they are deliberately locked until synthetic test Auth and RLS checks are available.
- Database size ~13 MB. No LIVE data, fixtures, memberships, or RSVP rows copied; no email, push or Realtime triggers activated.
- Manager and Player TEST apps remain DEMO-only. This is not yet a functional replica of LIVE.

Remaining: audited read-only Manager RPCs; full function/triggers dependency DAG; restricted EXECUTE grants with separate test identities and realistic synthetic data; communication/no-outbound guarantees; LIVE-like mobile test releases. Do not replicate production SECURITY DEFINER privileges blindly, and do not turn on clients before these gates pass.

0 Ft external-cost rule remains absolute.
