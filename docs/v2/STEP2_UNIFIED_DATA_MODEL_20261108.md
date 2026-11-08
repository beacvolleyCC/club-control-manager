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


## 2026-11-08 – második additív TEST migráció: booking + waitlist
- `cc_v2_booking_waitlist_canonical_foundation_20261108` sikeres.
- `cc_v2_booking_links`: legacy source/external ID UNIQUE → `availability(event_id,player_id)` összetett FK, verified provenance.
- `cc_v2_waitlist`: canonical `event_id` és `player_id` UUID FK; `waiting/offered/accepted/expired/cancelled` állapotok, offer/accept időrendi CHECK és event/player UNIQUE.
- `cc_v2_waitlist_links`: legacy waitlist external ID UNIQUE → canonical waitlist UUID FK.
- Mindhárom új tábla RLS ON, anon/authenticated közvetlen hozzáférés visszavonva; read-back: FK/UNIQUE/RLS OK.
- **Nem kész:** waitlist tranzakciós offer/accept, capacity, idempotencia, mass booking státusz-mapping, auth nélküli vendég identity, pénzügy, értesítések, tényleges adat-backfill, Manager/Player közös API és E2E. Meglévő rekordok változatlanok; LIVE érintetlen.


## 2026-11-08 – harmadik additív TEST migráció: finance/notifications
- Supabase TEST migration `cc_v2_finance_notification_canonical_links_20261108` sikeres.
- `cc_v2_fee_links`: legacy `player_fees.id` BIGINT FK és `players.id` UUID FK; fee_id UNIQUE.
- `cc_v2_notification_links`: `player_notifications.id` UUID PK/FK és `players.id` UUID FK.
- `cc_v2_push_outbox_links`: `player_push_outbox.id` UUID PK/FK és `players.id` UUID FK.
- Provenance: match_method, verified_at, created_at; mindhárom RLS ON, közvetlen anon/authenticated tábla GRANT visszavonva. Read-back: mindhárom 2 FK, RLS ON, 0 RLS policy (default deny).
- Nem történt automatikus összerendelés vagy legacy adatátírás. A fee meta/audit és BEAC import forrásprioritás, push idempotencia, Manager/Player API és JWT/E2E még nyitott.
- **Frontend-ready státusz: NEM.** Az új táblák kapcsolati alapok, nem teljes migrált adatkészlet. LIVE érintetlen.


## 2026-11-08 – ellenőrzött UUID-egyezéses TEST backfill
- Előellenőrzés: `player_notifications` 6/6 pontos `players.id::text` UUID egyezés, 0 unmatched; `player_fees` 0 sor, `player_push_outbox` 0 sor.
- TEST migration `cc_v2_exact_uuid_backfill_notifications_finance_20261108` sikeres. Csak pontos UUID-egyezéses `INSERT ... ON CONFLICT DO NOTHING` a három kapcsolati táblába; sem email, sem név alapján nem történt összefésülés.
- Utóellenőrzés: `cc_v2_notification_links` 6, `player_notifications` 6, unmatched 0; fee links 0, push links 0.
- Korlát: újonnan érkező rekordok automatikus szinkronja még nincs megvalósítva; API és valódi role/JWT E2E nincs kész. LIVE változatlan.


## 2026-11-08 – értesítési kapcsolat automatikus szinkronja TEST
- Migration `cc_v2_notification_link_auto_sync_20261108` sikeres.
- `private.cc_v2_sync_notification_link()` SECURITY DEFINER trigger-függvény: `player_notifications` INSERT vagy `player_id` UPDATE után pontos UUID egyezés alapján upsert a `cc_v2_notification_links` táblába; nem egyező player_id esetén a korábbi linket eltávolítja.
- Trigger `cc_v2_notification_link_sync` read-back igazolt; a korábbi 6/6 link megmaradt.
- A trigger-függvény közvetlen EXECUTE jogosultsága PUBLIC/anon/authenticated szerepköröktől visszavonva.
- Még nincs tranzakciós INSERT/UPDATE negatív teszt, illetve push/fee automatikus szinkron, Manager/Player read API vagy teljes frontend-ready állapot. LIVE érintetlen.


## 2026-11-08 – díj és push kapcsolatok automatikus szinkronja TEST
- Migration `cc_v2_fee_push_link_auto_sync_20261108` sikeres.
- `private.cc_v2_sync_fee_link()` + `cc_v2_fee_link_sync`: player_fees INSERT/UPDATE(player_id) → exact UUID link upsert/remove.
- `private.cc_v2_sync_push_link()` + `cc_v2_push_link_sync`: player_push_outbox INSERT/UPDATE(player_id) → exact UUID link upsert/remove.
- SECURITY DEFINER triggerfüggvények EXECUTE joga PUBLIC/anon/authenticated szerepköröktől visszavonva.
- Trigger definitions read-back ellenőrizve. INSERT/UPDATE/rollback E2E még nincs végrehajtva. A fee és push TEST forrástáblák az előző ellenőrzéskor üresek voltak.
- Következő: közös, jogosultságkezelt read API, tényleges adatforgalmi tesztek, legacy mass/guest és finance meta/audit integráció. LIVE érintetlen.


## 2026-11-08 – első V2 Manager közös read API TEST
- Migration `cc_v2_manager_composed_read_api_20261108` sikeres.
- `public.cc_v2_manager_read_v1(p_from timestamptz,p_to timestamptz,p_team_id uuid default null,p_player_query text default '')` JSONB: schemaVersion=1, players (existing `cc_manager_players_v2`), trainings/matches (existing `cc_manager_events_v1`).
- SQL STABLE SECURITY INVOKER, meglévő Manager RPC jogosultságokra támaszkodik. Function EXECUTE readback: anon false, authenticated true, security definer false.
- Ez nem Player API; nem tartalmaz még booking/waitlist/finance/push adatkészletet, nem teljes V2 frontend contract. JWT/E2E még hátravan.
- LIVE érintetlen.


## 2026-11-08 – első V2 Player közös read API TEST
- Migration `cc_v2_player_composed_read_api_20261108` sikeres.
- `public.cc_v2_player_read_v1(p_notification_limit integer default 50)`: JSONB schemaVersion=1, bootstrap (`cc_player_bootstrap_filtered_v1`), notifications (`cc_player_notifications_v1`).
- SQL STABLE SECURITY INVOKER; meglévő Player bootstrap és auth.uid-hoz kötött értesítés RPC. Read-back: anon EXECUTE false, authenticated true, SECURITY DEFINER false.
- A Manager `cc_v2_manager_read_v1` mellett most Player read belépési pont is létezik, de a valódi JWT E2E, teljes V2 adatcontract, mass booking/waitlist és frontend-integráció még nyitott. LIVE érintetlen.


## 2026-11-08 – V2 read API negatív jogosultsági smoke test TEST
- Metadata: `cc_v2_manager_read_v1`, `cc_v2_player_read_v1`, `cc_v2_reconciliation_summary` anon EXECUTE=false, authenticated=true.
- SQL `SET LOCAL ROLE authenticated` JWT nélkül: `auth.uid()` null.
- `cc_v2_player_read_v1(10)` JWT nélkül: `PLAYER_NOT_LINKED` hibával elutasítva, adatok nem kerültek vissza.
- `cc_v2_manager_read_v1(now(),now()+interval '7 days',null,'')` JWT nélkül: SQLSTATE 42501 `MANAGER_AUTH_REQUIRED` hibával elutasítva.
- Ez **negatív auth smoke test**, nem teljes valós JWT E2E vagy csapatszintű jogosultságteszt. TEST jelenleg 1 aktív auth-linked player, 1 Manager; canonical identity/booking/waitlist linkek 0. LIVE érintetlen.


## 2026-11-09 – tömegsportos migráció ellenőrző API TEST
- `cc_v2_mass_reconciliation_read_api_20261109` migration sikeres (első DDL-kísérlet szintaktikai hiba miatt nem települt; javított verzió sikeres).
- `public.cc_v2_mass_reconciliation_v1()` JSONB: source counts és verifiedLinks counts `mass_athletes`, `mass_events`, `mass_bookings`, `mass_waitlist` forrásokra. SECURITY DEFINER, `private.cc_manager_require_any_v1('mass.overview','view')` kapu; anon EXECUTE=false, authenticated=true.
- TEST forrásrekordok: 0 mass_athletes, 6 mass_events, 1 mass_bookings, 7 mass_waitlist; mapping tables korábbi ellenőrzés szerint üresek. A funkció telepítve és ACL ellenőrizve; pozitív Manager JWT E2E még hátra.
- Nem történt automatikus migráció, sem legacy rekordmódosítás. LIVE érintetlen.
