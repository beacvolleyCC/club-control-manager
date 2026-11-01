-- TEST ONLY. Run ONLY after installing the reviewed vNext read facade.
-- No durable mutations: scoped-permission checks roll back before exit.
BEGIN;
DO $check_install$
BEGIN
  IF to_regprocedure('public.cc_vnext_competition_read_v1(text,uuid,uuid,timestamptz,timestamptz,text,text)') IS NULL
  THEN RAISE EXCEPTION 'VNEXT_NOT_INSTALLED'; END IF;
  IF has_function_privilege('anon','public.cc_vnext_competition_read_v1(text,uuid,uuid,timestamptz,timestamptz,text,text)','execute')
  THEN RAISE EXCEPTION 'VNEXT_ANON_EXECUTE_LEAK'; END IF;
  IF NOT has_function_privilege('authenticated','public.cc_vnext_competition_read_v1(text,uuid,uuid,timestamptz,timestamptz,text,text)','execute')
  THEN RAISE EXCEPTION 'VNEXT_AUTH_EXECUTE_MISSING'; END IF;
END $check_install$;

SET LOCAL ROLE anon;
DO $anonymous$
BEGIN
  BEGIN
    PERFORM public.cc_vnext_competition_read_v1('teams');
    RAISE EXCEPTION 'VNEXT_ANON_ALLOWED';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $anonymous$;
RESET ROLE;

SET LOCAL ROLE authenticated;
DO $empty_auth$
BEGIN
  BEGIN
    PERFORM public.cc_vnext_competition_read_v1('teams');
    RAISE EXCEPTION 'VNEXT_AUTH_WITHOUT_SESSION_ALLOWED';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $empty_auth$;
RESET ROLE;

SELECT set_config('cc.qa.manager.uid',(
  SELECT auth_user_id::text FROM public.manager_accounts
  WHERE active=true AND auth_user_id IS NOT NULL
  AND EXISTS(SELECT 1 FROM public.manager_module_permissions m
    WHERE m.manager_id=manager_accounts.id AND m.module_key='competition.teams' AND m.can_view=true)
  LIMIT 1),true);
SELECT set_config('cc.qa.manager.email',(
  SELECT email FROM public.manager_accounts
  WHERE auth_user_id=current_setting('cc.qa.manager.uid')::uuid
),true);
SELECT set_config('cc.qa.team',(
  SELECT t.id::text FROM public.teams t WHERE t.active ORDER BY t.name LIMIT 1
),true);
SELECT set_config('cc.qa.other',(
  SELECT t.id::text FROM public.teams t
  WHERE t.active AND t.id<>current_setting('cc.qa.team')::uuid ORDER BY t.name LIMIT 1
),true);
SELECT set_config('cc.qa.event',(
  SELECT e.id::text FROM public.events e
  WHERE e.team_id=current_setting('cc.qa.team')::uuid AND e.status<>'cancelled' ORDER BY e.starts_at DESC LIMIT 1
),true);
SELECT set_config('request.jwt.claim.sub',current_setting('cc.qa.manager.uid'),true);
SELECT set_config('request.jwt.claims',jsonb_build_object(
  'sub',current_setting('cc.qa.manager.uid'),
  'email',current_setting('cc.qa.manager.email'),
  'role','authenticated'
)::text,true);
DO $fixtures$
BEGIN
  IF current_setting('cc.qa.manager.uid',true) IS NULL
    OR current_setting('cc.qa.team',true) IS NULL
    OR current_setting('cc.qa.other',true) IS NULL
    OR current_setting('cc.qa.event',true) IS NULL
  THEN RAISE EXCEPTION 'VNEXT_QA_FIXTURE_MISSING'; END IF;
END $fixtures$;

SET LOCAL ROLE authenticated;
DO $valid_read$
DECLARE x jsonb;
BEGIN
  x:=public.cc_vnext_competition_read_v1('teams');
  IF x->>'apiVersion'<>'1' OR jsonb_typeof(x->'data')<>'array'
    OR jsonb_array_length(x->'data')<1 THEN RAISE EXCEPTION 'VNEXT_TEAMS_READ_FAILED'; END IF;
  x:=public.cc_vnext_competition_read_v1('players',current_setting('cc.qa.team')::uuid);
  IF x->>'resource'<>'players' OR jsonb_typeof(x->'data')<>'array' THEN RAISE EXCEPTION 'VNEXT_PLAYERS_READ_FAILED'; END IF;
  x:=public.cc_vnext_competition_read_v1('roster',NULL,current_setting('cc.qa.event')::uuid);
  IF x->>'resource'<>'roster' OR jsonb_typeof(x->'data')<>'array' THEN RAISE EXCEPTION 'VNEXT_ROSTER_READ_FAILED'; END IF;
  x:=public.cc_vnext_competition_read_v1('events',current_setting('cc.qa.team')::uuid,NULL,
    now()-interval '30 days',now()+interval '60 days','training');
  IF jsonb_typeof(x->'data')<>'array' THEN RAISE EXCEPTION 'VNEXT_EVENTS_READ_FAILED'; END IF;
END $valid_read$;

DO $bad_inputs$
BEGIN
  BEGIN PERFORM public.cc_vnext_competition_read_v1('no-such-resource');
    RAISE EXCEPTION 'VNEXT_UNKNOWN_RESOURCE_ALLOWED';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  BEGIN PERFORM public.cc_vnext_competition_read_v1('roster');
    RAISE EXCEPTION 'VNEXT_EMPTY_ROSTER_EVENT_ALLOWED';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  BEGIN PERFORM public.cc_vnext_competition_read_v1('events',NULL,NULL,now(),now()+interval '401 days');
    RAISE EXCEPTION 'VNEXT_OVERSIZE_RANGE_ALLOWED';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
END $bad_inputs$;
RESET ROLE;

-- Scope all competition.view permissions of THIS TEST manager to one team
-- for the duration of the transaction; no real permission change survives.
UPDATE public.manager_module_permissions
SET team_id=current_setting('cc.qa.team')::uuid
WHERE manager_id=(
  SELECT id FROM public.manager_accounts
  WHERE auth_user_id=current_setting('cc.qa.manager.uid')::uuid
)
AND module_key LIKE 'competition.%' AND can_view=true;

SET LOCAL ROLE authenticated;
DO $scoped$
DECLARE x jsonb;
BEGIN
  x:=public.cc_vnext_competition_read_v1('teams');
  IF jsonb_array_length(x->'data')<>1
    OR (x->'data'->0->>'id')<>current_setting('cc.qa.team')
  THEN RAISE EXCEPTION 'VNEXT_CROSS_TEAM_CATALOG_LEAK'; END IF;
  x:=public.cc_vnext_competition_read_v1('players',current_setting('cc.qa.other')::uuid);
  IF jsonb_typeof(x->'data')<>'array' OR jsonb_array_length(x->'data')<>0
  THEN RAISE EXCEPTION 'VNEXT_CROSS_TEAM_PLAYERS_LEAK'; END IF;
  BEGIN
    PERFORM public.cc_vnext_competition_read_v1('roster',NULL,(
      SELECT id FROM public.events WHERE team_id=current_setting('cc.qa.other')::uuid
      AND status<>'cancelled' ORDER BY starts_at LIMIT 1));
    RAISE EXCEPTION 'VNEXT_CROSS_TEAM_ROSTER_ALLOWED';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $scoped$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS: vNext competition read (scoped manager, anon, malformed input) - rollback only' AS result;
