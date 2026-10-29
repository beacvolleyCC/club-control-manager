# Club Control TEST – Stage20: Future transfer plans, creation / cancellation / listing

Date: 2026-10-30 Budapest. **TEST ONLY**: Supabase `szzoubvhlwnojtzqjebc`, Manager branch `test/20261026-manager-document-intake`. LIVE untouched.

## Implemented
- New protected table `public.cc_manager_transfer_plans_v1`: player, exact active source membership, source/target teams, future effective date, creator, status and timestamps.
- PostgreSQL RLS enabled, no direct `anon` or `authenticated` table privileges; one pending plan per player enforced by a partial unique index.
- Three authenticated-only Manager APIs: `cc_manager_player_transfer_plan_v1(uuid,uuid,date)`, `cc_manager_player_transfer_plan_cancel_v1(uuid)`, and `cc_manager_player_transfer_plan_list_v1(uuid DEFAULT NULL)`.
- Manager edit permissions required for **both teams** when scheduling or cancelling; view rights required for **both** on list.
- Local Europe/Budapest date, future only and within 366 days. Invalid teams, no effective membership, duplicate pending plans, and confirmed old-team RSVP on/after planned switch date reject scheduling.
- Creation and cancellation write dedicated entries in existing `audit_log`.
- **No automatic execution or cron**. An effective date is advisory until a separate approved migration/worker is designed and tested. Player's current membership stays active. No RSVP or event or push changes.

## Verification and safeguards
- Candidate SQL executed in `BEGIN/ROLLBACK` with schema and authenticated-only RPC checks: PASS.
- Real Manager authenticated role transaction created a plan, verified duplicate rejection and list, then cancelled it; checked audit, preservation and rollback: PASS.
- Migration `20261029231338 cc_test_manager_future_transfer_plan_stage20_20261030` successfully deployed to TEST.
- Same PostgreSQL suite **against installed function** (without DDL) PASS.
- [GitHub Actions Stage20 QA](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40971746155): five static tests, twice, success.
- Postdeployment snapshot: 30 migrations, 19 players, 21 memberships, 66 RSVPs, 0 scheduled transfer records, 0 audit records, 0 push outbox records. No baseline data changed.
- RLS enabled, neither anon nor authenticated has direct table SELECT, anon has no creation RPC EXECUTE.

## Next work / gates
1. Build dedicated Manager UI for create/list/cancel planned transfer; the current Manager transfer form remains today-only.
2. Design a strictly audited **manual execution** workflow first, with revalidation at effective date, serialized player lock, source membership ID pinning, permission check, future confirmed old-team RSVP check and idempotence. Do not silently execute dates via cron.
3. Evaluate only then an automated scheduler, preserving no-cost and risk controls. No automatic transfer currently takes place.
4. Mobile browser and installed PWA end-to-end testing awaits TEST HTTPS deployment.
5. Prevent UTC date inconsistencies across remaining memberships and Player view in a separate isolated migration; keep clubs and BB1/BB2/Men data separate.

## Source and QA
- `docs/security/TEST_STAGE20_TRANSFER_PLANS_CANDIDATE_20261030.sql`
- `tests/sql/TEST_STAGE20_TRANSFER_PLANS_ROLLBACK_20261030.sql`
- `tests/sql/TEST_STAGE20_TRANSFER_PLANS_POSTDEPLOY_ROLLBACK_20261030.sql`
- `tests/manager-transfer-plans-stage20-20261030.test.cjs`
- `.github/workflows/test-manager-transfer-plans-stage20.yml`
