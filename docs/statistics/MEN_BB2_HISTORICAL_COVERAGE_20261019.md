# Női BB2 és férfi 2025/26 – történeti adatlefedettség (2026-10-19)

**Állapot:** részleges kutatási adatok és 2026/27-es csapatazonosítás. Nem teljes bajnoki archívum, nem hivatalos erősségi rangsor, nem győzelmi előrejelzés.

## Jelenlegi mezőny
Forrás: a felhasználó 2026.10.18-án újraküldött teljes versenykiírása (`feat/fixture-meeting-notes-20261018/data/competition/2026-27/men-b-fixtures.psv` és `...women-ii-b-fixtures.psv`), a régebbi 2026.10.01-es csapatkód-archívum `data/brsz_group_fixtures_2026_27_source.json` és a Supabase `cc_competition_user_schedule_v1` szerinti 2026/27-es liga.

- **Férfi I/B:** BEAC, Corvinus, MAFC-Schönherz, MAFC-Vásárhelyi, Mozdulj SE, PDSE, Semmelweis Egyetem. **PDSE** két külön numerikus csapatkóddal (1091, 1214) fordult elő egy régi forrásban; ezek közül nem választottunk automatikusan. **Mozdulj SE** új tag az október 18-i kiírásban, a korábbi férfi csapatkód nem azonosítható. Különösen fontos: női Mozdulj kódját semmiképp nem lehet férfiakhoz kapcsolni.
- **Női II/B – BB2:** BEAC II., Corvinus, MAFC-BME, MTK kék, Radzeer SE, RKSK felnőtt női, UTE U-20 Pink. Mindegyikhez az október 1-i BRSZ kiírásból külön jelenlegi csapatkód tartozik.

## 2025/26: korlátozott történeti eredmények

A **BEAC II.** 2025/26-ban a *női Budapest II. A csoportban* játszott, a 2026/27-es mezőnyben a *B csoportban* szerepel. Az alábbi nyolc korábbi eredmény másodlagos aggregátorból azonosított **kutatási minta**, nem teljes 2025/26-os mérleg:

| Dátum | Mérkőzés | Eredmény | Forrás |
|---|---|---|---|
| 2025.11.11. | BEAC II.–KEAC | 3–0 | [SportEvents24](https://sportsevents24.com/federation/90/volleyball-hungary-hungarian-volleyball-federation) |
| 2026.01.12. | MAFC-BME–BEAC II. | 0–3 | ugyanott |
| 2026.01.20. | BEAC II.–Budai XI. C | 3–1 | ugyanott |
| 2026.02.03. | ÓE-Kandó SC–BEAC II. | 3–0 | ugyanott |
| 2026.02.10. | Corvinus női–BEAC II. | 0–3 | ugyanott |
| 2026.02.17. | BEAC II.–HZSE | 3–0 | ugyanott |
| 2026.03.03. | BEAC II.–MAFC-BME | 3–0 | ugyanott |
| 2026.03.04. | KEAC–BEAC II. | 1–3 | ugyanott |

Azonos szezonbeli csapatlista és teljes eredményállomány hiányában **nem számítható az itt talált nyolc meccsből korrekt idényzáró győzelmi mérleg vagy Elo**. Ezen adatok szövetségi ellenőrzése még szükséges. Hivatalos MRSZ versenyjegyzőkönyv bizonyítja, hogy az [Óbudai Egyetem–Kandó SC](https://www.hunvolley.info/pr_a/010/009/p_009.asp?p_evad_kod=2025&p_merkozes_kod=6189&p_verseny_al_kod=97) a női II. A csoportban indult, de egyetlen jegyzőkönyv önmagában nem igazolja a teljes csoport tabelláját.

A férfi BEAC 2025/26-os **teljes, hitelesített bajnoki eredményadatbázisa még nem áll rendelkezésre**. A jelenlegi B csoporthoz nincs garantáltan összehasonlítható teljes előző szezonos történeti alap. Ezért nincs jelenlegi vagy korábbi idényes Elo-érték és állítólagos helyezés.

## Technikai határvonal

- Adat: `data/competition-strength/men-bb2_202627_historical_coverage.json`; `completeness` explicit módon megkülönbözteti a részleges forrást és a hiányzó archívumot.
- Felület: **Manager → Versenysport → Előző idény**, három külön BB1/BB2/Férfi választóval.
- A BB1 korábbi 2025/26-os hivatalos statisztikája érintetlen. BB2 és férfi esetén a hiányzó szövetségi tábla az `null`, nem 0.
- Nem írunk `events`/`availability`/`mass_events` táblát, meeting vagy pályaadatot.
- Ezeket az eredményeket a Playerben még nem jelenítjük meg hivatalos előrejelzésként.
- Teljes történeti rangsorhoz szükséges: 2025/26 MRSZ hivatalos bajnoki tabella és teljes mérkőzéslista, pontos versenyazonosító, csapatszintű identitástisztítás, eredmények és táblák visszaszámolása, csak ezek után kísérleti erősségi modell.

## Ellenőrzés

`node --test tests/manager-men-bb2-history.test.cjs tests/manager-women1-history-view.test.cjs`

A történeti feltételezéseket és forráshiányt nem fedjük el sem a frontendben, sem az adatban.
