# CC-FOLYTATÁS — Apple Calendar release package (2026-10-22)

## Decision
The user requested **release-ready source code, but no LIVE activation or production user testing yet**. Finish the Club Control database and previously developed modules first. Then conduct integrated release QA in a planned deployment window.

**Do not execute migrations, deploy Edge Functions, enable Player UI, send push, merge PRs, or modify LIVE data without returning to the release checklist.** The earlier two-DB QA and real transaction+ROLLBACK check are useful but do not prove end-to-end Apple behavior.

## Source dependencies
- Manager draft PR #72: https://github.com/beacvolleyCC/club-control-manager/pull/72
  - `sql/cc_private_calendar_feed_tokens_v1.sql`: private token table, authenticated rotate/status/revoke.
  - `sql/cc_private_calendar_feed_read_v1.sql`: service-role-only authorized event projection.
  - `supabase/functions/cc-calendar/index.ts`: thin Supabase Deno entrypoint.
  - `supabase/functions/cc-calendar/handler.mjs`: isolated bearer-verified HTTP GET/HEAD, no-store/404/503.
  - `supabase/functions/cc-calendar/ics.mjs`: RFC5545 formatter, stable UID, cancellation, DST.
  - `supabase/config.toml`: **only** `[functions.cc-calendar] verify_jwt = false`, because Apple does not send JWT; the secret bearer token is independently validated for every request.
  - `sql/cc_push_meeting_at_change_v1.sql`: optional separate Manager push signature/body upgrade. **Never apply merely to turn on calendar polling.**
- Player draft PR #25: https://github.com/beacvolleyCC/player_application/pull/25
  - Settings calendar subscription UI and `calendar-subscription.js/css`.
  - `config.js` public flag `CALENDAR_SUBSCRIPTION_ENABLED: false` by default.
  - Preserve existing Apple/Google one-time ICS export and user/team data.
- All existing canonical competition data, scores, protocol links, event IDs, bookings, permissions and notification preferences must stay intact.

## Completed CI (source-only)
1. `node --test tests/calendar-ics.test.mjs tests/calendar-http.test.mjs` validates RFC5545 and read-only HTTP behavior.
2. `deno check supabase/functions/cc-calendar/index.ts` checks Deno entry.
3. `Calendar isolated PostgreSQL QA` runs **two independent PostgreSQL 17 databases**, real role checks and simultaneous rotations; includes the Manager `meeting_at` push text test with synthetic events.
4. `Player Apple calendar QA` tests hidden-by-default feature flag, 2 scopes, URL handling, rotation/revoke UX, and old export presence.
5. Existing Manager and Player sport/standings/protocol QA workflows must remain green.

## Installation sequence, deferred (not yet executed)
1. Complete and freeze underlying Club Control data model, Player auth/team membership behavior, event/booking save paths and earlier pending work.
2. At release time: inspect current schema, access grants and migrations; take verified backup and record baseline totals, row identities, existing RLS grants and enabled Edge Functions. Resolve migration ordering using **Supabase CLI `supabase migration new`** in the actual project checkout (not a guessed filename). Do not run the draft standalone SQL files blindly.
3. Review additive migrations for both SQL token and read functions; verify whether the private schema is exposed to the Data API and deny table access to anon/authenticated. Test with authenticated own and foreign users in a safe environment and roll back on any permission mismatch.
4. Deploy only the `cc-calendar` Edge Function with the scoped `verify_jwt=false` configuration; service-role credentials **server-side only**. Validate invalid/revoked bearer returns 404, no 302 redirects, no caching, no leakage in logs or analytics. Guard monitoring and HTTP proxy logs for URL query secrets.
5. Validate authenticated Player RPC create/rotate/status/revoke, one-time export unchanged, share links safely, Apple subscription GET/HEAD; ensure permissions are rechecked after team transfer and account suspension.
6. Run the full 11-point QA twice; on iOS Safari / PWA test subscription, cancellation, RSVP reversal / disappearance, refreshed time/place, DST, Apple subscription removal. **Apple chooses refresh cadence; never promise immediate update.**
7. Separately verify Manager explicit notify intent / outbox deduplication / changed-event push recipients (not from calendar polling), then apply optional push patch if approved.
8. Only after all these checks: merge Manager backend, deploy DB/Edge; merge Player UI with feature flag still **off**; flip `CALENDAR_SUBSCRIPTION_ENABLED` to true in a separately reviewed release when the endpoint is verified.

## Rollback / safety plan
- To disable UI immediately, set `CALENDAR_SUBSCRIPTION_ENABLED: false` (default in the draft).
- If the endpoint is unhealthy, disable or roll back the `cc-calendar` Edge Function independently. Its database access is read-only.
- Revoke active tokens if a URL is compromised. Raw bearer values are not recoverable from DB; rotation invalidates prior URL.
- Do **not** drop token tables or change RLS in emergency without backing up and understanding existing subscriptions; dropping them is not the first rollback step.
- Never roll back unrelated club records: `events`, `availability`, `players`, `team_memberships`, canonical source, scoring, finances or push state.

## Known open acceptance questions
- Apple Calendar's handling of disappeared `going` events / RSVP reversals and imported cancellations (actual phone required).
- Upstream Supabase/CDN proxy access logging of bearer URLs and whether redirects/cache are suppressed (live HTTP required).
- The private calendar API remains bearer-link accessible to anyone who obtains the URL: explain to users and offer revoke/rotation. A private subscribed feed cannot require a live interactive login from Apple.
- The current database has unrelated security advisories for two private canonical competition tables with RLS disabled; separate review only, avoid auto-enabling policies.
- Final source-ready status is not the same as installed/tested/released. Both PRs must remain draft until the user requests integration.

## Handover pointers
- `docs/handover/HANDOVER_20261022_CALENDAR_QA_COMPLETE.md` — 11-point QA evidence.
- `docs/handover/CALENDAR_DB_ROLLBACK_QA_20261022.md` — rolled-back real SQL verification.
- `HANDOVER_CURRENT.md` — current project continuation index.
