# TEST – Finance Manager E2E acceptance plan (2026-11-02)

Status: **NOT YET EXECUTED**. No LIVE writes permitted. Only the TEST Supabase project (`szzoubvhlwnojtzqjebc`) and TEST Manager frontend may be used.

## Preconditions
1. Verify the Manager frontend points to TEST Supabase, not LIVE.
2. Use a **dedicated TEST athlete/player**, not an existing real athlete. Never create a fictional payment for a real player.
3. Log in with the intended TEST Manager; verify role permission `competition.fees:edit`.
4. Snapshot/record pre-test counts of `cc_player_fee_meta_v2382` and `cc_player_fee_audit_v2382`; the latest read-only inventory found 0 / 0.
5. Confirm two settings audit triggers are enabled and finance RPCs have no anon EXECUTE.

## End-to-end cases
- [ ] Access: authenticated authorized Manager can view finance; anonymous/unprivileged account cannot.
- [ ] Create: save an isolated TEST fee row (`fee_type=other`, unique TEST period/season, obvious `TEST ONLY` note).
- [ ] Read: fetch via the relevant finance read endpoint; verify amount, state, method, note, and period.
- [ ] Audit create: exactly one expected `create` audit item with correct actor email and previous state.
- [ ] Update: change only amount/state; verify same business-key row is updated, not duplicated.
- [ ] Audit update: correct old/new snapshot; actor email and timestamp present.
- [ ] Validation: NULL or invalid fee_type/status, negative amount, malformed month must fail with no row/audit change.
- [ ] Repeat: retry with same business key; still only one fee row; audit behavior documented.
- [ ] Concurrency: simultaneous updates do not create duplicate business-key records.
- [ ] Settings: Manager setting edit produces exactly the expected settings audit event.
- [ ] Cleanup: remove only specifically identified TEST records through an audited/approved cleanup, or keep clearly identified synthetic fixtures; verify no unrelated rows changed.

## Read-only verification queries
```sql
select count(*) as fee_rows from public.cc_player_fee_meta_v2382;
select count(*) as audit_rows from public.cc_player_fee_audit_v2382;
select indexname,indexdef from pg_indexes where schemaname='public'
 and tablename='cc_player_fee_meta_v2382' and indexname='cc_player_fee_meta_v2382_unique';
```

## Completion gate
Do not mark finance E2E complete without **actual authenticated TEST Manager requests**, validated results, and evidence of after-save readback plus audit. Static function-definition checks are not E2E. Do not install the BEAC reconciliation RPC or import LIVE finance records before a verified backup and reconciliation mapping.
