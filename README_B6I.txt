Club Control Manager V0.5.2B6I — 2026-10-04

Baseline: B6H
Backend companion: MGR021

INCLUDED
- Event cards: date/time centered; right side only attendance + position breakdown.
- Position breakdown remains one line on narrow screens, including Liberó.
- Overview > Következő meccsek uses the exact same match-card component as Meccsek.
- Past match result is shown before date/time when available.
- Standings: independent horizontal mobile scroll; Liga csapat filter actually filters table rows.
- Teams > Rács: coach availability lives here; Overview is read-only.
- Coach availability: backend canEdit supports full-admin override / normal coach self-edit only.
- Team gradient header rounded on all four corners.
- Manager player cards/details show Player-entered sports-medical appointment status/date/time/location.
- Header app mark crops the legacy surrounding yellow and shows the circular black logo mark.

FINANCE
- Competition finance matrix filters: team, name/email, month, fee type, status; surname A-Z.
- Passes: unified BEAC raw catalog for mass + competition passes.
- Product names containing versenyzői / versenyzoi normalize to competition pass category.
- Pass filters: type, level, team, month, name/email/pass/product, status.
- Imported/raw price is primary for revenue; configured price is fallback if missing.
- Team-specific fee configuration for BEAC Női I / Női II / Férfi through MGR021.
- Manual BEAC checkbox = "Kézi felülírás zárolása". Unlocked manual state may be superseded by later BEAC import; locked state wins.
- Unified pass dataset is ready to feed later analytics/reporting.

KNOWN / NOT CLAIMED IN B6I
- BRSZ sync still exposes only aggregate pendingChanges/updatedEvents in the current client contract. A row-level "current vs imported" conflict chooser is NOT implemented in this build because the current sync API does not expose the two candidate records/resolution endpoint yet.
- Live authenticated and physical iPhone/Android/desktop smoke is still required after deployment.

DEPLOY
1. Run MGR021 PRECHECK.
2. If clean, run MGR021 INSTALL.
3. Run MGR021 POSTCHECK.
4. Replace Manager frontend files from this package.
5. Keep your existing config.js, manifest.webmanifest and icons/ unless explicitly replacing them separately.

config.js is intentionally NOT included.
