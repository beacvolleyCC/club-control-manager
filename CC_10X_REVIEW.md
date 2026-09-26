# CC 10× Review — Manager PWA V0.4

## Scope
Versenysport read-only core parity: Áttekintés, Edzések, Meccsek, Naptár, Csapatok, Játékosok. No write operations. No new SQL migration.

| Gate | Status | V0.4 result |
|---|---|---|
| Product / Business | PASS | Core daily Manager read surfaces are real, not placeholders. |
| UX / IA | PASS | Mass/Competition hierarchy retained; global Settings retained; Training Planner excluded. |
| UI / Design System | PASS | Player-derived Club Control language retained; master/detail on large screens, compact mobile components. |
| Frontend / PWA / Device | PASS* | Adaptive CSS, day/week/month/season calendar, mobile agenda, cache bump. *Physical iPhone/desktop live smoke remains deployment gate. |
| Backend / API | PASS | Uses installed MGR001 scoped RPCs only; no browser table reads introduced. |
| Database / Data Integrity | PASS | V0.4 requires no schema/write migration. Read-only only. |
| Architecture / Integration | PASS | One responsive PWA; no separate mobile backend; current Supabase contracts retained. |
| Security / Permissions | PASS | Permission-aware RPC loading and route gate; publishable key only; privileged secrets absent. |
| QA / Performance / Accessibility | PASS* | Static QA 25/25; keyboard focus retained; bounded season/calendar RPC windows. *Live authenticated smoke remains. |
| DevOps / Release / Rollback | PASS | Full-replacement package, V0.4 SW cache name, V0.3 remains Git rollback point. |

## Important fixes included
- Replaced `Promise.allSettled()` core loading with fail-closed required RPC handling.
- Partial module-permission accounts no longer require every core RPC.
- Direct hash navigation to an unauthorized module renders a permission-denied state.
- Event rows now open a real detail dialog instead of being a dead click target.
- Calendar uses Europe/Budapest date keys rather than UTC-day grouping.
- Service worker cache bumped to V0.4.

## Known intentional gaps
- No edit/write operations yet.
- Team animal avatars are not exposed by MGR001, so V0.4 uses monograms in Manager roster/detail. Do not add a broad player_settings browser read just for this.
- Fees remains later parity work.
- Competition Core / BRSZ / MRSZ remains separate 054 work.
- Mass-sport runtime remains later parity work.
- Training Planner remains excluded.

## Deployment gate
After GitHub Pages deployment, perform authenticated smoke on:
1. Versenysport Overview
2. Trainings / Matches filters and event detail
3. Teams master/detail
4. Players search/filter/detail
5. Calendar Day/Week/Month/Season
6. Mobile layout + bottom navigation
7. Desktop layout + sidebar
8. Dark mode
9. Refresh
10. Logout/login session
