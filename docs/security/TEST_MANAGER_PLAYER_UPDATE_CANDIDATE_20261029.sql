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
    IF v_medical_raw !~ '^\\d{4}-\\d{2}-\\d{2}$' THEN
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
