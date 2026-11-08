# 2. lépés — Club Control V2 egységes adatmodell (tervezet, 2026-11-08)

Állapot: logikai modell, **nem végrehajtott SQL migráció**. Az 1. lépés nyitott adatminőségi és jogosultsági ellenőrzései után véglegesíthető.

## Hiteles források és entitások
| Entitás | V2 hiteles forrás | Régi/modulspecifikus kapcsolat |
|---|---|---|
| Személy/játékos | `players.id` UUID | `mass_athletes.id` TEXT → explicit identity mapping |
| Csapat | `teams.id` UUID | régi team_id és külső szövetségi team_id mapping |
| Csapattagság | `team_memberships` | időbeli tagság, áthelyezés és jogosultság |
| Esemény (edzés/meccs) | `events.id` UUID | `mass_events.id` TEXT → event mapping |
| Jelentkezés/jelenlét | `availability(event_id,player_id)` | `mass_bookings` állapotok adaptere |
| Várólista | elkülönített waitlist domain, közös event/player FK | `mass_waitlist` ajánlatok és tokenek megtartása |
| Versenyeredmény | hivatalos `competition_source_matches` + linked event | külön eredet és korrekciók, nem felülírva |
| Jegyzőkönyv | `cc_match_sheets_v1` és kapcsolódó táblák | ugyanaz az event_id, player_id |
| Bérlet / díj | `player_fees` és kapcsolt fizetési források | BEAC import, override és audit elkülönítve |
| Értesítés | `player_notifications`, push outbox | player_id normalizálása, idempotencia |
| Manager jog | `manager_accounts`, `manager_module_permissions` | auth.uid, csapat/modul/művelet szerinti szerveroldali ellenőrzés |

## Alapelvek
1. Egyetlen kanonikus UUID személy-, esemény- és csapatazonosító. Külső/legacy azonosítók mapping táblában `(source_system,external_id,canonical_id)`, egyediség és provenance mezőkkel.
2. A külső importok és az eredeti forrásadatok változatlanul megőrzendők; nem írják felül vakon a kézi admin-korrekciókat.
3. Egyetlen üzleti szabályréteg: jelentkezés, kapacitás, várólista-ajánlat, lemondási határidő, szankció, jelenlét és díjellenőrzés tranzakcionális szerveroldali műveletekkel.
4. A Manager és Player ugyanazokat a domén API-kat hívja, eltérő jogosultságokkal. A UI sosem jogosultsági határ.
5. Minden fontos írás auditált, idempotens; az esemény- és tagságváltozások történetét megőrizzük.
6. TEST és LIVE azonos migrációs verziót kaphat, de fizikailag külön adatbázis marad. Most kizárólag TEST a cél.

## Javasolt bevezetési sorrend
A. Identity/event mapping és egyezőségi riportok (csak olvasás, majd kontrollált backfill).
B. Egységes read API, csapat/modul jogosultsági negatív tesztekkel.
C. Közös esemény, jelentkezés, jelenlét és várólista tranzakciós API.
D. Bérlet és pénzügy, meccs és jegyzőkönyv, értesítések és statisztikák adapterei.
E. V2 Manager/Player integráció, shadow read összehasonlítás V1-gyel, külön TEST E2E.
F. V1 írási utak fokozatos kiváltása csak adat- és működés-egyezőség után.

## Nyitott döntések
- Tömegsport vendég regisztráció: lehet-e auth nélküli személy; mikor válik `players` rekorddá?
- Egy személy több csapatban és szintben való tagsága, időbelisége.
- Díjforrások sorrendje és a BEAC import késése.
- A `mass_bookings` és `availability` státuszainak teljes kétirányú megfeleltetése.
- Külső szövetségi meccs azonosítás, több bajnokság elkülönítése.
- Migrációs visszaállítás és történeti audit megőrzése.

**Nem történt adatbázis-módosítás.** A dokumentum tervezési döntési alap, nem kész migráció.
