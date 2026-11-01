-- TEST only. Run twice after installing the mass read APIs. Every synthetic data change rolls back.
BEGIN;
DO $guard$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.events WHERE legacy_manager_id='cc_test_bb2_rsvp_20261106')
 THEN RAISE EXCEPTION 'WRONG_TEST_PROJECT_ABORT' USING ERRCODE='42501'; END IF;
 IF EXISTS(SELECT 1 FROM public.mass_events WHERE id LIKE 'cc-vnext-qa-%')
 THEN RAISE EXCEPTION 'TEST_FIXTURE_COLLISION' USING ERRCODE='22023'; END IF;
END $guard$;
SELECT set_config('cc.qa.manager_uid',(
 SELECT auth_user_id::text FROM public.manager_accounts a WHERE a.active AND a.auth_user_id IS NOT NULL
 AND EXISTS(SELECT 1 FROM public.manager_module_permissions m WHERE m.manager_id=a.id
 AND m.module_key='mass.trainings' AND m.can_view) LIMIT 1),true);
SELECT set_config('cc.qa.manager_email',(
 SELECT email FROM public.manager_accounts WHERE auth_user_id=current_setting('cc.qa.manager_uid')::uuid),true);
SELECT set_config('cc.qa.day',((now() AT TIME ZONE 'Europe/Budapest')::date+8)::text,true);
SELECT set_config('cc.qa.past_day',((now() AT TIME ZONE 'Europe/Budapest')::date-8)::text,true);
SELECT set_config('cc.qa.month',to_char((now() AT TIME ZONE 'Europe/Budapest')::date,'YYYY-MM'),true);
DO $fixture_identity$ BEGIN
 IF current_setting('cc.qa.manager_uid',true) IS NULL THEN RAISE EXCEPTION 'MASS_MANAGER_NOT_FOUND'; END IF;
END $fixture_identity$;

INSERT INTO public.mass_events
 (id,source_workbook_id,event_date,start_time,end_time,level,court,capacity,new_limit,active,
  session_type,event_type,public_registration_active,legacy_row,migration_run_id)
VALUES
 ('cc-vnext-qa-future','CC_TEST_VNEXT_MASS_QA',current_setting('cc.qa.day')::date,
  '17:30'::time,'19:00'::time,'Kezdő','TEST terem',2,2,true,
  'TÖMEGSPORT','training',true,'{}'::jsonb,'CC_TEST_VNEXT_MASS_QA'),
 ('cc-vnext-qa-past','CC_TEST_VNEXT_MASS_QA',current_setting('cc.qa.past_day')::date,
  '18:00'::time,'19:30'::time,'Haladó','TEST terem',4,4,true,
  'TÖMEGSPORT','training',false,'{}'::jsonb,'CC_TEST_VNEXT_MASS_QA');

INSERT INTO public.mass_athletes
 (id,source_workbook_id,name,email,level,status,migration_run_id)
VALUES
 ('cc-vnext-qa-athlete-a','CC_TEST_VNEXT_MASS_QA','Minta Sportoló A','cc.mass.test.a@example.invalid','Kezdő','AKTÍV','CC_TEST_VNEXT_MASS_QA'),
 ('cc-vnext-qa-athlete-b','CC_TEST_VNEXT_MASS_QA','Minta Sportoló B','cc.mass.test.b@example.invalid','Kezdő','AKTÍV','CC_TEST_VNEXT_MASS_QA');

INSERT INTO public.mass_passes
 (source_workbook_id,pass_number,product,pass_group,email,purchase_date,valid_month,season)
VALUES
 ('CC_TEST_VNEXT_MASS_QA','CC-VNEXT-PASS-1','Tömegsport havi bérlet','Kezdő',
  'cc.mass.test.a@example.invalid',now()-interval '1 day',current_setting('cc.qa.month'),'2026/27');

INSERT INTO public.mass_bookings
 (id,source_workbook_id,submitted_at,event_id,name,email,pass_number,source,pass_status,
  booking_status,attendance,capacity_bucket,athlete_id,migration_run_id)
VALUES
 ('cc-vnext-qa-booking-a','CC_TEST_VNEXT_MASS_QA',now()-interval '4 hours',
  'cc-vnext-qa-future','Minta Sportoló A','cc.mass.test.a@example.invalid','CC-VNEXT-PASS-1',
  'ÚJ WEB','ÉRVÉNYES','AKTÍV','','ÚJ','cc-vnext-qa-athlete-a','CC_TEST_VNEXT_MASS_QA'),
 ('cc-vnext-qa-booking-b','CC_TEST_VNEXT_MASS_QA',now()-interval '3 hours',
  'cc-vnext-qa-future','Minta Sportoló B','cc.mass.test.b@example.invalid','','ADMIN',
  'NINCS','AKTÍV','','RÉGI','cc-vnext-qa-athlete-b','CC_TEST_VNEXT_MASS_QA'),
 ('cc-vnext-qa-booking-cancelled','CC_TEST_VNEXT_MASS_QA',now()-interval '2 hours',
  'cc-vnext-qa-future','Minta Lemondó','cc.mass.test.cancel@example.invalid','','WEB',
  'NINCS','LEMONDVA','','RÉGI',NULL,'CC_TEST_VNEXT_MASS_QA');

INSERT INTO public.mass_waitlist
 (id,source_workbook_id,submitted_at,event_id,name,email,pass_status,waitlist_status,
  migration_run_id)
VALUES
 ('cc-vnext-qa-waitlist','CC_TEST_VNEXT_MASS_QA',now(),
  'cc-vnext-qa-future','Minta Várakozó','cc.mass.test.wait@example.invalid','NINCS',
  'VÁRAKOZIK','CC_TEST_VNEXT_MASS_QA');

SELECT set_config('request.jwt.claim.sub',current_setting('cc.qa.manager_uid'),true);
SELECT set_config('request.jwt.claims',jsonb_build_object(
 'sub',current_setting('cc.qa.manager_uid'),'email',current_setting('cc.qa.manager_email'),
 'role','authenticated')::text,true);
SET LOCAL ROLE authenticated;
DO $read_smoke$
DECLARE t jsonb;c jsonb;h jsonb;d jsonb;at jsonb;w jsonb;p jsonb;sn jsonb;cn jsonb;
BEGIN
 t:=public.cc_manager_mass_trainings_v1(current_setting('cc.qa.day')::date,
   current_setting('cc.qa.day')::date+1);
 IF jsonb_array_length(t)<>1 OR t->0->>'eventId'<>'cc-vnext-qa-future'
 OR (t->0->>'totalActive')::int<>2 OR (t->0->>'free')::int<>0
 OR (t->0->>'waitlistCount')::int<>1 THEN RAISE EXCEPTION 'TRAINING_CAPACITY_CONTRACT_FAILURE'; END IF;
 c:=public.cc_manager_mass_calendar_v1(current_setting('cc.qa.day')::date,
   current_setting('cc.qa.day')::date+1);
 IF jsonb_array_length(c)<>1 OR (c->0->>'totalActive')::int<>2 THEN
  RAISE EXCEPTION 'CALENDAR_CONTRACT_FAILURE'; END IF;
 h:=public.cc_manager_mass_training_history_v1(current_setting('cc.qa.past_day')::date-1,
   current_setting('cc.qa.past_day')::date+1);
 IF jsonb_array_length(h)<>1 OR h->0->>'eventId'<>'cc-vnext-qa-past' THEN
  RAISE EXCEPTION 'HISTORY_CONTRACT_FAILURE'; END IF;
 d:=public.cc_manager_mass_event_detail_v1('cc-vnext-qa-future');
 IF d->'event'->>'eventId'<>'cc-vnext-qa-future'
 OR jsonb_array_length(d->'bookings')<>2 OR jsonb_array_length(d->'waitlist')<>1
 THEN RAISE EXCEPTION 'EVENT_DETAIL_CONTRACT_FAILURE'; END IF;
 at:=public.cc_manager_mass_athletes_v1('Minta Sportoló','','');
 IF jsonb_array_length(at)<>2 THEN RAISE EXCEPTION 'ATHLETE_SEARCH_CONTRACT_FAILURE'; END IF;
 p:=public.cc_manager_mass_passes_v1('CC-VNEXT-PASS',current_setting('cc.qa.month'));
 IF jsonb_array_length(p)<>1 OR p->0->>'currentMonth'<>'true'
 THEN RAISE EXCEPTION 'PASS_MONTH_CONTRACT_FAILURE'; END IF;
 sn:=public.cc_manager_mass_attendance_snapshot_r1_v1('cc-vnext-qa-future');
 IF jsonb_array_length(sn)<>2 THEN RAISE EXCEPTION 'ATTENDANCE_SNAPSHOT_CONTRACT_FAILURE'; END IF;
 cn:=public.cc_manager_mass_cancellations_v1('cc-vnext-qa-future');
 IF jsonb_array_length(cn)<>1 OR cn->0->>'bookingStatus'<>'LEMONDVA'
 THEN RAISE EXCEPTION 'CANCELLATION_CONTRACT_FAILURE'; END IF;
END $read_smoke$;
RESET ROLE;
-- Manager without the module grant must not obtain private athlete and pass details.
UPDATE public.manager_module_permissions SET can_view=false WHERE
 manager_id=(SELECT id FROM public.manager_accounts WHERE auth_user_id=current_setting('cc.qa.manager_uid')::uuid)
 AND module_key IN ('mass.athletes','mass.passes');
SET LOCAL ROLE authenticated;
DO $deny_modules$
BEGIN
 BEGIN
  PERFORM public.cc_manager_mass_athletes_v1('','','');
  RAISE EXCEPTION 'ATHLETE_MODULE_PERMISSION_LEAK';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM public.cc_manager_mass_passes_v1('','');
  RAISE EXCEPTION 'PASS_MODULE_PERMISSION_LEAK';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $deny_modules$;
RESET ROLE;
SELECT set_config('request.jwt.claim.sub','',true);
SELECT set_config('request.jwt.claims','',true);
SET LOCAL ROLE authenticated;
DO $deny_no_auth$
BEGIN
 BEGIN
  PERFORM public.cc_manager_mass_trainings_v1(current_date,current_date+1);
  RAISE EXCEPTION 'NO_AUTH_ALLOWED';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $deny_no_auth$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS: 8 mass-read API contracts, capacity, waitlist, bérlet, auth; fixture rolled back' AS result;
