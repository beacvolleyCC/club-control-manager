# Club Control – főági handover, 2026-11-10

**Folytatási kulcs:** `CC-FOLYTATÁS`. **Szabály:** egy mérkőzés egy rögzítés, közös eredmény / jegyzőkönyv / tabella a Playerben és Managerben. A főági dokumentum a jelenlegi LIVE-kód és ellenőrzési nyitott tételek forrása; a V2 külön ágon fut.

## Azonosítók / források
- Manager főág: [beacvolleyCC/club-control-manager](https://github.com/beacvolleyCC/club-control-manager/tree/main); az ellenőrzéskor legutóbbi releváns commit: [be2bf58](https://github.com/beacvolleyCC/club-control-manager/commit/be2bf5803538e247d4ff1ea8f0524143fbc02beb).
- Player főág: [beacvolleyCC/player_application](https://github.com/beacvolleyCC/player_application/tree/main); utolsó ellenőrzött commit: [27576b7](https://github.com/beacvolleyCC/player_application/commit/27576b734993e69fc56afc8bdd3ab902a4bdd186).
- V2 fejlesztési ág: `v2/architecture-foundation-20261107`, draft [PR #89](https://github.com/beacvolleyCC/club-control-manager/pull/89). **Részletes és aktuális V2 handover:** [v2/HANDOVER_2026-11-10.md](https://github.com/beacvolleyCC/club-control-manager/blob/v2/architecture-foundation-20261107/v2/HANDOVER_2026-11-10.md).
- TEST Supabase: `szzoubvhlwnojtzqjebc`; LIVE Supabase: `snqsxlyhontaepembaic`. Ne cseréljük fel.

## LIVE bajnoki aktuális állapot
- A 2700-as Mozdulj SE–MAFC-Vásárhelyi jegyzőkönyv canonical payloadja 10 hazai és 9 vendég játékost tartalmaz. A közös eredményforrás működik, de a bejelentkezett Player/Manager jegyzőkönyv képernyőit mobilon és desktopon továbbra is össze kell vetni.
- Mindkét főági appkód a canonical csapatstatisztikákból számít ideiglenes bajnoki pontot: `2 * wins + losses - forfeits`. Manager [4f571aa](https://github.com/beacvolleyCC/club-control-manager/commit/4f571aa33e9e3125c744f35dbda10c65ec640606); Player [27576b7](https://github.com/beacvolleyCC/player_application/commit/27576b734993e69fc56afc8bdd3ab902a4bdd186).
- 2026-11-10 READ-ONLY LIVE SQL: `private.cc_competition_canonical_team_stats_v1()` az RKSK felnőtt női csapatnál 0 GY / 1 V / 1 ki nem állás, **0 bajnoki pont** a korrekt képlettel. A 2337-es forrás `review` mezőjében szerepel a `Forfeit` jelzés, de `forfeitLoser` explicit mezője null; a canonical SQL jelenleg review-fallbacket használ. Az explicit megkülönböztető jelzés normalizálása és teljes ligánkénti QA még nyitott.
- A Manager és Player `cc_*_competition_mrsz_snapshot_v2` függvényei ugyanazt a `private.cc_competition_canonical_team_stats_v1` és `private.cc_competition_canonical_payload_v1` adatot használják. Ez a DB-definíció auditja, nem a hitelesített PWA viselkedés igazolása.
- A Manager saját BEAC-meccskártyái és hivatalos eredményeinek egyeztetése jelenleg **egyedi, dátum/csapat/ellenfél alapján** találhat rekordot; permanens azonosító/híd és teljes RSVP-visszaolvasás még külön ellenőrzendő. Nem szabad bizonytalan egyezést automatikusan összekapcsolni.

## LIVE/TEST QA különbség
- LIVE Github main kódjavítás nem azonos LIVE böngészős/telefonos igazolással. A fenti rekordok DB-ből ellenőrizve; nem állítunk valós mobil E2E PASS-t.
- A november 9-én korábban hibás Manager roster és Player standings tesztek a főágon korábban javítva lettek, de a teljes E2E regresszió **még nyitott**.
- LIVE adatbázisban **csak SELECT és funkciódefiníció-olvasás történt ebben a körben**. Nincs új eredmény, adatkorrekció vagy migráció. Főági dokumentációs commit történt; az esetleges automatikus deploy végállapota nem igazolt, az alkalmazáskód változatlan.

## V2 munkacsomag, 2026-11-10
- Új, a V1-től független Player frontend shell: `v2/frontend-next/player/{index.html,main.js,player.css}`; mobil navigáció és mentés nélküli jelenlét UI-próba. A korábbi fejlesztői Manager/Player technikai előnézetek megmaradnak.
- A V2 build landing oldala linkeli az új Player és Manager frontendeket; új regressziós teszt: `v2/tests/player-frontend-next.test.mjs`.
- V2 commit `802aaa2372c4576a9766c487116098c22c7459c0` mellett 7/7 GitHub Actions PR workflow zöld (V2 foundation run `42723918834`; Manager competition roster run `42723919035`). A korábbi hibás roster CI ezzel az adott V2 headen már nem blokkoló.
- TEST read-only SQL: régi mass esemény / foglalás / várólista és a V2 registry darabszámai **6/6, 1/1, 7/7**. A V2 olvasó/booking RPC wrapper `anon EXECUTE=false`, `authenticated EXECUTE=true`; a valós jogosultságellenőrzést JWT-vel el kell végezni.
- Nyitott: valódi TEST Cloudflare preview URL/deploy; OTP/JWT pozitív és negatív szerepkörteszt; várólista teljes E2E; adatkötés az új frontendekhez; mobil hozzáférhetőség, rollback.
- PR #89 draft és az ág eltér a main-től; **nincs merge, és V2 még nem LIVE**.

## Egy körben elvégzendő következő QA
1. TEST Manager + Player valódi bejelentkezés, megfelelő és tiltott jogosultságok, adatvisszaolvasás.
2. LIVE Player és Manager valódi megjelenítés: RKSK 0 pont, teljes 2700-as jegyzőkönyv 10+9 játékossal, tabella és meccslista azonos meccsazonossággal.
3. Ki nem állás adatnormalizálás, pontos 2–1–0, holtversenyes sorrend és ligaelválasztás ellenőrzése; az eredményekből mindenhol ugyanaz a tabella.
4. Saját BEAC-meccs – esemény – RSVP kapcsolat stabil azonosítóval, jelenlétet nem felülíró működéssel.
5. Új V2 frontend valódi TEST-only jogosultság-alapú adatbekötése, hibás állapotok, UI/mobil QA.
6. Regressziós dupla kör, rollback terv; külön, kifejezett döntés a LIVE kiadásra.

**Handover szabály:** minden érdemi változásnál ez a státusz és a V2 külön dokumentációja frissítendő; sikeres CI nem nevezhető valós PWA E2E-nek. A korábbi 2026-11-07-i handover történeti előzmény.
