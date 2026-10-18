# Competition match manual overrides — implementation contract (2026-10-18)

## Read-only investigation completed

- Production Supabase: `snqsxlyhontaepembaic`. Do not modify production rows until an end-to-end release is ready.
- `competition_source_matches` currently has 46 BRSZ source matches; each has `source`, `season`, `source_match_key` identity, teams, kickoff, result, and optional set scores. Syncs update this table.
- `cc_competition_mrsz_screenshot_v1` currently has 129 total records of kinds `fixture`, `match`, or `table`; each has `source_key`, `season`, `competition_label`, `record_kind`, `data` JSONB. MRSZ/BRSZ snapshots must remain immutable source evidence.
- `events` stores internal club competition events; `cc_manager_competition_event_save_v1` only handles those records, not unrelated source matches.
- Manager display currently merges separate fixture/photo/canonical records by normalized kickoff and team-name pair (app.js `ccMrszMergedLeagueMatches_`). That heuristic is **not** a durable source identifier. Identity collisions and aliases need explicit review.

## Required architecture (not yet implemented)

1. New isolated manual override table keyed by the **underlying immutable source identity**, e.g. `(source_system, season, source_key)` with a dedicated scheme for screenshot records; never use display name/date alone. Store editable values separately from source values. Explicitly track which fields were overridden, including intentional nulls.
2. For every mutation enforce authenticated manager identity and `competition.matches` edit permission server-side. Do not depend on frontend visibility. Follow the existing manager private authorization helpers. Read-only access granted only through appropriate RPC and permissions. RLS enabled; no direct anonymous update.
3. Validate scores: scheduled may have no result; completed volleyball score winner is 3 sets, loser 0..2; if points for individual sets are supplied, validate count and winner/overall consistency. Validate date/time, home/away, venue, and foreign key identity. Avoid inferring official result or player participation from absent evidence.
4. Append audit records with actor, timestamp, source identity, before/after value, action including reset, and optional reason. Provide a reset-to-source action. Prevent concurrent lost updates via version checks.
5. Read/merge through **one effective-match projection** shared by Manager and Player, keeping source JSON untouched. Reconcile named team aliases by canonical IDs when available, without merging Kandó II into Kandó.
6. Handle source competitions lacking BEAC teams, all groups (men A/B, women I, women II A/B), matches and fixtures, as well as review-only anomalies. Every match must have an edit affordance and a reliable row identifier before enabling mutation.
7. Protect league standings and statistics against partial or contradictory data. Display a clear manually edited marker; source official league standings may diverge, so do not mislabel recomputed partial standings as official.
8. Automated coverage: create/change/reset/readback, permissions, absent identity, stale update, source sync survival, no accidental duplicate, missing sets, matching across Manager/Player, PWA, mobile.

## UI entry points

- `ccMrszMergedLeagueMatches_` — source merge.
- `ccMrszLeagueFixturePanelHtml_` — league fixtures, every competition including non-BEAC.
- `renderCompetitionMatchCards_` — Manager match page.
- `openCompetitionEventEditor` — internal events only. Avoid using for arbitrary MRSZ/BRSZ fixtures.

## Release safety

First implement SQL migration, authenticated RPCs, effective read model, and tests on the branch. Verify in a non-destructive transaction or test environment. Integrate Manager and Player in a coordinated release. Do not expose a save button until the complete write/readback/audit path passes tests. No live data rewrites or destructive changes without explicit review.
