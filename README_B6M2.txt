Club Control Manager V0.5.2B6M2 — Navigation / routing hardening

Base: V0.5.2B6M1. Frontend-only. No SQL/database changes.

Fixes:
- route generation token increments on navigation and browser popstate
- delayed native-picker callbacks are discarded after route changes
- top-level page renderers refuse to draw when their route is no longer active
- notification debounce is route-aware
- competition post-write reload renders only if the originating route is still active
- Planning permission no longer depends on whichever competition/mass area happened to be open previously
- special route cache keys normalized (planning/finance/settings)
- service-worker cache version bumped

Purpose: prevent late async responses from drawing an old module under a newly active menu.

No attendance/database migration is included. MGR025 remains paused.
