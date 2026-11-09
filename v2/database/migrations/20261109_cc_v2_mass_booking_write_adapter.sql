-- TEST-only V2 Manager mass booking write adapter.
-- Existing cc_manager_mass_booking_add_v1/remove_v1 enforce Manager edit permissions,
-- booking capacity, identity-slot and cancellation rules.
create or replace function public.cc_v2_manager_mass_booking_write_v1(
 p_action text,p_id text,p_payload jsonb default '{}'::jsonb
) returns jsonb language plpgsql volatile security invoker set search_path to ''
as $$
declare v_action text:=lower(trim(coalesce(p_action,'')));
v_id text:=trim(coalesce(p_id,''));v_result jsonb;
begin
 if length(v_id)=0 or length(v_id)>200 then raise exception 'V2_INVALID_ID' using errcode='22023'; end if;
 if v_action='add' then
  if p_payload is null or jsonb_typeof(p_payload)<>'object' or p_payload ?| array['player_id','event_id','booking_status','source_workbook_id','attendance'] then
   raise exception 'V2_INVALID_BOOKING_PAYLOAD' using errcode='22023';
  end if;
  v_result:=public.cc_manager_mass_booking_add_v1(v_id,p_payload);
 elsif v_action='remove' then
  if p_payload is distinct from '{}'::jsonb then raise exception 'V2_REMOVE_PAYLOAD_NOT_ALLOWED' using errcode='22023'; end if;
  v_result:=public.cc_manager_mass_booking_remove_v1(v_id);
 else
  raise exception 'V2_UNSUPPORTED_ACTION' using errcode='22023';
 end if;
 return jsonb_build_object('schemaVersion',1,'domain','mass','action',v_action,'result',v_result);
end $$;
revoke all on function public.cc_v2_manager_mass_booking_write_v1(text,text,jsonb) from public,anon;
grant execute on function public.cc_v2_manager_mass_booking_write_v1(text,text,jsonb) to authenticated;
