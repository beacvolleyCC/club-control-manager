# Club Control — HANDOVER / CC-FOLYTATÁS
**Frissítve:** 2026-10-22 (Europe/Budapest). **Folytatási kulcs:** `CC-FOLYTATÁS`.
**Következő munka:** Player iOS/Apple Naptár **automatikusan frissülő, privát ICS-előfizetés** + eseményváltozáskor Club Control push-értesítés. Ez még **nem készült el**. A legutolsó felhasználói kérés: handover és új chat.

> Fontos: a korábbi, 2026-10-21-i handover `docs/handover/HANDOVER_20261021_CC_CURRENT.md` és `HANDOVER_CURRENT.md` előzmény. A mostani állapotot ez a 2026-10-22-i átadás írja felül. Ne tekintsd a korábbi főági SHA-kat vagy régi „még nincs eredmény” megállapításokat aktuálisnak.

## 1. Rendszer és források
- Manager: [beacvolleyCC/club-control-manager](https://github.com/beacvolleyCC/club-control-manager), `main`.
- Player: [beacvolleyCC/player_application](https://github.com/beacvolleyCC/player_application), `main`.
- Supabase project ID: `snqsxlyhontaepembaic`.
- Közös szerződés: [docs/CANONICAL_DATA_CONTRACT_2026-10-21.md](../CANONICAL_DATA_CONTRACT_2026-10-21.md). A sportág-/csoportspecifikus azonosítók, a match/event/booking kapcsolatok és a jogosultságkezelés kötelező.
- Alap helyszín: Bogdánfy csarnok, Budapest, Bogdánfy u. 12. Időzóna: Europe/Budapest, EU 24 órás idő; hétfői hétkezdés.
- Szigorúan őrizd a meglévő `public.events` eseményazonosítóit, `availability` jelentkezéseket, jelenléteket és archivált eseményeket. **Nem szabad tömegesen törölni, újraalkotni vagy név alapján összevonni.**

## 2. Aktuálisan ellenőrzött főági kód
**Manager**
- `app.js` GitHub blob SHA: `125a9aff539673ab031d75b59b768edc235627a4`; a kritikus bejelentkezési javítás commitja `5a48bf21adca5f87046a3a79b307aa6e7a038bd9`.
- `index.html` GitHub blob SHA: `bedd28c262325e65971c20f5203603b7583c80d7`; cache-buster: `app.js?v=20261021-manager-login-null-fix-v5`, commit `22b4d0247eeab99ec2d785264587b4fc1fd79b71`.
- A képernyőképpel jelentett iPhone-belépési hiba oka a `ccBindMrszProtocol_()` függvényben `$('#viewContent [data-cc-mrsz-external]').forEach(...)` volt: `$` csak egy DOM-elemet ad vissza. **Javítva** `$$('#viewContent [data-cc-mrsz-external]').forEach(...)` alakra. Visszaolvasással ellenőrizve: tényleges fájlváltozás, teljes JS syntax PASS, egyetlen ilyen hibás szinguláris szelektor sem maradt; 0 és 1 kártyával izolált handler-teszt PASS. Az **éles, bejelentkezett iPhone-teszt/deploy verifikáció még nincs igazolva**. A hiba képen látható belépési kódját, emailcímét **ne másold át**.
- Manager Meccsek/Tabella: `canonicalMatches` alapú bajnoki lista, négy státuszszűrő (`Összes / Halasztva / Kiírt / Lejátszott`), halasztottak előre sorolva; jegyzőkönyv megnyitása belül vagy hivatalos hivatkozással.

**Player**
- `app.js` blob SHA: `7631fad2abeb4e14ddb307f7aaac2b0a7a8ac6af`.
- `index.html` cache-buster: `app.js?v=20261021-canonical-partial-stats-v4`, `styles.css?v=20261021-canonical-partial-stats-v4`; GitHub blob SHA `d1de77ac9b2d3406525bb67deb20b82bd3e469da`.
- Egységes canonical bajnoki meccslista, négy státuszszűrő, halasztottak felül, jegyzőkönyv-kártyára kattintás. Részleges statisztika; **nem** állít elő hitelesnek látszó rangsort.
- Ezek a fájl-/commit-SHA-k ellenőrzési pontok, nem bizonyítanak sikeres éles Pages-deployt. Új chatben a GitHub `main` legfrissebb tartalma az elsődleges.

## 3. Supabase központi sportadatok (ellenőrizve 2026-10-22)
- `public.cc_competition_mrsz_screenshot_v1`: nyers MRSZ/BRSZ menetrend-, eredmény- és tabellaforrások; őrizendők.
- `private.cc_canonical_matches_v1`, `private.cc_canonical_match_aliases_v1`: match-azonosítók/aliasok (ne kapcsolj találkozókat kizárólag csapatnév és dátum szerint).
- `private.cc_canonical_competition_matches_v1`: olvasási nézet öt bajnoki csoport egységes, lejátszott/kiírt/halasztott mérkőzéseivel.
- `private.cc_competition_canonical_payload_v1()`: `canonicalMatches`, benne `matchCode`, `protocolUrl`, ahol van `protocol.teams` játékosnévsor.
- `private.cc_competition_canonical_coverage_v1()`: csoportonként coverage/eredmény/státusz.
- `private.cc_competition_canonical_team_stats_v1()`: csak igazolt eredményekből **részleges** csapatmérlegek; `position` és `tablePoints` jelenleg NULL, amíg nincs hiteles hivatalos teljes tabella.
- Közös, jogosultsággal védett RPC-k: `public.cc_manager_competition_mrsz_snapshot_v2()` és `public.cc_player_competition_mrsz_snapshot_v2()`. Megtartott mezők: `fixtures`, `matches`, `tables`; továbbiak: `canonicalMatches`, `canonicalCoverage`, `canonicalTeamStats`. A privát függvényekre `anon`/`authenticated` közvetlen EXECUTE nincs; az alkalmazási v2 RPC saját jogosultsági kapuja megmaradt.
- **Ellenőrzött összesen 298 központi mérkőzés**: 13 lejátszott, 281 kiírt, 4 halasztott, 13/13 lejátszott eredményhez eredeti MRSZ-jegyzőkönyv-link. A források és alkalmazáson belüli jegyzőkönyvek 10 mérkőzésnél részletesen feldolgozottak, 3-nál jelenleg külső hivatalos hivatkozás. A feltöltött eredeti jegyzőkönyveket **nem kell újra feltöltetni a felhasználóval**.
- Bajnokságonként (lejátszott / kiírt / halasztott): **Férfi I/A 2/40/0; Férfi I/B 2/40/0; Női BB1 7/123/0; Női BB2/A 0/38/4; Női BB2/B 2/40/0**. A BB2/A 4 halasztott meccse időpont nélkül, külön szűrhető, mindig listaelején.
- A részleges csapatstatisztika 40 csapatsort ad (7/7/12/7/7). Ellenőrizve: csapatszereplések összege a lejátszott mérkőzések duplája, szettek és M=GY+V helyes, 0 kitalált helyezés/pont.
- Női BB1 130 központi mérkőzését, és a forrásadatok esetleges végső egyezőségét később hivatalos mérkőzésazonosítókkal újra kell validálni. Teljes hivatalos tabella még nincs beépítve; csapatrangsor nem számolható tetszőleges részadatból.
- Az öt aktív, hivatalos forráshoz nem egyértelműen párosított Manager-esemény és a régi BEAC–BEAC forrásszintű hibák történeti adatként kezelendők. Ne töröld automatikusan az RSVP-ket.

## 4. iOS / Apple Naptár – MOST EZ A KÖVETKEZŐ FELADAT
**A jelenlegi kód tényei:**
- Player `app.js`: `buildCalendarIcs_()`, `calendarIcsFile_()`, `downloadCalendarIcs_()`, `exportAppleCalendar_()`, `exportGoogleCalendar_()`. Beállítások / `Naptár export` panel: `calendarExportAppleBtn`, `calendarExportGoogleBtn`.
- A `buildCalendarIcs_()` a *betöltött aktuális csapat* `events` listáját veszi, nem kizárólag a jelentkezett eseményeket. Az ICS tartalmaz stabilnak szánt UID-t, Budapest TZ-t, DTSTART/DTEND/SUMMARY/LOCATION/DESCRIPTION mezőket.
- iOS-en jelenleg `navigator.share({files:[file]})` vagy letöltés történik: **egyszeri import/export**, nem élő naptár-feliratkozás. Az importált események nem frissülnek automatikusan; az ismételt import duplikálhat.
- A Playerben a lekért főági forrásban nincs `webcal://` vagy élő subscription link; Supabase Edge Functions (ellenőrizve): `cc-push` v9, `cc-competition-sync` v8, `cc-competition-mrsz-sync` v2, `cc-mass-mail-sender` v2. **Nincs telepített ICS-előfizetési endpoint**. A korábbi elképzelés szerinti privát tokenes ICS feedet ezért **ne tekintsd kész funkciónak**.
- Az Apple Naptár időszakosan tölti újra a subscribe-olt ICS feedet; frissítésének ütemezését nem tudjuk megbízhatóan kikényszeríteni vagy személyenként visszaigazolni. Azonnali figyelmeztetésre a külön Club Control push használható, engedélyezett eszközön.

**Javasolt következő építési sorrend, több lépésben és minden után 2× QA:**
1. Auditáld az esemény/jelentkezési adatmodellt és a meglévő `cc-push` rendszert, a publikus végpontok jogosultságait. Pontosítsd a két scope-ot: `Csapat összes edzése és mérkőzése`; `Saját naptáram: ahol a játékos jelentkezett`.
2. Hozz létre kifejezetten visszavonható, nagy entrópiájú **privát feedtokent** tároló backend konstrukciót RLS/jogosultságellenőrzéssel. A token linkben érzékeny bearer-secret: csak létrehozáskor azonosított játékos fér hozzá, megújítható/tiltható, nem naplózható és nem tartalmazhat közvetlen személyes adatot. Soha ne tegyél service-role kulcsot a frontendbe.
3. READ-ONLY `text/calendar; charset=utf-8` válaszú HTTPS Edge Function/endpoint, mindkét scope-pal; valós Manager `events` + Player bookings / memberships forrásból dolgozzon. Egy eseményhez időben stabil `UID`, módosításnál `LAST-MODIFIED`, `SEQUENCE`; törlés/archív/lemondás `STATUS:CANCELLED` vagy dokumentált törlési szabály. Időzóna, DST, CRLF és ICS-escape szabványosan, adatmegjelenítés a jogosult scope szerint; ne legyen érzékeny RSVP-névsor nyilvános feedben.
4. Player Beállítások → Naptár: a meglévő egyszeri exportot ne törd el, de adj `Feliratkozás az Apple Naptárban`, `Hivatkozás másolása`, `Előfizetés visszavonása` műveleteket. Tájékoztatás: *nem azonnal* frissül az Apple-ben.
5. Manager eseménymódosítás / lemondás: ha már van hiteles változásértesítési eseményfolyam, azon keresztül küldj célzott Club Control push-t; az ICS **nem push**, és az iPhone feed-refreshről nincs visszajelzés. Nem szabad több csapatnak, jogosulatlan játékosnak vagy irreleváns módosításra téves értesítést küldeni.
6. QA **kétszer**: jogosult/jogosulatlan feed; token revoke/rotation; saját vs csapat scope; edzés+meccs; jelentkezés/lemondás; időpontváltás stabil UID-val; CANCELLED; iOS DST; adatvédelmi mezők; naptár import (iPhone Safari/PWA); értesítés deduplikáció; Manager és Player regresszió + PWA/service worker/cache.

## 5. További nyitott feladatok és óvintézkedések
- **Hiteles teljes tabella** beszerzése és forrásszerződés; jelenleg a Tabella „részleges eredménystatisztika”, nem hivatalos helyezés. A későbbi Manager/Player Statisztikák modult ugyanezen canonical source alapján kell egységesíteni; forma / legnagyobb feljövő csak ellenőrzött és teljes historikából számítható.
- Meccsek, Tabella, Áttekintés közös adategyezése; bejelentkezett böngészős UI végponttól végpontig, mobil Safari/PWA, RSVP és jegyzőkönyvnyitás. GitHub fájl-/szintaxis-/HTML-teszt nem egyenlő LIVE UX teszttel.
- Kerüld a régi ötligás, konfliktusos PR-ok automatikus merge-ét; korábban Manager #68 és Player draft #19 volt nyitva, státuszukat újra ellenőrizni kell.
- A fejléc/árnyék/menü bugok vagy `forEach` hibák miatt sose cserélj le kézzel teljes appfájlt régi snapshotra; a `main` aktuális diffjét tartsd meg.
- Szinkron és kiadási minőség: **11 pontos QA, kétszer**, SQL aggregátum+invariáns, JS-szintaxis, célzott funkcionális kártyateszt, GitHub tartalom SHA és diff, CI, élő Pages és autentikált iOS UI. Ne állítsd, hogy élesben tesztelt, ha nincs valódi autentikált eszköz/böngésző-teszt.

## 6. Új chat első üzenete
`CC-FOLYTATÁS — olvasd el a beacvolleyCC/club-control-manager repóban a HANDOVER_CURRENT.md fájlt és a docs/handover/HANDOVER_20261022_CC_CURRENT.md átadást. Innen folytassuk. Most az automatikusan frissülő, privát iOS naptár-előfizetés és a kapcsolódó Club Control push-értesítések megvalósítása következik, több lépésben, minden változtatást kétszer ellenőrizve. Meglévő adatot és funkciót ne törölj.`
