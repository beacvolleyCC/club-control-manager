# Manager R1 — Attendance

Goal: stabilize Tömegsport attendance without changing the production `main` branch or replacing existing legacy RPCs.

## What R1 changes
- Adds a new authenticated Manager attendance writer: `cc_manager_mass_attendance_r1_v1`.
- Adds a new read-only attendance snapshot: `cc_manager_mass_attendance_snapshot_r1_v1`.
- The writer uses the installed B4.2 canonical attendance writer, then runs the installed B4.3B no-show/revoke evaluation, and finally reads the booking back from `public.mass_bookings`.
- The frontend keeps the current visual attendance slider but calls only the R1 writer.
- Existing `cc_manager_mass_attendance_v1` / MGR024 functions are not replaced or required by the R1 frontend.

## Important sanction note
B4.3B database sanction creation/revocation and future-booking cancellation run inside the R1 writer. The old Apps Script layer also sent warning/ban emails and offered newly freed waitlist spots. Those Apps Script-only notification steps are not falsely marked as sent by R1; the RPC returns `sanctionNotificationPending=true` for WARNING/BAN so that notification delivery can be wired explicitly later.

## Install order
1. `00_PRECHECK.sql`
2. `01_INSTALL.sql`
3. `02_POSTCHECK.sql`
4. Deploy the R1 frontend from `manager-rebuild` to a non-production test target first.
5. Smoke: change one attendance state, close/reopen the event, confirm persistence; then test a no-show correction/reversal.

Do not merge to `main` until the smoke test passes.
