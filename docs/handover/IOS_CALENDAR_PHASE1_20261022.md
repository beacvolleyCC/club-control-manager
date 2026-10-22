# Private iOS Calendar — phase 1 (2026-10-22)

Status: **development branch only; not deployed**. No LIVE DB schema or data changes.

## Confirmed source contracts
- `public.events` carries stable UUID, `team_id`, event type, time, venue, status, `updated_at`.
- `public.availability` uses `event_id`, `player_id` and `going / not_going / unknown`; only `going` qualifies for `mine`.
- `public.team_memberships` links player to team using active/date validity.
- `public.players.auth_user_id` is the security identity (not name or email).
- Existing push uses `public.player_push_outbox` with `dedupe_key`, and `cc-push` v9 recognizes `training_change` and `match_change`.

## Phase 1 implementation
SQL: `sql/cc_private_calendar_feed_tokens_v1.sql`. Token generated with 32 CSPRNG bytes, SHA-256 hash stored in private schema, raw token returned once. Scope `mine` or `team` (explicit team ID); membership and auth checks for issuance; active token rotation revokes old URL; explicit revoke. Tables have RLS and no frontend table grants; routines limited to authenticated users. **SQL must pass database staging review before execution.** Never log tokens.

## Required subsequent work — NOT YET DONE
1. Authenticated Player UI actions invoke rotate/revoke, display a privacy warning (URL is bearer secret) and `https://.../functions/v1/cc-calendar?token=<secret>`; Apple subscription via `webcal://` with safe user action. Preserve old single-file ICS exports.
2. Deploy an unauthenticated-at-gateway but *token-verifying* read-only Edge Function. Search by SHA-256 digest, verify `revoked_at is null`, active player and live membership **on every request**. Return generic 404 for any invalid token. `Cache-Control: private, no-store`; redact tokens from logging. Service role stays server-side.
3. `mine`: active `going` availability joined by both player ID and event ID. `team`: explicit authorized team events; don't cross team boundaries, including after transfer.
4. RFC5545 feed: CRLF/folding/escaping, UTC DTSTART/DTEND, DTSTAMP, stable UUID-based UID, LAST-MODIFIED, SEQUENCE based on persisted revision (not time of fetch). Cancellations require stable tombstones; no RSVP/medical data. Include training and actual linked match events, **not all 298 canonical external fixtures**.
5. Push: enqueue only meaningful, committed Manager event changes to the existing outbox, with per-player event-version dedupe and scoped membership/bookings. Do not push for ICS refresh or readonly match snapshot import. Test rollback/idempotence and no duplicate recipients.
6. iOS Safari/PWA human device QA; Apple controls subscription refresh intervals.

## 11-point QA (two independent passes required before LIVE)
1. Baseline row counts, IDs, bookings and memberships unchanged.
2. Authenticated own player only; anon/foreign players rejected.
3. Team scope membership validity and transfer/revocation.
4. 256-bit raw secret, SHA-256 storage, no token leakage.
5. Rotation and revocation, concurrent rotation, link invalidation.
6. Mine `going` vs `not_going`/`unknown`; team scopes; no RSVP roster.
7. Stable UID, modification tracking, cancellations and archives.
8. RFC5545 escaping, CRLF/folding, time zones and DST.
9. Push dedupe, retries, recipients, actual event change only.
10. Player export regression, Manager functionality, PWA cache and JS syntax.
11. Second pass against CI, GitHub diff/SHA, authenticated LIVE Safari/Apple Calendar; mark untested aspects explicitly.

No main merge / LIVE deploy until two passes, verified endpoint, and independent authorization tests.
