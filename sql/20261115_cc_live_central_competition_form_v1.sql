-- Club Control LIVE – shared read-only compact form/trend feed.
-- A league and group are separate partitions. Ranks are PROVISIONAL, not official.
-- Inputs: canonical completed results; no user-authored local forecasts.
-- Safe to call only through existing authorised Manager/Player snapshot v2 RPCs.
create or replace function private.cc_competition_form_insights_v1()
returns jsonb
language sql stable set search_path to ''
as $form$
with ranked_stats as (
  select s.competition_label, s.team_key,s.team_name,s.played,s.wins,s.losses,
    s.forfeits,s.sets_for,s.sets_against,
    2*s.wins+s.losses-s.forfeits as provisional_points,
    row_number() over (
      partition by s.competition_label
      order by (2*s.wins+s.losses-s.forfeits) desc,
        s.wins desc,(s.sets_for-s.sets_against) desc,
        s.sets_for desc,s.team_name asc
    ) as provisional_position
  from (
    select
      x->>'competitionLabel' as competition_label,
      x->>'teamKey' as team_key,
      x->>'teamName' as team_name,
      coalesce((x->>'played')::int,0) as played,
      coalesce((x->>'wins')::int,0) as wins,
      coalesce((x->>'losses')::int,0) as losses,
      coalesce((x->>'forfeits')::int,0) as forfeits,
      coalesce((x->>'setsFor')::int,0) as sets_for,
      coalesce((x->>'setsAgainst')::int,0) as sets_against
    from jsonb_array_elements(private.cc_competition_canonical_team_stats_v1()) x
  ) s
), completed_team_rows as (
  select m.competition_label,
    private.cc_competition_team_key_v1(m.home_name) as team_key,
    m.kickoff_local,m.source_key,(m.home_sets>m.away_sets) as won
  from private.cc_canonical_competition_matches_v1 m
  where m.match_status='played'
    and m.home_sets is not null and m.away_sets is not null
    and m.kickoff_local <= now() at time zone 'Europe/Budapest'
  union all
  select m.competition_label,
    private.cc_competition_team_key_v1(m.away_name),
    m.kickoff_local,m.source_key,(m.away_sets>m.home_sets)
  from private.cc_canonical_competition_matches_v1 m
  where m.match_status='played'
    and m.home_sets is not null and m.away_sets is not null
    and m.kickoff_local <= now() at time zone 'Europe/Budapest'
), ordered_form as (
  select *,
    row_number() over (
      partition by competition_label,team_key
      order by kickoff_local desc,source_key desc
    ) as newest
  from completed_team_rows where team_key<>''
), form_stats as (
  select competition_label,team_key,
    count(*)::int as recorded_games,
    coalesce(jsonb_agg(case when won then 'W' else 'L' end order by kickoff_local,source_key)
      filter(where newest<=5),'[]'::jsonb) as last_five,
    count(*) filter(where newest<=2 and won) as recent_two_wins,
    count(*) filter(where newest between 3 and 4 and won) as previous_two_wins
  from ordered_form group by competition_label,team_key
), coverage as (
  select m.competition_label,count(*)::int as scheduled_total,
    count(*) filter(where m.match_status='played')::int as recorded_total
  from private.cc_canonical_competition_matches_v1 m
  group by m.competition_label
)
select coalesce(jsonb_agg(jsonb_build_object(
  'competitionLabel',r.competition_label,
  'teamKey',r.team_key,
  'teamName',r.team_name,
  'position',case when r.played>0 then r.provisional_position else null end,
  'officialRankVerified',false,
  'rankSource','partial_recorded_results',
  'played',r.played,
  'wins',r.wins,
  'losses',r.losses,
  'tablePoints',r.provisional_points,
  'form',coalesce(f.last_five,'[]'::jsonb),
  'trend',case
    when coalesce(f.recorded_games,0)<4 then 'insufficient'
    when f.recent_two_wins>f.previous_two_wins then 'up'
    when f.recent_two_wins<f.previous_two_wins then 'down'
    else 'flat'
  end,
  'trendBasis','last_2_vs_previous_2_wins',
  'coveragePlayed',c.recorded_total,
  'coverageTotal',c.scheduled_total
) order by r.competition_label,r.provisional_position,r.team_name),'[]'::jsonb)
from ranked_stats r
left join form_stats f using(competition_label,team_key)
left join coverage c using(competition_label);
$form$;

revoke all on function private.cc_competition_form_insights_v1() from public,anon,authenticated;

-- Existing authorised v1 RPC remains the access gate; no new public endpoint.
create or replace function public.cc_manager_competition_mrsz_snapshot_v2()
returns jsonb language plpgsql stable security definer set search_path to ''
as $manager$
declare v jsonb;
begin
  v:=public.cc_manager_competition_mrsz_snapshot_v1();
  return v || jsonb_build_object(
    'fixtures',private.cc_competition_snapshot_effective_rows_v1('fixture'),
    'matches',private.cc_competition_snapshot_effective_rows_v1('match'),
    'canonicalMatches',private.cc_competition_canonical_payload_v1(),
    'canonicalCoverage',private.cc_competition_canonical_coverage_v1(),
    'canonicalTeamStats',private.cc_competition_canonical_team_stats_v1(),
    'formInsights',private.cc_competition_form_insights_v1()
  );
end $manager$;

create or replace function public.cc_player_competition_mrsz_snapshot_v2()
returns jsonb language plpgsql stable security definer set search_path to ''
as $player$
declare v jsonb;
begin
  v:=public.cc_player_competition_mrsz_snapshot_v1();
  return v || jsonb_build_object(
    'fixtures',private.cc_competition_snapshot_effective_rows_v1('fixture'),
    'matches',private.cc_competition_snapshot_effective_rows_v1('match'),
    'canonicalMatches',private.cc_competition_canonical_payload_v1(),
    'canonicalCoverage',private.cc_competition_canonical_coverage_v1(),
    'canonicalTeamStats',private.cc_competition_canonical_team_stats_v1(),
    'formInsights',private.cc_competition_form_insights_v1()
  );
end $player$;

revoke all on function public.cc_manager_competition_mrsz_snapshot_v2() from public,anon;
revoke all on function public.cc_player_competition_mrsz_snapshot_v2() from public,anon;
grant execute on function public.cc_manager_competition_mrsz_snapshot_v2() to authenticated;
grant execute on function public.cc_player_competition_mrsz_snapshot_v2() to authenticated;
