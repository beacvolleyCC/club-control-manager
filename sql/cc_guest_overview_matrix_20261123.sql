CREATE OR REPLACE FUNCTION public.cc_manager_rsvp_matrix_with_guests_v1(
  p_from timestamptz, p_to timestamptz, p_team_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE v_base jsonb; v_players jsonb; v_responses jsonb;
BEGIN
  -- The base reader enforces authenticated Manager overview/team permissions and date limits.
  v_base := public.cc_manager_rsvp_matrix_v1(p_from,p_to,p_team_id);
  WITH allowed_events AS (
    SELECT (j->>'eventId')::uuid event_id, (j->>'teamId')::uuid team_id
    FROM jsonb_array_elements(coalesce(v_base->'events','[]'::jsonb)) j
  ), allowed_teams AS (SELECT DISTINCT team_id FROM allowed_events),
  guest_players AS (
    SELECT DISTINCT at.team_id,p.id player_id,p.name,p.display_name,p.position
    FROM allowed_teams at
    JOIN public.cc_guest_team_access_v1 ga ON ga.team_id=at.team_id
    JOIN public.cc_guest_profiles_v1 gp ON gp.player_id=ga.player_id AND gp.active
    JOIN public.players p ON p.id=gp.player_id AND p.active AND p.player_kind='guest'
    WHERE NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(coalesce(v_base->'players','[]'::jsonb)) v
      WHERE (v->>'teamId')::uuid=at.team_id AND (v->>'playerId')::uuid=p.id
    )
  )
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'teamId',team_id,'playerId',player_id,'name',name,'displayName',display_name,
    'position',position,'jerseyNo',null,'avatarId',null,'isGuest',true
  ) ORDER BY team_id,name),'[]'::jsonb)
  INTO v_players FROM guest_players;

  WITH allowed_events AS (
    SELECT (j->>'eventId')::uuid event_id, (j->>'teamId')::uuid team_id
    FROM jsonb_array_elements(coalesce(v_base->'events','[]'::jsonb)) j
  )
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'eventId',e.event_id,'playerId',p.id,
    'status',case a.status when 'going' then 'going' when 'not_going' then 'not_going' else 'none' end
  ) ORDER BY e.event_id,p.id),'[]'::jsonb)
  INTO v_responses
  FROM allowed_events e
  JOIN public.cc_guest_team_access_v1 ga ON ga.team_id=e.team_id
  JOIN public.cc_guest_profiles_v1 gp ON gp.player_id=ga.player_id AND gp.active
  JOIN public.players p ON p.id=gp.player_id AND p.active AND p.player_kind='guest'
  LEFT JOIN public.availability a ON a.event_id=e.event_id AND a.player_id=p.id
  WHERE NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(coalesce(v_base->'responses','[]'::jsonb)) v
    WHERE (v->>'eventId')::uuid=e.event_id AND (v->>'playerId')::uuid=p.id
  );
  RETURN jsonb_set(jsonb_set(v_base,'{players}',coalesce(v_base->'players','[]'::jsonb)||v_players),
       '{responses}',coalesce(v_base->'responses','[]'::jsonb)||v_responses);
END $fn$;
REVOKE ALL ON FUNCTION public.cc_manager_rsvp_matrix_with_guests_v1(timestamptz,timestamptz,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_rsvp_matrix_with_guests_v1(timestamptz,timestamptz,uuid) TO authenticated;
