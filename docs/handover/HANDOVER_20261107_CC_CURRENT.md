# Club Control – aktuális handover (2026-11-07)

## Kötelező folyamat
Minden érdemi kód-, DB-, konfiguráció-, PR-, teszt-, deploy- vagy státuszváltoztatás után ugyanabban a munkakörben frissítendő ez a handover és a HANDOVER_CURRENT.md mutató. A beszélgetés hosszának növekedéséről időben figyelmeztetni kell a felhasználót, és új beszélgetéshez CC-FOLYTATÁS összefoglalót kell készíteni.

## Ellenőrzött állapot (GitHub)
- Manager main alkalmazáskód: 8d58d29cfdbb78fdd7741dfe939708bac5e2612a; ezt követő dokumentációs commit: 3bd4991da751a3758ff2c3cee29e367aaa3219bc.
- Manager #85: BEAC import/bérletszám egyeztetés és auditált korrekció, MERGED, e059a31e. Bejelentkezett LIVE UI + valós DB audit readback még nincs hitelesítve.
- Manager #87: múltbeli edzések legújabb elöl, kézi pénzügyi dátum ma (null/1970 javítás), MERGED, 8d58d29c. A LIVE Cloudflare deployment státuszát külön kell ellenőrizni; GitHub commit önmagában nem bizonyítja.
- Manager #86: kompakt jelentkezéssorban nincs BEAC részlet; lenyitva részletek és javítógombok; eltérésnél !. OPEN, NEM LIVE, branch fix/20261106-mass-roster-details-only, head 1037d502b6ac7649a53e6ad6cbd0904697c417ae. A main közben változott; újraalapozás, diff és regressziós QA szükséges merge előtt.
- Ismert korábbi versenysportos névsor teszthiba; ne tulajdonítsuk a #85/#87 hotfixnek, de izoláljuk és javítsuk.
- Manager #79 2026/27 meccsek és hivatalos jegyzőkönyvek kombinált RC, DRAFT; Player #28 kapcsolódó statisztika/menetrend QA DRAFT. Nem élesek.
- Manager #80 biztonsági ACL, #77 explicit grants, #78 handover, #74/#75/#76 további draftok; semmit nem szabad automatikusan összevonni.

## Következő végrehajtási terv
1. READ-ONLY: Manager main / #86 diff és CI; a main új commitjaihoz igazítás; célzott névsor teszt és meglévő versenysportos teszthiba okának izolálása.
2. LIVE kiadás előtt: #86 target QA, teljes regresszió, Cloudflare/Pages build+deploy ellenőrzés, PWA cache és rollback. Bejelentkezett tömegsportos részletes névsor megjelenítésének manuális ellenőrzése.
3. Valós BEAC-bérlet számkorrekció csak kiválasztott, engedélyezett tesztrekordon, előtte/utána SELECT, auditnapló, és visszaolvasás. LIVE rekordot véletlenszerűen nem írunk át.
4. TEST: játékosok/edzések/meccsek/jelentkezések egységes forrásának inventoryja, schema/RPC/RLS és Manager/Player contract-mátrix; a tesztadatokat és az elkülönítést igazolni kell.
5. TEST modulátírás sorrendje: (a) auth/jogosultság csapatszinten; (b) edzések + RSVP + jelenlét + automatikus éjféli feldolgozás; (c) bérlet/pénzügyek; (d) meccsek + jegyzőkönyv + eredmények; (e) tabella + statisztika; (f) naptár/push. Minden modulhoz DB migráció, idempotens RPC, RLS, UI, integrációs és rollback teszt.
6. Kiadási kapu: TEST-en sikeres kétirányú mentés-visszaolvasás, jogosult/nem jogosult auth, iPhone PWA, 11 pontos duplán futtatott QA, LIVE előtt explicit döntés.

## Kockázatok és korlátok
- TEST és LIVE DB-t, Workers-t és cache-t ne keverjük; LIVE írás csak külön engedéllyel.
- A PR-ok merge-je nem egyenlő telepítési vagy valódi felületi sikerrel.
- A különböző bajnoki osztályok, női/férfi csapatok és MRSZ azonosítók nem vonhatók össze találgatással.
- Jelen dokumentum csak státusz- és előkészítési frissítés; nem bizonyít új tesztfutást, adatbázis-írást vagy deployt.

## Következő indító kulcs
CC-FOLYTATÁS – olvasd a HANDOVER_CURRENT.md-t és ezt a 2026-11-07-es átadást; kezdj #86 read-only diff/CI és TEST schema/contract inventory ellenőrzéssel.

## 2026-11-07 – négyfeladatos párhuzamos READ-ONLY vizsgálat
- Supabase projektek azonosítva: LIVE `snqsxlyhontaepembaic`, TEST `szzoubvhlwnojtzqjebc`; mindkettő ACTIVE_HEALTHY. Azonos nevű projektet ne tévesszünk össze.
- TEST-ben `manager_accounts` 1, `manager_module_permissions` 14, `teams` 3, `players` 19, `events` 12, `availability` 69, `mass_bookings` 1, `mass_passes` 0, `mass_live_write_audit` 0 (list_tables becslések). LIVE-ban `manager_accounts` 0, `manager_module_permissions` 0, `players` 47, `availability` 879, `mass_bookings` 1061, `mass_passes` 363, `mass_live_write_audit` 1552. Az eltérés kritikus: a TEST nem reprezentálja a LIVE tömegsportos bérlet-/jelentkezés-forgalmat; a TEST #86 teljes end-to-end QA-hoz kontrollált fixture kell.
- TEST-ben megtalálható `cc_manager_mass_booking_pass_number_set_v1(p_booking_id text,p_pass_number text,p_reason text)` és `cc_manager_mass_event_detail_v1`; LIVE-ban a bérlet-/audit táblák léteznek. A DB-függvények tényleges definíciója, grants és auth-policy még részletes ellenőrzést igényel. A vizsgált publikus Manager RPC-k többsége SECURITY DEFINER: jogosultság- és EXECUTE-audit kiemelten fontos.
- A #86 GitHub PR OPEN, `mergeable:false` értékkel érkezett; head `1037d502b6ac7649a53e6ad6cbd0904697c417ae`, base `e059a31e`. A main azóta változott. Nincs bizonyított merge-kész állapot, célzott teszt vagy sikeres deploy; emiatt **nem történt LIVE merge**.
- A korábbi versenysportos teszthiba pontos fájlja és reprodukciója még nincs azonosítva, ezért nem jelölhető javítottnak.
- A BEAC audit adatforrás ellenőrzése metaadat- és oszlopvizsgálat volt, **nem valós mentés–visszaolvasás teszt**; sem LIVE, sem TEST adatsort nem módosítottunk.
- Következő: #86 diff és célzott CI + régi teszt izolálás; TEST fixture előkészítése külön izolált rekordokkal; auth/RPC grant és audit payload kulcsok ellenőrzése; csak ezután kiadási döntés.
