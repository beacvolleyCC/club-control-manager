-- POSTDEPLOY TEST ONLY: verified function already present; never create/replace it.
BEGIN;
SELECT set_config('cc.qa.manager_id',
 (SELECT m.auth_user_id::text FROM public.manager_accounts m
  WHERE m.active AND m.auth_user_id IS NOT NULL
    AND EXISTS(SELECT 1 FROM public.manager_module_permissions mp WHERE mp.manager_id=m.id AND mp.module_key='competition.players' AND mp.can_edit AND mp.team_id IS NULL)
  ORDER BY m.created_at LIMIT 1),true);
SELECT set_config('cc.qa.manager_email',
 (SELECT m.email::text FROM public.manager_accounts m
  WHERE m.auth_user_id=current_setting('cc.qa.manager_id')::uuid),true);
SELECT set_config('cc.qa.player',
 (SELECT p.id::text FROM public.players p
  JOIN public.team_memberships tm ON tm.player_id=p.id
  JOIN public.teams t ON t.id=tm.team_id
  WHERE p.active AND tm.active AND t.active
    AND tm.starts_on<=CURRENT_DATE AND (tm.ends_on IS NULL OR tm.ends_on>=CURRENT_DATE)
  GROUP BY p.id HAVING COUNT(DISTINCT tm.team_id)=1 ORDER BY p.id LIMIT 1),true);
SELECT set_config('cc.qa.team',
 (SELECT tm.team_id::text FROM public.team_memberships tm
  WHERE tm.player_id=current_setting('cc.qa.player')::uuid AND tm.active
    AND tm.starts_on<=CURRENT_DATE AND (tm.ends_on IS NULL OR tm.ends_on>=CURRENT_DATE)
  LIMIT 1),true);
SELECT set_config('cc.qa.other_team',
 (SELECT t.id::text FROM public.teams t WHERE t.active AND t.id<>current_setting('cc.qa.team')::uuid ORDER BY t.id LIMIT 1),true);
SELECT set_config('cc.qa.other_player',
 (SELECT p.id::text FROM public.players p JOIN public.team_memberships tm ON tm.player_id=p.id
  WHERE p.id<>current_setting('cc.qa.player')::uuid AND tm.team_id=current_setting('cc.qa.other_team')::uuid
  AND tm.active AND tm.starts_on<=CURRENT_DATE AND (tm.ends_on IS NULL OR tm.ends_on>=CURRENT_DATE)
  ORDER BY p.id LIMIT 1),true);
SELECT set_config('cc.qa.other_email',
 (SELECT p.email::text FROM public.players p WHERE p.id=current_setting('cc.qa.other_player')::uuid),true);
SELECT set_config('cc.qa.permission',
 (SELECT mp.id::text FROM public.manager_module_permissions mp
  JOIN public.manager_accounts ma ON ma.id=mp.manager_id
  WHERE ma.auth_user_id=current_setting('cc.qa.manager_id')::uuid
    AND mp.module_key='competition.players' AND mp.can_edit AND mp.team_id IS NULL
  ORDER BY mp.id LIMIT 1),true);
SELECT set_config('cc.qa.original_audit_count',(SELECT count(*)::text FROM public.audit_log),true);
SELECT set_config('cc.qa.original_private_count',(SELECT count(*)::text FROM public.player_private),true);
SELECT set_config('cc.qa.payload',
 (SELECT jsonb_build_object(
  'playerId',p.id::text,'name',p.name,'displayName',coalesce(p.display_name,''),
  'email',p.email::text,'position',coalesce(p.position,''),
  'jerseyNo',coalesce(p.jersey_no::text,''),'jerseySize',coalesce(p.jersey_size,''),
  'shortsSize',coalesce(p.shorts_size,''),'licenseNo',coalesce(pp.license_no,''),
  'medicalValidUntil',coalesce(pp.medical_valid_until::text,'')
 )::text FROM public.players p LEFT JOIN public.player_private pp ON pp.player_id=p.id
 WHERE p.id=current_setting('cc.qa.player')::uuid),true);
DO $preflight$
BEGIN
 IF current_setting('cc.qa.manager_id',true) IS NULL
    OR current_setting('cc.qa.manager_email',true) IS NULL
    OR current_setting('cc.qa.player',true) IS NULL
    OR current_setting('cc.qa.team',true) IS NULL
    OR current_setting('cc.qa.other_team',true) IS NULL
    OR current_setting('cc.qa.other_player',true) IS NULL
    OR current_setting('cc.qa.other_email',true) IS NULL
    OR current_setting('cc.qa.permission',true) IS NULL
    OR current_setting('cc.qa.payload',true) IS NULL
 THEN RAISE EXCEPTION 'QA_FIXTURE_INCOMPLETE'; END IF;
 IF has_function_privilege('anon','public.cc_manager_player_update_v1(jsonb)','EXECUTE')
    OR NOT has_function_privilege('authenticated','public.cc_manager_player_update_v1(jsonb)','EXECUTE')
 THEN RAISE EXCEPTION 'QA_FUNCTION_ACL_MISMATCH'; END IF;
 IF has_table_privilege('authenticated','public.players','UPDATE')
    OR has_table_privilege('authenticated','public.player_private','UPDATE')
 THEN RAISE EXCEPTION 'QA_UNEXPECTED_DIRECT_TABLE_WRITE'; END IF;
END;
$preflight$;

SET LOCAL ROLE anon;
DO $anon$
BEGIN
 BEGIN
   PERFORM public.cc_manager_player_update_v1('{}'::jsonb);
   RAISE EXCEPTION 'QA_ANON_SHOULD_NOT_EXECUTE';
 EXCEPTION WHEN insufficient_privilege THEN
   IF SQLERRM NOT LIKE 'permission denied for function cc_manager_player_update_v1%' THEN RAISE; END IF;
 END;
END;
$anon$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub',current_setting('cc.qa.manager_id'),true);
SELECT set_config('request.jwt.claims',
 jsonb_build_object('sub',current_setting('cc.qa.manager_id'),
 'role','authenticated','email',current_setting('cc.qa.manager_email'))::text,true);
SET LOCAL ROLE authenticated;

DO $allow_deny$
DECLARE v_base jsonb:=current_setting('cc.qa.payload')::jsonb;
        v_edited jsonb;
        v_result jsonb;
BEGIN
 IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'QA_MANAGER_JWT_UNAVAILABLE'; END IF;
 BEGIN
   PERFORM public.cc_manager_player_update_v1(v_base||'{"authUserId":"immutable"}'::jsonb);
   RAISE EXCEPTION 'QA_UNKNOWN_KEY_ACCEPTED';
 EXCEPTION WHEN SQLSTATE '22023' THEN
   IF SQLERRM<>'PLAYER_FIELD_NOT_EDITABLE' THEN RAISE; END IF;
 END;
 BEGIN
   PERFORM public.cc_manager_player_update_v1(v_base-'email');
   RAISE EXCEPTION 'QA_MISSING_EMAIL_ACCEPTED';
 EXCEPTION WHEN SQLSTATE '22023' THEN
   IF SQLERRM<>'PLAYER_PAYLOAD_FIELDS_REQUIRED' THEN RAISE; END IF;
 END;
 BEGIN
   PERFORM public.cc_manager_player_update_v1(jsonb_set(v_base,'{email}','"wrong@example.invalid"'::jsonb));
   RAISE EXCEPTION 'QA_EMAIL_EDIT_ACCEPTED';
 EXCEPTION WHEN insufficient_privilege THEN
   IF SQLERRM<>'PLAYER_EMAIL_READ_ONLY' THEN RAISE; END IF;
 END;
 BEGIN
   PERFORM public.cc_manager_player_update_v1(jsonb_set(v_base,'{jerseyNo}','"1a"'::jsonb));
   RAISE EXCEPTION 'QA_JERSEY_EDIT_ACCEPTED';
 EXCEPTION WHEN SQLSTATE '22023' THEN
   IF SQLERRM<>'INVALID_JERSEY_NO' THEN RAISE; END IF;
 END;
 BEGIN
   PERFORM public.cc_manager_player_update_v1(jsonb_set(v_base,'{medicalValidUntil}','"bad date"'::jsonb));
   RAISE EXCEPTION 'QA_MEDICAL_EDIT_ACCEPTED';
 EXCEPTION WHEN SQLSTATE '22023' THEN
   IF SQLERRM<>'INVALID_MEDICAL_DATE' THEN RAISE; END IF;
 END;
 v_edited:=v_base||jsonb_build_object(
  'displayName','QA ONLY ROLLBACK',
  'jerseyNo','19',
  'licenseNo','QA-ROLLBACK-ONLY',
  'medicalValidUntil','2027-12-31');
 v_result:=public.cc_manager_player_update_v1(v_edited);
 IF v_result->>'displayName'<>'QA ONLY ROLLBACK'
   OR v_result->>'licenseNo'<>'QA-ROLLBACK-ONLY'
   OR v_result->>'medicalValidUntil'<>'2027-12-31' THEN
   RAISE EXCEPTION 'QA_UPDATE_RESPONSE_INCORRECT';
 END IF;
END;
$allow_deny$;
RESET ROLE;
DO $audit$
DECLARE v_id uuid:=current_setting('cc.qa.player')::uuid;
BEGIN
 IF (SELECT count(*) FROM public.audit_log)<>current_setting('cc.qa.original_audit_count')::bigint+1
 THEN RAISE EXCEPTION 'QA_AUDIT_MISSING'; END IF;
 IF (SELECT count(*) FROM public.audit_log WHERE entity_id=v_id::text
     AND action='manager.player.update' AND old_data IS NOT NULL AND new_data IS NOT NULL
     AND actor_user_id=current_setting('cc.qa.manager_id')::uuid)<>1
 THEN RAISE EXCEPTION 'QA_AUDIT_CONTENT_MISSING'; END IF;
 IF (SELECT display_name FROM public.players WHERE id=v_id)<>'QA ONLY ROLLBACK'
   OR (SELECT license_no FROM public.player_private WHERE player_id=v_id)<>'QA-ROLLBACK-ONLY'
 THEN RAISE EXCEPTION 'QA_PRIVATE_OR_PUBLIC_WRITE_MISSING'; END IF;
END;
$audit$;

-- Restrict an otherwise global Manager to a single team and verify two denial cases.
UPDATE public.manager_module_permissions SET team_id=current_setting('cc.qa.team')::uuid
 WHERE id=current_setting('cc.qa.permission')::uuid;
SET LOCAL ROLE authenticated;
DO $cross_team$
DECLARE v_payload jsonb:=current_setting('cc.qa.payload')::jsonb;
BEGIN
 BEGIN
  PERFORM public.cc_manager_player_update_v1(
    jsonb_set(
      jsonb_set(v_payload,'{playerId}',to_jsonb(current_setting('cc.qa.other_player'))),
      '{email}',
      to_jsonb(current_setting('cc.qa.other_email'))));
  RAISE EXCEPTION 'QA_UNRELATED_TEAM_WRITE_SUCCEEDED';
 EXCEPTION WHEN insufficient_privilege THEN
  IF SQLERRM<>'PLAYER_TEAM_EDIT_DENIED' THEN RAISE; END IF;
 END;
END;
$cross_team$;
RESET ROLE;

-- Existing model forbids two simultaneously active team memberships per player.
DO $unique_team$
BEGIN
 BEGIN
  INSERT INTO public.team_memberships (player_id,team_id,starts_on,active)
  VALUES(current_setting('cc.qa.player')::uuid,current_setting('cc.qa.other_team')::uuid,CURRENT_DATE,true);
  RAISE EXCEPTION 'QA_DUPLICATE_ACTIVE_MEMBERSHIP_ALLOWED';
 EXCEPTION WHEN unique_violation THEN
  IF SQLERRM NOT LIKE '%team_memberships_one_active_per_player%' THEN RAISE; END IF;
 END;
END;
$unique_team$;

-- No currently effective team means no global player editing, even for a Manager.
UPDATE public.team_memberships SET starts_on=CURRENT_DATE+INTERVAL '1 day',ends_on=NULL
 WHERE player_id=current_setting('cc.qa.player')::uuid AND team_id=current_setting('cc.qa.team')::uuid AND active;
SET LOCAL ROLE authenticated;
DO $future_membership$
BEGIN
 BEGIN
  PERFORM public.cc_manager_player_update_v1(current_setting('cc.qa.payload')::jsonb);
  RAISE EXCEPTION 'QA_FUTURE_TEAM_WRITE_SUCCEEDED';
 EXCEPTION WHEN insufficient_privilege THEN
  IF SQLERRM<>'PLAYER_NO_EFFECTIVE_TEAM' THEN RAISE; END IF;
 END;
END;
$future_membership$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub','',true);
SELECT set_config('request.jwt.claims','',true);
SET LOCAL ROLE authenticated;
DO $no_auth$
BEGIN
 BEGIN
  PERFORM public.cc_manager_player_update_v1(current_setting('cc.qa.payload')::jsonb);
  RAISE EXCEPTION 'QA_NO_AUTH_WRITE_SUCCEEDED';
 EXCEPTION WHEN insufficient_privilege THEN
  IF SQLERRM<>'MANAGER_AUTH_REQUIRED' THEN RAISE; END IF;
 END;
END;
$no_auth$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS TEST-only Manager player+private atomic edit, audit, forbidden fields, cross-team and future-membership denial, active-team uniqueness, unauthenticated/anon denial; all rolled back' AS verification;
