# CLUB CONTROL – pénzügyi Analytics + migrációs PATCH integráció

**Dátum:** 2026. november 21.
**GitHub ág:** `release/finance-analytics-test-20261121`
**LIVE:** változatlan; élesített pénzügyi Analytics nincs.
**TEST DB:** `szzoubvhlwnojtzqjebc`
**LIVE DB:** `snqsxlyhontaepembaic`

## A jelenlegi munkakör eredménye

- A korábbi PR #97 (pénzügyi Analytics és részjogosultság) és PR #98 (verziózott migrációs PATCH-tervező) egyetlen integrált kiadási ágba került.
- **Forráskonfiguráció LIVE-kompatibilis marad**: `config.js` továbbra is a LIVE Supabase-projektre mutat. A `scripts/build-test-finance-analytics.cjs` kizárólag a build kimenetét (`dist-test`) cseréli át TEST-re. A forrás kódjában nincs TEST-only jelzés, de a generált TEST PWA-ban egyedi azonosító, cache, TEST-fejléc és célzott CSP van.
- Új GitHub workflow: `.github/workflows/finance-analytics-test-preview.yml`.
  - Push/PR: mindig generál TEST-csomagot, lefuttatja a pénzügyi jogosultsági regressziót és a PATCH-migrációk statikus ellenőrzését, majd feltölti a TEST artifactot és a release-terveket.
  - Külön TEST Cloudflare Pages deploy: **kifejezett** `workflow_dispatch(deploy_test=true)` + GitHub environment `manager-test` + `vars.CLOUDFLARE_TEST_MANAGER_PROJECT` (névben test/staging) + `secrets.CLOUDFLARE_TEST_ACCOUNT_ID`, `secrets.CLOUDFLARE_TEST_API_TOKEN` szükséges. Nincs automatikus LIVE deploy, nincs Cloudflare LIVE hitelesítés.
  - Az explicit `workflow_dispatch` GitHubon csak akkor használható megbízhatóan, ha a workflow a repository default branchén is regisztrálva van. A `main` azonnal LIVE GitHub Pages deployt indíthat, ezért ezt a kiadást **ne merge-eljük csak emiatt**. A feladathoz a külön TEST hosting konfiguráció / jogosultság szükséges.
- Fagyasztott, négyfájlos és külön jóváhagyással átvezethető schema patch: `.club-control/patches/releases/20261121_finance_analytics_release.json`; hozzáadott négy SQL `.club-control/patches/sql/2026112114200*.sql`. A régi TEST 119 és LIVE 48 migrációs történetét nem egyesítjük.
- TEST pénzügyi DB RPC-k már telepítve és korábban tranzakcióban, visszagörgetéssel tesztelve. **A LIVE-ra egyik SQL-patch sem lett alkalmazva.**

## A pénzügyi modul funkciói

1. Jogosultság: csapat × díjtípus × megtekintés/szerkesztés, plusz tömegsport és külön funkciók.
2. Pénzügyi összesítések: edzői díj, bérlet/tagdíj, versenyengedély, hónap, csapat, fizetési mód, címzett.
3. Tömegsport bérletek: értékesítés, darabszám és ismert ár szerinti bontás; szintetikus vásárlások kizárva.
4. Edzésanalitika: foglalások, megjelentek, férőhelyek, lemondások, szint és idősáv.
5. Szűrhető táblázatok, CSV-export, elmenthető egyéni kimutatások, auditált szerkesztés.
6. TEST-demóadatok kizárólag nézetként, jól jelölve, nem valódi bevétel.

## Ellenőrzött adatállapot (2026. november 21.)

- LIVE `cc_player_fee_meta_v2382`: 194 rekord; LIVE `mass_passes`: 385 rekord; LIVE `mass_events`: 83; LIVE `mass_bookings`: 1270.
- TEST-ben az új `cc_finance_acl_v1`, `cc_finance_saved_views_v1`, `cc_manager_finance_analytics_v1` és `cc_manager_finance_override_scoped_v1` létezik, LIVE-ban még nem.
- A két környezetben a meglévő pénzügyi, csapat- és tömegsport táblák fő mezői egyezőnek látszanak. **Ez nem helyettesíti** az összes SQL-függvény és jogosultság telepítés előtti ellenőrzését.

## Mi nincs kész – élesítési akadályok

1. A dedikált Cloudflare Manager TEST hosthoz tartozó token, Account ID és projektváltozó GitHub-környezeti hozzáférése ebben a munkakörben nem volt ellenőrizhető. **Nincs igazolt új publikus TEST URL, nincs sikeres Cloudflare TEST deploy** (a CI tesztcsomag viszont sikeresen készült).
2. Bejelentkezett TEST UI/E2E külön admin, csak egy csapatot és csak egy díjtípust látó admin, valamint írásjog nélküli admin szerepkörrel **nem történt meg**. A CI-egységtesztek nem helyettesítik.
3. Kifejezett LIVE migráció-előellenőrzés, éles backup/rollback és az új RPC-k LIVE-adat melletti tesztje még hiányzik. Az SQL kiadás-jegyzék **csak terv**.
4. Ebből következően LIVE Manager deploy, SQL migráció vagy PR merge **nem történt**, és nem biztonságos ezt késznek tekinteni.

## Biztonságos következő végrehajtási sorrend

1. Külön Cloudflare Manager TEST projekt nevének és fenti GitHub environment három hitelesítő/konfigurációs elemének beállítása.
2. A külön, TEST branchre épített `dist-test` csomag dedikált TEST deploymentje (nem `main`).
3. Böngészős és mobilos jogosultsági, mentési, export és Player/Manager regressziós tesztek.
4. LIVE jelenlegi adatbázis-séma és funkcióspecifikus grantok ellenőrzése, backup/verzió visszaállíthatóság igazolása.
5. Csak ezen vizsgálatok után az új, célzott additív pénzügyi SQL patch-ek alkalmazása LIVE-ra és a hozzájuk illő Manager frontend külön élesítése.
6. Üzemelő LIVE appban darabszámok, jogosultsági korlátozások, audit és adatforrások ellenőrzése.

**Kritikus garancia:** a LIVE és TEST klubadatai külön maradnak; a PATCH csak ellenőrzött alkalmazáskódot és szükség esetén kompatibilis struktúrát vezet át, személyes/finanszírozási rekordokat nem másol.
