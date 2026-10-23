-- Club Control / 2026-10-23 -- READ-ONLY legacy BRSZ -> canonical identity candidates.
-- IMPORTANT: the legacy internal match ID and canonical projection match ID are
-- DIFFERENT namespaces. Candidate matching NEVER grants alias/link permission.
-- Scope: season + source team seed (299 women I / 959 women II/B / 709 men I/B)
-- + exact federation home/away source team IDs. Name/title is not used.
-- No DDL/DML, no event/availability mutation, no notification or join by name.
WITH raw AS (
 SELECT a.match_id AS legacy_match_id,
        a.source_key AS legacy_source_key,
        m.source_team_id AS beac_team_seed,
        m.season,
        m.home_source_team_id,
        m.away_source_team_id,
        m.starts_at AT TIME ZONE 'Europe/Budapest' AS old_local_start,
        m.source_status AS old_status,
        m.needs_review AS legacy_needs_review,
        CASE m.source_team_id
          WHEN '299' THEN 'Női Budapest I. osztály'
          WHEN '959' THEN 'Női Budapest II. osztály – B csoport'
          WHEN '709' THEN 'Férfi Budapest I. osztály – B csoport'
          ELSE NULL END AS canonical_competition
 FROM private.cc_canonical_match_aliases_v1 a
 JOIN public.competition_source_matches m
      ON m.source_match_key=a.source_key
 WHERE a.source_system='brsz_fixture' AND m.season='2026/27'
),
joined AS (
 SELECT r.*,
        p.match_id AS projection_match_id,
        p.source_key AS projection_source_key,
        p.kickoff_local AS projection_kickoff_local,
        p.match_status AS projection_status
 FROM raw r
 LEFT JOIN private.cc_canonical_competition_matches_v1 p
   ON p.season=r.season
  AND p.competition_label=r.canonical_competition
  AND p.home_source_team_id=r.home_source_team_id
  AND p.away_source_team_id=r.away_source_team_id
),
groups AS (
 SELECT legacy_match_id,legacy_source_key,beac_team_seed,
        home_source_team_id,away_source_team_id,canonical_competition,
        old_local_start,old_status,legacy_needs_review,
        count(projection_match_id)::int AS candidates,
        count(projection_match_id) FILTER
            (WHERE projection_kickoff_local=old_local_start)::int AS exact_time_candidates,
        jsonb_agg(jsonb_build_object(
          'canonicalMatchId',projection_match_id,'canonicalSourceKey',projection_source_key,
          'kickoffLocal',projection_kickoff_local,'status',projection_status)
          ORDER BY projection_source_key) FILTER
          (WHERE projection_match_id IS NOT NULL) AS possible_matches
 FROM joined
 GROUP BY legacy_match_id,legacy_source_key,beac_team_seed,
          home_source_team_id,away_source_team_id,canonical_competition,
          old_local_start,old_status,legacy_needs_review
),
classified AS (
 SELECT g.*,
 (SELECT count(*) FROM private.cc_canonical_match_aliases_v1 e
  WHERE e.source_system='manager_event' AND e.match_id=g.legacy_match_id)
  AS manager_alias_count,
 CASE
  WHEN g.home_source_team_id=g.away_source_team_id
   THEN 'BLOCK_SELF_MATCH'
  WHEN g.canonical_competition IS NULL
   THEN 'BLOCK_UNKNOWN_LEAGUE'
  WHEN g.candidates=0 THEN 'REVIEW_NO_CANONICAL_CANDIDATE'
  WHEN g.candidates>1 THEN 'REVIEW_MULTIPLE_CANONICAL_CANDIDATES'
  WHEN g.exact_time_candidates=1 AND g.legacy_needs_review IS NOT TRUE
   THEN 'SCOPED_EXACT_TIME_CANDIDATE_ONLY'
  ELSE 'REVIEW_START_OR_STATUS_CONFLICT'
 END AS review_decision
 FROM groups g
),
unlinked AS (
 SELECT e.id,e.status,
  (SELECT count(*) FROM public.availability av WHERE av.event_id=e.id)
   AS existing_bookings
 FROM public.events e
 WHERE e.event_type='match'
   AND NOT EXISTS (
      SELECT 1 FROM private.cc_canonical_match_aliases_v1 a
      WHERE a.source_system='manager_event' AND a.source_key=e.id::text)
)
SELECT jsonb_build_object(
 'rawBRSZRows',(SELECT count(*) FROM classified),
 'decisionCounts',(SELECT jsonb_object_agg(review_decision,n)
   FROM (SELECT review_decision,count(*) AS n FROM classified GROUP BY 1) s),
 'legacyManagerAliasCount',(SELECT coalesce(sum(manager_alias_count),0) FROM classified),
 'unlinkedManagerEvents',(SELECT count(*) FROM unlinked),
 'unlinkedManagerBookings',(SELECT coalesce(sum(existing_bookings),0) FROM unlinked),
 'allMatchesUnapproved',true,
 'candidates',(SELECT jsonb_agg(jsonb_build_object(
   'legacySourceKey',legacy_source_key,
   'legacyMatchId',legacy_match_id,
   'beacSeed',beac_team_seed,
   'homeSourceTeamId',home_source_team_id,
   'awaySourceTeamId',away_source_team_id,
   'oldLocalStart',old_local_start,
   'managerAliases',manager_alias_count,
   'reviewDecision',review_decision,
   'possibleMatches',coalesce(possible_matches,'[]'::jsonb),
   'crosswalkApproved',false
 ) ORDER BY legacy_source_key) FROM classified)
) AS read_only_canonical_bridge_audit;
