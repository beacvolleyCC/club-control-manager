-- SNAPSHOT of current LIVE private canonical stats functions for synthetic CI ONLY.
-- Fixtures must call actual PostgreSQL functions; production is not changed.
CREATE OR REPLACE FUNCTION private.cc_competition_canonical_team_stats_v1()
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
with match_points as (
 select m.*,
 case when m.match_status='played' and jsonb_typeof(m.set_scores)='array'
             and jsonb_array_length(m.set_scores)=m.home_sets+m.away_sets
      then (select sum((v->>'home')::int) from jsonb_array_elements(m.set_scores) v)
      else null end as pts_home,
 case when m.match_status='played' and jsonb_typeof(m.set_scores)='array'
             and jsonb_array_length(m.set_scores)=m.home_sets+m.away_sets
      then (select sum((v->>'away')::int) from jsonb_array_elements(m.set_scores) v)
      else null end as pts_away
 from private.cc_canonical_competition_matches_v1 m
),
team_entries as (
 select m.competition_label,m.home_name as team_name,
 private.cc_competition_team_key_v1(m.home_name) as team_key,
 m.match_status,m.home_sets as sets_for,m.away_sets as sets_against,
 m.pts_home as points_for,m.pts_away as points_against,
 (m.home_sets>m.away_sets) as won
 from match_points m
 union all
 select m.competition_label,m.away_name,
 private.cc_competition_team_key_v1(m.away_name),
 m.match_status,m.away_sets,m.home_sets,m.pts_away,m.pts_home,
 (m.away_sets>m.home_sets)
 from match_points m
),
stats as (
 select competition_label,team_key,
 (array_agg(team_name order by case when match_status='played' then 1 else 0 end,team_name))[1] team_name,
 count(*) filter(where match_status='played') played,
 count(*) filter(where match_status='played' and won) wins,
 count(*) filter(where match_status='played' and not won) losses,
 coalesce(sum(sets_for) filter(where match_status='played'),0) sets_for,
 coalesce(sum(sets_against) filter(where match_status='played'),0) sets_against,
 case when count(*) filter(where match_status='played')=0 then null
      when count(*) filter(where match_status='played')=count(points_for) filter(where match_status='played') then sum(points_for) filter(where match_status='played')
      else null end points_for,
 case when count(*) filter(where match_status='played')=0 then null
      when count(*) filter(where match_status='played')=count(points_against) filter(where match_status='played') then sum(points_against) filter(where match_status='played')
      else null end points_against
 from team_entries where team_key<>''
 group by competition_label,team_key
)
select coalesce(jsonb_agg(jsonb_build_object(
 'competitionLabel',competition_label,'teamKey',team_key,'teamName',team_name,
 'played',played,'wins',wins,'losses',losses,'setsFor',sets_for,'setsAgainst',sets_against,
 'pointsFor',points_for,'pointsAgainst',points_against,
 'position',null,'tablePoints',null,'source','canonical_official_results_partial',
 'officialRankVerified',false
) order by competition_label,team_name),'[]'::jsonb) from stats;
$function$

CREATE OR REPLACE FUNCTION private.cc_competition_team_key_v1(p_name text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
select case k
 when 'kando' then 'kando'
 when 'kandosc' then 'kando'
 when 'kandosportklub' then 'kando'
 when 'kandosportclub' then 'kando'
 when 'obudaiegyetemkandosc' then 'kando'
 when 'btdse' then 'btdse'
 when 'btdsetaksony' then 'btdse'
 when 'broziktibortaksonyidiaksportegyesulet' then 'btdse'
 when 'semmelweisegyetem' then 'semmelweis'
 when 'semmelweisegyetemsportklub' then 'semmelweis'
 when 'emericus' then 'emericus'
 when 'emericusse' then 'emericus'
 when 'mozduj' then 'mozdulj'
 when 'mozdulj' then 'mozdulj'
 when 'mozduljse' then 'mozdulj'
 when 'mtkbudapest' then 'mtk'
 when 'mtk' then 'mtk'
 when 'mtkkek' then 'mtkkek'
 when 'mtkbudapestkek' then 'mtkkek'
 when 'kozgaznoi' then 'kozgazsc'
 when 'kozgazsc' then 'kozgazsc'
 when 'budapestiegyetemiatletikaiclub' then 'beac'
 when 'budapestiegyetemiatletikaiclubii' then 'beacii'
 when 'beacii' then 'beacii'
 when 'beac' then 'beac'
 when 'piaristadiaksportegyesulet' then 'pdse'
 when 'pdse' then 'pdse'
 when 'kresc' then 'kresc'
 when 'karoligasparreformatusegyetemsportcluba' then 'kresc'
 when 'rackevese' then 'rackeve'
 when 'rackeve' then 'rackeve'
 when 'uteu20pink' then 'uteu20pink'
 else k end
from (select regexp_replace(translate(lower(coalesce(p_name,'')),
 'áéíóöőúüű','aeiooouuu'),'[^a-z0-9]','','g') as k) x;
$function$
