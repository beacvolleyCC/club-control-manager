-- Stage18 TEST-only: designated, pre-linked test player immediate team reassignment.
-- Never run on LIVE. Does not create/delete memberships, RSVPs or player records.
CREATE OR REPLACE FUNCTION public.cc_manager_test_player_reassign_v1(p_player_id uuid,p_team_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
 v_player public.players%ROWTYPE;
 v_membership public.team_memberships%ROWTYPE;
 v_team public.teams%ROWTYPE;
 v_old_team uuid;
 v_actor uuid;
 v_count bigint;
 v_new public.team_memberships%ROWTYPE;
BEGIN
 IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'MANAGER_AUTH_REQUIRED' USING ERRCODE='42501'; END IF;
 v_actor:=private.cc_manager_require_any_v1('competition.players','edit');
 IF p_player_id IS NULL OR p_team_id IS NULL THEN RAISE EXCEPTION 'REASSIGN_FIELDS_REQUIRED' USING ERRCODE='22023'; END IF;
 SELECT * INTO v_player FROM public.players WHERE id=p_player_id FOR UPDATE;
 IF NOT FOUND OR v_player.active IS DISTINCT FROM TRUE THEN
  RAISE EXCEPTION 'REASSIGN_ACTIVE_PLAYER_REQUIRED' USING ERRCODE='42501';
 END IF;
 -- Intentionally narrower than arbitrary name-based "test" marker.
 -- Require designated TEST player's existing linked Auth identity and marker.
 IF v_player.id<>'1e8ae2fc-9f5b-4272-a809-b6bb779970bd'::uuid
    OR v_player.auth_user_id IS NULL
    OR NOT public.cc_is_test_player_marker_v1(v_player.name,v_player.display_name,v_player.email::text)
 THEN RAISE EXCEPTION 'REASSIGN_DESIGNATED_TEST_ONLY' USING ERRCODE='42501'; END IF;
 SELECT * INTO v_membership FROM public.team_memberships
 WHERE player_id=p_player_id AND active=TRUE FOR UPDATE;
 IF NOT FOUND OR v_membership.starts_on>CURRENT_DATE
   OR (v_membership.ends_on IS NOT NULL AND v_membership.ends_on<CURRENT_DATE)
 THEN RAISE EXCEPTION 'REASSIGN_CURRENT_MEMBERSHIP_REQUIRED' USING ERRCODE='42501'; END IF;
 v_old_team:=v_membership.team_id;
 IF v_old_team=p_team_id THEN RAISE EXCEPTION 'REASSIGN_SAME_TEAM' USING ERRCODE='22023'; END IF;
 SELECT * INTO v_team FROM public.teams WHERE id=p_team_id AND active=TRUE;
 IF NOT FOUND THEN RAISE EXCEPTION 'REASSIGN_TARGET_TEAM_NOT_ACTIVE' USING ERRCODE='22023'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.teams WHERE id=v_old_team AND active=TRUE) THEN
  RAISE EXCEPTION 'REASSIGN_SOURCE_TEAM_NOT_ACTIVE' USING ERRCODE='42501'; END IF;
 IF NOT private.cc_manager_can_v1('competition.players','edit',v_old_team)
 OR NOT private.cc_manager_can_v1('competition.players','edit',p_team_id) THEN
  RAISE EXCEPTION 'REASSIGN_BOTH_TEAM_PERMISSIONS_REQUIRED' USING ERRCODE='42501'; END IF;
 SELECT COUNT(*) INTO v_count FROM public.availability WHERE player_id=p_player_id;
 -- Test-only role switches must not orphan already-confirmed future attendance.
 IF EXISTS(SELECT 1 FROM public.availability a
    JOIN public.events e ON e.id=a.event_id
    WHERE a.player_id=p_player_id AND e.team_id=v_old_team
      AND e.status='active' AND e.starts_at>now() AND a.status='going')
 THEN RAISE EXCEPTION 'REASSIGN_FUTURE_GOING_RSVP_REVIEW_REQUIRED' USING ERRCODE='23514'; END IF;
 UPDATE public.team_memberships SET team_id=p_team_id
 WHERE id=v_membership.id RETURNING * INTO v_new;
 IF (SELECT COUNT(*) FROM public.team_memberships WHERE player_id=p_player_id AND active=TRUE)<>1
 OR (SELECT COUNT(*) FROM public.availability WHERE player_id=p_player_id)<>v_count
 THEN RAISE EXCEPTION 'REASSIGN_POSTCONDITION_FAILED'; END IF;
 INSERT INTO public.audit_log(actor_user_id,action,entity_type,entity_id,old_data,new_data)
 VALUES ((SELECT auth.uid()),'manager.test_player.reassign','player',p_player_id::text,
   jsonb_build_object('membershipId',v_membership.id,'fromTeamId',v_old_team,'rsvpCount',v_count),
   jsonb_build_object('membershipId',v_new.id,'toTeamId',v_new.team_id,'rsvpCount',v_count,'noNotificationsSent',TRUE));
 RETURN jsonb_build_object('ok',TRUE,'playerId',p_player_id,'membershipId',v_new.id,
    'fromTeamId',v_old_team,'toTeamId',v_new.team_id,'rsvpCountUnchanged',v_count);
END;
$function$;
REVOKE ALL ON FUNCTION public.cc_manager_test_player_reassign_v1(uuid,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cc_manager_test_player_reassign_v1(uuid,uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_test_player_reassign_v1(uuid,uuid) TO authenticated;
