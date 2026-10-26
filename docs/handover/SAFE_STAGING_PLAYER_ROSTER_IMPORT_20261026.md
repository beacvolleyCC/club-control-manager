# CC TEST — biztonságos, helyi játékosadat-import (2026-10-26)

Ez az útvonal az éles adatbázis hozzáférési korlátozását tiszteletben tartja. A játékos- és csapattagsági adatokat a klub jogosult kezelője exportálhatja CSV-be, és a feldolgozó programot saját számítógépén futtatja. Sem az eredeti CSV, sem az elkészült SQL nem kerül GitHubra, Cloudflare-re vagy ebbe a beszélgetésbe.

## Mit őrzünk meg?

- Név, megjelenített név, poszt, mezszám, mez- és nadrágméret, aktív állapot.
- Összes csapattagság, kezdő és záró dátum, aktív/inaktív állapot. A BB1, BB2 és férfi csapat tagságai külön maradnak.
- Kizárólag a kifejezetten megjelölt egyetlen TEST-játékos e-mail-címe marad eredeti; a többi @example.invalid címre cserélődik.
- Egyedi, kulcsolt HMAC-alapú TEST-játékos- és tagság-UUID-k, amelyek nem egyenlők az éles azonosítókkal.

## Mit NEM másolunk?

Az auth_user_id, jelszó, bejelentkezési munkamenet, sportorvosi adat, igazolásszám, bérlet/pénzügy, valós többi e-mail és push-beállítás nem kerül az importba. Az éles események és jelentkezések sem másolódnak; a meglévő TEST mintaesemények érintetlenek maradnak. Az importer nem hajt végre hálózati kérést.

## Windows / PowerShell folyamat

1. Az ÉLES Supabase projektben, jogosult kezelőként, a Table Editor nézetből exportáld a public.players és public.team_memberships táblákat külön players.csv és team_memberships.csv néven. Az export kizárólag olvasási művelet legyen.
2. Helyben, a Manager TEST GitHub-ág másolatában Node.js 22-vel futtasd a scripts/prepare-staging-player-import.cjs programot. Állíts be saját, minimum 32 karakter hosszú titkos salt értéket a CC_TEST_IMPORT_SALT környezeti változóban, és a megőrizni kívánt TEST e-mail-címet a CC_TEST_PRESERVE_EMAIL változóban. Ezeket ne oszd meg és ne tedd kódba.
3. A terminálparancs (az útvonalakat igazítsd a saját gépedhez):

    node scripts/prepare-staging-player-import.cjs --players C:\private\players.csv --memberships C:\private\team_memberships.csv

4. A létrejövő private-import/staging_roster.sql fájl NEM kerül automatikusan az adatbázisba, és a .gitignore kizárja a verziókezelésből. Ellenőrizd helyben a fájl tartalmát.
5. A helyi SQL-t csak a külön TEST projekt SQL editorában futtasd: https://supabase.com/dashboard/project/szzoubvhlwnojtzqjebc/sql/new
6. Az eredmény után ellenőrizd a TEST névsort és a három csapat tagsági eloszlását. A művelet nem törli a korábbi 18 mesterséges játékost vagy 11 eseményt.

## Fontos biztonsági feltételek

- Nem változtatunk a LIVE sémán és adatain.
- Ugyanazt a saját salt értéket kell használni az újrafuttatáshoz, különben új UUID-k keletkeznek.
- Csak a három ellenőrzött, 2026/27-es csapatazonosító engedélyezett; új vagy váratlan csapat esetén a program hibával leáll.
- A megjelölt TEST-játékos belépéséhez külön TEST Supabase Auth-fiók szükséges. A Supabase Dashboard Authentication / Users nézetében hozd létre a TEST Auth-fiókot, majd kizárólag annak helyi UUID-ját kösd a megfelelő TEST-játékoshoz. Az éles Auth UUID-ja nem másolható.
- A TEST PWA-kat csak a bejelentkezés, RLS-ellenőrzés és RPC-függvények ellenőrzése után szabad teljes adatbázismódra váltani.

Új költség nem keletkezik; nincs fizetős infrastruktúra és nincs éles írási művelet.
