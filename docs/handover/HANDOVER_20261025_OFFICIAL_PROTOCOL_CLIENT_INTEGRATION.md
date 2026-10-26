# CC-FOLYTATÁS — hivatalos eredmények: PostgreSQL → Manager/Player, 2026-10-25

**Állapot:** [Manager draft PR #74](https://github.com/beacvolleyCC/club-control-manager/pull/74) + [Player draft PR #28](https://github.com/beacvolleyCC/player_application/pull/28). **Nem éles**, az éles Supabase-adatbázisban nem történt írás, PR-merge, Pages-deploy vagy meccsesemény/RSVP átírás.

## A felhasználó által hitelesített végleges menetrendhez illesztés

A két, korábban feltöltött hivatalos PDF eredményei:
- **MRSZ 2686**, 2026-10-21 21:00, **Női Budapest I**: **MTK Budapest – Panoráma SE 3–1**, játszmák `25:20 · 25:9 · 20:25 · 25:15`. Canonical fixture sourceKey `20261001:fixture:39`, stable UUID `04eaceee-57e2-7563-a618-beb933c0ffc0`; 12+7=19 játékos.
- **MRSZ 2700**, 2026-10-21 20:00, **Férfi Budapest I/B**: **Mozdulj SE – MAFC-Vásárhelyi 3–2**, játszmák `25:18 · 25:23 · 21:25 · 18:25 · 15:11`. Canonical fixture sourceKey `brsz:2026/27:menB:userofficial:01`, stable UUID `25a14406-2887-62fc-086c-ad770d160a6b`; 10+9=19 játékos.

Ezek **két meglévő** mérkőzésrekord eredmény-frissítései, **nem új meccsek**. A végleges menetrendhez tartozó 41 régi aliasjelölt nem előfeltétel.

## Tényleges fejlesztési javítás

A két levizsgált PDF teljes roster-, játszma-, személyzeti adatát a staged `sql/official_protocols_20261021_identity_safe_migration.sql` tartja, visszagörgethető, idempotens, meglévő canonical UUID-t tart meg.

**Új vizsgálat:** `tests/official-protocols-20261021/manager-render-projected-protocol.test.cjs` a két elkülönített PostgreSQL 17-es tesztadatbázis által előállított **tényleges** `private.cc_competition_canonical_payload_v1()` JSON-objektumot veszi át, majd az alkalmazás saját `ccMrszProtocolHtml_` függvényét futtatja. Mindkét meccs pontos neve, bajnoksága, dátuma, 3–1/3–2 eredménye, az összes játszma, a **38** sportoló, csapatkapitány, liberó, csere, hiányzó részvételi jelölés, játékvezető és edző tesztelve.

Ez a teszt egy tényleges **megjelenítési pontatlanságot** azonosított: a régi raw fixture `MTK` nevet mutatta a kanonikus kártyán, miközben a hivatalos PDF-ben `MTK Budapest` áll. A staging SQL canonical JSON-kimenete most a PDF-ből ellenőrzött `officialProtocolEvidence.homeName/awayName` értéket részesíti előnyben, **csak a kijelzett mérkőzés-/jegyzőkönyvnévnél**; a raw `homeName`, az eredeti fixture-pillanatkép, a sourceKey, a match UUID és a régi csapatadatok változatlanok. Más bajnokság MTK kék csapatával nincs összemosás.

**Player #28:** teszt-only pinned source fixture `tests/fixtures/official-protocols-20261021-manager74-snapshot.json` tartalmazza a staging adatot; a `tests/player-real-official-protocols-20261021.test.cjs` azt a Player valódi protokoll HTML- és kártyafüggvényeivel ellenőrzi. Mind a 38 sportoló szerepel, a két bajnokság nem keveredik, nem találunk ki sportolói adatlap-URL-t vagy külső jegyzőkönyv-linket, és ugyanazon MRSZ-kód másik bajnokságban nem nyit jegyzőkönyvet.

## CI és LIVE ellenőrzés

A két különálló PostgreSQL 17 adatbázisban sikeres a 298 fixture / 13 played előállítás, a 2 hivatalos eredmény beemelése 298/15-re, teljes PDF-roster és hivatalos személyek, a migráció újrafuttatása, rollback 298/13-ra, majd ismételt apply. A tényleges JSON → Manager vizuális protokollteszt is kétszer sikeres. **[Manager #74 PostgreSQL CI](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40187119849).**

A Player #28 új 38 soros protokolltesztje és a korábbi kijelző/eredmény/menetrend regressziói a négy külön workflow-ban átmentek. **[Player #28 CI](https://github.com/beacvolleyCC/player_application/actions/runs/40187228688).**

A `sql/official_protocols_20261021_readonly_preflight.sql` két külön LIVE `SELECT` hívása (2026-10-25) mindkét meglévő sourceKey-t `STAGING_PRECHECK_OK` státusszal jelezte. LIVE mérkőzések: **298**, ebből **13** played; #2686/#2700 eredményei **nincsenek élesítve**; `public.events` **279**, `availability` **676** a lekérdezés időpontjában. Ezek dinamikus adatok, kibocsátáskor újból kell ellenőrizni.

**Nincs élesítés:** a Manager/Player mobilos bejelentkezett teszt, a kiadási döntés, a DB-migráció, a hivatalos roster nézet személyes adat-hozzáférési tesztje és a PR-konfliktusok végső ellenőrzése még hátravan. Az időpontok és az eredmények sem váltanak át automatikusan az éles adatbázisban, amíg a migrációt kifejezetten jóvá nem hagyják.

## Következő célszerű lépés

A `#74` staging eredmény overlay későbbi kiadásának megtervezése a Player #28 és Manager #76 (meccslista és statisztika) egységes, bejelentkezett tesztjével. Nem szükséges a 41 korábbi régi-meccs alias kézi újraelemzése.
