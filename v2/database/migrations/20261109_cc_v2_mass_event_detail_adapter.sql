-- TEST only. Mass event detail adapter, requires existing Manager permission.
create or replace function public.cc_v2_manager_mass_event_detail_v1(p_event_id text)
returns jsonb language plpgsql stable security invoker set search_path to ''
as $$
begin
 if p_event_id is null or length(trim(p_event_id))=0 or length(p_event_id)>200 then
  raise exception 'V2_INVALID_EVENT_ID' using errcode='22023';
 end if;
 return jsonb_build_object(
  'schemaVersion',1,
  'domain','mass',
  'sourceSystem','mass_events',
  'externalEventId',trim(p_event_id),
  'detail',public.cc_manager_mass_event_detail_v1(trim(p_event_id))
 );
end $$;
revoke all on function public.cc_v2_manager_mass_event_detail_v1(text) from public,anon;
grant execute on function public.cc_v2_manager_mass_event_detail_v1(text) to authenticated;
