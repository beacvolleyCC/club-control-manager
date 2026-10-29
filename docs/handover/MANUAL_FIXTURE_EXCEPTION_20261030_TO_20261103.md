# LIVE fixture exception – manual Manager edit required (2026-10-29)

## User-provided schedule change (not yet applied by development tools)
- A scheduled **Friday 2026-10-30 19:30** BEAC team away match was postponed to **Tuesday 2026-11-03 19:30**.
- Venue moved to **BEAC** because the opponent relinquished choice of venue.
- The match retains **away** sporting designation and its opponent/home-away order. BEAC venue does not make it a BEAC home fixture.
- Team/opponent and stable match ID **were not given**, so NO automatic row-level mutation, ID match, or data import rewrite is authorized from this note.
- User plans to **edit the existing LIVE Manager match record** and use the "Értesítés küldése a játékosoknak a változásról" checkbox to notify affected players. The system must not send a second notification just because a later patch is deployed.
- Do not cancel/recreate the event; preserve event ID, RSVP/status/note, audit trail and any calendar subscriptions.

## Cross-system migration / patch safeguard
1. When subsequent TEST schema migration, vNext rebuild, sports feed sync, or match importer is designed, reconcile official/source fixture IDs with manually edited records rather than naïvely overwriting dates, locations, away status or cancellations.
2. Define field-level precedence for manual Manager edits vs. official import and keep a durable override history. Preserve this rescheduled fixture until it is explicitly verified against its match ID.
3. Check both `events` (Manager schedule/Player RSVP) and official competition source matches/overrides if both are used, keeping their data and unique identities consistent. The same match should not reappear on Friday because the importer references the older announcement.
4. Preserve team/league/season context: never merge women's BB1, BB2/B and men's A/B standings or schedules.
5. Keep notification opt-in manual and idempotent. No push/SMTP or data mutation from TEST preparation. Ask for actual match identifier if later live re-sync needs exact mapping.
6. This note is **not proof** that LIVE data was edited or that notifications were delivered. Confirm in the LIVE Manager before claiming either.
7. No modifications to LIVE code/DB or separate vNext branches are implied or made by this note.

## QA for later patch
- Existing LIVE record date/time=2026-11-03 19:30 local Budapest, venue BEAC, homeAway=away, same event ID and prior RSVPs.
- Only the affected team notified once; verify in-app/push delivery status separately.
- Refresh/import does not restore the old 2026-10-30 19:30 fixture or flip homeAway=home.
