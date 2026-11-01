# Club Control — CURRENT HANDOVER (TEST only)

**Utolsó frissítés:** 2026-11-01 (Europe/Budapest)
**Állapot:** élő folytatási dokumentum; minden fejlesztési kör végén ugyanitt frissítendő.
**Előző részletes bázis:** [2026-10-28 handover](HANDOVER_20261028_CC_TEST_CONTINUATION.md).

## Kötelező munkarend az új ChatGPT-beszélgetésben

1. **ELŐSZÖR OLVASD EZT A FÁJLT** a GitHub Manager TEST ágon; olvasd be az előző handovert is a részletes korábbi szabályokhoz.
2. Olvasd a legfrissebb Manager és Player TEST branch HEAD/commit állapotát, TEST Supabase migrációkat és szükséges RPC-ket. A handover **nem helyettesíti** az élő ellenőrzést.
3. Minden fejlesztési kör befejezése előtt **frissítsd ezt a pontos fájlt** (ne csak a beszélgetésben dokumentálj), és ellenőrizd vissza a GitHubon. Írd le a pontos tényeket, végrehajtott teszteket, a sikertelen/befejezetlen részeket és a következő lépést. Különítsd el a bizonyított és a korábbi chatből származó állításokat.
4. Folyamatos ellenőrzés: kétszeri kontroll és a korábban rögzített 11 pontos QA; védelem a privát adatokra, RLS-re és PWA cache-re.
5. **LIVE branch, LIVE DB és LIVE deploy nem módosítható külön, konkrét felhasználói jóváhagyás nélkül.** A teszt- és éles jogosultságokat, infrastruktúrát, kulcsokat külön kell kezelni. Ne publikálj secretet, emailcímeket vagy sportolói személyes adatokat a repóba.
6. Az aktuális kör végén mindig add meg a felhasználónak a jelen handover linkjét és a frissítési commitot. Ha a frissítés sikertelen, ezt egyértelműen jelezd. GitHub-fájl nem frissül magától; minden körben tényleges GitHub írás szükséges.

## Környezet

- Manager repo: `beacvolleyCC/club-control-manager`, TEST ág: `test/20261026-manager-document-intake`
- Player repo: `beacvolleyCC/player_application`, TEST ág: `test/20261026-isolated-player-mobile`
- TEST Supabase projekt ref: `szzoubvhlwnojtzqjebc`
- LIVE Supabase projekt ref (csak azonosításra, **soha nem írható** külön engedély nélkül): `snqsxlyhontaepembaic`
- Korábbi, október 28-i handover állapotadatai, különösen a Cloudflare publikálásra vonatkozó állításai, **elavulhattak**. A felhasználó később Cloudflare TEST deployt és belépési tesztet végzett; a pontos címeket és a jelenlegi működést külön ellenőrizni kell. Kódos/linkes bejelentkezési problémák is előfordultak.

## 2026-11-01: ezen körben élő TEST adatbázisban megerősített tények

A Supabase TEST `pg_proc` katalógusából kiolvasva a következő *függvények léteznek* (létezésük önmagában **nem bizonyít** sikeres böngészős end-to-end tesztet).

**Versenysport Manager írás:** `cc_manager_competition_event_save_v1`, `cc_manager_competition_event_cancel_v1`, `cc_manager_competition_event_series_create_v1`, `cc_manager_competition_rsvp_v1`, `cc_manager_competition_attendance_v1`, `cc_manager_competition_note_clear_v1`; továbbá több olvasó RPC, például `cc_manager_competition_results_v1` és `cc_manager_competition_position_counts_v1`.

**Tömegsport Manager:** `cc_manager_mass_athletes_v1`, `cc_manager_mass_calendar_v1`, `cc_manager_mass_trainings_v1`, `cc_manager_mass_event_detail_v1`, `cc_manager_mass_training_history_v1`, `cc_manager_mass_passes_v1`, `cc_manager_mass_cancellations_v1`, `cc_manager_mass_attendance_snapshot_r1_v1`, `cc_manager_mass_booking_add_v1`, `cc_manager_mass_booking_patch_v1`, `cc_manager_mass_booking_remove_v1`, `cc_manager_mass_attendance_r1_v1`, `cc_manager_mass_registration_gate_v1`.

**Tömegsport publikus/OTP/várólista:** `cc_vnext_mass_public_book_v1`, `cc_vnext_mass_public_wait_v1`, `cc_vnext_mass_public_cancel_v1`, `cc_vnext_mass_public_decide_v1`, `cc_vnext_mass_capacity_v1`, `cc_vnext_mass_offer_next_v1`, `cc_vnext_mass_offer_expire_v1`, `cc_vnext_mass_email_start_v1`, `cc_vnext_mass_email_verify_v1`.

Az élő TEST migrációs listában 2026-11-01 dátumú bejegyzések:
- `20261101002647 cc_test_manager_roster_and_position_counts_read_parity_20261101`
- `20261101005610 cc_test_roster_note_visibility_with_absence_and_present_20261101`
- `20261101005631 cc_test_manager_completed_present_note_clear_v1_20261101`
- `20261101005711 cc_test_manager_attendance_write_authenticated_v1_20261101`

**Bizonyítási korlát:** ezek a mai, közvetlen adatbázis-lekérdezés eredményei. A 2026-11-01 nap folyamán említett dupla smoke/rollback és Cloudflare Worker build/QA részletes naplói **ebben a körben nem lettek önállóan visszaellenőrizve**. A korábbi beszélgetés feljegyzése szerint a TEST Worker build, biztonsági és izolációs ellenőrzései sikeresek voltak, a manuális Worker publikálás még nem igazolt. A publikus regisztráció/lemondás teljes, végponttól végpontig tesztje és e-mail kézbesítés nincs igazoltan kész.

## GitHub állapot a jelen ellenőrzésben

A Manager és Player alapértelmezett ágának legfrissebb `search_commits` eredménye **nem a TEST ág ellenőrzése**; külön vizsgáld a TEST ág aktuális SHA-ját. A korábbi 2026-10-28 handoverben:
- Manager TEST `74b50741d88368fcc9780610471811947477764f`
- Player TEST `17991748d815e052932f17dfe49939aeb5edf8de`
Ezek **régi pillanatképek**, nem jelenlegi HEAD-nek tekintendők.

## Fontos nyitott teendők

1. A TEST Worker tényleges publikálása és a hitelesítés/végpontok ellenőrzése, éles titkok nélkül.
2. Tömegsport: regisztráció, lemondás, várólista, ajánlat elfogadás/elutasítás/lejárat és kapacitás teljes end-to-end, konkurencia- és jogosultsági teszt.
3. OTP: rate limit, lejárat, hibás és ismételt kód, külső e-mail szolgáltató ingyenes keret és tényleges kézbesítés ellenőrzése. Külső levelet teszt nélkül ne indíts.
4. Versenysport Manager + Player funkcionális paritás, roster/pozíció/jelenlét/notes és visszajelzések, saját és idegen csapat RLS negatív tesztje.
5. Cloudflare TEST Manager/Player pontos URL-jeinek és belépési módjának ismételt ellenőrzése; a felhasználó már próbált TEST appokba belépni, ezért a 10/28-i „nincs deploy” mondat nem kezelhető mai tényként.
6. Mobil Safari/PWA telepítés, session visszatöltés, push/ICS, cache, offline visszaállás. Elmaradt Live→TEST adatparitás csak adatvédelmi jóváhagyással.
7. Nem szabad összekeverni a női BB1, BB2 és a férfi külön bajnoki csoportokat; meccs-statisztikai UI tervezésnél további felhasználói rajzra várunk.

## Handover frissítési sablon minden következő körhöz

- Dátum/idő (Budapest), cél és érintett TEST branch/DB
- Előző és új commit SHA, migrációk, konkrét módosított fájlok/funkciók
- Valóban elvégzett változások, eredmények
- Ellenőrzési parancsok/lekérdezések, eredmények; 2× QA és 11 pontos ellenőrzés státusza
- Még nem igazolt/nyitott/hibás pontok
- LIVE változatlanság ellenőrzése, adatvédelmi figyelmeztetés
- Egyetlen következő végrehajtható feladat
- A handover commit SHA és a visszaolvasás ténye

## Új chat kezdő mondata

**CC-FOLYTATÁS.** Olvasd el elsőként a `beacvolleyCC/club-control-manager` TEST ág `docs/handover/CURRENT_HANDOVER.md` fájlját és az abban hivatkozott korábbi handovert. Élő TEST GitHub/Supabase ellenőrzés után folytassuk a fejlesztést; minden munkakör végén ugyanebbe a fájlba írj vissza, és ellenőrizd a commitot. Kétszeri, 11 pontos QA. LIVE csak külön engedéllyel.
