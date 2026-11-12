# Club Control V2 – közös tömegsport web / Player jelentkezés és bérletkezelés

**Állapot:** architekturális terv (nincs telepítve, nincs író RPC megnyitva)
**Dátum:** 2026-11-12
**Repo/branch:** `beacvolleyCC/club-control-manager` / `v2/architecture-foundation-20261107`, draft PR #89
**Környezet:** csak TEST; LIVE módosításhoz külön engedély kell.

## 1. Termékdöntés – egy közös foglalási rendszer

Egy közös **Club Control Player PWA**, amelynek sportolói jogosultság szerint lehetnek tömegsportos, versenyző és mindkettő. Az anonim/alkalmi weboldali jelentkezés is ugyanazt a **tömegsportos foglalási adatforrást és tranzakciós API-t** használja, mint az alkalmazás.

- Webes belépő: nyilvános edzésmenetrend; jelentkezés e-mail-ellenőrzéssel, teljes Player-fiók nélkül is (későbbi fiókhoz kapcsolható).
- Player mód: hitelesített tömegsportos számára ugyanaz az edzéslista, férőhelyek, jelentkezések, várólista, bérletállapot és lemondás. Versenyzőnek külön csapat/verseny nézet; kombinált profilnál mindkettő.
- Manager: ugyanennek az adatmodellnek szerkesztési, jóváhagyási, adminisztrációs és auditált nézete.
- **Nem** építünk két külön booking-rendszert, két független kapacitásszámlálást vagy különálló webes és mobilos bérletnyilvántartást.

## 2. A két, külön kezelendő bérletprobléma

**A – Vásárlás még nem lehetséges.** A BEAC saját bérletvásárlási felületén az új hónap/termék még nincs megnyitva. Ez nem importkésés. A Club Control nem jelölheti kifizetettnek és nem állíthat ki bérletet olyan fizetésre, amely nem történt meg. A felületen: 'A bérletvásárlás még nem elérhető' + tervezett, korlátozott **feltételes jelentkezés** csak engedélyezett időszakban. Ha később BEAC hivatalos fizetési link/integráció megnyílik, azt megjelenítheti.

**B – Már megvette, de az import késik.** A vásárlás megtörtént, de az import stale/unknown. A foglalás megőrizhető `pending_import` ellenőrzési állapotban, és manuális Manager-ellenőrzés lehetséges naplózással; a fizetés sosem lesz automatikusan 'verified' csak a felhasználó állítása alapján.

A helyfoglalás állapota (`confirmed`/`waitlisted`/`cancelled`) és a bérletellenőrzés állapota (`verified`/`pending_import`/`sales_unavailable_grace`/`missing`/`rejected`/`exempt`) **külön mező/saját domain** legyen. Mindkettő csak szerver által dönthető el.

### Javasolt feltételes jelentkezési szabály (még jóváhagyandó)

- A Manager hónap/sportág szerint kapcsolhat be **értékesítési türelmi időszakot**, indokkal, határidővel és auditnaplóval. Alapértelmezésben OFF; nem mindenki számára globális bérletmentesség.
- A rendszer befogadhat foglalást 'bérletellenőrzésre vár' státusszal az engedélyezett időablakban, de a foglalt helyet **beleszámítja a kapacitásba** és a várólista elsőbbségét megtartja.
- A sportoló látja, meddig kell bérletet vásárolnia / mikorra várható az ellenőrzés; értesítést kap, ha megnyílt a vásárlás vagy a foglalást veszélyezteti a hiányzó bérlet.
- A türelmi idő lejárta után nincs csendes automatikus törlés: előbb értesítés és ellenőrzési feladat. Automatizált visszavonás csak elfogadott klubszabály és E2E-teszt után.
- `Első edzés` egyszeri jogosultság, SPORT7 egy e-mail → egy alkalom, szintellenőrzés, lemondási határidők, no-show/szankció és várólista-lejárat változatlanul érvényes.
- A vásárlási felület tényleges 'nyitva/nem elérhető' állapotát **ne** a `mass_passes` import frissességéből találjuk ki: külön, hiteles forrás vagy Manager-állapot szükséges.

## 3. Meglévő TEST alapok (2026-11-12 read-only audit)

Meglévő adatforrások: `public.mass_events`, `mass_athletes`, `mass_bookings`, `mass_waitlist`, `mass_passes`.

Meglévő belső tranzakciós funkciók:
- `cc_vnext_mass_public_book_v1`, `cc_vnext_mass_public_wait_v1`, `cc_vnext_mass_public_cancel_v1`, `cc_vnext_mass_public_decide_v1`
- `cc_vnext_mass_email_start_v1` / `cc_vnext_mass_email_verify_v1`
- `cc_vnext_mass_capacity_v1`; Manager `cc_manager_mass_weekly_pass_matches_v1`.

**Biztonsági korlát:** a nyilvános write/OTP funkciókhoz jelenleg sem `anon`, sem `authenticated` role nem kapott közvetlen EXECUTE jogot. Ez helyes: a web/PWA számára külön **ellenőrzött backend gateway** kell a hívásokhoz (e-mail hitelesítés, rate-limit, server-only azonosítás, jogosultság, auditrail, idempotencia; soha ne service_role token a böngészőben). A TEST public booking függvények `mailQueued:false` értéket adnak vissza – e-mail kiküldésre nincs bizonyított E2E.

**Adatkorlát:** a TEST-en a mostani read-only ellenőrzés szerint `mass_athletes=0`, `mass_passes=0`, `upcoming_events=3`, a bérletimport ideje `NULL`. Ezekből életszerű fizetési ellenőrzés nem tesztelhető; a következő lépés *anonimizált fixture-ek és összetett negatív tesztek* (nem LIVE adatok véletlen másolása).

A jelenlegi új V2 Player frontend `v2/frontend-next/player/main.js` **versenycsapatoknak szánt, csak olvasható** bootstrapot használ; tömegsportos auth + self-service még nincs rákötve.

## 4. Egy adatforrás, egy API

Ajánlott szeletek:

1. `mass.schedule`: publikus edzéslista, saját szint szerinti szűrés, kapacitás, zárási határidők, valós várólista-kínálat.
2. `mass.identity`: e-mail OTP / fiókregisztráció, igazolt e-mailhez tartozó sportolóazonosság; előzményhez csak hitelesített felhasználó férhet hozzá. A versenyzői player UUID és a régi `mass_athletes.id text` közé **explicit ellenőrzött kapcsolótábla** kell, nem megbízhatatlan email-összekeverés.
3. `mass.bookings`: foglalás, lemondás, várólista/felajánlás idempotens, szerveroldali tranzakcióban érvényesített szabályokkal. A böngészős és Player kliens **ugyanazt az API-t** hívja.
4. `mass.passEntitlement`: hivatalos BEAC import + auditált admin jóváhagyás + értékesítés/türelmi időszak státusza. Nyers vásárlási bizonyíték és ellenőrzött jogcím elkülönítve.
5. `mass.notifications`: kód, foglalás/várólista megerősítés, bérletimport várakozás, vásárlás megnyitása, türelmi idő vége.
6. `i18n`: a már létező TEST központi HU/EN fordítórendszerből minden címke/hiba/státusz.

A weboldal és a Player ugyanazon PWA-reszponzív komponenseket is megoszthatja: vendég belépő vagy bejelentkezett nézet csupán állapot/szerepkör különbség.

## 5. Implementációs prioritás

**I. Következő kör:** TEST domain- és API-szerződés, regisztrációs/fizetési állapotgép, új `sale availability` + entitlement séma terve, anonimizált tesztadatok, jogosultsági és konkurrens foglalási tesztek. Nincs LIVE és nincs író API-nak publikus GRANT.

**II. Kör:** egy közös, hitelesített read-only tömegsportos eseménylista Playerben és a nyilvános webes felületben. Az OTP/kijelentkezés/anonim→profil átmenet ellenőrzése.

**III. Kör:** trusted gateway és közös foglalási/lemondási műveletek, egy foglalás egyszer számítódjon a kapacitásba; várólista elsőbbség, rate-limit, e-mailes visszaigazolás.

**IV. Kör:** Manager „vásárlás nem elérhető” / „import késik” vezérlő, feltételes foglalások feladatai, késedelmi értesítések és audit. Végül pass vásárlási link vagy jóváhagyott fizetési integráció, ha BEAC felület támogatja.

**V. Kör:** teljes magyar/angol lokalizáció és mobil E2E, automatikus deploy unblock a külön V2 TEST Cloudflare Pages projekthez, majd pilot és külön engedéllyel későbbi LIVE rollout.

## 6. Kötelező tesztmátrix

- Nincs elérhető bérletvásárlás; nincs még fizetés → csak Manager által engedélyezett feltételes jelentkezés.
- Bérlet megvéve és import friss → verified.
- Megvéve, import késik → pending_import; igazolhatóan rendezett eset ne essen ki.
- Bérlet nincs/lejárt; ismétlődő e-mail/foglalás; másik profil jogosulatlan adatlekérése.
- Egyszeri első edzés / SPORT7 egy e-mail egy alkalom / csapatok, szintek és kategóriák elkülönítése.
- 2 párhuzamos utolsó hely foglalás; kapacitás pontos, várólista előnyben; ajánlat lejárat/lehetséges újra-felajánlás.
- Ugyanazon felhasználó azonos foglalását weben és appban is lássa, a lemondás mindkettőn egyszerre megjelenjen.
- Az admin felkiáltójel figyelmeztetés az **edzés részletes névsorában** legyen; a zárt/összecsukott kártyán NE legyen bérletszám vagy BEAC vásárlási adat. A bérletszám és dátum csak a részletes listában kezelendő.

## 7. Tisztázandó döntések implementálás előtt

- Értékesítési türelmi időszak automatikus vagy kizárólag Managerrel engedélyezhető? Javaslat: Manager-engedély, időben korlátozott.
- Meddig tartható fenn hely bérlet nélkül, és milyen értesítés szükséges? Javaslat: szabályként konfigurálható, nem beégetett napmennyiség.
- A BEAC megnyitható bérletvásárlási linket és/vagy hiteles API-t tud-e adni? Ha nem, CC nem állítja, hogy itt vették meg a bérletet.
- A weboldalon maradjon vendég e-mailes jelentkezés, de később önkéntes Player-fiókhoz kapcsolható? Javaslat: igen.

**Visszaállítás:** ez a dokumentum önmagában nem változtat adatbázist vagy működő felületet. A következő implementációk kizárólag TEST-en, auditált migrációkkal, jogosultsági és E2E kapuk után.
