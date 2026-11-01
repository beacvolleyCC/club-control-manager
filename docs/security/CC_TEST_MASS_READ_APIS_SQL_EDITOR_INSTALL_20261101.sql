-- CC / BEAC · isolated TEST mass-sport legacy-compatible READ APIs · 2026-11-01
-- For the TEST SQL Editor only, NOT for LIVE. No public table grants or writes to business data.
-- The original LIVE read signatures/payloads are preserved, with fixed search_path.
BEGIN;
DO $test_environment$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.events WHERE legacy_manager_id='cc_test_bb2_rsvp_20261106')
     OR EXISTS(SELECT 1 FROM public.mass_events)
     OR EXISTS(SELECT 1 FROM public.mass_passes)
  THEN RAISE EXCEPTION 'CC_TEST_MASS_INSTALL_WRONG_PROJECT_OR_NONEMPTY_SOURCE_ABORT'
    USING ERRCODE='42501'; END IF;
  IF EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname IN ('cc_manager_mass_calendar_v1','cc_manager_mass_trainings_v1','cc_manager_mass_training_history_v1','cc_manager_mass_athletes_v1','cc_manager_mass_passes_v1','cc_manager_mass_event_detail_v1','cc_manager_mass_attendance_snapshot_r1_v1','cc_manager_mass_cancellations_v1'))
  THEN RAISE EXCEPTION 'CC_TEST_MASS_API_ALREADY_EXISTS_REVIEW_BEFORE_INSTALL' USING ERRCODE='22023'; END IF;
END
$test_environment$;

-- cc_manager_mass_athletes_v1: authorized Manager read-only compatibility function.
CREATE FUNCTION public.cc_manager_mass_athletes_v1(p_query text DEFAULT ''::text, p_level text DEFAULT ''::text, p_status text DEFAULT ''::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_q text:=lower(trim(coalesce(p_query,'')));
  v_level text:=trim(coalesce(p_level,''));
  v_status text:=trim(coalesce(p_status,''));
  v_month text:=to_char((now() at time zone 'Europe/Budapest')::date,'YYYY-MM');
  v_result jsonb;
begin
  perform private.cc_manager_require_any_v1('mass.athletes','view');

  with rows as (
    select
      a.*,
      coalesce(nullif(trim(a.level_override),''),nullif(trim(a.level),''),'') as effective_level,
      p.pass_number,p.product,p.valid_month,p.purchase_date,
      coalesce(stats.total_bookings,0) as total_bookings,
      coalesce(stats.active_bookings,0) as active_bookings,
      coalesce(stats.attendance_recorded,0) as attendance_recorded,
      stats.last_booking_at
    from public.mass_athletes a
    left join lateral (
      select mp.*
      from public.mass_passes mp
      where mp.source_workbook_id=a.source_workbook_id
        and lower(coalesce(mp.email,''))=lower(coalesce(a.email,''))
      order by (mp.valid_month=v_month) desc,mp.purchase_date desc nulls last,mp.updated_at desc
      limit 1
    ) p on true
    left join lateral (
      select
        count(*)::int as total_bookings,
        count(*) filter (where mb.booking_status='AKTÍV')::int as active_bookings,
        count(*) filter (where nullif(trim(coalesce(mb.attendance,'')),'') is not null)::int as attendance_recorded,
        max(mb.submitted_at) as last_booking_at
      from public.mass_bookings mb
      where mb.source_workbook_id=a.source_workbook_id
        and (mb.athlete_id=a.id or (coalesce(a.email,'')<>'' and lower(coalesce(mb.email,''))=lower(a.email)))
    ) stats on true
  ), filtered as (
    select * from rows r
    where (v_level='' or r.effective_level=v_level)
      and (v_status='' or coalesce(r.status,'')=v_status)
      and (
        v_q=''
        or lower(coalesce(r.name,'')) like '%'||v_q||'%'
        or lower(coalesce(r.email,'')) like '%'||v_q||'%'
        or lower(coalesce(r.pass_number,'')) like '%'||v_q||'%'
        or lower(coalesce(r.effective_level,'')) like '%'||v_q||'%'
      )
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'athleteId',id,
    'name',coalesce(name,''),
    'email',coalesce(email,''),
    'level',coalesce(level,''),
    'levelOverride',coalesce(level_override,''),
    'effectiveLevel',coalesce(effective_level,''),
    'status',coalesce(status,''),
    'firstTrainingDate',first_training_date,
    'note',coalesce(note,''),
    'currentPassNumber',coalesce(pass_number,''),
    'currentPassProduct',coalesce(product,''),
    'currentPassMonth',coalesce(valid_month,''),
    'currentPassIsCurrentMonth',(coalesce(valid_month,'')=v_month),
    'totalBookings',total_bookings,
    'activeBookings',active_bookings,
    'attendanceRecorded',attendance_recorded,
    'lastBookingAt',last_booking_at,
    'updatedAt',updated_at
  ) order by lower(coalesce(name,'')),lower(coalesce(email,''))),'[]'::jsonb)
  into v_result
  from filtered;

  return v_result;
end
$function$;
REVOKE ALL ON FUNCTION public.cc_manager_mass_athletes_v1(text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_mass_athletes_v1(text,text,text) TO authenticated;

-- cc_manager_mass_attendance_snapshot_r1_v1: authorized Manager read-only compatibility function.
CREATE FUNCTION public.cc_manager_mass_attendance_snapshot_r1_v1(p_event_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_manager_id uuid;
  v_event_id text := trim(coalesce(p_event_id,''));
BEGIN
  v_manager_id := private.cc_manager_require_any_v1('mass.trainings','view');

  IF v_event_id='' THEN
    RAISE EXCEPTION 'EVENT_ID_REQUIRED';
  END IF;

  RETURN (
    SELECT coalesce(
      jsonb_agg(
        jsonb_build_object(
          'bookingId',b.id,
          'eventId',b.event_id,
          'attendance',coalesce(nullif(trim(b.attendance),''),'NINCS RÖGZÍTVE'),
          'bookingStatus',coalesce(b.booking_status,''),
          'updatedAt',b.updated_at
        )
        ORDER BY lower(coalesce(b.name,'')),b.id
      ),
      '[]'::jsonb
    )
    FROM public.mass_bookings b
    WHERE b.event_id=v_event_id
      AND coalesce(b.booking_status,'') NOT IN ('LEMONDVA','KÉSŐN LEMONDVA')
  );
END
$function$;
REVOKE ALL ON FUNCTION public.cc_manager_mass_attendance_snapshot_r1_v1(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_mass_attendance_snapshot_r1_v1(text) TO authenticated;

-- cc_manager_mass_calendar_v1: authorized Manager read-only compatibility function.
CREATE FUNCTION public.cc_manager_mass_calendar_v1(p_from date DEFAULT CURRENT_DATE, p_to date DEFAULT (CURRENT_DATE + 120))
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_result jsonb;
begin
  perform private.cc_manager_require_any_v1('mass.calendar','view');

  with scoped as (
    select e.*
    from public.mass_events e
    where e.event_date >= coalesce(p_from,current_date)
      and e.event_date <= coalesce(p_to,current_date+120)
      and upper(coalesce(e.session_type,'')) <> 'VERSENYSPORT'
  ), bc as (
    select b.event_id,
      count(*) filter (where b.booking_status='AKTÍV')::int as active_count
    from public.mass_bookings b
    join scoped s on s.id=b.event_id
    group by b.event_id
  ), wc as (
    select w.event_id,
      count(*) filter (
        where w.waitlist_status in ('VÁRAKOZIK','HELY FELAJÁNLVA')
          and (w.waitlist_status<>'HELY FELAJÁNLVA' or w.offer_expires_at is null or w.offer_expires_at>now())
      )::int as wait_count
    from public.mass_waitlist w
    join scoped s on s.id=w.event_id
    group by w.event_id
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'eventId',s.id,
    'eventDate',s.event_date,
    'startsAt',((s.event_date+s.start_time) at time zone 'Europe/Budapest'),
    'endsAt',case when s.end_time is null then null else ((s.event_date+s.end_time) at time zone 'Europe/Budapest') end,
    'eventType','training',
    'title',coalesce(s.level,'Edzés'),
    'teamName',coalesce(s.level,'Edzés'),
    'level',coalesce(s.level,''),
    'court',coalesce(s.court,''),
    'venue','',
    'sessionType',coalesce(s.session_type,''),
    'color',coalesce(s.color,''),
    'capacity',coalesce(s.capacity,0),
    'totalActive',coalesce(bc.active_count,0),
    'waitlistCount',coalesce(wc.wait_count,0),
    'publicRegistrationActive',coalesce(s.public_registration_active,false),
    'registrationMode',case when lower(coalesce(s.legacy_row->>'managerWaitlistOnly','false')) in ('true','1','igen','yes') then 'WAITLIST_ONLY' else 'OPEN' end,
    'active',coalesce(s.active,false)
  ) order by s.event_date,s.start_time,s.id),'[]'::jsonb)
  into v_result
  from scoped s
  left join bc on bc.event_id=s.id
  left join wc on wc.event_id=s.id;

  return v_result;
end
$function$;
REVOKE ALL ON FUNCTION public.cc_manager_mass_calendar_v1(date,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_mass_calendar_v1(date,date) TO authenticated;

-- cc_manager_mass_cancellations_v1: authorized Manager read-only compatibility function.
CREATE FUNCTION public.cc_manager_mass_cancellations_v1(p_event_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_event public.mass_events%rowtype;
  v_result jsonb;
begin
  perform private.cc_manager_require_any_v1('mass.trainings','view');

  select e.* into v_event
    from public.mass_events e
   where e.id=btrim(coalesce(p_event_id,''))
     and upper(coalesce(e.session_type,'')) <> 'VERSENYSPORT'
   limit 1;
  if not found then
    raise exception 'MASS_EVENT_NOT_FOUND';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',b.id,
    'name',coalesce(b.name,''),
    'email',coalesce(b.email,''),
    'bookingStatus',b.booking_status,
    'cancellationType',coalesce(b.cancellation_type,''),
    'cancelledAt',b.cancelled_at
  ) order by b.cancelled_at desc nulls last,b.id desc),'[]'::jsonb)
    into v_result
    from public.mass_bookings b
   where b.source_workbook_id=v_event.source_workbook_id
     and b.event_id=v_event.id
     and b.booking_status in ('LEMONDVA','KÉSŐN LEMONDVA');

  return v_result;
end;
$function$;
REVOKE ALL ON FUNCTION public.cc_manager_mass_cancellations_v1(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_mass_cancellations_v1(text) TO authenticated;

-- cc_manager_mass_event_detail_v1: authorized Manager read-only compatibility function.
CREATE FUNCTION public.cc_manager_mass_event_detail_v1(p_event_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_manager_id uuid;
  v_event public.mass_events%rowtype;
  v_result jsonb;
begin
  v_manager_id:=private.cc_manager_require_any_v1('mass.trainings','view');

  select * into v_event from public.mass_events e
  where e.id=trim(coalesce(p_event_id,''))
    and upper(coalesce(e.session_type,''))<>'VERSENYSPORT'
  limit 1;
  if not found then raise exception 'MASS_EVENT_NOT_FOUND'; end if;

  select jsonb_build_object(
    'event',jsonb_build_object(
      'eventId',v_event.id,
      'eventDate',v_event.event_date,
      'startsAt',((v_event.event_date+v_event.start_time) at time zone 'Europe/Budapest'),
      'endsAt',case when v_event.end_time is null then null else ((v_event.event_date+v_event.end_time) at time zone 'Europe/Budapest') end,
      'level',coalesce(v_event.level,''),
      'court',coalesce(v_event.court,''),
      'capacity',coalesce(v_event.capacity,0),
      'newLimit',case when coalesce(v_event.new_limit,0)>0 then v_event.new_limit else coalesce(v_event.capacity,0) end,
      'cancellationHours',coalesce(v_event.cancellation_hours,0),
      'publicRegistrationActive',coalesce(v_event.public_registration_active,false),
      'registrationMode',case when lower(coalesce(v_event.legacy_row->>'managerWaitlistOnly','false')) in ('true','1','igen','yes') then 'WAITLIST_ONLY' else 'OPEN' end,
      'sessionType',coalesce(v_event.session_type,''),
      'color',coalesce(v_event.color,''),
      'active',v_event.active
    ),
    'bookings',coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',b.id,'submittedAt',b.submitted_at,'name',coalesce(b.name,''),'email',coalesce(b.email,''),
        'passNumber',coalesce(b.pass_number,''),'source',coalesce(b.source,''),'passStatus',coalesce(b.pass_status,''),
        'bookingStatus',coalesce(b.booking_status,''),'attendance',coalesce(b.attendance,''),
        'cancellationDeadline',b.cancellation_deadline,'note',coalesce(b.note,'')
      ) order by b.submitted_at,b.name)
      from public.mass_bookings b
      where b.source_workbook_id=v_event.source_workbook_id and b.event_id=v_event.id
        and b.booking_status='AKTÍV'
    ),'[]'::jsonb),
    'waitlist',coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',w.id,'submittedAt',w.submitted_at,'name',coalesce(w.name,''),'email',coalesce(w.email,''),
        'passNumber',coalesce(w.pass_number,''),'passStatus',coalesce(w.pass_status,''),
        'status',coalesce(w.waitlist_status,''),'offeredAt',w.offered_at,'expires',w.offer_expires_at,'note',coalesce(w.note,'')
      ) order by w.submitted_at,w.id)
      from public.mass_waitlist w
      where w.source_workbook_id=v_event.source_workbook_id and w.event_id=v_event.id
        and w.waitlist_status in ('VÁRAKOZIK','HELY FELAJÁNLVA')
    ),'[]'::jsonb)
  ) into v_result;

  return v_result;
end
$function$;
REVOKE ALL ON FUNCTION public.cc_manager_mass_event_detail_v1(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_mass_event_detail_v1(text) TO authenticated;

-- cc_manager_mass_passes_v1: authorized Manager read-only compatibility function.
CREATE FUNCTION public.cc_manager_mass_passes_v1(p_query text DEFAULT ''::text, p_month text DEFAULT ''::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_q text:=lower(trim(coalesce(p_query,'')));
  v_month_filter text:=trim(coalesce(p_month,''));
  v_current_month text:=to_char((now() at time zone 'Europe/Budapest')::date,'YYYY-MM');
  v_result jsonb;
begin
  perform private.cc_manager_require_any_v1('mass.passes','view');

  with rows as (
    select
      p.*,
      coalesce(a.name,'') as athlete_name
    from public.mass_passes p
    left join lateral (
      select ma.name
      from public.mass_athletes ma
      where ma.source_workbook_id=p.source_workbook_id
        and lower(coalesce(ma.email,''))=lower(coalesce(p.email,''))
      order by ma.updated_at desc
      limit 1
    ) a on true
    where (v_month_filter='' or coalesce(p.valid_month,'')=v_month_filter)
      and (
        v_q=''
        or lower(coalesce(p.pass_number,'')) like '%'||v_q||'%'
        or lower(coalesce(p.email,'')) like '%'||v_q||'%'
        or lower(coalesce(p.product,'')) like '%'||v_q||'%'
        or lower(coalesce(p.pass_group,'')) like '%'||v_q||'%'
        or lower(coalesce(a.name,'')) like '%'||v_q||'%'
      )
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'passNumber',pass_number,
    'product',coalesce(product,''),
    'passGroup',coalesce(pass_group,''),
    'email',coalesce(email,''),
    'athleteName',athlete_name,
    'purchaseDate',purchase_date,
    'validMonth',coalesce(valid_month,''),
    'currentMonth',(coalesce(valid_month,'')=v_current_month),
    'season',coalesce(season,''),
    'importedAt',imported_at,
    'updatedAt',updated_at
  ) order by purchase_date desc nulls last,lower(coalesce(email,'')),pass_number),'[]'::jsonb)
  into v_result
  from rows;

  return v_result;
end
$function$;
REVOKE ALL ON FUNCTION public.cc_manager_mass_passes_v1(text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_mass_passes_v1(text,text) TO authenticated;

-- cc_manager_mass_training_history_v1: authorized Manager read-only compatibility function.
CREATE FUNCTION public.cc_manager_mass_training_history_v1(p_from date DEFAULT (CURRENT_DATE - 120), p_to date DEFAULT CURRENT_DATE)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_from date := coalesce(p_from,current_date-120);
  v_to date := least(coalesce(p_to,current_date),current_date);
  v_data jsonb;
begin
  perform private.cc_manager_require_any_v1('mass.trainings','view');

  if v_to < v_from or v_to - v_from > 400 then
    raise exception 'MASS_HISTORY_INVALID_RANGE';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'eventId',e.id,
    'eventDate',e.event_date,
    'startsAt',(e.event_date + e.start_time) at time zone 'Europe/Budapest',
    'endsAt',case when e.end_time is null then null else (e.event_date + e.end_time) at time zone 'Europe/Budapest' end,
    'level',coalesce(e.level,''),
    'court',coalesce(e.court,''),
    'capacity',coalesce(e.capacity,0),
    'newLimit',case when coalesce(e.new_limit,0)>0 then e.new_limit else coalesce(e.capacity,0) end,
    'totalActive',coalesce(bc.active_count,0),
    'waitlistCount',coalesce(wc.wait_count,0),
    'sessionType',coalesce(e.session_type,''),
    'color',coalesce(e.color,''),
    'publicRegistrationActive',coalesce(e.public_registration_active,false),
    'registrationMode',case when lower(coalesce(e.legacy_row->>'managerWaitlistOnly','false'))
      in ('true','1','igen','yes') then 'WAITLIST_ONLY' else 'OPEN' end,
    'active',coalesce(e.active,false)
  ) order by e.event_date desc,e.start_time desc,e.id desc),'[]'::jsonb)
    into v_data
    from public.mass_events e
    left join lateral (
      select count(*) filter (where b.booking_status='AKTÍV')::integer active_count
      from public.mass_bookings b
      where b.source_workbook_id=e.source_workbook_id and b.event_id=e.id
    ) bc on true
    left join lateral (
      select count(*) filter (
        where w.waitlist_status='VÁRAKOZIK'
          or (w.waitlist_status='HELY FELAJÁNLVA'
              and (w.offer_expires_at is null or w.offer_expires_at>now()))
      )::integer wait_count
      from public.mass_waitlist w
      where w.source_workbook_id=e.source_workbook_id and w.event_id=e.id
    ) wc on true
    where e.event_date between v_from and v_to
      and upper(coalesce(e.session_type,'')) <> 'VERSENYSPORT'
      and ((e.event_date + coalesce(e.end_time,e.start_time)) at time zone 'Europe/Budapest') < now();

  return v_data;
end
$function$;
REVOKE ALL ON FUNCTION public.cc_manager_mass_training_history_v1(date,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_mass_training_history_v1(date,date) TO authenticated;

-- cc_manager_mass_trainings_v1: authorized Manager read-only compatibility function.
CREATE FUNCTION public.cc_manager_mass_trainings_v1(p_from date DEFAULT CURRENT_DATE, p_to date DEFAULT (CURRENT_DATE + 120))
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_manager_id uuid;
  v_result jsonb;
begin
  v_manager_id:=private.cc_manager_require_any_v1('mass.trainings','view');

  with scoped as (
    select e.*
    from public.mass_events e
    where e.active is true
      and e.event_date >= coalesce(p_from,current_date)
      and e.event_date < coalesce(p_to,current_date+120)
      and upper(coalesce(e.session_type,'')) <> 'VERSENYSPORT'
  ), counts as (
    select
      s.id,
      count(b.id) filter (where b.booking_status='AKTÍV')::int as total_active,
      count(b.id) filter (
        where b.booking_status='AKTÍV'
          and (
            upper(coalesce(b.capacity_bucket,'')) in ('ÚJ','UJ')
            or (coalesce(b.capacity_bucket,'')='' and upper(coalesce(b.source,'')) in ('ÚJ WEB','VÁRÓLISTA'))
          )
      )::int as new_active
    from scoped s
    left join public.mass_bookings b on b.event_id=s.id
    group by s.id
  ), waits as (
    select
      s.id,
      count(w.id) filter (
        where w.waitlist_status in ('VÁRAKOZIK','HELY FELAJÁNLVA')
          and (w.waitlist_status<>'HELY FELAJÁNLVA' or w.offer_expires_at is null or w.offer_expires_at>now())
      )::int as wait_count,
      count(w.id) filter (
        where w.waitlist_status='HELY FELAJÁNLVA'
          and w.offer_expires_at is not null
          and w.offer_expires_at>now()
      )::int as reserved
    from scoped s
    left join public.mass_waitlist w on w.event_id=s.id
    group by s.id
  )
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'eventId',s.id,
      'eventDate',s.event_date,
      'startsAt',((s.event_date+s.start_time) at time zone 'Europe/Budapest'),
      'endsAt',case when s.end_time is null then null else ((s.event_date+s.end_time) at time zone 'Europe/Budapest') end,
      'level',coalesce(s.level,''),
      'court',coalesce(s.court,''),
      'capacity',coalesce(s.capacity,0),
      'newLimit',case when coalesce(s.new_limit,0)>0 then s.new_limit else coalesce(s.capacity,0) end,
      'totalActive',coalesce(c.total_active,0),
      'newActive',coalesce(c.new_active,0),
      'reserved',coalesce(w.reserved,0),
      'waitlistCount',coalesce(w.wait_count,0),
      'free',case
        when lower(coalesce(s.legacy_row->>'managerWaitlistOnly','false')) in ('true','1','igen','yes') then 0
        else greatest(
          least(
            coalesce(s.capacity,0)-coalesce(c.total_active,0)-coalesce(w.reserved,0),
            (case when coalesce(s.new_limit,0)>0 then s.new_limit else coalesce(s.capacity,0) end)-coalesce(c.new_active,0)-coalesce(w.reserved,0)
          ),0
        )
      end,
      'publicRegistrationActive',coalesce(s.public_registration_active,false),
      'registrationMode',case
        when lower(coalesce(s.legacy_row->>'managerWaitlistOnly','false')) in ('true','1','igen','yes') then 'WAITLIST_ONLY'
        else 'OPEN'
      end,
      'sessionType',coalesce(s.session_type,''),
      'color',coalesce(s.color,''),
      'active',s.active
    ) order by s.event_date,s.start_time,s.id
  ),'[]'::jsonb)
  into v_result
  from scoped s
  left join counts c on c.id=s.id
  left join waits w on w.id=s.id;

  return v_result;
end
$function$;
REVOKE ALL ON FUNCTION public.cc_manager_mass_trainings_v1(date,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_mass_trainings_v1(date,date) TO authenticated;

COMMIT;
-- Expected: all eight rows anon_execute=false and auth_execute=true.
SELECT p.proname, has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute,
 has_function_privilege('authenticated',p.oid,'EXECUTE') AS auth_execute
FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid
WHERE n.nspname='public' AND p.proname IN ('cc_manager_mass_calendar_v1','cc_manager_mass_trainings_v1','cc_manager_mass_training_history_v1','cc_manager_mass_athletes_v1','cc_manager_mass_passes_v1','cc_manager_mass_event_detail_v1','cc_manager_mass_attendance_snapshot_r1_v1','cc_manager_mass_cancellations_v1')
ORDER BY p.proname;
