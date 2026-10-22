-- READ ONLY canonical / manager event crosswalk health check.
-- Never infer aliases from title, opponent or kickoff.
WITH manager_events AS (
 SELECT e.id,e.title,e.team_id,e.starts_at,e.status,
        count(DISTINCT av.player_id) AS booking_count
 FROM public.events e
 LEFT JOIN public.availability av ON av.event_id=e.id
 WHERE e.event_type='match'
 GROUP BY e.id
),
resolved AS (
 SELECT e.*, a.match_id, a.link_method
 FROM manager_events e LEFT JOIN private.cc_canonical_match_aliases_v1 a
  ON a.source_system='manager_event' AND a.source_key=e.id::text
)
SELECT id, title, team_id, starts_at, status, booking_count, match_id, link_method,
 CASE
  WHEN match_id IS NOT NULL THEN 'LINKED'
  WHEN status='archived' THEN 'UNLINKED_ARCHIVED_REVIEW'
  WHEN title ~* '(NEM BIZTOS|JAV[IÍ]TAND[OÓ])' THEN 'UNLINKED_EXPLICIT_UNCERTAINTY'
  WHEN booking_count>0 THEN 'UNLINKED_WITH_BOOKINGS'
  ELSE 'UNLINKED_REVIEW'
 END AS review_status
FROM resolved
ORDER BY (match_id IS NOT NULL),starts_at,id;
