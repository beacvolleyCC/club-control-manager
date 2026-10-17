# MRSZ történeti adatgyűjtés – 10. etap: 2024/25 teljes BEAC-jegyzőkönyv és 2025/26 kivételek javítása

**Dátum:** 2026-10-17  
**Éles környezet:** változatlan (nem történt Supabase-adatírás, Manager-/Player-UI-módosítás vagy teljesítmény-pontozás).

## 2024/25 – BEAC női Budapest I.

A 2024/25-ös hivatalos bajnoki oldalról (`p_evad_kod=2024`, `p_verseny_al_kod=72`) közvetlenül követett **24 BEAC-mérkőzéskódból 24 hiteles jegyzőkönyvet** olvastunk be. Mind a 24-nél egyezik a jegyzőkönyv dátuma és eredménye a [teljes 2024/25-ös hivatalos bajnoki listával](./MRSZ_HISTORY_WOMEN1_STAGE9_2026-10-17.md).

- **24/24** eredmény- és játékoslista-egyezés
- **16** különböző MRSZ BEAC-játékoskód
- **280** jegyzőkönyvi BEAC-játékosnevezés a 24 meccsen
- A BEAC 2024/25-ös bajnoki helye **5.**, 24 meccs, **13–11**, szettek **49–37**

A `280` nevezés **nem játszott szettek száma** és a `16` egyedi kód **nem a teljes, hivatalosan regisztrált keret igazolása**. Csak a 24 vizsgált hivatalos jegyzőkönyvben szereplő személyeket jelenti.

Adat: `data/competition-history/women1_2024_25_beac_protocols_stage10.json`

## 2025/26 – nyolc korábban hiányos jegyzőkönyv

Külön, rugalmasabb MRSZ-feldolgozót hoztunk létre, amely:
- Opcionálisként (`null`) kezeli a hiányzó `K/CS` státuszt, nem találja ki a kezdő/csere státuszt.
- Opcionálisként (`null`) kezeli a hiányzó mezszámot.
- A duplikált **mezszámot** figyelmeztetésként adja vissza, de **nem egyesíti** a két különböző MRSZ-kódú játékost.
- A duplikált **MRSZ játékoskódot** továbbra is hibának minősíti.
- A jegyzőkönyv eredményét és a játékoslistákat külön ellenőrzi.
- A korábbi, szigorú 2025/26-os parser nem változott, az eredeti archív állományt nem írta felül.

| Mérkőzéskód | Javítás eredménye |
|---|---|
| `2443` | Mindkét csapat játékosazonosítói olvashatók. Az egyedi jegyzőkönyv eredménye **hiányzik**; a hivatalos bajnoki listában van eredmény. |
| `2667` | Mindkét játékoslista visszanyerhető hiányzó K/CS mellett |
| `3053` | Mindkét játékoslista visszanyerhető hiányzó K/CS mellett |
| `4071` | A két játékoslista valóban üres, ezt nem töltjük ki következtetéssel |
| `7354` | Dupla 4-es mezszám külön játékoskódokkal; megtartva, figyelmeztetéssel |
| `7777` | Dupla 17-es mezszám külön játékoskódokkal; megtartva, figyelmeztetéssel |
| `7803` | A Vasas Tartalék–BEAC mindkét játékoslistája helyreállítva; a BEAC-nál 12 MRSZ-kód |
| `7822` | Hiányzó K/CS és `DR.` névvégződés kezelve |

Ez **7/8 helyreállított, kétoldali játékoslista**. A 2025/26-os bajnokság 129 eredménnyel megjelenő mérkőzéséből most **128** rendelkezik valós, forrásból kiolvasható játékosnévsorral. A kivétel `4071`. A 2443-at **nem** jelöljük jegyzőkönyv szerint eredményellenőrzöttnek, csak az MRSZ bajnoki listája közöl meccseredményt.

A 2025/26-os BEAC **22/22** mérkőzésén lett hiteles nevezési lista. A 22 játékoslistában **15 különböző BEAC MRSZ-kód** és **225 nevezési sor** szerepel. Ez nem egyenlő a pályára lépési statisztikával.

Helyreállított kivételek: `data/competition-history/women1_2025_26_recovered_protocols_stage10.json`

## Két hivatalos idény közötti, egyedi játékosazonosítós egyezés

A két idény BEAC-női csapatának egymást követő, hivatalos jegyzőkönyveiben **öt játékosnál egyezik az egyedi MRSZ-kód és a név**:

| Játékos | MRSZ-kód | 2024/25 nevezési sorok | 2025/26 nevezési sorok |
|---|---:|---:|---:|
| Kovács Nóra | 21243 | 17 | 13 |
| Papp Laura Dorottya | 23656 | 23 | 12 |
| Uhri Sára | 27101 | 22 | 17 |
| Iglói Nóra | 32910 | 18 | 19 |
| Szalontai Rebeka | 37523 | 18 | 18 |

A fenti 2025/26-os sorokba a korábban hiányos 7803-as találkozó nevezése is beleszámít. Ezek **nem szezonális pályára lépések**, nem bizonyítanak játékosértéket. A 2024/25-ös 16 és a 2025/26-os 15 azonosító két mintahalmaza összesen **26 különböző MRSZ-kódot** fed le, öt közös kóddal.

A két idény nem azonos mezőnnyel zajlott (13, illetve 12 csapat), a megfigyelt játékoskódok halmazát nem nevezzük a teljes hivatalos keretnek; **keretmegtartási százalékot nem számolunk**.

## Technikai elemek és QA

- `scripts/history/parse-flexible-women1-protocol.cjs`: forrásból igazolt K/CS, mezszám, kapitány, liberó, MRSZ-kód, illetve a pontszám külön kezelése.
- `scripts/history/audit-stage10-beac-and-exceptions.cjs`: **24** 2024-es és **8** korábbi 2025-ös MRSZ jegyzőkönyv, egyenkénti, legalább 700 ms szünetes, szigorúan forrásindex-korlátozott HTTPS ellenőrzése, egyszeri kutatási futással.
- `scripts/history/audit-two-beac-seasons-stage10.cjs`: független offline audit 2024/25 + 2025/26 teljes BEAC-jegyzőkönyvi listáiról, MRSZ-kódok, azonosságok és kivételek ellenőrzése.
- `tests/history-flexible-protocol.test.cjs`, `tests/history-stage10-sourced-beac.test.cjs`, `tests/history-two-beac-seasons-stage10.test.cjs`: hibás forrás, duplikált kód, kettős mezszám, hiányzó státusz és szezonkeverés regressziói.
- `.github/workflows/history-stage10-beac.yml`: minden új PR-módosításnál kizárólag offline teszt; hálózati újralekérés csak az eredeti PR-megnyitáskor vagy manuális indításnál.

**Következő feladat:** a 2024/25-ös női I. másik **131 eredményes mérkőzésének** jegyzőkönyvi lefedettségét ellenőrizni (155 összesen mínusz 24 BEAC). Utána mindkét idény egymáshoz hivatalosan kötött csapatait és játékosazonosítóit lehetne visszamenőlegesen vizsgálni. Értékszámot, keretmegtartási arányt és mérkőzésesélyt csak megfelelő visszatesztelés után szabad megjeleníteni.
