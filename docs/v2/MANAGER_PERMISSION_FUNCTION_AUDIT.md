# Manager permission function audit — TEST, 2026-11-07

Read-only inspection of existing `private` functions. No database writes.

## Verified behavior in SQL definitions

- `cc_manager_current_account_v1()` requires `auth.uid()`, JWT email, an **active** manager account, matching `auth_user_id` and normalized email. Missing linkage fails with SQLSTATE 42501.
- `cc_manager_can_v1(module, action, team)` matches the current manager's `manager_module_permissions` row and checks `can_view`, `can_edit`, or `can_notify`. Null permission `team_id` is global; a team-specific permission requires exact matching team UUID.
- `cc_manager_require_v1` raises SQLSTATE 42501 if permission check fails.
- These functions are in schema `private` and marked `SECURITY DEFINER`. They must **not** be exposed directly as broad browser RPCs; new endpoints should use narrow return shapes, strict input validation, authenticated identity, least-privilege grants and server-side permission checks.

## Important limits

The SQL source was inspected, but real JWT-context authorization tests have **not** run. No actual Manager REST endpoint has been enabled. The current frontend's direct table reads remain blocked.

## Test matrix before enabling Manager TEST data

| Scenario | Expected |
|---|---|
| Authenticated active Manager with `events:view` permission on own team | Only that team's events |
| Active Manager requesting another team | Denied / no rows |
| Authenticated Player without Manager account | Denied |
| Inactive Manager | Denied |
| Unauthenticated caller | Denied |
| Manager with `edit` but no `view` | View denied unless explicitly granted |
| Manager with global permission | All permitted team data for that module |
| Invalid module/action/team input | Denied |

Next: inspect existing server-side Manager endpoints and module-key vocabulary; implement a scoped read endpoint on the TEST branch and exercise this matrix with test actors. Do not change LIVE.
