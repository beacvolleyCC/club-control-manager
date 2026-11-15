# Club Control – LIVE meccskártyák: csillag nélküli helyezés + SVG trendikon

Dátum: 2026-11-15
Környezet: V1 LIVE frontend, V2 TEST nem változik.
Manager: `beacvolleyCC/club-control-manager` / PR #92
Player: `beacvolleyCC/player_application` / PR #33

## Változtatások

- A közelgő meccsek kártyáin a korábbi `4.*` helyett `4.` a kijelzés; a Manager Áttekintés tabella `Hely*` fejléce és `1.*` helyezései is elvesztik a csillagot. A *részleges, nem hivatalos* jelleg marad a helyezés `title` attribútumában és az Áttekintés alatti tájékoztató szövegben.
- A Unicode `↗`, `↘`, `→` trendnyilakat színes, 24×24 viewBox-os, vékonyan kirajzolt SVG mini-grafikonnyilak váltják fel mindkét alkalmazásban. A korábbi kör alakú, halvány háttér és pseudo-element is eltűnik.
- A csapatlogó, helyezés, ikon, csapatnév, alatta legfeljebb öt zöld/piros eredménypont elrendezése és a mobilos tördelés változatlan.
- A trend továbbra is a **rögzített csapatforma** változása, *nem a helyezés változása*; nem állítunk elő hiányzó hivatalos rangsort.
- Az egyetlen adatforrás továbbra is a meglévő, LIVE `canonicalFormCards` / `canonicalTeamStats` snapshot; nincs SQL, eredményimport, RLS vagy új adattábla.

## QA és kiadás

- Manager regressziós tesztjei: `tests/scoreboard-match-cards.test.cjs`, `tests/manager-standings-filters.test.cjs`, `tests/mrsz-stat-missing-values.test.cjs`.
- Player: `tests/player-form-mini-canonical.test.cjs`, `tests/protocol-match-order-20261019.test.cjs`; a PWA cache verzió egységes: `20261115-trend-svg-v3`.
- Merge, éles GitHub Pages workflow és a bejelentkezett mobilos/böngészős vizuális E2E külön ellenőrzendő. A PR merge csak sikeres CI esetén történhet.
- Rollback: csak a két frontend PR revertje szükséges. LIVE adatbázis és V2 TEST változatlan.
