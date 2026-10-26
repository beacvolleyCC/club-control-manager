# CC TEST handover — offline roster import and TEST Auth provisioning (2026-10-26)

## Implemented
- TEST-only offline CSV importer: `scripts/prepare-staging-player-import.cjs`, regression checks `tests/staging-roster-import-20261026.test.cjs`; three tests passed in GitHub Actions run 40417889292. A private `private-import/` directory is Git-ignored.
- Operator-managed CSV extraction is the only approved way to import a real roster, because direct access to real player data was blocked. No private roster was transferred by the assistant. Imports preserve sports fields and membership history and replace all contact emails except an explicitly named TEST account. The SQL is generated locally and executed manually only in the TEST SQL editor.
- TEST Supabase `szzoubvhlwnojtzqjebc` currently has 3 teams, 18 synthetic players, 18 synthetic team memberships, 11 synthetic events, 66 sample RSVP records, 0 Auth users, 0 manager accounts. LIVE untouched.
- A separate TEST-only `private.cc_test_bind_existing_auth_v1(text,boolean)` function is installed to link a *confirmed, already-created* TEST Auth account to an existing TEST player by matching email. Optionally provisions a TEST manager account with permissions to allow integration testing. The function is SECURITY INVOKER (no definer), checks `current_user='postgres'`, is in unexposed `private` schema, and explicitly revokes execution from PUBLIC, anon and authenticated. Database readback confirmed `anon_exec=false`, `auth_exec=false`.
- **The function must be invoked only from the TEST SQL Editor after verifying the exact TEST project and the existence of a confirmed TEST Auth user**. No Auth user was programmatically inserted or linked in this turn. No outward notification, push or email functionality enabled.
- The GitHub TEST PWA build is still demo-only. Do not switch until TEST authentication works and missing RPCs, RLS checks, communication mock/suppression and app boot compatibility are addressed.

## Next operator steps
1. Create only the intended TEST account in Supabase TEST dashboard → Authentication → Users; confirm its email via the TEST auth provider and do not transfer LIVE auth IDs or passwords.
2. Import and inspect a sanitized roster if desired (see `docs/handover/SAFE_STAGING_PLAYER_ROSTER_IMPORT_20261026.md`), including the specifically preserved TEST email.
3. In the TEST SQL Editor, after confirming all names/UUIDs and the project ref, run:
   `SELECT private.cc_test_bind_existing_auth_v1('<your TEST email>',true);`
   The boolean true enables TEST Manager permissions; false links Player only. It does not grant public access or activate outbound email/push.
4. Test readback and authenticated cross-team isolation with controlled TEST identities and the Supabase Auth normal flow before turning on TEST Player/Manager remote mode. Never run this function against LIVE.

Cost 0 Ft; no LIVE DML.
