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
