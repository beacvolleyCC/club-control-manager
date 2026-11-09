-- Applied to TEST project szzoubvhlwnojtzqjebc on 2026-11-09.
-- Read-only integrity report. LIVE deployment requires explicit approval.
create or replace function public.cc_v2_mass_integrity_v1()
returns jsonb language plpgsql stable security definer set search_path to ''
as $fn$
begin
 perform private.cc_manager_require_any_v1('mass.overview','view');
 return jsonb_build_object(
 'schemaVersion',1,
 'source','mass',
 'events',(select count(*) from public.mass_events),
 'bookings',(select count(*) from public.mass_bookings),
 'waitlist',(select count(*) from public.mass_waitlist),
 'orphanBookings',(select count(*) from public.mass_bookings b where not exists(select 1 from public.mass_events e where e.id=b.event_id)),
 'orphanWaitlist',(select count(*) from public.mass_waitlist w where not exists(select 1 from public.mass_events e where e.id=w.event_id)),
 'bookingMissingEmail',(select count(*) from public.mass_bookings b where nullif(trim(coalesce(b.email,'')),'') is null),
 'waitlistMissingEmail',(select count(*) from public.mass_waitlist w where nullif(trim(coalesce(w.email,'')),'') is null),
 'bookingWithoutCanonicalEvent',(select count(*) from public.mass_bookings b where not exists(select 1 from public.cc_v2_event_links l where l.source_system='mass_events' and l.external_id=b.event_id and l.verified_at is not null)),
 'waitlistWithoutCanonicalEvent',(select count(*) from public.mass_waitlist w where not exists(select 1 from public.cc_v2_event_links l where l.source_system='mass_events' and l.external_id=w.event_id and l.verified_at is not null))
 );
end
$fn$;
revoke all on function public.cc_v2_mass_integrity_v1() from public,anon;
grant execute on function public.cc_v2_mass_integrity_v1() to authenticated;
