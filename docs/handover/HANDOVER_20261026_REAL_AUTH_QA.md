# CC-FOLYTATÁS — valós Manager/Player bejelentkezési QA, 2026-10-26

**Kiadásjelölt: Manager draft PR #79. NEM éles.** Player draft #28 változatlan; Manager #74/#76 összevont release candidate, Manager #77/#80 külön security QA.

## Mi készült el
- `scripts/qa/live-competition-auth-rpc.cjs`: Node 22, kizárólag HTTPS **GET**, **csak elkülönített STAGING Supabase-projekten**, whitelist a két STABLE `cc_*_competition_mrsz_snapshot_v2` RPC-re. Valós, külön tesztfiók JWT-jeivel és publishable API kulccsal fut. Nem használ `service_role`, nem futtat SQL DML/DDL-t és nem jelentkeztet be vagy hoz létre felhasználókat.
- 8 valós hozzáférési próba: névtelen Manager/Player deny, jogosult Manager allow, nem jogosult Manager deny, aktív Player allow, inaktív Player deny, lejárt csapattagságú Player deny, kívülálló Player deny.
- A sikeres válaszban az `ok=true`, canonical `matchId`, `sourceKey`, `competitionLabel`, pontos match count, valamint a külön UUID-k ellenőrzése történik. A teszt **nem menti és nem írja ki** a JSON-adatokat.
- A `tests/live-competition-auth-rpc-20261026.test.cjs` kizárólag mocked hálózattal teszteli magát a teszteszközt. **Az automatikus CI zöld állapota nem jelenti, hogy valós JWT-vel is lefutott.**

## Használat zárt, megbízható tesztgépen
A tesztfiókok már létező, engedélyezett tesztfelhasználók legyenek. JWT-jüket a Supabase test sessionből külön, biztonságos környezetben kérd le, **ne küldd chatbe és ne tedd GitHub titkosítatlan workflow/log mezőbe**. Ne használj élő sportolók tokenjeit.

Környezeti változók (értéküket ne naplózd):
- `CC_TEST_PROJECT_REF`, `CC_TEST_SUPABASE_URL` (pontos `https://<ref>.supabase.co`), `CC_TEST_PUBLISHABLE_KEY`
- `CC_TEST_ENV=staging` (a valós Club Control LIVE projektazonosítója **kódból tiltott**; az éles projekten a teszt nem indítható)
- `CC_TEST_EXPECT_MATCHES=298` (a végleges 2026/27-es canonical lista)
- `CC_TEST_MANAGER_ALLOWED_JWT`, `CC_TEST_MANAGER_DENIED_JWT`, `CC_TEST_PLAYER_ALLOWED_JWT`, `CC_TEST_PLAYER_INACTIVE_JWT`, `CC_TEST_PLAYER_EXPIRED_MEMBERSHIP_JWT`, `CC_TEST_PLAYER_OUTSIDER_JWT`

Futtatás: `node scripts/qa/live-competition-auth-rpc.cjs`.

Várható: pontosan 8 `PASS` sor és egy összegzés **elkülönített staging környezetben**. Bármely váratlan 200-as jogosulatlan válasz, 401/403 a jogosult fióknál vagy hibás canonical payload **nem PASS**. Ha a v2 RPC nincs telepítve a célkörnyezetbe, a teszt is FAIL. Tokenekről semmilyen részletet nem ír ki.

### Miért nem üres a cross-team lekérdezés?
Az aktuális `cc_player_competition_mrsz_snapshot_v1()` ellenőrzi az **aktív csapattagságot**, majd a v2 teljes 2026/27-es szövetségi menetrendet adja át, nem csak az adott sportoló egyetlen csapatát. Ez a bajnokságok/tabellák felületéhez szükséges; nem jogosít más csapatok személyes edzés/RSVP adatainak olvasására. Az ennél részletesebb per-player/per-team magánadatokat külön RPC-k és tesztek védjék.

## Még nem igazolt
- **Ezeket a JWT-teszteket még NEM futtattuk valódi tesztfiókokkal.**
- A Player/Manager tényleges UI, iPhone 11/Safari és standalone PWA, VoiceOver, safe-area, cache/offline próba továbbra is nyitott.
- LIVE Supabase migráció, merge és deploy nincs jóváhagyva és nem történt meg a QA elkészítése miatt.

## Kiadási szabály
Csak a felhasználó külön release döntése után jöhet az atomikus #74 overlay, Manager #79 + Player #28 kontrollált release, rollback, utóellenőrzés és kétkörös 11× QA. Nem indítjuk újra a 41 régi BRSZ alias általános vizsgálatát.

## 2026-10-26 — éles adatok ellenőrzése és a GET mellékhatásának felismerése

A PostgreSQL LIVE függvénydefiníciókból kiderült, hogy a `public.cc_manager_competition_mrsz_snapshot_v2()` → `v1` → `private.cc_manager_current_account_v1()` lánc **ha egy aktív Manager-fiók auth_user_id-ja NULL**, a lekérés közben `UPDATE public.manager_accounts` és `INSERT public.audit_log` műveleteket végezhet. Az HTTP GET **nem egyenértékű** egy PostgreSQL READ ONLY tranzakcióval. Ezért a korábbi, valós LIVE környezetre engedélyező flag félrevezető volt.

**Védelem elkészült:** a harness a közismert Club Control LIVE Supabase projekt-referenciát `snqsxlyhontaepembaic` név szerint blokkolja még akkor is, ha `CC_TEST_ENV=staging` értéket adnak meg. Production mód mindig tiltott, a régi `CC_CONFIRM_LIVE_READONLY` flag is elutasítást eredményez. Az offline CI szimulálja a téves staging-címkézést és bizonyítja, hogy **nem kezdeményez HTTP-kérést**.

**Éles jogosultsági készlet; csak összesített SELECT** (2026-10-26): 3 aktív Manager, 0 hozzá nem rendelt auth ID, 2 már bekötött mérkőzésmegtekintő Manager + 1 már bekötött, e jog nélkül; 45 aktív, jogosult Player; 0 inaktív és 0 kizárólag lejárt tagságú, belépési azonosítóhoz kapcsolt Player. Ezek **valódi sportolói/adminisztrátori fiókok, nem tesztfiókok**. Külön felhatalmazás nélkül nem használjuk őket QA-ra és nem változtatunk státuszokat teszt kedvéért.

Reprodukálható, személyes azonosítót nem megjelenítő read-only előellenőrzés: `sql/cc_release_test_persona_inventory_readonly_20261026.sql`.

A teljes valós bejelentkezési próba **egy elkülönített Supabase staging projektet és önálló, szintetikus tesztidentitásokat** igényel: jogosult/nem jogosult Manager, aktív/inaktív/lejárt tagságú Player és kívülálló. Staging-projekt létrehozása, tesztfiókok bejegyzése, jelenlegi LIVE felhasználók módosítása, adatmásolat, közösségi tokenek begyűjtése vagy LIVE SQL-apply **nem történt**. A valós iPhone/Safari QA továbbra is külön release-gate.
