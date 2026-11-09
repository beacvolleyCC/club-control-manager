# Club Control V2 — frontend development baseline

Status: **frontend-ready baseline**, NOT production-ready. Date: 2026-11-09.

## Scope and safety
- V2 development happens only on `v2/architecture-foundation-20261107`; do not alter LIVE deployments or the LIVE Supabase project.
- TEST Supabase project: `szzoubvhlwnojtzqjebc`. Production project is excluded from every V2 test transport.
- Keep the existing Manager and Player static previews as **technical fixtures**, not as the design basis for the replacement UI.
- The new Manager and Player must be independent PWAs sharing design tokens, UI primitives, typed domain contracts, and API transport.
- Do not copy the legacy frontend implementation. Preserve product rules and verified backend behavior.
- Do not directly query tables from the frontend: use authenticated permission-checked RPCs.

## Frozen baseline: contract, not schema immutability
- Canonical competition: players, teams, team_memberships, events, availability.
- Mass sport: legacy mass_events, mass_bookings, mass_waitlist, linked by private V2 UUID registries.
- Do not conflate mass-sport sessions with competition events or create fake player identities for guest emails.
- V2 RPC envelopes use `schemaVersion: 1`. Changes require additive compatibility or explicit versioning.
- Manager and Player permissions must be enforced server-side, never inferred from hidden frontend buttons.
- Public TEST publishable key is not a secret. Access tokens must never be committed or persisted in localStorage.

## Frontend rewrite sequence
1. Shared UI system: typography, color tokens, spacing, forms, status feedback, responsive navigation and accessibility.
2. Shared session boundary: TEST login/logout, expiry handling, protected API calls and empty/error/loading states.
3. Manager shell: overview, team selection, training and match schedules, athlete list.
4. Player shell: schedule, attendance intent, profile, notifications.
5. Manager mass-sport booking, cancellation and waitlist controls **only after** verified write contracts and permissions.
6. Competition modules, finances, statistics, match protocol, PWA offline/read-only behaviors.

## Open release gates (not waived by starting frontend)
- Confirm TEST Cloudflare preview deployment and correct origin/redirect configuration.
- Real Manager and Player OTP/JWT session checks (not just mocked browser tests).
- Positive and negative authenticated API authorization tests.
- Full booking, cancellation, waitlist offer/accept/expire E2E with isolated TEST fixtures and cleanup.
- Verify rollback/migration reproducibility, accessibility, and both PWAs on mobile.
- Obtain explicit authorization before any LIVE deployment.

## Definition of done
A feature is done only when its code, automated QA, TEST browser E2E, authorization checks and acceptance criteria are complete. Keep backend readiness and frontend readiness tracked separately.
