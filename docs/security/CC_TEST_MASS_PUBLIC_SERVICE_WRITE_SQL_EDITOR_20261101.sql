-- CC TEST · Service-only PUBLIC-MASS transaction contracts · 2026-11-01.
-- NOT installed. TEST project ONLY. Gateway is responsible for bot-check, rate limiting,
-- raw token issuance and delivery; only SHA256 tokens are passed to these functions.
-- NO email, push or sanctions. No direct anon/authenticated EXECUTE.
BEGIN;
DO $test_guard$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.events WHERE legacy_manager_id='cc_test_bb2_rsvp_20261106')
    THEN RAISE EXCEPTION 'CC_WRONG_PROJECT_ABORT' USING ERRCODE='42501'; END IF;
  IF EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname IN
      ('cc_vnext_mass_public_book_v1','cc_vnext_mass_public_wait_v1',
       'cc_vnext_mass_public_cancel_v1','cc_vnext_mass_public_decide_v1'))
    THEN RAISE EXCEPTION 'CC_VNEXT_PUBLIC_MASS_ALREADY_INSTALLED_ABORT'; END IF;
END $test_guard$;

CREATE FUNCTION public.cc_vnext_mass_public_book_v1(
  p_event_id text,p_person jsonb,p_cancellation_hash text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE e public.mass_events%rowtype; v_name text; v_email text; v_pass text;
  v_first boolean;v_start timestamptz; v_total int;v_new int;v_reserved int;
  v_booking_id text;v_pass_status text;v_previous_id text;
BEGIN
 IF p_person IS NULL OR jsonb_typeof(p_person)<>'object'
  OR p_person - 'name' - 'email' - 'passNumber' - 'firstTraining' - 'note'<>'{}'::jsonb
  THEN RAISE EXCEPTION 'PUBLIC_BOOK_PAYLOAD_INVALID' USING ERRCODE='22023'; END IF;
 IF p_cancellation_hash IS NULL OR p_cancellation_hash !~ '^sha256:[a-f0-9]{64}$'
  THEN RAISE EXCEPTION 'PUBLIC_BOOK_TOKEN_HASH_INVALID' USING ERRCODE='22023'; END IF;
 v_name:=btrim(coalesce(p_person->>'name',''));v_email:=lower(btrim(coalesce(p_person->>'email','')));
 v_pass:=btrim(coalesce(p_person->>'passNumber',''));
 IF v_name='' OR length(v_name)>100 OR length(v_email)>254 OR length(v_pass)>100
  OR length(coalesce(p_person->>'note',''))>1000
  OR v_email !~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  THEN RAISE EXCEPTION 'PUBLIC_BOOK_PERSON_INVALID' USING ERRCODE='22023'; END IF;
 IF p_person ? 'firstTraining' AND jsonb_typeof(p_person->'firstTraining')<>'boolean'
  THEN RAISE EXCEPTION 'PUBLIC_BOOK_FIRST_FLAG_INVALID' USING ERRCODE='22023'; END IF;
 v_first:=coalesce((p_person->>'firstTraining')::boolean,false);
 PERFORM pg_advisory_xact_lock(hashtextextended('cc-mass-person:'||v_email,0));
 SELECT * INTO e FROM public.mass_events WHERE id=btrim(coalesce(p_event_id,'')) FOR UPDATE;
 IF NOT FOUND OR e.active IS NOT TRUE OR e.public_registration_active IS NOT TRUE
  OR upper(coalesce(e.session_type,''))='VERSENYSPORT'
  THEN RAISE EXCEPTION 'PUBLIC_BOOK_EVENT_UNAVAILABLE' USING ERRCODE='22023'; END IF;
 IF e.event_date IS NULL OR e.start_time IS NULL THEN RAISE EXCEPTION 'PUBLIC_BOOK_TIME_INVALID' USING ERRCODE='22023'; END IF;
 v_start:=(e.event_date+e.start_time) AT TIME ZONE 'Europe/Budapest';
 IF v_start<=now()+interval '2 hours' THEN RAISE EXCEPTION 'PUBLIC_BOOK_CLOSED_2H' USING ERRCODE='22023'; END IF;
 IF lower(coalesce(e.legacy_row->>'managerWaitlistOnly','false')) IN ('true','1','yes','igen')
  THEN RAISE EXCEPTION 'PUBLIC_BOOK_WAITLIST_ONLY' USING ERRCODE='22023'; END IF;
 IF upper(coalesce(e.session_type,''))='SPORT7' AND upper(v_pass)<>'SPORT7'
  OR upper(coalesce(e.session_type,''))<>'SPORT7' AND upper(v_pass)='SPORT7'
  THEN RAISE EXCEPTION 'PUBLIC_BOOK_MODE_MISMATCH' USING ERRCODE='22023'; END IF;
 IF v_first AND (upper(coalesce(e.session_type,''))='SPORT7' OR v_pass<>'') THEN
  RAISE EXCEPTION 'PUBLIC_BOOK_FIRST_MODE_INVALID' USING ERRCODE='22023'; END IF;
 IF EXISTS(SELECT 1 FROM public.mass_bookings b WHERE b.event_id=e.id AND b.source_workbook_id=e.source_workbook_id
  AND lower(coalesce(b.email,''))=v_email AND b.booking_status='AKTÍV')
  THEN RAISE EXCEPTION 'DUPLICATE_EMAIL_BOOKING' USING ERRCODE='23505'; END IF;
 IF v_pass<>'' AND NOT v_first AND EXISTS(
  SELECT 1 FROM public.mass_bookings b WHERE b.event_id=e.id AND b.source_workbook_id=e.source_workbook_id
   AND upper(coalesce(b.pass_number,''))=upper(v_pass) AND b.booking_status='AKTÍV')
  THEN RAISE EXCEPTION 'DUPLICATE_PASS_BOOKING' USING ERRCODE='23505'; END IF;
 IF EXISTS(
  SELECT 1 FROM public.mass_bookings b JOIN public.mass_events other
    ON other.id=b.event_id AND other.source_workbook_id=b.source_workbook_id
  WHERE b.source_workbook_id=e.source_workbook_id AND b.event_id<>e.id
   AND lower(coalesce(b.email,''))=v_email AND b.booking_status='AKTÍV'
   AND other.event_date=e.event_date AND other.start_time=e.start_time
 ) OR EXISTS(
  SELECT 1 FROM public.mass_waitlist w JOIN public.mass_events other
   ON other.id=w.event_id AND other.source_workbook_id=w.source_workbook_id
  WHERE w.source_workbook_id=e.source_workbook_id AND w.event_id<>e.id
   AND lower(coalesce(w.email,''))=v_email AND other.event_date=e.event_date
   AND other.start_time=e.start_time AND (w.waitlist_status='VÁRAKOZIK'
       OR (w.waitlist_status='HELY FELAJÁNLVA' AND w.offer_expires_at>now()))
 ) THEN RAISE EXCEPTION 'PUBLIC_BOOK_SAME_SLOT_CONFLICT' USING ERRCODE='23505'; END IF;
 IF EXISTS(SELECT 1 FROM public.mass_waitlist w WHERE w.event_id=e.id
  AND w.source_workbook_id=e.source_workbook_id AND lower(coalesce(w.email,''))=v_email
  AND (w.waitlist_status='VÁRAKOZIK' OR (w.waitlist_status='HELY FELAJÁNLVA' AND w.offer_expires_at>now())))
  THEN RAISE EXCEPTION 'PUBLIC_BOOK_ALREADY_WAITING' USING ERRCODE='23505'; END IF;
 -- Fairness: waiting users must receive the next available seat before new bookers.
 IF EXISTS(SELECT 1 FROM public.mass_waitlist w WHERE w.event_id=e.id
  AND w.source_workbook_id=e.source_workbook_id AND w.waitlist_status='VÁRAKOZIK')
  THEN RAISE EXCEPTION 'PUBLIC_BOOK_WAITLIST_HAS_PRIORITY' USING ERRCODE='22023'; END IF;
 IF v_first AND (
  EXISTS(SELECT 1 FROM public.mass_athletes a WHERE a.source_workbook_id=e.source_workbook_id
   AND lower(coalesce(a.email,''))=v_email AND a.first_training_date IS NOT NULL)
  OR EXISTS(SELECT 1 FROM public.mass_bookings b WHERE b.source_workbook_id=e.source_workbook_id
   AND lower(coalesce(b.email,''))=v_email
   AND (upper(coalesce(b.pass_number,''))='ELSŐ EDZÉS' OR upper(coalesce(b.pass_status,''))='ELSŐ EDZÉS')
   AND (b.booking_status='AKTÍV' OR b.attendance='MEGJELENT'))
 ) THEN RAISE EXCEPTION 'PUBLIC_BOOK_FIRST_TRAINING_USED' USING ERRCODE='22023'; END IF;
 IF EXISTS(SELECT 1 FROM public.mass_bookings b WHERE b.cancellation_token=p_cancellation_hash)
  OR EXISTS(SELECT 1 FROM public.mass_waitlist w WHERE w.token_hash=p_cancellation_hash)
  THEN RAISE EXCEPTION 'PUBLIC_BOOK_TOKEN_COLLISION' USING ERRCODE='23505'; END IF;
 SELECT count(*)::int,
  count(*) FILTER(WHERE upper(coalesce(b.capacity_bucket,'')) IN ('ÚJ','UJ')
   OR (coalesce(b.capacity_bucket,'')='' AND upper(coalesce(b.source,'')) IN ('ÚJ WEB','VÁRÓLISTA')))::int
 INTO v_total,v_new FROM public.mass_bookings b WHERE b.source_workbook_id=e.source_workbook_id
 AND b.event_id=e.id AND b.booking_status='AKTÍV';
 SELECT count(*)::int INTO v_reserved FROM public.mass_waitlist w
 WHERE w.source_workbook_id=e.source_workbook_id AND w.event_id=e.id
 AND w.waitlist_status='HELY FELAJÁNLVA' AND w.offer_expires_at>now();
 IF v_total+v_reserved>=greatest(coalesce(e.capacity,0),0)
  OR v_new+v_reserved>=greatest(coalesce(nullif(e.new_limit,0),e.capacity,0),0)
  THEN RAISE EXCEPTION 'PUBLIC_BOOK_CAPACITY_FULL' USING ERRCODE='22023'; END IF;
 IF v_first THEN v_pass:='ELSŐ EDZÉS';v_pass_status:='ELSŐ EDZÉS';
 ELSE v_pass_status:='ELLENŐRZÉSRE VÁR'; END IF;
 v_booking_id:='CC-TEST-PUBLIC-'||gen_random_uuid()::text;
 INSERT INTO public.mass_bookings(
  id,source_workbook_id,submitted_at,event_id,name,email,pass_number,source,
  pass_status,booking_status,attendance,cancellation_deadline,note,cancellation_token,
  capacity_bucket,migration_run_id,updated_at
 ) VALUES(v_booking_id,e.source_workbook_id,now(),e.id,v_name,v_email,nullif(v_pass,''),
  CASE WHEN upper(coalesce(e.session_type,''))='SPORT7' THEN 'SPORT7' ELSE 'ÚJ WEB' END,
  v_pass_status,'AKTÍV','NINCS RÖGZÍTVE',
  v_start-coalesce(e.cancellation_hours,0)*interval '1 hour',
  nullif(p_person->>'note',''),p_cancellation_hash,'ÚJ','CC-TEST-VNEXT',now());
 INSERT INTO public.mass_live_write_audit(source_workbook_id,operation,entity_type,entity_id,actor,payload)
 VALUES(e.source_workbook_id,'test.public_book','mass_booking',v_booking_id,'trusted-gateway',
  jsonb_build_object('eventId',e.id,'firstTraining',v_first,'mailQueued',false));
 RETURN jsonb_build_object('ok',true,'bookingId',v_booking_id,'eventId',e.id,'mailQueued',false);
END $fn$;

CREATE FUNCTION public.cc_vnext_mass_public_wait_v1(p_event_id text,p_person jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE e public.mass_events%rowtype; v_name text;v_email text;v_pass text;
 v_total int;v_new int;v_reserved int;v_wait int;v_wait_id text;v_start timestamptz;
 v_only boolean;
BEGIN
 IF p_person IS NULL OR jsonb_typeof(p_person)<>'object'
 OR p_person - 'name' - 'email' - 'passNumber' - 'note'<>'{}'::jsonb
 THEN RAISE EXCEPTION 'PUBLIC_WAIT_PAYLOAD_INVALID' USING ERRCODE='22023'; END IF;
 v_name:=btrim(coalesce(p_person->>'name',''));v_email:=lower(btrim(coalesce(p_person->>'email','')));
 v_pass:=btrim(coalesce(p_person->>'passNumber',''));
 IF v_name='' OR length(v_name)>100 OR length(v_email)>254 OR length(v_pass)>100
 OR length(coalesce(p_person->>'note',''))>1000
 OR v_email !~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
 THEN RAISE EXCEPTION 'PUBLIC_WAIT_PERSON_INVALID' USING ERRCODE='22023'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('cc-mass-person:'||v_email,0));
 SELECT * INTO e FROM public.mass_events WHERE id=btrim(coalesce(p_event_id,'')) FOR UPDATE;
 IF NOT FOUND OR e.active IS NOT TRUE OR e.public_registration_active IS NOT TRUE
 OR upper(coalesce(e.session_type,''))='VERSENYSPORT'
 THEN RAISE EXCEPTION 'PUBLIC_WAIT_EVENT_UNAVAILABLE' USING ERRCODE='22023'; END IF;
 IF e.event_date IS NULL OR e.start_time IS NULL THEN RAISE EXCEPTION 'PUBLIC_WAIT_TIME_INVALID' USING ERRCODE='22023'; END IF;
 v_start:=(e.event_date+e.start_time) AT TIME ZONE 'Europe/Budapest';
 IF v_start<=now()+interval '2 hours' THEN RAISE EXCEPTION 'PUBLIC_WAIT_CLOSED_2H' USING ERRCODE='22023'; END IF;
 IF (upper(coalesce(e.session_type,''))='SPORT7' AND upper(v_pass)<>'SPORT7')
 OR (upper(coalesce(e.session_type,''))<>'SPORT7' AND upper(v_pass)='SPORT7')
 THEN RAISE EXCEPTION 'PUBLIC_WAIT_MODE_MISMATCH' USING ERRCODE='22023'; END IF;
 IF EXISTS(SELECT 1 FROM public.mass_bookings b WHERE b.source_workbook_id=e.source_workbook_id
 AND b.event_id=e.id AND lower(coalesce(b.email,''))=v_email AND b.booking_status='AKTÍV')
 OR EXISTS(SELECT 1 FROM public.mass_waitlist w WHERE w.source_workbook_id=e.source_workbook_id
 AND w.event_id=e.id AND lower(coalesce(w.email,''))=v_email
 AND (w.waitlist_status='VÁRAKOZIK' OR (w.waitlist_status='HELY FELAJÁNLVA' AND w.offer_expires_at>now())))
 THEN RAISE EXCEPTION 'PUBLIC_WAIT_DUPLICATE' USING ERRCODE='23505'; END IF;
 IF EXISTS(
  SELECT 1 FROM public.mass_bookings b JOIN public.mass_events other
   ON other.source_workbook_id=b.source_workbook_id AND other.id=b.event_id
  WHERE b.source_workbook_id=e.source_workbook_id AND b.event_id<>e.id
   AND lower(coalesce(b.email,''))=v_email AND b.booking_status='AKTÍV'
   AND other.event_date=e.event_date AND other.start_time=e.start_time
 ) OR EXISTS(
  SELECT 1 FROM public.mass_waitlist w JOIN public.mass_events other
   ON other.source_workbook_id=w.source_workbook_id AND other.id=w.event_id
  WHERE w.source_workbook_id=e.source_workbook_id AND w.event_id<>e.id
   AND lower(coalesce(w.email,''))=v_email AND other.event_date=e.event_date
   AND other.start_time=e.start_time
   AND (w.waitlist_status='VÁRAKOZIK' OR (w.waitlist_status='HELY FELAJÁNLVA' AND w.offer_expires_at>now()))
 ) THEN RAISE EXCEPTION 'PUBLIC_WAIT_SAME_SLOT_CONFLICT' USING ERRCODE='23505'; END IF;
 SELECT count(*)::int INTO v_wait FROM public.mass_waitlist w WHERE w.source_workbook_id=e.source_workbook_id
 AND w.event_id=e.id AND (w.waitlist_status='VÁRAKOZIK'
 OR (w.waitlist_status='HELY FELAJÁNLVA' AND w.offer_expires_at>now()));
 IF v_wait>=5 THEN RAISE EXCEPTION 'PUBLIC_WAIT_QUEUE_FULL' USING ERRCODE='22023'; END IF;
 SELECT count(*)::int,count(*) FILTER(WHERE upper(coalesce(b.capacity_bucket,'')) IN ('ÚJ','UJ')
 OR (coalesce(b.capacity_bucket,'')='' AND upper(coalesce(b.source,'')) IN ('ÚJ WEB','VÁRÓLISTA')))::int
 INTO v_total,v_new FROM public.mass_bookings b WHERE b.source_workbook_id=e.source_workbook_id
 AND b.event_id=e.id AND b.booking_status='AKTÍV';
 SELECT count(*)::int INTO v_reserved FROM public.mass_waitlist w
 WHERE w.source_workbook_id=e.source_workbook_id AND w.event_id=e.id
 AND w.waitlist_status='HELY FELAJÁNLVA' AND w.offer_expires_at>now();
 v_only:=lower(coalesce(e.legacy_row->>'managerWaitlistOnly','false')) IN ('true','1','yes','igen');
 IF NOT v_only AND v_total+v_reserved<greatest(coalesce(e.capacity,0),0)
 AND v_new+v_reserved<greatest(coalesce(nullif(e.new_limit,0),e.capacity,0),0)
 THEN RAISE EXCEPTION 'PUBLIC_WAIT_CAPACITY_AVAILABLE' USING ERRCODE='22023'; END IF;
 v_wait_id:='CC-TEST-WAIT-'||gen_random_uuid()::text;
 INSERT INTO public.mass_waitlist(id,source_workbook_id,submitted_at,event_id,name,email,
  pass_number,pass_status,waitlist_status,note,migration_run_id,updated_at)
 VALUES(v_wait_id,e.source_workbook_id,now(),e.id,v_name,v_email,nullif(v_pass,''),
  'ELLENŐRZÉSRE VÁR','VÁRAKOZIK',nullif(p_person->>'note',''),'CC-TEST-VNEXT',now());
 INSERT INTO public.mass_live_write_audit(source_workbook_id,operation,entity_type,entity_id,actor,payload)
 VALUES(e.source_workbook_id,'test.public_wait','mass_waitlist',v_wait_id,'trusted-gateway',
 jsonb_build_object('eventId',e.id,'mailQueued',false));
 RETURN jsonb_build_object('ok',true,'waitlistId',v_wait_id,'eventId',e.id,
 'position',v_wait+1,'mailQueued',false);
END $fn$;

CREATE FUNCTION public.cc_vnext_mass_public_cancel_v1(p_cancellation_hash text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE v_b public.mass_bookings%rowtype;e public.mass_events%rowtype;
 v_id text;v_event_id text;v_deadline timestamptz;v_late boolean;
BEGIN
 IF p_cancellation_hash IS NULL OR p_cancellation_hash !~ '^sha256:[a-f0-9]{64}$'
 THEN RAISE EXCEPTION 'CANCEL_TOKEN_HASH_INVALID' USING ERRCODE='22023'; END IF;
 SELECT b.id,b.event_id INTO v_id,v_event_id FROM public.mass_bookings b
 WHERE b.cancellation_token=p_cancellation_hash LIMIT 1;
 IF v_id IS NULL THEN RAISE EXCEPTION 'CANCEL_TOKEN_INVALID' USING ERRCODE='22023'; END IF;
 SELECT * INTO e FROM public.mass_events WHERE id=v_event_id FOR UPDATE;
 IF NOT FOUND OR upper(coalesce(e.session_type,''))='VERSENYSPORT'
 THEN RAISE EXCEPTION 'CANCEL_EVENT_UNAVAILABLE' USING ERRCODE='22023'; END IF;
 SELECT * INTO v_b FROM public.mass_bookings WHERE id=v_id AND event_id=e.id
 AND source_workbook_id=e.source_workbook_id FOR UPDATE;
 IF NOT FOUND OR v_b.cancellation_token<>p_cancellation_hash OR v_b.booking_status<>'AKTÍV'
 THEN RAISE EXCEPTION 'CANCEL_TOKEN_INVALID_OR_USED' USING ERRCODE='22023'; END IF;
 v_deadline:=coalesce(v_b.cancellation_deadline,
  (e.event_date+e.start_time) AT TIME ZONE 'Europe/Budapest'
  - coalesce(e.cancellation_hours,0)*interval '1 hour');
 v_late:=now()>v_deadline;
 UPDATE public.mass_bookings SET booking_status=CASE WHEN v_late THEN 'KÉSŐN LEMONDVA' ELSE 'LEMONDVA' END,
 cancelled_at=now(),cancellation_type=CASE WHEN v_late THEN 'KÉSŐI' ELSE 'IDŐBEN' END,
 cancellation_token='USED:'||p_cancellation_hash,updated_at=now() WHERE id=v_b.id;
 INSERT INTO public.mass_live_write_audit(source_workbook_id,operation,entity_type,entity_id,actor,payload)
 VALUES(e.source_workbook_id,'test.public_cancel','mass_booking',v_b.id,'trusted-gateway',
 jsonb_build_object('eventId',e.id,'late',v_late,'mailQueued',false,'offerQueued',false));
 RETURN jsonb_build_object('ok',true,'bookingId',v_b.id,'eventId',e.id,
  'late',v_late,'waitlistOfferQueued',false,'mailQueued',false);
END $fn$;

CREATE FUNCTION public.cc_vnext_mass_public_decide_v1(
 p_offer_hash text,p_action text,p_cancellation_hash text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE w public.mass_waitlist%rowtype;e public.mass_events%rowtype;
 v_id text;v_event_id text;v_action text:=lower(btrim(coalesce(p_action,'')));
 v_total int;v_new int;v_other_reserved int;v_booking_id text;v_start timestamptz;
 v_email text;
BEGIN
 IF v_action NOT IN ('accept','decline') THEN RAISE EXCEPTION 'OFFER_ACTION_INVALID' USING ERRCODE='22023'; END IF;
 IF p_offer_hash IS NULL OR p_offer_hash !~ '^sha256:[a-f0-9]{64}$'
 THEN RAISE EXCEPTION 'OFFER_TOKEN_HASH_INVALID' USING ERRCODE='22023'; END IF;
 IF v_action='accept' AND (p_cancellation_hash IS NULL OR p_cancellation_hash !~ '^sha256:[a-f0-9]{64}$')
 THEN RAISE EXCEPTION 'OFFER_ACCEPT_CANCEL_HASH_REQUIRED' USING ERRCODE='22023'; END IF;
 SELECT x.id,x.event_id,lower(coalesce(x.email,'')) INTO v_id,v_event_id,v_email FROM public.mass_waitlist x
 WHERE x.token_hash IN (p_offer_hash,'USED:'||p_offer_hash) LIMIT 1;
 IF v_id IS NULL OR v_email='' THEN RAISE EXCEPTION 'OFFER_TOKEN_INVALID' USING ERRCODE='22023'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('cc-mass-person:'||v_email,0));
 SELECT * INTO e FROM public.mass_events WHERE id=v_event_id FOR UPDATE;
 IF NOT FOUND OR upper(coalesce(e.session_type,''))='VERSENYSPORT'
 THEN RAISE EXCEPTION 'OFFER_EVENT_NOT_FOUND' USING ERRCODE='22023'; END IF;
 SELECT * INTO w FROM public.mass_waitlist WHERE id=v_id
 AND source_workbook_id=e.source_workbook_id FOR UPDATE;
 IF NOT FOUND OR lower(coalesce(w.email,''))<>v_email
 THEN RAISE EXCEPTION 'OFFER_ROW_CHANGED' USING ERRCODE='22023'; END IF;
 IF w.token_hash='USED:'||p_offer_hash AND w.waitlist_status IN ('ELFOGADVA','ELUTASÍTVA','LEJÁRT')
 THEN RETURN jsonb_build_object('ok',true,'already',true,'status',w.waitlist_status); END IF;
 IF w.token_hash<>p_offer_hash OR w.waitlist_status<>'HELY FELAJÁNLVA'
 THEN RAISE EXCEPTION 'OFFER_TOKEN_INACTIVE' USING ERRCODE='22023'; END IF;
 IF w.offer_expires_at IS NULL OR w.offer_expires_at<=now() THEN
  UPDATE public.mass_waitlist SET waitlist_status='LEJÁRT',
  token_hash='USED:'||p_offer_hash,updated_at=now() WHERE id=w.id;
  RETURN jsonb_build_object('ok',false,'expired',true,'status','LEJÁRT');
 END IF;
 IF v_action='decline' THEN
  UPDATE public.mass_waitlist SET waitlist_status='ELUTASÍTVA',
  token_hash='USED:'||p_offer_hash,updated_at=now() WHERE id=w.id;
  INSERT INTO public.mass_live_write_audit(source_workbook_id,operation,entity_type,entity_id,actor,payload)
  VALUES(e.source_workbook_id,'test.public_offer_decline','mass_waitlist',w.id,'trusted-gateway',
   jsonb_build_object('eventId',e.id,'mailQueued',false));
  RETURN jsonb_build_object('ok',true,'declined',true,'status','ELUTASÍTVA','mailQueued',false);
 END IF;
 v_start:=(e.event_date+e.start_time) AT TIME ZONE 'Europe/Budapest';
 IF e.active IS NOT TRUE OR e.public_registration_active IS NOT TRUE
 OR e.event_date IS NULL OR e.start_time IS NULL OR v_start<=now()+interval '2 hours'
 THEN RAISE EXCEPTION 'OFFER_ACCEPT_EVENT_CLOSED' USING ERRCODE='22023'; END IF;
 IF EXISTS(SELECT 1 FROM public.mass_bookings b WHERE b.source_workbook_id=e.source_workbook_id
 AND b.event_id=e.id AND lower(coalesce(b.email,''))=lower(coalesce(w.email,''))
 AND b.booking_status='AKTÍV')
 THEN RAISE EXCEPTION 'OFFER_ACCEPT_ALREADY_BOOKED' USING ERRCODE='23505'; END IF;
 IF EXISTS(SELECT 1 FROM public.mass_bookings b JOIN public.mass_events other
 ON other.source_workbook_id=b.source_workbook_id AND other.id=b.event_id
 WHERE b.source_workbook_id=e.source_workbook_id AND b.event_id<>e.id
 AND lower(coalesce(b.email,''))=lower(coalesce(w.email,''))
 AND b.booking_status='AKTÍV' AND other.event_date=e.event_date AND other.start_time=e.start_time)
 THEN RAISE EXCEPTION 'OFFER_ACCEPT_SAME_SLOT_CONFLICT' USING ERRCODE='23505'; END IF;
 IF p_cancellation_hash=p_offer_hash OR EXISTS(SELECT 1 FROM public.mass_bookings b
  WHERE b.cancellation_token=p_cancellation_hash)
 THEN RAISE EXCEPTION 'OFFER_ACCEPT_TOKEN_COLLISION' USING ERRCODE='23505'; END IF;
 SELECT count(*)::int,count(*) FILTER(WHERE upper(coalesce(b.capacity_bucket,'')) IN ('ÚJ','UJ')
 OR (coalesce(b.capacity_bucket,'')='' AND upper(coalesce(b.source,'')) IN ('ÚJ WEB','VÁRÓLISTA')))::int
 INTO v_total,v_new FROM public.mass_bookings b WHERE b.source_workbook_id=e.source_workbook_id
 AND b.event_id=e.id AND b.booking_status='AKTÍV';
 SELECT count(*)::int INTO v_other_reserved FROM public.mass_waitlist x
 WHERE x.source_workbook_id=e.source_workbook_id AND x.event_id=e.id AND x.id<>w.id
 AND x.waitlist_status='HELY FELAJÁNLVA' AND x.offer_expires_at>now();
 IF v_total+v_other_reserved>=greatest(coalesce(e.capacity,0),0)
 OR v_new+v_other_reserved>=greatest(coalesce(nullif(e.new_limit,0),e.capacity,0),0)
 THEN RAISE EXCEPTION 'OFFER_ACCEPT_CAPACITY_FULL' USING ERRCODE='22023'; END IF;
 v_booking_id:='CC-TEST-WAIT-BOOK-'||gen_random_uuid()::text;
 INSERT INTO public.mass_bookings(id,source_workbook_id,submitted_at,event_id,name,email,
 pass_number,source,pass_status,booking_status,attendance,cancellation_deadline,
 note,cancellation_token,capacity_bucket,migration_run_id,updated_at)
 VALUES(v_booking_id,e.source_workbook_id,now(),e.id,w.name,lower(w.email),w.pass_number,
 'VÁRÓLISTA',coalesce(w.pass_status,'ELLENŐRZÉSRE VÁR'),'AKTÍV',
 'NINCS RÖGZÍTVE',v_start-coalesce(e.cancellation_hours,0)*interval '1 hour',
 nullif(w.note,''),p_cancellation_hash,'ÚJ','CC-TEST-VNEXT',now());
 UPDATE public.mass_waitlist SET waitlist_status='ELFOGADVA',token_hash='USED:'||p_offer_hash,
 updated_at=now() WHERE id=w.id;
 INSERT INTO public.mass_live_write_audit(source_workbook_id,operation,entity_type,entity_id,actor,payload)
 VALUES(e.source_workbook_id,'test.public_offer_accept','mass_waitlist',w.id,'trusted-gateway',
 jsonb_build_object('eventId',e.id,'bookingId',v_booking_id,'mailQueued',false));
 RETURN jsonb_build_object('ok',true,'accepted',true,'status','ELFOGADVA',
 'bookingId',v_booking_id,'eventId',e.id,'mailQueued',false);
END $fn$;

REVOKE ALL ON FUNCTION public.cc_vnext_mass_public_book_v1(text,jsonb,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.cc_vnext_mass_public_wait_v1(text,jsonb) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.cc_vnext_mass_public_cancel_v1(text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.cc_vnext_mass_public_decide_v1(text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cc_vnext_mass_public_book_v1(text,jsonb,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.cc_vnext_mass_public_wait_v1(text,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.cc_vnext_mass_public_cancel_v1(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.cc_vnext_mass_public_decide_v1(text,text,text) TO service_role;
COMMIT;
SELECT p.proname,has_function_privilege('anon',p.oid,'execute') AS anon_execute,
 has_function_privilege('authenticated',p.oid,'execute') AS authenticated_execute,
 has_function_privilege('service_role',p.oid,'execute') AS service_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname IN ('cc_vnext_mass_public_book_v1',
 'cc_vnext_mass_public_wait_v1','cc_vnext_mass_public_cancel_v1',
 'cc_vnext_mass_public_decide_v1')
ORDER BY p.proname;