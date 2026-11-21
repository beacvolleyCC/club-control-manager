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
