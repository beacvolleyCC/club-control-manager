-- Historical mass-training list for managers entitled to mass.trainings:view.
-- Includes inactive events. Read-only; no registration or attendance state changes.
create or replace function public.cc_manager_mass_training_history_v1(
  p_from date default current_date - 120,
  p_to date default current_date
)
returns jsonb
language plpgsql
stable security definer
set search_path = ''
as $function$
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

revoke all on function public.cc_manager_mass_training_history_v1(date,date) from public, anon;
grant execute on function public.cc_manager_mass_training_history_v1(date,date) to authenticated;
