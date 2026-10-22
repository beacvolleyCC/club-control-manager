# CC-FOLYTATÁS — privát Apple Calendar fejlesztési állapot (2026-10-22)

**Státusz:** fejlesztési ágakon, **nem élesítve**. A 2026-10-22-es főági handover és a canonical adatmodell változatlanul irányadó.

## Fejlesztési ágak és PR-ok
- Manager [draft PR #72](https://github.com/beacvolleyCC/club-control-manager/pull/72), `feat/20261022-private-ios-calendar-phase1`.
- Player [draft PR #25](https://github.com/beacvolleyCC/player_application/pull/25), `feat/20261022-ios-calendar-subscription`.
- A két PR összefügg; **ne merge-eld egyiket sem egyedül** és ne kapcsold be az új UI-t amíg a DB és az Edge Function nincs telepítve és valódi jogosultsági teszttel igazolva.

## Elkészített, de még nem telepített backend
1. `sql/cc_private_calendar_feed_tokens_v1.sql`: 32 kriptográfiai véletlen bájt, privát SHA-256, RLS, anon tiltva, saját játékosazonosság, aktív csapattagság, atomikus rotáció/visszavonás, visszaolvashatatlan titok, állapotlekérdezés.
2. `sql/cc_private_calendar_feed_read_v1.sql`: service-role-only `cc_calendar_feed_read_v1(text)`, érvényes auth account + játékos, élő team membership; saját naptárnál csak `availability.status='going'`. Kizárólag szükséges `events` mezők, meeting-at és meeting-place opcionálisan.
3. `supabase/functions/cc-calendar/index.ts`: önálló, token-hash alapú GET/HEAD HTTP feed (`verify_jwt=false` a gateway-n, de a tokent **a backend minden kérésnél ellenőrzi**), no-store, általános 404 hiba, nem naplózza a hivatkozást. Éles deploy még nem történt.
4. `supabase/functions/cc-calendar/ics.mjs`: RFC5545 kimenet, UTC, CRLF/UTF-8 folding, escaping, állandó UUID-UID, LAST-MODIFIED és SEQUENCE, CANCELLED; nem tartalmaz jelenléti/egészségügyi adatot.
5. `sql/cc_push_meeting_at_change_v1.sql`: a már létező Manager explicit push/trigger/outbox logikájának célzott javítása, hogy `meeting_at` változás is észlelhető legyen. **Nem telepített, meglévő push függvényeket érint, külön release QA szükséges.**

## Player
`index.html` naptárpanelen két scope, létrehozás, másolás, `webcal://` gomb, visszavonás; `calendar-subscription.js/css` külön modul, bearer URL csak a nyitott panel memóriájában, nem localStorage-ban. Régi Apple/Google egyszeri ICS export nem változott. Egységes `20261022-private-ios-calendar-v26` cache + SW CORE az új JS/CSS-re. `app.js` változás kizárólag két service-worker cache-paraméter.

## 11 pontos QA kétszeri ellenőrzési kapu
| # | Követelmény | Kód/CI QA | Valódi DB / iPhone |
|---|---|---|---|
| 1 | Események, jelentkezések, tagságok megőrzése | Kétszer olvasott baseline: 279 / 666 / 59; nem volt DML | Live adat egyezik; későbbi migráció után is újramérni |
| 2 | Anon és idegen account tiltása | Grant/RLS + auth ellenőrzés kódban | **Nyitott**: auth E2E |
| 3 | Csapattagság/átigazolás kizárása | Membership-validáció kódban | **Nyitott**: visszavonás után 404 |
| 4 | Titkos token és hash | 256 bites véletlen / SHA-256, nincs storage/log a frontendben | **Nyitott**: DB olvasás, napló audit |
| 5 | Rotáció és revoke, egyidejűség | Tranzakciós SQL és kliens UI tesztek | **Nyitott**: párhuzamos RPC |
| 6 | Saját going vs not_going, csapat scope | SQL feltételek + UI ellenőrzés | **Nyitott**: két azonosított user |
| 7 | UID, CANCELLED, archív | Node ICS automata tesztek | **Nyitott**: Apple újratöltés |
| 8 | UTF-8, CRLF, Budapest DST | Node ICS automata tesztek | **Nyitott**: iOS nyári/téli átállás |
| 9 | Push dedupe/opt-in, meeting_at | Meglévő trigger/RPC/sender auditálva; SQL patch staged | **Nyitott**: tényleges push, jogosult eszköz |
| 10 | Régi export és PWA, JS | Player Node és regressziós workflow | **Nyitott**: bejelentkezett iPhone Safari/PWA |
| 11 | CI, SHA, PR diff, 2× | GitHub pipeline(ok), kétszeri GitHub-fájlvisszaolvasás | **Nyitott**: éles Pages/Apple ellenőrzés |

**Apple működési korlát:** az ICS automatikusan letölthető újra, de az Apple Naptár frissítési periódusa nem kényszeríthető, az azonnali riasztás csak külön engedélyezett Club Control push.

**Adatvédelmi és iOS nyitott pont:** `mine` scope-ból eltűnő jelentkezéseknél az esemény a következő feedből kimarad; az Apple korábbi importjának tényleges eltávolítását telefonos E2E-ben igazolni kell. A szándékosan visszavont token 404-et ad, a telefonon korábban megjelenített eseményeket a feliratkozott naptár törlésével lehet biztosan eltüntetni.

**Következő:** tesztprojekt/törlés nélküli tranzakciós SQL-validálás → anon/own/foreign-auth valódi E2E → Edge Function telepítés csak ezután → Player PR release → kétkörös iPhone push/naptár QA. A canonical 298 bajnoki meccs **nem** automatikus Player event, és változatlan maradt.
