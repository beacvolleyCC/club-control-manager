# Statisztika / keret- és csapatazonosítás – 3. etap (2026-10-17)

**Állapot:** tényleges 2026/27-es jegyzőkönyv és korábbi közösségi keretadat összevetése, kizárólag kutatási eredmény. **Nincs** éles táblamódosítás, automatikus csapatösszevonás, egyéni pontszám vagy mérkőzés-előrejelzés.

## 1. Történeti adatok – új forrás

[Volleybox – BEAC női csapat](https://women.volleybox.net/budapesti-eac-t12638) – ellenőrzendő közösségi adat:
- **2025/26:** 2. helyezés a női Budapest I.-ben; **15 listázott játékos**.
- **2024/25:** 5. helyezés ugyanitt; mindössze **3 listázott játékos**, **nem teljes keret**.
- **2026/27:** jelenleg **2 listázott játékos**; **nem teljes keret**.
- **Nóra Iglói:** ugyanazzal a Volleybox profilazonosítóval (`77091`) szerepel a 2024/25-ös és 2025/26-os listán; **ez a közösségi adatbázison belüli profilazonosságra utal**, nem igazol teljes MRSZ szezon- vagy szettstatisztikát.

Játékoskeret- és helyezésforrás: https://women.volleybox.net/budapesti-eac-t12638
Az érkező/távozó játékosra példa: [Anna Albert – Volleybox](https://women.volleybox.net/anna-albert-p21497), [2025/26-os átigazolási lista](https://women.volleybox.net/transfers/2025-26/ALL/370).

**Anna Albert / Albert Anna:** a közösségi forrás 2024/25-re MAFC-ÉPK, 2025/26-ra BEAC csapatot jelez, MRSZ-profilhivatkozásában `p_szemely_kod=27892` szerepel. Az egyedi MRSZ-profil tartalmát még nem tudtuk a nyilvános oldalról közvetlenül beolvasni, ezért a korábbi szereplés továbbra is ellenőrzendő.

## 2. Valós 2026/27-es MRSZ jegyzőkönyv-adat ellenőrzése (READ-ONLY)

Supabase `public.cc_competition_mrsz_screenshot_v1`, 2026/27-es rekord, `record_kind='match'`, `data->'protocol'->'teams'`:
- **2026.10.16. 19:30:** Budapesti Egyetemi Atlétikai Club – MAFC-ÉPK, **3–1**; a rekord `capture_date=2026-10-17`.
- A **BEAC** listájában **13 nevezett játékos** található.
- A közösségi 2025/26-os **15 névből** a mentett 2026/27-es jegyzőkönyvben **9 játékos neve megegyezik**, ha a magyar és nemzetközi névsorrendet megfelelően kezeljük:
  - Imre Eszter
  - Szalontai Rebeka
  - Kőrösi Luca Anna
  - Papp Laura Dorottya
  - Petri Zsófia
  - Pásztor Dorina
  - Kolba Kata
  - Albert Anna
  - Iglói Nóra
- **Nem közvetlen névegyezés:** Nagy-Tóth Csenge, Farkas Bernadett Réka, Tóth Szandra, Seprős Eszter. Például `Nagy-Tóth Csenge` nem vonható össze automatikusan a 2025/26-os `Tóth Csenge` közösségi bejegyzéssel.
- Az aktuális jegyzőkönyvben **Albert Anna MRSZ-kódja `27892`**, amely megegyezik a közösségi forrás által a korábbi játékosmúlthoz hivatkozott azonosítóval. Ez **valódi, ellenőrizhető keresztforrásos azonosítási jelölt**, de nem bizonyítja önmagában, hány mérkőzésen/szettben játszott 2024/25-ben vagy 2025/26-ban.
- A `K` és `CS` kizárólag a mentett jegyzőkönyvi jelölések; **nem** játszott szettek vagy értékelhető játékidő.

A riportban **nem számítunk 9/15=60%-os keretmegtartást**: egyetlen idei meccs nevezési listáját és egy **nem hivatalos, ismeretlen lefedettségű** tavalyi keretlistát vetettünk össze.

Ez az állapot az adatbázisban történt SELECT-es ellenőrzésből származik. Nincs új DB-sor; a nyers 2026/27-es protokollt nem másoltuk be a publikus GitHub-adatmintába.

## 3. Bajnoki csapatok azonossága külön feladat

[Volleybox 2025/26 női Budapest I. – 12 klub/csapat](https://women.volleybox.net/women-budapest-volleyball-championship-1-division-2025-26-o43403) vs a Club Control 2026/27-es 12 név szerint mentett csapata.

**Négy egyszerű névegyezés:** BEAC, MAFC-ÉPK, Mozdulj SE, Panoráma SE. Ez **nem négy hivatalosan igazolt szezonon átívelő csapatazonosító**, csak név szerinti támpont.

**Kézi ellenőrzés kötelező:** 2025/26-os `Emericus SE II.`, `Közgáz II.`, `KRE II.`, `MTK Budapest II.` vs a 2026/27-es egyszerűbb nevek; `Kertvárosi SE` vs `KSE`; `Ráckeve SZSE` vs `Ráckeve`. A második csapat jelölése kifejezetten fontos, nem szabad klubnév alapján egyesíteni.

A 2025/26-os közösségi bajnoki névsor **nem hivatalos versenyjegyzék**, a csapatok valós, teljes körű azonosításához a két idény MRSZ/BRSZ forráscsapat-azonosítói szükségesek.

## 4. Kód / ellenőrzések

- `data/competition-history/beac_women1_roster_evidence_2024_2026.json` – forrásokkal dokumentált, részleges közösségi roster és hivatalos protokollokra mutató hivatkozás, **éles alkalmazásban nem használt staging**.
- `scripts/history/roster-evidence-audit.cjs` – részleges idények és közösségi adatok minőségi kapuja, csapatnév-egyezések ellenőrzése.
- `scripts/history/reconcile-roster-evidence.cjs` – **általános**, csak helyi JSON-fájlokon futó, magyar/nemzetközi sorrendet kezelő névösszevetés, **nem állít elő megtartási százalékot**.
- `tests/history-roster-evidence.test.cjs`, `tests/history-roster-reconciliation.test.cjs` – az álazonosságok, második csapatok és pontszám-kitalálás elleni regressziós tesztek.
- `.github/workflows/history-evidence-qa.yml` – automatikus ellenőrzés.

## 5. Mi hiányzik az éles statisztikához?

1. **Teljes hivatalos 2025/26-os bajnoki menetrend és eredménylista**, ellenőrzött csoport- és meccskódokkal; a jelenlegi MRSZ URL-példák `p_verseny_al_kod=93` paramétert használnak, de csak néhány egyedi jegyzőkönyvet találtunk.
2. **Minden 2025/26-os játszott mérkőzés játékosjegyzőkönyve**, az igazolásszámokkal. A jelenlegi nyilvános MRSZ-lekérdezés gyakran csak a jegyzőkönyv fejlécét adja; nem teljes letöltés.
3. Az **előző és aktuális csapatkeretek hivatalos azonosítása**, különösen `II.` csapatok és idények között.
4. **MRSZ BackOffice API hozzáférés tisztázása**, külön a 2024/25 és 2025/26 archív adatokhoz (2020-as dokumentáció: https://hunvolley.hu/index.php/archiv/az-mrsz-a-klubok-honlapjainak-menedzseleset-segitene/).
5. Csak utána **eredményalapú összehasonlítás és játékoskeret-korrekció visszatesztelése**; addig minden erősségi és esélyszámítás kizárt.

**Kiadási döntés:** adat- és identity-research **GO**; eredmény/keret-alapú pontszám éles Player/Manager megjelenítésre **NO-GO**.
