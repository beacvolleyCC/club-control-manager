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
