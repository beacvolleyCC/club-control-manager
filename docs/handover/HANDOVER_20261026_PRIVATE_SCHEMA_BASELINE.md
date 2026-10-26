# CC-FOLYTATÁS – Privát sémamentés staginghez (2026-10-26)

**Állapot:** a staging felépítésére alkalmas első, helyi mentési eszköz ELKÉSZÜLT; **a tényleges schema-only dump még NEM készült el**. Éles SQL írás, `migration repair`, projekt/branch létrehozás, adat-/JWT-másolás nem történt. A korábbi 31 vs. 8 migrációs verzióparitás továbbra is BLOCKED.

## Eredmény
- Helyi Windows PowerShell 7 program: `scripts/qa/export-private-supabase-schema.ps1`.
- A Supabase CLI hivatalos `supabase db dump --linked --schema public,private --file <local-private-path>` parancsát használja a külön, **repo-kívüli** munkaterületből.
- Kimeneti könyvtár: Windows `%LOCALAPPDATA%\ClubControl\PrivateSchema\snapshots\`. Csak sémadefiníciókat dumpol: **nincs `--data-only`, `--role-only` vagy játékosadat-export.**
- A sémakód tartalmazhat üzleti logikát vagy akár belső állandókat; a teljes SQL-t **nem szabad ellenőrzés nélkül GitHubra feltölteni vagy chatbe bemásolni**.
- Ha a CLI-nél `supabase link` adatbázis-jelszót kér, azt kizárólag a helyi Supabase CLI kapja. Ne küldjünk credentialst GitHubba/ChatGPT-be.
- A hash/fájlméret metaadatot külön, ugyanebben a privát mappában mentjük.
- `sql/cc_schema_structure_fingerprint_readonly_20261026.sql`: LIVE-on 2026-10-26 lefuttatott **csak katalógusadatokat olvasó** lekérdezés, amely táblaadatokat, e-maileket, tokent nem ad vissza.
- `data/qa/supabase-schema-fingerprint-20261026.json`: 7 strukturális csoport kategóriaszámai és hash-ek (71 reláció, 710 oszlop, 335 normál függvény/eljárás, 202 constraint, 145 index, 11 policy, 18 table trigger). A 335 függvényből kimaradnak a `pg_proc` aggregate rekordjai; ez nem a teljes PostgreSQL objektumszám.
- `scripts/qa/compare-schema-fingerprint.cjs`: egy későbbi, önálló staging PostgreSQL-ből előállított JSON strukturális összevetése a mai LIVE metaadatokkal; eltéréskor `BLOCKED`.
- A Windows CI csak az export-program biztonsági ellenőrzését és az **offline** metaadat-összehasonlítást futtatja; nem készít éles dumpot és nem lép be a Supabase-be.

## Kézi indítás — kizárólag megbízható saját Windows gépen
1. Legyen telepítve és elindítva Docker Desktop, illetve a Supabase CLI; a böngészőből/terminálból `supabase login` saját fiókkal. A GitHub-repót klónozd le.
2. **A megtalált állapotot ne javítsd meg távoli `migration repair`-rel**, és ne futtass `db push`, `db reset --linked` vagy `db pull` parancsot az élő projektre.
3. Repo gyökérből: `pwsh -NoProfile -File ./scripts/qa/export-private-supabase-schema.ps1`.
4. A program elkülönített helyi projektmappában `supabase init --yes`, `supabase link --project-ref snqsxlyhontaepembaic`, majd **csak schema-only** `supabase db dump`-ot futtat; nem érinti a Git migrációtörténetét.
5. Az elkészült privát SQL-t csak ellenőrzött, új, üres tesztkörnyezetben szabad visszaépíteni, az ottani beépített Auth/Storage rendszert és default GRANT/RLS tulajdonságokat figyelembe véve.

## A staging még nem kész
- A schema-only mentés **nem** tartalmaz valós tesztfelhasználókat, a 298 mérkőzés adatait, sem az eredeti 31 migráció teljes történetét.
- A cél egy külön, ellenőrzött kezdő sémabaseline létrehozása, majd strukturális paritás, grant/RLS, valós teszt JWT-k, 298 szintetikus rekord, Manager/Player WebKit/iPhone QA.
- A ma sikeres PostgreSQL/Chromium/WebKit CI tesztek nem helyettesítik ezt.
- Új Supabase-projekt vagy branch költségét előbb egyeztetni kell, és a szervezeti célt meg kell erősíteni. Az éles adatbázisnál automatikus DDL vagy migrációtörténet átírása tilos.

Forrás: https://supabase.com/docs/reference/cli/supabase-db-dump

## CI runner-kompatibilitás (2026-10-26)
A `Official protocols canonical PostgreSQL QA` egy korábbi `ubuntu-latest` futása GitHub ubuntu-26.04 környezetére került, amelyre a rögzített Playwright 1.56.1 **nem támogatja a WebKit telepítést** (konkrét CI napló: `Playwright does not support webkit on ubuntu26.04-x64`). Nem volt alkalmazáskód/DB-hiba. A workflow-t ezért ellenőrizhetően `ubuntu-24.04` runnerre rögzítettük. Későbbi böngészőverzió-frissítés külön kockázatfelmérést igényel.
