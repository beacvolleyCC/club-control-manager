# CLUB CONTROL — AKTUÁLIS HANDOVER (2026-10-25)

**Elsőként ezt olvasd:** [docs/handover/HANDOVER_20261025_CC_CURRENT.md](docs/handover/HANDOVER_20261025_CC_CURRENT.md). **Folytatási kulcs:** `CC-FOLYTATÁS`.

A legfrissebb Manager #74/#76, Player #28, Supabase-jogosultsági #77 fejlesztéseket, a draft PR-eket és a két elkülönített PostgreSQL-tesztjeiket az új átadás tartalmazza. Az alábbi, 2026.10.22-i és korábbi részek **történeti dokumentációk**, nem a 2026.10.25-i PR- vagy éles adatbázisállapotot írják le.

**Fontos felhasználói döntés:** a korábban belinkelt 2026/27-es menetrend végleges. A 41 régi BRSZ alias egyeztetése nem akadálya a meccsmodul megjelenítésének. Nem történt új PR merge, élesítés vagy LIVE Supabase-írás. Valódi bejelentkezett iPhone/Manager/Player QA és külön release-engedély szükséges.

---

# CLUB CONTROL — AKTUÁLIS HANDOVER (2026-10-22)

**Aktuális elsődleges átadás:** [docs/handover/HANDOVER_20261022_CC_CURRENT.md](docs/handover/HANDOVER_20261022_CC_CURRENT.md). **Folytatási kulcs:** `CC-FOLYTATÁS`.

A 2026-10-21-i alábbi átadás történeti előzmény; az új elsődleges dokumentum tartalmazza a canonical meccs-/statisztika-integrációkat, a Manager belépési `forEach` hiba javítását és a következő **privát, automatikusan frissülő iOS ICS feed + push értesítés** feladatot. Az iOS naptár-előfizetés **még nincs megvalósítva**. A bejelentkezett iPhone UX verifikáció továbbra is nyitott.

---

# Club Control – HANDOVER_CURRENT

## AKTUÁLIS ÁTADÁS – 2026-10-21 (elsőként ezt olvasd)

**Folytatás: [docs/handover/HANDOVER_20261021_CC_CURRENT.md](docs/handover/HANDOVER_20261021_CC_CURRENT.md)** · jelszó: `CC-FOLYTATÁS`.

A 2026-10-20-i korábbi #71/#24 teszthiba **már nem nyitott**: **Manager PR #71 és Player PR #24 beolvasztva**; főági CI és Pages telepítési workflow zöld. Manager főág `7e6004346`, Player főág `d5c49b8e` a 2026-10-21-i ellenőrzéskor. **Viszont a két hivatalos 2026-10-19-i eredmény LIVE Supabase-forrásrekordja továbbra is `scheduled` / `fixture`, végeredmény nélkül:** BEAC–PDSE 3–0 és Panoráma SE–KRE SC-A 0–3. Eredmények SQL-frissítése és visszaolvasás **külön következő feladat**, nem történt most adatírás. A Manager #68 és Player draft #19 ötligás PR-ok továbbra is nyitottak/konfliktusosak, **nem összevonandók automatikusan**. A részletes UX-kívánságok, jogosultságok, coach RSVP, tabellasorszám, menüátnevezések, tesztállapotok és folytatási terv a fenti új handoverben.

---

## 0/L. 2026-10-20 – Player mobil tabella és Manager BEAC-meccsnévsor

- User screenshot: Player Tabella, férfi Budapest I/B, 7 csapat/2026–27: a `.standings-state` általános 180px minimum magassága miatt indokolatlan nagy üres hely volt a tabella előtt; az állás oszlopai 6–8px mérettel alig olvashatók. Az eredményadatok nem feltétlenül hibásak.
- **Player [PR #23](https://github.com/beacvolleyCC/player_application/pull/23) merged**: `main` `6e4bc12763b56c60aa008f8c2fcce15fa696f32a`, cache `20261020-compact-standings-v23d`. Kizárólag a 7 csapatos férfi A/B részleges táblához scoped CSS, 0 minimum info-magasság, balra igazított rövid szakmai megjegyzés, 9/11px stat-fejléc/adat, ~138–164px fix névrész és vízszintesen scrollozható statisztika. **Három Player CI és GitHub Pages build/deploy sikeres**. Események, eredmények, jegyzőkönyvek és DB nem módosult.
- Managerben eddig az összes szövetségi meccs a saját BEAC-meccsesemények előtt jelent meg. A névsor már létezett a saját eseményekhez, csak a megjelenés/hozzáférés nehézkes volt.
- **Manager [PR #69](https://github.com/beacvolleyCC/club-control-manager/pull/69) merged**: `main` `7a33ebd6251a5eab7d035139a9df2f7128ad0526`, app+SW `20261020-match-roster-v64`. `Versenysport → Meccsek`: saját BEAC eseménykártyák legfelül, bajnoki külső referencia alattuk. Minden saját meccskártya az eredeti `eventId` alapján ugyanazzal az on-demand `cc_manager_event_roster_v1` RPC-vel nyitja a névsort, mint az edzés. Kinyitóban `Jövök / Nem jövök / Nincs válasz` counts; név/mezszám mellett külön RSVP címkék; semmilyen találgatott kapcsolat a federációs meccsekkel. Jelenlétcsúszka működése és jogosultsága nem módosult, RSVP nem egyenlő rögzített jelenléttel.
- Manager PR #69 ág 6/6 releváns CI zöld; `main` roster, protokoll, időrend, archív és történeti QA zöld, Github Pages deploy **build és deploy job sikeres**. A bejelentkezett böngészős és iPhone PWA UI manuális ellenőrzése még hiányzik.
- Supabase adatbázist nem írtuk; `events`, `availability`, találkozó-idő/hely, jelenlét, notifications és UUID-k változatlanok. A régi nyitott **Manager #68** és **Player draft #19** teljes ötligás PR-ok fejlesztési alapja most elavult: a két fenti új főági javítás megőrzése nélkül **NEM merge-elhetők**.
- Manuális QA: Player v23d férfi A/B nyitás, nincs üres tér, számok görgethetők; Manager v64 saját BEAC meccsek előre rendezve, a meccsnévsorban valódi `going/not_going/unknown`, belépett felületen ellenőrizendő. Bejelentkezett LIVE képernyőigazolást nem állítottunk.

---

## 0/K. 2026-10-20 – Player férfi A+B adatbetöltési sürgős javítás

Felhasználói hiba: **„az A csoport továbbra se megy; `ccSupabase.rpc(...).catch is not a function`”**. Megtaláltuk, hogy `ccLoadMrszPlayerPhoto_` a `cc_player_competition_user_schedule_v1` PostgrestBuilderén közvetlen `.catch()`-et hívott, holott ez **PromiseLike**, nem natív Promise. Emiatt az A/B és összes többi ligához tartozó snapshot/forrás betöltése TypeError-ral megszakadhatott.
- **Player [PR #21](https://github.com/beacvolleyCC/player_application/pull/21)** squash-merge `762e7ec8d3015399790eb692107cfd64382f3d28`, PWA **v23b**. Javítás: `Promise.resolve(ccSupabase.rpc('cc_player_competition_user_schedule_v1')).catch(...)`. Valódi thenable-nek megfelelő mockkal sikeres, dobott és `{error}` válasz tesztelve; három fő CI és GitHub Pages workflow **zöld**. Nem volt DB-írás.
- A hibamentes betöltés **még nem volt önmagában elegendő férfi A-hoz**, mert az éles `competition_source_standings` **nem tartalmaz férfi I/A tabellát**. Ezzel szemben a `cc_competition_user_schedule_v1` **42 férfi A sorát** tartalmazza: 7 csapat, 2 tényleges eredmény, 40 további meccs, 0 halasztott, BEAC nem tagja ennek a csoportnak.
- **Player [PR #22](https://github.com/beacvolleyCC/player_application/pull/22)** squash-merge **`4552a3c1182e6ca67f129f505ffe512363882c0b`**, PWA **`20261020-men-a-import-v23c`**. A férfi A 42 külön forrásazonosítós meccsét, hét valós csapatát, két ellenőrzött eredményét külön megjeleníti a Playerben, **rangsor és bajnoki pont kitalálása nélkül**, részleges, nem hivatalos táblával. A 7-csapatos férfi B fixet változatlanul védi. A 3 célzott CI és **GitHub Pages build/deploy sikeres**. A valódi bejelentkezett Player UI/telefonos cache megjelenés **külön nincs hitelesítve**.
- **Player teljes ötligás [draft PR #19](https://github.com/beacvolleyCC/player_application/pull/19)** újra a legújabb főágra építve: `feat/20261020-all-fixtures-player-v24`, commit **`125d62ae7415012c27662d2ed6d5c0df79c20424`**, PWA v24a, megőrzi férfi A+B célzott javításokat, thenable RPC-t, és a teljes 300 soros ötligás forrást. **4/4 CI zöld**, de **draft, nem main, nem Player LIVE**. A régi Player PR #17-re továbbra is tilos automatikusan merge-elni.
- A bemutatott kódjavításokhoz **nem történt Supabase DML/DDL**, tehát `events`, `availability`, meccs-UUID, jelenlét, találkozó, teremfoglalás és értesítési státusz változatlan. A találkozó időpontja továbbra sem jelent pályafoglaltságot.

**Következő:** bejelentkezett Player v23c ellenőrzése férfi A: 7 csapat + teljes 42 meccs + két rögzített eredmény; férfi B: 7 csapat / 42 meccs / egy halasztott. Amennyiben régi `.catch` hibát jelez a böngésző, cache/service-worker refresh szükséges. A PR #19 teljes ötligás kiadása csak előzetes UI/eredmény/jegyzőkönyv QA után menjen élesbe.

---

## 0/J. 2026-10-20 – null-dátumos halasztások, Player v23a és ötligás QA

- LIVE Supabase `cc_competition_user_schedule_v1`: **300 rekord / 5 liga**, köztük **5 valóban dátum nélküli halasztott meccs** (`startsAt:null`): 1 férfi B, 4 női II/A. Dátumot kitalálni tilos. A korábbi teljes import validátor tévesen minden soron dátumot követelt, így a valós teljes adatot elutasíthatta.
- Player [PR #20](https://github.com/beacvolleyCC/player_application/pull/20) **mainbe merge-elve**: `cf1d849fe3086f3b4c10aff70eaf57b6a3f5e9b2`. PWA `20261020-men-b-seven-team-v23a`. A dátum nélküli `postponed` engedélyezett, a dátum nélküli `scheduled` továbbra is tiltott. Férfi B 42 sor/7 csapat/12 BEAC/1 eredmény/1 halasztás, ellenőrizetlen helyezés nélkül. Három GitHub CI és a főági Pages build/deploy sikeres, **bejelentkezett LIVE/iOS megjelenés még nem igazolt**.
- Player új [draft PR #19](https://github.com/beacvolleyCC/player_application/pull/19): `feat/20261020-all-fixtures-player-v24`, legfrissebb `270e50bc0ee1a835cca2d784eb7d80854702bc73`. Teljes ötligás import, megőrzött férfi B speciális fix és null-dátumos validálás. **4/4 CI zöld**, de nem main és nem LIVE; a régi PR #17 eltérő/konfliktusos, ne merge-eld.
- Manager [PR #68](https://github.com/beacvolleyCC/club-control-manager/pull/68), `feat/20261019-full202627-readonly-schedule`, `accbbaf1acbf7f9364a58edf1b190fdbc13039d1`: teljes import + dátum nélküli halasztások, két tesztkörnyezeti hiba javítva. **7/7 CI zöld**, de **nem main/LIVE**.
- **Semmilyen Supabase DML/DDL nem történt ebben a körben**; `events`, `availability`, jelenlét, UUID, találkozó, pályafoglaltság és push változatlan. A találkozó ideje **nem** befolyásolja a pályafoglaltságot.
- Következő lépés: Player v23a belépett LIVE megjelenés és cache ellenőrzése, majd a két ötligás PR közös eredmény/jegyzőkönyv/forrásazonosító + iOS/desktop regressziója; atomikus találkozó/megjegyzés mentés és értesítés csak későbbi, külön felülvizsgált release-ben. BEAC–BEAC önmérkőzés és PDSE-identitás QA nyitott.

---

## 0/I. 2026-10-20 – új chat handover / legfrissebb kezdőpont

**Új beszélgetés indító üzenete:** `CC-FOLYTATÁS`. **A teljes, naprakész, rövid, feladatra kész handover itt:** [`docs/handover/HANDOVER_20261020_PLAYER_MENB_NEXT_CHAT.md`](docs/handover/HANDOVER_20261020_PLAYER_MENB_NEXT_CHAT.md).

**Fő tény:** a férfi Player B csoport 6-csapatos régi tabella/11 BEAC-régi meccs vs **7-csapatos, 42 soros éles új import** hibáját a **Player PR #18 már javította a `main`-en**, PWA v23. Ez a **kódkiadás, nem bejelentkezett LIVE/Cloudflare/telefonos UI igazolás**. A korábbi 0/H fejezet részletes auditja igazolt. Új chatben első feladat: a Player v23 megjelenését visszaigazolni; utána a nyitott Player PR #17 és Manager PR #68 teljes ötligás menetrendfejlesztését **nem szabad automatikusan merge-elni**, mert a Player PR #17 diverged (11 ahead / 1 behind) az új #18 fix után, Manager PR #68 diverged (9 ahead / 2 behind). A megőrzendő szabályok: 300/292+8 teljes import, férfi B 42 sor / 7 csapat / 12 BEAC / 1 eredmény / 1 halasztott; jegyzőkönyv és jelenlét változatlan; a találkozó ideje nem teremfoglaltság.

**A `0/H` és `0/G` fejezetek részletesebbek és korábbi állapotokat is tartalmaznak; a jelen 0/I és az új önálló handover a folytatás kiindulópontja.**

---

## 0/H. 2026-10-20 – Player férfi B csoport azonnali javítása (PR #18)

**Hibajelzés:** „Playerben most elbaszódott a B csoport a férfiaknál”. Pontos ok, ellenőrizve az éles Supabase-ben és a Player kódban:

- A `competition_source_standings` korábbi 2026/27-es férfi B mentése **6** csapatot és **0** lejátszott meccset tartalmaz, **Mozdulj SE hiányzik**. Az új `cc_competition_user_schedule_v1` férfi B rekordjai **42** darabot alkotnak: **40 scheduled fixture, 1 postponed fixture, 1 played result**, **7** csapat, **12** BEAC-részvétel.
- A régi `competition_source_matches` csak **11** férfi BEAC-részvételű korábbi BRSZ meccset tartalmazott; a Player a két forrás helyett előbb csak két kézi dátumkorrekciót illesztett, és ha az állástábla hiányzott, egyes esetekben **a meccslistát is elrejtette**.
- **Javítva** kizárólag a Player férfi B nézetében: a `cc_player_competition_user_schedule_v1` authenticated read-only RPC 42 B-csoportos sorát használja, 42 külön `ui20261018:` forráskulccsal, 7 önálló csapattal, 12 BEAC-érintettségű meccsel, 1 jegyzett eredménnyel és 1 halasztással. Adathiba vagy csonka import esetén a korábbi nézet érintetlenül marad. A régi október 12-i BEAC–PDSE le nem játszott sor nem duplikálódik, a MRSZ hivatalos eredmény/jegyzőkönyv pontos nap+irányú egyezéssel megmarad; konfliktusnál ellenőrzendő jelölés.
- A részleges eredményadatok hét csapatsorral láthatók, de **minden hivatalosan nem ellenőrzött helyezés és bajnoki pont „–”**, nem hamis 1–7. rangsor. Halasztott meccs „Halasztva”, végeredmény-konfliktus „Ellenőrzendő”.
- **Player [PR #18](https://github.com/beacvolleyCC/player_application/pull/18) squash-merge `main`-be sikeres**, commit `66af726a3a790ee2bed9f184f2f27325aeab02e6`, PWA cache `20261020-men-b-seven-team-v23`, önálló 8 részes célzott QA + korábbi Player-protokoll és MRSZ tabella workflow **3/3 sikeres** (`19d7545c1206846363820bcb7491537fc4e54a1c` PR head). A `main` tényleges fájljai + app JS szintaxisa és a cache-azonosítók ellenőrizve.
- **Nem érintett:** Manager, női B/II és férfi A, meglévő események, edzések, `availability`, találkozók, Player jelenlétek, player push. **Supabase DML/DDL nem történt**.
- **Éles publikus URL / Cloudflare Pages deploy és valós bejelentkezett iOS megjelenés külön nincs hitelesítve**; a main merge önmagában nem jelent teljes körű éles QA-t.
- **Fontos kiadáskezelés:** a régi, nyitott Player **PR #17** (`feat/20261019-full202627-readonly-schedule`) ugyanazt a meccslista-felületet általánosan is módosítja, de `main`-ről már eltér. Nem szabad vakon merge-elni a #18 utáni állapotba; előbb a B-specifikus 7-csapatos részleges eredménytáblát és 42-meccses védelmet integrálni, majd valamennyi liga QA-ját újrafuttatni.

---


## 0/G. 2026-10-19 – teljes 2026/27-es kiírás: forráskapcsolás PR-ok QA alatt

**Kizárólag fejlesztési ágakon, még NEM a mainen, és a webes LIVE sem igazolt:**
- Player [PR #17](https://github.com/beacvolleyCC/player_application/pull/17), branch `feat/20261019-full202627-readonly-schedule`.
- Manager [PR #68](https://github.com/beacvolleyCC/club-control-manager/pull/68), branch `feat/20261019-full202627-readonly-schedule`.

Mindkettő:
1. A már éles Supabase `cc_player_competition_user_schedule_v1` / `cc_manager_competition_user_schedule_v1` RPC-jét csak **teljes és ellenőrzött** `300` soros csomagként fogadja el. A megadott 2026/27-es 5 csoport egzakt darabszáma: Férfi A 42, Férfi B 42, Női I 131, Női II/A 42, Női II/B 43; összesen 292 menetrend + 8 eredmény.
2. A forrás által adott `_ccSourceSystem='user'`, `_ccUserSupplied=true`, `_ccSourceKey`, idény, liga, dátum, `fixture`/`result` különválasztás és érvényes eredmény ellenőrzött. Hiányos/módosult csomagnál **az előző biztonságos kijelzés marad**, nincs részleges felülírás.
3. Megjelenítő meccslista és csoportkatalógus csak validált teljes forrásból táplálkozik. Régi, nem lejátszott BRSZ-kiírások nem duplikálódnak; régi eredményes MRSZ-jegyzőkönyvek és szereplési adatok külön megmaradnak. A befejezett végeredmények egymásnak ellentmondó változata **egy ellenőrzendő rekordot** eredményez, a Player statisztikájában ilyenkor nem számít.
4. A Managerben az importforrás `sourceKey` alapján feloldható a korábbi kézi override-szerkesztővel (létező `cc_manager_competition_match_override_save_v1` RPC). **Találkozóhely, találkozóidő és játékos-megjegyzés atomikus összementése még nincs összevonva**, ezt csak a külön szerkesztő/RPC QA után szabad kiadni.
5. **Nincs új Supabase DML/DDL, nincs jelenlét, events, availability, pályafoglalás vagy push értesítés megváltoztatva.**

**DB audit:** a `private.cc_competition_user_effective_rows_v1()` forrás 2026.10.19-én ténylegesen **300 sor / 300 külön kulcs / 292 fixture / 8 érvényes result / 0 hibás alaprekord**. **1 önmérkőzésgyanús BEAC–BEAC** adat megmaradt ellenőrzésre; a Player nem mutatja megerősített eseményként, a Manager review-ba kerül.

**QA:** az első fejlesztési futásban az új Manager import tesztje 6/6 sikeres, de régi CJS-tesztben szöveges idézőjelhiba volt; a Player import tesztje 4/5 sikeres, a maradék a már elfogadott október 19-i fallback időpontra várt hibásan. A teszteket kijavítottuk. A Manager korábbi jegyzőkönyv-QA fix verzióra kötött ellenőrzését is dinamikusabbra javítottuk. **Az új teljes GitHub CI-futások végleges státusza még függőben van; tilos zöldként jelenteni vagy pusztán merge-ből éles deployt állítani.** A PR-okat csak sikeres CI és source-identity QA után szabad mainbe olvasztani.

**Nyitott következő feladatok:** meccs-atomi szerkesztő/RPC, külön találkozóhely/idő és opcionális játékosmegjegyzés, játékosok számára megjelenő logisztika, határozott meccs vs edzés és teremhatás QA, tényleges Cloudflare/Pages megjelenés ellenőrzése, 2025/26 BB2/férfi teljes hivatalos forrás és történeti Elo. Pályafoglaltság **nem függ** a meeting időpontjától.

---


## 0/F. 2026-10-19 – gyors jegyzőkönyv, mai meccs és statisztikai UI-javítás

Felhasználói kérés: **mindkét app** jegyzőkönyvénél a csereikon legyen a legszélső jobb oldali jel; ettől balra kapitány, liberó; a 2026.10.19-i BEAC–PDSE a 12. helyett a listában megfelelő helyre kerüljön; a statisztikai elemek ne tűnjenek el.

**GitHub main (mindkét repo, squash merge ténylegesen megtörtént):**
- Player `beacvolleyCC/player_application` PR [#16](https://github.com/beacvolleyCC/player_application/pull/16), main commit `b7eb864997f86bc1b0bebfd66b39eb39ef09779b`. PWA token `20261019-protocol-match-v21`.
- Manager `beacvolleyCC/club-control-manager` PR [#66](https://github.com/beacvolleyCC/club-control-manager/pull/66), main commit `285786a07f7a9faab798c964e957435159f718fb` (jegyzőkönyv ikonok).
- Manager PR [#67](https://github.com/beacvolleyCC/club-control-manager/pull/67), main commit `36cdbd95e794572000d69089e1653197ff5710b9` (friss mérkőzés sorrend és dátum), PWA token `20261019-protocol-match-v62`.

**Módosítás:**
1. MRSZ-jegyzőkönyv játékosjelölések: kapitány (C), liberó (L), csere (CS, kétirányú ikon) **balról jobbra**, jelölésoszlop jobb szélén; hiányzó pályára lépési jel `–` nem azonos cserejelöléssel.
2. Mindkét bajnoki meccslista: **mai és későbbi meccsek először időrendben**, elmúltak alul fordított időrendben. Éles DB és import alapján azonosított felhasználói kulcsok:
   - Férfi I/B BEAC–PDSE `ui20261018:menB:beac:pdse:1` 2026.10.19. 19:30; a korábbi 2026.10.12. 19:30-as *le nem játszott* sor csak akkor szűrhető ki, ha a javított rekord betöltődött;
   - Női II/B BEAC II.–UTE U20 Pink `ui20261018:womenIIB:beacii:uteu20pink:1` 2026.10.20. 19:30; korábbi kiírás 2026.10.13.
   - A forráskulcson kívül ellenőrzött pontos csapatpár, liga, idény, kezdési dátum és `_ccUserSupplied` kell. **Régebbi eredményes meccs soha nem törölhető/nyomható el**. A teljes 300 soros import UI-ját ettől még NEM olvasztottuk be, kizárólag a két igazolt dátumáthelyezést.
3. Player `Statisztikák`: mind a **négy fül** mobilon is látható (Áttekintés, Csapatok, Játékosok, Összehasonlítás); még üres bajnoki forrásnál sem tűnik el a statisztika panel; mutatja a **rögzített végeredmények** és a **tényleges jegyzőkönyvek** számát. A nem ellenőrzött bajnokságszintű forma/rang `–` marad; nem generál kitalált eredményeket vagy játékos-perceket.
4. **Semelyik javítás nem módosít Supabase `events`, `availability`, meccsvégeredmény, találkozó vagy pályafoglalás adatot**, nincs automatikus értesítés.

**Ellenőrzés:** célzott JS syntax, ikon HTML sorrend, Player és Manager alapszintű dátum-/deduplikációs futtatási próba sikeres; új Node CI workflow-k és regressziós tesztek a repoágakban. A PR merge pillanatában GitHub Actions több helyen még **queued/in_progress** volt: **nem szabad zöld CI-ként bejelenteni**. Ugyanígy a GitHub main merge **nem bizonyít önmagában éles Pages/Cloudflare deployt vagy a bejelentkezett UI megjelenését**. A konkrét deployment ellenőrzés és az új CI-k végállapota nyitott.

---


## 0/E. 2026-10-19 – 2025/26 BB2 és férfi történeti, fázisonként auditált adatforrások

**GitHub Manager `main` frissítés:** [PR #65](https://github.com/beacvolleyCC/club-control-manager/pull/65) beolvasztva, commit `1eaf354e481196c42d4249eafb3ccb6cedfdf6fe`. **5/5 GitHub CI sikeres**, a korábbi történeti QA-k is. A Manager PWA JS verzió és service-worker cache `20261019-history-phases-v60`. **Cloudflare/Pages tényleges, böngészőben elérhető deploy nincs önállóan hitelesítve**.

- **MRSZ 2025/26 Női Budapest II.**: az A alapszakasz `p_verseny_al_kod=97` (egy [hivatalos 6189-es jegyzőkönyv](https://www.hunvolley.info/pr_a/010/009/p_009.asp?p_evad_kod=2025&p_merkozes_kod=6189&p_verseny_al_kod=97) megerősíti a csoportot), a felső, 1–8. rájátszás `350` ([9033-as jegyzőkönyv](https://www.hunvolley.info/pr_a/010/009/p_009.asp?p_evad_kod=2025&p_fo_cim=NoiBudapestII.osztalyRajatszas1-8.helyert&p_merkozes_kod=9033&p_verseny_al_kod=350)), az alsó, 9–16. rájátszás `351` ([8460-as jegyzőkönyv](https://www.hunvolley.info/pr_a/010/009/p_009.asp?p_evad_kod=2025&p_fo_cim=NoiBudapestII.osztalyRajatszas9-16.helyert&p_merkozes_kod=8460&p_verseny_al_kod=351)). A B alapszakasz pontos MRSZ-kódja és a **teljes hivatalos tabellák + összes eredmény** még nincsenek ellenőrizve. A BB2 felső/alsó rájátszási szereplését sem szabad ebből feltételezni.
- **Férfi I. 2025/26**: a teljes hivatalos versenyazonosító + tabella és mérkőzéslista még hiányzik. A [BRSZ PDSE 1091-es profil](https://brsz.hu/m/csapatok.php?csapat_id=1091) **férfi II. osztályt** mutat, nem tekinthető automatikusan az idei férfi I/B PDSE megfelelőjének. Az idei 1214-es, valamint az új Mozdulj SE férfi csapat továbbra is identitás-QA alatt.
- Kutatási (még **nem teljes**) MRSZ-forrásmanifeszt: `data/competition-history/2025_26_men_womenII_source_manifest.json`. Tartalma 2 verseny, 4 női II. és 1 férfi I. fázis, de **egyikhez sincs teljes visszaszámolt hivatalos tabella és eredménylista**.
- Új, írásmentes, fail-closed ellenőrző: `scripts/history/validate-official-competition.cjs`, teszt: `tests/historical-2025-phase-validation.test.cjs`. **Csak akkor fogad el** egy valódi MRSZ-archív adatcsomagot, ha a teljes fázislista, hivatalos csapatok, egyedi mérkőzéskódok és eredmények megvannak, és a W/L + szettadat a tabellával pontosan egyezik. A rájátszás **áthozott adatait jelenleg szándékosan blokkolja**, amíg dokumentáltan nincsenek külön számításként kezelve (nem dupláz).
- Manager UI: `Versenysport → Előző idény → Női BB2 / Férfi` panelen a meglévő részleges forrás státuszon túl **„Hivatalos források · 2025/26”** táblázat jelenik meg: versenyszakasz, MRSZ azonosító (ha igazolt), az adatok teljessége és a hivatalos jegyzőkönyvre mutató link. Forrásadat: `data/competition-strength/men-bb2_202627_historical_coverage.json`, új mező `officialPhaseSources`.
- **TILOS most Elo-t, bajnoki teljes mérleget, személyi/keretfolytonosságot vagy győzelmi valószínűséget képezni** a részleges férfi/BB2 forrásokból. A jelenlegi időpont- és jelenlét adatbázis **nem módosult**, push nem ment ki.
- Következő feladat: a hivatalos 2025/26-os női II. alapszakasz + rájátszás, illetve férfi I. teljes fázis-adatcsomagjának beszerzése; a rájátszásos pontáthozatal explicit szabályainak kezelése; csak teljes matematikai egyezés után történeti Elo. A korábban felhasználó által beküldött **2026/27-es teljes menetrend külön UI merge/Player megjelenítő fejlesztési ágai továbbra is nyitottak**, és fontosabbak, ha a felhasználó újra a meccsek kezelésére tér vissza.

---



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
