# CC-FOLYTATÁS — Apple Calendar QA checkpoint (2026-10-22)

## Branch / deployment truth
- Manager: draft [PR #72](https://github.com/beacvolleyCC/club-control-manager/pull/72), branch `feat/20261022-private-ios-calendar-phase1`.
- Player: draft [PR #25](https://github.com/beacvolleyCC/player_application/pull/25), branch `feat/20261022-ios-calendar-subscription`.
- **Neither PR is merged, the new Edge Function is not LIVE, no calendar token/RPC migration was persisted to LIVE.** Do not present the feature as installed on iOS.
- Canonical competition matching and historical source datasets remain unchanged. All new QA fixtures use synthetic players, matches, memberships and events.

## Completed testing — independent PostgreSQL17 databases
GitHub Action `Calendar isolated PostgreSQL QA`:
- Independent databases `cc_calendar_qa_1` and `cc_calendar_qa_2`, both started from clean synthetic fixtures.
- Both complete passes logged `DISPOSABLE_CALENDAR_QA_PASS`, `PUSH_MEETING_AT_QA_PASS`, and `PostgreSQL fixture pass 1/2`. Their assertions run against the actual unmodified SQL files on PR #72.
- Concurrent two-client rotation in the second disposable database logged `Simultaneous rotations: exactly one active token`.
- Run: [Actions run 39788709492](https://github.com/beacvolleyCC/club-control-manager/actions/runs/39788709492); the earlier successful token-only independent QA run is [39788163417](https://github.com/beacvolleyCC/club-control-manager/actions/runs/39788163417).
- One additional real Supabase database verification was performed strictly inside `BEGIN … ROLLBACK` (see `CALENDAR_DB_ROLLBACK_QA_20261022.md`). That test is not live deployment and does not replace multi-user HTTP E2E.

## 11-point QA status (never claim unfinished gates pass)
| # | Check | Verified | Remaining |
|---|---|---|---|
| 1 | Preserve existing events / bookings / team memberships | All new tests disposable; initial LIVE baseline 279/666/59 and push-outbox 208 | Repeat exact LIVE counts before/after any migration |
| 2 | Auth boundaries | Two PostgreSQL role checks: anon denied, authenticated own scope, service-only feed | Real PostgREST JWT and HTTP access |
| 3 | Team scope / transfers | Foreign team issuance denied; membership removal invalidates existing token, twice | LIVE real user transfer / suspension |
| 4 | Raw 256-bit secret / SHA256 / no direct table grant | Two DB passes; client does not persist link | Gateway logging review |
| 5 | Rotation / revoke / concurrency | Two DB passes + simultaneous two-session rotation exactly one active | Real Apple old-link expiry |
| 6 | RSVP isolation | going included; not_going/unknown excluded; team-only fixtures twice | Production identities / optional historical behavior |
| 7 | Cancellations / stable UIDs / archives | Node RFC5545 tests in existing PR #72 | Actual Apple refresh/removal behavior |
| 8 | Europe/Budapest DST / CRLF / Unicode | JS Node RFC5545, PostgreSQL Hungarian meeting notice tests | Real iOS subscriber |
| 9 | Event changes / push dedupe | New `meeting_at` signature and human message tested in two isolated DBs; pre-existing opt-in/trigger infrastructure audited | Real notification delivery / retries, no duplicate recipients |
| 10 | Manager/Player regression | Manager scoring, Player calendar, match order, standings and protocol GitHub checks green in PR branches | Authenticated browser/PWA acceptance |
| 11 | Two independent QA rounds / deployment control | Both isolated DB passes green; PR diff and SHA checks; neither merged | LIVE 11-point verification and Apple device sign-off |

## Existing unrelated security advisory
`mcp__Supabase__list_tables` flagged RLS disabled in `private.cc_canonical_matches_v1` and `private.cc_canonical_match_aliases_v1`. They pre-date this feature. Assess Data API exposure and role grants before applying policies. **Do not automatically enable RLS**: policies or explicit backend access must be preserved. See [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Next safe release sequence
1. Confirm production baseline, review current schema and access grants, check actual JWT/RPC permissions using real own and foreign users in an approved test environment.
2. Deploy additive SQL token and read functions only after privileged RPC review; test status, revocation, no public feed on invalid tokens.
3. Deploy Edge function `cc-calendar` with `verify_jwt=false` (Apple does not send a Supabase JWT) but full bearer verification for every GET/HEAD. Audit upstream logs for query-token disclosure.
4. Enable Player UI only after backend is healthy; test iOS Safari/PWA and Apple subscription, including removal/revocation behavior.
5. Separately apply `cc_push_meeting_at_change_v1.sql` after notification choice and event-change regression. Verify actual push delivery; no pushes from ICS polling.
6. Only then consider merging PR #72 and PR #25 (and avoid unrelated old conflicting PRs).

Do not mutate `public.events`, `public.availability`, `public.team_memberships`, canonical competition data or notification recipients during staging.
