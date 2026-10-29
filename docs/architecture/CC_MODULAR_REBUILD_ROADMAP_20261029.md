# Club Control – Egységes adatbázis és modulonkénti újraépítés
**Állapotfelmérés: 2026-10-29 | kizárólag TEST**

## Vezérelv / elfogadott fejlesztési irány
1. Előbb egy konzisztens, jogosultságvédett, dokumentált TEST Supabase adatmodell és szerver-API.
2. A Manager + Player külön TEST HTTPS PWA-n, ugyanarra a TEST DB-re kötve; eszközös login, esemény, RSVP, visszaolvasás és offline QA.
3. Ezután **modulonként újraépítjük** az alkalmazást: az új modul teljes adatkontraktust, jogosultságot, Manager/Player képernyőt és regressziós tesztet kap.
4. A meglévő LIVE változat szolgál működő referenciaként; nem írunk sem a LIVE DB-be, sem a main ágakra engedély nélkül. A korábbi monolit UI változtatásait nem emeljük át automatikusan.
5. A tesztforrás alap configja DEMO; a build állítja elő a külön TEST Supabase-re csatlakozó STAGING csomagot. Külön HTTPS Cloudflare Pages TEST publikálás és valódi iPhone QA nincs.

## Ellenőrzött TEST pillanatkép
- 21 telepített migráció, 52 public + 5 private tábla, 92 public/private rutin (összesített mérés).
- 3 csapat, 19 játékos, 21 csapattagság, 11 esemény, 66 RSVP, 1 Manager, 14 Manager moduljogosultság.
- 9 forrásmeccs, 12 tabellasor, 6 in-app értesítés, 0 push-outbox sor.
- A Manager TEST `app.js` 71 különböző `cc_manager_*` API-nevet tartalmaz; ezek közül 8 van a TEST public RPC-k között, 63 nincs.
- A Player TEST `app.js` 24 különböző `cc_player_*` API-nevet tartalmaz; 16 van a TEST public RPC-k között, 8 nincs.
- **Ezek forráskódban szereplő nevek**, köztük legacy és fallback ágak. Nem jelentik azt, hogy az összes hiányzó API-t változtatás nélkül meg kell építeni. Modulonként döntünk a megtartásról, összevonásról, törlésről.
- Leltár: `docs/architecture/CC_TEST_API_CONTRACT_INVENTORY_20261029.json`.
- A leltár CI-tesztje statikus, nem Supabase-auth végpontteszt. A TEST jelenlegi adatai elsősorban szintetikusak, teljes LIVE névsor import nincs.

## Közös architektúra szabályai
- **Egy TEST adatbázis, két kliens**, közös domain-modellel, azonos azonosítókkal, eltérő szerepkörrel.
- Preferált jól meghatározott írási RPC / szerver-szerződés; semmilyen széles táblaszintű jogosultság a hiányzó kliensműveletek „javítására”.
- Csapattagság: aktív játékos + aktív csapat + aktív tagság + kezdődátum és lejárat; Manager külön modul- és csapatspecifikus engedélyek.
- Minden adat, meccs, liga, tabella: explicit csapat és szezon/bajnokság kontextus. Női BB1, női BB2/B, férfi A, férfi B nem keverhető.
- Az új modul nem nyúlhat váratlanul másik modul adataihoz; tranzakció, audit, idempotencia ahol szükséges.
- A statikus build ne tegyen közzé privát sportolói adatokat, jelszót, secret/service_role kulcsot. A push, SMTP és fizetés TEST-ben ne küldjön kifelé.
- Az UI a felhasználóval modulonként kerül újratervezésre. A pontozás/pályarajz nagyobb módosítása csak a későbbi UI/UX-vázlat után.
- Költségkeret: 0 Ft, no paid service activation.

## 0. Fázis – a teljes DB és TEST felület release-gate (jelenlegi fázis)
| Gate | Állapot | Befejezés feltétele |
| --- | --- | --- |
| Táblák és alap migrációk | Részben kész | Egységes mezők, kulcsok, relációk, modul ownership és adatkontraktus auditálva |
| Auth és tagság RLS | **BLOKKOLÓ** | Manager #81: future-start, ended, inactive, cross-team és anon negatív PostgreSQL tesztek |
| Manager API lefedettség | **Hiányos** | Modulonként olvasó/író RPC és jogosultsági szerződés, a felesleges legacy hívások kiiktatása |
| Player API lefedettség | Részleges | 8 hiányzó forrásnév: szükséges vagy legacy? döntés, tesztek |
| RSVP mentés | Statikus Node QA kész | Player #31: valódi TEST Auth + backend save/reload/denial/iPhone |
| TEST PWA elkülönítés | Statikus QA kész | Külön HTTPS URL és iOS Safari telepítés/logout/offline teszt, asztali publikálás később |
| Tömegsport adatfeltöltés | Nem teljes | Szint-/edzés-/bérlet-/várólista konzisztencia, ellenőrzött szintetikus E2E |
| Versenysport hivatalos adat | Nem teljes | Canonical MRSZ/BRSZ adatok, jegyzőkönyv/táblázat és ligakontekstus ellenőrzése |
| Pénzügy, értesítés | Részleges | Beállítás/olvasás/írás, kimenő küldés/pénzmozgás nélkül |

**Nem tekinthető késznek**, amíg a blockers és valódi E2E tesztek hiányoznak.

## 1. Fázis – javasolt modulonkénti újraépítési sorrend
| Sorrend | Modul | Közös backend és funkció | Manager / Player cél |
| --- | --- | --- | --- |
| 1 | Azonosítás, jogosultság, alapnavigáció | Auth, team membership, szerepkör, biztonságos profile mapping, TEST PWA isolation | Login, csapatválasztó, jogosultságvezérelt menü, logout |
| 2 | Csapatok, sportolók, keretek | players/teams/memberships, posztok, mezszám, érvényesség, sportorvosi | Csapatkezelés és keret; saját profil/csapattársak |
| 3 | Naptár, terem, események | training/match/event series, courts, status, postpone, timezone, edit audit | Heti Manager naptár; Player menetrend/ICS |
| 4 | Jelentkezés és jelenlét | availability, status/note, coach attendance, late cancel, waiting list, RSVP races | Manager mátrix; Player Jövök/Nem jövök/semleges |
| 5 | Tömegsport, SPORT7, bérletek | mass athletes/bookings/waitlist/pass validity, trial fairness | Admin jelentkezés, fizetési jelzés; egyszerű Player jelentkezés |
| 6 | Versenysport meccsek és bajnokság | csapat/osztály/szezon, match identity, eredmény, halasztás, hivatalos forrás | Meccsszerkesztés; csapatmenetrend és tabella |
| 7 | Jegyzőkönyv, statisztika és történet | official protocol, roster ID links, liga/team stats, previous seasons | Manager import/ellenőrzés; Player statisztika |
| 8 | Pénzügyek és tagsági nyilvántartás | auditált befizetés, BEAC backoffice/export, jogosultságok | Manager pénzügyi nézet; Player saját státusz, online díjbeszedés nélkül |
| 9 | Értesítések, push, naptárintegráció | in-app outbox, quiet/push flags, ICS token, idempotent scheduler | Manager tájékoztatás; Player push/in-app/ICS |
| 10 | Beállítások, import, dokumentumok, audit | domain jogosultságok, import staging, audit trail, backup | Teljes adminisztráció és dokumentumbevitel |
| később | Edzői gyakorlatok + pont-timeline | drill/timer, felállások, score timeline; külön részletes specifikáció | Edzői és meccs közbeni speciális UI |

**Minden modul ugyanazzal a módszerrel készül:**
1. Adatszerkezet és domain ownership elfogadás.
2. Stabil, verziózott read/write API szerződés + szigorú RLS.
3. Szintetikus pozitív/negatív integrációs teszt a TEST adatbázison.
4. Közös, új UI/UX szerkezet, Manager és Player kliensek.
5. Migráció/kompatibilitás a régi felülettel; nem feltétlenül egy az egyben régi RPC átvitel.
6. Automatikus tesztek 2× + 11 pontos QA + iOS eszközteszt a TEST URL-en.
7. Modul kész csak akkor, ha semmi mást nem tör, és csak külön kifejezett döntéssel mehet LIVE felé.

## 2. Fázis – teljesen új UI és fokozatos csere
- Nem egyszerre bontjuk le a régi felületet. Új `vNext` modulok készülnek a TEST ágban.
- A közös backend-szerződés a modul újraírása után is stabil marad.
- Közös navigációs, állapot-, hiba-, loading-, nyelv-, offline-, accessibility minták.
- Első UX design modul: Login/szerepkör/csapat, utána keret és naptár.
- Képernyőnként átadás a következőnek; a teljes rendszert csak a modulok és integrációk elfogadása után lehet cserélni.

## Következő konkrét fejlesztési kör
1. Manager #81 integrációs RLS ellenőrzés és szűk TEST-only korrekció biztonsági kontrollok szerint.
2. API-leltárból kinyerni a valóban használt 63/8 legacy hiányt, azonosítani az újraelnevezhető/összevonható szerződéseket.
3. Manager író műveletek domain-sorrendje (csapat/keret/edzés/RSVP), nincs széles közvetlen SQL grants.
4. Player 31 működő TEST Auth+RSVP végteszt csak HTTPS publikálás után.
5. Cloudflare telepítési lépések csak asztali alkalommal; addig GitHub CI és read-only TEST vizsgálat.

## Biztonsági szabály
A jelenlegi TEST adatbázisban a `private.current_team_ids()` és `private.player_in_my_team(uuid)` hibája még valós. A `docs/security/TEST_RLS_MEMBERSHIP_DATE_CANDIDATE_DO_NOT_APPLY_20261028.sql` csak review terv, nem telepített migráció. Semmilyen adathozzáférési blokkolást nem kerülünk meg, és LIVE rendszert nem módosítunk.
