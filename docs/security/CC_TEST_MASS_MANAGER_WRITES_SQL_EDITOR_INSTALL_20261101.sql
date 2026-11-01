-- Club Control · TEST Manager tömegsport írási alapok (2026-11-01).
-- Isolated TEST only: szzoubvhlwnojtzqjebc. DO NOT execute on LIVE.
-- NO emails, no push, no automatic no-show bans, no public booking endpoints.
BEGIN;
DO $test_guard$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.events WHERE legacy_manager_id='cc_test_bb2_rsvp_20261106')
 OR EXISTS(SELECT 1 FROM public.mass_events)
 THEN RAISE EXCEPTION 'WRONG_PROJECT_OR_NONEMPTY_MASS_SOURCE_ABORT' USING ERRCODE='42501'; END IF;
 IF EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname IN(
 'cc_manager_mass_booking_add_v1','cc_manager_mass_booking_patch_v1',
 'cc_manager_mass_booking_remove_v1','cc_manager_mass_attendance_r1_v1',
 'cc_manager_mass_registration_gate_v1'))
 THEN RAISE EXCEPTION 'MANAGER_MASS_WRITES_ALREADY_INSTALLED_REVIEW_REQUIRED' USING ERRCODE='22023'; END IF;
END
$test_guard$;

CREATE FUNCTION public.cc_manager_mass_registration_gate_v1(p_event_id text,p_waitlist_only boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE v_actor uuid; v_event public.mass_events%rowtype; v_new jsonb;
BEGIN
 v_actor:=private.cc_manager_require_any_v1('mass.trainings','edit');
 SELECT * INTO v_event FROM public.mass_events
 WHERE id=nullif(btrim(coalesce(p_event_id,'')),'') FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'MASS_EVENT_NOT_FOUND' USING ERRCODE='22023'; END IF;
 IF v_event.active IS NOT TRUE OR upper(coalesce(v_event.session_type,''))='VERSENYSPORT'
 THEN RAISE EXCEPTION 'MASS_EVENT_INVALID_SCOPE' USING ERRCODE='22023'; END IF;
 IF v_event.event_date IS NULL OR v_event.start_time IS NULL
 OR ((v_event.event_date+v_event.start_time) AT TIME ZONE 'Europe/Budapest')<=now()
 THEN RAISE EXCEPTION 'MASS_EVENT_ALREADY_STARTED' USING ERRCODE='22023'; END IF;
 IF coalesce(p_waitlist_only,false) THEN
  v_new:=coalesce(v_event.legacy_row,'{}'::jsonb)||jsonb_build_object(
  'managerWaitlistOnly',true,'managerWaitlistOnlyChangedAt',now());
 ELSE
  v_new:=coalesce(v_event.legacy_row,'{}'::jsonb)
    - 'managerWaitlistOnly' - 'managerWaitlistOnlyChangedAt';
 END IF;
 UPDATE public.mass_events SET legacy_row=v_new,updated_at=now()
 WHERE id=v_event.id;
 INSERT INTO public.mass_live_write_audit(source_workbook_id,operation,entity_type,entity_id,actor,payload)
 VALUES(v_event.source_workbook_id,'test.registration_gate','mass_event',v_event.id,
  (SELECT email FROM public.manager_accounts WHERE id=v_actor),jsonb_build_object(
  'waitlistOnly',coalesce(p_waitlist_only,false),'previous',v_event.legacy_row->'managerWaitlistOnly'));
 RETURN jsonb_build_object('ok',true,'eventId',v_event.id,
  'registrationMode',CASE WHEN coalesce(p_waitlist_only,false) THEN 'WAITLIST_ONLY' ELSE 'OPEN' END);
END
$fn$;

CREATE FUNCTION public.cc_manager_mass_booking_add_v1(p_event_id text,p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE
 v_actor uuid;v_event public.mass_events%rowtype;v_name text;v_email text;
 v_type text;v_bucket text;v_pass text;v_pass_status text;v_note text;
 v_total int;v_new int;v_old int;v_reserved int;v_total_limit int;v_new_limit int;
 v_old_limit int;v_booking text;v_athlete text;v_present boolean;v_existing text;
 v_start timestamptz;
BEGIN
 v_actor:=private.cc_manager_require_any_v1('mass.trainings','edit');
 IF p_payload IS NULL OR jsonb_typeof(p_payload)<>'object'
 THEN RAISE EXCEPTION 'BOOKING_PAYLOAD_OBJECT_REQUIRED' USING ERRCODE='22023'; END IF;
 v_name:=btrim(coalesce(p_payload->>'name',''));
 v_email:=lower(btrim(coalesce(p_payload->>'email','')));
 v_type:=upper(btrim(coalesce(p_payload->>'personType','NORMAL')));
 v_bucket:=upper(btrim(coalesce(p_payload->>'capacityBucket','ADMIN')));
 v_pass:=btrim(coalesce(p_payload->>'passNumber',''));
 v_note:=left(coalesce(p_payload->>'note',''),1000);
 v_present:=coalesce((p_payload->>'present')::boolean,false);
 IF v_name='' OR length(v_name)>100 OR length(v_email)>254 OR length(v_pass)>100
 THEN RAISE EXCEPTION 'BOOKING_REQUIRED_FIELDS_INVALID' USING ERRCODE='22023'; END IF;
 IF v_email<>'' AND v_email !~* '^[^ @]+@[^ @]+[.][^ @]+$'
 THEN RAISE EXCEPTION 'EMAIL_INVALID' USING ERRCODE='22023'; END IF;
 IF v_type NOT IN ('NORMAL','FIRST','GUEST') OR v_bucket NOT IN ('ÚJ','UJ','RÉGI','REGI','ADMIN')
 THEN RAISE EXCEPTION 'BOOKING_TYPE_OR_BUCKET_INVALID' USING ERRCODE='22023'; END IF;
 SELECT * INTO v_event FROM public.mass_events
 WHERE id=btrim(coalesce(p_event_id,'')) FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'MASS_EVENT_NOT_FOUND' USING ERRCODE='22023'; END IF;
 IF v_event.active IS NOT TRUE OR upper(coalesce(v_event.session_type,''))='VERSENYSPORT'
 THEN RAISE EXCEPTION 'MASS_EVENT_NOT_BOOKABLE' USING ERRCODE='22023'; END IF;
 IF v_event.event_date IS NULL OR v_event.start_time IS NULL
 THEN RAISE EXCEPTION 'MASS_EVENT_DATETIME_INVALID' USING ERRCODE='22023'; END IF;
 v_start:=((v_event.event_date+v_event.start_time) AT TIME ZONE 'Europe/Budapest');
 IF v_start<=now() AND NOT v_present
 THEN RAISE EXCEPTION 'PAST_EVENT_ONLY_PRESENT_ADMIN_ADD' USING ERRCODE='22023'; END IF;
 IF v_email<>'' AND EXISTS(SELECT 1 FROM public.mass_bookings b
 WHERE b.event_id=v_event.id AND b.source_workbook_id=v_event.source_workbook_id
 AND lower(coalesce(b.email,''))=v_email AND b.booking_status IN ('AKTÍV','NEM JELENT MEG'))
 THEN RAISE EXCEPTION 'ATHLETE_ALREADY_IN_EVENT' USING ERRCODE='23505'; END IF;
 IF v_email<>'' AND EXISTS(
 SELECT 1 FROM public.mass_bookings b JOIN public.mass_events e
 ON e.id=b.event_id AND e.source_workbook_id=b.source_workbook_id
 WHERE b.source_workbook_id=v_event.source_workbook_id AND b.event_id<>v_event.id
 AND lower(coalesce(b.email,''))=v_email AND b.booking_status='AKTÍV'
 AND e.event_date=v_event.event_date AND e.start_time=v_event.start_time)
 THEN RAISE EXCEPTION 'SAME_SLOT_CONFLICT' USING ERRCODE='23505'; END IF;
 IF v_type='FIRST' AND (
  v_email='' OR EXISTS(
   SELECT 1 FROM public.mass_athletes a WHERE a.source_workbook_id=v_event.source_workbook_id
    AND lower(coalesce(a.email,''))=v_email AND a.first_training_date IS NOT NULL)
  OR EXISTS(
   SELECT 1 FROM public.mass_bookings b WHERE b.source_workbook_id=v_event.source_workbook_id
    AND lower(coalesce(b.email,''))=v_email AND b.booking_status IN ('AKTÍV','NEM JELENT MEG')
    AND (upper(coalesce(b.pass_number,''))='ELSŐ EDZÉS' OR upper(coalesce(b.pass_status,''))='ELSŐ EDZÉS')
  )
 ) THEN RAISE EXCEPTION 'FIRST_TRAINING_ALREADY_USED_OR_EMAIL_REQUIRED' USING ERRCODE='22023'; END IF;
 SELECT count(*)::int,
   count(*) FILTER (WHERE upper(coalesce(b.capacity_bucket,'')) IN ('ÚJ','UJ')
    OR (coalesce(b.capacity_bucket,'')='' AND upper(coalesce(b.source,'')) IN ('ÚJ WEB','VÁRÓLISTA')))::int,
   count(*) FILTER (WHERE upper(coalesce(b.capacity_bucket,'')) IN ('RÉGI','REGI'))::int
 INTO v_total,v_new,v_old FROM public.mass_bookings b
 WHERE b.source_workbook_id=v_event.source_workbook_id AND b.event_id=v_event.id
 AND b.booking_status='AKTÍV';
 SELECT count(*)::int INTO v_reserved FROM public.mass_waitlist w
 WHERE w.source_workbook_id=v_event.source_workbook_id AND w.event_id=v_event.id
 AND w.waitlist_status='HELY FELAJÁNLVA' AND w.offer_expires_at>now();
 v_total_limit:=greatest(coalesce(v_event.capacity,0),0);
 v_new_limit:=greatest(coalesce(nullif(v_event.new_limit,0),v_total_limit),0);
 v_old_limit:=greatest(coalesce(v_event.old_limit,0),0);
 IF v_total+v_reserved>=v_total_limit THEN
 RAISE EXCEPTION 'TOTAL_CAPACITY_FULL' USING ERRCODE='22023'; END IF;
 IF v_bucket IN ('ÚJ','UJ') AND v_new+v_reserved>=v_new_limit THEN
 RAISE EXCEPTION 'NEW_CAPACITY_FULL' USING ERRCODE='22023'; END IF;
 IF v_bucket IN ('RÉGI','REGI') AND (v_old_limit<=0 OR v_old>=v_old_limit) THEN
 RAISE EXCEPTION 'OLD_CAPACITY_FULL' USING ERRCODE='22023'; END IF;
 IF v_type='FIRST' THEN v_pass:='ELSŐ EDZÉS';v_pass_status:='ELSŐ EDZÉS';
 ELSIF v_type='GUEST' THEN v_pass:='VENDÉG';v_pass_status:='VENDÉG';
 ELSE v_pass_status:='ELLENŐRZÉSRE VÁR'; END IF;
 v_athlete:=nullif(btrim(coalesce(p_payload->>'athleteId','')),'');
 IF v_athlete IS NOT NULL AND NOT EXISTS(
 SELECT 1 FROM public.mass_athletes WHERE id=v_athlete
 AND source_workbook_id=v_event.source_workbook_id)
 THEN RAISE EXCEPTION 'ATHLETE_ID_NOT_IN_WORKBOOK' USING ERRCODE='42501'; END IF;
 IF v_athlete IS NULL AND v_email<>'' THEN
  SELECT id INTO v_existing FROM public.mass_athletes WHERE source_workbook_id=v_event.source_workbook_id
  AND lower(coalesce(email,''))=v_email ORDER BY updated_at DESC LIMIT 1;
  v_athlete:=v_existing;
 END IF;
 IF v_athlete IS NULL THEN
  v_athlete:='CC-TEST-A-'||gen_random_uuid()::text;
  INSERT INTO public.mass_athletes
  (id,source_workbook_id,name,email,level,status,migration_run_id)
  VALUES(v_athlete,v_event.source_workbook_id,v_name,nullif(v_email,''),v_event.level,'AKTÍV','CC-TEST-VNEXT');
 END IF;
 v_booking:='CC-TEST-B-'||gen_random_uuid()::text;
 INSERT INTO public.mass_bookings(id,source_workbook_id,submitted_at,event_id,name,email,
  pass_number,source,pass_status,booking_status,attendance,cancellation_deadline,
  note,capacity_bucket,athlete_id,migration_run_id)
 VALUES(v_booking,v_event.source_workbook_id,now(),v_event.id,v_name,nullif(v_email,''),
  nullif(v_pass,''),'ADMIN / HELYSZÍNI',v_pass_status,'AKTÍV',
  CASE WHEN v_present THEN 'MEGJELENT' ELSE 'NINCS RÖGZÍTVE' END,
  v_start-(coalesce(v_event.cancellation_hours,0)::double precision*interval '1 hour'),
  nullif(v_note,''),CASE v_bucket WHEN 'UJ' THEN 'ÚJ' WHEN 'REGI' THEN 'RÉGI' ELSE v_bucket END,
  v_athlete,'CC-TEST-VNEXT');
 IF v_present THEN
  UPDATE public.mass_athletes SET first_training_date=coalesce(first_training_date,v_event.event_date),
  updated_at=now() WHERE id=v_athlete AND source_workbook_id=v_event.source_workbook_id;
 END IF;
 INSERT INTO public.mass_live_write_audit(source_workbook_id,operation,entity_type,entity_id,actor,payload)
 VALUES(v_event.source_workbook_id,'test.booking_add','mass_booking',v_booking,
  (SELECT email FROM public.manager_accounts WHERE id=v_actor),
  jsonb_build_object('eventId',v_event.id,'bucket',v_bucket,'personType',v_type));
 RETURN jsonb_build_object('ok',true,'bookingId',v_booking,'eventId',v_event.id,
 'athleteId',v_athlete,'passNumber',v_pass,'passStatus',v_pass_status,
 'remaining',greatest(v_total_limit-v_total-v_reserved-1,0));
END
$fn$;

CREATE FUNCTION public.cc_manager_mass_booking_patch_v1(p_booking_id text,p_patch jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE v_actor uuid;v_old public.mass_bookings%rowtype;v_new public.mass_bookings%rowtype;v_status text;
BEGIN
 v_actor:=private.cc_manager_require_any_v1('mass.trainings','edit');
 IF p_patch IS NULL OR jsonb_typeof(p_patch)<>'object'
 OR p_patch='{}'::jsonb OR p_patch - 'note' - 'passStatus'<>'{}'::jsonb
 THEN RAISE EXCEPTION 'BOOKING_PATCH_FIELDS_INVALID' USING ERRCODE='22023'; END IF;
 SELECT * INTO v_old FROM public.mass_bookings WHERE id=btrim(coalesce(p_booking_id,'')) FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'BOOKING_NOT_FOUND' USING ERRCODE='22023'; END IF;
 IF v_old.booking_status IN ('LEMONDVA','KÉSŐN LEMONDVA')
 THEN RAISE EXCEPTION 'BOOKING_CANCELLED' USING ERRCODE='22023'; END IF;
 v_status:=upper(btrim(coalesce(p_patch->>'passStatus','')));
 IF p_patch ? 'passStatus' AND v_status NOT IN (
 'ÉRVÉNYES','ÉRVÉNYTELEN','ELLENŐRZÉSRE VÁR','ELSŐ EDZÉS','VENDÉG')
 THEN RAISE EXCEPTION 'PASS_STATUS_INVALID' USING ERRCODE='22023'; END IF;
 IF length(coalesce(p_patch->>'note',''))>1000 THEN
 RAISE EXCEPTION 'BOOKING_NOTE_TOO_LONG' USING ERRCODE='22023'; END IF;
 UPDATE public.mass_bookings SET
  pass_status=CASE WHEN p_patch ? 'passStatus' THEN v_status ELSE pass_status END,
  note=CASE WHEN p_patch ? 'note' THEN nullif(p_patch->>'note','') ELSE note END,
  updated_at=now()
 WHERE id=v_old.id RETURNING * INTO v_new;
 INSERT INTO public.mass_live_write_audit(source_workbook_id,operation,entity_type,entity_id,actor,payload)
 VALUES(v_old.source_workbook_id,'test.booking_patch','mass_booking',v_old.id,
 (SELECT email FROM public.manager_accounts WHERE id=v_actor),
 jsonb_build_object('before',jsonb_build_object('passStatus',v_old.pass_status,'note',v_old.note),
 'after',jsonb_build_object('passStatus',v_new.pass_status,'note',v_new.note)));
 RETURN jsonb_build_object('ok',true,'bookingId',v_old.id,
 'result',jsonb_build_object('passStatus',v_new.pass_status,'note',coalesce(v_new.note,'')));
END
$fn$;

CREATE FUNCTION public.cc_manager_mass_booking_remove_v1(p_booking_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE v_actor uuid;v_b public.mass_bookings%rowtype;v_event public.mass_events%rowtype;
BEGIN
 v_actor:=private.cc_manager_require_any_v1('mass.trainings','edit');
 SELECT * INTO v_b FROM public.mass_bookings WHERE id=btrim(coalesce(p_booking_id,'')) FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'BOOKING_NOT_FOUND' USING ERRCODE='22023'; END IF;
 IF v_b.booking_status IN ('LEMONDVA','KÉSŐN LEMONDVA')
 THEN RAISE EXCEPTION 'BOOKING_ALREADY_CANCELLED' USING ERRCODE='22023'; END IF;
 SELECT * INTO v_event FROM public.mass_events
 WHERE id=v_b.event_id AND source_workbook_id=v_b.source_workbook_id FOR UPDATE;
 IF NOT FOUND OR upper(coalesce(v_event.session_type,''))='VERSENYSPORT'
 THEN RAISE EXCEPTION 'MASS_EVENT_INVALID_SCOPE' USING ERRCODE='22023'; END IF;
 UPDATE public.mass_bookings SET booking_status='LEMONDVA',cancelled_at=now(),
 cancellation_type='ADMIN TÖRLÉS',attendance='NINCS RÖGZÍTVE',
 note=concat_ws(E'\n',nullif(note,''),'Admin: sportoló kivéve az edzésről.'),
 updated_at=now() WHERE id=v_b.id;
 INSERT INTO public.mass_live_write_audit(source_workbook_id,operation,entity_type,entity_id,actor,payload)
 VALUES(v_b.source_workbook_id,'test.booking_remove','mass_booking',v_b.id,
 (SELECT email FROM public.manager_accounts WHERE id=v_actor),
 jsonb_build_object('eventId',v_b.event_id,'previousStatus',v_b.booking_status,
 'note','Waitlist offer is intentionally NOT auto-triggered in this version'));
 RETURN jsonb_build_object('ok',true,'bookingId',v_b.id,'trainingId',v_b.event_id,
 'waitlistOfferQueued',false);
END
$fn$;

CREATE FUNCTION public.cc_manager_mass_attendance_r1_v1(p_booking_id text,p_attendance text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE v_actor uuid;v_b public.mass_bookings%rowtype;v_event public.mass_events%rowtype;
 v_att text:=btrim(coalesce(p_attendance,''));v_new_status text;
BEGIN
 v_actor:=private.cc_manager_require_any_v1('mass.trainings','edit');
 IF v_att NOT IN ('NINCS RÖGZÍTVE','MEGJELENT','NEM JELENT MEG')
 THEN RAISE EXCEPTION 'ATTENDANCE_INVALID' USING ERRCODE='22023'; END IF;
 SELECT * INTO v_b FROM public.mass_bookings WHERE id=btrim(coalesce(p_booking_id,'')) FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'BOOKING_NOT_FOUND' USING ERRCODE='22023'; END IF;
 SELECT * INTO v_event FROM public.mass_events
 WHERE id=v_b.event_id AND source_workbook_id=v_b.source_workbook_id;
 IF NOT FOUND OR v_event.active IS NOT TRUE OR upper(coalesce(v_event.session_type,''))='VERSENYSPORT'
 THEN RAISE EXCEPTION 'MASS_EVENT_NOT_ACTIVE' USING ERRCODE='22023'; END IF;
 IF v_event.event_date IS NULL OR v_event.start_time IS NULL OR
 ((v_event.event_date+v_event.start_time) AT TIME ZONE 'Europe/Budapest')>now()
 THEN RAISE EXCEPTION 'ATTENDANCE_EVENT_NOT_STARTED' USING ERRCODE='22023'; END IF;
 IF v_b.booking_status IN ('LEMONDVA','KÉSŐN LEMONDVA')
 THEN RAISE EXCEPTION 'BOOKING_CANCELLED' USING ERRCODE='22023'; END IF;
 v_new_status:=CASE WHEN v_att='NEM JELENT MEG' THEN 'NEM JELENT MEG'
 WHEN v_b.booking_status='NEM JELENT MEG' THEN 'AKTÍV' ELSE v_b.booking_status END;
 UPDATE public.mass_bookings SET attendance=v_att,booking_status=v_new_status,updated_at=now()
 WHERE id=v_b.id;
 IF v_att='MEGJELENT' AND btrim(coalesce(v_b.email,''))<>'' THEN
 UPDATE public.mass_athletes SET first_training_date=coalesce(first_training_date,v_event.event_date),updated_at=now()
 WHERE source_workbook_id=v_event.source_workbook_id AND lower(coalesce(email,''))=lower(v_b.email);
 END IF;
 INSERT INTO public.mass_live_write_audit(source_workbook_id,operation,entity_type,entity_id,actor,payload)
 VALUES(v_b.source_workbook_id,'test.attendance','mass_booking',v_b.id,
 (SELECT email FROM public.manager_accounts WHERE id=v_actor),
 jsonb_build_object('before',v_b.attendance,'after',v_att,'previousBookingStatus',v_b.booking_status,
 'newBookingStatus',v_new_status,'sanctionsAutomated',false));
 RETURN jsonb_build_object('ok',true,'success',true,'persisted',true,
 'bookingId',v_b.id,'eventId',v_b.event_id,'attendance',v_att,
 'bookingStatus',v_new_status,'sanctionResult',jsonb_build_object('action','PENDING_REVIEW'),
 'sanctionNotificationPending',false,'sanctionsAutomated',false,
 'bridge','CC_TEST_VNEXT_MANAGER_ATTENDANCE');
END
$fn$;

REVOKE ALL ON FUNCTION public.cc_manager_mass_registration_gate_v1(text,boolean) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.cc_manager_mass_booking_add_v1(text,jsonb) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.cc_manager_mass_booking_patch_v1(text,jsonb) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.cc_manager_mass_booking_remove_v1(text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.cc_manager_mass_attendance_r1_v1(text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_mass_registration_gate_v1(text,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_mass_booking_add_v1(text,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_mass_booking_patch_v1(text,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_mass_booking_remove_v1(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_mass_attendance_r1_v1(text,text) TO authenticated;
COMMIT;

SELECT p.proname,has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute,
has_function_privilege('authenticated',p.oid,'EXECUTE') AS auth_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname IN (
'cc_manager_mass_registration_gate_v1','cc_manager_mass_booking_add_v1',
'cc_manager_mass_booking_patch_v1','cc_manager_mass_booking_remove_v1',
'cc_manager_mass_attendance_r1_v1')
ORDER BY p.proname;