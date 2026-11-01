-- TEST only: post-install service-only capacity / FIFO offer acceptance.
-- Run twice. All fixture, offer and audit rows roll back.
BEGIN;
DO $guard$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.events WHERE legacy_manager_id='cc_test_bb2_rsvp_20261106')
 THEN RAISE EXCEPTION 'WRONG_CC_TEST_PROJECT'; END IF;
 IF EXISTS (SELECT 1 FROM public.mass_events WHERE id='CC-TEST-OFFER-QA')
 THEN RAISE EXCEPTION 'QA_EVENT_COLLISION'; END IF;
END $guard$;
INSERT INTO public.mass_events(id,source_workbook_id,event_date,start_time,end_time,level,capacity,new_limit,
active,public_registration_active,migration_run_id,legacy_row,session_type)
VALUES('CC-TEST-OFFER-QA','CC_TEST_OFFER_QA',
 (now() AT TIME ZONE 'Europe/Budapest')::date+9,'17:30','19:00','Kezdő',2,2,true,true,
 'CC_TEST_OFFER_QA','{}'::jsonb,'TÖMEGSPORT');
INSERT INTO public.mass_bookings(id,source_workbook_id,event_id,name,email,submitted_at,booking_status,
 capacity_bucket,migration_run_id)
VALUES('CC-TEST-OFFER-EXISTING','CC_TEST_OFFER_QA','CC-TEST-OFFER-QA',
 'Minta Foglaló','booked@cc-test.invalid',now(),'AKTÍV','ÚJ','CC_TEST_OFFER_QA');
INSERT INTO public.mass_waitlist(id,source_workbook_id,event_id,name,email,submitted_at,
 waitlist_status,migration_run_id)
VALUES
 ('CC-TEST-OFFER-FIRST','CC_TEST_OFFER_QA','CC-TEST-OFFER-QA','Első Várakozó',
 'first@cc-test.invalid',now()-interval '5 minutes','VÁRAKOZIK','CC_TEST_OFFER_QA'),
 ('CC-TEST-OFFER-SECOND','CC_TEST_OFFER_QA','CC-TEST-OFFER-QA','Második Várakozó',
 'second@cc-test.invalid',now()-interval '2 minutes','VÁRAKOZIK','CC_TEST_OFFER_QA');
SELECT set_config('cc.qa.push_before',(SELECT count(*)::text FROM public.player_push_outbox),true);
SELECT set_config('cc.qa.mail_before',(SELECT count(*)::text FROM private.cc_mass_mail_outbox_v1),true);
DO $acl$
DECLARE p regprocedure;
BEGIN
 FOREACH p IN ARRAY ARRAY[
 'public.cc_vnext_mass_capacity_v1(text)'::regprocedure,
 'public.cc_vnext_mass_offer_next_v1(text,text,timestamptz)'::regprocedure,
 'public.cc_vnext_mass_offer_expire_v1(text)'::regprocedure
 ] LOOP
  IF has_function_privilege('anon',p,'execute')
  OR has_function_privilege('authenticated',p,'execute')
  OR NOT has_function_privilege('service_role',p,'execute')
  THEN RAISE EXCEPTION 'SERVICE_ONLY_ACL_FAILED:%',p; END IF;
 END LOOP;
END $acl$;
SET LOCAL ROLE service_role;
DO $service_qa$
DECLARE c jsonb;o jsonb;oo jsonb;e jsonb;
BEGIN
 c:=public.cc_vnext_mass_capacity_v1('CC-TEST-OFFER-QA');
 IF (c->>'free')::int<>1 OR (c->>'active')::int<>1
 THEN RAISE EXCEPTION 'CAPACITY_INITIAL_FAILED:%',c; END IF;
 o:=public.cc_vnext_mass_offer_next_v1('CC-TEST-OFFER-QA',
 'sha256:'||repeat('a',64),now()+interval '30 minutes');
 IF o->>'offered'<>'true' OR o->>'waitlistId'<>'CC-TEST-OFFER-FIRST'
 OR o->>'mailQueued'<>'false'
 THEN RAISE EXCEPTION 'FIFO_OFFER_FAILED:%',o; END IF;
 c:=public.cc_vnext_mass_capacity_v1('CC-TEST-OFFER-QA');
 IF (c->>'reserved')::int<>1 OR (c->>'free')::int<>0
 THEN RAISE EXCEPTION 'RESERVED_CAPACITY_FAILED:%',c; END IF;
 oo:=public.cc_vnext_mass_offer_next_v1('CC-TEST-OFFER-QA',
 'sha256:'||repeat('b',64),now()+interval '30 minutes');
 IF oo->>'offered'<>'false'
 THEN RAISE EXCEPTION 'SECOND_OFFER_WHILE_RESERVED:%',oo; END IF;
 e:=public.cc_vnext_mass_offer_expire_v1('CC-TEST-OFFER-QA');
 IF (e->>'expired')::int<>0 THEN RAISE EXCEPTION 'PREMATURE_EXPIRY:%',e; END IF;
 BEGIN
  PERFORM public.cc_vnext_mass_offer_next_v1('CC-TEST-OFFER-QA','not-a-hash',now()+interval '20 minutes');
  RAISE EXCEPTION 'INVALID_HASH_ACCEPTED';
 EXCEPTION WHEN invalid_parameter_value THEN NULL;
 END;
END $service_qa$;
RESET ROLE;
DO $integrity$
BEGIN
 IF (SELECT count(*) FROM public.mass_waitlist
 WHERE id='CC-TEST-OFFER-FIRST' AND waitlist_status='HELY FELAJÁNLVA')<>1
 OR (SELECT count(*) FROM public.mass_waitlist
 WHERE id='CC-TEST-OFFER-SECOND' AND waitlist_status='VÁRAKOZIK')<>1
 THEN RAISE EXCEPTION 'WAITLIST_STATE_DAMAGED'; END IF;
 IF (SELECT count(*) FROM public.player_push_outbox)::int<>current_setting('cc.qa.push_before')::int
 OR (SELECT count(*) FROM private.cc_mass_mail_outbox_v1)::int<>current_setting('cc.qa.mail_before')::int
 THEN RAISE EXCEPTION 'UNEXPECTED_MESSAGE_SIDE_EFFECT'; END IF;
END $integrity$;
ROLLBACK;
SELECT 'PASS TEST service-only capacity and FIFO offer, no mail, rollback' AS result;