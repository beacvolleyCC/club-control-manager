# CC TEST database schema restoration — stage 2 (2026-10-26)

Read-only LIVE project: `snqsxlyhontaepembaic`. Isolated TEST Free project: `szzoubvhlwnojtzqjebc`.

**Only TEST migrations executed this turn**:
- `cc_test_five_owned_serial_sequences_20261026` — recreated five serial sequences and column defaults, including ownership and access revocations. Eight identity sequences already existed from prior reconstruction.
- `cc_test_primary_unique_check_constraints_20261026` — 57 primary keys, 16 unique constraints, 94 check constraints.
- `cc_test_foreign_keys_20261026` — 35 foreign keys, including references to project-local auth.users. Empty TEST tables did not require data rewriting.
- `cc_test_remaining_indexes_20261026` — 72 non-constraint indexes, in addition to 73 constraint-backed indexes.

**Latest independent readback:**
| Component | LIVE | TEST |
|---|---:|---:|
| Tables | 57 | 57 |
| Columns | 694 | 694 |
| Constraints | 202 | 202 |
| Indexes | 145 | 145 |
| Sequences | 13 | 13 |
| Tables with RLS | 55 | 57 |
| Anonymous SELECT-accessible application tables | 0 | 0 |
| Functions in public/private | 337 | 47 |
| Custom triggers | 18 | 0 |
| Database size | ~28 MB | ~13 MB |

**Safety**: Live read-only, no LIVE table data copied, no user logins or RSVP rows modified. TEST lacks RLS policies, application RPC functions, views, trigger logic, access grants, and real or synthetic data, so Manager/Player TEST must remain in isolated DEMO mode. Do not globally grant authenticated or anon permissions or switch clients to staging until security parity and dedicated synthetic accounts are verified.

**Next:** inspect and reconstruct function dependency graph with SECURITY DEFINER, search_path and EXECUTE grants reviewed; 18 triggers; only secure views; 11 RLS policies and explicit GRANTs; sanitized dataset/realistic seed; staging functional tests. Avoid blind replay of 31 historic migrations on already reconstructed tables. Follow strict 0 HUF cost policy.