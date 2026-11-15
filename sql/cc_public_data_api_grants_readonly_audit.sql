-- CC-FOLYTATÁS / SUPABASE OCTOBER 30 READ-ONLY PERMISSIONS PREFLIGHT.
-- Use this SELECT audit before/after new migrations. Do NOT GRANT anything
-- here; reporting an absent grant is not an instruction to grant everyone.
WITH exposed AS (
 SELECT c.oid, n.nspname schema_name, c.relname object_name,
        c.relrowsecurity rls_enabled,
        has_table_privilege('anon',c.oid,'SELECT') anon_can_select,
        has_table_privilege('authenticated',c.oid,'SELECT') authenticated_can_select,
        has_table_privilege('authenticated',c.oid,'INSERT') authenticated_can_insert,
        has_table_privilege('authenticated',c.oid,'UPDATE') authenticated_can_update,
        has_table_privilege('authenticated',c.oid,'DELETE') authenticated_can_delete,
        has_table_privilege('service_role',c.oid,'SELECT') service_role_can_select
 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relkind IN ('r','p')
)
SELECT jsonb_build_object(
 'totalPublicTables',(SELECT count(*) FROM exposed),
 'rlsEnabled',(SELECT count(*) FROM exposed WHERE rls_enabled),
 'rlsDisabled',(SELECT coalesce(jsonb_agg(object_name ORDER BY object_name),'[]'::jsonb)
   FROM exposed WHERE NOT rls_enabled),
 'anonSelectable',(SELECT count(*) FROM exposed WHERE anon_can_select),
 'authenticatedSelectable',(SELECT count(*) FROM exposed WHERE authenticated_can_select),
 'authenticatedWriteGrantTables',(SELECT coalesce(jsonb_agg(jsonb_build_object(
    'name',object_name,
    'insert',authenticated_can_insert,'update',authenticated_can_update,
    'delete',authenticated_can_delete) ORDER BY object_name),'[]'::jsonb)
   FROM exposed WHERE authenticated_can_insert OR authenticated_can_update
     OR authenticated_can_delete),
 'objectGrants',(SELECT coalesce(jsonb_agg(jsonb_build_object(
    'name',object_name,'rls',rls_enabled,'anonSelect',anon_can_select,
    'authenticatedSelect',authenticated_can_select,
    'serviceRoleSelect',service_role_can_select) ORDER BY object_name),'[]'::jsonb)
   FROM exposed)
) AS cc_public_acl_snapshot;
