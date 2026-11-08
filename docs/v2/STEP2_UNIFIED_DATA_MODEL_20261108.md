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


## V2 továbblépési döntési kapu — 2026-11-08
Az 1. lépés strukturális leltára elegendő a **2. lépés logikai modelljének részletes kidolgozásához**, de nem elegendő adatátíró migráció vagy LIVE cutover engedélyezéséhez. A két munka párhuzamosan haladhat; a nyitott biztonsági audit külön blokkoló feltétel marad.

### Első végrehajtható V2 csomag (TEST, adatvesztés nélkül)
1. `identity_external_links`: `source_system`, `external_id`, `player_id UUID FK`, `match_method`, `verified_at`, `created_at`; UNIQUE(source_system, external_id). Nem automatikus email-összefésülés.
2. `event_external_links`: `source_system`, `external_id`, `event_id UUID FK`, `verified_at`, `created_at`; UNIQUE(source_system, external_id). A külső verseny-meccs linkek külön provenance-t őriznek.
3. Read-only reconciliation riport: legacy és canonical darabszámok, unmatched/ambiguous mapping, duplikált külső kulcsok; csak aggregált értékek, PII nélkül.
4. Manager/Player adapter először kizárólag read-only; az eredeti V1 táblák és write RPC-k érintetlenek.
5. Negatív JWT/jogosultsági tesztek, majd V1–V2 shadow-read összevetés a következő kapuhoz.

### Nyitott, migrációt blokkoló döntések
- A `mass_athletes` TEST-ben üres: valódi legacy identity backfill egyezőség nem igazolható.
- Több csapatban aktív játékos pénzügyi rekordjainak tulajdonosa és megoszthatósága még nincs modellezve.
- Vendég/anonim tömegsport résztvevő identitás és első edzés deduplikáció.
- Jelentkezés/várólista és pénzügy adatforrás-prioritás; audit/rollback.
- Az RPC szerepkörös végponttesztje hiányzik.

**Státusz:** V2 modell részletes tervezése elkezdhető; schema migration még nincs telepítve ezen döntés alapján. LIVE nem érinthető.


## 2026-11-08 – első additív TEST adatbázis-migráció végrehajtva
- Supabase TEST migration: `cc_v2_canonical_external_mapping_foundation_20261108` — sikeres.
- `public.cc_v2_identity_links`: source_system + external_id UNIQUE; player_id UUID FK players.id; match_method, verified_at, created_at; RLS ON, anon/authenticated közvetlen tábla-jog visszavonva.
- `public.cc_v2_event_links`: source_system + external_id UNIQUE; event_id UUID FK events.id; match_method, verified_at, created_at; RLS ON, anon/authenticated közvetlen tábla-jog visszavonva.
- `public.cc_v2_reconciliation_summary()`: SECURITY DEFINER, Manager `competition.players:view` ellenőrzés, aggregált legacy/canonical/mapping darabszámok; EXECUTE csak authenticated (PUBLIC/anon revoked).
- Read-back: 2 UNIQUE, 2 FK, 2 RLS ON; mapping rows 0/0. Legacy táblákhoz és meglévő adatokhoz nem nyúltunk.
- **Nyitott:** összerendelések feltöltése hiteles forrásból, read API Manager/Player eltérő hozzáféréssel, end-to-end auth/permission tesztek, legacy booking/waitlist/finance modellezése, frontend szerződés és adatminőségi ellenőrzés. Ez az első lépés alapja, nem a teljes V2 adatbázis készre jelentése. LIVE érintetlen.
