# Club Control V2 – 2026-11-14 TEST implementation handover

**Repository**: `beacvolleyCC/club-control-manager`  
**Branch**: `v2/architecture-foundation-20261107`, draft PR #89  
**Database**: `szzoubvhlwnojtzqjebc` (TEST), **never LIVE** `snqsxlyhontaepembaic`

## Completed, deployed to TEST Supabase

1. **One public mass-sport timetable RPC** `cc_v2_mass_public_schedule_v1(p_from,p_to)`. Published, active recreational events only; bounded date range; no names, email, pass numbers, notes, cancellations or legacy raw data. It computes capacity and waiting counts from the existing, shared `mass_events`, `mass_bookings`, `mass_waitlist` tables. Tested via `anon` role; privilege granted for this read-only RPC only. SQL migration `20261114_cc_v2_mass_public_schedule_preview.sql`. The public read does NOT grant direct table access or book places.
2. **Web and Player use the same timetable component**, imported from `v2/frontend-next/shared/mass-schedule-ui.js` and `mass-schedule.js`. TEST web entry: `/frontend-next/mass/`; TEST Player entry: `/frontend-next/player/` (the widget is visible alongside existing Player UI). Both show the same read-only event data. The translations come from published TEST i18n with offline UI fallbacks. The 15 HU/EN labels are published in `20261114_cc_v2_mass_schedule_i18n.sql`.
3. **TEST-only synthetic mass-pass fixtures** added in `20261114_cc_v2_mass_synthetic_pass_fixtures.sql`: three fake people (`example.invalid` addresses), two explicitly mock purchases, one fresh import and one 48-hour-old import. `CC-QA-SYNTHETIC` workbook only. Not real payments; zero LIVE data copied.
4. **Separate BEAC pass-sales state and audited grace window** in `cc_v2_mass_pass_sales_windows_v1`, `cc_v2_mass_pass_sales_audit_v1`, guarded `cc_v2_manager_pass_sales_status_v1` (view) and `cc_v2_manager_pass_sales_set_v1` (edit). The setter requires `mass.passes edit` server-side, persists actor, reason and before/after history. Defaults to unknown/off; no grace or money claimed without explicit manager change. This does not yet affect booking entitlements. The manager control UI is not yet connected.
5. **Verified-only mass player identity foundation** `cc_v2_mass_verified_account_links_v1` mapping `auth.users(id)` to `mass_athletes(id)` with required verified_method/time, no automatic name/email matching and no client INSERT. Owner-only, authenticated status RPC `cc_v2_mass_account_status_v1()`; no identities populated, no claiming flow enabled.
6. **Automated JS/SQL contract regressions** in `v2/tests/mass-public-schedule.test.mjs` and `v2/tests/mass-v2-schema-contract.test.mjs`.

## Verifications and data, November 14

- TEST: `mass_events=6`, `mass_bookings=1`, `mass_waitlist=7`, `mass_athletes=3 (all synthetic)`, `mass_passes=2 (all synthetic)`. 1 fresh / 1 stale import record. No production data copied.
- Existing canonical registries cover 6/6 mass events, 1/1 booking, 7/7 waitlist entries (before current synthetic athlete/pass inserts, which do not change booking/event registry).
- Existing V2 `cc_v2_identity_links=0`, `cc_v2_event_links=0`. New verified mass account links = 0 until trusted identity proof is implemented.
- Tested shared public RPC with `anon` role. Response contains only sanctioned event fields; actual TEST response currently shows a QA event.
- Guarded Manager pass availability: `anon EXECUTE=false`, authenticated EXECUTE true but Manager server-side permission check required, RLS on, tables have no client grants. No rule has been created yet.
- Guarded mass account status: `anon EXECUTE=false`, authenticated read only own identity based on `auth.uid()`, no client access to link table.
- Latest QA on code including new tests: [GitHub Actions #43635577425](https://github.com/beacvolleyCC/club-control-manager/actions/runs/43635577425), pass on commit `899bf9ab8`.
- Cloudflare V2 TEST Pages auto deploy still fails due absent Cloudflare GitHub environment credentials. No public deployed URL or end-to-end TEST browser test has been verified.
- LIVE Supabase was **read only**; LIVE remained unchanged.

## What is still incomplete (do not claim finished)

- Full LIVE→TEST reconciliation/import of real mass-sport athletes, passes and bookings. LIVE has 282 mass athletes, 378 passes, 1,166 bookings. User data is not copied without a specific migration/masking plan, reconciliation and rollback.
- The web/Player display uses common read-only timetable but **signup, cancellation, authenticated self-service and email OTP gateway are NOT wired**. Existing server-only booking functions cannot safely be called directly by browser: the trusted gateway must verify email ownership, apply rate limits, CSRF/signed-session boundaries, abuse protection and idempotency.
- No automatic identity link. A verified linking process must be implemented and security-tested before populating the new table.
- The new pass sales/grace table is only an administrative policy foundation; it does NOT make new bookings pass-eligible, charge money, or enable BEAC website sales.
- The Manager control for sales availability and grace period is not wired.
- Central i18n has 632 legacy keys, most of the imported EN text is draft; translations for this new module are published. Full Manager/Player strings not all switched to shared runtime.
- No real TEST OTP/JWT per-role E2E, mobile PWA test, Cloudflare deploy or LIVE release.

## Recommended next gated implementation steps

1. Build trusted email-OTP gateway. Keep public write functions unavailable to `anon` and `authenticated` directly; no service-role key on client. Rate-limit request/verify/booking, bind email identity to session, verify that the requested athlete owns a booking, and return no other people's details.
2. Connect same booking/cancellation/waitlist API in both `/frontend-next/mass/` and `/frontend-next/player/`; test two simultaneous final-place claims and queue priority, cancellation-window sanctions and one-time first training and SPORT7 rules.
3. Wire Manager sales policy UI with explicit activation and audit. Decide actual grace period, expiry notifications and permitted conditional bookings before enabling any effect on the underlying booking gate. Treat unavailable BEAC product and stale imported pass as distinct.
4. Design staged, checksum/reconciliation-based real-data transfer **without unsafe direct LIVE mutations**: dry run, unique-ID mapping, restricted data export and approval, no duplicate identifiers, clear rollback.
5. Perform Cloudflare TEST deploy configuration and user-permission / email / mobile E2E, then separately authorize any LIVE rollout.

**Key rule:** shared database exists; never create parallel booking or pass data sources. The web/PWA is a shared set of frontends on one service.
