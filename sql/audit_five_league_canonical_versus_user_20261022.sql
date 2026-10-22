-- CC-FOLYTATAS 2026-10-22: five-league fixture crosswalk.
-- READ ONLY. Never INSERT/UPDATE/DELETE. Similar teams are normalized by the
-- existing private function, but candidates are NOT approved alias mappings.
WITH legacy AS (
 SELECT u.*,
  CASE u.league_key
   WHEN 'menA' THEN 'Férfi Budapest I. osztály – A csoport'
   WHEN 'menB' THEN 'Férfi Budapest I. osztály – B csoport'
   WHEN 'womenI' THEN 'Női Budapest I. osztály'
   WHEN 'womenIIA' THEN 'Női Budapest II. osztály – A csoport'
   WHEN 'womenIIB' THEN 'Női Budapest II. osztály – B csoport'
  END AS league,
  private.cc_competition_team_key_v1(u.home_name) AS home_key,
  private.cc_competition_team_key_v1(u.away_name) AS away_key
 FROM public.cc_competition_user_schedule_v1 u WHERE u.season='2026/27'
),
canonical AS (
 SELECT c.*,private.cc_competition_team_key_v1(c.home_name) AS home_key,
  private.cc_competition_team_key_v1(c.away_name) AS away_key
 FROM private.cc_canonical_competition_matches_v1 c WHERE c.season='2026/27'
),
crosswalk AS (
 SELECT u.*,p.pair_count,p.day_count,
  c.source_key AS candidate_key,c.match_id AS candidate_match_id,
  c.kickoff_local AS candidate_local,c.match_status AS candidate_status,
  c.home_sets AS candidate_home_sets,c.away_sets AS candidate_away_sets,
  (SELECT count(*) FROM legacy other
   WHERE other.source_key<>u.source_key AND other.league=u.league
    AND other.home_key=u.home_key AND other.away_key=u.away_key
    AND other.match_date=c.kickoff_local::date) AS other_legacy_on_candidate_day
 FROM legacy u
 CROSS JOIN LATERAL (
  SELECT count(*) AS pair_count,
   count(*) FILTER (WHERE x.kickoff_local::date=u.match_date) AS day_count
  FROM canonical x
  WHERE x.competition_label=u.league
   AND x.home_key=u.home_key AND x.away_key=u.away_key
 ) p
 LEFT JOIN LATERAL (
  SELECT x.* FROM canonical x
  WHERE x.competition_label=u.league
   AND x.home_key=u.home_key AND x.away_key=u.away_key
  ORDER BY (x.kickoff_local::date=u.match_date) DESC NULLS LAST,
   x.kickoff_local NULLS LAST,x.source_key LIMIT 1
 ) c ON TRUE
),
classified AS (
 SELECT x.*,
 CASE
  WHEN day_count=1 AND starts_at IS NULL AND record_kind='result'
   THEN 'MATCHED_RESULT_NO_TIME'
  WHEN day_count=1 AND starts_at=(candidate_local AT TIME ZONE 'Europe/Budapest')
   THEN 'MATCHED_EXACT'
  WHEN day_count=1 THEN 'MATCHED_TIME_REVIEW'
  WHEN day_count>1 THEN 'AMBIGUOUS_SAME_DAY'
  WHEN pair_count>0 AND match_date IS NULL AND source_status='postponed'
   AND candidate_local IS NULL AND candidate_status='postponed'
   THEN 'POSTPONED_UNDATED_BOTH'
  WHEN pair_count>0 AND match_date IS NULL AND source_status='postponed'
   THEN 'POSTPONED_RESCHEDULED_REVIEW'
  WHEN pair_count>0 AND other_legacy_on_candidate_day>0
   THEN 'EXTRA_LEGACY_PAIR_REVIEW'
  WHEN pair_count>0 THEN 'DIFFERENT_DAY_REVIEW'
  WHEN home_key=away_key THEN 'UNVERIFIED_SELF_FIXTURE'
  ELSE 'NO_TEAM_PAIR_REVIEW'
 END AS review_class
 FROM crosswalk x
)
SELECT jsonb_build_object(
 'auditedSeason','2026/27',
 'legacyTotal',(SELECT count(*) FROM legacy),
 'canonicalTotal',(SELECT count(*) FROM canonical),
 'leagueSummary',(
  SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY league_key),'[]'::jsonb)
  FROM (SELECT league_key,count(*) AS legacy_rows,
   count(*) FILTER (WHERE day_count=1) AS same_day,
   count(*) FILTER (WHERE review_class='MATCHED_EXACT') AS exact_kickoff,
   count(*) FILTER (WHERE review_class='MATCHED_RESULT_NO_TIME') AS result_without_time,
   count(*) FILTER (WHERE review_class NOT IN ('MATCHED_EXACT','MATCHED_RESULT_NO_TIME')) AS needs_categorization
   FROM classified GROUP BY league_key) t
 ),
 'classSummary',(
  SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY review_class),'[]'::jsonb)
  FROM (SELECT review_class,count(*) AS n FROM classified GROUP BY review_class) t
 ),
 'reviewRecords',(
  SELECT coalesce(jsonb_agg(jsonb_build_object(
   'league',league_key,'legacyKey',source_key,'home',home_name,'away',away_name,
   'legacyDay',match_date,'legacyStatus',source_status,'classification',review_class,
   'candidateSource',candidate_key,'candidateMatchId',candidate_match_id,
   'candidateKickoffLocal',candidate_local,'candidateStatus',candidate_status,
   'pairCount',pair_count,'otherLegacySameDay',other_legacy_on_candidate_day
   ) ORDER BY league_key,source_key),'[]'::jsonb)
  FROM classified WHERE review_class NOT IN ('MATCHED_EXACT','MATCHED_RESULT_NO_TIME')
 ),
 'staleLegacyFixtureStatus',(
  SELECT coalesce(jsonb_agg(jsonb_build_object(
   'legacyKey',source_key,'league',league_key,'candidate',candidate_key,
   'canonicalStatus',candidate_status,'canonicalScore',
     jsonb_build_array(candidate_home_sets,candidate_away_sets)
  ) ORDER BY league_key,source_key),'[]'::jsonb)
  FROM classified
  WHERE day_count=1 AND record_kind='fixture' AND candidate_status='played'
   AND source_status<>'played'
 ),
 'legacyResultConflicts',(
  SELECT coalesce(jsonb_agg(jsonb_build_object(
   'legacyKey',source_key,'candidate',candidate_key,
   'score',jsonb_build_array(home_sets,away_sets),'canonicalScore',jsonb_build_array(candidate_home_sets,candidate_away_sets)
  ) ORDER BY source_key),'[]'::jsonb)
  FROM classified
  WHERE record_kind='result' AND
    (day_count<>1 OR home_sets IS DISTINCT FROM candidate_home_sets
      OR away_sets IS DISTINCT FROM candidate_away_sets)
 ),
 'canonicalUnmatchedByDay',(
  SELECT count(*) FROM canonical c
  WHERE NOT EXISTS (
   SELECT 1 FROM legacy u WHERE u.league=c.competition_label
     AND u.home_key=c.home_key AND u.away_key=c.away_key
     AND u.match_date=c.kickoff_local::date
  )
 )
) AS audit;
