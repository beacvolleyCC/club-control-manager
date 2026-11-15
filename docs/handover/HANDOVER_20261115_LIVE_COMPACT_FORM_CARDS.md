# Club Control LIVE – központi meccskártya-helyezés és formajelzés

**Dátum:** 2026-11-15  
**Érintett rendszer:** Manager V1 LIVE + Player V1 LIVE  
**LIVE Supabase:** `snqsxlyhontaepembaic`  
**V2 TEST:** változatlan; PR #89 továbbra is draft.

## Megvalósítás

- A közös kanonikus eredményadatokból számító `private.cc_competition_team_form_cards_v1()` függvény a LIVE Supabase-ben.
- Mindkét, már korábban jogosultságellenőrzött snapshot RPC (`cc_manager_competition_mrsz_snapshot_v2`, `cc_player_competition_mrsz_snapshot_v2`) ugyanazzal az új `canonicalFormCards` adattal bővült. Új public/részletes egyéni adatokat kiadó végpont, külön Player- vagy Manager-adatbázis nincs.
- GitHub forrás: `sql/cc_live_20261115_canonical_form_cards_v1.sql`.
- Manager: `beacvolleyCC/club-control-manager`, `main`, `app.js` és `styles.css`; Player: `beacvolleyCC/player_application`, `main`, `app.js` és `styles.css`. **Csak a meccs előtt álló/eredmény nélküli** kártyákon jelenik meg a kompakt sor, hogy egy múltbeli eredmény mellett ne jelenjen meg anachronisztikus mai forma.
- A formajelzés elemei: `1.*` részleges helyezés; `↑` zöld javuló; `↓` piros romló; `→` szürke stagnáló/kevés adat; a legfeljebb öt korábbi eredmény zöld/piros pöttyként.
- Formasorrend: az utolsó öt rögzített eredmény balról jobbra régebbitől újabb felé.
- Forma trend: 0–1 eredményből semleges, mert elégtelen az adat. 2–3 eredménynél az utolsó két mérkőzés összevetése (V→GY: javuló; GY→V: romló; azonos: semleges), explicit `last_match_vs_previous_match_limited` jelöléssel. Legalább 4 eredménynél a legutóbbi kettő győzelmeinek száma az előző kettőével összevetve (`last_2_vs_previous_2_wins`). Ez nem sztochasztikus meccsgyőzelmi esély és nem állít megalapozatlan százalékot.
- Részleges helyezés: csapatok rangsorolása elkülönítve teljes `competitionLabel` szerint; 2 pont a győzelemért, 1 a vereségért, ki nem állás 0 (a korábbi `forfeits` adat). Másodlagos sorrend győzelmek, szettkülönbség, nyert szettek és név. A szerver `officialRankVerified:false` értékkel adja vissza, a frontend `* ` jelöléssel; NEM hivatalos tabella, holtverseny esetén az egyszerűsített rangsor nem helyettesíti a BRSZ valamennyi rangsorolási szabályát.
- Női II/A hiányos bajnokság: helyezés üres, trend semleges, hamis állítás nincs.
- Klubnév kapcsolása a meglévő normalizált névfüggvényekkel; a jogosultsági szabályok és a Player league visibility változatlan.
- PWA-k gyorsítótára frissítve: `20261115-form-mini-v1` a Player és Manager asset hivatkozásokban/szervizmunkásokban. Régi telepített telefonos verzió frissítése a service worker kontrolljától függ; valós iPhone böngészős próba nem történt.

## Ellenőrzés

- Az SQL függvény LIVE lekérdezése sikeres. A férfi I/B csoportnál a részleges eredményekből a BEAC forma `W,L,W`, `up`, helyezése `1.*`; a MAFC-Vásárhelyi forma `W,L`, `down`, helyezése `4.*`. A BEAC II. két rögzített győzelemből `flat`, `1.*`.
- Öt bajnoki csoport külön `competitionLabel` partíció, eltérő osztályok nem keverednek.
- Manager / Player GitHub Actions ellenőrzések: külön `scoreboard-match-cards.test.cjs` és `protocol-match-order-20261019.test.cjs` regressziós tesztek a jelzésre.
- A kiinduló LIVE `competition_source_standings` táblában továbbra is nincs hivatalosan kitöltött helyezés (`position=null`), a kanonikus forrásban 35 rögzített lezárt mérkőzés volt a munkakör során. Emiatt **nem** állítunk hivatalos rangsort, és az új `rank` csak rögzített eredmények alapján számított részleges sorrend.
- Az éles betöltés jelenlegi GitHub Pages deploy workflow-val történik, az éles oldalak megjelenése nem ellenőrzött tényleges bejelentkezett telefonon. Ha nincs frissülés, ellenőrizd a SW cache-t és a redeploy folyamatot.

## Későbbi fejlesztések

- BRSZ hivatalos teljes tabella/rangváltozás-idősor közös forrásként importálása; csak azután lehet hivatalos helyezést és helyezésváltozás-nyilat mutatni.
- Teljes rögzített eredményállomány, különösen női II/A és II/B pótlása; a jelenlegi forma csak ismert eredményekből számol.
- Opcionális későbbi, adatfedezettséggel jelölt matematikai meccselőrejelzés; a mostani nyíl kizárólag közelmúltbeli eredmények **trendje**, nem valószínűségi meccstipp.

**Elkülönítés:** V2 munkához, Supabase TEST-hez és V2 PR #89-hez nem nyúltunk.
