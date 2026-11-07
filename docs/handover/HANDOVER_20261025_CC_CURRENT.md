# CC-FOLYTATÁS — Club Control aktuális átadás

**Ellenőrzés:** 2026. október 25., Budapest. **Helyzet:** a versenysportmodul kiadásra előkészített fejlesztései több **nyitott draft PR-ben** vannak. **Egyik sincs mainbe merge-elve, éles deploy vagy Supabase DDL/DML nem történt ebben a munkafolyamatban.**

> **Következő beszélgetés kezdete:** `CC-FOLYTATÁS`. Elsőként ezt az átadást olvasd, ellenőrizd a hivatkozott PR-ek legújabb HEAD SHA-ját és a szükséges CI-ket. A felhasználó a korábban belinkelt **2026/27-es menetrendet véglegesnek tekinti**. Ne térj vissza a 41 régi BRSZ-alias vég nélküli vizsgálatához, ha az nem okoz konkrét működési hibát.

## 1. Főágak — ténylegesen élesre kerülhetett kód vs. csak draft

| Repository | `main` commit a GitHubon (2026-10-25) |
|---|---|
| Manager `beacvolleyCC/club-control-manager` | `4d13876a7fefab02ab77ce934c00e77dd6850536` |
| Player `beacvolleyCC/player_application` | `8507ea5574bdce6788d77b553faeb66e02592499` |

A főágak **nem** tartalmazzák automatikusan az alábbi draft fejlesztéseket. A GitHub CI zöld állapota sem jelenti azt, hogy a felhasználó már látja a módosításokat a LIVE Managerben/Playerben.

### Aktuális, prioritást élvező PR-ek

| Feladat | PR | HEAD 2026-10-25 | Állapot |
|---|---|---|---|
| **Hivatalos 2026.10.21-i eredmények és 38 játékosjegyzőkönyvi bejegyzés** | [Manager #74](https://github.com/beacvolleyCC/club-control-manager/pull/74) | `b91a5bce1d33a21126a70f8f5e552a74ac112625` | open, **draft**, unmerged |
| **BEAC-meccsek / összes mérkőzés kapcsoló és végleges canonical menetrend** | [Manager #76](https://github.com/beacvolleyCC/club-control-manager/pull/76) | `b97ed731be1eb51f40f06eb06cb2bc2eeea9417c` | open, **draft**, unmerged |
| **Player helyes szettstatisztika, meccskártyák, in-app jegyzőkönyvek és PWA** | [Player #28](https://github.com/beacvolleyCC/player_application/pull/28) | `55eb674f22104cdbc84768c71a4040396ac44cd5` | open, **draft**, unmerged |
| **Supabase 2026.10.30. explicit public grants/RLS CI** | [Manager #77](https://github.com/beacvolleyCC/club-control-manager/pull/77) | `1f323c8f9551377f94d5a9d517111ec6da67c1ef` | open, **draft**, unmerged |

### Elkülönített — ne keverd a fenti kiadási feladatokhoz

- [Manager #72](https://github.com/beacvolleyCC/club-control-manager/pull/72) és [Player #25](https://github.com/beacvolleyCC/player_application/pull/25): privát, feliratkozható és frissíthető iOS ICS naptár, feature flag OFF / külön teszt és release.
- [Manager #73](https://github.com/beacvolleyCC/club-control-manager/pull/73): read-only canonical–Manager source audit, 7 egymáshoz nem rendelt Manager-meccsesemény és 15 régebben kapcsolódó jelentkezés; nincs automatikus aliasírás.
- [Manager #75](https://github.com/beacvolleyCC/club-control-manager/pull/75) + [Player #27](https://github.com/beacvolleyCC/player_application/pull/27): kézi, hitelesített régi–új match ID bridge, opcionális v3 RPC; kliensfunkció **OFF**. Nem a menetrend megjelenítésének feltétele.
- [Player #26](https://github.com/beacvolleyCC/player_application/pull/26): két hivatalos PDF korábbi Player QA-ja; jelenleg a Player #28 jóval több tesztet lefed. A két PR-t ne olvaszd össze vakon.
- Régi Manager #68 és Player #19/#17 ágak eltérhetnek a frissebb főágaktól. Csak külön diff/conflict és regression QA után használhatók.

## 2. A felhasználó végleges menetrendje — NEM bizonytalan

**Végleges kiírás:** a korábban belinkelt 2026/27-es szövetségi/user-supplied meccslista; a `private.cc_canonical_competition_matches_v1` és a meglévő `v2` snapshot `canonicalMatches` mezője a kijelzési alap. A régi BRSZ-azonosítók automatikus egyeztetése **nem blokkolhatja** a meccsek, tabellák, eredmények és statisztikák felületi lezárását.

A csapatokat **bajnoki osztály + csoport + idény + irányított szövetségi csapatazonosítók** szerint kezeld, nem csupán név/idő alapján:

- **Női Budapest I.**: BEAC source team `299`, MTK Budapest `1092`.
- **Női Budapest II/B**: BEAC II. source team `959`, MTK Budapest kék `1165`.
- **Férfi Budapest I/B**: BEAC source team `709`.
- A férfi I/A és a női II/A **másik csoport**; megjelenhetnek külön bajnoki kontextusban, de nem szabad a BEAC-féle csoportokkal összekeverni.
- A végleges kiírás érvényes, de **lejátszott eredményt, setScore-t és játékosrészvételt kizárólag hivatalos jegyzőkönyvvel** lehet hozzáadni. Részleges adatokból tilos hamis tabellapontot és helyezést képezni; dátum nélküli halasztás marad dátum nélkül.

## 3. A két hivatalos október 21-i jegyzőkönyv (#74)

| Hivatalos MRSZ-kód | Liga, eredeti kezdés | Eredmény | Játszmák | Eredeti canonical UUID |
|---|---|---|---|---|
| **#2686** | Női Budapest I., 2026.10.21. **21:00** | **MTK Budapest – Panoráma SE 3–1** | `25:20, 25:9, 20:25, 25:15` | `04eaceee-57e2-7563-a618-beb933c0ffc0` |
| **#2700** | Férfi Budapest I/B, 2026.10.21. **20:00** | **Mozdulj SE – MAFC-Vásárhelyi 3–2** | `25:18, 25:23, 21:25, 18:25, 15:11` | `25a14406-2887-62fc-086c-ad770d160a6b` |

- Kanonikus forráskulcs #2686: `20261001:fixture:39`; #2700: `brsz:2026/27:menB:userofficial:01`.
- 19+19 = **38 hivatalos jegyzőkönyvi játékosbejegyzés**, kapitány/liberó/csere/hiányzó részvétel/edző/hivatalos személy szerepkörökkel.
- A #74-es stage-migráció `sql/official_protocols_20261021_identity_safe_migration.sql` kizárólag a két *meglévő* mérkőzéshez ad eredményt; **nem hoz létre új match UUID-t**, nem nyúl `public.events` vagy `availability` adathoz. Van ellenőrzött rollback.
- A #2686 hivatalos `MTK Budapest` név kijelzési rétegben elsőbbséget élvez a régi rövid `MTK` névvel szemben, a nyers fixture megváltoztatása nélkül.
- Két elkülönített PG17 tesztadatbázis: 298 összes fixture / 13 played kezdetben → **298 / 15** az overlay után → rollback 298 / 13 → ismételt apply 298 / 15.

## 4. Megvalósult Manager/Player működés a draftokban

**Manager #76:** `BEAC meccsek` az alap-szűrő, `Összes bajnoki meccs` kapcsoló működik és újrarajzoláskor megőrzi az állapotát. A négy releváns csoport külön listában szerepel. PWA cache egységes. A végleges `canonicalMatches` elsőbbséget élvez a régi BRSZ-importtal szemben.

**Player #28:** a részleges statisztikából korábban kiesett `setsFor / setsAgainst` számlálók most 3–0/3–1 esetén helyesen változnak; hivatalos bajnoki pont/helyezés részleges forrásból továbbra sem készül. `Halasztva · Időpont nélkül`, ha nincs hivatalos új dátum. A hivatalos két PDF szettjei, 38 szereplője, belső jegyzőkönyvablaka és mobilos kattintás/Enter/Space/bezárás eseményei is teszteltek. Nem generálunk nem igazolt külső profil/jegyzőkönyv URL-t.

**Közös adatfolyam-teszt:** a #74 CI a valódi disposable PostgreSQL `private.cc_competition_canonical_payload_v1()` JSON outputját **a #76 Manager és a #28 Player tényleges kódján is keresztülfuttatja**, pontos Git commit SHA-kra kötött checkoutokkal, nem csak kimásolt fikciós JSON-nal. Az adatbázist két független PG17 környezetben teszteli.

**Biztonsági teszt:** `anon` nem hívhatja a Manager/Player meccs RPC-ket; `authenticated` csak `v1` jogosultsági őrrel fér a `v2` canonical payloadhoz. Szintetikus PG17 `SET ROLE` + hét JWT-állapot (Manager-jogosult, Player-jogosult, lejárt/inaktív/anon/jogosulatlan/inaktív csapat), mindkét kliens RPC ellenőrzésével. **Nem azonos a valós, bejelentkezett Supabase sessionnel.**

## 5. Utoljára megerősített ellenőrzések

| Forrás | Commit | Eredmény / link |
|---|---|---|
| Manager #74 | `b91a5bce1d33a21126a70f8f5e552a74ac112625` | **3/3 zöld:** [PG17 + Manager/Player adatfolyam](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40239437907), [hivatalos protokoll stage QA](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40239437911), [Scoring QA](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40239437937) |
| Manager #76 | `b97ed731be1eb51f40f06eb06cb2bc2eeea9417c` | **7/7 zöld**, köztük [canonical meccs UI QA](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40207561174) |
| Player #28 | `55eb674f22104cdbc84768c71a4040396ac44cd5` | **4/4 zöld**, köztük [meccs/statisztika és jegyzőkönyv QA](https://github.com/beacvolleyCC/player_application/actions/runs/40207549418) |
| Manager #77 | `1f323c8f9551377f94d5a9d517111ec6da67c1ef` | **2/2 zöld**, köztük [Supabase grants/RLS QA](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40202490589) |

A fenti CI-k konkrét, már **lefutott** commitokra vonatkoznak. Következő körben a PR HEAD és az összes required check státuszát **újra kérd le**. Nem jelent valódi iOS/élő bejelentkezési tesztet, csak izolált automatizált QA-t.

**Utolsó élő Supabase SELECT-baseline (2026.10.25. korábbi ellenőrzés):** `public.events=279`; `public.availability=676`; canonical fixtures **298**; played **13**; #2686/#2700 `officialProtocolEvidence` overlay **0**; 7 régi Manager eseményhez nem volt canonical alias és azokhoz 15 RSVP kapcsolódott. A LIVE mennyiségek idővel változhatnak; új release előtt ismételt SELECT szükséges.

## 6. Supabase 2026. október 30-i Data API hozzáférés-változás

Új `public` tábláknak az október 30-i átállás után nem jár automatikus API `GRANT`; az érintett migrációban **explicit, legkisebb jogosultságú grant/revoke + RLS** szükséges. Meglévő táblák grants-jogai ettől nem szűnnek meg.

- **Manager #77**: `scripts/check-public-table-permissions.cjs`, PG17 role/RLS teszt, `sql/cc_public_data_api_grants_readonly_audit.sql`, CI.
- Korábbi LIVE SELECT audit: **52/52 `public` tábla RLS aktív**, **0 anon `SELECT`**, **7 authenticated `SELECT`**, **2 authenticated írást engedélyező** (`availability`, `player_settings`).
- Ne futtasd minden táblára a hírlevél teljes `GRANT` példáját: privát személyes/versenysport-adatok jogosulatlanul hozzáférhetővé válnának. `SECURITY DEFINER` függvények `EXECUTE` joga külön felülvizsgálandó.
- #74 eredmény-overlay **nem hoz létre új `public` táblát**, ezért ezt a konkrét migrációt önmagában nem blokkolja az új szabály.

## 7. Hátralévő — **ez a valódi következő munka**, nem a 41 alias

1. **Valós bejelentkezett RPC jogosultsági QA**: Manager jogosult/nem jogosult, Player aktív/inaktív/lejárt tagság, cross-team/külön bajnoki csoport, és anon elutasítás. A tesztfiókokkal a LIVE írást kerülni kell; csak tényleges kiadási jóváhagyással végezz hozzáférés-próbát.
2. **Valós iPhone/iOS Safari vagy PWA UI QA**: Manager/Player 2026/27 meccslista, négy csoport, BEAC vs összes, #2686/#2700 in-app jegyzőkönyv, roster scroll, touch/Enter/Space, modal close/back, cache refresh és jogosultsági visszautasítás. CI nem helyettesíti.
3. **PR-integrációs/merge-readiness audit**: Manager #74 + #76 fájlkonfliktusok, Player #28 `v2` szerződés, #77 migrációs CI kockázatok. A pinned cross-repo SHA-kat szükség esetén frissítsd a végleges HEAD-re, újbóli **két független tesztkörrel**.
4. **Éles migráció és beolvasztás csak kifejezett release döntéssel**: előzetes LIVE SELECT baseline, 11 pontos kétszeri QA, rollback-útvonal és post-check; bármilyen #74 SQL-apply megváltoztatná a jelenleg 13 played számot 15-re.
5. Később: iOS ICS #72/#25, opt-in v3 bridge #75/#27, hét kapcsolatlan régi Manager-event kezelése, hivatalos 2025/26 archív és további elemző/stat modul feladatok külön iterációkban.

**Korlát:** a jelenlegi eszközkészlet nem adott valós, bejelentkezett iOS/Manager/Player böngészőszessziót, ezért ilyen ellenőrzést **nem állítunk megtörténtnek**. A koncepció/tájékoztató QA és a PG17 mock-role teszt nem egyenértékű a tényleges auth/RLS teszttel.

## 8. Folytatáshoz használható források

- [Manager #74 kombinált kiadási lista és 11 pontos gate](https://github.com/beacvolleyCC/club-control-manager/blob/feat/20261022-official-protocols-2686-2700/docs/handover/HANDOVER_20261025_COMBINED_MATCHES_RELEASE_QA.md).
- [Manager #74 legutóbbi end-to-end auth + valódi PG JSON átadás](https://github.com/beacvolleyCC/club-control-manager/blob/feat/20261022-official-protocols-2686-2700/docs/handover/HANDOVER_20261025_CROSS_APP_AUTH_AND_REAL_PG_PAYLOAD.md).
- [Manager #76 meccs/menetrend UX átadás](https://github.com/beacvolleyCC/club-control-manager/blob/qa/20261025-authoritative-match-display/docs/handover/HANDOVER_20261025_MATCHES_RELEASE_FOCUS.md).
- [Player #28 jegyzőkönyv és statisztika átadás](https://github.com/beacvolleyCC/player_application/blob/feat/20261025-results-stats-release-check/docs/HANDOVER_20261025_FINAL_FIXTURES_RESULTS.md).
- [Supabase #77 adat-hozzáférési migráció QA](https://github.com/beacvolleyCC/club-control-manager/blob/qa/20261025-supabase-explicit-grant-guard/docs/handover/HANDOVER_20261025_SUPABASE_EXPLICIT_GRANTS.md).
- Korábbi [2026.10.22. főágas handover](../../HANDOVER_CURRENT.md): **történeti, nem aktuális státuszforrás** a 2026.10.25-i draftokhoz.

## 9. Egyértelmű új-chat utasítás

**`CC-FOLYTATÁS`** — „Olvasd el a Manager `docs/handover/HANDOVER_20261025_CC_CURRENT.md` átadását és a kapcsolódó Manager #74/#76, Player #28, Manager #77 draft PR-eket. A korábban belinkelt menetrend végleges. Ne vizsgáld újra a 41 legacy BRSZ alias-jelöltet általánosságban. Haladj a kiadási előkészítéssel és a valós felhasználói jogosultsági/mobilos ellenőrzés előkészítésével. Semmi LIVE írás, merge vagy deploy jóváhagyás nélkül. Minden kódmódosítást kétszer ellenőrizz, az érintett CI-ket valós HEAD commiton kérd le.” 
