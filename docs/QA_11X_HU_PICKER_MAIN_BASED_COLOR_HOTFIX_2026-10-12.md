# Club Control Manager — HU date/time picker and color hotfix: 11× QA
**Date:** 2026-10-12 (Europe/Budapest)
**Safety:** QA-only preview, NOT deployed; no Supabase or production GitHub `main` writes.

## Branch strategy
The prior `manager-rebuild` branch diverged from production `main` by 26 commits ahead / 4 behind at review time. Blind merge would overwrite or lose concurrent scorekeeping work. Instead, a narrow, separate **`qa/hu-manager-hotfix-2026-10-12`** branch was created directly from main at:
`885bda7ad6c22ba23c0f0fee520680528f1074f7`.
Only hotfix UI files were added or patched. No unrelated MRSZ/league source sync was merged.

## Functional changes
- `hu-picker.js` / `hu-picker.css`: Hungarian date picker, Monday-first days `H K Sze Cs P Szo V`, localized date text and Budapest current date; all dynamically rendered `input[type=date]` upgraded via observer.
- Time picker: all dynamically rendered `input[type=time]` upgraded regardless of browser OS locale; quick-scroll 48 half-hour slots `00:00...23:30`, plus exact 24-hour/60-minute scroll wheels. No AM/PM. Native inputs remain mounted as the authoritative `YYYY-MM-DD` / `HH:mm` form values; native `input` and `change` events are dispatched when choosing.
- `app.js`: normalized level name accents and en-dash, restored color fallbacks for preexisting `mass_events.color IS NULL`: Kezdő `#4B91E1`, Középhaladó `#DE4F4F`, Haladó `#292929`, mixed `#8856CD`, Versenysport `#E78B2D`; saved custom `#RRGGBB` always wins.
- Mass training list colored dots now use same level fallback, editor defaults to Kezdő blue instead of nonsemantic grey, five selectable swatches; custom color selection remains.
- `index.html` links two new assets. `sw.js` precaches both and has a new cache version. No production auto-deploy or Manager service-role changes.

## CI and package
GitHub Actions [run 38185542639 — SUCCESS](https://github.com/beacvolleyCC/club-control-manager/actions/runs/38185542639) at `616909e0711b156ae816ce3bb593c5b326283966`.
- **32/32 Node static/source validation tests PASSED** (0 failures).
- `node --check app.js`, `node --check hu-picker.js`, `node --check sw.js` successful.
- **Preview artifact**: [CC_MANAGER_HU_24H_SZINEK_PREVIEW](https://github.com/beacvolleyCC/club-control-manager/actions/runs/38185542639/artifacts/11718789670) — complete offline-capable PWA frontend files, 6.3 MB, 14-day GitHub retention; NOT an installed deployment.
- Unrelated source protection checked independently: blob SHA of `scoreboard.js`, `scoreboard.css`, `volleyball-core.js`, `volleyball-ui.js`, and `volleyball.css` is **identical between main and hotfix branch**.

## 11× domain review
| # | Domain | Status | Evidence / limit |
|---|---|---|---|
| 1 | Product & requirement parity | PASS (source) | HU, 24h, Monday, wheels/presets, palette requested |
| 2 | UX & IA | PASS (source) | Picker added globally without changing Manager module routing |
| 3 | Design/UI | PASS (source) | Level palette, custom selection preserved, dark/mobile CSS selectors |
| 4 | Frontend/PWA | PASS (automated) | 32 tests, 3 JS parse checks, assets and SW cache |
| 5 | API/backend | PASS (change isolation) | No RPC, Worker or Supabase API changes |
| 6 | Database/history | PASS (change isolation) | No writes, no data migrations, stored custom colors take precedence |
| 7 | Architecture & compatibility | PASS (source) | Main-based hotfix, all five scorer/volleyball files exact SHA parity |
| 8 | Security & permission boundaries | PASS (source) | No new privileged endpoints/network requests, original Manager auth remains |
| 9 | User/browser/accessibility runtime | PARTIAL | Actual logged-in desktop+mobile date popup, native validation, focus/keyboard/wheel interactions still need visual/browser device smoke |
| 10 | DevOps/release & rollback | PASS (staging) | CI success, versioned SW and preview artifact; production remains untouched |
| 11 | Motion & interactions | PARTIAL | Motion styling/reduced-motion support is present, but real iOS/Android scroll/snap, modal stacking and interaction smoothness unverified |

**Stage result: 9 PASS / 2 PARTIAL. Production deployment NO-GO pending authenticated desktop and mobile smoke plus explicit release approval.**

## Manual pre-deploy checklist
- Desktop Chrome: competition create/edit training and match, mass create/edit training; date popovers Monday-first; quick 30m and precise minute wheel; save and reopen, verify HH:mm.
- iPhone Safari/PWA: scroll minute+hour wheels inside dialog; no clipped modal; keyboard focus, Escape/backdrop, no AM/PM.
- Colors: existing NULL-color mass classes Kezdő blue, Középhaladó red, Haladó black; mixed label en dash purple; explicit custom colors preserved; preset selection and switching level before/after custom choice.
- Team, roster, scheduling, match scoring V3, notifications, permissions and login unaffected.
- Date correctness for `2027-03-28` and `2027-10-31` Budapest DST transitions.
- Confirm no unauthorized deployment or Cloudflare/Supabase mutation; obtain release authorization before deployment.

**Do not merge `manager-rebuild` into `main`** as a shortcut. This preview branch is deliberately based on main, with a narrowly scoped UI patch.
