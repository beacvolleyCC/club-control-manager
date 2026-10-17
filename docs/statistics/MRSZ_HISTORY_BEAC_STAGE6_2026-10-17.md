# MRSZ történeti adatgyűjtés – 6. etap: BEAC, 2025/26

**Dátum:** 2026-10-17  
**Évad / bajnokság:** 2025/26, női Budapest I. osztály (`p_evad_kod=2025`, `p_verseny_al_kod=93`)  
**Állapot:** a BEAC teljes meccseredmény-múltja és csaknem teljes meccsenkénti jegyzőkönyvi játékoslistája forrásazonosítóval igazolt. **Éles Player/Manager értékszám nincs.**

## Hitelesített eredmény

| Ellenőrzés | Eredmény |
|---|---:|
| BEAC mérkőzések az MRSZ 2025/26-os menetrendjében | **22** |
| Eredménnyel szereplő BEAC-mérkőzések | **22** |
| Hivatalos jegyzőkönyvvel, játékoskódokkal feldolgozva | **21** |
| Eredménnyel, de üres játékoslistával | **1** |
| Különböző MRSZ-kód a 21 jegyzőkönyvben | **15** |
| Összes jegyzőkönyvi BEAC-játékosnevezés | **213** |
| BEAC 2025/26-os eredménymérleg | **20–2** |

Az első öt pilotjegyzőkönyv már az [5. etapban](./MRSZ_HISTORY_WOMEN1_STAGE5_2026-10-17.md) szerepelt, nem töltöttük le ismeretlen mérkőzéskódok próbálgatásával. A fennmaradó **17** hivatalos, a bajnoki menetrendben szereplő jegyzőkönyvre külön alacsony kérésgyakoriságú (minimum 650 ms szünet) próba futott. **16** jegyzőkönyvből a mérkőzés eredménye/dátuma és a BEAC-játékoslista ellenőrizhető; **1** dokumentum kitöltetlen.

### Hiányos jegyzőkönyv

- **2026-04-21 – Vasas SC Tartalék–BEAC**, MRSZ mérkőzéskód: `7803`.
- A hivatalos eredmény jelen van és egyezik a mentett menetrenddel; a jegyzőkönyv BEAC-játékossorai **üresek**, ezért erre a mérkőzésre **nem rendelünk senkihez nevezést vagy pályára lépést**.
- MRSZ közvetlen forrás: https://www.hunvolley.info/pr_a/010/009/p_009.asp?p_merkozes_kod=7803&p_evad_kod=2025&p_verseny_al_kod=93&p_fo_cim=NoiBudapestI.osztaly

## Nevezési gyakoriságok (szemléltető, forrásalapú)

A szám **csak azt jelenti**, hogy az adott MRSZ-kód hányszor szerepelt a feldolgozott **21 BEAC jegyzőkönyvben**. Nem azonos a ténylegesen pályán töltött idővel vagy játszott szettekkel.

| Játékos | MRSZ-kód | Nevezést tartalmazó jegyzőkönyvek |
|---|---|---:|
| Petri Zsófia | 31475 | 20 |
| Albert Anna | 27892 | 20 |
| Pásztor Dorina | 54846 | 19 |
| Imre Eszter | 42988 | 19 |
| Iglói Nóra | 32910 | 18 |
| Szalontai Rebeka | 37523 | 17 |
| Uhri Sára | 27101 | 16 |
| Kolba Kata | 51046 | 16 |
| Diószegi Réka | 30317 | 14 |
| Nagy-Tóth Csenge | 30645 | 13 |
| Kovács Nóra | 21243 | 12 |
| Kőrösi Luca Anna | 65666 | 11 |
| Papp Laura Dorottya | 23656 | 11 |
| Szabó Csenge | 31266 | 6 |
| Széles-Neizer Lili | 20799 | 1 |

A felsorolás együtt **213 nevezési rekordot** fed le. A kitöltetlen 7803-as meccs miatt a teljes szezon hivatalos nevezési lefedettsége **nem 22/22**. A 15 azonosító nem bizonyítja, hogy a hivatalosan regisztrált keret pontosan 15 főből állt.

## Ellenőrzés és hibavédelem

A feldolgozó:
- Kizárólag a már azonosított 2025/26-os hivatalos bajnoki menetrendben szereplő, még hiányzó 17 BEAC-meccskódot használja.
- Ellenőrzi a meccskódot, idényt, versenyazonosítót, dátumot, az eredményt és a BEAC csapat helyét a jegyzőkönyvben.
- Eredményes, de játékoslista nélküli dokumentumot **nem** tekint részvételi igazolásnak.
- Ellenőrzi az MRSZ-kód duplikációkat és az azonos kódhoz tartozó, ellentmondó neveket.
- Az öt korábbi és a 17 új jegyzőkönyvet egyedi mérkőzéskód alapján kapcsolja össze, kétszeres beszámítás nélkül.

**Fájlok:**
- `data/competition-history/women1_2025_26_beac_remaining_protocols.json`: 17 eredményellenőrzött jegyzőkönyv – 16 játékoslista, 1 üres.
- `data/competition-history/women1_2025_26_beac_roster_pilot.json`: a korábbi 5 ellenőrzött jegyzőkönyv.
- `scripts/history/fetch-women1-beac-remaining.cjs`: korlátozott forráslekérdező.
- `scripts/history/audit-beac-full-season-rosters.cjs`: 22 meccs összesített, offline integritásellenőrzése.
- `tests/history-women1-beac-remaining.test.cjs`, `tests/history-beac-full-season.test.cjs`: regressziók.
- `.github/workflows/history-beac-17-protocols.yml`: PR-nél **csak offline teszt**, ismételt internetes ellenőrzés kizárólag kézi `workflow_dispatch` indításra.

## Következő fejlesztési szakasz

A BEAC 2025/26-os eredmény- és jegyzőkönyvi mintájával az idényközi játékosazonosítók elemzése már szakmailag megalapozható. A bajnokság egészének ellenfél- és kerethatás-vizsgálatához azonban a **többi 11 csapat 2025/26-os jegyzőkönyveit**, valamint a **2024/25-ös és 2026/27-es hivatalos idényeket** is ellenőrizni kell. A ligában az eredmények 129/129 lefedettek, de a teljes 129 jegyzőkönyv játékossorait még **nem** auditáltuk.

**Kiadási kapu:** hivatalos BEAC-adatsor **GO**; egyéni teljesítmény-, keretmegtartási és mérkőzésesély-becslés **NO-GO**. Nincs production adatírás, Player- vagy Manager-felületi változás.
