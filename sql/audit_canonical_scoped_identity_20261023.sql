-- CC-FOLYTATÁS — read-only competition-scoped identity audit (2026-10-23).
-- Safe to rerun. No INSERT/UPDATE/DELETE/DDL, no alias auto-linking.
-- Canonical match identity MUST include season and competition/grade/group,
-- the source team's own ID and home/away direction; names/dates are only hints.
-- The three explicitly documented source IDs are DISTINCT:
-- 1092 = MTK Budapest (women Budapest I);
-- 1165 = MTK Budapest kék (women Budapest II/B);
-- 1215 = RKSK felnőtt női (women Budapest II/B).
-- All totals are snapshots, not permanently fixed production invariants.
WITH canonical AS (
  SELECT match_id, source_key, season, competition_label,
         home_source_team_id, away_source_team_id,
         home_name, away_name, kickoff_local, match_status
  FROM private.cc_canonical_competition_matches_v1
),
scoped_duplicates AS (
  SELECT season, competition_label,
         home_source_team_id, away_source_team_id, kickoff_local,
         count(*) AS occurrences
  FROM canonical
  WHERE kickoff_local IS NOT NULL
    AND home_source_team_id IS NOT NULL
    AND away_source_team_id IS NOT NULL
  GROUP BY 1,2,3,4,5
  HAVING count(*) > 1
),
cross_competition_id AS (
  SELECT match_id
  FROM canonical
  GROUP BY match_id
  HAVING count(DISTINCT (season, competition_label)) > 1
),
unlinked AS (
  SELECT e.id,
         (SELECT count(*) FROM public.availability a
          WHERE a.event_id = e.id) AS booking_count
  FROM public.events e
  WHERE e.event_type = 'match'
    AND NOT EXISTS (
      SELECT 1 FROM private.cc_canonical_match_aliases_v1 a
      WHERE a.source_system = 'manager_event'
        AND a.source_key = e.id::text
    )
),
team_scopes AS (
  SELECT source_id, competition_label, count(*) AS appearances
  FROM (
    SELECT home_source_team_id AS source_id, competition_label
    FROM canonical
    UNION ALL
    SELECT away_source_team_id AS source_id, competition_label
    FROM canonical
  ) s
  WHERE source_id IN ('1092','1165','1215')
  GROUP BY 1,2
)
SELECT
 (SELECT count(*) FROM canonical) AS canonical_total,
 (SELECT count(*) FROM canonical WHERE match_status='played') AS played_total,
 (SELECT count(*) FROM scoped_duplicates) AS duplicate_scoped_fixture_keys,
 (SELECT count(*) FROM cross_competition_id) AS cross_competition_match_ids,
 (SELECT count(*) FROM unlinked) AS manager_unlinked,
 (SELECT coalesce(sum(booking_count),0) FROM unlinked) AS preserved_unlinked_bookings,
 (SELECT jsonb_agg(jsonb_build_object(
   'source_team_id',source_id,
   'competition',competition_label,
   'appearances',appearances
 ) ORDER BY source_id,competition_label) FROM team_scopes) AS distinct_team_scopes;
