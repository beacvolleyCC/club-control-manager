# Női Budapest I. – történeti csapaterősség-kísérlet

**Állapot:** 2026-10-19, ellenőrzött offline kutatási adat. **Nem éles Player/Manager statisztika, és nem mérkőzésesély-előrejelzés.**

## Források
- 2024/25: MRSZ hivatalos 13 csapatos bajnokság, 155 eredményes mérkőzés + 2 eredmény nélküli rekord.
- 2025/26: MRSZ hivatalos 12 csapatos bajnokság, 129 eredményes mérkőzés + 3 eredmény nélküli rekord.
- Bemenet: `data/competition-history/women1_2024_25_official_league_snapshot.json` és `...women1_2025_26_official_league_snapshot.json`.
- A 284 eredmény összes mérkőzés- és szettszámát újraszámoltuk, **minden csapat minden hivatalos tabellaértékével egyezik**. A rövid MRSZ-meccsneveket a teljes bajnoki csapatnevekhez explicit, külön idényre alkalmazott aliasokkal kötöttük. Nem azonosítunk át csapatot egyik idényből a másikba.

## Kísérleti módszer
Az egyes idényeket 1500 ponttal kezdjük minden csapatnál. K=24, standard 400 pontos Elo várható nyerési arány, hazai előny nélkül. A feldolgozás időrendben a hivatalos eredménnyel rendelkező mérkőzésekre történik. A 3–0 és 3–2 eredmény ugyanannyit számít az Elo-frissítésben; a **szettkülönbség külön megjelenő mutató**, nem rejtett súly. A mérleg, utolsó 5 meccs, és a hivatalos helyezés szintén külön szerepel.

A két idény külön kezdő értéke **nem jelenti, hogy az 2024/25-ös és 2025/26-os Elo-pontok egymással kalibráltak**, vagy hogy egy csapat játékoskerete azonos. Az eredményből való súlyozás és a 24-es K szubjektív modellválasztás; jelenleg nincs visszatesztelve vagy valószínűségi előrejelzésre kalibrálva. Nincs vele győzelmi esély százalék.

## Fontos különbség az új statisztikában
2025/26-os hivatalos bajnoki helyezés: **BEAC 1. (20–2), Mozdulj 2. (19–1)**. A kísérleti, időrendérzékeny Elo mutató ugyanakkor **Mozdulj 1663,8, BEAC 1650,0**. Ez nem módosítja a hivatalos tabellát, és nem bizonyítja, hogy az egyik csapat objektíven erősebb. A mintegy 14 pontos rés önmagában főleg nem használható meccsesélynek.

2024/25-ben a hivatalos 5. BEAC-t 1519 pont körül becsüli ez a kísérlet (13–11); a két szezon BEAC-Elo értéke nem vethető egybe közvetlenül.

## QA és reprodukció
```sh
node scripts/history/build-women1-elo.cjs
node --test tests/women1-historical-strength.test.cjs
```

Generált adat: `data/competition-strength/women1_2024_2026_elo_experimental.json`.

**Kiadási feltétel:** jelenlegi 2026/27-es meccsbe hozás előtt forráscsapat-azonosítás, meccs-jegyzőkönyvek idősoros QA-ja, legalább visszatesztelt predikciós kalibráció, és egyértelmű `történeti becslés` jelzés. Jelen kutatási anyagot ezért nem nevezzük éles csapaterősség rangsornak.
