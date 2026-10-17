# MRSZ történeti statisztika – 8. etap (2026-10-17)

**Státusz:** a 2025/26-os nyolc hiányos jegyzőkönyv célzott forrásvizsgálata és a 2024/25-ös női I. hivatalos versenyazonosítójának felderítése. Éles Supabase vagy Player/Manager felület **nem változott**.

## 2024/25-ös hivatalos bajnoki forrás

A hivatalos [2024-es MRSZ versenyindexből](https://www.hunvolley.info/pr_a/010/001/p_001.asp?p_evad_kod=2024) sikerült a női Budapest I. osztály **konkrét** forráshivatkozását kiolvasni:

https://www.hunvolley.info/pr_a/010/002/p_002.asp?p_verseny_al_kod=72&p_evad_kod=2024&p_fo_cim=NoiBudapestI.osztaly

**2024/25: `p_evad_kod=2024`, `p_verseny_al_kod=72`** (2025/26: `p_evad_kod=2025`, `p_verseny_al_kod=93`). Az idények bajnokságkódjai **nem állandók**. A konkrét évados meccslista és jegyzőkönyvek lefedettségét még külön kell mérni; az index megtalálása önmagában nem igazolja a korábbi szezon teljes eredménylistáját.

## Nyolc hiányos jegyzőkönyv diagnosztikája

Az eddig nyilvántartott nyolc hibás vagy hiányos forrás mindegyike HTTP 200, Windows-1250 kódolású és tartalmaz azonosítható MRSZ-játékosadatos szakaszokat, **kivéve a 4071-es két üres játékossorát**. A korábbi parszerszabályok tévesen feltételezték, hogy minden játékos mellett kötelező a `K` vagy `CS` jelölés, és minden mezszám egyedi.

| MRSZ kód | Korábbi állapot | Most megtalált kiváltó ok / teendő |
|---|---|---|
| 2443 | üres hivatalos jegyzőkönyv | **Az eredménysor üres**, de a játékoslisták nem üresek; több sorban hiányzó `K/CS` vagy név utáni jelölés; a pontozást nem szabad automatikusan kitölteni |
| 2667 | 0 játékos | Mindkét csapatnál hiányzik a `K/CS` oszlop kitöltése; nevezetett ID-k szerepelnek |
| 3053 | 0 játékos | `K/CS` hiányzik; azonosítható MRSZ-játékoskódok vannak |
| 4071 | 0 játékos | **Ténylegesen mindkét játékoslista üres** |
| 7354 | ütköző mezszám | Két külön játékos ugyanazzal a **4-es mezszámmal**, de eltérő MRSZ-kóddal; másik sorban hiányzik a mezszám. A rekordok részlegesek / manuális felülvizsgálat szükséges |
| 7777 | ütköző mezszám | A Vasas keretben két különböző azonosító ugyanazon **17-es mezszám** alatt; automatikus összevonás tilos |
| 7803 | üres BEAC-lista | **Mindkét csapat játékoskódjai kiolvashatók**, csak a `K/CS` mező hiányzik; a korábbi 21/22-es statisztika parszer miatti alulbecslés lehet |
| 7822 | 0 játékos | Több hiányzó `K/CS` és szokatlan névvégződés, pl. `DR.`; a játékoskódok ott vannak |

**Fontos:** a közvetlenül olvasható játékosazonosítók nem egyenlők ellenőrzött pályára lépéssel. Egyedi MRSZ-kód nélkül vagy duplikált azonosítónál a sort el kell utasítani; **azonos mezszám eltérő kóddal nem bizonyít azonos személyt**, hanem adatellentmondás.

### Ellenőrzési döntés

A 2443-as jegyzőkönyv eredmény nélkül, a 4071-es játékossor nélkül marad. A többi eset célzott, szigorúbb MRSZ-parszert igényel, amely a `K/CS` mezőt **opcionálissá** teszi (`null`, nem önkényesen `CS`), a kettős mezszámokat **jelzi**, és azonos MRSZ-kódot továbbra sem duplikálhat. Addig **nem módosítjuk visszamenőleg** az előző etap 121/129-es igazolt jegyzőkönyvi számát.

## Technikai bizonyíték

- `scripts/history/inspect-eight-exceptions-and-2024.cjs`: kizárólag 8 korábban rögzített MRSZ-jegyzőkönyv és 1 hivatalos évadindex; minden URL és mérkőzéskód forrásból származik. Oldalanként legfeljebb 2 MB, az indexnél 8 MB, max. 10s timeout, legalább 650 ms kérésszünet.
- `tests/history-eight-exceptions-and-2024.test.cjs`: pontos nyolcas merítés, évad/bajnoki kódellenőrzés, nem hivatalos URL-ek tiltása.
- `.github/workflows/history-stage8-mrsz.yml`: az egyszeri HTTP próba a PR megnyitásához kötött; a későbbi ellenőrzések offline futnak.

**Következő feladat:** 2024/25-ös versenyoldal teljes MRSZ mérkőzéslistájának ellenőrzése, valamint a nyolc problémás 2025/26-os eset típushelyes javítása és újraellenőrzése. Az eredeti forrásállományt egyelőre nem írjuk át.
