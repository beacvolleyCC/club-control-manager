# Club Control TEST – Stage 13 Manager team-edit audit and handover
2026-10-29; only isolated Manager TEST branch and Supabase TEST project `szzoubvhlwnojtzqjebc`.

## Work completed
- Deployed `public.cc_manager_team_update_v1(uuid,jsonb)` on TEST only.
- This endpoint fills one existing Manager form contract (`app.js` calls this name).
- An authenticated, linked Manager must hold `competition.teams/edit` for the exact requested team; an unlinked user or an unrelated team cannot write.
- Fields: name, season, color, coaches, defaultVenue, defaultCourt, active. Strict allowlist, types, maximum lengths, nonblank name. Protected identifiers are never editable.
- Returns JSON team view, records old/new row in `public.audit_log`, without granting `authenticated` or `anon` direct table UPDATE.
- `SECURITY DEFINER`, empty `search_path`, `EXECUTE` to authenticated only; deny PUBLIC/anon.

## Actual discovery and fix-forward
1. Original SQL source `docs/security/TEST_MANAGER_TEAM_UPDATE_V1_REVIEW_20261029.sql` was statically tested 6/6 ×2. It was deployed in migration `cc_test_manager_team_update_audited_v1_20261029`.
2. A PostgreSQL authenticated write test discovered `audit_log.id` is `GENERATED ALWAYS AS IDENTITY`, so explicit `nextval` in the INSERT failed with SQLSTATE 428C9. That initial test transaction failed and did not commit application data.
3. Fixed in `docs/security/TEST_MANAGER_TEAM_UPDATE_V2_IDENTITY_FIX_20261029.sql`: omit `id` and rely on its generated identity default. Deployed as **separate forward migration** `cc_test_manager_team_audit_identity_fix_v2_20261029`.
4. Updated static guard and verified 6/6 ×2 CI pass for the replacement. The old v1 SQL is retained as history, not as recommended source for further deploys.

## Executed PostgreSQL security / behavior QA
All writes below ran on TEST only and were enclosed in `BEGIN ... ROLLBACK`. Temporary session claims used an existing linked TEST Manager, but no real browser session or account credentials were extracted.
- A. `anon` role cannot execute public team update: PASS.
- B. `authenticated` role without JWT cannot update: PASS (`MANAGER_AUTH_REQUIRED`).
- C. Authenticated, linked TEST Manager update of allowed team: PASS; response checked.
- D. Invalid protected `legacyTeamId` mutation: DENIED `TEAM_FIELD_NOT_EDITABLE`.
- E. String rather than boolean `active`: DENIED `INVALID_TEAM_ACTIVE`.
- F. Empty JSON object payload: DENIED `INVALID_TEAM_UPDATE_PAYLOAD`.
- G. Update creates exactly one audit row with nonnull actor and before/after values inside rollback transaction: PASS.
- H. For team-scoped permission, editing a different team: DENIED `MANAGER_PERMISSION_DENIED`.
- I. Same team-scoped permission allows the assigned team: PASS.
- J. After rollback, pre-existing team and Manager permissions remain unchanged: verified via readback, not intended as production mutation.

Note: database-role emulation is not an end-to-end HTTP/Auth/browser test. Do not close user-acceptance blockers from SQL QA alone.

## API inventory
On this date: 27 TEST `cc_manager_*/cc_player_*` public APIs are accessible to authenticated (all non-anon). Source coverage **Manager 9/71**, Player **16/24**. These are source tokens including old fallbacks; 62 Manager and 8 Player names are not deployed. See `docs/architecture/CC_TEST_API_CONTRACT_INVENTORY_20261029.json`.

## Open blockers / strict boundaries
- Manager issue #81: private membership helper lacks start-date enforcement. NOT fixed.
- Player issue #31: real TEST HTTPS Auth + save/reload RSVP + iOS acceptance. NOT fixed.
- Other Manager writer API parity, mass sport, finance, league protocol sources. NOT complete.
- No Cloudflare deploy because user is on phone. No push/SMTP/payment activation.
- Current `main`, LIVE Supabase `snqsxlyhontaepembaic`, current Player TEST and both isolated `vnext/20261029-modular-rebuild` branches untouched.
- The standalone `vNext` modular rewrite comes only after stable TEST database and browser E2E. Modules are later patched by deliberate approval.

## Next technical steps
1. Narrow and test Manager player/team-membership writes; design ownership and date-effective RLS model first, do not skip #81.
2. Add controlled snapshots/contract CI for every newly deployed RPC.
3. Prepare separate TEST HTTPS sites and real authenticated iPhone regression when user is at desktop.
4. Keep checking no LIVE changes and double CI/11-point acceptance.
