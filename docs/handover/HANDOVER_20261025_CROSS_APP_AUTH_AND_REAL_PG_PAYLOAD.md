# CC-FOLYTATÁS — 2026.10.25. közös jegyzőkönyvi jogosultság- és Player-adatfolyam QA

**Draft fejlesztés. NEM éles.** Manager [PR #74](https://github.com/beacvolleyCC/club-control-manager/pull/74), Manager [PR #76](https://github.com/beacvolleyCC/club-control-manager/pull/76), Player [PR #28](https://github.com/beacvolleyCC/player_application/pull/28). Mindegyik nyitott draft; nem történt merge, deploy, LIVE SQL DDL/DML, event/RSVP-átírás.

## A felhasználó végleges menetrendjének tiszteletben tartása

A korábban belinkelt 2026/27-es kiírás a mérkőzéslista hiteles forrása. Az új MRSZ-jegyzőkönyv csak a két **már meglévő** canonical mérkőzés eredményét, szettjeit és névsorát gazdagítja:

- **MRSZ #2686**: 2026.10.21. 21:00, Női Budapest I., MTK Budapest–Panoráma SE **3–1**, 4 szett, 19 játékos, canonical source key `20261001:fixture:39`, existing UUID `04eaceee-57e2-7563-a618-beb933c0ffc0`.
- **MRSZ #2700**: 2026.10.21. 20:00, Férfi Budapest I/B, Mozdulj SE–MAFC-Vásárhelyi **3–2**, 5 szett, 19 játékos, canonical source key `brsz:2026/27:menB:userofficial:01`, existing UUID `25a14406-2887-62fc-086c-ad770d160a6b`.

A 41 régi BRSZ ID-megfeleltetés **nem blokkolja** a mérkőzéslista vagy ezen két hivatalos eredmény megjelenítését. Az azonos osztályban szereplő szövetségi csapatazonosítókat továbbra is pontosan ellenőrizzük, más bajnokságok résztvevőit nem egyesítjük.

## Ténylegesen elkészült

A Manager #74 dual PG17 workflow minden tiszta szintetikus adatbázisban:

1. létrehozza a **298** canonical mérkőzést (**13** már lejátszott),
2. rávetíti a két hivatalos, PDF alapján feldolgozott jegyzőkönyvet (**298 / 15**), megtartva az összes canonical mérkőzésazonosítót és forráskulcsot,
3. az adatbázis **valódi JSON-kimenetéből** rendereli a Manager #74 és a **pontos commit SHA-hoz rögzített #76** HTML-megjelenítőit,
4. ugyanezt a PostgreSQL-ből frissen előállított JSON-t átadja a **pontos commit SHA-hoz rögzített Player #28 `app.js` valódi `ccPlayerScoreboardHtml_`, `ccPlayerProtocolDetailHtml_`, `ccPlayerOpenProtocol_`, `ccPlayerBindProtocols_` függvényeinek**; ez már nem egy külön kimásolt Player teszt JSON,
5. ellenőrzi mind a **38** sportoló megjelenítését, a két 3–1 / 3–2 eredményt, a szetteket, kapitány/liberó/csere jelzéseket, a pontos bajnokságot, a rossz bajnokságú és duplikált meccskód elutasítását, valamint a tap/Enter/Space/bezárás viselkedését,
6. a lezárt jegyzőkönyvek után a migrációt megismétli, teszteli a rollbackot **298/13** állapotra, végül újra-apply után **298/15**. Drift esetén tranzakciósan leáll.

Új tesztfájlok: `tests/official-protocols-20261021/authenticated-protocol-access.sql` és `tests/official-protocols-20261021/player-render-pg17-canonical.test.cjs`. Futtatás: `.github/workflows/official-protocols-20261021-db.yml`.

## Jogosultsági negatív tesztek

A jelenlegi LIVE PostgreSQL-függvények **READ ONLY** átnézése alapján a Manager `v1` RPC `private.cc_manager_require_any_v1('competition.matches','view')` ellenőrzést végez; a Player `v1` csak aktív, aktuális csapattagsággal rendelkező játékost enged be. Mindkét `v2` RPC a saját `v1` kapuján át jut a canonical jegyzőkönyvhöz.

A disposable PG17 QA ennek a **felhasználói adatok nélküli, szimulált** pontos jogosultsági logikáját építi fel:
- valódi PostgreSQL `SET ROLE anon/authenticated` környezet;
- 7 JWT-szimuláció (hiányzó, Manager, Player, inaktív játékos, lejárt csapattagság, jogosulatlan személy, inaktív csapat);
- 2 külön RPC/aktor, **7 × 2** jogosultsági vizsgálat minden adatbázisban;
- minden tiltott szerep nem kapja meg a 38 játékos jegyzőkönyvét, jogosult Manager/Player megkapja;
- sem `anon`, sem `authenticated` nem fér közvetlenül a privát canonical payload-függvényhez vagy a nyers `public.cc_competition_mrsz_screenshot_v1` táblához.

Mindez **két különálló PostgreSQL 17 tesztadatbázisban** PASS, CI [40205184792](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40205184792) és frissített head [40205188212](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40205188212).

## Éles állapot, kizárólag SELECT, két független ismétlés (2026.10.25.)

A két LIVE lekérdezés egyezik: **279 Manager-esemény, 676 jelentkezés, 298 canonical mérkőzés, 13 lejátszott, 0 új `officialProtocolEvidence` overlay**. #2686 és #2700 meglévő fixture-forrásai egyaránt pontosan egyszer szerepelnek. `anon` nem hívhatja a két meccs `v2` RPC-t, `authenticated` csak a függvény belső v1 jogosultságvizsgálatán át.

**Nem történt adatbázis-migráció.** A Player felülete élesben nem mutatja az új eredményeket, amíg a staged SQL kiadásra nem kerül.

## Hátralevő release-kapuk

- Bejelentkezett valós Manager (megfelelő/nem megfelelő szerep), aktív/inaktív/lejárt csapattag Player — **élő JWT + RLS teszt**, nem pusztán szintetikus.
- Valódi iPhone Safari/PWA és asztali böngészős jegyzőkönyv, modal bezárás, zoom/scroll, képernyőolvasó, offline/cache teszt. A forrásalapú eseményteszt nem valós iOS-interakció.
- Független release-engedély és migrációs visszagörgetési döntés, kétkörös 11× regresszió, LIVE elő-/utószámlálás.
- Az új Supabase 2026.10.30. Data API jogosultsági szabályhoz külön [Manager #77](https://github.com/beacvolleyCC/club-control-manager/pull/77) draft automatikus migrációs linter készült. #74 nem hoz létre új `public` táblát.

**Következő praktikus kör:** a valódi bejelentkezett Manager és Player végpontpróbák kiadási tervének lezárása és mobil UX próba, majd csak külön döntéssel élesítés. A 41 legacy BRSZ alias nincs megnyitva újra.
