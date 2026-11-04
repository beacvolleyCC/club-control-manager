# Competition attendance statistics: TEST fix

The Manager `app.js` loads `cc_manager_players_v2`. Its existing SQL counts `availability.attendance_status` via `events` without excluding cancelled events, without checking completion, and without the 2026-09-29 start date.

For the attendance aggregate join, require `e.status = 'active'`, `e.starts_at >= timestamptz '2026-09-29 00:00:00+02'`, and `e.ends_at <= now()`. Preserve existing `present`/`absent` counting and manager permissions. Keep matches separate from training. Never infer absence from RSVP. Validate cancelled events excluded and that repeat counts remain stable.

This is a proposed fix, not deployed. Do not change LIVE without permission.
