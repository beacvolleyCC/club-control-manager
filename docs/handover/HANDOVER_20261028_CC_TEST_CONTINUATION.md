# Club Control – TEST handover
**Dátum:** 2026. október 28. (Budapest)  
**Cél:** a BEAC/ELTE Club Control következő ChatGPT-fejlesztési beszélgetésének teljes, ellenőrizhető átadása.

**Összefoglaló:** Két PWA: Manager és Player. A TEST Supabase működő mesterséges adatokat és összekapcsolt tesztfiókot tartalmaz, a buildelt TESThez csatlakozó PWA-csomagok elkészültek, de **Cloudflare Pages TEST deploy és valódi telefonos teszt még nem történt**. A LIVE változatlan. A felhasználó jelenleg iPhone-ról dolgozik; az asztali Cloudflare-projekt létrehozása elhalasztva. Ne kérd újra, amíg nem jut géphez.

## 1. Kritikus elkülönítés

| | LIVE – nem módosítható külön jóváhagyás nélkül | TEST – itt dolgozunk |
|---|---|---|
| Manager | https://github.com/beacvolleyCC/club-control-manager/tree/main | https://github.com/beacvolleyCC/club-control-manager/tree/test/20261026-manager-document-intake |
| Player | https://github.com/beacvolleyCC/player_application/tree/main | https://github.com/beacvolleyCC/player_application/tree/test/20261026-isolated-player-mobile |
| Supabase ref | snqsxlyhontaepembaic | szzoubvhlwnojtzqjebc |
| Publikus PWA | https://beacvolleycc.github.io/club-control-manager/ és https://beacvolleycc.github.io/player_application/ | Még NINCS külön publikált TEST HTTPS-cím |

2026-10-28-kor ellenőrzött branch HEAD:
- Manager TEST: **74b50741d88368fcc9780610471811947477764f**
- Player TEST: **17991748d815e052932f17dfe49939aeb5edf8de**
- Manager LIVE main: **90df6cfd3f630f10bea9c2acae769047d2154f04**
- Player LIVE main: **51fb2248c379d47c80bfb56aec3dd4e510a5885e**

**Figyelem:** ezek pillanatfelvételek. Minden folytatásnál előbb a valós GitHub headet ellenőrizd. Az éles branchre és az éles Supabase-be tilos írni, amíg a felhasználó külön nem engedélyezi a konkrét élesítést.

## 2. TEST adatbázis – ténylegesen ellenőrzött darabszámok

| Tétel | Darab |
|---|---:|
| Csapat | 3 |
| Játékos | 19 |
| Csapattagság | 21 |
| Esemény | 11 |
| RSVP / availability | 66 |
| Auth felhasználó | 1 |
| Manager fiók | 1 |
| Manager moduljogosultság | 14 |
| Bajnoksági kapcsolatok | 3 |
| Tabellasorok | 12 |
| Forrásmérkőzések | 9, ebből három lezárt szintetikus |
| Külön versenymenetrend-sorok | 3 |
| TEST in-app értesítés | 6 |
| Push outbox | 0 |
| Public/private adatbázisfüggvény | 92 |

A felhasználó a TEST Supabase Authentication/Users oldalon létrehozta a tényleges TEST Auth-fiókját. A TEST-ben **Playerként női BB2 (team_w2) az egyetlen aktív csapata**. Női BB1 és férfi csapattagsága történeti/inaktív; Managerként mindhárom csapatot láthatja. A pontos tesztbejelentkezési e-mail a TEST Auth felületen ellenőrizhető, nem szabad nyilvános dokumentumba másolni. Nem másoltuk át a teljes éles játékos-adatbázist; a többi névsoradat mesterséges.

## 3. Már működő TEST backend

- Player: bootstrap (BB2 + öt esemény az ellenőrzéskor), profil és saját fizetési/jelenléti adatok olvasása, sportorvosi státusz, saját értesítések (olvasottá jelölés/archiválás), csapaton belüli avatárok.
- Versenysport: külön női BB1, BB2/B és férfi A ligák (4-4 tabellasor és 3-3 meccs). Player tabella, ligastatisztika és csapatstatisztika RPC-k; MRSZ/BRSZ/mérkőzésmenetrend olvasási kompatibilitás. **MRSZ hivatalos snapshotok TEST-ben még hiányoznak**: szándékosan üres listákat szolgálnak ki.
- Manager: nyolc alapolvasó RPC (bootstrap, teams, overview, players, calendar, events, RSVP matrix, competition results) hitelesített szerepkörnek engedélyezve, névtelenül nem. Az Auth-fiókot reprezentáló, tranzakcióba zárt SQL-profilpróbán **3 csapatot, 14 jogosultságot, 19 játékost, 8 naptáreseményt és 3 lezárt eredményt** kaptunk.
- Javítva TEST-ben a Manager mérkőzéslekérésében egy korábbi SQL-rendezési hibát (rossz starts_at alias; helyesen a startsAt aliasra hivatkozik). Ezután az olvasási smoke sikeres volt.
- Negatív jogtesztek több RPC-nél sikeresek; **valódi iPhone böngészős, teljes bejelentkezési és RSVP-végpontteszt még nem történt**.
- Éles alkalmazás és éles DB változatlan; nem aktiváltunk push- vagy kézi e-mail küldést.

## 4. Legutóbbi Player fejlesztés: RSVP Stage 11

GitHub TEST ág: https://github.com/beacvolleyCC/player_application/tree/test/20261026-isolated-player-mobile

- Külön TEST fájl: **rsvp-reliability.js**, amely az optimista Player RSVP-mentést helyesbíti.
- Eseményenként soros írásokat kezel; gyors új választásnál az elavult, még nem elküldött írás kimarad.
- A később beérkező, régi hibás válasz nem állít vissza már új választást.
- A legutóbbi sikertelen szervermentés az utoljára igazolt állapotot jeleníti meg, és hozzáférhető hibajelzést mutat. Másik esemény mentése közben is mehet.
- A TEST index.html, sw.js és statikus Pages build tartalmazza az új fájlt; LIVE main nem módosult.
- **7/7 Node.js VM teszt PASS.**
- Első commit: 6b30592335e21068dafe8e4b3ec8c340f6346201. Ennél két *régi* GitHub-workflow PWA-verzióegyezőségi tesztje megbukott. Ezt a következő 4d4f0fde10637437ccfc7a9d649b7487acb66098 commitban javítottuk.
- A javított commitnál **6/6 automatikus workflow sikeres**: RSVP reliability, mobil izoláció, archivált jövőbeli BB2-meccs, jegyzőkönyv/meccssorrend, férfi B tabella, Cloudflare TEST static Pages build.
- Legutóbbi összefoglaló: https://github.com/beacvolleyCC/player_application/blob/test/20261026-isolated-player-mobile/docs/TEST_RSVP_RELIABILITY_STAGE11_20261028.md
- **Player Issue #31 NYITOTT:** https://github.com/beacvolleyCC/player_application/issues/31 – csak sikeres valós TEST Auth + RSVP/adatbázis end-to-end után zárható.

## 5. Biztonsági blocker – RLS csapattagság

**Manager Issue #81 NYITOTT:** https://github.com/beacvolleyCC/club-control-manager/issues/81

A TEST private.current_team_ids() és private.player_in_my_team() függvények jelenleg az aktív jelölést és lejáratot ellenőrzik, de nem vizsgálják a jövőbeli starts_on kezdődátumot. Az events/availability RLS ezekre épül. A javító DB-migrációt a hozzáférésvédelmi ellenőrzés megállította; **a hiba még nem javított**. Soha ne kerüld meg a blokkolást, ne adj szélesebb SELECT/INSERT/UPDATE/anon jogokat. Megoldás csak TEST-re, szűk jogosultsággal, kezdő/záró/aktív csapattagság és idegen csapat negatív tesztjével.

## 6. PWA publikálás: számítógépig elhalasztva

**Nincs telepíthető külön TEST Pages webcím, nem szabad ilyet kitalálni.**

A GitHub TEST ágak forrás config.js fájljai **DEMO módúak**. A statikus builder a dist-test könyvtárban kapcsolja a klienskonfigurációt a külön TEST Supabase-hez, kizárólag nyilvános sb_publishable kulccsal, éles URL nélkül. A build eredménye **STAGING · NEM ÉLES** feliratot használ. A PWA cache és ikon elkülönített; a builder allowlist alapján nem másolja a teljes projektadatokat a webre.

Ha a felhasználó később géphez jut, két **külön Cloudflare Pages Free** projektet kell létrehozni az eredeti két GitHub repo TEST ágából (nem kell két új repo). Mindkettő:
- Framework: None; root: /; build command: node scripts/build-cloudflare-test.cjs; output: dist-test
- Manager repo: beacvolleyCC/club-control-manager, production branch: test/20261026-manager-document-intake, javasolt projektnév: cc-manager-test-beac
- Player repo: beacvolleyCC/player_application, production branch: test/20261026-isolated-player-mobile, javasolt projektnév: cc-player-test-beac
- Ne módosítsd a main branch-eket és a LIVE GitHub Pages-t. Tényleges pages.dev címet csak a Cloudflare sikeres létrehozása után mondj.

Részletes telepítési leírás:
- Manager: https://github.com/beacvolleyCC/club-control-manager/blob/test/20261026-manager-document-intake/docs/handover/TEST_CLOUDFLARE_PAGES_INSTALL_20261026.md
- Player: https://github.com/beacvolleyCC/player_application/blob/test/20261026-isolated-player-mobile/docs/TEST_CLOUDFLARE_PAGES_INSTALL_20261026.md

## 7. Hiányok és további backlog

1. A TEST **nem 100%-osan LIVE-funkcióazonos**: több Manager írási/RPC és Player mellékfunkció még hiányzik. Minden lépés előtt ellenőrizni kell a konkrét RPC-t és a jogosultságot.
2. LIVE sportolói névsor közvetlen átmásolását biztonsági kontroll tiltotta. Készült offline, e-mail-pseudonimizáló importáló a Manager TEST ág scripts/prepare-staging-player-import.cjs fájlban. Nem készült teljes valódi import. Ne másolj át privát adatot GitHubra.
3. TEST-ben nincsenek valós MRSZ canonical/snapshot eredmények, ezért a hivatalos tabella és összes részletes jegyzőkönyv nem teljes.
4. A TEST Auth OTP tényleges kézbesítés és telefonos munkamenet-visszaállítás, Player RSVP pozitív adatírás, iOS Safari/PWA telepítés és offline reload nincs kipróbálva.
5. 2026-10-30-tól új Supabase public tábláknál külön GRANT szükséges; minden új tábla szűk RLS-sel készüljön, anon hozzáférés nélkül, ha nem feltétlen szükséges.
6. A felhasználó a röplabda állásrend + pontozás összevonása után új UI/UX-vázlatot szeretne rajzolni. A pálya vizuálisan még nem megfelelő. Tervezett két soros pont-timeline, időkérés eredménnyel, cserék mezszámokkal, később felállásból számolt pontstatisztika. Ne írj át nagyobb dizájnt a felhasználói rajz nélkül.
7. Versenyosztályokat tilos összekeverni: női BB1, női BB2/B, férfi A és más férfi B/meccscsoportok kontextusai külön kezelendők.

## 8. Ajánlott következő lépések számítógép nélkül

1. Friss GitHub branch HEAD/Actions ellenőrzés; a TEST CI ismételt futtatása a legújabb változtatások után.
2. Manager Issue #81 RLS-hiány elemzése és biztonságos TEST-only javítás előkészítése, hozzáférésvédelmi ellenőrzés megkerülése nélkül.
3. Player Issue #31 mellett további statikus RSVP, PWA cache, felhasználói hibaüzenet, gyors váltás, session lejárta és offline QA.
4. Manager/Player funkcionális RPC-paritási lista és a hiányzó, engedélyezett TEST read/write funkciók sorrendben való megépítése.
5. Versenysport tabella, előző idény/statisztika, jegyzőkönyv, menetrend, jogosultságok és értesítések QA, teljesen szintetikus adatokkal.
6. Minden kör után legalább kétszer ellenőrzés + 11 pontos QA. Cloudflare beállítást a felhasználó későbbi asztali alkalmaira halasztjuk.
7. Eredményesen tesztelt TEST munkából csak külön kifejezett user kérésre mehet bármi LIVE-ra.

## 9. 11 pontos QA elvárás

1. Csak TEST branch/DB változott; LIVE diff nincs.
2. TEST config/cookie/storage/cache/PWA-azonosító biztosan külön.
3. Titkok és sportolói privát fájlok nem kerülnek publikus buildbe.
4. TEST Auth, Player/Manager fióktársítás és logout/relogin helyes.
5. RLS: aktív, inaktív, jövőbeli, lejárt és idegen csapattagság helyesen szűr.
6. RSVP Jövök/Nem jövök/semleges/indok mentés és reload konzisztens.
7. Offline/hálózati/RLS hiba után rollback; gyors kapcsolások nem okoznak versenyhelyzetet.
8. Manager csapatválasztó, jogosultság, naptár, RSVP-mátrix, eredmények helyesek.
9. BB1/BB2/férfi ligák, meccs státusz, halasztás, eredmény és tabella nem keveredik.
10. Külső push/SMTP/pénzbeszedés nem aktiválódik, 0 Ft szolgáltatási keret.
11. Kétszeri automatizált és kézi QA; iOS Safari/PWA csak deployment után, külön élesítéshez engedély szükséges.

## 10. Új beszélgetés indító szöveg

**CC-FOLYTATÁS – 2026.10.28 HANDOVER**

Folytassuk a BEAC Club Control fejlesztését. Előbb olvasd el a Manager TEST ág docs/handover/HANDOVER_20261028_CC_TEST_CONTINUATION.md fájlját, valamint a Player TEST docs/TEST_RSVP_RELIABILITY_STAGE11_20261028.md dokumentumát. Manager TEST branch: test/20261026-manager-document-intake; Player TEST branch: test/20261026-isolated-player-mobile. Supabase TEST ref: szzoubvhlwnojtzqjebc. A LIVE main ágakat, GitHub Pages oldalakat és LIVE Supabase snqsxlyhontaepembaic projektet ne módosítsd külön engedély nélkül. Ellenőrizd a friss HEAD-eket, ne a régi státuszt feltételezd. Player RSVP Stage 11 javításnál 7/7 egységteszt és a PWA cache-javítás utáni 6/6 GitHub workflow sikeres, de a valós iPhone-os bejelentkezés és RSVP még nem volt tesztelve. Nyitott Player #31 és Manager #81. A TEST-ben egy összekapcsolt Auth/Player/Manager tesztfiók van, 3 külön csapat; a teljes LIVE-paritás nincs meg. Cloudflare Pages publikálást a felhasználó iPhone-ról nem tudja elvégezni; egyelőre ne kérd, hanem haladj tovább a biztonságos TEST fejlesztéssel és QA-val. Szokásos kétszeri, 11 pontos ellenőrzés, 0 Ft költség, LIVE védelem.

---
**Az összes darabszám és SHA 2026-10-28-i ellenőrzött pillanatkép; mindig olvasd újra a friss adatokat.**


## 2026-11-02 kiegészítés – LIVE tapasztalat és TEST feladat
- Az októberi bérletek 2026-11-02–05 között a vasárnapi alkalmak kivételével átmenetileg elfogadandók. Az ismeretlen, még nem importált bérletszám jelentkezéskor ellenőrzésre váró lehet, nem automatikus tiltás.
- A 2026-11-02 20:00 Haladó (`20261102-HA-01`) LIVE jelentkezése 18:00 után `BOOKING_CLOSED_2H` miatt „Technikai hiba” üzenetre futott. A felhasználó kifejezett kérésére **csak ennél az egy eseménynél** a 2 órás cutoff LIVE-kivételt kapott; a felhasználó utóbb visszaigazolta, hogy a jelentkezés működik. A többi edzés és az esemény kezdete utáni tiltás változatlan.
- Új Manager GitHub **Issue #84**: https://github.com/beacvolleyCC/club-control-manager/issues/84 – a TEST publikus jelentkezési UI 2 órás határidőnél a jelentkezés lezárását és értelmes hibaüzenetet mutasson, a várólista csak jogosult konfigurációban legyen elérhető. A TEST-ben a `mass_waitlist` tábla létezik; a publikus API és frontend paritása nincs bizonyítva. Ez **terv, még nem implementált javítás**.
- A Player TEST kódban a profil/fizetés 45 másodperces láthatóságfüggő pollinggal, az RSVP/menetrend pedig privát csatornás broadcast-fogadással működne. A TEST `supabase_realtime` publikációjában nem volt tábla és az events/availability táblákon nem volt broadcast trigger; teljes Manager→Player automatikus élőfrissítés még **nem igazolt**. A jogosultsági szabályok ellenőrzése nélkül ne aktiváld.
- LIVE-on az itt leírt kivételen túl semmit ne módosíts külön engedély nélkül. Következő lépés: Issue #84 TEST implementációjának és a Realtime-jogosultsági architektúrának ellenőrzése, két kör QA-val.

### 2026-11-02 – várólista szabály audit (csak olvasás)
A LIVE `cc_mass_waitlist_join_v0550b41` és `cc_mass_waitlist_join_v0550b4` egyaránt `BOOKING_CLOSED_2H` kivételt dob a kezdés előtti 2 órában. Így a határidő után **a várólista SEM elérhető**; ezt nem elegendő kizárólag UI-val javítani. A b41 változat maximum 5 várólistást, duplikáció- és párhuzamos-edzés ellenőrzést, valamint kapacitásvizsgálatot tartalmaz. A TEST-ben nincs megfelelő publikus várólista RPC. Javasolt kívánt állapot: csak a közvetlen foglalás zárjon T-120-nál, várólistára jelentkezés opcionálisan maradhasson nyitva T=0-ig, de automatikus helyfelajánlási szabályok és jogosultság/OTP/anon biztonság külön vizsgálandók. Ez **még nincs implementálva**. Issue #84.

### 2026-11-02 késő este – TEST határidő logika implementálva
A TEST Supabase (`szzoubvhlwnojtzqjebc`) private sémájába bekerült a `private.cc_mass_registration_window_test_v1(date,time,timestamptz,boolean)` belső policy-helper. `public`, `anon`, `authenticated` végrehajtás megvonva. Közvetlen jelentkezés T−120-nál zár, a külön engedélyezett várólista T=0-ig nyitott lehet; T=0-nál mindkettő zárt. Csak logikai helper, **nem** publikus regisztráció vagy várólista API és **nem** UI-javítás. Az 5 ágas SQL smoke ellenőrzés sikeres (cutoff előtte/határán/utána, kezdés, tiltott várólista). Következő feladat: teljes TEST publikus API és a megfelelő felület bekötése jogosultsági és duplikációs tesztekkel. LIVE változatlan.

### 2026-11-03 – TEST privát várólista előellenőrzés
A TEST Supabase-ben létrejött a `private.cc_mass_waitlist_eligibility_test_v1(text,text,text,timestamptz)` `SECURITY INVOKER` függvény. Aktív esemény, cutoff-helper, ugyanazon esemény aktív foglalás/várólista duplikáció, 5 fős limit, kapacitás, Manager waitlist-only gate ellenőrzés. **Csak belső előellenőrzés, nem atomi foglalás; nincs publikus grant, nincs UI vagy API-bekötés.** RLS marad, anon/authenticated EXECUTE nincs. Negatív smoke: hiányzó esemény EVENT_NOT_FOUND, üres e-mail EMAIL_REQUIRED, authenticated EXECUTE=false. Még hiányzik: azonos idősáv ütközés, kapacitásbucket-pontosság, tranzakciós lock+INSERT, adatvédelmi tesztek és teljes end-to-end QA. LIVE változatlan.

### 2026-11-03 – TEST atomikus várólista INSERT (nem publikus)
Létrejött a TEST DB `private.cc_mass_waitlist_insert_test_v1(text,text,text,text,text)` `SECURITY INVOKER` függvény. Eseményenként `pg_advisory_xact_lock` + esemény `FOR UPDATE` zárolás, jogosultság nélküli privát belső ellenőrző hívás, az 5 fős limithez sorosított check+INSERT, új UUID, ELLENŐRZÉSRE VÁR bérletstátusz. A funkciót `anon` és `authenticated` NEM hívhatja (ellenőrizve), nincs publikus API-bekötés. Negatív smoke: hiányzó esemény EVENT_NOT_FOUND. **Valódi pozitív beszúrás, két konkurens tranzakciós teszt, azonos idősáv ütközés, pontos new capacity bucket és teljes RLS/QA még nincs végrehajtva.** Nem késznek tekintendő, ne élesítsd. LIVE változatlan.

### 2026-11-03 – TEST várólista pozitív smoke / 5 fős limit
Két szintetikus mass_events került be kizárólag TEST-be, `source_workbook_id=CC-QA-SYNTHETIC`, azonosítók `QA-WAIT-20261110` (managerWaitlistOnly=true) és `QA-WAIT-20261111` (szabad kapacitás). Mesterséges `example.invalid` e-mail-címekkel a privát `cc_mass_waitlist_insert_test_v1` pozitív INSERT sikeres (position=1). Második azonos e-mail → `WAITLIST_DUPLICATE_EMAIL`, szabad kapacitású esemény → `CAPACITY_AVAILABLE`. További szintetikus jelentkezésekkel összesen pontosan 5 várólistás rekord; hatodik → `WAITLIST_FULL`, ellenőrzött `COUNT(*)=5`. Tényleges konkurens tranzakciós stresszteszt még NEM volt, valamint same-slot és jogosultsági/E2E tesztek hiányoznak. Az adatokat kizárólag QA célra tartsuk, éles személyes adat nincs; LIVE érintetlen.

### 2026-11-03 – TEST same-slot védelmi kör
A `private.cc_mass_waitlist_eligibility_test_v1` privát függvénybe bekerült az aktív foglalások és aktív várólistások azonos nap+kezdés ütközésellenőrzése. Új szintetikus `QA-WAIT-SAME-SLOT` esemény; `qa-wait1@example.invalid` (másik azonos időpontú edzés várólistáján) → `SAME_SLOT_CONFLICT`. A T−119 perces ellenőrzésnél a rendes foglalás zárt, a várólista jogosult; pontos kezdéskor `EVENT_ALREADY_STARTED`. `anon` és `authenticated` nem rendelkezik privát insert EXECUTE-tal, az anon check is tiltott. **FIGYELEM:** eltérő eseményekre ugyanazon e-maillel párhuzamosan futó insert esetén az eseményenkénti zárolás még nem bizonyít teljes same-slot tranzakciós sérthetetlenséget; szükséges e-mail/idősáv lock, valódi konkurens teszt és publikus API jogosultsági kontroll. Csak TEST, LIVE változatlan.

### 2026-11-03 – TEST ugyanazon személy/idősáv tranzakciós lock V2
Sikeres TEST migráció: `private.cc_mass_waitlist_insert_test_v1` az eseményzár elé hozzáadott `pg_advisory_xact_lock(hashtextextended(workbook + normalizált e-mail + esemény dátum+kezdés,0))` identitás/idősáv lockot, utána továbbra is eseményenként zár és újraellenőrzi az előfeltételeket. `SECURITY INVOKER`, a privát RPC `anon` és `authenticated` EXECUTE hamis (ellenőrizve). Negatív smoke: két esemény közötti azonos idősáv SAME_SLOT_CONFLICT, 6. várólistás WAITLIST_FULL. **Valós két külön sessionből egyszerre indított konkurens teszt még hiányzik**; a garancia csak ezen a belső insert útvonalon igaz, más írási belépési pontokra nem. A publikus regisztráció API nincs kész. LIVE változatlan.

### 2026-11-03 – következő QA-kör és átmeneti hozzáférési blocker
A `private.cc_mass_waitlist_insert_test_v1` identitás+idősáv lock V2 korábban sikeresen telepítve és alap smoke tesztelve. Az új körben a TEST Supabase SQL-lekérdezéseit a hozzáférési/safety ellenőrzés több alkalommal blokkolta. **Nem történt további adatbázis-módosítás, sem valós konkurens teszt.** A publikus regisztrációs API továbbra sem készült el. Következő 4 feladat: (1) a Manager foglalásírás és többi írási útvonal lock- és idősáv-védelmének auditja, (2) két külön adatbázis-session párhuzamos jelentkezési próbája, (3) aktív/inaktív és lejárt sorok/kapacitásbucket helyes kezelése, (4) biztonságosan hitelesített publikus API szerződés és negatív jogosultsági QA. `anon` jogosultságot ne tágítsunk a blokk megkerülésére. LIVE érintetlen.

### 2026-11-03 – Manager foglalás vs várólista ütközésvédelem (TEST)
A TEST `public.cc_manager_mass_booking_add_v1` kapott azonos személy+eseménydátum+kezdési idő advisory transaction lockot és a más edzés aktív várólistájára vonatkozó `SAME_SLOT_WAITLIST_CONFLICT` ellenőrzést. A `private.cc_mass_waitlist_insert_test_v1` lock-sorrendje módosult: esemény advisory lock → esemény sor `FOR UPDATE` → személy/idősáv advisory lock → eligibility → INSERT. A módosítások sikeres migrációval felmentek, a forrásban utóellenőrzés szerint a Manager védelem és a várólista lock-sorrend jelen van. NEM történt két DB sessionös valódi konkurens teszt vagy Manager bejelentkezett végpont-teszt, ezért teljes garancia nincs. Publikus API továbbra sincs. A LIVE érintetlen.

### 2026-11-03 – újabb 7 pontos TEST regressziós ellenőrzés
Olvasási/negatív smoke ellenőrzések: (1) 3 szintetikus esemény továbbra is jelen; (2) azonos idősáv másik eseményen `SAME_SLOT_CONFLICT`; (3) 6. várólistás `WAITLIST_FULL`; (4) szabad kapacitás mellett `CAPACITY_AVAILABLE`; (5) időkapu 17:59 nyitott / 18:00 rendes zárva, várólista nyitva / 20:00 mindkettő zárt / waitlist tiltás érvényes; (6) `mass_waitlist` RLS aktív, anon és authenticated privát INSERT EXECUTE tiltott; (7) Manager cross-waitlist guard és várólista identity lock a függvénydefinícióban jelen, rekordok száma változatlanul 5. Ebben a körben **nem történt DB-módosítás**, valódi kétsessionös konkurens teszt, frontend E2E és publikus API továbbra is hiányzik. LIVE érintetlen.

### 2026-11-03 – összekötés a valódi publikus oldallal, cutoff QA
Felderítve a tényleges publikus tömegsport jelentkezési Worker: `beacvolleyCC/beac-edzesek`, QA branch `qa/public-v2-bridge-main-2026-10-12`. Worker egyelőre Apps Script transzportot használ, Supabase V2 cutover OFF. Csak a QA `worker.js` és tesztek módosultak: jól érthető `BOOKING_CLOSED_2H` hiba→409 és HU/EN üzenet, szerveridő alapján lezárt nem választható edzéssor, regressziós Node QA (dokumentum: `docs/QA_11X_20261103_BOOKING_CUTOFF_ERROR_BRIDGE.md` a beac-edzesek QA ágban). Nem deployoltunk és nem nyúltunk LIVE-hoz.
TEST Supabase-ben `public.cc_mass_registration_status_test_v1(text)` csak `CC-QA-SYNTHETIC` eseményekhez 0 PII aggregált státuszt ad (anon/authenticated EXECUTE, security-definer – Supabase advisor figyelmeztetés tudatos és csak QA szintre vállalható). V2 reservation/new bucket számolás: aktív felajánlott hely nem számít szabadnak, lejárt felajánlás nem foglal helyet, új limittel is számol; pozitív szintetikus SQL smoke tesztek sikeresek. A publikus Worker egyelőre NEM használja ezt a TEST RPC-t, és nem kötöttük a valódi személyes adatokhoz; írási API, OTP, rate limit és konkurens E2E teszt hátravan. QA Worker GitHub Actions aktuális státusz külön vizsgálandó. Issue #84.

**Publikus QA CI eredmény:** `beac-edzesek` QA commit `5ad5d4f6b2881aae4eb6502a0485303fe3196050`, [run 41598211257](https://github.com/beacvolleyCC/beac-edzesek/actions/runs/41598211257), SUCCESS. Ebben már benne van a Worker szerveridős cutoff jelölés, tiltott kattintás/keyboard, 120 perces határérték, eredeti V2 flag OFF és a HU/EN hibafordítás regressziója. A böngészős, Apps Script és valódi Supabase írós teljes E2E továbbra sem igazolt.

### 2026-11-03 – várólista késői csatlakozás és helyfelajánlás (egyeztetés, NEM implementáció)
Felhasználó kifejezetten jelezte: a közvetlen foglalás T−120-as zárása UTÁN is lehessen várólistára kerülni; 40 perces küszöböt javasolt az edzés előtti utolsó időszakhoz. LIVE read-only ellenőrzés: a `mass_waitlist` egyetlen `offered_at` és `offer_expires_at` párral rendelkező történeti sora **30 perces** ajánlatot igazol, de az általános szabály paraméterből származik, így az időtartam nem globális adatbázis-konstans. LIVE `cc_mass_waitlist_join_v0550b41` T−120-nál zár, `cc_mass_waitlist_offer_next_v0550b41` és `cc_mass_waitlist_offer_queue_v1` T−120 után nem ajánl fel, `cc_mass_waitlist_decide_v0550b41` T−120 után ELFOGADÁST is blokkol; mindet összehangoltan kell változtatni később. Felmerült beállítás: várólistára belépés edzéskezdet előtt T−40-ig; rövidebb, pl. 10 perces késői offer-válaszidő a 30 perces korai ajánlat mellett, az edzéshez közeli utolsó automatikus ajánlat és elfogadási cutoff külön meghatározandó. **Nem történt adatbázis- vagy frontend-módosítás, LIVE érintetlen, a pontos végső ütemezés még egyeztetés alatt.**

### 2026-11-03 – TEST tömegsport Haladó szabályok + háromszintű RESET
Felhasználói igény: minden releváns jelentkezési/várólistás/lemondási/ajánlati idősáv állítható legyen globálisan és edzésenként, **a helyfelajánlás és elfogadás NE zárjon automatikusan T−120-kor**. A mezők resetelhetők legyenek gyári/globális értékre.

TEST Supabase-ben létrejött:
- `private.cc_mass_advanced_rules_v1` (GLOBAL: `GLOBAL`; EVENT: event_id JSONB override), RLS ON, nincs anon/authenticated közvetlen tábla-hozzáférés.
- `private.cc_mass_advanced_rules_audit_v1` (módosításnapló, RLS).
- `private.cc_mass_advanced_defaults_v1()`, `private.cc_mass_advanced_validate_v1(jsonb)`, `private.cc_mass_advanced_effective_v1(text)` (utóbbi VOLATILE, friss írás utáni visszaolvasáshoz).
- `public.cc_manager_mass_rules_get_v1(text)`, `public.cc_manager_mass_rules_patch_v1(text,text,jsonb)`, `public.cc_manager_mass_rules_reset_v1(text,text,text)`; Security Definer + `private.cc_manager_require_any_v1('mass.trainings','view'/'edit')`, anon EXECUTE tiltva, authenticated grant, szerepkör ellenőrzés a kódban. Per-field reset csak a megadott kulcsot távolítja el; full EVENT reset az összes egyedi felülírást eltávolítja (újra örököl), full GLOBAL reset minden globális felülírást töröl (vissza gyári). Naplózva. `null` a patchben egyetlen mező felülírását távolítja el.
- Gyári defaultok: bookingCloseMinutes=120; waitlistCloseMinutes=40; lateCancelMinutes=360; cancellationCloseMinutes=-1; offerCloseMinutes=-1; acceptCloseMinutes=-1 (−1 = nincs külön automatikus zárás); offerValidMinutes=30; lateOfferWindowMinutes=60; lateOfferValidMinutes=10; waitlistLimit=5; waitlistEnabled=true; autoOfferEnabled=true.

Manager TEST `app.js` UI:
- Edzések fejlécében a Szűrők mellett `⚙ Szabályok` → globális lenyitható panel.
- Meglévő edzés szerkesztése → `Haladó beállítások – egyedi szabályok` rész.
- Mind a 12 mező látható, az edzésben egyedi/örökölt kapcsoló, mezőnkénti reset, minden szabály reset és külön mentés.
- Globális szerkesztéskor a gyári értékkel egyező mezőhöz nem tárol fölösleges override-ot.
- Figyelmeztető UI szöveg: **ezek jelenleg konfigurációs adatok, a foglalási/waitlist/lemondási/offer backendekhez MÉG NINCSENEK bekötve**, az állítás nem változtatja meg a meglévő aktív jelentkezési szabályokat.

QA bizonyíték:
- TEST SQL synthetic: GLOBAL booking 75 perc, EVENT 20 perc -> egy mező reset GLOBAL 75; egész EVENT reset 75 és boolean globális; egész GLOBAL reset 120. `private.cc_mass_advanced_rules_v1` a végén 0 aktív override. Anon nem hívhatja a get/patch/reset RPC-t.
- GitHub TEST UI automata [run 41608095474](https://github.com/beacvolleyCC/club-control-manager/actions/runs/41608095474) SUCCESS; a forrás újabb figyelmeztető szöveggel és validált bemeneti min értékekkel frissült, a későbbi újrafutás is ellenőrizendő.
- API contract inventory `docs/architecture/CC_TEST_API_CONTRACT_INVENTORY_20261101.json` frissítve + 3 új RPC, workflow watch frissítve; [run 41608229798](https://github.com/beacvolleyCC/club-control-manager/actions/runs/41608229798) SUCCESS.

**Következő kötelező lépések**: konkrét TEST backend írós (booking, waitlist join, offer queue/next, decision, cancellation) RPC-k kössenek át az effektív szabály-resolverre; két sessionös konkurencia+időhatár QA; Manager signed-in API kör; valódi TEST Manager böngészős / iOS felületi QA; majd külön jóváhagyással LIVE. LIVE adatbázis/branch nem változott, semmilyen üzleti szabály nincs élesítve.
