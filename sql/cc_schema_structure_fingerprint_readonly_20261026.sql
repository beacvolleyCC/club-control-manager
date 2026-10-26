-- Club Control: read-only structural fingerprint. NO table data / identities / tokens.
-- Run unchanged on the live baseline and subsequently on an empty staging clone.
-- Hash differences indicate schema drift; matching hashes do NOT replace end-to-end QA.
WITH defs AS (
 SELECT 'relations'::text category,n.nspname||'.'||c.relname AS name,
 concat_ws('|',c.relkind::text,c.relrowsecurity::text,c.relforcerowsecurity::text,coalesce(c.relacl::text,'')) AS definition
 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname IN ('public','private') AND c.relkind IN ('r','p','v','m','S','f')
 UNION ALL
 SELECT 'columns',n.nspname||'.'||c.relname||'.'||lpad(a.attnum::text,3,'0')||'.'||a.attname,
 concat_ws('|',format_type(a.atttypid,a.atttypmod),a.attnotnull::text,coalesce(pg_get_expr(d.adbin,d.adrelid),''))
 FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace
 LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
 WHERE n.nspname IN ('public','private') AND c.relkind IN ('r','p','v','m','f') AND a.attnum>0 AND NOT a.attisdropped
 UNION ALL
 SELECT 'functions',n.nspname||'.'||p.proname||'('||pg_get_function_identity_arguments(p.oid)||')',
 md5(concat_ws('|',p.prosecdef::text,coalesce(p.proacl::text,''),pg_get_functiondef(p.oid)))
 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname IN ('public','private') AND p.prokind IN ('f','p','w')
 UNION ALL
 SELECT 'constraints',n.nspname||'.'||c.relname||'.'||con.conname,pg_get_constraintdef(con.oid)
 FROM pg_constraint con JOIN pg_class c ON c.oid=con.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname IN ('public','private')
 UNION ALL
 SELECT 'indexes',n.nspname||'.'||ci.relname,pg_get_indexdef(i.indexrelid)
 FROM pg_index i JOIN pg_class ci ON ci.oid=i.indexrelid JOIN pg_namespace n ON n.oid=ci.relnamespace
 WHERE n.nspname IN ('public','private')
 UNION ALL
 SELECT 'policies',n.nspname||'.'||c.relname||'.'||pol.polname,
 concat_ws('|',pol.polcmd::text,pol.polpermissive::text,
  (SELECT string_agg(coalesce(roles.rolname,'PUBLIC'),',' ORDER BY coalesce(roles.rolname,'PUBLIC'))
   FROM unnest(pol.polroles) AS roles_id(role_oid)
   LEFT JOIN pg_roles roles ON roles.oid=roles_id.role_oid),
  coalesce(pg_get_expr(pol.polqual,pol.polrelid),''),
  coalesce(pg_get_expr(pol.polwithcheck,pol.polrelid),'')) FROM pg_policy pol
 JOIN pg_class c ON c.oid=pol.polrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname IN ('public','private')
 UNION ALL
 SELECT 'triggers',n.nspname||'.'||c.relname||'.'||tg.tgname,pg_get_triggerdef(tg.oid)
 FROM pg_trigger tg JOIN pg_class c ON c.oid=tg.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname IN ('public','private') AND NOT tg.tgisinternal
), fingerprint AS (
 SELECT category,count(*)::int AS objects,md5(string_agg(name||'|'||definition,E'\n' ORDER BY name)) AS fingerprint
 FROM defs GROUP BY category
)
SELECT jsonb_object_agg(category,jsonb_build_object('objects',objects,'fingerprint',fingerprint)) AS schema_structure FROM fingerprint;
