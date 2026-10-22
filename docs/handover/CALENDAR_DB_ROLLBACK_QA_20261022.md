# Calendar transactional SQL verification — 2026-10-22

Status: **validated with ROLLBACK, NOT DEPLOYED**.

## Environment
Supabase project `snqsxlyhontaepembaic`, only production project found; `list_branches` returned no development database branches. No new billable project/branch created. Validation used a single `BEGIN` / `ROLLBACK` PostgreSQL transaction.

## Code validated
Unmodified SQL source content from draft PR #72:
- `sql/cc_private_calendar_feed_tokens_v1.sql`
- `sql/cc_private_calendar_feed_read_v1.sql`

The surrounding file-level `begin;` and `commit;` were replaced by the test's single explicit transaction, to ensure no persistent schema/data change. A PL/pgSQL `DO` test block checked grants, token rotation and feed semantics.

## Passing assertions (one full transactional pass)
1. `anon` cannot call token rotate/revoke; `authenticated` cannot call the service-role-only read RPC.
2. No direct token-table SELECT privilege for `anon` and `authenticated`.
3. An active linked player's `mine` token is 64 hex characters, with SHA-256 stored in private schema.
4. The status RPC reports an active token without returning the raw secret.
5. Own feed is a JSON array; every returned event is actually in the owner's `availability.status='going'` rows.
6. Arbitrary SHA-256 token does not unlock a feed.
7. Rotation invalidates previous token; revoke invalidates replacement token.
8. Authorized team feed returns only events matching the authorized team ID and event types.
9. Foreign team issuance rejected, unknown player authentication rejected, missing authentication rejected.
10. SQL block ended without errors and returned `CC_CALENDAR_QA_ROLLED_BACK`.

These assertions test real database schema and rows. Authentication was injected in a privileged session using transaction-local `request.jwt.claim.sub`: **not** a substitute for separately authenticated users through public Data API / Edge Function.

## Still mandatory
- Second independent transactional pass, and verify persisted row baseline and absence of the new private table after rollback.
- Live role-separated REST/auth tests; change of membership and account revocation.
- Actual Supabase Edge Function deploy and Apple iOS subscription test only after authorization/security QA.
- Event update/cancellation and push behavior in a sandbox/approved deployment.
- Confirm deletion, RSVP opt-out and cancellation handling in Apple.
- Existing manager/player CI must remain green.

No event, availability, team membership or push outbox DML executed by the test. The new token table and RPCs were created inside the rolled-back transaction only.
