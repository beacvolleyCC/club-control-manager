# CC – isolated TEST mass-sport Cloudflare gateway (2026-11-01)

**Status: source implemented and double-tested using mocked integrations. NOT DEPLOYED.**
TEST Supabase project: `szzoubvhlwnojtzqjebc`. This source must never be placed in Manager/Player static assets or connected to LIVE.

## Included

- `src/worker.mjs`: Cloudflare Worker fetch handler for:
  - `GET /api/mass/v1/health` (safe TEST-only status)
  - `POST /api/mass/v1/email/start`: generate cryptographic eight-digit code, store only HMAC digest using service-only OTP RPC, and dispatch an allowlisted TEST Resend email **only when explicitly enabled**.
  - `POST /api/mass/v1/email/verify`: consume OTP via database RPC; return a short-lived email-scoped HMAC proof (10 minutes).
  - `POST /api/mass/v1/book` and `/wait`: require TEST-allowlisted verified email proof, email-delivery flag, Turnstile verification and rate limiting; call the existing service-only booking/waiting RPCs.
  - `POST /api/mass/v1/cancel`, `/offer/decide`: require a 256-bit raw capability and Turnstile; hash before sending to Supabase, never send the raw token to the DB.
- `wrangler.jsonc`: **separate** `cc-mass-gateway-test-beac` Worker, `workers_dev:false` and **no routes**, with public writes and email delivery **disabled**.
- `tests/mass-gateway-test-20261101.test.mjs`: Node 22 mocked security tests (run **twice**).
- GitHub Actions: `.github/workflows/test-mass-gateway-security-20261101.yml`.

## Additional OTP SQL pending TEST installation

- Install candidate: `docs/security/CC_TEST_MASS_EMAIL_PROOF_SQL_EDITOR_20261101.sql`.
- Postdeploy rollback QA: `tests/sql/CC_TEST_MASS_EMAIL_OTP_POSTDEPLOY_ROLLBACK_20261101.sql` (twice).
- Static contract test: `tests/mass-email-otp-contract-20261101.test.cjs`.
- GitHub Actions: `.github/workflows/test-mass-email-otp-20261101.yml`.

The OTP SQL creates a **private** table with RLS, 5-minute expiry, 90-second resend cooldown, 5 incorrect-attempt limit and one-time consumption. Both RPCs must have `anon_execute=false`, `authenticated_execute=false` and `service_execute=true`.

**Do not assume OTP functions are installed** until the SQL Editor results and twice-run DB rollback QA confirm them. The existing four public mass-service booking functions and three capacity/offer functions were previously installed and transaction-tested.

## Secrets and environment guard

`wrangler.jsonc` declares required secrets, but contains **no secret values**. To operate this separate Worker, use Cloudflare's encrypted Secrets bindings—not a source file, chat message, PWA `config.js`, or public environment variable:
- `SUPABASE_TEST_SECRET_KEY`: **TEST-only** new `sb_secret_` key, only on server; API calls use the `apikey` header (not `Authorization: Bearer sb_secret_`).
- `TURNSTILE_SECRET`, `EMAIL_PROOF_SECRET` (>=32 bytes), `EMAIL_OTP_PEPPER` (>=32 bytes).
- `RESEND_TEST_API_KEY`, `TEST_EMAIL_FROM` (verified sender), `TEST_ALLOWED_EMAIL` (single approved tester mailbox).

The Worker checks exact Supabase TEST hostname, Turnstile hostname/action, Origin and body shape; an IP and per-mailbox/per-capability limiter are required. Cloudflare rate limiting is per location, **not** a precise global concurrency guarantee. Database locks and constraints remain authoritative.

`PUBLIC_WRITES_ENABLED`, `EMAIL_VERIFICATION_ENABLED` and `EMAIL_DELIVERY_ENABLED` all default to `false`. Enabling only one flag is insufficient. Actual mail sending is entirely disabled unless explicitly approved, tested and configured.

## Release blockers

1. Install and twice test the service-only OTP SQL in **TEST**; confirm zero leftover synthetic records after rollback.
2. Review and configure secret bindings, Turnstile host/action/sitekey, two rate-limit bindings, confirmed test mail sender and explicitly allowlisted recipient; verify email free-tier use before enabling any send.
3. The booking API currently returns the newly generated cancellation capability to the **verified TEST browser** and does not insert a durable confirmation e-mail outbox record. Implement reliable confirmation delivery, retry/idempotency and recovery before public release; do not claim a booking confirmation email was delivered.
4. Implement public-safe training catalog read (not Manager's private RPC), optional waiting-list removal, and scheduler endpoints with separate machine authorization.
5. Stress-test **real simultaneous transactions** using independent connections; mocked Worker tests and single-transaction SQL rollback QA are not substitutes.
6. Test actual Cloudflare deployment, Supabase test secrets, verified user mailbox, Turnstile and mobile Player together before enabling the public routes.
7. Add free-first-training identity abuse prevention, SPORT7 fairness, bérlet validation, late-cancellation/no-show sanctions and notifications only after their own independent QA.
8. Complete twice-run 11-point E2E QA and explicit release approval. **LIVE never changes without express authorization.**

## Local and CI checks

`node --test tests/mass-gateway-test-20261101.test.mjs`

`node --test tests/mass-email-otp-contract-20261101.test.cjs`

The GitHub Actions workflows run each twice, with mock Supabase/Turnstile/Resend responses. No test here sends a real e-mail or calls a real API; the SQL postdeploy tests run only when explicitly invoked against TEST and end in `ROLLBACK`.
