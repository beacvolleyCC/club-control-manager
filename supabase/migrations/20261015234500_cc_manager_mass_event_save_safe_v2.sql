-- Preserve hidden mass-event fields when Manager edits an existing training.
-- This wrapper keeps the existing write permission and delegates to the canonical save.
-- Never use this for creation; only a known existing mass training can be updated.
create or replace function public.cc_manager_mass_event_save_safe_v2(
  p_event_id text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_event public.mass_events%rowtype;
  v_event_id text := nullif(btrim(coalesce(p_event_id,'')),'');
  v_capacity integer;
  v_new_limit integer;
  v_color text;
  v_payload jsonb;
begin
  perform private.cc_manager_require_any_v1('mass.trainings','edit');
  if v_event_id is null or p_payload is null or jsonb_typeof(p_payload)<>'object' then
    raise exception 'MASS_EVENT_EDIT_INVALID';
  end if;

  select e.* into v_event
    from public.mass_events e
   where e.id=v_event_id
     and upper(coalesce(e.session_type,''))<>'VERSENYSPORT'
   for update;
  if not found then raise exception 'MASS_EVENT_NOT_FOUND'; end if;

  v_capacity:=nullif(p_payload->>'capacity','')::integer;
  -- When capacity is not changed, the old/new capacity split must remain intact.
  -- If the two limits were synchronized, an explicit capacity edit updates both.
  v_new_limit:=case
    when v_capacity is distinct from v_event.capacity
      and (v_event.new_limit is null or v_event.new_limit=v_event.capacity)
      then v_capacity
    else v_event.new_limit
  end;
  v_color:=case
    when p_payload ? 'color' then nullif(btrim(coalesce(p_payload->>'color','')),'')
    else v_event.color
  end;

  v_payload:=p_payload||jsonb_build_object(
    'oldLimit',v_event.old_limit,
    'newLimit',v_new_limit,
    'publicRegistrationActive',v_event.public_registration_active,
    'teamId',v_event.team_id,
    'visibility',v_event.visibility,
    'color',v_color
  );

  return public.cc_manager_mass_event_save_v1(v_event_id,v_payload);
end
$function$;

revoke all on function public.cc_manager_mass_event_save_safe_v2(text,jsonb) from public,anon;
grant execute on function public.cc_manager_mass_event_save_safe_v2(text,jsonb) to authenticated;
