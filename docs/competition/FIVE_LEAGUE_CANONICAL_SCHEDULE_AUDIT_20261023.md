# Öt bajnokság menetrend-auditja – 2026-10-23

**Forrás:** LIVE, kizárólag olvasás: `public.cc_competition_user_schedule_v1` (300) és `private.cc_canonical_competition_matches_v1` (298). A régi 300 soros import **nem** azonos a jelenlegi canonical menetrenddel; ne merge-eljük automatikusan a Manager #68 / Player #19 PR-okat.

| Bajnokság | Régi | Canonical | Azonos nap + hazai/vendég |
|---|---:|---:|---:|
| Férfi I/A | 42 | 42 | 41 |
| Férfi I/B | 42 | 42 | 40 |
| Női I | 131 | 130 | 129 |
| Női II/A | 42 | 42 | 37 |
| Női II/B | 43 | 42 | 42 |
| **Összesen** | **300** | **298** | **289** |

**Pontos besorolás:** 281 azonos nap és óra; 8 egyező eredmény azonos napon, de a régi rekordban kezdési óra nélkül; 4 különböző nap; 4 mindkét helyen időpont nélkül halasztott; 1 korábbi halasztás, amelyhez a canonical már időpontot tartalmaz; 1 második régi csapatpár; 1 BEAC–BEAC önmérkőzés. A 8 régi eredmény mind egyezik, a kiírásnapon belül nincs azonos csapatpárból duplikált csoport.

## 11 kivizsgálandó régi bejegyzés

- Férfi I/A: Dág KSE – KÖZGÁZ (régi november 19., canonical október 15.).
- Férfi I/B: Mozdulj SE – MAFC-Vásárhelyi (régi október 28., canonical október 21.; MRSZ #2700 feltöltve, még nem LIVE).
- Férfi I/B: Mozdulj SE – MAFC-Schönherz (régi halasztott; canonical 2027. március 3.).
- Női I: MTK – Panoráma SE (régi október 28., canonical október 21.; MRSZ #2686 feltöltve, még nem LIVE).
- Női I: BEAC – BEAC (nem igazolt önmérkőzés; nincs canonical megfelelő).
- Női II/A: KEAC – KRE-B (régi október 28., canonical november 28.).
- Női II/A: négy elhalasztott, mindkét oldalon időpont nélkül: BDG–BDTSE, Budai XI. C–Bunnies, Bunnies–BDTSE, Bunnies–Budai XI. C.
- Női II/B: MTK kék – RKSK (régi november 24., canonical október 13-i lejátszott meccs; az október 13-i dátumra van másik régi bejegyzés is). A novemberi rekordot **nem töröljük automatikusan**.

## Öt elavult régi státusz

A régi importban még `fixture`, a canonical rendszerben már lejátszott: BEAC–PDSE (#2699, 3:0); KSE–Mozdulj (#2331, 1:3); Panoráma–KRE (#2677, 0:3); BEAC II–UTE U20 Pink (#2348, 3:0); MTK kék–RKSK (#2337, 3:0).

## Reprodukálás és döntés

- READ ONLY lekérdezés: `sql/audit_five_league_canonical_versus_user_20261022.sql`.
- Ellenőrzött pillanatkép: `data/competition/2026-27/canonical-legacy-five-league-audit-20261023.json`, 11 kivizsgálási sorral és 5 státuszkülönbséggel.
- Automatizált QA: `tests/five-league-canonical-audit-20261023.test.cjs`, a külön GitHub Actions ellenőrzéssel.
- A canonical rétegben 13 LIVE eredmény van; a 2 új hivatalos jegyzőkönyv a Manager #74-ben van előkészítve. A canonical meccsazonosítók és jelentkezések változatlanok.
- A csapatnevek normalizálása **jelöltpárosítás**, nem hivatalos azonosító. A dátumeltérésekhez hivatalos ellenőrzés kell. Sem automatikus alias, sem törlés, sem kitalált hivatalos helyezés nem engedélyezett.
