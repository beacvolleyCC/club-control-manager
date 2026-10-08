# CC Manager – Edzéstervezés / Számláló v1 (2026-10-08)

## Beépítés
A Manager meglévő **Edzéstervezés** főmenüje alatt két almenü van:
- **Tervező**: a régi felület változatlanul megmarad.
- **Számláló**: új, különálló, interaktív modul (`#planning/counter`).

A meglévő Manager jogosultságait használja: csak az fér hozzá, aki az Edzéstervezés menüt láthatja. Külön új Supabase szerepkör, migráció vagy RPC nem szükséges.

## Első verzió
- Alapból két pálya, bővíthető hatig; pályánként saját csapatnevek, pontok, szettek és időmérő.
- Röplabda: 15/21/25 pontos alapszettek, kétpontos különbség, két vagy három nyert szett, döntő szett 15 pontig.
- Szabad pontozás: automatikus szettkezelés nélkül.
- +1 és −1 pont gomb, korábbi pontozás visszavonása (a szett/mérkőzés végét is visszaállítja).
- Pályánként külön stopper vagy visszaszámláló, 5/10/15/20 perc és egyéni hossz, szünet és nullázás.
- Kivetítő mód: ugyanazon a készüléken teljes képernyős eredményjelző; TV-re/projektorra az eszköz kijelzőjének tükrözésével vihető ki.
- Automatikus `localStorage` mentés ugyanazon a böngészőn/eszközön. A futó időmérő időbélyeg alapján folytatódik oldalfrissítés után is.
- Reszponzív telefonos/tabletes nézet.

## Határok / következő kör
- A **két eszköz közötti valósidejű szinkron**, jogosultsági vezérlők, megosztott kijelző link, fizikai LED/radiós adapter és streaming overlay **nincs beépítve**.
- **Forgáskövetés, nyitó játékos, liberó, csere és egyéni statisztika** még nincs ebben a v1 modulban.
- Nem generál hivatalos jegyzőkönyvet; nincs backend írás és szerveroldali adatvisszaállítás.
- A helyi böngészőtár törlésével az eredmények elvesznek; egy mérkőzést egy kezelői eszközön érdemes vezetni.

## Fájlok
- `scoreboard.js`: elkülönített logika, állapot és felület.
- `scoreboard.css`: önálló, reszponzív megjelenés.
- `app.js`: útvonalak, menü, hozzáférési ellenőrzés és modulmount.
- `index.html`: script/style betöltés.
- `sw.js`: új erőforrások offline gyorsítótára.
- `config.js`: verziójelölő.
- `tests/scoreboard.test.cjs`: Node unit/smoke teszt.

## Ellenőrzés
```bash
node --check app.js
node --check scoreboard.js
node tests/scoreboard.test.cjs
```

Manuális QA: belépés megfelelő Manager-fiókkal; Edzéstervezés / Tervező / Számláló oda-vissza, közvetlen `#planning/counter` URL, telefonos használat, frissítés offline, többpályás pontozás és időmérés, teljes képernyős kivetítő. A `main` ág módosítatlan marad a PR egyesítéséig.
