BEGIN;
SELECT set_config('cc.qa.manager',(SELECT a.auth_user_id::text FROM public.manager_accounts a JOIN public.manager_module_permissions m ON m.manager_id=a.id WHERE a.active AND m.module_key='competition.players' AND m.can_edit AND m.team_id IS NULL LIMIT 1),true);
SELECT set_config('cc.qa.email',(SELECT email FROM public.manager_accounts WHERE auth_user_id=current_setting('cc.qa.manager')::uuid),true);
SELECT set_config('cc.qa.player',(SELECT m.player_id::text FROM public.team_memberships m JOIN public.players p ON p.id=m.player_id WHERE m.active AND p.active AND m.starts_on <= CURRENT_DATE AND (m.ends_on IS NULL OR m.ends_on >= CURRENT_DATE) AND NOT EXISTS(SELECT 1 FROM public.availability a JOIN public.events e ON e.id=a.event_id WHERE a.player_id=m.player_id AND e.team_id=m.team_id AND e.status='active' AND a.status='going' AND (e.starts_at AT TIME ZONE 'Europe/Budapest')::date >= (now() AT TIME ZONE 'Europe/Budapest')::date+7) ORDER BY m.player_id LIMIT 1),true);
SELECT set_config('cc.qa.from',(SELECT team_id::text FROM public.team_memberships WHERE player_id=current_setting('cc.qa.player')::uuid AND active),true);
SELECT set_config('cc.qa.to',(SELECT id::text FROM public.teams WHERE active AND id<>current_setting('cc.qa.from')::uuid ORDER BY id LIMIT 1),true);
SELECT set_config('cc.qa.memberships',(SELECT count(*)::text FROM public.team_memberships),true);
SELECT set_config('cc.qa.rsvps',(SELECT count(*)::text FROM public.availability),true);
SELECT set_config('cc.qa.pushes',(SELECT count(*)::text FROM public.player_push_outbox),true);
SELECT set_config('cc.qa.audits',(SELECT count(*)::text FROM public.audit_log),true);
SELECT set_config('request.jwt.claim.sub',current_setting('cc.qa.manager'),true);
SELECT set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('cc.qa.manager'),'role','authenticated','email',current_setting('cc.qa.email'))::text,true);
SET LOCAL ROLE authenticated;
DO $qa$
DECLARE j jsonb; n integer; pid uuid;
BEGIN
 BEGIN
  PERFORM public.cc_manager_player_transfer_plan_v1(current_setting('cc.qa.player')::uuid,current_setting('cc.qa.to')::uuid,(now() AT TIME ZONE 'Europe/Budapest')::date);
  RAISE EXCEPTION 'TODAY_PLAN_ALLOWED';
 EXCEPTION WHEN SQLSTATE '22023' THEN IF SQLERRM<>'PLAN_FUTURE_DATE_WITHIN_YEAR_REQUIRED' THEN RAISE; END IF;END;
 j:=public.cc_manager_player_transfer_plan_v1(current_setting('cc.qa.player')::uuid,current_setting('cc.qa.to')::uuid,(now() AT TIME ZONE 'Europe/Budapest')::date+7);
 IF j->>'ok'<>'true' OR j->>'status'<>'pending' THEN RAISE EXCEPTION 'PLAN_CREATION_FAILED';END IF;
 pid:=(j->>'planId')::uuid;
 BEGIN
  PERFORM public.cc_manager_player_transfer_plan_v1(current_setting('cc.qa.player')::uuid,current_setting('cc.qa.to')::uuid,(now() AT TIME ZONE 'Europe/Budapest')::date+8);
  RAISE EXCEPTION 'DUPLICATE_PLAN_ALLOWED';
 EXCEPTION WHEN unique_violation THEN IF SQLERRM<>'PLAN_ALREADY_PENDING' THEN RAISE; END IF;END;
 SELECT count(*) INTO n FROM jsonb_array_elements(public.cc_manager_player_transfer_plan_list_v1(NULL)) x WHERE x->>'planId'=pid::text;
 IF n<>1 THEN RAISE EXCEPTION 'PLAN_LIST_MISSING';END IF;
 j:=public.cc_manager_player_transfer_plan_cancel_v1(pid);
 IF j->>'status'<>'cancelled' THEN RAISE EXCEPTION 'PLAN_CANCEL_FAILED';END IF;
 SELECT count(*) INTO n FROM jsonb_array_elements(public.cc_manager_player_transfer_plan_list_v1(NULL)) x WHERE x->>'planId'=pid::text;
 IF n<>0 THEN RAISE EXCEPTION 'CANCELLED_PLAN_LEAKS_IN_PENDING_LIST';END IF;
END $qa$;
RESET ROLE;
DO $post$
BEGIN
 IF (SELECT count(*) FROM public.team_memberships)<>current_setting('cc.qa.memberships')::int OR
 (SELECT count(*) FROM public.availability)<>current_setting('cc.qa.rsvps')::int OR
 (SELECT count(*) FROM public.player_push_outbox)<>current_setting('cc.qa.pushes')::int OR
 (SELECT count(*) FROM public.audit_log)<>current_setting('cc.qa.audits')::int+2 OR
 (SELECT count(*) FROM public.cc_manager_transfer_plans_v1 WHERE status='pending')<>0
 THEN RAISE EXCEPTION 'DATA_INTEGRITY_FAILED'; END IF;
END $post$;
ROLLBACK;
SELECT 'PASS Stage20: date guard, create, duplicate, list, cancel, audit, RSVP/membership/push integrity; rollback' result;