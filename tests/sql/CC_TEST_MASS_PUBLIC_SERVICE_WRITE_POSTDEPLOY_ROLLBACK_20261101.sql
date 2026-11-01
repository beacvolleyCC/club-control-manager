-- TEST ONLY. Requires four public-service RPCs and three earlier service capacity/offer RPCs.
-- Run TWICE after SQL Editor install. Every synthetic booking, audit, waitlist and ACL change rolls back.
BEGIN;
DO $test_guard$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.events WHERE legacy_manager_id='cc_test_bb2_rsvp_20261106')
  THEN RAISE EXCEPTION 'WRONG_TEST_PROJECT' USING ERRCODE='42501'; END IF;
  IF EXISTS (SELECT 1 FROM public.mass_events WHERE id LIKE 'CC-TEST-PUBLIC-QA-%')
  THEN RAISE EXCEPTION 'PUBLIC_QA_FIXTURE_COLLISION' USING ERRCODE='22023'; END IF;
END $test_guard$;
SELECT set_config('cc.qa.push_before',(SELECT count(*)::text FROM public.player_push_outbox),true);
SELECT set_config('cc.qa.mail_before',(SELECT count(*)::text FROM private.cc_mass_mail_outbox_v1),true);
SELECT set_config('cc.qa.audit_before',(SELECT count(*)::text FROM public.mass_live_write_audit),true);
INSERT INTO public.mass_events(id,source_workbook_id,event_date,start_time,end_time,
 level,court,capacity,new_limit,old_limit,active,public_registration_active,
 session_type,migration_run_id,cancellation_hours,legacy_row)
VALUES
('CC-TEST-PUBLIC-QA-FULL','CC_TEST_PUBLIC_QA',(now() AT TIME ZONE 'Europe/Budapest')::date+8,
 '17:30','19:00','Kezdő','TEST',2,2,0,true,true,'TÖMEGSPORT','CC_TEST_PUBLIC_QA',24,'{}'::jsonb),
('CC-TEST-PUBLIC-QA-WAIT','CC_TEST_PUBLIC_QA',(now() AT TIME ZONE 'Europe/Budapest')::date+9,
 '18:00','19:30','Középhaladó','TEST',1,1,0,true,true,'TÖMEGSPORT','CC_TEST_PUBLIC_QA',24,'{}'::jsonb),
('CC-TEST-PUBLIC-QA-PAST','CC_TEST_PUBLIC_QA',(now() AT TIME ZONE 'Europe/Budapest')::date-2,
 '18:00','19:30','Haladó','TEST',2,2,0,true,false,'TÖMEGSPORT','CC_TEST_PUBLIC_QA',24,'{}'::jsonb),
('CC-TEST-PUBLIC-QA-FIRST','CC_TEST_PUBLIC_QA',(now() AT TIME ZONE 'Europe/Budapest')::date+10,
 '17:30','19:00','Kezdő','TEST',1,1,0,true,true,'TÖMEGSPORT','CC_TEST_PUBLIC_QA',24,'{}'::jsonb);

DO $acl$
DECLARE f regprocedure;
BEGIN
 FOREACH f IN ARRAY ARRAY[
  'public.cc_vnext_mass_public_book_v1(text,jsonb,text)'::regprocedure,
  'public.cc_vnext_mass_public_wait_v1(text,jsonb)'::regprocedure,
  'public.cc_vnext_mass_public_cancel_v1(text)'::regprocedure,
  'public.cc_vnext_mass_public_decide_v1(text,text,text)'::regprocedure
 ] LOOP
  IF has_function_privilege('anon',f,'execute')
   OR has_function_privilege('authenticated',f,'execute')
   OR NOT has_function_privilege('service_role',f,'execute')
  THEN RAISE EXCEPTION 'PUBLIC_RPC_ACL_LEAK:%',f; END IF;
 END LOOP;
END $acl$;

SET LOCAL ROLE service_role;
DO $full_wait_accept$
DECLARE x jsonb; b1 text; b2 text; w1 text; offer jsonb; accepted text;
BEGIN
 x:=public.cc_vnext_mass_public_book_v1('CC-TEST-PUBLIC-QA-FULL',
  '{"name":"Minta A","email":"a@cc-test.invalid","passNumber":"P-TEST-A"}'::jsonb,
  'sha256:'||repeat('a',64));
 b1:=x->>'bookingId';
 IF x->>'ok'<>'true' OR b1 IS NULL OR x->>'mailQueued'<>'false'
 THEN RAISE EXCEPTION 'FIRST_BOOKING_FAILED'; END IF;

 BEGIN
  PERFORM public.cc_vnext_mass_public_book_v1('CC-TEST-PUBLIC-QA-FULL',
  '{"name":"Minta Dupla","email":"a@cc-test.invalid"}'::jsonb,
  'sha256:'||repeat('f',64));
  RAISE EXCEPTION 'DUPLICATE_BOOKING_ALLOWED';
 EXCEPTION WHEN unique_violation THEN NULL; END;

 x:=public.cc_vnext_mass_public_book_v1('CC-TEST-PUBLIC-QA-FULL',
 '{"name":"Minta B","email":"b@cc-test.invalid","passNumber":"P-TEST-B"}'::jsonb,
 'sha256:'||repeat('b',64));
 b2:=x->>'bookingId';
 IF x->>'ok'<>'true' THEN RAISE EXCEPTION 'SECOND_BOOKING_FAILED'; END IF;

 BEGIN
  PERFORM public.cc_vnext_mass_public_book_v1('CC-TEST-PUBLIC-QA-FULL',
   '{"name":"Minta túlcsordulás","email":"full@cc-test.invalid"}'::jsonb,
   'sha256:'||repeat('f',64));
  RAISE EXCEPTION 'CAPACITY_OVERBOOK_ALLOWED';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;

 x:=public.cc_vnext_mass_public_wait_v1('CC-TEST-PUBLIC-QA-FULL',
 '{"name":"Minta C","email":"c@cc-test.invalid","passNumber":"P-TEST-C"}'::jsonb);
 w1:=x->>'waitlistId';
 IF x->>'ok'<>'true' OR x->>'position'<>'1' THEN RAISE EXCEPTION 'WAITLIST_JOIN_FAILED'; END IF;

 BEGIN
  PERFORM public.cc_vnext_mass_public_wait_v1('CC-TEST-PUBLIC-QA-FULL',
   '{"name":"Minta Dupla Várakozó","email":"c@cc-test.invalid"}'::jsonb);
  RAISE EXCEPTION 'DUPLICATE_WAITLIST_ALLOWED';
 EXCEPTION WHEN unique_violation THEN NULL; END;

 x:=public.cc_vnext_mass_public_cancel_v1('sha256:'||repeat('a',64));
 IF x->>'ok'<>'true' OR x->>'late'<>'false' OR x->>'waitlistOfferQueued'<>'false'
 THEN RAISE EXCEPTION 'EARLY_CANCELLATION_FAILED'; END IF;
 BEGIN
  PERFORM public.cc_vnext_mass_public_cancel_v1('sha256:'||repeat('a',64));
  RAISE EXCEPTION 'CANCELLATION_TOKEN_REUSE_ALLOWED';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;

 -- New public entrant must not jump ahead of the waiting person.
 BEGIN
  PERFORM public.cc_vnext_mass_public_book_v1('CC-TEST-PUBLIC-QA-FULL',
   '{"name":"Minta előző","email":"jump@cc-test.invalid"}'::jsonb,
   'sha256:'||repeat('f',64));
  RAISE EXCEPTION 'WAITLIST_PRIORITY_BYPASSED';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;

 offer:=public.cc_vnext_mass_offer_next_v1('CC-TEST-PUBLIC-QA-FULL',
 'sha256:'||repeat('c',64),now()+interval '30 minutes');
 IF offer->>'offered'<>'true' OR offer->>'waitlistId'<>w1
 THEN RAISE EXCEPTION 'OFFER_NEXT_FAILED'; END IF;
 x:=public.cc_vnext_mass_public_decide_v1('sha256:'||repeat('c',64),'accept',
  'sha256:'||repeat('d',64));
 accepted:=x->>'bookingId';
 IF x->>'accepted'<>'true' OR accepted IS NULL THEN
  RAISE EXCEPTION 'OFFER_ACCEPT_FAILED'; END IF;
 x:=public.cc_vnext_mass_public_decide_v1('sha256:'||repeat('c',64),'accept',
  'sha256:'||repeat('e',64));
 IF x->>'already'<>'true' OR x->>'status'<>'ELFOGADVA'
 THEN RAISE EXCEPTION 'OFFER_ACCEPT_IDEMPOTENCY_FAILED'; END IF;
 x:=public.cc_vnext_mass_capacity_v1('CC-TEST-PUBLIC-QA-FULL');
 IF (x->>'active')::int<>2 OR (x->>'reserved')::int<>0 OR (x->>'free')::int<>0
 THEN RAISE EXCEPTION 'ACCEPTED_BOOKING_CAPACITY_FAILED'; END IF;

 BEGIN
  PERFORM public.cc_vnext_mass_public_book_v1('CC-TEST-PUBLIC-QA-FULL',
  '{"name":"Minta Forgó","email":"evil@cc-test.invalid","bookingStatus":"AKTÍV"}'::jsonb,
  'sha256:'||repeat('f',64));
  RAISE EXCEPTION 'MASS_ASSIGNMENT_PAYLOAD_INJECTION_ALLOWED';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
END $full_wait_accept$;

DO $first_training$
DECLARE x jsonb;
BEGIN
 x:=public.cc_vnext_mass_public_book_v1('CC-TEST-PUBLIC-QA-FIRST',
 '{"name":"Minta Első Edző","email":"first@cc-test.invalid","firstTraining":true}'::jsonb,
 'sha256:'||repeat('5',64));
 IF x->>'ok'<>'true' THEN RAISE EXCEPTION 'FIRST_TRAINING_BOOKING_FAILED'; END IF;
 BEGIN
  PERFORM public.cc_vnext_mass_public_book_v1('CC-TEST-PUBLIC-QA-WAIT',
  '{"name":"Minta Első Edző","email":"first@cc-test.invalid","firstTraining":true}'::jsonb,
  'sha256:'||repeat('6',64));
  RAISE EXCEPTION 'FIRST_TRAINING_REUSE_ALLOWED';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN
  PERFORM public.cc_vnext_mass_public_wait_v1('CC-TEST-PUBLIC-QA-FULL',
  '{"name":"Minta Első Edző","email":"first@cc-test.invalid","passNumber":"ELSŐ EDZÉS"}'::jsonb);
  RAISE EXCEPTION 'FIRST_TRAINING_WAITLIST_REUSE_ALLOWED';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
END $first_training$;

DO $wait_decline$
DECLARE x jsonb;offer jsonb;
BEGIN
 x:=public.cc_vnext_mass_public_book_v1('CC-TEST-PUBLIC-QA-WAIT',
 '{"name":"Minta Foglaló","email":"booked@cc-test.invalid"}'::jsonb,
 'sha256:'||repeat('1',64));
 x:=public.cc_vnext_mass_public_wait_v1('CC-TEST-PUBLIC-QA-WAIT',
 '{"name":"Minta Várakozó","email":"waiting@cc-test.invalid"}'::jsonb);
 IF x->>'position'<>'1' THEN RAISE EXCEPTION 'WAIT_QUEUE_POSITION_INVALID'; END IF;
 x:=public.cc_vnext_mass_public_cancel_v1('sha256:'||repeat('1',64));
 IF x->>'ok'<>'true' THEN RAISE EXCEPTION 'WAIT_FIXTURE_CANCEL_FAILED'; END IF;
 offer:=public.cc_vnext_mass_offer_next_v1('CC-TEST-PUBLIC-QA-WAIT',
  'sha256:'||repeat('2',64),now()+interval '20 minutes');
 IF offer->>'offered'<>'true' THEN RAISE EXCEPTION 'WAIT_OFFER_FAILED'; END IF;
 x:=public.cc_vnext_mass_public_decide_v1('sha256:'||repeat('2',64),'decline');
 IF x->>'status'<>'ELUTASÍTVA' THEN RAISE EXCEPTION 'OFFER_DECLINE_FAILED'; END IF;
 x:=public.cc_vnext_mass_public_decide_v1('sha256:'||repeat('2',64),'decline');
 IF x->>'already'<>'true' THEN RAISE EXCEPTION 'OFFER_DECLINE_IDEMPOTENCY_FAILED'; END IF;
 x:=public.cc_vnext_mass_public_book_v1('CC-TEST-PUBLIC-QA-WAIT',
 '{"name":"Minta Következő","email":"next@cc-test.invalid"}'::jsonb,
 'sha256:'||repeat('3',64));
 IF x->>'ok'<>'true' THEN RAISE EXCEPTION 'AFTER_DECLINE_REBOOK_FAILED'; END IF;
END $wait_decline$;
RESET ROLE;

-- Late cancellation must be recorded correctly; no sanctions or messages generated.
INSERT INTO public.mass_bookings(id,source_workbook_id,submitted_at,event_id,
 name,email,booking_status,attendance,cancellation_token,migration_run_id)
VALUES('CC-TEST-PUBLIC-QA-LATE','CC_TEST_PUBLIC_QA',now()-interval '4 days',
 'CC-TEST-PUBLIC-QA-PAST','Minta Késői','late@cc-test.invalid','AKTÍV','NINCS RÖGZÍTVE',
 'sha256:'||repeat('4',64),'CC_TEST_PUBLIC_QA');
SET LOCAL ROLE service_role;
DO $late$
DECLARE x jsonb;
BEGIN
 x:=public.cc_vnext_mass_public_cancel_v1('sha256:'||repeat('4',64));
 IF x->>'late'<>'true' THEN RAISE EXCEPTION 'LATE_CANCELLATION_NOT_RECOGNIZED'; END IF;
END $late$;
RESET ROLE;

DO $integrity$
BEGIN
 IF (SELECT count(*) FROM public.mass_live_write_audit WHERE source_workbook_id='CC_TEST_PUBLIC_QA')<9
 THEN RAISE EXCEPTION 'WRITE_AUDIT_MISSING'; END IF;
 IF (SELECT count(*) FROM public.player_push_outbox)::int<>current_setting('cc.qa.push_before')::int
 OR (SELECT count(*) FROM private.cc_mass_mail_outbox_v1)::int<>current_setting('cc.qa.mail_before')::int
 THEN RAISE EXCEPTION 'UNEXPECTED_EMAIL_OR_PUSH'; END IF;
 IF EXISTS(SELECT 1 FROM public.mass_bookings WHERE source_workbook_id='CC_TEST_PUBLIC_QA'
 AND cancellation_token NOT LIKE 'sha256:%' AND cancellation_token NOT LIKE 'USED:sha256:%'
 AND cancellation_token IS NOT NULL)
 THEN RAISE EXCEPTION 'TOKEN_STORED_IN_CLEAR'; END IF;
END $integrity$;

SET LOCAL ROLE anon;
DO $deny_anon$
BEGIN
 BEGIN
  PERFORM public.cc_vnext_mass_public_book_v1('CC-TEST-PUBLIC-QA-FULL','{}'::jsonb,'invalid');
  RAISE EXCEPTION 'ANON_BOOKING_EXECUTED';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $deny_anon$;
RESET ROLE;
SET LOCAL ROLE authenticated;
DO $deny_auth$
BEGIN
 BEGIN
  PERFORM public.cc_vnext_mass_public_wait_v1('CC-TEST-PUBLIC-QA-FULL','{}'::jsonb);
  RAISE EXCEPTION 'AUTHENTICATED_WAITLIST_EXECUTED';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $deny_auth$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS: TEST public booking/wait/cancel/offer decisions + capacity + ACL; no emails; rolled back' AS result;
