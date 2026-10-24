# Club Control — CC-FOLYTATÁS, verified match bridge Client/DB QA handover (2026-10-24)

**Development only; no live migration, merge, or production application deployment.**

## Branch/PR state
- Manager draft [PR #75](https://github.com/beacvolleyCC/club-control-manager/pull/75), branch `feat/20261024-verified-canonical-bridge-stage1` (from Manager main).
- Player draft [PR #27](https://github.com/beacvolleyCC/player_application/pull/27), branch `feat/20261024-verified-match-bridge-player` (from Player main), depends on #75.
- Existing audit Manager #73 (11 source discrepancies + 7 unmatched Manager events), protocol Manager #74 (MRSZ #2686/#2700), calendar Manager #72 + Player #25, Player protocol #26 stay independent and unmerged.
- DO NOT blindly merge outdated Manager #68 / Player #19 and #17. Preserve all existing Manager and Player main behavior.

## Architecture
- Manager and Player share *identical SHA* `70e6a1344b375f11549eebfdbe414857b9ab1da1` for `competition-match-bridge.js`.
- Both clients keep `CANONICAL_BRIDGE_V3_ENABLED: false`; production **continues calling the existing authenticated v2 snapshot**.
- Future optional v3 uses authenticated `cc_manager_competition_mrsz_snapshot_v3` / `cc_player_competition_mrsz_snapshot_v3` and adds `verifiedLegacyMatchBridge` to the exact v2 JSON shape.
- Missing RPC fallback to v2 is **restricted** to a missing *specific v3 RPC* (PGRST202/42883). Network/JWT/permission failures do not fall back silently.
- Client-side matching verifies `verified:true`, explicit official verification marker, source key, precise match UUID, 2026/27, and specific competition label. Conflicting legacy IDs / canonical IDs / source keys are quarantined, not selected by array order.
- Only canonical display rows are annotated (`_ccVerifiedLegacyMatchId`, `_ccBridgeVerified`); no Manager event ID, RSVP, `availability`, personal roster, result or match UUID is rewritten. Manager and Player league selection behavior stays scoped by team/league.
- The private approval source never gives Player direct `SELECT` privileges and is initially empty. Approval source requires manual official-source evidence, NOT automatic name/time matching.
- Player's previously undated postponed fixture cards now explicitly display **„Halasztva · Időpont nélkül”**.
- PWA assets and service workers have synchronized `20261024-verified-bridge-v1` version tokens on both draft branches, protecting against mixed cached JS.
- Partial team results never produce a fabricated official rank (`position:null`) or table points (`tablePoints:null`). Old test assertions were corrected to preserve the live source contract.

## QA

Manager SQL stage has passed two independent disposable PostgreSQL 17 databases, each with synthetic 279 events / 672 bookings / 56 legacy match IDs / 46 Manager aliases / 298 canonical matches. Tests cover no auto-approved rows, cross-league and home/away blocking, wrong MRSZ code, immutable source fingerprints, guarded rollback/reapply, private RLS/role grants.

Manager browser source tests and Player source tests check feature OFF/ON, two clients, missing-v3 fallback, rejection of permission errors, conflicting IDs, league/source scope, and no event/RSVP write. Neither CI nor these snapshot tests replace authenticated mobile QA.

Player workflows at commit `efdd8e4a6caee6abbb40e926a63646a7904305da`:
- MRSZ standings `40044622908`: success.
- Bridge UI contract `40044623009`: success.
- Men I/B schedule `40044623015`: success.
- Match order/protocol `40044622956`: success.

Manager full-suite CI must be checked at **final head**; old copied regression tests have been updated to reflect canonical standings-first and existing all-BEAC-team match filters. Do not assert full green if any workflow remains red.

## Live-state read-only baseline / release gate
As of this work: 279 events (53 match), 672 bookings, 56 old match IDs, 46 Manager aliases, 298 canonical competition matches, 13 played, 7 Manager match events without alias. The bridge table and v3 RPCs **do not yet exist in live Supabase**. These are not zero-risk changes for a later production release: require explicit approved migration + rollback plan, verified federation fixture identity per row, no player team/league collisions, token/RLS security audit, and real logged-in Manager/Player iPhone QA, followed by double 11-point test.

**Next steps:** once all draft SQL/client source passes, prepare source-only approval/identity preflight and authorization QA; do NOT import protocol results or activate calendar as side effects.
