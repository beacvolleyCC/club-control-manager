# Club Control TEST — Schema stage 3 (2026-10-26)

Production project `snqsxlyhontaepembaic` was queried **read-only**. All changes below target the separate Free-tier TEST project `szzoubvhlwnojtzqjebc` only.

## Done and verified
- Created five internal helpers mirrored from LIVE: `private.current_player_id`, `private.current_team_ids`, `private.event_in_my_team`, `private.player_in_my_team`, `private.set_updated_at`.
- Mirrored 11 player-specific authenticated RLS policies covering `availability`, `events`, `players`, `team_memberships`, `teams`, `player_private` and `player_settings`.
- Recreated nine safe `private.set_updated_at` triggers only; **notification, broadcasting, push dispatch and other side-effect triggers remain DISABLED / not installed**.
- Explicit function execution restrictions and private schema usage were configured for authenticated RLS helpers only.
- TEST readback: **57/57** tables RLS enabled, **11** RLS policies, **9** custom triggers, **52** functions in public/private including platform-provided ones, **0** tables accessible for SELECT by anonymous and **0** by authenticated; database approx. **13 MB**.
- No Player/Manager TEST clients attached yet. No LIVE DML or code deployments. No extra charges.

## Important boundaries
- The policy functions exist, but the table SELECT/INSERT/UPDATE grants remain withheld; **these policies are not an open authorization**.
- LIVE had 337 public/private functions, including 254 with SECURITY DEFINER (broad elevated privileges) and 18 custom triggers. The majority are not yet ported; 9 remaining triggers may include network/push/email or sensitive writes, and must be reviewed, isolated or replaced by inert TEST behavior.
- There are no TEST athlete data or Auth accounts, no private file clone, no legacy app RPCs yet; TEST remains an intentionally nonfunctional schema shell.
- A precise full dump/export, function dependency ordering, conservative `SECURITY DEFINER` EXECUTE grants and review of Storage/realtime policies are still required before TEST can act like LIVE.
- Existing LIVE applications unchanged apart from previously separately authorized Player BB2 grey match hotfix PR #30, already deployed successfully.

## Next execution scope
1. Identify safe *read-only* RPCs and other internal SQL helpers required by Manager/Player, with dependency graph; reconstruct them on TEST with denied PUBLIC execute.
2. Read the exact original function-level privileges; grant only authorized TEST roles after isolated Auth smoke tests.
3. Implement inert notification / push / email mock behavior in TEST so real messages cannot be sent.
4. Seed synthetic data and verify RLS, cross-team and cross-division separation, and application UI.
5. Keep cost 0 HUF, no paid Supabase branches, no LIVE writes.
