# V2 TEST database inventory (read-only)

Source: TEST Supabase project `szzoubvhlwnojtzqjebc`, information_schema.tables, 2026-11-07. This is a table-name inventory, **not** a complete schema or relationship audit.

## Core and access
- `players`, `player_private`, `teams`, `team_memberships`
- `manager_accounts`, `manager_module_permissions`, `manager_settings`, `manager_runtime_state`
- `events`, `availability`, `court_availability`, `attendance_change_audit`, `audit_log`

## Mass sport
- `mass_athletes`, `mass_events`, `mass_bookings`, `mass_waitlist`
- `mass_passes`, `mass_pass_validity_overrides`, `mass_pass_month_overrides_b43`
- `mass_sanctions`, `mass_level_overrides`, `mass_live_write_audit`
- private: `cc_mass_advanced_rules_v1`, `cc_mass_advanced_rules_audit_v1`, `cc_mass_email_otp_v1`, `cc_mass_mail_outbox_v1`

## Competition and match data
- `competition_source_matches`, `competition_source_standings`, `competition_source_standings_history`, `competition_source_team_maps`, `competition_source_changes`, `competition_sync_runs`
- `cc_competition_match_arrangements_v1`, `cc_competition_match_overrides_v1`, `cc_competition_match_override_audit_v1`, `cc_competition_mrsz_screenshot_v1`, `cc_competition_user_schedule_v1`
- `cc_match_documents_v1`, `cc_match_document_facts_v1`, `cc_match_sheets_v1`, `cc_match_sheet_sets_v1`, `cc_match_sheet_roster_v1`, `cc_match_sheet_revisions_v1`, `cc_match_live_events_v1`
- private: `cc_canonical_matches_v1`, `cc_canonical_match_aliases_v1`

## Finance, notifications, operations
- `player_fees`, `cc_player_fee_meta_v2382`, `cc_player_fee_audit_v2382`, `cc_team_finance_settings_v1`, `cc_club_finance_settings_v1`
- `player_notifications`, `player_push_outbox`, `player_push_deliveries`, `player_push_subscriptions`, `player_settings`
- `cc_team_equipment_v1`, `cc_coach_event_availability_v1`, `cc_manager_transfer_plans_v1`, `manager_team_transfer_audit`
- `legacy_sheet_snapshots`, `manager_cutover_runs`, `manager_migration_runs`, `manager_test_player_delete_audit`
- private: `cc_push_sender_cron_backup_v051`, `cc_push_sender_lease_v051`

## Immediate follow-up
- Export column definitions, PK/FK and unique constraints from TEST and compare with LIVE read-only.
- Inventory public RPCs including signatures, privileges, security-definer usage and authorization checks.
- Map duplicate representations: `players` vs `mass_athletes`; `events` vs `mass_events`; `availability` vs `mass_bookings`; official competition source vs canonical match facts.
- Define ID mapping and reconciliation strategy before creating any V2 tables.
