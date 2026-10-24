# Club Control — VERIFIED match identity bridge, stage 1 (2026-10-24)

**Status: DRAFT SOURCE ONLY — NOT DEPLOYED, NOT MERGED, NO LIVE DATABASE DDL/DML.**

Manager draft PR [#75](https://github.com/beacvolleyCC/club-control-manager/pull/75) is branched **from main**, independent of Manager draft #73 (source audits), Manager draft #74 (two new MRSZ protocols), the iOS calendar drafts #72 and Player #25. Current Manager and Player deployments are **unchanged**.

## Problem: two distinct ID namespaces, not 42 missing matches

Production source read-only audit (2026-10-23) confirmed:

- 279 Manager events / 53 match events; 672 bookings.
- `private.cc_canonical_matches_v1`: 56 legacy/internal IDs.
- `private.cc_canonical_match_aliases_v1`: 46 `manager_event` aliases, each refers to an existing internal match; seven Manager match events have no alias, with 15 bookings.
- `private.cc_canonical_competition_matches_v1`: 298 season-scoped match IDs with 13 played.
- **Only 4** of the 46 Manager aliases happen to use a UUID also found in the 298 projection. **42** are valid older internal IDs, not dangling references.
- Source-scoped legacy BRSZ review: 42 exact-time candidates, 2 old-date/official-result conflicts (MRSZ #2699/#2348), 2 malformed self-match records. None is automatically approved.

## Actual staged code

`sql/cc_verified_match_bridge_v1_staged.sql` introduces only additive, opt-in objects:

1. `private.cc_verified_match_bridge_v1` — **initially empty** reviewed identity table, one old `legacy_match_id` to one canonical `canonical_match_id`. Separate explicit legacy/canonical source keys, season, league, directional source-team IDs, official proof kind and proof reference, reviewer and timestamp. `ON DELETE RESTRICT`, UNIQUE mappings, nonsensical source self-matches rejected. RLS enabled, **no direct access grants for `anon` or `authenticated`**; manual/controlled approval only.
2. `private.cc_verified_match_bridge_resolved_v1` — `security_invoker=true`; every read cross-checks the manual mapping against both live ID spaces, the `brsz_fixture` alias, exact source-system+season, BEAC's league seed 299/959/709, the full directional federation team IDs, and the current canonical source key / ID / season / league. If the raw source is under `needs_review`, or the canonical source drifts, the mapping disappears. MRSZ proof codes are checked against the actual report source key or the internally verified official overlay evidence (when available).
3. `private.cc_competition_verified_match_bridge_v1()` — `STABLE SECURITY INVOKER` JSON list of **verified-only** mappings. No player names, RSVPs, raw notes, personal information, reviewer or event UUIDs.
4. **Two additive public v3 RPCs** — `public.cc_manager_competition_mrsz_snapshot_v3()` and `public.cc_player_competition_mrsz_snapshot_v3()`. Both call their respective existing v2 RPC and preserve **every v2 JSON field**, then append `verifiedLegacyMatchBridge: []` when no approved mappings exist. Same authenticated-only client eligibility as v2; no direct table privileges. **Neither current app calls v3 yet.**
5. Guarded rollback in `sql/cc_verified_match_bridge_v1_rollback_staged.sql` refuses to drop an approval table if ANY reviewed entries are present.

**Critical distinction:** the 42 exact-time legacy/canonical candidates are **not** auto-inserted. A mapping only becomes available via independently reviewed official proof and manual DBA-controlled approval. The v3 label `verified` reflects this explicit source-review requirement, not name similarity. A BRSZ proof must be independently verified **outside the database** before inserting; merely entering a syntactically valid reference is not federation verification.

## Isolated PostgreSQL 17 QA

Workflow: `.github/workflows/verified-match-bridge-qa.yml`, two independent disposable PG17 databases (not LIVE).

- Synthetic physical baselines: **279 events / 53 match events / 672 bookings / 56 legacy IDs / 46 Manager aliases / 298 projection matches**. No real player data.
- No approvals: v3 preserves complete v2 response, returns empty mapping, neither `anon` nor `authenticated` can access the private approvals directly, anon cannot execute public v3.
- Artificial manually approved source cases: 2 correct reviewed mappings (one dated BRSZ fixture, one older-date MRSZ result) + 4 deliberately invalid mappings (wrong league, reversed home/away, conflicting UUID/source key, wrong official protocol code). The **two** genuine mappings alone must be exposed; all six are synthetic and **never used in production**.
- Negative tests: rejected self-match, proof-kind mismatch, raw source needs-review flip, canonical directional ID drift and official match-code mismatch. All must fail closed.
- Original events, bookings, aliases, raw source, projection fingerprints stay identical after all tests; no event UUID or RSVP changes.
- Rollback **must fail** while reviews exist; after deliberate cleanup **inside disposable DB only**, rollback succeeds; reinstall succeeds and starts empty again.

## Release procedure (not yet authorized)

1. All draft PRs remain unmerged, all LIVE data unchanged. No SQL applied to Supabase here.
2. Verify preflight SQL, schema privileges and the exact v2 authorization policies; duplicate baseline on production read-only (279/672/56/46/298, 13 played as of this QA).
3. Apply schema only after independent DBA review and full scheduled release; leave approvals empty initially.
4. If officially certified source keys become available, insert approvals one by one into the restricted private table only; never infer a match from team names, dates or broad group alone. Recheck all 11 source disputes and seven unmatched Manager events.
5. Introduce an **opt-in/feature-flagged** Manager–Player v3 reader in separate follow-up source branches, only after authenticated authorization and fallback QA. The current v2 apps remain unchanged.
6. Keep #74 result-overlay/rosters and #72/#25 iOS calendar separately gated; do not combine or deploy until their dependencies are tested.
7. Production write phase, authenticated Manager/Player/mobile UX, leakage/RLS and 11× regression remain pending.
