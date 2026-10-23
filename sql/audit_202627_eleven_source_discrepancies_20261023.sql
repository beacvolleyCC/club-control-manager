-- CC-FOLYTATÁS 2026-10-23: 11-case source discrepancy REVIEW QUEUE.
-- Read-only! Date/name matching is evidence for human review only.
-- A review row is NOT authorization to create aliases, reschedule an event,
-- overwrite historical imports, backfill results or send notifications.
WITH date_case(case_id,legacy_source_key,canonical_source_key) AS (
 VALUES
 ('date:menA:dag-kozgaz','ui20261018:menA:dagkse:kozgaz:1','20261001:fixture:93'),
 ('date:womenI:mtk-panorama','ui20261018:womenI:mtk:panoramase:1','20261001:fixture:39'),
 ('date:menB:mozdulj-vasarhelyi','ui20261018:menB:mozduljse:mafcvasarhelyi:1','brsz:2026/27:menB:userofficial:01'),
 ('date:womenIIA:keac-kreb','ui20261018:womenIIA:keac:kreb:1','brsz:2026/27:bb2a:official:16')
),
date_reviews AS (
 SELECT d.case_id,'DATE_DISAGREEMENT'::text issue_type,
  jsonb_build_object(
   'leagueKey',l.league_key,'competitionLabel',c.competition_label,
   'legacyKey',d.legacy_source_key,'canonicalKey',d.canonical_source_key,
   'home',l.home_name,'away',l.away_name,
   'legacyLocal',l.starts_at AT TIME ZONE 'Europe/Budapest',
   'canonicalLocal',c.kickoff_local,
   'legacyStatus',l.source_status,'canonicalStatus',c.match_status,
   'sourceReady',l.source_key IS NOT NULL AND c.source_key IS NOT NULL,
   'crosswalkVerified',false
  ) AS evidence
 FROM date_case d
 LEFT JOIN public.cc_competition_user_schedule_v1 l ON l.source_key=d.legacy_source_key
 LEFT JOIN private.cc_canonical_competition_matches_v1 c ON c.source_key=d.canonical_source_key
),
undated_reviews AS (
 SELECT 'undated:'||s.source_key AS case_id, 'UNSET_POSTPONED_DATE'::text issue_type,
  jsonb_build_object('leagueKey',s.league_key,'sourceKey',s.source_key,
    'home',s.home_name,'away',s.away_name,'sourceStatus',s.source_status,
    'matchDate',s.match_date,'startsAt',s.starts_at,'crosswalkVerified',false) evidence
 FROM public.cc_competition_user_schedule_v1 s
 WHERE s.season='2026/27' AND s.league_key='womenIIA'
 AND s.source_status='postponed' AND s.match_date IS NULL AND s.starts_at IS NULL
),
rescheduled AS (
 SELECT 'reschedule:menB:mozdulj-schonherz' AS case_id,
 'POSTPONED_SOURCE_VS_DATED_CANONICAL'::text issue_type,
 jsonb_build_object(
  'leagueKey',s.league_key,'legacyKey',s.source_key,'canonicalKey',c.source_key,
  'home',s.home_name,'away',s.away_name,
  'legacyStatus',s.source_status,'legacyDate',s.match_date,'legacyStart',s.starts_at,
  'canonicalStatus',c.match_status,'canonicalLocal',c.kickoff_local,
  'crosswalkVerified',false
 ) evidence
 FROM public.cc_competition_user_schedule_v1 s
 LEFT JOIN private.cc_canonical_competition_matches_v1 c
  ON c.source_key='brsz:2026/27:menB:userofficial:38'
 WHERE s.source_key='ui20261018:menB:mozduljse:mafcschonherz:1'
),
repeated_pair AS (
 SELECT 'repeat:womenIIB:mtk-blue-rksk' AS case_id,
 'SAME_DIRECTION_REPEATED_PAIR'::text issue_type,
 jsonb_build_object('leagueKey','womenIIB',
  'legacyOccurrences',count(*),
  'legacyRecords',jsonb_agg(jsonb_build_object(
   'sourceKey',s.source_key,'date',s.match_date,'status',s.source_status)
   ORDER BY s.match_date),
  'independentOfficialPlayedMRSZ','2337',
  'officialPlayedDate','2026-10-13',
  'crosswalkVerified',false
 ) evidence
 FROM public.cc_competition_user_schedule_v1 s
 WHERE s.source_key IN ('ui20261018:womenIIB:mtkkek:rkskfelnottnoi:1',
                        'ui20261018:womenIIB:mtkkek:rkskfelnottnoi:2')
),
self_match AS (
 SELECT 'self-match:legacy-brsz-beac' AS case_id,
 'BEAC_SELF_MATCH_SOURCE_ANOMALY'::text issue_type,
 jsonb_build_object('rawSourceCount',count(*),
   'rawSourceKeys',coalesce(jsonb_agg(source_match_key ORDER BY source_match_key),'[]'::jsonb),
   'crosswalkVerified',false
 ) evidence
 FROM public.competition_source_matches
 WHERE season='2026/27' AND needs_review IS TRUE
   AND home_source_team_id=away_source_team_id
   AND home_name='BEAC' AND away_name='BEAC'
),
review_items AS (
 SELECT * FROM date_reviews
 UNION ALL SELECT * FROM undated_reviews
 UNION ALL SELECT * FROM rescheduled
 UNION ALL SELECT * FROM repeated_pair
 UNION ALL SELECT * FROM self_match
)
SELECT jsonb_build_object(
 'reviewCount',(SELECT count(*) FROM review_items),
 'reviewTypeCounts',(SELECT jsonb_object_agg(issue_type,n)
   FROM (SELECT issue_type,count(*) n FROM review_items GROUP BY issue_type) x),
 'allCrosswalksUnverified',(SELECT bool_and((evidence->>'crosswalkVerified')::boolean IS FALSE) FROM review_items),
 'cases',(SELECT jsonb_agg(jsonb_build_object('caseId',case_id,'type',issue_type,'evidence',evidence) ORDER BY case_id) FROM review_items)
) AS review_only_discrepancy_queue;
