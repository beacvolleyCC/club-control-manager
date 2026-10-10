-- Stage-only migration. NOT DEPLOYED. Based on production definitions read 2026-10-10.
-- No changes to cancellation deadlines; admin RPCs unaffected.
-- The waitlist accept decision is guarded, but decline is not.
BEGIN;

CREATE OR REPLACE FUNCTION public.cc_mass_booking_create_v0550b4(p_workbook_id text, p_payload jsonb, p_actor text DEFAULT 'public'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id text := trim(coalesce(p_payload->>'id', ''));
  v_event_id text := trim(coalesce(p_payload->>'eventId', ''));
  v_email text := lower(trim(coalesce(p_payload->>'email', '')));
  v_pass text := trim(coalesce(p_payload->>'passNumber', ''));
  v_source text := trim(coalesce(p_payload->>'source', 'ÚJ WEB'));
  v_bucket text := upper(trim(coalesce(p_payload->>'capacityBucket', 'ÚJ')));
  v_event public.mass_events%rowtype;
  v_total_active integer := 0;
  v_new_active integer := 0;
  v_reserved integer := 0;
  v_total_limit integer := 0;
  v_new_limit integer := 0;
  v_total_free integer := 0;
  v_new_free integer := 0;
BEGIN
  IF v_id = '' OR v_event_id = '' OR v_email = '' THEN
    RAISE EXCEPTION 'BOOKING_REQUIRED_FIELDS_MISSING';
  END IF;

  -- Eventenként tranzakciós lock: két párhuzamos foglalás ne vihesse túl a limitet.
  PERFORM pg_advisory_xact_lock(hashtext(p_workbook_id || ':' || v_event_id));

  SELECT *
    INTO v_event
  FROM public.mass_events e
  WHERE e.source_workbook_id = p_workbook_id
    AND e.id = v_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'EVENT_NOT_FOUND';
  END IF;

  IF v_event.active IS NOT TRUE THEN
    RAISE EXCEPTION 'EVENT_INACTIVE';
  END IF;

  IF v_event.event_date IS NULL OR v_event.start_time IS NULL THEN
    RAISE EXCEPTION 'EVENT_DATETIME_INVALID';
  END IF;

  IF ((v_event.event_date + v_event.start_time) AT TIME ZONE 'Europe/Budapest') <= now() THEN
    RAISE EXCEPTION 'EVENT_ALREADY_STARTED';
  END IF;
  IF v_event.event_date IS NULL OR v_event.start_time IS NULL THEN RAISE EXCEPTION 'EVENT_DATETIME_INVALID'; END IF;
  IF ((v_event.event_date + v_event.start_time) AT TIME ZONE 'Europe/Budapest') <= now() + interval '2 hours' THEN
    RAISE EXCEPTION 'BOOKING_CLOSED_2H';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.mass_bookings b
    WHERE b.source_workbook_id = p_workbook_id
      AND b.event_id = v_event_id
      AND lower(coalesce(b.email,'')) = v_email
      AND b.booking_status = 'AKTÍV'
  ) THEN
    RAISE EXCEPTION 'DUPLICATE_EMAIL_BOOKING';
  END IF;

  IF upper(v_pass) <> 'ELSŐ EDZÉS'
     AND v_pass <> ''
     AND EXISTS (
       SELECT 1
       FROM public.mass_bookings b
       WHERE b.source_workbook_id = p_workbook_id
         AND b.event_id = v_event_id
         AND lower(coalesce(b.pass_number,'')) = lower(v_pass)
         AND b.booking_status = 'AKTÍV'
     ) THEN
    RAISE EXCEPTION 'DUPLICATE_PASS_BOOKING';
  END IF;

  SELECT count(*)
    INTO v_total_active
  FROM public.mass_bookings b
  WHERE b.source_workbook_id = p_workbook_id
    AND b.event_id = v_event_id
    AND b.booking_status = 'AKTÍV';

  SELECT count(*)
    INTO v_new_active
  FROM public.mass_bookings b
  WHERE b.source_workbook_id = p_workbook_id
    AND b.event_id = v_event_id
    AND b.booking_status = 'AKTÍV'
    AND (
      upper(coalesce(b.capacity_bucket,'')) IN ('ÚJ','UJ')
      OR (
        coalesce(b.capacity_bucket,'') = ''
        AND upper(coalesce(b.source,'')) IN ('ÚJ WEB','VÁRÓLISTA')
      )
    );

  SELECT count(*)
    INTO v_reserved
  FROM public.mass_waitlist w
  WHERE w.source_workbook_id = p_workbook_id
    AND w.event_id = v_event_id
    AND w.waitlist_status = 'HELY FELAJÁNLVA'
    AND w.offer_expires_at IS NOT NULL
    AND w.offer_expires_at > now();

  v_total_limit := GREATEST(COALESCE(v_event.capacity, 0), 0);
  v_new_limit := GREATEST(
    COALESCE(NULLIF(v_event.new_limit, 0), v_total_limit),
    0
  );

  IF v_total_active + v_reserved >= v_total_limit
     OR v_new_active + v_reserved >= v_new_limit THEN
    RAISE EXCEPTION 'CAPACITY_FULL';
  END IF;

  INSERT INTO public.mass_bookings (
    id,
    source_workbook_id,
    source_row,
    submitted_at,
    event_id,
    name,
    email,
    pass_number,
    source,
    pass_status,
    booking_status,
    attendance,
    cancellation_deadline,
    cancelled_at,
    cancellation_type,
    note,
    cancellation_token,
    capacity_bucket,
    athlete_id,
    legacy_row,
    migration_run_id,
    updated_at
  )
  VALUES (
    v_id,
    p_workbook_id,
    NULL,
    COALESCE(NULLIF(p_payload->>'submittedAt','')::timestamptz, now()),
    v_event_id,
    NULLIF(trim(coalesce(p_payload->>'name','')), ''),
    v_email,
    NULLIF(v_pass, ''),
    NULLIF(v_source, ''),
    NULLIF(trim(coalesce(p_payload->>'passStatus','')), ''),
    COALESCE(NULLIF(trim(coalesce(p_payload->>'bookingStatus','')), ''), 'AKTÍV'),
    COALESCE(NULLIF(trim(coalesce(p_payload->>'attendance','')), ''), 'NINCS RÖGZÍTVE'),
    NULLIF(p_payload->>'cancellationDeadline','')::timestamptz,
    NULLIF(p_payload->>'cancelledAt','')::timestamptz,
    NULLIF(trim(coalesce(p_payload->>'cancellationType','')), ''),
    NULLIF(coalesce(p_payload->>'note',''), ''),
    NULLIF(trim(coalesce(p_payload->>'cancellationToken','')), ''),
    COALESCE(NULLIF(trim(coalesce(p_payload->>'capacityBucket','')), ''), 'ÚJ'),
    NULLIF(trim(coalesce(p_payload->>'athleteId','')), ''),
    COALESCE(p_payload->'legacyRow', '{}'::jsonb),
    'LIVE-B4',
    now()
  );

  v_total_free := GREATEST(v_total_limit - v_total_active - v_reserved - 1, 0);
  v_new_free := GREATEST(v_new_limit - v_new_active - v_reserved - 1, 0);

  INSERT INTO public.mass_live_write_audit(
    source_workbook_id, operation, entity_type, entity_id, actor, payload
  )
  VALUES (
    p_workbook_id, 'create', 'mass_booking', v_id, nullif(trim(p_actor), ''), p_payload
  );

  RETURN jsonb_build_object(
    'ok', true,
    'bookingId', v_id,
    'remaining', LEAST(v_total_free, v_new_free)
  );
END
$function$;

CREATE OR REPLACE FUNCTION public.cc_mass_booking_create_v0550b41(p_workbook_id text, p_payload jsonb, p_actor text DEFAULT 'public'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_id text:=trim(coalesce(p_payload->>'id',''));
  v_event_id text:=trim(coalesce(p_payload->>'eventId',''));
  v_email text:=lower(trim(coalesce(p_payload->>'email','')));
  v_pass text:=trim(coalesce(p_payload->>'passNumber',''));
  v_source text:=trim(coalesce(p_payload->>'source','ÚJ WEB'));
  v_event public.mass_events%rowtype;
  v_total integer:=0;
  v_new integer:=0;
  v_reserved integer:=0;
  v_total_limit integer:=0;
  v_new_limit integer:=0;
begin
  if v_id='' or v_event_id='' or v_email='' then raise exception 'BOOKING_REQUIRED_FIELDS_MISSING'; end if;

  perform pg_advisory_xact_lock(hashtext(p_workbook_id || ':event:' || v_event_id));

  select * into v_event from public.mass_events e
  where e.source_workbook_id=p_workbook_id and e.id=v_event_id
  for update;

  if not found then raise exception 'EVENT_NOT_FOUND'; end if;
  if v_event.active is not true or v_event.public_registration_active is not true then raise exception 'EVENT_INACTIVE'; end if;
  if ((v_event.event_date+v_event.start_time) at time zone 'Europe/Budapest')<=now() then raise exception 'EVENT_ALREADY_STARTED'; end if;
  IF v_event.event_date IS NULL OR v_event.start_time IS NULL THEN RAISE EXCEPTION 'EVENT_DATETIME_INVALID'; END IF;
  IF ((v_event.event_date + v_event.start_time) AT TIME ZONE 'Europe/Budapest') <= now() + interval '2 hours' THEN
    RAISE EXCEPTION 'BOOKING_CLOSED_2H';
  END IF;

  if upper(v_source)='SPORT7' and upper(coalesce(v_event.session_type,''))<>'SPORT7' then raise exception 'REGISTRATION_MODE_MISMATCH'; end if;
  if upper(v_source)<>'SPORT7' and upper(coalesce(v_event.session_type,''))='SPORT7' then raise exception 'REGISTRATION_MODE_MISMATCH'; end if;

  if lower(coalesce(v_event.legacy_row->>'managerWaitlistOnly','false')) in ('true','1','igen','yes') then
    raise exception 'CAPACITY_FULL';
  end if;

  if exists(select 1 from public.mass_bookings b where b.source_workbook_id=p_workbook_id and b.event_id=v_event_id and lower(coalesce(b.email,''))=v_email and b.booking_status='AKTÍV') then raise exception 'DUPLICATE_EMAIL_BOOKING'; end if;

  if upper(v_pass)<>'ELSŐ EDZÉS' and v_pass<>'' and exists(select 1 from public.mass_bookings b where b.source_workbook_id=p_workbook_id and b.event_id=v_event_id and lower(coalesce(b.pass_number,''))=lower(v_pass) and b.booking_status='AKTÍV') then raise exception 'DUPLICATE_PASS_BOOKING'; end if;

  if exists(
    select 1 from public.mass_bookings b join public.mass_events e on e.source_workbook_id=b.source_workbook_id and e.id=b.event_id
    where b.source_workbook_id=p_workbook_id and lower(coalesce(b.email,''))=v_email and b.booking_status='AKTÍV' and b.event_id<>v_event_id and e.event_date=v_event.event_date and e.start_time=v_event.start_time
  ) or exists(
    select 1 from public.mass_waitlist w join public.mass_events e on e.source_workbook_id=w.source_workbook_id and e.id=w.event_id
    where w.source_workbook_id=p_workbook_id and lower(coalesce(w.email,''))=v_email and w.event_id<>v_event_id and w.waitlist_status in ('VÁRAKOZIK','HELY FELAJÁNLVA') and (w.waitlist_status<>'HELY FELAJÁNLVA' or w.offer_expires_at is null or w.offer_expires_at>now()) and e.event_date=v_event.event_date and e.start_time=v_event.start_time
  ) then raise exception 'SAME_SLOT_CONFLICT'; end if;

  select count(*)::integer into v_total from public.mass_bookings b where b.source_workbook_id=p_workbook_id and b.event_id=v_event_id and b.booking_status='AKTÍV';
  select count(*)::integer into v_new from public.mass_bookings b where b.source_workbook_id=p_workbook_id and b.event_id=v_event_id and b.booking_status='AKTÍV' and (upper(coalesce(b.capacity_bucket,'')) in ('ÚJ','UJ') or (coalesce(b.capacity_bucket,'')='' and upper(coalesce(b.source,'')) in ('ÚJ WEB','VÁRÓLISTA')));
  select count(*)::integer into v_reserved from public.mass_waitlist w where w.source_workbook_id=p_workbook_id and w.event_id=v_event_id and w.waitlist_status='HELY FELAJÁNLVA' and w.offer_expires_at is not null and w.offer_expires_at>now();

  v_total_limit:=greatest(coalesce(v_event.capacity,0),0);
  v_new_limit:=greatest(case when coalesce(v_event.new_limit,0)>0 then v_event.new_limit else v_total_limit end,0);
  if v_total+v_reserved>=v_total_limit or v_new+v_reserved>=v_new_limit then raise exception 'CAPACITY_FULL'; end if;

  insert into public.mass_bookings(
    id,source_workbook_id,source_row,submitted_at,event_id,name,email,pass_number,source,pass_status,booking_status,attendance,cancellation_deadline,cancelled_at,cancellation_type,note,cancellation_token,capacity_bucket,athlete_id,legacy_row,migration_run_id,updated_at
  ) values(
    v_id,p_workbook_id,null,coalesce(nullif(p_payload->>'submittedAt','')::timestamptz,now()),v_event_id,nullif(trim(coalesce(p_payload->>'name','')),''),v_email,nullif(v_pass,''),nullif(v_source,''),nullif(trim(coalesce(p_payload->>'passStatus','')),''),coalesce(nullif(trim(coalesce(p_payload->>'bookingStatus','')),''),'AKTÍV'),coalesce(nullif(trim(coalesce(p_payload->>'attendance','')),''),'NINCS RÖGZÍTVE'),nullif(p_payload->>'cancellationDeadline','')::timestamptz,null,null,nullif(coalesce(p_payload->>'note',''),''),nullif(trim(coalesce(p_payload->>'cancellationToken','')),''),coalesce(nullif(trim(coalesce(p_payload->>'capacityBucket','')),''),'ÚJ'),nullif(trim(coalesce(p_payload->>'athleteId','')),''),coalesce(p_payload->'legacyRow','{}'::jsonb),'LIVE-B4.1',now()
  );

  insert into public.mass_live_write_audit(source_workbook_id,operation,entity_type,entity_id,actor,payload)
  values(p_workbook_id,'create','mass_booking',v_id,nullif(trim(p_actor),''),p_payload);

  return jsonb_build_object('ok',true,'bookingId',v_id,'remaining',greatest(least(v_total_limit-v_total-v_reserved-1,v_new_limit-v_new-v_reserved-1),0));
end
$function$;

CREATE OR REPLACE FUNCTION public.cc_mass_waitlist_decide_v0550b41(p_workbook_id text, p_token_hash text, p_action text, p_booking_payload jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_w public.mass_waitlist%rowtype;
  v_event public.mass_events%rowtype;
  v_action text := lower(trim(coalesce(p_action,'')));
  v_used boolean := false;
  v_booking_id text;
  v_cancel_hash text;
  v_note text;
  v_total integer := 0;
  v_new integer := 0;
  v_total_limit integer := 0;
  v_new_limit integer := 0;
  v_deadline timestamptz;
BEGIN
  IF v_action NOT IN ('accept','decline') THEN RAISE EXCEPTION 'WAITLIST_ACTION_INVALID'; END IF;

  SELECT * INTO v_w
  FROM public.mass_waitlist w
  WHERE w.source_workbook_id=p_workbook_id
    AND (w.token_hash=p_token_hash OR w.token_hash='USED:'||p_token_hash)
  LIMIT 1 FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'WAITLIST_TOKEN_INVALID'; END IF;
  v_used := left(coalesce(v_w.token_hash,''),5)='USED:';

  IF v_used THEN
    RETURN jsonb_build_object('ok',v_w.waitlist_status IN ('ELFOGADVA','ELUTASÍTVA'),'already',true,'status',v_w.waitlist_status,'trainingId',v_w.event_id);
  END IF;

  IF v_w.waitlist_status<>'HELY FELAJÁNLVA' THEN RAISE EXCEPTION 'WAITLIST_OFFER_INACTIVE'; END IF;
  IF v_w.offer_expires_at IS NULL OR v_w.offer_expires_at<=now() THEN
    UPDATE public.mass_waitlist SET waitlist_status='LEJÁRT',token_hash='USED:'||p_token_hash,migration_run_id='LIVE-B4.1',updated_at=now() WHERE id=v_w.id;
    RETURN jsonb_build_object('ok',false,'expired',true,'status','LEJÁRT','trainingId',v_w.event_id);
  END IF;

  IF v_action='decline' THEN
    UPDATE public.mass_waitlist SET waitlist_status='ELUTASÍTVA',token_hash='USED:'||p_token_hash,migration_run_id='LIVE-B4.1',updated_at=now() WHERE id=v_w.id;
    RETURN jsonb_build_object('ok',true,'declined',true,'status','ELUTASÍTVA','trainingId',v_w.event_id);
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_workbook_id || ':event:' || v_w.event_id));
  SELECT * INTO v_event FROM public.mass_events e
  WHERE e.source_workbook_id=p_workbook_id AND e.id=v_w.event_id
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'EVENT_NOT_FOUND'; END IF;
  IF v_event.active IS NOT TRUE OR v_event.public_registration_active IS NOT TRUE THEN RAISE EXCEPTION 'EVENT_INACTIVE'; END IF;
  IF ((v_event.event_date+v_event.start_time) AT TIME ZONE 'Europe/Budapest')<=now() THEN RAISE EXCEPTION 'EVENT_ALREADY_STARTED'; END IF;
  IF v_event.event_date IS NULL OR v_event.start_time IS NULL THEN RAISE EXCEPTION 'EVENT_DATETIME_INVALID'; END IF;
  IF ((v_event.event_date + v_event.start_time) AT TIME ZONE 'Europe/Budapest') <= now() + interval '2 hours' THEN
    RAISE EXCEPTION 'BOOKING_CLOSED_2H';
  END IF;

  IF EXISTS(SELECT 1 FROM public.mass_bookings b WHERE b.source_workbook_id=p_workbook_id AND b.event_id=v_w.event_id AND lower(coalesce(b.email,''))=lower(coalesce(v_w.email,'')) AND b.booking_status='AKTÍV') THEN
    UPDATE public.mass_waitlist SET waitlist_status='ELFOGADVA',token_hash='USED:'||p_token_hash,migration_run_id='LIVE-B4.1',updated_at=now() WHERE id=v_w.id;
    RETURN jsonb_build_object('ok',true,'alreadyBooked',true,'status','ELFOGADVA','trainingId',v_w.event_id);
  END IF;

  SELECT count(*)::integer INTO v_total FROM public.mass_bookings b
  WHERE b.source_workbook_id=p_workbook_id AND b.event_id=v_w.event_id AND b.booking_status='AKTÍV';
  SELECT count(*)::integer INTO v_new FROM public.mass_bookings b
  WHERE b.source_workbook_id=p_workbook_id AND b.event_id=v_w.event_id AND b.booking_status='AKTÍV'
    AND (upper(coalesce(b.capacity_bucket,'')) IN ('ÚJ','UJ') OR (coalesce(b.capacity_bucket,'')='' AND upper(coalesce(b.source,'')) IN ('ÚJ WEB','VÁRÓLISTA')));

  v_total_limit:=greatest(coalesce(v_event.capacity,0),0);
  v_new_limit:=greatest(CASE WHEN coalesce(v_event.new_limit,0)>0 THEN v_event.new_limit ELSE v_total_limit END,0);
  IF v_total>=v_total_limit OR v_new>=v_new_limit THEN RAISE EXCEPTION 'CAPACITY_FULL'; END IF;

  v_booking_id:=trim(coalesce(p_booking_payload->>'id',''));
  v_cancel_hash:=trim(coalesce(p_booking_payload->>'cancellationToken',''));
  v_note:=coalesce(p_booking_payload->>'note','');
  IF v_booking_id='' OR v_cancel_hash='' THEN RAISE EXCEPTION 'BOOKING_REQUIRED_FIELDS_MISSING'; END IF;

  v_deadline:=((v_event.event_date+v_event.start_time) AT TIME ZONE 'Europe/Budapest') - (coalesce(v_event.cancellation_hours,0)::double precision * interval '1 hour');

  INSERT INTO public.mass_bookings(
    id,source_workbook_id,submitted_at,event_id,name,email,pass_number,source,pass_status,booking_status,
    attendance,cancellation_deadline,note,cancellation_token,capacity_bucket,legacy_row,migration_run_id,updated_at
  ) VALUES (
    v_booking_id,p_workbook_id,now(),v_w.event_id,v_w.name,lower(v_w.email),v_w.pass_number,'VÁRÓLISTA',
    coalesce(NULLIF(p_booking_payload->>'passStatus',''),v_w.pass_status),'AKTÍV','NINCS RÖGZÍTVE',v_deadline,
    nullif(v_note,''),v_cancel_hash,'ÚJ','{}'::jsonb,'LIVE-B4.1',now()
  );

  UPDATE public.mass_waitlist
  SET pass_status=coalesce(NULLIF(p_booking_payload->>'passStatus',''),pass_status),waitlist_status='ELFOGADVA',
      token_hash='USED:'||p_token_hash,migration_run_id='LIVE-B4.1',updated_at=now()
  WHERE id=v_w.id;

  RETURN jsonb_build_object(
    'ok',true,'accepted',true,'status','ELFOGADVA','trainingId',v_w.event_id,'bookingId',v_booking_id,
    'cancellationDeadline',v_deadline
  );
END
$function$;

CREATE OR REPLACE FUNCTION public.cc_mass_waitlist_join_v0550b4(p_workbook_id text, p_payload jsonb, p_actor text DEFAULT 'public'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id text := trim(coalesce(p_payload->>'id', ''));
  v_event_id text := trim(coalesce(p_payload->>'eventId', ''));
  v_email text := lower(trim(coalesce(p_payload->>'email', '')));
  v_event public.mass_events%rowtype;
BEGIN
  IF v_id = '' OR v_event_id = '' OR v_email = '' THEN
    RAISE EXCEPTION 'WAITLIST_REQUIRED_FIELDS_MISSING';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_workbook_id || ':wait:' || v_event_id));

  SELECT *
    INTO v_event
  FROM public.mass_events e
  WHERE e.source_workbook_id = p_workbook_id
    AND e.id = v_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'EVENT_NOT_FOUND';
  END IF;

  IF v_event.active IS NOT TRUE THEN
    RAISE EXCEPTION 'EVENT_INACTIVE';
  END IF;
  IF v_event.event_date IS NULL OR v_event.start_time IS NULL THEN RAISE EXCEPTION 'EVENT_DATETIME_INVALID'; END IF;
  IF ((v_event.event_date + v_event.start_time) AT TIME ZONE 'Europe/Budapest') <= now() + interval '2 hours' THEN
    RAISE EXCEPTION 'BOOKING_CLOSED_2H';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.mass_waitlist w
    WHERE w.source_workbook_id = p_workbook_id
      AND w.event_id = v_event_id
      AND lower(coalesce(w.email,'')) = v_email
      AND w.waitlist_status IN ('VÁRAKOZIK','HELY FELAJÁNLVA')
  ) THEN
    RAISE EXCEPTION 'WAITLIST_DUPLICATE_EMAIL';
  END IF;

  INSERT INTO public.mass_waitlist (
    id,
    source_workbook_id,
    source_row,
    submitted_at,
    event_id,
    name,
    email,
    pass_number,
    pass_status,
    waitlist_status,
    offered_at,
    offer_expires_at,
    token_hash,
    note,
    legacy_row,
    migration_run_id,
    updated_at
  )
  VALUES (
    v_id,
    p_workbook_id,
    NULL,
    COALESCE(NULLIF(p_payload->>'submittedAt','')::timestamptz, now()),
    v_event_id,
    NULLIF(trim(coalesce(p_payload->>'name','')), ''),
    v_email,
    NULLIF(trim(coalesce(p_payload->>'passNumber','')), ''),
    NULLIF(trim(coalesce(p_payload->>'passStatus','')), ''),
    COALESCE(NULLIF(trim(coalesce(p_payload->>'waitlistStatus','')), ''), 'VÁRAKOZIK'),
    NULLIF(p_payload->>'offeredAt','')::timestamptz,
    NULLIF(p_payload->>'offerExpiresAt','')::timestamptz,
    NULLIF(trim(coalesce(p_payload->>'tokenHash','')), ''),
    NULLIF(coalesce(p_payload->>'note',''), ''),
    COALESCE(p_payload->'legacyRow', '{}'::jsonb),
    'LIVE-B4',
    now()
  );

  INSERT INTO public.mass_live_write_audit(
    source_workbook_id, operation, entity_type, entity_id, actor, payload
  )
  VALUES (
    p_workbook_id, 'create', 'mass_waitlist', v_id, nullif(trim(p_actor), ''), p_payload
  );

  RETURN jsonb_build_object('ok', true, 'waitlistId', v_id);
END
$function$;

CREATE OR REPLACE FUNCTION public.cc_mass_waitlist_join_v0550b41(p_workbook_id text, p_payload jsonb, p_actor text DEFAULT 'public'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_id text:=trim(coalesce(p_payload->>'id',''));
  v_event_id text:=trim(coalesce(p_payload->>'eventId',''));
  v_email text:=lower(trim(coalesce(p_payload->>'email','')));
  v_event public.mass_events%rowtype;
  v_total integer:=0;
  v_new integer:=0;
  v_reserved integer:=0;
  v_wait_count integer:=0;
  v_total_limit integer:=0;
  v_new_limit integer:=0;
  v_position integer:=0;
  v_waitlist_only boolean:=false;
begin
  if v_id='' or v_event_id='' or v_email='' then raise exception 'WAITLIST_REQUIRED_FIELDS_MISSING'; end if;

  perform pg_advisory_xact_lock(hashtext(p_workbook_id || ':event:' || v_event_id));

  select * into v_event from public.mass_events e where e.source_workbook_id=p_workbook_id and e.id=v_event_id for update;
  if not found then raise exception 'EVENT_NOT_FOUND'; end if;
  if v_event.active is not true or v_event.public_registration_active is not true then raise exception 'EVENT_INACTIVE'; end if;
  if ((v_event.event_date+v_event.start_time) at time zone 'Europe/Budapest')<=now() then raise exception 'EVENT_ALREADY_STARTED'; end if;
  IF v_event.event_date IS NULL OR v_event.start_time IS NULL THEN RAISE EXCEPTION 'EVENT_DATETIME_INVALID'; END IF;
  IF ((v_event.event_date + v_event.start_time) AT TIME ZONE 'Europe/Budapest') <= now() + interval '2 hours' THEN
    RAISE EXCEPTION 'BOOKING_CLOSED_2H';
  END IF;

  if upper(trim(coalesce(p_payload->>'passNumber','')))='SPORT7' and upper(coalesce(v_event.session_type,''))<>'SPORT7' then raise exception 'REGISTRATION_MODE_MISMATCH'; end if;
  if upper(trim(coalesce(p_payload->>'passNumber','')))<>'SPORT7' and upper(coalesce(v_event.session_type,''))='SPORT7' then raise exception 'REGISTRATION_MODE_MISMATCH'; end if;

  if exists(select 1 from public.mass_bookings b where b.source_workbook_id=p_workbook_id and b.event_id=v_event_id and lower(coalesce(b.email,''))=v_email and b.booking_status='AKTÍV') then raise exception 'DUPLICATE_EMAIL_BOOKING'; end if;
  if exists(select 1 from public.mass_waitlist w where w.source_workbook_id=p_workbook_id and w.event_id=v_event_id and lower(coalesce(w.email,''))=v_email and w.waitlist_status in ('VÁRAKOZIK','HELY FELAJÁNLVA') and (w.waitlist_status<>'HELY FELAJÁNLVA' or w.offer_expires_at is null or w.offer_expires_at>now())) then raise exception 'WAITLIST_DUPLICATE_EMAIL'; end if;

  if exists(
    select 1 from public.mass_bookings b join public.mass_events e on e.source_workbook_id=b.source_workbook_id and e.id=b.event_id
    where b.source_workbook_id=p_workbook_id and lower(coalesce(b.email,''))=v_email and b.booking_status='AKTÍV' and b.event_id<>v_event_id and e.event_date=v_event.event_date and e.start_time=v_event.start_time
  ) or exists(
    select 1 from public.mass_waitlist w join public.mass_events e on e.source_workbook_id=w.source_workbook_id and e.id=w.event_id
    where w.source_workbook_id=p_workbook_id and lower(coalesce(w.email,''))=v_email and w.event_id<>v_event_id and w.waitlist_status in ('VÁRAKOZIK','HELY FELAJÁNLVA') and (w.waitlist_status<>'HELY FELAJÁNLVA' or w.offer_expires_at is null or w.offer_expires_at>now()) and e.event_date=v_event.event_date and e.start_time=v_event.start_time
  ) then raise exception 'SAME_SLOT_CONFLICT'; end if;

  select count(*)::integer into v_wait_count from public.mass_waitlist w where w.source_workbook_id=p_workbook_id and w.event_id=v_event_id and w.waitlist_status in ('VÁRAKOZIK','HELY FELAJÁNLVA') and (w.waitlist_status<>'HELY FELAJÁNLVA' or w.offer_expires_at is null or w.offer_expires_at>now());
  if v_wait_count>=5 then raise exception 'WAITLIST_FULL'; end if;

  select count(*)::integer into v_total from public.mass_bookings b where b.source_workbook_id=p_workbook_id and b.event_id=v_event_id and b.booking_status='AKTÍV';
  select count(*)::integer into v_new from public.mass_bookings b where b.source_workbook_id=p_workbook_id and b.event_id=v_event_id and b.booking_status='AKTÍV' and (upper(coalesce(b.capacity_bucket,'')) in ('ÚJ','UJ') or (coalesce(b.capacity_bucket,'')='' and upper(coalesce(b.source,'')) in ('ÚJ WEB','VÁRÓLISTA')));
  select count(*)::integer into v_reserved from public.mass_waitlist w where w.source_workbook_id=p_workbook_id and w.event_id=v_event_id and w.waitlist_status='HELY FELAJÁNLVA' and w.offer_expires_at is not null and w.offer_expires_at>now();

  v_total_limit:=greatest(coalesce(v_event.capacity,0),0);
  v_new_limit:=greatest(case when coalesce(v_event.new_limit,0)>0 then v_event.new_limit else v_total_limit end,0);
  v_waitlist_only:=lower(coalesce(v_event.legacy_row->>'managerWaitlistOnly','false')) in ('true','1','igen','yes');

  if not v_waitlist_only and v_total+v_reserved<v_total_limit and v_new+v_reserved<v_new_limit then
    raise exception 'CAPACITY_AVAILABLE';
  end if;

  insert into public.mass_waitlist(
    id,source_workbook_id,source_row,submitted_at,event_id,name,email,pass_number,pass_status,waitlist_status,offered_at,offer_expires_at,token_hash,note,legacy_row,migration_run_id,updated_at
  ) values(
    v_id,p_workbook_id,null,coalesce(nullif(p_payload->>'submittedAt','')::timestamptz,now()),v_event_id,nullif(trim(coalesce(p_payload->>'name','')),''),v_email,nullif(trim(coalesce(p_payload->>'passNumber','')),''),nullif(trim(coalesce(p_payload->>'passStatus','')),''),'VÁRAKOZIK',null,null,null,nullif(coalesce(p_payload->>'note',''),''),coalesce(p_payload->'legacyRow','{}'::jsonb),'LIVE-B4.1',now()
  );

  select count(*)::integer into v_position from public.mass_waitlist w
  where w.source_workbook_id=p_workbook_id and w.event_id=v_event_id and w.waitlist_status in ('VÁRAKOZIK','HELY FELAJÁNLVA')
    and (w.submitted_at < (select submitted_at from public.mass_waitlist where id=v_id)
      or (w.submitted_at=(select submitted_at from public.mass_waitlist where id=v_id) and w.id<=v_id));

  insert into public.mass_live_write_audit(source_workbook_id,operation,entity_type,entity_id,actor,payload)
  values(p_workbook_id,'create','mass_waitlist',v_id,nullif(trim(p_actor),''),p_payload);

  return jsonb_build_object('ok',true,'waitlistId',v_id,'position',v_position);
end
$function$;

COMMIT;
