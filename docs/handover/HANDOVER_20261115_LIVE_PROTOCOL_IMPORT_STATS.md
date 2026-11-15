# Club Control LIVE – 15 hivatalos jegyzőkönyv importja és statisztikaállapot

**Dátum:** 2026-11-15  
**Projekt:** BEAC Club Control Manager + Player V1 LIVE  
**Érintett LIVE Supabase:** `snqsxlyhontaepembaic`  
**V2 TEST:** `szzoubvhlwnojtzqjebc` – nem módosult  
**Manager:** `beacvolleyCC/club-control-manager` / main  
**Player:** `beacvolleyCC/player_application` / main

## 1. Importált forrás és eredmény

A felhasználó 15 hivatalos Hunvolley PDF-jegyzőkönyvet adott át (férfi I/A; férfi I/B; női I; női II/B). A 15 mérkőzésből 12 korábban a LIVE `cc_competition_mrsz_screenshot_v1` táblában csak fixture volt, ezeknek beállítottuk az eredményt, a játszmánkénti pontokat, az időpontot, a hivatalos mérkőzéskódot, a jegyzőkönyvi URL-t és a státuszt `played`-re; 3 (#2335, #2338, #2340) már szerepelt, az eredmény és a jegyzőkönyvi névsor is rendben volt.

**Mérkőzéskódok és eredmények:**

| Kód | Bajnokság | Mérkőzés | Eredmény |
|---|---|---|---|
| 2335 | Férfi I/A | Kandó–Taksony | 3–1 (már megvolt) |
| 2338 | Férfi I/A | MAFC-Kármán–Ráckeve | 3–0 (már megvolt) |
| 2340 | Női I | Kandó–Ráckeve | 3–0 (már megvolt) |
| 2690 | Férfi I/A | Közgáz–Kandó | 0–3 |
| 2691 | Férfi I/A | Kispest–MAFC-Kármán | 0–3 |
| 2755 | Férfi I/B | BEAC–MAFC-Schönherz | 3–0 |
| 2758 | Női I | Semmelweis–MAFC-ÉPK | 3–0 |
| 2759 | Férfi I/B | Piarista–Semmelweis | 2–3 |
| 2761 | Női II/B | Corvinus–UTE U20Pink | 3–0 |
| 2762 | Női II/B | MAFC-BME–RKSK | 0–3 |
| 2767 | Női I | KRE A–MTK | 1–3 |
| 2768 | Női I | Közgáz női–Mozdulj | 0–3 |
| 2770 | Férfi I/A | Dág–Kispest | 3–0 |
| 2771 | Női I | BEAC–Ráckeve | 3–0 |
| 2772 | Női I | KSE–Kandó | 2–3 |

**Minden mérkőzés kétoldali játékosnévsora** (mezszám, név, Hunvolley-regisztrációs kód, K/Cs, kapitány/liberó, ahol a dokumentum mutatta) a meglévő `data.protocol.teams` struktúrába került. A 12 új rekordnál a `protocol.teams[].name` a kanonikus mérkőzés névhez igazodik a Player statisztikai csapatkapcsolata miatt; az eredeti, PDF-ből származó csapatnév a `officialName` mezőben is megmarad. Nem állítottunk elő pontszerzési, pályán töltött idő vagy nyitás/fogadás statisztikát, mert ezek nem szerepelnek a forrásban.

**Adatforrás:** `public.cc_competition_mrsz_screenshot_v1`, egységes deduplikált `private.cc_canonical_competition_matches_v1` és `private.cc_competition_canonical_payload_v1`. A Manager/Player meglévő snapshot API-ja ugyanebből a kanonikus adatforrásból olvas. A V2 rendszer vagy a meglévő LIVE mérkőzés táblák másolata nem keletkezett.

## 2. LIVE visszaellenőrzés

- Az adott 15 hivatalos mérkőzéskódból **15/15** kanonikus mérkőzés megtalálható.
- **15/15** eredmény `played` státuszú és a játszmák száma egyezik a végeredménnyel.
- **15/15** kanonikus mérkőzéshez két csapat teljes jegyzőkönyvi névsora csatlakozik.
- **15/15** kanonikus névsor csapatoldala megfelelően kapcsolódik a mérkőzés kanonikus hazai/vendég oldalához.
- Az import utáni szélesebb adatállapot: 35 `played` kanonikus mérkőzés, 34 külső jegyzőkönyv-link. Ez az **összes öt ligára kiterjedő, részleges, rögzített eredmény**, nem teljes fordulóállomány. Férfi I/A 5/42, férfi I/B 8/42, női I 16/130, női II/A 0/42, női II/B 6/42 játszottként rögzített a kanonikus listában.
- A LIVE-ban létrejött `private.cc_official_protocol_import_audit_v1` napló a módosított rekordok eredeti és importált JSON-állapotát őrzi, unique (import_batch,source_key). Ellenőrzéskor 34 auditbejegyzés; külön batch az eredményfrissítésre, tíz névsor hozzáadására és tizenkét névnormalizálásra. A két BEAC PDF névsorának előtti állapot a korábbi eredményfrissítés auditjában található.
- Külön **LIVE** Supabase migráció: `cc_live_20261115_official_protocol_import_audit` (audit tábla, RLS, private schema).
- Beolvasztás/új frontend commit nem történt a Manager vagy Player `main` alkalmazáskódjába. Ez az import közvetlen LIVE-adatfrissítés volt.
- LIVE bejelentkezett Manager/Player vagy iPhone PWA végponttól-végpontig UI vizuális teszt **nem történt**. A Player védett snapshot RPC-jét anonim SQL-sessionből meghívni `PLAYER_NOT_ALLOWED` hibával zárult: ez jogosultsági elutasítás, nem az adatcsomag sérülése.

## 3. Jelenlegi statisztikai modul

**Player LIVE:** `statistics.js`, `statistics.css` a `Tabella → Statisztikák` lenyitható egységben. Nézetek: Áttekintés, Csapatok, Játékosok, Összehasonlítás. A közös LIVE `cc_player_competition_mrsz_snapshot_v2` adataiból építkezik; csak lezárt, deduplikált eredményeket számol. A játékosnévsorokból a jegyzőkönyvi **nevezések száma, győzelem/vereség az adott nevezett csapat meccsein, K/Cs és jelölés nélküli státusz** számolható. Nem igazolt tényleges pályára lépés vagy játékperc. Az új csapatalias-egyeztetés azért kellett, hogy a Player ne hagyja ki a roster-játékosokat.

**Manager LIVE:** `app.js`, `Versenysport → Statisztika`. Szintén központi kanonikus mérkőzés/snapshot alapján csapatmérlegek, szettek és rögzített eredmények; bajnokságszintű állítások csak ellenőrzött teljes adatokból.

**Limitációk:** a teljes bajnoki rangsor, forma, helyezésváltozás és összehasonlítás csak akkor tekinthető teljesnek, ha az összes szükséges eredmény és a hiteles tabella/adattörténet megvan. 2026-11-15-én mind az öt adatkör részleges. Egyéni nyitás/fogadás/ütés/blokk/pontszerzés nem vezethető le a statikus jegyzőkönyvekből; meccs közbeni event/timeline-alapú rögzítés kellene hozzá.

## 4. Következő LIVE-feladatok

1. Bejelentkezett Manager → meccsek/eredmények/jegyzőkönyvek és Player → Tabella/Statisztikák valós böngészős/mobilos teszt, szükség esetén cache frissítéssel.
2. A többi hivatalos eredmény és jegyzőkönyv azonos módon, szigorúan bajnokságcsoport-szétválasztással való rögzítése, minden import után dedupe/konzisztencia ellenőrzéssel.
3. Player játékosstatisztika és különálló csapatstatisztika mély E2E kontrollja (csapatazonosítás, K/Cs ≠ pályára lépés, különböző azonos nevű csapatok, több bajnokság). Ne állítsunk elő nem létező részletes eseményeket.
4. Ha teljes, hivatalos tabella rendelkezésre áll, azzal összevetni a számított eredménymutatókat; 2–1–0 szabályok, ki nem állás 0 pont.
5. Külön projektben megtervezni a meccs közben rögzített események (szervák, pontok, blokk, forgás, csere, időkérés) statisztikai pipeline-ját, ha kell.

**LIVE scope:** kizárólag eredmények/jegyzőkönyvek, a meglévő rendszerre építve. V2 draft PR #89 nem merge-elve, V2 TEST nem módosítva.
