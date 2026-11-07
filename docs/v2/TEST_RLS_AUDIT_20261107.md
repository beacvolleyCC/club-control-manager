# TEST RLS audit — 2026-11-07

Project: TEST only (`szzoubvhlwnojtzqjebc`). Read-only metadata inspection; no schema or data changed.

| Table | RLS | SELECT rule | authenticated grant |
|---|---|---|---|
| teams | on | id in private.current_team_ids() | SELECT |
| events | on | team_id in private.current_team_ids() | SELECT |
| players | on | own player id OR private.player_in_my_team(id) | SELECT |
| team_memberships | on | own player id | SELECT |
| manager_accounts | on | none | none |
| manager_module_permissions | on | none | none |

**Blocker:** The V2 Manager's existing direct REST reads are currently governed by player-team policies, not manager module permissions. Manager-only accounts may see no rows; player accounts may see team data despite not being Manager users. Client-side filtering cannot fix this authorization model.

**Do not** add broad `TO authenticated USING (true)` policies or grant blanket manager table access. Next: design narrowly scoped server-side manager read endpoints using manager account + team/module permission checks, validate denial for other teams, inactive managers and unauthenticated users, and test against TEST actors before enabling main Manager TEST mode. Keep LIVE unchanged.
