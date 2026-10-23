# CC-FOLYTATÁS — CLUB CONTROL, TELJES ÁTADÁS
**Dátum:** 2026-10-23 (Europe/Budapest)  
**Állapot:** GitHub-fejlesztés és integrációs QA; **NEM élesített**  
**Folytatási jelszó:** `CC-FOLYTATÁS`

## 1. Honnan folytasd

Elsőként olvasd el ezeket, **ebben a sorrendben**:

1. `HANDOVER_CURRENT.md` (ebben a Manager-integrációs ágban; a nagyobb, történeti átadások gyűjtője).
2. **Ez a fájl:** `docs/handover/HANDOVER_20261023_CC_CURRENT.md`.
3. `docs/competition/OFFICIAL_IDENTITY_REVIEW_20261023.md` – 11 vitás meccs és jóváhagyási kapu.
4. `docs/competition/FIVE_LEAGUE_CANONICAL_SCHEDULE_AUDIT_20261023.md` – 300 vs. 298 tételes összevetése.
5. `docs/handover/CC_20261022_CROSS_PR_INTEGRATION_QA.md` és `docs/handover/CC_20261022_LEGACY_SCHEDULE_CONFLICTS.md`.
6. Player: [`docs/HANDOVER_20261023_PLAYER_CURRENT.md`](https://github.com/beacvolleyCC/player_application/blob/integration/20261022-player-calendar-protocol-qa/docs/HANDOVER_20261023_PLAYER_CURRENT.md), valamint `docs/INTEGRATION_CALENDAR_PROTOCOL_QA_20261022.md` a Player-integrációs ágon.

**Manager repo:** `beacvolleyCC/club-control-manager`  
**AKTUÁLIS Manager integrációs ág:** `integration/20261022-manager-calendar-protocol-crosswalk-qa`  
**Player repo:** `beacvolleyCC/player_application`  
**AKTUÁLIS Player integrációs ág:** `integration/20261022-player-calendar-protocol-qa`

Az integrációs ágakat **nem szabad automatikusan `main`-be merge-elni**; azok több draft PR tartalmát fogják össze tesztelési célra. A Manager `main` HEAD az átadáskor: `4d13876a7fefab02ab77ce934c00e77dd6850536`; Player `main` HEAD: `8507ea5574bdce6788d77b553faeb66e02592499`. Frissítsd az ágak aktuális HEAD-jét az új beszélgetés elején.

## 2. Legfontosabb változatlan üzleti szabály

**Azonos nevű csapatokat nem szabad más bajnokságok között összekapcsolni.** A meccsek azonosításához az alábbiakat együttesen ellenőrizd:

`idény + teljes competitionLabel (férfi/női + osztály + A/B csoport) + hazai csapatazonosító + vendég csapatazonosító + forrás/mérkőzésazonosító + igazolt mérkőzésnap`

A csapatnevek normalizálása **csak az adott bajnokságon belüli keresési segédlet**, soha nem jogcím automatikus aliasra. A hazai–vendég irány is része a mérkőzésazonosságnak; a visszavágó másik találkozó. Például **Férfi I/B BEAC–Mozdulj ≠ Női I. BEAC–Mozdulj**; **Női II/A ≠ Női II/B**. 2025/26 és 2026/27 szintén soha nem keverhető.

A Manager `app.js` és Player `app.js` integrációs ága már szigorú teljes bajnokságcímke-szűrést tartalmaz a canonical és fallback rekordokhoz. Negatív tesztek: `tests/manager-canonical-legacy-compat-20261022.test.cjs`, `tests/five-league-canonical-audit-20261023.test.cjs`, illetve Player `tests/player-canonical-partial-stats-20261022.test.cjs`.

## 3. Állapot: LIVE adatbázis ≠ szintetikus tesztadatbázis

A legutóbbi **READ ONLY** Supabase lekérdezés 2026-10-23-án a `snqsxlyhontaepembaic` projektben:

| LIVE tábla/nézet | Sorok |
|---|---:|
| `public.cc_competition_user_schedule_v1`, 2026/27, régi import | 300 |
| `private.cc_canonical_competition_matches_v1`, 2026/27 | **298** |
| Lejátszott canonical meccsek | **13** |
| `public.events` | **279** |
| `public.availability` | **671** |
| Új #2686 / #2700 protokollforrás LIVE | **0** |

A jelentkezések száma változhat más klubtevékenység miatt; 2026-10-22 és 23 között korábban 666, 667 és 668 is volt, most 671. Az általunk készített PR-ok **nem futtattak LIVE DML-t, DDL-t, Edge deployt, push-kiküldést vagy main-merge-et**.

A külön **szintetikus PostgreSQL 17 QA** a két új jegyzőkönyv beillesztése után **298 canonical / 15 played** értéket ellenőriz; ez **NEM** éles eredmény.

## 4. Nyitott PR-ok — egymással összefüggnek, de nincsenek merge-elve

| Rendszer | PR | Lényege | GitHub állapot az átadáskor |
|---|---|---|---|
| Manager | [#72](https://github.com/beacvolleyCC/club-control-manager/pull/72) | privát automatikusan frissülő iOS/ICS naptár, tokenek, Edge HTTP, meeting-at push módosítás | draft, open, egyedileg mergeable |
| Manager | [#73](https://github.com/beacvolleyCC/club-control-manager/pull/73) | 7 hiányzó Manager–canonical meccsalias **read-only** auditja | draft, open, egyedileg mergeable |
| Manager | [#74](https://github.com/beacvolleyCC/club-control-manager/pull/74) | MRSZ #2686/#2700, 38 játékos, eredmény, statisztika, biztonságos import és rollback | draft, open, egyedileg mergeable |
| Player | [#25](https://github.com/beacvolleyCC/player_application/pull/25) | Apple Naptár feliratkozási panel / token UX / PWA | draft, open, egyedileg mergeable, **feature flag OFF** |
| Player | [#26](https://github.com/beacvolleyCC/player_application/pull/26) | két új jegyzőkönyv megjelenítési QA-ja; csak teszt | draft, open, egyedileg mergeable |
| Manager | [#68](https://github.com/beacvolleyCC/club-control-manager/pull/68) | korábbi öt bajnokságos, 300 soros teljes menetrend | open, **MERGE KONFLIKTUS** |
| Player | [#19](https://github.com/beacvolleyCC/player_application/pull/19) | korábbi öt bajnokságos teljes menetrend / UI | draft, open, **MERGE KONFLIKTUS** |

**Ne merge-eld vakon #68/#19-et:** a régi, pontosan 300 rekordot és 8 eredményt váró import elnyomhatná a frissebb, 298 meccses és 13 lejátszott eredményes canonical adatokat. A biztonságosan átvehető javítások külön integrációs ágakra kerültek, és tesztelve vannak.

## 5. Az öt bajnokság menetrendje: 300 régi vs. 298 canonical

| Bajnokság | Régi | Canonical | Hazai/vendég + nap egyezés |
|---|---:|---:|---:|
| Férfi Budapest I/A | 42 | 42 | 41 |
| Férfi Budapest I/B | 42 | 42 | 40 |
| Női Budapest I | 131 | 130 | 129 |
| Női Budapest II/A | 42 | 42 | 37 |
| Női Budapest II/B | 43 | 42 | 42 |
| **Összesen** | **300** | **298** | **289** |

A 300 régi rekordból 281 egyezik nap és pontos óra szerint; 8 lejátszott meccs nap és végeredmény szerint egyezik, de a régi eredményrekordban hiányzik a kezdési óra; **11 külön vizsgálandó**. A 8 régi eredmény egyike sem mond ellent a canonical eredménynek.

A 11 eset kategóriái: 4 más nap; 4 mindkét rendszerben dátum nélkül halasztott; 1 elhalasztottból újra kitűzött; 1 lehetséges külön meccs / ismételt csapatpár; 1 nem igazolt BEAC–BEAC önmérkőzés.

Az eredményektől elmaradt öt **régi `fixture` státusz** a canonical oldalon már hivatalosan lejátszott (#2699, #2331, #2677, #2348, #2337). Ne állítsd vissza a korábbi `scheduled` állapotot.

**Bizonyítéklista:** `data/competition/2026-27/canonical-legacy-five-league-audit-20261023.json`  
**11 soros azonossági review:** `data/competition/2026-27/official-identity-review-20261023.json`  
**Csak olvasó újrafuttatható SQL-ek:** `sql/audit_five_league_canonical_versus_user_20261022.sql` és `sql/audit_official_identity_release_gate_20261023.sql`.

Az utóbbi 11 soros SQL a LIVE adatbázisban kétszer **11/11 aktuális metaadategyezést** adott, nulla eltéréssel. **Ez nem 11 jóváhagyott alias!** Mind a 11 rekordban `allowAutomaticCanonicalWrite=false` és manuális engedélyezés szükséges. 10 canonical jelölt; BEAC–BEAC-hoz nincs.

## 6. Legfrissebb munka: négy vitás csapatpár hazai/vendég ága

**Csak olvasó SQL, már létrejött:** `sql/audit_official_home_away_legs_20261023.sql`. A lekérdezés kizárólag idény + teljes bajnokságcímke + két ellenőrzött `source_team_id` szerint keresi az *azonos* és *fordított* pályaválasztású mérkőzéseket.

| Bajnokság | Eredeti hazai párosítás canonical | Fordított pályaválasztás canonical | Nyitott kérdés |
|---|---|---|---|
| Férfi I/A | Dág KSE–KÖZGÁZ, **2026-10-15 20:15**, `20261001:fixture:93` | KÖZGÁZ–Dág KSE, **2027-01-14 19:30** | A régi 2026-11-19-es időpont hivatalos eltérését kell tisztázni |
| Férfi I/B | Mozdulj–MAFC-Schönherz, **2027-03-03 20:00**, `brsz:2026/27:menB:userofficial:38` | MAFC-Schönherz–Mozdulj, **2026-12-02 20:30** | A régi `postponed` és új kiírás hivatalos kapcsolata nincs még igazolva |
| Női II/A | KEAC–KRE-B, **2026-11-28 11:30**, `brsz:2026/27:bb2a:official:16` | KRE-B–KEAC, **2027-01-13 18:00** | A régi 2026-10-28-as dátum forrásigazolása kell |
| Női II/B | MTK kék–RKSK, **2026-10-13 18:20**, MRSZ **#2337, 3:0** | RKSK–MTK kék, **2027-01-11 20:00**, `brsz:2026/27:bb2b:userofficial:22` | A régi **2026-11-24-i MTK kék–RKSK** egy harmadik, **nem bizonyított** kiírás; egyik ismert meccshez se csatold automatikusan |

A négy párosítás legutóbbi ellenőrzése nyolc canonical találkozót talált: mindegyik párból egy saját hazai és egy fordított hazai. Az azonos klubbeli, de más nemű/osztályú csapatok **nincsenek** ebbe a lekérdezésbe keverve.

Az előző munkafázis **itt szakadt meg a handover-kérés miatt**. A home/away SQL a GitHubon megvan; **ehhez a legutóbbi változathoz még nincs külön új teszt/snapshot átadva**, ezért ezt jelöld következő feladatnak, ne állítsd kész QA-nak. A korábbi 11 soros review és a közös QA viszont sikeres.

## 7. Hivatalos MRSZ-jegyzőkönyvek: staged, nem LIVE

Két új PDF a korábbi felhasználói feltöltésből:

- **MRSZ #2686:** Női I. MTK Budapest–Panoráma SE **3:1**, 2026-10-21 21:00, szettek 25:20, 25:9, 20:25, 25:15.
- **MRSZ #2700:** Férfi I/B Mozdulj SE–MAFC-Vásárhelyi **3:2**, 2026-10-21 20:00, szettek 25:18, 25:23, 21:25, 18:25, 15:11.

Mindkettő teljes PDF-ből kinyert **38 játékos** igazolási számaival, K/CS státusszal, kapitány-, liberó-, edző- és hivatalos személyjelöléssel, az eredeti fájl SHA-256 lenyomatával szerepel a Manager #74-ben.

**Staging source:** `data/competition/2026-27/official-protocols-20261021.json`  
**Védett migráció:** `sql/official_protocols_20261021_identity_safe_migration.sql`  
**Kézi rollback:** `sql/official_protocols_20261021_manual_rollback.sql`  
**QA:** `tests/official-protocols-20261021/verify.sql`, `tests/official-protocols-20261021-migration-coherence.test.cjs`.

Kritikus: a meglévő fixture `match_id` **nem változhat**; a hivatalos `matchCode` külön `officialProtocolMatchCode` mezőként jelenik meg az eredeti `sourceFixtureSnapshot` megtartása mellett. Közös canonical payloadon belül kerül át a 38 játékos és a két eredmény. Ne szúrj be új, második canonical meccset a két fixture helyett. Egyelőre nincs hivatalosan ellenőrzött külső PDF URL; ne találj ki ilyet.

## 8. Privát iOS Naptár: teljesen előkészített, nem élesített

- Manager #72: privát hash-elt, rotálható/visszavonható token, `mine` / `team` scope, hitelesített tagságvizsgálat, külön csak-olvasó `cc-calendar` Edge Function, RFC5545 ICS, eseményfrissülés, meeting-at push-javítás; automatikus feliratkozáshoz Apple `webcal`.
- Player #25: Beállítások → Naptárfeliratkozás, Apple-link/HTTPS-másolás, rotáció/revoke, token memóriában, változatlan régi egyszeri naptárexport; `CALENDAR_SUBSCRIPTION_ENABLED: false`.
- Közös szintetikus PostgreSQL és Node/Deno tesztek zöldek. **Valódi Apple Naptár + Safari/PWA + RLS/auth E2E, szolgáltatói cache és push-kézbesítés még nincs lepróbálva.**
- A jelenlegi sports feed a `public.events` és `public.availability` eseményeiből épül; a canonical 298-as versenymenetrend **nem automatikusan** új játékos-esemény. Ne hozz létre jelentkezést vagy küldj push-t egy jegyzőkönyv-import miatt.

## 9. Közös integrációs ágak: mi készült el

**Manager integráció:** a #72, #73 és #74 anyaga egy tesztfában; időközben teljes `competitionLabel`-szűrés a fallback és canonical összevezetés minden ágában; pontos source-system + source-key + season szerinti szerkesztési lookup; Playerrel összehangolt PWA cache. CI több független szintetikus adatbázison ellenőrzi az együttes naptár, protocol, statisztika, rollback és push-logikát.

**Player integráció:** #25 naptár + #26 jegyzőkönyvteszt; a teljes eredménysorrend, cache, tabella és játékosstatisztika közös ellenőrzése; javított szettösszesítés (`setsFor/setsAgainst`), `__ccResultConflict` eredmény kizárása a részleges tabella/form mutatókból; league- és csoporthatáron átnyúló rekordok kizárása.

**Utolsó, a jelen handover előtti sikeres GitHub CI:**
- Manager [Five-league canonical crosswalk audit QA, #39944166995](https://github.com/beacvolleyCC/club-control-manager/actions/runs/39944166995) – sikeres.
- Manager [combined calendar / protocol / crosswalk, #39944167117](https://github.com/beacvolleyCC/club-control-manager/actions/runs/39944167117) – sikeres.
- Player [Combined calendar + protocol QA, #39944249263](https://github.com/beacvolleyCC/player_application/actions/runs/39944249263) – sikeres.

Ezek a runok a **handover-commit előtti** kódállományt ellenőrizték. A handover miatt új CI-futás elindulhat; később a legfrissebb commit státuszát ellenőrizni kell. A két ág továbbra is **nem LIVE**, nincs hitelesített felhasználóval végrehajtott end-to-end teszt.

## 10. Következő teendők — rangsor

1. **A most megkezdett négy páros home/away audit lezárása**: a `sql/audit_official_home_away_legs_20261023.sql` alapján készíts rövid, reprodukálható 8 soros read-only pillanatképet és negatív teszteket (idény/versenycsoport/hazai-vendég irány, dupla dátumtilalom). Ne módosíts LIVE rekordot.
2. A **Dág–KÖZGÁZ**, **KEAC–KRE-B**, **Mozdulj–MAFC-Schönherz** és **MTK kék–RKSK november 24.** pontos 2026/27-es hivatalos meccsazonosságát ellenőrizd. Az októberi #2337-et és januári visszavágót külön tartsd; a régi novemberi sor továbbra is audit-only.
3. A fennmaradó négy dátum nélküli női II/A halasztást és a BEAC–BEAC szintén meg nem erősített rekordot **ne dátumozd át és ne kreálj belőle meccset**.
4. Bajnokságonként, csoportonként készíts ellenőrzött, **csak javasolt** canonical ↔ legacy crosswalkot; alias bevezetés csak valódi mérkőzésazonosság és jóváhagyás után.
5. Ezután egyeztesd az elavult Manager #68 / Player #19 részleteit hunkonként az új integrációs ágakkal; a teljes régi `app.js` / `sw.js` nem cherry-pickelhető automatikusan.
6. Ha adatbázis-/release-fázis következik, előbb backup/staging, sémaeltérés- és auth/RLS-teszt, majd a teljes **11 pontos QA kétszer**, iOS naptár, Manager és Player mobil E2E, push-értesítések; csak ezután main-merge / telepítés, külön kiadási jóváhagyással.

**Soha ne sérüljön:** `public.events`, `public.availability`, tagságok, bérletek, sportorvosi státusz, jegyzőkönyvek és korábbi protokollok, csapatjogosultságok, valamint a különböző osztályban szereplő azonos nevű csapatok szétválasztása.

## 11. 11 pontos QA státusz

| Pont | Téma | Mostani ellenőrzés | Élesítés előtti hátralék |
|---|---|---|---|
| 1 | Adatmegőrzés | read-only LIVE + szintetikus RSVP baseline | éles backup/diff |
| 2 | Auth és RLS | SQL/HTTP/Node teszt | valós JWT és jogosulatlan token |
| 3 | Csapat- és csoportjogosultság | cross-division negatív tesztek | valós felhasználói E2E |
| 4 | Privát ICS token | forgatás/visszavonás SQL teszt | gateway/proxy, iPhone |
| 5 | ICS időpont és frissítés | RFC5545/DST Node QA | Apple Naptár tényleges frissítése |
| 6 | Meccsazonosság | 298 canonical + 11 audit + home/away | 2026/27 hivatalos bizonyítékok |
| 7 | Jegyzőkönyvek | 38 játékos / két PDF staging QA | valós UI és adatimport |
| 8 | Statisztika/tabella | részleges W/L és pontok ellenőrizve | éles korrekt eredményszámítás |
| 9 | Push / meeting-at | szintetikus callback/regresszió | valós push opt-in és kézbesítés |
| 10 | Player/Manager PWA | közös CI zöld | Safari/iOS mobil és cache |
| 11 | Kétszeri független QA | staging SQL+CI duplázva; fontos fájlok kétszer olvasva | élesítéskor kétszeri teljes 11 pontos kontroll |

## 12. Javasolt új beszélgetés-indító

> **CC-FOLYTATÁS**. Olvasd el a `beacvolleyCC/club-control-manager` GitHub repo `integration/20261022-manager-calendar-protocol-crosswalk-qa` ágán a `HANDOVER_CURRENT.md` és `docs/handover/HANDOVER_20261023_CC_CURRENT.md` fájlokat, valamint a Player `integration/20261022-player-calendar-protocol-qa` ágát. Folytasd a négy vitás páros home/away auditjának pillanatképével és negatív tesztjeivel. Tartsd külön a nemeket, osztályokat, A/B csoportokat és idényeket. Minden módosítást kétszer ellenőrizz, a teljes 11 pontos QA elvárást őrizd; ne merge-elj mainbe és ne írj LIVE Supabase adatokat. A két MRSZ új jegyzőkönyv staged, nem LIVE.

---

**Átadási határ:** az utolsó megkezdett művelet a home/away 8 canonical találkozót ellenőrző, **read-only** SQL elkészítése volt. A felhasználó ekkor kérte a handovert; ennél a pontnál kell folytatni, nem új adatbázis-migrációval.
