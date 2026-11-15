# Club Control V2 – TEST telepítés és E2E ellenőrzőlista
**Dátum:** 2026-11-15  
**GitHub:** `beacvolleyCC/club-control-manager`, ág `v2/architecture-foundation-20261107`, Draft PR #89  
**Supabase:** kizárólag TEST `szzoubvhlwnojtzqjebc`  
**Cloudflare projekt:** `club-control-v2-test-preview` (külön a LIVE-tól)

## 1. Biztonságos telepítés – fióktulajdonosi konfiguráció

A GitHub V2 workflow már épít és tesztel, de a `Require isolated Cloudflare deployment credentials` ellenőrzésnél megáll, mert a `v2-test-preview` environmentben hiányoznak vagy üresek a hozzáférési adatok.

1. Cloudflare Dashboard → Account → API Tokens → Create Token → Custom Token; **Account → Cloudflare Pages → Edit** jogosultság, csak a V2 TEST-hez tartozó fiókra szűkítve. **Ne** használj Global API Key-t vagy általános admin tokeneket.
2. Az Account ID-t a Cloudflare fiók áttekintésénél találod.
3. GitHub repo → Settings → Environments → **`v2-test-preview`** → Environment secrets:
   - `V2_CLOUDFLARE_API_TOKEN`
   - `V2_CLOUDFLARE_ACCOUNT_ID`
4. A tokeneket **csak a GitHub/Cloudflare felületén add meg, soha ne chatben vagy commitban**.
5. Ellenőrizd, hogy a `club-control-v2-test-preview` Cloudflare Pages projekt valóban a külön V2 TEST projekt. Ha még nem létezik, hozz létre Direct Upload típusút ugyanezen néven; a korábban létrehozott LIVE Pages projektet NE válaszd.
6. A workflow `.github/workflows/v2-test-auto-deploy.yml` automatikusan a V2 ágra érkező push után fut és a `v2/dist` mappát tölti fel a `v2-preview` preview ágra. Alternatíva a `v2-test-preview-deploy.yml` kézi workflow a `DEPLOY-V2-TEST` inputtal.
7. Várható előnézeti útvonalak: `/frontend-next/mass/` (önkiszolgáló web) és `/frontend-next/player/` (közös Player). Az URL-t **csak sikeres Cloudflare deploy után** ellenőrizd; nem feltételezünk előre létező domainnevet.

Forrás: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/

## 2. Supabase OTP e-mail sablon (TEST)

A kliens kód beírását várja, **nem Magic Linkre kattintást**.

1. Supabase TEST projekt → Authentication → Email Templates → Magic Link / OTP.
2. A sablon törzsében szerepeljen pontosan a Supabase token változója: `{{ .Token }}` (hatjegyű kód). Ha csak `{{ .ConfirmationURL }}` van benne, a kliensben nem tudják begépelni az OTP-t.
3. Az e-mail provider, feladó, SMTP-beállítások és a kiküldési korlátok ellenőrzendők. Ne küldj tömeges tesztlevelet.
4. Authentication → URL Configuration: az éles URL helyett a tényleges V2 TEST preview origin és a kapcsolódó redirect legyen allowlisten. A LIVE auth-konfigurációt NE módosítsd.
5. A kódok alapértelmezés szerint időkorlátosak; túl gyakori próbálkozásnál rate-limit lép életbe. Valódi TEST fiókkal először egyetlen kódot kérj.
6. A Supabase Auth aláírással ellenőrzött email szerepazonosságát a DB-s `private.cc_v2_mass_verified_auth_v1` ellenőrzi.

Forrás: https://supabase.com/docs/guides/auth/auth-email-passwordless és https://supabase.com/docs/guides/auth/auth-email-templates

## 3. Végteszt egy QA fiókkal (nem LIVE sportolóval)

- Böngészőben nyisd meg a sikeresen deployolt `/frontend-next/mass/` útvonalat.
- Kérj e-mail OTP-t TEST-címre, ellenőrizd a kézbesítést és lépj be.
- Első használatkor hozz létre Kezdő profiladatot; ellenőrizd, hogy a `cc_v2_mass_verified_account_links_v1` tábla kizárólag igazolt fiókkal bővül.
- Válaszd a **2026. november 19., 18:00** időpontú, fiktív `CC-QA-FUTURE-20261119` edzést. Ez **nem valódi BEAC-edzés**; csak teszt.
- Próbáld ki az „Első edzés” foglalást, majd ellenőrizd, hogy saját jelentkezésként megjelenik a weben és a Playerben is. Ezután mondd le.
- Teszteld a megismételt/duplikált jelentkezés elutasítását, a szinteltérést, az idegen booking ID-val való lemondás elutasítását és a zárt időablakot.
- Ha a Manager tesztfióknál van `mass.passes edit`, ellenőrizd a két külön szabályt:
   1. Bérletvásárlás nem elérhető → türelmi idő (max. 45 nap).
   2. Megvett, de nem importált bérlet → importkésési türelmi idő (max. 7 nap).
- Az importkésés miatti **saját vásárlási állítás csak a Manager kifejezett, időkorlátos jóváhagyásával engedhet foglalást**, nem jelöl fizetettnek. A foglalás / várólista `pass_status='ELLENŐRZÉSRE VÁR'` marad.
- A Manager részletes edzésnévsorban ellenőrizd a ⚠ jelzést; a kis edzéskártyára nem kerül bérletszám.
- Magyar–angol váltás mindkét felületen; iPhone/Safari és asztali böngésző; kijelentkezés és lejárt token vizsgálata.

## 4. Mi lett igazolva automatikusan és SQL-tranzakcióval

- GitHub QA: typecheck, node contract tesztek, build.
- TEST adatbázis: verified owner → saját lekérdezés → **első edzéses foglalás → lemondás** sikeres, ROLLBACK.
- TEST adatbázis: **várólistára kerülés → lemondás** sikeres, ROLLBACK.
- TEST adatbázis: `claimedPaid=true` **Manager által beállított import-grace nélkül elutasítva**, ROLLBACK.
- TEST adatbázis: `claimedPaid=true` **Manager-grace mellett** sikeres; `pass_status='ELLENŐRZÉSRE VÁR'` ellenőrizve, ROLLBACK.
- Az adatbázisban nem maradtak meg a tesztfoglalások és a teszt céljából létrehozott ideiglenes grace szabályok.

## 5. Nem kész / élesítés előtt kötelező

- A V2 TEST Cloudflare Pages deploy továbbra is blokkolt a fióktulajdonosi credentials miatt.
- A valódi OTP-e-mail kézbesítése és az email sablon nem ellenőrzött.
- A valódi böngészős E2E, két fiókos jogosultsági negatív teszt, párhuzamos utolsó hely és a bérletvásárlási szolgáltatás integrációja hiányzik.
- Az importálási jóváhagyás nem azonos a fizetéssel; csak a hivatalos BEAC import igazolja a vásárlást.
- A teljes éles adatmigráció / üzembe helyezés NINCS engedélyezve.
- A Supabase Security Advisor további figyelmeztetéseit élesítés előtt át kell nézni.
- V2 PR #89 draft marad; LIVE nem módosítandó.

**A LIVE változatot kizárólag új, külön kifejezett engedéllyel és a fenti tesztkapuk után módosíthatjuk.**
