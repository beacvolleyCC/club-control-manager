-- Club Control / 2026-10-23 -- seven unmatched Manager match events.
-- READ-ONLY review; no linking or mutation. 100% of results are UNAPPROVED.
-- Internal team UUID to federation source ID is the verified 2026/27 BEAC
-- registration: Women I=299, Women II/B=959, Men I/B=709.
-- Date + league + BEAC participation and direction are CANDIDATE EVIDENCE
-- only; the opponent source ID and federation fixture code are NOT inferred.
WITH unmatched AS (
 SELECT e.id, e.title, e.status, e.home_away,
        e.starts_at AT TIME ZONE 'Europe/Budapest' AS local_start,
        (SELECT count(*) FROM public.availability a WHERE a.event_id=e.id) AS bookings,
        CASE e.team_id::text
          WHEN '10000000-0000-4000-8000-000000000001' THEN '299'
          WHEN '10000000-0000-4000-8000-000000000002' THEN '959'
          WHEN '10000000-0000-4000-8000-000000000003' THEN '709'
          ELSE NULL END AS beac_source_id,
        CASE e.team_id::text
          WHEN '10000000-0000-4000-8000-000000000001'
            THEN 'Női Budapest I. osztály'
          WHEN '10000000-0000-4000-8000-000000000002'
            THEN 'Női Budapest II. osztály – B csoport'
          WHEN '10000000-0000-4000-8000-000000000003'
            THEN 'Férfi Budapest I. osztály – B csoport'
          ELSE NULL END AS competition_label
 FROM public.events e
 WHERE e.event_type='match'
 AND NOT EXISTS (
   SELECT 1 FROM private.cc_canonical_match_aliases_v1 alias
   WHERE alias.source_system='manager_event' AND alias.source_key=e.id::text
 )
),
candidates AS (
 SELECT u.*, c.candidate_count,c.possible_matches,
 CASE
 WHEN u.status='archived' THEN 'BLOCK_ARCHIVED_EVENT'
 WHEN u.status<>'active' THEN 'BLOCK_NON_ACTIVE_EVENT'
 WHEN u.title ~* '(NEM BIZTOS|JAV[IÍ]TAND[OÓ])' THEN 'BLOCK_EXPLICIT_UNCERTAINTY'
 WHEN u.beac_source_id IS NULL OR u.competition_label IS NULL
   THEN 'BLOCK_UNKNOWN_TEAM_SCOPE'
 WHEN c.candidate_count=0 THEN 'REVIEW_NO_SCOPED_CANDIDATE'
 WHEN c.candidate_count>1 THEN 'REVIEW_MULTIPLE_SCOPED_CANDIDATES'
 ELSE 'SCOPED_TIME_CANDIDATE_ONLY'
 END AS review_decision
 FROM unmatched u
 CROSS JOIN LATERAL (
   SELECT count(*) AS candidate_count,
          jsonb_agg(jsonb_build_object(
             'canonicalMatchId',p.match_id,
             'canonicalSourceKey',p.source_key,
             'homeSourceTeamId',p.home_source_team_id,
             'awaySourceTeamId',p.away_source_team_id,
             'kickoffLocal',p.kickoff_local,
             'status',p.match_status)
             ORDER BY p.source_key) AS possible_matches
   FROM private.cc_canonical_competition_matches_v1 p
   WHERE p.season='2026/27'
     AND p.competition_label=u.competition_label
     AND p.kickoff_local=u.local_start
     AND (
       (u.home_away='home' AND p.home_source_team_id=u.beac_source_id)
       OR (u.home_away='away' AND p.away_source_team_id=u.beac_source_id)
     )
 ) c
)
SELECT jsonb_build_object(
 'unlinkedManagerMatches',(SELECT count(*) FROM candidates),
 'unlinkedBookings',(SELECT coalesce(sum(bookings),0) FROM candidates),
 'decisionCounts',(SELECT jsonb_object_agg(review_decision,n)
   FROM (SELECT review_decision,count(*) n FROM candidates GROUP BY 1) x),
 'autoLinksAllowed',false,
 'events',(SELECT jsonb_agg(jsonb_build_object(
   'managerEventId',id,'title',title,'status',status,
   'homeAway',home_away,'localStart',local_start,
   'existingBookings',bookings,'reviewDecision',review_decision,
   'scopedCandidateCount',candidate_count,
   'candidates',coalesce(possible_matches,'[]'::jsonb),
   'crosswalkApproved',false
 ) ORDER BY local_start,id) FROM candidates)
) AS read_only_seven_event_review;
