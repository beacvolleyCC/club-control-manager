# CLUB CONTROL – FINANCE ANALYTICS TEST HANDOVER
**Dátum:** 2026-11-16 · **Környezet:** kizárólag TEST · **LIVE:** változatlan

## Elérhetőség / verzió
- Repository: `beacvolleyCC/club-control-manager`
- Fejlesztési ág: `test/finance-analytics-scoped-20261116`
- Draft PR: https://github.com/beacvolleyCC/club-control-manager/pull/97
- TEST Supabase: `szzoubvhlwnojtzqjebc` (nem LIVE: `snqsxlyhontaepembaic`)
- TEST konfiguráció: `config.js`, `TEST_ONLY:true`; csak TEST URL és aktivált publishable key.
- Külön PWA-azonosító: `MGR TEST`; külön `cc-manager-20261116-test-finance-analytics-v1` cache; látható TEST banner.
- Cloudflare TEST build: `node scripts/build-test-finance-analytics.cjs` → `dist-test`.
- CI TEST csomag: https://github.com/beacvolleyCC/club-control-manager/actions/runs/43855906859, `club-control-manager-finance-analytics-TEST` artifact.
- A Cloudflare TEST-projektbe való **webes publikálás jelenleg nem igazolt**. NEM szabad LIVE Pages vagy LIVE Worker projektre/branchre rákapcsolni.

## Implementált képességek
1. Pénzügyi részjogosultság csapat és díjtípus szerinti megtekintéssel / szerkesztéssel; külön mass pass, mass training, audit, settings jogok.
2. Admin jogosultságszerkesztő: új részjogok beállítása, külön az örökölt/klubszintű `competition.fees` jogoktól.
3. Jogosultság alapján szűrt, read-only analytics RPC: `cc_manager_finance_analytics_v1`. Más csapat/díjtípus adata nem adható vissza; több aktív csapathoz köthető, nem egyértelmű pénzügyi tételek kizárva.
4. Pénzügyi bevétel (csak fizetettként rögzítve, ismert összeg), függő tételek, csapat, díj, hónap, fizetési mód és kedvezményezett.
5. Tömegsport-bérletek: szint és hónap szerinti csoportosítás, szintenként darabszám/azonosítható ár; szintetikus `notRealPurchase` importok kizárva.
6. Edzés-statisztika: jelentkezések, validált jelenlétek, férőhelyek, lemondások, szint és napszak szerinti bontás.
7. Menthető személyes riportkonfigurációk, CSV-export (Excel-képlet-injekció elleni mezőkezeléssel).
8. Szűkített jogosultságú, naplózott pénzügyi szerkesztési RPC: `cc_manager_finance_override_scoped_v1`, külön megtekintés/szerkesztés check.
9. A kevés adatú TEST esetén külön feliratozott, kapcsolható **kitalált mintaadatok**. A mintaadatokból nem lesz tényleges bevételi rekord.

## Migrációk (csak TEST Supabase)
- `sql/20261116_test_finance_analytics_acl_saved_views.sql`: ACL + mentett nézetek táblái, RLS, GRANT szűkítés, scopes/ACL update/saved reports RPC.
- `sql/20261116_test_finance_analytics_scoped_feed.sql`: hozzáférésszűrt analytics.
- `sql/20261116_test_finance_scopes_current_fix.sql`: scopes RPC sorrend/név javítás.
- `sql/20261116_test_finance_scoped_override.sql`: auditált díjmódosítás.

## Ellenőrzések
- TEST SQL tranzakcióban ideiglenesen csapat + `coach_fee` megtekintési jogra korlátozva: `scope_count=1`, csak edzői díj rekordok, `hidden_passes=0`, `hidden_trainings=0`, `cannot_edit=false`, `can_view=true`. Tranzakció `ROLLBACK`, nem maradt adatváltozás.
- DB szerepkör: új RPC-k `authenticated EXECUTE` igen; `anon EXECUTE` nem; ACL és mentett nézet táblák RLS-re állítva és közvetlen Data API GRANT nélkül.
- `tests/test-finance-analytics-scoped.test.cjs`: TEST izoláció, jogok, minta provenance, ügyféloldali regressziók.
- A TEST-ág automatizált GitHub ellenőrzései zöldek, a tesztcsomag létrejött.
- `app.js`, `finance-analytics.js` és `sw.js` szintaktikája ellenőrizve.
- Bejelentkezett, valódi mobileszközös TEST UI E2E és külön jogosultságú tesztfiókokkal végzett írási integráció még hátravan.

## Korlátok
- TEST adatállomány kevés (az első felméréskor 7 tömegsport esemény, 1 foglalás, 2 szintetikus bérlet). Az árazás hiányos; hiányzó ár nem számolható tényleges bevételnek.
- Szintetikus demóadatok nem kerülnek az adatbázisba.
- A Cloudflare TEST host / pontos TEST URL nincs ellenőrizve, ezért a branch nem tekinthető élesített TEST weboldalnak.
- A GitHub PR szándékosan DRAFT; **main-be merge tilos**, mert `main` LIVE Manager telepítését indítaná.

## Folytatás / ellenőrzendő
1. A kész `dist-test` artifactot kizárólag a külön `cc-manager-test-beac` Cloudflare Pages TEST projektre publikálni, és igazolni a címet. Ne a LIVE Pages projektbe.
2. TEST jogosultsági E2E: admin teljes hozzáférés, csak Női I. edzői megtekintés, egycsapatos szerkesztés, jogosultság nélküli hozzáférés, CSV export.
3. Testadatok validálása és szükség esetén külön jelölt QA-vásárlások; valódi bevételi jelentések csak hiteles árakból.
4. Browser/iPhone PWA és cache frissítés ellenőrzése.
5. Csak sikeres TEST visszajelzés után külön jóváhagyással tervezni LIVE deployt.
