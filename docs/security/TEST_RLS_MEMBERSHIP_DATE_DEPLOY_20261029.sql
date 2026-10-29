-- CC TEST #81 / intended TEST project szzoubvhlwnojtzqjebc ONLY.
-- Deploy only after green rollback PostgreSQL tests, GitHub CI and security preflight.
-- Source: docs/security/TEST_RLS_MEMBERSHIP_DATE_CANDIDATE_DO_NOT_APPLY_20261028.sql
-- Changes just two existing private helper bodies; existing execute grants persist.
-- Does NOT grant table access, edit Manager permissions, notify players, or touch LIVE.
CREATE OR REPLACE FUNCTION private.current_team_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT DISTINCT tm.team_id
  FROM public.team_memberships tm
  JOIN public.players p ON p.id = tm.player_id
  JOIN public.teams t ON t.id = tm.team_id
  WHERE p.auth_user_id = (SELECT auth.uid())
    AND p.active = TRUE
    AND t.active = TRUE
    AND tm.active = TRUE
    AND tm.starts_on <= CURRENT_DATE
    AND (tm.ends_on IS NULL OR tm.ends_on >= CURRENT_DATE)
$function$;

CREATE OR REPLACE FUNCTION private.player_in_my_team(target_player uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_memberships tm
    JOIN public.players target_p ON target_p.id = tm.player_id
    JOIN public.teams t ON t.id = tm.team_id
    WHERE tm.player_id = target_player
      AND target_p.active = TRUE
      AND t.active = TRUE
      AND tm.active = TRUE
      AND tm.starts_on <= CURRENT_DATE
      AND (tm.ends_on IS NULL OR tm.ends_on >= CURRENT_DATE)
      AND tm.team_id IN (SELECT private.current_team_ids())
  )
$function$;
