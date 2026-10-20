# Club Control — átadás / CC-FOLYTATÁS
**Állapotellenőrzés:** 2026-10-21 (Europe/Budapest). **Folytatási jelszó:** `CC-FOLYTATÁS`.  
**Prioritás:** BEAC Versenysport → Meccsek / Tabella / Áttekintés, Manager–Player adatparitás.  
**Ez egy handover, nem release-engedély.** A GitHub CI/deploy sikere nem egyenértékű a bejelentkezett mobilos UX vagy a LIVE Supabase-adatok elfogadásával.

## 1. Megerősített GitHub-állapot (a korábbi „mi van?” üzenethez képest frissült)
| Projekt | Főági commit | Kiadott frontend | Legutóbbi ellenőrzések |
|---|---|---|---|
| Manager — [beacvolleyCC/club-control-manager](https://github.com/beacvolleyCC/club-control-manager) | `7e6004346b9f8a9b40cdbf5e76f4b83503b6d228` | PR [#70](https://github.com/beacvolleyCC/club-control-manager/pull/70) **merged** (v65); PR [#71](https://github.com/beacvolleyCC/club-control-manager/pull/71) **merged** (v66) | A #71 utáni főágon hat releváns GitHub CI sikeres; GitHub Pages `pages build and deployment` **success** (run 39435822972) |
| Player — [beacvolleyCC/player_application](https://github.com/beacvolleyCC/player_application) | `d5c49b8ef918b790dc126b46998aedf22ecfd041` | PR [#24](https://github.com/beacvolleyCC/player_application/pull/24) **merged**; PWA `20261020-official-protocol-v23e` | Három releváns CI **success**, Pages **success** (run 39435599454) |

**Lényeges pontosítás:** a korábbi, előző chatüzenetben említett #71/#24 teszthibákat a fejlesztési ágakon kijavították, a két PR azóta **össze lett vonva és deployolva**. Ne dolgozz tovább abból a feltételezésből, hogy a PR #71 vagy #24 még hibásan nyitva áll. A korábbi tesztproblémák okai: izolált tesztharnessből hiányzó `ccManagerVerifiedOfficialReport_` függvény és régi cache/test-elvárások; a friss főági CI már zöld.

**Nyitott, *nem* összevonható teljes idényes ágak:**
- Manager [PR #68](https://github.com/beacvolleyCC/club-control-manager/pull/68): `feat/20261019-full202627-readonly-schedule`, head `accbbaf1acbf7f9364a58edf1b190fdbc13039d1`, **open / mergeable=false**, régi főágra épül; a #69–#71 javítások nem veszíthetők el.
- Player [draft PR #19](https://github.com/beacvolleyCC/player_application/pull/19): `feat/20261020-all-fixtures-player-v24`, head `125d62ae7415012c27662d2ed6d5c0df79c20424`, **open / draft / mergeable=false**. A #23/#24 és a teljes jelenlegi főág javításait külön biztonságos újraintegrációval kell megőrizni. A korábbi #17-et nem merge-elni.

## 2. Két jegyzőkönyv: bizonyíték VS. LIVE adat — nyitott, fontos
A felhasználó által biztosított MRSZ-jegyzőkönyvek alapján, 2026-10-19:
1. **BEAC – PDSE**, Férfi Budapest I/B: **3–0**, szettek **25–18, 25–23, 25–20**, MRSZ mérkőzéskód **2699**. Forráskulcs: `ui20261018:menB:beac:pdse:1`, a bizonyított mérkőzés kezdete **19:30 Budapest**. Az október 12-i régi BRSZ-menetrendrekord/BEAC esemény külön kezelendő: ne duplikáljuk a mérkőzést, és ne töröljük az esemény/RSVP azonosítóját.
2. **Panoráma SE – KRE SC-A**, Női Budapest I.: **0–3**, szettek **17–25, 10–25, 12–25**, MRSZ mérkőzéskód **2677**. Importált ellenfélnév `KRE SC` (PDF-ben `KRE SC-A`); forráskulcs `ui20261018:womenI:panoramase:kresc:1`, kezdés **19:00 Budapest**. **Nem BEAC-esemény**, semmilyen BEAC-játékosjelentkezéshez nem kötendő.

**2026-10-21-i közvetlen, READ-ONLY Supabase ellenőrzés: a két `public.cc_competition_user_schedule_v1` sor MÉG MINDIG `record_kind='fixture'`, `source_status='scheduled'`, `home_sets=NULL`, `away_sets=NULL`, `set_scores=[]`.** Emiatt bár a Manager/Player frontend már ismeri a hitelesített adatot és az MRSZ-jegyzőkönyv-URL-eket, a teljes eredménymegjelenítéshez szükséges adatfrissítés **NEM KÉSZ**. Korábban sem írtunk ilyen eredményt a DB-be. Ne állítsd azt, hogy mindkét végeredmény már biztosan látszik a Player/Manager minden nézetében.

Az elkészült kód szigorúan ellenőrzi a liga/dátum/hazai-vendég/sourceKey/végeredmény/szettpontok egyezését, mielőtt a jegyzőkönyvet linkeli vagy saját meccshez hozzárendeli. MRSZ URL-minta a kódban: `https://www.hunvolley.info/pr_00/_jegyzokonyv_terem/v01/jegyzokonyv_nyomtat.asp?p_merkozes_kod=2699&p_evad_kod=2026` és ugyanez `2677` kóddal. A PDF alapján ellenőrzött mérkőzéskód és a generált link tényleges böngészős megnyithatósága külön ellenőrzés.

**Következő adatművelet:** külön, atomikusan, sorazonosítóra és elvárt jelenlegi állapotra feltételesen frissítsd a fenti két importált rekordot `record_kind='result'`, `source_status='played'`, eredmény- és 3 játszmapontadatokkal; ELŐTTE ellenőrizd az időpontot, csapatpárokat, felülírásokat, RLS/RPC függőségeket, meglévő protokollforrást, esetleges duplát; UTÁNA olvasd vissza a nyers táblát és a `private.cc_competition_user_effective_rows_v1()` kimenetét, valamint a Manager és Player saját bejelentkezett nézeteit. Ne írj az `events`, `availability`, `rsvp`, `attendance`, `meeting_at`, `meeting_place` táblákba/mezőkbe az eredmény miatt. A felhasználói feltöltött eredményeket NE cseréld kitalált más mérkőzéseredményekre.

## 3. Elkészült UI-változtatások, éles mobil QA még hiányzik
### Manager — PR #70 → v65; PR #71 → v66
- **Versenysport / Áttekintés:** a régi egyszűrős csapatválasztó helyett többjelölős pipás **Csapat** panel, `Összes csapat` mindet kijelöli, üres körvonalas háromszög nyitásra fordul. Látható csapatok az elérhető eseményekre és jogosultságokra szűrve. **UI QA:** a lenyíló ne takarjon más panelt; rácsfilter első/harmadik vezérlője ne lógjon a szélen; több csapatnál rács, következő meccsek és tabellák közös választást mutassanak. Kód egyes részei még `state.overviewTeam` egycsapatos logikát tartalmazhatnak: multi-választás regresszióját kézzel nézd meg!
- **Jelenléti rács:** az edzők a Csapatok modulból, **első oszlop(ok)ban**; edzői jelzés a már létező jogosultságkezelt coach-availability mentési logikán keresztül, nem játékos-RSVP. Játékos fejléce kattintható, részletes játékosprofil. A fejlécek és profil háromszögek vizuális méretét, görgetést, mobilklikkelhetőséget ellenőrizni.
- **Esemény részletes panel:** jobb oldalon zárt dátum/idő/teremadatok, kisebb magasságú 3+3 Jövök/Nem jövök/Nincs válasz jelzők, fölösleges `RSVP, játékosüzenet és tényleges jelenlét` magyarázatok nélkül. Edzők a névsor játékosai előtt, az edzői elérhetőség külön jelöléssel. Kérdéses: képernyőn valóban minden igazítva jelenik-e meg.
- **Meccsek:** saját BEAC-események elöl, lenyitható névsor a valódi event UUID alapján, `Jövök/Nem jövök/Nincs válasz` státuszokkal; szövetségi mérkőzések alattuk. BEAC–PDSE hiteles eredményhez és MRSZ jegyzőkönyvhöz kapcsolási kód a #71-ben. **NEM szabad** szövetségi csapatszöveg alapján idegen mérkőzést játékosnévsorhoz rendelni.
- **Tabella:** hiányzó igazolt helyezés esetén látható, soronként számozott **„Sor”** oszlop; ez **nem** hiteles szövetségi rangsor. Részletes technikai feliratok helyett tömör csoportmegnevezés és `Frissítve: 2026.10.14.` információ; jelenleg egyes feliratok dátuma statikus pillanatkép-dátum, nem bizonyított automatikus live refresh. A valódi rekord `ccMrszCoverageLabel_` auditfunkcióját megőriztük.
- Menüátnevezések: **`Előző idény` → `Statisztika`**, route `history` maradt, meglévő előző idényes adatok; **`Pályák` → `Terembeosztás`** (csak elnevezés). A Manager Statisztika **még nem vált** a Player minden adatának kész, egységes API-forrásává.

### Player — PR #21–#24 → PWA v23e
- `ccSupabase.rpc('cc_player_competition_user_schedule_v1').catch is not a function` javítva `Promise.resolve(...).catch(...)` formára.
- Férfi Budapest I/A: 7 csapat / 42 forrásmeccs és ellenőrzött részleges eredmények, külön UI (nincs hamis rangsor).
- Férfi Budapest I/B: 7 csapat / 42 sor / 12 BEAC részvétel, halasztott mérkőzés `startsAt:null` engedélyezett, ismeretlen időpont nincs kitalálva. A korábbi **pontosan egy `result`** validátort #24-ben **legalább egy** eredményre javították; a második hitelesített meccs eredményesítése ne rejtse el az egész csoportot.
- Az A/B részleges tabellában a túl nagy `.standings-state` fehér terület és a 6–8 px méretű eredményoszlopok javítva (#23); tömörebb mobil megjelenés, vízszintesen görgethető statadatok.
- A #24 protokoll-linkeket és további eredményforrás megjelenítését készítette elő; tényleges LIVE eredmény csak a megfelelő DB-forrásfrissítés után várható. Telefon/PWA cache és bejelentkezett megjelenítés nincs közvetlenül igazolva.

## 4. Ismert adat- és integritáskorlátok
- Öt bajnoki csoport összesen **300** nyers `2026/27` importált forrásmérkőzés; a korábbi ellenőrzéskor **5 dátum nélküli valóban halasztott** meccs (1 férfi B, 4 női II/A); `startsAt:null` érvényes `postponed` mellett, `scheduled` mellett nem.
- Mentett `competition_source_standings` forrásoknál az `position` mezőkben nincs igazolt hivatalos rangsor; különböztesd meg a tabella *listaszámát* az **MRSZ helyezéstől**. Az A csoporthoz a forrás tabella korábban hiányzott.
- `cc_competition_user_schedule_v1` és `private.cc_competition_user_effective_rows_v1()` az importált adatok elsődleges menetrendforrása, esetleges `cc_competition_match_overrides_v1` és `cc_competition_match_arrangements_v1` réteggel.
- Egy meccs találkozási ideje/helye **nem foglal automatikusan termet/pályát**. Az esemény-UUID, RSVP, üzenet és tényleges jelenlét külön azonosítandó és megőrzendő.
- Ne rejts el valós már lejátszott eredményt, korábbi jegyzőkönyvet, nem igazolt BEAC–BEAC önmérkőzés-rekordot ellenőrizetlenül; duplák, BEAC II./PDSE/UTE identitások és eredménykonfliktusok felülvizsgálandók.
- A GitHub Pages sikeres kiadása önmagában nem bizonyítja a belépett felületen látható adatot; iPhone PWA-nál service-worker frissítés/cache, EU 24h, hétfői hétkezdet teszt.

## 5. Következő sorrend (ne próbálj mindent újraírás nélkül megoldani)
1. **Két hitelesített eredmény adatbázisba juttatása, külön QA:** előzetes diff, csak 2 célrekord, utánellenőrzés visszaolvasással. Szükség esetén MRSZ/PDF linkek és szettpontok újraegyeztetése. Ezután mindkét appban találati kártya, állás, jegyzőkönyv megnyitás; saját BEAC meccs oldali eredmény + roster/UUID védelem.
2. **Manager v66 képernyő QA**: pipás csapatválasztó jogosultsággal, minőség mobil/desktop; rács játékosprofil, edző részvételi csúszka és névsorbeli sorrend; modálmezők és 3+3 jelzések; a tabella Sor számozása; háromszög méret/forgás/átfedés; PWA frissítés.
3. **Player v23e képernyő QA**: férfi A/B csapatlista, B 42 mérkőzés, 2 hitelesített eredmény átmenete, jegyzőkönyv gomb; női I. Panoráma–KRE eredmény; valamennyi statisztika és jegyzőkönyv továbbra is működik.
4. **Teljes ötligás kiírás (#68, draft #19)**: régi konfliktusos fejlesztési ágakat **NEM MERGE-ELNI**. Biztonságosan új main-alapra helyezni, beleértve v65/v66 Manager és v23d/v23e Player összes hotfixét; ellenőrzés 300/300 + 5 null-dátumos halasztás + jelenlétek és jegyzőkönyvek.
5. **Statisztika közös adatforrásának megtervezése**: a Manager „Statisztika” modulban legyen a kanonikus szerveroldali, jogosultságkezelt sportadat és read-only Player-fogyasztás. **Nem kész**, a menü átnevezése nem maga az API. Audit, jogosultság, cache, historikus eredmények külön.
6. **Nyitott design részletek**: Jelenlét szűrők lecsúszása/kilógása, esemény főadatok jobb igazítása, hat válaszmező magassága, túl kicsi profil-nyíl, tabella táblázatos olvashatóság, klubhoz rendelt edzők szerepének ellenőrzése.

## 6. Egyszerű folytatási munkamenet
- Indítás: `CC-FOLYTATÁS`, olvasd ezt a fájlt és `HANDOVER_CURRENT.md`-t, majd `main` commitokat és PR státuszokat **újra** ellenőrizd. A GitHub refek változhatnak; csak frissen ellenőrzött ágakra pusholj.
- Az új eredményfrissítés előtt kizárólag SELECT olvasás; adatírást ne végezz olyan körben, ahol nem kérte vagy nem igazolta az eredményellenőrzést.
- Minden fejlesztéshez regressziós tesztek, a történeti/tábla/roster és meccssorrend CI **mind zöld**, valamint konkrét felületi QA szükséges. Az új UI ne változtassa meg automatikusan az értesítéseket, jelenlétet, foglalásokat vagy a játékosok személyes adatait.
