# Club Control V2 – tömegsportos regisztráció / foglalás handover

**Dátum:** 2026-11-15  
**Ág:** `v2/architecture-foundation-20261107` · draft PR #89  
**Csak TEST Supabase:** `szzoubvhlwnojtzqjebc`  
**LIVE:** `snqsxlyhontaepembaic` változatlan

## Mi épült ebben a körben

1. **Hitelesített tömegsportos profil:** `cc_v2_mass_profile_register_v1`. A böngésző Supabase e-mail OTP-t használ a `create_user:true` opcióval, de a szerver csak a `auth.users.email_confirmed_at` által igazolt és nem anonim felhasználót fogadja el. A kliens JWT-je kizárólag memóriában él. Az e-mail-azonosságot a DB nézi, a hívó nem adhat át tetszőleges e-mail-címet. Régi rekordot csak egyedi e-mail és normalizált névegyezés esetén kapcsol hozzá; kétértelmű találat Manager-ellenőrzést igényel. Explicit kapcsolat: `cc_v2_mass_verified_account_links_v1`.
2. **Saját profil / bérlet / foglalások / várólista:** `cc_v2_mass_self_read_v1()` csak az igazolt account-hoz tartozó adatokkal. A vásárlási státusz a foglalástól külön: `verified`, `pending_import`, `sales_unavailable_grace`, `missing`, `qa_mock_pass`. Fiktív tesztbérlet sosem lesz `verified`.
3. **Önkiszolgáló jelentkezés:** `cc_v2_mass_self_book_v1(event,mode,claimedPaid)` (book/wait/first_training), a már kész tranzakciós `cc_vnext_mass_public_book_v1` és `cc_vnext_mass_public_wait_v1` belső újrahasznosításával. Server-side: ellenőrzött account, QA-scope, szint, aktív szankciók, hónap/bérlet, létszám, várólista elsőbbsége, egyszeri első edzés. A `claimedPaid` csak függő ellenőrzést enged, **nem igazolja a fizetést**. A lemondási titkot a szerver generálja; a felhasználó nem választ titkot.
4. **Lemondás:** `cc_v2_mass_self_cancel_v1(bookingId,kind)`. Saját foglalás meglévő, határidőt és késést számító visszavonó függvénnyel; saját várólista ellenőrzött tranzakcióban, auditáltan. Idegen booking ID nem módosítható.
5. **Közös webes/Player kliens:** `v2/frontend-next/shared/mass-self-client.js`, `mass-self-ui.js`. Mindkét nézet ugyanazokat a modulokat használja; útvonalak: `/frontend-next/mass/` és `/frontend-next/player/`. Megjelenik e-mail OTP/registráció, foglalási opciók, saját adatok és lemondás. A közös menetrend továbbra is az egyetlen meglévő `mass_events` adatforrásra támaszkodik, nem második adatbázisra.
6. **Manager bérletértékesítési vezérlő:** `mass-pass-manager.js` a V2 Manager tömegsportos bérletnézetében; `mass.passes view/edit` jogosultsági kapu, auditnapló, hónap, elérhetőségi állapot, türelmi határidő és indok. Türelmi idő alapértéke OFF; Manager nélkül nem aktiválható. Ez nem kapcsolódik a külső BEAC fizetési szolgáltatáshoz és nem állítja ki a bérletet.
7. **Lokalizáció:** 34 új `mass.self.*` szövegkulcs publikált HU/EN formában; a web/Player közös UI a központi TEST fordítási API-t olvassa, hálózati hiba esetén HU/EN szöveges tartalékot tart fenn. A menetrend nyelvválasztója a foglalási panel nyelvét is változtatja.
8. **Manager részletező:** egy külön ⚠ jelzés mutatja a pending/ellenőrzendő bérletet a **részletes jelentkezőlistában**, nem a kicsi edzéskártyán.
9. **Fiktív jövőbeli edzés:** `CC-QA-FUTURE-20261119` (2026-11-19 18:00; TEST/kezdő, 4 fő), kizárólag `CC-QA-SYNTHETIC` forrás. Nem valódi BEAC-edzés, sem foglalható LIVE-on.

## TEST migrációk

- `20261115_cc_v2_mass_verified_registration_read.sql` – sikeresen alkalmazva.
- `20261115_cc_v2_mass_self_booking_secure.sql` – sikeresen alkalmazva.
- `20261115_cc_v2_mass_future_test_event.sql` – sikeresen alkalmazva.
- `20261115_cc_v2_mass_selfservice_i18n.sql` – sikeresen alkalmazva.
- A korábban létrehozott pass sales model, 3 fiktív sportoló, 2 fiktív bérlet és közös publikált menetrend megőrizve.

## Automatizált ellenőrzések

- `v2/tests/mass-self-service-v2.test.mjs`: OTP create_user, JWT nem tartós tárolás, direkt RPC-allowlist, jogosultsághiány, foglalás/várólista/lemondás hívási szerződés, Manager pass állapot, közös web/Player import.
- Supabase jogosultságok: új self-service végpontok `anon EXECUTE=false`, `authenticated EXECUTE=true`, de az adatbázisoldali igazolt e-mail és tulajdonosi kapcsolat ellenőrzése kötelező. Régi alacsony szintű író függvények továbbra is nem hívhatók közvetlenül `anon` vagy `authenticated` szerepkörből.
- `set local role authenticated` JWT nélkül teszt: saját adatok olvasása elutasítva.
- Publikus TEST menetrend a QA jövőbeli edzést adja vissza, játékosadat nélkül.
- QA az új kódra: lásd GitHub Actions legfrissebb *Club Control V2 foundation QA* futás. Ezt a dokumentációfrissítés után is újra ellenőrizni kell.

## Fontos: mi NEM igazolt / hiányzik

- **A teljes e-mail OTP → regisztráció → foglalás → lemondás valódi böngészős E2E** nincs ellenőrizve, mivel a V2 Cloudflare Pages deploy GitHub környezeti API-kulcsok hiányában nem fut át. Ebből következően ez a kör csak DB-migrációval és automatizált contract-teszttel igazolt, nem production-ready.
- TEST `auth.users` jelenleg 1; `cc_v2_mass_verified_account_links_v1` továbbra is 0 valódi igazolt összekapcsolás. Nincs valós használó által kipróbált sikeres foglalás; nem szabad kész, éles felhasználói rendszerként kommunikálni.
- TEST-ben továbbra is csak fiktív tömegsportos sportolók/bérletek találhatók; teljes LIVE-adatátvétel **nem** történt. A valós migráció külön auditált, maszkolt, idempotens tervet és engedélyezett hozzáférést igényel.
- Valódi BEAC bérletvásárlás/payment API, levélküldő, push értesítés és külső vásárlási állapot szinkronja NINCS bekötve. Az e-mail OTP kézbesítésének és sablonjának ellenőrzése hátra van.
- Még szükséges valós 2 fiókos 403/200 és párhuzamos utolsó-férőhely E2E, SPORT7 1 alkalom kontroll, szankció és várólista-offer automatikus folytatás. Utóbbi régi üzleti szabályok függvénye; a mostani réteg nem vezetett be második kapacitásszámlálást.
- A Supabase security advisor további vizsgálati pontokat jelez (anon/security definer, keresési útvonal, extension); ne módosítsunk meglévő unrelated jogosultságokat vakon.
- Minden TEST-only. V2 PR draft, LIVE módosítás nincs.

## Indítás/befejezés

1. Cloudflare külön V2 TEST projekt credentials beállítása GitHub environment `v2-test-preview`: `V2_CLOUDFLARE_API_TOKEN`, `V2_CLOUDFLARE_ACCOUNT_ID`. Tokeneket nem kell chatben megosztani.
2. Valódi TEST OTP-s fiók létrehozása, e-mail sablon ellenőrzése, fiktív QA-edzés kézi jelentkezés+lemondás próbája; ugyanaz látszódjon weben és Playerben.
3. Névütközés, foglalási ütközés, bérlet- és szankciószabályok negatív / több fiókos E2E.
4. Csak ezután staged LIVE-adatátvételi terv és külön élesítési döntés.


## 2026-11-15 kiegészítő SQL-tranzakciós teszt

A TEST Supabase-ben a meglévő hitelesített TEST auth felhasználó azonosítóját egy `BEGIN ... ROLLBACK` tranzakción belül szimulált JWT-környezetként beállítva és átmeneti, fiktív tömegsportos profilhoz kapcsolva a következőket **sikeresen végrehajtottuk**:

- `cc_v2_mass_self_read_v1()`: saját adatok igazolt felhasználóként.
- `cc_v2_mass_self_book_v1(...,'first_training',false)`: fiktív jövőbeli edzés foglalása.
- `cc_v2_mass_self_cancel_v1(...,'booking')`: saját foglalás lemondása.
- `cc_v2_mass_self_book_v1(...,'wait',false)`: átmeneti kapacitás=0 és Manager grace szabály mellett várólistára kerülés.
- `cc_v2_mass_self_cancel_v1(...,'waitlist')`: saját várólista törlése.
- Hiányzó JWT-vel `authenticated` szerepkörben saját profil lekérése 42501 jogosultsági hibával elutasítva.

**Minden pozitív adatbázispróba explicit ROLLBACK-kel végződött.** Utóellenőrzés: a foglalások száma továbbra is 1, a várólista-bejegyzések száma 7, a valódi regisztrált mass-account kapcsolatok száma 0, a bérletértékesítési grace szabályok száma 0, a fiktív jövőbeli edzés kapacitása 4. Nem maradt hátra tesztfoglalás.

Az új `cc_v2_manager_pass_sales_status_v1` emellett `canEdit` jogosultsági jelzőt ad, és a Manager szerkesztési gombja el van rejtve, ha a szerveren a `mass.passes edit` jogosultság nincs meg. A tényleges írási funkció továbbra is külön, szerveroldalon ellenőrzi az engedélyt.

A központi fordítási adatbázisban a teljes TEST-szövegkulcskészlet most **681 kulcs**, ebből **96 publikált angol** fordítás; az új tömegsportos HU/EN szövegek már a közös nyelvi motorból jönnek.

**Továbbra sincs valódi végfelhasználói e-mail OTP / webes PWA E2E**, ez Cloudflare V2 TEST deployment és kézi próba után minősíthető késznek.
