# Club Control – Supabase SECURITY DEFINER warnings review, 2026-10-26

**READ-ONLY LIVE REVIEW; NO LIVE SQL APPLY.** This is a separate draft security remediation from Manager #79 (combined competition UI) and Manager #77 (Oct 30 new public table grants). The 2026/27 fixture list remains final and unchanged.

## Verified live metadata
- `public.cc_capture_competition_standings_history_v1()`: RETURNS trigger, SECURITY DEFINER, owner postgres, attached to `competition_source_standings`; anon/authenticated EXECUTE currently true via grants. The callback inserts standings history when its table trigger fires. Review as an internal trigger, not a normal user data RPC.
- `public.rls_auto_enable()`: RETURNS event_trigger, SECURITY DEFINER, owner postgres, registered as `ensure_rls`; anon/authenticated EXECUTE currently true. This callback runs on DDL CREATE TABLE to enable RLS. Not a normal client RPC.
- `public.cc_mass_public_catalog_v1(text)`: RETURNS jsonb, SECURITY DEFINER, owner postgres, anon EXECUTE true, authenticated EXECUTE false. **Intentionally public** for mass training availability. The reviewed SQL projection includes training/date/time/level/court/free/status/category/registrationMode/waitlistCount, not roster names, emails or contact details. Do not mass-REVOKE this function, and still audit any changes to its body or dependencies.
- `public.cc_manager_competition_mrsz_snapshot_v2()` and `public.cc_player_competition_mrsz_snapshot_v2()`: SECURITY DEFINER, anon EXECUTE false; authenticated EXECUTE true with their existing v1 gate. Actual signed-in team-role test remains required.
- The Supabase security advisor's 3 anonymous-security-definer findings are **warnings, not evidence of data theft**. 110 signed-in security-definer findings require function-by-function gate reviews; no claim that all are safe.

## Proposed narrow mitigation (not applied)
- `sql/cc_security_definer_trigger_acl_hardening_20261026.sql` revokes `EXECUTE` from `PUBLIC, anon, authenticated` only for the two internal trigger functions, after exact type/dependency checks. Transaction fails closed on drift; idempotent.
- The public mass training catalog and both Manager/Player canonical RPCs are explicitly preserved. No data, table, RLS policy, private procedure, event booking, meeting location, notification or grant outside these two trigger functions is touched.
- `sql/cc_security_definer_anon_readonly_audit_20261026.sql` is an always-read-only inventory of anonymous SECURITY DEFINER functions, trigger attachments and review category.
- CI uses two independent disposable PostgreSQL 17 instances/databases and checks live trigger execution **after** revoking user-level EXECUTE, catalog availability, manager/player RPC ACL, replay and negative drift rollback. The PG17 fixture mirrors the ACL mechanism, not the full live Supabase schema; the CI cannot prove real user JWT access.

## Release requirements
1. Re-check actual LIVE grants, signatures and trigger dependencies with the read-only audit immediately before any proposed SQL apply.
2. Review potential callers and verify the two trigger callbacks operate correctly in real staging with representative writes/DDL; do not assume catalog privacy without testing its public response under an actual anon session.
3. Run security advisor again and confirm the precise warnings cleared, with all expected PWA/Manager/Player operations intact.
4. Obtain an explicit deployment decision and rollback plan. This draft branch must not merge or deploy automatically.

Docs: https://supabase.com/docs/guides/observability/advisors?queryGroups=lint&lint=0028_anon_security_definer_function_executable

Security note: the 2026-10-25 advisor also listed mutable search_path, `citext` in public, and leaked-password protection settings. These are separate issues; do not silently change them as part of this ACL remediation.
