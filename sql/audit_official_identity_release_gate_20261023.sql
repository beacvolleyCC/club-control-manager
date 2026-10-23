-- READ-ONLY. 11 historical source candidates; 0 approved alias writes.
-- Explicit season + full competition + source-team IDs + UUID + local kickoff.
WITH expected(league,old_key,new_key,uuid,h_id,a_id,kickoff,status) AS (
 VALUES
('menA','ui20261018:menA:dagkse:kozgaz:1','20261001:fixture:93','30407d80-b696-58fc-d596-c7e8370515e8','864','10','2026-10-15 20:15:00','scheduled'),
('menB','ui20261018:menB:mozduljse:mafcschonherz:1','brsz:2026/27:menB:userofficial:38','d5f97408-5801-7442-fa59-a200a54abd9d','1213','640','2027-03-03 20:00:00','scheduled'),
('menB','ui20261018:menB:mozduljse:mafcvasarhelyi:1','brsz:2026/27:menB:userofficial:01','25a14406-2887-62fc-086c-ad770d160a6b','1213','45','2026-10-21 20:00:00','scheduled'),
('womenI','ui20261018:womenI:beac:beac:1',NULL,NULL,NULL,NULL,NULL,NULL),
('womenI','ui20261018:womenI:mtk:panoramase:1','20261001:fixture:39','04eaceee-57e2-7563-a618-beb933c0ffc0','1092','753','2026-10-21 21:00:00','scheduled'),
('womenIIA','ui20261018:womenIIA:bdg:bdtsetaksony:1','brsz:2026/27:bb2a:official:04','75fcda54-9b04-8c84-f559-3f7093170322','790','899',NULL,'postponed'),
('womenIIA','ui20261018:womenIIA:budaixic:budapestbunnies:1','brsz:2026/27:bb2a:official:01','689d0631-6c39-504a-f7bc-38520e770810','525','898',NULL,'postponed'),
('womenIIA','ui20261018:womenIIA:budapestbunnies:bdtsetaksony:1','brsz:2026/27:bb2a:official:03','3c5fe1bd-ce32-8c1f-aaf6-9ab6f48ee45e','898','899',NULL,'postponed'),
('womenIIA','ui20261018:womenIIA:budapestbunnies:budaixic:1','brsz:2026/27:bb2a:official:02','740f1aa3-c7b2-73f4-80e3-6975a25494fc','898','525',NULL,'postponed'),
('womenIIA','ui20261018:womenIIA:keac:kreb:1','brsz:2026/27:bb2a:official:16','acc575bd-a04e-5470-5cef-f29eb68b9a57','1166','1205','2026-11-28 11:30:00','scheduled'),
('womenIIB','ui20261018:womenIIB:mtkkek:rkskfelnottnoi:2','mrsz:2026/27:protocol:2337','7f8a8eaf-96c2-8d4a-bd8f-5492d526b2fc','1165','1215','2026-10-13 18:20:00','played')
), checked AS (
 SELECT e.old_key,e.new_key,e.league,
 (u.source_key IS NOT NULL AND u.season='2026/27' AND u.league_key=e.league) legacy_ok,
 CASE WHEN e.new_key IS NULL THEN c.source_key IS NULL AND NOT EXISTS (
   SELECT 1 FROM private.cc_canonical_competition_matches_v1 z
   WHERE z.season='2026/27'
     AND z.competition_label='Női Budapest I. osztály'
     AND private.cc_competition_team_key_v1(z.home_name)=private.cc_competition_team_key_v1(u.home_name)
     AND private.cc_competition_team_key_v1(z.away_name)=private.cc_competition_team_key_v1(u.away_name))
 ELSE c.source_key IS NOT NULL
   AND c.match_id::text=e.uuid AND c.season='2026/27'
   AND c.competition_label=CASE e.league
     WHEN 'menA' THEN 'Férfi Budapest I. osztály – A csoport'
     WHEN 'menB' THEN 'Férfi Budapest I. osztály – B csoport'
     WHEN 'womenI' THEN 'Női Budapest I. osztály'
     WHEN 'womenIIA' THEN 'Női Budapest II. osztály – A csoport'
     WHEN 'womenIIB' THEN 'Női Budapest II. osztály – B csoport' END
   AND c.home_source_team_id=e.h_id AND c.away_source_team_id=e.a_id
   AND c.kickoff_local::text IS NOT DISTINCT FROM e.kickoff
   AND c.match_status=e.status
   AND private.cc_competition_team_key_v1(c.home_name)=private.cc_competition_team_key_v1(u.home_name)
   AND private.cc_competition_team_key_v1(c.away_name)=private.cc_competition_team_key_v1(u.away_name)
 END canonical_ok
 FROM expected e
 LEFT JOIN public.cc_competition_user_schedule_v1 u ON u.source_key=e.old_key
 LEFT JOIN private.cc_canonical_competition_matches_v1 c ON c.source_key=e.new_key
)
SELECT count(*) total,
 count(*) FILTER (WHERE legacy_ok AND canonical_ok) verified_metadata,
 count(*) FILTER (WHERE NOT legacy_ok OR NOT canonical_ok) drift,
 array_agg(old_key ORDER BY old_key) FILTER (WHERE NOT legacy_ok OR NOT canonical_ok) drift_keys
FROM checked;
