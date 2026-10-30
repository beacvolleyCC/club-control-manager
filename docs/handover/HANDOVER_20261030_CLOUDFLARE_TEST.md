# Club Control – TEST handover (2026-10-30)

## Rövid állapot
Ez a dokumentum a 2026-10-28-i handover folytatása, és a 2026-10-30-i beszélgetésből visszanyert információkat rögzíti. A futó rendszer teljes auditja és az új branch HEAD-ek ellenőrzése a következő munkamenet feladata; a beszélgetésből ismert sikeres felhasználói teszt nem egyenlő teljes end-to-end QA-val.

### Legutóbbi érdemi változás
- A **Manager TEST Cloudflare Workers** publikálása sikerült.
- Felhasználó által tesztelt TEST URL: **https://cc-manager-test-beac.elteroplabda.workers.dev**
- Az e-mailes belépési link / visszairányítás hibája után a bejelentkezési folyamatot javítottuk, és a felhasználó 2026-10-30-án sikeresen belépett a Manager TEST-be.
- Ez **Workers**-telepítés, ne keverd össze a korábbi, tervezett Cloudflare **Pages** projekttel. Az előző handover „nincs TEST HTTPS-cím” megállapítása a Managerre nézve elavult.
- **Player TEST külön Cloudflare telepítése és valódi böngészős végponttesztje következik**. Nem szabad kitalálni Player TEST URL-t.
- A sikeres belépés nem bizonyítja automatikusan az összes Manager API-művelet, RSVP-írás, PWA/offline funkció vagy Player Auth helyességét.

## Repositoryk / elválasztás
| Komponens | Repository | TEST branch |
|---|---|---|
| Manager | beacvolleyCC/club-control-manager | test/20261026-manager-document-intake |
| Player | beacvolleyCC/player_application | test/20261026-isolated-player-mobile |

- LIVE Supabase ref: `snqsxlyhontaepembaic`.
- TEST Supabase ref: `szzoubvhlwnojtzqjebc`.
- LIVE: mindkét GitHub `main`, az éles PWA-k és LIVE Supabase **tilos módosítani külön, konkrét felhasználói engedély nélkül**.
- Új/rendszerezett fejlesztés: külön TEST/vNext ágakon; modulszintű ellenőrzés és csak utána engedélyezett patch a LIVE-ba.
- A TEST 2026-10-28-as részletes adatbázis- és jogosultsági állapotát lásd az előző átadásban. Az akkori darabszámokat és commit SHA-kat ne kezeld frissnek.

## Korábbi részletes dokumentumok
- `docs/handover/HANDOVER_20261028_CC_TEST_CONTINUATION.md` – backend/DB státusz, RLS, Cloudflare build, 11 pontos QA
- Player `docs/TEST_RSVP_RELIABILITY_STAGE11_20261028.md` – optimista RSVP megbízhatóság és automatizált teszt
- Player Issue #31 – valós Auth + RSVP end-to-end ellenőrzés
- Manager Issue #81 – csapattagság `starts_on` ellenőrzés hiánya az RLS-segédlekérdezéseknél

## Biztonsági és funkcionális hiányok
1. A Manager TEST sikeres bejelentkezése után a funkciók és RPC-hívások ellenőrzése szükséges.
2. Player TEST publikálása, hitelesítés, RSVP pozitív mentés / reload, hibakezelés, offline és iOS PWA tesztek még hátravannak.
3. Manager Issue #81: jövőbeli tagság kezdőnapját is ellenőrző, szűk TEST-only RLS-javítás; **nincs RLS-bypass vagy széles anon jog**.
4. Player Issue #31: a korábbi 7/7 egységteszt és 6/6 workflow pass önmagában nem helyettesíti a valódi end-to-end tesztet.
5. A TEST nem teljesen LIVE-paritású; a hiányzó Manager írási RPC-k és Player funkciók tételes átvizsgálása szükséges.
6. A teljes LIVE játékosnévsor TEST-be történő átmásolása korábban nem történt meg; a szintetikus adatok és személyes adatok kezelése legyen elkülönítve.
7. A női BB1, BB2/B és férfi bajnoki osztályokat/táblázatokat tilos összekeverni.
8. Az állásrend és pontozás egyesített nézetének végleges UI/UX rajza még nincs készen; nagy redesign ne történjen rajz nélkül.

## Következő munkamenet – prioritás
1. Ellenőrizd a Manager és Player TEST branch friss HEAD-jeit, CI/Actions állapotát, valamint a Cloudflare aktuális deploy-beállításait. A Manager TEST URL-t és a TEST Supabase célzást külön ellenőrizd; a LIVE nem módosítható.
2. Ellenőrizd a Manager TEST képernyőit a sikeres belépést követően: csapatválasztó, naptár, események, jelenlét, meccs és tabella; minden backend-írást jogosultsággal együtt.
3. Készíts/ellenőrizz külön Player TEST deploymentet, és csak ténylegesen létrejött HTTPS URL-t közölj. Ellenőrizd az e-mailes auth redirectet és callbacket, hogy ne jöjjön vissza az előző link-vs-kód hiba.
4. Player TEST session, RSVP és böngésző/PWA végpontok ellenőrzése.
5. Manager #81 biztonságos TEST javítása és negatív jogtesztjei; Player #31 csak sikeres end-to-end után zárható.
6. Új moduloknál 2026-10-30-tól az explicit Supabase public GRANT szükségességét is ellenőrizd.
7. Minden módosítás után kétszeri ellenőrzés és a korábbi handoverben dokumentált 11 pontos QA. Költségkeret: **0 Ft**; ne kapcsolj be fizetős szolgáltatást/push vagy SMTP küldést engedély nélkül.

## Új beszélgetés indító
**CC-FOLYTATÁS – 2026.10.30 HANDOVER**

Folytassuk a Club Control fejlesztését a `beacvolleyCC/club-control-manager` és `beacvolleyCC/player_application` TEST ágakon. Olvasd el a `docs/handover/HANDOVER_20261030_CLOUDFLARE_TEST.md` és a `docs/handover/HANDOVER_20261028_CC_TEST_CONTINUATION.md` fájlokat. A Manager TEST Cloudflare Workers címe `https://cc-manager-test-beac.elteroplabda.workers.dev`, és a legutóbbi beszélgetésben sikeresen bejelentkeztünk az auth-link javítása után. Következő feladat a Player TEST publikálás és end-to-end ellenőrzés, illetve a Manager funkcióteszt. A LIVE main/GitHub Pages/Supabase projektet soha ne módosítsd külön engedély nélkül. Nyitott Player #31 és Manager #81. Friss HEAD/CI/Cloudflare célpont ellenőrzéssel kezdj, majd 2× és 11 pontos QA, 0 Ft-os keret.
