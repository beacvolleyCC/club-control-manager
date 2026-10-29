# Stage19 – Manager transfer UI and Budapest date consistency (TEST)
Date: 2026-10-30 (Budapest). Branch: `test/20261026-manager-document-intake`. Supabase: isolated TEST `szzoubvhlwnojtzqjebc`. **LIVE unchanged.**

## Implemented
- Manager `app.js`: the instant test-player path now requires designated test player ID, linked account and name marker, matching Stage18 security constraints.
- Regular transfer date is visible as today only, with `min=max=value` set to Budapest local date. Client rejects stale or other dates; Stage17 database also rejects dates other than Budapest today.
- UI explains pending future old-team going RSVPs, historical membership retention, and absence of automatic notifications; named RPC error codes have descriptive Hungarian messages in persistent accessible inline feedback.
- Submit button disabled during async request; duplicate rapid submits blocked.
- TEST Manager PWA cache/version synchronized between `index.html` app/style tokens and `sw.js`; old caches remain removable under `cc-manager-test-` namespace. The previously fixed static safety test now derives version from the shell.
- No LIVE code, database, notifications or data changed.

## QA
- Isolated Node VM UI test executes actual extracted transfer functions and mocks RPC/DOM, checking valid/failing transfer, test identity, error, date, double submit, and cache.
- [Stage19 workflow](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40970268202): **12 tests ×2 PASS**, 0 failures.
- TEST PWA safety regression and Manager intake smoke PASS on Stage19 code.
- Date discrepancy demonstrated: Supabase session timezone UTC with Oct29 23:03Z = Budapest Oct30; previous `CURRENT_DATE` acceptance would have disagreed with Manager.
- Updated TEST-only `public.cc_manager_player_transfer_v1` date condition to `(now() AT TIME ZONE 'Europe/Budapest')::date`; migration `cc_test_manager_transfer_budapest_today_stage19_20261030` applied. Candidate and postdeployment rollback PostgreSQL matrix PASS (auth, team permissions, RSVPs, history, no push).
- Postdeployment readback: `anon` execute false, `authenticated` true, 66 RSVPs and 0 audit rows, so synthetic QA created no persistent data.

## Known boundaries
- Still only today-effective regular transfers, not scheduled transfers.
- Manager UI is on TEST repo branch; phone/browser HTTPS E2E pending until Pages deployment/setup is available.
- Date boundary membership filter elsewhere in the database may use UTC `CURRENT_DATE`; future migration planning should use a consistent Budapest-day policy.
- Stage17/18 database functions preserve RSVPs; confirmed upcoming old-team attendance blocks transfers for manual resolution.
