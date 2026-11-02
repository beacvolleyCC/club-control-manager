# Club Control – Manager Finance TEST API contract (2026-11-02)

Source: direct introspection of Supabase TEST project `szzoubvhlwnojtzqjebc`. **Not a claim that the frontend already calls these RPCs.** No LIVE changes.

## Available PostgreSQL RPCs (all return JSONB)
| Purpose | RPC | Parameters |
|---|---|---|
| Matrix/read | `cc_manager_finance_matrix_v1` | `p_team_id uuid, p_season text` |
| Audit log | `cc_manager_finance_audit_v1` | `p_limit integer` |
| Per-player fee override write | `cc_manager_finance_override_set_v1` | `p_player_id text, p_fee_type text, p_period_key text, p_season text, p_status text, p_payment_method text, p_amount_huf integer, p_paid_at timestamptz, p_paid_to text, p_note text, p_override_active boolean` |
| Club settings read | `cc_manager_finance_settings_get_v1` | `p_season text` |
| Team settings read | `cc_manager_finance_settings_get_v2` | `p_team_id uuid, p_season text` |
| Club settings write | `cc_manager_finance_settings_set_v1` | `p_season text, p_payload jsonb` |
| Team settings write | `cc_manager_finance_settings_set_v2` | `p_team_id uuid, p_season text, p_payload jsonb` |

## Frontend wiring
- Call through the existing authenticated TEST Supabase client with `supabase.rpc(name, params)`; do not call from anon/public webpages.
- **Do not substitute** `matrix_v1(p_season)` or `audit_v1()`—the signatures above are mandatory.
- For writes, require Manager `competition.fees:edit` permission; the RPC independently enforces this permission.
- Fee type is one of `beac_pass|coach_fee|permission_fee|jersey_fee|team_fee|other`; status one of `due|paid|waived|prior_paid`.
- Period is `YYYY-MM` or empty; amount is nonnegative HUF integer or null.
- The write RPC returns JSON with `saved: true` and `row` after successful upsert and audit insert. Do not display success from the client until RPC resolves.
- On error, show the server error without replacing existing UI values. Refresh matrix and audit following a successful write.
- Use a *dedicated test-only player* for integration checks. Do not edit a real person's financial data just to prove the UI.

## Evidence gap
A manager account and one player marked TEST exist in the TEST DB, but **no authenticated Manager end-to-end payment write has been executed**. The repository branch queried did not expose expected application entrypoint files at `package.json`, `src/App.jsx`, `src/App.tsx`; locate actual frontend source before editing it. A separate Manager UI deployment may exist.

## Acceptance
Complete the checklist in `docs/qa/FINANCE_MANAGER_E2E_TEST_PLAN_20261102.md` against actual TEST Manager session, including save, reread, audit, update, unauthorized access, cleanup and consistency.
