# CC-FOLYTATÁS — staging migrációs paritás blokkoló, 2026-10-26

**Kiadás: BLOCKED a staging adatbázis építhetősége szempontjából. NINCS LIVE DDL/DML, új Supabase projekt, branchelés, adatmásolás vagy alkalmazás-deploy.**

A production `Club Control` Supabase projekt 2026-09-10-én jött létre, de az API migrációtörténete 31 migrációt sorol 2026-10-10 és 2026-10-21 között. Az aktuális Manager **main** 8 darab `supabase/migrations/*.sql` fájlt tartalmaz.

Verzió szerinti paritás:
- 31 remote migráció, 8 Git-migráció;
- 3 közös 14 számjegyű verzióazonosító;
- 28 remote verzióhoz nincs aktuális Git-migráció;
- 5 Git-verzió nem szerepel a remote listában (az SQL-név egyezése sem pótolja a verzióparitást).

Az éles adatbázisban 57 `public/private` tábla és 337 függvény van. Ezeknek a 31 migrációból vagy az 8 Git fájlból való teljes rekonstruálhatósága **NEM bizonyított**. Ebből nem következik sem adatszivárgás, sem adatvesztés, sem az, hogy egy branch biztosan hibás lenne; de **új staging környezetet nem szabad élesérettnek minősíteni automatikus branchépítés után sémaellenőrzés nélkül**.

A Supabase hivatalos leírása szerint a Branching 2.0 migrációkból indul, nem egy teljes LIVE séma-pillanatképből:
https://supabase.com/docs/guides/troubleshooting/new-branch-doesnt-copy-database

## Elkészült kiadási kapu

- `data/qa/supabase-migration-history-20261026.json`: kizárólag Supabase által visszaadott **migrációs metaadatok** az ellenőrzés napján. Nincsenek benne sportolók, jelszavak, tokenek vagy táblaadatok.
- `scripts/qa/staging-migration-parity.cjs --audit`: két halmaz összehasonlítása, mindig csak helyi fájlokat olvas. A jelenlegi állapotot `BLOCKED`-ként jelöli; nem futtat DB-hívást.
- `--require-parity`: eltérésre nem nulla exit code, így a staging-kiadási folyamatba szigorú blokkolóként integrálható.
- GitHub CI ellenőrzi az elutasítást és egy mesterséges teljes körű READY esetet. A **zöld CI azt jelenti, hogy a kapu megfelelően érzékeli a blokkot; NEM azt, hogy staging kész**.

## Feloldás – tervezett, külön jóváhagyással

1. Vezessünk be hiteles, teljes, adatmentes, reprodukálható adatbázis-sémabaseline-t egy verziózott `supabase/migrations/` mappába. A direkt korábbi SQL-eket nem szabad automatikusan a 2026-10-26 utáni sorrendbe, konfliktusellenőrzés nélkül beilleszteni.
2. Supabase CLI `db pull` segítségével készíthető adatmentes schema diff **ellenőrzött helyi környezetben**, de a remote migrációtörténet automatikus `migration repair` művelete nem engedélyezett felülvizsgálat nélkül.
3. Az új üres staging adatbázison rekonstrukció: táblák + oszlopok + típusok + RPC-aláírások + grantok + RLS, majd szintetikus 298 canonical mérkőzés és megfelelő tesztidentitások. Nem másolunk át prod JWT-t, jelszavakat vagy személyes sportolói adatokat.
4. A valós JWT szerepkörpróbák csak akkor futtathatók, ha a hat külön staging fiók elő van készítve, és a [Manager #79](https://github.com/beacvolleyCC/club-control-manager/pull/79) LIVE tiltókapuja érintetlen.
5. A Supabase projekthez vagy branchhez tartozó esetleges árat és szervezetet külön jóvá kell hagyni; csak ezután hozható létre új erőforrás.

**Manager #79, Player #28:** kiadási ágban maradnak. Az eddigi Chromium/WebKit/PG17 tesztek zöldek. A 2026/27 menetrend a korábban véglegesített kiírás, nem nyitjuk újra a 41 legacy BRSZ alias auditját.

## Külön maradt release-feltételek

Valódi JWT + RLS, valós iPhone Safari/PWA, 11× kétszeri regresszió, explicit release engedély, 298/13→298/15 változások kontrollált adatbázis-migrációja, rollback és visszaolvasás.
