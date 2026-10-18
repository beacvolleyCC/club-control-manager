# Club Control – HANDOVER_CURRENT

**Állapot:** 2026-10-19 (Europe/Budapest)  
**Folytatási kulcs:** `CC-FOLYTATÁS`  
**Projekt:** BEAC Röplabda / Club Control Manager és Player  
**Aktuális munkafolyamat:** teljes 2026/27-es BRSZ meccskiírás importja, csapatesemény/logisztika, Player-megjelenítés és értesítés.

> **KRITIKUS / EZT OLVASD EL ELŐSZÖR:** A felhasználó teljes 2026/27-es kiírásából **292 menetrendi meccs és 8 végeredmény (összesen 300 sor) már az éles Supabase külön forrástáblájában van**. A **Manager és Player megjelenítő kódja viszont még csak fejlesztési ágakon található, NINCS merge-elve a LIVE alkalmazásokba**. A meglévő csapateseményeket és játékosjelenléteket NEM szabad automatikusan módosítani. A felhasználó kifejezett kérése: **„a jelenlét ne változzon; ha valami más időpontra került, szólj”**. Player-értesítés NEM ment ki.

## 0/A. 2026-10-19 – ellenőrzött BEAC meccs-áthelyezések (read-only)

Az élő Supabase régi BRSZ-menetrendjét és a 300 soros új importját 2026. október 19-én csak olvasással összevetettük. Egy bajnokságon belüli, azonos irányú hazai–vendég párok egy-egy egyedi, biztos eltéréséből **kettő** van:

- **Férfi I/B BEAC–PDSE:** 2026.10.12. 19:30 → **2026.10.19. 19:30**. Régi Player-esemény: `c7d5c6f3-7f05-41ce-9a03-c8a429002ccb`, **cancelled**, 9 jelenléti sor.
- **Női II/B BEAC II.–UTE U-20 Pink:** 2026.10.13. 19:30 → **2026.10.20. 19:30**. Régi Player-esemény: `b99c5397-8b51-40d0-a03c-e399c011bd3e`, **cancelled**, 14 jelenléti sor.

**A 23 jelenléti rekord változatlan**, és a két lemondott eseményt nem reaktiváltuk. A menetrend továbbra is külön importforrás; Player-re még nem szinkronizáltuk és játékosértesítés nem ment ki. A régi/új forrásokban továbbra is vannak anomáliák (BEAC–BEAC stb.), tehát a két eltérés nem tekinthető teljes rendszerbeli source-ID egyeztetésnek.

Új dokumentáció a **Manager fejlesztési ágán**, a `main` kódjának megváltoztatása nélkül:
- `docs/competition/VERIFIED_FIXTURE_CHANGES_20261019.md`
- `sql/competition_user_schedule_diff_readonly_20261019.sql`

A teljes meccsmentő RPC még nincs élesítve, és a Manager/Player fejlesztési ágakon a régi kézi javítások közelítő párosítása kiadási blokk. Ezt javítsd a release előtt, ne merge-eld vakon a két ágat.

## 1. Azonnali állapot – valóban LIVE vs. branch

| Terület | Igazolt állapot |
|---|---|
| Manager főág | `beacvolleyCC/club-control-manager` `main`, utolsó alkalmazás-commit `770b846a` (PR #59: magyar dátum és tekerhető, 24 órás időválasztó), PWA cache `20261018-hu-match-time-v55` |
| Player főág | `beacvolleyCC/player_application` `main`, utolsó alkalmazás-commit `4bb9ec3e` (PR #14: korábbi kézi javítások), PWA cache `20261018-match-overrides-v20` |
| Aktuális Manager fejlesztés | `feat/fixture-meeting-notes-20261018` – nem merge-elt fejlesztési ág (a főágon külön dokumentációs commitok is vannak) |
| Aktuális Player fejlesztés | `feat/player-imported-202627-fixtures-20261018` – nem merge-elt fejlesztési ág, a korábbi főágon 6 saját commitból áll |
| Supabase projekt | `snqsxlyhontaepembaic` |
| Importtábla | `public.cc_competition_user_schedule_v1` – **300 rekord**, már telepítve |
| Importált tartalom | **292** `fixture`, **8** `result`, **5** `postponed` |
| Logisztikai tábla | `public.cc_competition_match_arrangements_v1` – éles DB-ben létezik, **0 sor** |
| Olvasó RPC-k | `cc_manager_competition_user_schedule_v1()`, `cc_player_competition_user_schedule_v1()` – éles DB-ben léteznek, authenticated: igen, anon: nem |
| Külön logisztikai mentés | `cc_manager_competition_match_arrangement_save_v1` – éles DB-ben létezik |
| Atomikus teljes mentés | `cc_manager_competition_match_full_save_v1` – **csak SQL fájl a fejlesztési ágon**, a DB-ben MÉG NEM létezik |
| Meglévő kézi javítás | `cc_competition_match_overrides_v1`: **1 sor**, érintetlen |
| Jelenlegi esemény / jelenlét | `public.events`: **277**, `public.availability`: **619**, az import során nem módosultak |

**Fontos:** GitHub `main` és az éles GitHub Pages tényleges terjesztése nem ugyanaz; a Pages publikálás sikerét külön kell igazolni, mielőtt bármit a felhasználó felé „látható LIVE”-ként jelölnénk.

## 2. Kiírás – összesen 5 csoport (2026/27)

| Forráscsoport | Menetrendi meccs | Eredmény |
|---|---:|---:|
| `menA`: Férfi Budapest I/A | 40 | 2 |
| `menB`: Férfi Budapest I/B | 41 | 1 |
| `womenI`: Női Budapest I. | 126 | 5 |
| `womenIIA`: Női Budapest II/A | 42 | 0 |
| `womenIIB`: Női Budapest II/B | 43 | 0 |
| **Összesen** | **292** | **8** |

Öt halasztás dátum nélkül; ne kapjanak kitalált kezdési időpontot. A **férfi B csoportba újonnan bekerült a Mozdulj SE**. Dátumértelmezés: 2026. október–december, 2027. január–május; Budapest 24 órás időzóna. A kiírást a felhasználó adta meg a beszélgetésben; újraszinkron előtt a BRSZ legfrissebb forrásával is egyeztetni kell.

**Fájlok a Manager fejlesztési ágán:**
- `data/competition/2026-27/men-a-fixtures.psv`
- `data/competition/2026-27/men-b-fixtures.psv`
- `data/competition/2026-27/women-i-fixtures.psv`
- `data/competition/2026-27/women-ii-a-fixtures.psv`
- `data/competition/2026-27/women-ii-b-fixtures.psv`
- `data/competition/2026-27/verified-results.psv`
- `sql/competition_user_schedule_import_20261018.sql` (éles DB-ben **alkalmazva**)
- `sql/competition_user_schedule_read_v1.sql` (érintett DB-funkciók már léteznek)
- `sql/competition_match_arrangements_v1.sql` (érintett tábla / mentő függvény már létezik)
- `sql/competition_match_full_save_v1.sql` (**még nem alkalmazott** SQL)
- `docs/competition/FIXTURE_IMPORT_HANDOFF_20261018.md`

A hivatalos eredeti táblákat (`competition_source_matches`, `cc_competition_mrsz_screenshot_v1`) és a korábbi módosításokat nem töröltük / nem írtuk felül. A teljes import jelenleg **forrásadat**, nem kész, minden felületen szinkronizált csapatesemény.

## 3. Kiemelt konfliktus – BEAC II. – UTE U-20 Pink

- A korábbi pillanatkép eredetileg **2026. 10. 13. 19:30** (Budapest).
- Egy korábbi felhasználói kézi javítás a `cc_competition_match_overrides_v1` táblában `source_system='snapshot'`, `source_key='20261001:fixture:1'` alatt: **2026. 10. 20. 19:30** (UTC-ben `2026-10-20T17:30:00.000Z`).
- A felhasználótól kapott új női II/B kiírás is **2026. 10. 20. 19:30**-at tartalmaz.
- A hozzá tartozó **Player csapatesemény még régi és lemondott**: `events.id='b99c5397-8b51-40d0-a03c-e399c011bd3e'`, `team_id='10000000-0000-4000-8000-000000000002'`, `status='cancelled'`, kezdés **2026. 10. 13. 19:30**, találkozási mezők nullák.
- **TILOS** automatikusan reaktiválni a lemondott eseményt, átírni a jelenléti rekordokat vagy úgy tenni, mintha a Player már értesítést kapott volna. Előbb kifejezett egyeztetés / biztonságos eseménykapcsolás kell.

### Más lehetséges időpontütközések

Egy **egyszerű név+párosítás alapú** összevetés kilenc eltérést is mutatott (például férfi B: BEAC–PDSE október 12. → 19.; Semmelweis–BEAC november 24. vs. október 27.; női I: Semmelweis–BEAC október 27. vs. november 24.; női II/B: BEAC II–UTE október 13. → 20.). **A puszta névpár nem elegendő azonosítónak:** a visszavágók és korábbi importváltozatok hamis áthelyezéseket eredményezhetnek. Kötelező új összehasonlítás stabil forrásazonosító, idény/csoport, hazai/vendég páros és mérkőzésforduló alapján; a valóban áthelyezett BEAC-meccseket jelenteni kell a felhasználónak. A jelenlétet közben változatlanul kell hagyni.

## 4. Logisztikai / Player megjelenítési követelmények

A bajnoki mérkőzés szerkesztőjében lehessen:
- kezdést, pályát/helyszínt és eredményt módosítani;
- külön **találkozási időt** és **találkozási helyet** megadni;
- **opcionális Player-megjegyzést** felvenni, amely csak akkor látszik a Playerben, ha ténylegesen nem üres;
- egy majdani **explicit, jogosultságkezelt értesítésküldést** indítani még le nem játszott és módosított BEAC-meccs esetén.

**Alapértékek:**
- BEAC **hazai** találkozó: **18:30** (ha a meccskezdés ezt megelőzi, kérjen külön ellenőrzést).
- BEAC **idegenbeli** találkozó: **60 perccel a meccskezdés előtt**.
- Női BB2 hazai: **2-es pálya**; Női BB1 és férfiak hazai: **3-as pálya**.
- A BRSZ által közölt helyszín (pl. `Bogdánfy u.10/B.` vagy `Bogdánfy u.12.`) maradjon külön a BEAC-csapat találkozási helyétől; ne írjuk felül automatikusan az eltérő utcacímet.
- Minden találkozási mező manuálisan felülírható.
- Dátum **magyar**, idő **24 órás, tekerhető óra+perc** (a Manager főágban PR #59 / v55 már javította a liga meccsszerkesztőjének óraválasztóját).

**Állapot a fejlesztési ágakon:** a Manager belső csapatesemény-űrlapján néhány alapérték és a liga-összeolvasó megvan; az új `arrangements` tábla és az alapértékek olvasása backend oldalon elkészült. A **liga meccsszerkesztője még nem lett teljesen rákapcsolva** a logisztikai mezők atomikus mentésére. A Player új meccskártyáiban már van találkozó-/megjegyzés megjelenítő kód a Player fejlesztési ágán, **de nincs még élesítve**. Player-értesítés nincs implementálva ebben a körben.

## 5. Azonosítás és csapatnevek

- Taksony / BTDSE / BDTSE / Bóczik–Brózik Tibor-féle elnevezés: **egy csapat egy adott bajnokságon belül**, de eltérő női/férfi BRSZ csapatazonosítókat **ne olvasszunk össze** (férfi A: `831`, női II/A: `899`).
- Kandó / Óbudai Egyetem-Kandó SC: azonos klubnév-változat megfelelő csoportban; férfi A BRSZ ID `44`, női I ID `1159`.
- PDSE a férfi B-ben BRSZ ID-k `1214` és `1091` alatt is előfordul – forrásazonosságot ellenőrizni kell.
- **MAFC-Schönherz != MAFC-Vásárhelyi != MAFC-Kármán != MAFC-BME != MAFC-ÉPK**; ezeket TILOS névhasonlósággal összevonni.
- Hosszú nevek Player-megjelenítésben rövidíthetők (pl. Semmelweis, Dág, BTDSE), de az eredeti forrásnév és azonosító maradjon érintetlen.
- Női I forráslistában szerepel **2026. 11. 10., BEAC–BEAC**. Ezt hibagyanús sorral / manuális ellenőrzéssel kell kezelni, nem automatikusan létrehozni egy valódi BEAC–BEAC meccset.

## 6. Jelenlegi technikai kockázatok / QA-gátak

1. A két fejlesztési ág **nem merge-elhető vakon**. A Manager `ccMrszMergedLeagueMatches_` és a Player `ccMrszPlayerAllLeagueMatches_` egyesítője a korábbi kézi snapshot-javításokat **közelítő (csapatnév + időablak)** illesztéssel keresi. Ez félrepárosíthat visszavágókat; stabil azonosítós egyeztetést kell készíteni.
2. A teljes kiírást **ne alakítsuk át automatikusan meglévő `events` rekordokká**; az RSVP/jelenléti adatokat, várólistát, lemondásokat, lejátszott meccseket meg kell őrizni. Egyes BEAC-rekordokhoz már van csapatesemény.
3. Az `cc_manager_competition_match_full_save_v1` SQL **még nem telepített**; előbb jogosultságok, atomikus mentés, validáció, rollback, mentés–visszaolvasás–visszaállítás teszt.
4. A megjelenítőket, statisztikákat és a tabellákat egységes **effective match** adatokkal kell hajtani, és ki kell szűrni az ismétlődő menetrendi / eredmény rekordokat; a hiányzó hiteles tabella helyezése nem pótolható kitalált adatokkal.
5. A Player fejlesztési ágán a PWA cache verziót és regressziós teszteket újra kell igazítani a merge előtt. Mobil QA: PWA cache, 24h, iOS, menetrend, csak nem üres megjegyzés, találkozási idő/HU, eseményből deep link.
6. Felhasználói változásértesítés: **külön engedélyezett/szándékos** művelet, csak még le nem játszott meccsnél; címzett az érintett csapat játékosai. Ugyanazon változást ne küldje ki többször; ne állítsa, hogy elküldte, amíg tényleges kimenet nincs.
7. Még nem készült kész, kivétel nélkül ellenőrzött **előző vs. új kiírás változáslista**, ezt a felhasználó külön kérte.
8. Felület és adatbázis jogok: globális `competition.matches` edit kell a bajnoki kézi szerkesztéshez; Player csak olvashatja az érintett csapatlogisztikát. A BRSZ eredeti import/snapshot/audit közvetlen módosítását ne engedjük.
9. A fejlesztési ágak és `main` csak akkor mozgathatók együtt, ha minden CI, DB-adatvédelem és Player/Manager integráció ellenőrzött.

## 7. Folytatás ajánlott sorrendben

1. Vizsgálni a még hibás vagy összevonandó meccsazonosítókat: **PDSE két BRSZ ID**, Taksony aliasok, visszavágók, `BEAC–BEAC`, új `Mozdulj SE`, lemondott BEAC II–UTE, és a 8 eredmény egyeztetése.
2. Készíteni **biztos időpontváltozás-jelentést** a régi és az új, egyértelműen egyeztetett BEAC-meccsekre; **jelenteni a felhasználónak**, jelenlétet nem írni át.
3. Befejezni a Manager `ccOpenSourceMatchEditor_` találkozó és megjegyzés mezőit; atomikus RPC telepítése és tesztje.
4. Egyeztetni a bajnoki fixture ↔ belső `events` kapcsolatot; lemondott eseményt csak külön, tudatos adminművelettel aktiválni; jelenlét változatlan.
5. Player és Manager listák adatainak, rövid neveknek, ütközéseknek, talalkozónak, üres/nem üres megjegyzésnek és statisztikáknak részletes QA-ja.
6. Értesítési lehetőség kialakítása, explicit admin-küldés és állapotkövetés.
7. PWA cache-bump, rollback ágak, CI, közös Player + Manager release; valódi Pages megjelenítés visszaigazolása.

## 8. Előzmények és további fejlesztések

A korábbi részletes handover (régi, jobbnak tartott Tömegsport edzéskiíró UX visszahozása; minden bajnoki meccs kézi szerkesztése, régebbi UI/működés) itt archiválva:  
`docs/handovers/HANDOVER_PREVIOUS_2026-10-18.md`.

Ne veszítsük el a régi felületre vonatkozó igényt. Fontos korábbi PR-ek:
- Manager PR #56: bajnoki forráskorrekció, jogosultság, audit
- Manager PR #57: meccsmódosítási előzmények
- Manager PR #58: szerkesztőgombok, Áttekintés csapatok, Díjak/Bérletek kereső, desktop szűrők
- Manager PR #59: HU dátum és tekerhető 24 órás időválasztó
- Player PR #14: forráskorrekciók Player-oldali olvasása

**Folytatás indítása:** `CC-FOLYTATÁS` – nyisd meg a Manager `HANDOVER_CURRENT.md` fájlt, a két fenti fejlesztési ágat és az éles Supabase projektet. **Ne kérd újra az egész meccskiírást**: mind az öt TSV/PSV forrásfájl és a nyolc eredmény ott van a Manager fejlesztési ágán.
