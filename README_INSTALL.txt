CLUB CONTROL PLAYER V2.3.10.17 — AWAY MATCH NAVIGATION

Changed files:
- index.html
- app.js
- styles.css
- sw.js

What changed:
1. Away-match address is always shown on the main event card.
2. Away-match address is always shown in the event detail dialog, even in compact mode.
3. Schedule rows also show the away address and navigation action.
4. Google Maps link now opens DIRECTIONS:
   https://www.google.com/maps/dir/?api=1&destination=...
   instead of a generic Maps search.
5. Button text: "Útvonaltervezés ↗".
6. Small premium interaction styling + reduced-motion support.
7. Cache/version strings bumped so the PWA picks up the change.

No changes to:
- Auth
- RSVP / attendance business logic
- Push / in-app notification logic
- Supabase schema or RPCs
- Team/player logic

Data requirement:
- event.home_away = 'away'
- event.address must be populated
The 2026 BRSZ import already populated address for the away matches.
