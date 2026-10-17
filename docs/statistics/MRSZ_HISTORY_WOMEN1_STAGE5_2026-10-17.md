# Statisztika – 2025/26 női Budapest I., hivatalos idénylista és keretpilot (5. etap)

**Dátum:** 2026-10-17 · **Állapot:** hiteles forráslista, ellenőrzött eredményösszesítés és első jegyzőkönyvi lefedettségi minta. **Nincs** éles Supabase-írás vagy új Manager/Player mutató.

## Mit oldottunk meg?

Az MRSZ 2025/26-os versenyindexében az `OnClick="oldal_submit_publikus(...)"` hivatkozásból megtaláltuk a **női Budapest I. osztály hivatalos bajnoki oldalát**:

https://www.hunvolley.info/pr_a/010/002/p_002.asp?p_verseny_al_kod=93&p_evad_kod=2025&p_fo_cim=NoiBudapestI.osztaly

A versenyazonosító `p_verseny_al_kod=93`, az idényazonosító `p_evad_kod=2025` a 2025/26-os évadot jelöli. A Windows-1250 kódolású, körülbelül 1,54 MB-os publikus HTML **132 egyedi mérkőzéslinket** tartalmaz, nem URL-sorszámok próbálgatásából származnak. A forrásban három mobil/asztali megjelenítés részben ismétli a linkeket: ezeket mérkőzéskód szerint deduplikáltuk.

## A hivatalos versenyoldal ellenőrzése

| Mutató | Forrásoldal |
|---|---:|
| Csapatok a tabellában | **12** |
| Egyedi menetrendi párosítások | **132** |
| Eredménnyel megjelenő mérkőzések | **129** |
| Eredmény nélküli mérkőzések | **3** |
| Tabellából összeadva: lejátszott mérkőzések / 2 | **129** |
| Kiolvasott mérkőzéseredmények egyeznek a tabellával | **Igen** |
| Mind a 12 csapat győzelem/vereség/szettmérlege egyezik | **Igen** |

**Nincs eredmény az MRSZ-listában:**
- `2830`: EMERICUS SE – Panoráma SE (2025-11-13)
- `4070`: Mozdulj – Panoráma SE (2025-12-10)
- `6161`: Mozdulj – EMERICUS SE (2026-01-21)

Ezeket **nem** szabad lejátszottnak vagy döntetlennek tekinteni, akkor sem, ha a mérkőzés időpontja már elmúlt. A 6161-es jegyzőkönyvről korábban is igazoltuk, hogy a konkrét letöltött eredmény- és játékostábla üres.

**Hivatalos tabella első három helye ezen az MRSZ-adatállapoton:**
1. Budapesti Egyetemi Atlétikai Club / BEAC – 22 mérkőzés, 20 győzelem, 2 vereség.
2. Mozdulj – 20 mérkőzés, 19 győzelem, 1 vereség.
3. Közgáz női – 22 mérkőzés, 17 győzelem, 5 vereség.

A korábban példaként használt Volleybox **BEAC 2. hely** az MRSZ aktuálisan elérhető tabellájával nem egyezik. **Az MRSZ az elsődleges**, de a három eredmény nélküli találkozó miatt a tabella állapotát nem nevezzük minden kétséget kizáró, teljesen lezárt idénynek.

### Forrásazonosság

Ugyanazon 2025/26-os hivatalos MRSZ-oldal menetrendi rövid neveit explicit, **csak erre az évadra érvényes** táblázattal egyeztetjük a tabellanevekkel (például `BEAC` = `Budapesti Egyetemi Atlétikai Club`; `RSZSE` = `Ráckeve`; `KRE SC` = `Károli Gáspár Református Egyetem Sport Club`). A 12 csapat győzelem-, vereség-, játszma- és meccsszáma így soronként teljesen egyezik.

**Ez nem szezonok közötti csapat-összevonási engedély.** A második csapatok és a névváltozások külön ellenőrzést igényelnek.

## Első valódi BEAC-jegyzőkönyvi lefedettségi minta

A BEAC **22 eredményes mérkőzéséből** öt, az idényben elosztott, az MRSZ-listában megtalálható mérkőzést kérdeztünk le:

| MRSZ meccskód | Dátum | Eredmény a bajnoki oldallal egyezik? | BEAC játékoskódok |
|---|---|---|---:|
| 2446 | 2025-10-17 | Igen | 10 |
| 3290 | 2025-12-05 | Igen | 11 |
| 6083 | 2026-03-09 | Igen | 11 |
| 7756 | 2026-04-10 | Igen | 10 |
| 8851 | 2026-05-22 | Igen | 9 |

**5/5 kiolvasható hivatalos jegyzőkönyv; öt meccsen összesen 14 különböző MRSZ BEAC-játékosazonosító.** Az adat nem igazolja, hogy ezek valamennyien hány szettben játszottak, és nem bizonyítja a teljes szezon keretét. Az öt meccses minta nem reprezentálja automatikusan a 129 eredményes mérkőzés teljes jegyzőkönyvi lefedettségét.

A korábban azonosított `27892` (Albert Anna) a példák közé tartozik; korábbi idények játékos-ID összekapcsolása az egyedi kódok alapján lehetséges.

## Létrejött fájlok

- `data/competition-history/women1_2025_26_official_league_snapshot.json`: **132** MRSZ-mérkőzéskód és menetrendi sor, **129** megjelenő eredmény, **3** eredmény nélküli párosítás; 12 csapatos tabella és forráshivatkozások.
- `data/competition-history/women1_2025_26_beac_roster_pilot.json`: öt hivatalosan ellenőrzött BEAC-jegyzőkönyvből kinyert játékoskódok.
- `scripts/history/discover-women1-index.cjs`: konkrét MRSZ-linkek kiolvasása a hivatalos versenyoldalból, csak olvasó HTTP.
- `scripts/history/parse-official-women1-competition.cjs`: mérkőzések, dátumok, párosítások, eredmények és tabella szigorú parserje.
- `scripts/history/audit-official-women1-snapshot.cjs`: minden csapatra külön 22 menetrendi alkalom és lejátszott mérleg/szettmérleg ellenőrzése.
- `scripts/history/probe-women1-beac-protocols.cjs`: pontosan öt, már forrásoldalon szereplő BEAC-meccs egyedi MRSZ-jegyzőkönyvének lefedettségi vizsgálata.
- `tests/history-women1-index-discovery.test.cjs`, `tests/history-women1-competition.test.cjs`, `tests/history-official-women1-snapshot.test.cjs`, `tests/history-women1-protocol-pilot.test.cjs`, `tests/history-women1-beac-pilot-evidence.test.cjs`.
- `.github/workflows/history-women1-index-discovery.yml`: offline validálás + legfeljebb 2 listázási és 5 ismert jegyzőkönyvi, engedélyezett MRSZ-kérés.

## Következő lépés

1. A **129 eredményes jegyzőkönyv** feldolgozása külön, mérsékelt sebességű, megszakítható, forráskódok alapján korlátozott kötegekben, először a BEAC fennmaradó 17 meccsével.
2. Lefedettségi riport: minden csapatra összes mérkőzés / kitöltött jegyzőkönyv / egyedi igazolási kód / üres vagy ellentmondó dokumentum; **nem** azonos a játékos pályára lépésével.
3. 2024/25 és 2026/27 hivatalos adatokkal külön szezonazonosság-ellenőrzés; közösségi listák nem írhatják felül az MRSZ-adatokat.
4. Eredményalapú erősségszámítás történeti backtestje, majd külön teszt a játékoskeret-bevonásra; csak megalapozott szám kerülhet a közös Player/Manager statisztikába.

**GO:** hivatalos eredmény-adatbázis első szezonja, forrásazonosítók, részleges játékosprofil-jegyzőkönyvek. **NO-GO:** teljes játékosszezon, keretmegtartási százalék és tényleges esélybecslés.

**Adatbiztonság:** kizárólag nyilvános MRSZ HTTP lekérés és offline JSON; éles Supabase-tábla és működő Player/Manager változatlan.
