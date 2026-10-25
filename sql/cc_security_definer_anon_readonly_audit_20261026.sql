-- READ-ONLY, safe for production preflight. Outputs FUNCTION METADATA only.
-- No member profiles, tokens, JWT claims, passwords or personally identifying data.
-- Do not equate an advisory warning with a proven vulnerability or data leak.
WITH functions AS (
 SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) AS args,
        p.prorettype::regtype::text AS return_type,
        p.prosecdef AS security_definer, pg_get_userbyid(p.proowner) AS owner_name,
        has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute,
        has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_execute,
        (SELECT count(*) FROM pg_trigger t
          WHERE t.tgfoid=p.oid AND NOT t.tgisinternal) AS table_trigger_bindings,
        (SELECT count(*) FROM pg_event_trigger e
          WHERE e.evtfoid=p.oid) AS event_trigger_bindings
 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.prosecdef
)
SELECT proname,args,return_type,owner_name,anon_execute,authenticated_execute,
       table_trigger_bindings,event_trigger_bindings,
       CASE
         WHEN return_type='trigger' AND table_trigger_bindings>0
           THEN 'TRIGGER_ONLY_REVIEW_EXECUTE_ACL'
         WHEN return_type='event_trigger' AND event_trigger_bindings>0
           THEN 'EVENT_TRIGGER_ONLY_REVIEW_EXECUTE_ACL'
         WHEN proname='cc_mass_public_catalog_v1'
           THEN 'INTENTIONALLY_PUBLIC_REVIEW_OUTPUT_FIELDS'
         ELSE 'REVIEW_PUBLIC_RPC_BODY_AND_AUTHORIZATION'
       END AS review_class
FROM functions
WHERE anon_execute
ORDER BY proname,args;
