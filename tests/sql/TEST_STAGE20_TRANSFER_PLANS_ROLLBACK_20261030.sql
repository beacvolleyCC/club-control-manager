BEGIN;
-- CC Stage20 TEST only: future-dated transfer reservation, NOT an automatic transfer.
-- No LIVE use. Current membership, attendances and RSVP records remain unchanged.
CREATE TABLE IF NOT EXISTS public.cc_manager_transfer_plans_v1 (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE RESTRICT,
 source_membership_id uuid NOT NULL REFERENCES public.team_memberships(id) ON DELETE RESTRICT,
 source_team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
 target_team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
 effective_on date NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','cancelled','applied','blocked')),
 created_by uuid NOT NULL REFERENCES auth.users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 cancelled_by uuid REFERENCES auth.users(id),
 cancelled_at timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT cc_manager_transfer_plans_distinct_teams CHECK(source_team_id<>target_team_id),
 CONSTRAINT cc_manager_transfer_plans_cancelled_together CHECK(
    (status='cancelled' AND cancelled_by IS NOT NULL AND cancelled_at IS NOT NULL)
    OR (status<>'cancelled' AND cancelled_by IS NULL AND cancelled_at IS NULL)
 )
);
CREATE UNIQUE INDEX IF NOT EXISTS cc_manager_transfer_plans_one_pending_per_player_v1
  ON public.cc_manager_transfer_plans_v1(player_id) WHERE status='pending';
CREATE INDEX IF NOT EXISTS cc_manager_transfer_plans_effective_due_v1
  ON public.cc_manager_transfer_plans_v1(effective_on,id) WHERE status='pending';
ALTER TABLE public.cc_manager_transfer_plans_v1 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.cc_manager_transfer_plans_v1 FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.cc_manager_player_transfer_plan_v1(p_player_id uuid,p_team_id uuid,p_effective_on date)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $f$
DECLARE
 v_actor uuid;
 v_player public.players%ROWTYPE;
 v_membership public.team_memberships%ROWTYPE;
 v_target public.teams%ROWTYPE;
 v_plan public.cc_manager_transfer_plans_v1%ROWTYPE;
 v_today date:=(now() AT TIME ZONE 'Europe/Budapest')::date;
 v_today_late date:=((now() AT TIME ZONE 'Europe/Budapest')::date + 366);
BEGIN
 IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'MANAGER_AUTH_REQUIRED' USING ERRCODE='42501'; END IF;
 v_actor:=private.cc_manager_require_any_v1('competition.players','edit');
 IF p_player_id IS NULL OR p_team_id IS NULL OR p_effective_on IS NULL THEN
  RAISE EXCEPTION 'PLAN_FIELDS_REQUIRED' USING ERRCODE='22023'; END IF;
 IF p_effective_on<=v_today OR p_effective_on>v_today_late THEN
  RAISE EXCEPTION 'PLAN_FUTURE_DATE_WITHIN_YEAR_REQUIRED' USING ERRCODE='22023'; END IF;
 -- Serialize all planning and transfer operations for this player.
 SELECT * INTO v_player FROM public.players WHERE id=p_player_id FOR UPDATE;
 IF NOT FOUND OR v_player.active IS DISTINCT FROM TRUE THEN
  RAISE EXCEPTION 'PLAN_ACTIVE_PLAYER_REQUIRED' USING ERRCODE='42501';END IF;
 SELECT * INTO v_membership FROM public.team_memberships
 WHERE player_id=p_player_id AND active=TRUE FOR UPDATE;
 IF NOT FOUND OR v_membership.starts_on>v_today OR
   (v_membership.ends_on IS NOT NULL AND v_membership.ends_on<v_today) THEN
  RAISE EXCEPTION 'PLAN_CURRENT_MEMBERSHIP_REQUIRED' USING ERRCODE='42501'; END IF;
 IF v_membership.team_id=p_team_id THEN RAISE EXCEPTION 'PLAN_SAME_TEAM' USING ERRCODE='22023';END IF;
 IF v_membership.ends_on IS NOT NULL AND v_membership.ends_on<p_effective_on THEN
  RAISE EXCEPTION 'PLAN_SOURCE_MEMBERSHIP_ENDS_EARLIER' USING ERRCODE='23514';END IF;
 IF NOT EXISTS(SELECT 1 FROM public.teams WHERE id=v_membership.team_id AND active=TRUE) THEN
  RAISE EXCEPTION 'PLAN_SOURCE_TEAM_NOT_ACTIVE' USING ERRCODE='42501';END IF;
 SELECT * INTO v_target FROM public.teams WHERE id=p_team_id AND active=TRUE;
 IF NOT FOUND THEN RAISE EXCEPTION 'PLAN_TARGET_TEAM_NOT_ACTIVE' USING ERRCODE='22023';END IF;
 IF NOT private.cc_manager_can_v1('competition.players','edit',v_membership.team_id)
 OR NOT private.cc_manager_can_v1('competition.players','edit',p_team_id) THEN
  RAISE EXCEPTION 'PLAN_BOTH_TEAM_PERMISSIONS_REQUIRED' USING ERRCODE='42501';END IF;
 IF EXISTS(SELECT 1 FROM public.cc_manager_transfer_plans_v1 x
           WHERE x.player_id=p_player_id AND x.status='pending') THEN
  RAISE EXCEPTION 'PLAN_ALREADY_PENDING' USING ERRCODE='23505';END IF;
 -- Do not silently discard commitments at or after the future transfer date.
 IF EXISTS(
   SELECT 1 FROM public.availability a JOIN public.events e ON e.id=a.event_id
   WHERE a.player_id=p_player_id AND e.team_id=v_membership.team_id
      AND e.status='active' AND a.status='going'
      AND ((e.starts_at AT TIME ZONE 'Europe/Budapest')::date>=p_effective_on)
 ) THEN RAISE EXCEPTION 'PLAN_FUTURE_GOING_RSVP_REVIEW_REQUIRED' USING ERRCODE='23514';END IF;
 INSERT INTO public.cc_manager_transfer_plans_v1
 (player_id,source_membership_id,source_team_id,target_team_id,effective_on,status,created_by)
 VALUES(p_player_id,v_membership.id,v_membership.team_id,p_team_id,p_effective_on,'pending',(SELECT auth.uid()))
 RETURNING * INTO v_plan;
 INSERT INTO public.audit_log(actor_user_id,action,entity_type,entity_id,old_data,new_data)
 VALUES ((SELECT auth.uid()),'manager.player_transfer.plan_create','transfer_plan',v_plan.id::text,NULL,
  jsonb_build_object('playerId',p_player_id,'sourceMembershipId',v_membership.id,
  'sourceTeamId',v_membership.team_id,'targetTeamId',p_team_id,'effectiveOn',p_effective_on,'status','pending',
  'automaticExecution',FALSE,'createdByManagerId',v_actor));
 RETURN jsonb_build_object('ok',TRUE,'planId',v_plan.id,'playerId',v_plan.player_id,
   'sourceTeamId',v_plan.source_team_id,'targetTeamId',v_plan.target_team_id,
   'effectiveOn',v_plan.effective_on,'status',v_plan.status,'automaticExecution',FALSE);
END;
$f$;

CREATE OR REPLACE FUNCTION public.cc_manager_player_transfer_plan_cancel_v1(p_plan_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $f$
DECLARE
 v_actor uuid;
 v_plan public.cc_manager_transfer_plans_v1%ROWTYPE;
 v_player public.players%ROWTYPE;
BEGIN
 IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'MANAGER_AUTH_REQUIRED' USING ERRCODE='42501'; END IF;
 v_actor:=private.cc_manager_require_any_v1('competition.players','edit');
 IF p_plan_id IS NULL THEN RAISE EXCEPTION 'PLAN_ID_REQUIRED' USING ERRCODE='22023';END IF;
 -- Avoid inconsistent lock order vs plan creation and eventual execution:
 -- read ID to select player, then lock player, then lock the plan.
 SELECT player_id INTO v_player.id FROM public.cc_manager_transfer_plans_v1 WHERE id=p_plan_id;
 IF v_player.id IS NULL THEN RAISE EXCEPTION 'PLAN_NOT_FOUND' USING ERRCODE='22023';END IF;
 PERFORM 1 FROM public.players WHERE id=v_player.id FOR UPDATE;
 SELECT * INTO v_plan FROM public.cc_manager_transfer_plans_v1 WHERE id=p_plan_id FOR UPDATE;
 IF NOT FOUND OR v_plan.status<>'pending' THEN RAISE EXCEPTION 'PLAN_NOT_PENDING' USING ERRCODE='23514';END IF;
 IF NOT private.cc_manager_can_v1('competition.players','edit',v_plan.source_team_id)
 OR NOT private.cc_manager_can_v1('competition.players','edit',v_plan.target_team_id) THEN
  RAISE EXCEPTION 'PLAN_BOTH_TEAM_PERMISSIONS_REQUIRED' USING ERRCODE='42501';END IF;
 UPDATE public.cc_manager_transfer_plans_v1
 SET status='cancelled',cancelled_by=(SELECT auth.uid()),cancelled_at=now(),updated_at=now()
 WHERE id=p_plan_id AND status='pending' RETURNING * INTO v_plan;
 IF NOT FOUND THEN RAISE EXCEPTION 'PLAN_CANCEL_CONFLICT' USING ERRCODE='40001'; END IF;
 INSERT INTO public.audit_log(actor_user_id,action,entity_type,entity_id,old_data,new_data)
 VALUES((SELECT auth.uid()),'manager.player_transfer.plan_cancel','transfer_plan',p_plan_id::text,
 jsonb_build_object('status','pending'),
 jsonb_build_object('status','cancelled','playerId',v_plan.player_id,'sourceTeamId',v_plan.source_team_id,
 'targetTeamId',v_plan.target_team_id,'effectiveOn',v_plan.effective_on,'cancelledByManagerId',v_actor));
 RETURN jsonb_build_object('ok',TRUE,'planId',v_plan.id,'status',v_plan.status);
END;
$f$;

CREATE OR REPLACE FUNCTION public.cc_manager_player_transfer_plan_list_v1(p_team_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $f$
DECLARE v_manager uuid;
BEGIN
 IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'MANAGER_AUTH_REQUIRED' USING ERRCODE='42501';END IF;
 IF p_team_id IS NULL THEN
  v_manager:=private.cc_manager_require_any_v1('competition.players','view');
 ELSE
  v_manager:=private.cc_manager_require_v1('competition.players','view',p_team_id);
 END IF;
 RETURN (
 SELECT coalesce(jsonb_agg(jsonb_build_object(
   'planId',x.id,'playerId',x.player_id,'playerName',coalesce(p.display_name,p.name),
   'sourceTeamId',x.source_team_id,'sourceTeamName',src.name,
   'targetTeamId',x.target_team_id,'targetTeamName',dst.name,
   'effectiveOn',x.effective_on,'status',x.status,
   'createdAt',x.created_at,'automaticExecution',FALSE
 ) ORDER BY x.effective_on,x.created_at,x.id),'[]'::jsonb)
 FROM public.cc_manager_transfer_plans_v1 x
 JOIN public.players p ON p.id=x.player_id
 JOIN public.teams src ON src.id=x.source_team_id
 JOIN public.teams dst ON dst.id=x.target_team_id
 WHERE x.status='pending' AND (p_team_id IS NULL OR p_team_id IN (x.source_team_id,x.target_team_id))
 AND private.cc_manager_can_v1('competition.players','view',x.source_team_id)
 AND private.cc_manager_can_v1('competition.players','view',x.target_team_id)
 );
END;
$f$;

REVOKE ALL ON FUNCTION public.cc_manager_player_transfer_plan_v1(uuid,uuid,date) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.cc_manager_player_transfer_plan_cancel_v1(uuid) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.cc_manager_player_transfer_plan_list_v1(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_player_transfer_plan_v1(uuid,uuid,date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_player_transfer_plan_cancel_v1(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_player_transfer_plan_list_v1(uuid) TO authenticated;

SELECT set_config('cc.qa.manager',(SELECT a.auth_user_id::text FROM public.manager_accounts a JOIN public.manager_module_permissions m ON m.manager_id=a.id WHERE a.active AND m.module_key='competition.players' AND m.can_edit AND m.team_id IS NULL LIMIT 1),true);
SELECT set_config('cc.qa.email',(SELECT email FROM public.manager_accounts WHERE auth_user_id=current_setting('cc.qa.manager')::uuid),true);
SELECT set_config('cc.qa.player',(SELECT m.player_id::text FROM public.team_memberships m JOIN public.players p ON p.id=m.player_id WHERE m.active AND p.active AND m.starts_on <= CURRENT_DATE AND (m.ends_on IS NULL OR m.ends_on >= CURRENT_DATE) AND NOT EXISTS(SELECT 1 FROM public.availability a JOIN public.events e ON e.id=a.event_id WHERE a.player_id=m.player_id AND e.team_id=m.team_id AND e.status='active' AND a.status='going' AND (e.starts_at AT TIME ZONE 'Europe/Budapest')::date >= (now() AT TIME ZONE 'Europe/Budapest')::date+7) ORDER BY m.player_id LIMIT 1),true);
SELECT set_config('cc.qa.from',(SELECT team_id::text FROM public.team_memberships WHERE player_id=current_setting('cc.qa.player')::uuid AND active),true);
SELECT set_config('cc.qa.to',(SELECT id::text FROM public.teams WHERE active AND id<>current_setting('cc.qa.from')::uuid ORDER BY id LIMIT 1),true);
SELECT set_config('cc.qa.memberships',(SELECT count(*)::text FROM public.team_memberships),true);
SELECT set_config('cc.qa.rsvps',(SELECT count(*)::text FROM public.availability),true);
SELECT set_config('cc.qa.pushes',(SELECT count(*)::text FROM public.player_push_outbox),true);
SELECT set_config('cc.qa.audits',(SELECT count(*)::text FROM public.audit_log),true);
SELECT set_config('request.jwt.claim.sub',current_setting('cc.qa.manager'),true);
SELECT set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('cc.qa.manager'),'role','authenticated','email',current_setting('cc.qa.email'))::text,true);
SET LOCAL ROLE authenticated;
DO $qa$
DECLARE j jsonb; n integer; pid uuid;
BEGIN
 BEGIN
  PERFORM public.cc_manager_player_transfer_plan_v1(current_setting('cc.qa.player')::uuid,current_setting('cc.qa.to')::uuid,(now() AT TIME ZONE 'Europe/Budapest')::date);
  RAISE EXCEPTION 'TODAY_PLAN_ALLOWED';
 EXCEPTION WHEN SQLSTATE '22023' THEN IF SQLERRM<>'PLAN_FUTURE_DATE_WITHIN_YEAR_REQUIRED' THEN RAISE; END IF;END;
 j:=public.cc_manager_player_transfer_plan_v1(current_setting('cc.qa.player')::uuid,current_setting('cc.qa.to')::uuid,(now() AT TIME ZONE 'Europe/Budapest')::date+7);
 IF j->>'ok'<>'true' OR j->>'status'<>'pending' THEN RAISE EXCEPTION 'PLAN_CREATION_FAILED';END IF;
 pid:=(j->>'planId')::uuid;
 BEGIN
  PERFORM public.cc_manager_player_transfer_plan_v1(current_setting('cc.qa.player')::uuid,current_setting('cc.qa.to')::uuid,(now() AT TIME ZONE 'Europe/Budapest')::date+8);
  RAISE EXCEPTION 'DUPLICATE_PLAN_ALLOWED';
 EXCEPTION WHEN unique_violation THEN IF SQLERRM<>'PLAN_ALREADY_PENDING' THEN RAISE; END IF;END;
 SELECT count(*) INTO n FROM jsonb_array_elements(public.cc_manager_player_transfer_plan_list_v1(NULL)) x WHERE x->>'planId'=pid::text;
 IF n<>1 THEN RAISE EXCEPTION 'PLAN_LIST_MISSING';END IF;
 j:=public.cc_manager_player_transfer_plan_cancel_v1(pid);
 IF j->>'status'<>'cancelled' THEN RAISE EXCEPTION 'PLAN_CANCEL_FAILED';END IF;
 SELECT count(*) INTO n FROM jsonb_array_elements(public.cc_manager_player_transfer_plan_list_v1(NULL)) x WHERE x->>'planId'=pid::text;
 IF n<>0 THEN RAISE EXCEPTION 'CANCELLED_PLAN_LEAKS_IN_PENDING_LIST';END IF;
END $qa$;
RESET ROLE;
DO $post$
BEGIN
 IF (SELECT count(*) FROM public.team_memberships)<>current_setting('cc.qa.memberships')::int OR
 (SELECT count(*) FROM public.availability)<>current_setting('cc.qa.rsvps')::int OR
 (SELECT count(*) FROM public.player_push_outbox)<>current_setting('cc.qa.pushes')::int OR
 (SELECT count(*) FROM public.audit_log)<>current_setting('cc.qa.audits')::int+2 OR
 (SELECT count(*) FROM public.cc_manager_transfer_plans_v1 WHERE status='pending')<>0
 THEN RAISE EXCEPTION 'DATA_INTEGRITY_FAILED'; END IF;
END $post$;
ROLLBACK;
SELECT 'PASS Stage20: date guard, create, duplicate, list, cancel, audit, RSVP/membership/push integrity; rollback' result;