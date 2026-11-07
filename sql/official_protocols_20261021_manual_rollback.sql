-- MANUAL RELEASE EMERGENCY ONLY. NOT DEPLOYED / NOT AUTOMATIC.
-- Returns only the two verified 2026-10-21 fixtures to their *exact*
-- saved original sourceFixtureSnapshot. Does not touch RSVP/events/canonical IDs.
-- Requires explicit approval and proof that no later processing has occurred.
BEGIN;
SET LOCAL statement_timeout='45s';
DO $cc_restore$
DECLARE k text; code text; checksum text; initial_count int; initial_played int;
 current_data jsonb; changed int:=0; old_identity text; new_identity text;
BEGIN
 SELECT count(*),count(*) FILTER(WHERE match_status='played'),
        md5(string_agg(match_id::text||':'||source_key,',' ORDER BY source_key))
 INTO initial_count,initial_played,old_identity
 FROM private.cc_canonical_competition_matches_v1;
 IF initial_count<>298 OR initial_played<>15 THEN
  RAISE EXCEPTION 'CC_RESTORE_BASELINE_DRIFT count=% played=%',initial_count,initial_played;
 END IF;
 FOR k,code,checksum IN SELECT * FROM (VALUES
  ('20261001:fixture:39','2686','b72d1dd8d4e1a6db04a5ddc7fc7c2ea0c021a4a67d755bdaea85aef3b890c9c1'),
  ('brsz:2026/27:menB:userofficial:01','2700','e0dbe1e1e9b83d7324ad396b34d00879f7a07352084845008e81b8020a7c0736')
 ) AS refs(k,c,sha)
 LOOP
  SELECT data INTO STRICT current_data FROM public.cc_competition_mrsz_screenshot_v1
   WHERE source_key=k AND record_kind='fixture' FOR UPDATE;
  IF current_data->>'officialProtocolMatchCode'<>code
    OR current_data->>'officialProtocolFileSha256'<>checksum
    OR current_data->>'status'<>'played'
    OR current_data->'sourceFixtureSnapshot' IS NULL
    OR current_data->'officialProtocolEvidence' IS NULL
  THEN RAISE EXCEPTION 'CC_RESTORE_EVIDENCE_DRIFT: %',k; END IF;
  UPDATE public.cc_competition_mrsz_screenshot_v1
    SET data=current_data->'sourceFixtureSnapshot',updated_at=now()
    WHERE source_key=k;
  changed:=changed+1;
 END LOOP;
 SELECT md5(string_agg(match_id::text||':'||source_key,',' ORDER BY source_key))
 INTO new_identity FROM private.cc_canonical_competition_matches_v1;
 IF changed<>2 OR new_identity<>old_identity
   OR (SELECT count(*) FROM private.cc_canonical_competition_matches_v1 WHERE match_status='played')<>13
 THEN RAISE EXCEPTION 'CC_RESTORE_INVARIANT_FAILED'; END IF;
 RAISE NOTICE 'CC_PROTOCOL_MANUAL_ROLLBACK_OK 298 matches, 13 played, canonical IDs unchanged';
END $cc_restore$;
COMMIT;
