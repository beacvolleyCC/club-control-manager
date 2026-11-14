-- V2 TEST: a single sanitized, read-only public timetable for web and Player.
-- No athlete names, emails, pass numbers, raw legacy JSON, or private team events.
-- Never execute on LIVE without separate review.
create or replace function public.cc_v2_mass_public_schedule_v1(
 p_from date default null, p_to date default null
) returns jsonb
language plpgsql stable security definer set search_path to ''
as $function$
declare
 v_today date := (now() at time zone 'Europe/Budapest')::date;
 v_from date := coalesce(p_from,(now() at time zone 'Europe/Budapest')::date);
 v_to date := coalesce(p_to,(now() at time zone 'Europe/Budapest')::date+30);
 v_events jsonb;
begin
 if v_from<v_today-1 or v_to<v_from or v_to>v_from+45 then
  raise exception 'CC_V2_MASS_WINDOW_INVALID' using errcode='22023';
 end if;
 select coalesce(jsonb_agg(jsonb_build_object(
   'eventId',q.event_id,'date',q.event_date,'startTime',q.start_time,
   'endTime',q.end_time,'level',q.level,'court',q.court,
   'capacity',q.capacity,'remaining',q.remaining,
   'waitlistCount',q.waitlist_count,
   'bookingOpen',q.booking_open,'waitlistOpen',q.waitlist_open
 ) order by q.event_date,q.start_time,q.event_id),'[]'::jsonb) into v_events
 from (
  select e.id event_id,e.event_date,e.start_time,e.end_time,
   e.level,e.court,greatest(coalesce(e.capacity,0),0) capacity,
   least(
    greatest(greatest(coalesce(e.capacity,0),0)-b.total_active-w.offered,0),
    greatest(greatest(coalesce(nullif(e.new_limit,0),e.capacity,0),0)-b.new_active-w.offered,0)
   ) remaining,
   w.waiting waitlist_count,
   (
    coalesce((time_rules.rules->>'bookingOpen')::boolean,false)
    and not (lower(coalesce(e.legacy_row->>'managerWaitlistOnly','false')) in ('true','1','yes','igen'))
    and least(
      greatest(greatest(coalesce(e.capacity,0),0)-b.total_active-w.offered,0),
      greatest(greatest(coalesce(nullif(e.new_limit,0),e.capacity,0),0)-b.new_active-w.offered,0)
    )>0 and w.pending=0
   ) booking_open,
   (
    coalesce((time_rules.rules->>'waitlistOpen')::boolean,false)
    and w.waiting<coalesce((time_rules.rules->>'waitlistLimit')::int,0)
    and (
      lower(coalesce(e.legacy_row->>'managerWaitlistOnly','false')) in ('true','1','yes','igen')
      or w.pending>0
      or least(
        greatest(greatest(coalesce(e.capacity,0),0)-b.total_active-w.offered,0),
        greatest(greatest(coalesce(nullif(e.new_limit,0),e.capacity,0),0)-b.new_active-w.offered,0)
      )=0
    )
   ) waitlist_open
  from public.mass_events e
  cross join lateral (
    select count(*)::int total_active,
     count(*) filter (where upper(coalesce(capacity_bucket,'')) in ('ÚJ','UJ')
      or (coalesce(capacity_bucket,'')='' and upper(coalesce(source,'')) in ('ÚJ WEB','VÁRÓLISTA')))::int new_active
    from public.mass_bookings b
    where b.event_id=e.id and b.source_workbook_id=e.source_workbook_id
     and b.booking_status='AKTÍV'
  ) b
  cross join lateral (
    select count(*)::int waiting,
      count(*) filter(where waitlist_status='VÁRAKOZIK')::int pending,
      count(*) filter(where waitlist_status='HELY FELAJÁNLVA' and offer_expires_at>now())::int offered
    from public.mass_waitlist w
    where w.event_id=e.id and w.source_workbook_id=e.source_workbook_id
      and (w.waitlist_status='VÁRAKOZIK'
        or (w.waitlist_status='HELY FELAJÁNLVA' and w.offer_expires_at>now()))
  ) w
  cross join lateral (select private.cc_mass_advanced_window_v1(e.id,now()) rules) time_rules
  where e.event_date between v_from and v_to
   and e.active is true and e.public_registration_active is true
   and upper(coalesce(e.session_type,'')) in ('TÖMEGSPORT','TOMEGSPORT','SPORT7')
   and upper(coalesce(e.visibility,'')) not in ('PRIVATE','HIDDEN','INTERNAL','REJTETT','PRIVÁT')
   and e.start_time is not null
  order by e.event_date,e.start_time,e.id
  limit 90
 ) q;
 return jsonb_build_object('schemaVersion',1,'domain','mass',
   'from',v_from,'to',v_to,'events',v_events);
end $function$;
revoke all on function public.cc_v2_mass_public_schedule_v1(date,date) from public,anon,authenticated;
grant execute on function public.cc_v2_mass_public_schedule_v1(date,date) to anon,authenticated;
comment on function public.cc_v2_mass_public_schedule_v1(date,date)
is 'TEST: vetted public event schedule only, no PII and no writes; gate to web and Player.';
