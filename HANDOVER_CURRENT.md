# Club Control – HANDOVER_CURRENT


## 0/D. 2026-10-19 – Férfi / BB2 történeti lefedettség a Managerben

- A következő fejlesztés sikeresen beolvadt a Manager `main` ágba: [PR #64](https://github.com/beacvolleyCC/club-control-manager/pull/64), commit `0cee77e102953a5f770aa457d7a6ffc4bd0ce6f9`. A Manager **Versenysport → Előző idény** most **Női BB1 / Női BB2 / Férfi** választót tartalmaz.
- BB1: 2025/26-os 129 hivatalos női I. eredmény és korábban validált kísérleti Elo (változatlan).
- Női BB2: a 2025/26-os **női II. A csoportban** játszott, a 2026/27-es B csoportban szerepel. A másodlagos nyilvános aggregátor 8 eredményét csak *nem teljes, szövetségileg még nem ellenőrzött mintaként* jelenítjük meg. **Nem** számít teljes tavalyi mérleg, tabella vagy Elo. Minta forrása: `https://sportsevents24.com/federation/90/volleyball-hungary-hungarian-volleyball-federation`.
- Férfi: nem sikerült a teljes 2025/26-os hitelesített eredménysort megszerezni; nem állítunk róla Elo-t, korábbi helyezést vagy győzelmi arányt.
- Jelenlegi 2026/27-es mindkét osztálycsoport 7–7 csapatát azonosítottuk. Férfi **PDSE** a régi forrásban két BRSZ-ID-val (1091 és 1214) található, automatikusan nem összevonható. Új **Mozdulj SE férfi** 2026/10/18-as javított kiírásban szerepel, de férfi ID-ja a régi 2026/10/01-es archívumból nem ismert. Női Mozdulj ID-t férfihoz csatolni TILOS.
- Research dataset: `data/competition-strength/men-bb2_202627_historical_coverage.json`; dokumentáció: `docs/statistics/MEN_BB2_HISTORICAL_COVERAGE_20261019.md`; QA: `tests/manager-men-bb2-history.test.cjs`.
- **QA 3/3 GitHub workflow zöld** a PR #64 legutolsó commitján; PWA HTML/worker cache egyaránt `20261019-history-coverage-v59`. `main` ellenőrizve. A tényleges Cloudflare/Pages/webes deployment sikerét továbbra sem tudjuk megerősíteni; a főág merge nem egyenlő automatikusan a felhasználó eszközén látható LIVE UI-val.
- **Nincs Supabase adatmutáció ebben a fejlesztésben**. Játékosok jelenléte, események, találkozó/pálya adatok, automatikus üzenetek változatlanok.
- **Következő valódi függőség:** előző idény hivatalos MRSZ/BRSZ `womenIIA` és férfi liga (pontos alcsoport és versenykód) teljes eredmény- és tabellafájlja. Egyező helyezés/mérleg/szett-szám visszaellenőrzése után készíthető a BB2 és férfi történeti Elo a női BB1 mintájára. A teljes 2026/27-es `cc_competition_user_schedule_v1` Player/Manager megjelenítő ágai ettől függetlenül továbbra is kiadásra várnak (forráskulcs/preservation QA).

---

## 0/C. 2026-10-19 – 2026/27 női I. ellenfelek történeti erősség-összekapcsolása

A `0/B` fejezetben leírt „PR #62 draft” **már nem aktuális**: PR #62 kutatási adat + keresztazonosító a `main`-ben, commit `566dd76b7cac91f6664f3dd9c83bf04ef7f54d57`. 2026/27 női I. 12 BRSZ csapat:
- **8** korábbi (2025/26) női I. csapatnévhez erős / MRSZ-meccslistában alátámasztott azonosság;
- **2** `review_alias`: **Mozdulj SE → Mozdulj**, **MTK → MTK Budapest** (az előző idény adata ismert, de a szezonközi csapatazonosság további kontrollt igényel);
- **2** `no_women_i_history`: **Óbudai Egyetem–Kandó SC**, **Semmelweis Egyetem** (másik, női II. osztályú tavalyi előzmény; az I. osztály Elo-ja **NULL**, nem becsült).
- A 2024/25 és 2025/26 MRSZ összesen **155+129=284** eredménye minden csapatnál egyezik a hivatalos tabella W/L és szettmérlegével. Minden idény Elo-ja külön 1500-ról indul, K=24, **kísérleti, nem a 2026/27-es aktuális csapaterősség, és nem meccsesély**.
- Reprodukálható állomány: `data/competition-strength/women1_2026_27_historical_lookback.json`, előállító: `scripts/history/build-women1-current-lookback.cjs`. Dokumentum: `docs/statistics/WOMEN1_202627_HISTORICAL_TEAM_CROSSWALK_20261019.md`.
- Az új **Versenysport → Előző idény** Manager nézet PR **#63** sikeresen `main`-be lett olvasztva (commit `aaa8eedc06e29b981bb8f404f64f952a59d1c713`); **mindhárom GitHub CI workflow sikeres**, beleértve a nézet specifikus QA tesztjét. Olvasható, 12 csapatos, 2025/26-os adat. 2026/27-es Elo a JSON-ban szándékosan mindenhol `null`.
- **Kiadási státusz:** `main` frissült, PWA cache `20261019-women-history-v58`, de a tényleges Pages/Cloudflare éles megjelenés továbbra sincs külön hitelesítve. Ne állítsuk, hogy a felhasználó biztosan látja. A 300-as user-fixture ágrendszer még nincs összevonva a Manager/Player megjelenítőkkel; source-key illesztés továbbra is kritikus.
- A személyes jelenlét és események **nem módosultak ebben a fejlesztési körben**, új player notification/push nincs. A teremfoglaltságot továbbra sem befolyásolhatja a találkozó időpontja.

---
## 0/B. 2026-10-19 – ténylegesen végrehajtott LIVE és Manager főág (aktuálisabb, mint a 0/A történeti állapot)

Az alábbi rész **felülírja** a korábbi, kizárólag olvasási / érintetlen jelenlétről szóló 0/A előzményt a most megjelölt eseményekre. Utolsó ellenőrzés: 2026-10-19 Budapest.

**LIVE Supabase `snqsxlyhontaepembaic`**:
- **2026-10-20 19:30**, Női BB2 **BEAC II.–UTE U20 Pink**, Player `events.id=b99c5397-8b51-40d0-a03c-e399c011bd3e`, eredeti UUID megtartva és `active`. Találkozó **18:30**, Bogdánfy csarnok, **2-es pálya**. A 20:00-s BB2 edzés `9c7b7af9-034a-4a2a-bde7-8c21a9d23cfa` `cancelled`.
- A 12 edzésre `going` játékosból **mind a 12 eleve benne volt a régi meccs 13 `going` sorában**; ezért nem készült duplikáció, `availability` nem módosult. Meccsen 13 `going`, 1 `not_going`; 1 korábbi `going` személynek a friss dátumra külön megerősítés indokolt.
- Még **16 igazolt dátumazonos, aktív csapatedzés** kapott `cancelled` státuszt a rögzített meccsek miatt (11 hazai, 5 idegenbeli); **egyiken sem volt `going` jelentkezés**. Audit: `cc_fixture_training_collision_cancel_20261019`.
- Hiányzó **Mozdulj SE** férfimeccsek létrehozva: **2026-11-18 20:00 idegenbeli** (`e4491cea-89cc-4933-9107-07271235fe0f`) és **2027-02-08 19:30 hazai** (`c7d533f3-6e85-47f0-a1f0-542ffa1302d6`). Mindkét ütköző edzés `cancelled`; az idegenbelivel ütköző edzés **1 `going` jelentkezése érintetlen**, nem minősül automatikusan meccses `going`-nak.
- Fontos felhasználói szabály: **a találkozó időpontja semmilyen módon nem szabja meg a pálya foglaltságát**. A korábban tévesen hozzáadott „előtér / 19:00 után” megjegyzés vissza lett vonva. A meccs 18:30-as találkozója 19:30-as kezdéssel marad. Csak tényleges edzés/meccs időablak + pályaszám alapján szabad teremkihasználást számítani.
- Az események száma **279**, a jelenléti bejegyzések száma **619**, importkiírás továbbra is **300** sor. Minden esemény/jelenlét-módosítást auditáltunk, az automatikus push-t letiltottuk; **nem állítható, hogy játékosértesítés ment ki**.
- Új **`cc_manager_court_impact_v1(p_from,p_to)`** read-only RPC LIVE, Manager jogosultságellenőrzéssel, authenticated EXECUTE igen, anon EXECUTE nem. Forrás: `sql/competition_weekly_court_impact_v1.sql`. A teljes idényben **34** aktuális ütköző vagy lemondott edzést azonosít (22 hazai meccs, 11 idegenbeli meccs, 1 még nem azonosított lemondás); a tömegsport-naptár 2026-10-25-ig tartalmaz rögzített eseményt, ezért az utáni szabad sávokat feltételesnek minősítjük.

**Manager főág:** A heti teremtervező UI **Versenysport → Pályák** elkészült és `main`-be squash-merge történt: PR #61, commit `f8d547543b4c9f82d3cbd9b6cd099b0b46cec131`. A kód JavasScript szintaxisa és izolált UI renderje ellenőrzött, mindkét GitHub PR CI zöld (a korábban verziószámot hardcode-oló két regressziós teszt korrigálva). **A GitHub main merge nem igazolja önmagában a publikus Pages/Cloudflare tényleges publikálását; ezt külön ellenőrizni kell.**

**Csapaterősség kutatás:** Két hivatalos női Budapest I. idény, **155+129=284 eredményes meccs**, minden csapat mérlegével és szettjeivel pontosan egyező feldolgozás. K=24, minden idény külön 1500 kezdő Elo. Kód/adat/dokumentáció **PR #62 (draft), nem LIVE**: `feat/historical-women1-team-strength-20261019`; fájl `data/competition-strength/women1_2024_2026_elo_experimental.json`. Az eredmények történeti, kísérleti modellek, nem a jelenlegi 2026/27-es csapaterősség és nem meccsesély-százalék.

**Még nyitott:** a 300 soros 2026/27 kiírás Manager/Player megjelenítő fejlesztési ágai változatlanul különállnak. Stabil forrásazonosítós párosítás, atomikus teljes mentés, ütköző forrásadatok ellenőrzése, CI és tényleges kétoldali webes közzététel szükséges az összevont kiadáshoz. BEAC–BEAC placeholder és más bizonytalan meccsek továbbra is ellenőrzendők.

---
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
