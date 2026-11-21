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
