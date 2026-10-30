# Club Control Manager TEST — first Workers Git deployment trigger

Deployment source: `test/20261026-manager-document-intake` — **NOT main**.
Cloudflare Worker project: `cc-manager-test-beac`.

This commit intentionally triggers the Git-connected Cloudflare Workers build after the project production branch was switched from `main` to the isolated TEST branch and a new Workers Builds token was selected in Cloudflare.

- Build: `node scripts/build-cloudflare-test.cjs`
- Deploy: `npx wrangler deploy`
- Wrangler file: `wrangler.jsonc` assets directory `./dist-test`
- Published bundle uses *only* the isolated TEST Supabase ref `szzoubvhlwnojtzqjebc`; secrets are never committed.
- LIVE branch, LIVE database and LIVE URLs stay unchanged.

A green GitHub static build is **not** evidence of a successful Cloudflare deployment. Verify Cloudflare Deployments shows a new successful build from this TEST branch before accepting or installing its URL.
