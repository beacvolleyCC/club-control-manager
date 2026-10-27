# Club Control MANAGER TEST – connected staging Pages deployment (2026-10-28)

## Readiness
- **GitHub TEST branch prepared; bundled staging Supabase config is generated at build time.**
- Local source `config.js` intentionally remains **offline demo** for safe development and source-level tests.
- Only Cloudflare Pages `dist-test/` output is **connected to TEST Supabase**: `https://szzoubvhlwnojtzqjebc.supabase.co`. Its embedded `sb_publishable_` browser key is public by design; **never embed a service_role/secret key**.
- App header deployed from the builder reads **CC MANAGER TEST · STAGING · NEM ÉLES**; service-worker cache, app identity and icon are separate from LIVE.
- CI `TEST MANAGER static Pages build` succeeded on branch after the change. Backend simulated signed-in bootstrap passed for the user's TEST Auth record. **Full iPhone browser sign-in and remote UX regression are NOT yet completed.**
- Email/push dispatch disabled; Manager cannot auto-create Supabase Auth users.
- **This is not a claim of full LIVE feature parity.** Several optional Manager/Player RPCs and official MRSZ snapshots remain unavailable in TEST and require further work.

## Create TEST HTTPS hosting (Cloudflare Free)
1. Sign into [Cloudflare dashboard](https://dash.cloudflare.com/) and open **Workers & Pages → Create application → Pages → Connect to Git** (exact button labels may vary).
2. Connect GitHub organization **beacvolleyCC**, repo **`beacvolleyCC/club-control-manager`**.
3. Choose a separate **new** Cloudflare Pages project named `cc-manager-test-beac` (or an available similar name).
4. **Production branch = `test/20261026-manager-document-intake`**. This point is critical: Cloudflare may otherwise default to `main`. Choose/edit it under **Settings → Builds → Branch control** if necessary. **Do not edit the existing GitHub Pages LIVE site**.
5. Framework preset: **None**. Root directory: **/** (repository root).
6. Build command: **`node scripts/build-cloudflare-test.cjs`**.
7. Build output directory: **`dist-test`**.
8. No application secrets, paid service, scheduled job or build environment variables required. Use Cloudflare **Free**.
9. Deploy; copy the **actual** published `https://...pages.dev` URL from Cloudflare. The project name does not prove URL availability.
10. In Safari on the iPhone, open the HTTPS URL, sign in with the existing TEST Auth identity, then **Share → Add to Home Screen**. Ensure the banner says STAGING, never LIVE or DEMO.

## Acceptance before using TEST for real feature work
- After deployment, check `/manifest.webmanifest`, `/sw.js` and `/config.js` on the **new TEST origin**; config must reference **only** `szzoubvhlwnojtzqjebc.supabase.co`.
- OTP email authentication may require a Supabase Auth email template with an actual code (`{{ .Token }}`) rather than only a magic-link URL. Check email provider rate limits. Never share an OTP with ChatGPT.
- Confirm the correct TEST manager and player bootstrap after sign-in.
- Check RSVP change persistence, permissions, team isolation, competition context and the archived future BB2 fixture.
- Verify the Manager optional tabs visibly flag unsupported TEST RPCs rather than claiming they are live.
- Verify zero external push/email except user-requested **Auth OTP**. No connection to LIVE data anywhere.
- Do not publish private club exports, PDFs, SQL migrations, secrets or test fixtures. The build allowlist ships only static web assets.

Source branch `test/20261026-manager-document-intake` remains a *single-repo* staging source; no separate GitHub repo is necessary. Existing LIVE main and LIVE Pages stay unchanged.
