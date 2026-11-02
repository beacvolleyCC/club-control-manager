-- Club Control TEST: finance static safety and non-mutating regression
-- Execute on TEST only; returns a single JSON result, NO DML.
WITH funcs AS (
 SELECT p.proname,p.prosecdef,
   has_function_privilege('anon',p.oid,'EXECUTE') AS anonymous_can_execute,
   has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_can_execute,
   pg_get_functiondef(p.oid) AS body
 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname IN
 ('cc_manager_finance_audit_v1','cc_manager_finance_matrix_v1',
 'cc_manager_finance_override_set_v1','cc_manager_finance_settings_get_v1',
 'cc_manager_finance_settings_get_v2','cc_manager_finance_settings_set_v1',
 'cc_manager_finance_settings_set_v2')
 AND p.prokind='f'
), checks AS (
 SELECT
 count(*)=7 AS seven_functions_present,
 bool_and(prosecdef) AS all_security_definer,
 bool_and(NOT anonymous_can_execute) AS anon_blocked,
 bool_and(authenticated_can_execute) AS authenticated_has_execute,
 bool_and(position('cc_manager_require_any_v1' IN body)>0) AS manager_guard_present,
 bool_and(position('set search_path' IN lower(body))>0) AS explicit_search_path,
 (SELECT position('cc_player_fee_audit_v2382' IN body)>0
  FROM funcs WHERE proname='cc_manager_finance_override_set_v1') AS override_has_audit_write,
 (SELECT position('manager_accounts' IN body)>0
  FROM funcs WHERE proname='cc_manager_finance_override_set_v1') AS override_resolves_actor_email
 FROM funcs
)
SELECT to_jsonb(checks) AS finance_static_qa FROM checks;
