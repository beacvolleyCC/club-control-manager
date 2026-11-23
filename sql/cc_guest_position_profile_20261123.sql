-- Guest position extension. No player data writes; preserve existing authorization.
CREATE OR REPLACE FUNCTION public.cc_guest_admin_list_v1()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not private.cc_manager_can_v1('mass.athletes','view',null) then
    raise exception 'MANAGER_GUEST_PERMISSION_DENIED' using errcode='42501';
  end if;
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'guestId',p.id,'name',p.name,'email',p.email,'position',p.position,
      'active',p.active and gp.active,'note',gp.note,
      'teamIds',coalesce((select jsonb_agg(ga.team_id order by ga.team_id)
         from public.cc_guest_team_access_v1 ga where ga.player_id=p.id),'[]'::jsonb),
      'goingCount',(select count(*) from public.availability av where av.player_id=p.id and av.status='going'),
      'createdAt',gp.created_at
    ) order by p.name),'[]'::jsonb)
    from public.cc_guest_profiles_v1 gp
    join public.players p on p.id=gp.player_id
  );
end $function$;

CREATE OR REPLACE FUNCTION public.cc_guest_admin_save_v1(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_id uuid; v_name text; v_email text; v_note text; v_active boolean; v_position text;
  v_teams jsonb; v_team uuid; v_pin text; v_reset boolean; v_bytes bytea;
begin
  if not private.cc_manager_can_v1('mass.athletes','edit',null) then
    raise exception 'MANAGER_GUEST_EDIT_DENIED' using errcode='42501';
  end if;
  v_name:=btrim(coalesce(p_payload->>'name',''));
  v_position:=nullif(btrim(coalesce(p_payload->>'position','')),'');
  v_email:=lower(btrim(coalesce(p_payload->>'email','')));
  v_note:=left(coalesce(p_payload->>'note',''),1000);
  v_active:=coalesce((p_payload->>'active')::boolean,true);
  v_reset:=coalesce((p_payload->>'resetPin')::boolean,false);
  v_teams:=p_payload->'teamIds';
  if (v_position is not null and v_position not in ('Feladó','Átló','4-es ütő','Szélső','Liberó','Center')) then
    raise exception 'INVALID_GUEST_POSITION';
  end if;
  if length(v_name)<2 or length(v_name)>120
     or length(v_email)>254 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or v_teams is null or jsonb_typeof(v_teams)<>'array' or jsonb_array_length(v_teams)=0
     or jsonb_array_length(v_teams)>10 then
    raise exception 'INVALID_GUEST_PROFILE';
  end if;
  if p_payload ? 'guestId' and nullif(p_payload->>'guestId','') is not null then
    v_id:=(p_payload->>'guestId')::uuid;
    if not exists(select 1 from public.cc_guest_profiles_v1 where player_id=v_id) then
      raise exception 'GUEST_NOT_FOUND';
    end if;
    update public.players set name=v_name,display_name=v_name,email=v_email,
      active=v_active,position=v_position,updated_at=now() where id=v_id;
    update public.cc_guest_profiles_v1
      set active=v_active,note=v_note,updated_at=now() where player_id=v_id;
  else
    insert into public.players(name,display_name,email,active,player_kind,position)
    values(v_name,v_name,v_email,v_active,'guest',v_position)
    returning id into v_id;
    v_reset:=true;
    insert into public.cc_guest_profiles_v1(player_id,pin_hash,active,note)
      values(v_id,'pending',v_active,v_note);
  end if;
  delete from public.cc_guest_team_access_v1 where player_id=v_id;
  for v_team in select distinct value::uuid from jsonb_array_elements_text(v_teams)
  loop
    if not exists(select 1 from public.teams where id=v_team and active) then
      raise exception 'GUEST_TEAM_INVALID';
    end if;
    insert into public.cc_guest_team_access_v1(player_id,team_id)
      values(v_id,v_team);
  end loop;
  if v_reset then
    v_bytes:=extensions.gen_random_bytes(4);
    v_pin:=lpad(((get_byte(v_bytes,0)::bigint*16777216
      +get_byte(v_bytes,1)::bigint*65536
      +get_byte(v_bytes,2)::bigint*256
      +get_byte(v_bytes,3)::bigint) % 100000000)::text,8,'0');
    update public.cc_guest_profiles_v1
       set pin_hash=extensions.crypt(v_pin,extensions.gen_salt('bf',10)),
           updated_at=now() where player_id=v_id;
  end if;
  if v_reset or not v_active then
    delete from private.cc_guest_sessions_v1 where player_id=v_id;
  end if;
  return jsonb_build_object('ok',true,'guestId',v_id,
    'pin',case when v_reset then v_pin else null end);
end $function$;

CREATE OR REPLACE FUNCTION public.cc_manager_event_roster_with_guests_v1(p_event_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_base jsonb; v_guest jsonb;
begin
  v_base:=public.cc_manager_event_roster_v1(p_event_id);
  select coalesce(jsonb_agg(jsonb_build_object(
    'playerId',p.id,'name',p.name,'displayName',p.display_name,
    'email',p.email,'position',p.position,'jerseyNo',null,'avatarId',null,
    'status','going','attendanceStatus',av.attendance_status,
    'note','','isGuest',true
  ) order by p.name),'[]'::jsonb)
  into v_guest
  from public.availability av
  join public.events e on e.id=av.event_id and e.id=p_event_id
  join public.cc_guest_profiles_v1 gp on gp.player_id=av.player_id and gp.active
  join public.players p on p.id=gp.player_id and p.active
  join public.cc_guest_team_access_v1 ga on ga.player_id=gp.player_id and ga.team_id=e.team_id
  where av.status='going';
  return coalesce(v_base,'[]'::jsonb)||v_guest;
end $function$;
