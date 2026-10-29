-- Isolated TEST PostgreSQL rollback validation, Stage19 Budapest-day alignment.
-- Runs the proposed function in BEGIN/ROLLBACK with no persistent data edits.
BEGIN;
CREATE OR REPLACE FUNCTION public.cc_manager_player_transfer_v1(p_player_id uuid, p_team_id uuid, p_starts_on date)
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
  IF p_starts_on<>((now() AT TIME ZONE 'Europe/Budapest')::date) THEN
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

SELECT set_config('cc.qa.manager',
 (SELECT a.auth_user_id::text FROM public.manager_accounts a JOIN public.manager_module_permissions mp ON mp.manager_id=a.id
  WHERE a.active AND a.auth_user_id IS NOT NULL AND mp.module_key='competition.players'
    AND mp.can_edit AND mp.team_id IS NULL LIMIT 1),true);
SELECT set_config('cc.qa.manager_email',
 (SELECT email FROM public.manager_accounts WHERE auth_user_id=current_setting('cc.qa.manager')::uuid),true);
SELECT set_config('cc.qa.permission',
 (SELECT mp.id::text FROM public.manager_module_permissions mp JOIN public.manager_accounts a ON a.id=mp.manager_id
  WHERE a.auth_user_id=current_setting('cc.qa.manager')::uuid AND mp.module_key='competition.players' AND mp.can_edit AND mp.team_id IS NULL LIMIT 1),true);
SELECT set_config('cc.qa.player',
 (SELECT tm.player_id::text
  FROM public.team_memberships tm JOIN public.players p ON p.id=tm.player_id JOIN public.teams t ON t.id=tm.team_id
  WHERE p.active AND tm.active AND t.active AND tm.starts_on<=((now() AT TIME ZONE 'Europe/Budapest')::date)
    AND (tm.ends_on IS NULL OR tm.ends_on>=((now() AT TIME ZONE 'Europe/Budapest')::date))
    AND NOT EXISTS(SELECT 1 FROM public.availability av JOIN public.events e ON e.id=av.event_id
      WHERE av.player_id=tm.player_id AND e.team_id=tm.team_id AND e.status='active'
        AND e.starts_at>now() AND av.status='going')
    AND EXISTS(SELECT 1 FROM public.events e WHERE e.team_id=tm.team_id AND e.status='active' AND e.starts_at>now())
  ORDER BY (SELECT COUNT(*) FROM public.availability av WHERE av.player_id=tm.player_id) DESC,tm.player_id LIMIT 1),true);
SELECT set_config('cc.qa.from_team',
 (SELECT tm.team_id::text FROM public.team_memberships tm
  WHERE tm.player_id=current_setting('cc.qa.player')::uuid AND tm.active LIMIT 1),true);
SELECT set_config('cc.qa.from_membership',
 (SELECT tm.id::text FROM public.team_memberships tm
  WHERE tm.player_id=current_setting('cc.qa.player')::uuid AND tm.active LIMIT 1),true);
SELECT set_config('cc.qa.dest_team',
 (SELECT t.id::text FROM public.teams t WHERE t.active AND t.id<>current_setting('cc.qa.from_team')::uuid
  ORDER BY t.id LIMIT 1),true);
SELECT set_config('cc.qa.future_old_event',
 (SELECT e.id::text FROM public.events e WHERE e.team_id=current_setting('cc.qa.from_team')::uuid
  AND e.status='active' AND e.starts_at>now() ORDER BY e.starts_at LIMIT 1),true);
SELECT set_config('cc.qa.rsvp_signature',
 (SELECT COALESCE(md5(string_agg(concat_ws('|',a.event_id,a.player_id,a.status,a.note,a.attendance_status,
        a.created_at,a.updated_at,a.attendance_marked_at,a.attendance_marked_by),'#' ORDER BY a.event_id)),'none')
  FROM public.availability a WHERE a.player_id=current_setting('cc.qa.player')::uuid),true);
SELECT set_config('cc.qa.audit_before',(SELECT count(*)::text FROM public.audit_log),true);
SELECT set_config('cc.qa.push_before',(SELECT count(*)::text FROM public.player_push_outbox),true);
DO $preflight$
BEGIN
 IF current_setting('cc.qa.manager',true) IS NULL OR current_setting('cc.qa.manager_email',true) IS NULL OR
  current_setting('cc.qa.player',true) IS NULL OR current_setting('cc.qa.from_team',true) IS NULL OR
  current_setting('cc.qa.dest_team',true) IS NULL OR current_setting('cc.qa.future_old_event',true) IS NULL OR
  current_setting('cc.qa.permission',true) IS NULL OR current_setting('cc.qa.rsvp_signature',true) IS NULL
 THEN RAISE EXCEPTION 'QA_REQUIRED_FIXTURE_MISSING'; END IF;
 IF has_function_privilege('anon','public.cc_manager_player_transfer_v1(uuid,uuid,date)','EXECUTE') OR
  NOT has_function_privilege('authenticated','public.cc_manager_player_transfer_v1(uuid,uuid,date)','EXECUTE')
 THEN RAISE EXCEPTION 'QA_FUNCTION_ACL_WRONG'; END IF;
 IF has_table_privilege('authenticated','public.team_memberships','INSERT') OR
  has_table_privilege('authenticated','public.team_memberships','UPDATE') THEN
  RAISE EXCEPTION 'QA_DIRECT_WRITE_ALLOWED';
 END IF;
END;
$preflight$;
SET LOCAL ROLE anon;
DO $anon$
BEGIN
 BEGIN
  PERFORM public.cc_manager_player_transfer_v1(current_setting('cc.qa.player')::uuid,current_setting('cc.qa.dest_team')::uuid,((now() AT TIME ZONE 'Europe/Budapest')::date));
  RAISE EXCEPTION 'QA_ANON_WRITE_ALLOWED';
 EXCEPTION WHEN insufficient_privilege THEN
  IF SQLERRM NOT LIKE 'permission denied for function cc_manager_player_transfer_v1%' THEN RAISE; END IF;
 END;
END;
$anon$;
RESET ROLE;
SELECT set_config('request.jwt.claim.sub',current_setting('cc.qa.manager'),true);
SELECT set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('cc.qa.manager'),
  'role','authenticated','email',current_setting('cc.qa.manager_email'))::text,true);
SET LOCAL ROLE authenticated;
DO $negative$
DECLARE v_pid uuid:=current_setting('cc.qa.player')::uuid;v_dest uuid:=current_setting('cc.qa.dest_team')::uuid;
BEGIN
 BEGIN
  PERFORM public.cc_manager_player_transfer_v1(v_pid,v_dest,((now() AT TIME ZONE 'Europe/Budapest')::date)+1);
  RAISE EXCEPTION 'QA_FUTURE_TRANSFER_ALLOWED';
 EXCEPTION WHEN SQLSTATE '22023' THEN
  IF SQLERRM<>'TRANSFER_DATE_MUST_BE_TODAY' THEN RAISE; END IF;
 END;
 BEGIN
  PERFORM public.cc_manager_player_transfer_v1(v_pid,v_dest,((now() AT TIME ZONE 'Europe/Budapest')::date)-1);
  RAISE EXCEPTION 'QA_BACKDATED_TRANSFER_ALLOWED';
 EXCEPTION WHEN SQLSTATE '22023' THEN
  IF SQLERRM<>'TRANSFER_DATE_MUST_BE_TODAY' THEN RAISE; END IF;
 END;
 BEGIN
  PERFORM public.cc_manager_player_transfer_v1(v_pid,current_setting('cc.qa.from_team')::uuid,((now() AT TIME ZONE 'Europe/Budapest')::date));
  RAISE EXCEPTION 'QA_SAME_TEAM_TRANSFER_ALLOWED';
 EXCEPTION WHEN SQLSTATE '22023' THEN
  IF SQLERRM<>'TRANSFER_SAME_TEAM' THEN RAISE; END IF;
 END;
END;
$negative$;
RESET ROLE;

-- Add a synthetic future confirmed RSVP, verify the block, and roll it back.
SAVEPOINT qa_future_rsvp;
INSERT INTO public.availability(event_id,player_id,status,note)
VALUES (current_setting('cc.qa.future_old_event')::uuid,current_setting('cc.qa.player')::uuid,'going','QA FUTURE ONLY')
ON CONFLICT(event_id,player_id) DO UPDATE SET status='going',note='QA FUTURE ONLY';
SET LOCAL ROLE authenticated;
DO $future_rsvp$
BEGIN
 BEGIN
  PERFORM public.cc_manager_player_transfer_v1(current_setting('cc.qa.player')::uuid,current_setting('cc.qa.dest_team')::uuid,((now() AT TIME ZONE 'Europe/Budapest')::date));
  RAISE EXCEPTION 'QA_FUTURE_CONFIRMED_RSVP_IGNORED';
 EXCEPTION WHEN check_violation THEN
  IF SQLERRM<>'TRANSFER_FUTURE_OLD_TEAM_GOING_RSVPS_REVIEW_REQUIRED' THEN RAISE; END IF;
 END;
END;
$future_rsvp$;
RESET ROLE;
ROLLBACK TO SAVEPOINT qa_future_rsvp;

-- A globally authorized Manager loses right to target when scoped to old team.
UPDATE public.manager_module_permissions SET team_id=current_setting('cc.qa.from_team')::uuid
 WHERE id=current_setting('cc.qa.permission')::uuid;
SET LOCAL ROLE authenticated;
DO $permission$
BEGIN
 BEGIN
  PERFORM public.cc_manager_player_transfer_v1(current_setting('cc.qa.player')::uuid,current_setting('cc.qa.dest_team')::uuid,((now() AT TIME ZONE 'Europe/Budapest')::date));
  RAISE EXCEPTION 'QA_UNAUTHORIZED_TARGET_TEAM_WRITE_ALLOWED';
 EXCEPTION WHEN insufficient_privilege THEN
  IF SQLERRM<>'TRANSFER_BOTH_TEAMS_EDIT_REQUIRED' THEN RAISE; END IF;
 END;
END;
$permission$;
RESET ROLE;
UPDATE public.manager_module_permissions SET team_id=NULL WHERE id=current_setting('cc.qa.permission')::uuid;

-- Actual successful same-day transfer. Check old history, new active team,
-- player and all RSVP signatures, and exactly one audit entry.
SET LOCAL ROLE authenticated;
DO $success$
DECLARE j jsonb;
BEGIN
 j:=public.cc_manager_player_transfer_v1(current_setting('cc.qa.player')::uuid,current_setting('cc.qa.dest_team')::uuid,((now() AT TIME ZONE 'Europe/Budapest')::date));
 IF j->>'ok'<>'true'
   OR j->>'fromTeamId'<>current_setting('cc.qa.from_team')
   OR j->>'toTeamId'<>current_setting('cc.qa.dest_team') THEN
  RAISE EXCEPTION 'QA_TRANSFER_RESULT_INVALID';
 END IF;
END;
$success$;
RESET ROLE;
DO $assertions$
DECLARE v_pid uuid:=current_setting('cc.qa.player')::uuid; v_end date;v_old_active boolean;
v_sig text;
BEGIN
 SELECT ends_on,active INTO v_end,v_old_active FROM public.team_memberships WHERE id=current_setting('cc.qa.from_membership')::uuid;
 IF v_old_active OR v_end IS DISTINCT FROM (SELECT GREATEST(starts_on,((now() AT TIME ZONE 'Europe/Budapest')::date)-1) FROM public.team_memberships WHERE id=current_setting('cc.qa.from_membership')::uuid)
 THEN RAISE EXCEPTION 'QA_OLD_MEMBERSHIP_HISTORY_LOST'; END IF;
 IF (SELECT COUNT(*) FROM public.team_memberships WHERE player_id=v_pid AND active)=1 AND
    (SELECT COUNT(*) FROM public.team_memberships WHERE player_id=v_pid AND active AND team_id=current_setting('cc.qa.dest_team')::uuid)=1
 THEN NULL; ELSE RAISE EXCEPTION 'QA_NEW_MEMBERSHIP_INCORRECT'; END IF;
 SELECT COALESCE(md5(string_agg(concat_ws('|',a.event_id,a.player_id,a.status,a.note,a.attendance_status,
        a.created_at,a.updated_at,a.attendance_marked_at,a.attendance_marked_by),'#' ORDER BY a.event_id)),'none') INTO v_sig
 FROM public.availability a WHERE a.player_id=v_pid;
 IF v_sig IS DISTINCT FROM current_setting('cc.qa.rsvp_signature') THEN
  RAISE EXCEPTION 'QA_HISTORIC_RSVP_MUTATED'; END IF;
 IF (SELECT COUNT(*) FROM public.audit_log)<>current_setting('cc.qa.audit_before')::bigint+1 THEN
  RAISE EXCEPTION 'QA_AUDIT_ROW_MISSING'; END IF;
 IF (SELECT COUNT(*) FROM public.player_push_outbox)<>current_setting('cc.qa.push_before')::bigint THEN
  RAISE EXCEPTION 'QA_UNEXPECTED_PUSH'; END IF;
END;
$assertions$;
RESET ROLE;

-- Unauthenticated should remain denied with valid UUID arguments.
SELECT set_config('request.jwt.claim.sub','',true);
SELECT set_config('request.jwt.claims','',true);
SET LOCAL ROLE authenticated;
DO $noauth$
BEGIN
 BEGIN
  PERFORM public.cc_manager_player_transfer_v1(current_setting('cc.qa.player')::uuid,current_setting('cc.qa.dest_team')::uuid,((now() AT TIME ZONE 'Europe/Budapest')::date));
  RAISE EXCEPTION 'QA_ANONYMOUS_MANAGER_WRITER';
 EXCEPTION WHEN insufficient_privilege THEN
  IF SQLERRM<>'MANAGER_AUTH_REQUIRED' THEN RAISE; END IF;
 END;
END;
$noauth$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS TEST Stage17 Manager transfer: consentless future RSVP denied, same-day atomic history preserved, cross-team/auth/ACL/validation verified; rollback' AS result;
