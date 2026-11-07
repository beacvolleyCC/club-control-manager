-- READ ONLY: two new official MRSZ protocols staging preflight.
-- This is NOT an insertion migration. No tables or events are modified.
WITH required(source_key,match_code,league,home_name,away_name,starts_local) AS (
 VALUES
 ('20261001:fixture:39','2686','Női Budapest I. osztály','MTK','Panoráma SE','2026-10-21T21:00:00'),
 ('brsz:2026/27:menB:userofficial:01','2700','Férfi Budapest I. osztály – B csoport','Mozdulj SE','MAFC-Vásárhelyi','2026-10-21T20:00:00')
)
SELECT r.match_code,r.source_key,
 f.record_kind,f.competition_label,
 f.data->>'homeName' AS existing_home,
 f.data->>'awayName' AS existing_away,
 f.data->>'startsAt' AS existing_start_local,
 EXISTS (
  SELECT 1 FROM public.cc_competition_mrsz_screenshot_v1 src
  WHERE src.source_key='mrsz:2026/27:protocol:'||r.match_code
 ) AS protocol_key_already_present,
 CASE
 WHEN f.source_key IS NULL THEN 'BLOCK_MISSING_FIXTURE'
 WHEN f.record_kind<>'fixture' THEN 'BLOCK_KIND_CHANGED'
 WHEN f.competition_label<>r.league THEN 'BLOCK_LEAGUE_CHANGED'
 WHEN f.data->>'homeName'<>r.home_name THEN 'BLOCK_HOME_CHANGED'
 WHEN f.data->>'awayName'<>r.away_name THEN 'BLOCK_AWAY_CHANGED'
 WHEN f.data->>'startsAt'<>r.starts_local THEN 'BLOCK_KICKOFF_CHANGED'
 WHEN EXISTS(SELECT 1 FROM public.cc_competition_mrsz_screenshot_v1 src
             WHERE src.source_key='mrsz:2026/27:protocol:'||r.match_code)
   THEN 'BLOCK_DUPLICATE_PROTOCOL'
 ELSE 'STAGING_PRECHECK_OK'
 END as review_status
FROM required r
LEFT JOIN public.cc_competition_mrsz_screenshot_v1 f ON f.source_key=r.source_key;
-- After any future migration, verify exactly one *effective* canonical row
-- for each existing fixture identity, stable UID, roster count, score status,
-- and baseline 298 total canonical records -> still 298, 13 played -> 15.
