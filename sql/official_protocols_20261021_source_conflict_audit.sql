-- Read-only, season/league-scoped source discrepancy release preflight.
-- NO automatic alias mapping, no historical source overwrites and no LIVE DML.
-- Federation PDF evidence #2686/#2700 is dated 2026-10-21; the older,
-- separately stored user schedule has 2026-10-28 fixtures. Keep both sources
-- and identify the legacy conflict rather than treating it as a second result.
WITH targets (
    match_code, league_key, competition_label, canonical_fixture_key,
    legacy_source_key, home_source_team_id, away_source_team_id,
    original_local_kickoff, legacy_local_kickoff
) AS (
 VALUES
 ('2686','womenI','Női Budapest I. osztály',
  '20261001:fixture:39','ui20261018:womenI:mtk:panoramase:1',
  '1092','753','2026-10-21 21:00'::timestamp,'2026-10-28 20:45'::timestamp),
 ('2700','menB','Férfi Budapest I. osztály – B csoport',
  'brsz:2026/27:menB:userofficial:01',
  'ui20261018:menB:mozduljse:mafcvasarhelyi:1',
  '1213','45','2026-10-21 20:00'::timestamp,'2026-10-28 20:00'::timestamp)
),
matrix AS (
 SELECT
   t.match_code, t.league_key, t.competition_label,
   t.canonical_fixture_key, t.legacy_source_key,
   c.match_id AS canonical_id,
   c.match_status AS canonical_status,
   c.kickoff_local AS canonical_local_kickoff,
   s.record_kind AS raw_record_kind,
   s.data->>'officialProtocolMatchCode' AS overlay_match_code,
   l.source_status AS legacy_status,
   l.record_kind AS legacy_record_kind,
   l.starts_at AT TIME ZONE 'Europe/Budapest' AS legacy_local_kickoff,
   CASE
    WHEN c.match_id IS NULL OR s.source_key IS NULL OR l.source_key IS NULL
      THEN 'BLOCK_MISSING_EXPLICIT_SOURCE'
    WHEN c.season<>'2026/27'
      OR c.competition_label<>t.competition_label
      OR c.home_source_team_id<>t.home_source_team_id
      OR c.away_source_team_id<>t.away_source_team_id
      THEN 'BLOCK_CANONICAL_SCOPE_DRIFT'
    WHEN c.kickoff_local IS DISTINCT FROM t.original_local_kickoff
      OR s.record_kind<>'fixture'
      THEN 'BLOCK_ORIGINAL_FIXTURE_DRIFT'
    WHEN l.season<>'2026/27' OR l.league_key<>t.league_key
      OR l.source_status<>'scheduled' OR l.record_kind<>'fixture'
      OR (l.starts_at AT TIME ZONE 'Europe/Budapest') IS DISTINCT FROM t.legacy_local_kickoff
      OR l.match_date IS DISTINCT FROM '2026-10-28'::date
      THEN 'BLOCK_LEGACY_SOURCE_DRIFT'
    WHEN c.match_status='scheduled' AND s.data->>'officialProtocolMatchCode' IS NULL
      THEN 'STAGED_LEGACY_DATE_CONFLICT'
    WHEN c.match_status='played' AND s.data->>'officialProtocolMatchCode'=t.match_code
      THEN 'OVERLAID_LEGACY_SOURCE_RETAINED'
    ELSE 'BLOCK_UNKNOWN_RESULT_STATE'
   END AS review_status
 FROM targets t
 LEFT JOIN private.cc_canonical_competition_matches_v1 c
   ON c.source_key=t.canonical_fixture_key
 LEFT JOIN public.cc_competition_mrsz_screenshot_v1 s
   ON s.source_key=t.canonical_fixture_key
 LEFT JOIN public.cc_competition_user_schedule_v1 l
   ON l.source_key=t.legacy_source_key
),
postponements AS (
 SELECT league_key,
        count(*) AS postponed_total,
        count(*) FILTER(WHERE starts_at IS NULL AND match_date IS NULL) AS undated_total
 FROM public.cc_competition_user_schedule_v1
 WHERE season='2026/27' AND source_status='postponed'
 GROUP BY league_key
)
SELECT jsonb_build_object(
 'sourceDiscrepancies',(SELECT jsonb_agg(to_jsonb(m) ORDER BY m.match_code) FROM matrix m),
 'postponedByLeague',(SELECT jsonb_agg(to_jsonb(p) ORDER BY p.league_key) FROM postponements p),
 'allPostponementsUndated',(SELECT coalesce(bool_and(postponed_total=undated_total),true) FROM postponements),
 'canonicalMatchCount',(SELECT count(*) FROM private.cc_canonical_competition_matches_v1),
 'canonicalPlayedCount',(SELECT count(*) FROM private.cc_canonical_competition_matches_v1 WHERE match_status='played')
) AS official_source_conflict_audit;
