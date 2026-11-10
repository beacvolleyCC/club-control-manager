# Club Control V2 – új frontend / TEST Auth és olvasási kapu (2026-11-10)

## Hatókör
- Kizárólag a `v2/architecture-foundation-20261107` fejlesztési ág.
- Két új felület: `v2/frontend-next/manager/`, `v2/frontend-next/player/`.
- Közös TEST-only adapter: `v2/frontend-next/shared/test-rpc.js`, OTP UI: `test-auth-ui.js`.
- **Nincs éles kapcsolat, nincs adatmentés.** A felhasználó nyitott BEAC V1 LIVE rendszerét nem módosítottuk.
- A frontend-next Manager/Player **nem** a korábbi `v2/apps/**` technikai preview; mindkettő saját navigációval és külön HTML-lel rendelkezik.

## Megvalósított, forráskódban ellenőrzött adatutak

| Felület | Authentikált TEST-only RPC | Megjelenő adat | Nyitott |
|---|---|---|---|
| Manager – versenysport | `cc_manager_events_v1` (edzés, meccs), `cc_manager_players_v2`, `cc_manager_teams_v1` | Négy egymástól független, jogosultságellenőrzött lista | külön editjog, pénzügy/statisztika, eseményírás |
| Manager – tömegsport | `cc_v2_manager_mass_read_v1`, `cc_v2_manager_mass_event_detail_v1`, `cc_v2_manager_mass_waitlist_summary_v1` | Edzések, férőhelyek, jogszerűen lekért jelentkezők, várólista, státuszösszesítés | auditált író RPC-k |
| Manager – bérletek | `cc_v2_manager_mass_passes_read_v1` | Külön `mass.passes` jog, aktuális hónap, bérletszám, termék, sportolónév, vásárlási dátum | import és bérletjóváhagyás |
| Player | `cc_v2_player_read_v1` | `bootstrap.team`, `bootstrap.player`, `bootstrap.events` (`dateLabel`, `timeLabel`, `myStatus`), `notifications.items` | RSVP írás, hivatalos tabella, jegyzőkönyv |
| Közös | `/auth/v1/otp`, `/auth/v1/verify` | email OTP belépés, JWT csak memóriában | valós SMTP/email OTP és JWT böngészős E2E |

- A kliens kizárólag a TEST originhez kapcsolódik. A whitelist kizárólag V2 Player-olvasót, három jogosultságkezelt Manager-listát, négy V2 tömegsportos Manager-olvasót és kompatibilitásként a régi összetett V2 Manager-olvasót engedi; **író RPC nincs**. A frontend a régi összetett Manager-olvasót már nem használja.
- Ismeretlen `schemaVersion`, 401/403, üres vagy hiányos adat esetén a UI nem mutat demó- vagy jogosulatlan adatot.
- A védett navigáció sikeres betöltés előtt rejtett; nincs frontend-only feltételezett adminjog. A server oldali `cc_manager_* / cc_player_*` RLS/jogosultsági ellenőrzések az irányadók.
- Kijelentkezés, munkamenet-lejárat vagy újabb kérés megakadályozza a későn visszatérő adatok képernyőre kerülését. Nincs tartós JWT-tárolás.
- UI a dinamikus TEST stringeket DOM `textContent`-tel jeleníti meg; nincs HTML-kód injektálás.
- A Player `myStatus` jelenleg csak olvasható: **a gombok hiánya szándékos**, addig nem látszik működő mentés, amíg nincs hitelesített író szerződés.
- A Manager **hat** egymástól független jogosultsági modult olvas (versenysport edzés/meccs/sportoló/csapat + tömegsport edzés + tömegsport bérlet). Egy 403-mal tiltott modul nem akadályoz más, engedélyezett modulokat. Csak a sikeresen, szerveroldalon ellenőrzött modul navigációja és darabszáma látszik. A dedikált csapatmodul adatát nem vezetjük le az edzés/játékos modulból.
- A múltbeli edzéseknél a **legutóbbi elöl** az alap; a jövőbelieknél a legközelebbi elöl. Hiányzó dátum külön csoportba kerül.

## Automatikus ellenőrzések
- `v2/tests/frontend-next-test-session.test.mjs`: OTP nem regisztrál új fiókot; késői token nem éleszt munkamenetet; tokenlejárat; elutasított write RPC; invalid schema; 403; ISO időablak.
- `v2/tests/frontend-next-manager-read.test.mjs`: két felület csak az engedélyezett olvasó RPC-ket és megfelelő DB-mezőket használja, no direct table writes.
- `v2/tests/player-frontend-next.test.mjs`: HTML/navigáció/reszponzivitás/ESM parse/szétválasztott TEST környezet.
- `v2/tests/frontend-next-chronology.test.mjs`: történeti sorrend legutóbbi elöl, jövő legközelebbi elöl, dátum nélküli külön kezelve.
- A TEST RPC-k névtelen EXECUTE grantje 2026-11-10-én ellenőrizve: a három Manager-lista, a V2 mass olvasó és a Player olvasó mind `anon=false`, `authenticated=true`. Ez a grant-audit nem helyettesíti a JWT jogosultsági E2E-t.
- Az új, részletes edzés/bérlet/várólista-kódra a teljes GitHub Actions QA **sikeres**: [run 42824842286](https://github.com/beacvolleyCC/club-control-manager/actions/runs/42824842286), commit `41d5bcfa3e791305e109ee2507746e07c6d15fc1`.
- A teljes V2 QA parancs a repó `v2` könyvtárában: `npm install --no-audit --no-fund && npm run typecheck && npm test && npm run build`.
- **Cloudflare deploy blokkoló:** [run 42824842184](https://github.com/beacvolleyCC/club-control-manager/actions/runs/42824842184) megállt a hozzáférés-ellenőrzésnél. A korábbi log alapján a `V2_CLOUDFLARE_API_TOKEN` hiányzik és a `V2_CLOUDFLARE_ACCOUNT_ID` is üres. GitHub `v2-test-preview` environment secrets szükséges; tokent chatbe nem szabad beilleszteni. A Pages projekt megléte sincs igazolva.

## Kézi TEST / telefonos E2E kapu
1. Külön Cloudflare Pages `club-control-v2-test-preview` telepítés létrejötte/sikeres build tényleges URL-lel.
2. Mindkét `/frontend-next/{manager,player}/` útvonal 200 OK, JS/CSS helyesen betöltve, iPhone PWA és desktop böngésző.
3. Létező TEST Manager email: OTP tényleges megérkezése; kódos belépés; a hat független jogosultsági modul RPC-je: egy engedélyezett modul 200/üres lista elfogadva, egy tiltott modul 403, a többi továbbra is működik; ellenőrizni a csapatszintű izolációt is.
4. Jogosulatlan TEST fiók vagy megfelelő jogosultság nélküli teszt: RPC 401/403, **0 adat megjelenítés**, a nem engedélyezett modulok nem láthatók.
5. Létező TEST Player email: OTP; azonosított saját csapat/játékos, események és saját értesítések megjelennek, `myStatus` nem írható.
6. Kijelentkezés alatt indított lassított RPC: korábbi adat később sem jelenhet meg.
7. Tokenlejárat után, oldalfrissítés után: új belépés szükséges, korábbi profil/esemény nem marad.
8. Hiányzó/null dátumok esetén `Nincs időpont`, sosem 1970; időzóna Europe/Budapest.
9. Másik csapat/csoport játékosadataihoz ne legyen hozzáférés; 403/empty/fail-closed.
10. Sem a böngésző Networkben, sem a fájlokban nincs LIVE Supabase RPC-cél vagy privileged key; csak TEST host.
11. Két egymást követő QA kör és visszaállítási útvonal ellenőrzése a V2 pilot előtt.

**Nem futott még:** éles(TEST) felhasználóval végzett böngészős OTP/JWT, negatív szerepkör, mobile E2E, Cloudflare deploy végigvitele. LIVE telepítéshez külön engedély szükséges.


## 2026-11-10 – részletes tömegsportos olvasópanel (aktuális kiegészítés)

- Az edzéskártyán a **Részletek** gomb a már engedélyezett edzés ID-ját használja. A kliens a jogosult listában szereplő ID-val kérhet részletet; a szerver a `mass.trainings` jogot ismét ellenőrzi. A válasz event ID-t és `bookings`/`waitlist` tömböket validáljuk.
- Az edzésrészletben jelentkezők és várólistások névvel, státusszal, bérletszámmal és — ahol van — beküldési idővel jelennek meg. A hiányzó beküldési dátum nem válik 1970-né. A személyes részletek kizárólag jogosult TEST Manager számára érhetők el, a megjelenítés DOM `textContent`.
- A **Várólista összesítése** külön, jogosultságellenőrzött read RPC-t hív; csak az engedélyezett edzéslistában szereplő azonosítók darabszámait mutatja: várakozik, felajánlott, lejárt. Nincs név/email az összesítőben.
- A `mass.passes` jogosultságot a `cc_v2_manager_mass_passes_read_v1` szerveroldalon ellenőrzi. A bérletnézet alapból az aktuális budapesti hónapot tölti, szűrhető kereséssel és hónappal. Nincs bérletírás.
- Részletek, várólista-összesítés és bérletszűrés: külön kérésverzió és `AbortController`; kijelentkezéskor a védett adatnézetek és a hozzájuk kötött token-referencia törlődik.
- Node regresszió ellenőrzi az edzés-ID whitelistet, válaszstruktúrát, 403-as tiltást, hónapvalidációt és a tömböket. A fenti GitHub Actions run-on a teljes teszt és build **sikeres**, de valódi e-mailes OTP/JWT böngészős E2E még hátravan.
