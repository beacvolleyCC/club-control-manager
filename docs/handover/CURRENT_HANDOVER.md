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


## 2026-11-01: felhasználó által bemásolt teljes napi fejlesztési napló – kiegészítés

**Forrásminőség:** a lenti időrendi eseményeket a felhasználó a korábbi fejlesztési chat szöveges naplójából adta meg. A GitHubon jelen körben külön ellenőriztük a `vnext/mass-gateway/README.md` és a `.github/workflows/upload-mass-gateway-disabled-test-draft-20261101.yml` meglétét és tartalmát. A naplóban szereplő pozitív teszteket ne jelöld automatikusan újonnan lefuttatottnak.

### Player TEST belépés és RSVP felületi QA

1. A korábbi Supabase Auth e-mailküldési limit után a Player TEST URL-en új belépési e-mailt kért a felhasználó; **visszajelzése: „bent vagyok”**, tehát a felhasználói szintű belépés sikeres volt.
2. A felhasználó nem látott edzést; a korábbi chat ellenőrzése szerint a BB2 aktív csapattagnál a legutolsó mintaedzés 2026-10-30 volt, ezért létrejött egy elkülönített **TEST – BB2 jelentkezési próbaedzés** 2026-11-06 pénteken **20:00–22:00** időponttal. A felhasználó megerősítette, hogy most már van edzés és elkezdi tesztelni. A próbaedzés azonosítóját és jelenlegi DB létezését a következő körben célszerű read-only lekérdezéssel megvizsgálni.
3. A felhasználó regressziót jelzett: az RSVP háromállapotú csúszka csak húzással működik, egyszerű kattintással/koppintással nem, noha korábban mindkettő ment. A korábbi chatben a TEST Player kódot úgy módosították, hogy pointer capture csak tényleges vízszintes húzáskor induljon. A napló szerint a kattintás, húzás és mobilos automatikus tesztek sikeresek; a Cloudflare legutóbbi buildjének telepítése nem volt külön igazolt. **A felhasználó a javítás utáni kattintás sikerét és a Jövök/Nem jövök/semleges RSVP tartós mentését ebben a naplóban még nem erősítette meg.**
4. Ellenőrizendő RSVP: Jövök → reload → Nem jövök → reload → semleges → reload, majd indok/megjegyzés, tényleges TEST Supabase adatmentés és Manager TEST szinkron.

**Player TEST URL (felhasználó által megadott, 2026-11-01-i):** https://cc-player-test-beac.elteroplabda.workers.dev/ . Ez a már használt Player PWA, NEM az alábbi mass gateway Worker.

### Supabase TEST OTP

- A napló szerint a két `cc_vnext_mass_email_start_v1`, `cc_vnext_mass_email_verify_v1` függvény a TEST DB-ben telepítve, a hozzáférések `anon=false, authenticated=false, service_role=true`.
- Ötperces kódélettartam, 90 másodperces újrakérési korlát, maximum öt rossz próbálkozás, egyszer felhasználható kód.
- Korábbi teszt szerint a teljes OTP SQL integráció kétszer PASS, transaction rollback után 0 OTP + 0 mail + 0 push sor. Ez a TEST mass-gateway README-ben is szerepel.
- Telepítő: `docs/security/CC_TEST_MASS_EMAIL_PROOF_SQL_EDITOR_20261101.sql`
- Dupla rollback teszt: `tests/sql/CC_TEST_MASS_EMAIL_OTP_POSTDEPLOY_ROLLBACK_20261101.sql`
- **FONTOS: ez a tömegsportos e-mail proof/OTP, nem azonos a Player Supabase Auth Magic Link levelezésével.** A meglévő Resend TEST Auth SMTP bekötését külön kell feltárni; nincs igazoltan kész.

### Cloudflare TEST mass gateway: kód és deployment

A GitHubon ebben a körben a fájlok létezését és tartalmát közvetlenül ellenőriztük:
- `vnext/mass-gateway/README.md` – státusz: source implemented, mocked-double-tested, NOT DEPLOYED.
- `.github/workflows/upload-mass-gateway-disabled-test-draft-20261101.yml` – kézi GitHub Actions workflow, TEST ág + pontos `UPLOAD_DISABLED_TEST_DRAFT` megerősítés, két preflight, két Worker security teszt és Wrangler dry-run.
- A workflow **`wrangler versions upload`**, nem `wrangler deploy` parancsot használ; az upload nem élesíti a forgalmat. A pontos Cloudflare hozzáférés és GitHub Actions secret-ek beállítása még ellenőrizendő.
- Külön Worker azonosító: `cc-mass-gateway-test-beac`, `workers_dev:false`, **nincsenek routes**; a nyilvános írás és e-mail delivery letiltva marad, amíg a végpontteszt és jóváhagyás hiányzik.
- A Worker szolgáltatásai: health; e-mail OTP start/verify; foglalás, várólista, lemondás, helyfelajánlás döntés. TEST-only környezetvizsgálat, Turnstile, rate limiting, jogosultság- és token-hash ellenőrzés, titkok szerveroldalon.
- A korábbi napló sikeres kétszeres mocked security/CI teszteket, Wrangler `deploy --dry-run` fordítást és izolációs ellenőrzést dokumentál. Referencia GitHub Actions futás: https://github.com/beacvolleyCC/club-control-manager/actions/runs/41336412625 és https://github.com/beacvolleyCC/club-control-manager/actions/runs/41327682212 . **Ezeket a futásokat jelen körben külön nem auditáltuk.**
- Titkokat ne másolj chatbe/GitHubba/PWA forrásba. Csak Cloudflare secret binding: kizárólag TEST Supabase secret, Turnstile, EMAIL_PROOF_SECRET, EMAIL_OTP_PEPPER és TEST Resend. 0 Ft keret, LIVE sértetlen.

### A napló végén elért valós állapot / első következő teendő

**Player:** bejelentkezés a felhasználó szerint sikeres, van próbaedzés; a kattintásjavítás valós PWA deployja és RSVP perzisztencia **nincs készre igazolva**.

**Mass gateway:** a kód, a kétszeres automatikus ellenőrzés és a dry-run a korábbi chat szerint kész; a **külön Worker-verzió Cloudflare-re történő feltöltése nem történt meg**, és semmilyen publikus útvonalat, e-mailt vagy nyilvános írást nem szabad önkényesen engedélyezni.

**Következő kör:** előbb a GitHub TEST branch aktuális HEAD/Actions és Player TEST deploy/kattintás megerősítése; majd a TEST tömegsportos Worker kézi *disabled draft upload* előfeltételei (GitHub workflow láthatóság, külön Cloudflare TEST jogosultság és secrets létezése, értékek kiolvasása nélkül), és csak biztonságos engedélyezett lépések. E-mail küldés/LIVE változtatás NEM.


## 2026-11-01 – következő kör: mass-gateway feltöltési preflight (read-only ellenőrzés)

**Ezen körben közvetlenül ellenőrizve a GitHubon:**
- A külön TEST Cloudflare Worker `vnext/mass-gateway/wrangler.jsonc` konfigurációja `cc-mass-gateway-test-beac`; `workers_dev=false`, `preview_urls=false`, `PUBLIC_WRITES_ENABLED=false`, `EMAIL_VERIFICATION_ENABLED=false`, `EMAIL_DELIVERY_ENABLED=false`, nincs `routes` mező.
- Supabase csak a TEST `szzoubvhlwnojtzqjebc` projektre mutat, a megengedett origin a külön Player TEST URL.
- Kötelező titoknevek deklarálva, a fájlban nem szerepelnek tényleges titokértékek. Két rate-limit binding beállítva; namespace ID-k egyediségét a valódi Cloudflare-fiókban **nem ellenőriztük**.
- A kézi workflow csak a TEST branchről, pontos megerősítéssel futtatható; a feltöltési parancs `wrangler versions upload`, a build ellenőrzés `deploy --dry-run`; nincs automatikus deploy.
- A `tests/mass-gateway-deploy-preflight-20261101.test.mjs` ténylegesen létezik és lefedi a fenti konfigurációs biztonsági feltételeket. **Ebben a körben a tesztet újra nem futtattuk**, csak a kódját olvastuk.
- Fontos blokk: a `.github/workflows/upload-mass-gateway-disabled-test-draft-20261101.yml` fájl **megtalálható a TEST ágon, de a `main` ágon 404**. Így a GitHub Actions `workflow_dispatch` felülete nem tekinthető használhatónak, amíg az adott workflow-t a GitHub nem regisztrálja. **Nem másoltuk át a main ágra**, mert ott bármilyen módosításhoz külön LIVE-engedély szükséges.
- GitHub Actions secrets/Cloudflare API token és fiók hozzáférése, script tényleges feltöltése **nem ellenőrzött**. A jelenlegi hozzáférhető eszközzel a Cloudflare feltöltés nem indítható közvetlenül. A `fetch_commit_workflow_runs` a dokumentációs commitra 0 PR-indítású futást adott; ez **nem általános Actions státusz-ellenőrzés**.

**Következő gyakorlati lépés:** a Cloudflare TEST-fiókban a külön Worker jogosultságok és a titokbindingok meglétének vizsgálata, titokértékek kiolvasása nélkül. A workflow regisztráció vagy a külön helyi Wrangler `versions upload` útvonalát **csak a jogosultságok és a korlátok igazolása után** lehet kiválasztani. A `main`, LIVE Supabase, működő Manager/Player TEST PWA változatlan. Nem történt Worker feltöltés, nyilvános írás, email vagy push.

## 2026-11-01 – biztonságos mass gateway feltöltési checklist

A TEST ágon létrejött: `docs/handover/MASS_GATEWAY_DISABLED_UPLOAD_CHECKLIST_20261101.md` (commit `0168baf83de84c27dcddf776e214fa8b5ee561e3`). Részletes hozzáférési, titokbinding-, namespace-, kétfutásos teszt-, Wrangler dry-run, verziófeltöltés és utóellenőrzési lépéseket ír le. A Worker forrását átnéztük: `workers_dev:false`, `preview_urls:false`, nincs route, három engedélyezési kapcsoló false. A feltöltés blokkolója továbbra is a Cloudflare account/secret/jogosultsági állapot igazolásának hiánya és a GitHub workflow default-branch regisztrációja. **Nem történt Worker upload, deploy, e-mailküldés vagy LIVE módosítás.** A következő tényleges művelet a Cloudflare dashboardban a külön Worker létezésének és a szükséges jogosultságoknak a vizsgálata. 

## 2026-11-01 21:05 Budapest – Cloudflare dashboard képernyőképes ellenőrzés

A felhasználó Cloudflare Workers & Pages listáról képernyőképet adott. A látható négy alkalmazás: `cc-manager-test-beac`, `cc-player-test-beac`, `beac-volleyball-web-preview`, `beac-edzesek`. A keresett **`cc-mass-gateway-test-beac` nem szerepel a listában** (4/4 látható), ezért **ezen a fióklistán nem létezik telepített/nyilvántartott külön gateway Worker**. A képernyőkép Manager sorában a legutóbbi dokumentációs commit, Player sorában RSVP tap refresh tesztcommit látható; ez nem igazolja a Player RSVP E2E-t. Következő felhasználói lépés: `Create application` oldal opcióinak megtekintése, **deploy/publish nélkül**; semmilyen automatikusan publikus starter Worker létrehozására ne kattintson visszavonhatatlanul. A külön disabled-version `wrangler versions upload` útvonal továbbra is elsődleges biztonságos opció. Nem történt Worker létrehozás, deploy, küldés vagy LIVE módosítás.


## 2026-11-01 – ARCHITEKTÚRA DÖNTÉS: egyszerűség és DB-first újraépítés

**Felhasználói döntés (elsődleges, felülírja a korábbi Worker telepítési tervet):** A már működő tömegsportos jelentkezési folyamatot ne váltsuk le új közvetítőre pusztán azért, mert az elkészült. Új infrastruktúrát csak bizonyított biztonsági, teljesítmény- vagy üzemeltetési előny esetén vezessünk be. **A külön Cloudflare mass gateway Worker feltöltése/telepítése/engedélyezése FÉLRETÉVE.** A forrás és tesztek megmaradnak opcionális tartaléknak. Ne kérd a felhasználótól a Cloudflare gateway létrehozását vagy API tokenek beállítását a következő körökben.

**Aktuális fő cél:** a TEST Supabase DB és a stabil, jogosultságvédett API-k végleges előkészítése, hogy a Manager és Player funkciókat a korábbinál átláthatóbb, megbízhatóbb struktúrán modulonként újra lehessen építeni. A meglévő jól működő funkciókat őrizzük meg, ne kreáljunk új hibaforrásokat. LIVE változatlan, csak külön jóváhagyással.

**Új, 2026-11-01-i közvetlen TEST DB read-only ellenőrzés:** public schema 116 függvény (37 cc_manager_, 18 cc_player_, 10 cc_vnext_); private schema 15 függvény (5 cc_manager_). Összesen **131**, ebből 42 manager, 18 player, 10 vnext prefixel. Ezek csak katalógusbeli darabszámok: **nem** bizonyítanak funkcionális paritást és nem bizonyítják a biztonsági QA teljesülését. A korábbi migrációs lista 2026-11-01-i négy bejegyzésig visszaellenőrizhető.

**Következő feladat:** API/paritás leltár a meglévő Club Control Manager és Player moduljaihoz: funkció → táblák/relációk → read/write RPC-k → RLS szerepkörök → hiányok → automatizált+end-to-end teszt; prioritás szerint a kritikus jelentkezés, lemondás, várólista, jelenlét, naptár, csapattagság, jogosultság, pénzügy, értesítések, versenymenetrend és tabella. Előbb adatbázis-készenléti kapu, csak utána frontend újraépítés. Ne javasolj új infrastruktúrát igazolt hiány nélkül.

**Továbbra is:** minden kör végén tényleges GitHub handover update és visszaolvasás; kétszeres QA és 11 pontos ellenőrzés.


## 2026-11-01 – DB-FIRST: közös adatforrás és módosítások megőrzése (felhasználói követelmény)

**Nem alku tárgya:** egyetlen hiteles DB-adatforrás, amelybe bármely jogosult felület írhat a kijelölt API-n keresztül, és amelyből minden más Manager/Player/statisztika felület ugyanazt az állapotot olvassa. Másik modulban történt szerkesztés ne vesszen el, ne álljon vissza véletlenül és legyen auditálható (ki/mikor/mit/előtte-utána, a személyes adatok biztonságos kezelésével). A cache / realtime csak szinkronizációs mechanizmus, ne legyen külön igazságforrás. Írás sikere csak DB-commit után jelenjen meg véglegesnek; frissítés és újratöltés konzisztens legyen. Párhuzamos módosításokhoz tranzakció és ahol szükséges optimista verzióellenőrzés, valamint idempotencia szükséges.

**Közvetlen read-only TEST DB katalógus-audit ezen körben:**
- `public` 53 és `private` 6 = **59 base table**; mind az 59 táblán `relrowsecurity=true` (RLS bekapcsolt). Ez önmagában nem RLS policy teljeskörű működésbizonyítéka.
- **43 FK** összesen, **24 táblán**. Ez nem mondja meg önmagában, mely további kapcsolatok kötelezőek.
- Van `audit_log`, `attendance_change_audit`, `manager_team_transfer_audit`, `mass_live_write_audit`, `cc_competition_match_override_audit_v1`, `cc_player_fee_audit_v2382` stb. A táblák jelenléte nem garantálja a minden írásra kiterjedő auditot.
- Az `events`, `availability`, `players`, `teams`, `team_memberships` táblákon 1-1 aktív saját trigger mutatkozott (korábbi ellenőrzés szerint `updated_at`); a `mass_athletes`, `mass_bookings`, `mass_events` táblákon **0 saját aktív trigger**. Ez nem bizonyítja, hogy RPC-k/alkalmazás nem írnak auditot, de ellenőrizni kell.
- 131 public/private függvény korábbi read-only katalógus-audit alapján; a függvények megléte nem egyenlő alkalmazás-paritással.

**Következő DB auditkapuk:**
1. Konkrét entitás-forrás mátrix: players/team_memberships/events/availability, mass_athletes/mass_events/mass_bookings, díjak/bérletek, versenyeredmények, értesítések. Kijelölni a kanonikus táblát és az ugyanazt reprezentáló legacy/copy/cache adatot, az utóbbiak kezelési tervével.
2. Minden Manager/Player íróműveletnél audit lefedettség: tranzakciós oldalon actor/time/before/after/operation/source; szabályos soft-delete vagy tartós történet szükség esetén; hibás írás nem hagyhat félállapotot.
3. FK/unique/check/index és RLS policy pozitív és negatív teszt, fontos szerepkörök és területi szűrések.
4. Konkurens szerkesztés, idempotens retry és gyors RSVP váltások tesztelése; cache/realtime/refetch után mindkét app ugyanazt látja.
5. Regresszióval és kétszeri 11 pontos QA-val lehet csak modulonként újraépítésre késznek minősíteni.

**Ebben a körben sem történt DB DDL/DML, sem LIVE, sem Cloudflare Worker deploy.** Kizárólag read-only TEST audit és dokumentáció. A fő fókusz a DB koherencia, nem új infrastruktúra.


## 2026-11-01 – DB-first entitás és FK audit (read-only)

Közvetlenül lekérdezett TEST sémarészlet:
- Versenysport: `players` → `auth.users`, `team_memberships` → `players,teams`, `events` → `teams`, `availability` → `events,players`: összesen ezen kapcsolatok idegen kulcsokkal igazoltak.
- Tömegsport: `mass_athletes`, `mass_events`, `mass_bookings` külön forrástáblák, `mass_bookings.event_id` és `athlete_id` text mezőkkel. A fenti 3 tömegsportos tábla, valamint a `player_fees` és `mass_passes` táblák `pg_constraint` lekérdezésében **0 FK** található. Ez szerkezeti kontrollhiány lehet, de nincs kimutatott tényleges hibás sor, és semmilyen módosítást nem végeztünk.
- `mass_athletes`, `mass_events`, `mass_bookings` import/legacy azonosítókat és `updated_at` mezőt hordoznak. Korábbi trigger-audit: nincsen saját automatikus updated_at/audit trigger ezekhez. Ellenőrizni kell, hogy az RPC-k írják-e a timestamps és audit mezőket.
- `audit_log`: actor_user_id, action, entity_type, entity_id, old_data, new_data, created_at. `attendance_change_audit`: régi/új státusz, actor_email, changed_at. A naplózás lefedettsége továbbra sincs készre igazolva.
- Bérlet/fizetés kapcsolódó táblák: `mass_passes`, `mass_pass_month_overrides_b43`, `mass_pass_validity_overrides`, `player_fees`, `cc_player_fee_meta_v2382`, `cc_player_fee_audit_v2382`; ezek kanonikus forrását és felülírás-szabályait még vizsgálni kell.

**Döntés:** TILOS a meglévő mass táblákat egyszerűen összevonni a verseny táblákkal, új FK-t/trigger-t telepíteni vagy legacy adatot eltávolítani addig, amíg az adatkapcsolati és írási RPC-k kompatibilitása, tényleges anomáliák és kapcsolókulcsok nincsenek ellenőrizve. Következő read-only audit: mass_bookings orphan/duplikátum arány (személyes adatok listázása nélkül), jogosultságvédett write RPC-k módosítás-időbélyeg és audit garanciái; verseny RSVP és Manager read-after-write konzisztencia; fizetés/bérlet adatmodell. Ezután tervezhető biztonságos, tranzakciós, fokozatos javítás a TEST környezetben.


## 2026-11-01 – TEST adatintegritás: tömegsport, pénzügy, RSVP, audit (read-only)

**Közvetlen SQL lekérdezési eredmények (név/e-mail és privát rekordok kiolvasása nélkül):**
- `mass_bookings=0`, `mass_events=0`, `mass_athletes=0`. Az árva foglalások, hiányzó `athlete_id` és azonos e-mail+event duplikátum számok emiatt 0; **nem szabad** ebből valódi tömegsportos adatintegritási sikert állítani.
- `availability=69`, ebből idegen eseménykapcsolat-hiány `0`, idegen játékoskapcsolat-hiány `0`. A versenysport RSVP relációk ezen pillanatképben épek; ez nem read-after-write E2E.
- `player_fees=0`, `mass_passes=0`, `audit_log=0`, `attendance_change_audit=0`, `mass_live_write_audit=0`. Ezeknél a tényleges megőrzés, audit és felülírás viselkedés **még nem tesztelt**.
- `mass_athletes`, `mass_bookings`, `mass_events`: csak PK constraint igazolható az adott listában; további FK nem látható. `player_fees`: PK + 4 check. `availability`: PK + 2 FK + 2 check.
- A `pg_get_functiondef` szövegében a `cc_manager_competition_event_save_v1`, `cc_manager_competition_rsvp_v1` hivatkozik `audit_log`-ra és `updated_at`-ra. A `cc_manager_mass_booking_add_v1`, `...patch_v1`, `...remove_v1` hivatkozik `updated_at`-ra, de **nem** tartalmaz `audit_log` szöveget. Ez még nem bizonyítja, hogy más auditnapló nincs; meg kell vizsgálni a teljes írási útvonalat és a `mass_live_write_audit` használatát.

**Kritikus következtetés:** TEST tömegsport és pénzügy adatállomány hiányában a paritás/adatmegőrzés csak mesterséges, tranzakciósan visszagörgetett és később célzott, jogosultságteszttel ellenőrzött adatokkal bizonyítható. Nem szabad 0 hibát „PASS”-ként feltüntetni üres táblán. A meglévő versenyadatokhoz ne nyúljunk. Következő kör: a tömegsportos író RPC-k teljes SQL auditja és célzott, lezárt/rollback-es szintetikus adatpróbák; szükség esetén szűk, minden bemeneti útra kiterjedő auditmigráció előkészítése, RLS/role teszttel. A tömegsport jelenlegi működő LIVE útvonalát nem cseréljük le. Semmi DML/DDL, LIVE módosítás, Worker deploy vagy e-mailküldés nem történt ebben a körben.


## 2026-11-01 – Teljes SQL audit: három tömegsport Manager booking írási RPC

**Közvetlenül ellenőrizve a TEST pg_get_functiondef kódban**:
- `cc_manager_mass_booking_add_v1`: `private.cc_manager_require_any_v1('mass.trainings','edit')`, esemény `FOR UPDATE`, aktív/scope/dátum/kapacitás/dupla foglalás és első alkalom ellenőrzések; opcionálisan sportolót teremt; létrehozza a foglalást; `mass_live_write_audit` INSERT `test.booking_add` művelettel.
- `cc_manager_mass_booking_patch_v1`: csak `note` és `passStatus`; foglalás `FOR UPDATE`, lemondott foglalás nem módosítható; `updated_at=now()`; a `mass_live_write_audit` táblában `test.booking_patch`, a korábbi és új note/passStatus értékkel.
- `cc_manager_mass_booking_remove_v1`: jogosultság, foglalás és kapcsolódó esemény `FOR UPDATE`; **soft delete** `booking_status='LEMONDVA'`, `cancelled_at`, `cancellation_type`, `updated_at`; `mass_live_write_audit` INSERT `test.booking_remove`; **a várólista felajánlás nem indul automatikusan**, `waitlistOfferQueued=false`.
- Mindhárom `SECURITY DEFINER`, üres search_path; a belső explicit jogosultságellenőrzés látható. A teljes EXECUTE grant/RLS/security és konkurens tranzakciók külön tesztje még szükséges.
- **Korábbi feltételezés pontosítása:** a három tömegsportos RPC nem hivatkozik a központi `audit_log`-ra, de **IGEN, explicit módon ír a `mass_live_write_audit` táblába**. A teljes audit hiánya korábban nem volt bizonyított. Az audit jelenleg actor e-mail szöveget és egy műveletfüggő részleges JSON payloadot őriz; célszerű a stabil actor UUID és megfelelő before/after standard vizsgálata, privát adatvédelemmel.
- A `mass_events` kapcsolatok továbbra is szöveges, FK nélküli kulcsokra épülnek; a függvények ellenőriznek egyező workbook/scope feltételeket. A valós konkurenciahelyzet, idempotencia, sértetlen frissítés, és a foglalás eltávolítása utáni várólista lépés hiánya külön tesztet igényel.
- Az előző körben mért `mass_events=0`, `mass_bookings=0`, `mass_athletes=0`, `mass_live_write_audit=0` miatt az adatokon végzett teljes end-to-end műveleti igazolás **még hátravan**.

**Következő végrehajtható munka:** read-only ellenőrzés a `mass_live_write_audit` szerkezetére, constraintjeire/hozzáféréseire és más write RPC-kre; majd tranzakción belüli ROLLBACK-es izolált create/patch/remove és audit teszt szintetikus eseménnyel és hitelesített manager szereppel. A jelenlegi működő architektúrát megőrizni; új gateway telepítése továbbra is FÉLRETÉVE. Nincs DB módosítás és LIVE írás ebben a körben.

## 2026-11-01 22:09+01 – Biztonságos QA-előkészítés, hozzáférésvédelmi korlát

A következő körben ismét beolvastuk a központi handovert, a GitHub TEST ágon a `tests/sql/CC_TEST_MASS_EMAIL_OTP_POSTDEPLOY_ROLLBACK_20261101.sql` mintatesztet és a hozzá tartozó telepítőt. A mintából igazolható a korábbi gyakorlat: TEST-project guard, `BEGIN`, egyszer használatos mesterséges cím, scope-alapú jogosultságteszt, változások ellenőrzése, `ROLLBACK`, maradéktalan visszaellenőrzés. **Ez a minta OTP-hez tartozik, nem helyettesíti a tömegsportos booking írási tesztet.**

A korábbi körben három TEST Supabase SQL-katalóguslekérdezést a hozzáférésvédelmi rendszer blokkolt; emiatt a booking create/patch/remove rollback próba még nem lett elindítva. Ezt a korlátot továbbra sem kerülhetjük meg. A `mass_live_write_audit` táblán a korábban ellenőrzött grant-listában csak `postgres` és `service_role` szerepelt; a teljes RLS/RPC jogosultsági ellenőrzés ettől még nyitott.

**Következő végrehajtható, biztonságos mérföldkő:** TEST-only, kifejezetten mass bookinghoz készült rollback QA forgatókönyv készítése; tesztfiók szerepkörének és szükséges jogosultságainak jóváhagyott ellenőrzése után lehet kétszer lefuttatni. A QA mérje: esemény/résztvevő/foglalás létrehozás, note/passStatus patch, státuszos admin lemondás, három auditbejegyzés, korábbi/új értékek, és rollback utáni nulla maradék. Az audit nem feltétlenül egyetlen `audit_log` táblában van: a meglévő `mass_live_write_audit` a kanonikus booking audit célpont. A valós párhuzamosság külön, több kapcsolatból végzett tesztet igényel. A tömegsportos LIVE jelentkezési útvonal és a Cloudflare gateway állapota változatlan; Worker telepítés félretéve.


## 2026-11-01 – Több lépéses DB QA: mass booking statikus preflight létrehozva és lefuttatva

Új TEST-only SQL teszt:
`tests/sql/CC_TEST_MASS_BOOKING_CONTRACT_PREFLIGHT_20261101.sql` commit `a5ebdb2d16886ef1e1c5bfa17efa479b5d3ce3d3`.
A fájlt GitHub read-back módszerrel byte-for-byte visszaellenőriztük. A SQL script `BEGIN READ ONLY`, `DO`, `ROLLBACK` tranzakcióban (1) TEST sentinel, (2) booking add/patch/remove RPC-k létezése, (3) audit tábla létezése, (4) anon/authenticated közvetlen audit grant hiánya, (5) mass events/bookings RLS enabled, (6) három RPC SQL-szövegében audit, manager szerepkör kapu és updated_at jelenléte feltételeket ellenőrzi.

A GitHubról visszaolvasott scriptet **TEST Supabase execute_sql-lel lefuttattuk**: hiba nélkül tért vissza (az SQL üzenete üres eredménytömb, a DO NOTICE üzenetet nem mutatja). Ez statikus szerződés-preflight, **nem E2E**, nem adatkonkurencia és nem audit-tranzakció teszt. A teszt mögé új szerver/gateway nem kerül.

A booking add→patch→remove és audit rekordok egyetlen ROLLBACK-es, hitelesített Manager szerepkörű dinamikus tesztje még hátravan: az `SECURITY DEFINER` függvény belső manager authentikációját és szerepkörét nem szabad meghamisítani vagy megkerülni. A korábbi `mass_events`, `mass_bookings` és `mass_athletes` táblák üresek voltak. A teszt sikerét nem szabad ebből kijelenteni. LIVE nem érintett, Cloudflare mass Worker továbbra is félretéve.


## 2026-11-01 – Mass booking RPC grant QA: megvalósított tesztbővítés

Közvetlen TEST Supabase katalogus-lekérdezés igazolta a következő függvényeknél: `cc_manager_mass_booking_add_v1(text,jsonb)`, `cc_manager_mass_booking_patch_v1(text,jsonb)`, `cc_manager_mass_booking_remove_v1(text)`: `anon EXECUTE=false`, `authenticated EXECUTE=true`, `service_role EXECUTE=true`, `SECURITY DEFINER=true`. A már korábban ellenőrzött belső Manager `private.cc_manager_require_any_v1('mass.trainings','edit')` guard továbbra is kötelező. Ez nem jelenti azt, hogy valamennyi bejelentkezett felhasználó sikerrel módosíthatna; a belső guardot dinamikus negatív jogosultsági teszttel kell majd igazolni.

GitHub TEST tesztbővítés: `tests/sql/CC_TEST_MASS_BOOKING_CONTRACT_PREFLIGHT_20261101.sql` új grant/security ellenőrzéseket kapott; commit `1e10fc588dc201a16cbe3036ede468397395c70f`, read-back azonos. A scriptet a TEST DB-ben egymás után **kétszer** lefuttattuk, mindkét futás hiba nélkül zárult, üres eredménytérrel (a DO NOTICE-t a connector nem jeleníti meg). `BEGIN READ ONLY` és `ROLLBACK`, nem keletkezett adatváltozás.

**Még nyitott:** explicit negatív jogosultsági próbák nem-Manager authenticated felhasználóval, izolált booking add→patch→remove→audit→ROLLBACK E2E, konkurens felhasználói műveletek, Manager/Player read-after-write paritás. Ezen funkciók készre nem jelenthetők. A LIVE érintetlen, a külön Cloudflare mass gateway továbbra is félretéve.

## 2026-11-01 – QA folytatás

A Manager jogosultságsegéd részletes kiolvasását a hozzáférésvédelem blokkolta. Az izolált foglalási E2E teszt még nem futott le; a TEST adatbázist nem módosítottuk. A kísérlet egy új QA tervfájl létrehozására szintén blokkolva lett, ezért nem tekinthető mentettnek. Következő lépés a megfelelő hitelesített TEST Manager környezetben végzett, visszagörgethető create/patch/remove/audit próba; SQL Editor admin jogosultság nem helyettesíti a valós felhasználói jogosultságot. LIVE érintetlen, külön Cloudflare gateway továbbra is félretéve.

## 2026-11-01 – Manager–Player read-after-write API leltár (read-only)

A TEST PostgreSQL katalógusában ellenőrizve: a tömegsportos Manager író útvonal `cc_manager_mass_booking_add_v1` a `mass_events` és `mass_bookings` táblákat használja. A `cc_manager_mass_event_detail_v1` és `cc_manager_mass_trainings_v1` olvasók szintén mindkettőt használják; `cc_manager_mass_attendance_snapshot_r1_v1` a `mass_bookings` táblát használja. A már meglévő `cc_manager_mass_booking_patch_v1` és `cc_manager_mass_booking_remove_v1` az előző SQL kódellenőrzés alapján ugyanazon foglalásokat módosítja. A versenysport oldalon `cc_manager_competition_rsvp_v1`, `cc_manager_competition_attendance_v1`, `cc_manager_competition_event_save_v1`, `cc_manager_competition_results_v1`, valamint a Player oldali `cc_player_competition_user_schedule_v1` létezik. A versenysport user_schedule SQL-szövege nem tartalmaz közvetlen `events`, `availability` stringet; lehet közvetett helper hívás, ezért további függvénylánc-vizsgálat szükséges.

KÖVETKEZTETÉS: a tömegsport Manager read/write ugyanazon kanonikus táblákra mutat; ez statikus kapcsolódás, nem bizonyított E2E vagy realtime frissülés. Nyitott: Player és Manager közös állapot ellenőrzése hitelesített tesztekkel, cache invalidálás/refetch, audit és konkurens módosítások. LIVE változatlan, Worker telepítés félretéve.


## 2026-11-01 – Versenysport Player RSVP vs külön importált menetrend: fontos forráskülönbség

**Közvetlenül megvizsgált TEST PostgreSQL RPC teljes forráskódok:**
- `public.cc_manager_competition_rsvp_v1(uuid,uuid,text)` a `public.events` adatot ellenőrzi, a csapattagság hatályosságát validálja, a `public.availability` soron `FOR UPDATE` + `INSERT ... ON CONFLICT DO UPDATE` módszerrel állítja a `going/not_going/unknown` állapotot; korábbi és új sorral `public.audit_log` auditot ír. Jogosultsághoz `auth.uid()` + `private.cc_manager_require_v1(...,'edit', team_id)` kell.
- `public.cc_player_competition_user_schedule_v1()` **NEM AZ RSVP forrása**. A `public.cc_competition_user_schedule_v1` importált, 2026/27-es mérkőzésadataiból épít egy tagsághoz szűrt versenymenetrendet. Nem olvas `events`-et, `availability`-t vagy RSVP-t; ezt a funkciót ne tekintsük Player RSVP szinkron ellenőrzésnek.
- `public.cc_player_bootstrap` SQL-katalógusellenőrzés alapján **egyaránt hivatkozik `events` és `availability` táblákra**, ezért ez a tényleges Player esemény/RSVP adatfolyam elsődleges vizsgálati célpontja.
- `cc_player_bootstrap_filtered_v1` hivatkozik `events`-re, de nem közvetlenül `availability`-re; lehet közvetett helper/eredmény. A teljes függvényhívási láncot külön ellenőrizni kell.

**Architektúrális feltétel:** külön kell választani a *saját, módosítható események + RSVP* kanonikus tábláit (`events` + `availability`) és az *importált külső versenymenetrend* forrását. A Player minden RSVP-t a kanonikus `availability` táblából / az abból épített jogosultságvédett API-ból olvasson; az importált menetrendet csak forrásazonosító/illesztés alapján szabad a saját eseményhez kötni, nem szabad vakon összemosni vagy felülírni. A Manager→Player statikus közös tábla kapcsolódás igazolható, de tényleges read-after-write E2E és cache/refetch még hiányzik.

A vizsgálat read-only volt, LIVE/Worker változatlan.


## 2026-11-01 – Player bootstrap teljes függvényvizsgálat: két konkrét hiány

A TEST DB `pg_get_functiondef` olvasásával a teljes `cc_player_bootstrap()` és `cc_player_bootstrap_filtered_v1()` SQL-t ellenőriztük.

1. `cc_player_bootstrap()` a saját `public.availability` állapotot és a roster alapján `yes/no/unknown` listákat állít elő `public.events` + `availability` táblákból. A Manager `cc_manager_competition_rsvp_v1` is `availability`-t írja: statikus egységes forrás IGAZOLT, E2E még nem.
2. **Csapattag-szűrési hiba lehetősége:** a bootstrap csapatválasztása csak `tm.active`, `t.active`, `tm.ends_on IS NULL OR tm.ends_on >= current_date` feltételeket nézi, de **nem ellenőrzi `tm.starts_on <= current_date`-t**. Jövőbeli csapatváltásnál előre kiválaszthatja a későbbi csapatot.
3. A bootstrap `ORDER BY tm.starts_on DESC LIMIT 1` révén **pontosan egy csapatot** választ, és `e.team_id=v_team.id` szerint listáz. Több, párhuzamosan aktív csapathoz jogosult játékosnál jogos események hiányozhatnak. A mostani termékpolitikával egyeztetett, csapatválasztó vagy többcsapatos megjelenítés szükséges; automatikus összevonás nélkül.
4. `cc_player_bootstrap_filtered_v1` wrapper a `cc_player_bootstrap()` eredményéből szűri a tesztjelölésű neveket és roster tagokat. Az `events` elemeket átadja, csak a `yesNames/noNames/unknownNames` tömböket szűri; nem másodlagos RSVP forrás.
5. A korábbi `cc_player_competition_user_schedule_v1` kizárólag importált versenymenetrend, nem a saját CC RSVP forrása.

**Következő javasolt TEST-only változás:** előbb read-only lekérdezéssel megmérni hány játékost érint a jövőben kezdődő tagság vagy többes aktív csapattagság, majd izolált szintetikus regressziós tesztet készíteni és célzott, visszafelé kompatibilis bootstrap-javítást végrehajtani. Nem módosítottuk a TEST DB-t vagy LIVE-ot; új gateway továbbra is félretéve.

## 2026-11-01 – Player csapattagság előellenőrzés és új SQL QA

Közvetlen TEST DB read-only mérés: jelenleg érvényes csapattagsággal 19 játékos, jövőben kezdődő aktív tagsággal 0 játékos, egyszerre több érvényes aktív csapattal 0 játékos. A bootstrap SQL két korábbi elvi szűrési hibalehetősége jelen pillanatban nem érint kimutatható TEST játékost, de későbbi átigazolás vagy többes tagság esetén releváns.

Új git fájl: `tests/sql/CC_TEST_PLAYER_MEMBERSHIP_VISIBILITY_PREFLIGHT_20261101.sql` (commit `49502eaed5e80fcc8e5373978fba1cf5d01d6061`), GitHub readback ellenőrizve. `BEGIN READ ONLY` / `ROLLBACK`; TEST sentinel + aggregált tagsági baseline + bootstrap létezés. A TEST Supabase-ben hiba nélkül lefuttattuk (üres output, NOTICE a connectorban nem jelenik meg). **Ez baseline ellenőrzés, nem szintetikus future/multi-team regresszió és nem adatmegőrzési E2E.** A következő lépés egy izolált regressziós teszt a kezdődátumra és többes csapattagságra, majd csak a TEST bootstrap célzott módosítása szükség szerint. LIVE és a Cloudflare gateway érintetlen.

## 2026-11-01 23:26 – Szintetikus csapattagsági regresszió kétszer lefuttatva

Létrehozva a GitHub TEST ágon: `tests/sql/CC_TEST_PLAYER_MEMBERSHIP_EDGE_REGRESSION_20261101.sql`, commit `f3cb28d6dd6c7e0758081a1e4a2ee273d69bfcc2`; a fájl visszaolvasva, karakterhelyes egyezéssel. A script `BEGIN READ ONLY` + `DO` + `ROLLBACK`; kizárólag `VALUES`-ből származó szintetikus tagsági sorokkal ellenőrzi: (1) a korábbi kezdődátum nélküli logika a jövőbeli tagságot választaná, a kezdődátumos szűrés az aktuálisat, (2) két párhuzamos jogosult tagság létezhet. Van TEST sentinel ellenőrzés. Kétszer futott a TEST DB-n, hiba nélkül. **Ez a logikai mintateszt, nem a tényleges `cc_player_bootstrap` regressziós/E2E próbája, és nem módosítja a függvényt.** Következő lépés a célzott, visszafelé kompatibilis TEST bootstrap patch és tényleges Player adatvisszaolvasási teszt kidolgozása. A többes csapattagság UI-termékszabályát óvatosan kell meghatározni, nehogy jogos esemény tűnjön el; csapatválasztó vagy összes jogosult csapat eseményeinek listája. LIVE változatlan.

## 2026-11-01 – TEST Player bootstrap dátumvédelmi javítás telepítve

A TEST Supabase `cc_player_bootstrap()` aktuális SQL forrását kiolvastuk, majd kizárólag a csapattagság kiválasztási feltételét módosítottuk: `and (tm.starts_on is null or tm.starts_on <= current_date)` került az aktív csapattagság keresésébe. A meglévő lejáratvizsgálat és a többi bootstrap-logika változatlan maradt. Migration: `cc_test_player_bootstrap_membership_start_guard_20261101`, Supabase apply_migration success=true. Utóellenőrzés közvetlen pg_get_functiondef olvasásból: starts_on_guard=true, ends_on_guard=true. Korábbi szintetikus logikai teszt kétszer sikeres volt. **Még hátravan hitelesített Player end-to-end regresszió, valamint a több egyidejű aktív csapat támogatása**, mert a `LIMIT 1` változatlan. A jelenlegi TEST adatok alapján 0 érintett jövőbeli és 0 többes aktív tagság volt, ezért mostani adatváltozás nem várható, de még nem bizonyított az app-oldali teszt. LIVE nem módosult.

## 2026-11-01 – Többcsapatos Player eseményláthatóság read-only QA

TEST DB read-only állapot: 3 csapat, 12 esemény (11 `active`), 21 csapattagsági sor. A korábban mért tényleges többes aktív tagságú játékos 0. A `cc_player_bootstrap()` továbbra is egyetlen csapatot választ `LIMIT 1` alapján: az eltérő jogosult csapatok eseményeinek elhagyása elvi kockázat. Készítettünk egy új, szintetikus, READ ONLY / ROLLBACK tesztet: `tests/sql/CC_TEST_PLAYER_MULTI_TEAM_EVENT_VISIBILITY_20261101.sql`, commit `a6c867bd8e7574c5183954f362cf9954d90d3d64`. GitHub visszaolvasás egyezik; a SQL kétszer futott a TEST adatbázisban, hiba nélkül. A kétcsapatos fixturesorokon igazolja: mindkét csapat eseményeit számolva kettő van, egyetlen csapat szűrésével egy. Ez NEM teljes Player-authenticated E2E, és még nem történt többcsapatos bootstrap patch. A korábbi kezdődátum-javítás TEST-ben megmaradt. Következő döntés: Player egyesített többcsapatos lista vagy választható csapatszűrő, a kompatibilis API-formátum megőrzésével. Új infrastruktúra nincs, LIVE érintetlen.

## 2026-11-01 – Újraépítés előtti hátralévő munkák: prioritási döntés

A korábbi eredmények és a handover összesítése alapján a DB alap nagy része megvan, de nincs még általános készre jelentés. **P0 kapuk**: (1) hitelesített, izolált foglalás és RSVP write→read→audit E2E, (2) jogosultsági negatív próbák és párhuzamos szerkesztés/idempotencia, (3) bérlet/fizetés kanonikus adatmodell és megőrzési audit, (4) import és saját események közötti kapcsolatok és duplikáció/ütközés ellenőrzése. **P1, részben párhuzamosítható**: többcsapatos Player és csapatválasztás UI, naptár/ICS, értesítés, statisztika API-kontraktus, 11 pontos modul QA. A már sikeres RLS-bekapcsolás, manager/player API-k, audit-struktúrák és TEST bootstrap kezdődátum-javítás megőrzendő.

**Irány:** ne kezdjünk újra mindent és ne vezessünk be plusz Cloudflare mass gateway-t. Ne ragadjunk végtelen preflightokba: a következő körök a P0 kapuk tényleges működési bizonyítékaira és a modulonkénti újraírás elindíthatóságára összpontosítsanak. LIVE csak külön felhatalmazással. Ebben a körben csak handover prioritási összegzés történt.

## 2026-11-01 – P0 pénzügyi adatmodell audit (TEST, csak olvasás)

Ellenőriztük a pénzügyi alapokat: `player_fees` (id, player_id text, player_email, season/period_key/fee_type, amount_huf, status, paid_at, source/ref, note, created_at/updated_at, archived_at), `mass_passes` (source_workbook_id/pass_number, product/pass_group/email/purchase_date/valid_month/season, import source row/raw_row), `cc_player_fee_meta_v2382` (kézi status/amount/payment_method/override_active/updated_by/paid_at/paid_to), `cc_player_fee_audit_v2382` (old_state, new_state, action, actor_email, created_at). Van `cc_manager_mass_passes_v1(p_query text,p_month text)` olvasó RPC, amely a mass_passes táblát használja. A közvetlen public függvénykatalógus `fee/pass/payment` névszűrése csupán `cc_fee_month_key`, `cc_manager_mass_passes_v1` és `cc_mass_b43b_norm_pass_v0550b43b` függvényeket adta; emiatt a pénzügyi írás útja még NEM bizonyított (más nevű függvény/edge/legacy útvonal is lehet).

A fő pénzügyi TEST táblák aktuális adatszáma `player_fees=0`, `mass_passes=0`, így az integritást és import-konfliktust csak célzott tesztadattal lehet vizsgálni. `player_fees`: PK + 4 CHECK, idegenkulcs nem látható; `mass_passes` és `cc_player_fee_audit_v2382`: PK, külön FK nincs. A négy vizsgált táblán (`player_fees`, `mass_passes`, `cc_player_fee_meta_v2382`, `cc_player_fee_audit_v2382`) a közvetlen grants listája `service_role`-t mutatott, `anon`/`authenticated` grant nélkül; ez csak egy része a teljes security modellnek.

**P0 következő teendők:** pénzügyi API írási útvonal feltérképezése a kódban és DB-ben; a kanonikus pénzügyi rekord és override/meta közötti előbbségi szabály rögzítése (kézi admin-változás importtal ne vesszen el); számszerű, historizált old/new audit és változás szereplője; duplikáció/idempotens import és versenysport játékosazonosító összerendelése; visszagörgethető, valós jogosultsággal végzett read-after-write teszt. Ne módosítsunk pénzügyi táblát vagy értéket audit/paritás bizonyítás nélkül. Csak TEST read-only audit történt; LIVE nem érintett, külön Cloudflare mass gateway továbbra is félretéve.

## 2026-11-01 – Pénzügyi függvénylánc teljes public/private katalógusellenőrzés és aktuális státusz

TEST Supabase `pg_proc` SQL-forrásszövegek `prokind='f'` szűréssel vizsgálva, `player_fees`, `cc_player_fee_meta_v2382` és `mass_passes` táblahivatkozások után keresve. Pontosan a következők szerepeltek: private.`cc_test_bind_existing_auth_v1`, public.`cc_manager_mass_athletes_v1`, public.`cc_manager_mass_passes_v1`, public.`cc_player_profile_data`. Nincs ebben a körben igazolt, dedikált public/private pénzügyi Manager-író RPC. Ez **nem zárja ki** az alkalmazáskódból, Edge Functionből, API-n vagy más nevű SQL dinamikus útvonalon történő írást. Az első aggregátumfüggvényeket is érintő katalóguskeresés hibázott; javított, `prokind='f'` SQL másodszorra sikeres.

**Kritikus feladat:** Manager TEST GitHub kódban és bármely kapcsolódó API-ban megtalálni a jelenlegi fee/pass fizetésmentést, az adatforrás elsőbbséget és az auditot. Ne hozzunk létre párhuzamos pénzügyi írót, amíg a működő útvonal ismeretlen. DB fő alapjai készek, de pénzügyi write contract, hitelesített írás–olvasás E2E, negatív auth, import ütközési szabály, konkurencia QA még blokkolja a teljes DB-ready minősítést. A modulok megtervezése/újraírásának nem kritikus olvasó részei párhuzamosan indíthatók, de LIVE csak jóváhagyással, Cloudflare mass gateway továbbra is félretéve.

## 2026-11-01 – Pénzügyi feltérképezés két lépésben (TEST)

1. A GitHub `search` a default-branch indexben `cc_player_fee_meta_v2382`, `player_fees`, `mass_passes`, `payment_method` keresésekre nem adott találatot. A TEST-ágon megpróbált szokásos `package.json`, `src/App.jsx`, `src/App.tsx`, `README.md` fájlok sem léteznek ezeken az útvonalakon. **Ebből nem következik, hogy nincs pénzügyi mentés**: a kereső nem indexeli feltétlenül a TEST ágat, és az alkalmazás eltérő repo/fájlstruktúrájú lehet. Tényleges Manager kódútvonal továbbra is feltárandó.
2. Közvetlen, csak olvasó TEST DB szerkezeti ellenőrzés: `player_fees`, `mass_passes`, `cc_player_fee_meta_v2382`, `cc_player_fee_audit_v2382` táblákon a `pg_constraint` szerint **nincs külön UNIQUE constraint** és **nincs aktív saját trigger**. Mindegyiknél lehet PK, külön UNIQUE index is lehetséges (ezt most nem vizsgáltuk). A korábbi audit/meta oszlopok megléte önmagában nem bizonyítja a tényleges változásnaplózást, az import idempotenciáját vagy a módosítások védelmét.

**További konkrét lépések:** (a) pénzügyi write útvonal visszakeresése a megfelelő alkalmazás-repo/branch szerkezetében, (b) `pg_indexes` és egyedi kulcsok ellenőrzése, (c) visszagörgethető import/override/audit teszt hitelesített TEST kontextusban. Sem TEST adatot, sem LIVE-ot nem módosítottunk, Worker továbbra is félretéve.
