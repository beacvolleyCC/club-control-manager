# Club Control – bajnoksági és játékostörténeti adatfelmérés (1. kör)

**Dátum:** 2026-10-17 · **Érvényesség:** ellenőrzött adatfelmérés, nem kész értékszám és nem import.
**Közös cél:** ugyanaz a statisztikai számítás szolgálja ki a Manager és Player felületét; a nézet alapból Managerben részletes, Playerben egyszerű.
**Adatbiztonság:** éles Supabase kizárólag SELECT / metaadat; nem történt migráció, forrásrekord-átírás vagy tömeges webes letöltés.

## 1. Supabase – ténylegesen ellenőrzött állapot

Projekt: `snqsxlyhontaepembaic`

| Forrás | Évad | Mentett sor | Megjegyzés |
|---|---|---:|---|
| `public.cc_competition_mrsz_screenshot_v1`, fixture | 2026/27 | 117 | Archív/mentett menetrendi rekordok; nem igazoltan teljes |
| Ugyanott, match | 2026/27 | 10 | 8 rekord tartalmaz `protocol` JSON-mezőt; ez önmagában nem garantál teljes játékosadatot |
| Ugyanott, standings | 2026/27 | 2 | Férfi I/A, Női II/B |
| `public.competition_source_matches` | 2026/27 | 46 | Másik versenyforrás; az előzővel átfedhet, nem adható hozzá automatikusan |
| `public.competition_source_standings_history` | 2026/27 | 50 | 4 különböző `snapshot_key`; a három BEAC-csoportban összesen 50 sor |
| `public.competition_source_team_maps` | 2026/27 | 3 | BEAC-csapatok/forráscsoportok összekötése |

A fenti táblákban **2024/25 és 2025/26 évadhoz nem találtunk mentett sorokat**. Ez nem azt jelenti, hogy a hivatalos archívumban nincs adat: külön forrásfelmérés kell.

### MRSZ-pillanatkép csoportonként

| Verseny | Fixture | Match | Standings | Csapatok a fixture-nevekből |
|---|---:|---:|---:|---:|
| Férfi Budapest I/A | 42 | 2 | 1 | 7 |
| Férfi Budapest I/B – BEAC | 29 | 1 | 0 | 6 |
| Női Budapest I. – BEAC | 31 | 6 | 0 | 12 |
| Női Budapest II/B – BEAC II. | 15 | 1 | 1 | 7 |
| **Összesen** | **117** | **10** | **2** | **32 csoport–csapat előfordulás** |

A BEAC közvetlen bajnoki környezete **25 csoport–csapat előfordulás**, a férfi A csoporttal együtt 32. A név szerinti felsorolás nem igazolja a csapatok szezonok közötti azonosságát.

## 2. Kiinduló névsor a történeti egyeztetéshez

**Férfi I/B, 6:** BEAC; Corvinus; MAFC-Schönherz; MAFC-Vásárhelyi; PDSE; Semmelweis Egyetem.

**Női I., 12:** BEAC; Emericus SE; Közgáz SC; KRE SC; KSE; MAFC-ÉPK; Mozdulj SE; MTK; Óbudai Egyetem-Kandó SC; Panoráma SE; Ráckeve; Semmelweis Egyetem.

**Női II/B, 7:** BEAC II.; Corvinus; MAFC-BME; MTK kék; Radzeer SE; RKSK felnőtt női; UTE U-20 Pink.

**Kapcsolódó férfi I/A, 7:** BTDSE Taksony; Dág KSE; Kispest SE; KÖZGÁZ; MAFC Kármán; Óbudai Egyetem-Kandó SC; Ráckeve.

Megjegyzés: az egyetlen karaktersor alapján végzett automatikus azonosság-egyeztetés tilos. Példa: Kandó / Óbudai Egyetem-Kandó alias ellenőrzést igényel; a Corvinus női/férfi külön csapat; BEAC és BEAC II. külön csapat.

## 3. Nyilvános történeti források – ellenőrzött minták

1. **MRSZ 2025/26-os női Budapest I. jegyzőkönyv:** Mozdulj – EMERICUS SE, 2026-01-21, mérkőzéskód 6161. A nyilvánosan indexelt jegyzőkönyvben játékosnév, K/CS jelölés és kód oszlop látható. **Egyetlen meccspélda, nem teljes idényexport.**
   https://www.hunvolley.info/pr_a/010/009/p_009.asp?p_evad_kod=2025&p_fo_cim=NoiBudapestI.osztaly&p_merkozes_kod=6161&p_verseny_al_kod=93
2. **BRSZ mérkőzésarchívum / játékvezetői jegyzék:** nyilvánosan indexelt 2024/25-ös egyedi mérkőzéspéldák: 2025-04-10 Emericus SE – BEAC (Nő1), 2025-04-03 Dág KSE – Óbudai Egyetem-Kandó SC (FF1); 2025-01-08 MAFC-BME – Radzeer SE (Nő2). A jegyzék nem teljes, ellenőrzött bajnoki menetrend!
   https://www.brsz.hu/birok_osszes.php?biro_id=253
3. **BRSZ régi bajnokságok felület:** versenysorozatonként böngészhető archívum, ám a kezdeti találatok között Diákolimpia és Universitas is van; ezeket NEM szabad a felnőtt Budapest-bajnoksággal összekeverni.
   https://brsz.hu/bajnoksagok_old.php?sorozat_id=4
4. **Hivatalos MRSZ API közlemény (2020-04-27):** a közzététel szerint eredmény, menetrend, jegyzőkönyv és tabella lekérdezhető; hozzáférést és szerver-IP-t kértek. **A mai hozzáférés és a teljes múltbeli adatok lekérhetősége még nincs igazolva.**
   https://hunvolley.hu/index.php/archiv/az-mrsz-a-klubok-honlapjainak-menedzseleset-segitene/

### Bizonyítottság – nem szabad összemosni

- **Igazolt:** 2026/27-es, meglévő adatbázis leltára; legalább néhány 2024/25-ös BRSZ-meccsnyom és 2025/26-os MRSZ-jegyzőkönyvpélda.
- **Nincs igazolva:** mind a 25 csapat teljes 2024/25–2025/26 eredménylistája, kerete, játékosprofil-linkje, megbízható játszott szettadat vagy nevezéslista; idények közötti team ID-k és játékos ID-k teljes megfeleltetése.
- **Nincs még:** a történeti bajnoki táblák és játékosok tömeges, ellenőrzött importja, szezononkénti lefedettségi százalék, hiteles egyéni erősségszám, kalibrált meccsesély.
- A K/CS jelölés **nem tekinthető automatikusan igazolt szett- vagy percszámnak**.
- Egyetlen kiválasztott BRSZ-sorozat eredményei nem reprezentálják a teljes felnőtt bajnoki rendszert.

## 4. Egységes adatmodell – még csak terv

`season`, `competition_id`, `group_id`, `source_team_id`, `canonical_team_id`, `match_id`, `starts_at`, `home/away`, `sets`, `set_scores`, `official_source_url`, `source_captured_at`, `verified`.

Játékos: `season`, `source_player_id`, `canonical_player_id`, `source_team_id`, `nomination`, `starter_status`, `substitute_status`, `played_sets_if_verified`, `role_if_verified`, `source_url`, `confidence`.

Keret: azonosított, **várhatóan játszó** játékosok; érkezők/távozók/megmaradók. A tavalyi csapatértéket **nem** szabad a megmaradó keret értékével kétszer növelni.

Számítás: eredményalapú alapmodell (Elo-jellegű, ellenfelek és szettarány alapján); külön A/B teszt a keretváltozási korrekció hozzáadásával, korábbi meccseken időrendi visszateszteléssel. Megjelenítés: rövid, tárgyilagos név, egy szám + lenyitható, forrásokkal és biztonsági jelzéssel ellátott magyarázat.

## 5. Következő etapon elvégzendő munka

1. Azonosítani a **hivatalos 2024/25 és 2025/26 felnőtt** Budapest I/II csoportkódokat; az egyes évadok névsorait összevetni a fenti 25+7 csapattal.
2. A forrásonkénti jogosultságot és teljes történeti listázást tisztázni (MRSZ API hozzáférhetősége; weboldal letöltési és felhasználási feltételei).
3. Kinyerni/megbízhatóan összekapcsolni az adott évad összes eredményét **külön stagingbe** (nem az éles forrástáblák felülírásával); ellenőrizni egyezést a hivatalos mérleggel.
4. A hozzájuk tartozó jegyzőkönyvekben játékosazonosító-, keret- és K/CS-mezők lefedettségét mérni. A 2026/27-es 8 protokollos rekord csak kiinduló minta.
5. Csapatonként és évenként minőségjelentés: meccs lefedettség, játékos ID egyezés, keretazonosság, forrás-verifikáció. Hiányosságoknál nullpont helyett „–”.
6. Közös, verziózott statisztikai számítás a Manager/Player számára; csak kiértékelt és visszatesztelt modell után győzelmi valószínűség.
7. Szükség esetén MRSZ: **backoffice@hunvolley.hu** (API, történeti évadok, dokumentált mezők, hozzáférés és IP-feltételek); ne kérj vagy tárolj chatben titkos kulcsot.

## Kiadási állapot

**DATA AUDIT V1 kész / történeti modell NO-GO.** A fellelt részadatokból történeti csapatértéket, játékospontszámot és oddsot most **nem** publikálunk. Nincs production adatírás, számítás- vagy UI-átállítás. Következő lépés a hiányzó hivatalos évadok és játékosazonosítók lefedettségi mérése.
