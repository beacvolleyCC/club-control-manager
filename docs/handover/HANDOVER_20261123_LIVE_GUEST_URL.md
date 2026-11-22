# Club Control — LIVE guest registration public URL (2026-11-23)

## Delivered

The existing LIVE Manager GitHub Pages website was successfully updated on 2026-11-22 with:
- Public guest page **https://beacvolleycc.github.io/club-control-manager/vendeg/** published at `vendeg/index.html`.
- LIVE Supabase configuration `snqsxlyhontaepembaic` and publishable API key; **no TEST project references** in the guest HTML.
- Guest UI maintains mass-sports registration look with HU/EN language switching, light/dark, and three-position `going/unknown/not_going` RSVP. Auth uses guest-specific email+PIN; Manager continues existing Supabase Auth OTP unchanged.
- Private image source was replaced with public `../assets/beac-logo-96.png`.
- Gated LIVE Manager settings debug panel now has a link to `./vendeg/` (commit `de28b1c7994cef7d812aa0a1a26a3845664ca9bd`).
- Source guest URL publish commit `8c6f7cb1ba9a43d09151f259cc10cb5d17e0a661`; Github Pages deployment run `45084544870` **success**.
- New workflow `.github/workflows/guest-live-smoke.yml` checks HTML syntax, publication and LIVE-only endpoint. Run `45084703681` **success**; HTTP check returned the published page.
- No `beacvolley.hu/vendeg` deployment: Cloudflare publishing credentials for the root-domain public website are not connected to this workflow. **Never claim this root-domain URL exists.**

## LIVE DB

- Two migrations applied on LIVE Supabase: `cc_guest_competition_rsvp_live_20261123` and `cc_guest_rsvp_three_state_live_20261123`.
- Guest profiles, teams, private hashed PIN sessions, limited retries, weekly RSVP and manager/roster helper RPCs created. Existing player records and training events preserved.
- Live function verification: guest negative login returned `INVALID_CREDENTIALS`, anonymous guest login EXECUTE true, anonymous guest admin save EXECUTE false, **zero guest profiles** existed at validation.
- **No valid guest email+PIN end-to-end QA**: no actual guest account exists yet.
- Manager/Player full guest module code remains in TEST-only feature branches (Manager PR #101; Player #38); **not merged to LIVE**. Therefore real guest creation from Manager UI and guest roster/headcount appearance in both LIVE apps have **not yet been enabled**.
- The live debugging preview in Manager Settings is a separate browser-only simulation and does not create real guest accounts.

## Next release gate

- Integrate only the minimal guest administration UI into LIVE Manager (preserve existing debug mode/auth), and guest roster and headcount into both Manager and Player.
- Security test authorized admin guest create, duplicate email, valid/wrong PIN, team-specific visibility, RSVP yes/no/unknown, and attendance count reconciliation.
- No existing LIVE attendee record may be modified during tests without explicit target selection.
- Cloudflare `beacvolley.hu/vendeg` route can be added later via an independently verified, account-authorized Worker release.
