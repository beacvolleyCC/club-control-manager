# MRSZ történeti statisztika – 9. etap: női Budapest I. 2024/25

**Dátum:** 2026-10-17  
**Státusz:** a **második hivatalos, teljes eredménylistájú idény** külön, idényazonosítós állományba bekerült, az eredmények mind a 13 csapatnál egyeznek az MRSZ-tabellával. A 2024/25-ös egyedi jegyzőkönyvek és játékosok **még nincsenek feldolgozva**.

## Forrás és azonosítás

A [2024-es hivatalos évadindexből](https://www.hunvolley.info/pr_a/010/001/p_001.asp?p_evad_kod=2024) azonosított [női Budapest I. osztályú bajnoki oldal](https://www.hunvolley.info/pr_a/010/002/p_002.asp?p_verseny_al_kod=72&p_evad_kod=2024&p_fo_cim=NoiBudapestI.osztaly).

**2024/25: `p_evad_kod=2024`, `p_verseny_al_kod=72`.** A 2025/26-os női I. alazonosító `93`, tehát a bajnoki alazonosítót sosem tekintjük változatlan, szezonokon át állandó kulcsnak.

## Hivatalos teljes idény

| Mutató | 2024/25 |
|---|---:|
| Csapat | **13** |
| Egyedi MRSZ menetrendi/meccskód | **157** |
| Különböző hazai–vendég párosítás | **156** |
| Eredménnyel rendelkező mérkőzés | **155** |
| Eredmény nélküli bejegyzés | **2** |
| Tabella által igazolt lejátszott meccs (összes `played` / 2) | **155** |
| Minden csapat győzelem–vereség és szettmérlegének egyezése | **13/13** |

A 157 MRSZ-kód **nem** jelent 157 meccset. A `2250` (DKLSN–Mozdulj, **1–3**) és `2782` (azonos párosítás, azonos napon, **eredmény nélkül**) külön hivatalos sor. A `9925` UTE tartalék–Budapest Bunnies szintén eredmény nélküli. Így összesen 156 különböző hazai–vendég párosítás szerepel, ebből 155 eredménnyel.

A 2024/25-ös teljes mérkőzéslista és tabella: `data/competition-history/women1_2024_25_official_league_snapshot.json`, minden rekordban MRSZ meccskóddal, hivatalos URL-lel, helyszínfüggetlen dátummal, 24 órás kezdési idővel és eredménnyel vagy `null`-lal.

## BEAC: két bajnoki idény

| Idény | Csapatok | Helyezés az aktuális forrásadatban | Lejátszott | Mérleg | Szetteredmény |
|---|---:|---:|---:|---:|---|
| **2024/25** | 13 | **5.** | **24** | **13–11** | **49–37** |
| **2025/26** | 12 | **1.** | **22** | **20–2** | **62–20** |

*Az utolsó 2025/26-os szettadatot a külön, hitelesített 2025/26-os tabella alapján tároljuk.* A két idény eltérő csapatlétszámú, és a csapatok szezonok közötti azonossága még nincs végig hivatalosan ellenőrizve. **Nem szabad a helyezéskülönbséget automatikusan átlagos ellenfélerősség-változásnak tekinteni.**

## Meglévő kód és QA

- `scripts/history/discover-official-women1-2024.cjs`: kizárólag az index által dokumentált 2024/25-ös bajnoki URL egyszeri, csak olvasó HTTP lekérése.
- `scripts/history/parse-official-women1-competition.cjs`: a korábbi meccssor-kiolvasó paraméterezve `season=2024`, `competition=72` szerint; a 2025-ös eredeti működés változatlan.
- `scripts/history/audit-women1-2024-snapshot.cjs`: független offline számítás: a **155 eredmény** alapján 13 csapatra a hivatalos `played/wins/losses/setsFor/setsAgainst` mezők egyezése; a `2250`–`2782` duplikált párosítás külön vizsgálata.
- `tests/history-official-women1-2024.test.cjs`, `tests/history-women1-2024-snapshot.test.cjs`: forrásazonosító, duplikátumkezelés, eredmény- és tabellaegyezés.
- `.github/workflows/history-women1-2024.yml`: a teljes bajnoki adat offline újraellenőrzése; újabb MRSZ HTTP kérés csak a PR egyszeri nyitásakor vagy kézi futtatással.

## Következő feladat

1. A 2024/25-ös **24 BEAC-meccs** forrásból ismert azonosítóit használva a játékosjegyzőkönyvek lefedettségét felmérni; utána a 155 eredményes meccs többi jegyzőkönyve.
2. A 2025/26-os korábbi [nyolc kivételt](./MRSZ_HISTORY_STAGE8_EXCEPTIONS_AND_2024_2026-10-17.md) típushelyesen feldolgozni (opcionális `K/CS`, kettős mezszám mint figyelmeztetés, üres jegyzőkönyv elkülönítése).
3. A két idény közötti **hivatalos csapat- és MRSZ-játékosazonosító** megfeleltetését elkészíteni.
4. Csak időrendben, múltbeli mérkőzéseken visszatesztelt eredményalapú modell után kerülhet új értékszám vagy mérkőzésesély a közös Manager/Player statisztikába.

**Az éles Supabase és a működő Manager/Player UI nem változott.**
