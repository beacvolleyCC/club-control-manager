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
| Manager | `cc_v2_manager_read_v1` | `trainings`, `matches`, `players`; csapatnév csak ezekből | külön moduljogosultság-felderítés, teljes pénzügy/statisztika, eseményírás |
| Player | `cc_v2_player_read_v1` | `bootstrap.team`, `bootstrap.player`, `bootstrap.events` (`dateLabel`, `timeLabel`, `myStatus`), `notifications.items` | RSVP írás, hivatalos tabella, jegyzőkönyv |
| Közös | `/auth/v1/otp`, `/auth/v1/verify` | email OTP belépés, JWT csak memóriában | valós SMTP/email OTP és JWT böngészős E2E |

- A kliens a TEST originre van rögzítve, az RPC-k whitelistje csak a két olvasó endpointot engedi.
- Ismeretlen `schemaVersion`, 401/403, üres vagy hiányos adat esetén a UI nem mutat demó- vagy jogosulatlan adatot.
- A védett navigáció sikeres betöltés előtt rejtett; nincs frontend-only feltételezett adminjog. A server oldali `cc_manager_* / cc_player_*` RLS/jogosultsági ellenőrzések az irányadók.
- Kijelentkezés, munkamenet-lejárat vagy újabb kérés megakadályozza a későn visszatérő adatok képernyőre kerülését. Nincs tartós JWT-tárolás.
- UI a dinamikus TEST stringeket DOM `textContent`-tel jeleníti meg; nincs HTML-kód injektálás.
- A Player `myStatus` jelenleg csak olvasható: **a gombok hiánya szándékos**, addig nem látszik működő mentés, amíg nincs hitelesített író szerződés.
- Manager összetett olvasó RPC: ha egy részmodulhoz nincs joga, a teljes lekérés hibázhat; ez egyelőre fail-closed. Granuláris hozzáférés-szerződést kell bevezetni a valódi modulonkénti hozzáféréshez.

## Automatikus ellenőrzések
- `v2/tests/frontend-next-test-session.test.mjs`: OTP nem regisztrál új fiókot; késői token nem éleszt munkamenetet; tokenlejárat; elutasított write RPC; invalid schema; 403; ISO időablak.
- `v2/tests/frontend-next-manager-read.test.mjs`: két felület csak az engedélyezett olvasó RPC-ket és megfelelő DB-mezőket használja, no direct table writes.
- `v2/tests/player-frontend-next.test.mjs`: HTML/navigáció/reszponzivitás/ESM parse/szétválasztott TEST környezet.
- A teljes V2 QA parancs a repó `v2` könyvtárában: `npm install --no-audit --no-fund && npm run typecheck && npm test && npm run build`.
- **A jelen módosításokhoz tartozó teljes CI végállapotát nem igazolta automatikus futási visszajelzés a kézikönyv megírásakor.** Nem tekinthető zöldnek pusztán a tesztfájl létrehozása miatt.

## Kézi TEST / telefonos E2E kapu
1. Külön Cloudflare Pages `club-control-v2-test-preview` telepítés létrejötte/sikeres build tényleges URL-lel.
2. Mindkét `/frontend-next/{manager,player}/` útvonal 200 OK, JS/CSS helyesen betöltve, iPhone PWA és desktop böngésző.
3. Létező TEST Manager email: OTP tényleges megérkezése; kódos belépés; `cc_v2_manager_read_v1` 200, engedélyezett adat, elkülönített csapatszűrés.
4. Jogosulatlan TEST fiók vagy megfelelő jogosultság nélküli teszt: RPC 401/403, **0 adat megjelenítés**, a nem engedélyezett modulok nem láthatók.
5. Létező TEST Player email: OTP; azonosított saját csapat/játékos, események és saját értesítések megjelennek, `myStatus` nem írható.
6. Kijelentkezés alatt indított lassított RPC: korábbi adat később sem jelenhet meg.
7. Tokenlejárat után, oldalfrissítés után: új belépés szükséges, korábbi profil/esemény nem marad.
8. Hiányzó/null dátumok esetén `Nincs időpont`, sosem 1970; időzóna Europe/Budapest.
9. Másik csapat/csoport játékosadataihoz ne legyen hozzáférés; 403/empty/fail-closed.
10. Sem a böngésző Networkben, sem a fájlokban nincs LIVE Supabase RPC-cél vagy privileged key; csak TEST host.
11. Két egymást követő QA kör és visszaállítási útvonal ellenőrzése a V2 pilot előtt.

**Nem futott még:** éles(TEST) felhasználóval végzett böngészős OTP/JWT, negatív szerepkör, mobile E2E, Cloudflare deploy végigvitele. LIVE telepítéshez külön engedély szükséges.
