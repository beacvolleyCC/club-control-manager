# Tömegsport – bérletellenőrzés és jelentkezési zárás (2026-10-10)

Állapot: implementációs specifikáció, **nem élesítve**. Az éles adatokhoz nem nyúltunk.

## Kötelező szabályok

1. Új edzésjelentkezést és várólistára feliratkozást az esemény kezdete előtt **120 perccel** lezárunk. A határidő az `Europe/Budapest` időzóna szerint számított eseménykezdésből ered. A korlátot az adatbázis/rpc és az UI is érvényesíti. Az adminisztrátori kivétel külön, auditált művelet, nem implicit feloldás.
2. Ismeretlen vagy még nem ellenőrzött bérletszám esetén a jelentkezés létrejöhet, ha minden egyéb feltétel teljesül. `ELLENŐRZÉSRE VÁR` státusz, időbélyeg, bérletszám és ellenőrzési indok tárolandó. A `PASS_NOT_FOUND` akkor se jelentsen automatikus törlést, ha a BEAC import friss; az ismeretlen és bizonyítottan érvénytelen külön kategória.
3. Ellenőrzött, bizonyítottan érvénytelen bérletet a rendszer külön `ÉRVÉNYTELEN` státusszal jelöli; nem keverjük az ismeretlennel. Felhasználói üzenet és manager döntési felület szükséges.
4. Edzés előtt 6 órával a Manager/edző értesítést kap az adott alkalomhoz tartozó `ELLENŐRZÉSRE VÁR` foglalások számáról; eseményhez deep linkkel. A deduplikáció eseményenként és figyelmeztetési ablakonként szükséges. Ha nincs intézkedés, a jelentkezés **megmarad**.
5. Managernél: bérlet érvényes / érvénytelen / ellenőrzés később; indok naplózása. A bérlet érvénytelennek minősítése önmagában nem töröl jelentkezést. A törlésre és e-mailre **külön megerősítés** szükséges; e-mail státusz és küldési hiba megőrzése, duplikált küldés tiltása.
6. Játékosnak jelentkezéskor és jelentkezés-visszaigazolásban: „Bérleted ellenőrzésre vár. Jelentkezésedet rögzítettük; szükség esetén külön értesítünk.” Látható tájékoztatás az edzés előtt kétórás jelentkezési lezárásról. GYIK szöveg aktualizálandó.
7. A meglévő edzés előtti hatórás lemondási szabály önálló; a kétórás jelentkezési határidő nem változtatja meg.
8. A BEAC bérletimport később a függő ellenőrzést feloldhatja; az automatikus státuszváltozás soha ne törölje a jelentkezést.

## Azonosított jelenlegi adatbázis-komponensek

- `public.mass_events`, `public.mass_bookings`, `public.mass_waitlist`, `public.mass_passes`
- `public.cc_mass_booking_create_v0550b4`, `public.cc_mass_booking_create_v0550b41`
- `public.cc_mass_pass_runtime_check_v0550b43b`
- `public.cc_mass_pass_for_email_v0550b43b`
- Manager RPC-k: `cc_manager_mass_booking_add_v1`, `cc_manager_mass_booking_patch_v1`
- A jelenlegi `cc_mass_pass_runtime_check_v0550b43b` már visszaadja az `ELLENŐRZÉSRE VÁR` státuszt több esetben, de friss importnál hiányzó bérletszámra `ÉRVÉNYTELEN`-t ad. Ezt pontosítani kell.

## Implementációs bontás és ellenőrzés

**A. Adatbázis (dev/migráció, élesítés előtt):** a valós kliens által használt RPC-k és várólista-belépési utak teljes hívási térképének ellenőrzése; 120 perces zárás mindegyiken; bérletstátusz és auditadatok; külön manager döntési RPC. A public RPC-k jogosultságvizsgálata kötelező.

**B. Player/public UI:** ellenőrizetlen bérlet tájékoztatása a feladás előtt és után; hibaüzenet a lejárt határidőnél; GYIK.

**C. Manager:** függő tételek száma és lista az edzés kártyáján, jogosultság és audit; értesítés és megerősített lemondás/e-mail.

**D. QA:** még 121 perccel indulás előtt elfogad; 120 percnél és utána elutasít; éjfél/óraátállítás; várólista; ismeretlen vs érvénytelen bérlet; duplikáció; kapacitás; admin kivétel; Manager no-action; e-mail sikertelenség és idempotencia; hatórás lemondási szabály változatlan.

**Kiadási kapu:** a működő éles regisztrációt addig változatlanul hagyni, amíg a szerveroldali és kliensoldali útvonalak teljes QA-ja nincs kész.
