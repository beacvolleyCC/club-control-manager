-- CC TEST ONLY · vNext competition write baseline · 2026-11-01.
-- Manual TEST SQL Editor installer. Do not run on LIVE. Notifications deliberately disabled.
-- Existing attendance and note-clear functions are left intact.
BEGIN;
DO $check_test$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.events WHERE legacy_manager_id='cc_test_bb2_rsvp_20261106') THEN
    RAISE EXCEPTION 'WRONG_SUPABASE_PROJECT_ABORT' USING ERRCODE='42501';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname IN
      ('cc_manager_competition_event_save_v1','cc_manager_competition_event_cancel_v1',
       'cc_manager_competition_event_series_create_v1','cc_manager_competition_rsvp_v1')
  ) THEN RAISE EXCEPTION 'WRITE_API_ALREADY_INSTALLED_REVIEW_REQUIRED'; END IF;
END
$check_test$;

CREATE FUNCTION public.cc_manager_competition_event_save_v1(
  p_event_id uuid,p_payload jsonb,p_notify boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE
  v_actor uuid; v_before public.events%rowtype; v_after public.events%rowtype;
  v_team uuid; v_kind text; v_module text; v_start timestamptz; v_end timestamptz;
  v_key text; v_new boolean:=(p_event_id IS NULL); v_series uuid;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'MANAGER_AUTH_REQUIRED' USING ERRCODE='42501'; END IF;
  IF coalesce(p_notify,false) THEN RAISE EXCEPTION 'TEST_NOTIFICATION_SENDING_DISABLED' USING ERRCODE='22023'; END IF;
  IF p_payload IS NULL OR jsonb_typeof(p_payload)<>'object' OR p_payload='{}'::jsonb
  THEN RAISE EXCEPTION 'EVENT_PAYLOAD_OBJECT_REQUIRED' USING ERRCODE='22023'; END IF;
  FOR v_key IN SELECT jsonb_object_keys(p_payload) LOOP
    IF v_key NOT IN ('teamId','eventType','title','startsAt','endsAt','venue','address',
      'court','color','homeAway','meetingAt','meetingPlace','seriesId')
    THEN RAISE EXCEPTION 'EVENT_FIELD_NOT_EDITABLE:%',v_key USING ERRCODE='22023'; END IF;
  END LOOP;
  IF v_new THEN
    v_team:=nullif(p_payload->>'teamId','')::uuid;
    v_kind:=coalesce(nullif(btrim(p_payload->>'eventType'),''),'training');
    IF v_kind NOT IN ('training','match') THEN RAISE EXCEPTION 'EVENT_TYPE_INVALID' USING ERRCODE='22023'; END IF;
    IF v_team IS NULL OR NOT EXISTS(SELECT 1 FROM public.teams WHERE id=v_team AND active)
    THEN RAISE EXCEPTION 'TEAM_NOT_FOUND' USING ERRCODE='22023'; END IF;
  ELSE
    SELECT * INTO v_before FROM public.events WHERE id=p_event_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'EVENT_NOT_FOUND' USING ERRCODE='22023'; END IF;
    IF v_before.status<>'active' THEN RAISE EXCEPTION 'EVENT_NOT_ACTIVE' USING ERRCODE='22023'; END IF;
    IF coalesce(v_before.ends_at,v_before.starts_at)<now()
    THEN RAISE EXCEPTION 'EVENT_ALREADY_ENDED' USING ERRCODE='22023'; END IF;
    v_team:=v_before.team_id;v_kind:=v_before.event_type;
    IF p_payload ? 'teamId' AND (p_payload->>'teamId')::uuid IS DISTINCT FROM v_team
    THEN RAISE EXCEPTION 'EVENT_TEAM_TRANSFER_REQUIRES_SEPARATE_WORKFLOW' USING ERRCODE='42501'; END IF;
    IF p_payload ? 'eventType' AND p_payload->>'eventType' IS DISTINCT FROM v_kind
    THEN RAISE EXCEPTION 'EVENT_TYPE_IMMUTABLE' USING ERRCODE='22023'; END IF;
    IF p_payload ? 'seriesId' THEN RAISE EXCEPTION 'EVENT_SERIES_IMMUTABLE' USING ERRCODE='22023'; END IF;
  END IF;
  v_module:=CASE WHEN v_kind='match' THEN 'competition.matches' ELSE 'competition.trainings' END;
  v_actor:=private.cc_manager_require_v1(v_module,'edit',v_team);
  IF v_new THEN
    v_start:=nullif(p_payload->>'startsAt','')::timestamptz;
    v_end:=nullif(p_payload->>'endsAt','')::timestamptz;
    v_series:=nullif(p_payload->>'seriesId','')::uuid;
  ELSE
    v_start:=CASE WHEN p_payload ? 'startsAt' THEN nullif(p_payload->>'startsAt','')::timestamptz ELSE v_before.starts_at END;
    v_end:=CASE WHEN p_payload ? 'endsAt' THEN nullif(p_payload->>'endsAt','')::timestamptz ELSE v_before.ends_at END;
  END IF;
  IF v_start IS NULL OR (v_end IS NOT NULL AND v_end<=v_start)
  THEN RAISE EXCEPTION 'EVENT_TIME_INVALID' USING ERRCODE='22023'; END IF;
  IF v_new AND v_start<now()-interval '1 hour'
  THEN RAISE EXCEPTION 'EVENT_START_IN_PAST' USING ERRCODE='22023'; END IF;
  IF p_payload ? 'homeAway' AND nullif(p_payload->>'homeAway','') NOT IN ('home','away')
  THEN RAISE EXCEPTION 'HOME_AWAY_INVALID' USING ERRCODE='22023'; END IF;
  IF length(coalesce(p_payload->>'title',''))>160
     OR length(coalesce(p_payload->>'venue',''))>255
     OR length(coalesce(p_payload->>'court',''))>100
     OR length(coalesce(p_payload->>'address',''))>400
  THEN RAISE EXCEPTION 'EVENT_TEXT_TOO_LONG' USING ERRCODE='22023'; END IF;
  IF v_new THEN
    INSERT INTO public.events (team_id,event_type,title,starts_at,ends_at,venue,address,
       court,color,home_away,meeting_at,meeting_place,series_id,status)
    VALUES (v_team,v_kind,
       coalesce(nullif(btrim(p_payload->>'title'),''),CASE WHEN v_kind='match' THEN 'Meccs' ELSE 'Edzés' END),
       v_start,v_end,nullif(btrim(p_payload->>'venue'),''),
       nullif(btrim(p_payload->>'address'),''),nullif(btrim(p_payload->>'court'),''),
       nullif(btrim(p_payload->>'color'),''),
       CASE WHEN v_kind='match' THEN nullif(p_payload->>'homeAway','') ELSE NULL END,
       nullif(p_payload->>'meetingAt','')::timestamptz,nullif(btrim(p_payload->>'meetingPlace'),''),
       v_series,'active')
    RETURNING * INTO v_after;
  ELSE
    UPDATE public.events e SET starts_at=v_start,ends_at=v_end,
      title=CASE WHEN p_payload ? 'title' THEN coalesce(nullif(btrim(p_payload->>'title'),''),e.title) ELSE e.title END,
      venue=CASE WHEN p_payload ? 'venue' THEN nullif(btrim(p_payload->>'venue'),'') ELSE e.venue END,
      address=CASE WHEN p_payload ? 'address' THEN nullif(btrim(p_payload->>'address'),'') ELSE e.address END,
      court=CASE WHEN p_payload ? 'court' THEN nullif(btrim(p_payload->>'court'),'') ELSE e.court END,
      color=CASE WHEN p_payload ? 'color' THEN nullif(btrim(p_payload->>'color'),'') ELSE e.color END,
      home_away=CASE WHEN v_kind='match' AND p_payload ? 'homeAway'
                   THEN nullif(p_payload->>'homeAway','') ELSE e.home_away END,
      meeting_at=CASE WHEN p_payload ? 'meetingAt' THEN nullif(p_payload->>'meetingAt','')::timestamptz ELSE e.meeting_at END,
      meeting_place=CASE WHEN p_payload ? 'meetingPlace' THEN nullif(btrim(p_payload->>'meetingPlace'),'') ELSE e.meeting_place END,
      updated_at=now()
    WHERE e.id=p_event_id RETURNING * INTO v_after;
  END IF;
  INSERT INTO public.audit_log(actor_user_id,action,entity_type,entity_id,old_data,new_data)
  VALUES ((SELECT auth.uid()),
    CASE WHEN v_new THEN 'manager.event.create' ELSE 'manager.event.update' END,
    'event',v_after.id::text,CASE WHEN v_new THEN NULL ELSE to_jsonb(v_before) END,to_jsonb(v_after));
  RETURN jsonb_build_object('ok',true,'created',v_new,'eventId',v_after.id,
    'before',CASE WHEN v_new THEN NULL ELSE to_jsonb(v_before) END,
    'after',to_jsonb(v_after),'notification',jsonb_build_object('queued',false));
END
$fn$;

CREATE FUNCTION public.cc_manager_competition_event_cancel_v1(p_event_id uuid,p_notify boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE v_actor uuid; v_before public.events%rowtype; v_after public.events%rowtype; v_module text;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'MANAGER_AUTH_REQUIRED' USING ERRCODE='42501'; END IF;
  IF coalesce(p_notify,false) THEN RAISE EXCEPTION 'TEST_NOTIFICATION_SENDING_DISABLED' USING ERRCODE='22023'; END IF;
  SELECT * INTO v_before FROM public.events WHERE id=p_event_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'EVENT_NOT_FOUND' USING ERRCODE='22023'; END IF;
  v_module:=CASE WHEN v_before.event_type='match' THEN 'competition.matches' ELSE 'competition.trainings' END;
  v_actor:=private.cc_manager_require_v1(v_module,'edit',v_before.team_id);
  IF v_before.status<>'active' THEN RAISE EXCEPTION 'EVENT_NOT_ACTIVE' USING ERRCODE='22023'; END IF;
  IF coalesce(v_before.ends_at,v_before.starts_at)<now()
  THEN RAISE EXCEPTION 'EVENT_ALREADY_ENDED' USING ERRCODE='22023'; END IF;
  UPDATE public.events SET status='cancelled',updated_at=now() WHERE id=p_event_id RETURNING * INTO v_after;
  INSERT INTO public.audit_log(actor_user_id,action,entity_type,entity_id,old_data,new_data)
  VALUES((SELECT auth.uid()),'manager.event.cancel','event',p_event_id::text,to_jsonb(v_before),to_jsonb(v_after));
  RETURN jsonb_build_object('ok',true,'eventId',p_event_id,'before',to_jsonb(v_before),
    'after',to_jsonb(v_after),'notification',jsonb_build_object('queued',false));
END
$fn$;

CREATE FUNCTION public.cc_manager_competition_rsvp_v1(p_event_id uuid,p_player_id uuid,p_status text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE v_event public.events%rowtype; v_status text:=lower(btrim(coalesce(p_status,'')));
        v_before jsonb; v_after jsonb; v_day date; v_actor uuid;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'MANAGER_AUTH_REQUIRED' USING ERRCODE='42501'; END IF;
  SELECT * INTO v_event FROM public.events WHERE id=p_event_id;
  IF NOT FOUND OR v_event.status<>'active'
  THEN RAISE EXCEPTION 'EVENT_NOT_ACTIVE' USING ERRCODE='22023'; END IF;
  v_actor:=private.cc_manager_require_v1(
    CASE WHEN v_event.event_type='match' THEN 'competition.matches' ELSE 'competition.trainings' END,
    'edit',v_event.team_id);
  IF v_status NOT IN ('going','not_going','unknown') THEN
    RAISE EXCEPTION 'RSVP_INVALID' USING ERRCODE='22023'; END IF;
  v_day:=(v_event.starts_at AT TIME ZONE 'Europe/Budapest')::date;
  IF NOT EXISTS(SELECT 1 FROM public.team_memberships tm
    JOIN public.players p ON p.id=tm.player_id
    WHERE tm.player_id=p_player_id AND tm.team_id=v_event.team_id
     AND p.active AND tm.active AND tm.starts_on<=v_day
     AND (tm.ends_on IS NULL OR tm.ends_on>=v_day))
  THEN RAISE EXCEPTION 'PLAYER_NOT_IN_EVENT_TEAM' USING ERRCODE='42501'; END IF;
  SELECT to_jsonb(a) INTO v_before FROM public.availability a
    WHERE a.event_id=p_event_id AND a.player_id=p_player_id FOR UPDATE;
  INSERT INTO public.availability(event_id,player_id,status,updated_at)
    VALUES (p_event_id,p_player_id,v_status,now())
    ON CONFLICT (event_id,player_id) DO UPDATE SET status=excluded.status,updated_at=now();
  SELECT to_jsonb(a) INTO v_after FROM public.availability a
    WHERE a.event_id=p_event_id AND a.player_id=p_player_id;
  INSERT INTO public.audit_log(actor_user_id,action,entity_type,entity_id,old_data,new_data)
    VALUES((SELECT auth.uid()),'manager.rsvp.override','availability',p_event_id::text||':'||p_player_id::text,v_before,v_after);
  RETURN jsonb_build_object('ok',true,'eventId',p_event_id,'playerId',p_player_id,'status',v_status);
END
$fn$;

CREATE FUNCTION public.cc_manager_competition_event_series_create_v1(p_payloads jsonb,p_notify boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE v_count int; v_item jsonb; v_ids jsonb:='[]'::jsonb; v_saved jsonb;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'MANAGER_AUTH_REQUIRED' USING ERRCODE='42501'; END IF;
  IF coalesce(p_notify,false) THEN RAISE EXCEPTION 'TEST_NOTIFICATION_SENDING_DISABLED' USING ERRCODE='22023'; END IF;
  IF p_payloads IS NULL OR jsonb_typeof(p_payloads)<>'array'
  THEN RAISE EXCEPTION 'EVENT_SERIES_ARRAY_REQUIRED' USING ERRCODE='22023'; END IF;
  v_count:=jsonb_array_length(p_payloads);
  IF v_count NOT BETWEEN 1 AND 26
  THEN RAISE EXCEPTION 'EVENT_SERIES_COUNT_INVALID' USING ERRCODE='22023'; END IF;
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_payloads) LOOP
    v_saved:=public.cc_manager_competition_event_save_v1(NULL,v_item,false);
    v_ids:=v_ids||jsonb_build_array(v_saved->'eventId');
  END LOOP;
  RETURN jsonb_build_object('ok',true,'count',v_count,'eventIds',v_ids,'notification',
    jsonb_build_object('queued',false));
END
$fn$;

REVOKE ALL ON FUNCTION public.cc_manager_competition_event_save_v1(uuid,jsonb,boolean) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.cc_manager_competition_event_cancel_v1(uuid,boolean) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.cc_manager_competition_rsvp_v1(uuid,uuid,text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.cc_manager_competition_event_series_create_v1(jsonb,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cc_manager_competition_event_save_v1(uuid,jsonb,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_competition_event_cancel_v1(uuid,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_competition_rsvp_v1(uuid,uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_competition_event_series_create_v1(jsonb,boolean) TO authenticated;
COMMIT;

SELECT p.proname, has_function_privilege('anon',p.oid,'execute') AS anon_execute,
 has_function_privilege('authenticated',p.oid,'execute') AS auth_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname IN (
 'cc_manager_competition_event_save_v1','cc_manager_competition_event_cancel_v1',
 'cc_manager_competition_event_series_create_v1','cc_manager_competition_rsvp_v1'
) ORDER BY p.proname;
