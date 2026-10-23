-- Read-only home/away leg audit for FOUR unresolved 2026/27 competition-scoped pairs.
-- This audit does NOT approve date moves or aliases. The team IDs are
-- interpreted only within the exact stated competition and season.
WITH pairs(competition_label,home_id,away_id,review_label) AS (
 VALUES
 ('Férfi Budapest I. osztály – A csoport','864','10','Dág KSE – KÖZGÁZ'),
 ('Férfi Budapest I. osztály – B csoport','1213','640','Mozdulj SE – MAFC-Schönherz'),
 ('Női Budapest II. osztály – A csoport','1166','1205','KEAC – KRE-B'),
 ('Női Budapest II. osztály – B csoport','1165','1215','MTK kék – RKSK felnőtt női')
)
SELECT p.review_label,p.competition_label,c.source_key,c.match_id::text match_id,
 c.home_name,c.away_name,c.home_source_team_id,c.away_source_team_id,
 c.kickoff_local::text kickoff_local,c.match_status,
 CASE WHEN c.home_source_team_id=p.home_id AND c.away_source_team_id=p.away_id
 THEN 'home_leg' ELSE 'away_leg' END as oriented_leg
FROM pairs p JOIN private.cc_canonical_competition_matches_v1 c
 ON c.season='2026/27' AND c.competition_label=p.competition_label
 AND ((c.home_source_team_id=p.home_id AND c.away_source_team_id=p.away_id)
   OR (c.home_source_team_id=p.away_id AND c.away_source_team_id=p.home_id))
ORDER BY p.review_label,c.kickoff_local NULLS LAST,c.source_key;
