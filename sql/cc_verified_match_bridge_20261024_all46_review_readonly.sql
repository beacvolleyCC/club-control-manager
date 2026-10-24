-- READ-ONLY Club Control federation identity review queue.
-- Read ALL 46 historical BRSZ rows, including 0-match or blocked rows;
-- never manufacture a mapping, result, Manager event, RSVP or approval.
-- Dates are independently checked as Europe/Budapest local clock time.
WITH legacy AS (
 SELECT a.match_id AS legacy_match_id,a.source_key AS legacy_source_key,
   x.source_match_key,x.source_team_id,x.season,m.competition_label AS legacy_catalog_class,x.home_source_team_id,
   x.away_source_team_id,x.starts_at,x.source_status,x.needs_review,
   x.source_url,x.source_hash,x.raw_payload,
   CASE x.source_team_id
     WHEN '299' THEN 'Női Budapest I. osztály'
     WHEN '959' THEN 'Női Budapest II. osztály – B csoport'
     WHEN '709' THEN 'Férfi Budapest I. osztály – B csoport'
     ELSE NULL END AS competition_label
 FROM private.cc_canonical_match_aliases_v1 a
 JOIN private.cc_canonical_matches_v1 m
   ON m.id=a.match_id AND m.season='2026/27'
   -- Do not lose BRSZ aliases already attached to another official class.
   -- Their collision must be exposed for manual review, not silently filtered.
 JOIN public.competition_source_matches x
   ON x.source_match_key=a.source_key
   AND x.source='brsz' AND x.season='2026/27'
 WHERE a.source_system='brsz_fixture'
),
review AS (
 SELECT l.*,
   candidate.match_id AS canonical_match_id,
   candidate.source_key AS canonical_source_key,
   candidate.kickoff_local AS canonical_kickoff_local,
   candidate.match_status AS canonical_status,
   match_count.candidate_count,
   r.data->>'matchCode' AS federation_match_code
 FROM legacy l
 CROSS JOIN LATERAL (
  SELECT count(*) AS candidate_count
  FROM private.cc_canonical_competition_matches_v1 c
  WHERE c.season=l.season
    AND c.competition_label=l.competition_label
    AND c.home_source_team_id=l.home_source_team_id
    AND c.away_source_team_id=l.away_source_team_id
 ) match_count
 LEFT JOIN LATERAL (
  SELECT c.match_id,c.source_key,c.kickoff_local,c.match_status
  FROM private.cc_canonical_competition_matches_v1 c
  WHERE c.season=l.season
    AND c.competition_label=l.competition_label
    AND c.home_source_team_id=l.home_source_team_id
    AND c.away_source_team_id=l.away_source_team_id
  ORDER BY
    CASE WHEN l.starts_at IS NOT DISTINCT FROM
      (c.kickoff_local AT TIME ZONE 'Europe/Budapest') THEN 0 ELSE 1 END,
    c.source_key
  LIMIT 1
 ) candidate ON true
 LEFT JOIN public.cc_competition_mrsz_screenshot_v1 r
   ON r.source_key=candidate.source_key
   AND r.season=l.season
   AND r.competition_label=l.competition_label
   AND r.record_kind='match'
)
SELECT legacy_match_id,legacy_source_key,legacy_catalog_class,season,competition_label,
 source_team_id,home_source_team_id,away_source_team_id,
 starts_at AT TIME ZONE 'Europe/Budapest' AS legacy_kickoff_local,
 source_status,needs_review,source_url,
 left(source_hash,12) AS source_hash_prefix,
 (raw_payload->>'officialFixtureId') AS original_federation_fixture_id,
 candidate_count,canonical_match_id,canonical_source_key,
 canonical_kickoff_local,canonical_status,federation_match_code,
 (legacy_match_id=canonical_match_id) AS already_canonical_same_id,
 CASE WHEN home_source_team_id=away_source_team_id
    THEN 'BLOCK_SELF_MATCH'
  WHEN needs_review IS TRUE THEN 'BLOCK_RAW_REVIEW'
  WHEN legacy_match_id=canonical_match_id THEN 'ALREADY_CANONICAL_SAME_ID'
  WHEN competition_label IS NULL THEN 'BLOCK_UNKNOWN_DIVISION'
  WHEN legacy_catalog_class<>'BRSZ imported fixture' THEN 'REVIEW_EXISTING_LEGACY_MATCH_CLASS'
  WHEN candidate_count=0 THEN 'REVIEW_NO_SCOPED_MATCH'
  WHEN candidate_count>1 THEN 'REVIEW_MULTIPLE_SCOPED_MATCHES'
  WHEN starts_at IS DISTINCT FROM
    (canonical_kickoff_local AT TIME ZONE 'Europe/Budapest')
    THEN 'REVIEW_OFFICIAL_DATE_DIFFERENCE'
  WHEN source_status IS DISTINCT FROM canonical_status
    THEN 'REVIEW_RESULT_STATUS_DIFFERENCE'
  ELSE 'CANDIDATE_REQUIRES_OFFICIAL_PROOF'
 END AS review_status,
 false AS evidence_verified, false AS approved
FROM review
ORDER BY competition_label,legacy_source_key;