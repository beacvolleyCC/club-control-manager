-- TEST-only Club Control Stage17: manager-scoped *same-day* player transfer.
-- Review candidate. Supabase TEST szzoubvhlwnojtzqjebc only; NEVER LIVE.
-- The existing partial unique index allows exactly one active membership per player.
-- Preserve historical memberships, RSVPs, events, attendance and original player identity.
CREATE OR REPLACE FUNCTION public.cc_manager_player_transfer_v1(
  p_player_id uuid, p_team_id uuid, p_starts_on date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_actor uuid;
  v_player public.players%ROWTYPE;
  v_team public.teams%ROWTYPE;
  v_old public.team_memberships%ROWTYPE;
  v_new public.team_memberships%ROWTYPE;
  v_before_rsvps bigint;
  v_old_end date;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'MANAGER_AUTH_REQUIRED' USING ERRCODE='42501';
  END IF;
  v_actor:=private.cc_manager_require_any_v1('competition.players','edit');
  IF p_player_id IS NULL OR p_team_id IS NULL OR p_starts_on IS NULL THEN
    RAISE EXCEPTION 'TRANSFER_FIELDS_REQUIRED' USING ERRCODE='22023';
  END IF;
  -- Future booking needs a separately designed scheduled-transfer model.
  -- Past transfers could rewrite historical roster interpretation.
  IF p_starts_on<>CURRENT_DATE THEN
    RAISE EXCEPTION 'TRANSFER_DATE_MUST_BE_TODAY' USING ERRCODE='22023';
  END IF;
  -- Serialize concurrent transfer attempts for this player.
  SELECT * INTO v_player FROM public.players
  WHERE id=p_player_id FOR UPDATE;
  IF NOT FOUND OR v_player.active IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'TRANSFER_ACTIVE_PLAYER_REQUIRED' USING ERRCODE='42501';
  END IF;
  SELECT * INTO v_old FROM public.team_memberships
  WHERE player_id=p_player_id AND active=TRUE
  FOR UPDATE;
  IF NOT FOUND
    OR v_old.starts_on>p_starts_on
    OR (v_old.ends_on IS NOT NULL AND v_old.ends_on<p_starts_on) THEN
    RAISE EXCEPTION 'TRANSFER_CURRENT_MEMBERSHIP_REQUIRED' USING ERRCODE='42501';
  END IF;
  IF v_old.team_id=p_team_id THEN
    RAISE EXCEPTION 'TRANSFER_SAME_TEAM' USING ERRCODE='22023';
  END IF;
  SELECT * INTO v_team FROM public.teams
  WHERE id=p_team_id AND active=TRUE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'TRANSFER_ACTIVE_TARGET_TEAM_REQUIRED' USING ERRCODE='22023';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.teams WHERE id=v_old.team_id AND active=TRUE) THEN
    RAISE EXCEPTION 'TRANSFER_ACTIVE_SOURCE_TEAM_REQUIRED' USING ERRCODE='42501';
  END IF;
  IF NOT private.cc_manager_can_v1('competition.players','edit',v_old.team_id)
     OR NOT private.cc_manager_can_v1('competition.players','edit',p_team_id) THEN
    RAISE EXCEPTION 'TRANSFER_BOTH_TEAMS_EDIT_REQUIRED' USING ERRCODE='42501';
  END IF;
  -- Prevent silently leaving upcoming confirmed attendance on the old team.
  -- Do not delete, move, or mutate RSVPs automatically.
  IF EXISTS(
    SELECT 1 FROM public.availability av
    JOIN public.events e ON e.id=av.event_id
    WHERE av.player_id=p_player_id AND e.team_id=v_old.team_id
      AND e.status='active' AND e.starts_at>now()
      AND av.status='going'
  ) THEN
    RAISE EXCEPTION 'TRANSFER_FUTURE_OLD_TEAM_GOING_RSVPS_REVIEW_REQUIRED'
      USING ERRCODE='23514';
  END IF;
  SELECT COUNT(*) INTO v_before_rsvps FROM public.availability
  WHERE player_id=p_player_id;

  -- Keep exact old start date; the old row becomes historical and remains addressable.
  -- Same-day old membership has no prior calendar date, so close it on that day.
  v_old_end:=GREATEST(v_old.starts_on,p_starts_on-1);
  UPDATE public.team_memberships
  SET active=FALSE,ends_on=v_old_end
  WHERE id=v_old.id
  RETURNING * INTO v_old;

  INSERT INTO public.team_memberships(player_id,team_id,starts_on,ends_on,active)
  VALUES (p_player_id,p_team_id,p_starts_on,NULL,TRUE)
  RETURNING * INTO v_new;

  IF (SELECT COUNT(*) FROM public.availability WHERE player_id=p_player_id)<>v_before_rsvps
     OR (SELECT COUNT(*) FROM public.team_memberships
         WHERE player_id=p_player_id AND active=TRUE)<>1 THEN
    RAISE EXCEPTION 'TRANSFER_POSTCONDITION_FAILED';
  END IF;

  INSERT INTO public.audit_log
    (actor_user_id,action,entity_type,entity_id,old_data,new_data)
  VALUES (
    (SELECT auth.uid()),'manager.player.transfer','player',p_player_id::text,
    jsonb_build_object('membershipId',v_old.id,'fromTeamId',v_old.team_id,
      'fromStartsOn',v_old.starts_on,'sourceClosedOn',v_old.ends_on,
      'rsvpCountUnchanged',v_before_rsvps),
    jsonb_build_object('newMembershipId',v_new.id,'toTeamId',v_new.team_id,
      'toStartsOn',v_new.starts_on,'newActive',v_new.active,
      'previousMembershipActive',v_old.active,'rsvpCountUnchanged',v_before_rsvps,
      'noNotificationsSent',TRUE)
  );
  RETURN jsonb_build_object(
    'ok',TRUE,'playerId',p_player_id,
    'fromTeamId',v_old.team_id,'toTeamId',v_new.team_id,
    'oldMembershipId',v_old.id,'newMembershipId',v_new.id,
    'startsOn',v_new.starts_on,'oldMembershipEndsOn',v_old.ends_on,
    'rsvpCountUnchanged',v_before_rsvps
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.cc_manager_player_transfer_v1(uuid,uuid,date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cc_manager_player_transfer_v1(uuid,uuid,date) FROM anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_player_transfer_v1(uuid,uuid,date) TO authenticated;
