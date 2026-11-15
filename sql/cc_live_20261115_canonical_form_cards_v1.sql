-- CC LIVE 2026-11-15: shared read-only compact form/partial ranking for Manager and Player.
-- Canonical official saved results are authoritative; no separate team/game copies.
-- Provisional position is NOT official league position; neutral trend until 4 matches.
create or replace function private.cc_competition_team_form_cards_v1()
returns jsonb language sql stable set search_path to ''
as $$
with teams as (
 select s->>'competitionLabel' league,s->>'teamKey' team_key,
   s->>'teamName' team_name,(s->>'played')::int played,(s->>'wins')::int wins,
   (s->>'losses')::int losses,(s->>'forfeits')::int forfeits,
   (s->>'setsFor')::int sets_for,(s->>'setsAgainst')::int sets_against
 from jsonb_array_elements(private.cc_competition_canonical_team_stats_v1()) s
),
ranked as (
 select t.*,greatest(0,2*t.wins+t.losses-t.forfeits) points,
 row_number() over(partition by league order by
   (2*wins+losses-forfeits) desc,wins desc,
   (sets_for-sets_against) desc,sets_for desc,team_name collate "C" asc)::int provisional_rank
 from teams t
),
sides as (
 select m.competition_label league,
  private.cc_competition_team_key_v1(m.home_name) team_key,
  m.kickoff_local at time zone 'Europe/Budapest' kickoff,
  m.source_key,
  case when m.home_sets>m.away_sets then 'W' else 'L' end outcome
 from private.cc_canonical_competition_matches_v1 m
 where m.match_status='played' and m.home_sets is not null and m.away_sets is not null
   and m.kickoff_local <= now() at time zone 'Europe/Budapest'
 union all
 select m.competition_label,private.cc_competition_team_key_v1(m.away_name),
  m.kickoff_local at time zone 'Europe/Budapest',m.source_key,
  case when m.away_sets>m.home_sets then 'W' else 'L' end
 from private.cc_canonical_competition_matches_v1 m
 where m.match_status='played' and m.home_sets is not null and m.away_sets is not null
   and m.kickoff_local <= now() at time zone 'Europe/Budapest'
),
ordered as (
 select s.*,row_number() over(partition by league,team_key
  order by kickoff desc,source_key desc)::int recency
 from sides s
 where team_key<>''
),
form as (
 select league,team_key,
   coalesce(jsonb_agg(outcome order by recency desc) filter(where recency<=5),'[]'::jsonb) last_five,
   count(*)::int recorded_matches,
   sum(case when outcome='W' then 1 else 0 end) filter(where recency in (1,2)) newer_wins,
   sum(case when outcome='W' then 1 else 0 end) filter(where recency in (3,4)) older_wins
 from ordered group by league,team_key
)
select coalesce(jsonb_agg(jsonb_build_object(
  'competitionLabel',r.league,'teamKey',r.team_key,'teamName',r.team_name,
  'rank',case when r.played>0 then r.provisional_rank else null end,
  'rankKind','partial_saved_results','officialRankVerified',false,
  'played',r.played,'points',r.points,'won',r.wins,'lost',r.losses,
  'lastFive',coalesce(f.last_five,'[]'::jsonb),
  'trend',case when coalesce(f.recorded_matches,0)<4 then 'flat'
      when f.newer_wins>f.older_wins then 'up'
      when f.newer_wins<f.older_wins then 'down' else 'flat' end,
  'trendBasis',case when coalesce(f.recorded_matches,0)<4 then 'insufficient'
      else 'last_2_vs_previous_2_wins' end
 ) order by r.league,r.provisional_rank),'[]'::jsonb)
 from ranked r left join form f on f.league=r.league and f.team_key=r.team_key;
$$;
revoke all on function private.cc_competition_team_form_cards_v1() from public,anon,authenticated;

-- Add the SAME derived payload to the already permission-guarded snapshots.
-- Preserve the v1 RPC authorization checks exactly.
create or replace function public.cc_manager_competition_mrsz_snapshot_v2()
returns jsonb language plpgsql stable security definer set search_path to ''
as $$
declare v jsonb;
begin
 v:=public.cc_manager_competition_mrsz_snapshot_v1();
 return v||jsonb_build_object(
  'fixtures',private.cc_competition_snapshot_effective_rows_v1('fixture'),
  'matches',private.cc_competition_snapshot_effective_rows_v1('match'),
  'canonicalMatches',private.cc_competition_canonical_payload_v1(),
  'canonicalCoverage',private.cc_competition_canonical_coverage_v1(),
  'canonicalTeamStats',private.cc_competition_canonical_team_stats_v1(),
  'canonicalFormCards',private.cc_competition_team_form_cards_v1(),
  'canonicalFormVersion',1
 );
end;
$$;
create or replace function public.cc_player_competition_mrsz_snapshot_v2()
returns jsonb language plpgsql stable security definer set search_path to ''
as $$
declare v jsonb;
begin
 v:=public.cc_player_competition_mrsz_snapshot_v1();
 return v||jsonb_build_object(
  'fixtures',private.cc_competition_snapshot_effective_rows_v1('fixture'),
  'matches',private.cc_competition_snapshot_effective_rows_v1('match'),
  'canonicalMatches',private.cc_competition_canonical_payload_v1(),
  'canonicalCoverage',private.cc_competition_canonical_coverage_v1(),
  'canonicalTeamStats',private.cc_competition_canonical_team_stats_v1(),
  'canonicalFormCards',private.cc_competition_team_form_cards_v1(),
  'canonicalFormVersion',1
 );
end;
$$;
revoke all on function public.cc_manager_competition_mrsz_snapshot_v2() from public,anon;
revoke all on function public.cc_player_competition_mrsz_snapshot_v2() from public,anon;
grant execute on function public.cc_manager_competition_mrsz_snapshot_v2() to authenticated;
grant execute on function public.cc_player_competition_mrsz_snapshot_v2() to authenticated;
