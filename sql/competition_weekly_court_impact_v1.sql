-- CC Club Control: weekly competition-training court impact.
-- Read-only manager RPC. Meeting times NEVER participate in court calculations.
-- Production permissions: authenticated Manager must have competition.matches VIEW.
create or replace function public.cc_manager_court_impact_v1(
  p_from date default current_date,
  p_to date default (current_date + 84)
)
returns jsonb
language plpgsql
stable security definer
set search_path = ''
as $function$
declare
  v_from date := coalesce(p_from, current_date);
  v_to date := coalesce(p_to, current_date+84);
  v_mass_horizon date;
  v_rows jsonb;
begin
  perform private.cc_manager_require_any_v1('competition.matches','view');
  if v_to < v_from or v_to-v_from > 370 then
    raise exception 'COURT_IMPACT_INVALID_DATE_RANGE' using errcode='22023';
  end if;
  select max(event_date) into v_mass_horizon
  from public.mass_events
  where active is true and upper(coalesce(session_type,'')) <> 'VERSENYSPORT';

  with training as (
    select e.id, e.team_id, e.starts_at, e.ends_at, e.court, e.status,
      (e.starts_at at time zone 'Europe/Budapest')::date as local_day,
      substring(regexp_replace(coalesce(e.court,''),'[^0-9]','','g') from 1 for 1) as court_no
    from public.events e
    where e.event_type='training'
      and (e.starts_at at time zone 'Europe/Budapest')::date between v_from and v_to
  ), paired as (
    select t.*, tm.name as team_name,
      m.id as match_id, m.starts_at as match_start, m.title as match_title,
      m.home_away as match_side, m.status as match_status,
      case when m.home_away='home' then
        case t.team_id
          when '10000000-0000-4000-8000-000000000002'::uuid then '2'
          else '3'
        end
      else null end as home_match_court
    from training t
    join public.teams tm on tm.id=t.team_id
    left join lateral (
      select e.id,e.starts_at,e.title,e.home_away,e.status
      from public.events e
      where e.team_id=t.team_id and e.event_type='match' and e.status='active'
        and (e.starts_at at time zone 'Europe/Budapest')::date=t.local_day
        and e.title not ilike '%ELLENFÉL JAVÍTANDÓ%'
        and e.title not ilike '%NEM BIZTOS IDŐPONT%'
        and e.title not ilike '%BEAC – BEAC%'
      order by abs(extract(epoch from (e.starts_at-t.starts_at))),e.id
      limit 1
    ) m on true
    where t.status='cancelled' or m.id is not null
  ), scored as (
    select p.*,
      coalesce((select count(*) from public.availability a
        where a.event_id=p.id and a.status='going'),0)::integer as training_going,
      exists(
        select 1 from public.mass_events me
        where me.active is true and me.event_date=p.local_day
          and upper(coalesce(me.session_type,''))<>'VERSENYSPORT'
          and substring(regexp_replace(coalesce(me.court,''),'[^0-9]','','g') from 1 for 1)=p.court_no
          and me.start_time < (coalesce(p.ends_at,p.starts_at+interval '2 hours') at time zone 'Europe/Budapest')::time
          and me.end_time > (p.starts_at at time zone 'Europe/Budapest')::time
      ) as active_mass_overlap,
      exists(
        select 1 from public.events e
        where e.status='active' and e.event_type='training' and e.id<>p.id
          and (e.starts_at at time zone 'Europe/Budapest')::date=p.local_day
          and substring(regexp_replace(coalesce(e.court,''),'[^0-9]','','g') from 1 for 1)=p.court_no
          and e.starts_at<coalesce(p.ends_at,p.starts_at+interval '2 hours')
          and coalesce(e.ends_at,e.starts_at+interval '2 hours')>p.starts_at
      ) as other_training_overlap,
      exists(
        select 1 from public.events e
        where e.status='active' and e.event_type='match' and e.home_away='home'
          and (e.starts_at at time zone 'Europe/Budapest')::date=p.local_day
          and (case e.team_id when '10000000-0000-4000-8000-000000000002'::uuid then '2' else '3' end)=p.court_no
          and e.starts_at < coalesce(p.ends_at,p.starts_at+interval '2 hours')
      ) as other_home_match_overlap
    from paired p
  )
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'weekStart',(local_day-(extract(isodow from local_day)::integer-1)),
      'date',local_day,
      'teamName',team_name,
      'teamId',team_id,
      'trainingId',id,
      'trainingStart',starts_at,
      'trainingEnd',ends_at,
      'trainingCourt',court,
      'trainingStatus',status,
      'trainingGoing',training_going,
      'matchId',match_id,
      'matchStart',match_start,
      'matchTitle',match_title,
      'matchSide',match_side,
      'homeMatchCourt',home_match_court,
      'massOverlap',active_mass_overlap,
      'otherTrainingOverlap',other_training_overlap,
      'homeMatchOverlap',other_home_match_overlap,
      'massCalendarCovered',v_mass_horizon is not null and local_day<=v_mass_horizon,
      'courtImpact',case
        when match_id is null then 'cancellation_unmatched'
        when status='active' then 'training_match_conflict'
        when match_side='home' then 'home_match_occupied'
        when active_mass_overlap or other_training_overlap or other_home_match_overlap then 'away_court_not_free'
        when v_mass_horizon is null or local_day>v_mass_horizon then 'away_potential_free_unconfirmed'
        else 'away_potential_free'
      end
    ) order by local_day,starts_at,team_name,id
  ),'[]'::jsonb) into v_rows from scored;

  return jsonb_build_object(
    'generatedAt',now(),
    'massCalendarCoveredThrough',v_mass_horizon,
    'from',v_from,'to',v_to,
    'rows',coalesce(v_rows,'[]'::jsonb)
  );
end;
$function$;

revoke all on function public.cc_manager_court_impact_v1(date,date) from public;
revoke all on function public.cc_manager_court_impact_v1(date,date) from anon;
grant execute on function public.cc_manager_court_impact_v1(date,date) to authenticated;
