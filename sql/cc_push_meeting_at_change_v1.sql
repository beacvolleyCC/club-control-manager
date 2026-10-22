-- Calendar-related Manager push improvement, staged only; NOT live.
-- Adds the actual events.meeting_at to change signature and human-readable push text.
-- Preserves current Manager notify switch, trigger, outbox and dedupe semantics.
begin;
CREATE OR REPLACE FUNCTION public.cc_push_event_signature_v1(p_event jsonb)
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
SELECT md5(concat_ws('|',
  public.cc_push_event_team_v1(p_event),
  public.cc_push_event_kind_v1(p_event),
  coalesce(public.cc_push_event_start_v1(p_event)::text,''),
  coalesce(p_event->>'ends_at',p_event->>'end_at',p_event->>'end_time',p_event->>'endTime',''),
  coalesce(p_event->>'title',p_event->>'name',''),
  public.cc_push_event_place_v1(p_event),
  coalesce(p_event->>'address',''),
  coalesce(p_event->>'meeting_time',p_event->>'meetingTime',''),
  coalesce(p_event->>'meeting_place',p_event->>'meetingPlace',''),
  coalesce(p_event->>'meeting_at',''),
  public.cc_push_event_active_v1(p_event)::text
));
$function$;
CREATE OR REPLACE FUNCTION public.cc_push_notification_changed_event_body_v1(p_old jsonb, p_new jsonb, p_team_name text DEFAULT ''::text)
 RETURNS text
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_kind text := public.cc_push_event_kind_v1(p_new);
  v_old_active boolean := public.cc_push_event_active_v1(p_old);
  v_new_active boolean := public.cc_push_event_active_v1(p_new);
  v_old_when text := public.cc_push_event_display_datetime_v1(p_old);
  v_new_when text := public.cc_push_event_display_datetime_v1(p_new);
  v_old_place text := public.cc_push_event_display_place_v1(p_old);
  v_new_place text := public.cc_push_event_display_place_v1(p_new);
  v_old_opponent text := public.cc_push_match_opponent_v1(p_old,p_team_name);
  v_new_opponent text := public.cc_push_match_opponent_v1(p_new,p_team_name);
  v_old_meeting text := concat_ws(' • ',
    nullif(trim(coalesce(p_old->>'meeting_time',p_old->>'meetingTime',
      CASE WHEN nullif(p_old->>'meeting_at','') IS NOT NULL
        THEN to_char((p_old->>'meeting_at')::timestamptz AT TIME ZONE 'Europe/Budapest','YYYY.MM.DD. HH24:MI')
      END,'')),''),
    nullif(trim(coalesce(p_old->>'meeting_place',p_old->>'meetingPlace','')),'')
  );
  v_new_meeting text := concat_ws(' • ',
    nullif(trim(coalesce(p_new->>'meeting_time',p_new->>'meetingTime',
      CASE WHEN nullif(p_new->>'meeting_at','') IS NOT NULL
        THEN to_char((p_new->>'meeting_at')::timestamptz AT TIME ZONE 'Europe/Budapest','YYYY.MM.DD. HH24:MI')
      END,'')),''),
    nullif(trim(coalesce(p_new->>'meeting_place',p_new->>'meetingPlace','')),'')
  );
  v_subject text;
  v_count integer := 0;
  v_changes text := '';
BEGIN
  v_subject := CASE
    WHEN v_kind='match' AND v_new_opponent<>'' THEN 'A '||v_new_opponent||' elleni meccs'
    WHEN v_kind='match' THEN 'A meccs'
    ELSE 'Az edzés'
  END;

  IF v_old_active IS TRUE AND v_new_active IS NOT TRUE THEN
    RETURN v_subject||' törölve lett vagy elmarad.';
  END IF;

  IF v_old_active IS NOT TRUE AND v_new_active IS TRUE THEN
    RETURN v_subject||' újra aktív. '||concat_ws(' · ',nullif(v_new_when,''),nullif(v_new_place,''));
  END IF;

  IF v_old_when IS DISTINCT FROM v_new_when THEN
    v_count := v_count + 1;
    v_changes := concat_ws(' · ',nullif(v_changes,''),'Időpont: '||coalesce(nullif(v_old_when,''),'–')||' → '||coalesce(nullif(v_new_when,''),'–'));
  END IF;

  IF v_old_place IS DISTINCT FROM v_new_place THEN
    v_count := v_count + 1;
    v_changes := concat_ws(' · ',nullif(v_changes,''),'Helyszín: '||coalesce(nullif(v_old_place,''),'–')||' → '||coalesce(nullif(v_new_place,''),'–'));
  END IF;

  IF v_kind='match' AND v_old_opponent IS DISTINCT FROM v_new_opponent THEN
    v_count := v_count + 1;
    v_changes := concat_ws(' · ',nullif(v_changes,''),'Ellenfél: '||coalesce(nullif(v_old_opponent,''),'–')||' → '||coalesce(nullif(v_new_opponent,''),'–'));
  END IF;

  IF v_old_meeting IS DISTINCT FROM v_new_meeting THEN
    v_count := v_count + 1;
    v_changes := concat_ws(' · ',nullif(v_changes,''),'Találkozó: '||coalesce(nullif(v_old_meeting,''),'–')||' → '||coalesce(nullif(v_new_meeting,''),'–'));
  END IF;

  IF v_count=1 AND v_old_when IS DISTINCT FROM v_new_when THEN
    RETURN v_subject||' időpontja megváltozott: '||coalesce(nullif(v_old_when,''),'–')||' → '||coalesce(nullif(v_new_when,''),'–')||'.';
  END IF;

  IF v_count=1 AND v_old_place IS DISTINCT FROM v_new_place THEN
    RETURN v_subject||' helyszíne megváltozott: '||coalesce(nullif(v_old_place,''),'–')||' → '||coalesce(nullif(v_new_place,''),'–')||'.';
  END IF;

  IF v_count=1 AND v_kind='match' AND v_old_opponent IS DISTINCT FROM v_new_opponent THEN
    RETURN 'A meccs ellenfele megváltozott: '||coalesce(nullif(v_old_opponent,''),'–')||' → '||coalesce(nullif(v_new_opponent,''),'–')||'.';
  END IF;

  IF v_count=1 AND v_old_meeting IS DISTINCT FROM v_new_meeting THEN
    RETURN v_subject||' találkozója megváltozott: '||coalesce(nullif(v_old_meeting,''),'–')||' → '||coalesce(nullif(v_new_meeting,''),'–')||'.';
  END IF;

  IF v_count>1 THEN
    RETURN v_subject||' adatai megváltoztak. '||v_changes||'.';
  END IF;

  -- Fallback for a signature-changing field not explicitly rendered above.
  RETURN v_subject||' adatai megváltoztak. '||concat_ws(' · ',nullif(v_new_when,''),nullif(v_new_place,''));
END
$function$;
commit;
