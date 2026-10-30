# Stage22: guarded and audited manual future transfer execution — TEST

Date: 2026-10-30 Budapest; source branch: `test/20261026-manager-document-intake`. Isolated TEST DB `szzoubvhlwnojtzqjebc`. LIVE unchanged.

## Deployed
Migration `20261030001256 cc_test_stage22_manual_transfer_apply_pending_guard_20261030`.

- Stage17 `cc_manager_player_transfer_v1` and Stage18 `cc_manager_test_player_reassign_v1`: after locking player, reject bypass of any pending plan (`TRANSFER_PENDING_PLAN_REVIEW_REQUIRED`). Stage18 also uses Budapest-local date.
- Stage20 table receives fields `applied_at`, `applied_by`, `applied_membership_id`, plus applied receipt consistency check.
- New `public.cc_manager_player_transfer_plan_apply_v1(p_plan_id uuid)` is authenticated-only, SECURITY DEFINER with empty search_path, checking live linked Manager and both team edit permissions; anon denied.
- Locks player then plan then source membership; requires pending and date **equal to current Europe/Budapest date**, active player, both teams active, exact pinned original membership, and no confirmed future old-team RSVP.
- Atomic sequence: close original membership without deleting history, insert target membership, set plan applied with a receipt, append audit entry. No RSVP mutation or automatic push.
- For a plan already applied, return `alreadyApplied=true` without adding rows or auditing again (provided permissions remain valid).
- **No cron, scheduler, or automatic plan processing.** Late/early manual execution is denied. User must cancel/replan overdue pending plans.

## QA outcome and limits
- Candidate DDL and RPCs parsed successfully under a transaction with rollback.
- Executed a real TEST Manager JWT / authenticated-role PostgreSQL rollback matrix *before deployment*: pending-plan blocks same-day bypass; early execution denied; manually adjusted synthetic plan to today's Budapest date; apply succeeded; replay idempotent; membership/RSVP/push/audit postconditions PASS. All synthetic changes rolled back.
- SQL candidate subsequently deployed to isolated TEST database.
- Post-deployment READBACK: **31 migrations**, 19 players, 21 memberships, 66 RSVPs, 0 plans, 0 audit rows, 0 pushes. Receipt columns=3, anon execution false, authenticated execution true.
- [Stage22 GitHub security checks](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40978330868): successful; Manager PWA safety and import smoke successful.
- **Post-deployment transactional write test was blocked by the tool's safety control**. Therefore do not claim that the deployed function has been exercised with a write+rollback after migration. Additional independent QA needed before production promotion.
- No browser/iOS end-to-end execution. TEST PWA is still configured in demo mode. Not production ready.
- Concurrent transactions were designed for consistency via player-row lock but were not stress-tested with two independent sessions.

## Outstanding
- More PostgreSQL negative scenarios: stale pinned membership; future-going RSVP added after planning; team-scoped permissions; cancelled plan; unauthorized JWT; overdue; concurrent replay.
- Add Manager UI button to execute eligible pending plan only after an explicit confirmation, with clear messages. No auto execution.
- Validate disabled demo TEST PWA release path; never deploy LIVE without user approval.

## Source files
- `docs/security/TEST_STAGE22_PENDING_PLAN_GUARDS_CANDIDATE_20261030.sql`
- `docs/security/TEST_STAGE22_MANUAL_TRANSFER_APPLY_CANDIDATE_20261030.sql`
- `tests/sql/TEST_STAGE22_MANUAL_APPLY_ROLLBACK_20261030.sql`
- `tests/manager-transfer-stage22-20261030.test.cjs`
- `.github/workflows/test-manager-transfer-stage22.yml`
