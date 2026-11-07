# V2 isolated preview deployment

The workflow `.github/workflows/v2-test-preview-deploy.yml` is **manual only**. It requires the exact confirmation `DEPLOY-V2-TEST`, GitHub environment `v2-test-preview`, and two repository secrets: `V2_CLOUDFLARE_API_TOKEN` and `V2_CLOUDFLARE_ACCOUNT_ID`. The Cloudflare API token must be scoped only to the isolated Pages project and account.

Deployment target: **Cloudflare Pages project** `club-control-v2-test-preview`. It must be created separately before running the workflow. This is NOT either existing Manager/Player Cloudflare Worker and is NOT LIVE.

The workflow runs typecheck, tests and static build before deployment. Preview pages use fake fixtures; TEST read panel is opt-in and requires an authenticated TEST token. No service-role keys, LIVE project URL or production database writes are included.

This workflow has **not been run**. A successful GitHub artifact build does not mean the Pages project exists or has been deployed. Check environment protection rules and permissions before first execution.
