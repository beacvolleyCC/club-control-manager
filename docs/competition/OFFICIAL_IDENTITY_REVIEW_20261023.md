# CC — Hivatalos mérkőzésazonosítók: bizonyíték- és kiadási kapu (2026-10-23)

**Állapot: staged read-only, nem élesített.** A 11 vitás régi forráskulcs, 10 canonical jelölt és 1 pár nélküli BEAC–BEAC bejegyzés strukturált felülvizsgálata. A sorokhoz tartozó `manualApproval` mindvégig `required`, az `allowAutomaticCanonicalWrite` mindenhol `false`.

## Források és bizonyítékszintek

1. A LIVE `public.cc_competition_user_schedule_v1` (300 menetrendsor) és a LIVE `private.cc_canonical_competition_matches_v1` (298 egyedi mérkőzés, 13 lejátszott) **kizárólag SELECT** lekérdezései.
2. A korábbi [ötbajnokságos eltérésaudit](FIVE_LEAGUE_CANONICAL_SCHEDULE_AUDIT_20261023.md) 11 ellenőrzendő sora.
3. A Manager [#74-es draft PR-ban](https://github.com/beacvolleyCC/club-control-manager/pull/74) feldolgozott, felhasználó által feltöltött két hivatalos MRSZ-jegyzőkönyv: #2686 (MTK Budapest–Panoráma SE, női I.) és #2700 (Mozdulj SE–MAFC-Vásárhelyi, férfi I/B). Az eredeti fájlnevek, kódok, SHA-256 lenyomatok és eredmények a `official-protocols-20261021.json` forráscsomagban ellenőrizhetők. **Ezek igazolják az október 21-i lejátszást, de a draft PR-ban nincsenek élesítve.**
4. Nyilvános BRSZ/Hunvolley keresés történt, de a többi vitás 2026/27-es időpontot összekötő, egyértelmű **2026/27-es hivatalos mérkőzésazonosító** nem volt megbízhatóan igazolható. Korábbi szezonok találatait nem használjuk 2026/27-es adatkapcsolat jóváhagyására.

## Tételes állapot és döntés

| Sorok | Indok | Automatikus kapcsolat |
|---|---|---|
| 2 – Női I. MTK–Panoráma és Férfi I/B Mozdulj–MAFC-Vásárhelyi | A #2686 és #2700 feltöltött MRSZ-jegyzőkönyvek alátámasztják a canonical október 21-i dátumot és két külön bajnokságot | **Tiltott** a külön migráció felülvizsgálatáig |
| 2 – Férfi I/A Dág–KÖZGÁZ; Női II/A KEAC–KRE-B | Régi és canonical dátum eltér; nem bizonyított az áthelyezés | Tiltott; külön hivatalos kiírás szükséges |
| 1 – Férfi I/B Mozdulj–MAFC-Schönherz | A régi forrás halasztott, canonical már 2027. március 3-i kezdést mutat | Tiltott; hitelesített új időpont szükséges |
| 4 – Női II/A halasztások | Mindkét forrásban időpont nélküli, halasztott | Tiltott; nem generálunk kezdési dátumot |
| 1 – Női II/B MTK kék–RKSK, régi november 24. | A canonical október 13-i #2337 meccse egy **külön**, 3:0-s, játékengedély-hiány miatti eredmény; az október 13-i találkozó már szerepel a régi adatforrásban is | Tiltott; a novemberi alkalmat nem töröljük |
| 1 – Női I. BEAC–BEAC | Nincs canonical mérkőzéspár és ellenőrzött ellenfél | Tiltott; önmérkőzés nem fogadható el automatikusan |

## Osztályok és csoportok szigorú elválasztása

Ellenőrizendő identitás: **idény + teljes bajnokságcímke (férfi/női, osztály, csoport) + ellenőrzött hazai/vendég csapatazonosító + eredeti mérkőzésforrás/UUID**.

A canonical LIVE adatok közt ismétlődő, normalizált hazai–vendég párok találhatók **külön férfi és női versenyekben** (pl. BEAC–Mozdulj, BEAC–Semmelweis, Kandó–Ráckeve). A névazonosság emiatt csak az adott bajnokságon belül vizsgálható. A női II/A és II/B, illetve a 2025/26 és 2026/27 idény között is tilos a keverés.

Az ellenőrzés minden canonical jelölthöz külön tárolja az aktuális `match_id`-t, `home_source_team_id`-t, `away_source_team_id`-t, helyi kezdést és státuszt. Az igazoló PDF-ek csapatazonosítóit a már létező forrásrekordból örököltük, nem olvastuk ki a PDF-ből.

## Elkészült fájlok és QA

- `data/competition/2026-27/official-identity-review-20261023.json`: az összes 11 rekord bizonyítékbesorolása, a 10 kapcsolható canonical jelölt UUID-ja, csapatai és a két MRSZ PDF lenyomata. Ez **nem** jóváhagyott aliaslista.
- `sql/audit_official_identity_release_gate_20261023.sql`: kizárólag olvasó SQL; a source key, idény, pontos bajnokságcímke, hazai/vendég azonosítók, canonical UUID, helyi kezdés, státusz és normalizált csapatnevek ellenőrzése. A pár nélküli BEAC–BEAC esetet is külön kezeli. A végrehajtás során **11/11 metaadategyezés, 0 eltérés**, két független megismételt LIVE SELECT-ben.
- `tests/official-identity-review-20261023.test.cjs`: a 11 sor, a 2 hivatalos PDF és lenyomat, a 4 időpont nélküli halasztás, a novemberi ismétlődő csapatpár, a BEAC–BEAC forrásanomália, a férfi/női és A/B osztályhatár, valamint az SQL olvasásra korlátozottságának tesztje.
- `.github/workflows/five-league-crosswalk-audit.yml`: a régi, 300/298-as audit + új identitásellenőrzés kétszeri regressziós futása.

**A két 11/11-es adatbázis-eredmény a jelölt metaadatainak sértetlenségét igazolja, NEM a 11 mérkőzés hivatalos azonosságát.** Az automatikus összekapcsolások száma tudatosan **0**.

## Következő, biztonságos lépések

A még vitás Dág–KÖZGÁZ és KEAC–KRE-B dátumeltérést, a Mozdulj–MAFC-Schönherz újra kitűzését és az MTK kék–RKSK november 24-i kiírását külön hivatalos, az **azonos idényen és versenycsoporton belül érvényes** azonosító vagy dokumentum alapján ellenőrizni. Az új jegyzőkönyvekkel alátámasztott két mérkőzést a #74-es, 298-as azonosítószámot megőrző, külön tesztelt migrációval lehet majd később bevezetni, de csak a végleges adatbázis-kiadás részeként, kétszeri teljes 11 pontos QA mellett.

Sem LIVE SQL-migráció, sem Player/Manager main-merge, sem esemény-/jelentkezésmódosítás, sem push-értesítés nem történt.
