-- CLUB CONTROL MANAGER R1.1 — MASS ATTENDANCE READBACK FIX
-- Safe to run after R1 installation.
-- Does not modify attendance data. Replaces only the authenticated Manager snapshot RPC
-- so legacy/imported non-cancelled booking statuses are included in readback.

BEGIN;

CREATE OR REPLACE FUNCTION public.cc_manager_mass_attendance_snapshot_r1_v1(
  p_event_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_manager_id uuid;
  v_event_id text := trim(coalesce(p_event_id,''));
BEGIN
  v_manager_id := private.cc_manager_require_any_v1('mass.trainings','view');

  IF v_event_id='' THEN
    RAISE EXCEPTION 'EVENT_ID_REQUIRED';
  END IF;

  RETURN (
    SELECT coalesce(
      jsonb_agg(
        jsonb_build_object(
          'bookingId',b.id,
          'eventId',b.event_id,
          'attendance',coalesce(nullif(trim(b.attendance),''),'NINCS RÖGZÍTVE'),
          'bookingStatus',coalesce(b.booking_status,''),
          'updatedAt',b.updated_at
        )
        ORDER BY lower(coalesce(b.name,'')),b.id
      ),
      '[]'::jsonb
    )
    FROM public.mass_bookings b
    WHERE b.event_id=v_event_id
      AND coalesce(b.booking_status,'') NOT IN ('LEMONDVA','KÉSŐN LEMONDVA')
  );
END
$$;

REVOKE ALL ON FUNCTION public.cc_manager_mass_attendance_snapshot_r1_v1(text)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cc_manager_mass_attendance_snapshot_r1_v1(text)
TO authenticated;

COMMIT;

-- Read-only verification: shows current status distribution for rows that can appear in Manager.
SELECT
  coalesce(booking_status,'(üres)') AS booking_status,
  count(*) AS rows,
  count(*) FILTER (WHERE attendance='MEGJELENT') AS attended,
  count(*) FILTER (WHERE attendance='NEM JELENT MEG') AS no_show,
  count(*) FILTER (WHERE coalesce(attendance,'') IN ('','NINCS RÖGZÍTVE')) AS pending
FROM public.mass_bookings
GROUP BY coalesce(booking_status,'(üres)')
ORDER BY rows DESC, booking_status;
