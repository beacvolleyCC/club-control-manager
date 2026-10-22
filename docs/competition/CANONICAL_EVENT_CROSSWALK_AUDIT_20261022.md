# Canonical match – Manager event crosswalk audit, 2026-10-22

**Status:** read-only audit on a dedicated branch. No SQL/DDL/DML deployed; all RSVP, attendance, event IDs, statuses and permissions preserved.

## Checked LIVE evidence
- `public.events`: 279 total; 53 `match`.
- `public.availability`: 666 total.
- `private.cc_canonical_matches_v1`: 56 canonical IDs.
- `private.cc_competition_canonical_payload_v1()`: 298 fixture/result objects.
- `manager_event` aliases: 46 linked distinct match event IDs; **7 missing links**. Missing alias != missing event or proven error.

| Event UUID | Name | Existing status | Booking count | Follow-up |
|---|---|---|---:|---|
| `35e9bc22-657f-4249-82b3-7a1f584ffd2c` | BEAC II. – Corvinus | archived | 12 | Preserve archive and bookings; investigate old/canonical identity |
| `a38971b2-2688-4092-8cdb-c4ded744e7e4` | BEAC – BEAC, ellenfél javítandó | archived | 0 | Historical uncertain opponent; no automatic alias |
| `d86ab722-1fe8-4376-8bc7-7e9401dc688b` | KRE-B – BEAC II. | active | 2 | Review official match identity before linking |
| `4b778529-4e95-4b67-8554-aa542ca91923` | BEAC II. – Budapest Bunnies, nem biztos időpont | active | 0 | Review fixture identity and date |
| `5a881ece-bd0c-4f25-89a2-a03eead09fec` | MAFC-BME – BEAC II., nem biztos időpont | active | 0 | Review fixture identity and date |
| `e4491cea-89cc-4933-9107-07271235fe0f` | Mozdulj SE – BEAC | active | 1 | Review official fixture ID |
| `c7d533f3-6e85-47f0-a1f0-542ffa1302d6` | BEAC – Mozdulj SE | active | 0 | Review official fixture ID |

## Rules
1. Preserve all 53 manager event IDs and the existing 666 booking rows.
2. Read canonical fixture ID or federation matchCode + season + competition and verify explicit source alias; never auto-link by names or kickoff alone.
3. Do not activate archived matches, correct uncertain kickoff times, notify athletes, update a booking, or create duplicate matches from this report.
4. The two unfinished five-league PRs (Manager #68 and Player #19) remain conflict-prone; no blind merge.
5. For later release, only an explicit verified crosswalk change should be submitted as an additive migration with audit, idempotence and two independent QA passes.

## Re-run
Use `sql/audit_canonical_manager_event_crosswalk_20261022.sql` as a read-only query (no writes). Compare link counts and the exact seven IDs after any future canonical import. Read-only statement results can vary once the real club dataset changes.

**Next:** review each unresolved event against official season/league/match ID; implement explicit crosswalk proposals only after identity proof, then unify Manager/Player read paths without event/RSVP mutation.
