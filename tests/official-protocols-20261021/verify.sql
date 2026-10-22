-- QA invariant report with exact status and original UUID.
DO $verify$
DECLARE
 total int;played int;codes int; players int; intact int; verified_count int;
 obj jsonb;
BEGIN
 SELECT count(*),count(*) FILTER(WHERE match_status='played')
 INTO total,played FROM private.cc_canonical_competition_matches_v1;
 IF total<>298 OR played<>15 THEN
   RAISE EXCEPTION 'Expected canonical 298/15, got %/%',total,played; END IF;
 SELECT count(*) INTO intact FROM private.cc_canonical_competition_matches_v1
 WHERE (source_key='20261001:fixture:39'
  AND match_id=md5('cc:protocol:20261001:fixture:39')::uuid
  AND home_sets=3 AND away_sets=1)
 OR (source_key='brsz:2026/27:menB:userofficial:01'
  AND match_id=md5('cc:protocol:brsz:2026/27:menB:userofficial:01')::uuid
  AND home_sets=3 AND away_sets=2);
 IF intact<>2 THEN RAISE EXCEPTION 'Target canonical UUID/score changed'; END IF;
 SELECT count(*) INTO codes FROM public.cc_competition_mrsz_screenshot_v1 s
 WHERE source_key IN ('20261001:fixture:39','brsz:2026/27:menB:userofficial:01')
   AND s.data->>'matchCode' IS NULL
   AND s.data->'sourceFixtureSnapshot'->>'status'='scheduled'
   AND s.data->>'status'='played';
 IF codes<>2 THEN RAISE EXCEPTION 'Lost original fixture or top-level matchCode introduced'; END IF;
 SELECT count(*) INTO verified_count FROM public.cc_competition_mrsz_screenshot_v1
 WHERE source_key like 'mrsz:2026/27:protocol:%';
 IF verified_count<>13 THEN RAISE EXCEPTION 'Historic protocol rows changed'; END IF;
 IF EXISTS(SELECT 1 FROM public.cc_competition_mrsz_screenshot_v1
  WHERE source_key IN ('mrsz:2026/27:protocol:2686','mrsz:2026/27:protocol:2700'))
 THEN RAISE EXCEPTION 'Duplicate official protocol row inserted'; END IF;
 SELECT count(*) INTO codes FROM jsonb_array_elements(private.cc_competition_canonical_payload_v1()) x
 WHERE x->>'matchCode' IN ('2686','2700') AND x->>'status'='played'
   AND jsonb_typeof(x->'protocol'->'teams')='array';
 IF codes<>2 THEN RAISE EXCEPTION 'Failed matchCode/embedded protocol read projection'; END IF;
 SELECT sum(jsonb_array_length(x->'rosters'->'home')
    + jsonb_array_length(x->'rosters'->'away')) INTO players
 FROM jsonb_array_elements(private.cc_competition_canonical_payload_v1()) x
 WHERE x->>'matchCode' IN ('2686','2700');
 IF players<>38 THEN RAISE EXCEPTION 'Full official player roster lost: %',players; END IF;
 IF (SELECT count(*) FROM jsonb_array_elements(private.cc_competition_canonical_payload_v1()))<>298
 THEN RAISE EXCEPTION 'Player payload duplicate/omission'; END IF;
 RAISE NOTICE 'CC_PROTOCOL_CANONICAL_QA_OK: 298 total, 15 played, 38 player rows, 13 old sources, 2 stable UUIDs';
END $verify$;

-- Manager and Player consume the same canonical protocol. Confirm that the
-- original player role markers and officiating staff survive JSON projection.
DO $cc_ui$
DECLARE r2686 jsonb; r2700 jsonb; count_value int;
BEGIN
 SELECT x INTO STRICT r2686
 FROM jsonb_array_elements(private.cc_competition_canonical_payload_v1()) x
 WHERE x->>'matchCode'='2686';
 SELECT x INTO STRICT r2700
 FROM jsonb_array_elements(private.cc_competition_canonical_payload_v1()) x
 WHERE x->>'matchCode'='2700';
 IF r2686->>'matchId'=r2700->>'matchId'
 THEN RAISE EXCEPTION 'Two distinct fixture identities collapsed'; END IF;
 IF jsonb_array_length(r2686->'protocol'->'officials')<>2
   OR jsonb_array_length(r2700->'protocol'->'officials')<>1
 THEN RAISE EXCEPTION 'Referee / scorekeeper not projected correctly'; END IF;
 IF r2686->'protocol'->'officials'->0->>'role'<>'Játékvezető'
   OR r2686->'protocol'->'officials'->1->>'role'<>'Jegyzőkönyvvezető'
 THEN RAISE EXCEPTION 'Official role labels are missing'; END IF;
 IF jsonb_array_length(r2686->'protocol'->'teams'->0->'staff')<>1
   OR jsonb_array_length(r2686->'protocol'->'teams'->1->'staff')<>1
   OR jsonb_array_length(r2700->'protocol'->'teams'->0->'staff')<>1
   OR jsonb_array_length(r2700->'protocol'->'teams'->1->'staff')<>0
 THEN RAISE EXCEPTION 'Club staff incomplete or invented'; END IF;
 IF r2686->'protocol'->'teams'->0->'staff'->0->>'role'<>'vezetőedző'
 THEN RAISE EXCEPTION 'Coach role missing'; END IF;
 IF r2686->'protocol'->>'sourceUrl' IS NOT NULL
   OR r2700->'protocol'->>'sourceUrl' IS NOT NULL
 THEN RAISE EXCEPTION 'Invented verified external PDF URL'; END IF;
 SELECT count(*) INTO count_value FROM
   jsonb_array_elements(r2686->'protocol'->'teams') t,
   jsonb_array_elements(t->'players') p
 WHERE p->>'captain'='true';
 IF count_value<>2 THEN RAISE EXCEPTION '2686 captain markers were lost'; END IF;
 SELECT count(*) INTO count_value FROM
   jsonb_array_elements(r2700->'protocol'->'teams') t,
   jsonb_array_elements(t->'players') p
 WHERE p->>'captain'='true';
 IF count_value<>2 THEN RAISE EXCEPTION '2700 captain markers were lost'; END IF;
 SELECT count(*) INTO count_value FROM
   jsonb_array_elements(r2686->'protocol'->'teams') t,
   jsonb_array_elements(t->'players') p
 WHERE p->>'libero'='L1';
 IF count_value<>1 THEN RAISE EXCEPTION '2686 libero marker lost'; END IF;
 SELECT count(*) INTO count_value FROM
   jsonb_array_elements(r2700->'protocol'->'teams') t,
   jsonb_array_elements(t->'players') p
 WHERE p->>'libero'='L1';
 IF count_value<>2 THEN RAISE EXCEPTION '2700 libero markers lost'; END IF;
 SELECT count(*) INTO count_value FROM
   jsonb_array_elements(r2700->'protocol'->'teams') t,
   jsonb_array_elements(t->'players') p
 WHERE p->>'code' in ('61342','76211') AND p->>'designation' IS NULL;
 IF count_value<>2 THEN RAISE EXCEPTION 'Unmarked participant status fabricated'; END IF;
 SELECT count(*) INTO count_value FROM
   jsonb_array_elements(r2700->'protocol'->'teams') t,
   jsonb_array_elements(t->'players') p
 WHERE p->>'code'='75203' AND p->>'designation'='CS' AND p->>'libero'='L1';
 IF count_value<>1 THEN RAISE EXCEPTION 'Libero/substitute mixed badge lost'; END IF;
 RAISE NOTICE 'CC_PROTOCOL_UI_QA_OK: all badges, 3 staff, 3 officials and 38 player IDs retained';
END $cc_ui$;
