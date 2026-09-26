-- CLUB CONTROL / BEAC
-- MGR002 — MANAGER PARITY READ-ONLY RPC EXTENSION
-- Scope: additive read-only RPCs for Manager PWA parity.
-- Adds no tables and does not modify Player/events/availability/team/player data.
-- One-time install. Do not rerun after successful install.

begin;

do $$
begin
  if to_regclass('public.manager_accounts') is null
     or to_regclass('public.manager_module_permissions') is null
     or to_regclass('public.players') is null
     or to_regclass('public.player_settings') is null
     or to_regclass('public.team_memberships') is null
     or to_regclass('public.events') is null
     or to_regclass('public.availability') is null
     or to_regprocedure('private.cc_manager_can_v1(text,text,uuid)') is null
     or to_regprocedure('private.cc_manager_require_any_v1(text,text)') is null
     or to_regprocedure('private.cc_manager_require_v1(text,text,uuid)') is null then
    raise exception 'MGR002_PRECONDITION_FAILED: MGR001/baseline dependency missing';
  end if;

  if to_regprocedure('public.cc_manager_players_v2(uuid,text)') is not null
     or to_regprocedure('public.cc_manager_rsvp_matrix_v1(timestamptz,timestamptz,uuid)') is not null
     or to_regprocedure('public.cc_manager_event_roster_v1(uuid)') is not null
     or to_regprocedure('public.cc_manager_events_v1(timestamptz,timestamptz,text,uuid)') is not null
     or to_regprocedure('public.cc_manager_calendar_v2(timestamptz,timestamptz,uuid)') is not null then
    raise exception 'MGR002_ALREADY_OR_PARTIALLY_INSTALLED: stop and inspect before retry';
  end if;
end;
$$;

create function public.cc_manager_players_v2(
  p_team_id uuid default null,
  p_query text default ''
)
returns jsonb
language plpgsql
security definer
set search_path=public,private,pg_temp
as $$
declare
  v_query text:=lower(trim(coalesce(p_query,'')));
  v_manager_id uuid;
begin
  if p_team_id is null then
    v_manager_id:=private.cc_manager_require_any_v1('competition.players','view');
  else
    v_manager_id:=private.cc_manager_require_v1('competition.players','view',p_team_id);
  end if;

  return (
    with rows as (
      select
        p.id,p.email,p.name,p.display_name,p.position,p.jersey_no,p.jersey_size,p.shorts_size,p.active,p.auth_user_id,
        pp.license_no,pp.medical_valid_until,ps.avatar_id,
        m.team_id,m.starts_on,m.ends_on,t.name as team_name,
        coalesce(att.training_present,0) as training_present,
        coalesce(att.training_marked,0) as training_marked,
        coalesce(att.match_present,0) as match_present,
        coalesce(att.match_marked,0) as match_marked
      from public.players p
      left join public.player_private pp on pp.player_id=p.id
      left join public.player_settings ps on ps.player_id=p.id
      left join lateral (
        select tm.team_id,tm.starts_on,tm.ends_on
        from public.team_memberships tm
        where tm.player_id=p.id
          and tm.active=true
          and (tm.ends_on is null or tm.ends_on>=current_date)
        order by tm.starts_on desc,tm.created_at desc
        limit 1
      ) m on true
      left join public.teams t on t.id=m.team_id
      left join lateral (
        select
          count(*) filter (where e.event_type='training' and a.attendance_status='present')::int as training_present,
          count(*) filter (where e.event_type='training' and a.attendance_status in ('present','absent'))::int as training_marked,
          count(*) filter (where e.event_type='match' and a.attendance_status='present')::int as match_present,
          count(*) filter (where e.event_type='match' and a.attendance_status in ('present','absent'))::int as match_marked
        from public.availability a
        join public.events e on e.id=a.event_id
        where a.player_id=p.id
          and (p_team_id is null or e.team_id=p_team_id)
          and exists (
            select 1 from public.manager_module_permissions amp
            where amp.manager_id=v_manager_id
              and amp.module_key='competition.players'
              and amp.can_view=true
              and (amp.team_id is null or amp.team_id=e.team_id)
          )
      ) att on true
      where (p_team_id is null or m.team_id=p_team_id)
        and (
          v_query=''
          or lower(coalesce(p.display_name,p.name,'')) like '%'||v_query||'%'
          or lower(p.email::text) like '%'||v_query||'%'
          or lower(coalesce(pp.license_no,'')) like '%'||v_query||'%'
        )
        and exists (
          select 1 from public.manager_module_permissions mp
          where mp.manager_id=v_manager_id
            and mp.module_key='competition.players'
            and mp.can_view=true
            and (mp.team_id is null or mp.team_id=m.team_id)
        )
      order by p.active desc,coalesce(p.display_name,p.name),p.email
      limit 500
    )
    select coalesce(jsonb_agg(jsonb_build_object(
      'playerId',r.id,'email',r.email,'name',r.name,'displayName',r.display_name,'position',r.position,
      'jerseyNo',r.jersey_no,'jerseySize',r.jersey_size,'shortsSize',r.shorts_size,'active',r.active,
      'licenseNo',r.license_no,'medicalValidUntil',r.medical_valid_until,'avatarId',r.avatar_id,
      'teamId',r.team_id,'teamName',r.team_name,'membershipStartsOn',r.starts_on,'membershipEndsOn',r.ends_on,
      'hasAccount',(r.auth_user_id is not null),
      'trainingPresent',r.training_present,'trainingMarked',r.training_marked,
      'matchPresent',r.match_present,'matchMarked',r.match_marked
    ) order by r.active desc,coalesce(r.display_name,r.name),r.email),'[]'::jsonb)
    from rows r
  );
end;
$$;

create function public.cc_manager_rsvp_matrix_v1(
  p_from timestamptz,
  p_to timestamptz,
  p_team_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path=public,private,pg_temp
as $$
declare
  v_manager_id uuid;
begin
  if p_from is null or p_to is null or p_to<=p_from then
    raise exception 'MANAGER_INVALID_RSVP_RANGE';
  end if;
  if p_to-p_from>interval '62 days' then
    raise exception 'MANAGER_RSVP_RANGE_TOO_LARGE';
  end if;

  if p_team_id is null then
    v_manager_id:=private.cc_manager_require_any_v1('competition.overview','view');
  else
    v_manager_id:=private.cc_manager_require_v1('competition.overview','view',p_team_id);
  end if;

  return (
    with accessible_events as (
      select e.id,e.team_id,e.event_type,e.title,e.starts_at,e.ends_at,e.venue,e.address,e.court,e.color,e.home_away,e.meeting_at,e.meeting_place,e.status,t.name as team_name
      from public.events e
      join public.teams t on t.id=e.team_id
      where e.starts_at>=p_from
        and e.starts_at<p_to
        and e.status<>'cancelled'
        and (p_team_id is null or e.team_id=p_team_id)
        and exists (
          select 1 from public.manager_module_permissions mp
          where mp.manager_id=v_manager_id
            and mp.module_key='competition.overview'
            and mp.can_view=true
            and (mp.team_id is null or mp.team_id=e.team_id)
        )
    ), member_rows as (
      select distinct
        ae.team_id,p.id as player_id,p.name,p.display_name,p.position,p.jersey_no,ps.avatar_id
      from accessible_events ae
      join public.team_memberships tm on tm.team_id=ae.team_id
      join public.players p on p.id=tm.player_id
      left join public.player_settings ps on ps.player_id=p.id
      where p.active=true
        and tm.active=true
        and tm.starts_on<=((ae.starts_at at time zone 'Europe/Budapest')::date)
        and (tm.ends_on is null or tm.ends_on>=((ae.starts_at at time zone 'Europe/Budapest')::date))
    ), response_rows as (
      select
        ae.id as event_id,p.id as player_id,
        case av.status when 'going' then 'going' when 'not_going' then 'not_going' else 'none' end as response_status
      from accessible_events ae
      join public.team_memberships tm on tm.team_id=ae.team_id
      join public.players p on p.id=tm.player_id and p.active=true
      left join public.availability av on av.event_id=ae.id and av.player_id=p.id
      where tm.active=true
        and tm.starts_on<=((ae.starts_at at time zone 'Europe/Budapest')::date)
        and (tm.ends_on is null or tm.ends_on>=((ae.starts_at at time zone 'Europe/Budapest')::date))
    )
    select jsonb_build_object(
      'events',coalesce((select jsonb_agg(jsonb_build_object(
        'eventId',ae.id,'teamId',ae.team_id,'teamName',ae.team_name,'eventType',ae.event_type,'title',ae.title,
        'startsAt',ae.starts_at,'endsAt',ae.ends_at,'venue',ae.venue,'address',ae.address,'court',ae.court,
        'color',ae.color,'homeAway',ae.home_away,'meetingAt',ae.meeting_at,'meetingPlace',ae.meeting_place,'status',ae.status
      ) order by ae.starts_at,ae.id) from accessible_events ae),'[]'::jsonb),
      'players',coalesce((select jsonb_agg(jsonb_build_object(
        'teamId',m.team_id,'playerId',m.player_id,'name',m.name,'displayName',m.display_name,'position',m.position,
        'jerseyNo',m.jersey_no,'avatarId',m.avatar_id
      ) order by m.team_id,coalesce(m.jersey_no,9999),coalesce(m.display_name,m.name)) from member_rows m),'[]'::jsonb),
      'responses',coalesce((select jsonb_agg(jsonb_build_object(
        'eventId',r.event_id,'playerId',r.player_id,'status',r.response_status
      ) order by r.event_id,r.player_id) from response_rows r),'[]'::jsonb),
      'generatedAt',now()
    )
  );
end;
$$;


create function public.cc_manager_events_v1(
  p_from timestamptz,
  p_to timestamptz,
  p_kind text default 'training',
  p_team_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path=public,private,pg_temp
as $$
declare
  v_kind text:=lower(trim(coalesce(p_kind,'')));
  v_module text;
  v_manager_id uuid;
begin
  if p_from is null or p_to is null or p_to<=p_from then
    raise exception 'MANAGER_INVALID_EVENT_RANGE';
  end if;
  if p_to-p_from>interval '400 days' then
    raise exception 'MANAGER_EVENT_RANGE_TOO_LARGE';
  end if;
  if v_kind not in ('training','match') then
    raise exception 'MANAGER_INVALID_EVENT_KIND';
  end if;
  v_module:=case when v_kind='match' then 'competition.matches' else 'competition.trainings' end;
  if p_team_id is null then
    v_manager_id:=private.cc_manager_require_any_v1(v_module,'view');
  else
    v_manager_id:=private.cc_manager_require_v1(v_module,'view',p_team_id);
  end if;

  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'eventId',e.id,'teamId',e.team_id,'teamName',t.name,'eventType',e.event_type,'title',e.title,
      'startsAt',e.starts_at,'endsAt',e.ends_at,'venue',e.venue,'address',e.address,'court',e.court,
      'color',e.color,'homeAway',e.home_away,'meetingAt',e.meeting_at,'meetingPlace',e.meeting_place,
      'status',e.status,'yesCount',coalesce(a.yes_count,0),'noCount',coalesce(a.no_count,0),'unknownCount',coalesce(a.unknown_count,0)
    ) order by e.starts_at,e.id),'[]'::jsonb)
    from public.events e
    join public.teams t on t.id=e.team_id
    left join lateral (
      select
        count(*) filter (where av.status='going')::int as yes_count,
        count(*) filter (where av.status='not_going')::int as no_count,
        count(*) filter (where av.status is null or av.status='unknown')::int as unknown_count
      from public.team_memberships tm
      join public.players p on p.id=tm.player_id and p.active=true
      left join public.availability av on av.event_id=e.id and av.player_id=p.id
      where tm.team_id=e.team_id
        and tm.active=true
        and tm.starts_on<=((e.starts_at at time zone 'Europe/Budapest')::date)
        and (tm.ends_on is null or tm.ends_on>=((e.starts_at at time zone 'Europe/Budapest')::date))
    ) a on true
    where e.starts_at>=p_from and e.starts_at<p_to
      and e.status<>'cancelled'
      and e.event_type=v_kind
      and (p_team_id is null or e.team_id=p_team_id)
      and exists (
        select 1 from public.manager_module_permissions mp
        where mp.manager_id=v_manager_id and mp.module_key=v_module and mp.can_view=true
          and (mp.team_id is null or mp.team_id=e.team_id)
      )
  );
end;
$$;


create function public.cc_manager_calendar_v2(
  p_from timestamptz,
  p_to timestamptz,
  p_team_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path=public,private,pg_temp
as $$
declare v_manager_id uuid;
begin
  if p_from is null or p_to is null or p_to<=p_from then
    raise exception 'MANAGER_INVALID_CALENDAR_RANGE';
  end if;
  if p_to-p_from>interval '400 days' then
    raise exception 'MANAGER_CALENDAR_RANGE_TOO_LARGE';
  end if;
  if p_team_id is null then
    v_manager_id:=private.cc_manager_require_any_v1('competition.calendar','view');
  else
    v_manager_id:=private.cc_manager_require_v1('competition.calendar','view',p_team_id);
  end if;

  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'eventId',e.id,'teamId',e.team_id,'teamName',t.name,'eventType',e.event_type,'title',e.title,
      'startsAt',e.starts_at,'endsAt',e.ends_at,'venue',e.venue,'address',e.address,'court',e.court,
      'color',e.color,'homeAway',e.home_away,'meetingAt',e.meeting_at,'meetingPlace',e.meeting_place,
      'status',e.status,'yesCount',coalesce(a.yes_count,0),'noCount',coalesce(a.no_count,0),'unknownCount',coalesce(a.unknown_count,0)
    ) order by e.starts_at,e.id),'[]'::jsonb)
    from public.events e
    join public.teams t on t.id=e.team_id
    left join lateral (
      select
        count(*) filter (where av.status='going')::int as yes_count,
        count(*) filter (where av.status='not_going')::int as no_count,
        count(*) filter (where av.status is null or av.status='unknown')::int as unknown_count
      from public.team_memberships tm
      join public.players p on p.id=tm.player_id and p.active=true
      left join public.availability av on av.event_id=e.id and av.player_id=p.id
      where tm.team_id=e.team_id
        and tm.active=true
        and tm.starts_on<=((e.starts_at at time zone 'Europe/Budapest')::date)
        and (tm.ends_on is null or tm.ends_on>=((e.starts_at at time zone 'Europe/Budapest')::date))
    ) a on true
    where e.starts_at>=p_from and e.starts_at<p_to
      and e.status<>'cancelled'
      and (p_team_id is null or e.team_id=p_team_id)
      and exists (
        select 1 from public.manager_module_permissions mp
        where mp.manager_id=v_manager_id and mp.module_key='competition.calendar' and mp.can_view=true
          and (mp.team_id is null or mp.team_id=e.team_id)
      )
  );
end;
$$;

create function public.cc_manager_event_roster_v1(p_event_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=public,private,pg_temp
as $$
declare
  v_team_id uuid;
  v_event_type text;
  v_event_date date;
begin
  select e.team_id,e.event_type,(e.starts_at at time zone 'Europe/Budapest')::date
    into v_team_id,v_event_type,v_event_date
  from public.events e
  where e.id=p_event_id and e.status<>'cancelled';

  if v_team_id is null then
    raise exception 'MANAGER_EVENT_NOT_FOUND';
  end if;

  if not (
       private.cc_manager_can_v1('competition.overview','view',v_team_id)
    or private.cc_manager_can_v1('competition.calendar','view',v_team_id)
    or (v_event_type='match' and private.cc_manager_can_v1('competition.matches','view',v_team_id))
    or (v_event_type<>'match' and private.cc_manager_can_v1('competition.trainings','view',v_team_id))
  ) then
    raise exception 'MANAGER_PERMISSION_DENIED:event_roster:view' using errcode='42501';
  end if;

  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'playerId',p.id,'name',p.name,'displayName',p.display_name,'email',p.email,'position',p.position,
      'jerseyNo',p.jersey_no,'avatarId',ps.avatar_id,
      'status',case av.status when 'going' then 'going' when 'not_going' then 'not_going' else 'none' end,
      'attendanceStatus',av.attendance_status
    ) order by coalesce(p.jersey_no,9999),coalesce(p.display_name,p.name),p.email),'[]'::jsonb)
    from public.team_memberships tm
    join public.players p on p.id=tm.player_id
    left join public.player_settings ps on ps.player_id=p.id
    left join public.availability av on av.event_id=p_event_id and av.player_id=p.id
    where tm.team_id=v_team_id
      and tm.active=true
      and p.active=true
      and tm.starts_on<=v_event_date
      and (tm.ends_on is null or tm.ends_on>=v_event_date)
  );
end;
$$;

revoke all on function public.cc_manager_players_v2(uuid,text) from public,anon;
revoke all on function public.cc_manager_rsvp_matrix_v1(timestamptz,timestamptz,uuid) from public,anon;
revoke all on function public.cc_manager_event_roster_v1(uuid) from public,anon;
revoke all on function public.cc_manager_events_v1(timestamptz,timestamptz,text,uuid) from public,anon;
revoke all on function public.cc_manager_calendar_v2(timestamptz,timestamptz,uuid) from public,anon;

grant execute on function public.cc_manager_players_v2(uuid,text) to authenticated;
grant execute on function public.cc_manager_rsvp_matrix_v1(timestamptz,timestamptz,uuid) to authenticated;
grant execute on function public.cc_manager_event_roster_v1(uuid) to authenticated;
grant execute on function public.cc_manager_events_v1(timestamptz,timestamptz,text,uuid) to authenticated;
grant execute on function public.cc_manager_calendar_v2(timestamptz,timestamptz,uuid) to authenticated;

commit;
