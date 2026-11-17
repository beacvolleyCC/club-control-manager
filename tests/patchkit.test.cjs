'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {normalizeRelease,checkAdditiveSQL,statements,plan,main}=require('../scripts/patchkit.cjs');
const release='.club-control/patches/releases/20261117_patch_release_foundation.json';
test('patch planner and manifest are valid, deterministic and database-free',()=>{
 const r=normalizeRelease(release);
 assert.equal(r.release.database.mode,'none');
 assert.equal(r.migrations.length,0);
 assert.equal(r.release.dataCopy,false);
 assert.equal(r.release.allowProductionDataWrite,false);
 const t=plan(r,'test'),l=plan(r,'live');
 assert.match(t,/szzoubvhlwnojtzqjebc/);
 assert.doesNotMatch(t,/snqsxlyhontaepembaic/);
 assert.match(l,/snqsxlyhontaepembaic/);
 assert.doesNotMatch(l,/szzoubvhlwnojtzqjebc/);
 assert.match(l,/NO ACTIONS PERFORMED/);
 assert.match(t,/None – frontend\/tooling only/);
});
test('explicit environment and release paths are required',()=>{
 const r=normalizeRelease(release);
 assert.throws(()=>plan(r,''),/explicit --env/);
 assert.throws(()=>plan(r,'prod'),/explicit --env/);
 assert.throws(()=>normalizeRelease('../README.md'),/outside permitted directory/);
 assert.throws(()=>main(['deploy','--release',release,'--env','live']),/PATCH_REJECTED/);
});
test('planner accepts only additive DDL and RLS/role grants',()=>{
 const additive=[
  'CREATE TABLE IF NOT EXISTS public.cc_demo_patch (id uuid PRIMARY KEY);',
  'ALTER TABLE public.cc_demo_patch ADD COLUMN IF NOT EXISTS note text;',
  'ALTER TABLE public.cc_demo_patch ENABLE ROW LEVEL SECURITY;',
  'GRANT SELECT ON public.cc_demo_patch TO authenticated;',
  'REVOKE ALL ON public.cc_demo_patch FROM anon;',
  'CREATE POLICY demo ON public.cc_demo_patch FOR SELECT TO authenticated USING (false);',
  'CREATE OR REPLACE FUNCTION public.cc_patch_probe() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO \'\' AS $func$ SELECT true; $func$;',
 ].join('\n');
 assert.equal(checkAdditiveSQL(additive,'demo.sql'),7);
});
test('planner blocks explicit DML, destructive DDL and data-copy commands',()=>{
 const rejected=[
   'DELETE FROM public.players;',
   'UPDATE public.players SET active=false;',
   'INSERT INTO public.player_fees(player_id) VALUES (1);',
   'TRUNCATE public.players;',
   'DROP TABLE public.players;',
   'ALTER TABLE public.players DROP COLUMN email;',
   'ALTER TABLE public.players ALTER COLUMN email TYPE text;',
   'CREATE TABLE public.dumped AS SELECT * FROM public.players;',
   'SELECT * FROM public.players;',
   'DO $$ BEGIN DELETE FROM public.players; END $$;',
   'COPY public.players FROM STDIN;'
 ];
 for(const sql of rejected)assert.throws(()=>checkAdditiveSQL(sql,'blocked.sql'),/PATCH_REJECTED/,'should reject: '+sql);
});
test('SQL splitter does not split inside comments, string literals, dollar-quoted functions',()=>{
 const sample=String.raw`-- DELETE FROM users;
CREATE OR REPLACE FUNCTION public.f()
RETURNS text LANGUAGE plpgsql
AS $func$
BEGIN
  RETURN 'semicolon; and a DROP literal;';
END;
$func$;
CREATE TABLE public.test (x text);
`;
 const a=statements(sample);
 assert.equal(a.length,2);
 assert.match(a[0],/CREATE OR REPLACE FUNCTION/);
 assert.match(a[1],/CREATE TABLE/);
 assert.throws(()=>statements("CREATE TABLE t(x text); /* unfinished"),/unterminated/);
 assert.throws(()=>checkAdditiveSQL("CREATE FUNCTION public.f() RETURNS int LANGUAGE sql SECURITY DEFINER AS $$SELECT 1$$;",'unsafe.sql'),/pinned search_path/);
});
test('CLI generates plans without environment secrets or deployment',()=>{
 const output=execFileSync(process.execPath,['scripts/patchkit.cjs','plan','--release',release,'--env','test'],{encoding:'utf8'});
 assert.match(output,/No frontend deploy or database operation|This tool NEVER connects/);
 assert.match(output,/TEST/);
 const validate=execFileSync(process.execPath,['scripts/patchkit.cjs','validate','--release',release],{encoding:'utf8'});
 assert.match(validate,/PASS/);
});
