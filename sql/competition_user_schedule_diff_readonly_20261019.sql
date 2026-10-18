-- READ ONLY. 2026-10-19 fixture-diff QA.
-- Only one-to-one exact home/away + league matches; self-matches excluded.
-- Do NOT use these name matches to mutate events or player availability.
with old_raw as (
 select case source_team_id when '709' then 'menB'
        when '299' then 'womenI' when '959' then 'womenIIB' end league_key,
        home_name,away_name,starts_at old_at,source_match_key,linked_event_id
 from public.competition_source_matches
 where season='2026/27'
   and source_team_id in ('709','299','959')
   and starts_at is not null
), old_unique as (
 select *,
  count(*) over(partition by league_key,lower(trim(home_name)),lower(trim(away_name))) pair_count
 from old_raw
), new_raw as (
 select league_key,home_name,away_name,starts_at new_at,source_key
 from public.cc_competition_user_schedule_v1
 where season='2026/27' and record_kind='fixture'
   and league_key in ('menB','womenI','womenIIB')
   and starts_at is not null
), new_unique as (
 select *,
  count(*) over(partition by league_key,lower(trim(home_name)),lower(trim(away_name))) pair_count
 from new_raw
)
select o.league_key,o.home_name,o.away_name,
       to_char(o.old_at at time zone 'Europe/Budapest','YYYY-MM-DD HH24:MI') old_kickoff,
       to_char(n.new_at at time zone 'Europe/Budapest','YYYY-MM-DD HH24:MI') new_kickoff,
       o.source_match_key,n.source_key,o.linked_event_id,
       (select count(*) from public.availability a where a.event_id=o.linked_event_id) existing_presence,
       e.status player_event_status
from old_unique o
join new_unique n on n.league_key=o.league_key
  and lower(trim(n.home_name))=lower(trim(o.home_name))
  and lower(trim(n.away_name))=lower(trim(o.away_name))
left join public.events e on e.id=o.linked_event_id
where o.pair_count=1 and n.pair_count=1
  and lower(trim(o.home_name))<>lower(trim(o.away_name))
  and o.old_at is distinct from n.new_at
order by o.league_key,o.old_at;
