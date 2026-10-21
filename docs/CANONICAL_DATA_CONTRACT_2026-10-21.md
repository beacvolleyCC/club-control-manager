# Club Control — központi adatmodell és fokozatos átállás
Állapot: 2026-10-21. Ez kötelező architekturális szerződés, nem egy kész migráció igazolása.

## Alapelv
Egy Supabase-projekt; adattípusonként egy hiteles írási hely (source of truth); közös, jogosultságellenőrzött olvasási API/RPC a Manager, Player, natív iOS és Android számára. Ugyanaz a domainrekord nem tárolható külön-külön a UI-nézetek kedvéért. A nézetek a közös forrást csak szűrhetik, rendezhetik és ábrázolhatják.

## Jelenlegi fizikai táblák (2026-10-21)
- public.events: 279 versenysport-esemény, ebből 53 match és 226 training.
- public.mass_events: 59 tömegsport-esemény.
- public.players: 46 versenysport-játékos.
- public.mass_athletes: 252 tömegsport-sportoló. E két identitáskészletet nem szabad névegyezés alapján összevonni.
- public.competition_source_matches: 46 BRSZ-menetrendi rekord (külső forrás).
- public.cc_competition_mrsz_screenshot_v1: 23 record_kind=match, ebből 13 feltöltött hivatalos jegyzőkönyv. A match-record többlet nem feltétlenül 23 külön mérkőzés.

## Cél: domain-alapú elsődleges rekordok
1. Személy: stabil internal person/player ID; email nem elsődleges azonosító, ugyanaz a személy több csapathoz tartozhat.
2. Csapat: belső team ID, külön sportág/idény/bajnokság szerinti nevezett csapat, külön club ID és external team ID.
3. Esemény: stabil event ID, típus training / match / mass training / egyéb; az edzés és mérkőzés metaadata külön relációban kapcsolódhat.
4. Mérkőzés: egy stabil match ID; pontos évad + verseny + hivatalos matchCode; BRSZ fixture és MRSZ protocol alias-azonosítók ugyanarra a match ID-ra mutatnak. Klubsorszám ≠ bajnoki csapatazonosító. Több rekordot csak azonosító+verseny+idény bizonyítéka alapján vonjunk össze. A dátum és név csak ellenőrzés.
5. Mérkőzéseredmény: egy match ID-hoz tartozó hivatalos végeredmény/szettpontok/protokoll; korábbi és konfliktusos változatok auditban, nem külön UI-másolatban.
6. Jelentkezés és jelenlét: event_id és person_id, auditált státuszok.
7. Bérletek/díjak: személyhez kapcsolt pénzügyi rekordok, Manager/Player számára közös, jogosultságfüggő olvasással.
8. Tabella: azonos bajnokság/csoport/szezon szerinti hiteles rangsor pillanatkép vagy *szabályokból, teljes igazolt eredményből* számítható állás. Hiányos eredményből tilos hiteles helyezést kitalálni.

## Felhasználói nézetek — elvárt közös olvasás
- Áttekintés: csak következő saját BEAC-meccsek; a tabella ugyanaz a rangsor-adat mint a Tabella menüben.
- Meccsek: BEAC-csapatok összes saját meccse, alapból aktuális/következő, időszakszűrővel múlt; meglévő event RSVP/névsor/jelenlét megőrzendő; MRSZ jegyzőkönyv link azonos matchhez.
- Tabella: kiválasztott bajnokság teljes rangsora, valamint összes mérkőzése, múlt+jövő; rendezés dátum szerint fel/le, csapat szerinti szűrés; részletes jegyzőkönyvek.
- Edzés, naptár, jelentkezés, Player: azonos event/booking azonosító, nincs kliensenként külön írható másolat.

## Migráció biztonságosan, lépésenként
A. Audit: az összes backend RPC és frontend képernyő milyen táblát olvas/ír, RLS/permissions, külső források; ellenőrző referencia-meccsek.
B. Canonical ID/crosswalk: immutable source-alias megfeleltető tábla, konfliktusjelzés; meglévő rekordok nem törölhetők.
C. Egységes read API-k; kezdetben régi táblákból összerakott read-only kimenet. A három UI ugyanazt a végpontot olvassa. Csak ezután írási utak konszolidációja.
D. Migráció batch + idempotens upsert, adatösszehasonlító tesztek és rollback. A live Manager/Player működése minden fázisban megmarad.
E. A későbbi natív iOS/Android csak a közös read/write szerződésen keresztül kommunikál.

## Minimum regressziós tesztek
- Feltöltött MRSZ mérkőzések: 13/13 elérhető és linkelt, helyes csoportban, nem duplikáltan.
- BEAC–PDSE, BEAC–MAFC-ÉPK, BEAC II.–UTE: jó eredmény és megmaradt jelenléti/névsor funkció.
- Női Kandó ≠ férfi Kandó; női Ráckeve ≠ férfi RSSE. Klubazonosító 354/570 nem csapatazonosító.
- Áttekintés következő BEAC, Meccsek csak BEAC, Tabella teljes bajnokság, mindháromban egyetlen közös domainrekordból olvasott eredmény.
- Tabella eredménylista korábbi és jövőbeli rekordokkal, megfelelő hitelességi státusszal.
- Bejelentkezés/jogosultság/RLS; Player nem láthat Manager-only személyes adatot.

## 2026-10-21 – részleges bajnoki statisztika és közös UI

- A Manager és Player `cc_*_competition_mrsz_snapshot_v2()` RPC-k további, nem törő szerződésmezői: `canonicalMatches`, `canonicalCoverage`, `canonicalTeamStats`. A korábbi `fixtures`, `matches`, `tables` változatlanul megmarad.
- `private.cc_competition_canonical_coverage_v1()`: bajnokságonként `total`, `played`, `scheduled`, `postponed`, `protocolLinked`; `officialStandingsVerified:false`.
- `private.cc_competition_canonical_team_stats_v1()`: idény+csoport+ellenőrzött teljes csapatnév-alias szerint csoportosított *részleges* mérleg. Egyetlen forrása a canonical mérkőzésnézet: nem számolja újra az eredménymásolatokat. A `position` és `tablePoints` minden sorban **null**, amíg nincs külön hiteles hivatalos tabella. Az M/GY/V és SZ/SZA/P/PA számolható; a hiányzó labdapont NULL.
- `private.cc_competition_team_key_v1(name)`: kizárólag kifejezetten ismert teljes névvariánsok normalizálása. Az eredmények bajnoki csoportonként vannak csoportosítva; hasonló nevű külön nevezések nem vonhatók össze automatikusan.
- Manager **Tabella** és Player **Tabella**: a canonical team stats az elsődleges, amennyiben elérhető; régi screenshot-sorrendből nem keletkezhet hiteles helyezés. A Manager és Player külön megjeleníti, hogy a feldolgozott eredmények csak az idény részhalmazát fedik.
- Központi QA (2 futás): 5 csoport, 298 mérkőzés (13 lejátszott / 281 kiírt / 4 halasztott), 40 csapatsor (7/7/12/7/7), 13/13 jegyzőkönyvlink, csapatok megjelenése meccsszám szerint pontosan 2×13, nulla kitalált helyezés vagy bajnoki pont. Az alkalmazás-kód JS-szintaxis tesztje és a Player mind az öt csoportjára külön futtatott HTML-táblateszt sikeres.
- Privát stats/coverage funkciókra `anon` és `authenticated` közvetlen EXECUTE: **false**. Az eddigi Manager/Player v2 RPC jogosultsági kapuja megmaradt.
- **Hátralévő kötelező regresszió**: jogosult bejelentkezett felhasználóval élő RPC/böngészős felület, Manager/Player tabella és jegyzőkönyv-megnyitás, statisztikai modul többi nézete, hivatalos rangsor-forrás bekötése. A read-only stats integráció NEM jelenti az admin versenyeredmények vagy események write-path konszolidációját.
