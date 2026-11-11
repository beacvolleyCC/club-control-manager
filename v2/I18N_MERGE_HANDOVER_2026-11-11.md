# Club Control V2 — HU/EN összevezetés / állapotátadás (2026-11-11)

## Döntés
A **Manager V2 és Player V2 közös fordítási adatforrása** a meglévő TEST Supabase i18n katalógus. A jelenleg működő régi Player TEST (külön repo) magyar–angol UI-ját nem cseréltük le; a fordításait szövegenként összevezettük, de az átkapcsolás nem történt meg.

- V2 repo: `beacvolleyCC/club-control-manager`
- V2 ág: `v2/architecture-foundation-20261107`, Draft PR #89
- Jelenlegi Player TEST: `beacvolleyCC/player_application`, `test/20261026-isolated-player-mobile`
- TEST Supabase: `szzoubvhlwnojtzqjebc`
- LIVE: érintetlen; nem merge-eltünk, nem deployoltunk.

## Eddig elkészült
1. A **publikált 47 HU kulcs** offline másolata: `v2/frontend-next/shared/i18n-offline-hu.js`.
2. Közös, tiszta **Manager/Player i18n motor**: `v2/frontend-next/shared/i18n-core.js`. Kulcsalapú fordítás, HU fallback, aktuális locale, `en-GB` dátum/szám, paraméterek, kezdeti egyszerű ICU plural, későbbi nyelvek, nyelvcsomag verzióvédelem.
3. Külön **TEST-only, read-only Supabase csomagbetöltő**: `v2/frontend-next/shared/i18n-test-loader.js`. Kizárólag `cc_v2_i18n_bundle_v1` publikált üzeneteket olvas, nem kér JWT-t, nem ír DB-be. A publikus TEST kulcsot a meglévő `test-rpc.js` exportja adja. Hálózati hiba esetén offline HU.
4. Automatizált tesztek: `v2/tests/i18n-core.test.mjs` (6 eset: HU fallback, EN, plurals, verziók, hibás bundle, TEST API, késő válasz).
5. **603** külön Player HU→EN szótárbejegyzésből:
   - **18** meglévő V2 magyar forrásszöveg-azonosság, nem duplikálva;
   - **5** eltérő angol szöveg külön ellenőrzésre kijelölve;
   - **585** új, determinisztikus `player.legacy_*` kulcs és angol fordítás **nem publikált/draft** importja a TEST adatbázisba.
6. Az import és az ütközések gépileg visszaolvasható listája: `v2/i18n/player-legacy-catalog.json`.
7. A pontos és ismételhető TEST migráció: `v2/database/migrations/20261111_cc_v2_i18n_player_legacy_draft_import.sql`. INSERT-only, konfliktusnál sem módosítja a 47 meglévő kulcsot. TEST Supabase-ban sikeresen lefutott.

## Igazolt TEST adatbázis állapot
- Összes `i18n_keys`: **632**.
- Publikált kulcsok: **47**, változatlan.
- Új `player.legacy_*` nem publikált kulcsok: **585**.
- Új angol `draft` fordítások: **585**.
- Publikált angol fordítások: **47**, változatlan.
- Angol csomag `revision=1`, **nem emeltük**.
- Publikus EN bundle továbbra is **47 kulcs**, tehát a 585 piszkozat **nem látszik a publikus kliensnek**.
- A jelenlegi Player TEST nyelvváltója, PWA és a LIVE nem változott.

## Öt fordítási konfliktus (HU → Player EN / meglévő V2 EN)
| V2 kulcs | Magyar | Player | V2 |
| --- | --- | --- | --- |
| `auth.sendCode` | Kód kérése | Request a code | Request code |
| `common.trainings` | Edzések | Training sessions | Training |
| `common.noData` | Nincs adat | No data | No data available |
| `player.attending` | Jövök | I'll attend | I'm coming |
| `player.notAttending` | Nem jövök | I can't attend | Not attending |

A meglévő Player UX angol kifejezéseit automatikusan **nem írtuk felül**. A V2 kulcsokon sem módosítottuk a publikált értékeket.

## QA / status
- V2 foundation QA: **82 pass, 0 fail**, lásd https://github.com/beacvolleyCC/club-control-manager/actions/runs/42936440356.
- A Cloudflare V2 TEST automatikus deploy workflow továbbra is **hibát jelez**; nincs igazolt új V2 publikus webes deploy. A QA és adatbázis-migráció sikerességét ez nem érinti.
- Nem történt mobil/böngészős E2E a közös i18n-bekötésre, mert a V2 frontendek jelenleg még nem használják a közös modult.

## Soron következő implementációs lépések
1. A `player.legacy_*` import feliratainak és a **dinamikus regexp** szabályoknak szemantikus, tartós fordítási kulcsokat adni. Kerülni az eltérő kontextusban azonos magyar szövegek automatikus összevonását.
2. Az 5 ütköző angol kifejezés megfogalmazását egységesíteni termékdöntéssel. Írás előtt audit/review.
3. A V2 Manager és V2 Player `frontend-next` felületén a közös motorral kiváltani az első navigáció, státusz, validáció és formátum szövegeket; implementálni az adatbázis csomag cache/frissítést és változó nyelvek nyelvválasztóját.
4. Tesztelni az angol váltást, HU offline fallbacket, nem létező nyelvet, verzióváltást, jogosultságoktól független szövegbetöltést, és nem létező kulcsot.
5. A régi Player TEST `i18n-dom.js` és `i18n-static.js` marad addig, amíg a kész közös katalógus/adapter azonos vagy jobb lefedettségű. A meglévő Player-t **nem** írjuk felül 47 kulcsos V2 bundléval.
6. Csak **review → publish → revision increment** után kerüljenek új fordítások a publikus bundléba, azonos DB tranzakcióban. Az importból nem szabad automatikusan publikálni.
7. Fordításszerkesztő Manager felület és többnyelvű szerveroldali push/e-mail egy későbbi külön fázis.

## Fontos korlát
A motor jelenleg csak az egyszerű ICU `{count, plural, one {...} other {...}}` mintát kezeli; komplex, beágyazott ICU MessageFormat még külön feladat. A jelenlegi Player `i18n-static.js` a dinamikus regex-eket és speciális kifejezéseket továbbra is önállóan kezeli, azokat nem importáltuk 585 statikus DB kulcsként.

## Folytatási utasítás
Olvasd be ezt a handovert és a `v2/i18n/player-legacy-catalog.json` mappinget; a 585 draft elemet **ne publikáld** automatikusan. Következő körben a két `frontend-next` alkalmazás közös kliensoldali i18n bekötésével, a megőrzött HU/EN szövegekkel és TEST E2E-vel folytasd. LIVE-hoz ne nyúlj.
