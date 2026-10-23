# CC-FOLYTATÁS — canonical event bridge and seven unmatched Manager events (2026-10-23)

**Staging-only checkpoint:** Manager [draft PR #73](https://github.com/beacvolleyCC/club-control-manager/pull/73), branch `audit/20261022-canonical-event-crosswalk`. **No production write, alias insertion, Manager/Player deployment, push or RSVP update** in this work. The live data was queried with SELECT only, each new audit independently read back and executed twice.

## New discovery — two different match ID namespaces

The old Manager event alias model has:
- `private.cc_canonical_matches_v1`: **56** internal match rows.
- `private.cc_canonical_match_aliases_v1`: **46** `manager_event` aliases for **53** Manager match events; seven events are unmatched.
- `private.cc_canonical_competition_matches_v1`: **298** fixture/result projection rows (different canonical identity space).
- Of the 46 already-linked `manager_event` aliases, **only 4** have match IDs present directly in the 298 projection; **42** reference valid OLD internal `BRSZ imported fixture` IDs. **None of the 46 existing Manager aliases is an orphan against the 56-row internal catalog.**

Do not "fix" this by replacing the legacy match IDs in place or creating new Manager events. The mismatch is between identifier namespaces, not evidence that 42 events disappeared.

## Legacy BRSZ → current canonical: scoped candidates

`sql/audit_legacy_brsz_to_canonical_bridge_20261023.sql` joins source-alias `brsz_fixture` to existing `competition_source_matches`, then searches the canonical 298 ONLY within 2026/27 season, the known BEAC source team seed and competition, and explicit home/away **federation source team IDs**.

Two identical live READ-ONLY checks returned:

| Decision | Count |
|---|---:|
| `SCOPED_EXACT_TIME_CANDIDATE_ONLY` | 42 |
| `REVIEW_START_OR_STATUS_CONFLICT` | 2 |
| `BLOCK_SELF_MATCH` | 2 |
| Total reviewed source fixtures | **46** |

The two date-drift candidates are **BEAC–PDSE #2699** (Men I/B) and **BEAC II.–UTE U20 Pink #2348** (Women II/B), for which independent official protocols exist; the old timetable is not overwritten. Two raw BEAC–BEAC errors retain their `needs_review` status and have **zero** projection candidates. No automatic match alias is approved by the query, even for the 42 exact-time cases. Opponent/league/time matches without an official fixture identity remain candidate evidence only.

The bridge audit's `legacyManagerAliasCount=46` counts aliases belonging to the 46 legacy source fixtures, including already verified results and legacy duplicate-event aliases. It is **not** a claim that 46 Manager aliases are outside the new projection: that figure is **42**.

## Seven unmatched Manager events

`sql/audit_seven_manager_event_crosswalk_20261023.sql` separately reads **7** Manager `match` events with no `manager_event` alias, including **15 existing bookings**. Uses team UUID to known source seed and league (Women I 299, Women II/B 959, Men I/B 709), local kickoff, and home/away direction as **candidate filters** only; never infers opponent ID from the event title.

Two identical live SELECT runs:

| Review state | Events | Detail |
|---|---:|---|
| `SCOPED_TIME_CANDIDATE_ONLY` | 2 | Mozdulj SE–BEAC (2026-11-18 20:00, 1 booking) and BEAC–Mozdulj SE (2027-02-08 19:30), men I/B |
| `BLOCK_ARCHIVED_EVENT` | 2 | Archived BEAC II.–Corvinus has **12 bookings**; old BEAC–BEAC opponent erroneous |
| `BLOCK_EXPLICIT_UNCERTAINTY` | 2 | BEAC II.–Budapest Bunnies / MAFC-BME–BEAC II., uncertain times |
| `REVIEW_NO_SCOPED_CANDIDATE` | 1 | KRE-B–BEAC II., **2 bookings**; do not conflate with Women I KRE SC |

Both Mozdulj events have one projection candidate under the correct men I/B scope; they are **not approved links**. The other five events are blocked pending identity checks. All seven retain their original event UUID, status, RSVP and time. A candidate UUID from the 298 projection must **not** be inserted directly into the 56-row catalog's alias table; the compatibility scheme and official federation identifier need separate release design.

## CI and negative tests

- `tests/canonical-bridge-20261023/synthetic-46.sql`: synthetic 42 exact + two old-dated official results + two self-matches; plus 53 synthetic Manager events, seven unlinked and 15 bookings.
- `.github/workflows/canonical-bridge-qa.yml`: two **independent disposable PostgreSQL 17 databases**, each checks both SELECT audits twice, preserves the 53 events / 15 bookings / 46 aliases, and injects ambiguity to prove that the reviewer does **not** auto-resolve duplicate candidate rows. Tests never connect to LIVE Supabase.
- Staging SQL itself contains no DML/DDL, table grants or UI changes. All source aliases remain unmodified.

**QA visibility:** Confirm the exact CI run SHA/status before release claims; passing on a previous commit does not guarantee the final commit passes.

## Next code release gate

1. Keep legacy `match_id`, event UUID, `availability` and 46 existing aliases stable; build a **separate, additive namespace compatibility contract** with explicit source identity proof and no hidden name-only merges.
2. Re-check production baselines and the seven-event review against both current and post-protocol-overlay data; #74's 298 total / 13→15 played integration remains a separately staged release.
3. Do not merge #73/#74 with older Manager #68 or Player #19, and do not enable Apple calendar #72/#25 until the planned whole-project release.
4. At approved rollout, twice repeat full 11-point QA, authenticated Manager/Player mobile test, league separation and no duplicate RSVP/canonical IDs.

**No LIVE deployment. No tables changed.**
