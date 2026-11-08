-- Applied to TEST project szzoubvhlwnojtzqjebc on 2026-11-09.
-- Additive read adapter; do not deploy to LIVE without separate approval.
create or replace function public.cc_v2_manager_mass_read_v1(
 p_from date default current_date,
 p_to date default (current_date+120)
) returns jsonb language plpgsql stable security invoker set search_path to ''
as $$
begin
 if p_from is null or p_to is null or p_to<=p_from or p_to-p_from>366 then
  raise exception 'V2_INVALID_DATE_RANGE' using errcode='22023';
 end if;
 return jsonb_build_object(
  'schemaVersion',1,
  'domain','mass',
  'sourceSystem','mass_events',
  'trainings',public.cc_manager_mass_trainings_v1(p_from,p_to)
 );
end $$;
revoke all on function public.cc_v2_manager_mass_read_v1(date,date) from public,anon;
grant execute on function public.cc_v2_manager_mass_read_v1(date,date) to authenticated;
