-- TEST-only transactional acceptance after applying candidate fix. No lasting changes.
BEGIN;
SELECT set_config('cc.qa.manager.uid',(SELECT auth_user_id::text FROM public.manager_accounts WHERE active AND auth_user_id IS NOT NULL LIMIT 1),true);
SELECT set_config('cc.qa.team',(SELECT id::text FROM public.teams WHERE name='BEAC Női II.' LIMIT 1),true);
SELECT set_config('request.jwt.claim.sub',current_setting('cc.qa.manager.uid'),true);
SELECT set_config('request.jwt.claims',(SELECT jsonb_build_object('sub',auth_user_id::text,'email',email,'role','authenticated')::text FROM public.manager_accounts WHERE auth_user_id=current_setting('cc.qa.manager.uid')::uuid),true);
DO $fixture$ BEGIN IF current_setting('cc.qa.manager.uid',true) IS NULL OR current_setting('cc.qa.team',true) IS NULL THEN RAISE EXCEPTION 'MISSING_TEST_FIXTURE'; END IF; END $fixture$;
UPDATE public.manager_module_permissions SET team_id=current_setting('cc.qa.team')::uuid
WHERE manager_id=(SELECT id FROM public.manager_accounts WHERE auth_user_id=current_setting('cc.qa.manager.uid')::uuid)
AND module_key='competition.matches' AND can_view;
SET LOCAL ROLE authenticated;
DO $scope$
DECLARE results jsonb; target uuid:=current_setting('cc.qa.team')::uuid;
BEGIN
 results:=public.cc_manager_competition_results_v1(null);
 IF jsonb_array_length(results)<1 THEN RAISE EXCEPTION 'MISSING_RESULTS_FIXTURE'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(results) row WHERE (row->>'teamId')::uuid IS DISTINCT FROM target)
 THEN RAISE EXCEPTION 'CROSS_TEAM_RESULT_LEAK'; END IF;
 results:=public.cc_manager_competition_results_v1(ARRAY[target]);
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(results) row WHERE (row->>'teamId')::uuid IS DISTINCT FROM target)
 THEN RAISE EXCEPTION 'EXPLICIT_TEAM_SCOPE_LEAK'; END IF;
END $scope$;
RESET ROLE;
SELECT set_config('request.jwt.claim.sub','',true);
SELECT set_config('request.jwt.claims','',true);
SET LOCAL ROLE authenticated;
DO $unauth$
BEGIN
 BEGIN PERFORM public.cc_manager_competition_results_v1(null);
 RAISE EXCEPTION 'NO_AUTH_WAS_ALLOWED';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $unauth$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS team-scoped competition results (TEST rollback)' AS result;
