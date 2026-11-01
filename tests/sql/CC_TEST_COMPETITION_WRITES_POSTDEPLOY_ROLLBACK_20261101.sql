-- TEST only. Run twice AFTER installing CC_TEST_COMPETITION_WRITES_SQL_EDITOR_INSTALL_20261101.sql.
-- Rolls back event creates/edits/cancels, RSVP, audit changes and temporary ACL changes.
BEGIN;
SELECT set_config('cc.qa.team',(SELECT id::text FROM public.teams WHERE name='BEAC Női II.' AND active LIMIT 1),true);
SELECT set_config('cc.qa.other',(SELECT id::text FROM public.teams WHERE name='BEAC Női I.' AND active LIMIT 1),true);
SELECT set_config('cc.qa.manager_uid',(SELECT auth_user_id::text FROM public.manager_accounts WHERE active AND auth_user_id IS NOT NULL LIMIT 1),true);
SELECT set_config('cc.qa.manager_email',(SELECT email FROM public.manager_accounts WHERE auth_user_id=current_setting('cc.qa.manager_uid')::uuid),true);
SELECT set_config('cc.qa.player',(SELECT tm.player_id::text FROM public.team_memberships tm JOIN public.players p ON p.id=tm.player_id
 WHERE tm.team_id=current_setting('cc.qa.team')::uuid AND tm.active AND p.active
 AND tm.starts_on<=(now() AT TIME ZONE 'Europe/Budapest')::date+3
 AND (tm.ends_on IS NULL OR tm.ends_on>=(now() AT TIME ZONE 'Europe/Budapest')::date+3)
 ORDER BY tm.player_id LIMIT 1),true);
DO $fixture$
BEGIN
 IF current_setting('cc.qa.team',true) IS NULL OR current_setting('cc.qa.other',true) IS NULL
 OR current_setting('cc.qa.manager_uid',true) IS NULL OR current_setting('cc.qa.player',true) IS NULL
 OR NOT EXISTS(SELECT 1 FROM public.events WHERE legacy_manager_id='cc_test_bb2_rsvp_20261106')
 THEN RAISE EXCEPTION 'CC_TEST_FIXTURE_MISSING' USING ERRCODE='22023'; END IF;
END $fixture$;
SELECT set_config('cc.qa.events_before',(SELECT count(*)::text FROM public.events),true);
SELECT set_config('cc.qa.availability_before',(SELECT count(*)::text FROM public.availability),true);
SELECT set_config('cc.qa.push_before',(SELECT count(*)::text FROM public.player_push_outbox),true);
SELECT set_config('cc.qa.audit_before',(SELECT count(*)::text FROM public.audit_log),true);
SELECT set_config('request.jwt.claim.sub',current_setting('cc.qa.manager_uid'),true);
SELECT set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('cc.qa.manager_uid'),
  'email',current_setting('cc.qa.manager_email'),'role','authenticated')::text,true);
DO $grants$
BEGIN
 IF (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public'
 AND p.proname IN ('cc_manager_competition_event_save_v1','cc_manager_competition_event_cancel_v1',
 'cc_manager_competition_event_series_create_v1','cc_manager_competition_rsvp_v1'))<>4
 THEN RAISE EXCEPTION 'CC_TEST_WRITES_NOT_INSTALLED' USING ERRCODE='22023'; END IF;
 IF EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname IN (
  'cc_manager_competition_event_save_v1','cc_manager_competition_event_cancel_v1',
  'cc_manager_competition_event_series_create_v1','cc_manager_competition_rsvp_v1'
 ) AND (has_function_privilege('anon',p.oid,'EXECUTE') OR NOT has_function_privilege('authenticated',p.oid,'EXECUTE')))
 THEN RAISE EXCEPTION 'CC_TEST_WRITE_GRANTS_UNSAFE' USING ERRCODE='42501'; END IF;
END $grants$;

SET LOCAL ROLE authenticated;
DO $create_edit_rsvp$
DECLARE x jsonb; eid uuid; chosen uuid:=current_setting('cc.qa.player')::uuid;
BEGIN
 x:=public.cc_manager_competition_event_save_v1(NULL,jsonb_build_object(
  'teamId',current_setting('cc.qa.team'),'eventType','training',
  'title','TEST VNext írási próba – NEM VALÓS',
  'startsAt',(now()+interval '3 days')::text,'endsAt',(now()+interval '3 days 2 hours')::text,
  'court','TEST'),false);
 IF x->>'ok'<>'true' OR x->>'created'<>'true' THEN RAISE EXCEPTION 'CREATE_FAILED'; END IF;
 eid:=(x->>'eventId')::uuid;
 PERFORM set_config('cc.qa.event',eid::text,true);
 x:=public.cc_manager_competition_event_save_v1(eid,'{"title":"TEST VNext módosított – NEM VALÓS","court":"T2"}'::jsonb,false);
 IF x->'after'->>'title'<>'TEST VNext módosított – NEM VALÓS' OR x->>'created'<>'false'
 THEN RAISE EXCEPTION 'UPDATE_FAILED'; END IF;
 x:=public.cc_manager_competition_rsvp_v1(eid,chosen,'not_going');
 IF x->>'status'<>'not_going' THEN RAISE EXCEPTION 'RSVP_DECLINE_FAILED'; END IF;
 x:=public.cc_manager_competition_rsvp_v1(eid,chosen,'unknown');
 IF x->>'status'<>'unknown' THEN RAISE EXCEPTION 'RSVP_NEUTRAL_FAILED'; END IF;
 BEGIN
  PERFORM public.cc_manager_competition_event_save_v1(NULL,jsonb_build_object(
   'teamId',current_setting('cc.qa.team'),'startsAt',(now()+interval '4 days')::text),
   true);
  RAISE EXCEPTION 'NOTIFY_ENABLED_UNEXPECTEDLY';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN
  PERFORM public.cc_manager_competition_event_save_v1(eid,'{"eventType":"match"}'::jsonb,false);
  RAISE EXCEPTION 'EVENT_TYPE_CHANGED';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
END $create_edit_rsvp$;
RESET ROLE;

-- Preserve historical note, even through neutral RSVP; test as DB owner in this rollback transaction.
UPDATE public.availability SET note='Korábbi indok megőrizve'
WHERE event_id=current_setting('cc.qa.event')::uuid AND player_id=current_setting('cc.qa.player')::uuid;
-- Repeated status changes must keep the old reason exactly as stored.
SET LOCAL ROLE authenticated;
DO $note_roundtrip$
DECLARE x jsonb; eid uuid:=current_setting('cc.qa.event')::uuid; pid uuid:=current_setting('cc.qa.player')::uuid;
BEGIN
 x:=public.cc_manager_competition_rsvp_v1(eid,pid,'not_going');
 IF x->>'status'<>'not_going' THEN RAISE EXCEPTION 'RSVP_NOTE_RETURN_DECLINED_FAILED'; END IF;
 x:=public.cc_manager_competition_rsvp_v1(eid,pid,'unknown');
 IF x->>'status'<>'unknown' THEN RAISE EXCEPTION 'RSVP_NOTE_RETURN_NEUTRAL_FAILED'; END IF;
END $note_roundtrip$;
RESET ROLE;

DO $preserve$
BEGIN
 IF (SELECT status FROM public.availability
  WHERE event_id=current_setting('cc.qa.event')::uuid AND player_id=current_setting('cc.qa.player')::uuid)<>'unknown'
 THEN RAISE EXCEPTION 'NEUTRAL_NOT_PERSISTED'; END IF;
 IF (SELECT note FROM public.availability
  WHERE event_id=current_setting('cc.qa.event')::uuid AND player_id=current_setting('cc.qa.player')::uuid)<>'Korábbi indok megőrizve'
 THEN RAISE EXCEPTION 'HISTORICAL_NOTE_LOST'; END IF;
END $preserve$;

SET LOCAL ROLE authenticated;
DO $series_cancel$
DECLARE x jsonb; eid uuid:=current_setting('cc.qa.event')::uuid; base jsonb;
BEGIN
 base:=jsonb_build_object('teamId',current_setting('cc.qa.team'),'eventType','training',
 'title','TEST sorozat – NEM VALÓS','startsAt',(now()+interval '8 days')::text,
 'endsAt',(now()+interval '8 days 2 hours')::text);
 x:=public.cc_manager_competition_event_series_create_v1(jsonb_build_array(base,base),false);
 IF x->>'count'<>'2' OR jsonb_array_length(x->'eventIds')<>2
 THEN RAISE EXCEPTION 'SERIES_CREATION_FAILED'; END IF;
 x:=public.cc_manager_competition_event_cancel_v1(eid,false);
 IF x->'after'->>'status'<>'cancelled' THEN RAISE EXCEPTION 'CANCEL_FAILED'; END IF;
 BEGIN
  PERFORM public.cc_manager_competition_rsvp_v1(eid,current_setting('cc.qa.player')::uuid,'going');
  RAISE EXCEPTION 'CANCELLED_EVENT_RSVP_ALLOWED';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
END $series_cancel$;
RESET ROLE;

-- Restrict THIS test manager to BB2; other-team writes must fail.
UPDATE public.manager_module_permissions
SET team_id=current_setting('cc.qa.team')::uuid
WHERE manager_id=(SELECT id FROM public.manager_accounts
 WHERE auth_user_id=current_setting('cc.qa.manager_uid')::uuid)
AND module_key IN ('competition.trainings','competition.matches') AND can_edit;
SET LOCAL ROLE authenticated;
DO $cross_team$
BEGIN
 BEGIN
   PERFORM public.cc_manager_competition_event_save_v1(NULL,jsonb_build_object(
     'teamId',current_setting('cc.qa.other'),'eventType','training',
     'startsAt',(now()+interval '5 days')::text,'title','DENIED other team'),false);
   RAISE EXCEPTION 'CROSS_TEAM_CREATE_ALLOWED';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 BEGIN
   PERFORM public.cc_manager_competition_event_series_create_v1(jsonb_build_array(
    jsonb_build_object('teamId',current_setting('cc.qa.other'),
      'eventType','training','startsAt',(now()+interval '5 days')::text)),false);
   RAISE EXCEPTION 'CROSS_TEAM_SERIES_ALLOWED';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $cross_team$;
RESET ROLE;
SELECT set_config('request.jwt.claim.sub','',true);
SELECT set_config('request.jwt.claims','',true);
SET LOCAL ROLE authenticated;
DO $no_session$
BEGIN
 BEGIN
   PERFORM public.cc_manager_competition_event_save_v1(NULL,'{}'::jsonb,false);
   RAISE EXCEPTION 'NO_SESSION_WRITE_ALLOWED';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
         WHEN invalid_parameter_value THEN RAISE EXCEPTION 'AUTH_NOT_CHECKED_BEFORE_PAYLOAD';
 END;
END $no_session$;
RESET ROLE;
DO $integrity$
BEGIN
 IF (SELECT count(*) FROM public.events)::integer<>current_setting('cc.qa.events_before')::integer+3
 THEN RAISE EXCEPTION 'WRONG_EVENT_CHANGE_COUNT'; END IF;
 IF (SELECT count(*) FROM public.audit_log)::integer<current_setting('cc.qa.audit_before')::integer+7
 THEN RAISE EXCEPTION 'AUDIT_NOT_WRITTEN'; END IF;
 IF (SELECT count(*) FROM public.player_push_outbox)::integer<>current_setting('cc.qa.push_before')::integer
 THEN RAISE EXCEPTION 'UNEXPECTED_PUSH_ENQUEUED'; END IF;
 IF (SELECT note FROM public.availability WHERE event_id=current_setting('cc.qa.event')::uuid
 AND player_id=current_setting('cc.qa.player')::uuid)<>'Korábbi indok megőrizve'
 THEN RAISE EXCEPTION 'CANCEL_DELETED_NOTE'; END IF;
END $integrity$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS: TEST event create/edit, RSVP, series, cancel, audit, no push; all rolled back' AS result;
