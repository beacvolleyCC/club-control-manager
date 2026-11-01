-- TEST ONLY · CC Mass Sport server-only capacity and offer operations.
-- Requires Cloudflare Worker trusted gateway. DO NOT grant anonymous EXECUTE.
-- No mail or push side effects. No direct user-controlled workbook choice.
BEGIN;
DO $guard$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.events WHERE legacy_manager_id='cc_test_bb2_rsvp_20261106')
 THEN RAISE EXCEPTION 'WRONG_PROJECT_ABORT' USING ERRCODE='42501'; END IF;
 IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname IN ('cc_vnext_mass_capacity_v1','cc_vnext_mass_offer_next_v1','cc_vnext_mass_offer_expire_v1'))
 THEN RAISE EXCEPTION 'VNEXT_MASS_API_ALREADY_EXISTS_REVIEW_REQUIRED' USING ERRCODE='22023'; END IF;
END $guard$;
CREATE FUNCTION public.cc_vnext_mass_capacity_v1(p_event_id text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE e public.mass_events%rowtype; v_total int;v_new int;v_old int;v_reserved int;
BEGIN
 SELECT * INTO e FROM public.mass_events WHERE id=btrim(coalesce(p_event_id,'')) LIMIT 1;
 IF NOT FOUND OR upper(coalesce(e.session_type,''))='VERSENYSPORT'
 THEN RAISE EXCEPTION 'MASS_EVENT_NOT_FOUND' USING ERRCODE='22023'; END IF;
 SELECT count(*)::int,
 count(*) FILTER (WHERE upper(coalesce(b.capacity_bucket,'')) IN ('ÚJ','UJ')
  OR (coalesce(b.capacity_bucket,'')='' AND upper(coalesce(b.source,'')) IN ('ÚJ WEB','VÁRÓLISTA')))::int,
 count(*) FILTER (WHERE upper(coalesce(b.capacity_bucket,'')) IN ('RÉGI','REGI'))::int
 INTO v_total,v_new,v_old FROM public.mass_bookings b
 WHERE b.source_workbook_id=e.source_workbook_id AND b.event_id=e.id AND b.booking_status='AKTÍV';
 SELECT count(*)::int INTO v_reserved FROM public.mass_waitlist w
 WHERE w.source_workbook_id=e.source_workbook_id AND w.event_id=e.id
 AND w.waitlist_status='HELY FELAJÁNLVA' AND w.offer_expires_at>now();
 RETURN jsonb_build_object('eventId',e.id,'active',v_total,'newActive',v_new,'oldActive',v_old,
 'reserved',v_reserved,'totalLimit',greatest(coalesce(e.capacity,0),0),
 'newLimit',greatest(coalesce(nullif(e.new_limit,0),e.capacity,0),0),
 'oldLimit',greatest(coalesce(e.old_limit,0),0),
 'free',greatest(least(greatest(coalesce(e.capacity,0),0)-v_total-v_reserved,
 greatest(coalesce(nullif(e.new_limit,0),e.capacity,0),0)-v_new-v_reserved),0));
END $fn$;

-- Transactional oldest-waiter offer: no token returned, no mail enqueued.
-- Token is SHA-256 of a server-generated secret and passed only by trusted gateway.
CREATE FUNCTION public.cc_vnext_mass_offer_next_v1(
 p_event_id text,p_token_hash text,p_expires_at timestamptz)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE e public.mass_events%rowtype; w public.mass_waitlist%rowtype;
 v_total int;v_new int;v_reserved int;v_now timestamptz:=now();
BEGIN
 IF p_token_hash IS NULL OR p_token_hash !~ '^sha256:[a-f0-9]{64}$'
 THEN RAISE EXCEPTION 'TOKEN_HASH_INVALID' USING ERRCODE='22023'; END IF;
 SELECT * INTO e FROM public.mass_events WHERE id=btrim(coalesce(p_event_id,'')) FOR UPDATE;
 IF NOT FOUND OR upper(coalesce(e.session_type,''))='VERSENYSPORT'
 THEN RAISE EXCEPTION 'MASS_EVENT_NOT_FOUND' USING ERRCODE='22023'; END IF;
 IF NOT e.active OR NOT e.public_registration_active OR e.event_date IS NULL OR e.start_time IS NULL
  OR ((e.event_date+e.start_time) AT TIME ZONE 'Europe/Budapest')<=v_now+interval '2 hours'
  OR p_expires_at IS NULL OR p_expires_at<=v_now
  OR p_expires_at>((e.event_date+e.start_time) AT TIME ZONE 'Europe/Budapest')
  OR lower(coalesce(e.legacy_row->>'managerWaitlistOnly','false')) IN ('true','1','igen','yes')
 THEN RETURN jsonb_build_object('ok',true,'offered',false,'reason','EVENT_NOT_ELIGIBLE'); END IF;
 UPDATE public.mass_waitlist x SET waitlist_status='LEJÁRT',
  token_hash=CASE WHEN left(coalesce(x.token_hash,''),5)='USED:' THEN x.token_hash
                  WHEN x.token_hash IS NULL THEN NULL ELSE 'USED:'||x.token_hash END,
  updated_at=now()
 WHERE x.source_workbook_id=e.source_workbook_id AND x.event_id=e.id
 AND x.waitlist_status='HELY FELAJÁNLVA' AND x.offer_expires_at<=v_now;
 IF EXISTS(SELECT 1 FROM public.mass_waitlist x WHERE x.event_id=e.id
   AND x.source_workbook_id=e.source_workbook_id AND x.waitlist_status='HELY FELAJÁNLVA'
   AND x.offer_expires_at>v_now)
 THEN RETURN jsonb_build_object('ok',true,'offered',false,'reason','OFFER_ALREADY_ACTIVE'); END IF;
 SELECT count(*)::int,count(*) FILTER(WHERE upper(coalesce(b.capacity_bucket,'')) IN ('ÚJ','UJ')
  OR (coalesce(b.capacity_bucket,'')='' AND upper(coalesce(b.source,'')) IN ('ÚJ WEB','VÁRÓLISTA')))::int
 INTO v_total,v_new FROM public.mass_bookings b WHERE b.event_id=e.id
 AND b.source_workbook_id=e.source_workbook_id AND b.booking_status='AKTÍV';
 SELECT count(*)::int INTO v_reserved FROM public.mass_waitlist x WHERE x.event_id=e.id
 AND x.source_workbook_id=e.source_workbook_id AND x.waitlist_status='HELY FELAJÁNLVA'
 AND x.offer_expires_at>v_now;
 IF v_total+v_reserved>=greatest(coalesce(e.capacity,0),0) OR
 v_new+v_reserved>=greatest(coalesce(nullif(e.new_limit,0),e.capacity,0),0)
 THEN RETURN jsonb_build_object('ok',true,'offered',false,'reason','CAPACITY_FULL'); END IF;
 SELECT * INTO w FROM public.mass_waitlist x WHERE x.event_id=e.id
 AND x.source_workbook_id=e.source_workbook_id AND x.waitlist_status='VÁRAKOZIK'
 ORDER BY x.submitted_at ASC NULLS LAST,x.id ASC LIMIT 1 FOR UPDATE SKIP LOCKED;
 IF NOT FOUND THEN RETURN jsonb_build_object('ok',true,'offered',false,'reason','QUEUE_EMPTY'); END IF;
 UPDATE public.mass_waitlist SET waitlist_status='HELY FELAJÁNLVA',offered_at=v_now,
 offer_expires_at=p_expires_at,token_hash=p_token_hash,updated_at=now() WHERE id=w.id;
 INSERT INTO public.mass_live_write_audit(source_workbook_id,operation,entity_type,entity_id,actor,payload)
 VALUES(e.source_workbook_id,'test.offer_created','mass_waitlist',w.id,'trusted-gateway',
 jsonb_build_object('eventId',e.id,'expiresAt',p_expires_at,'mailQueued',false));
 RETURN jsonb_build_object('ok',true,'offered',true,'waitlistId',w.id,
 'eventId',e.id,'expiresAt',p_expires_at,'mailQueued',false);
END $fn$;

CREATE FUNCTION public.cc_vnext_mass_offer_expire_v1(p_event_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE e public.mass_events%rowtype;v_count int;
BEGIN
 SELECT * INTO e FROM public.mass_events WHERE id=btrim(coalesce(p_event_id,'')) FOR UPDATE;
 IF NOT FOUND OR upper(coalesce(e.session_type,''))='VERSENYSPORT'
 THEN RAISE EXCEPTION 'MASS_EVENT_NOT_FOUND' USING ERRCODE='22023'; END IF;
 UPDATE public.mass_waitlist w SET waitlist_status='LEJÁRT',
 token_hash=CASE WHEN left(coalesce(w.token_hash,''),5)='USED:' THEN w.token_hash
                 WHEN w.token_hash IS NULL THEN NULL ELSE 'USED:'||w.token_hash END,
 updated_at=now() WHERE w.source_workbook_id=e.source_workbook_id AND w.event_id=e.id
 AND w.waitlist_status='HELY FELAJÁNLVA' AND w.offer_expires_at<=now();
 GET DIAGNOSTICS v_count=ROW_COUNT;
 RETURN jsonb_build_object('ok',true,'eventId',e.id,'expired',v_count);
END $fn$;

REVOKE ALL ON FUNCTION public.cc_vnext_mass_capacity_v1(text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.cc_vnext_mass_offer_next_v1(text,text,timestamptz) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.cc_vnext_mass_offer_expire_v1(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cc_vnext_mass_capacity_v1(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.cc_vnext_mass_offer_next_v1(text,text,timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.cc_vnext_mass_offer_expire_v1(text) TO service_role;
COMMIT;
SELECT p.proname,
 has_function_privilege('anon',p.oid,'execute') AS anon_execute,
 has_function_privilege('authenticated',p.oid,'execute') AS authenticated_execute,
 has_function_privilege('service_role',p.oid,'execute') AS service_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public'
AND p.proname IN ('cc_vnext_mass_capacity_v1','cc_vnext_mass_offer_next_v1','cc_vnext_mass_offer_expire_v1')
ORDER BY p.proname;