-- DISPOSABLE PG17 ONLY. Tests real postgres role switching and guarded
-- SECURITY DEFINER v3 execution; synthetic JWT actors are not real sessions.
-- Run AFTER schema re-install/verify-clean. No LIVE calls or user records.
CREATE TABLE private.cc_qa_snapshot_permissions (
 actor uuid PRIMARY KEY,
 manager_can_view boolean NOT NULL DEFAULT false,
 player_active boolean NOT NULL DEFAULT false,
 membership_active boolean NOT NULL DEFAULT false
);
INSERT INTO private.cc_qa_snapshot_permissions
(actor,manager_can_view,player_active,membership_active)
VALUES
 ('10000000-0000-4000-8000-000000000001',true,false,false),
 ('10000000-0000-4000-8000-000000000002',false,true,true),
 ('10000000-0000-4000-8000-000000000003',false,true,false),
 ('10000000-0000-4000-8000-000000000004',false,false,false);

-- Synthetic implementations mimic the real v1 checks through the v2 RPC.
-- In production v2 calls v1, whose auth guards have been inspected READ ONLY:
-- private.cc_manager_require_any_v1('competition.matches','view')
-- and active Player auth.uid() + current active team membership.
CREATE OR REPLACE FUNCTION public.cc_manager_competition_mrsz_snapshot_v2()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO ''
AS $cc_manager_mock$
DECLARE actor_text text:=current_setting('request.jwt.claim.sub',true);
BEGIN
 IF actor_text IS NULL OR actor_text !~
    '^[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}$'
   OR NOT EXISTS (
     SELECT 1 FROM private.cc_qa_snapshot_permissions p
     WHERE p.actor=actor_text::uuid AND p.manager_can_view
   ) THEN
   RAISE EXCEPTION 'CC_QA_MANAGER_NOT_ALLOWED' USING ERRCODE='42501';
 END IF;
 RETURN jsonb_build_object('marker','manager_v2_guarded','canonicalMatches','[]'::jsonb);
END $cc_manager_mock$;
CREATE OR REPLACE FUNCTION public.cc_player_competition_mrsz_snapshot_v2()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO ''
AS $cc_player_mock$
DECLARE actor_text text:=current_setting('request.jwt.claim.sub',true);
BEGIN
 IF actor_text IS NULL OR actor_text !~
    '^[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}$'
    OR NOT EXISTS (
     SELECT 1 FROM private.cc_qa_snapshot_permissions p
     WHERE p.actor=actor_text::uuid
       AND p.player_active AND p.membership_active
    ) THEN
   RAISE EXCEPTION 'CC_QA_PLAYER_NOT_ALLOWED' USING ERRCODE='42501';
 END IF;
 RETURN jsonb_build_object('marker','player_v2_guarded','canonicalMatches','[]'::jsonb);
END $cc_player_mock$;
REVOKE ALL ON FUNCTION public.cc_manager_competition_mrsz_snapshot_v2()
 FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.cc_player_competition_mrsz_snapshot_v2()
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_competition_mrsz_snapshot_v2()
 TO authenticated;
GRANT EXECUTE ON FUNCTION public.cc_player_competition_mrsz_snapshot_v2()
 TO authenticated;

-- Reconstruct just two manually approved synthetic links for verifying that
-- unauthorized accounts NEVER read them through the v3 definer functions.
INSERT INTO private.cc_verified_match_bridge_v1
(legacy_match_id,canonical_match_id,legacy_source_key,canonical_source_key,
 season,competition_label,home_source_team_id,away_source_team_id,
 official_proof_kind,official_proof_ref,reviewer,reviewed_at)
VALUES
(md5('qa:old:1')::uuid,md5('qa:new:1')::uuid,'qa:brsz:1',
 'qa:canonical:1','2026/27','Női Budapest I. osztály','299','5001',
 'brsz_official_fixture_id','BRSZ:2026/27:12345','qa_reviewer',
 '2026-10-24T00:00:00Z'),
(md5('qa:old:43')::uuid,md5('qa:new:43')::uuid,'qa:brsz:43',
 'mrsz:2026/27:protocol:2699','2026/27',
 'Férfi Budapest I. osztály – B csoport','709','1214',
 'mrsz_match_code','MRSZ:2026/27:2699','qa_reviewer',
 '2026-10-24T00:00:00Z');

SET ROLE anon;
DO $cc_anon$
DECLARE v boolean:=false;
BEGIN
 BEGIN PERFORM public.cc_manager_competition_mrsz_snapshot_v3();
 EXCEPTION WHEN insufficient_privilege THEN v:=true; END;
 IF NOT v THEN RAISE EXCEPTION 'CC_QA_ANON_CALLED_MANAGER_V3'; END IF;
 v:=false;
 BEGIN PERFORM public.cc_player_competition_mrsz_snapshot_v3();
 EXCEPTION WHEN insufficient_privilege THEN v:=true; END;
 IF NOT v THEN RAISE EXCEPTION 'CC_QA_ANON_CALLED_PLAYER_V3'; END IF;
 RAISE NOTICE 'CC_QA_ANON_BOTH_V3_DENIED';
END $cc_anon$;
RESET ROLE;

SET ROLE authenticated;
DO $cc_authenticated$
DECLARE actor text;name text;allowed_manager boolean;allowed_player boolean;
        snapshot jsonb;was_denied boolean;
BEGIN
 -- No claim, manager-only, Player-only, expired-membership, unrelated user.
 FOR actor,allowed_manager,allowed_player IN
 SELECT * FROM (VALUES
 ('',false,false),
 ('10000000-0000-4000-8000-000000000001',true,false),
 ('10000000-0000-4000-8000-000000000002',false,true),
 ('10000000-0000-4000-8000-000000000003',false,false),
 ('10000000-0000-4000-8000-000000000004',false,false)
 ) AS x(actor,allowed_manager,allowed_player)
 LOOP
  PERFORM set_config('request.jwt.claim.sub',actor,false);
  FOREACH name IN ARRAY ARRAY['manager','player'] LOOP
   was_denied:=false;
   snapshot:=NULL;
   BEGIN
    IF name='manager' THEN
     snapshot:=public.cc_manager_competition_mrsz_snapshot_v3();
    ELSE
     snapshot:=public.cc_player_competition_mrsz_snapshot_v3();
    END IF;
   EXCEPTION WHEN insufficient_privilege THEN
    was_denied:=true;
   END;
   IF was_denied=(CASE WHEN name='manager' THEN allowed_manager ELSE allowed_player END)
    THEN RAISE EXCEPTION 'CC_QA_CROSS_ROLE_AUTH_MISMATCH actor=% name=% denied=%',
      actor,name,was_denied; END IF;
   IF NOT was_denied THEN
    IF jsonb_array_length(snapshot->'verifiedLegacyMatchBridge')<>2
       OR snapshot->>'marker' <> (name||'_v2_guarded') THEN
     RAISE EXCEPTION 'CC_QA_ALLOWED_ROLE_V2_PARITY_FAILED actor=% name=%',actor,name;
    END IF;
   END IF;
  END LOOP;
 END LOOP;
 RAISE NOTICE 'CC_QA_AUTHENTICATED_ROLE_GUARD_PASS: 5 actor states x 2 client RPCs';
END $cc_authenticated$;
RESET ROLE;

-- Approval table and its private helper remain inaccessible as authenticated.
SET ROLE authenticated;
DO $cc_privacy$
DECLARE did_deny boolean:=false;
BEGIN
 BEGIN
  PERFORM private.cc_competition_verified_match_bridge_v1();
 EXCEPTION WHEN insufficient_privilege THEN did_deny:=true; END;
 IF NOT did_deny THEN RAISE EXCEPTION 'CC_QA_PRIVATE_HELPER_IS_EXPOSED'; END IF;
 did_deny:=false;
 BEGIN PERFORM count(*) FROM private.cc_verified_match_bridge_v1;
 EXCEPTION WHEN insufficient_privilege THEN did_deny:=true; END;
 IF NOT did_deny THEN RAISE EXCEPTION 'CC_QA_PRIVATE_APPROVALS_ARE_EXPOSED'; END IF;
 RAISE NOTICE 'CC_QA_PRIVATE_APPROVAL_TABLE_AND_FUNCTION_DENIED';
END $cc_privacy$;
RESET ROLE;

-- Existing Manager events and RSVPs remain frozen, including the 7 orphan
-- events and their 15 bookings, despite our role/identity simulation.
DO $cc_immutable$
DECLARE b record;
BEGIN
 SELECT * INTO STRICT b FROM private.cc_qa_original_fingerprints;
 IF b.events_hash IS DISTINCT FROM
   (SELECT md5(coalesce(jsonb_agg(to_jsonb(e) ORDER BY id)::text,'[]')) FROM public.events e)
 OR b.bookings_hash IS DISTINCT FROM
   (SELECT md5(coalesce(jsonb_agg(to_jsonb(v) ORDER BY event_id,player_id)::text,'[]')) FROM public.availability v)
 THEN RAISE EXCEPTION 'CC_QA_AUTH_ROLE_TEST_MUTATED_RSVP_OR_EVENTS'; END IF;
 RAISE NOTICE 'CC_QA_ROLE_AUTH_IMMUTABLE_EVENTS_BOOKINGS_PASS';
END $cc_immutable$;
