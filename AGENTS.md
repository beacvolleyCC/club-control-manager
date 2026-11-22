# Club Control — kötelező fejlesztési és kiadási szabályok

## Környezetek
- **LIVE** a működő, valós sportolói adatokat tartalmazó éles rendszer. **TEST** külön Supabase projekt: `szzoubvhlwnojtzqjebc`; LIVE ref: `snqsxlyhontaepembaic`.
- LIVE adatmigráció, PR-merge vagy frontend-kiadás előtt legyen pontos scope, visszaállítási terv, SQL/jogosultsági teszt és bejelentkezett felületi ellenőrzés. Egy sikeres GitHub commit **nem** jelenti azt, hogy a felület települt vagy működik.
- TEST frontendhez soha ne kerüljön LIVE Supabase-kulcs vagy -URL. LIVE frontendhez ne kerüljön TEST adatforrás. TEST-felhasználók és külső vendégek ne írjanak LIVE edzés- vagy RSVP-rekordokat.
- Kerüljük az új bejelentkezési mechanizmust: Manager/Player továbbra is a már működő Supabase Auth-folyamatot használja. A tesztelés nem indokol külön OTP-, PIN- vagy magic-link rendszert a Managernek.
- A vendég PIN kizárólag a vendégjelentkezési aloldalhoz tartozik, nem Manager-bejelentkezés.
- LIVE-on a debug/tesztfunkció kizárólag szerveroldali, bejelentkezett és auth-UID-hoz kötött admin-jogosultság alapján látható. E-mail-string, localStorage, URL-paraméter vagy kliensoldali flag **önmagában nem adhat jogosultságot**.
- A debug mód próbadatai soha nem kerülhetnek normál LIVE eseménybe, névsorba, létszámba vagy pénzügyi nyilvántartásba. Jelenleg csak böngészőn belüli, egyértelműen DEMO jelzésű szimuláció engedélyezett.
- A LIVE debug hozzáférés **alapból mindenki számára OFF**; csak kifejezett, pontos e-mail-fiók és a hozzá kötött hitelesített Manager rekord ellenőrzése után engedélyezhető.
- Új funkció tesztelésekor: alapműködés → negatív jogosultsági esetek → adat-írás/visszaolvasás → Manager/Player egyezés → mobil UI → kiadási logok. Ha bármelyik hiányzik, dokumentáljuk és ne állítsuk, hogy kész.
- Minden érdemi változás után frissítsd a `HANDOVER_CURRENT.md` hivatkozását vagy a kapcsolódó `docs/handover` fájlt: érintett környezet, commit/PR, sikeres és hiányzó QA, adatbázis-írás, rollback és következő lépés.

## Kötelező LIVE debug kiadási ellenőrzések
- `node --check app.js`.
- `cc-live-debug-safety.yml` sikeres, valamint a meglévő Manager regressziós workflow-k sikeresek.
- LIVE adatbázis: pontosan mely fiókokhoz van enabled tesztmód; `anon` nem hívhatja a flag RPC-t; a debug tábla közvetlenül nem olvasható `authenticated` szerepkörből.
- LIVE UI: a kiválasztott admin látja a panelt, másik admin nem; a beállítás nem módosít valódi edzést és létszámot.
