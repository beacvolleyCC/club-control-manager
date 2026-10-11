# Manager — HU date/time controls and training color regression QA
Date: 2026-10-12. Branch: `manager-rebuild` (preview-only, NOT production). No Supabase mutation.

## Fixed
- Localized Hungarian date picker for every dynamic/native `input[type=date]` in Manager, with Monday-first month/week grid, Hungarian month/weekday labels and Budapest current date.
- Scrollable hour (00–23) and minute (00–59) wheels in every native `input[type=time]`, as a consistent UI independent of the user's browser locale; underlying native HTML inputs remain for ISO data binding and validation.
- Shared color fallback for mass-training events whose historical `color` is NULL; normalized accented and en-dash level names; Kezdő blue #4B91E1, Középhaladó red #DE4F4F, Haladó dark #292929 and mixed purple #8856CD; existing explicit valid hex colors take precedence.
- Repaired mass list dot color fallback and Mass training event create/edit default + five-click preset palette.
- Service worker cache version bumped and both picker assets precached.

## 24 self-contained QA checks
24/24 pass: JS parse x3, HTML asset link x2, SW precache, swatches+styles, default fallback, underlying data-contract preservation, Monday/Sunday boundaries (2026-10-12/11), HU date output, 24h validation (23:59), rejection of AM/PM, 2027 spring/fall DST dates, four level colors, preservation of saved custom color, and remaining static contract checks.

## Limits and release gate
No authenticated browser-based UI test, no iPhone/Android smoke, no production deployment. Test selector observers, iOS touch wheel behavior, focus/keyboard controls and modality in actual devices before production.

**DO NOT merge this branch directly into main.** Original 2026-10-10 handover warned that `manager-rebuild` was diverged from `main`; main includes scoreboard/scorer V3 features absent on QA branch. Reconcile unrelated main work before rollout.

**Main SHA at report time:** `885bda7ad6c22ba23c0f0fee520680528f1074f7`; branch SHA: `1149564bae6a95ce24c35a802feac95cf087a6d1`.

Files: `hu-picker.js`, `hu-picker.css`, `app.js`, `index.html`, `sw.js`.

No data writes, no Worker deployment, no player PWA changes.
