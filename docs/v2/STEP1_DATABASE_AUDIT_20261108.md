# 1. lépés — TEST adatbázis szerkezeti felmérés (2026-11-08)

Forrás: kizárólag olvasó SQL a TEST Supabase projekten: `szzoubvhlwnojtzqjebc`. LIVE nem érintett.

## Ellenőrzött tények
- 60 publikus elsődleges kulcs, 56 idegenkulcs-kapcsolat; 141 publikus függvény, ebből 84 SECURITY DEFINER. A funkciók tételes biztonsági auditja még nyitott.
- A `players`, `teams`, `events`, `team_memberships`, `availability` központi UUID modellje létezik.
- `availability.event_id → events.id`, `availability.player_id → players.id`; `events.team_id → teams.id`; `team_memberships` a players és teams kapcsolata.
- A `mass_athletes`, `mass_events`, `mass_bookings`, `mass_waitlist` régi TEXT azonosítókat és legacy/import mezőket használ. Nem létezik ellenőrzött FK a központi players/events felé.
- `competition_source_matches.linked_event_id → events.id`; jegyzőkönyv `cc_match_sheets_v1.event_id → events.id`, roster → players; ez a központi versenysport kapcsolat alapja.
- `player_fees.player_id`, `player_notifications.player_id`, `player_push_outbox.player_id` TEXT; ezek közvetlen FK-ja a UUID players táblához hiányzik.
- `manager_accounts.auth_user_id → auth.users.id`, `manager_module_permissions.manager_id → manager_accounts.id`, csapat-jogosultság kapcsolattal.
- Korábbi audit: direkt RLS lekérdezések nem megfelelőek általános Manager jogosultságként; a Manager RPC-k szerveroldali jogosultsági ellenőrzése szükséges.

## Adatfolyamok / feltételezett duplikációk
1. Sportolói identitás: `players` és `mass_athletes` – egyeztetési kulcs és összerendelés kell.
2. Esemény: `events` és `mass_events` – eseményazonosító térkép szükséges.
3. Jelentkezés/jelenlét: `availability` és `mass_bookings` – státusz- és audit-szabályok harmonizálandók.
4. Várólista: `mass_waitlist` külön élettartamú ajánlat/elfogadás folyamat; nem szabad egyszerűen törölni.
5. Pénzügy: `player_fees`, `cc_player_fee_meta_v2382`, `mass_passes` külön adatforrások; forrás-prioritás és személy-azonosítás szükséges.
6. Meccs: külső forrás, központi esemény, hivatalos jegyzőkönyv és élő pontozás külön szint.

## Még elvégzendő teljes audit
- Összes UNIQUE/CHECK/NOT NULL és index, trigger, nézet, cron, RPC signature/EXECUTE/SECURITY DEFINER tételes exportja.
- Adatminőség: duplikált email/név, hiányzó esemény- és játékos-összerendelések, árvák, dátumok, státuszkészletek; PII-t nem exportálunk.
- RLS és GRANT ellenőrzés külön Manager, Player és anonim szereplővel, negatív hozzáférési tesztekkel.
- V1 TEST alkalmazások tényleges adatolvasási/írási útvonalainak forráskód szerinti auditja.
- A jelen leltár a **szerkezeti audit első részének eredménye**, nem teljes biztonsági vagy adategyezőségi tanúsítás.

## Döntés
Nincs automatikus táblatörlés vagy átnevezés; a V2 kompatibilitási rétegen keresztül csatlakozik. Migráció csak külön jóváhagyás és adatvesztésmentes egyeztetés után.


## 2026-11-08 – tényleges audit futás, 2. kör
Read-only TEST SQL eredmények:
- public: 60 tábla, mindegyiken RLS ON; 60 PK, 56 FK, 18 UNIQUE, 108 CHECK, 157 index.
- public: 141 függvény, ebből 84 SECURITY DEFINER; 48 függvényre van effektív anon EXECUTE. private: 23 függvény, ebből 12 SECURITY DEFINER; 1 függvényre effektív anon EXECUTE. Az EXECUTE önmagában nem bizonyítja a jogosulatlan adatelérést.
- Külön figyelmet igénylő anon+SECURITY DEFINER függvények: `public.cc_mass_registration_status_test_v1`, `private.cc_finance_settings_audit_v1`. A private séma API-elérhetősége ettől külön ellenőrizendő.
- RLS policy-k csak hét public táblán látszanak: `availability` (3), `player_settings` (3), `events`, `player_private`, `players`, `team_memberships`, `teams` (1-1). Más táblák közvetlen klienselérését külön kell ellenőrizni; RLS ON + policy hiánya általában default deny, de privileged RPC-k ettől eltérhetnek.
- `players`: 19 rekord, 19 különböző email, 0 hiányzó email. `mass_athletes`: 0 rekord; nem alkalmas az identitás-összerendelés érdemi tesztelésére.
- `mass_bookings` → `mass_events` hiányzó hivatkozás: 0; `mass_waitlist` → `mass_events` hiányzó hivatkozás: 0.
- `competition_source_matches`: 9 rekord `linked_event_id IS NULL`; ezt külön meg kell különböztetni a szándékosan külső forrásban maradó meccsektől.
- Következő: két SECURITY DEFINER függvény forrás- és GRANT auditja; összes RPC, trigger, adatminőségi és role-szimulációs teszt.


## 2026-11-08 – 3. kör: trigger, GRANT és cross-module audit
- `information_schema.triggers`: 15 trigger-event bejegyzés (egy trigger több műveletre is szerepelhet). Többségük updated_at; két finance settings audit trigger INSERT/UPDATE eseményekkel, és meccs roster guard.
- `information_schema.role_table_grants`: az `authenticated` szerepkörnek explicit tábla GRANT hét táblán: availability (INSERT/SELECT/UPDATE), events (SELECT), player_private (SELECT), player_settings (INSERT/SELECT/UPDATE), players (SELECT), team_memberships (SELECT), teams (SELECT). A többi tábla RPC-k vagy privilegizált backend útján érhető el, nem következik közvetlen elérhetőség.
- `private.cc_finance_settings_audit_v1()` trigger-függvény; `SECURITY DEFINER`, `search_path=''`, audit_log-ba ír, nem általános lekérdező RPC. Az effektív anon EXECUTE jogosultság ettől még minimális privilégium szempontból felülvizsgálandó.
- `public.cc_mass_registration_status_test_v1(p_event_id text)` `SECURITY DEFINER`, kizárólag `source_workbook_id='CC-QA-SYNTHETIC'` aktív/publikus eseményt olvas; státuszt és aggregált férőhelyadatokat ad. Nem bizonyított jogosulatlan adatfeltárás; a teszt RPC szükségességét élesítés előtt külön értékelni kell.
- `player_notifications`: 6/6 `player_id` érték a `players.id::text`-hez illeszkedik. `player_fees` és `player_push_outbox` üres, ezért e kapcsolatok minősége még nem igazolt.
- A két függvény kódját átnéztük, de nincs helyettesítője a szerepkör szerinti valódi végpont- és RLS-teszteknek.


## 2026-11-08 – 4. kör: Manager/Player RPC-k és adatminőség
- 57 `cc_manager_%` és 20 `cc_player_%` publikus függvény található. A Manager SECURITY DEFINER függvények közül 0 anonim EXECUTE jogosultságú.
- `cc_manager_teams_v1`, `cc_manager_events_v1`, `cc_manager_players_v2` ellenőrzött forrása csapat/modul alapú `private.cc_manager_require_*` ellenőrzést és soronkénti permission szűrést tartalmaz.
- `cc_player_notifications_v1` az `auth.uid()` és `players.auth_user_id` összerendelést ellenőrzi, majd saját `player_id` alapján szűr.
- **Felülvizsgálandó, potenciális csapatközi hozzáférési kockázat:** `cc_manager_finance_override_set_v1` a forrás alapján `private.cc_manager_require_any_v1('competition.fees','edit')` hívást használ, de a módosítandó játékos csapattagságát a látható kódban nem köti a Manager engedélyezett csapatához. Ez nem bizonyított exploit, de a csapatszintű jogosultsági modellhez kritikus negatív teszt és célzott javítási terv kell. A TEST-ben nem hajtottunk végre írást.
- Adatminőség: 0 lejárt aktív csapattagság; 0 fordított időpontú `events`; 0 fordított időpontú `mass_events`; 0 null státuszú `availability`; 0 belső csapat nélküli `competition_source_matches`.
- Nyitott: a többi 52+ Manager RPC és Player RPC tételes jogosultsági útvonalának elemzése; Manager szerepkörrel való tényleges negatív végpontteszt; V1 write útvonalak összevetése; teljes identity/event matching.
