# Club Control V2 – implementation baseline (2026-11-07)

Status: architecture and discovery only; no production deployment or database migration.

## Objectives
- Two independently deployable PWAs: Manager and Player, sharing one canonical domain model and one controlled backend.
- Preserve real operational rules from V1; avoid porting its large monolithic UI files unchanged.
- Build against isolated TEST environment, never directly mutate LIVE while developing.
- Keep V1 operational until migration parity, permission tests and rollback are proven.

## Architecture decision proposal (ADR-001)
- TypeScript monorepo with workspaces: `apps/manager`, `apps/player`, `packages/domain`, `packages/api`, `packages/ui`, `packages/test-fixtures`.
- Frontend: React + Vite + TypeScript (proposed; validate against deployment constraints before locking).
- Backend: Supabase Postgres/Auth + versioned RPC/Edge Functions; server-side authorization, not client-side flags.
- Hosting: separate Cloudflare TEST/LIVE Workers deployments, with environment-specific keys and release manifests.
- Canonical entities: Person/Player, Team, Membership, Event, RSVP/Booking, Attendance, Pass/Payment, Match, MatchEvent, Competition, Venue, PermissionGrant, AuditEvent.
- Treat imported BEAC payments and official competition sources as external provenance, not a second source of truth.
- Use stable entity IDs and explicit mappings from V1 IDs; no irreversible migration in phase 1.

## Delivery sequence
1. Inventory schemas, RPCs, data ownership, and user flows. Record baseline snapshots and known edge cases.
2. Define domain contracts and permission matrix; agree on event/attendance/payment state machines.
3. Scaffold V2 with lint/typecheck/unit tests and deployment boundaries.
4. Implement read-only Manager and Player parity against TEST data.
5. Implement writes through versioned APIs, with audit/idempotency and negative authorization tests.
6. Reconcile data and perform dual-run comparison; verify restore/rollback before cutover.

## Hard gates
- No LIVE schema or data change before explicit approval and rollback plan.
- No shared service-role key in browser; per-team access enforced in database/API.
- Every mutation must have readback and audit verification.
- TEST uses realistic, non-sensitive fixtures where possible; avoid exposing private player records.
- Compare counts and hashes for people, bookings, passes, events and match facts.
- Distinguish missing timestamps from Unix epoch; never display 1970 for NULL.

## Current known issues
- V1 Manager TEST auth bootstrap can mistakenly show OTP after data-load failure; patch exists on PR #88 branch, not assumed deployed.
- PR #88 and main are diverged; V2 branch is independent, based on main.
- Team-scoped authorization, automated attendance and full Manager/Player integration still need verified contracts.
- TEST synthetic mass booking has NULL submitted_at; UI currently renders an epoch date.
