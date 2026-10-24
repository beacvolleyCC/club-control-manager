# CC-FOLYTATÁS — canonical bridge role security & full 46-source review (2026-10-24)

**DRAFT ONLY.** Manager [PR #75](https://github.com/beacvolleyCC/club-control-manager/pull/75) and dependent Player [PR #27](https://github.com/beacvolleyCC/player_application/pull/27) are **unmerged**. No production database DDL/DML, releases or activation. Manager/Player `CANONICAL_BRIDGE_V3_ENABLED` remains **false**.

## Completed source and data work

- New repeatable **SELECT-only** audit: `sql/cc_verified_match_bridge_20261024_all46_review_readonly.sql` includes **all 46** `brsz_fixture` aliases, even the 3 that no longer have the legacy catalog class `BRSZ imported fixture`. The earlier audit excluded these 3 and thus counted only 43.
- Canonical comparison (real LIVE read-only, source season+division+directional federation home/away team IDs):
  - **41** `CANDIDATE_REQUIRES_OFFICIAL_PROOF`: old UUID and canonical UUID differ, kickoff and federation team IDs agree, **no official per-match fixture identifier** supplied by the raw BRSZ payload.
  - **3** `ALREADY_CANONICAL_SAME_ID`: old UUID already equals canonical UUID. These are MRSZ #2330 (Női I), #2699 (Férfi I/B; old kickoff October 12 vs official October 19), and #2348 (Női II/B; old kickoff October 13 vs official October 20). They need **no bridge alias**, notwithstanding source status/date discrepancies.
  - **2** `BLOCK_SELF_MATCH`: malformed BEAC–BEAC federation fixtures, no canonical projection candidate.
- Complete machine-readable record: `data/competition/2026-27/verified-bridge-review-20261024.json`. It has 46 unique alias keys, explicit season/league/teams, both match UUID spaces, both kickoff clocks, source URL/hash prefix and `approved:false` **for every record**. No reviewer or match-specific proof URL invented.
- Human review sheet: `docs/competition/20261024_FORTYSIX_LEGACY_BRIDGE_REVIEW_QUEUE.md`; contains all 46 source keys grouped by exact competition.
- Raw live BRSZ imports: **46/46** have a source URL and SHA256 fingerprint; **0/46** have a match-level `raw_payload.officialFixtureId`. League-wide page URL is not enough to assert a particular match's identity.

## Security hardening / regression

- The staged SQL `sql/cc_verified_match_bridge_v1_staged.sql` no longer accepts a syntactically plausible `BRSZ:2026/27:<number>` proof on its own. A BRSZ proof now requires:
  - actual imported `raw_payload.officialFixtureId` identical to the reviewed proof,
  - a 64-character hexadecimal `source_hash` matching `raw_payload.sourceHash`,
  - federation source host allowlist, matching season+league+directional official team IDs, no raw `needs_review` flag, and exact canonical sourceKey/UUID.
  Thus no current LIVE BRSZ raw row can be approved through that branch **without better official-source evidence**.
- MRSZ evidence uses real source `data.matchCode`, matching season, competition and `record_kind='match'`. Source drift, team reversal, wrong MRSZ code, duplicate ID and invalid league remain fail closed.
- Isolated PG17 tests now use **real PostgreSQL `SET ROLE anon` / `SET ROLE authenticated`** with synthetic (not real user) JWT claim values and test-only Manager permission/Player active membership guards. Manager-only / Player-only / no JWT / revoked team membership / unrelated actors are tested for access isolation; direct private approval-table and helper access is denied.
- The role tests run twice in **independent disposable PostgreSQL 17 databases**, alongside 279 synthetic events / 672 synthetic bookings / 56 old records / 46 manager aliases / 298 projected matches. Protects all existing source/RSVP fingerprints, guarded rollback and clean install. The manifest has six invariant tests (41/3/2, full ID/league/key uniqueness, approved false).
- **CI:** eight Manager workflow runs at code+documentation commit `6fc9fabda164347b103846a26abc86327a69c11c` completed successfully. [Verified canonical match bridge isolated QA](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40098004317).

## LIVE state (two independent SELECT reads, 2026-10-24)

- 279 events, 53 match events, **673** availability responses (previous snapshot had 672: one additional live RSVP appeared; **we performed no write**).
- 56 internal legacy match records, 46 `manager_event` aliases and 46 `brsz_fixture` aliases.
- 298 canonical competition matches, 13 played; **7** Manager match events without alias and **15** existing RSVPs on them (separate queue; do not touch).
- New `private.cc_verified_match_bridge_v1` table and both public `v3` RPCs **not installed**. Player #27 was not modified in this turn, remains feature flag OFF.

## Remaining gates

1. Acquire concrete **per-match** federation fixture IDs from official BRSZ/MRSZ, or independent official MRSZ protocol proof, not merely BRSZ listing links. Document and review **each** of 41 candidate fixtures; no automated approval.
2. Production-real signed-in Manager, active Player, anonymous and cross-team authorization and RLS verification (synthetic role QA is not proof of real JWT authorization).
3. Explicit DBA migration/release decision and audit trail, secure reviewer signoff, double 11-point regression, mobile PWA/iOS validation, and final PROD counts before/after. No data migration or merge without release authorization.
4. Keep #73 historical source anomalies/seven manager event review, #74 two new official protocol results and calendar #72/#25 separately gated. Never auto-link by team name/date, conflate Women's I (299) with Women's II/B (959), or lose existing event IDs / bookings.
