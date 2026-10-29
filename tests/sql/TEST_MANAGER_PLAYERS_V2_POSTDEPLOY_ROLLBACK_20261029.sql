BEGIN;
SELECT set_config('cc.qa.manager.uid',(SELECT auth_user_id::text FROM public.manager_accounts WHERE active=true AND auth_user_id IS NOT NULL AND EXISTS(SELECT 1 FROM public.manager_module_permissions mp WHERE mp.manager_id=manager_accounts.id AND mp.module_key='competition.players' AND mp.can_view=true) LIMIT 1),true);
SELECT set_config('cc.qa.manager.email',(SELECT email FROM public.manager_accounts WHERE auth_user_id=current_setting('cc.qa.manager.uid')::uuid),true);
SELECT set_config('cc.qa.membership',(SELECT tm.id::text FROM public.team_memberships tm JOIN public.players p ON p.id=tm.player_id JOIN public.teams t ON t.id=tm.team_id WHERE p.active AND tm.active AND t.active AND tm.starts_on<=current_date AND (tm.ends_on IS NULL OR tm.ends_on>=current_date) ORDER BY tm.id LIMIT 1),true);
SELECT set_config('cc.qa.target',(SELECT tm.player_id::text FROM public.team_memberships tm WHERE tm.id=current_setting('cc.qa.membership')::uuid),true);
SELECT set_config('cc.qa.team',(SELECT tm.team_id::text FROM public.team_memberships tm WHERE tm.id=current_setting('cc.qa.membership')::uuid),true);
SELECT set_config('request.jwt.claim.sub',current_setting('cc.qa.manager.uid'),true);
SELECT set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('cc.qa.manager.uid'),'email',current_setting('cc.qa.manager.email'),'role','authenticated')::text,true);
DO $qa$ BEGIN IF current_setting('cc.qa.team',true) IS NULL THEN RAISE EXCEPTION 'QA_FIXTURE_MISSING'; END IF; END $qa$;
SET LOCAL ROLE authenticated;
DO $baseline$ BEGIN
 IF (SELECT count(*) FROM jsonb_array_elements(public.cc_manager_players_v2(null,'')) x WHERE x->>'playerId'=current_setting('cc.qa.target'))<>1 THEN RAISE EXCEPTION 'VALID_GLOBAL_DENIED'; END IF;
 IF (SELECT count(*) FROM jsonb_array_elements(public.cc_manager_players_v2(current_setting('cc.qa.team')::uuid,'')) x WHERE x->>'playerId'=current_setting('cc.qa.target'))<>1 THEN RAISE EXCEPTION 'VALID_TEAM_DENIED'; END IF;
END $baseline$;
RESET ROLE;
UPDATE public.team_memberships SET starts_on=current_date+interval '20 days' WHERE id=current_setting('cc.qa.membership')::uuid;
SET LOCAL ROLE authenticated;
DO $future$ BEGIN
 IF (SELECT count(*) FROM jsonb_array_elements(public.cc_manager_players_v2(null,'')) x WHERE x->>'playerId'=current_setting('cc.qa.target'))<>0 THEN RAISE EXCEPTION 'FUTURE_GLOBAL_LEAK'; END IF;
 IF (SELECT count(*) FROM jsonb_array_elements(public.cc_manager_players_v2(current_setting('cc.qa.team')::uuid,'')) x WHERE x->>'playerId'=current_setting('cc.qa.target'))<>0 THEN RAISE EXCEPTION 'FUTURE_TEAM_LEAK'; END IF;
END $future$;
RESET ROLE;
UPDATE public.team_memberships SET starts_on=current_date,ends_on=current_date WHERE id=current_setting('cc.qa.membership')::uuid;
SET LOCAL ROLE authenticated;
DO $boundary$ BEGIN
 IF (SELECT count(*) FROM jsonb_array_elements(public.cc_manager_players_v2(null,'')) x WHERE x->>'playerId'=current_setting('cc.qa.target'))<>1 THEN RAISE EXCEPTION 'INCLUSIVE_BOUNDARY_DENIED'; END IF;
END $boundary$;
RESET ROLE;
UPDATE public.team_memberships SET starts_on=current_date-interval '30 days',ends_on=current_date-interval '1 day' WHERE id=current_setting('cc.qa.membership')::uuid;
SET LOCAL ROLE authenticated;
DO $expired$ BEGIN
 IF (SELECT count(*) FROM jsonb_array_elements(public.cc_manager_players_v2(null,'')) x WHERE x->>'playerId'=current_setting('cc.qa.target'))<>0 THEN RAISE EXCEPTION 'EXPIRED_LEAK'; END IF;
END $expired$;
RESET ROLE;
UPDATE public.team_memberships SET starts_on=current_date-interval '1 day',ends_on=NULL,active=false WHERE id=current_setting('cc.qa.membership')::uuid;
SET LOCAL ROLE authenticated;
DO $inactive$ BEGIN
 IF (SELECT count(*) FROM jsonb_array_elements(public.cc_manager_players_v2(null,'')) x WHERE x->>'playerId'=current_setting('cc.qa.target'))<>0 THEN RAISE EXCEPTION 'INACTIVE_MEMBERSHIP_LEAK'; END IF;
END $inactive$;
RESET ROLE;
UPDATE public.team_memberships SET active=true WHERE id=current_setting('cc.qa.membership')::uuid;
UPDATE public.teams SET active=false WHERE id=current_setting('cc.qa.team')::uuid;
SET LOCAL ROLE authenticated;
DO $team_inactive$ BEGIN
 IF (SELECT count(*) FROM jsonb_array_elements(public.cc_manager_players_v2(null,'')) x WHERE x->>'playerId'=current_setting('cc.qa.target'))<>0 THEN RAISE EXCEPTION 'INACTIVE_TEAM_LEAK'; END IF;
END $team_inactive$;
RESET ROLE;
SELECT set_config('request.jwt.claim.sub','',true);
SELECT set_config('request.jwt.claims','',true);
SET LOCAL ROLE authenticated;
DO $no_auth$ BEGIN
 BEGIN PERFORM public.cc_manager_players_v2(null,'');RAISE EXCEPTION 'NO_AUTH_ALLOWED';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
END $no_auth$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS: #82 TEST PostgreSQL rollback matrix; effective dates, active-team, JWT, global/scoped access' result;