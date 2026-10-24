# 2026/27 BEAC — BRSZ ↔ canonical mérkőzések egyedi forrásellenőrzése

**Dátum: 2026.10.24. · Kizárólag felülvizsgálati lista · MINDEN `approved=false`.**

Ez az állomány csak az éles adatbázison, kizárólag `SELECT`-tel ellenőrzött 46 régi BRSZ-alias és canonical kapcsolatjelölt összefoglalója. **Egyetlen sor sem jogosít fel automatikus meccsösszekapcsolásra, régi event ID átírására, eredmény vagy jelentkezés módosítására.**

**Státusz:** 41 külön hivatalos mérkőzésazonosítót igénylő jelölt; 3 eleve azonos régi/canonical UUID; 2 hibás önmérkőzés. A 41 jelöltből 0 rendelkezik a BRSZ-nyersimportban külön `officialFixtureId` mezővel. A BRSZ-bajnokságoldal URL-je **nem mérkőzésazonossági bizonyíték**. 

## Egyedi lista — csak olvasás, jóváhagyás nélkül

A hazai és vendég azonosítókat a szövetségi forrás szerint adjuk meg (H → V). Időpontok: **Europe/Budapest, 24 órás**. A forráskulcsok és a dátumok önmagukban csak jelöltek; a belső osztályok, különösen Női I. vs Női II/B és férfi I/B, nem vonhatók össze.

### Férfi Budapest I. osztály – B csoport

Forrásoldal: [BRSZ/Hunvolley bajnoki forrás](https://www.brsz.hu/bajnoksagok.php?bajnoksag_id=1137) · [BRSZ/Hunvolley bajnoki forrás](https://www.hunvolley.info/pr_00/_jegyzokonyv_terem/v01/jegyzokonyv_nyomtat.asp?p_merkozes_kod=2699&p_evad_kod=2026). Ezek a bajnokságra mutatnak; nem ellenőrzött meccsszintű igazolások.

| Régi BRSZ-forráskulcs | H → V ID | Régi helyi idő | Canonical forráskulcs | Döntési állapot |
|---|---|---|---|---|
| `brsz:2026/27:709:1091:709:1` | 1091 → 709 | 2027-01-13 18:15 | `20261001:fixture:78` | **NINCS IGAZOLVA** |
| `brsz:2026/27:709:45:709:1` | 45 → 709 | 2027-02-18 18:20 | `20261001:fixture:86` | **NINCS IGAZOLVA** |
| `brsz:2026/27:709:640:709:1` | 640 → 709 | 2027-01-27 20:30 | `20261001:fixture:83` | **NINCS IGAZOLVA** |
| `brsz:2026/27:709:709:1214:1` | 709 → 1214 | 2026-10-12 19:30 | `mrsz:2026/27:protocol:2699` | **AZONOS UUID** |
| `brsz:2026/27:709:709:45:1` | 709 → 45 | 2026-11-23 19:30 | `20261001:fixture:71` | **NINCS IGAZOLVA** |
| `brsz:2026/27:709:709:640:1` | 709 → 640 | 2026-11-09 19:30 | `20261001:fixture:67` | **NINCS IGAZOLVA** |
| `brsz:2026/27:709:709:709:1` | 709 → 709 | 2027-01-13 20:30 | — | **HIBÁS ÖNMECCS** |
| `brsz:2026/27:709:709:865:1` | 709 → 865 | 2027-02-22 19:30 | `20261001:fixture:87` | **NINCS IGAZOLVA** |
| `brsz:2026/27:709:709:957:1` | 709 → 957 | 2027-01-18 19:30 | `20261001:fixture:80` | **NINCS IGAZOLVA** |
| `brsz:2026/27:709:865:709:1` | 865 → 709 | 2026-12-10 19:30 | `20261001:fixture:74` | **NINCS IGAZOLVA** |
| `brsz:2026/27:709:957:709:1` | 957 → 709 | 2026-10-27 19:30 | `20261001:fixture:64` | **NINCS IGAZOLVA** |

### Női Budapest I. osztály

Forrásoldal: [BRSZ/Hunvolley bajnoki forrás](https://www.brsz.hu/bajnoksagok.php?bajnoksag_id=1121) · [BRSZ/Hunvolley bajnoki forrás](https://www.hunvolley.info/pr_00/_jegyzokonyv_terem/v01/jegyzokonyv_nyomtat.asp?p_merkozes_kod=2330&p_evad_kod=2026). Ezek a bajnokságra mutatnak; nem ellenőrzött meccsszintű igazolások.

| Régi BRSZ-forráskulcs | H → V ID | Régi helyi idő | Canonical forráskulcs | Döntési állapot |
|---|---|---|---|---|
| `brsz:2026/27:299:1092:299:1` | 1092 → 299 | 2027-01-20 20:45 | `brsz:2026/27:bb1:userofficial:040` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:1094:299:1` | 1094 → 299 | 2027-04-22 19:30 | `brsz:2026/27:bb1:userofficial:103` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:1159:299:1` | 1159 → 299 | 2026-10-27 20:30 | `20261001:fixture:38` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:12:299:1` | 12 → 299 | 2027-05-13 18:50 | `brsz:2026/27:bb1:userofficial:113` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:18:299:1` | 18 → 299 | 2027-04-08 20:00 | `brsz:2026/27:bb1:userofficial:092` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:299:1092:1` | 299 → 1092 | 2027-05-07 19:30 | `brsz:2026/27:bb1:userofficial:109` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:299:1094:1` | 299 → 1094 | 2027-01-15 19:30 | `brsz:2026/27:bb1:userofficial:037` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:299:1159:1` | 299 → 1159 | 2027-02-26 19:30 | `brsz:2026/27:bb1:userofficial:067` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:299:12:1` | 299 → 12 | 2027-01-29 19:30 | `brsz:2026/27:bb1:userofficial:047` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:299:18:1` | 299 → 18 | 2026-12-04 19:30 | `brsz:2026/27:bb1:userofficial:025` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:299:299:1` | 299 → 299 | 2026-11-10 19:30 | — | **HIBÁS ÖNMECCS** |
| `brsz:2026/27:299:299:644:1` | 299 → 644 | 2026-11-20 19:30 | `20261001:fixture:55` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:299:753:1` | 299 → 753 | 2027-04-16 19:30 | `brsz:2026/27:bb1:userofficial:097` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:299:835:1` | 299 → 835 | 2026-10-16 19:30 | `mrsz:2026/27:protocol:2330` | **AZONOS UUID** |
| `brsz:2026/27:299:299:863:1` | 299 → 863 | 2027-05-21 19:30 | `brsz:2026/27:bb1:userofficial:118` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:299:917:1` | 299 → 917 | 2027-03-25 19:30 | `brsz:2026/27:bb1:userofficial:085` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:299:961:1` | 299 → 961 | 2026-11-13 19:30 | `20261001:fixture:48` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:644:299:1` | 644 → 299 | 2027-03-19 20:40 | `brsz:2026/27:bb1:userofficial:081` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:753:299:1` | 753 → 299 | 2026-12-07 19:00 | `brsz:2026/27:bb1:userofficial:027` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:835:299:1` | 835 → 299 | 2027-02-18 20:20 | `brsz:2026/27:bb1:userofficial:062` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:863:299:1` | 863 → 299 | 2027-02-09 20:00 | `brsz:2026/27:bb1:userofficial:052` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:917:299:1` | 917 → 299 | 2026-11-24 19:30 | `20261001:fixture:57` | **NINCS IGAZOLVA** |
| `brsz:2026/27:299:961:299:1` | 961 → 299 | 2027-03-12 18:20 | `brsz:2026/27:bb1:userofficial:076` | **NINCS IGAZOLVA** |

### Női Budapest II. osztály – B csoport

Forrásoldal: [BRSZ/Hunvolley bajnoki forrás](https://www.brsz.hu/bajnoksagok.php?bajnoksag_id=1146) · [BRSZ/Hunvolley bajnoki forrás](https://www.hunvolley.info/pr_00/_jegyzokonyv_terem/v01/jegyzokonyv_nyomtat.asp?p_merkozes_kod=2348&p_evad_kod=2026). Ezek a bajnokságra mutatnak; nem ellenőrzött meccsszintű igazolások.

| Régi BRSZ-forráskulcs | H → V ID | Régi helyi idő | Canonical forráskulcs | Döntési állapot |
|---|---|---|---|---|
| `brsz:2026/27:959:1031:959:1` | 1031 → 959 | 2026-10-30 20:30 | `20261001:fixture:4` | **NINCS IGAZOLVA** |
| `brsz:2026/27:959:1099:959:1` | 1099 → 959 | 2027-02-24 20:30 | `brsz:2026/27:bb2b:userofficial:37` | **NINCS IGAZOLVA** |
| `brsz:2026/27:959:1165:959:1` | 1165 → 959 | 2027-02-09 18:20 | `brsz:2026/27:bb2b:userofficial:30` | **NINCS IGAZOLVA** |
| `brsz:2026/27:959:1215:959:1` | 1215 → 959 | 2026-12-14 20:00 | `brsz:2026/27:bb2b:userofficial:18` | **NINCS IGAZOLVA** |
| `brsz:2026/27:959:1223:959:1` | 1223 → 959 | 2027-01-15 18:00 | `brsz:2026/27:bb2b:userofficial:23` | **NINCS IGAZOLVA** |
| `brsz:2026/27:959:866:959:1` | 866 → 959 | 2026-11-25 19:30 | `20261001:fixture:13` | **NINCS IGAZOLVA** |
| `brsz:2026/27:959:959:1031:1` | 959 → 1031 | 2027-01-19 19:30 | `brsz:2026/27:bb2b:userofficial:25` | **NINCS IGAZOLVA** |
| `brsz:2026/27:959:959:1099:1` | 959 → 1099 | 2026-12-08 19:30 | `brsz:2026/27:bb2b:userofficial:16` | **NINCS IGAZOLVA** |
| `brsz:2026/27:959:959:1165:1` | 959 → 1165 | 2026-11-17 19:30 | `20261001:fixture:9` | **NINCS IGAZOLVA** |
| `brsz:2026/27:959:959:1215:1` | 959 → 1215 | 2027-03-02 19:30 | `brsz:2026/27:bb2b:userofficial:40` | **NINCS IGAZOLVA** |
| `brsz:2026/27:959:959:1223:1` | 959 → 1223 | 2026-10-13 19:30 | `mrsz:2026/27:protocol:2348` | **AZONOS UUID** |
| `brsz:2026/27:959:959:866:1` | 959 → 866 | 2027-02-16 19:30 | `brsz:2026/27:bb2b:userofficial:33` | **NINCS IGAZOLVA** |

## Jóváhagyás előtt kötelező forrásvizsgálat

A 41 nyitott jelölt mindegyikénél külön meg kell állapítani a **konkrét mérkőzés hivatalos MRSZ/BRSZ azonosítóját**, a mérkőzés szövetségi URL-jét vagy jegyzőkönyvét, a szezont és pontos bajnoki csoportot, a két csapat **irányított** szövetségi ID-ját, a hivatalos kezdési időt és az ismételt találkozók megkülönböztetését. A forrásazonosságot külön, dokumentált jogosultságú ellenőrző hagyja jóvá; a jóváhagyás mező jelenleg mind a 41 sorban üres.

A korábban problémás MRSZ **#2699** (férfi) és **#2348** (női II/B) már azonos UUID-val szerepel a régi és az új katalógusban; időpontkülönbségük nem ok új alias beírására. Az MRSZ **#2330** (Női I.) szintén eleve azonos UUID. A két BEAC–BEAC téves rekord tiltott marad.

Egyértelmű forrás nélkül minden jelölt **PENDING**; sem a teamnév, sem az egyező helyi idő, sem a bajnoki oldali hivatkozás nem tesz lehetővé jóváhagyást.

**Gépi forrásadat:** `data/competition/2026-27/verified-bridge-review-20261024.json`.

**Újrafuttatható kizárólag SELECT-audit:** `sql/cc_verified_match_bridge_20261024_all46_review_readonly.sql`.

**Élesítés:** TILOS mindaddig, amíg hiteles mérkőzésazonosító, független jogosultsági ellenőrzés, migrációs jóváhagyás és bejelentkezett Manager/Player teszt nincs.
