# Club Control TEST – Stage 21: Manager scheduled team-transfer UI
Date: 2026-10-30 Budapest. GitHub Manager branch: `test/20261026-manager-document-intake`.
Supabase TEST: `szzoubvhlwnojtzqjebc`. **LIVE not changed.**

## Delivered (Manager TEST UI)
- In the existing player **Csapatváltás** pane, a separate **Előre ütemezett csapatváltás** section:
  - select destination team, effective Budapest-local date (tomorrow to +366 days), create future plan through Stage20 RPC;
  - show pending plan source/target team and planned date, and allow a secure cancellation through Stage20 RPC;
  - warn clearly when a plan's date has passed: there is **no automatic execution**;
  - persistent inline Hungarian errors for duplicate plan, future confirmed old-team RSVP, insufficient both-team permissions, invalid membership and dates;
  - disable submission during async action, block repeat clicks and verify cancellation plan ID belongs to the current player;
  - do not allow the *UI* today-transfer action while a plan is pending or the planned transfer list cannot be loaded;
  - after create/cancel, reload pending plan list from the RPC; if reload fails, report that the write succeeded but the list failed, without falsely claiming an updated view.
- `loadPlayers()` also refreshes the authorized `cc_manager_player_transfer_plan_list_v1` results; list failures are handled without exposing stale plans.
- TEST PWA updated and asset/cache version synchronized: `test-20261030-stage21-transfer-plan-ui-v1`. Separate TEST namespace maintained.
- No new Player API, notification, automated execution, database schema or LIVE deployment.

## Verified
- Node VM behavioral tests execute extracted **actual Manager functions**, not simulated replacements:
  - tomorrow and DST dates, valid/invalid dates, pending plan rendering, overdue warning, unsuccessful plan list and RPC, authorized plan create/cancel, duplicate submissions, stale plan ID guard, existing immediate-transfer guard, new PWA cache/style.
- [Stage21 UI workflow](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40973072171): **17/17 × 2 PASS**, 0 failures.
- [Existing Stage19 transfer UI QA](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40973130375): PASS after generalizing TEST cache token matcher.
- Manager TEST PWA safety and Manager TEST import smoke: PASS.
- TEST Supabase readback: 30 migrations, 19 players, 21 memberships, 66 RSVPs, 0 transfer-plan records, 0 audit rows, 0 push messages; plan table RLS remains enabled and inaccessible directly for `authenticated`; `anon` cannot create plans.
- Stage20 real PostgreSQL create/list/cancel rollback QA was previously PASS. Stage21 contains no DB migration.

## Release gates / known limits
1. Current `config.js` for Manager TEST is **DATA_MODE:'demo'**, with empty Supabase URL and publishable key. Do NOT claim end-to-end browser or iPhone functionality before a separately deployed and connected isolated TEST PWA has been verified. Existing UI/DB tests are separate.
2. The backend does **not** execute planned transfers automatically (nor will this UI). Need a separate manually approved, idempotent, audited execution RPC with source-membership ID and future RSVP revalidation, and then rollout planning.
3. Stage17/18 existing immediate transfer RPCs have no *database-level* guard against a pending future plan; Stage21 UI prevents this path, but another authorized RPC client could still change a membership. Implement a DB guard/reconciliation before enabling planned execution or LIVE.
4. UI's full end-to-end test with authenticated account and actual RPC data requires TEST deployment. Keep LIVE and the `main` branch unchanged.

## Key files
- `app.js` – Stage21 planned transfer UI and RPC integration
- `styles.css`, `index.html`, `sw.js` – styling and cache update
- `tests/manager-transfer-plans-ui-stage21-20261030.test.cjs`
- `.github/workflows/test-manager-transfer-plans-ui-stage21.yml`
- `docs/security/TEST_STAGE20_TRANSFER_PLANS_CANDIDATE_20261030.sql` – previously installed Stage20 DB
