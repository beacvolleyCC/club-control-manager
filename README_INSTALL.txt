CLUB CONTROL PLAYER — V2.3.10.19
COMPACT EVENT INFO + AWAY NAVIGATION + CALENDAR EXPORT

BASELINE
- Built from V2.3.10.16 stable rollback.
- The uploaded V2.3.10.17 candidate was NOT used as the base because comparison found accidental regressions versus V2.3.10.16.
- The intended V2.3.10.17 away-navigation behavior was ported onto V2.3.10.16.

FIX / INCLUDED
1) Event cards and details
- Removed the old global "Részletes eseményadatok" setting from the UI.
- Event details are now contextual and always informative.
- Training card: date/day + time + court only; no full venue/address repetition.
- Home match card: match title + date/day + time + court only; no full venue/address repetition.
- Away match card: match title + date/day/time + one address line only.
- Away card keeps Google Maps and headcount in the same compact action row.
- Away details: venue + address + directions + meeting information.
- Training/home details: court only; date/time already remains in the dialog header.
- No duplicated venue/address lines.

2) Away navigation
- "Google Maps ↗" / "Útvonaltervezés ↗" uses Google Maps directions endpoint:
  https://www.google.com/maps/dir/?api=1&destination=...
- Destination is encoded from event.address.

3) Calendar export
- New Settings > Menetrend > Naptár export card.
- Apple Naptár / iPhone button: shares the generated .ics file when file sharing is supported, otherwise downloads it.
- Google Calendar button: downloads the same .ics file for import.
- One .ics contains all currently loaded team events.
- Europe/Budapest timezone is explicitly included.
- No roster, attendance response or coach note is exported.
- This is intentionally ONE-TIME EXPORT, not live sync. Later Club Control changes do not update already imported events.

DATA NOTE
- Current 2026/27 BRSZ home-match import records have court=NULL.
- Therefore those home matches display "Pálya –" until a real court number is stored.
- No court number was guessed or hard-coded.

JAVÍTANDÓ / PHYSICAL QA BEFORE PRODUCTION
- iPhone PWA: Apple calendar file/share flow.
- Android: Google Calendar import flow from the generated file (Google's mobile app does not provide direct bulk .ics import UI; desktop web import is the reliable path).
- Desktop: Google Calendar Settings > Import & export import.
- Real imported away match: address + Google Maps destination.
- Real training/home match: compact court display.
- Notification swipe regression smoke, especially iOS red-tail behavior from V2.3.10.16.

KÉSŐBB
- If automatic calendar updates are desired, replace one-time export with a private tokenized read-only ICS subscription feed.

TELEPÍTÉS
Replace only:
- index.html
- app.js
- styles.css
- sw.js

NO SQL REQUIRED.
Do not rerun 047–053, MGR001 or MGR002.

Build:
Player V2.3.10.19

HOME MATCH COURT FALLBACK (V2.3.10.19)
- BEAC Férfi home match on Monday: 3. pálya
- BEAC Női I. home match on Friday: 3. pálya
- BEAC Női II. home match on Tuesday: 2. pálya
- Explicit event.court always wins; fallback only fills missing home-match court labels.
- Same resolved court is used on cards, details and ICS LOCATION.
