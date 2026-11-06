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

### 2026-11-03 – VNext tömegsport szabályintegráció ellenőrzése (folytatás)
- TEST `private.cc_mass_advanced_window_v1` rendelkezésre áll; külön kezeli a közvetlen foglalást (default T−120), várólistás jelentkezést (default T−40), ajánlatküldést és ajánlatelfogadást (default mindkettő -1 = külön cutoff nélkül), késői lemondást (T−360), felajánlási 30/10 perces ablakot. Az öröklési táblában jelenleg **0 aktív override rekord**.
- SQL read-only boundary smoke, 20:00 kezdés: 19:10 és 19:19 várólista nyitott; 19:20 várólista zárt. `offerOpen` és `acceptOpen` a policy-kiértékelőben mindhárom időpontban true. Ezek a policy eredményei, **nem bizonyítják a tényleges írási útvonalat**.
- Forrásból ellenőrzött: `public.cc_vnext_mass_public_book_v1`, `public.cc_vnext_mass_public_wait_v1` már használja a közös `cc_mass_advanced_window_v1` függvényt. `public.cc_vnext_mass_offer_next_v1`, `public.cc_vnext_mass_public_decide_v1`, `public.cc_vnext_mass_public_cancel_v1` még NEM használja, és régi küszöbök vannak bennük; ezeket **nem szabad késznek jelölni**.
- A megkezdett cancellation RPC migrációt az eszköz biztonsági ellenőrzése blokkolta; a korábbi körben a helyfelajánlás módosítása is blokkolva lett. Nincs bizonyított új implementáció ezekben a funkciókban, és nem volt sikeres teljes WRITE E2E / 2-session konkurencia QA.
- Hozzáférés ellenőrzött: egyik öt VNext WRITE RPC sem végrehajtható közvetlenül `anon` vagy `authenticated` szereppel. A service gatewayhez kötött jogosultság maradjon.
- Következő munkacsomag: (1) TEST offer_next kapja meg a policy offerOpen és 30/10 perc korlátját, a meglévő, külön beállítható accept cutoff mellett; (2) TEST decide accept ne örökölje T−120-at, csak a token lejáratát, az érvényes jogosultságot és az explicit acceptCloseMinutes értéket; (3) TEST cancel lateCancelMinutes és cancellationCloseMinutes szétválasztása; (4) automatikus offer expiry/next notification ütemezés és kapacitás-RLS fairness; (5) E2E és stresszteszt. Üzleti szabályt csak sikeres teszt után aktiváljunk. LIVE változatlan.

### 2026-11-03 – VNext QA-státusz API összhangba hozása a szabályokkal
- TEST SQL-migráció sikeres: `public.cc_mass_registration_status_test_v1(text)` korábbi statikus `cc_mass_registration_window_test_v1` hívása helyett immár `private.cc_mass_advanced_window_v1(e.id,now())` értékeit használja. A `bookingOpen`, `waitlistOpen`, `waitlistLimit` és státuszkód az örökölt globális/eseményszabályból érkezik. A kapacitás és aktív felajánlási fenntartás kezelése megmaradt.
- Kizárólag `CC-QA-SYNTHETIC` aktív, publikus szintetikus eseményeket enged megfigyelni; nem oldja fel a foglalási személyes adatok hozzáférését. SQL smoke: `QA-WAIT-20261111` → `bookingOpen=true`, `waitlistOpen=false`, `remaining=2`, limit 5; nem létező esemény → `EVENT_UNAVAILABLE`. A függvénytörzsben az új policy hívás utóellenőrzése true.
- Továbbra is igaz: `cc_vnext_mass_offer_next_v1`, `cc_vnext_mass_public_decide_v1`, `cc_vnext_mass_public_cancel_v1` NEM használja a szabály-resolvert. A három funkció módosítása részben hozzáférési védelmen blokkolt, nem tekinthető késznek.
- Nincs bizonyított személyes adatos végpontteszt, valódi két-session konkurens teszt, mobil/browser QA vagy LIVE release. Az aktuális publikus Worker még nem használja ezt az új aggregált TEST státuszt.

### 2026-11-03 – sürgős LIVE tömegsport részvételi számláló hotfix (külön, kifejezett engedéllyel)
A felhasználó kérte az éles Manager Sportolók nézetének javítását. LIVE Supabase `snqsxlyhontaepembaic` `public.cc_manager_mass_athletes_v1(text,text,text)` új mezők: `attended`, `noShow`, `cancelled`, `lateCancelled`, `pastUnrecorded`; `attendanceRecorded` immár csak a MEGJELENT és NEM JELENT MEG kanonikus, aktív, nem jövőbeli edzések száma. A megjelenést `count(distinct mb.event_id)` számolja edzésazonosítónként. A LIVE `main` `app.js` a sportolói listán valódi `attended`+`noShow` értéket, a sportolói adatlapján e két számot, lemondásokat, múltbeli kitöltetlen jelenlétet és külön összes jelentkezést mutat; commit `d6bd5556221c3f8f792f3de77cc1521210e3b671`. GitHub Pages LIVE deploy [run 41673886573](https://github.com/beacvolleyCC/club-control-manager/actions/runs/41673886573) SUCCESS. LIVE read-only kontroll: 1015 booking rekord, 788 MEGJELENT, 14 NEM JELENT MEG; független 263 sportolós aggregáció pontosan 788 és 14, max egyéni edzésszám 21, 92 múltbeli aktív jelentkezéshez továbbra sincs jelenlét rögzítve. A 92 nem számít automatikusan sem megjelenésnek, sem hiányzásnak. A user által megadott részvételi bejegyzések egyikét sem módosítottuk; kizárólag az aggregáló RPC és az UI változott. Az `anon` nem hívhatja a Manager RPC-t. A többi TEST/LIVE advanced-rule fejlesztés nem került LIVE-ra. Külön, nem ide tartozó `Manager competition training roster QA` workflow [run 41673888037](https://github.com/beacvolleyCC/club-control-manager/actions/runs/41673888037) FAILED egy league context/standings elvárásnál; nem érinti a mass-sport megjelenési számítás kódelérhetőségét, később vizsgálandó. Mobil PWA személyes belépéses ellenőrzése még hátravan.

### 2026-11-04 – LIVE Manager kézi jelenlétcsúszka szín hotfix
Felhasználói hibajelzés: edzés utáni kézi MEGJELENT/NEM JELENT MEG jelölés után a csúszka nem látszik egyértelműen zöldnek/pirosnak. Gyökérok a versenysportnál: a `cc-compact-roster-row.none` (eredeti RSVP) CSS szürke `!important` háttérszíne felülírta a manuálisan rögzített `cc-competition-attendance-slider.yes/no` státuszt. A meglévő JS a sikeres attendance mentéskor `is-confirmed` osztályt, `data-slider-unconfirmed="0"` értéket és a tényleges `data-slider-state`-et már beállítja. Ezt külön, erősebb és **csak megerősített jelenlétre vonatkozó CSS-sel** oldottuk meg (részletes és inline roster, light/dark). Nem megerősített RSVP-k továbbra is RSVP-előnézetek. Tömegsport attendance slider saved state CSS-színei is kontrasztosabbak (yes=zöld, no=piros, none=semleges; light/dark).
TEST `styles.css` commit `ad808833f0f51bba7464704533deaa5d9e6f2926`; `tests/manager-manual-attendance-colors.test.cjs` + `test-manual-attendance-slider-20261104.yml`: [QA run 41801348344](https://github.com/beacvolleyCC/club-control-manager/actions/runs/41801348344) SUCCESS, ugyanitt Manager TEST safety és import smoke SUCCESS.
LIVE kifejezett aktuális hibajelzés alapján `main` csak CSS commit `90d089616b3481f789c5832be758e77127025484`, majd PWA/cache CSS URL-frissítés `index.html` commit `e585d91629f6019f26202c379feaa61b5ee800e7`. A tényleges jelenléti rekordokhoz, Supabase SQL/permissionshoz nem nyúltunk. Első LIVE CSS GitHub Pages build [41801423594](https://github.com/beacvolleyCC/club-control-manager/actions/runs/41801423594) SUCCESS. Második, végleges cache-bust build [41801547022](https://github.com/beacvolleyCC/club-control-manager/actions/runs/41801547022) ellenőrzendő; ne állítsunk róla SUCCESS-t külön ellenőrzés nélkül. Nem történt belépett iPhone PWA vizuális E2E. Külön versenysportos roster QA hosszabb ideje FAIL (league context), nem kapcsolódik ehhez a CSS-hotfixhez.

**LIVE deploy utóellenőrzés (2026-11-04):** a végleges CSS cache-bust `main` commit `e585d91629f6019f26202c379feaa61b5ee800e7` GitHub Pages [run 41801547022](https://github.com/beacvolleyCC/club-control-manager/actions/runs/41801547022) mindhárom build/report/deploy jobja SUCCESS. Az élesítő workflow sikeres, bejelentkezett iOS Safari PWA megjelenítési teszt továbbra is manuálisan ellenőrizendő.

### 2026-11-04 – lezajlott edzések utólagos jelenlétszerkesztése (LIVE hotfix, külön felhasználói kérés)
A Managernek a lezajlott edzéseknél is engednie kell a „Megjelent / Nem jelent meg / Nincs rögzítve” adminisztratív állítást. Meglévő tömegsportos `openMassEventDetail` a csúszkákat már biztosította, a `cc_manager_mass_attendance_r1_v1` write RPC a megtartott edzésre nem zár le automatikusan. Két hibapont:
- `cc_manager_mass_event_detail_v1(text)` korábban csak `b.booking_status='AKTÍV'` foglalásokat hozott, így a már „NEM JELENT MEG”-nek beállított játékos eltűnt és nem lehetett visszakattintani. TEST és LIVE SQL-migráció: `coalesce(b.booking_status,'') not in ('LEMONDVA','KÉSŐN LEMONDVA')`, így a no-show (és bérletellenőrzés alatt álló) játékosok is láthatók, a lemondók külön listán maradnak. A `cc_manager_mass_attendance_snapshot_r1_v1` eddig is tartalmazta a no-show-kat. Csak olvasófunkciót módosítottunk, semmilyen jelenléti bejegyzést nem írtunk át.
- `massLegacyTrainingRow` a régi edzésnél csak egy nem szerkesztő `Névsor` gombot tett a fő lista alá. Most szerkesztési jogosultságnál és aktív, lezajlott edzésnél `Jelenlét szerkesztése` gomb nyitja a részletes eseménynézetet; a meglévő csúszkák az eddigi RPC-t és readbacket használják. A versenysportos korábbi edzéseknél a névsorgomb `Jelenlét szerkesztése` felirattal jelzi a meglévő utólagos szerkesztést. Előre megadott jelenléteket nem módosít.
TEST app commit `b77503af24468ae4ed7c89188d61272d471ea16b`, TEST CI [run 41803213668](https://github.com/beacvolleyCC/club-control-manager/actions/runs/41803213668) SUCCESS, Manager TEST PWA safety [41803213496](https://github.com/beacvolleyCC/club-control-manager/actions/runs/41803213496) SUCCESS. A funkció LIVE main UI commit `1dfc6225c99093896b9a2719fad06e132f49b78e`, PWA JS cache-bust `index.html` commit `b28688a0a7ee01abf7a6486256d04201f7b56dac`. Korábbi UI deploy [41803806992](https://github.com/beacvolleyCC/club-control-manager/actions/runs/41803806992) SUCCESS. A végső JS cache-bust Pages deploy [41803944089](https://github.com/beacvolleyCC/club-control-manager/actions/runs/41803944089) külön ellenőrizendő. LIVE RPC anon EXECUTE tiltott. Nincs bejelentkezett iOS PWA végpont-végpont teszt, azt manuálisan ellenőrizni kell.

**Végleges LIVE deploy ellenőrzés:** `b28688a0a7ee01abf7a6486256d04201f7b56dac` [Pages run 41803944089](https://github.com/beacvolleyCC/club-control-manager/actions/runs/41803944089), build/report/deploy mind SUCCESS (2026-11-04). A felhasználói iPhone PWA tesztje ettől függetlenül még szükséges.

### 2026-11-04 – LIVE tömegsport sportolók egyenkénti auditja és dátumos napló (felhasználó által kért éles javítás)
A felhasználó a Sportolók fül 2/1, 3/1 stb. jelzését hibásnak tapasztalta, és 2026.09.29-től minden sportolót kér ellenőrizni. Egyenkénti, SQL GROUP BY sportolói id audit, LIVE, read-only: 263 sportolói adatlap; 2026.09.29–11.04 között 32 lezajlott, aktív tömegsportos edzés (Kezdő 11, Középhaladó 10, Haladó 11); 504 jelentkezési rekord = 444 MEGJELENT + 8 NEM JELENT MEG + 16 AKTÍV/NINCS RÖGZÍTVE + 36 LEMONDVA/KÉSŐN LEMONDVA; 105 különböző sportolói azonosítóhoz kapcsolt tényleges részvétel, egyéni maximum 15. A 444 jelenléti jelölés mindegyikéhez létezik sportolói azonosító; 0 duplikált (athlete_id,event_id) jelentkezés; 0 aktív/inaktív esemény miatti elveszett jelölés. 51 megjelenésnél eltér a foglalásban tárolt név és az aktuális profilnév, de email egyezik, id-kapcsolat teljes. Utolsó auditban 438, az auditlogból visszaolvasható explicit attendance állapot mind megegyezett a kanonikus jelöléssel (0 eltérés); nem minden foglaláshoz volt attendance auditnapló, így ez nem teljes logrekonstrukció.
**Valós eltérési okok:** 15 azonos nevű profilcsoport, 32 adatlap; ezekből két csoportban több külön profilnak is van részvétele (összesen 8 ilyen megjelenés, például 3+1 ugyanazon névhez). Eltérő email / bizonytalan identitás miatt TILOS automatikusan összefűzni őket. 13 sportoló `totalBookings` mezőjébe jövőbeli edzés is beleszámolt, míg `attended` csak múltbeli megjelenést számol; emiatt az összes jelentkezés/részvétel összehasonlítása félrevezető lehet. A meglévő globális részvételi statisztikát nem írtuk át, az esemény-id alapú számítás így is teljes.
**TEST és LIVE új, jogosultsággal védett, csak olvasó RPC:** `public.cc_manager_mass_athlete_history_v1(p_athlete_id text)`, kizárólag `mass.athletes/view` Manager ellenőrzés után ad 2026.09.29-től eseménydátumonként összes jelenlétet/státuszt. A jövőbeli foglalás, hiányzás, lemondás és a lezajlott, nem jelölt edzés külön kategória. `anon` EXECUTE false, `authenticated` true a belső jogosultságellenőrzés mellett. Semmilyen UPDATE/DELETE a személyes bejegyzéseken.
**Manager UI:** TEST branch `app.js` és LIVE main `app.js` a Sportolók egyedi adatlapján aszinkron betölti a dátumos edzésnaplót, és figyelmeztet, ha azonos nevű más profil is szerepel; linkkel lehet átlépni a másik profilra (automatikus összevonás NINCS). A LIVE listán a részvétel „09.29. óta” jelölést kapott, az „Összes jelentkezés” sor jelzi a jövőbeli alkalmak bevonását. A PWA `index.html` app.js verziófrissítést kapott.
QA: [TEST athlete audit tests 41810782788](https://github.com/beacvolleyCC/club-control-manager/actions/runs/41810782788) SUCCESS; [TEST API contracts 41810972035](https://github.com/beacvolleyCC/club-control-manager/actions/runs/41810972035) SUCCESS, PWA safety PASS. LIVE main UI commit `50451429a36d7ebe42a7a2157b7afbc271a34943`, végleges cache-bust commit `d340a914b6f79b412f8503882dbf1d0897f65b2b`; [GitHub Pages 41811333681](https://github.com/beacvolleyCC/club-control-manager/actions/runs/41811333681) build/deploy/report ALL SUCCESS. A bejelentkezett iPhone PWA valódi RPC megjelenítési E2E-t az operátor még ellenőrizze.
**Következő külön döntés:** a 15 azonos nevű csoport közül a 2 ténylegesen megosztott részvételi csoport személyazonosságát ellenőrizni a Manager felületén, majd kizárólag bizonyíték és explicit jóváhagyás esetén közös kanonikus személyhez kapcsolni. A jelenlegi számok NEM jelentik, hogy minden sportoló részt vett az adott 32 edzésen; csak 105-nek van legalább egy `MEGJELENT` jelölése szeptember 29-től.


## 2026-11-04 – folytatási napló (LIVE ellenőrzések; TEST handover)

- **Versenysport Pénzügyek – BEAC import egyeztetés:** a felhasználó kizárólag a versenysport játékosainak bérletfizetéseit kéri egyeztetni a `mass_passes` BEAC-importtal. A már kézzel rögzített státuszokat meg kell őrizni; csak egyértelműen azonosított hiányzó befizetés írható jóvá. LIVE read-only ellenőrzésben 2026-10: 93 importrekord, 19 e-mail alapján `players`-hez párosult és mind a 19 már `paid` a `cc_player_fee_meta_v2382` táblában; 2026-11: 6/6, 2026-12: 6/6 már `paid`. A 74 októberi nem párosított rekord **nem bizonyítottan versenysportos**; nem szabad automatikusan jóváírni. További alternatív azonosítás szükséges. A `mass_athletes` tömegsportos tábla nem célterület. A fenti körben pénzügyi adatírás nem történt.
- **November 10. BEAC Női I. eseményhiba:** a `BEAC – BEAC · ELLENFÉL JAVÍTANDÓ` 19:30-as meccs `events` rekordja archivált volt, külön `cc_competition_user_schedule_v1` forrásrekordja később eltűnt. Felhasználó szerint a Playerben eltűnt a meccs, Managerben még látszott; utóbb a Managerben kézzel lemondta. Az aktív 20:00–22:00 `Edzés` rekord létezik (`326855bc-f135-41d2-aaa3-ced97f193528`), de sem Managerben, sem Playerben nem látszott. Korábbi 14 RSVP és későbbi 0 availability eredmény között ellentmondás van: újraellenőrizendő, semmiképp ne feltételezzük megőrzöttnek. A Manager `cc_manager_events_v1` RPC csak `cancelled` státuszt szűr ki, `archived`-et nem. Ellenőrizni kell a lemondás és a megjelenítés aktuális állapotát.
- **CC V2 követelmény:** egységes eseményobjektum és egyetlen eseményazonosító; szabad típusváltás edzés/meccs/torna/egyéb között; RSVP/jelenlét megőrzése; Manager/Player azonos adatforrás; szerkesztés, visszavonás, audit, konzisztens archiválás, statisztika.
- **Edzésrészvételi statisztika:** 2026-09-29-től számolni; a megtartott csapatedzések legyenek a nevezők, nem az RSVP rekordok. 2026-11-04 read-only LIVE lekérdezés: Férfi 9, Női I. 8, Női II. 8 aktív, múltbeli edzés; 14 jelenlétjelölés hiányzott az összesített `availability` rekordokból. Figyelembe kell venni a csapattagság kezdetét, lemondásokat és a manuális jelenlét elsőbbségét. Nincs automatikus adatátírás.
- **Munkafegyelem:** minden munkakör után handover frissítése, külön TEST/LIVE státusszal és ellenőrzési eredménnyel. LIVE módosítás csak kifejezett felhatalmazással, ellenőrzéssel.

- **2026-11-04 kiegészítő versenybérlet-audit:** `mass_passes.product ILIKE '%verseny%'` alapján 2026-09: 39 import, 33 `players` email egyezés és mind a 33 `cc_player_fee_meta_v2382` `paid`; 2026-10: 20/19/19; 2026-11: 6/6/6; 2026-12: 6/6/6. Összesen 71 importált versenybérlet, 64 játékoshoz kötött és fizetett, 7 párosítatlan vásárlás 6 különböző e-mail-címhez (6 szeptember, 1 október). A 7 egyikénél sincs `player_email` + hónap alapján pénzügyi meta-egyezés. Azonosítás és csapattagság ellenőrzése szükséges, nem szabad ismeretlen játékosra jóváírni. Adatírás nem történt.


### 2026-11-04 LIVE versenybérlet egyeztetés — végrehajtva
- BEAC-import: 71 versenybérlet vásárlás, ebből 2 nem versenyző téves vásárlása (Sztanojev Flóra, Ezgi Bükelek); import rekordok megőrizve, nem kerültek versenyzőhöz.
- 5 vásárlás egyértelműen azonosítva eltérő vásárlói e-mail alapján: Ferenc Petra Alexandra 2026-09; Bus Krisztina Katalin 2026-09 és 2026-10; Kolba Kata 2026-09; Papp Laura Dorottya 2026-09.
- LIVE Supabase `snqsxlyhontaepembaic`, `cc_player_fee_meta_v2382`: 4 meglévő szeptemberi `beac_pass` due→paid; Bus Krisztina 2026-10 új `beac_pass` paid (id 1484). Öt státusz visszaellenőrizve SELECT-tel.
- Kolba Kata helyes aktuális mezszáma 23 (felhasználó megerősítette); nem kellett módosítani.
- Más pénzügyi tételekhez, tömegsporthoz, két téves vásárláshoz nem nyúltunk. A `paid_at` mező a négy korábbi sorban nem lett feltöltve, mert a vásárlás tényleges időpontját külön kellene leképezni; nem állítjuk, hogy ezt pótoltuk.


### 2026-11-04 részvételi statisztika audit — folyamatban, csak olvasás
- Következő prioritás: Manager versenyedzés-részvételi statisztika, kezdő dátum 2026-09-29; manuális `availability.attendance_status` elsőbbség, jelöletlen nem automatikus hiányzás, törölt események kizárásának ellenőrzése.
- LIVE olvasási lekérdezés: 2026-09-29 és aktuális idő között `events` training active 25 esemény / 357 availability rekord / 343 jelölt attendance; training cancelled 9 esemény / 44 rekord / 16 jelölt attendance. Match active 6, cancelled 3; ezeket nem szabad edzésstatisztikába keverni.
- Ezen körben semmilyen attendance vagy esemény LIVE adatot nem módosítottunk. Következő lépés: játékosonkénti számláló és forráskód képlet ellenőrzése, törölt események/hiányzó availability kezelése, TEST fix és QA.


### 2026-11-04 folytatás: BEAC-import V2 és jelenléti forrásellenőrzés
- V2 Manager → Pénzügyek → BEAC-import: Excel-sorok beillesztése és XLSX/CSV feltöltés, előnézet, név/e-mail/korábban jóváhagyott alias alapján párosítás, hónap és termék felismerése, duplikációvédelem, kivételek manuális jóváhagyása, auditált könyvelés; eredeti Excel maradhat átmeneti forrásként. Ez követelmény, nem implementált funkció.
- LIVE read-only: `availability` külön `status` (RSVP) és `attendance_status` (present/absent) mezőt tartalmaz; globálisan 25 `unknown`+`present`, 2 `going`+`absent` rekord. Ezek teljes adatbázisra vonatkozó számok, nem kizárólag 2026-09-29 utáni edzések.
- 2026-09-29 utáni training eseményeknél több azonos napon, azonos csapatnál aktív/törölt pár található (pl. 2026-10-12, 10-13, 10-16, 10-30). Az aktív 25 esemény teljes időszaki száma, nem csapatonkénti; azonos nap eseményazonosító alapján kezelendő, a törölt események jelenléte nem számolható automatikusan.
- Semmilyen LIVE jelenléti adat nem változott; a pontos játékosonkénti nevező és a frontend számlálás vizsgálata következik TEST-ben.


### 2026-11-04 elfogadott jelenléti automatizálási szabály (TERV, még nincs implementálva)
- Budapest helyi idő szerint az edzés napjának végén, 00:00-kor feldolgozás: csak ténylegesen lezajlott, `events.status='active'`, `event_type='training'` események; `cancelled` eseményeket teljesen kihagyni, akár van rajtuk RSVP/jelenlét.
- Ha `availability.status='going'` és `attendance_status IS NULL`, automatikusan `present` (automatikus eredet auditálása, idempotens feldolgozás).
- Már manuálisan megjelölt `present`/`absent` rekordot tilos felülírni.
- `not_going` vagy `unknown` és jelöletlen jelenlét továbbra is ellenőrizetlen; az adott edzéshez rendelt edző(k) kapjanak értesítést a hiányzó jelenléti ellenőrzésről; deduplikált értesítés és megfelelő jogosultságkezelés szükséges.
- Edzés után és az automatikus feldolgozást követően is lehessen a Managerben utólag javítani a jelenlétet; a statisztika frissüljön azonnal. Automatikus és manuális módosítások auditálása.
- Időzítés, edző-hozzárendelés, notification pipeline, idempotencia és TEST QA megvalósítandó; LIVE-ba csak külön jóváhagyott, ellenőrzött patch kerülhet.


### 2026-11-04 TEST implementation — attendance autofill phase 1
- TEST Supabase `szzoubvhlwnojtzqjebc` ONLY: created schema `cc_internal`, function `cc_internal.autofill_training_attendance(p_day date)` as SECURITY INVOKER, search_path empty, no public/anon/authenticated execute grants.
- Updates `availability.attendance_status` to `present` only for `going`, unmarked, completed, `events.status='active'`, `event_type='training'`, on supplied Budapest local calendar date. Sets `attendance_marked_by='system:midnight-autofill'`, timestamp, writes `attendance_change_audit`. Does not touch manual status, cancelled events, neutral/no RSVP. Date-specific and idempotent for already processed rows.
- Function existence checked, no pending eligible historical TEST rows. This is NOT a running midnight scheduler. `pg_cron`/`pg_net` not present in TEST extension list; scheduler and coach reminder still TODO. No LIVE changes. Next: add scheduler with Budapest DST-aware date boundary, coach identity/notification routing, synthetic fixture test and UI readback before LIVE proposal.


### 2026-11-04 Hunvolley/MRSZ játékosazonosító — elfogadott követelmény, még nincs implementálva
- A versenyzők Manager játékosadatlapján külön Hunvolley/MRSZ játékoskód mező szükséges; nem azonos a CC `players.id` UUID-val és nem helyettesíti azt.
- Jegyzőkönyvek későbbi feldolgozásakor az igazolási/játékosazonosító kódokat ki kell olvasni, ellenőrzött név/csapat egyeztetéssel a helyes játékoshoz rendelni; bizonytalan egyezés manuális jóváhagyásra kerül. Mezszám nem elsődleges azonosító.
- Tárolandó a kód forrása és az egyeztetés státusza, elkerülendő a hibás automatikus párosítás. Később játékosadatlapról a megfelelő Hunvolley-profilra navigáció, kizárólag ellenőrzött URL-sémával.
- Elsőként TEST adatmodell és Manager UI, ellenőrzés után LIVE. Most csak handover-követelmény került rögzítésre.


### 2026-11-04 TEST follow-up — scheduler feasibility and smoke test
- Supabase docs checked: Cron requires `pg_cron` extension. TEST `pg_available_extensions` query yielded no `pg_cron` entry; neither installed nor available in returned list. Do not claim an active midnight job.
- Executed `select cc_internal.autofill_training_attendance((now() at time zone 'Europe/Budapest')::date)` on TEST: returned `updated_today=0`. This verifies callable function and no eligible current-day rows, NOT a positive-path synthetic fixture test.
- Existing `player_push_outbox` exists, but coach identity mapping to `players.id` and notification routing not verified; no reminder messages have been inserted. Need identify coach recipient mapping and choose scheduler/deployment mechanism. LIVE untouched.


### 2026-11-04 TEST midnight attendance follow-up
- Added docs/implementation/attendance-midnight-test-plan.md (commit 6da397a).
- Added docs/implementation/attendance-midnight-test.sql (commit 0cfdabb). SQL stages an hourly UTC cron tick guarded by Budapest local midnight, then calls existing TEST autofill for previous local day. It has NOT been applied or scheduled.
- TEST coach assignment table is empty. Do not send reminders until recipient mapping is validated. No LIVE change.


### 2026-11-04 22:19 TEST attendance midnight scheduler ACTIVATED
- TEST Supabase `szzoubvhlwnojtzqjebc`: migration `attendance_midnight_tick_test` installed `cc_internal.attendance_midnight_tick()`; smoke test at 22:19 Budapest returned `updated_count=0` as expected outside midnight.
- Enabled `pg_cron` in TEST with migration `enable_test_pg_cron_for_attendance`. Created `cron.schedule('cc-test-attendance-midnight','5 * * * *','select cc_internal.attendance_midnight_tick()')`, job ID 1. Verified `cron.job`: active=true, schedule `5 * * * *`.
- Hourly UTC cron tick is gated by Budapest local hour 00, processing previous local day once at 00:05. `autofill_training_attendance` only updates active completed trainings, going/unmarked attendance and logs audit; manual status retained.
- First real midnight cron execution and positive-path synthetic fixture still need verification; coach recipient mapping and reminders not implemented. LIVE untouched.

### 2026-11-05 – TEST competition attendance aggregate fixed and cron verified
- TEST Supabase `szzoubvhlwnojtzqjebc`: `public.cc_manager_players_v2` replaced in-place via SQL, preserving the original function and access checks. The `availability` → `events` join now requires `e.status='active'`, `e.starts_at >= '2026-09-29T00:00:00+02'::timestamptz`, `e.ends_at <= now()`. Applies to training and match counters, which remain separate. Does not edit availability rows.
- Post-deployment inspection confirmed all three conditions in the installed function. No authenticated Manager end-to-end UI test yet.
- `cron.job_run_details` job 1 shows `succeeded` at 2026-11-04 23:05 UTC (= Nov 5 00:05 Budapest), and again at 00:05 UTC; this confirms scheduling and SQL execution, not positive-path autofill effects. Coach notification mapping/dispatch still pending.
- LIVE unchanged. SQL Editor manual cron check no longer required merely to establish scheduler execution.

### 2026-11-05 – TEST midnight attendance transactional positive-path QA; coach routing audit; LIVE read-only
- Ran TEST SQL inside `BEGIN; DO ...; ROLLBACK;` using a preexisting training/RSVP row as temporary fixture. Assertions in transaction: first autofill returns exactly 1; repeated autofill returns 0; exactly one matching audit entry; manual `absent` override survives subsequent autofill. SQL completed without exception. Post-rollback audit count remains 0. No lasting changes to existing attendance/events.
- TEST pending attendance on past active training RSVP rows: 12 (this includes statuses other than `going`); existing autofill eligible `going`/unmarked rows: 0 at earlier check.
- Coach notification **not delivered / not implemented**: `cc_coach_event_availability_v1` contains 0 rows, and TEST has 1 manager account; no reliable coach→manager recipient mapping. Do not guess a recipient or send notifications until mapping and dedupe are implemented.
- LIVE read-only: 166 active training events since 2026-09-29 (includes future), 345 explicitly marked attendance rows for active trainings in that period. These totals are not unique completed sessions and do not establish correctness of every player statistic. No LIVE write.

### 2026-11-05 – TEST coach missing-attendance infrastructure
- Created `cc_internal.pending_training_attendance` SECURITY INVOKER view for completed active trainings from 2026-09-29 with unmarked attendance, including unrecorded going count. TEST returned 6 affected events.
- Created private `cc_internal.training_attendance_coach_recipients` table with explicit team_id→manager_id FK mapping, active flag and unique composite PK. It intentionally has 0 rows; do not guess a coach from the sole manager account. No notifications dispatched.
- Next: verified coach assignments, notification dedupe/outbox design and delivery tests, then Manager/Player integration. LIVE unchanged.


### 2026-11-05 – TEST structured match sheets and LIVE first-player login
- LIVE Player first-time OTP: existing Manager player creation `cc_manager_player_create_v1` inserts `players` and `team_memberships` but not an `auth.users` account. LIVE migration `live_player_first_login_eligible_claim_20261105` added `cc_player_email_eligible_v1` and `cc_player_claim_identity_v1`; Player main commits `bf006d9939350f5b736da5b82469622c954d57cf` and `e7c625d2801e3d6e99fae31034e0f15600022190` enabled first-time confirmation and Auth link. User confirmed the new player logged in. NOTE: email confirmation on first signup is not yet the same UX as returning-player OTP; do not assume auth-flow unification is complete. Preserve installed PWA URL and data.
- TEST migration `cc_match_documents_live_timeline_foundation_20261105`: created `cc_match_documents_v1`, `cc_match_document_facts_v1`, `cc_match_live_events_v1`; checked presence; all RLS-enabled and no direct anon/authenticated grants.
- Decision: no PDF duplication needed. Official scoresheet opens via per-match HunVolley URL. Supabase stores structured simplified scoresheet; official API integration pending contact with HunVolley. Existing PDF document tables are provisional, not a mandate to store PDFs.
- TEST migration `cc_structured_match_sheet_v1_20261105`: created `cc_match_sheets_v1`, `cc_match_sheet_roster_v1`, `cc_match_sheet_sets_v1`, `cc_match_sheet_revisions_v1`; verified all four exist, RLS enabled and no direct anon/authenticated table grants. All reference existing `events.id`; LIVE untouched.
- Architecture decision: one canonical Supabase data model and shared permissioned RPC/API contracts for Manager/Player; Supabase Realtime as invalidation signal followed by canonical refetch; refresh on reconnection and launch. Scoresheet, score, standings and statistics should use common authoritative facts rather than separate local copies. Do not promise instant updates when offline.
- Next: TEST secure read/write RPCs with manager/team authorization, revision transaction and explicit published/read-only player projection; verify existing Manager permissions before granting access. Then UI integration, external URL validation and realtime QA. Update this handover every work round.

### 2026-11-05 – TEST canonical match-sheet read RPC
- Applied TEST migration `cc_manager_match_sheet_read_v1_20261105`. New SECURITY DEFINER RPC `public.cc_manager_match_sheet_read_v1(p_event_id uuid)` resolves `events.team_id`, checks `private.cc_manager_can_v1('competition.players','edit',team_id)` and returns sheet, roster and sets as one JSON object. Granted EXECUTE to authenticated only; no anon execute. Verified function exists, SECURITY DEFINER enabled, authenticated execute granted.
- Caution: `competition.players/edit` is a provisional existing permission, not a finalized match-sheet permission. Need validate scope with real Manager roles and add dedicated competition.match-sheet permission if appropriate before UI exposure. No functional user-session authorization QA yet. LIVE untouched.
- Next: design atomic validated write RPC with revision/audit, confirm event-to-team mapping, read-only Player projection and realtime invalidation. Do not grant direct table access.

### 2026-11-05 – TEST match sheet metadata write RPC
- Applied `cc_manager_match_sheet_metadata_save_v1_20261105`: `public.cc_manager_match_sheet_save_v1(event_id,payload,expected_updated_at)` writes match-sheet metadata and HunVolley URL only, rejects roster/sets in payload, validates status and HTTPS URL, uses existing `private.cc_manager_can_v1('competition.players','edit',team_id)` provisional permission, advisory transaction lock, optimistic concurrency check and append-only `cc_match_sheet_revisions_v1` snapshot in same transaction. Granted authenticated execute; revoked anon/public; function presence/SECURITY DEFINER/grant verified.
- Important limitations: not tested with a real Manager session, does not yet save roster/sets, does not yet validate HunVolley hostname (only HTTPS), does not enforce dedicated match-sheet permission, and does not publish Realtime updates to clients. No LIVE writes. Next: transaction/permission test, stronger input constraints, roster/sets write RPC, dedicated permission and Player read model.

### 2026-11-05 – TEST match sheet write RPCs
- Migration `cc_manager_match_sheet_metadata_save_v1_20261105` created `public.cc_manager_match_sheet_save_v1(event_id,payload,expected_updated_at)`: metadata-only upsert, optimistic concurrency, serialized event lock, revision before/after snapshot, existing `competition.players/edit` team permission. Verified SECURITY DEFINER, authenticated EXECUTE, anon denied.
- Migration `cc_match_sheet_sets_atomic_save_20261105` created `public.cc_manager_match_sheet_sets_save_v1(event_id,sets,expected_updated_at)`: checks permission, existing sheet, concurrency, set number uniqueness/range, points bounds and lineup JSON array shape; replaces set rows atomically, bumps sheet timestamp, logs revision. Verified function exists, authenticated EXECUTE, anon denied.
- NOT YET end-to-end tested with actual manager session; do not claim full validation. Roster save, player read projection, dedicated match-sheet permission and realtime still pending. LIVE untouched.

### 2026-11-05 – TEST roster save verified after interrupted call
- Confirmed `public.cc_manager_match_sheet_roster_save_v1` exists despite previous interrupted response. Verified SECURITY DEFINER, authenticated EXECUTE yes, anon EXECUTE no, transaction advisory lock and revision table reference. Do not reapply blindly.
- Still requires real-session functional test, input validation review (including jersey uniqueness, player-team affiliation, boolean/JSON types), dedicated permission and integration tests. LIVE unchanged.

### 2026-11-05 – TEST roster validation review
- Inspected actual definition of `cc_manager_match_sheet_roster_save_v1`; gaps: missing strict jersey/flag input validation and local player/team affiliation checks. Existing unique(event_id,side,jersey_no) protects duplicate nonnull jerseys at DB level.
- Added TEST helper `public.cc_match_roster_validate_v1(jsonb)` with array length, side/name, jersey bounds/uniqueness, and boolean flag checks. Revoked execute from anon/authenticated. Positive SQL validation test passed.
- IMPORTANT: helper is NOT YET WIRED into roster save RPC; do not claim the existing write endpoint is hardened. Need integrate helper into save RPC, validate player references/team membership, test negative cases and real manager session. LIVE unchanged.

### 2026-11-05 – TEST roster validation wired and database guard
- Migration `cc_match_roster_database_guard_20261105`: row-level trigger on `cc_match_sheet_roster_v1` checks player name, jersey range and internal player_id membership in the event's active team. NOTE external opponents should have NULL internal player_id.
- Migration `cc_roster_validation_bridge_20261105`: private-to-clients helper bridge, no client EXECUTE grant.
- Migration `cc_roster_save_wire_validation_20261105`: integrated `cc_match_roster_validate_v1(p_roster)` into roster save RPC. Verified definition includes validator call.
- Still open: real Manager auth/permission tests, invalid payload and rollback tests, read-after-write and concurrency tests, full player/team/date affiliation edge cases, final dedicated match-sheet permission. No user data changed and LIVE untouched.

### 2026-11-05 – TEST negative validator QA and permission grants
- Verified four match sheet Manager RPCs (`read`, metadata save, sets save, roster save): authenticated EXECUTE true, anon EXECUTE false.
- Ran SQL negative validator checks with exception assertions: duplicate home jersey, empty player name, nonboolean libero flag, jersey 1000 all correctly rejected. No match data modified.
- Remaining: real Manager session permissions, full create/save/read/update/revision/concurrency test; TEST Manager UI is not yet wired to these new RPCs, so browser-only UI testing is not yet possible. Need dedicated TEST-only QA route or safe authenticated RPC invocation without exposing credentials. LIVE unchanged.

### 2026-11-06 – TEST match-sheet permission correction
- Applied TEST migration `cc_match_sheet_use_matches_permissions_20261106`: four match-sheet Manager RPCs (read, metadata save, roster save, sets save) now authorize with `competition.matches` instead of `competition.players`. Verified all four function definitions contain new key and no old key.
- TEST match-sheet tables currently empty (0 sheets, 0 roster, 0 sets); TEST events contain dedicated MINTA matches suitable for isolated QA.
- Not yet completed: authenticated per-manager positive/negative permission QA; full RPC save/read/revision/concurrency QA; Manager/Player UI wiring. No LIVE changes.

### 2026-11-06 – TEST isolated database roundtrip smoke test
- Ran a single SQL transaction against MINTA match `30000000-0000-4000-8000-000000000006`: inserted sheet, roster row, set row and revision row, then asserted roster and set rows readable.
- Deliberately raised `EXPECTED_QA_ROLLBACK` to abort the transaction. Tool surfaced expected SQL error; verified separately that all four match-sheet tables remain at zero rows (sheet/roster/sets/revisions). No persistent test data.
- This proves basic table-level write/read and rollback, NOT Manager authenticated RPC roundtrip, authorization, concurrency or UI integration. All remain open. LIVE unchanged.

### 2026-11-06 – TEST match sheet read view permission
- Applied migration `cc_match_sheet_read_view_access_20261106`: `cc_manager_match_sheet_read_v1` now checks `private.cc_manager_can_v1('competition.matches','view',event.team_id)` rather than edit; write RPCs still check edit.
- Verified read RPC function definition contains view check; authenticated EXECUTE yes, anon EXECUTE no.
- Still open: true authenticated role/team positive-negative tests; complete RPC save/read/revisions/conflicts; Manager/Player TEST UI integration. LIVE untouched.

### 2026-11-06 – TEST real-auth prerequisite audit
- Inspected `private.cc_manager_current_account_v1`: requires auth.uid(), JWT email, active manager_accounts row with matching auth_user_id and email. No synthetic SQL session should be presented as real user authentication.
- Confirmed only ONE active TEST manager account has auth_user_id linked; `competition.matches` currently has one can_view and one can_edit permission entry (same entry possible). Cannot yet establish distinct real manager role/team positive/negative QA.
- Need second isolated TEST Manager Auth identity and explicit permission assignment, then authenticated read/write/deny tests. Preserve existing permissions. Manager/Player UI not yet wired; LIVE unchanged.

### 2026-11-06 – TEST unauthenticated match-sheet RPC negative checks
- Executed `cc_manager_match_sheet_read_v1` with no Manager Auth session and asserted SQLSTATE 42501; passed.
- Executed `cc_manager_match_sheet_roster_save_v1` with no Manager Auth session and asserted SQLSTATE 42501; passed. No data changes.
- Existing TEST manager linkage count remains one. Full positive authenticated API roundtrip and UI integration still open.
- Attempted to inspect GitHub TEST branch root `package.json`, received 404; repository layout needs discovery before any UI changes. LIVE unchanged.

### 2026-11-06 – Manager TEST frontend repository structure discovered
- GitHub TEST branch root contains `index.html`, `app.js`, `config.js`, `styles.css` and supporting vanilla JS files, not root `package.json`; previous 404 was not repository failure.
- `index.html` loads config, volleyball-core/ui, competition-context-catalog, scoreboard, app.js. `app.js` is large (~584KB), so UI integration needs focused inspection.
- IMPORTANT: committed `config.js` currently sets `DATA_MODE:'demo'`, `SUPABASE_URL:''`, `SUPABASE_PUBLISHABLE_KEY:''` despite TEST CSP listing TEST Supabase origin. Do not assume the deployed Manager TEST actually uses authenticated Supabase API without checking runtime config/overrides. Do not put secrets in repo. LIVE unchanged.
- Remaining: inspect app.js auth/runtime configuration and actual deployed TEST behavior; then safe isolated match-sheet UI integration and authenticated RPC QA.

### 2026-11-06 – TEST match-sheet complete RPC transaction QA
- On TEST Supabase only, used the existing linked Manager account identity in transaction-local simulated `request.jwt.claims` / `request.jwt.claim.sub` (NOT a real authenticated browser/API session).
- Exercised `cc_manager_match_sheet_save_v1` -> `cc_manager_match_sheet_roster_save_v1` -> `cc_manager_match_sheet_sets_save_v1` -> `cc_manager_match_sheet_read_v1` on MINTA event `30000000-0000-4000-8000-000000000006`.
- Assertions passed: 1 roster row, 1 set, exactly 3 revisions, stale updatedAt rejected with SQLSTATE 40001.
- Deliberate `EXPECTED_QA_ROLLBACK` inside nested exception block rolled back all writes. Post-test direct counts: sheets=0, roster=0, sets=0, revisions=0.
- This is simulated JWT context via SQL, not end-to-end browser/API authentication. Need actual TEST deployed config and browser auth test before UI integration is considered validated. LIVE unchanged.
