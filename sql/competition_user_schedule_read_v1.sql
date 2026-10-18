-- 2026/27 provided fixture integration. Save the original BRSZ and snapshot records unchanged.
alter table public.cc_competition_match_overrides_v1
  drop constraint if exists cc_competition_match_overrides_v1_source_system_check;
alter table public.cc_competition_match_overrides_v1
  add constraint cc_competition_match_overrides_v1_source_system_check
  check(source_system in ('snapshot','brsz','user'));

create or replace function private.cc_competition_match_source_v1(p_system text,p_season text,p_key text)
returns jsonb language plpgsql stable security invoker set search_path = '' as $function$
declare v jsonb;
begin
  if p_system='snapshot' then
    select s.data into v from public.cc_competition_mrsz_screenshot_v1 s
    where s.season=p_season and s.source_key=p_key and s.record_kind in ('fixture','match');
  elsif p_system='brsz' then
    select jsonb_build_object(
      'season',s.season,'source',s.source,'sourceMatchKey',s.source_match_key,
      'competitionLabel',(select m.competition_label from public.competition_source_team_maps m
        where m.source=s.source and m.season=s.season and m.internal_team_id=s.internal_team_id
        order by m.enabled desc limit 1),
      'homeName',s.home_name,'awayName',s.away_name,'startsAt',s.starts_at,
      'venue',s.venue,'homeSets',s.home_sets,'awaySets',s.away_sets,
      'setScores',coalesce(s.set_scores,'[]'::jsonb),'status',s.source_status,
      'sourceUrl',s.source_url
    ) into v
    from public.competition_source_matches s
    where s.source='brsz' and s.season=p_season and s.source_match_key=p_key;
  elsif p_system='user' then
    select jsonb_build_object(
      'source','user_brsz_20261018','season',s.season,'sourceMatchKey',s.source_key,
      'competitionLabel',case s.league_key
        when 'menA' then 'Férfi Budapest I. osztály – A csoport'
        when 'menB' then 'Férfi Budapest I. osztály – B csoport'
        when 'womenI' then 'Női Budapest I. osztály'
        when 'womenIIA' then 'Női Budapest II. osztály – A csoport'
        when 'womenIIB' then 'Női Budapest II. osztály – B csoport' end,
      'homeName',s.home_name,'awayName',s.away_name,
      'startsAt',case when s.starts_at is null then
          to_char(s.match_date,'YYYY-MM-DD')
        else to_char(s.starts_at at time zone 'Europe/Budapest','YYYY-MM-DD"T"HH24:MI:SS') end,
      'matchDate',s.match_date,'venue',s.venue,'referee',s.referee,
      'homeSets',s.home_sets,'awaySets',s.away_sets,'setScores',s.set_scores,
      'status',s.source_status,'recordKind',s.record_kind
    ) into v
    from public.cc_competition_user_schedule_v1 s
    where s.season=p_season and s.source_key=p_key;
  else
    raise exception 'MATCH_SOURCE_INVALID' using errcode='22023';
  end if;
  if v is null then raise exception 'MATCH_SOURCE_NOT_FOUND' using errcode='22023'; end if;
  return v;
end;
$function$;

create or replace function private.cc_competition_user_effective_rows_v1()
returns jsonb language sql stable security invoker set search_path='' as $function$
select coalesce(jsonb_agg(
  jsonb_build_object(
    'source','user_brsz_20261018','season',s.season,'sourceMatchKey',s.source_key,
    'competitionLabel',case s.league_key
      when 'menA' then 'Férfi Budapest I. osztály – A csoport'
      when 'menB' then 'Férfi Budapest I. osztály – B csoport'
      when 'womenI' then 'Női Budapest I. osztály'
      when 'womenIIA' then 'Női Budapest II. osztály – A csoport'
      when 'womenIIB' then 'Női Budapest II. osztály – B csoport' end,
    'homeName',s.home_name,'awayName',s.away_name,
    'startsAt',case when s.starts_at is null then to_char(s.match_date,'YYYY-MM-DD')
      else to_char(s.starts_at at time zone 'Europe/Budapest','YYYY-MM-DD"T"HH24:MI:SS') end,
    'matchDate',s.match_date,'venue',s.venue,'referee',s.referee,
    'status',s.source_status,'homeSets',s.home_sets,'awaySets',s.away_sets,'setScores',s.set_scores,
    '_ccSourceSystem','user','_ccSourceKey',s.source_key,
    '_ccSourceKind',s.record_kind,'_ccOriginalStartsAt',case when s.starts_at is null
      then to_char(s.match_date,'YYYY-MM-DD')
      else to_char(s.starts_at at time zone 'Europe/Budapest','YYYY-MM-DD"T"HH24:MI:SS') end,
    '_ccOriginalHomeName',s.home_name,'_ccOriginalAwayName',s.away_name,
    '_ccOverrideVersion',coalesce(o.version,0),
    '_ccManualOverride',coalesce(o.patch<>'{}'::jsonb,false),
    '_ccImportedDate','2026-10-18','_ccUserSupplied',true
  ) || coalesce(o.patch,'{}'::jsonb)
  order by s.match_date nulls last,s.starts_at nulls last,s.source_key
),'[]'::jsonb)
from public.cc_competition_user_schedule_v1 s
left join public.cc_competition_match_overrides_v1 o on
 o.source_system='user' and o.season=s.season and o.source_key=s.source_key
where s.season='2026/27';
$function$;

create or replace function public.cc_manager_competition_user_schedule_v1()
returns jsonb language plpgsql stable security definer set search_path='' as $function$
begin
  perform private.cc_manager_require_any_v1('competition.matches','view');
  return private.cc_competition_user_effective_rows_v1();
end;
$function$;

create or replace function public.cc_player_competition_user_schedule_v1()
returns jsonb language plpgsql stable security definer set search_path='' as $function$
declare v_check jsonb;
begin
  -- The existing signed-in/active team-member read enforces Player access.
  v_check:=public.cc_player_competition_mrsz_snapshot_v1();
  return private.cc_competition_user_effective_rows_v1();
end;
$function$;

revoke all on function public.cc_manager_competition_user_schedule_v1()
 from public,anon,authenticated;
revoke all on function public.cc_player_competition_user_schedule_v1()
 from public,anon,authenticated;
grant execute on function public.cc_manager_competition_user_schedule_v1() to authenticated;
grant execute on function public.cc_player_competition_user_schedule_v1() to authenticated;
