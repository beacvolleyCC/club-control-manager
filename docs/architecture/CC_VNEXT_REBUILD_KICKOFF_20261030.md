# Club Control vNext — NEW modular rewrite kickoff
**Status: STARTED, 2026-10-30. Scope: isolated TEST only; LIVE unchanged.**

## Decision: NO more preparatory stages required to begin coding
Stage22 manual transfer was a useful standalone backend feature, but finishing every legacy RPC and every Stage22 negative QA test is **not a prerequisite** for starting new Manager/Player code. Follow `CC_MODULAR_REBUILD_ROADMAP_20261029.md` from Phase 01 now; maintain a separate stabilization backlog for unfinished optional features.

## Verified 2026-10-30
- Separate Manager TEST branch `test/20261026-manager-document-intake`; Player TEST `test/20261026-isolated-player-mobile`.
- Supabase TEST `szzoubvhlwnojtzqjebc`: **31 installed migrations**, 19 players, 21 team memberships, 11 events, 66 competition RSVPs; largely synthetic fixtures.
- TEST public schema currently has **52 tables** with RLS, plus ~100 public/private routines (count checked 2026-10-30). **Schema parity with LIVE is NOT established.** Some mass modules have 0 sample rows.
- Original checked-in source `config.js` in both PWA repos remains DEMO. A separate builder can embed TEST-only publishable key in `dist-test`, but Cloudflare TEST HTTPS deployments and real mobile authenticated E2E have not been verified.
- Canonical domain design already exists: `docs/CANONICAL_DATA_CONTRACT_2026-10-21.md`, and existing rebuild roadmap. New `vnext/shared/domain-contract.v1.json` starts a versioned cross-client contract; it has **no runtime wiring**.
- LIVE production migration history and Git checkout were not parity-matched in the historical audit (31 remote vs 8 repo migrations). Private schema-only dump was prepared but not actually executed. Do **not** claim a fully reproducible production schema or blindly reset TEST.

## Immediate parallel workstreams
A. **START NOW (no external dependency):** vNext shared domain contract, reusable UI shell, Auth/role/team scope, then teams/player roster; new code additive under `vnext/` with Manager and Player tests. Existing monolith remains as reference; old components don't automatically transfer.
B. **SCHEMA BASELINE / parity release gate:** create private schema-only backup of LIVE and TEST, reconcile object signatures/RLS/GRANTs/migration history, produce a reproducible clean TEST baseline without copying credentials or raw personal records. This must be complete before calling the whole DB *rebuilt*.
C. **CONNECTED TEST PWA / device acceptance:** create two distinct free Cloudflare Pages projects from the TEST branches. Use `node scripts/build-cloudflare-test.cjs`, output `dist-test`, verify ONLY the isolated TEST Supabase URL, then real Manager + Player Auth and RSVP persistence/permission tests on Safari iOS. No need to block A before B/C.

## What must pass BEFORE full TEST replacement or LIVE release
1. Schema snapshot/restore, structural fingerprint parity, safe synthetic or owner-approved de-identified roster import. No unreviewed LIVE export in public GitHub.
2. Both TEST PWAs hosted with distinct HTTPS origins, service-worker caches and apps; TEST-only publishable client keys. Never touch LIVE GitHub Pages deployments.
3. Real login/logout, role and team scope, anonymous/other-team denial, event and RSVP save/reload (including quick changes), mobile Safari, offline/reconnect, and no outgoing push/email except solicited Auth OTP.
4. Each domain module has canonical database fields and IDs, versioned API, scoped permissions, positive/negative rollback QA, double CI and UI tests.
5. Match and competition identity parity across women's BB1, women's BB2, men's A and B; no blind name-only merges or unverified standings.
6. Two rounds of 11-point QA, explicit user approval before any change to LIVE main or production Supabase.

## Module sequence (not a mandatory wait list before starting)
1 Auth/role/team scope; 2 Teams/roster; 3 Calendar/events; 4 RSVP/attendance; 5 Mass sports/SPORT7/passes;
6 Competition fixtures/standings; 7 Protocols/stats/history; 8 Finance; 9 Notifications/ICS; 10 Settings/import/audit.
Coach drills and score-timeline later with its own UX.

## Current milestone
- Stage23 **vNext foundation**: created `vnext/README.md` and `vnext/shared/domain-contract.v1.json` in BOTH TEST branches.
- Next implementation should be Module 01 Auth and team scope with a new TEST-only application shell, not more legacy-specific transfer RPCs.
- `docs/handover/TEST_STAGE22_MANUAL_TRANSFER_APPLY_20261030.md`: post-deploy transaction QA was blocked, negative/concurrency scenarios pending; keep it a stabilization backlog rather than block starting Phase 01.
