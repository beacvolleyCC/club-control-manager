# CC-FOLYTATÁS — meccsmodul célzott lezárás, 2026-10-25

**Fejlesztési állapot:** Manager [PR #76](https://github.com/beacvolleyCC/club-control-manager/pull/76) és Player [PR #28](https://github.com/beacvolleyCC/player_application/pull/28), külön draft PR-ek. Nincs merge, deploy, Supabase-írás, esemény- vagy RSVP-módosítás.

## Rögzített döntés

A felhasználó korábban belinkelt 2026/27-es menetrendje **végleges kiírás**. A jelenlegi Manager és Player `canonicalMatches` (megjelenítési rekordokat adó v2 RPC) az elsődleges mérkőzésforrás. A 41 régi BRSZ aliasjelölt manuális azonosítása **nem kapuzza** a meccsek megjelenítésének lezárását. Ugyanakkor az eredmények és jegyzőkönyvek önálló, hiteles forrásból érkeznek; a menetrend nem bizonyítja, hogy egy mérkőzést lejátszottak.

Csapatok és osztályok külön: Női Budapest I (BEAC szövetségi 299, MTK Budapest 1092), Női Budapest II/B (BEAC II 959, MTK Budapest kék 1165), Férfi Budapest I/B (BEAC 709), és Férfi I/A mint másik csoport. Csapatnév vagy megegyező időpont önmagában nem azonosító.

## Ténylegesen javított működés

Manager #76: a `BEAC meccsek` / `Összes bajnoki meccs` kapcsoló korábban a négy csoportos „összes BEAC csapat” nézetben hiába volt kattintható: minden újrarajzolás `onlyBeac:true` módot kényszerített. Most a BEAC az alapérték, de az összes meccsre váltás **megmarad** az újrarenderelés után. Sem a Manager események, sem a névsor/RVSP kulcsok nem változnak. PWA cache és HTML JS/CSS token: `20261025-canonical-fixtures-v1`.

Player #28: `ccPlayerResultsOnlyStandings_` korábban hibásan kommentbe került `setsFor/setsAgainst` növelése javítva. Valódi 3–0/3–1 részleges eredményekből helyes szettmérleg készül. Eredmény nélküli szettpontokból nem készül kitalált labdapont; hivatalos helyezés és bajnoki pont részleges adatokból nem számolódik. Dátum nélküli halasztás szövege `Halasztva · Időpont nélkül`; Player cache token `20261025-authoritative-results-v1`.

## QA

Manager **7/7 ellenőrző workflow zöld** a `2c1988bf782213cf43c3a4a869ae5f8fb51b4957` code commiton (új négycsoportos canonical menetrend/szűrő teszt, jelenlegi csapat/league, edzői névsor, scoring, protocol, match chronology, archive). [CI](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40186219995).

Player **4/4 workflow zöld** a `a0fa0d1c350a48f046d1e861a8b29eb42cebba05` commiton (új szett és menetrend teszt, részleges MRSZ tabella, férfi B kiírás, jegyzőkönyv). [CI](https://github.com/beacvolleyCC/player_application/actions/runs/40186057712).

## Külön nyitott, nem blokkoló munkák

Manager #74 + Player #26 a két október 21-i hivatalos jegyzőkönyv (MRSZ #2686, #2700) eredményének és névsorának staging integrációja — nem deployolva. iOS naptár: Manager #72 + Player #25. Régi és új ID kompatibilitás: Manager #75 + Player #27, funkciókapcsoló OFF. Korábbi 7 kapcsolatlan Manager esemény és 15 RSVP marad a meglévő kulcsokon; nem írhatók át.

**Következő praktikus release-lépés:** egyesíthetőség és belépett Manager/Player mobilos QA, majd az eredmény/jegyzőkönyv staging PR-ek integrációjának lezárása. A 41 régi alias további auditja ne blokkolja a meccsmodult.
