# Club Control – LIVE Meccsek: halvány csapatszínes kártyák, ikon–helyezés sorrend

**Dátum:** 2026-11-15
**Környezet:** V1 LIVE Manager és Player, V2 TEST változatlan.

## Megjelenés

- A Manager **Versenysport → Meccsek → Összes BEAC csapat** listájában a szín az adott csapat Managerben tárolt színéből érkezik. Az edzésekhez hasonló, nagyon halvány (4–10%-os) színes kártyaháttér helyettesíti a korábbi vastag, telített oldalsávot.
- A kategóriajelzés (Női I., Női II/B, Férfi I/A, Férfi I/B) megmarad; a külön csapatra szűrt kártyák és a Player kártyák nem kapnak új kategóriaszínt.
- Mindkét alkalmazás következő meccskártyájának sorrendje: **mini SVG trendikon → keret nélküli részleges helyezés (például 3.) → csapatnév**, alatta a korábbi zöld/piros formaeredménypontok.
- A részleges helyezés hivatalosként továbbra sincs feltüntetve; a `title`/tooltip tájékoztatás megmarad.
- A különböző bajnokságok csoportszínei a már meglévő csapatszín-beállításokkal együtt változnak; nincs új adatforrás.

## Hatókör és tesztek

- Manager: `app.js`, `styles.css`, regressziós tesztek, PWA cache `20261115-soft-match-cards-v5`.
- Player: `app.js`, `styles.css`, regressziós tesztek, PWA cache `20261115-trend-first-v4`.
- Nincs SQL-migráció, adatbázis-írás, meccseredmény-módosítás, jogosultságváltozás vagy V2-módosítás.
- QA és GitHub Pages LIVE telepítés ellenőrizendő, iPhone/böngészős bejelentkezett vizuális E2E külön szükséges.

**Folytatási kulcs:** `CC-FOLYTATÁS – SOFT MATCH TINT + TREND FIRST`.
