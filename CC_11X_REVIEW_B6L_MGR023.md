# Club Control Manager B6L + MGR023 — 11× review

Date: 2026-10-04
Scope: attendance persistence, BEAC import navigation restoration, mobile standings geometry. B6K behavior otherwise frozen.

## 1. Product — PASS (static)
- Fix addresses reported data-loss symptom rather than masking it locally.
- BEAC import source-data entry point is restored without merging it into finance editing.
- Coach RSVP remains under Teams → Grid, not Overview.

## 2. UX / IA — PASS (static)
- Attendance marking no longer reopens/re-renders the whole event after every player.
- Failed writes revert the affected slider instead of leaving an optimistic false state.
- BEAC import is explicitly reachable from the Mass Sport secondary navigation.

## 3. UI / design — PASS (static), physical viewport pending
- Mobile standings use deterministic fixed column geometry inside their own scroll container.
- Root page remains width-constrained.
- Attendance busy state is localized to the active slider.

## 4. Frontend / PWA / device — PASS (static), device smoke pending
- `node --check app.js`: PASS.
- `node --check sw.js`: PASS.
- Build label aligned: V0.5.2B6L.
- Service-worker cache bump aligned: `cc-manager-v0-5-2b6l-attendance-beac-import-standings`.
- config.js is not shipped in the frontend replacement ZIP.

## 5. Backend / API — PASS (static contract), live execution pending
- New write RPC: `cc_manager_competition_attendance_v2`.
- New read RPC: `cc_manager_event_roster_v2`.
- Write RPC normalizes cleared state to NULL and verifies the persisted DB value before success.
- Frontend falls back to v1 only when the v2 RPC is genuinely unavailable.

## 6. DB / data integrity — PASS (static), live SQL pending
- MGR023 is additive.
- No DELETE/TRUNCATE of attendance data.
- Canonical storage remains `public.availability.attendance_status`.
- Existing audit path remains canonical through `cc_manager_set_attendance`.
- Roster read includes availability-linked players so persisted rows are not hidden by the read path.

## 7. Architecture / integration — PASS (static)
- UI cache is patched only after verified server response.
- Event roster read and attendance write now share the same canonical availability source.
- B6L preserves MGR021/MGR022 responsibilities rather than duplicating them.

## 8. Security / permissions — PASS (static contract), role smoke pending
- MGR023 uses existing Manager account + team/module permission helpers.
- anon EXECUTE is revoked.
- authenticated execution is explicitly granted.
- No direct browser table grant is introduced.

## 9. QA / performance / accessibility — PASS (static), live smoke pending
- HTML duplicate IDs: 0.
- CSS parser errors: 0.
- Merge conflict markers: 0.
- Attendance no longer triggers full data reload/dialog reopen per cell, reducing race and network pressure.
- Slider keeps aria-busy while its write is pending.

## 10. DevOps / release / rollback — PASS (static)
- MGR023 has PRECHECK / INSTALL / POSTCHECK / ROLLBACK.
- Frontend and backend are separately packaged.
- Complete bundle includes both packages.
- SHA256 generated at packaging time.

## 11. Motion / interaction — PASS (static), touch smoke pending
- Player-style attendance slider remains gesture/click based.
- Failed persistence restores the previous visual state.
- Wide tables own horizontal touch movement; page shell does not.

## Targeted regression assertions
- Mass nav contains `BEAC import`: PASS.
- Attendance frontend calls v2 write and v2 roster read: PASS.
- Attendance write function does not call `openEventDetail()` after each change: PASS.
- Saved status is checked against expected status: PASS.
- Player-style slider binding guard occurs exactly once: PASS.
- Mobile standings fixed table geometry present: PASS.
- Coach `✓ / · / ✕` controls remain in Teams season grid: PASS.

## Physical/live checks still required
- MGR023 PRECHECK/INSTALL/POSTCHECK on production Supabase.
- One-player attendance mark → close → reopen persistence.
- Rapid multi-player marking → close → reopen persistence.
- present / absent / clear transitions.
- coach `Nem vagyok ott` under Teams → Grid with admin and normal coach accounts.
- BEAC import visible and populated.
- iPhone standings horizontal scroll stays inside the standings card.
