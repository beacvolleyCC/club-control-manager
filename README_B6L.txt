CLUB CONTROL MANAGER V0.5.2B6L — ATTENDANCE / BEAC IMPORT / STANDINGS HOTFIX
Date: 2026-10-04

SCOPE
-----
1) Versenyzői tényleges jelenlét tartós mentése és visszaolvasása.
2) Tömegsport → BEAC import menüpont visszaállítása.
3) Mobil tabella determinisztikus, saját vízszintes scroll-geometriája.
4) B6K minden korábbi frontend-javítása megmarad, beleértve a Csapatok → Rács edzői RSVP-t.

ATTENDANCE
----------
- A jelenléti slider egy módosításkor csak az adott cellát menti; nem nyitja újra az egész eseménydialogot.
- Az új MGR023 write RPC mentés után közvetlenül visszaolvassa public.availability.attendance_status értékét.
- A frontend a visszakapott státuszt ellenőrzi; eltérésnél hibát jelez és a slider visszaáll.
- A roster új MGR023 read RPC-je közvetlenül az availability táblából olvassa az attendance_status mezőt.
- A középső / törölt állapot NULL-ként kerül mentésre, nem "clear" szövegként.

BEAC IMPORT
-----------
- Tömegsport almenü: BEAC import.
- A nézet a Supabase-ben lévő canonical/raw importált bérletadatokat mutatja.
- Az "Import újratöltése" a már Supabase-ben lévő importadatot tölti újra a Managerbe; külső BEAC forrást önmagában nem frissít.

STANDINGS MOBILE
----------------
- A tabella mobilon fix oszlopgeometriát kap.
- Csak a tabella saját konténere scrolloz vízszintesen; a teljes Manager oldal nem.

DEPENDENCIES
------------
- MGR021 maradjon telepítve.
- MGR022 maradjon telepítve.
- Telepítsd az MGR023 csomagot a frontend előtt.

INSTALL ORDER
-------------
1. MGR023 PRECHECK
2. MGR023 INSTALL
3. MGR023 POSTCHECK
4. B6L frontend fájlok feltöltése

FRONTEND FILES
--------------
- app.js
- index.html
- styles.css
- sw.js

A config.js NINCS a ZIP-ben. Ne cseréld le.
A manifest, icons és assets változatlanok; a meglévő példányok maradnak.

FIRST LIVE SMOKE
----------------
1. Nyiss meg egy már elkezdődött versenyedzést.
2. Egyetlen játékost állíts Megjelent állapotra.
3. Zárd be az eseményt, majd nyisd meg újra.
4. A jelölésnek meg kell maradnia.
5. Ezután jelölj gyorsan több játékost, zárd/nyisd újra, és ellenőrizd őket.
6. Teszteld a Nem jelent meg és a középső / törölt állapotot is.
7. Tömegsport alatt ellenőrizd a BEAC import almenüpontot.
8. Mobilon a Tabella oldalirányban csak a táblán belül mozogjon.

A statikus QA nem helyettesíti az éles Supabase + mobil smoke tesztet.
