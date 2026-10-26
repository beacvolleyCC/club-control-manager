-- READ ONLY, metadata counts. No email, user ID, JWT, password or roster returned.
-- This does NOT create staging personas or test authenticated access.
WITH managers AS (
 SELECT
 count(*) FILTER (WHERE a.active) AS active_managers,
 count(*) FILTER (WHERE a.active AND a.auth_user_id IS NULL) AS unbound_active_managers,
 count(*) FILTER (WHERE a.active AND a.auth_user_id IS NOT NULL AND EXISTS(
   SELECT 1 FROM public.manager_module_permissions mp
   WHERE mp.manager_id=a.id AND mp.module_key='competition.matches' AND mp.can_view
 )) AS bound_can_view_matches,
 count(*) FILTER (WHERE a.active AND a.auth_user_id IS NOT NULL AND NOT EXISTS(
   SELECT 1 FROM public.manager_module_permissions mp
   WHERE mp.manager_id=a.id AND mp.module_key='competition.matches' AND mp.can_view
 )) AS bound_cannot_view_matches
 FROM public.manager_accounts a
), players AS (
 SELECT
 count(*) FILTER (WHERE p.active AND p.auth_user_id IS NOT NULL AND EXISTS(
  SELECT 1 FROM public.team_memberships tm JOIN public.teams t ON t.id=tm.team_id
  WHERE tm.player_id=p.id AND tm.active AND t.active
    AND (tm.starts_on IS NULL OR tm.starts_on<=current_date)
    AND (tm.ends_on IS NULL OR tm.ends_on>=current_date)
 )) AS active_eligible_players,
 count(*) FILTER (WHERE p.active IS FALSE AND p.auth_user_id IS NOT NULL) AS bound_inactive_players,
 count(*) FILTER (WHERE p.active AND p.auth_user_id IS NOT NULL AND EXISTS(
  SELECT 1 FROM public.team_memberships tm WHERE tm.player_id=p.id
    AND tm.active AND tm.ends_on<current_date
 ) AND NOT EXISTS(
  SELECT 1 FROM public.team_memberships tm JOIN public.teams t ON t.id=tm.team_id
  WHERE tm.player_id=p.id AND tm.active AND t.active
    AND (tm.starts_on IS NULL OR tm.starts_on<=current_date)
    AND (tm.ends_on IS NULL OR tm.ends_on>=current_date)
 )) AS bound_only_expired_memberships
 FROM public.players p
)
SELECT current_date AS observed_date,(SELECT row_to_json(m) FROM managers m) AS managers,
 (SELECT row_to_json(p) FROM players p) AS players;
