-- TEST-only regression checks. Run as a privileged database tester; no persistent changes.
DO $$
DECLARE v_booking text; v_waitlist text; v_count integer;
BEGIN
  IF (SELECT count(*) FROM public.mass_events) <>
     (SELECT count(*) FROM public.cc_v2_mass_event_registry) THEN
    RAISE EXCEPTION 'V2_MASS_EVENT_REGISTRY_INCOMPLETE';
  END IF;
  IF (SELECT count(*) FROM public.mass_bookings) <>
     (SELECT count(*) FROM public.cc_v2_mass_booking_registry) THEN
    RAISE EXCEPTION 'V2_MASS_BOOKING_REGISTRY_INCOMPLETE';
  END IF;
  IF (SELECT count(*) FROM public.mass_waitlist) <>
     (SELECT count(*) FROM public.cc_v2_mass_waitlist_registry) THEN
    RAISE EXCEPTION 'V2_MASS_WAITLIST_REGISTRY_INCOMPLETE';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.cc_v2_mass_booking_registry r
    JOIN public.mass_bookings b ON b.id=r.mass_booking_id
    JOIN public.cc_v2_mass_event_registry e ON e.id=r.mass_event_id
    WHERE e.mass_event_id<>b.event_id
  ) THEN RAISE EXCEPTION 'V2_MASS_BOOKING_EVENT_MISMATCH'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.cc_v2_mass_waitlist_registry r
    JOIN public.mass_waitlist w ON w.id=r.mass_waitlist_id
    JOIN public.cc_v2_mass_event_registry e ON e.id=r.mass_event_id
    WHERE e.mass_event_id<>w.event_id
  ) THEN RAISE EXCEPTION 'V2_MASS_WAITLIST_EVENT_MISMATCH'; END IF;
  IF has_table_privilege('authenticated','public.cc_v2_mass_booking_registry','SELECT')
    OR has_table_privilege('authenticated','public.cc_v2_mass_waitlist_registry','SELECT')
    OR has_function_privilege('anon','public.cc_v2_mass_registry_health_v1()','EXECUTE')
  THEN RAISE EXCEPTION 'V2_MASS_REGISTRY_PRIVILEGE_LEAK'; END IF;
END $$;
