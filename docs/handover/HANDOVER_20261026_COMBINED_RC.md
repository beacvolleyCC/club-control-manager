# Club Control – összevont Manager kiadásjelölt (2026-10-26)

**STAGING / DRAFT ONLY. Semmi merge a mainbe, sem éles DB-migráció vagy Pages deployment nincs engedélyezve.**

## Reprodukálható kódfák
- Manager #76 (canonical menetrend és BEAC/összes kapcsoló) BASE: `b97ed731be1eb51f40f06eb06cb2bc2eeea9417c`.
- Manager #74 (két hivatalos MRSZ jegyzőkönyv, PostgreSQL migration, rollback, 38 játékos és QA) 26 új fájlja, byte-azonos Git blob SHA szerint, forrás: `b91a5bce1d33a21126a70f8f5e552a74ac112625`.
- A két fájlkészlet diszjunkt; a #76 módosított `app.js`, `index.html`, `styles.css` és `sw.js` megmarad. Nem alkalmazunk Git merge-et vagy cherry-picket az élő főágra.
- Keresztrepo Player #28 rögzített kód: `55eb674f22104cdbc84768c71a4040396ac44cd5`; a Player PR továbbra is külön draft. A #77 RLS/grant ellenőrző PR külön marad.

## Regressziós feltételek
1. A combined PR CI-ben a saját `app.js` és a Manager #76 menetrend/kapcsoló tesztjei sikeresek.
2. A #74 két független PG17 adatbázisos CI-je a tényleges canonical JSON-t a Manager és a Player renderereivel futtatja; 298/13 → 298/15 → rollback 298/13 → idempotens reapply 298/15, mindkét meccshez 19 játékos, semmi UUID/RSVP változás.
3. MRSZ 2686 csak Női Budapest I., 2700 csak Férfi Budapest I/B. Egyéb csoportok, dátum nélküli halasztások, saját események és jelenlét sértetlenek.
4. Prod adatbázisban egyelőre **csak SELECT**: előzetes count, 2 pontos sourceKey és matchId, 4 RPC EXECUTE/definer/gate. A 2026-10-25-i baseline 298 mérkőzés / 13 played / 279 events / 682 availability / 0 overlay (idővel változhat).

## További kötelező, még nem teljesített release-gate
- Valódi bejelentkezett Manager/Player tesztfiókokkal jogosultsági, lejárt/inaktív tagsági és másik bajnokságra szóló elutasítás; szintetikus JWT/PG szerepkör-ellenőrzés **nem elegendő**.
- Valódi iPhone 11, iOS Safari és standalone PWA: login, meccskártya, in-app protokoll, bezárás, görgetés, pinch zoom, safe area, cache, offline viselkedés; a headless Chromium mobilnézet **nem helyettesíti**.
- A két egymástól független 11 pontos QA ellenőrzés, új HEAD-hez tartozó sikeres CI, rollback terv és kifejezett release-jóváhagyás szükséges.
- Release-kor sorrend: egyeztetett frontend és jogosultságok, friss read-only LIVE baseline, külön jóváhagyott tranzakciós #74 SQL overlay, újabb read-only post-check. Hiba esetén dokumentált rollback. **Ezt ez az RC nem hajtja végre.**

Az új, user által véglegesnek jelölt 2026/27-es kiírás az irányadó. A 41 régi BRSZ alias nem általános release-blocker; konkrét ütközés vizsgálható külön.
