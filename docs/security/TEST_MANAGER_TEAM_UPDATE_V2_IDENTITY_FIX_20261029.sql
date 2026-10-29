-- Club Control Manager TEST Stage 13. Fix-forward replacement; pending v2 TEST migration and verified PostgreSQL QA.
-- Intended project: szzoubvhlwnojtzqjebc. NEVER run on LIVE.
-- One narrow authenticated write endpoint. No direct table UPDATE grants.
-- V1 was deployed on TEST; real authenticated test found audit_log.id GENERATED ALWAYS. This V2 omits id and uses the identity default.
CREATE OR REPLACE FUNCTION public.cc_manager_team_update_v1(
  p_team_id uuid,
  p_payload jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_manager_id uuid;
  v_before public.teams%ROWTYPE;
  v_after public.teams%ROWTYPE;
  v_key text;
  v_value jsonb;
  v_limit integer;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'MANAGER_AUTH_REQUIRED' USING ERRCODE='42501';
  END IF;
  IF p_team_id IS NULL OR p_payload IS NULL
     OR jsonb_typeof(p_payload) <> 'object' OR p_payload = '{}'::jsonb THEN
    RAISE EXCEPTION 'INVALID_TEAM_UPDATE_PAYLOAD' USING ERRCODE='22023';
  END IF;
  -- Scope an authenticated Manager to THIS team before accessing its record.
  v_manager_id := private.cc_manager_require_v1('competition.teams','edit',p_team_id);
  IF v_manager_id IS NULL THEN
    RAISE EXCEPTION 'MANAGER_PERMISSION_DENIED' USING ERRCODE='42501';
  END IF;

  FOR v_key, v_value IN SELECT key, value FROM jsonb_each(p_payload) LOOP
    IF v_key NOT IN ('name','season','color','coaches','defaultVenue','defaultCourt','active') THEN
      RAISE EXCEPTION 'TEAM_FIELD_NOT_EDITABLE' USING ERRCODE='22023';
    END IF;
    IF v_key = 'active' THEN
      IF jsonb_typeof(v_value) <> 'boolean' THEN
        RAISE EXCEPTION 'INVALID_TEAM_ACTIVE' USING ERRCODE='22023';
      END IF;
    ELSIF v_key = 'name' THEN
      IF jsonb_typeof(v_value) <> 'string'
         OR length(btrim(p_payload->>'name')) < 1
         OR length(btrim(p_payload->>'name')) > 160 THEN
        RAISE EXCEPTION 'INVALID_TEAM_NAME' USING ERRCODE='22023';
      END IF;
    ELSE
      IF jsonb_typeof(v_value) NOT IN ('string','null') THEN
        RAISE EXCEPTION 'INVALID_TEAM_TEXT_FIELD' USING ERRCODE='22023';
      END IF;
      v_limit := CASE WHEN v_key = 'coaches' THEN 2048 ELSE 256 END;
      IF v_value <> 'null'::jsonb
         AND length(btrim(p_payload->>v_key)) > v_limit THEN
        RAISE EXCEPTION 'TEAM_FIELD_TOO_LONG' USING ERRCODE='22023';
      END IF;
    END IF;
  END LOOP;

  SELECT * INTO v_before FROM public.teams
  WHERE id=p_team_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'TEAM_NOT_FOUND' USING ERRCODE='P0002';
  END IF;

  UPDATE public.teams AS t SET
    name=CASE WHEN p_payload ? 'name' THEN btrim(p_payload->>'name') ELSE t.name END,
    season=CASE WHEN p_payload ? 'season' THEN nullif(btrim(p_payload->>'season'),'') ELSE t.season END,
    color=CASE WHEN p_payload ? 'color' THEN nullif(btrim(p_payload->>'color'),'') ELSE t.color END,
    coaches=CASE WHEN p_payload ? 'coaches' THEN nullif(btrim(p_payload->>'coaches'),'') ELSE t.coaches END,
    default_venue=CASE WHEN p_payload ? 'defaultVenue' THEN nullif(btrim(p_payload->>'defaultVenue'),'') ELSE t.default_venue END,
    default_court=CASE WHEN p_payload ? 'defaultCourt' THEN nullif(btrim(p_payload->>'defaultCourt'),'') ELSE t.default_court END,
    active=CASE WHEN p_payload ? 'active' THEN (p_payload->>'active')::boolean ELSE t.active END
  WHERE t.id=p_team_id
  RETURNING * INTO v_after;

  INSERT INTO public.audit_log
    (actor_user_id,action,entity_type,entity_id,old_data,new_data)
  VALUES
    ((SELECT auth.uid()),'manager.team.update','team',p_team_id::text,
      to_jsonb(v_before),to_jsonb(v_after));

  RETURN jsonb_build_object(
    'id',v_after.id,'legacyTeamId',v_after.legacy_team_id,
    'name',v_after.name,'season',v_after.season,'color',v_after.color,
    'coaches',v_after.coaches,'defaultVenue',v_after.default_venue,
    'defaultCourt',v_after.default_court,'active',v_after.active,
    'updatedAt',v_after.updated_at
  );
END;
$function$;

-- Existing Manager RPC pattern: exposed function callable by authenticated
-- only; custom Manager+team authorization is mandatory in function body.
REVOKE ALL ON FUNCTION public.cc_manager_team_update_v1(uuid,jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cc_manager_team_update_v1(uuid,jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_team_update_v1(uuid,jsonb) TO authenticated;
