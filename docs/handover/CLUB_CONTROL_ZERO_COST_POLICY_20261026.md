# CLUB CONTROL — ZERO-COST DELIVERY POLICY (2026-10-26)

**Hard requirement: Club Control and all TEST/LIVE infrastructure must remain at 0 HUF / 0 USD in subscription and metered external-service charges. This includes hosting, database, storage, authentication, backups, logs, CI deployment, document processing and AI.**

## Current account facts verified 2026-10-26
- BEAC Volleyball Supabase organization `ujixcgxxlddkiqhzepia` is Free. The one existing LIVE project is `snqsxlyhontaepembaic`; its data must not be mutated by TEST operations.
- The Supabase tool quoted a second **project** at **USD 0/month** in that organization, subject to Free-plan limits. A separate Supabase development **branch** was quoted at **USD 0.01344/hour**: **prohibited**.
- Supabase Free quotas can cause warnings, restrictions or project pausing; they are NOT authorization to upgrade to Pro. The organization plan cannot be changed as part of a release.
- Supabase Free has two active project slots **across organizations that an Owner/Admin is in**, not necessarily a per-org unconditional entitlement. Confirm availability before creating TEST.
- CI status green proves only code/tests, not account billing or usage. An upgrade by a human with billing permissions cannot be prevented by a GitHub document.

## Mandatory gates for every future development/release
1. **Check price first:** if any requested action has nonzero cost, an unknown price, optional paid add-on, paid trial, overage billing or credit-card activation requirement — **DO NOT EXECUTE**. Seek a genuinely free alternative. No implied spending authorization.
2. **No Pro/Team/Enterprise upgrades, no charged Supabase development branches, no paid Compute, PITR, dedicated IPv4, custom domain, log drains, third-party AI API or paid hosting.** No purchase or paid connector without explicit user-requested policy change; the current policy is strictly ZERO COST.
3. One **separate Free Supabase project** is preferred for TEST if eligibility/cost and quotas are verified. TEST has its own Auth, private Storage, RLS, data and config. Do not point mutable TEST clients at LIVE.
4. All changes happen in TEST first. New protocols, match data and documents are staged and checked there. LIVE changes require a separate explicit release decision, SQL/data patch with preflight, idempotency, rollback and readback. No "production = staging auto-sync".
5. Document parsing must use existing local/open-source deterministic tools or **user upload in the current ChatGPT chat → manually reviewed structured JSON → Manager TEST import**, with no third-party paid AI service. Uploaded personal data must be minimized; never place raw rosters, credentials, private documents or API keys in public Git repos.
6. Monitor Free quotas and usage; when limits approach, throttle, prune TEST data, compress, pause or stop. **Accept loss/restriction of TEST availability rather than any paid upgrade.** Paused Free projects may require manual resume.
7. CI/tests must not invoke an endpoint that might create a bill or auto-upgrade resources. Recheck Free plan and current pricing before any project/branch creation; record quoted USD 0 and source.

Official Supabase references:
- https://supabase.com/docs/guides/platform/billing-faq
- https://supabase.com/docs/guides/platform/manage-your-subscription
- https://supabase.com/pricing

**Status:** This file documents the rule only; it does not modify any billing settings, automatically cap the organization's billing in the Supabase dashboard, create staging, migrate data or deploy.
