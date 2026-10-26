# CLUB CONTROL — TEST database stage-1 schema handover (2026-10-26)

## Verified LIVE isolation
- LIVE Supabase project: `snqsxlyhontaepembaic`, status `ACTIVE_HEALTHY`, PostgreSQL 17.6, approx. 28 MB.
- LIVE Manager main: `4d13876a7fefab02ab77ce934c00e77dd6850536`; LIVE Player main: `8507ea5574bdce6788d77b553faeb66e02592499`. Draft Manager PR #79 and Player PR #28 not merged.
- LIVE database accessed through SELECT-only metadata queries. No LIVE DDL/DML. The tests here do **not** prove all user flows work in production; iPhone login/RSVP/push still require acceptance tests.

## TEST work actually applied
- TEST Free Supabase project: `szzoubvhlwnojtzqjebc`, status `ACTIVE_HEALTHY`, PostgreSQL 17.11.
- Only TEST migrations applied via Supabase: `cc_test_foundation_20261026` and `cc_test_57_tables_restricted_20261026`.
- Created `private` schema, installed `citext` extension in `public`, denied PUBLIC/anon/authenticated access to private schema.
- Using LIVE PostgreSQL catalog, reconstructed **57 tables and 694 columns**, including original types, nullability, identity columns, most default expressions. **Five `nextval(...)` serial defaults intentionally postponed** (sequence and ownership to be reconstructed in separate reviewed migration).
- Enabled RLS on **57/57 TEST tables**, revoked PUBLIC/anon/authenticated table rights. No real athlete data, logins, bookings, competition results, or raw documents copied.
- Column-identity digest identical on LIVE and TEST:
  `64b5726febc077c12674dee31bedaf9b`
  (ordered schema.table + ordinal + column name + type + NOT NULL + identity).
- Latest DB verification: TEST 57 tables, 694 columns, 57 RLS enabled, **0** policies, **0** constraints, 47 built-in/public/private functions total, 0 anon-selectable application tables, approx. 12 MB.
- LIVE comparison: 57 tables, 694 columns, 55 RLS enabled, 11 policies, 202 constraints, 337 functions, approx. 28 MB.

## IMPORTANT — not yet an operational clone
- **Not restored:** sequences/defaults for 5 legacy serial columns; PK/FK/unique/check constraints; indexes and ownership; original grants, policies, functions, views, trigger logic and security definer behavior; 31 historic migration SQL replay and original pre-Oct-10 baseline; storage buckets and safe synthetic data.
- Existing TEST Manager/Player phone PWA branches currently use DEMO mode. Do not turn on Supabase TEST in config until all privilege/security gates pass.
- The partial TEST tables must remain inaccessible; don't grant blanket SELECT/INSERT/UPDATE/DELETE for anon/authenticated just to make the UI work.
- In follow-up: recover full schema-only dump on trusted local CLI; migrate and validate sequences, constraints/indexes/functions/triggers/RLS; compare fingerprints, recheck side-effectful GET RPCs, seed synthetic data and test real staging auth. **Never replay historical migrations blindly on top of partially reconstructed tables**.
- Release rule: ALL changes TEST first, explicit approved release to LIVE, 0 HUF external charges.
