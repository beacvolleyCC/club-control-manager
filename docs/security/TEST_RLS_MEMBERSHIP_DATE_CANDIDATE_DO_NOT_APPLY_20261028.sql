-- CC TEST ONLY / REVIEW CANDIDATE / DO NOT EXECUTE AUTOMATICALLY.
-- Issue #81: membership's effective start and end dates must bound Player RLS.
-- This file is deliberately OUTSIDE supabase/migrations: no DB change is authorized.
-- Apply to Supabase TEST szzoubvhlwnojtzqjebc only after security review and
-- authenticated positive/negative PostgreSQL RLS tests; NEVER apply to LIVE.
--
-- Existing function signatures, SECURITY DEFINER, fixed search_path and grants
-- are preserved by CREATE OR REPLACE. No table policy or role grant is changed.
--
-- PRE-FLIGHT: confirm both existing functions have the signatures recorded below;
-- verify current ACLs exclude anon and retain only required authenticated callers.
--
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
