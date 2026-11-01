# Club Control TEST – vNext competition API preparation (2026-11-01)

## Boundary
TEST only: Supabase `szzoubvhlwnojtzqjebc`, Manager branch `test/20261026-manager-document-intake`. LIVE Supabase, main, and production PWAs unchanged.

## Prepared (GitHub TEST, NOT deployed)
- `docs/security/CC_TEST_VNEXT_COMPETITION_READ_FACADE_V1_CANDIDATE_20261101.sql`
- `tests/sql/CC_TEST_VNEXT_COMPETITION_READ_POSTDEPLOY_ROLLBACK_20261101.sql`
- `tests/manager-vnext-competition-read-contract-20261101.test.cjs`
- `.github/workflows/test-manager-vnext-competition-contract-20261101.yml`

Candidate routes: teams, players, overview, events, calendar, roster, rsvp_matrix, results, position_counts. It delegates to existing permission-scoped Manager RPCs; no new direct table read or write operations. Uses SECURITY INVOKER and authenticated-only EXECUTE.

## Verified
- GitHub Actions vNext contract passed twice: run 41311419402.
- Manager PWA safety regression passed: run 41311419373.
- Import intake smoke passed: run 41311419399.
- Authenticated TEST PostgreSQL transaction with simulated existing Manager JWT returned 3 teams; player, event, and overview types correct; RSVP matrix object. Transaction rolled back.

## Security advisor baseline
2026-11-01 advisor reported: 51 RLS-without-policy notices (often intentional RPC-only tables), 2 mutable function search paths, 1 citext extension in public, 36 authenticated-callable SECURITY DEFINER warnings, and leaked-password protection warning. These need case-by-case evaluation, not blanket policy grants or unreviewed extension moves. Performance advisor also reported unindexed FK and unused-index notices.

## Gates not satisfied
- vNext facade NOT installed; the earlier attempt at schema deployment was blocked. Do not assume a schema migration succeeded.
- Candidate must be reviewed against actual DB functions, then installed in isolated TEST under a permitted deployment route; postdeploy SQL must run and return PASS twice.
- Cross-team negative role testing and no-auth tests are still unproven for the new facade.
- Remaining vNext writes, mass sports, finance, messaging and full data fixtures not ready.
- No LIVE modifications without explicit operator approval.
