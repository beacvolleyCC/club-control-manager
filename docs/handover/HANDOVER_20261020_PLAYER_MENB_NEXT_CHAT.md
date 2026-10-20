# Club Control — átadás új chathez (2026-10-20)

**Folytatási kulcsszó:** `CC-FOLYTATÁS`  
**Legutóbbi user-kérés:** „Playerben most elbaszódott a B csoport a férfiaknál, megnézed mi a baj?”; majd: „handovert készítsd el légyszi új chat kell”.  
**Első prioritás a következő chatben:** a férfi B csoport tényleges **Player PWA LIVE/telefonos megjelenésének** ellenőrzése, majd a teljes menetrend két külön PR-jának integrálása regresszió nélkül.

## 1. A legfrissebb állapot (megerősített GitHub + DB)

- **Player**: `beacvolleyCC/player_application`, `main`. A férfi B csoport célzott javítása **PR [#18](https://github.com/beacvolleyCC/player_application/pull/18)** révén **már merged** (main commit `66af726a3a790ee2bed9f184f2f27325aeab02e6`), asset-cache `20261020-men-b-seven-team-v23`. A **PR #18-as ellenőrzések 3/3 sikeresek**, külön 8 regressziós esettel; a GitHub main forrását és HTML verzióját újra ellenőriztük. **A Cloudflare Pages sikeres deployját és a bejelentkezett telefonon látható új UI-t még nem tudjuk bizonyítani**.
- **Manager**: `beacvolleyCC/club-control-manager`, `main`. A teljes import kétoldali megjelenítője **még nem került mainbe**. A Manager előző igazolt main gyorsjavítása PR #67. A Manager `main` HTML-ben az app PWA cache `20261019-protocol-match-v62`.
- **Supabase LIVE projekt**: `snqsxlyhontaepembaic`, `public.cc_competition_user_schedule_v1`: **300** egyedi, 2026/27-es adat (292 fixture + 8 result). Férfi B: **42 rekord**: 40 scheduled fixture, 1 postponed fixture, 1 played result; **7 csapat**, köztük **Mozdulj SE**, **12 BEAC-érintettségű** meccs. A régi `competition_source_matches`: **11** BEAC-érintettségű férfi B rekord.
- Régi `competition_source_standings` férfi B tábla: **6 csapat, valamennyinél 0 lejátszott meccs**, hiányzik **Mozdulj SE**. Ez a fő hibaforrás: régi hiányos állástábla és hiányos meccsforrás keveredett a Player UI-ban. A hitelesített aktuális teljes tabella **nem** áll rendelkezésre; részleges eredményből **nem** szabad hivatalos 1–7. helyezést gyártani.
- Nem volt új Supabase DML/DDL, **events/availability/jelenlét/meeting/terem** adatot nem módosítottunk a hibakeresés és célzott UI-javítás során.

## 2. Mi lett javítva a férfi B csoportban?

A Player `main`-en a férfi B saját szigorú read-only forrásválasztást kapott:
- csak az import 42 egyedi `ui20261018:` kulcsával, pontos ligával/csapatokkal elfogadott adatot használhat;
- a hetedik **Mozdulj SE** és a 12 BEAC-meccs megjelenik;
- a régi, le nem játszott **2026-10-12 BEAC–PDSE** sor nem duplikálhatja a **2026-10-19 19:30** aktuális mérkőzést;
- 1 befejezett meccs és 1 halasztott megkülönböztetése;
- hiányos tabella esetén hét csapatsor megmarad, de a **helyezés és nem igazolt bajnoki pont „–”**, nem kitalált állás;
- hitelesített jegyzőkönyvek nem veszhetnek el, ellentmondó eredmény külön ellenőrzendő;
- az adatkapu hibája esetén védett régi nézet (ne okozzon üres B panelt).

**Fontos:** a user a javítás utáni LIVE képet még nem igazolta vissza. Ha valaki új chatben „kész, LIVE” állítást tenne pusztán a GitHub main commit alapján, az téves lehet.

## 3. Nyitott és veszélyes PR-ok — NE MERGE-ELD automatikusan

1. Player [PR #17](https://github.com/beacvolleyCC/player_application/pull/17), branch `feat/20261019-full202627-readonly-schedule`: a teljes **300 rekordot / 5 ligát** bekötő korábbi fejlesztés. A jelenlegi `main`-től **diverged: 11 ahead, 1 behind** (2026-10-20 ellenőrzés). A PR #18-as **férfi B hétcsapatos külön logika** a mainben már újabb! **Ne merge-eld a #17-et változtatás nélkül**, mert felülírhatja a mostani javítást. Új branch mainről, men B fix megőrzése, öt csoport és a teljes fixture/protokoll/statisztika QA után PR.
2. Manager [PR #68](https://github.com/beacvolleyCC/club-control-manager/pull/68), branch `feat/20261019-full202627-readonly-schedule`: a teljes kiírás Manager-es megjelenítése, **diverged: 9 ahead, 2 behind**. A Manager manual override és találkozóadat-save külön fejlesztési ágak; előbb forrásazonosító- és mentési regressziós ellenőrzés, különösen a jegyzőkönyv és a szereplések megőrzése.
3. Régi `feat/fixture-meeting-notes-20261018`: **NEM biztonságos vakon összeolvasztani**. Az `cc_manager_competition_match_full_save_v1` RPC nincs hitelesítetten LIVE telepítve; a régi kód név+pár és ±60 nap egyezéssel kapcsolhat téves visszavágókat. A kézi szerkesztő (kezdés, helyszín, találkozó ideje/helye, opcionális Player-megjegyzés) atomikus RPC-je még külön megoldandó.

## 4. Egyéb aktuális funkciók és nyitott QA

- Jegyzőkönyv Player és Manager: kapitány, liberó, **csere a jobb szélen**; Player statisztika 4 fül, hiányos forrás megjelölése. Gyorsjavítás Player PR #16, Manager PR #66–67 már a főágakon.
- Manager **Versenysport → Pályák** heti teremtervezés PR #61 a mainben; adat RPC `cc_manager_court_impact_v1` élesítve. A pontos 2026/27-es tömegsport-naptár a korábbi audit szerint 2026-10-25 után nem volt teljes, ezért a későbbi szabad sávok feltételesek.
- A **találkozó időpontja nem befolyásolja a pályafoglaltságot**. Hazai találkozó 18:30, idegenbeli egy órával meccs előtt; BB2 hazai 2-es, női BB1/férfi hazai 3-as Bogdánfy pálya.
- 2026-10-20 BEAC II–UTE U20 Pink `events.id=b99c5397-8b51-40d0-a03c-e399c011bd3e`, kezdés 19:30, meeting 18:30, 2-es pálya. A 12, edzésre jelentkezett játékos már szerepelt a meccs 13 `going` között; a jelenléteket nem duplikáltuk. A korábbi önálló edzés `cancelled`. A régebbi részletes esemény-/jelenlétaudit a `HANDOVER_CURRENT.md` 0/B fejezetében.
- Nyitott a női BB2/férfi 2025/26-os teljes szövetségi statisztika; a részleges archívumból nincs hitelesített Elo. A BB1 2024/25 + 2025/26 előzetes, külön idényes Elo-ja modellként készült, nem hivatalos.
- Egyszer korábban előfordult egy **BEAC–BEAC önmérkőzésnek látszó** import-rekord; ne szerepeljen automatikusan igazolt BEAC-meccsként.
- Csapat-azonosítás: **PDSE 1091 és 1214 nem automatikusan ugyanaz a csapat**, férfi Mozdulj SE-t ne keverd a női Mozduljjal, MAFC-Schönherz és MAFC-Vásárhelyi külön csapat.

## 5. Első teendők az új chatben

1. **A Player v23 megjelenésének ellenőrzése**: valóban látszik-e férfi B: 7 csapat, 42 teljes bajnoki sor (12 BEAC), 1 eredmény, 1 halasztott és a helyes aktuális dátum; nem mutat-e hamis helyezéseket. Ellenőrizd, hogy a böngészőben a service worker/cache frissült-e. A korábbi DB+GitHub vizsgálat nem ad bejelentkezett LIVE képernyőigazolást.
2. **Megóvni a #18 fixet**, mielőtt az öt liga teljes menetrendjét összevonod. Használj `main` alapú új brancht, a férfi B külön tesztjeit és mind az öt liga regresszióját.
3. Manager #68 friss mainre rebase/új branch QA-val; eredmény/jegyzőkönyv/meeting/várólista/jelenlét nem módosulhat; **ne élesítsd a nem létező full-save RPC-re épülő szerkesztőt**.
4. Valódi Pages deploy + Player/Manager bejelentkezett böngészős QA, iOS/desktop és cache frissítés után kiadási állapot egyértelmű dokumentálása.
5. Csak utána a Manager teljes meccsszerkesztőjének stabil, forráskulcsos atomikus mentése, szinkronizálva a Player opcionális megjegyzésével.

**Technikai belépési pontok:** 
- Manager handover: `beacvolleyCC/club-control-manager/HANDOVER_CURRENT.md` (0/H és korábbi 0/G–0/A).
- Player main `app.js`: `ccPlayerMenBImportedRows_`, `ccPlayerMenBMatches_`, `ccMrszPlayerAllLeagueMatches_`, `ccPlayerLeagueCatalog_`, `renderCompetitionStandings_`.
- Supabase project `snqsxlyhontaepembaic`.
- **Ne módosíts semmilyen játékos-jelenlétet vagy meglévő meccs-UUID-t a kijelzési hiba javításakor.**
