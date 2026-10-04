Club Control Manager V0.5.2B6M1 — OVERVIEW GRID STABILIZE
Date: 2026-10-05

Frontend-only hotfix based directly on B6M.
No SQL. No schema changes. No data writes during deployment.

Purpose:
- restore/fail-safe the Versenysport > Áttekintő RSVP grids
- keep the current B6M mass attendance code unchanged
- prevent an empty/failed short-window RSVP load from making the overview grids disappear

Changes:
1. The 14-day overview matrix remains primary.
2. If it is empty/unavailable, the already-loaded season RSVP matrix is used.
3. If both matrix payloads are unavailable, activity events + Manager players provide a final read-only structural fallback.
4. Date filtering is applied client-side to the selected 14/28/custom window for all sources.
5. Invalid/stale overview team context is cleared automatically.
6. Only the three active overview competition teams are used for the default grid set.
7. Service worker cache key bumped to B6M1.

Important:
- MGR025/B6N attendance rebuild remains PAUSED until this overview regression is verified stable.
- audit_rows baseline observed before MGR025: 517.
