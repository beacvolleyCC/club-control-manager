# Club Control LIVE — védett Manager debug mód (2026-11-22)

## Mi változott?

A meglévő LIVE Manager-bejelentkezést változtatás nélkül megtartjuk. Egy szerveroldali, konkrét Manager-fiókra kapcsolható debug hozzáférést készítettünk, amely a Beállításokban kizárólag az engedélyezett, Supabase Auth által hitelesített fióknak mutatja a fejlesztői szimulációt. E-mail vagy localStorage önmagában nem jogosít.

## Kódbázis

- Repo: `beacvolleyCC/club-control-manager`.
- Ág: `feature/live-admin-debug-gated-20261122`.
- PR: [#102](https://github.com/beacvolleyCC/club-control-manager/pull/102).
- Új: `sql/cc_manager_debug_access_v1_20261122.sql`; `.github/workflows/cc-live-debug-safety.yml`; `AGENTS.md`.
- Módosult: `app.js` — szerveroldali jogosultság lekérdezése, csak jogosult adminnak megjelenő Debug panel, böngészőn belüli háromállású vendég-szimuláció.
- A korábbi nagy vendégrendszer PR #101 / Player #38 / honlap #1 továbbra is külön, nem kerül bele ebbe a kiadásba.

## LIVE adatbázis

- Projekt: `snqsxlyhontaepembaic`.
- `cc_manager_debug_access_v1_20261122` migráció sikeresen lefutott.
- `private.cc_manager_debug_access_v1` táblában a létrehozás utáni ellenőrzéskor 0 sor / 0 enabled.
- `public.cc_manager_debug_access_v1()` `auth.uid()` és a meglévő `private.cc_manager_current_account_v1()` alapján ellenőriz. `anon` EXECUTE: nincs. `authenticated` táblát közvetlenül nem olvashat. Jogosulatlan környezetben false.
- Nincs új LIVE vendég, edzés, játékos vagy availability rekord a debug mód miatt.

## Minőségbiztosítás

- Node szintaktikai és külön no-write / szerver-oldali gate ellenőrzés: [run 45029470478](https://github.com/beacvolleyCC/club-control-manager/actions/runs/45029470478) sikeres; a navigációs NodeList szabály miatti regressziót javítottuk.
- A kapcsolódó Manager regressziós ellenőrzéseknek zöldnek kell lenniük a merge előtt.
- Bejelentkezett, kiválasztott felhasználós LIVE böngészős ellenőrzés még nem történt meg.

## Aktiválási feltétel és visszaállítás

- **Pontosan meg kell adni, melyik meglévő LIVE Manager-emailhez engedélyezhető.** Ezt nem lehet a tesztjátékos fiókjából kikövetkeztetni.
- Aktiválni csak igazolt, aktív `public.manager_accounts` rekordhoz rendelt `manager_id` alapján, szerveroldalon lehet. Más Manager marad OFF.
- Rollback: az egyetlen fiók `enabled=false` kapcsolója; frontend szükség esetén előző main commitra visszaállítható. A debug előnézet nem tárol adatot a LIVE edzésadatokban.

## Fontos következő fejlesztés

A jelenlegi UI **csak izolált vendég-szimuláció**, nem a teljes vendégjelentkezési rendszer. A valódi vendégek, közös roster, Player számláló és honlapi PIN-beléptetés külön kiadási és jogosultsági ellenőrzést igényel.
