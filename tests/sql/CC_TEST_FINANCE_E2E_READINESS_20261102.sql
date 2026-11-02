-- Club Control: TEST finance E2E readiness, READ ONLY; no player writes.
WITH rpc AS (
 SELECT p.proname,pg_get_function_identity_arguments(p.oid) args,
        p.prosecdef,has_function_privilege('anon',p.oid,'EXECUTE') anon_ok
 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname IN
 ('cc_manager_finance_matrix_v1','cc_manager_finance_audit_v1','cc_manager_finance_override_set_v1')
)
SELECT jsonb_build_object(
 'test_active_players',(SELECT count(*) FROM public.players WHERE active=true),
 'test_manager_accounts',(SELECT count(*) FROM public.manager_accounts WHERE active=true),
 'fee_rows',(SELECT count(*) FROM public.cc_player_fee_meta_v2382),
 'audit_rows',(SELECT count(*) FROM public.cc_player_fee_audit_v2382),
 'matrix_signature_ok',EXISTS(SELECT 1 FROM rpc WHERE proname='cc_manager_finance_matrix_v1' AND args='p_team_id uuid, p_season text'),
 'audit_signature_ok',EXISTS(SELECT 1 FROM rpc WHERE proname='cc_manager_finance_audit_v1' AND args='p_limit integer'),
 'all_rpc_anon_blocked',(SELECT count(*)=3 AND bool_and(NOT anon_ok) FROM rpc),
 'write_rpc_present',EXISTS(SELECT 1 FROM rpc WHERE proname='cc_manager_finance_override_set_v1' AND prosecdef)
) AS result;
