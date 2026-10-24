-- READ-ONLY LIVE PREFLIGHT — do not apply schema or write to Supabase.
-- Precise scoped crosswalk candidates are evidence, NEVER approvals.
WITH legacy AS (
 SELECT lm.id legacy_match_id,la.source_key legacy_source_key,
        raw.season,raw.source_team_id,
        raw.home_source_team_id,raw.away_source_team_id,
        raw.needs_review,raw.source_status,raw.starts_at,
        CASE raw.source_team_id
          WHEN '299' THEN 'Női Budapest I. osztály'
          WHEN '959' THEN 'Női Budapest II. osztály – B csoport'
          WHEN '709' THEN 'Férfi Budapest I. osztály – B csoport'
        END league
 FROM private.cc_canonical_matches_v1 lm
 JOIN private.cc_canonical_match_aliases_v1 la
   ON la.match_id=lm.id AND la.source_system='brsz_fixture'
 JOIN public.competition_source_matches raw
   ON raw.source_match_key=la.source_key
    AND raw.source='brsz' AND raw.season=lm.season
 WHERE lm.season='2026/27' AND lm.competition_label='BRSZ imported fixture'
), proposals AS (
 SELECT l.legacy_match_id,l.legacy_source_key,
    c.match_id canonical_match_id,c.source_key canonical_source_key,
    l.season,l.league,l.source_team_id,
    l.home_source_team_id,l.away_source_team_id,
    l.starts_at AS legacy_starts_at,c.kickoff_local,
    c.match_status,l.source_status,
    CASE WHEN l.needs_review THEN 'BLOCK_RAW_NEEDS_REVIEW'
      WHEN l.home_source_team_id=l.away_source_team_id THEN 'BLOCK_SELF_MATCH'
      WHEN l.league IS NULL THEN 'BLOCK_UNKNOWN_LEAGUE'
      WHEN l.starts_at IS DISTINCT FROM
       (c.kickoff_local AT TIME ZONE 'Europe/Budapest')
       THEN 'REVIEW_START_TIME_CONFLICT'
      ELSE 'CANDIDATE_NOT_APPROVED' END review_status
 FROM legacy l
 JOIN private.cc_canonical_competition_matches_v1 c
   ON c.season=l.season
  AND c.competition_label=l.league
  AND c.home_source_team_id=l.home_source_team_id
  AND c.away_source_team_id=l.away_source_team_id
)
SELECT review_status,count(*) row_count,
 count(DISTINCT legacy_match_id) legacy_count,
 count(DISTINCT canonical_match_id) canonical_count,
 jsonb_agg(jsonb_build_object(
  'legacySourceKey',legacy_source_key,'canonicalSourceKey',canonical_source_key,
  'season',season,'competitionLabel',league,
  'homeSourceTeamId',home_source_team_id,'awaySourceTeamId',away_source_team_id,
  'legacyStartsAt',legacy_starts_at,'canonicalKickoffLocal',kickoff_local
 ) ORDER BY legacy_source_key) examples
FROM proposals GROUP BY review_status ORDER BY review_status;