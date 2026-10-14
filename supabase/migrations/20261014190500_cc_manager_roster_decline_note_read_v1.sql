-- Applied to production 2026-10-14. Read-only exposure of not-going notes to authorized Manager roster.
CREATE OR REPLACE FUNCTION public.cc_manager_event_roster_v1(p_event_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private', 'pg_temp'
AS $function$
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
      'note',case when av.status='not_going' then coalesce(av.note,'') else '' end,
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
$function$

