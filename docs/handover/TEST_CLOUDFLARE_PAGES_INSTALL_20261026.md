# Manager TEST – installable mobile PWA through existing GitHub repository (no new repo)

This is a **zero-fee Cloudflare Pages Git integration**, using the existing repo branch `test/20261026-manager-document-intake`; it never changes GitHub `main` or the existing live Pages site.

- Repository: `beacvolleyCC/club-control-manager`
- New Cloudflare Pages project name: `cc-manager-test-beac` (pick a unique available name)
- Production branch: **`test/20261026-manager-document-intake`** (not `main`).
- Framework preset: **None**
- Build command: `node scripts/build-cloudflare-test.cjs`
- Build output directory: `dist-test`
- Root directory: repository root `/`
- Build settings: no Supabase secret or other environment variables needed. Static app is DEMO-only, with no live or staging DB connection.
- Output: HTML/CSS/JS, PWA manifest/worker, icons and publicly suitable image assets only; never copy `data/`, `supabase/`, `sql/`, `docs/`, private athlete documents or the development test suite.
- Cloudflare Pages will report the actual assigned HTTPS `*.pages.dev` URL after first successful deploy. **Do not guess the URL.**
- iPhone: open actual HTTPS address in Safari → Share → Add to Home Screen. MGR TEST icon should be clearly distinct from LIVE.
- Real TEST Supabase binding can begin after staging Auth and grants are verified; do not switch config earlier.
- 0 Ft policy: choose Cloudflare Free, no paid plans, addons or automatic billing features.

Workflow QA runs via GitHub Actions on the TEST branch. All source changes remain on TEST branches only. Independent Cloudflare Pages project is the sole deploy destination; **do not change the existing LIVE Cloudflare/GitHub Pages settings**.
