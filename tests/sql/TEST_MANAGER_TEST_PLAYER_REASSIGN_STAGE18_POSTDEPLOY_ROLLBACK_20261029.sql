-- TEST postdeploy QA: existing function, no DDL, all data mutations rolled back.
BEGIN;
SELECT set_config('cc.qa.manager',(SELECT a.auth_user_id::text FROM public.manager_accounts a JOIN public.manager_module_permissions m ON m.manager_id=a.id WHERE a.active AND m.module_key='competition.players' AND m.can_edit AND m.team_id IS NULL LIMIT 1),true);
SELECT set_config('cc.qa.email',(SELECT email FROM public.manager_accounts WHERE auth_user_id=current_setting('cc.qa.manager')::uuid),true);
SELECT set_config('cc.qa.target',(SELECT id::text FROM public.teams WHERE active AND id<>(SELECT team_id FROM public.team_memberships WHERE player_id='1e8ae2fc-9f5b-4272-a809-b6bb779970bd'::uuid AND active) ORDER BY id LIMIT 1),true);
SELECT set_config('cc.qa.old',(SELECT team_id::text FROM public.team_memberships WHERE player_id='1e8ae2fc-9f5b-4272-a809-b6bb779970bd'::uuid AND active),true);
SELECT set_config('cc.qa.old_id',(SELECT id::text FROM public.team_memberships WHERE player_id='1e8ae2fc-9f5b-4272-a809-b6bb779970bd'::uuid AND active),true);
SELECT set_config('cc.qa.before',(SELECT count(*)::text FROM public.team_memberships WHERE player_id='1e8ae2fc-9f5b-4272-a809-b6bb779970bd'::uuid),true);
SELECT set_config('cc.qa.audits',(SELECT count(*)::text FROM public.audit_log),true);
SELECT set_config('cc.qa.rsvps',(SELECT count(*)::text FROM public.availability),true);
SELECT set_config('cc.qa.push',(SELECT count(*)::text FROM public.player_push_outbox),true);
SELECT set_config('request.jwt.claim.sub',current_setting('cc.qa.manager'),true);
SELECT set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('cc.qa.manager'),'role','authenticated','email',current_setting('cc.qa.email'))::text,true);
SET LOCAL ROLE authenticated;
DO $qa$
DECLARE j jsonb;
BEGIN
 BEGIN
  PERFORM public.cc_manager_test_player_reassign_v1('20000000-0000-4000-8000-000000000001'::uuid,current_setting('cc.qa.target')::uuid);
  RAISE EXCEPTION 'NONTEST_PLAYER_ALLOWED';
 EXCEPTION WHEN insufficient_privilege THEN
  IF SQLERRM<>'REASSIGN_DESIGNATED_TEST_ONLY' THEN RAISE; END IF;
 END;
 BEGIN
  PERFORM public.cc_manager_test_player_reassign_v1('1e8ae2fc-9f5b-4272-a809-b6bb779970bd'::uuid,current_setting('cc.qa.old')::uuid);
  RAISE EXCEPTION 'SAME_TEAM_ALLOWED';
 EXCEPTION WHEN SQLSTATE '22023' THEN
  IF SQLERRM<>'REASSIGN_SAME_TEAM' THEN RAISE; END IF;
 END;
 j:=public.cc_manager_test_player_reassign_v1('1e8ae2fc-9f5b-4272-a809-b6bb779970bd'::uuid,current_setting('cc.qa.target')::uuid);
 IF j->>'ok'<>'true' OR j->>'toTeamId'<>current_setting('cc.qa.target') THEN RAISE EXCEPTION 'REASSIGN_FAILED';END IF;
END $qa$;
RESET ROLE;
DO $check$
BEGIN
 IF (SELECT count(*) FROM public.team_memberships WHERE player_id='1e8ae2fc-9f5b-4272-a809-b6bb779970bd'::uuid)<>current_setting('cc.qa.before')::int
 OR (SELECT count(*) FROM public.team_memberships WHERE id=current_setting('cc.qa.old_id')::uuid AND team_id=current_setting('cc.qa.target')::uuid AND active)=0
 OR (SELECT count(*) FROM public.availability)<>current_setting('cc.qa.rsvps')::int
 OR (SELECT count(*) FROM public.player_push_outbox)<>current_setting('cc.qa.push')::int
 OR (SELECT count(*) FROM public.audit_log)<>current_setting('cc.qa.audits')::int+1
 THEN RAISE EXCEPTION 'PRESERVATION_FAILED';END IF;
END $check$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS Stage18 designated test player in-place reassignment rollback QA' result;