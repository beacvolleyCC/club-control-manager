# Statisztika / hivatalos MRSZ történeti jegyzőkönyvek – 4. etap

**Dátum:** 2026-10-17 • **Státusz:** működő, csak olvasó forráselérés és szigorú parser, nem kész teljes történeti adatbázis.  
**Kapcsolódás:** [1. etap](./MRSZ_HISTORY_DATA_AUDIT_2026-10-17.md) · [2. etap](./MRSZ_HISTORY_WOMEN1_STAGE2_2026-10-17.md) · [3. etap](./MRSZ_HISTORY_ROSTER_STAGE3_2026-10-17.md)

## 1. Az áttörés: történeti MRSZ közvetlenül letölthető

A GitHub Actionsen futtatott, engedélyezett forrásokra korlátozott HTTP ellenőrzés szerint:

| Forrás | HTTP | Kódolás | Tartalom |
|---|---:|---|---|
| MRSZ 2025/26, mérkőzés 2446 | 200 | windows-1250 | BEAC–Emericus, 2025-10-17, **3–0**, 10+11 név/kód |
| MRSZ 2025/26, mérkőzés 6161 | 200 | windows-1250 | Mozdulj–Emericus, 2026-01-21, **üres eredmény- és játékostáblák** |
| BRSZ mobil felnőtt tabella | 403 | iso-8859-2 | Hitelesítés / Verification; nincs hozzáférhető tabella |
| BRSZ mobil felnőtt bajnokságok | 403 | iso-8859-2 | Hitelesítés / Verification; nincs hozzáférhető versenylista |

**A 403-as BRSZ-hitelesítést nem kerülte meg a kód**, nem próbált automatikusan CAPTCHA-t vagy belépést megoldani.

MRSZ 2446: https://www.hunvolley.info/pr_a/010/009/p_009.asp?p_evad_kod=2025&p_merkozes_kod=2446&p_verseny_al_kod=93  
MRSZ 6161: https://www.hunvolley.info/pr_a/010/009/p_009.asp?p_evad_kod=2025&p_merkozes_kod=6161&p_verseny_al_kod=93

**Fontos következtetés:** az oldal HTTP-elérhetősége nem garantálja a mérkőzés tényleges eredményeit vagy a nevezéseket. A parser a 6161-est helyesen `empty_official_sheet` státuszban tartja.

## 2. Első tényleges hivatalos eredmény + játékosazonosítók

A 2446-os MRSZ-jegyzőkönyv:

- 2025-10-17 19:30, Budapesti Egyetemi Atlétikai Club–EMERICUS SE **3–0**.
- Szetteredmények: **25–17, 25–21, 25–23**.
- BEAC: **10** jegyzőkönyvi játékos, Emericus: **11** jegyzőkönyvi játékos; összesen **21** azonosítós sor.
- Mentett, forráslinkes hivatalos minta: `data/competition-history/women1_2025_26_official_m2446.json`.
- A `K` = kezdő / `CS` = csere jelölés **nem** jelenti a játszott szettek számát. A történeti minta egyetlen mérkőzés nevezése, **nem teljes szezonkeret**.

### Két idény közötti, azonos játékoskódokkal igazolt egyezések

A 2026-10-16 19:30-as BEAC–MAFC-ÉPK **3–1** 2026/27-es, már mentett MRSZ-jegyzőkönyv `public.cc_competition_mrsz_screenshot_v1` sorát **csak olvastuk**, és kód alapján összevetettük a 2025/26-os 2446-os hivatalos jegyzőkönyvvel.

**7 azonos, névben is megegyező MRSZ-kód két külön mérkőzésen:**

| MRSZ kód | Játékos |
|---|---|
| 27892 | Albert Anna |
| 31475 | Petri Zsófia |
| 32910 | Iglói Nóra |
| 37523 | Szalontai Rebeka |
| 42988 | Imre Eszter |
| 51046 | Kolba Kata |
| 54846 | Pásztor Dorina |

A korábbi közösségi keret-összevetés 9 **névegyezést** jelzett, ez az első 7 **igazolt MRSZ-kód szerinti** kétidényes egyezés. **Nem következik belőle 70%, 60% vagy egyéb szezonális keretmegtartási százalék**, mert egyik jegyzőkönyv sem a szezon teljes kerete.

A 2026/27-es nyers jegyzőkönyvet **nem** másoltuk a publikus GitHub-történeti adatmintába. Az éles Supabase-ben **semmilyen adatírás nem történt**.

## 3. Ténylegesen működő kód

- `scripts/history/probe-federation-pages.cjs`: négy rögzített forrás-URL, maximum 1,2 MB/válasz, 10 mp timeout, legfeljebb 1 átirányítás, allowlist, Windows-1250/ISO-8859-2 felismerés; online futás csak kifejezett `--network` kapcsolóval.
- `scripts/history/parse-official-women1-protocol.cjs`: a 2025/26-os női I. meccs 2–3–4–5 szettes eredményét, játszmapontjait, csapatait és igazolási kódjait szigorúan ellenőrzi; hibás/üres sablont **nem** fogad el hiteles eredményként.
- `scripts/history/compare-official-rosters.cjs`: **két konkrét jegyzőkönyv** kódjait kapcsolja össze; azonosító–név ellentmondást kézi ellenőrzésre tesz, és **nem számol** keretmegtartást vagy egyéni erősségi pontot.
- `tests/history-official-probe.test.cjs`, `tests/history-official-parser.test.cjs`, `tests/history-official-roster-match.test.cjs`: offline ellenőrzések valós 2446-os mintával, üres 6161-es mintával, dupla igazolási kódokkal és névelírásokkal.
- `.github/workflows/history-official-archive-probe.yml`: korlátozott online elérhetőségi ellenőrzés és offline tesztek.

## 4. Következő feladat és korlát

A közvetlen MRSZ archívum-olvasás **igazoltan működik**. A teljes történeti adatbázishoz még kell:

1. A 2025/26-os **női I. hivatalos mérkőzéslista összes mérkőzéskódja**: nem szabad találgatni, véletlen sorszámok végigpróbálásával feltérképezni.
2. Az MRSZ régebbi **listázó oldalának** megtalálása, vagy a BackOffice API hozzáférés a hivatalos eredménykódok lekérdezéséhez.
3. Az összes ismert jegyzőkönyv **validált** feldolgozása, idény/típus/csoport és meccskód alapú deduplikálással. Üres táblák kizárása.
4. A játékos-ID megfeleltetés bővítése a teljes szezon adatlefedettségének méréséig.
5. A teljes adatbázisra időrendi visszatesztelés: csak ezután jöhet kiértékelt erősorrend és meccs-előrejelzés.

**Kiadási döntés:** hivatalos adatbeolvasás **GO** (egyedi rekord, előzetes parser); teljes ligaérték és keretmegtartás **NO-GO**. A Manager/Player futó statisztikai moduljába semmi nem került át. A történeti adatok külön, forrásazonosítós GitHub-adatmintában maradnak.
