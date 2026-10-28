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
