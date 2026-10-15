-- Read-only cancellations for authorized Manager mass training detail.
-- Does not change booking, waitlist, attendance or cancellation state.
create or replace function public.cc_manager_mass_cancellations_v1(p_event_id text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $function$
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

revoke all on function public.cc_manager_mass_cancellations_v1(text) from public, anon;
grant execute on function public.cc_manager_mass_cancellations_v1(text) to authenticated;
