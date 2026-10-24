-- Verify the no-write initial state after a staged schema-only install.
DO $cc_qa$
DECLARE
 manager jsonb;player jsonb;
BEGIN
 manager:=public.cc_manager_competition_mrsz_snapshot_v3();
 player:=public.cc_player_competition_mrsz_snapshot_v3();
 IF manager-'verifiedLegacyMatchBridge' IS DISTINCT FROM
    public.cc_manager_competition_mrsz_snapshot_v2()
 OR player-'verifiedLegacyMatchBridge' IS DISTINCT FROM
    public.cc_player_competition_mrsz_snapshot_v2()
 THEN RAISE EXCEPTION 'CC_V3_CHANGED_V2_CONTRACT'; END IF;
 IF manager->'verifiedLegacyMatchBridge'<>'[]'::jsonb
 OR player->'verifiedLegacyMatchBridge'<>'[]'::jsonb
 THEN RAISE EXCEPTION 'CC_V3_AUTO_APPROVED_CANDIDATES'; END IF;
 IF (SELECT count(*) FROM private.cc_verified_match_bridge_v1)<>0
 THEN RAISE EXCEPTION 'CC_V3_APPROVAL_TABLE_NOT_EMPTY'; END IF;
 IF has_function_privilege('anon','public.cc_manager_competition_mrsz_snapshot_v3()','EXECUTE')
 OR has_function_privilege('anon','public.cc_player_competition_mrsz_snapshot_v3()','EXECUTE')
 OR NOT has_function_privilege('authenticated','public.cc_manager_competition_mrsz_snapshot_v3()','EXECUTE')
 OR NOT has_function_privilege('authenticated','public.cc_player_competition_mrsz_snapshot_v3()','EXECUTE')
 OR has_function_privilege('authenticated','private.cc_competition_verified_match_bridge_v1()','EXECUTE')
 OR has_table_privilege('authenticated','private.cc_verified_match_bridge_v1','SELECT')
 OR has_table_privilege('anon','private.cc_verified_match_bridge_v1','SELECT')
 THEN RAISE EXCEPTION 'CC_V3_RLS_OR_GRANTS_WRONG'; END IF;
 RAISE NOTICE 'CC_VERIFIED_BRIDGE_CLEAN_OK: zero auto-links, v2 preserved, private approvals';
END $cc_qa$;
