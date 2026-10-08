# Manager · Edzéstervezés → Számláló · Röplabda V2

## Miért így?
Kutatási alapok:
- FIVB 2025–2028 hivatalos röplabdaszabályok (szettkezdő felállás és nyitási sorrend, 7.3 és 7.6): https://www.fivb.com/volleyball/the-game/official-volleyball-rules/
- Data Volley 4 élő meccskódolás: https://dataproject.com/Products/EU/en/Volleyball/DataVolley4
- SoloStats Live élő statisztika: https://www.solostatslive.com/product/solostats-live
- Hudl forgásonkénti elemzés: https://www.hudl.com/support/club-volleyball/guides/analyze-stats
- NCAA 2025 statisztikai útmutató, ütések és hatékonyság: https://fs.ncaa.org.s3.amazonaws.com/Docs/stats/Stats_Manuals/Volleyball.pdf

## Felhasználói út
1. **Edzéstervezés → Számláló**; röplabdában az első megnyitáskor 1 pálya.
2. Átnevezhető csapatok és pálya; további pályák külön hozzáadhatók (max. 6).
3. **Szett előkészítése**: 6-6 mezszám az 1–6-os pozícióhoz (legalább egyik csapat teljes hatosa szükséges). Válaszd ki a kezdő nyitó csapatot. A két csapat kezdőfelállása szettenként külön tárolódik.
4. **Szett indítása**: két +1 pont gomb. Nyert labdamenet után a fogadó csapat automatikusan elforog, amennyiben nyitásjogot szerez. Mindig megjelenik az 1. forgáshelyen álló aktuális nyitó; az ellenfél kezdő hatosa nélkül csak a csapat nyitásjoga ismert.
5. **Statisztika**: pontozás után a legutóbbi labdamenethez rögzíthetők játékosesemények (nyitás, nyitásfogadás 0–3, támadás, sánc, védekezés, feladás, egyéb). A statisztikai esemény *nem* oszt ki pontot.
6. **Hibajavítás**: „Visszavonás” visszaállítja az előző művelet előtti szettet, beleértve az állást, forgást, eseményeket, cseréket. Tárolásvédelmi okból az utolsó 20 művelet visszavonása tartható meg.
7. **Szett lezárása**: külön gombbal; szabályos végállásnál jóváhagyással, idő előtt csak külön edzőmeccses megerősítéssel. Döntetlen nem zárható.
8. **Következő szett**: előző szett archívumként megmarad, új kezdőfelállás előtöltve, módosítható, kezdő nyitást újra ki kell választani.
9. **Elemzés**: aktuális, korábban lezárt vagy teljes meccs; side-out, saját nyitásból szerzett pontok, forgáslépések, egyéni ász, támadóhatékonyság, nyitásfogadás átlag stb.
10. **Export**: JSON (teljes eseménynapló, felállások, szettek); CSV (rally + technikai események). Helyi időmérő és ugyanazon készülék kivetítő módja.
11. **Szabad pontozás**: a korábbi általános mód elkülönített mentéssel elérhető marad.

## Korlátok
- A röplabda mérkőzések **csak ezen a böngészőn** tárolódnak: nincs szerveroldali mentés vagy többeszközös szinkron. Böngészőadatok törlése esetén elveszhetnek; rendszeres JSON export ajánlott.
- Nem hivatalos elektronikus jegyzőkönyv: a libero váltásai és a hivatalos cserejogosultság/versenyszabály ellenőrzése **még nincs** megvalósítva. A kézi csere egyszerűen ugyanabba a forgáshelybe tesz más mezszámot.
- A részletes, labdaérintésenkénti Data Volley-típusú kódolás és az utólagos videós korrekció későbbi fejlesztés.
- A kiosztott pontok **nem** bizonyítják, hogy melyik játékos szerzett pontot. Egyéni statisztika csak a ténylegesen rögzített technikai eseményekből számítható.
- Gyári/radiós fizikai kijelző vezérlés és felhőben megosztható eredményjelző még nincs. A „Kivetítő” ugyanazon a készüléken nyíló teljes képernyős nézet.
- A mostani 0–3-as fogadási skála egyszerűsített edzői minősítés, nem teljes Data Volley 6 szintű kód.
- Későbbi: Club Control játékos-roster és mezszám automatikus betöltése a Manager jogosultság alapján, felállásellenőrzés, csereszám-/liberó-állapot, statisztikai kódolás, többeszközös szinkron és eredményjelző-adapterek.

## Fájlok
- `volleyball-core.js`: szabály- és esemény motor.
- `volleyball-ui.js`: mobil/desktop meccs- és statisztikai felület, helyi mentés.
- `volleyball.css`: reszponzív stílusok.
- `scoreboard.js`: egy pálya alapból; sportág-specifikus delegáció.
- `index.html`, `sw.js`, `config.js`: betöltés, gyorsítótár és verzió.
- Tesztek: `tests/volleyball-core.test.cjs`, `tests/volleyball-ui.test.cjs`, a korábbi `tests/scoreboard.test.cjs`, `tests/nav-regression.test.cjs`.

## QA
```bash
node --check volleyball-core.js
node --check volleyball-ui.js
node --check scoreboard.js
node tests/volleyball-core.test.cjs
node tests/volleyball-ui.test.cjs
node tests/nav-regression.test.cjs
```
Élesítés előtt és után: Manager belépés, főmenü, Edzéstervezés/ Tervező és Számláló, új pálya, alapértelmezett 1 pálya, szettkezdés, forgás nyitásváltáskor, nyitó mezszáma, kézi szettlezárás, korábbi szett elemzés, statisztikai események, adatvisszaolvasás/refresh, letöltés iOS Safariban.
