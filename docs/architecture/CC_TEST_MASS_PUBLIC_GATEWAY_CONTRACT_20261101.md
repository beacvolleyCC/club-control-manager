# Club Control TEST · tömegsport nyilvános szerverkapu · 2026-11-01

**Status:** design and TEST SQL prepared only. No public HTTP endpoint has been enabled or deployed.
**Supabase TEST:** `szzoubvhlwnojtzqjebc`; never use LIVE reference `snqsxlyhontaepembaic`.
**Existing TEST Manager deployment:** static-assets-only Cloudflare Worker (`wrangler.jsonc` uses `assets.directory=./dist-test`). Do NOT place privileged keys inside Manager or Player assets. The public gateway needs its own isolated Worker / backend application and its own secrets.

## Backend contracts available once installed (not yet installed)

These new RPCs are guarded service-role-only (`anon` and `authenticated` EXECUTE revoked):
- `cc_vnext_mass_public_book_v1(event_id,person_json,cancellation_hash)`: new booking, quota, first-training, duplicates, SPORT7 and same-slot checks.
- `cc_vnext_mass_public_wait_v1(event_id,person_json)`: queue max 5, duplicates, first-training and fairness.
- `cc_vnext_mass_public_cancel_v1(cancellation_hash)`: single-use hash, early or late classification, no e-mail.
- `cc_vnext_mass_public_decide_v1(offer_hash,action,cancellation_hash)`: accept/decline offer, idempotent token consumption, seat reserved, capacity and pass checks.

Previously deployed service-only RPCs: `cc_vnext_mass_capacity_v1`, `cc_vnext_mass_offer_next_v1`, `cc_vnext_mass_offer_expire_v1`. All SQL data reads and writes are anchored to event-provided `source_workbook_id`, not a workbook identifier supplied by an untrusted client.

The postdeployment test is `tests/sql/CC_TEST_MASS_PUBLIC_SERVICE_WRITE_POSTDEPLOY_ROLLBACK_20261101.sql`, intended to run twice. It uses only imaginary `@cc-test.invalid` identities and `ROLLBACK`. Independent real parallel-transaction load testing is **still required**; a static code check is not evidence of such a test.

## Proposed Gateway HTTP API (not deployed)

- `GET /api/mass/v1/trainings`: return public schedule only; no private athlete/pass lists.
- `POST /api/mass/v1/book`: validated eventId, name, verified email, passNumber or firstTraining. Return booking id and confirmation **only after** trusted email delivery is queued.
- `POST /api/mass/v1/wait`: same validation, waiting-list registration. Return position.
- `POST /api/mass/v1/cancel`: a random cancellation capability from e-mail; Worker computes hash and calls RPC.
- `POST /api/mass/v1/offer/decide`: random offer capability, accept/decline; new cancellation token generated on accepted booking.
- `POST /internal/mass/v1/offer-next`: authorized scheduler only (not public). Finds the next eligible waiter, creates an offer and sends/queues the corresponding notification atomically or has a compensating rollback procedure.
- `POST /internal/mass/v1/offer-expire`: authorized scheduler only.

## Nonnegotiable gateway controls before enabling public POST

1. **Separate TEST-only Worker**; production and TEST keys cannot be interchanged. Validate both the database hostname and an explicit TEST-only deployment marker during boot.
2. Store `SUPABASE_TEST_SERVICE_ROLE_KEY` only as a Cloudflare secret. Never expose it to client JavaScript, HTML, PWA config, logs, responses or source control. Do not put a service key in an ordinary public environment variable.
3. Verify Turnstile server-side and apply per-IP, per-event and per-verified-email throttles. CORS/origin is an additional browser control, **not authentication**. For manager/scheduler routes require separate authenticated machine-to-machine authorization.
4. Verify mailbox ownership / one-time confirmation before accepting a new booking. Otherwise malicious users could enroll unrelated addresses. Store only short-lived hashed verification secrets and protect against replay.
5. Generate cryptographically random raw cancellation and offer tokens (at least 192 bits), never client-supplied; calculate `sha256:` + lowercase hex digest server-side. Store only hashes in Supabase; raw tokens are capabilities delivered to the verified mailbox. Avoid putting them in access logs, analytics or third-party URLs.
6. Explicit payload allowlists and bounded lengths, `Content-Type: application/json` and request body limits, anti-CSRF for cookie-based workflows, idempotency for retryable requests.
7. Booking changes and notification outbox insertion must either commit together or have a defined recovery. TEST SQL **does not** enqueue emails, SMS or push, so confirmation and offers must not be represented to users as delivered.
8. Use structured, non-PII audit events. Never log raw email verification tokens, cancellation tokens, JWTs or service keys. Treat first training, SPORT7 caps, sanctions and payment verifications as independent backend rules.
9. Do not enable real notifications or automatic no-show bans until those modules' policy/QA pass separately.
10. Keep the existing Player and Manager TEST PWAs unchanged until QA and integration gates pass. LIVE modifications require explicit approval.

## Open release gates

- SQL Editor installs the four new RPCs in TEST and verifies exactly 4 rows `anon=false`, `authenticated=false`, `service=true`.
- Run the postdeploy rollback SQL twice successfully; both must return PASS. Verify zero leftover `mass_events`, `mass_bookings`, `mass_waitlist`, `mass_live_write_audit` and mail/push rows after tests.
- Test true concurrency using two distinct Postgres connections. Single-transaction QA does not demonstrate parallel lock behavior.
- Build isolated Cloudflare Worker using server secrets, Turnstile and email verification; add bot/rate limiting tests. Do not assume this is implemented.
- Reconcile first-training identity rules, manual admin overrides, sanctions, automatic waitlist emails, payment validation and email provider free-tier limits.
- End-to-end TEST with PWA/mobile and a genuinely different user/manager account; run established double-check plus 11-point QA.

**No LIVE modifications** were performed in this phase.
