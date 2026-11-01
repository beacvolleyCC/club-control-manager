# CC TEST mass-gateway — disabled version upload checklist

**Scope:** Only isolated `cc-mass-gateway-test-beac` Worker. **This checklist does not authorize deployment or public access.**

## Current verified repository state (2026-11-01)
- Config: `vnext/mass-gateway/wrangler.jsonc`, TEST Supabase `szzoubvhlwnojtzqjebc`.
- `workers_dev: false`, `preview_urls: false`, no routes, `PUBLIC_WRITES_ENABLED: "false"`, `EMAIL_VERIFICATION_ENABLED: "false"`, `EMAIL_DELIVERY_ENABLED: "false"`.
- Manual upload workflow: `.github/workflows/upload-mass-gateway-disabled-test-draft-20261101.yml` only on TEST branch; absent on `main` at inspection.
- Test file `tests/mass-gateway-deploy-preflight-20261101.test.mjs` exists; current-round execution still needed.
- No Cloudflare credentials, Worker presence or required secret bindings were verified by connector. **No upload has been performed in this round.**

## Preflight: must confirm before an upload

- [ ] Confirm correct Cloudflare account and check whether isolated Worker `cc-mass-gateway-test-beac` exists. Do not select `cc-player-test-beac` or `cc-manager-test-beac`.
- [ ] Cloudflare API token scope limited to dedicated TEST account/Worker, Workers Scripts Write only where possible; never paste token in chat or commit it.
- [ ] Verify Cloudflare secret bindings **exist**, without reading values: `SUPABASE_TEST_SECRET_KEY`, `TURNSTILE_SECRET`, `EMAIL_PROOF_SECRET`, `EMAIL_OTP_PEPPER`, `RESEND_TEST_API_KEY`, `TEST_EMAIL_FROM`, `TEST_ALLOWED_EMAIL`. If any missing, stop and configure encrypted secrets before upload.
- [ ] Confirm the rate-limit namespace IDs 10421 and 10422 do not conflict in account.
- [ ] Verify Worker has **no routes, no workers.dev address, no preview_urls**; check again after upload.
- [ ] Verify e-mail sender/recipient and Turnstile hostname only when actual sending is separately authorized; leave disabled for this upload.
- [ ] Run twice: `node --test tests/mass-gateway-deploy-preflight-20261101.test.mjs` and `node --test tests/mass-gateway-test-20261101.test.mjs` in a clean TEST branch checkout.
- [ ] Run `npx --yes wrangler@4 deploy --dry-run --config vnext/mass-gateway/wrangler.jsonc --outdir /tmp/cc-mass-gateway-test-build`. Ensure output contains no LIVE project string or secrets.

## Manual upload route

GitHub Actions `workflow_dispatch` may not be selectable if workflow file is absent from default branch. **Do not add to main automatically**; request specific permission before any main change. Once separately registered and reviewed, only run TEST branch and confirmation `UPLOAD_DISABLED_TEST_DRAFT`.

Alternative from an authenticated machine with limited TEST Cloudflare credentials:

```bash
npx --yes wrangler@4 versions upload --config vnext/mass-gateway/wrangler.jsonc --message "CC TEST only, disabled draft; NO DEPLOY"
```

**Do not** use `wrangler deploy` or enable routes, workers.dev, preview URLs, public writes, or email delivery. An uploaded version is not a deployed version.

## After upload

- [ ] Confirm only a **new disabled draft version**, with zero traffic/routes and no public URL.
- [ ] Confirm Manager TEST/Player TEST continue functioning without change.
- [ ] Record version identifier and run results in `docs/handover/CURRENT_HANDOVER.md`.
- [ ] Do not claim real end-to-end booking or e-mail send verified. They require independent authorization, delivery/outbox reliability, concurrency and security tests.
- [ ] Confirm LIVE and existing TEST PWA projects unchanged.

## Known blockers

1. GitHub manual workflow absent from default branch, so GitHub UI trigger not guaranteed.
2. No access here to Cloudflare Worker inventory, account scope, secrets presence or namespace bindings.
3. No proof yet of actual upload or provider end-to-end test.
4. Current booking flow lacks durable confirmation outbox/idempotent delivery, so it must not be enabled to the public.
