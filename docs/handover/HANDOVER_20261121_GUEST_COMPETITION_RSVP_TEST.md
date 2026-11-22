## 2026-11-22 — Direct browser deployment attempt, TEST only

**User unable to download chat/GitHub ZIP.** Added CI-driven website deployment of all three actual frontends from TEST feature branches and common TEST Supabase.

- `.github/workflows/guest-temporary-test.yml` uses Cloudflare Wrangler v4.102.0 temporary unauthenticated Workers Static Assets, bundling Manager, Player and the guest page. The temporary Cloudflare Worker was created (GitHub run [45026804434](https://github.com/beacvolleyCC/club-control-manager/actions/runs/45026804434)), temporary URL `https://cc-beac-guest-system-test.gaudy-spandex.workers.dev/`. **Not confirmed browser-functional**; CI smoke received HTTP 404 immediately. A subsequent independent diagnostic [45026959119](https://github.com/beacvolleyCC/club-control-manager/actions/runs/45026959119) received HTTP 403 Cloudflare "Just a moment" bot challenge on all paths from the GitHub Actions runner. Browser challenge may be solvable by user; do not claim verified availability. Temporary account expires after 60 min unless claimed. Cloudflare claim token was intentionally **not exposed in public CI logs**.
- `.github/workflows/deploy-guest-pages-test.yml`: permanent Direct Upload workflow targeting **uniquely named, separate** `cc-beac-guest-system-test` Cloudflare Pages project, with a test-only Manager/Player/guest routing index. No LIVE routes or LIVE projects are targeted. Manager/Player configs checked against TEST ref `szzoubvhlwnojtzqjebc`, LIVE ref rejected; static JS syntax validation.
- Persistent deploy run [45027123458](https://github.com/beacvolleyCC/club-control-manager/actions/runs/45027123458) **blocked** at credential validation: both `CLOUDFLARE_TEST_ACCOUNT_ID` and `CLOUDFLARE_TEST_API_TOKEN` are unset in the Manager repo GitHub Actions secrets. Nothing was deployed to the user's Cloudflare account.
- User action needed: save those **two values as repository Actions secrets** at `https://github.com/beacvolleyCC/club-control-manager/settings/secrets/actions` (Cloudflare token with Pages Edit access). **Never paste token in chat**. Then trigger the existing workflow on feature branch, or assistant can push a safe workflow-only revision to trigger CI.
- No LIVE changes, no merge. Permanent TEST URL cannot be claimed active until successful workflow deploy + verified browser smoke.

---

## 2026-11-22 — Portable Manager + Player + Guest TEST bundle
- Verified that Manager/Player/guest feature branches are ahead of main, with zero commits behind main.
- Separate Cloudflare TEST deployment still not available: no connected Cloudflare app, and `CLOUDFLARE_TEST_API_TOKEN` / `CLOUDFLARE_TEST_ACCOUNT_ID` GitHub Actions secrets were previously confirmed absent.
- Added `.github/workflows/build-guest-test-bundle.yml` on the Manager guest feature branch, with 3-app archive containing the current Manager, Player, and guest web frontend.
- The first GitHub Actions run could not checkout the private `beac-edzesek` repository using Manager-scoped GitHub Actions permissions; resolved by copying the current guest frontend into `test-guest-preview/index.html` in the Manager TEST feature branch. No cross-repository secrets are included.
- Packaging run: https://github.com/beacvolleyCC/club-control-manager/actions/runs/45021076207 — **success**, artifact ID 14754195866, artifact name `Club_Control_Guest_TEST_Windows`, size ~13 MB, retention 14 days.
- ZIP contains `manager/`, `player/`, `vendeg/`, `START_TEST.bat` and `RUN_LOCAL.ps1`, which serve the TEST apps on Windows loopback at http://127.0.0.1:8765/.
- ZIP bytes downloaded, verified as a valid ZIP with 196 entries and all required HTML, JS, configuration and launcher files present. A scan confirmed no LIVE Supabase project reference in any bundled source file; `manager/config.js` and `player/config.js` both point to `szzoubvhlwnojtzqjebc`.
- GitHub Actions contract and static syntax checks were successful; **logged-in Manager/Player end-to-end QA remains unverified**. The automated browser runtime in the assistant environment blocked localhost navigation; verify launch and authentication on user Windows PC. Test-account sign-in via OTP/email redirect may depend on Supabase Auth's permitted redirect URLs.
- No LIVE database, live frontend, or active website routes modified. All code additions are TEST feature branch only.

---

## 2026-11-21 late update — Working TEST preview URLs

Three Supabase Edge Functions were deployed to the **TEST Supabase project only**, not to LIVE:
- Guest page: https://szzoubvhlwnojtzqjebc.supabase.co/functions/v1/cc-guest-preview
- Manager preview: https://szzoubvhlwnojtzqjebc.supabase.co/functions/v1/cc-manager-preview
- Player preview: https://szzoubvhlwnojtzqjebc.supabase.co/functions/v1/cc-player-preview

Manager and Player previews proxy static frontend assets from the specific TEST GitHub feature branches, and both branch `config.js` files use the TEST Supabase project and publishable key. Player push disabled on TEST. These preview Edge functions are **not** the permanent Cloudflare release target; they provide a rapid test harness. Anonymous GET to Manager/Player preview is public, but database authorization remains Supabase Auth + RLS/RPC.

TEST database fixtures:
- Guest: `vendegteszt-20261121@example.invalid` (PIN conveyed separately to tester; never use production personal data).
- Guest belongs to BEAC Férfi TEST team only.
- Event `f90af9cc-56ed-45d2-8f8c-0501804062c1` TEST Sunday 2026-11-22 17:00 CET, guest RSVP `going` verified.
- Event `3e7763e4-6255-44d0-855e-b17981da6701` TEST Monday 2026-11-23 19:00 CET, next calendar week.

Database E2E read/write check: successful guest PIN login, current week contains TEST event, RSVP saved to same `availability` table, count returned as 1 and `myStatus=going`.

External GitHub Actions HTTP smoke:
- Guest preview HTML and **incorrect PIN rejected** — PASS: [run 44951749567, attempt 2](https://github.com/beacvolleyCC/beac-edzesek/actions/runs/44951749567).
- Manager + Player preview HTML, `config.js` TEST isolation, `app.js` download — PASS: [run 44952045424, attempt 3](https://github.com/beacvolleyCC/club-control-manager/actions/runs/44952045424).
- Manager competition roster CI last relevant [run 44952056962](https://github.com/beacvolleyCC/club-control-manager/actions/runs/44952056962) — PASS after aligning regression contract with guest-aware wrapper.

**Still open:** authenticated browser E2E for Manager + Player (account permissions, save/refresh), full security and mobile visual QA. No LIVE migration or deployment, no Cloudflare LIVE changes. Feature PRs remain draft.

---

# CLUB CONTROL — GUEST COMPETITION RSVP TEST handover

**Date:** 2026-11-21
**Scope:** TEST-only extension of existing consolidated Club Control data model.

## Repositories / branches
- `beacvolleyCC/club-control-manager` — `feature/guest-competition-rsvp-20261121`: SQL migration + Manager UI.
- `beacvolleyCC/player_application` — same feature branch: guest attendee roster and counts.
- `beacvolleyCC/beac-edzesek` — same feature branch: public `/vendeg` page + Worker proxy.

## TEST Supabase
**Project:** `szzoubvhlwnojtzqjebc`.
Migrations applied: `cc_guest_competition_rsvp_v1_20261121`; `cc_guest_auth_null_guard_v1_20261121`.
Existing `players` extended with `player_kind=guest`, while `availability` continues to store **all member and guest RSVP records** against the same competition `events`. Guest users do not gain permanent `team_memberships`.
Added separate guest **access metadata** (PIN hash, team access, session/attempt hashes), not a second training/event/RSVP system. Public RLS enabled and direct table access revoked; carefully scoped RPC entry points. PINs are 8 random digits and displayed only when created/reset.

New RPC contracts:
- `cc_guest_login_v1`, `cc_guest_week_v1`, `cc_guest_rsvp_v1`, `cc_guest_logout_v1`
- `cc_guest_admin_list_v1`, `cc_guest_admin_save_v1`, `cc_guest_admin_rsvp_v1`
- `cc_manager_events_with_guests_v1`, `cc_manager_event_roster_with_guests_v1`.
Existing `cc_player_bootstrap_filtered_v1` extended to output `guestNames` for training events; unchanged permanent roster.

## UI changes
Manager Tömegsport > Vendégek uses `mass.athletes` permission, provides guest create/edit/deactivate, team assignment and PIN reset; Manager competition event total and roster add guests last without avatar.
Player training cards, details, planner and attendance summary include guest counts, with separate final guest row (no avatar).
Website Worker only in new branch serves `/vendeg` and `/vendeg/api`. The Worker **fails closed unless TEST Supabase URL and TEST publishable key are configured**, and must be published on separate TEST Cloudflare deployment.

## Verified / not verified
- TEST migration tool reports success, read-only schema and RPC privileges checked; anonymous guest login with nonexistent credentials returned `INVALID_CREDENTIALS`, anonymous guest-admin EXECUTE denied.
- Branch GitHub Actions Node syntax/contract checks: passed for all three repositories.
- A temporary-row E2E SQL write test was blocked by connector safety; **there is no verified valid guest login/RSVP roundtrip** yet.
- No browser-based QA, real TEST Cloudflare deployment, mobile UX test, full E2E, or LIVE migration/deploy performed.
- LIVE Supabase `snqsxlyhontaepembaic` remains untouched. LIVE Manager/Player and public booking routes untouched.

## Required next steps
1. Deploy all feature branches to isolated TEST sites against TEST Supabase, configure Cloudflare vars, then perform real E2E.
2. Review security of auth/restricted team access and existing event/integration regressions.
3. Verify all Manager & Player counts and sort behavior, no guest duplicate in full roster.
4. After explicit approval, apply compatible migration to LIVE and release frontend/Worker changes in controlled order. Keep backup and rollback strategy for LIVE.
