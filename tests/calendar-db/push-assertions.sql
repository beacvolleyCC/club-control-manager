-- No live outbox writes; assert compatibility of the signature and meeting text.
DO $pushqa$
DECLARE
  v_old jsonb:=jsonb_build_object(
    'id','00000000-0000-4000-8000-000000000401',
    'team_id','00000000-0000-4000-8000-000000000301',
    'event_type','match','starts_at','2026-10-30T18:00:00Z',
    'status','active','venue','Bogdánfy','meeting_at','2026-10-25T16:30:00Z'
  );
  v_new jsonb;
  v_text text;
BEGIN
  v_new:=v_old||jsonb_build_object('meeting_at','2026-10-25T17:30:00Z');
  IF public.cc_push_event_signature_v1(v_old)=public.cc_push_event_signature_v1(v_new) THEN
    RAISE EXCEPTION 'QA: meeting_at change not in push dedupe signature';
  END IF;
  v_text:=public.cc_push_notification_changed_event_body_v1(v_old,v_new,'BEAC');
  IF v_text NOT LIKE '%Találkozó%' OR v_text NOT LIKE '%17:30%'
    OR v_text NOT LIKE '%18:30%' THEN
    RAISE EXCEPTION 'QA: Budapest meeting time change text missing: %',v_text;
  END IF;
  IF public.cc_push_event_signature_v1(v_old) <>
    public.cc_push_event_signature_v1(v_old||jsonb_build_object('color','#123456')) THEN
    RAISE EXCEPTION 'QA: cosmetic color change triggered push';
  END IF;
  IF public.cc_push_event_signature_v1(v_old)=
    public.cc_push_event_signature_v1(v_old||jsonb_build_object('venue','Más terem')) THEN
    RAISE EXCEPTION 'QA: venue change did not trigger push';
  END IF;
  RAISE NOTICE 'PUSH_MEETING_AT_QA_PASS';
END
$pushqa$;
