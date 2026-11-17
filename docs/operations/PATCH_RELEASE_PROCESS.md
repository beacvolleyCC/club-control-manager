# Club Control – verziózott PATCH-frissítési folyamat

**Kezdeti állapot:** 2026-11-17. A rendszer két **különálló** Supabase projektet használ.

| Környezet | Supabase ref | Adatok | Alkalmazások |
|---|---|---|---|
| LIVE | `snqsxlyhontaepembaic` | Éles sportolók, foglalások, befizetések és meccsek | LIVE Manager + LIVE Player |
| TEST | `szzoubvhlwnojtzqjebc` | Elkülönített tesztadatok | TEST Manager + TEST Player |

A Manager és a Player ugyanabban a **környezetben** közös adatforrást használhat. A TEST és LIVE adatbázis **nem szinkronizált**: nem másolunk automatikusan adatokat egyikből a másikba.

## Mi a PATCH?

Minden változtatás kap egy ellenőrizhető release-azonosítót és leírást a `.club-control/patches/releases/` könyvtárban. Két mód van:

1. **`database.mode: none`** – frontend, JavaScript, CSS, PWA, dokumentáció vagy tesztkód változik, adatbázis-telepítés **nincs**. A LIVE adatokat nem érinti az adatbázis-séma változása; a frontend továbbra is a LIVE Supabase-hoz kapcsolódik.
2. **`database.mode: additive-schema`** – új adatbázisstruktúra vagy RPC-funkció szükséges. A kifejezetten új, kompatibilis migrációs SQL fájlokat a `.club-control/patches/sql/<YYYYMMDDHHMMSS>_<name>.sql` útvonalon verziózzuk. A szándék **csak a szerkezet módosítása**, nem meglévő sorok vagy tesztadatok felülírása. Az SQL-t külön felül kell vizsgálni.

A `database.mode: none` nem jelenti azt, hogy a frontend szabadon meghívhat új, LIVE-ban még nem létező RPC-t. Kompatibilitási próba szükséges.

## Jelenlegi technikai akadály: eltérő migrációtörténetek

2026-11-17-én a Supabase nyilvántartásában **48 LIVE**, **119 TEST** migráció volt; a verzióazonosítók között nem volt átfedés. Ez önmagában **nem bizonyítja**, hogy az aktuális adatbázis-séma teljesen különböző, de azt igen, hogy a két korábbi migrációtörténet nem vonható össze automatikusan.

A repo `supabase/migrations/` mappájában jelenleg csak 8 történeti migrációs fájl található: ez **nem** tekinthető a teljes LIVE vagy TEST történetnek. **Tilos** a korábbi TEST migrációkat egyszerűen `db push`-sal a LIVE-ra futtatni, amíg a sémákat és az előzményeket külön nem egyeztettük.

A frissítésekhez **új, külön azonosítójú, célzott patch-eket** készítünk. Az egységes történeti baseline későbbi, külön audit- és egyeztetési feladat; nem végzünk kézi `migration repair` parancsokat ellenőrizetlenül.

## Kiadási menet

1. **Munkavégzés külön GitHub-ágon**: több összehangolt változtatás is lehet egy patch. A `main` a jelenlegi LIVE alkalmazáshoz kapcsolódik, ezért tesztkódot és TEST Supabase-konfigurációt **nem olvasztunk be** automatikusan a `main` ágba.
2. **Manifest**: release-azonosító, módosított fájlok, érintett alkalmazások, szükséges adatbázis-szint (`none` vagy `additive-schema`), ellenőrzés, visszaállítás, `dataCopy=false`, `allowProductionDataWrite=false`.
3. **Automatikus ellenőrzés**: szintaxis, konfiguráció, jogosultsági tesztek; SQL esetén a biztonsági szűrő tiltja a közvetlen `INSERT/UPDATE/DELETE/DROP/TRUNCATE/COPY` jellegű, nem additív migrációkat.
4. **TEST előellenőrzés**: aktuális Supabase-séma és jogosultságok feltérképezése; csak a kompatibilis új SQL patch-ek futtatása a TEST projektben (ha szükséges); rögzített patch-azonosító és checksum.
5. **TEST frontend telepítés**: önálló Cloudflare/GitHub TEST célra, soha a LIVE hostra; valós szerepkörös E2E, foglalás/pénzügy/jelentkezés tesztek, mentés-visszaolvasás.
6. **LIVE jóváhagyás**: külön, kifejezett felhasználói jóváhagyás, LIVE biztonsági mentés/helyreállítás ellenőrzése, hibaforgatókönyv és a pontos diff áttekintése.
7. **LIVE migráció (csak ha kell)**: a LIVE **jelenlegi** adatbázis-struktúrájával összevetett, új kompatibilis patch, kizárólag a megnevezett projektben. A meglévő klubadatokat és pénzügyi rekordokat nem másoljuk és nem írjuk át. Ezt követi a hozzá illő LIVE frontend-verzió.
8. **LIVE validálás**: smoke test, jogosultság, befizetési és részvételi invariánsok, tényleges adatdarabszámok, hibák és gyors visszaállítás lehetősége.

**Fontos:** a DDL (pl. `ALTER TABLE`, `CREATE OR REPLACE FUNCTION`) sem kockázatmentes: okozhat rövid zárolást, API-viselkedésváltozást vagy eltérő eredményt. Ezért a sémafrissítéshez külön LIVE kompatibilitási vizsgálat és mentési stratégia szükséges. Az automatikus SQL-szűrő **nem bizonyítja** a funkciók belső üzleti logikájának helyességét: emberi biztonsági felülvizsgálat kötelező.

## Release-terv elkészítése (nem telepít)

```bash
node --test tests/patchkit.test.cjs
node scripts/patchkit.cjs validate --release .club-control/patches/releases/20261117_patch_release_foundation.json
node scripts/patchkit.cjs plan --release .club-control/patches/releases/20261117_patch_release_foundation.json --env test
node scripts/patchkit.cjs plan --release .club-control/patches/releases/20261117_patch_release_foundation.json --env live
```

A `scripts/patchkit.cjs` **szándékosan nem rendelkezik deploy vagy adatbázis-módosító paranccsal**. A GitHub CI két, kizárólag olvasható kiadási tervet generál, az adatbázisokhoz és titkokhoz nem kapcsolódik. Ez nem automatikus LIVE-élesítés; csak előkészítés és ellenőrzés.

## Hogyan készül egy új migráció?

- Az új SQL-t verziózva és külön felülvizsgálva tároljuk. Jelenleg a `.club-control/patches/sql/` mappa az új célzott patch-ek tervezett helye; ezt nem azonosítjuk a régi `supabase/migrations/` sorral.
- **TEST**: külön Supabase projektben előellenőrzés, migráció alkalmazása és működési teszt. A Supabase `apply_migration` rögzíti az alkalmazott változtatás történetét.
- **LIVE**: csak jóváhagyás és a LIVE objektumok előellenőrzése után ugyanezen *szándék* LIVE-kompatibilis SQL-jének külön alkalmazása. Az alkalmazás során a migration name/version és az SHA-256 a kiadási jegyzékbe kerül.
- **Data migration / seed / személyes adatok szinkronizálása nem része** ennek az automatikus patchfolyamatnak. Ha ilyen egyszer mégis kell, új, külön jóváhagyott és adatvédelmileg auditált eljárást kell kialakítani.

## Üzemeltetési határok

- A LIVE Manager és Player jelenleg a `snqsxlyhontaepembaic` adatbázishoz csatlakozik.
- A jelenlegi finanszírozási Analytics/ACL tesztfunkciók kizárólag a TEST adatbázisban vannak (külön Draft PR #97). **Nem szabad a TEST konfigurációval együtt LIVE-ra merge-elni**.
- A `main` branchre történő merge/commit LIVE Pages telepítést indíthat; ezért ebben a munkakörben **nem történik main merge és LIVE adatbázis-módosítás**.
- A kiadási tervnek neve és ellenőrzőösszege van; a tényleges alkalmazást minden környezetben külön dokumentáljuk.

## Következő lépések

1. A CI és patch-leíró mechanizmus ellenőrzése után elkülöníteni a TEST és LIVE frontend konfigurációkat buildkörnyezet szerint, nem a `main` kódjának kézi átírásával.
2. LIVE és TEST adatbázisséma read-only snapshot/objektumlista összehasonlítása, a különbségek osztályozása.
3. A pénzügyi Analytics TEST PR #97 migrációit összehangolt új patchbe szervezni, biztonságos tesztelés után külön LIVE alkalmazási tervvel.
