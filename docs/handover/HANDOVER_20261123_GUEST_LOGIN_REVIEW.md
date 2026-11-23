# Club Control — vendégbelépés és vendégkezelés: felhasználói hibajelzés (2026-11-23)

## Ellenőrzött kiinduló állapot
- Forrás: `HANDOVER_20261123_LIVE_GUEST_URL.md` (ellenőrzött 2026-11-23-i handover).
- LIVE vendégoldal: https://beacvolleycc.github.io/club-control-manager/vendeg/
- LIVE Supabase projekt: `snqsxlyhontaepembaic`; TEST: `szzoubvhlwnojtzqjebc` — elkülönítve tartandó.
- A vendégoldal email+PIN belépésre kész, de a korábbi ellenőrzéskor a LIVE DB-ben **0 vendégprofil** volt.
- A valódi Manager vendégprofil-létrehozás és a Manager/Player névsor-integráció PR-jei nem voltak összevonva a LIVE főágba.
- A Manager debug-szimuláció nem hoz létre valódi vendégprofilt; a már létező sima email fiók sem azonos vendégprofillal.

## 2026-11-23 felhasználói hibajelzés
- Új próba-email cím használatakor a publikus vendégbelépés `hibás email` üzenetet mutat.
- Valószínű elsődleges ok: nincs megfelelő, Manager által létrehozott LIVE vendégprofil / PIN; a pontos kliensoldali hibaüzenet és RPC-válasz megfeleltetése **még nem ellenőrzött**.
- **Ne** hozzunk létre automatikusan minden vendégnek teljes Supabase Auth felhasználót vizsgálat nélkül. Meglévő terv: elkülönített email+PIN vendégazonosítás, szerveroldali hash, rate limit és vendég scope.

## Kért fejlesztés
1. Vendégkezelő a Manager Tömegsport / Vendégek menüben a Sportolók-kezelőhöz hasonló, teljesértékű listanézettel: keresés, szűrés, állapot, részletek, létrehozás, szerkesztés, aktiválás/deaktiválás.
2. Vendég részletek: név, e-mail, hozzárendelt edzéscsoport/szint, hozzáférési státusz, PIN biztonságos reset, vendéghez kötött jelentkezések és részvétel; jogosultság szerint.
3. Vendég létrehozása -> DB visszaolvasás -> email+PIN belépés -> heti 3 állású RSVP -> Manager és Player létszám/névsor egyezés.
4. Külön vizsgálandó: email normalizálás (szóköz, kis/nagybetű), ismeretlen email, hibás PIN, deaktivált vendég és megfelelő, de információt nem szivárogtató hibaüzenetek.
5. A Player/Manager meglévő Supabase Auth-belépését nem módosítani; ne adjunk email alapján admin-jogot.

## QA és kiadás
- **Kódváltoztatás / LIVE adatbázis-írás ebben a dokumentációs körben: NINCS.**
- **Pozitív vendéglogin és teljes E2E: NYITOTT.**
- Kizárólag elkülönített tesztadatokkal vagy a felhasználó által kiválasztott, biztonságosan létrehozott vendégprofilon teszteljünk.
- Minden kiadás előtt: API jogosultsági és negatív tesztek, QA automatizmusok, mobil UI, LIVE release gate, szükség esetén rollback terv.

## Kötelező folyamatos handover
- Minden implementációs kör végén frissíteni a `HANDOVER_CURRENT.md` első blokkját és az adott `docs/handover` részletes dokumentumot. Új tényt kizárólag ellenőrzés után írni kész státusszal; a még nem bizonyított állapotot nyitottként jelölni.
