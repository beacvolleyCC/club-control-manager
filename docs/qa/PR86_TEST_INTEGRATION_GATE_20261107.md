# PR #86 integráció – TEST QA kapu (2026-11-07)

Ág: `test/20261107-pr86-integration-qa` (mainről létrehozva). Ez **nem** LIVE kiadás.

## Kötelező kódösszevezetés
- A #86 módosításait az aktuális main `app.js` változataira kell átültetni; a #87-ből származó `massTrainingPastSort`, `eventPastSort` és pénzügyi dátum javításokat meg kell tartani.
- `index.html` app.js cache query és `sw.js` CACHE token azonos, új verziót kapjon.
- Kompakt sor: név, jelenléti csúszka; bérletimport részletei csak lenyitva; bérletszám-eltéréskor ! a név mellett; korábbi bérletfigyelmeztetés marad.

## Automatikus regressziós ellenőrzések
1. JS szintaktika és PWA asset/cache összhang.
2. Elmúlt tömegsportos és versenysportos edzések alapból legújabb elöl; rendezési kapcsoló működik.
3. Pénzügyi dátum: új tétel mai nap, null dátum nem 1970.
4. Kompakt sor nem tartalmaz BEAC import részletet; lenyitott sor igen.
5. Egyező, eltérő, hiányzó bérletszám és import nélküli állapotok.
6. A névsor ismert régi versenysportos hibájának reprodukciója és elkülönített javítása.

## Adatbázis / TEST
- TEST Supabase: `szzoubvhlwnojtzqjebc`; LIVE: `snqsxlyhontaepembaic`.
- A TEST jelenleg 1 tömegsportos foglalást és 0 BEAC bérletet tartalmaz (2026-11-07 exact SQL). A bérleteltérés UI-t nem lehet valósághűen ellenőrizni kontrollált TEST fixture nélkül.
- A `cc_manager_mass_booking_pass_number_set_v1` RPC a `mass.trainings/edit` jogot követeli, `anon` EXECUTE nincs, `authenticated` EXECUTE van. Audit műveletnév TEST-ben `test.booking_pass_number_set`, LIVE-ban `live.booking_pass_number_set`.
- Tesztadat-írás kizárólag TEST-ben, külön azonosított és visszaállítható fixture-rel. LIVE adatbázisba tesztírás tilos.

## Kiadási döntés
A #86 merge csak akkor engedhető, ha az integrált kód, regresszió, authenticated Manager nézet, Cloudflare build és rollback ellenőrzött. A jelen dokumentum **terv**, nem bizonyíték a tesztek sikerére.
