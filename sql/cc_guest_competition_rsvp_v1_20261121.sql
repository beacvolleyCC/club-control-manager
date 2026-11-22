-- Club Control Guest Competition RSVP V1 — TEST only.
-- Guests are player identities without permanent team_memberships.
alter table public.players
  add column if not exists player_kind text not null default 'member';
do $$ begin
  if not exists(select 1 from pg_constraint where conname='players_player_kind_check') then
    alter table public.players add constraint players_player_kind_check
    check (player_kind in ('member','guest'));
  end if;
end $$;

create table if not exists public.cc_guest_profiles_v1 (
  player_id uuid primary key references public.players(id) on delete cascade,
  pin_hash text not null,
  active boolean not null default true,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.cc_guest_team_access_v1 (
  player_id uuid not null references public.cc_guest_profiles_v1(player_id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  primary key (player_id,team_id)
);
create table if not exists private.cc_guest_sessions_v1 (
  token_hash text primary key,
  player_id uuid not null references public.cc_guest_profiles_v1(player_id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists cc_guest_sessions_player_expires_v1
  on private.cc_guest_sessions_v1(player_id,expires_at);
create table if not exists private.cc_guest_pin_attempts_v1 (
  email text primary key,
  window_started_at timestamptz not null default now(),
  failure_count int not null default 0
);
alter table public.cc_guest_profiles_v1 enable row level security;
alter table public.cc_guest_team_access_v1 enable row level security;
alter table private.cc_guest_sessions_v1 enable row level security;
alter table private.cc_guest_pin_attempts_v1 enable row level security;
revoke all on table public.cc_guest_profiles_v1,public.cc_guest_team_access_v1
  from public,anon,authenticated;
revoke all on table private.cc_guest_sessions_v1,private.cc_guest_pin_attempts_v1
  from public,anon,authenticated;

create or replace function private.cc_guest_session_player_v1(p_token text)
returns uuid
language plpgsql security definer
set search_path to ''
as $$
declare v_id uuid;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    raise exception 'GUEST_SESSION_REQUIRED' using errcode='28000';
  end if;
  select gp.player_id into v_id
  from private.cc_guest_sessions_v1 sess
  join public.cc_guest_profiles_v1 gp on gp.player_id=sess.player_id and gp.active
  join public.players p on p.id=gp.player_id and p.active and p.player_kind='guest'
  where sess.token_hash=encode(extensions.digest(p_token,'sha256'),'hex')
    and sess.expires_at>now();
  if v_id is null then raise exception 'GUEST_SESSION_EXPIRED' using errcode='28000'; end if;
  return v_id;
end $$;
revoke all on function private.cc_guest_session_player_v1(text) from public,anon,authenticated;

create or replace function public.cc_guest_login_v1(p_email text,p_pin text)
returns jsonb
language plpgsql security definer
set search_path to ''
as $$
declare
  v_email text:=lower(btrim(coalesce(p_email,'')));
  v_row record;
  v_attempt private.cc_guest_pin_attempts_v1%rowtype;
  v_token text;
begin
  if length(v_email)>254 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or p_pin is null or p_pin !~ '^[0-9]{6,12}$' then
    return jsonb_build_object('ok',false,'error','INVALID_CREDENTIALS');
  end if;
  insert into private.cc_guest_pin_attempts_v1(email,window_started_at,failure_count)
  values(v_email,now(),0) on conflict(email) do nothing;
  select * into v_attempt from private.cc_guest_pin_attempts_v1
    where email=v_email for update;
  if v_attempt.window_started_at<now()-interval '20 minutes' then
    update private.cc_guest_pin_attempts_v1
    set window_started_at=now(),failure_count=0 where email=v_email;
    v_attempt.failure_count:=0;
  end if;
  if v_attempt.failure_count>=5 then
    return jsonb_build_object('ok',false,'error','TEMPORARILY_LOCKED');
  end if;
  select p.id,p.name,gp.pin_hash into v_row
    from public.players p join public.cc_guest_profiles_v1 gp on gp.player_id=p.id
    where lower(p.email::text)=v_email and p.active and gp.active and p.player_kind='guest';
  if v_row.id is null or extensions.crypt(p_pin,v_row.pin_hash) is distinct from v_row.pin_hash then
    update private.cc_guest_pin_attempts_v1
    set failure_count=failure_count+1 where email=v_email;
    return jsonb_build_object('ok',false,'error','INVALID_CREDENTIALS');
  end if;
  update private.cc_guest_pin_attempts_v1 set failure_count=0 where email=v_email;
  v_token:=encode(extensions.gen_random_bytes(32),'hex');
  insert into private.cc_guest_sessions_v1(token_hash,player_id,expires_at)
  values(encode(extensions.digest(v_token,'sha256'),'hex'),v_row.id,now()+interval '12 hours');
  return jsonb_build_object('ok',true,'token',v_token,'name',v_row.name);
end $$;

create or replace function public.cc_guest_week_v1(p_token text)
returns jsonb
language plpgsql security definer
set search_path to ''
as $$
declare v_player uuid; v_week date; v_events jsonb;
begin
  v_player:=private.cc_guest_session_player_v1(p_token);
  v_week:=date_trunc('week',now() at time zone 'Europe/Budapest')::date;
  select coalesce(jsonb_agg(jsonb_build_object(
    'eventId',e.id,'teamId',e.team_id,'teamName',t.name,
    'title',e.title,'startsAt',e.starts_at,'endsAt',e.ends_at,
    'venue',e.venue,'court',e.court,
    'goingCount',(
      select count(*)::int from public.availability av
      join public.players p on p.id=av.player_id and p.active
      where av.event_id=e.id and av.status='going'
        and (
          exists(select 1 from public.team_memberships tm
            where tm.player_id=p.id and tm.team_id=e.team_id and tm.active
              and tm.starts_on<=(e.starts_at at time zone 'Europe/Budapest')::date
              and (tm.ends_on is null or tm.ends_on>=(e.starts_at at time zone 'Europe/Budapest')::date))
          or exists(select 1 from public.cc_guest_profiles_v1 g
            join public.cc_guest_team_access_v1 ga on ga.player_id=g.player_id
            where g.player_id=p.id and g.active and ga.team_id=e.team_id)
        )
    ),
    'myStatus',coalesce((select av.status from public.availability av
                       where av.event_id=e.id and av.player_id=v_player),'unknown')
  ) order by e.starts_at),'[]'::jsonb)
  into v_events
  from public.events e
  join public.teams t on t.id=e.team_id and t.active
  join public.cc_guest_team_access_v1 ga on ga.team_id=e.team_id and ga.player_id=v_player
  where e.event_type='training' and e.status='active'
    and (e.starts_at at time zone 'Europe/Budapest')::date>=v_week
    and (e.starts_at at time zone 'Europe/Budapest')::date<v_week+7;
  return jsonb_build_object('weekStart',v_week,'events',v_events);
end $$;

create or replace function public.cc_guest_rsvp_v1(p_token text,p_event_id uuid,p_status text)
returns jsonb
language plpgsql security definer
set search_path to ''
as $$
declare v_player uuid; v_found boolean;
begin
  if p_status not in ('going','not_going') then
    raise exception 'INVALID_GUEST_RSVP_STATUS';
  end if;
  v_player:=private.cc_guest_session_player_v1(p_token);
  select true into v_found from public.events e
  join public.teams t on t.id=e.team_id and t.active
  join public.cc_guest_team_access_v1 ga on ga.team_id=e.team_id and ga.player_id=v_player
  where e.id=p_event_id and e.event_type='training' and e.status='active'
    and e.starts_at>now()
    and (e.starts_at at time zone 'Europe/Budapest')::date>=date_trunc('week',now() at time zone 'Europe/Budapest')::date
    and (e.starts_at at time zone 'Europe/Budapest')::date<date_trunc('week',now() at time zone 'Europe/Budapest')::date+7;
  if not coalesce(v_found,false) then
    raise exception 'GUEST_TRAINING_NOT_AVAILABLE' using errcode='42501';
  end if;
  insert into public.availability(event_id,player_id,status,updated_at)
  values(p_event_id,v_player,p_status,now())
  on conflict(event_id,player_id)
  do update set status=excluded.status,updated_at=now();
  return jsonb_build_object('ok',true,'eventId',p_event_id,'status',p_status);
end $$;

create or replace function public.cc_guest_logout_v1(p_token text)
returns boolean
language plpgsql security definer set search_path to ''
as $$
begin
  if p_token ~ '^[0-9a-f]{64}$' then
    delete from private.cc_guest_sessions_v1
    where token_hash=encode(extensions.digest(p_token,'sha256'),'hex');
  end if;
  return true;
end $$;

create or replace function public.cc_guest_admin_list_v1()
returns jsonb language plpgsql security definer set search_path to ''
as $$
begin
  if not private.cc_manager_can_v1('mass.athletes','view',null) then
    raise exception 'MANAGER_GUEST_PERMISSION_DENIED' using errcode='42501';
  end if;
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'guestId',p.id,'name',p.name,'email',p.email,
      'active',p.active and gp.active,'note',gp.note,
      'teamIds',coalesce((select jsonb_agg(ga.team_id order by ga.team_id)
         from public.cc_guest_team_access_v1 ga where ga.player_id=p.id),'[]'::jsonb),
      'goingCount',(select count(*) from public.availability av where av.player_id=p.id and av.status='going'),
      'createdAt',gp.created_at
    ) order by p.name),'[]'::jsonb)
    from public.cc_guest_profiles_v1 gp
    join public.players p on p.id=gp.player_id
  );
end $$;

create or replace function public.cc_guest_admin_save_v1(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path to ''
as $$
declare
  v_id uuid; v_name text; v_email text; v_note text; v_active boolean;
  v_teams jsonb; v_team uuid; v_pin text; v_reset boolean; v_bytes bytea;
begin
  if not private.cc_manager_can_v1('mass.athletes','edit',null) then
    raise exception 'MANAGER_GUEST_EDIT_DENIED' using errcode='42501';
  end if;
  v_name:=btrim(coalesce(p_payload->>'name',''));
  v_email:=lower(btrim(coalesce(p_payload->>'email','')));
  v_note:=left(coalesce(p_payload->>'note',''),1000);
  v_active:=coalesce((p_payload->>'active')::boolean,true);
  v_reset:=coalesce((p_payload->>'resetPin')::boolean,false);
  v_teams:=p_payload->'teamIds';
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
      active=v_active,updated_at=now() where id=v_id;
    update public.cc_guest_profiles_v1
      set active=v_active,note=v_note,updated_at=now() where player_id=v_id;
  else
    insert into public.players(name,display_name,email,active,player_kind)
    values(v_name,v_name,v_email,v_active,'guest')
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
end $$;

create or replace function public.cc_guest_admin_rsvp_v1(p_guest_id uuid,p_event_id uuid,p_status text)
returns jsonb language plpgsql security definer set search_path to ''
as $$
declare v_valid boolean;
begin
  if not private.cc_manager_can_v1('mass.athletes','edit',null) then
    raise exception 'MANAGER_GUEST_EDIT_DENIED' using errcode='42501';
  end if;
  if p_status not in ('going','not_going','unknown') then
    raise exception 'INVALID_GUEST_RSVP_STATUS';
  end if;
  select true into v_valid
  from public.cc_guest_profiles_v1 gp
  join public.cc_guest_team_access_v1 ga on ga.player_id=gp.player_id
  join public.events e on e.team_id=ga.team_id and e.id=p_event_id
  where gp.player_id=p_guest_id and e.event_type='training' and e.status='active';
  if not coalesce(v_valid,false) then raise exception 'GUEST_TRAINING_NOT_AVAILABLE'; end if;
  insert into public.availability(event_id,player_id,status,updated_at)
  values(p_event_id,p_guest_id,p_status,now())
  on conflict(event_id,player_id) do update
  set status=excluded.status,updated_at=now();
  return jsonb_build_object('ok',true);
end $$;

create or replace function public.cc_manager_events_with_guests_v1(
  p_from timestamptz,p_to timestamptz,p_kind text default 'training',
  p_team_id uuid default null
) returns jsonb language plpgsql security definer set search_path to ''
as $$
declare v_base jsonb; v_out jsonb;
begin
  v_base:=public.cc_manager_events_v1(p_from,p_to,p_kind,p_team_id);
  select coalesce(jsonb_agg(
    x.item || jsonb_build_object('guestCount',g.cnt,
      'yesCount',coalesce((x.item->>'yesCount')::int,0)+g.cnt)
    order by x.ord),'[]'::jsonb)
  into v_out
  from jsonb_array_elements(coalesce(v_base,'[]'::jsonb)) with ordinality x(item,ord)
  cross join lateral (
    select count(*)::int cnt
    from public.availability av
    join public.cc_guest_profiles_v1 gp on gp.player_id=av.player_id and gp.active
    join public.players p on p.id=gp.player_id and p.active
    join public.cc_guest_team_access_v1 ga
      on ga.player_id=gp.player_id and ga.team_id=(x.item->>'teamId')::uuid
    where av.event_id=(x.item->>'eventId')::uuid and av.status='going'
  ) g;
  return v_out;
end $$;

create or replace function public.cc_manager_event_roster_with_guests_v1(p_event_id uuid)
returns jsonb language plpgsql security definer set search_path to ''
as $$
declare v_base jsonb; v_guest jsonb;
begin
  v_base:=public.cc_manager_event_roster_v1(p_event_id);
  select coalesce(jsonb_agg(jsonb_build_object(
    'playerId',p.id,'name',p.name,'displayName',p.display_name,
    'email',p.email,'position',null,'jerseyNo',null,'avatarId',null,
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
end $$;

-- Existing filtered Player bootstrap remains the canonical Player entry point.
-- Only this response is extended with a guestNames array for competition trainings.
create or replace function public.cc_player_bootstrap_filtered_v1()
returns jsonb language plpgsql stable security definer set search_path to ''
as $$
declare v_raw jsonb; v_players jsonb:='[]'::jsonb; v_events jsonb:='[]'::jsonb;
begin
  v_raw:=public.cc_player_bootstrap();
  if v_raw is null then return '{}'::jsonb; end if;
  select coalesce(jsonb_agg(x.item order by x.ord),'[]'::jsonb)
  into v_players
  from jsonb_array_elements(coalesce(v_raw->'teamPlayers','[]'::jsonb))
    with ordinality x(item,ord)
  where not public.cc_is_test_player_marker_v1(
      x.item->>'name',x.item->>'displayName',x.item->>'email')
    and not exists (
      select 1 from public.players p
      where p.id::text=coalesce(x.item->>'playerId',x.item->>'id','')
        and public.cc_is_test_player_marker_v1(p.name,p.display_name,p.email::text)
    );

  select coalesce(jsonb_agg(
    jsonb_set(jsonb_set(jsonb_set(
      jsonb_set(e.item,'{yesNames}',public.cc_player_filter_test_name_array_v1(e.item->'yesNames'),true),
        '{noNames}',public.cc_player_filter_test_name_array_v1(e.item->'noNames'),true),
        '{unknownNames}',public.cc_player_filter_test_name_array_v1(e.item->'unknownNames'),true),
        '{guestNames}',case when e.item->>'type'='training' then
          coalesce((select jsonb_agg(p.display_name order by p.name)
            from public.availability av
            join public.cc_guest_profiles_v1 gp on gp.player_id=av.player_id and gp.active
            join public.players p on p.id=gp.player_id and p.active
            join public.events ev on ev.id=av.event_id
            join public.cc_guest_team_access_v1 ga on ga.player_id=gp.player_id and ga.team_id=ev.team_id
            where av.event_id=(e.item->>'eventId')::uuid and av.status='going'),'[]'::jsonb)
          else '[]'::jsonb end,true)
    order by e.ord),'[]'::jsonb)
  into v_events
  from jsonb_array_elements(coalesce(v_raw->'events','[]'::jsonb))
    with ordinality e(item,ord);
  return jsonb_set(jsonb_set(v_raw,'{teamPlayers}',v_players,true),'{events}',v_events,true);
end $$;

revoke all on function public.cc_guest_login_v1(text,text),
  public.cc_guest_week_v1(text),
  public.cc_guest_rsvp_v1(text,uuid,text),
  public.cc_guest_logout_v1(text),
  public.cc_guest_admin_list_v1(),
  public.cc_guest_admin_save_v1(jsonb),
  public.cc_guest_admin_rsvp_v1(uuid,uuid,text),
  public.cc_manager_events_with_guests_v1(timestamptz,timestamptz,text,uuid),
  public.cc_manager_event_roster_with_guests_v1(uuid)
from public,anon,authenticated;

grant execute on function public.cc_guest_login_v1(text,text),
 public.cc_guest_week_v1(text),
 public.cc_guest_rsvp_v1(text,uuid,text),
 public.cc_guest_logout_v1(text) to anon,authenticated;
grant execute on function public.cc_guest_admin_list_v1(),
 public.cc_guest_admin_save_v1(jsonb),
 public.cc_guest_admin_rsvp_v1(uuid,uuid,text),
 public.cc_manager_events_with_guests_v1(timestamptz,timestamptz,text,uuid),
 public.cc_manager_event_roster_with_guests_v1(uuid) to authenticated;
