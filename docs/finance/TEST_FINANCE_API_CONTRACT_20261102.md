# CC TEST – Financial API compatibility and lossless migration gate

Status: contract mapping complete; backend reconciliation/mutation NOT implemented. Source: Manager TEST app.js (direct read of target branch), TEST Supabase pg_proc and information_schema. LIVE untouched.

## Client calls (exact names)
| RPC | Parameters | Expected output |
|---|---|---|
| cc_manager_finance_matrix_v1 | p_team_id, p_season | object: players[], fees[], meta[], settings, optional settingsByTeam |
| cc_manager_finance_audit_v1 | p_limit | array of audit rows |
| cc_manager_finance_reconcile_beac_v1 | p_season | reconciliation result; frontend ignores missing-function error |
| cc_manager_finance_override_set_v1 | p_player_id,p_fee_type,p_period_key,p_season,p_status,p_payment_method,p_amount_huf,p_paid_at,p_paid_to,p_note,p_override_active | successful write followed by matrix reload |
| cc_manager_finance_settings_get_v2 | p_team_id,p_season | settings object; fallback get_v1(p_season) |
| cc_manager_finance_settings_set_v2 | p_team_id,p_season,p_payload | {row: settings} or settings; fallback set_v1(p_season,p_payload) |
| cc_manager_pass_catalog_v1 | none | array; fallback reads existing pass sources |
| cc_manager_mass_passes_v1 | p_query,p_month | array; **exists in TEST** |

## Critical frontend field names (camelCase)
- players: playerId, displayName/name, email, teamId, teamName.
- fees: playerId, feeType, periodKey, feeId, playerEmail, sourceRef, paidAt, dueDate, status, paymentMethod.
- meta: playerId, feeType, periodKey, season, overrideActive, note, paymentMethod, paidTo, status.
- Fee types: beac_pass, coach_fee, permission_fee. UI periods: YYYY-MM, or empty for permission_fee.
- Settings payload: passAmountHuf, coachAmountHuf, licenseAmountHuf, passPurchaseUrl, coachPaymentRecipient, coachPaymentAccount, coachPaymentText, playerInfo.

## Override policy visible in client (must be preserved)
An override is locked only if overrideActive is true and note DOES NOT begin with AUTO_BEAC_IMPORT. Locked meta wins over base fee. Without lock, base fee wins; meta supplies paymentMethod and paidTo. No fee must be interpreted as paid. This is client behavior, not yet enforced server-side.

## Data integrity gates BEFORE any copying
1. Read-only full SOURCE identification and independently restorable snapshot including passes, fee metadata, fee audit, team and club settings, legacy pass overrides.
2. Inventory source counts, unique business keys, duplicates, currency sums and row hashes; compare by origin and season.
3. Import TEST into staging with explicit source identifier and idempotent merge; **never destructive TRUNCATE/REPLACE on financial tables**, never change a manual locked override.
4. Verify counts and row-level reconciliation, pass validity and purchase date, amount, status, paidAt and actor/audit history.
5. Authenticated Manager negative/positive tests, concurrent write tests and Player readback before cutover.
6. Preserve LIVE unchanged until separate explicit approval.

## Verified TEST gaps
The eight cc_manager_finance_* RPCs and cc_manager_pass_catalog_v1 are missing. All eight relevant TEST finance tables had zero rows at latest read. Do not describe this as loss of existing production data. No restore, import or financial mutation performed.
