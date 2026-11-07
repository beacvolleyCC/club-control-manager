# CC-FOLYTATÁS — #74 + #76 + #28 közös kiadási ellenőrzése, 2026-10-25

**Állapot: FEJLESZTÉS, DRAFT / FEATURE OFF WHERE APPLICABLE. NINCS PRODUCTION DEPLOY, MERGE VAGY LIVE DB ÍRÁS.**
A felhasználó a korábban belinkelt 2026/27-es kiírást véglegesnek jelölte; azt kell megjeleníteni. A 41 régi BRSZ-alias felülvizsgálata nem release-blokkoló a mérkőzéslista szempontjából.

## Kiadható összetevők és sorrend

| Terület | PR | Forrás és cél | Integráció |
|---|---|---|---|
| Manager meccsnézet | [#76](https://github.com/beacvolleyCC/club-control-manager/pull/76) | Alap BEAC, működő összes meccs, canonical menetrend | A #74 SQL overlay **nem** változtatja a scope-kódját |
| Hivatalos PDF eredmény | [#74](https://github.com/beacvolleyCC/club-control-manager/pull/74) | MRSZ 2686 Női I, MRSZ 2700 Férfi I/B; 38 játékos | Két **meglévő** canonical fixture, nincs új UUID |
| Player eredmény és jegyzőkönyv | [#28](https://github.com/beacvolleyCC/player_application/pull/28) | Helyes szettstatisztika, működő in-app PDF-adatpanel | A v2 canonical snapshot JSON-szerződését fogyasztja |
| Későbbi ID compatibility | #75 / #27 | csak reviewer-approved régi ID bridge | **Nem előfeltétel**, kapcsoló OFF |
| Későbbi iOS subscribed calendar | #72 / #25 | privát, megújuló naptár | külön release gate |

A Manager #74 (**19 megváltoztatott fájl**) és #76 (**14 fájl**) ellenőrzött PR-diff fájlkészlete **diszjunkt**: nincs közös szerkesztett fájl. Ez nem helyettesíti a tényleges összefuttatást.

## Valódi Manager komponensintegráció, két PG17 adatbázisban

A #74 CI továbbra is önállóan végrehajtja a 298/13 kezdeti synthetic canonical baseline-t, a #2686/#2700 eredmény overlayt **298/15-re**, mind a 38 eredeti sportolót, 13 korábbi hivatalos forrás megtartását, identity/RSVP változatlanságát, idempotens ismétlést, rollbackot, újra-applyt és drift miatti tranzakciós leállítást.

**Új kompozíciós QA:** a #74 workflow ellenőrzi az összeolvasztás előtt rögzített #76 Manager kódot **pontos Git commit SHA alapján**, `2833edbfb747a00f0393d6530bf49f5051bcb104`. A workflow:

1. checkout #74 kód és PG17 migráció;
2. második, credential nélküli checkout **#76 konkrét commitja** a `qa-manager/` könyvtárba, így egyetlen PR sem kerül merge-re;
3. #76 JavaScript syntax és tényleges canonical négycsoportos BEAC/összes-meccs kapcsolóteszt;
4. SQL overlay után a DB-ből olvasott, *valódi* `cc_competition_canonical_payload_v1()` JSON-kimenetet lefuttatja a **#74 saját és a #76 valódi `ccMrszProtocolHtml_` függvényén** mindkét független PG17 baseline-ban;
5. végponttól a megjelenítésig minden eredmény/mezszám, név, csere, kapitány, libero, hiányzó részvétel, staff, referee és a meccskód pontosan ugyanahhoz az osztályhoz kerül. A Manager kattintás/tap, Enter, Space és nested szerkesztésgomb események is teszteltek.

A #74 staging SQL-ben az MTK Budapest szövetségi PDF-ben szereplő teljes név csak a **canonical kijelzési JSON-ban** írja felül a régi `MTK` rövidítést; a DB-raw fixture név, matchId, sourceKey, időpont és booked event ID változatlan marad.

## Player #28

A #28 `tests/player-real-official-protocols-20261021.test.cjs` rögzített Manager #74 PDF-forráskivonatot használ, és a valódi Player `ccPlayerScoreboardHtml_`, `ccPlayerProtocolDetailHtml_`, `ccPlayerOpenProtocol_`, `ccPlayerBindProtocols_` kódot futtatja. Vizsgált: **2686 3–1, 2700 3–2, 38 játékos**, rossz bajnokság/duplikált matchCode elutasítás, in-app jegyzőkönyv, az eredeti PDF-ből nem igazolt külső linkek tiltása, érintéses kattintás, Enter és Space, beágyazott link gomb nem nyit duplán, dialógus bezárás.

**Nem valós iOS UI teszt**; futtatása nem helyettesít bejelentkezett iPhone/Safari PWA/VoiceOver próbát. Minden source URL és matchCode untrusted a kliensen; jogosultsági ellenőrzés szerveroldalon történik.

## Tényleges release előfeltételek (11 ellenőrzés)

1. Manager #76 canonical 2026/27 menetrend és négy csoport tartalma egyezik a felhasználó által véglegesnek jelölt kiírással.
2. #74 két MRSZ matchCode, szezon, versenyszint és home/away szövetségi csapat-ID egyezik.
3. #74 SQL csak **2 meglévő fixture-t gazdagít**; 298 match UUID változatlan.
4. 13 régi + 2 új eredmény = 15 played, pont- és szetteredmények egyeznek.
5. 38 játékos név, igazolási azonosító, jelölés és hivatalos személy visszaolvasható Managerben és Playerben, nem kitalált.
6. Betöltés nem módosítja a `public.events`, `availability`, notification és read-only calendar feed adatait.
7. Eredményt nem kapott vagy halasztott fixture sosem kap hamis helyezést, szettpontot vagy kickoffot.
8. Manager–Player hitelesítés/RLS: jogosult és jogosulatlan bejelentkezett felhasználó, lejárt/inaktív sportoló; a `SECURITY DEFINER` funkciók külön auditja.
9. Valós iPhone PWA: touch/click, jegyzőkönyv megnyitás, back/close, belső linkek, scroll/roster table, naptár és böngésző-cache.
10. Két független 11 pontos regressziós ellenőrzés, a PR CI összes required check zöld és újraellenőrzött.
11. Kiírás és protokoll adatbázis migráció csak **külön release jóváhagyás után**, ellenőrzött rollback, pontos LIVE elő-/utószámlálás és release owner mellett.

**Jelenleg #1–7 automatizált, szintetikus QA-val igazolt; #8–11 termékkörnyezetben még kiadási blokkoló.** A szintetikus adatok nem helyettesítik az éles hitelesítést.

## QA eredmény az utolsó dokumentálás előtt

- Manager #74 PostgreSQL + Manager #76 integráció: CI [40199807826](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40199807826) SUCCESS a QA-kód `a314105111e93588df1588915578db86664f128c` SHA-n; szintén önálló staging és Manager scoring PASS.
- Player #28 mobil event és teljes official report teszt: CI [40199559146](https://github.com/beacvolleyCC/player_application/actions/runs/40199559146) SUCCESS a `ba57d94b707710a302e97c0bd97fbca6b1b51fd8` kódon; három másik Player workflow is SUCCESS.

**Tovább:** csak valós jogosultsági és mobilos release QA, valamint az egyértelmű élesítési döntés. A korábbi 41 alias manuális auditja nem akadályozza a felhasználó által véglegesnek jelölt menetrend megjelenítését.
