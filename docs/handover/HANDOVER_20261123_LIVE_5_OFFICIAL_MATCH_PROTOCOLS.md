# Club Control LIVE – öt hivatalos röplabda-jegyzőkönyv importja

**Dátum:** 2026-11-23  
**LIVE Supabase:** `snqsxlyhontaepembaic`  
**Bajnokság:** 2026/27 férfi Budapest I. osztály, A és B csoport  
**Központi forrás:** `public.cc_competition_mrsz_screenshot_v1` → `private.cc_canonical_competition_matches_v1`; a Manager és Player meglévő közös snapshotjaiból lekérdezhető.

## Rögzített és utóellenőrzött mérkőzések

| Kód | Forrásazonosító | Liga | Dátum | Mérkőzés | Játszmák |
|---|---|---|---|---|---|
| 2887 | 20261001:fixture:100 | BB1 A | 2026-11-17 19:00 | MAFC-Kármán–Dág 0–3 | 19–25, 17–25, 26–28 |
| 2888 | 20261001:fixture:101 | BB1 A | 2026-11-17 19:45 | Kispest–Kandó 0–3 | 12–25, 19–25, 13–25 |
| 2895 | 20261001:fixture:102 | BB1 A | 2026-11-18 19:30 | Ráckeve–BTDSE Taksony 1–3 | 17–25, 25–23, 19–25, 23–25 |
| 2901 | 20261001:fixture:70 | BB1 B | 2026-11-19 18:20 | MAFC-Vásárhelyi–Corvinus 2–3 | 25–18, 25–19, 28–30, 21–25, 13–15 |
| 2334 | 20261001:fixture:93 | BB1 A | 2026-11-19 20:15 | Dág–Közgáz 3–0 | 25–23, 25–14, 25–22 |

**Források:** a felhasználó 2026-11-23-án feltöltött hivatalos Hunvolley PDF-jegyzőkönyvei: `09_A_dag-kozgaz_bb1.pdf`, `10_A_karman_dag_bb1.pdf`, `11_A_kispest-kando_bb1.pdf`, `12_A_rackeve-taksony_bb1.pdf`, `09_B_vasarhelyi_corvinus_bb1.pdf`.

**Adatbevitel:** a már létező öt `fixture`-rekordot frissítettük (nem új rekordokat hoztunk létre). Rögzítve: a hivatalos mérkőzéskód, dátum, állapot `played`, eredmény, játszmaeredmények, helyszín, játékvezető, jegyzőkönyv-URL, mindkét csapat játékosnévsora mezszámmal és igazolási kóddal, a PDF-ben szereplő kapitány-/liberójelölés és kezdő-/cserestátusz, valamint feltüntetett edzők. A PDF-ben üres K/Cs mezőket nem találtuk ki.

**Külön megjegyzés:** #2895 (Ráckeve–Taksony), 4. játszma 21–24 állásánál az RSZSE edzője sárga lapot kapott. A forrás szerinti mondat a `protocol.notes` tömbben megőrizve.

**Dátumkorrekció:** #2334 Dág–Közgáz régi `fixture` dátuma 2026-10-15 volt. A hivatalos PDF alapján 2026-11-19 20:15-re javítottuk.

**Csoportok elkülönítése:** #2901 a férfi BB1 **B** csoportban, a másik négy az **A** csoportban. A kanonikus csapatnevek és ID-k nem változtak, a PDF hivatalos csapatnevei külön `protocol.teams[].officialName` mezőben szerepelnek.

## Duplikáció / adatbiztonság / ellenőrzés

- Mind az öt rekord már szerepelt a menetrendben, de nem volt még hozzá megfelelő hivatalos `matchCode`, eredmény és teljes jegyzőkönyv. Import előtt a kódokat ellenőriztük a teljes snapshot-táblában: **0 másik rekord**.
- Az import SQL szigorúan ellenőrzi a szezon, bajnoki csoport, forráskulcs, hazai/vendég csapatnév, meglévő eredmény és matchCode egyediségét; konfliktus esetén az egész tranzakció megszakad.
- Audit a meglévő `private.cc_official_protocol_import_audit_v1` táblában, eredeti és új JSON-nal:
  - `CC_LIVE_20261123_BB1A_4PDF`: **4** módosítás;
  - `CC_LIVE_20261123_BB1B_1PDF`: **1** módosítás.
- Visszaellenőrzéskor **5/5** a `played`, 5/5 a játszmaszám megegyezik a végeredménnyel, **5/5** mindkét játékosnévsor megtalálható a kanonikus rekordban, mind az öt jegyzőkönyv linkje szerepel.
- Import utáni kanonikus eredmény-lefedettség: BB1 **A 9/42**, BB1 **B 9/42**. A központi `canonicalFormCards` forma-/trend-/részleges helyezésszámítás újraolvassa ezeket az adatokat, nem igényel külön alkalmazásadatbázist.
- **Nem változott az alkalmazáskód vagy a V2 TEST**; LIVE frontend telepítés ebben a körben nem volt szükséges. Bejelentkezett felületen végzett vizuális E2E nem történt.

## Következő importok

Az újabb PDF-eket ugyanezzel a módszerrel, `matchCode` + `source_key` + bajnokság/csoport + csapatpár alapján deduplikáljuk. Az azonos eredményt kihagyjuk; eltérés esetén nem írjuk felül csendben a korábbi adatot, hanem konfliktusként jelezzük.

**V2 TEST és draft PR #89 változatlan.**
