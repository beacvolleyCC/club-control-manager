-- No automated candidate may become a verified link. Verify the two
-- deliberately approved synthetic examples are the ONLY client-visible
-- mappings, and both v3 responses preserve the existing v2 payload.
DO $cc_verify$
DECLARE
 manager jsonb;player jsonb; bridge jsonb;
BEGIN
 manager:=public.cc_manager_competition_mrsz_snapshot_v3();
 player:=public.cc_player_competition_mrsz_snapshot_v3();
 bridge:=private.cc_competition_verified_match_bridge_v1();
 IF manager-'verifiedLegacyMatchBridge' IS DISTINCT FROM
    public.cc_manager_competition_mrsz_snapshot_v2()
 OR player-'verifiedLegacyMatchBridge' IS DISTINCT FROM
    public.cc_player_competition_mrsz_snapshot_v2()
 THEN RAISE EXCEPTION 'CC_V3_BROKE_V2_COMPATIBILITY'; END IF;
 IF (SELECT count(*) FROM private.cc_verified_match_bridge_v1)<>6
 OR (SELECT count(*) FROM private.cc_verified_match_bridge_resolved_v1)<>2
 OR jsonb_array_length(bridge)<>2
 OR manager->'verifiedLegacyMatchBridge' IS DISTINCT FROM bridge
 OR player->'verifiedLegacyMatchBridge' IS DISTINCT FROM bridge
 THEN RAISE EXCEPTION 'CC_APPROVED_ONLY_NOT_ENFORCED: %',bridge; END IF;
 IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(bridge) b
  WHERE b->>'canonicalMatchId'=md5('qa:new:1')::uuid::text
    AND b->>'legacyMatchId'=md5('qa:old:1')::uuid::text
    AND b->>'competitionLabel'='Női Budapest I. osztály'
    AND b->>'verified'='true')
 OR NOT EXISTS(SELECT 1 FROM jsonb_array_elements(bridge) b
  WHERE b->>'canonicalMatchId'=md5('qa:new:43')::uuid::text
    AND b->>'legacyMatchId'=md5('qa:old:43')::uuid::text
    AND b->>'competitionLabel'='Férfi Budapest I. osztály – B csoport'
    AND b->>'verified'='true')
 THEN RAISE EXCEPTION 'CC_GOOD_MANUALLY_APPROVED_ROWS_MISSING'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(bridge) b
  WHERE b->>'canonicalMatchId' IN
   (md5('qa:new:2')::uuid::text,md5('qa:new:3')::uuid::text,
    md5('qa:new:5')::uuid::text,md5('qa:new:44')::uuid::text))
 THEN RAISE EXCEPTION 'CC_INVALID_REVIEW_RECORD_LEAKED'; END IF;
 RAISE NOTICE 'CC_V3_VERIFIED_POSITIVE_AND_NEGATIVE_OK: only 2 of 6 manual rows resolved';
END $cc_verify$;

-- Revoking the underlying official evidence at read time must NOT leave a
-- cached or guessed mapping visible. Revert the synthetic drift afterward.
UPDATE public.competition_source_matches
 SET needs_review=true WHERE source_match_key='qa:brsz:1';
DO $cc_fail_closed$
BEGIN
 IF jsonb_array_length(private.cc_competition_verified_match_bridge_v1())<>1
 THEN RAISE EXCEPTION 'CC_STALE_LEGACY_SOURCE_WAS_TRUSTED'; END IF;
END $cc_fail_closed$;
UPDATE public.competition_source_matches
 SET needs_review=false WHERE source_match_key='qa:brsz:1';

UPDATE private.cc_canonical_competition_matches_v1
 SET away_source_team_id='9999' WHERE source_key='qa:canonical:1';
DO $cc_fail_closed$
BEGIN
 IF jsonb_array_length(private.cc_competition_verified_match_bridge_v1())<>1
 THEN RAISE EXCEPTION 'CC_STALE_CANONICAL_SOURCE_WAS_TRUSTED'; END IF;
END $cc_fail_closed$;
UPDATE private.cc_canonical_competition_matches_v1
 SET away_source_team_id='5001' WHERE source_key='qa:canonical:1';

-- Official MRSZ code 2699 cannot be substituted with a different PDF code.
UPDATE private.cc_verified_match_bridge_v1
 SET official_proof_ref='MRSZ:2026/27:2686'
 WHERE legacy_match_id=md5('qa:old:43')::uuid;
DO $cc_fail_closed$
BEGIN
 IF jsonb_array_length(private.cc_competition_verified_match_bridge_v1())<>1
 THEN RAISE EXCEPTION 'CC_WRONG_OFFICIAL_PROTOCOL_WAS_TRUSTED'; END IF;
END $cc_fail_closed$;
UPDATE private.cc_verified_match_bridge_v1
 SET official_proof_ref='MRSZ:2026/27:2699'
 WHERE legacy_match_id=md5('qa:old:43')::uuid;

-- Rollback and reapply must never alter existing Manager/Player objects.
DO $cc_immutable$
DECLARE b record;
BEGIN
 SELECT * INTO STRICT b FROM private.cc_qa_original_fingerprints;
 IF b.events_hash IS DISTINCT FROM
   (SELECT md5(coalesce(jsonb_agg(to_jsonb(e) ORDER BY id)::text,'[]')) FROM public.events e)
 OR b.bookings_hash IS DISTINCT FROM
   (SELECT md5(coalesce(jsonb_agg(to_jsonb(v) ORDER BY event_id,player_id)::text,'[]')) FROM public.availability v)
 OR b.aliases_hash IS DISTINCT FROM
   (SELECT md5(coalesce(jsonb_agg(to_jsonb(a) ORDER BY source_system,source_key)::text,'[]')) FROM private.cc_canonical_match_aliases_v1 a)
 OR b.raw_sources_hash IS DISTINCT FROM
   (SELECT md5(coalesce(jsonb_agg(to_jsonb(m) ORDER BY source_match_key)::text,'[]')) FROM public.competition_source_matches m)
 OR b.projection_hash IS DISTINCT FROM
   (SELECT md5(coalesce(jsonb_agg(to_jsonb(c) ORDER BY source_key)::text,'[]')) FROM private.cc_canonical_competition_matches_v1 c)
 THEN RAISE EXCEPTION 'CC_EXISTING_SOURCE_OR_RSVP_CHANGED'; END IF;
 IF (SELECT count(*) FROM public.events)<>279
 OR (SELECT count(*) FROM public.availability)<>672
 OR (SELECT count(*) FROM private.cc_canonical_match_aliases_v1 WHERE source_system='manager_event')<>46
 OR (SELECT count(*) FROM private.cc_canonical_competition_matches_v1)<>298
 THEN RAISE EXCEPTION 'CC_DB_BASELINES_MUTATED'; END IF;
 RAISE NOTICE 'CC_VERIFIED_BRIDGE_IMMUTABLE_BASELINE_OK: 279 events, 672 bookings, 46 manager aliases, 298 canonical matches';
END $cc_immutable$;
