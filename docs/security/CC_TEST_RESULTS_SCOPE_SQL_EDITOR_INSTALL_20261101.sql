-- CC TEST ONLY: SQL Editor manual deployment of reviewed result-scope patch.
-- Project: szzoubvhlwnojtzqjebc. Not for LIVE. All edits inside a transaction.
-- Guard: TEST event marker MUST exist, otherwise the entire transaction aborts.
BEGIN;
DO $cc_test_guard$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.events
    WHERE legacy_manager_id='cc_test_bb2_rsvp_20261106'
  ) THEN
    RAISE EXCEPTION 'WRONG_PROJECT_NOT_CC_TEST_ABORT' USING ERRCODE='42501';
  END IF;
END
$cc_test_guard$;

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


COMMIT;

-- Read-only confirmation after deployment.
SELECT
  to_regprocedure('public.cc_manager_competition_results_v1(uuid[])') IS NOT NULL AS rpc_exists,
  position('mp.team_id=s.internal_team_id' IN pg_get_functiondef(
    'public.cc_manager_competition_results_v1(uuid[])'::regprocedure
  ))>0 AS team_scope_fix_installed,
  has_function_privilege('anon',
    'public.cc_manager_competition_results_v1(uuid[])','EXECUTE') AS anon_can_execute,
  has_function_privilege('authenticated',
    'public.cc_manager_competition_results_v1(uuid[])','EXECUTE') AS authenticated_can_execute;
