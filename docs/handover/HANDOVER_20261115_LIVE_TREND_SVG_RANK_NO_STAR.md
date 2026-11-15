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
- **Manager PR #92 merged**: `b9509911a2ac8851b42f0c16e0817bbbf4bf3ddc`. A végső QA ellenőrzések 7/7 zöldek, a főági Pages build és deploy [sikeres](https://github.com/beacvolleyCC/club-control-manager/actions/runs/43726164619).
- **Player PR #33 merged**: `20d7648e0d6c267c53ffdb3b02f01f96fcaba185`. A főági négy célzott QA zöld, a Pages build és deploy [sikeres](https://github.com/beacvolleyCC/player_application/actions/runs/43726028195).
- A bejelentkezett mobilos/böngészős vizuális E2E továbbra is külön ellenőrzendő; a GitHub Actions ellenőrzés nem helyettesíti.
- Rollback: csak a két frontend PR revertje szükséges. LIVE adatbázis és V2 TEST változatlan.
