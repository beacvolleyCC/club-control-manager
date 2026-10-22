# CC-FOLYTATÁS — cross-PR integrációs ellenőrzés, 2026-10-22

**Státusz: TESZTÁG, NEM KIADÁSI/MERGE ÁG.** Nem futott LIVE migráció, nem került át PR a `main` ágra, nem küldtünk játékosoknak push-t. A tesztek külön, mesterséges PostgreSQL-adatállományon futnak.

## Az egymásra épülő források

| Forrás | GitHub | Tartalom | Kiadási állapot |
|---|---|---|---|
| Manager PR #74 | https://github.com/beacvolleyCC/club-control-manager/pull/74 | 2686/2700 hivatalos jegyzőkönyv, két eredmény, 38 játékos, original-fixture snapshot, rollback, canonical 298/15 | Draft |
| Manager PR #72 | https://github.com/beacvolleyCC/club-control-manager/pull/72 | privát ICS, tokenes hozzáférés, HTTP/Edge, push meeting-at javítás | Draft; nem telepített |
| Manager PR #73 | https://github.com/beacvolleyCC/club-control-manager/pull/73 | 7 le nem fedett Manager-meccsesemény read-only canonical audit | Draft; nem kapcsol össze automatikusan |
| Player PR #25 | https://github.com/beacvolleyCC/player_application/pull/25 | privát naptár UI, `CALENDAR_SUBSCRIPTION_ENABLED: false` | Draft; naptárpanel kikapcsolva |
| Player PR #26 | https://github.com/beacvolleyCC/player_application/pull/26 | a 2686/2700 jegyzőkönyv Player-megjelenítési és statisztikai QA-ja | Draft; csak teszt |
| Régebbi PR #68 / #19 | Manager #68 és Player #19 | teljes menetrend import és UI | **Merge conflict** jelenlegi mainhez; újra kell egyeztetni, nem vakon merge-elni |

## Az integrációs ágak

- Manager: `integration/20261022-manager-calendar-protocol-crosswalk-qa`. A #74 forrásfára, különetlen kódmódosítás nélkül, a #72 és #73 módosított blobjaiból épített, **csak tesztelésre szolgáló** összeállítás. A főági kódot nem érintette.
- Player: `integration/20261022-player-calendar-protocol-qa`. A #25 naptár-fejlesztési ágra a #26 új jegyzőkönyvtesztje került; minden meglévő UI-viselkedés és feature flag változatlan.
- A két integrációs ág **nem kiadásra jóváhagyott merge request**. A branch utóbb törölhető anélkül, hogy az eredeti PR-ok vagy alkalmazásadatok érintettek lennének.

## Automatizált QA és bizonyíték

1. Manager Actions [39843329518](https://github.com/beacvolleyCC/club-control-manager/actions/runs/39843329518): forrásteszt és két közös PostgreSQL 17-es, egymástól független adatbázis — sikeres.
2. Mindkét közös tesztadatbázisban ténylegesen **együtt** települtek a privát naptár SQL-függvények, meeting-at push-aláírás, eredményimport SQL, canonical payload és statisztikai függvények.
3. `COMBINED_MANAGER_QA_PASS 1` és `PASS 2`: token/auth revocation, lemondás és tagságellenőrzés; 298 meccs / 15 lejátszott / 15 jegyzőkönyv; 13 korábbi protokoll; 38 játékos; statisztikák és pontok; rollback és újraimport; az öt szintetikus Manager-esemény és öt jelentkezés érintetlen.
4. Player Actions [39842720549](https://github.com/beacvolleyCC/player_application/actions/runs/39842720549): naptár UI + 2686/2700 jegyzőkönyv + helyezések + játékosstatisztikák + sorrend + PWA — sikeres.
5. A 298/15 a **jövőbeni migráció utáni szintetikus tesztállapot**, **nem LIVE adat**. LIVE az utolsó read-only méréskor 298/13 canonical, 279 esemény, 667 jelentkezés volt.

## 11 pontos kiadási QA – állapotjelentés

| # | Követelmény | Kód-/tesztbizonyíték | Éles / E2E |
|---|---|---|---|
| 1 | Adatok és RSVP megőrzése | két közös DB-ben nincs módosított esemény/jelentkezés | később baseline + backup + diff |
| 2 | Auth, anon / saját / idegen | szintetikus SQL szerepkörök | külön élő JWT E2E |
| 3 | Csapatjogosultság, csapatváltás | a korábbi tokeninvalidálási tesztek együtt zöldek | élő jogosultsági próba |
| 4 | Privát token, SHA-256 és revoke | teljes SQL + HTTP stub tesztek | logs/proxy és revoke iPhone |
| 5 | ICS GET/HEAD, UID, RFC5545 | Node + Deno zöld | tényleges Apple feliratkozás |
| 6 | Meccskód, stabil match ID | 298 megmarad, 2 új eredmény hozzákapcsolódik | hiteles MRSZ párosítás áttekintés |
| 7 | Teljes jegyzőkönyv és jelölések | 38 játékos, 4 kapitány, 3 liberó, 3 stábtag, 3 hivatalos személy | mobil UI vizuális E2E |
| 8 | Statisztika, tabella | négy csapat, 95:69 / 104:102, nincs kitalált rang | valós szezonösszesítés |
| 9 | Push és lemondás | meeting-at értesítésszöveg / aláírás külön szintetikus teszten | tényleges opt-in és kézbesítés |
| 10 | PWA, régi export, cache | Player integrációs regresszió zöld, flag off | Safari/PWA eszközteszt |
| 11 | Kétszeri QA és kiadási kontroll | két külön közös DB-pass, változatlan PR-ok | két élesítés utáni 11 pontos kör |

## Fontos nyitott fejlesztések, sorrend

- PR #68 / #19 régi menetrend/UI-kódját csak **hunkonként** szabad a canonical változásokkal és a naptár-PWA-val egyeztetni; a GitHub már most merge-konfliktust jelez.
- A 7 feldolgozatlan Manager-meccshez szükséges forrásazonosságot nem szabad ellenőrizetlenül kitalálni; a #73 read-only audit marad.
- A jegyzőkönyvforrásnak nincs hitelesített nyilvános PDF-URL-je; a Playerben a belső teljes jegyzőkönyv megjeleníthető, hivatalos linket nem gyártunk.
- A végleges migrációt az aktuális adatmodellhez egyeztetve, backup után lehet majd bevezetni. A két új jegyzőkönyv minden eredménye és a naptár UI addig staged / kikapcsolt.

A dokumentum a kiadási sorrendhez szükséges forrásbizonyítékot és nyitott kapukat őrzi; nem jelenti sem az Apple Naptár, sem az éles Player-megjelenítés tesztelését.
