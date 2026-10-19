# 2026/27 női Budapest I. — történeti csapatnév- és ellenfél-azonosítás

**Dátum:** 2026-10-19. **Adatminőség:** 12/12 jelenlegi csapat BRSZ-azonosítóval, 8/12 belső forrással alátámasztott múlt idényes névkapcsolattal, 2/12 külön ellenőrzendő, 2/12 előző idénybeli női I. adat nélkül. **Nem személyi/keretazonosság és nem győzelmi előrejelzés.**

## Használt források

- 2026/27: `data/brsz_group_fixtures_2026_27_source.json` — 2026.10.01-én rögzített BRSZ kiírás, Női I. kategória, név és numerikus BRSZ csapatazonosító. **A beolvasott dokumentum archívum, nem élő versenyszövetségi adatlekérés.**
- A 2026.10.18-i felhasználói teljes kiírás `cc_competition_user_schedule_v1` éles tábla `womenI` neveivel összevetve a 12 különböző név szerepel.
- 2025/26: `data/competition-history/women1_2025_26_official_league_snapshot.json`, teljes hivatalos MRSZ I. osztályú tabella és 129 eredményes mérkőzés.
- Ugyanezekre a mérkőzésekre épülő, önálló 1500-ról induló kísérleti Elo: `data/competition-strength/women1_2024_2026_elo_experimental.json`. **Csak történeti, nem hitelesített teljesítménymodellezés.**

## Kifejezett névkapcsolatok

| 2026/27 | BRSZ ID | 2025/26 női I. csapat | Kapcsolat |
|---|---:|---|---|
| BEAC | 299 | Budapesti Egyetemi Atlétikai Club | 2025/26-os MRSZ-meccslistán BEAC rövidítéssel szerepel |
| Emericus SE | 12 | EMERICUS SE | Kizárólag betűméret-eltérés |
| Közgáz SC | 18 | Közgáz női | MRSZ-meccslistán Közgáz SC rövidítéssel szerepel |
| KRE SC | 1094 | Károli Gáspár Református Egyetem Sport Club | MRSZ-meccslistán KRE SC rövidítéssel szerepel |
| KSE | 644 | KSE | Pontos egyezés |
| MAFC-ÉPK | 835 | MAFC-ÉPK | Pontos egyezés |
| Panoráma SE | 753 | Panoráma SE | Pontos egyezés |
| Ráckeve | 961 | Ráckeve | Pontos egyezés |
| Mozdulj SE | 863 | Mozdulj | **Ellenőrzendő**: azonos nevű/szervezetű csapat gyanúja, de szezonközi MRSZ–BRSZ csapatkód-azonosság még nincs igazolva |
| MTK | 1092 | MTK Budapest | **Ellenőrzendő**: rövidítés; a női II. osztályban külön MTK kék csapat van. Korábbi/jelenlegi csapatkód és keret ellenőrzendő |
| Óbudai Egyetem-Kandó SC | 1159 | — | A 2025/26 női I. tabellájában nem szerepel, **nem kap I. osztályos történeti Elo-t** |
| Semmelweis Egyetem | 917 | — | A 2025/26 női I. tabellájában nem szerepel, **nem kap I. osztályos történeti Elo-t** |

Utóbbi két csapatnál létezik 2025/26-os női II. osztályú versenynyom:
- Kandó a 2025/26-os női Budapest II. A csoportban szerepel egy hivatalos jegyzőkönyvön ([MRSZ, mérkőzés 6189](https://www.hunvolley.info/pr_a/010/009/p_009.asp?p_evad_kod=2025&p_merkozes_kod=6189&p_verseny_al_kod=97)).
- A Semmelweis Sport Klub a női Budapest II. mezőnyében vezetett (az [Emericus SE második csapatának szezonarchívuma](https://emericus.hu/szakosztaly/csapat/roplabda/emericus-se-bp-2) szerint). Ez **nem igazolja**, hogy a 2026/27-ben használt „Semmelweis Egyetem” pontosan ugyanaz a versenycsapat.

## Kiadási szabály

- Szövetségi helyezés/győzelem/vereség/szettadat csak a **2025/26** címkével jelenhet meg.
- Kísérleti Elo csak külön címkével, nem hivatalos erősségnek vagy 2026/27-es helyezésnek nevezve.
- **Mozdulj SE** és **MTK** múltidény-kapcsolata `review_alias`, ezért a megjelenítésükhöz figyelmeztetés szükséges.
- Az előző szezonban más osztályban játszott csapat nem kaphat kitalált 2025/26-os I. osztályú mutatót.
- Egyetlen `currentStrengthRating` sincs: mind `null`. Ezt csak aktuális eredményekkel, igazolt csapatkapcsolással és visszateszteléssel lehet később bevezetni.
- **Egyetlen mostani BRSZ csapatazonosító sem igazolja automatikusan a teljes előző idényes keret/játékosállomány folytonosságát.** A pillanatnyi tudás csak történeti név- és bajnoki eredményegyezés.

## Reprodukció

```sh
node scripts/history/build-women1-elo.cjs
node scripts/history/build-women1-current-lookback.cjs
node --test tests/women1-historical-strength.test.cjs tests/women1-current-lookback.test.cjs
```

A két generált JSON-t külön QA vizsgálja: nincs fuzzy automatikus csapatösszemosás, nincs 2026/27-es modellérték, nincs idegen ligából bemásolt Elo, pontosan 12 külön BRSZ azonosító és 8+2+2 audit-eloszlás.
