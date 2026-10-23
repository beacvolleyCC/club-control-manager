# Club Control — 2026/27 forrásütközések, 11 eset (2026-10-23)

**Állapot:** kizárólag olvasási audit. Fejlesztési ág: `audit/20261022-canonical-event-crosswalk` (Manager draft PR #73). A pontosan újrafuttatható lekérdezés: `sql/audit_202627_eleven_source_discrepancies_20261023.sql`.

Az SQL-t **kétszer** futtattuk a tényleges Supabase-adatbázison, ugyanazzal az eredménnyel: **11 felülvizsgálati ügy**. Ezek **nem** 11 bizonyított hibás mérkőzés, és **nem** a külön kezelt 7 összerendeletlen Manager-esemény. Az elemzés semmilyen automatikus crosswalkot/alias-t nem hoz létre.

## 1. Négy, külön források között eltérő kezdési időpont

| Liga (2026/27) | Párosítás (hazai–vendég) | Korábbi user-import (Budapest) | Canonical kiírás (Budapest) | Bizonyíték |
|---|---|---|---|---|
| Férfi I/A | Dág KSE – KÖZGÁZ | 2026-11-19 20:15 | 2026-10-15 20:15 | Csak egyező párosítás/csoport: **kézi ellenőrzés** |
| Férfi I/B | Mozdulj SE – MAFC-Vásárhelyi | 2026-10-28 20:00 | 2026-10-21 20:00 | MRSZ **#2700** feltöltött eredeti jegyzőkönyv a 21-i dátumot megerősíti; import #74 draft |
| Női I | MTK – Panoráma SE | 2026-10-28 20:45 | 2026-10-21 21:00 | MRSZ **#2686** feltöltött eredeti jegyzőkönyv a 21-i dátumot megerősíti; import #74 draft |
| Női II/A | KEAC – KRE-B | 2026-10-28 18:20 | 2026-11-28 11:30 | Csak egyező párosítás/csoport: **kézi ellenőrzés** |

A #2686 és #2700 canonical mérkőzések saját meglévő match UUID-vel rendelkeznek. Az eredmény rávetítése a jó dátumú fixture-re csak a külön, adatbázis-integrációra váró **Manager #74** PR szerint történhet; a régi október 28-i user-forrást nem írjuk át és nem töröljük.

## 2. Négy továbbra is időpont nélküli halasztás — Női II/A
- `ui20261018:womenIIA:bdg:bdtsetaksony:1` — BDG – BDTSE Taksony
- `ui20261018:womenIIA:budaixic:budapestbunnies:1` — Budai XI. C – Budapest Bunnies
- `ui20261018:womenIIA:budapestbunnies:bdtsetaksony:1` — Budapest Bunnies – BDTSE Taksony
- `ui20261018:womenIIA:budapestbunnies:budaixic:1` — Budapest Bunnies – Budai XI. C

Mind a négy `starts_at = NULL`, `match_date = NULL`, `source_status = postponed`. Kezdést, helyszínt vagy foglaltságot ebből tilos kikövetkeztetni.

## 3. Egy eltérően kezelt halasztás — Férfi I/B

Mozdulj SE – MAFC-Schönherz: `ui20261018:menB:mozduljse:mafcschonherz:1` dátum nélkül, `postponed`. A `brsz:2026/27:menB:userofficial:38` canonical forrás ugyanilyen hazai–vendég párosítással **2027-03-03 20:00** tervezett kezdést tartalmaz. Csak **egyezési jelölt**; a nap+név alapján nem szabad automatikusan azonosságot rögzíteni.

## 4. Egy ismétlődő párosítás — Női II/B

MTK Budapest kék – RKSK felnőtt női ugyanabban a hazai–vendég sorrendben szerepel két régi `womenIIB` fixture-forrásban:
- `ui20261018:womenIIB:mtkkek:rkskfelnottnoi:1` — 2026-10-13 18:20
- `ui20261018:womenIIB:mtkkek:rkskfelnottnoi:2` — 2026-11-24 18:20

Az **MRSZ #2337** megerősíti az október 13-i MTK Budapest kék–RKSK **3–0** eredményt. Nem igazolja egyben a november 24-i rekord jogosságát vagy téves voltát. Egyik sor törlése/összevonása sem megengedett ellenőrizetlenül. **Női II/B, nem Női I: MTK kék ID 1165, RKSK 1215; a női I. osztályú MTK ID 1092.**

## 5. Egy BEAC–BEAC forráshibacsoport — két raw rekord

A régebbi `competition_source_matches` két `needs_review=true` BRSZ-forrása:
- `brsz:2026/27:299:299:299:1` — női I-es 299 azonosító mindkét oldalon
- `brsz:2026/27:709:709:709:1` — férfi I/B 709 azonosító mindkét oldalon

Ez **egy felülvizsgálati ügykategória, amely két külön raw rekordot érint**, nem egy tényleges BEAC–BEAC mérkőzés. Nem szabad automatikus alias-t létrehozni. Archivált Manager-eseményt vagy jelentkezéseket nem szabad törölni.

## Ellenőrzött eredmény és folytatás

A kétszer futtatott LIVE SELECT audit pontos megoszlása: **4 dátumeltérés + 4 dátum nélküli halasztás + 1 halasztás/kiírás eltérés + 1 ismétlődő párosítás + 1 önmérkőzés-hibacsoport = 11 review-ügy**. A 11 audit-sor minden esetében `crosswalkVerified=false`: az SQL nem állít automatikus identitásegyezést.

A külön Manager #73 crosswalk-listában **7** Manager match-esemény nincs aliasolt canonical match-hez kötve, **15 létező bookinggal**. Ezek más típusú problémák, nem adhatók hozzá automatikusan a 11-hez.

**Következő kiadási kapu:** ellenőrzött MRSZ azonosító, idény, liga, csoport, hazai/vendég forráscsapat-ID, crosswalk szerep és meglévő match/event UUID-k; a #74 eredményintegráció szigorúan 298 rekord / korábbi 13 -> új 15 lejátszott eredmény mellett, azonosságvesztés nélkül. Csak későbbi tervezett adatbázis-kiadáskor írunk. Az újra futtatott, kibővített #74 PostgreSQL CI zöld; nem helyettesíti a későbbi bejelentkezett Player/Manager UI és iPhone QA-t.
