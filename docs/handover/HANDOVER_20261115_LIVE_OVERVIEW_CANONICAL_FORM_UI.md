# CLUB CONTROL – LIVE ÁTTEKINTÉS TABELLÁK / MECCSKÁRTYA-FORMA UI

**Dátum:** 2026-11-15 (Europe/Budapest)  
**Környezet:** V1 LIVE; V2 TEST, V2 draft PR #89 érintetlen.  
**Manager:** `beacvolleyCC/club-control-manager` / [PR #90](https://github.com/beacvolleyCC/club-control-manager/pull/90)  
**Player:** `beacvolleyCC/player_application` / [PR #32](https://github.com/beacvolleyCC/player_application/pull/32)  
**LIVE Supabase:** `snqsxlyhontaepembaic` – **ebben a körben nincs SQL-adatírás vagy séma- és RLS-módosítás**.

## 1. Mi változott?

- **Manager → Versenysport → Áttekintés** tabellái most a már központilag, LIVE-on számolt `canonicalFormCards` és `canonicalTeamStats` mezőket kapcsolják össze a `competitionLabel + teamKey` csoporthatáron belül. Ezek ugyanabban a `cc_manager_competition_mrsz_snapshot_v2()` RPC-válaszban vannak, amelyből a meccskártyák is dolgoznak.
- Az október 14-i, elavult MRSZ-képernyőkép és a külön BRSZ fallback **nem állíthat elő élő Overview-helyezést**. Ha nincs canonical rekord, hiányjelzés látszik, nem kitalált szám.
- A táblában a **Hely*** oszlopban csillagozott, **részleges/nem hivatalos helyezés** jelenik meg. A mezők: lejátszott meccs, győzelem, vereség, **2–1–0 szabály szerinti pont**, szettek, szettarány, játszmapontok és pontarány, ahol az adat rendelkezésre áll. Null eredményt vagy ismeretlen adatot nem alakítunk automatikusan nullává.
- Az Áttekintés férfi A/B váltója külön ligakulcsot használ; a női I. BEAC és női II/B BEAC II. nem keveredik.
- A **Manager és Player még nem játszott mérkőzésein** a mintaképhez igazodva a **csillagozott részleges helyezés + színes trendnyíl + csapatnév egy sorban**, és **alatta legfeljebb öt zöld/piros körpont** látható (W/L-sorrend, győzelem/vereség tooltip). A trend ikon: javuló **↗**, romló **↘**, nem értékelhető vagy azonos **→**. iPhone-szélességnél külön CSS méretezi a sort és a pontokat. Az adatszámítás változatlanul ugyanaz a DB-`canonicalFormCards`. A lezárt meccsek nem kapnak utólag aktuális formát.
- HTML-/JS- és PWA cache-verziók összehangolva, hogy a friss CSS/JS mindkét alkalmazásban betöltődhessen.

## 2. A LIVE központi adatok tényleges ellenőrzése

2026-11-15, csak olvasó SQL:
- `canonicalFormCards`: **40** csapat, `canonicalTeamStats` join: **40/40**, egyetlen hiányzó statisztikai oldal sincs.
- Ligabontás: férfi I/A **7**, férfi I/B **7**, női I **12**, női II/A **7**, női II/B **7** csapat.
- **0** olyan csapat van, amelynek 0 lejátszott mérkőzésére helyezést kaptunk volna.
- A `competition_source_standings` 25 sora még **2026-10-06-i**, mind a 25 `position=NULL`, és 0 lejátszott mérkőzést mutat. Nem használható most élő hivatalos állásként.
- Külön, korábbi, **2026-10-14-i** `cc_competition_mrsz_screenshot_v1` tabellaképek vannak férfi I/A és női II/B csoportokra, de nem frissek.
- **Handover-pontosítás:** a LIVE SQL jelenleg 2–3 lejátszott mérkőzésnél is összehasonlíthatja az utolsó két eredményt, `trendBasis=last_match_vs_previous_match_limited` címkével. 26 ilyen rekordból 8 nem semleges. Az előző, 2026-11-15-i formás handover \"négy mérkőzés alatt mindig semleges\" tétele nem felel meg a ténylegesen deploy-olt függvénynek. **A trend képlete ebben a változtatásban nem módosult.** A rövid trendjelzés nem előrejelzett győzelmi esély.

## 3. Tesztek és release-feltételek

- Manager `tests/manager-standings-filters.test.cjs`: ugyanaz a canonical forrás, ligahatár, BEAC II., részleges rang, nulla lejátszott meccs, semmilyen legacy fallback.
- Manager `tests/mrsz-data-coverage.test.cjs` és `tests/mrsz-stat-missing-values.test.cjs`: történeti MRSZ source státusz külön az élő, részleges Overview-tól; nem kitalált hiányzó pontszám.
- Player `tests/player-form-mini-canonical.test.cjs`: ligahatár, részleges csillag, W/L, hiányzó helyezés, akadálymentes címkék. Hozzáadva a Player meccs QA workflow-hoz.
- **Manager #90 PR CI:** 7/7 releváns QA zöld (az `6a72f80` code-checkpointon). **Player #32 PR CI:** 4/4 zöld, a mintakép szerinti meccskártya-regresszióval együtt (`b36d318` code-checkpoint).
- **Még nincs bejelentkezett webes vagy iPhone-os vizuális E2E.** A GitHub Actions sikeressége nem ennek helyettesítője.

## 4. Kiadás és nyitott tételek

**Mindkét változtatás a LIVE main ágon van**: Manager [#90](https://github.com/beacvolleyCC/club-control-manager/pull/90) squash merge `69a629ce1826d50fcdf76852afa33f9e9594b4fa`; Player [#32](https://github.com/beacvolleyCC/player_application/pull/32) squash merge `275d22fa2a28e2aed864bb76a5b78e6b573cd7fb`. Manager főági QA és Pages deploy sikeres: https://github.com/beacvolleyCC/club-control-manager/actions/runs/43724524981 . Player főági CI 4/4 zöld; Pages deploy státusza az átadás után külön követendő: https://github.com/beacvolleyCC/player_application/actions/runs/43724686472 . Az újabb hivatalos eredmény automatikusan frissíti a canonical statot és az Overview-t – új tabellaimport nem kell.

**Nyitott:** vizuális Manager/Player UI-ellenőrzés valódi bejelentkezéssel, iPhone 11 szélesség; hivatalos, teljes és friss tabellák forrásigazolása; hiányzó hivatalos mérkőzéseredmények, különösen női II/A; külön megtervezett pontos történeti ranghoz viszonyított helyezésváltozás (nem azonos a jelenlegi forma-nyíllal).

**Rollback:** csak a Manager #90 és Player #32 frontend main-merge commitjai visszaállítandók; SQL-visszaállítás ebben a körben nem szükséges. **V2 TEST-hez, draft PR #89-hez nem nyúlunk.**

**Folytatási kulcs:** `CC-FOLYTATÁS – LIVE CANONICAL OVERVIEW + FORMA UI`.
