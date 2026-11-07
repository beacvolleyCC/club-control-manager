# Club Control V2 – free isolated Cloudflare Pages TEST

## Scope
- New Pages project: `club-control-v2-test-preview` (Cloudflare Free plan).
- Existing TEST Supabase: `szzoubvhlwnojtzqjebc`. No new database, no LIVE access.
- GitHub source: `beacvolleyCC/club-control-manager`, branch `v2/architecture-foundation-20261107`.
- Manager preview URL after deployment: `https://club-control-v2-test-preview.pages.dev/manager/`; Player: `/player/`. These URLs are *expected*, not verified as deployed.
- The UI contains demo fixtures until authenticated TEST RPC reads are explicitly requested. There is no database write path.

## One-time Cloudflare setup (account owner)
1. Cloudflare dashboard → Workers & Pages → Create → Pages → **Direct Upload**. Create the exact project name `club-control-v2-test-preview` (avoid linking GitHub to the same project when using Wrangler automatic deployments).
2. In Cloudflare create an API token with **Account → Cloudflare Pages → Edit** scope limited to the account. Do not paste the token into chat or commit it.
3. In GitHub repository Settings → Environments create `v2-test-preview` if not already present. Set environment secrets `V2_CLOUDFLARE_API_TOKEN` and `V2_CLOUDFLARE_ACCOUNT_ID`. The workflow uses this environment.
4. GitHub Actions → **V2 TEST automatic Cloudflare Pages deploy** → Run workflow, branch `v2/architecture-foundation-20261107`. Later pushes to `v2/**` trigger the workflow automatically, but only the selected branch deploys.
5. Check that the workflow is green and visit the actual Pages deployment URL shown in its logs. Check `/manager/` and `/player/` on desktop and mobile.
6. Configure Supabase Auth redirect URLs only if/when redirect-based auth is introduced; the current TEST OTP flow calls the existing TEST Auth API directly. Confirm the OTP email template sends a code, not only a link. Use the TEST **publishable** key, never a secret/service_role key.
7. Verify Manager RPC permissions using a limited manager account; unauthorized data must not be visible. A successful static build does not prove authenticated QA.

## Safety and limits
- Do not deploy this project to existing TEST Worker or LIVE Worker.
- Free-tier hosting is subject to Cloudflare's current quotas; Supabase TEST also has its own quotas.
- The workflow will fail until the Pages project and environment secrets are configured. The assistant cannot create Cloudflare account resources with currently connected tools.
- Cloudflare Pages is public by default. Do not place confidential data in static files. Authenticated RPCs enforce manager permissions server-side.
- All changes to club branding and event editing remain UI previews; no DB write operations are connected.

## Handover
V2 foundation PR #89, separate TEST Pages deployment workflow `.github/workflows/v2-test-auto-deploy.yml`, manual fallback `.github/workflows/v2-test-preview-deploy.yml`. Existing TEST V1 and LIVE remain unchanged.
