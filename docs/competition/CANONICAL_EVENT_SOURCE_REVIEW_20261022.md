# Second-pass source crosswalk review — 2026-10-22

Scope: **read-only source evidence**, never link automatically. Source of truth: LIVE `public.events`, `public.competition_source_matches`, `private.cc_canonical_match_aliases_v1`, and `private.cc_competition_canonical_payload_v1()`.

## Evidence hierarchy
1. Explicit official fixture ID or MRSZ matchCode, scoped by league and season.
2. Exact source key crosswalk to an already anchored canonical match ID.
3. Opponent direction + same local kickoff + league is a **candidate only**, never sufficient evidence to write.
4. Uncertain time, archived status, or previous RSVP makes automated linking especially unsafe.

## Seven unresolved Manager events
| Manager event | Source comparison | Candidate / decision |
|---|---|---|
| `e4491cea-89cc-4933-9107-07271235fe0f` Mozdulj SE – BEAC, 2026-11-18 20:00 Budapest | User-canonical menB source `brsz:2026/27:menB:userofficial:08`, same direction and kickoff; payload matchId `43aad0b3-be3b-5c4b-3d9b-c11e5a97756c` | **Candidate**. No matching identity row in `private.cc_canonical_matches_v1`; don't insert alias blindly |
| `c7d533f3-6e85-47f0-a1f0-542ffa1302d6` BEAC – Mozdulj SE, 2027-02-08 19:30 Budapest | User-canonical menB source `brsz:2026/27:menB:userofficial:29`, same direction and kickoff; payload matchId `c7131c88-5e3d-5177-1d90-09cb26b7d4de` | **Candidate**. Distinct canonical crosswalk UUID; no automatic insert |
| `35e9bc22-657f-4249-82b3-7a1f584ffd2c` BEAC II – Corvinus, archived, 12 bookings | Women II/B candidate BEAC II–Corvinus currently 2027-02-16; other Corvinus–BEAC II currently 2026-11-25. Both already have separate linked Manager events | **Do not link or reactivate**: historical archive and date conflict. Preserve all 12 bookings |
| `a38971b2-2688-4092-8cdb-c4ded744e7e4` BEAC–BEAC, archived | Previous BRSZ self-match fixture suspicious, team ID repeated | **Blocked**: no valid opponent identity |
| `d86ab722-1fe8-4376-8bc7-7e9401dc688b` KRE-B–BEAC II, 2 bookings | No matching competition+direction 2026/27 Women II/B canonical payload found in the targeted canonical comparison; similar `KRE SC` in Women I is **not equivalent** | **Blocked**: league/team identity unresolved |
| `4b778529-4e95-4b67-8554-aa542ca91923` BEAC II–Budapest Bunnies, uncertain time | No matching canonical payload candidate surfaced in target check | **Blocked**: source identity missing, time explicitly uncertain |
| `5a881ece-bd0c-4f25-89a2-a03eead09fec` MAFC-BME–BEAC II, uncertain time | Women II/B same-direction source exists for 2027-02-24, versus event on 2026-11-11; the source match is already connected to a different Manager event | **Blocked**: duplicate/date conflict; do not link |

## Additional crosswalk discovery
- `public.events`: 53 match events, 7 without `source_system='manager_event'` alias.
- `private.cc_canonical_matches_v1`: 56 canonical IDs; source aliases presently recognize 46 Manager match events.
- `private.cc_competition_canonical_payload_v1()`: 298 rows, with a distinct `matchId` identity space for some records. The payload `matchId` is **not always** a PK present in `private.cc_canonical_matches_v1`; do not assume they are interchangeable.
- No direct `competition_source_matches.linked_event_id` matches for the seven.
- The seven events account for 15 existing RSVP/booking records (12+2+1); all must be preserved.

## Release gate
Before any alias insert, demand official (league, season, fixture ID/matchCode), map the user-source key to the identity already used by `private.cc_canonical_matches_v1`, and establish whether another Manager event already claims that identity. Return multiple candidates for manual review; never resolve automatically by title/date. The two Mozdulj pairs are **candidates** rather than approved links.

No changes to LIVE data, no pushed notifications, no event status, booking or timestamp changes.
