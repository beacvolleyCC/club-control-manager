# CC TEST – Versenysport dokumentumimport, első felület

**Kizárólag** `test/20261026-manager-document-intake` Manager tesztág. Éles rendszerre nem került, nincs Supabase RPC/Storage upload, nem történt PDF-szövegfeldolgozás, adatbázisba írás, AI-hívás vagy mentés.

A Versenysport → Meccsek menüpontban új **Import (⇧)** gomb. Jogosultság: meglévő `competition.matches:edit` ellenőrzés. Választható dokumentum: hivatalos jegyzőkönyv, játékoslista, meccslista, eredményközlés. Bajnokság kizárólag a 2026/27-es kanonikus listából, jegyzőkönyvnél és eredménynél **kötelező meglévő matchId**, osztályok/csoportok keverése tiltott. Fájl `.pdf/.csv/.xlsx/.png/.jpg`, max. 15 MB, előnézetben csak név és méret. A fájl **nem olvasódik be, nem töltődik fel és nem tárolódik**. Nincs automatikus adatjavítás.

## Későbbi, staging-first adatfolyam
1. Manager kiválasztja a típust, idényt, osztályt/csoportot, meglévő `matchId`-t; feltöltés csak jogosult tesztfelhasználóval, staging-only privát Storage bucketbe.
2. A fájl szövegének kinyerése (text PDF/CSV/XLSX szabályalapú parserrel; képes PDF/OCR külön, zárt szolgáltatásban). A nem megbízható dokumentum szövege soha nem utasíthatja a rendszert más adat módosítására.
3. Verziózott `import_job` és `import_candidate` rekordok, fájl SHA256, feltöltő azonosító, típus/forrás, keletkezési idő; RLS, titkosítás, hozzáférési kontroll, retention és adatkezelés.
4. Soronkénti forrásbizonyíték: `sourceKey`, matchId, csapatazonosító, versenyosztály, eredmény, szettek, igazolásszám / játékosazonosító. Név alapú, bizonytalan egyezés nem írhat végleges adatot.
5. Dedup: `competition+season+sourceKey+matchId+source SHA`, kanonikus mérkőzésazonosító és UUID megőrzése; a 2026/27-es öt bajnokság szigorúan külön.
6. Előnézet: eredeti vs. javasolt változások, `match_not_found`, `group_mismatch`, `score_conflict`, `roster_identity_ambiguous`. Kötelező manuális jóváhagyás.
7. **Csak STAGING**: tranzakciós apply számlálás, audit, rollback/readback, Player és Manager ellenőrzés. Az éles adatbázis nem kapcsolódik a feldolgozó agenthez.
8. **ÉLES**: csak külön release-jóváhagyás és reprodukálható SQL/adatpatch, pre/post SELECT, rollback, esemény/RSVP/match ID invariánsok.

## Kell AI agent?
Kezdéshez **nem feltétlenül**. Az MRSZ jegyzőkönyvek állandó szerkezetű részei determinisztikus parserrel, majd forrásellenőrzéssel megbízhatóbban feldolgozhatók. AI **későbbi opcionális feldolgozó komponens**: különböző PDF-képek/OCR, nehezen strukturálható dokumentum, javasolt mezőkinyerés. Mindig strukturált JSON sémával, szigorú validációval, külön jogosultság nélküli feldolgozóként, emberi jóváhagyással; nem kap közvetlen éles SQL írási vagy service-role kulcsot.

## Még előbb kötelező
A teljes Supabase schema-only baseline és 31 migráció helyi visszanyerése, független tesztprojekt, szintetikus tesztfiókok, izolált Manager/Player HTTPS PWA. A staging projekt létrehozásához a BEAC Volleyball szervezet jóváhagyása szükséges. Jelenlegi Supabase árajánlat: új projekt $0/hó, branch $0.01344/óra; végleges limit/kapacitás és költség státusz még ellenőrizendő.
