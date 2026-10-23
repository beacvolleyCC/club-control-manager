-- READ ONLY release gate for 11 historical 2026/27 candidate identities.
-- No alias creation, no source update, no canonical changes, and no inferred match dates.
-- Before any future import, rerun against LIVE and review any drift manually.
WITH expected AS (
 SELECT v AS e FROM jsonb_array_elements($cc_review$[{"legacySourceKey":"ui20261018:menA:dagkse:kozgaz:1","legacyLeagueKey":"menA","legacyDay":"2026-11-19","legacyStatus":"scheduled","legacyHome":"Dág KSE","legacyAway":"KÖZGÁZ","season":"2026/27","competitionLabel":"Férfi Budapest I. osztály – A csoport","canonicalSourceKey":"20261001:fixture:93","canonicalMatchId":"30407d80-b696-58fc-d596-c7e8370515e8","canonicalHomeTeamId":"864","canonicalAwayTeamId":"10","canonicalKickoff":"2026-10-15 20:15:00","canonicalStatus":"scheduled","evidenceStatus":"date_conflict_hold","originalProtocolMatchCode":null,"allowAutomaticCanonicalWrite":false},{"legacySourceKey":"ui20261018:menB:mozduljse:mafcschonherz:1","legacyLeagueKey":"menB","legacyDay":null,"legacyStatus":"postponed","legacyHome":"Mozdulj SE","legacyAway":"MAFC-Schönherz","season":"2026/27","competitionLabel":"Férfi Budapest I. osztály – B csoport","canonicalSourceKey":"brsz:2026/27:menB:userofficial:38","canonicalMatchId":"d5f97408-5801-7442-fa59-a200a54abd9d","canonicalHomeTeamId":"1213","canonicalAwayTeamId":"640","canonicalKickoff":"2027-03-03 20:00:00","canonicalStatus":"scheduled","evidenceStatus":"reschedule_unverified_hold","originalProtocolMatchCode":null,"allowAutomaticCanonicalWrite":false},{"legacySourceKey":"ui20261018:menB:mozduljse:mafcvasarhelyi:1","legacyLeagueKey":"menB","legacyDay":"2026-10-28","legacyStatus":"scheduled","legacyHome":"Mozdulj SE","legacyAway":"MAFC-Vásárhelyi","season":"2026/27","competitionLabel":"Férfi Budapest I. osztály – B csoport","canonicalSourceKey":"brsz:2026/27:menB:userofficial:01","canonicalMatchId":"25a14406-2887-62fc-086c-ad770d160a6b","canonicalHomeTeamId":"1213","canonicalAwayTeamId":"45","canonicalKickoff":"2026-10-21 20:00:00","canonicalStatus":"scheduled","evidenceStatus":"source_supported_by_uploaded_pdf","originalProtocolMatchCode":2700,"allowAutomaticCanonicalWrite":false},{"legacySourceKey":"ui20261018:womenI:beac:beac:1","legacyLeagueKey":"womenI","legacyDay":"2026-11-10","legacyStatus":"scheduled","legacyHome":"BEAC","legacyAway":"BEAC","season":"2026/27","competitionLabel":"Női Budapest I. osztály","canonicalSourceKey":null,"canonicalMatchId":null,"canonicalHomeTeamId":null,"canonicalAwayTeamId":null,"canonicalKickoff":null,"canonicalStatus":null,"evidenceStatus":"unverified_self_fixture_hold","originalProtocolMatchCode":null,"allowAutomaticCanonicalWrite":false},{"legacySourceKey":"ui20261018:womenI:mtk:panoramase:1","legacyLeagueKey":"womenI","legacyDay":"2026-10-28","legacyStatus":"scheduled","legacyHome":"MTK","legacyAway":"Panoráma SE","season":"2026/27","competitionLabel":"Női Budapest I. osztály","canonicalSourceKey":"20261001:fixture:39","canonicalMatchId":"04eaceee-57e2-7563-a618-beb933c0ffc0","canonicalHomeTeamId":"1092","canonicalAwayTeamId":"753","canonicalKickoff":"2026-10-21 21:00:00","canonicalStatus":"scheduled","evidenceStatus":"source_supported_by_uploaded_pdf","originalProtocolMatchCode":2686,"allowAutomaticCanonicalWrite":false},{"legacySourceKey":"ui20261018:womenIIA:bdg:bdtsetaksony:1","legacyLeagueKey":"womenIIA","legacyDay":null,"legacyStatus":"postponed","legacyHome":"BDG","legacyAway":"BDTSE Taksony","season":"2026/27","competitionLabel":"Női Budapest II. osztály – A csoport","canonicalSourceKey":"brsz:2026/27:bb2a:official:04","canonicalMatchId":"75fcda54-9b04-8c84-f559-3f7093170322","canonicalHomeTeamId":"790","canonicalAwayTeamId":"899","canonicalKickoff":null,"canonicalStatus":"postponed","evidenceStatus":"undated_postponement_hold","originalProtocolMatchCode":null,"allowAutomaticCanonicalWrite":false},{"legacySourceKey":"ui20261018:womenIIA:budaixic:budapestbunnies:1","legacyLeagueKey":"womenIIA","legacyDay":null,"legacyStatus":"postponed","legacyHome":"Budai XI. C","legacyAway":"Budapest Bunnies","season":"2026/27","competitionLabel":"Női Budapest II. osztály – A csoport","canonicalSourceKey":"brsz:2026/27:bb2a:official:01","canonicalMatchId":"689d0631-6c39-504a-f7bc-38520e770810","canonicalHomeTeamId":"525","canonicalAwayTeamId":"898","canonicalKickoff":null,"canonicalStatus":"postponed","evidenceStatus":"undated_postponement_hold","originalProtocolMatchCode":null,"allowAutomaticCanonicalWrite":false},{"legacySourceKey":"ui20261018:womenIIA:budapestbunnies:bdtsetaksony:1","legacyLeagueKey":"womenIIA","legacyDay":null,"legacyStatus":"postponed","legacyHome":"Budapest Bunnies","legacyAway":"BDTSE Taksony","season":"2026/27","competitionLabel":"Női Budapest II. osztály – A csoport","canonicalSourceKey":"brsz:2026/27:bb2a:official:03","canonicalMatchId":"3c5fe1bd-ce32-8c1f-aaf6-9ab6f48ee45e","canonicalHomeTeamId":"898","canonicalAwayTeamId":"899","canonicalKickoff":null,"canonicalStatus":"postponed","evidenceStatus":"undated_postponement_hold","originalProtocolMatchCode":null,"allowAutomaticCanonicalWrite":false},{"legacySourceKey":"ui20261018:womenIIA:budapestbunnies:budaixic:1","legacyLeagueKey":"womenIIA","legacyDay":null,"legacyStatus":"postponed","legacyHome":"Budapest Bunnies","legacyAway":"Budai XI. C","season":"2026/27","competitionLabel":"Női Budapest II. osztály – A csoport","canonicalSourceKey":"brsz:2026/27:bb2a:official:02","canonicalMatchId":"740f1aa3-c7b2-73f4-80e3-6975a25494fc","canonicalHomeTeamId":"898","canonicalAwayTeamId":"525","canonicalKickoff":null,"canonicalStatus":"postponed","evidenceStatus":"undated_postponement_hold","originalProtocolMatchCode":null,"allowAutomaticCanonicalWrite":false},{"legacySourceKey":"ui20261018:womenIIA:keac:kreb:1","legacyLeagueKey":"womenIIA","legacyDay":"2026-10-28","legacyStatus":"scheduled","legacyHome":"KEAC","legacyAway":"KRE-B","season":"2026/27","competitionLabel":"Női Budapest II. osztály – A csoport","canonicalSourceKey":"brsz:2026/27:bb2a:official:16","canonicalMatchId":"acc575bd-a04e-5470-5cef-f29eb68b9a57","canonicalHomeTeamId":"1166","canonicalAwayTeamId":"1205","canonicalKickoff":"2026-11-28 11:30:00","canonicalStatus":"scheduled","evidenceStatus":"date_conflict_hold","originalProtocolMatchCode":null,"allowAutomaticCanonicalWrite":false},{"legacySourceKey":"ui20261018:womenIIB:mtkkek:rkskfelnottnoi:2","legacyLeagueKey":"womenIIB","legacyDay":"2026-11-24","legacyStatus":"scheduled","legacyHome":"MTK kék","legacyAway":"RKSK felnőtt női","season":"2026/27","competitionLabel":"Női Budapest II. osztály – B csoport","canonicalSourceKey":"mrsz:2026/27:protocol:2337","canonicalMatchId":"7f8a8eaf-96c2-8d4a-bd8f-5492d526b2fc","canonicalHomeTeamId":"1165","canonicalAwayTeamId":"1215","canonicalKickoff":"2026-10-13 18:20:00","canonicalStatus":"played","evidenceStatus":"possible_distinct_return_fixture_hold","originalProtocolMatchCode":null,"allowAutomaticCanonicalWrite":false}]$cc_review$::jsonb) t(v)
),
verified AS (
 SELECT
 e->>'legacySourceKey' AS legacy_key,
 e->>'legacyLeagueKey' AS league_key,
 e->>'competitionLabel' AS competition_label,
 e->>'evidenceStatus' AS evidence_status,
 e->>'canonicalSourceKey' AS candidate_key,
 e->>'originalProtocolMatchCode' AS protocol_code,
 (e->>'allowAutomaticCanonicalWrite')::boolean AS allow_write,
 u.source_key AS found_legacy,
 c.source_key AS found_canonical,
 c.match_id::text AS actual_match_uuid,
 CASE WHEN u.source_key IS NULL THEN false ELSE (
  u.season=e->>'season' AND u.league_key=e->>'legacyLeagueKey'
  AND u.source_status=e->>'legacyStatus'
  AND u.match_date::text IS NOT DISTINCT FROM e->>'legacyDay'
  AND private.cc_competition_team_key_v1(u.home_name)=private.cc_competition_team_key_v1(e->>'legacyHome')
  AND private.cc_competition_team_key_v1(u.away_name)=private.cc_competition_team_key_v1(e->>'legacyAway')
 ) END AS legacy_valid,
 CASE WHEN e->>'canonicalSourceKey' IS NULL THEN
   c.source_key IS NULL AND
   NOT EXISTS (
    SELECT 1 FROM private.cc_canonical_competition_matches_v1 z
    WHERE z.season=e->>'season'
    AND z.competition_label=e->>'competitionLabel'
    AND private.cc_competition_team_key_v1(z.home_name)=private.cc_competition_team_key_v1(e->>'legacyHome')
    AND private.cc_competition_team_key_v1(z.away_name)=private.cc_competition_team_key_v1(e->>'legacyAway')
   )
 ELSE
  c.source_key IS NOT NULL AND c.match_id::text=e->>'canonicalMatchId'
  AND c.season=e->>'season' AND c.competition_label=e->>'competitionLabel'
  AND c.home_source_team_id=e->>'canonicalHomeTeamId'
  AND c.away_source_team_id=e->>'canonicalAwayTeamId'
  AND c.kickoff_local::text IS NOT DISTINCT FROM e->>'canonicalKickoff'
  AND c.match_status=e->>'canonicalStatus'
  AND private.cc_competition_team_key_v1(u.home_name)=private.cc_competition_team_key_v1(c.home_name)
  AND private.cc_competition_team_key_v1(u.away_name)=private.cc_competition_team_key_v1(c.away_name)
 END AS canonical_valid,
 (SELECT count(*) FROM private.cc_canonical_competition_matches_v1 z
  WHERE z.season=e->>'season'
  AND z.competition_label<>e->>'competitionLabel'
  AND private.cc_competition_team_key_v1(z.home_name)=private.cc_competition_team_key_v1(e->>'legacyHome')
  AND private.cc_competition_team_key_v1(z.away_name)=private.cc_competition_team_key_v1(e->>'legacyAway')
 ) AS similarly_named_other_divisions
 FROM expected x
 CROSS JOIN LATERAL (SELECT x.e) t
 LEFT JOIN public.cc_competition_user_schedule_v1 u
   ON u.source_key=e->>'legacySourceKey' AND u.season=e->>'season'
 LEFT JOIN private.cc_canonical_competition_matches_v1 c
   ON c.source_key=e->>'canonicalSourceKey'
   AND c.season=e->>'season'
   AND c.competition_label=e->>'competitionLabel'
)
SELECT jsonb_build_object(
 'auditOnly',true,
 'candidateRows',count(*),
 'metadataPass',count(*) FILTER (WHERE legacy_valid AND canonical_valid AND NOT allow_write),
 'blockedOrDrifted',count(*) FILTER (WHERE NOT legacy_valid OR NOT canonical_valid OR allow_write),
 'pdfBackedRows',count(*) FILTER (WHERE evidence_status='source_supported_by_uploaded_pdf' AND protocol_code IN ('2686','2700')),
 'rows',coalesce(jsonb_agg(jsonb_build_object(
   'legacyKey',legacy_key,'league',league_key,'competition',competition_label,
   'candidate',candidate_key,'protocol',protocol_code,
   'legacyValid',legacy_valid,'canonicalValid',canonical_valid,
   'sameNamesInOtherCompetitions',similarly_named_other_divisions,
   'writeApproved',allow_write
 ) ORDER BY league_key,legacy_key),'[]'::jsonb)
) AS evidence_gate
FROM verified;
