-- TEST ONLY. Candidate, not installed. Fixes cross-team results disclosure.
-- Preserve the existing API shape and require per-team view permission.
CREATE OR REPLACE FUNCTION public.cc_manager_competition_results_v1(p_team_ids uuid[] DEFAULT NULL::uuid[])
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO ''
AS $function$
DECLARE v_manager_id uuid; v_result jsonb;
BEGIN
 v_manager_id:=private.cc_manager_require_any_v1('competition.matches','view');
 SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY x."startsAt" DESC),'[]'::jsonb)
 INTO v_result FROM (
   SELECT s.linked_event_id AS "eventId",s.internal_team_id AS "teamId",
    s.source,s.season,s.source_match_key AS "sourceMatchKey",
    s.home_name AS "homeName",s.away_name AS "awayName",
    s.starts_at AS "startsAt",s.home_sets AS "homeSets",
    s.away_sets AS "awaySets",s.set_scores AS "setScores",
    s.home_points AS "homePoints",s.away_points AS "awayPoints",
    s.source_status AS "sourceStatus",s.source_url AS "sourceUrl",
    s.result_seen_at AS "resultSeenAt"
   FROM public.competition_source_matches s
   WHERE s.home_sets IS NOT NULL AND s.away_sets IS NOT NULL
    AND s.internal_team_id IS NOT NULL
    AND (p_team_ids IS NULL OR cardinality(p_team_ids)=0 OR s.internal_team_id=ANY(p_team_ids))
    AND EXISTS (
      SELECT 1 FROM public.manager_module_permissions mp
      WHERE mp.manager_id=v_manager_id AND mp.module_key='competition.matches'
       AND mp.can_view IS TRUE
       AND (mp.team_id IS NULL OR mp.team_id=s.internal_team_id)
    )
 ) x;
 RETURN v_result;
END
$function$;
REVOKE ALL ON FUNCTION public.cc_manager_competition_results_v1(uuid[]) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_competition_results_v1(uuid[]) TO authenticated;
