'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const {readMigrations,localMigrations,audit,evaluate}=require('../scripts/qa/staging-migration-parity.cjs');
const root=path.join(__dirname,'..');
test('actual, non-sensitive metadata snapshot is BLOCKED with missing migration history',()=>{
 const snapshot=JSON.parse(fs.readFileSync(path.join(root,'data/qa/supabase-migration-history-20261026.json'),'utf8'));
 const res=evaluate(snapshot,path.join(root,'supabase/migrations'));
 assert.deepEqual([res.remoteMigrations,res.trackedMigrations,res.matchingVersions],[31,8,3]);
 assert.equal(res.missingInGit.length,28);
 assert.equal(res.unrecordedInSupabase.length,5);
 assert.equal(res.status,'BLOCKED');
});
test('complete reproducible migration history produces READY',()=>{
 const r=audit(['20261010000000','20261011000000'],['20261010000000','20261011000000']);
 assert.equal(r.status,'READY');
 assert.deepEqual(r.missingInGit,[]);
 assert.deepEqual(r.unrecordedInSupabase,[]);
});
test('remote untracked drift, local-only drift and no history cannot pass',()=>{
 for(const [remote,local] of [[['20261010000000'],[]],[[],[]],
   [['20261010000000'],['20261011000000']]]){
  assert.equal(audit(remote,local).status,'BLOCKED');
 }
});
test('invalid or repeated migration metadata is rejected before release',()=>{
 assert.throws(()=>readMigrations({migrations:[{version:'20261010000000'},{version:'20261010000000'}]}),/Malformed or duplicate/);
 assert.throws(()=>readMigrations({migrations:[{version:'2026-10-10'}]}),/Malformed or duplicate/);
});
test('release parity mode refuses to proceed with this snapshot',()=>{
 const processResult=cp.spawnSync(process.execPath,[path.join(root,'scripts/qa/staging-migration-parity.cjs'),'--require-parity'],{cwd:root,encoding:'utf8'});
 assert.equal(processResult.status,2);
 assert.match(processResult.stdout,/"status": "BLOCKED"/);
});
