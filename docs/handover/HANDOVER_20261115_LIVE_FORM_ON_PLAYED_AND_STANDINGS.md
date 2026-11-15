# Club Control LIVE – aktív formaindikátor a lejátszott meccseken és tabellákon

**Dátum:** 2026-11-15
**Környezet:** V1 LIVE Manager + Player (V2 TEST érintetlen)
**Projekt:** `beacvolleyCC/club-control-manager`, `beacvolleyCC/player_application`
**Ág:** `feature/live-played-match-current-form-20261115` mindkét repóban

## Cél

Ugyanazt a közös adatbázisban számolt aktuális csapatformát használjuk a közelgő és már lejátszott meccskártyákon, továbbá a Manager és Player bajnoki tabelláin. Ez élő, mai állapotot bemutató jelzés, **nem a történelmi mérkőzés pillanatában fennálló rangsor**. A trendnyíl a csapatforma alakulását mutatja, **nem a tabellabeli helyezés változását**.

## Eredmény

- Manager meccsek: `ccMatchScoreboardHtml_` már nem tiltja a `ccFormCardLine_` renderelését lejátszott mérkőzésen. A tényleges meccseredmény és a játszmák változatlanok.
- Player meccsek: `ccPlayerScoreboardHtml_` a meglévő `ccPlayerFormLine_` komponensét használja lejátszott és közelgő kártyán egyaránt.
- Manager Áttekintés tabellái (`standingsCard_`), teljes Tabella (`renderManagerStandings_`) és a mentett tabella nézete: helyezés az eredeti első oszlopban; a csapatcellában először a kis SVG trend, utána logó + név, a név alatt legfeljebb 5 W/L színes pont.
- Player aktuális és mentett táblák (`ccMrszPlayerMainScreenshotHtml_`, `renderCompetitionStandings_`), férfi A/B fallback: rögzített első oszlopban a helyezés, a csapatcellában SVG trend + logó + név, a név alatt az eredménypontok. A jobb oldali statisztikai oszlopok görgethetők maradnak; a rögzített és görgethető sorok magassága egyező.
- **Nincs új SQL számítás**: a jelzés csak a meglévő `canonicalFormCards` snapshotot keresi vissza `competitionLabel` és normalizált pontos csapatnév alapján. Hiányzó/ambivalens egyezés esetén nincs kitalált formajelzés.
- A helyezés a tabella meglévő `position` oszlopában marad, nincs megduplázva, a részleges/nem hivatalos státuszra vonatkozó megjegyzések változatlanok.

## Ellenőrzés

Manager regresszió: `tests/scoreboard-match-cards.test.cjs`, `tests/manager-standings-filters.test.cjs`.
Player regresszió: `tests/protocol-match-order-20261019.test.cjs`, `tests/player-form-mini-canonical.test.cjs`, valamint külön men A/B import-tesztek.
Bejelentkezett tényleges mobilos és asztali vizuális E2E nem automatizált, külön ellenőrzendő.

## Kiadás, rollback

- Manager PWA cache: `20261115-live-standings-form-v6`.
- Player PWA cache: `20261115-live-standings-form-v5`.
- Frontend-only; nincs LIVE Supabase adatírás, RLS módosítás vagy V2 TEST telepítés.
- Rollback: kizárólag az adott két frontend merge commit revertje; nem kell SQL visszaállítás.

**Folytatási kulcs:** `CC-FOLYTATÁS – LIVE FORM ON PLAYED + STANDINGS`.
