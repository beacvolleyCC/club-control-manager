-- TEST PostgreSQL security/effect QA. Only execute against TEST project szzoubvhlwnojtzqjebc.
-- All created function definitions and row mutations are enclosed in BEGIN/ROLLBACK.
BEGIN;
-- Club Control Manager TEST Stage 15: narrow roster edit API, pending QA.
-- TEST project: szzoubvhlwnojtzqjebc. NEVER run on LIVE.
-- This is a review candidate in docs/security, not a migration directory.
-- All ten existing Manager form keys are required. Email and Auth linkage are immutable.
-- A Manager needs competition.players/edit for EVERY currently effective team
-- belonging to the target player (and at least one effective team).
-- Rejecting a shared-team player when only one team's permission is held prevents
-- a global player/private change from leaking into a team outside the Manager's scope.
CREATE OR REPLACE FUNCTION public.cc_manager_player_update_v1(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_actor uuid;
  v_player_id uuid;
  v_before public.players%ROWTYPE;
  v_after public.players%ROWTYPE;
  v_priv_before public.player_private%ROWTYPE;
  v_priv_after public.player_private%ROWTYPE;
  v_old_private_exists boolean := false;
  v_key text;
  v_team record;
  v_memberships integer := 0;
  v_name text;
  v_display_name text;
  v_position text;
  v_jersey text;
  v_jersey_no integer;
  v_license text;
  v_medical_raw text;
  v_medical date;
  v_jersey_size text;
  v_shorts_size text;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'MANAGER_AUTH_REQUIRED' USING ERRCODE='42501';
  END IF;
  v_actor := private.cc_manager_require_any_v1('competition.players','edit');
  IF p_payload IS NULL OR jsonb_typeof(p_payload) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'PLAYER_PAYLOAD_OBJECT_REQUIRED' USING ERRCODE='22023';
  END IF;

  FOR v_key IN SELECT jsonb_object_keys(p_payload) LOOP
    IF v_key NOT IN ('playerId','name','displayName','email','position',
                     'jerseyNo','licenseNo','medicalValidUntil','jerseySize','shortsSize') THEN
      RAISE EXCEPTION 'PLAYER_FIELD_NOT_EDITABLE' USING ERRCODE='22023';
    END IF;
    IF jsonb_typeof(p_payload->v_key) <> 'string' THEN
      RAISE EXCEPTION 'PLAYER_FIELD_STRING_REQUIRED' USING ERRCODE='22023';
    END IF;
  END LOOP;

  IF NOT (p_payload ?& ARRAY['playerId','name','displayName','email','position',
                             'jerseyNo','licenseNo','medicalValidUntil','jerseySize','shortsSize']) THEN
    RAISE EXCEPTION 'PLAYER_PAYLOAD_FIELDS_REQUIRED' USING ERRCODE='22023';
  END IF;
  IF (p_payload->>'playerId') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RAISE EXCEPTION 'INVALID_PLAYER_ID' USING ERRCODE='22023';
  END IF;
  v_player_id := (p_payload->>'playerId')::uuid;
  v_name := btrim(p_payload->>'name');
  v_display_name := nullif(btrim(p_payload->>'displayName'),'');
  v_position := nullif(btrim(p_payload->>'position'),'');
  v_jersey := btrim(p_payload->>'jerseyNo');
  v_license := nullif(btrim(p_payload->>'licenseNo'),'');
  v_medical_raw := btrim(p_payload->>'medicalValidUntil');
  v_jersey_size := nullif(btrim(p_payload->>'jerseySize'),'');
  v_shorts_size := nullif(btrim(p_payload->>'shortsSize'),'');

  IF length(v_name) NOT BETWEEN 1 AND 160
     OR length(coalesce(v_display_name,''))>160
     OR length(coalesce(v_position,''))>64
     OR length(coalesce(v_license,''))>128
     OR length(coalesce(v_jersey_size,''))>32
     OR length(coalesce(v_shorts_size,''))>32
     OR length(p_payload->>'email')>254 THEN
    RAISE EXCEPTION 'PLAYER_FIELD_LENGTH_INVALID' USING ERRCODE='22023';
  END IF;
  IF v_jersey<>'' THEN
    IF v_jersey !~ '^[0-9]{1,3}$' THEN
      RAISE EXCEPTION 'INVALID_JERSEY_NO' USING ERRCODE='22023';
    END IF;
    v_jersey_no := v_jersey::integer;
  END IF;
  IF v_medical_raw<>'' THEN
    IF v_medical_raw !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
      RAISE EXCEPTION 'INVALID_MEDICAL_DATE' USING ERRCODE='22023';
    END IF;
    v_medical := v_medical_raw::date;
    IF v_medical < DATE '1900-01-01' OR v_medical > DATE '2100-12-31' THEN
      RAISE EXCEPTION 'INVALID_MEDICAL_DATE' USING ERRCODE='22023';
    END IF;
  END IF;

  SELECT * INTO v_before FROM public.players WHERE id=v_player_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PLAYER_NOT_FOUND' USING ERRCODE='P0002';
  END IF;
  IF lower(btrim(p_payload->>'email')) IS DISTINCT FROM lower(v_before.email::text) THEN
    RAISE EXCEPTION 'PLAYER_EMAIL_READ_ONLY' USING ERRCODE='42501';
  END IF;

  -- Global player attributes require edit rights on every effective membership.
  FOR v_team IN
    SELECT DISTINCT tm.team_id
    FROM public.team_memberships tm
    JOIN public.teams t ON t.id=tm.team_id
    WHERE tm.player_id=v_player_id
      AND tm.active=TRUE AND t.active=TRUE
      AND tm.starts_on<=CURRENT_DATE
      AND (tm.ends_on IS NULL OR tm.ends_on>=CURRENT_DATE)
  LOOP
    v_memberships:=v_memberships+1;
    IF NOT private.cc_manager_can_v1('competition.players','edit',v_team.team_id) THEN
      RAISE EXCEPTION 'PLAYER_TEAM_EDIT_DENIED' USING ERRCODE='42501';
    END IF;
  END LOOP;
  IF v_memberships=0 THEN
    RAISE EXCEPTION 'PLAYER_NO_EFFECTIVE_TEAM' USING ERRCODE='42501';
  END IF;

  SELECT * INTO v_priv_before FROM public.player_private
    WHERE player_id=v_player_id FOR UPDATE;
  v_old_private_exists := FOUND;

  UPDATE public.players
  SET name=v_name,display_name=v_display_name,position=v_position,
      jersey_no=v_jersey_no,jersey_size=v_jersey_size,shorts_size=v_shorts_size
  WHERE id=v_player_id
  RETURNING * INTO v_after;

  INSERT INTO public.player_private (player_id,license_no,medical_valid_until)
  VALUES (v_player_id,v_license,v_medical)
  ON CONFLICT (player_id) DO UPDATE
  SET license_no=EXCLUDED.license_no,
      medical_valid_until=EXCLUDED.medical_valid_until
  RETURNING * INTO v_priv_after;

  INSERT INTO public.audit_log
    (actor_user_id,action,entity_type,entity_id,old_data,new_data)
  VALUES
    ((SELECT auth.uid()),'manager.player.update','player',v_player_id::text,
     jsonb_build_object(
       'name',v_before.name,'displayName',v_before.display_name,
       'position',v_before.position,'jerseyNo',v_before.jersey_no,
       'jerseySize',v_before.jersey_size,'shortsSize',v_before.shorts_size,
       'licenseNo',CASE WHEN v_old_private_exists THEN v_priv_before.license_no ELSE NULL END,
       'medicalValidUntil',CASE WHEN v_old_private_exists THEN v_priv_before.medical_valid_until ELSE NULL END),
     jsonb_build_object(
       'name',v_after.name,'displayName',v_after.display_name,
       'position',v_after.position,'jerseyNo',v_after.jersey_no,
       'jerseySize',v_after.jersey_size,'shortsSize',v_after.shorts_size,
       'licenseNo',v_priv_after.license_no,'medicalValidUntil',v_priv_after.medical_valid_until));

  RETURN jsonb_build_object(
    'playerId',v_after.id,'name',v_after.name,'displayName',v_after.display_name,
    'email',v_after.email,'position',v_after.position,'jerseyNo',v_after.jersey_no,
    'jerseySize',v_after.jersey_size,'shortsSize',v_after.shorts_size,
    'licenseNo',v_priv_after.license_no,'medicalValidUntil',v_priv_after.medical_valid_until);
END;
$function$;

-- Keep direct writes to players/player_private denied; the RPC performs scoped checks.
REVOKE ALL ON FUNCTION public.cc_manager_player_update_v1(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cc_manager_player_update_v1(jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_player_update_v1(jsonb) TO authenticated;

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
SELECT 'PASS TEST-only Manager player+private atomic edit, audit, forbidden fields, cross-team and shared-team denial, unauthenticated/anon denial; all rolled back' AS verification;
