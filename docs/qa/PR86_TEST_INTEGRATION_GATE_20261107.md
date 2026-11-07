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

## 2026-11-07 – CI és végrehajtható E2E protokoll
- PR #88 head `bf8804b0ef6ff54ad85a4fffd04b771039c57a2d`: mind a 7 GitHub Actions workflow **success** (competition roster QA run 42384744115). Ez automatizált teszt, nem böngészős/auth bizonyíték.
- A PR ág a mainhez képest **diverged** (13 ahead / 8 behind), ezért merge előtt main-összevezetés és ismételt CI kötelező.
- A TEST RPC `public.cc_manager_mass_booking_pass_number_set_v1(text,text,text)` jelen van, `anon EXECUTE=false`, `authenticated EXECUTE=true`; belső ellenőrzés: `private.cc_manager_require_any_v1('mass.trainings','edit')`. A TEST auditban `test.booking_pass_number_set` még 0 rekord.

### Hitelesített TEST tesztlépések (kizárólag elkülönített tesztrekordon)
1. A TEST Manager alkalmazásba valódi, `mass.trainings/edit` jogú tesztfiókkal belépni. Külön ellenőrizni a jog nélküli fiókot; ne használjunk service_role / SQL owner jogosultságot az auth siker bizonyítására.
2. Tesztfoglalás `id`, `pass_number`, `booking_status`, `source_workbook_id` előállapotát rögzíteni. Ha nincs alkalmas foglalás, csak visszaállítható TEST-fixture készülhet.
3. Az alkalmazásból módosítani a bérletszámot egy egyedi, nyilvánvalóan teszt értékre; a Managerben visszaolvasni frissítés után, és a DB-ben SELECT-tel ellenőrizni az új `pass_number` értéket.
4. A `mass_live_write_audit` rekordnál `operation='test.booking_pass_number_set'`, `entity_id`, `payload.before.passNumber`, `payload.after.passNumber`, `payload.reason`, `actor` ellenőrzése. Azonos `entity_id`-ra és időablakra szűrni.
5. Negatív esetek: anon hívás megtagadva; szerkesztési jog nélküli bejelentkezett fiók megtagadva; üres / 100 karakternél hosszabb bérletszám, hibás reason, lemondott booking nem módosítható.
6. UI: kompakt sorban BEAC import részletek nincsenek; lenyitva megjelennek; eltérő számnál felkiáltójel, egyezőnél nincs. Mobil PWA és frissítés utáni cache-verzió ellenőrzése.
7. Tesztadat visszaállítása csak auditált, jogosult TEST művelettel; az előtte/utána állapotot és a visszaállítás auditját dokumentálni.
8. Main-ág összevezetése után teljes CI újrafuttatás, Cloudflare TEST build/deploy, bejelentkezett képernyőpróba és rollback-útvonal ellenőrzése. Csak ezután lehet külön LIVE release döntést hozni.

**Jelen állapot:** 1–8 lépés nem bizonyított; a zöld CI nem jelent E2E vagy LIVE kiadási engedélyt.
