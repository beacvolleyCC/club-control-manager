# CC-FOLYTATÁS — competition identity checkpoint (2026-10-23)

**Branch:** `audit/20261022-canonical-event-crosswalk` · **Draft Manager PR #73**, not merged/deployed. This checkpoint adds **read-only SQL only**, without changing LIVE rows, aliases, matches, events, RSVP, calendars or push. The independently staged Apple Calendar Manager #72 / Player #25 and MRSZ #2686/#2700 Manager #74 / Player #26 PRs remain untouched.

## Repeatable guard

Run `sql/audit_canonical_scoped_identity_20261023.sql` in SELECT-only mode. The query scopes duplicate fixture identity by **season + competition/grade/group + home source team ID + away source team ID + local kickoff**. It reports but never links, deletes or updates anything. Kickoff/name coincidence is *not* enough to authorize merging, and the canonical match UUID must not be shared between separate competition contexts.

Two independent LIVE read-only SQL checks on 2026-10-23 agreed:

| Indicator | Verified |
| --- | ---: |
| Canonical matches | 298 |
| Played | 13 |
| Duplicate scoped fixture keys | 0 |
| A match UUID appearing in multiple season/competition scopes | 0 |
| Manager match events without explicit canonical `manager_event` alias | 7 |
| Existing RSVP bookings attached to those seven | 15 |
| LIVE club events | 279 |
| LIVE total `availability` bookings | 672 |

Earlier handovers had 666 and 667 bookings. This is a dynamic production count. **No writes were made by this check**; repeat counts at any release gate and never use a historic count as a reason to roll back legitimate athlete activity.

## League-isolated source identities

These are three separate federation source IDs and must not be collapsed under `MTK` or opponent-name matching:

| Source team ID | Team | 2026/27 competition | Canonical appearances |
| --- | --- | --- | ---: |
| 1092 | MTK Budapest | Női Budapest I. osztály | 22 |
| 1165 | MTK Budapest kék | Női Budapest II. osztály, B csoport | 12 |
| 1215 | RKSK felnőtt női | Női Budapest II. osztály, B csoport | 12 |

MRSZ `2337`: 2026-10-13 18:20, MTK Budapest kék–RKSK felnőtt női **3–0** belongs exclusively to Women II/B. It does **not** verify an unrelated 2026-11-24 row merely because the teams look similar. A separate, reverse-direction RKSK–MTK kék fixture appears on 2027-01-11 (scheduled); it is not the played game. Do not transfer the `2337` result to any other date/competition.

## Unresolved crosswalk

From `docs/competition/CANONICAL_EVENT_SOURCE_REVIEW_20261022.md`: the seven unlinked Manager match events include two **candidate-only** Mozdulj–BEAC / BEAC–Mozdulj direction+time matches and five blocked/uncertain/archive situations. The archived BEAC II–Corvinus event holds 12 bookings; preserve those and the archived state. The KRE-B–BEAC II event must not be equated with Women I's KRE SC. No automatic `manager_event` alias insert is approved.

The broader **11 disputed schedule records** from the preceding review represent separate cases (four date disagreements, four undated postponements, one rescheduled postponement, one repeated pair, one unverified BEAC–BEAC). Do not conflate this eleven-record review queue with these seven Manager crosswalk gaps. Only the independently supplied official #2686 MTK–Panoráma and #2700 Mozdulj–MAFC-Vásárhelyi documents establish their corresponding 2026-10-21 result date; production canonical import remains separately staged in PR #74. The four undated postponements have no invented kickoff.

## Next release gate

1. Keep the unresolved eleven-source record audit and seven Manager aliases review-only; link only with season/league/group, home/away, official fixture code and a single existing canonical identity.
2. Preserve 298 distinct canonical identities when staged #2686/#2700 is eventually released: expected 13 -> 15 played without extra rows, stable IDs and all RSVP unchanged.
3. Verify release baselines twice, check the competing draft PR branches before merges, and defer production migrations/Edge deployment, authenticated iOS/Player smoke tests and push until the previously agreed integrated test window.
