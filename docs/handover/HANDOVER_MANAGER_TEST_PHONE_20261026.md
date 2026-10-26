# Club Control – Manager TEST phone installation (2026-10-26)

Current source: `beacvolleyCC/club-control-manager:test/20261026-manager-document-intake`. The FULL Manager TEST release is **not deployed**, nor connected to a real database. The current Supabase Free TEST project `szzoubvhlwnojtzqjebc` contains zero Club Control application tables.

**Implemented:** Manager UI opens its existing DEMO data branch, has orange TEST ribbon and unique iOS home-screen PNG icons (MGR TEST), distinct browser storage and cache, and a hard allowlist so it can later communicate only with TEST Supabase. The server-side importer has NOT been implemented; document input button is local file metadata preview only. The existing LIVE Manager and Player sites were not deployed or altered.

**Intended phone topology:**
- Manager TEST: a standalone new repository `beacvolleyCC/club-control-manager-test`, GitHub Pages or comparable free host, HTTPS URL, Safari → Share → Add to Home Screen.
- Player TEST: standalone `beacvolleyCC/club-control-player-test`, own HTTPS URL, Safari → Share → Add to Home Screen.
- Both will eventually connect solely to Supabase TEST. Until the full database schema, RLS and test identities are reconstructed, both remain in isolated DEMO mode.

The current GitHub connector cannot **create new repositories**, and neither dedicated test repo has yet been created. GitHub source-branch URLs are **not** installed PWA URLs. Do not merge the test branches into either LIVE main. Pages workflows include an exact repository-name guard to prevent deploying from the production repositories.

**Public-repo caution:** do not copy all original Manager source/docs/test fixtures to a newly public repo: some archival data contain actual athletes' names. Publish only the vetted static shell assets via the allowlist build, and exclude data, private records, migrations, credentials and historical rosters. No private/paid repo features are required or assumed; verify free Pages eligibility.

Before switching demo mode to real TEST backend: verify 0 USD Free status; rebuild 57 application tables and 337 live functions appropriately, compare schema fingerprint; create TEST Auth users only and verify RLS; then change Manager and Player TEST config to staging URL and staging publishable key, never LIVE. Revalidate iPhone Safari/PWA login and attendance writes. No LIVE writes without separate patch review.

Cost hard requirement: 0 HUF, no paid upgrades or development branches.

## Curated standalone repository export

Rather than running `git clone` + copying **all files** into a new public repo, use the checked script `scripts/export-manager-test-pages.ps1 -Destination <empty-new-clone-folder>`. It exports ONLY the runtime file whitelist, icons, logos, safety test and Pages workflow. No `data/`, `docs/`, migrations, private SQL, raw PDFs or tests with protocol rosters are copied.

The GitHub App cannot create the new repository; the user creates **`beacvolleyCC/club-control-manager-test`**, without README, then clones that empty repo to a target folder. On Windows run the exporter from the source Manager TEST checkout and `git add .; git commit; git push` from the target. Settings → Pages → GitHub Actions. Deploy workflow refuses execution outside the exact repository name. Source project and LIVE branches unaffected.
