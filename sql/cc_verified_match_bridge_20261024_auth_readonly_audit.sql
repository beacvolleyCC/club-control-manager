-- Read-only Supabase permission baseline for stage-only v3 authorization review.
-- No DDL, DML, impersonation, notifications, or auth/session changes.
SELECT p.proname,p.prosecdef AS security_definer,
 p.proowner::regrole::text owner_role,
 has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute,
 has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_execute,
 pg_get_functiondef(p.oid) LIKE '%cc_manager_require_any_v1%' AS direct_manager_auth_guard,
 pg_get_functiondef(p.oid) LIKE '%PLAYER_NOT_ALLOWED%' AS direct_player_auth_guard,
 pg_get_functiondef(p.oid) LIKE '%cc_manager_competition_mrsz_snapshot_v1%' AS calls_manager_v1,
 pg_get_functiondef(p.oid) LIKE '%cc_player_competition_mrsz_snapshot_v1%' AS calls_player_v1
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname IN (
 'cc_manager_competition_mrsz_snapshot_v1',
 'cc_manager_competition_mrsz_snapshot_v2',
 'cc_player_competition_mrsz_snapshot_v1',
 'cc_player_competition_mrsz_snapshot_v2',
 'cc_manager_competition_mrsz_snapshot_v3',
 'cc_player_competition_mrsz_snapshot_v3')
ORDER BY p.proname;
