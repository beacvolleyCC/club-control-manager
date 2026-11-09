# V2 TEST RPC integration contract — 2026-11-09

## Implemented
- Shared typed transport: `packages/api/src/v2-test-rpc-client.ts`
- Exported from `@club-control/api/v2-test-rpc`.
- Transport hard-pinned to `szzoubvhlwnojtzqjebc.supabase.co` and requires an authenticated access token.
- All endpoints use POST to PostgREST RPC; `schemaVersion=1` is checked.
- Manager reads: competition overview, mass training list/detail, waitlist summary, mass passes, scoped finance.
- Player reads: bootstrap/notifications and own finance overrides.
- Manager writes: mass booking add/remove through existing permission-checked database procedures.

## Critical outstanding integration
- Actual Manager and Player UI shells must import and call the client; no UI deployment is claimed.
- Verify TS compilation and contract tests in CI. No successful build/test run claimed yet.
- Perform positive Manager/Player JWT E2E with properly provisioned TEST users; only negative missing-identity checks have been performed.
- Test add/remove transactionally with rollback and verify capacity, SPORT7, first-training, late-cancel, and audit invariants.
- Waitlist offer/expire internal RPCs are intentionally not exposed to authenticated/anon users. Design privileged worker and explicit offer-acceptance route.
- Legacy mass guest emails must not be silently merged with competition UUID player records.
- LIVE is not modified.

## Status accounting
Do not increase progress percentages on the basis of file creation alone. Count frontend wiring as complete only after runtime integration and tests.
