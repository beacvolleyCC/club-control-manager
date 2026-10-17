# CC / női Budapest I. – 2025/26 történeti adatok, 2. etap

**Dátum:** 2026-10-17
**Státusz:** STAGING / csak forrásbizonyítékok, nincs publikálható erősségi rangsor.
**Kapcsolódó első felmérés:** [MRSZ_HISTORY_DATA_AUDIT_2026-10-17.md](./MRSZ_HISTORY_DATA_AUDIT_2026-10-17.md)

## Kész munka (tényleges állapot)

- A három BEAC-csapat teljes történeti feldolgozása előtt a **női Budapest I. 2025/26** idény lett az első validálási minta.
- Létrejött egy **13 mérkőzésből álló, kézzel ellenőrzött forrásminta** `data/competition-history/women1_2025_26_evidence_sample.json` alatt. Ebből **4 saját kluboldali**, **9 másodlagos eredményoldali** adat. A 13 **nem a bajnokság mérkőzésszáma**; nem tekinthető teljes eredménylistának. Minden sorban az eredeti forráslink és a forrás típusa szerepel.
- Nyilvánosan indexelt MRSZ-jegyzőkönyv **Mozdulj–EMERICUS SE, 2026-01-21, mérkőzés 6161**; forrás URL alapján `p_evad_kod=2025`, `p_verseny_al_kod=93`. Az utóbbi paraméter **csak ezen az egy URL-en megfigyelt**, nem igazolt bajnokságszintű API-kulcs vagy minden szezonra stabil kód.
- A jegyzőkönyvi fejlécben látható K/CS és játékoskód oszlop, **de a konkrét játékosnevek/kódok a jelenlegi böngészési hozzáféréssel nem voltak kiolvashatók**. K/CS alapján sem következtetünk játszott szettre.
- A történeti sorok nem Supabase-adatok, és se a Managerben, se a Playerben nem megjelenítendő tényadatok hivatalos forrás-ellenőrzés előtt.

### Felhasznált források és pontosság

**Klub által publikált mérkőzések:** Panoráma SE, saját 2025/26-os eseménynaptár. A 2025. novemberi négy felnőtt női I.-es adat:
- 2025-11-06, KRE SC–Panoráma SE, 1–3
- 2025-11-13, EMERICUS SE–Panoráma SE, 3–1
- 2025-11-20, MAFC-ÉPK–Panoráma SE, 1–3
- 2025-11-24, Ráckeve–Panoráma SE, 3–2

Forrás: https://panoramase.hu/2025-2026-esemenyek/

**Független eredményoldali ellenőrzendő sorok:** MAFC-ÉPK 2025/26-os mérkőzéslistája, Vasas SC 2 listája, valamint SportsEvents24 megjelenített női I.-es meccsek. Ezekből kilenc mintarekord került be. Nem állítjuk, hogy teljes vagy hibamentes adatbázis.

- https://m.24score.com/volleyball/team/hungary/mafc_epk_%28f%29/
- https://en.24score.com/volleyball/team/hungary/vasas_sc_2_%28f%29/
- https://sportsevents24.com/federation/90/volleyball-hungary-hungarian-volleyball-federation

**Hivatalos jegyzőkönyvpélda (eredmény és keret nélkül):**
https://www.hunvolley.info/pr_a/010/009/p_009.asp?p_evad_kod=2025&p_fo_cim=NoiBudapestI.osztaly&p_merkozes_kod=6161&p_verseny_al_kod=93

**Kockázat a Panoráma saját oldalon:** a címe 2025/26, de egyes késő tavaszi sorokban **2025** van 2026 helyett. Ezért ebből az első mintába kizárólag a jól azonosítható **2025. novemberi** tételek kerültek, és semmilyen dátumot nem javítottunk ki önkényesen.

## Mely aktuális csapatoknak van legalább névegyező korábbi előzménye?

Az automatikus szűrés a 2026/27-es női I.-es 12 csapatnevet a 2025/26-os **13 mintameccs** neveivel veti össze. Csak ékezetet/kötőjelet normalizál; ez **nem igazolja a szezononkénti csapatazonosságot**.

A mintában név szerint előforduló 2026/27-es csapatok: BEAC, EMERICUS SE, Közgáz SC, KRE SC, KSE, MAFC-ÉPK, Mozdulj SE, Panoráma SE és Ráckeve.

**További ellenőrzés:** a 2025/26-os MTK Budapest és a jelenlegi `MTK` csak név alapján nem köthető biztonsággal össze: a korábbi listákon `MTK 2` is szerepel. A jelenlegi Óbudai Egyetem-Kandó SC és Semmelweis Egyetem nincs a 13 meccses mintában; ebből nem következik, hogy nem szerepeltek régebbi idényben vagy másik osztályban.

## Automatikus adatminőség-kapu

- `scripts/history/evidence-audit.cjs`: csak helyi JSON-olvasás, **nincs hálózati vagy adatbázis-hozzáférés**, nincs éles rekord módosítás.
- `tests/history-evidence-audit.test.cjs`: forrás URL, sport, szezon, szabályos befejezett mérkőzés (3–0/3–1/3–2 és fordítva), duplikált rekord, igazolatlan hivatalos státusz, elégtelen játékosazonosítás, csapatalias-ütközések.
- `.github/workflows/history-evidence-qa.yml`: külön CI, nem szükséges Manager/Player statisztikák újratöltése.
- Futtatás: `node scripts/history/evidence-audit.cjs`, `node --test tests/history-evidence-audit.test.cjs`.
- A kiértékelés **nem** számol bajnoki lefedettséget, erősorrendet, játékospontszámot vagy előrejelzést a részleges mintából.

## Következő szigorú ellenőrzési feltételek

1. A **teljes 2025/26-os hivatalos eredménylista** és teljes tabella lekérhetőségét megerősíteni: minden meccs kódja, dátuma, csapata és eredménye.
2. Szezononként és bajnokságonként ellenőrzött forráscsapat-ID. Ugyanazon klub külön csapatai nem vonhatók össze.
3. Hivatalos jegyzőkönyvenként **ténylegesen olvasható** játékos-ID, nevezés és K/CS státusz lefedettségi arányának mérése, majd a 2026/27-es nevezésekkel összevetés.
4. Csak ezután külön kiértékelés az eredményalapú és a játékoskeretet is használó változatról. Visszatesztelés nélkül semmilyen „odds” vagy egyéni értékszám nem kerül éles megjelenítésre.

**GO/NO-GO:** történeti forrásminta + ellenőrző eszköz **GO**; komplett 2025/26 történeti bajnoki adatok, keretazonosítás és előrejelzés **NO-GO**.
