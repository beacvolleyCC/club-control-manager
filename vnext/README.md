# Club Control Manager TEST — vNext foundation

This directory starts the **modular rewrite**. It is **not** yet a deployed PWA, not a schema migration and not a replacement for the existing Manager app.

- **Canonical shared domain specification:** `vnext/shared/domain-contract.v1.json` (authoritative in this repository). Player TEST has a pinned mirror. Update both in a reviewed change.
- Supabase TEST only: `szzoubvhlwnojtzqjebc`. Never write LIVE DB or main without separate approval.
- Current 31 TEST migrations and synthetic data remain. Full LIVE schema export/fingerprint parity is NOT established, so do not claim full DB reconstruction.
- Existing `app.js` and existing source `config.js` remain unmodified, as a working reference; static connected TEST builds must be hosted separately before mobile E2E.
- Start implementation at Phase 01: Auth, Manager/Player role mapping, explicit team scopes, then shared teams/roster contract. Scope every read/write and prove anon/unauthorized denial.

Tracked plan: `docs/architecture/CC_MODULAR_REBUILD_ROADMAP_20261029.md` and `docs/architecture/CC_VNEXT_REBUILD_KICKOFF_20261030.md`.
