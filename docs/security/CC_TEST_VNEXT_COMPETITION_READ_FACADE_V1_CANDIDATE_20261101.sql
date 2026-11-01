-- Club Control TEST only. NOT DEPLOYED. Candidate for reviewed, versioned migration.
-- Wraps already-installed, individually authorized Manager read RPCs.
-- SECURITY INVOKER: never bypass RLS or grant arbitrary table access.
-- Do not execute in LIVE or expose to anon.
CREATE FUNCTION public.cc_vnext_competition_read_v1(
  p_resource text,
  p_team_id uuid DEFAULT NULL,
  p_event_id uuid DEFAULT NULL,
  p_from timestamptz DEFAULT NULL,
  p_to timestamptz DEFAULT NULL,
  p_event_type text DEFAULT 'training',
  p_search text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO ''
AS $cc$
DECLARE
  v_resource text := lower(btrim(coalesce(p_resource, '')));
  v_payload jsonb;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'VNEXT_AUTH_REQUIRED' USING ERRCODE='42501';
  END IF;

  IF v_resource IN ('events','calendar','rsvp_matrix','position_counts') THEN
    IF p_from IS NULL OR p_to IS NULL OR p_to<=p_from
       OR p_to-p_from>interval '400 days' THEN
      RAISE EXCEPTION 'VNEXT_INVALID_DATE_RANGE' USING ERRCODE='22023';
    END IF;
    IF v_resource='rsvp_matrix' AND p_to-p_from>interval '62 days' THEN
      RAISE EXCEPTION 'VNEXT_RSVP_RANGE_TOO_LARGE' USING ERRCODE='22023';
    END IF;
  END IF;
  IF v_resource='roster' AND p_event_id IS NULL THEN
    RAISE EXCEPTION 'VNEXT_EVENT_REQUIRED' USING ERRCODE='22023';
  END IF;
  IF v_resource='events' AND p_event_type NOT IN ('training','match') THEN
    RAISE EXCEPTION 'VNEXT_EVENT_TYPE_INVALID' USING ERRCODE='22023';
  END IF;
  IF length(coalesce(p_search,''))>120 THEN
    RAISE EXCEPTION 'VNEXT_SEARCH_TOO_LONG' USING ERRCODE='22023';
  END IF;

  CASE v_resource
    WHEN 'teams' THEN
      v_payload:=public.cc_manager_teams_v1();
    WHEN 'players' THEN
      v_payload:=public.cc_manager_players_v2(p_team_id,p_search);
    WHEN 'overview' THEN
      v_payload:=public.cc_manager_overview_v1(p_team_id);
    WHEN 'events' THEN
      v_payload:=public.cc_manager_events_v1(p_from,p_to,p_event_type,p_team_id);
    WHEN 'calendar' THEN
      v_payload:=public.cc_manager_calendar_v3(p_from,p_to,p_team_id);
    WHEN 'roster' THEN
      v_payload:=public.cc_manager_event_roster_v1(p_event_id);
    WHEN 'rsvp_matrix' THEN
      v_payload:=public.cc_manager_rsvp_matrix_v1(p_from,p_to,p_team_id);
    WHEN 'results' THEN
      v_payload:=public.cc_manager_competition_results_v1(
        CASE WHEN p_team_id IS NULL THEN NULL::uuid[] ELSE ARRAY[p_team_id] END
      );
    WHEN 'position_counts' THEN
      v_payload:=public.cc_manager_competition_position_counts_v1(p_from,p_to);
    ELSE
      RAISE EXCEPTION 'VNEXT_UNKNOWN_RESOURCE' USING ERRCODE='22023';
  END CASE;

  RETURN jsonb_build_object(
    'apiVersion',1,
    'module','competition',
    'resource',v_resource,
    'teamId',p_team_id,
    'eventId',p_event_id,
    'generatedAt',now(),
    'data',coalesce(v_payload,'null'::jsonb)
  );
END;
$cc$;

REVOKE ALL ON FUNCTION public.cc_vnext_competition_read_v1(
  text,uuid,uuid,timestamptz,timestamptz,text,text
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cc_vnext_competition_read_v1(
  text,uuid,uuid,timestamptz,timestamptz,text,text
) TO authenticated;

COMMENT ON FUNCTION public.cc_vnext_competition_read_v1(
  text,uuid,uuid,timestamptz,timestamptz,text,text
) IS 'TEST candidate only: versioned competition read facade; delegates existing authorized Manager RPCs.';
