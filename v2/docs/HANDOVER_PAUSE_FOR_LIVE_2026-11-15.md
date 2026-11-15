# CLUB CONTROL V2 – PAUSE / HANDOVER BEFORE LIVE WORK

**Dátum:** 2026-11-15 (Europe/Budapest)  
**Státusz:** V2 fejlesztés szünetel a külön LIVE-feladatok idejére.  
**Repo:** `beacvolleyCC/club-control-manager`  
**V2 ág:** `v2/architecture-foundation-20261107`  
**Draft PR:** [#89](https://github.com/beacvolleyCC/club-control-manager/pull/89) (nem merge-elt)  
**Utolsó ellenőrzött V2 HEAD:** `b2623313ef23e2e3af0f7438107abbf28e3f1e38`  
**V2 TEST Supabase:** `szzoubvhlwnojtzqjebc`  
**LIVE Supabase:** `snqsxlyhontaepembaic` – V2 munkával NEM módosítottuk.

## 1. Mi készült el a V2 TEST-en?

- Közös Manager/Player adatmodell és meglévő tömegsportos adattáblák: `mass_events`, `mass_athletes`, `mass_bookings`, `mass_waitlist`, `mass_passes`; V2 regiszterek, kapcsolatok, jogosultsági alapok. **A TEST nem teljes, friss LIVE másolat.**
- Egységes, személyes adatoktól megtisztított publikus tömegsportos menetrend-API: `cc_v2_mass_public_schedule_v1`.
- Ugyanaz a menetrend és önkiszolgáló jelentkezési komponens a V2 `frontend-next/mass/` webes nézetben és `frontend-next/player/` Playerben.
- Supabase Auth e-mail OTP kliens; igazolt e-mailhez kötött tömegsportos profil, explicit `cc_v2_mass_verified_account_links_v1` kapcsolat. Nem történik automatikus személyösszekötés név alapján.
- Saját jelentkezések/bérletállapotok/várólista lekérdezése; saját jelentkezés, várólista, lemondás új, JWT-vel védett önkiszolgáló végpontokon, a meglévő tranzakciós tömegsportos foglalási motorra építve.
- Első edzés, szint, szankció, kapacitás és várólista elsőbbsége a meglévő szabályokra építve; az új végpontok **csak `CC-QA-SYNTHETIC` adatkörben írhatnak**.
- Managerben a bérletértékesítési státusz és a türelmi idő szabályozásának alapja, szerveroldali `mass.passes view/edit` engedéllyel és auditnaplóval. Hiányzó szerkesztési jogosultságnál a szerkesztő kezelőszerv elrejtve.
- Fontos friss javítás: ha a BEAC-import késik, a játékos „megvásároltam” jelölése **önmagában nem jogosít foglalásra**. Csak explicit, Manager által auditált, max. 7 napos import-türelmi idő mellett engedhető feltételes foglalás; a foglalás/várólista `pass_status='ELLENŐRZÉSRE VÁR'` jelzést kap, nem lesz automatikusan fizetettnek jelölve. A „bérletvásárlás még nem elérhető” külön állapot.
- Központi HU/EN lokalizáció: legutóbbi számlálás **681 kulcs**, ebből **96 publikált EN**, a korábbi nagy Player EN import jelentős része továbbra is piszkozat. Új tömegsportos felületek a központi fordítási motort használják.

## 2. Mi van ténylegesen ellenőrizve?

- Utolsó V2 HEAD-hez tartozó [QA futás](https://github.com/beacvolleyCC/club-control-manager/actions/runs/43711937264): **success** (typecheck, tesztek, build).
- TEST Supabase SQL: igazolt felhasználó szimulálása mellett saját adatok olvasása → első edzés foglalása → lemondása, valamint várólista → lemondás; a tranzakciókat **ROLLBACK** zárta.
- Feltételes bérletfoglalási negatív teszt: Manager-import-türelmi idő nélkül elutasítva.
- Feltételes bérletfoglalási pozitív teszt: explicit Manager-türelmi idővel működött; a közös foglalási rekord `ELLENŐRZÉSRE VÁR` státuszt kapott; ROLLBACK.
- Az ellenőrzések végén a TEST-ben maradt eredeti 1 foglalás és 7 várólista-bejegyzés; új valódi regisztrált tömegsportos fiókkapcsolat és aktív türelmiidő-szabály nem maradt.
- A LIVE adatbázishoz V2 migrációt/írást nem alkalmaztunk.

## 3. Nem kész / tudatosan blokkolt

1. **Cloudflare V2 TEST Pages deploy nincs kész.** Utolsó futás [deploy failure](https://github.com/beacvolleyCC/club-control-manager/actions/runs/43711937278): `Require isolated Cloudflare deployment credentials`. A `v2-test-preview` GitHub környezetben hiányzik/üres a `V2_CLOUDFLARE_API_TOKEN` és/vagy `V2_CLOUDFLARE_ACCOUNT_ID`. Ezeket csak a felhasználó adhatja meg a fiókfelületen. V2 elkülönített Pages projekt neve `club-control-v2-test-preview`.
2. **Valódi böngészős, telefonos és OTP e-mail E2E nem történt meg.** TEST Supabase Authentication Email Templates: hatjegyű kódos `{{ .Token }}`, e-mail provider, SMTP/korlátok és engedélyezett redirect/origin ellenőrzendő.
3. **BEAC külső bérletvásárlási rendszerhez való közvetlen API-/fizetési integráció nincs.** A jelenlegi ellenőrzés a meglévő `mass_passes` importokra épül, és nem helyettesíti a valódi vásárlást.
4. **LIVE→TEST teljes, személyes adatokat tartalmazó rekordmásolás/migráció nincs elvégezve.** Az éles tömegsportos sportolók, bérletek és jelentkezések nagy része nem szerepel TEST-ben. Tesztadatok fiktívek.
5. Két valódi fiókos jogosultsági negatív teszt, egyidejű utolsó férőhely, teljes SPORT7/első edzés, automatikus értesítések, várólista felajánlási e-mail és mobilos működés még végellenőrzendő. Supabase security advisor figyelmeztetések felülvizsgálata szükséges.
6. V2 frontend még nem teljesen befejezett Manager/Player; szélesebb körű HU/EN fordítási integráció és 585 piszkozat feldolgozása hátravan.
7. A PR #89 marad **draft**, LIVE bevezetés és automatikus merge **tilos külön felhatalmazás nélkül**.

## 4. Közben LIVE-feladatok következnek – izolációs szabályok

- A felhasználó most kifejezetten **LIVE hibákat/funkciókat** akar javítani. Ezeket az **aktuális LIVE ágon és éles környezeten** külön kell felmérni, elkészíteni, tesztelni és csak a konkrét feladatra kapott engedély alapján bevezetni.
- **Ne merge-eld a V2 draft PR #89-et mainbe**, és ne telepíts V2 migrációt vagy szintetikus TEST sportolót/edzést/bérletet LIVE-ba.
- LIVE javításnál ne írjuk felül a V2 branch-en már fejlesztett, de nem végtesztelt kódot. A V2 fejlesztés későbbi folytatásakor összehasonlítás és szükség esetén szándékos cherry-pick/rebase előzze meg az integrációt.
- Minden LIVE módosítás előtt ellenőrizni kell az aktuális LIVE branch-et, állapotot és a célzott feladatot; utána független visszaellenőrzés. A korábbi „LIVE-hoz nem nyúltunk” kijelentés **a V2 munkára** vonatkozott, nem általános korlát a most kérendő LIVE-javításokra.

## 5. Folytatási útvonal

A V2-re visszatérve induljunk a legfrissebb PR HEAD és dokumentáció áttekintésével, majd:
1. V2 TEST Cloudflare creds és elkülönített Pages project beállításának ellenőrzése.
2. Valódi OTP e-mail + web/Player ugyanazon QA accounttal + mobil PWA E2E.
3. Két account és konkurens foglalások, szankciók, bérlet/késői import kontroll, jogosultsági/security regression.
4. Adatátvétel és bérletvásárlási kapcsolatok külön, jóváhagyott terv szerint.
5. Lokalizációs piszkozatok és Manager/Player teljes integrációja, majd kizárólag később, külön döntéssel LIVE rollout.

## Kapcsolódó dokumentumok

- `v2/docs/MASS_V2_SELF_SERVICE_HANDOVER_20261115.md`
- `v2/docs/V2_TEST_RELEASE_CHECKLIST_20261115.md`
- `v2/docs/MASS_V2_IMPLEMENTATION_20261114.md`
- `v2/docs/MASS_PLAYER_WEB_PASS_FLOW_20261112.md`

**Ez a fájl kizárólag handover, nem módosít adatbázist, jogosultságot vagy LIVE-felületet.**
