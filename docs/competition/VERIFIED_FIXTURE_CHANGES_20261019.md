# BEAC 2026/27 kiírásváltozás-audit – 2026-10-19

Forrás: éles Supabase `snqsxlyhontaepembaic`, csak olvasás; `competition_source_matches` (korábbi BRSZ import) vs. `cc_competition_user_schedule_v1` (felhasználói teljes kiírás). Időzóna: Europe/Budapest.

## Éles adatok (ellenőrizve)

- Teljes új import: 300 rekord, ebből 292 `fixture`, 8 `result`; 5 halasztott sor.
- Találkozó-override: 0 rekord; régebbi meccs-override: 1 rekord.
- `events`: 277; `availability`: 619. Csak olvastuk őket, nem módosultak.
- BEAC-t érintő új `fixture`: férfi I/B 12, női I 22 (közte egy **hibagyanús BEAC–BEAC**), női II/B 12; további női I-es `result`: 1.
- Régi BRSZ-forrásban 11 férfi I/B (közte hibagyanús BEAC–BEAC), 23 női I (közte BEAC–BEAC), 12 női II/B. Az import- és forrásdarabszám **nem ugyanazt jelenti**; a 8 eredmény nem menetrendi mérkőzés.

## Biztosan azonosítható áthelyezések

Az egyezés feltétele: ugyanazon bajnokság/idény, pontosan azonos hazai és vendég megnevezés, mindkét forrásban kizárólag egy-egy ilyen irányú párosítás, érvényes kezdés. A `BEAC–BEAC` anomália kizárva. Névazonosság **önmagában nem általános stabil mérkőzésazonosító**.

| Bajnokság | Meccs | Régi | Új | Régi `linked_event_id` | Jelenlét | Event státusz |
|---|---|---|---|---|---:|---|
| Férfi I/B | BEAC–PDSE | 2026-10-12 19:30 | **2026-10-19 19:30** | `c7d5c6f3-7f05-41ce-9a03-c8a429002ccb` | 9 | cancelled |
| Női II/B | BEAC II.–UTE U-20 Pink | 2026-10-13 19:30 | **2026-10-20 19:30** | `b99c5397-8b51-40d0-a03c-e399c011bd3e` | 14 | cancelled |

A korábbi Player események **lemondottak és a régi időponton állnak**, így az új kiírás még **nem** frissítette őket. A 9+14 jelenlétet meg kell őrizni. Nem ment ki értesítés.

## Megoldandó kiadási blokkolók

1. A Manager `ccOpenSourceMatchEditor_` az `cc_manager_competition_match_full_save_v1` RPC-t hívja, amely az éles adatbázisban **nem létezik** (csak fejlesztési SQL). Ne merge-eld a meccsszerkesztőt enélkül.
2. Az új menetrend és a régi kézi javítások összevonása a Managerben `pair + ±60 nap` ablakos; a Playerben is közelítő. Ne telepítsd stabil azonosítós / egyértelműségi QA nélkül.
3. A régi mérkőzés és az új felhasználói kiírás eltérő `source_key` azonosítót használ: csak **ellenőrzött és auditált** egyezéseket kapcsoljunk; az idegenbeli/hazai visszavágókat és az azonos nevű, különböző MAFC csapatokat ne olvasszuk.
4. A lemondott BEAC–PDSE / BEAC II–UTE Player-események külön adminfolyamatot igényelnek, nem automatikus állapot/RSVP átírást.
5. A női I-es `2026-11-10 BEAC–BEAC` és a régi férfi I/B `2027-01-13 BEAC–BEAC` hibagyanús, nem érvényesíthetők automatikusan.
6. Az új férfi I/B Mozdulj SE szerepel az importban; az új menetrendben az első BEAC elleni meccs 2026-11-18, a visszavágó 2027-02-08.
7. Kiadás előtt Manager+Player CI, PWA frissítés, eredmény/statisztika, csak nem üres megjegyzés, találkozóidő, jogosultság, visszaolvasás és valódi Pages deploy ellenőrzendő.

**Összegzés:** read-only adatellenőrzés kész. A jelenlétet, `events`-et, `availability`-t, hivatalos forrásokat és a játékosok értesítéseit nem érintettük.
