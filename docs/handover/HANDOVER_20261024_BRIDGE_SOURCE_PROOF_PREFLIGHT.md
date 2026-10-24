# CC-FOLYTATÁS — Bridge official-identity / authorization preflight (2026-10-24)

**Manager draft [PR #75](https://github.com/beacvolleyCC/club-control-manager/pull/75), source only. No LIVE migration, no releases, no PR merge.** Player draft [#27](https://github.com/beacvolleyCC/player_application/pull/27) stays feature flag OFF.

## Revalidated database facts — SELECT only

The original live Supabase `public.cc_competition_mrsz_screenshot_v1.data` uses `matchCode` (example official MRSZ 2699), **not** `officialProtocolMatchCode`. The draft bridge resolved view now looks up `data->>'matchCode'` and requires same `source_key`, `season`, `competition_label`, and `record_kind='match'`. Matching an MRSZ number from a different competition or a standings row **must be rejected**. The direct canonical `mrsz:2026/27:protocol:<code>` source-key route is preserved.

Existing public snapshot v2 SQL was checked read-only: both v2 RPCs are `SECURITY DEFINER` and call the respective v1 functions, which enforce:
- Manager: `private.cc_manager_require_any_v1('competition.matches','view')`.
- Player: `auth.uid()` must resolve to an active player with active, in-date membership of an active team; otherwise `PLAYER_NOT_ALLOWED` / SQLSTATE 42501.
The proposed v3 RPCs invoke their respective v2 RPCs first and are granted to `authenticated` only; they never grant direct approval-table access to `anon` or `authenticated`. **Important:** static/function inspection and synthetic tests do NOT replace live authenticated testing as an unauthorized user; an independent role/JWT authorization security pass is still a deployment gate.

The new `sql/cc_verified_match_bridge_20261024_readonly_preflight.sql` compares historical alias namespace to canonical by exact 2026/27 season, division, directional federation source IDs and kickoff. On **read-only LIVE execution**, there were **41** exact matches marked `CANDIDATE_NOT_APPROVED`. These are **review candidates only**, NOT 41 federation-confirmed identities and NOT 41 mappings to insert. The earlier estimate of 42 should not be reused without reviewing snapshot drift/clock and evidence. Two self-match raw anomalies from divisions 299/709 remain excluded; no cross-league name-based matching is permitted.

## Implemented tests

In `tests/verified-match-bridge-20261024/bootstrap.sql` the synthetic MRSZ report table now models the real `season`, `competition_label`, `record_kind` and `data.matchCode` fields. Added a synthetic positive proof via existing report record with non-direct canonical source key; its official code 2340 is accepted **only** while evidence has correct season/division/report kind. Wrong division and `standings` record kind fail closed; the test restores source state afterward. Existing tests still preserve all original 279 synthetic event rows, 672 RSVPs, 298 canonical matches and 46 Manager event aliases.

Latest check: two disposable PostgreSQL 17 QA databases succeeded in workflow [40079884380](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40079884380). Also verify all eight Manager workflows at the PR final commit if additional files change.

## Remaining hard gates

- **Do not auto-approve BRSZ evidence.** The `official_proof_ref` format check alone is *not* a verification of the external fixture ID; reviewers must actually establish and document the official federation source. Reconfirm the 41 scoped candidates individually if identity insertion is contemplated.
- Explicit release migration approval and rollback review, audited authenticated / unauthorized v3 calls, role/JWT/row-level-access checks, Manager and Player iPhone/browser end-to-end tests, and 11× double QA remain before any deployment.
- Seven existing Manager match events with 15 bookings are a *separate unresolved crosswalk*, not part of the 41 projected fixture candidates. Do not rewrite their event UUIDs or attendance. The 11 source discrepancy review cases remain separate again.
