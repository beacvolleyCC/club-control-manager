# CLUB CONTROL – LIVE FORMA / TREND / MECCSKÁRTYA HANDOVER

**Dátum:** 2026. november 15. (Europe/Budapest)
**Téma:** kompakt helyezés, utolsó 5 eredmény, zöld ↑ / piros ↓ / szürke → formajelzés
**Környezet:** LIVE. A V2 TEST külön, érintetlenül marad.
**LIVE Supabase:** snqsxlyhontaepembaic
**Manager repo / ág:** beacvolleyCC/club-control-manager / main
**Player repo / ág:** beacvolleyCC/player_application / main

## 1. Megvalósított cél és UI

A még le nem játszott mérkőzések kártyáin mindkét csapat neve alatt **egyetlen kompakt sorban** megjelenik:
- Részleges, csillagozott helyezés, például **1.*** – tooltip: nem hivatalos; rögzített eredményekből számított helyezés.
- **↑ zöld** javuló, **↓ piros** romló, **→ szürke** változatlan vagy még nem értékelhető forma.
- Legfeljebb 5 zöld/piros apró pont a győzelmek/vereségek sorrendjével.
- Szöveges címkék/tooltip és akadálymentes kiegészítések; nem külön nagy panel.

A nyíl **forma-trend**, nem számszerű győzelmiesély-előrejelzés. A lezárt mérkőzések nagyobb jegyzőkönyvi kártyái nem igényelnek új formapanelt.

## 2. Központi LIVE adatbázis – elkészült és SQL-lel ellenőrzött

**Forrás SQL:** [cc_live_20261115_canonical_form_cards_v1.sql](../../sql/cc_live_20261115_canonical_form_cards_v1.sql)

- Új központi, olvasási célú függvény: private.cc_competition_team_form_cards_v1().
- Nem új táblába másolunk adatokat: a private.cc_canonical_competition_matches_v1 és private.cc_competition_canonical_team_stats_v1() meglévő eredményeiből számol dinamikusan.
- Csoporthatár: competitionLabel + normalizált teamKey. Nem keverjük a férfi I/A, I/B, női I., II/A és II/B bajnokságot.
- A már meglévő, hozzáférés-ellenőrzött **public.cc_manager_competition_mrsz_snapshot_v2()** és **public.cc_player_competition_mrsz_snapshot_v2()** egyazon canonicalFormCards mezővel és canonicalFormVersion=1 jelzéssel adják tovább az adatokat.
- A private számoló függvény közvetlenül nem hívható anon/authenticated szerepkörből; a két publikus snapshotot anon nem hívhatja. A régi v1 snapshot jogosultsági ellenőrzése érvényben maradt.
- Az adatfrissítés az újonnan rögzített hivatalos eredményekre automatikusan kihat, nincs külön Player/Manager eredményimport.

**A jelenlegi képlet:**
- Bajnoki pont: győzelem 2, vereség 1, ki nem állás 0, meglévő forfeits adatokból számolva.
- Részleges rangsor: pont, győzelmek, játszmakülönbség, nyert játszmák, csapatnév. A holtversenyek hivatalos, részletes szabályait nem helyettesíti.
- lastFive: legfeljebb öt rögzített lezárt találkozó, W/L, időrendben (régebbitől újabb felé).
- Trend: utolsó **2** meccs győzelmeinek száma az azt megelőző **2** meccsével összehasonlítva; magasabb → up, alacsonyabb → down, egyenlő → flat.
- Négy rögzített találkozónál kevesebb esetén szürke →; a trendBasis értéke insufficient, tehát nem állítjuk tényként a stagnálást.
- Nem számolunk győzelmi százalékos esélyt, nem pótolunk hiányzó eredményeket találgatással.

## 3. Közös adatforrás – két LIVE felület

**Manager:**
- beacvolleyCC/club-control-manager/app.js + styles.css (main).
- A snapshot canonicalFormCards értékét betölti a ccMrszPhotoState_ állapotba.
- A ccFormCardTeam_ és ccFormCardLine_ az eredményt az adott liga és csapat alapján kapcsolja a ccMatchScoreboardHtml_ meccskártyákhoz.

**Player:**
- beacvolleyCC/player_application/app.js + styles.css (main).
- Ugyanazt a canonicalFormCards mezőt olvassa a LIVE Player snapshotból.
- A ccPlayerFormTeam_ és ccPlayerFormLine_ a ccPlayerScoreboardHtml_ kártyákhoz kapcsolja.
- A Player nem számol párhuzamos rangsort; egyetlen adatbázisos képlet működik.

**Mindkét CSS-ben megvannak:** .cc-form-mini, .cc-form-rank, .cc-form-arrow és .cc-form-dot szabályok.

## 4. LIVE ellenőrzési eredmények (2026-11-15)

Közvetlen SQL-lekérdezéssel:
- **35** lezárt, kanonikus mérkőzés.
- **40** számolt csapatforma-rekord, **33** csillagozott részleges helyezés.
- Trend: **4 ↑, 4 ↓, 32 →**; ebből **14** csapatnál nincs elegendő (legalább négy) eredmény a trendhez.
- Férfi I/B példa: BEAC 1.* (W–L–W), MAFC-Vásárhelyi 4.* (W–L), mindkét nyíl semleges a kevés eredmény miatt.
- A régi competition_source_standings állomány helyezésoszlopai a legutóbb ellenőrzött LIVE állapotban nem tartalmaztak aktuális hiteles helyezést. Ezért a kártya **nem hivatalos helyezést** állít, a csillag nélkül nem szabad rangszámot kiírni.
- A felhasználó említett friss tabellaimportot, de teljes, hivatalos élő helyezésként az ellenőrzött közös LIVE állományból ezt most nem lehetett igazolni. További ellenőrzés és forráshoz kötés szükséges; a női BB2 részleges állapota sem akadályozza a többi liga formáját.

## 5. GitHub / LIVE deploy állapota az ellenőrzés pillanatában

- **Manager main HEAD:** e52d6a9669ae2c596370e556ba9e621cf3bdb01c
  - pages build and deployment: **success**
  - https://github.com/beacvolleyCC/club-control-manager/actions/runs/43719046259
- **Player main HEAD:** 5ef31bd4050d55d83ad7dcce0722f597722de4c8
  - pages build and deployment: **success**
  - https://github.com/beacvolleyCC/player_application/actions/runs/43718947911
  - Player match order and protocol QA: **success**
  - https://github.com/beacvolleyCC/player_application/actions/runs/43718948012
- A központi LIVE SQL számoló függvény ténylegesen a LIVE Supabase-ben van. Külön szerepkör-ellenőrzés szerint az alap számoló függvényhez anon/authenticated közvetlen hozzáférés nincs.
- **Nincs igazolt bejelentkezett böngészős vagy iPhone PWA-s vizuális E2E.** A deploy sikeressége nem helyettesíti a megjelenés- és adatellenőrzést.

## 6. Nyitott feladatok / következő lépések

1. Ugyanazt a még nem játszott mérkőzést Managerben és Playerben megnyitva ellenőrizni: helyes liga/ág/csapat, két külön helyezés, színes nyíl, az utolsó öt pont. iPhone-on se törjön meg a kompakt sor.
2. A felhasználó által frissen importáltnak mondott **hivatalos tabella** pontos rekordjait felkutatni/összevetni. Csak igazolt teljes forrásból állítsunk be hivatalos helyezést; addig marad a csillagozott részleges helyezés.
3. További eredmények feltöltése a már meglévő kanonikus meccsadatokba; ne új import/adatbázis. A női BB2 hiányosság külön kezelhető.
4. Regressziós tesztek: ugyanaz a csapatnév több osztályban, BEAC női I vs BEAC II, PDSE alcsoportok, MTK vs MTK Kék/U20, halasztás, ki nem állás, 0–3, holtverseny és 4-nél kevesebb eredmény.
5. Trendmodell későbbi bővítése szettaránnyal, ellenfél erősségével, hazai/idegen mérleggel; százalékos meccsesély csak külön ellenőrzött modellként.
6. V2 TEST továbbra is külön projekt/ág, PR #89 draft; nem szabad a LIVE-fejlesztésbe automatikusan belekeverni.

## Kapcsolódó dokumentumok

- [15 hivatalos jegyzőkönyv importja és statisztikaállapot](HANDOVER_20261115_LIVE_PROTOCOL_IMPORT_STATS.md)
- [LIVE aktuális handover](../../HANDOVER_CURRENT.md)
- V2 szüneteltetési checkpoint: v2/docs/HANDOVER_PAUSE_FOR_LIVE_2026-11-15.md a V2 ágon.

**Folytatási kulcs:** CC-FOLYTATÁS – LIVE FORMA/TREND.
