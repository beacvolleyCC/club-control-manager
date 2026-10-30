-- Club Control TEST Stage22 #83, manual only. No scheduler or LIVE deployment.
CREATE OR REPLACE FUNCTION public.cc_manager_player_transfer_plan_apply_v1(p_plan_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $f$
DECLARE
 v_actor uuid;
 v_player_id uuid;
 v_player public.players%ROWTYPE;
 v_plan public.cc_manager_transfer_plans_v1%ROWTYPE;
 v_old public.team_memberships%ROWTYPE;
 v_new public.team_memberships%ROWTYPE;
 v_today date:=(now() AT TIME ZONE 'Europe/Budapest')::date;
 v_rsvps_before bigint;
 v_old_end date;
BEGIN
 IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'MANAGER_AUTH_REQUIRED' USING ERRCODE='42501';END IF;
 v_actor:=private.cc_manager_require_any_v1('competition.players','edit');
 IF p_plan_id IS NULL THEN RAISE EXCEPTION 'PLAN_APPLY_ID_REQUIRED' USING ERRCODE='22023';END IF;
 -- Lock player before plan and current membership; consistent with creation and cancellation.
 SELECT x.player_id INTO v_player_id FROM public.cc_manager_transfer_plans_v1 x WHERE x.id=p_plan_id;
 IF v_player_id IS NULL THEN RAISE EXCEPTION 'PLAN_APPLY_NOT_FOUND' USING ERRCODE='22023';END IF;
 SELECT * INTO v_player FROM public.players WHERE id=v_player_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'PLAN_APPLY_PLAYER_NOT_FOUND' USING ERRCODE='22023';END IF;
 SELECT * INTO v_plan FROM public.cc_manager_transfer_plans_v1 WHERE id=p_plan_id FOR UPDATE;
 IF NOT FOUND OR v_plan.player_id<>v_player_id THEN
  RAISE EXCEPTION 'PLAN_APPLY_CHANGED_DURING_LOCK' USING ERRCODE='40001';END IF;
 IF NOT private.cc_manager_can_v1('competition.players','edit',v_plan.source_team_id)
 OR NOT private.cc_manager_can_v1('competition.players','edit',v_plan.target_team_id) THEN
  RAISE EXCEPTION 'PLAN_APPLY_BOTH_TEAM_PERMISSIONS_REQUIRED' USING ERRCODE='42501';END IF;
 IF v_plan.status='applied' THEN
   SELECT * INTO v_new FROM public.team_memberships
   WHERE id=v_plan.applied_membership_id AND player_id=v_plan.player_id AND team_id=v_plan.target_team_id;
   IF NOT FOUND THEN RAISE EXCEPTION 'PLAN_APPLY_RECEIPT_INCONSISTENT' USING ERRCODE='23514';END IF;
   RETURN jsonb_build_object('ok',TRUE,'alreadyApplied',TRUE,'planId',v_plan.id,
    'playerId',v_plan.player_id,'newMembershipId',v_new.id,'effectiveOn',v_plan.effective_on,
    'sourceTeamId',v_plan.source_team_id,'targetTeamId',v_plan.target_team_id,'status','applied');
 END IF;
 IF v_plan.status<>'pending' THEN RAISE EXCEPTION 'PLAN_APPLY_NOT_PENDING' USING ERRCODE='23514';END IF;
 IF v_plan.effective_on<>v_today THEN
  RAISE EXCEPTION 'PLAN_APPLY_DATE_MUST_MATCH_BUDAPEST_TODAY' USING ERRCODE='22023';END IF;
 IF v_player.active IS DISTINCT FROM TRUE THEN
  RAISE EXCEPTION 'PLAN_APPLY_ACTIVE_PLAYER_REQUIRED' USING ERRCODE='42501'; END IF;
 IF v_plan.source_team_id=v_plan.target_team_id THEN
  RAISE EXCEPTION 'PLAN_APPLY_SAME_TEAM' USING ERRCODE='23514';END IF;
 IF NOT EXISTS(SELECT 1 FROM public.teams WHERE id=v_plan.source_team_id AND active=TRUE)
 OR NOT EXISTS(SELECT 1 FROM public.teams WHERE id=v_plan.target_team_id AND active=TRUE) THEN
  RAISE EXCEPTION 'PLAN_APPLY_BOTH_TEAMS_ACTIVE_REQUIRED' USING ERRCODE='23514'; END IF;
 SELECT * INTO v_old FROM public.team_memberships
 WHERE player_id=v_plan.player_id AND active=TRUE FOR UPDATE;
 IF NOT FOUND OR v_old.id<>v_plan.source_membership_id OR v_old.team_id<>v_plan.source_team_id THEN
  RAISE EXCEPTION 'PLAN_APPLY_STALE_SOURCE_MEMBERSHIP' USING ERRCODE='23514'; END IF;
 IF v_old.starts_on>v_today OR (v_old.ends_on IS NOT NULL AND v_old.ends_on<v_today) THEN
  RAISE EXCEPTION 'PLAN_APPLY_SOURCE_NOT_EFFECTIVE' USING ERRCODE='23514'; END IF;
 IF EXISTS(
  SELECT 1 FROM public.availability a JOIN public.events e ON e.id=a.event_id
  WHERE a.player_id=v_plan.player_id AND e.team_id=v_plan.source_team_id
  AND e.status='active' AND a.status='going' AND e.starts_at>now()
 ) THEN RAISE EXCEPTION 'PLAN_APPLY_FUTURE_GOING_RSVP_REVIEW_REQUIRED' USING ERRCODE='23514';END IF;
 SELECT COUNT(*) INTO v_rsvps_before FROM public.availability WHERE player_id=v_plan.player_id;
 v_old_end:=GREATEST(v_old.starts_on,v_today-1);
 UPDATE public.team_memberships SET active=FALSE,ends_on=v_old_end
 WHERE id=v_old.id RETURNING * INTO v_old;
 INSERT INTO public.team_memberships(player_id,team_id,starts_on,ends_on,active)
 VALUES (v_plan.player_id,v_plan.target_team_id,v_today,NULL,TRUE)
 RETURNING * INTO v_new;
 UPDATE public.cc_manager_transfer_plans_v1
 SET status='applied',applied_at=now(),applied_by=(SELECT auth.uid()),
 applied_membership_id=v_new.id,updated_at=now()
 WHERE id=v_plan.id AND status='pending' RETURNING * INTO v_plan;
 IF NOT FOUND THEN RAISE EXCEPTION 'PLAN_APPLY_CONCURRENT_UPDATE' USING ERRCODE='40001';END IF;
 IF (SELECT COUNT(*) FROM public.team_memberships WHERE player_id=v_plan.player_id AND active=TRUE)<>1
 OR (SELECT COUNT(*) FROM public.availability WHERE player_id=v_plan.player_id)<>v_rsvps_before
 OR v_plan.applied_membership_id<>v_new.id THEN
  RAISE EXCEPTION 'PLAN_APPLY_POSTCONDITION_FAILED'; END IF;
 INSERT INTO public.audit_log(actor_user_id,action,entity_type,entity_id,old_data,new_data)
 VALUES ((SELECT auth.uid()),'manager.player_transfer.plan_apply','transfer_plan',v_plan.id::text,
  jsonb_build_object('status','pending','playerId',v_plan.player_id,'sourceMembershipId',v_old.id,
   'sourceTeamId',v_old.team_id,'rsvpCountUnchanged',v_rsvps_before),
  jsonb_build_object('status','applied','targetTeamId',v_plan.target_team_id,'effectiveOn',v_plan.effective_on,
   'newMembershipId',v_new.id,'oldMembershipEndsOn',v_old.ends_on,
   'noNotificationsSent',TRUE,'rsvpCountUnchanged',v_rsvps_before,'managerId',v_actor));
 RETURN jsonb_build_object('ok',TRUE,'alreadyApplied',FALSE,'planId',v_plan.id,
  'playerId',v_plan.player_id,'sourceTeamId',v_plan.source_team_id,'targetTeamId',v_plan.target_team_id,
  'newMembershipId',v_new.id,'effectiveOn',v_plan.effective_on,'status','applied');
END;
$f$;
REVOKE ALL ON FUNCTION public.cc_manager_player_transfer_plan_apply_v1(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_player_transfer_plan_apply_v1(uuid) TO authenticated;
