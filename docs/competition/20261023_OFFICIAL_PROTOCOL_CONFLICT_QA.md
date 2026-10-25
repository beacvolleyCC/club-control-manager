# 2026-10-23 — MRSZ #2686/#2700 legacy-source conflict safety gate

**Work remains STAGED, NOT LIVE.** Manager draft [PR #74](https://github.com/beacvolleyCC/club-control-manager/pull/74), source branch `feat/20261022-official-protocols-2686-2700`. No production database migrations, Edge deployments, Player/Manager runtime changes, notification delivery or LIVE bookings/events mutations were performed here.

## 1. Verified original evidence

The two official score sheets date MTK Budapest–Panoráma SE (#2686, women Budapest I, 3:1, 2026-10-21 21:00) and Mozdulj SE–MAFC-Vásárhelyi (#2700, men Budapest I/B, 3:2, 2026-10-21 20:00).

The **separate historic** `public.cc_competition_user_schedule_v1` contains the matching names in their respective league scopes at:
- `ui20261018:womenI:mtk:panoramase:1` — 2026-10-28 20:45 Europe/Budapest
- `ui20261018:menB:mozduljse:mafcvasarhelyi:1` — 2026-10-28 20:00 Europe/Budapest

Do not rewrite or delete either historical import. The canonical fixture source keys remain `20261001:fixture:39` and `brsz:2026/27:menB:userofficial:01`, with existing matchIds. `sql/official_protocols_20261021_source_conflict_audit.sql` was executed on LIVE in **two read-only passes**, returning `STAGED_LEGACY_DATE_CONFLICT` for exactly these two match codes, plus 5 old undated postponements (4 women II/A, 1 men I/B), and the unchanged **298 total / 13 played** canonical baseline.

## 2. New double-DB guard in CI

The isolated test suite gained:
- `tests/official-protocols-20261021/legacy-conflict-fixtures.sql` — **synthetic-only** legacy dataset: 2 conflicting 28 October rows plus 5 undated postponements.
- `tests/official-protocols-20261021/legacy-conflict-guard.sql` — fingerprints all 7 original rows and checks exact source status/time, Hungarian local timezone, NULL postponement dates, 298 distinct canonical IDs.
- Updated `.github/workflows/official-protocols-20261021-db.yml` — runs the guard in **two independent PostgreSQL 17 databases** at initialization, first migration, repeat migration, rollback and reimport; also includes drift/atomic-rollback coverage.

GitHub Actions run **40024451593** (`Official protocols canonical PostgreSQL QA`) **success**, `40024451745` (staging QA) **success**, `40024451602` (Manager Sport Scoring QA) **success**, all on head `c2a5f81b92c7e83200521c01ecc0ac553e603798`. The PostgreSQL fixtures are disposable and never connect to LIVE.

## 3. What remains gated

- Do NOT merge/apply the protocol overlay until approved database release; collect live schema/record preflight, backups, precise 298/13 baselines and verify expected fixture identity and state.
- After eventual approved integration: 298 total, 15 played, 15 verified protocol attachments (13 prior + 2 new), unchanged canonical UUIDs, untouched legacy user schedule and all `events`/`availability`/RSVP. Run the full 11-point QA twice, plus authenticated Manager/Player mobile protocol/statistics smoke tests.
- Historical sources contain 11 separate review cases captured in Manager draft #73: `sql/audit_202627_eleven_source_discrepancies_20261023.sql`. Do not conflate the eleven-review queue with seven separate Manager event crosswalk gaps.
- Unknown/unverified external PDF links must remain empty; do not invent a Hunvolley URL.
