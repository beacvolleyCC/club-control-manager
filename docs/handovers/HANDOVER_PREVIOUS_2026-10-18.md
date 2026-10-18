# Club Control – HANDOVER_CURRENT

**Dátum:** 2026-10-18 (Europe/Budapest)  
**Folytatási kulcs:** `CC-FOLYTATÁS`  
**Projekt:** BEAC Röplabda / Club Control / Manager és Player  
**Munkastátusz:** jelenlegi Manager–Player LIVE; a két új kérés **még NINCS implementálva**.

## 0. Első feladat a folytatáskor – a felhasználó legutóbbi kérései

### A) VISSZA A RÉGI EDZÉSKIÍRÓ FELÜLETHEZ (magas prioritás)

A felhasználó 2026-10-18-i üzenetében képernyőképet adott az általa **lényegesen jobbnak tartott régi felületről**. Ez a beszélgetéshez mellékelt kép; a kép nincs automatikusan a GitHub repóban.

A visszahozandó kezelési modell / látvány:
- **Tömegsport → Edzések**, kiemelt, széles sárga `+ ÚJ EDZÉS LÉTREHOZÁSA` gomb.
- A lista közelében, **oldalon belül megjelenő nagy, világos, kéthasábos űrlapkártya**, cím: `Új edzés létrehozása`. A referencia nem egy apró, szűk modal.
- Mezők és sorrend: **Edzés típusa** (Tömegsport / a támogatott más típusok), **Dátum**, **Szint** (pl. Piros – Középhaladó), **Kezdés**, **Befejezés**, **Pálya**, **Teljes limit**, **Lemondási határidő (óra)**, **Edzés színe** (alapértelmezett és színjelölő), **Ismétlődés**; alul **Edzés létrehozása** és **Mégse**.
- A screenshot példája: 2026. október 19., Középhaladó, 20:00–22:00, 2-es pálya, 24 fős limit, 6 óra lemondás, alapértelmezett szín, nincs ismétlődés – ezek **csak illusztratív értékek, nem új kötelező defaultok**.
- Megtartandó: EU/HU dátum, **24 órás HH:mm**, hétfői hétkezdés ahol naptár van, mobilon értelmes töréspontok, edzésszint színei, visszajelzés, jogosultságok és az aktuális biztonságos mentési API.
- A referenciaképen vannak apró, szürke magyarázó szövegek; a projekt korábbi UX-döntése szerint **ne hozzuk vissza az összes fölösleges kis szürke segédmagyarázatot**. Az újrahasznosítandó elem elsősorban a mezők áttekinthető elrendezése és a közvetlen, nagy űrlap.
- **Kritikus:** ne állítsuk vissza a korábbi backend-validációkat, ha közben újabb, biztonságosabb mentési megoldás készült. Csak UX/felület + szükséges funkcionális paritás.

Aktuális technikai hely (Manager `app.js`):
- `renderMassTrainings()` kb. **1517. sor** – Tömegsport edzéslista és `#massTrainingAdd`.
- `openMassEventEditor_(eventId)` kb. **1773. sor** – jelenlegi dialógusos Tömegsport editor, meDate/meStart/meEnd/meLevel/meCourt/meCapacity/meCancelHours/meSession/meColor/meRepeat; jelenleg `cc_manager_mass_event_save_safe_v2` (szerkesztés), `cc_manager_mass_event_save_v1` (új), `cc_manager_mass_event_series_create_v1` (ismétlődő) és kapcsolódó aktív/törlés RPC-k.
- Másik, **külön** versenysport edzés-/meccs-editor: `ccEventFormHtml_` kb. 1027. sor, `openCompetitionEventEditor` kb. 1142. sor. Nem szabad véletlenül összekeverni a Tömegsport és Versenysport eseménytípusokat.
- QA: új létrehozás, ismétlődés, szerkesztés, törlés/leállítás, résztvevőkkel és várólistával rendelkező meglévő események, időzóna és iOS HH:mm.

### B) AZ ÖSSZES BAJNOKI MECCS KÉZI SZERKESZTÉSE (magas prioritás)

A felhasználó szó szerint: „a BEAC meccseket kéne tudnom szerkeszteni igazából az összes meccset kéne tudnom szerkeszteni manuálisan is ha úgy van”.

**Elvárt funkció:** a Manager **Versenysport → Meccsek**, illetve ahol a Tabella mérkőzései megjelennek, minden listázott mérkőzésnél jogosult admin számára legyen szerkesztési lehetőség:
- **BEAC saját bajnoki találkozók** (nem csak belső eseményrekord),
- **ellenfél–ellenfél** meccsek azokban a bajnokságokban/csoportokban, ahol a liga összes mérkőzését látjuk,
- mentett és forrásból importált/kiolvasott mérkőzések, tervezett és lejátszott alkalmak.
- Szükség esetén dátum, kezdés, hazai/vendég, csapatpárosítás, helyszín, eredmény, játszmaeredmények és állapot kézi módosítása; pontos végső mezők a meglévő adatmodell szerint.
- Az eddig ismert **Kandó SC / Óbudai Egyetem–Kandó** csapatszinonimákat következetesen, azonosító alapon kell kezelni; kerülendő a csapatok hamis összevonása.
- **Nem szabad** a hivatalos MRSZ/BRSZ-forrásadatot felülírni vagy a következő szinkronnal csendben elveszíteni a manuális javítást. Javasolt architektúra: hivatalos forrásérték + szerkeszthető **admin override**, forrásazonosítóval (`season / competition / source match code`), szerzővel, időbélyeggel, auditnaplóval, visszaállítási lehetőséggel. A javaslat nem implementációs döntés; a meglévő Supabase struktúrát előbb ellenőrizni kell.
- Különböztesse meg a **hivatalos forrás szerinti** és a **kézzel korrigált** értéket; BEAC/Player megjelenítésből, tabellából és statisztikából egyetlen következetes, felülírásbiztos számítási út vezessen. A javítás ne generáljon kétszeres meccset, ne számoljon lejátsszottnak eredmény nélküli alkalmat.
- Jogkör: `competition.matches` edit / megfelelő admin engedély; az összes liga meccseinek szerkesztése ne adjon jogosultságot véletlenül sportolói vagy más adatok szerkesztésére.
- **Fontos meglévő funkció:** `openCompetitionEventEditor()` (Manager app.js ~1142) tudja kezelni a **belső competition event rekordokat**, a `cc_manager_competition_event_save_v1` RPC-vel. A bajnoki lista viszont részben külön MRSZ snapshot/szinkron-forrásból származik, tehát ez az editor **nem garantálja**, hogy tetszőleges külső meccs szerkeszthető.
- Bajnoki UI kulcspontok: `ccMrszMergedLeagueMatches_` ~2638; `ccMrszLeagueFixturePanelHtml_` ~2708; `renderCompetitionMatchCards_` ~2952; forrásállapot `ccMrszPhotoState_`. Itt kell integrálni az új szerkesztési akciót és az írásból visszaolvasott, ellenőrzött eredményt.
- QA-mátrix: BEAC meccs, BEAC nélküli bajnoki meccs, férfi A/B, női I és II csoportok; eredmény nélküli → eredményes és fordítva; szettek összege; forrás szinkron után is megmaradó manuális override; tabella / Player / Manager konzisztencia; megfelelő audit; visszaállítás; mobil.

**A két funkciót a felhasználó még csak kérte, nem lett kifejlesztve; ennek megvalósításával kell legközelebb kezdeni.**

## 1. LIVE rendszer – ellenőrzött GitHub-állapot

| Komponens | GitHub repo | main commit | LIVE |
|---|---|---|---|
| Manager | `beacvolleyCC/club-control-manager` | `2b7ec0a7ce4ebdb561d217e06afc138cb7d391dd` (PR #53) | GitHub Pages build+deploy sikeres |
| Player | `beacvolleyCC/player_application` | `fbe879b1506ab42bd086cceb06d4acda9499b4ae` (PR #12) | GitHub Pages build+deploy sikeres |

A fenti commitok a handover előtti **alkalmazásverziók**; a handover önmagában dokumentációs commitot tesz majd a Manager main-re.

### Player, 2026-10-18: #12 már LIVE

A `Tabella → Statisztikák` panelek sorrendje: **Áttekintés → Csapatok → Játékosok → Összehasonlítás**. A **Játékosok** fül visszakerült, csapatszűrővel, mobilon görgethető táblával és MRSZ-játékosprofil-linkkel.

A mutatók: `Nevezés`, `Győzelem`, `Vereség`, `Kezdő` (`K`), `Csere` (`CS`), `Jelölés nélkül`. A W/L a nevezett játékos **csapatának** mérlege az adott mentett jegyzőkönyvekben. A `CS` nem bizonyít tényleges pályára lépést, és a `jelölés nélkül` **nem** jelent automatikusan `nem játszott` státuszt. Azonosítóütközés és csapatoldal keveredése ellen tesztelt. Cache-busted PWA `20261018-player-wl-v18`, a Player QA/Pages sikeres.

### Manager, jelenleg LIVE

Versenysport → Meccsek / Tabella: 2026/27-es MRSZ/BRSZ adatforrások, meccslisták, csoportok, eredmények, részleges jegyzőkönyvek, csapatstatisztikák és figyelmeztetések. Tömegsport szervezés, részvétel/jelenlét, bérletek, várólista a meglévő Manager folyamatokkal. **Az összes, forrásból listázott meccs kézi szerkesztése még NINCS kész.**

## 2. Történeti MRSZ kutatás: a kód és az adat a Managerben van, de még NEM LIVE számítás

2024/25 női Budapest I. (`p_evad_kod=2024`, `p_verseny_al_kod=72`):
- **13 csapat**, 157 forrásmeccskód, **155 eredménnyel szereplő**, 2 eredmény nélküli (ebből egy duplikált párosítás).
- BEAC: 5. hely, **13–11**, **24/24** kiolvasható BEAC-jegyzőkönyv, **16** különböző hivatalos játékoskód, **280** nevezési sor.

2025/26 női Budapest I. (`p_evad_kod=2025`, `p_verseny_al_kod=93`):
- **12 csapat**, 132 forrásmeccskód, **129 eredménnyel szereplő**, 3 eredmény nélküli.
- BEAC: 1. hely, **20–2**, **22/22** kiolvasható BEAC-jegyzőkönyv, **15** különböző MRSZ-kód, **225** nevezési sor.
- A rugalmas parser hét korábbi hiányos jegyzőkönyvi játékoslistát helyreállított; **128/129** eredményes bajnoki mérkőzéshez van valamilyen igazolt játékosnévsor, egy ténylegesen üres: MRSZ `4071`. A `2443` jegyzőkönyvi eredménye továbbra is üres, az MRSZ bajnoki listában van eredmény.
- A két BEAC idényben **5 azonos, névben is egyező MRSZ-játékoskód:** `21243` Kovács Nóra, `23656` Papp Laura Dorottya, `27101` Uhri Sára, `32910` Iglói Nóra, `37523` Szalontai Rebeka.
- Összesen **284 eredménnyel szereplő hivatalos találkozó** a két évadból.

A Manager `data/competition-history/` és `scripts/history/` fájlokban vannak a forráshivatkozásos eredménylisták, játékosjegyzőkönyvek, parser és tesztek. A legfrissebb részletes riport: `docs/statistics/MRSZ_HISTORY_WOMEN1_STAGE10_2026-10-17.md`.

**Nem történt történeti adatok importálása az éles Supabase-be, és a többidényes erősorrend / Elo-szerű modell / meccsesély / keretmegtartási arány NINCS élesítve.** A tényleges játszott szetteket és egyéni eredményességet a K/CS jelölések alapján nem szabad kitalálni.

## 3. Aktuális LIVE adattartalom és fontos korlátok

- Éles Supabase projekt: `snqsxlyhontaepembaic`.
- A legutóbbi **csak olvasó** ellenőrzéskor a `competition_source_matches`, `competition_source_standings_history` és `cc_competition_mrsz_screenshot_v1` adatai a **2026/27-es** idényhez tartoztak, nem a 2024/25–2025/26 kutatási évadokhoz.
- Nem szabad a kutatási JSON fájlokat az MRSZ éles, pillanatképes adataival összemosni; külön adatforrásként, forrásazonosítóval kezelendők.
- MRSZ/BRSZ szinkron közben több meccsen hiányos hivatalos forrás, eltérő elnevezés vagy duplikált csapatnév fordulhat elő. Különösen a Kandó / Óbudai Egyetem–Kandó és MTK névváltozataival óvatosan.
- A tabella és a mérkőzéslista nem szabad hogy elszinkronizálódjon a Player és a Manager között a tervezett kézi szerkesztés miatt.
- Minden admin írás: jogosultságellenőrzés, auditálható változás, mentés-visszaolvasás, QA, csak sikeres CI után PR merge/deploy.
- Felületi preferenciák: Onest, visszafogott fekete/fehér + BEAC arany akcentus; **ne töltsük tele az új paneleket apró szürke magyarázó címkékkel**. EU 24h; hétfői hétkezdés; mobil/iOS ellenőrzés.

## 4. Megvalósítási sorrend és elfogadási kritériumok

**1. Tömegsport edzéskiírás UX visszaállítása:**
- A mellékelt régi screenshot alapján oldalon belüli kétoszlopos szerkesztő és sárga fő CTA.
- A meglévő Tömegsport mezők, típusok, szintek, pályák, alapértékek és ismétlődési logika működjenek.
- Új / módosítás / ismétlés / jogosultság / betelt-várólistás / meglévő foglalásos edzések ne sérüljenek.
- Manager GitHub PR + UI QA + sikeres Pages deploy.

**2. Teljes bajnoki meccslista admin szerkesztése:**
- Source rekord és belső event rekord kapcsolatát feltérképezni.
- Admin-only edit minden látható bajnoki mérkőzésen, beleértve a BEAC nélküli csoportokat.
- Forrásmegőrző kézi módosítási adatmodell (override) + audit + visszaállítás, duplikációvédelem, következő szinkron túlélése.
- Manager és Player egységes eredményhasználata; hiteles eredmény- és szettvalidáció; jogosultságok; regresszió és deploy.
- Mindkét részfunkció elkészültét valóban ellenőrizni; ne csak UI gombot tegyünk ki.

**3. Ezután** 2024/25 további **131 nem BEAC-os eredményes jegyzőkönyvének** feldolgozása; többidényes csapatazonosságok, backtestelt statisztikai modell, csak megalapozott játékosstatisztika.

## 5. Handover működési szabály

A következő beszélgetés indítása: **`CC-FOLYTATÁS`**. Először a Manager `HANDOVER_CURRENT.md` fájlját és a két aktuális `main` állapotot olvasd vissza; a felhasználót ne kérd ismét a már megadott képernyőkép vagy követelmények szóbeli megismétlésére. Az első konkrét fejlesztés a régi edzéskiíró felület; közvetlenül utána az összes bajnoki meccs kézi szerkesztése. A kérés nem jelent automatikus, jóváhagyás nélküli éles adatátírást.
