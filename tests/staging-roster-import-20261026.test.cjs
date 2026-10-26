'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const cp=require('node:child_process');
const script=path.resolve(__dirname,'../scripts/prepare-staging-player-import.cjs');
const p1='aaaaaaaa-0000-4000-8000-000000000001',p2='aaaaaaaa-0000-4000-8000-000000000002';
const m1='bbbbbbbb-0000-4000-8000-000000000001',m2='bbbbbbbb-0000-4000-8000-000000000002';
const t1='10000000-0000-4000-8000-000000000001',t2='10000000-0000-4000-8000-000000000002';
function create(override=t2){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cc-roster-test-'));
 const ps=path.join(dir,'players.csv'),ms=path.join(dir,'memberships.csv'),out=path.join(dir,'staged.sql');
 const a=['id,email,name,display_name,position,jersey_no,jersey_size,shorts_size,active,auth_user_id',
 p1+',demo.user@example.invalid,"Teszt, Név",Név,Setter,4,M,S,true,ffffffff-0000-4000-8000-000000000001',
 p2+',person@private.example,Árvíztűrő Szélső,Árvíztűrő,Outside,10,L,M,true,ffffffff-0000-4000-8000-000000000002',''].join('\n');
 const b=['id,player_id,team_id,starts_on,ends_on,active',m1+','+p1+','+t1+',2026-08-31,,true',
 m2+','+p2+','+override+',2026-08-31,,true',''].join('\n');
 fs.writeFileSync(ps,a);fs.writeFileSync(ms,b);
 return {dir,ps,ms,out};
}
function run(s,keep='demo.user@example.invalid'){
 return cp.spawnSync(process.execPath,[script,'--players',s.ps,'--memberships',s.ms,'--out',s.out],{
 encoding:'utf8',env:{...process.env,CC_TEST_IMPORT_SALT:'synthetic-unit-test-hmac-secret-abcdefgh',CC_TEST_PRESERVE_EMAIL:keep}
 });
}
test('sanitized roster: preserves sport data and one TEST login, excludes auth IDs',()=>{
 const s=create();try{
  const r=run(s);assert.equal(r.status,0,r.stderr);
  const sql=fs.readFileSync(s.out,'utf8');
  assert.match(sql,/demo\.user@example\.invalid/);
  assert.doesNotMatch(sql,/person@private\.example/);
  assert.match(sql,/cc-test-[0-9a-f]{12}@example\.invalid/);
  assert.doesNotMatch(sql,/ffffffff-0000-4000-8000-00000000000[12]/);
  assert.doesNotMatch(sql,/auth_user_id|DELETE\s+FROM|TRUNCATE\s+/i);
  assert.match(sql,/Teszt, Név/);
  assert.match(sql,/Árvíztűrő/);
  assert.equal((sql.match(/INSERT INTO public\.players\(/g)||[]).length,2);
  assert.equal((sql.match(/INSERT INTO public\.team_memberships\(/g)||[]).length,2);
 }finally{fs.rmSync(s.dir,{recursive:true,force:true});}
});
test('unexpected team aborts before writing SQL',()=>{
 const s=create('90000000-0000-4000-8000-000000000001');
 try{const r=run(s);assert.notEqual(r.status,0);assert.match(r.stderr,/unexpected team/);assert.equal(fs.existsSync(s.out),false);}
 finally{fs.rmSync(s.dir,{recursive:true,force:true});}
});
test('preserved test email must be present exactly once',()=>{
 const s=create();try{
  const r=run(s,'nobody@example.invalid');assert.notEqual(r.status,0);
  assert.match(r.stderr,/preserved TEST email/);assert.equal(fs.existsSync(s.out),false);
 }finally{fs.rmSync(s.dir,{recursive:true,force:true});}
});
