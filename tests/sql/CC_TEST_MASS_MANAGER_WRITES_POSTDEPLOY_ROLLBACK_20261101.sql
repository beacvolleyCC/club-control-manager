-- TEST-only acceptance, run twice after the five Manager mass write RPCs are installed.
-- All synthetic records, audit rows, permission changes, and attendance changes ROLLBACK.
BEGIN;
DO $guard$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.events WHERE legacy_manager_id='cc_test_bb2_rsvp_20261106')
 OR EXISTS(SELECT 1 FROM public.mass_events WHERE id LIKE 'CC-TEST-WRITE-QA-%')
 THEN RAISE EXCEPTION 'CC_TEST_MASS_WRITE_QA_GUARD_FAILED' USING ERRCODE='42501'; END IF;
END $guard$;
SELECT set_config('cc.qa.manager_uid',(SELECT a.auth_user_id::text FROM public.manager_accounts a
 WHERE a.active AND a.auth_user_id IS NOT NULL AND EXISTS
 (SELECT 1 FROM public.manager_module_permissions m WHERE m.manager_id=a.id
 AND m.module_key='mass.trainings' AND m.can_edit) LIMIT 1),true);
SELECT set_config('cc.qa.manager_email',(SELECT a.email FROM public.manager_accounts a
 WHERE a.auth_user_id=current_setting('cc.qa.manager_uid')::uuid),true);
DO $account$
BEGIN IF current_setting('cc.qa.manager_uid',true) IS NULL
 THEN RAISE EXCEPTION 'CC_TEST_MASS_MANAGER_EDIT_ACCOUNT_MISSING'; END IF;
END $account$;
SELECT set_config('cc.qa.day',((now() AT TIME ZONE 'Europe/Budapest')::date+9)::text,true);
SELECT set_config('cc.qa.past',((now() AT TIME ZONE 'Europe/Budapest')::date-9)::text,true);
SELECT set_config('cc.qa.push_before',(SELECT count(*)::text FROM public.player_push_outbox),true);
SELECT set_config('cc.qa.mail_before',(SELECT count(*)::text FROM private.cc_mass_mail_outbox_v1),true);
SELECT set_config('cc.qa.audit_before',(SELECT count(*)::text FROM public.mass_live_write_audit),true);
SELECT set_config('cc.qa.event_count_before',(SELECT count(*)::text FROM public.mass_events),true);
SELECT set_config('cc.qa.booking_count_before',(SELECT count(*)::text FROM public.mass_bookings),true);

INSERT INTO public.mass_events(id,source_workbook_id,event_date,start_time,end_time,
 level,court,capacity,new_limit,old_limit,active,session_type,event_type,
 public_registration_active,migration_run_id,legacy_row)
VALUES
('CC-TEST-WRITE-QA-FUTURE','CC_TEST_MASS_WRITE_QA',current_setting('cc.qa.day')::date,
 '17:30','19:00','Kezdő','TEST',2,1,1,true,'TÖMEGSPORT','training',true,'CC_TEST_MASS_WRITE_QA','{}'::jsonb),
('CC-TEST-WRITE-QA-PAST','CC_TEST_MASS_WRITE_QA',current_setting('cc.qa.past')::date,
 '17:30','19:00','Haladó','TEST',8,8,0,true,'TÖMEGSPORT','training',false,'CC_TEST_MASS_WRITE_QA','{}'::jsonb);
-- One live offer reserves a place at the future training, leaving only one admin slot.
INSERT INTO public.mass_waitlist(id,source_workbook_id,event_id,name,email,
 waitlist_status,submitted_at,offered_at,offer_expires_at,migration_run_id)
VALUES('CC-TEST-WRITE-QA-OFFER','CC_TEST_MASS_WRITE_QA','CC-TEST-WRITE-QA-FUTURE',
 'Minta Várakozó','waitlist@cc-test.invalid','HELY FELAJÁNLVA',
 now()-interval '30 minutes',now()-interval '5 minutes',now()+interval '30 minutes','CC_TEST_MASS_WRITE_QA');

INSERT INTO public.mass_athletes(id,source_workbook_id,name,email,level,status,migration_run_id)
VALUES('CC-TEST-WRITE-QA-ATHLETE','CC_TEST_MASS_WRITE_QA','Minta Korábbi',
 'past@cc-test.invalid','Haladó','AKTÍV','CC_TEST_MASS_WRITE_QA');
INSERT INTO public.mass_bookings(id,source_workbook_id,submitted_at,event_id,name,email,
 booking_status,attendance,source,capacity_bucket,athlete_id,migration_run_id)
VALUES('CC-TEST-WRITE-QA-PAST-BOOKING','CC_TEST_MASS_WRITE_QA',now()-interval '12 days',
 'CC-TEST-WRITE-QA-PAST','Minta Korábbi','past@cc-test.invalid','AKTÍV',
 'NINCS RÖGZÍTVE','ADMIN / HELYSZÍNI','ADMIN','CC-TEST-WRITE-QA-ATHLETE','CC_TEST_MASS_WRITE_QA');

SELECT set_config('request.jwt.claim.sub',current_setting('cc.qa.manager_uid'),true);
SELECT set_config('request.jwt.claims',jsonb_build_object(
 'sub',current_setting('cc.qa.manager_uid'),'email',current_setting('cc.qa.manager_email'),
 'role','authenticated')::text,true);
SET LOCAL ROLE authenticated;
DO $book_patch_gate$
DECLARE x jsonb;bid text;
BEGIN
 x:=public.cc_manager_mass_booking_add_v1('CC-TEST-WRITE-QA-FUTURE',jsonb_build_object(
  'name','Minta Admin Sportoló','email','admin@cc-test.invalid',
  'personType','NORMAL','capacityBucket','ADMIN','passNumber','Q-TEST-1',
  'note','Tesztfoglalás','present',false));
 IF x->>'ok'<>'true' OR x->>'passStatus'<>'ELLENŐRZÉSRE VÁR' OR x->>'remaining'<>'0'
 THEN RAISE EXCEPTION 'BOOKING_ADD_CONTRACT_FAILED'; END IF;
 bid:=x->>'bookingId';
 PERFORM set_config('cc.qa.new_booking',bid,true);
 BEGIN
  PERFORM public.cc_manager_mass_booking_add_v1('CC-TEST-WRITE-QA-FUTURE',
   '{"name":"Duplikált","email":"admin@cc-test.invalid"}'::jsonb);
  RAISE EXCEPTION 'DUPLICATE_EMAIL_ALLOWED';
 EXCEPTION WHEN unique_violation THEN NULL; END;
 BEGIN
  PERFORM public.cc_manager_mass_booking_add_v1('CC-TEST-WRITE-QA-FUTURE',
   '{"name":"Túlcsordulás","email":"overflow@cc-test.invalid"}'::jsonb);
  RAISE EXCEPTION 'CAPACITY_OVERBOOK_ALLOWED';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 x:=public.cc_manager_mass_booking_patch_v1(bid,
 '{"passStatus":"ÉRVÉNYES","note":"Ellenőrzött admin foglalás"}'::jsonb);
 IF x->'result'->>'passStatus'<>'ÉRVÉNYES'
 OR x->'result'->>'note'<>'Ellenőrzött admin foglalás'
 THEN RAISE EXCEPTION 'BOOKING_PATCH_CONTRACT_FAILED'; END IF;
 x:=public.cc_manager_mass_registration_gate_v1('CC-TEST-WRITE-QA-FUTURE',true);
 IF x->>'registrationMode'<>'WAITLIST_ONLY' THEN RAISE EXCEPTION 'WAITLIST_GATE_CLOSE_FAILED'; END IF;
 x:=public.cc_manager_mass_registration_gate_v1('CC-TEST-WRITE-QA-FUTURE',false);
 IF x->>'registrationMode'<>'OPEN' THEN RAISE EXCEPTION 'WAITLIST_GATE_OPEN_FAILED'; END IF;
END $book_patch_gate$;
DO $remove$
DECLARE x jsonb;
BEGIN
 x:=public.cc_manager_mass_booking_remove_v1(current_setting('cc.qa.new_booking'));
 IF x->>'ok'<>'true' OR x->>'waitlistOfferQueued'<>'false'
 THEN RAISE EXCEPTION 'ADMIN_REMOVE_CONTRACT_FAILED'; END IF;
 BEGIN
  PERFORM public.cc_manager_mass_booking_remove_v1(current_setting('cc.qa.new_booking'));
  RAISE EXCEPTION 'DOUBLE_REMOVE_ALLOWED';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
END $remove$;
DO $attendance$
DECLARE x jsonb;
BEGIN
 x:=public.cc_manager_mass_attendance_r1_v1('CC-TEST-WRITE-QA-PAST-BOOKING','NEM JELENT MEG');
 IF x->>'bookingStatus'<>'NEM JELENT MEG' OR x->>'sanctionsAutomated'<>'false'
 THEN RAISE EXCEPTION 'NO_SHOW_CONTRACT_FAILED'; END IF;
 x:=public.cc_manager_mass_attendance_r1_v1('CC-TEST-WRITE-QA-PAST-BOOKING','MEGJELENT');
 IF x->>'bookingStatus'<>'AKTÍV' OR x->>'attendance'<>'MEGJELENT'
 THEN RAISE EXCEPTION 'ATTENDANCE_RESTORE_CONTRACT_FAILED'; END IF;
 x:=public.cc_manager_mass_attendance_r1_v1('CC-TEST-WRITE-QA-PAST-BOOKING','NINCS RÖGZÍTVE');
 IF x->>'attendance'<>'NINCS RÖGZÍTVE' THEN RAISE EXCEPTION 'ATTENDANCE_CLEAR_FAILED'; END IF;
 BEGIN
  PERFORM public.cc_manager_mass_attendance_r1_v1(current_setting('cc.qa.new_booking'),'MEGJELENT');
  RAISE EXCEPTION 'CANCELLED_ATTENDANCE_ALLOWED';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
END $attendance$;
RESET ROLE;
DO $integrity$
BEGIN
 IF (SELECT booking_status FROM public.mass_bookings WHERE id=current_setting('cc.qa.new_booking'))<>'LEMONDVA'
 OR (SELECT note FROM public.mass_bookings WHERE id=current_setting('cc.qa.new_booking')) NOT LIKE 'Ellenőrzött admin foglalás%'
 THEN RAISE EXCEPTION 'ADMIN_REMOVE_DID_NOT_PRESERVE_NOTE'; END IF;
 IF (SELECT count(*) FROM public.mass_waitlist WHERE id='CC-TEST-WRITE-QA-OFFER'
 AND waitlist_status='HELY FELAJÁNLVA')<>1 THEN
 RAISE EXCEPTION 'EXISTING_WAITLIST_OFFER_CHANGED'; END IF;
 IF (SELECT count(*) FROM public.mass_live_write_audit)::int
 < current_setting('cc.qa.audit_before')::int+9 THEN RAISE EXCEPTION 'WRITE_AUDIT_MISSING'; END IF;
 IF (SELECT count(*) FROM public.player_push_outbox)::int<>current_setting('cc.qa.push_before')::int
 OR (SELECT count(*) FROM private.cc_mass_mail_outbox_v1)::int<>current_setting('cc.qa.mail_before')::int
 THEN RAISE EXCEPTION 'UNEXPECTED_MESSAGE_QUEUED'; END IF;
END $integrity$;
-- A manager whose mass.trainings edit grant is revoked must not be able to write.
UPDATE public.manager_module_permissions SET can_edit=false WHERE
 manager_id=(SELECT id FROM public.manager_accounts WHERE auth_user_id=current_setting('cc.qa.manager_uid')::uuid)
 AND module_key='mass.trainings';
SET LOCAL ROLE authenticated;
DO $deny_role$
BEGIN
 BEGIN
  PERFORM public.cc_manager_mass_registration_gate_v1('CC-TEST-WRITE-QA-FUTURE',true);
  RAISE EXCEPTION 'EDIT_PERMISSION_REVOKE_IGNORED';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $deny_role$;
RESET ROLE;
SELECT set_config('request.jwt.claim.sub','',true);
SELECT set_config('request.jwt.claims','',true);
SET LOCAL ROLE authenticated;
DO $deny_session$
BEGIN
 BEGIN
  PERFORM public.cc_manager_mass_booking_add_v1('CC-TEST-WRITE-QA-FUTURE','{}'::jsonb);
  RAISE EXCEPTION 'UNAUTHENTICATED_ADMIN_WRITE_ALLOWED';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $deny_session$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS TEST mass manager writes: capacity, reserved offer, patch, gate, remove, attendance, audit, denied; rolled back' AS result;