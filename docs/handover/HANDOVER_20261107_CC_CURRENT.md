# Club Control – aktuális handover (2026-11-07)

## Kötelező folyamat
Minden érdemi kód-, DB-, konfiguráció-, PR-, teszt-, deploy- vagy státuszváltoztatás után ugyanabban a munkakörben frissítendő ez a handover és a HANDOVER_CURRENT.md mutató. A beszélgetés hosszának növekedéséről időben figyelmeztetni kell a felhasználót, és új beszélgetéshez CC-FOLYTATÁS összefoglalót kell készíteni.

## Ellenőrzött állapot (GitHub)
- Manager main alkalmazáskód: 8d58d29cfdbb78fdd7741dfe939708bac5e2612a; ezt követő dokumentációs commit: 3bd4991da751a3758ff2c3cee29e367aaa3219bc.
- Manager #85: BEAC import/bérletszám egyeztetés és auditált korrekció, MERGED, e059a31e. Bejelentkezett LIVE UI + valós DB audit readback még nincs hitelesítve.
- Manager #87: múltbeli edzések legújabb elöl, kézi pénzügyi dátum ma (null/1970 javítás), MERGED, 8d58d29c. A LIVE Cloudflare deployment státuszát külön kell ellenőrizni; GitHub commit önmagában nem bizonyítja.
- Manager #86: kompakt jelentkezéssorban nincs BEAC részlet; lenyitva részletek és javítógombok; eltérésnél !. OPEN, NEM LIVE, branch fix/20261106-mass-roster-details-only, head 1037d502b6ac7649a53e6ad6cbd0904697c417ae. A main közben változott; újraalapozás, diff és regressziós QA szükséges merge előtt.
- Ismert korábbi versenysportos névsor teszthiba; ne tulajdonítsuk a #85/#87 hotfixnek, de izoláljuk és javítsuk.
- Manager #79 2026/27 meccsek és hivatalos jegyzőkönyvek kombinált RC, DRAFT; Player #28 kapcsolódó statisztika/menetrend QA DRAFT. Nem élesek.
- Manager #80 biztonsági ACL, #77 explicit grants, #78 handover, #74/#75/#76 további draftok; semmit nem szabad automatikusan összevonni.

## Következő végrehajtási terv
1. READ-ONLY: Manager main / #86 diff és CI; a main új commitjaihoz igazítás; célzott névsor teszt és meglévő versenysportos teszthiba okának izolálása.
2. LIVE kiadás előtt: #86 target QA, teljes regresszió, Cloudflare/Pages build+deploy ellenőrzés, PWA cache és rollback. Bejelentkezett tömegsportos részletes névsor megjelenítésének manuális ellenőrzése.
3. Valós BEAC-bérlet számkorrekció csak kiválasztott, engedélyezett tesztrekordon, előtte/utána SELECT, auditnapló, és visszaolvasás. LIVE rekordot véletlenszerűen nem írunk át.
4. TEST: játékosok/edzések/meccsek/jelentkezések egységes forrásának inventoryja, schema/RPC/RLS és Manager/Player contract-mátrix; a tesztadatokat és az elkülönítést igazolni kell.
5. TEST modulátírás sorrendje: (a) auth/jogosultság csapatszinten; (b) edzések + RSVP + jelenlét + automatikus éjféli feldolgozás; (c) bérlet/pénzügyek; (d) meccsek + jegyzőkönyv + eredmények; (e) tabella + statisztika; (f) naptár/push. Minden modulhoz DB migráció, idempotens RPC, RLS, UI, integrációs és rollback teszt.
6. Kiadási kapu: TEST-en sikeres kétirányú mentés-visszaolvasás, jogosult/nem jogosult auth, iPhone PWA, 11 pontos duplán futtatott QA, LIVE előtt explicit döntés.

## Kockázatok és korlátok
- TEST és LIVE DB-t, Workers-t és cache-t ne keverjük; LIVE írás csak külön engedéllyel.
- A PR-ok merge-je nem egyenlő telepítési vagy valódi felületi sikerrel.
- A különböző bajnoki osztályok, női/férfi csapatok és MRSZ azonosítók nem vonhatók össze találgatással.
- Jelen dokumentum csak státusz- és előkészítési frissítés; nem bizonyít új tesztfutást, adatbázis-írást vagy deployt.

## Következő indító kulcs
CC-FOLYTATÁS – olvasd a HANDOVER_CURRENT.md-t és ezt a 2026-11-07-es átadást; kezdj #86 read-only diff/CI és TEST schema/contract inventory ellenőrzéssel.

## 2026-11-07 – négyfeladatos párhuzamos READ-ONLY vizsgálat
- Supabase projektek azonosítva: LIVE `snqsxlyhontaepembaic`, TEST `szzoubvhlwnojtzqjebc`; mindkettő ACTIVE_HEALTHY. Azonos nevű projektet ne tévesszünk össze.
- TEST-ben `manager_accounts` 1, `manager_module_permissions` 14, `teams` 3, `players` 19, `events` 12, `availability` 69, `mass_bookings` 1, `mass_passes` 0, `mass_live_write_audit` 0 (list_tables becslések). LIVE-ban `manager_accounts` 0, `manager_module_permissions` 0, `players` 47, `availability` 879, `mass_bookings` 1061, `mass_passes` 363, `mass_live_write_audit` 1552. Az eltérés kritikus: a TEST nem reprezentálja a LIVE tömegsportos bérlet-/jelentkezés-forgalmat; a TEST #86 teljes end-to-end QA-hoz kontrollált fixture kell.
- TEST-ben megtalálható `cc_manager_mass_booking_pass_number_set_v1(p_booking_id text,p_pass_number text,p_reason text)` és `cc_manager_mass_event_detail_v1`; LIVE-ban a bérlet-/audit táblák léteznek. A DB-függvények tényleges definíciója, grants és auth-policy még részletes ellenőrzést igényel. A vizsgált publikus Manager RPC-k többsége SECURITY DEFINER: jogosultság- és EXECUTE-audit kiemelten fontos.
- A #86 GitHub PR OPEN, `mergeable:false` értékkel érkezett; head `1037d502b6ac7649a53e6ad6cbd0904697c417ae`, base `e059a31e`. A main azóta változott. Nincs bizonyított merge-kész állapot, célzott teszt vagy sikeres deploy; emiatt **nem történt LIVE merge**.
- A korábbi versenysportos teszthiba pontos fájlja és reprodukciója még nincs azonosítva, ezért nem jelölhető javítottnak.
- A BEAC audit adatforrás ellenőrzése metaadat- és oszlopvizsgálat volt, **nem valós mentés–visszaolvasás teszt**; sem LIVE, sem TEST adatsort nem módosítottunk.
- Következő: #86 diff és célzott CI + régi teszt izolálás; TEST fixture előkészítése külön izolált rekordokkal; auth/RPC grant és audit payload kulcsok ellenőrzése; csak ezután kiadási döntés.

## 2026-11-07 – #86 divergens ág és bérletszám-RPC audit
- GitHub compare: #86 branch a mainhez képest **diverged**, 4 commit előtte, 5 mögötte; merge-base e059a31e. A PR saját diffje az eredeti base-hez képest `app.js`, `index.html`, `sw.js` fájlokat érinti. A jelenlegi mainhez rebase/merge-konfliktus vizsgálat és új QA szükséges; **nincs élesítés**.
- `cc_manager_mass_booking_pass_number_set_v1` definíciót mindkét DB-ben lekérdeztük: `SECURITY DEFINER`, üres search_path; a művelet `private.cc_manager_require_any_v1('mass.trainings','edit')` jogosultságot követel; a bérletszámot 1–100 karakterre és a reason mezőt manual/beac_import értékre korlátozza; lemondott foglalást tilt; sorzárral UPDATE-eli a bookingot, majd audit rekordot ír a korábbi/új passNumber és reason adatokkal.
- RPC EXECUTE: `anon=false`, `authenticated=true` mindkét DB-ben; ez nem helyettesíti a belső permission helper hitelesített vizsgálatát.
- Környezeti eltérés: TEST audit operation `test.booking_pass_number_set`, LIVE `live.booking_pass_number_set`. A definíciók ezt a különbséget szándékosan tartalmazzák. A LIVE manager_accounts becsült 0 sora miatt a jogosultságellenőrzés felhasználói tesztje különösen fontos.
- A vizsgálat kizárólag SELECT/metadata volt; tényleges passNumber mentés, audit INSERT, UI teszt és deploy **nem történt**.

## 2026-11-07 – pontos SQL COUNT korrekció
- A `list_tables` rows mező **becslés**, nem használható jogosultsági táblák tényleges ürességének bizonyítására. Közvetlen `COUNT(*)` alapján: LIVE manager_accounts=3, manager_module_permissions=27, mass_bookings=1061, mass_passes=363; TEST manager_accounts=1, manager_module_permissions=14, mass_bookings=1, mass_passes=0.
- A `mass_live_write_audit` táblában `operation LIKE '%booking_pass_number_set%'` feltétellel LIVE=0, TEST=0 rekord. Ez nem bizonyítja, hogy a bérletszám RPC hibás; csak azt, hogy ezen a néven nincs rögzített tényleges javítási audit. A valódi mentés tesztje hátravan.
- Korábbi 0 LIVE Manager-fiók/jogosultság következtetés **téves**, a fenti pontos számok felülírják.
- #86 ág mainhez képest eltérő; alkalmazáskód merge és deploy továbbra sem történt. A #86-os app.js változás és a #87-es történeti rendezés ugyanazon fájlt érinti, ezért a mainre történő egyszerű fájlfelülírás tilos.

## 2026-11-07 – TEST integrációs ág létrehozva
- A `test/20261107-pr86-integration-qa` ág létrejött a mainről; QA kapu dokumentum: `docs/qa/PR86_TEST_INTEGRATION_GATE_20261107.md`, commit `36cd98e830384fd4c0ac98d9f91df6184bd1c6e5`. Ez elkülönített TEST-előkészítés, **nem** #86 kódösszevezetés és **nem** LIVE deploy.
- Ellenőrizve: a main és #86 `app.js` különbsége a múltbeli edzésrendezésnél már az állapotobjektumban kezdődik; index.html és sw.js cache-verzió is eltér. A fájlok teljes felülírása nem elfogadható.
- Következő: célzott hunk-átültetés az integrációs ágra, kódszintű regresszió, majd TEST autentikált UI ellenőrzés; a régi versenysportos teszt külön izolálandó.

## 2026-11-07 – #86 kódösszevezetés ténylegesen elkészült a TEST integrációs ágon
- Ág: `test/20261107-pr86-integration-qa`. A #86 base→head `app.js` diffje pontosan **1 megváltozott sor** (2205); az eredeti sor egyetlen egyezéssel megtalálható volt a mainből származó TEST-ágban, ezért célzottan átemeltük. Commit: `7f780e36e3f8f4dd1a53d6dd95a578e16d94da96`.
- `index.html` PWA app.js cache query frissült: `da78ada209bf83ccdcd9f0176366e9b6d41c35f3`. `sw.js` CACHE frissült: `d15e3fc716d4367e8ec48240ad130b8dfa7ff6bb`. Verzió: `20261107-roster-details-integration-v1`.
- 7 statikus, forrásalapú ellenőrzés PASS: HTML és SW cache-verzió, mass/competition múltbeli rendezési állapot, mismatch figyelmeztetés, lenyitott részletek beszúrási pontja, régi kompakt-soros injektálás hiánya. Ezek **nem** JS parser-, böngésző-, DB-, UI- vagy CI-tesztek.
- A #86 eredeti PR továbbra is külön, elavult ágon OPEN; az új integrációs ágat kell ellenőrizni és szükség esetén külön PR-rel kiadni. LIVE merge/deploy és Supabase adatírás nem történt.
- Következő: JS szintaktika/CI, a `flagged.replace` DOM-beszúrás működésének böngészős regressziója, auth Manager TEST fixture, versenysportos teszthiba reprodukció, csak ezután LIVE release.

## 2026-11-07 – #88 DRAFT PR létrehozva
- A #86 javításának mainre célzott TEST-integrációjához új **draft PR #88** nyílt: https://github.com/beacvolleyCC/club-control-manager/pull/88. Head: `test/20261107-pr86-integration-qa`, head SHA `d15e3fc716d4367e8ec48240ad130b8dfa7ff6bb`; base main. GitHub jelenleg `mergeable:false` állapotot jelzett (nem tekinthető merge-késznek).
- Az adott head SHA-hoz a GitHub Actions PR workflow run lekérdezése **üres listát** adott; nincs bizonyított CI siker. A 7 korábbi statikus forrásellenőrzés nem azonos CI/JS parser/böngészős teszttel.
- Az eredeti #86 PR nem zárult és nem merge-öltük. LIVE alkalmazás, Cloudflare és DB nem változott.
- Következő: GitHub PR #88 konfliktus/CI okának felderítése; valódi JS parser és régi versenysportos regressziós teszt; TEST Manager hitelesített képernyőpróba; BEAC bérletszám mentés/audit fixture. Release gate továbbra is zárt.

## 2026-11-07 – PR #88 CI hiba izolálva, teszt javítva
- GitHub Actions head `d15e3fc7`: 7 workflow run; **6 success, 1 failure**. A bukó `Manager competition training roster QA` (run `42381416631`, job `128429633427`) `Parse Manager JavaScript` lépése **PASS**, de a következő QA lépés **FAIL**.
- Napló: `tests/league-context-ui.test.cjs:56` hibás regexe a régi `const rawRows=showPhoto?...:externalSelection?[]:` kódsorrendet várja; a jelenlegi alkalmazás a `canonicalPartial?canonicalRows:` ággal kezd. A tabella kontextus-izolációs szabályának változása helyett elavult forrásszöveg-elvárás bizonyított.
- A TEST integrációs ágon a regexet a valós, kibővült kódsorrendhez igazítottuk; commit `a33f192fe2fa3ef9c0286797d8789c361aa369b9`. A teszt továbbra is ellenőrzi a `externalSelection?[]:`, `hasRealRank`, `_ccUnranked:true`, meccskontextus és league picker védelmeket.
- Az új commit workflow eredménye a lekérdezéskor még nem állt rendelkezésre. **Nincs állítás új CI sikerről vagy LIVE deployról.**

## 2026-11-07 – második PR #88 CI-hiba diagnózis és tesztjavítás
- PR #88 `a33f192f` commit: 7 workflow, 6 success, 1 failure (competition roster QA run `42381529364`). A JS parser ismét PASS.
- A `tests/league-matches-page.test.cjs` izolált `new Function` harness nem definiálta a production kódban létező `let ccLeagueMatchScope_='all'` változót, ezért `ReferenceError` keletkezett. Másik elavult assertion a régi `const scope=hasBeac?...:` kódrendet várta; production most `options.onlyBeac` és `options.forceAll` explicit felülírásokat is támogat.
- TEST branch tesztjavítás commit: `5fd92c326cfc0118ec01624e25f09b1219c6c18a`. Harnessben scope inicializálva, regex a valós explicit prioritáshoz igazítva. App production kódhoz ebben a commitban nem nyúltunk.
- Az új commit CI státusza a lekérdezés pillanatában még üres; következő körben ellenőrizni kell. LIVE változatlan.

## 2026-11-07 – PR #88 CI harmadik hiba, csapatszűrés fixture
- `5fd92c3` commit 7 Actions futás: 6 success, 1 failure, JS parse PASS. A `league-matches-page.test.cjs:36` assertion a férfi B csoportot várta, miközben a fixture `selectedTeamIds:[]` (Összes BEAC csapat) állapotot adott, és a production kód szándékosan mind a 4 ismert csoportot rendereli.
- A TEST ágon a kizárólag férfi B csoportot ellenőrző teszt fixture explicit férficsapat szűrést kapott (`selectedTeamIds:['10000000-0000-4000-8000-000000000003']`). Commit `9ad028549495b87e4cc90bd057e64766d71f2121`. Production kód változatlan. Az összes csapat nézetét külön teszttel is érdemes védeni.
- Új commit CI eredmény a lekérdezéskor még nem volt elérhető. LIVE változatlan.
