# Club Control – PATCH kiadási alapok: átadás

**Dátum:** 2026-11-17
**Környezet:** GitHub fejlesztési ág / read-only audit; **LIVE alkalmazás/adatbázis nem módosult**
**Repository:** `beacvolleyCC/club-control-manager`
**Ág:** `chore/controlled-patch-releases-20261117`

## Cél
Egységes, TEST-first, LIVE-on csak jóváhagyással alkalmazható patchfolyamat úgy, hogy a sportolók, pénzügyek, meccsek, foglalások és más meglévő rekordok ne kerüljenek véletlenül felülírásra.

## Ellenőrzött kiinduló állapot
- LIVE Supabase: `snqsxlyhontaepembaic`
- TEST Supabase: `szzoubvhlwnojtzqjebc`
- Supabase migration history: LIVE **48**, TEST **119** (2026-11-17, nulla közös verzióazonosító); GitHub main `supabase/migrations` csak 8 történeti SQL.
- A főági Manager és Player a LIVE DB-t használja; a két környezetnek külön felhasználói és pénzügyi adatai vannak.
- A pénzügyi Analytics külön TEST megoldása: Draft PR #97, saját TEST Supabase-funkciókkal; ez nem kerülhet ellenőrizetlenül a LIVE-ba.

## Elkészült
- `scripts/patchkit.cjs`: leírófájl ellenőrzés, kizárólag additív schema SQL formális szűrése, következetes SHA-256, `validate` és `plan` parancs; **nincs** DB kapcsolat/telepítés.
- `tests/patchkit.test.cjs`: negatív SQL és environment guard tesztek.
- `.club-control/patches/releases/20261117_patch_release_foundation.json`: első kód-only, **zero DB migration** release leíró.
- `.github/workflows/patch-release-plan.yml`: GitHub Actions QA + TEST/LIVE olvasható tervek; nincs titok, nincs auto deploy.
- `docs/operations/PATCH_RELEASE_PROCESS.md`: részletes folyamat, migrációtörténet-eltérés, mentés/rollback, tiltások.

## Korlátok, nyitott feladatok
1. A két eltérő Supabase migrációtörténetet nem egységesítettük automatikusan; LIVE db push és migration repair tilos kézi audit nélkül.
2. A napi fejlesztéshez buildkörnyezet szerinti külön TEST/LIVE konfiguráció és tényleges TEST deploy még külön munkakör.
3. A `patchkit` SQL szűrő statikus, nem garantálja egy `CREATE FUNCTION` futásidejű helyességét. SECURITY DEFINER, RLS, séma, grant és visszaállítás felülvizsgálata külön kell.
4. Nincs automatikus élesítés vagy automatikus patch-alkalmazás; ez szándékosan külön jóváhagyáshoz kötött.
5. TEST PR #97 analitika/migrációk későbbi, külön kontrollált release-be sorolandók.

## Folytatás
- GitHub CI ellenőrzések és draft PR lezárása a patch-alapra.
- Sémaeltérések részletes, read-only összehasonlítása.
- Első éles funkcionális patch csak TEST validálás, backup és LIVE engedély után.

**Rollback (ennek a kiadásnak):** a munkavégzés külön, merge-öletlen ágon történik; adatbázis-állapotváltozás nincs. Ha később települ, kód-only rollback = git revert.
