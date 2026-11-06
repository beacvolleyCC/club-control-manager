# Club Control – LIVE BEAC pass reconciliation handover (2026-11-06)

## Scope
- PR #85, branch `hotfix/20261106-live-beac-pass-reconciliation`, target `main`.
- LIVE Supabase `snqsxlyhontaepembaic`; TEST remains separate.
- Mass training roster: weekly BEAC import match by normalized email and athlete name; purchase timestamp, pass month, pass number; import number adoption and manual booking pass-number correction; existing pass status editor.
- Mass athlete detail: imported purchase information and per-training pass number correction in attendance history, requiring a unique booking match.
- All edits are explicit user actions, never automatic bulk reconciliation.

## LIVE database
Applied successfully via Supabase migration:
`20261106154928_live_mass_beac_weekly_pass_match_and_audited_booking_pass_edit_20261106`.
Functions:
- `public.cc_manager_mass_weekly_pass_matches_v1()` – manager permissions mass.passes/view AND mass.trainings/view.
- `public.cc_manager_mass_booking_pass_number_set_v1(text,text,text)` – manager mass.trainings/edit, validates nonempty pass number, rejects cancelled bookings, audits before/after in `mass_live_write_audit`.
- `authenticated` can execute; `anon` cannot.
- No existing bookings were changed by the migration.

## Read-only checks
- 2026-11-06 LIVE current-week join produced 38 matching rows and 38 distinct booking IDs (not distinct athletes); previous email-only count was 48.
- BEAC pass hotfix QA: success on GitHub Actions run 42250360515 (commit 04734000).
- Other current-run QA checks succeeded except `Manager competition training roster QA` which fails on a league standings regular-expression assertion already absent in `main` (unrelated baseline failure).

## Remaining before marking deployed
1. Verify JS syntax and BEAC QA on latest commit.
2. Authenticated manager end-to-end read and pass edit / readback / audit check with a controlled booking, and ensure only intended booking changes.
3. Verify Cloudflare LIVE build/deploy and PWA cache freshness after merge.
4. Verify mass roster and athlete detail manually in LIVE.
5. Update handover with verified deploy commit and observed result.

## Rollback
- Revert PR merge to restore frontend.
- Database functions are additive; do not delete while deployed UI calls them. Existing bookings unaffected unless a manager explicitly edited one.
