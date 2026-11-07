'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {auditSql,auditRepository,names}=require('../scripts/check-public-table-permissions.cjs');

const safePrivate=[
 'create table if not exists public.cc_private_qa(id uuid primary key);',
 'alter table public.cc_private_qa enable row level security;',
 'revoke all on public.cc_private_qa from public, anon, authenticated;'
].join('\n');
const safeRead=[
 'create table public.cc_roster_qa(id uuid, owner_id uuid);',
 'alter table public.cc_roster_qa enable row level security;',
 'revoke all on public.cc_roster_qa from public, anon, authenticated;',
 'grant select on public.cc_roster_qa to authenticated;',
 'create policy "own rows" on public.cc_roster_qa for select to authenticated using(owner_id = auth.uid());'
].join('\n');
test('private-by-default new public table is valid when explicitly revoked and RLS-protected',()=>{
 assert.deepEqual(auditSql(safePrivate),[]);
 assert.deepEqual(names(safePrivate),['cc_private_qa']);
});
test('authenticated read-only exposure is accepted when RLS is enabled',()=>{
 assert.deepEqual(auditSql(safeRead),[]);
});
test('RLS and grants absent are blocked, even with a reassuring SQL comment',()=>{
 const sql='-- RLS and grants already configured by Supabase\n'
 +'create table public.cc_bad(id bigint);';
 assert.deepEqual(auditSql(sql).map(e=>e.rule),[
  'RLS_MISSING','EXPLICIT_ACL_DECISION_MISSING'
 ]);
});
test('RLS alone is not enough after the October 30 Data API change',()=>{
 const sql='create table public.cc_missing_grant(id integer);'
 +'alter table public.cc_missing_grant enable row level security;';
 assert.deepEqual(auditSql(sql).map(e=>e.rule),['EXPLICIT_ACL_DECISION_MISSING']);
});
test('granting all privileges to authenticated/anon is rejected',()=>{
 const sql='create table public.cc_overexposed(id bigint);'
 +'alter table public.cc_overexposed enable row level security;'
 +'grant all on public.cc_overexposed to anon, authenticated;';
 const findings=auditSql(sql).map(e=>e.rule);
 assert.ok(findings.includes('BROAD_CLIENT_GRANT_ALL'));
 assert.ok(findings.includes('EXPLICIT_ACL_DECISION_MISSING')===false);
});
test('direct writes by authenticated require a row-specific policy',()=>{
 const sql='create table public.cc_open_write(id bigint);'
 +'alter table public.cc_open_write enable row level security;'
 +'grant select,insert,update,delete on public.cc_open_write to authenticated;';
 assert.ok(auditSql(sql).some(e=>e.rule==='CLIENT_WRITE_WITHOUT_POLICY'));
});
test('functions, private tables, views and commented CREATE statements are not public-table false positives',()=>{
 assert.deepEqual(auditSql([
  '-- create table public.cc_comment(id uuid);',
  '/* create table public.cc_block(id uuid); */',
  'create table private.cc_real(id uuid);',
  'create view public.cc_view as select 1 as number;',
  'create function public.cc_fn() returns int language sql as $$select 1$$;'
 ].join('\n')),[]);
});
test('Club Control tracked SQL has no introduced public table without ACL/RLS decision',()=>{
 const result=auditRepository('.');
 assert.ok(result.count>=10,'Must scan historical migrations as well as SQL');
 assert.ok(result.tables.length>=2,'Must find existing public table migrations');
 assert.deepEqual(result.errors,[]);
});
