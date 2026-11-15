# Club Control LIVE – Meccsek összesített nézet: bajnoki színek

**Dátum:** 2026-11-15
**Repo:** `beacvolleyCC/club-control-manager`
**Hatókör:** V1 LIVE Manager → Versenysport → Meccsek → Összes BEAC csapat
**V2 TEST:** változatlan

## Változás

A Meccsek összesített listájában a már tárolt csapatszíneket használjuk a nem és az osztály/csoport gyors megkülönböztetéséhez. A meglévő liga/szezon/adatforrás nem módosul.

| Liga | Rövid címke | Szín forrása |
| --- | --- | --- |
| Női Budapest I. osztály | Női I. | BEAC Női I. csapatszín |
| Női Budapest II. osztály – B csoport | Női II/B | BEAC Női II. csapatszín |
| Férfi Budapest I. osztály – A csoport | Férfi I/A | BEAC Férfi csapatszín |
| Férfi Budapest I. osztály – B csoport | Férfi I/B | BEAC Férfi csapatszín |

A szín kódja a Manager `state.teams` csapatrekordjainak `color` mezőjéből érkezik; csak a `#RRGGBB` formátum elfogadott, egyébként a meglévő demócsapatszín a fallback. A férfi A/B ugyanaz a BEAC-csapat, ezért azonos színt kap, viszont külön címkével egyértelműen jelöljük a csoportot.

Megjelenés: az egyes bajnoki panelek színes bal oldali sávot kapnak; minden meccskártyán visszafogott színes bal szegély és a dátum mellett apró kategóriajelölő jelenik meg. A teljes csoport neve a panelben továbbra is ki van írva, és a rövid jelölő tooltipjében is szerepel.

**Csak az összesített nézetben** aktív; egyetlen csapat vagy bajnoki csoport kiválasztása nem változtatja meg a meglévő kártyák színét, elrendezését vagy működését.

## Érintetlen funkciók

- Közös LIVE mérkőzésforrás, mérkőzések és jegyzőkönyvek
- Helyezés, formaindikátor, eredménypontok és dátum
- Meccsszűrők, csapatválasztó, jogosultságok, szerkesztés
- Player frontend, Supabase DB és V2 TEST

## Teszt / kiadás

- `tests/scoreboard-match-cards.test.cjs`: címke, színes sáv, normál kártya marad semleges
- `tests/manager-standings-filters.test.cjs`: ligánkénti kategóriák, saját csapatszín, hibás CSS-szín elutasítása, összesített módhoz kötött színezés
- Cache verzió: `20261115-match-category-colors-v4`.
- LIVE merge és GitHub Pages telepítés csak a zöld QA-k után. Valódi, bejelentkezett mobilos vizuális teszt külön ellenőrzendő.
