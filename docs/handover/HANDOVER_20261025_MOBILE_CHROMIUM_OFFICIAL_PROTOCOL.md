# CC-FOLYTATÁS — hivatalos jegyzőkönyv mobilos böngésző QA, 2026-10-25

**Fejlesztési állapot:** minden PR továbbra is DRAFT; nincs production merge, Supabase SQL migration, Cloudflare deploy vagy működő játékos-/eventadat módosítás.

## Megvalósított működés

- [Manager PR #76](https://github.com/beacvolleyCC/club-control-manager/pull/76): a hosszú, két csapatos hivatalos jegyzőkönyv modális ablakának fejléce és bezárógombja mobilon **sticky**, ezért a 19+19 játékos átgörgetésekor is látható. A két névsor vízszintesen görgethető keskeny kijelzőn, a jegyzőkönyv újranyitáskor a lista elején kezdődik. HTML / JS / CSS / Service Worker cache token `20261025-protocol-mobile-v2`.
- [Player PR #28](https://github.com/beacvolleyCC/player_application/pull/28): a jegyzőkönyv saját 44×44 px bezárógombja a mobilos scroll konténeren belül **sticky**; a 320 px-es névsor nem zsugorodik olvashatatlanra, vízszintesen lapozható; újranyitáskor a görgetés nullázódik. Az iOS viewport-ról a `maximum-scale=1,user-scalable=no` tiltást eltávolítottuk, ezért a kétujjas nagyítást nem akadályozzuk. Egységes `20261025-protocol-mobile-v2` PWA cache token.
- A már véglegesített 2026/27-es mérkőzéskiírás és a két hivatalos jegyzőkönyvi eredmény **nem módosult**. A 41 régi BRSZ azonosító kezelése külön feladat, nem blokkolja a kiírást.

## Tényleges böngészős ellenőrzés

A [Manager PR #74](https://github.com/beacvolleyCC/club-control-manager/pull/74) független PostgreSQL 17 CI-workflow-ja:
1. két külön üres adatbázisban felépíti a 298 canonical fixture-t, és a 2026-10-21-i MRSZ #2686 és #2700 PDF-ekből eredő 38 játékos adatát két **meglévő** match UUID-ra telepíti — 13 helyett 15 eredmény, továbbra is 298 mérkőzés;
2. a konkrét **Manager #76** `b97ed731be1eb51f40f06eb06cb2bc2eeea9417c` és **Player #28** `55eb674f22104cdbc84768c71a4040396ac44cd5` SHA-kat külön checkoutolja, merge nélkül;
3. a PostgreSQL által előállított tényleges JSON-kimenettel futtatja mindkét alkalmazás saját jegyzőkönyv- és meccskártya-rendererét, az ismert csapatok, szettek, csere/liberó/kapitány-jelölések változtatása nélkül;
4. `tests/official-protocols-20261021/chromium-mobile-protocol-layout.test.cjs`: **valódi headless Chromium** böngészőben a két app CSS-e és HTML dialogja alapján ellenőrzi a 320 px, 390 px és 768 px szélességet (**6 mobil elrendezési teszt minden PostgreSQL körben**), a modális ablak szélességét, a függőleges 19 fős névsor-görgetést, látható sticky bezárót, a 320 px-es vízszintes névsor-swipet és az Escape bezárást;
5. az alkalmazás-kódhoz közeli külön eseményteszt ellenőrzi az érintés/kattintás, Enter, Space, beágyazott gombok és a görgetés visszaállítását;
6. mindkét elkülönített DB-n továbbra is fut a 7 szintetikus felhasználói identitás × 2 v2 jogosultsági RPC; a jogosulatlan felhasználó nem kapja meg a 38 fős jegyzőkönyveket;
7. az eredmények stabilitását, újrafuttathatóságát, rollbackot és félbeszakított import ellenőrzését megőrzi.

**Eredmény a végső kódverzión:** [Official protocols canonical PostgreSQL QA #40207643846](https://github.com/beacvolleyCC/club-control-manager/actions/runs/40207643846) **SUCCESS**, a második független párhuzamos futás #40207639799 szintén SUCCESS, SHA `fb1c8d3fee0a2603ae706add808f6d2ee17aa56d`. Az egyéb Manager PR #74 workflow-k is SUCCESS. Manager #76 aktuális hét QA-workflow-ja és Player #28 négy QA-workflow-ja szintén zöld.

## LIVE READ-ONLY ellenőrzés

Két egymástól független `SELECT` (2026.10.25): **279 events / 676 availability / 298 canonical matches / 13 played**; a két forrásfixture megvan, de **0** `officialProtocolEvidence` kiadott overlay. A két új eredmény tehát **NEM látszik még élesben**, hiába kész a renderelés.

## Korlátok és szükséges további jóváhagyás

A Chromium mobilméretű emuláció **nem ugyanaz, mint valós iPhone 11/iOS Safari**; nem bizonyít PWA standalone safe-area, iOS dialógusfókusz, VoiceOver, valódi touch gesztus és offline SW viselkedést. A teszt szerepkörök szimuláltak, nem valódi Supabase JWT-loginok. Emiatt a tényleges bejelentkezett és nem jogosult Manager/Player teszt, valós iPhone UX, megismételt 11 pontos QA, release owner jóváhagyás és rollback-kapu **hátravan**.

**Következő lépés:** valódi hitelesített E2E ellenőrzés a kiadási terv szerint, kizárólag jóváhagyott tesztfiókkal és nem érzékeny adatokkal; csak utána lehet dönteni a Manager #74 DB overlay, Manager #76 felület és Player #28 megjelenítés összevonásáról és élesítéséről. **Nem szabad a 41 legacy aliasra visszaváltani mint blockerre.**
