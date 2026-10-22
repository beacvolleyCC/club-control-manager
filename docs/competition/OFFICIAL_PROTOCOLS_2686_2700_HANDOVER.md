# Two newly uploaded official MRSZ score sheets — staging and import guards
Date: 2026-10-22. **Staged in draft PR only. Not written to LIVE Supabase.**

## PDF files inspected (text extraction and separate high-resolution visual review)
- `mtk-panorama_bb1.pdf`, SHA256 `b72d1dd8d4e1a6db04a5ddc7fc7c2ea0c021a4a67d755bdaea85aef3b890c9c1`.
- `mozdulj-vasarhelyi_bb1.pdf`, SHA256 `e0dbe1e1e9b83d7324ad396b34d00879f7a07352084845008e81b8020a7c0736`.

## Official results
1. **MRSZ #2686**, 2026-10-21 21:00 Budapest, Női Budapest I, MTK Budapest–Panoráma SE **3–1**, sets `25:20 25:9 20:25 25:15`. Venue MTK Röplabda Csarnok, Szamos u. 2/C. **19 players**: MTK 12 (6 K, 5 Cs, 1 unmarked), Panoráma 7 (6 K, 1 Cs). Coaches, captain and libero markers, all player registration IDs entered.
2. **MRSZ #2700**, 2026-10-21 20:00 Budapest, Férfi Budapest I/B, Mozdulj–MAFC-Vásárhelyi **3–2**, sets `25:18 25:23 21:25 18:25 15:11`. Venue Mozdulj Sportcsarnok, Monori út 15. **19 players**: Mozdulj 10 (6 K, 2 Cs, 2 unmarked), MAFC 9 (6 K, 3 Cs). Coaches when present, captain and libero markers, all player registration IDs entered. Never treat an unmarked player as a starter or substitution.

## Connection to existing canonical data — verified READ ONLY
- Existing canonical fixture: `20261001:fixture:39` (MTK–Panoráma, same local kickoff), source team IDs `1092`/`753`; canonical projected matchId `04eaceee-57e2-7563-a618-beb933c0ffc0`, status `scheduled`.
- Existing canonical fixture: `brsz:2026/27:menB:userofficial:01` (Mozdulj–MAFC, same local kickoff), source team IDs `1213`/`45`; projected matchId `25a14406-2887-62fc-086c-ad770d160a6b`, status `scheduled`.
- Neither MRSZ code **2686** nor **2700** was already in the uploaded-protocol match records at inspection time.
- Legacy `public.cc_competition_user_schedule_v1` contains the same pairs at **2026-10-28**, conflicting with the official PDF. Do not overwrite or silently re-date that historical import: flag it for future canonical cutover.
- `private.cc_canonical_competition_matches_v1` currently partitions fixture versus protocol by different keys. **Inserting two new `match` rows without a verified fixture-supersession change would add duplicate canonical matches.** Do not directly import this JSON into LIVE as-is.
- Required release semantics: preserve raw original fixture records and their 298 canonical unique match identities; link one verified protocol to exactly one existing fixture; make final canonical visible rows remain **298**, with **15** played (13 earlier + 2), retaining all existing 13 previously recorded protocol links and unmodified event bookings.
- Preserve the *existing* canonical matchIds above when linking these protocol sources; do not generate two new active UI match identities. The two new MRSZ protocol codes do not appear in current private canonical ID mappings.
- A live protocol HTTP URL was **not independently verified**. No `protocolUrl` is asserted in staged JSON; in-app protocol view may be generated from the recorded rosters after migration, and a verified official link can be attached later.

## Changes and release gate
Structured extracted source: `data/competition/2026-27/official-protocols-20261021.json`. Its `sourceKey` is from the PDF's official match code; its `canonicalFixtureSourceKey` refers to the *existing* trusted fixture key. Team IDs are inherited from those exact fixture records, not printed in the PDFs.

- `tests/official-protocols-20261021.test.cjs` checks both 3-win scores, all complete set point pairs, 38 player rows, 4 captains, 3 liberos, unmarked roster statuses and source identity.
- `sql/official_protocols_20261021_readonly_preflight.sql` checks fixture baseline before any potential release.
- **No SQL INSERT/UPDATE/DELETE or Edge deployment in this PR.**
- Before release: implement canonical nonduplicating supersession in a *separate* backward-compatible migration, test against 298/15 invariants and prior 13 protocols twice; preserve raw sources and all existing bookings (read-only audit observed 667 at last count; earlier audit observed 666 — not changed by this PR), no Manager `events` recreation, do not generate push from a historical protocol import.

## Independent QA status
The two attached official pages were checked once via PDF extracted text and a second time visually from the rendered originals. GitHub CI is a separate data-structure/consistency gate. These checks are not a LIVE app import claim.

## Latest read-only baseline (two repeated queries)
Events: 279; bookings: **667**; canonical matches: 298; played: 13; previously stored official protocols: 13; new matchCode 2686/2700 rows: **0**. Earlier audit saw 666 bookings; one additional row exists now, without any write by this staging PR. This count is dynamic and must be rechecked at migration time.

## 2026-10-22 canonical integration code completed (not deployed)

**Draft PR #74 now also contains:**
- `sql/official_protocols_20261021_identity_safe_migration.sql`: a single transaction that enriches only the two already existing fixture source rows. It never adds a new match row or Manager event and never modifies RSVP/booking data.
- `sourceFixtureSnapshot` stores the entire original fixture JSON for future guarded rollback; `officialProtocolEvidence` preserves the uploaded PDF-derived data including 38 player registrations, match codes, referees, officials and set scores.
- `officialProtocolMatchCode` is deliberately a *separate top-level key* from `matchCode`. Adding the usual top-level `matchCode` to a fixture would **change the canonical UUID** in the current production view. The existing canonical payload function therefore reads `coalesce(matchCode,officialProtocolMatchCode)` without affecting the other fields.
- The two linked fixture `source_key` values, kickoff times, team identity strings and resulting canonical match UUIDs remain unchanged. The original 13 official match records remain separate and untouched.
- `sql/official_protocols_20261021_manual_rollback.sql` safely restores the original JSON only after checking both expected PDF hashes, old canonical IDs and a 298/15 baseline; it deliberately leaves the harmless backward-compatible matchCode fallback in place.
- `tests/official-protocols-20261021/bootstrap.sql` + the exact captured current production canonical view + `verify.sql` emulate **298 distinct canonical matches (13 already played)** in PostgreSQL 17. The new `.github/workflows/official-protocols-20261021-db.yml` tests two independent clean databases, first import (298/15), repeated import, guarded rollback (298/13), reimport (298/15), all 38 player records and 13 earlier protocols, and strict rejection/atomic rollback on an intentionally mismatching fixture.
- `tests/official-protocols-20261021-migration-coherence.test.cjs` checks that the SQL-embedded JSON evidence still exactly matches the reviewed source JSON. The regular 38-player and Manager sport-scoring QA workflows are independent.

**Latest verified CI on commit `09bcbddfd0e03d880f14b62e8b3bd4435122064d`:** canonical PostgreSQL QA, source/staging QA and Manager Sport Scoring QA succeeded. Run IDs 39803824673, 39803824450, 39803824606 respectively. Logs prove two clean database passes (and rollback + reimport); no LIVE Supabase write occurred.

**Release preconditions:** verify current production canonical schema against the captured test view, confirm the two sources are still in the expected `scheduled` state, take a backup, verify counts and booking baseline, run the staged SQL in the approved migration process, inspect canonical payload in Manager and Player, then run the full 11-point QA twice. If any other existing migration changes the canonical identity derivation, review/update this patch before release. Keep the PR draft until the user asks to integrate.

**Known display limit:** a verified external online PDF URL has not been attached; the official score and rosters are embedded in canonical data, but an official clickable original-PDF endpoint needs separate verification. Do not invent links.

## Manager / Player közös megjelenítési szerződés (2026-10-22, folytatás)

A két feltöltött hivatalos jegyzőkönyv eredményein túl a jelenlegi frontendek
már a `canonicalMatches[].protocol.teams[].players`, `teams[].staff` és
`protocol.officials` mezőket dolgozzák fel. A meglévő canonical payload
eddig csak a mezszámot, nevet, igazolási számot és K/CS-jelölést másolta át;
a kapitány-/liberójelölés és a stáb adatai elvesztek volna.

A #74 fejlesztési ágon az integrációs SQL-ben ezt célzottan kijavítottuk:
- minden játékosnál `captain` és `libero`, a forrás szerinti K/CS/null;
- mindkét csapat edzői a megfelelő `staff` csoportban, névvel és szerepkörrel;
- dokumentált játékvezetők / jegyzőkönyvvezető a `protocol.officials` tömbben;
- kizárólag az eredetiben rögzített személyek: hiányzó stáb/érték nem kerül feltöltésre;
- a korábbi 13 jegyzőkönyv változatlan `protocol.teams` ága továbbra is elsőbbséget kap;
- a meg nem erősített külső Hunvolley URL továbbra is üres, nem találunk ki hivatkozást.

**Kétszer ellenőrző PostgreSQL CI:** a `verify.sql` új igazolásai: 2686 és
2700 összesen 4 kapitányjelölése, 3 liberójelölése, 3 stábtag és 3
hivatalos személy, a jelöletlenek megőrzése, a teljes 38 fős névsor,
változatlan 298/15 mérkőzés, 13 régi eredmény és stabil canonical ID.
Mindkét külön adatbázison a létrehozás, ismétlés, rollback és újraimport
után is fut az ellenőrzés.

**A képernyős, bejelentkezett Manager/Player ellenőrzés továbbra sem történt meg:**
a LIVE canonical payload most még 298/13, az új MRSZ-kódok nincsenek telepítve.
A felhasználó korábbi döntésének megfelelően csak később, az adatbázis
integrációs bevezetésekor telepítünk és tesztelünk. A #74 PR draft marad.
