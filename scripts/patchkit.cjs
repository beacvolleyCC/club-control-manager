#!/usr/bin/env node
'use strict';
// Club Control patch planner: validation and plans ONLY; no remote writes, credentials or network.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const RELEASES=path.join(ROOT,'.club-control','patches','releases');
const SQL_ROOT=path.join(ROOT,'.club-control','patches','sql');
const ID=/^[0-9]{8}_[a-z][a-z0-9_]{3,80}$/;
const VERSION=/^[0-9]{14}_[a-z][a-z0-9_]*\.sql$/;
function fail(message){throw new Error('PATCH_REJECTED: '+message)}
function ensureInside(parent,target){
 const p=path.resolve(parent),t=path.resolve(target);
 if(t===p||!t.startsWith(p+path.sep))fail('outside permitted directory: '+target);
 return t;
}
function sha256(s){return crypto.createHash('sha256').update(s).digest('hex')}
/* Only split at unquoted semicolons; function bodies within dollar-quotes are atomic. */
function statements(sql){
 let out=[],buf='',mode='',dollar='';
 for(let i=0;i<sql.length;i++){
   const c=sql[i],next=sql[i+1];
   if(mode==='linecomment'){if(c==='\n'){mode='';buf+='\n'}continue}
   if(mode==='blockcomment'){if(c==='*'&&next==='/'){mode='';i++}continue}
   if(mode==='single'){buf+=c;if(c==="'"){if(next==="'"){buf+=next;i++}else mode=''}continue}
   if(mode==='double'){buf+=c;if(c==='"'){if(next==='"'){buf+=next;i++}else mode=''}continue}
   if(mode==='dollar'){if(sql.startsWith(dollar,i)){buf+=dollar;i+=dollar.length-1;mode=''}else buf+=c;continue}
   if(c==='-'&&next==='-'){mode='linecomment';i++;continue}
   if(c==='/'&&next==='*'){mode='blockcomment';i++;continue}
   if(c==="'"){mode='single';buf+=c;continue}
   if(c==='"'){mode='double';buf+=c;continue}
   if(c==='$'){
     const m=sql.slice(i).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/);
     if(m){dollar=m[0];mode='dollar';buf+=dollar;i+=dollar.length-1;continue}
   }
   if(c===';'){if(buf.trim())out.push(buf.trim());buf='';continue}
   buf+=c;
 }
 if(['single','double','dollar','blockcomment'].includes(mode))fail('unterminated SQL quote/comment');
 if(buf.trim())out.push(buf.trim());
 return out;
}
function checkAdditiveSQL(sql,name){
 const list=statements(sql);
 if(!list.length)fail('empty SQL patch: '+name);
 for(const statement of list){
  const s=statement.replace(/\s+/g,' ').trim();
  const allowed=[
    /^CREATE (?:OR REPLACE )?FUNCTION\b/i,
    /^CREATE TABLE (?:IF NOT EXISTS )?\b/i,
    /^CREATE (?:UNIQUE )?INDEX (?:IF NOT EXISTS )?\b/i,
    /^ALTER TABLE\b.*?\bADD (?:COLUMN |CONSTRAINT )/i,
    /^ALTER TABLE\b.*?\bENABLE ROW LEVEL SECURITY\b/i,
    /^CREATE POLICY\b/i,/^GRANT\b/i,/^REVOKE\b/i,/^COMMENT ON\b/i,/^CREATE TYPE\b/i,
  ].some(r=>r.test(s));
  if(!allowed)fail('non-additive or unsupported SQL in '+name+': '+s.slice(0,80));
  if(/^CREATE TABLE\b/i.test(s)&&/\bAS\s+(?:WITH|SELECT)\b/i.test(s))fail('CREATE TABLE AS not permitted');
  if(/^ALTER TABLE\b/i.test(s)&&/\b(DROP|RENAME|TRUNCATE|ALTER COLUMN|DISABLE)\b/i.test(s))fail('destructive ALTER TABLE');
  if(/\bSECURITY DEFINER\b/i.test(s)&&!/SET\s+search_path\b/i.test(s))fail('SECURITY DEFINER requires pinned search_path');
  // This linter cannot prove that a SQL function body is safe. Human review is compulsory.
 }
 return list.length;
}
function normalizeRelease(file){
 const target=ensureInside(RELEASES,path.resolve(ROOT,file));
 if(!target.endsWith('.json'))fail('release must be JSON');
 const o=JSON.parse(fs.readFileSync(target,'utf8'));
 if(o.schemaVersion!==1||typeof o.id!=='string'||!ID.test(o.id))fail('invalid release identity');
 if(path.basename(target)!==o.id+'.json')fail('filename must match release id');
 if(typeof o.summary!=='string'||o.summary.trim().length<12)fail('summary required');
 if(!Array.isArray(o.components)||!o.components.length||o.components.some(c=>!['manager','player','shared'].includes(c)))fail('invalid components');
 if(!o.database||!['none','additive-schema'].includes(o.database.mode)||!Array.isArray(o.database.migrations))fail('invalid database declaration');
 if(o.database.mode==='none'&&o.database.migrations.length)fail('frontend/tooling-only release cannot list SQL');
 if(o.database.mode==='additive-schema'&&!o.database.migrations.length)fail('schema release requires migrations');
 if(o.dataCopy!==false||o.allowProductionDataWrite!==false)fail('data-copy and production-data-write MUST be false');
 if(!Array.isArray(o.files)||!o.files.length)fail('changed files must be listed');
 if(typeof o.rollback!=='string'||o.rollback.trim().length<15)fail('rollback plan required');
 if(typeof o.verification!=='string'||o.verification.trim().length<15)fail('verification required');
 const files=o.files.map(rel=>{
  if(typeof rel!=='string'||rel.startsWith('/')||rel.includes('\\')||rel.includes('..'))fail('invalid tracked file');
  const f=ensureInside(ROOT,path.resolve(ROOT,rel));
  if(!fs.statSync(f).isFile())fail('tracked file not a file: '+rel);
  return rel;
 });
 const migrations=[];
 for(const rel of o.database.migrations){
  if(typeof rel!=='string'||!VERSION.test(path.basename(rel))||rel!=='.club-control/patches/sql/'+path.basename(rel))fail('bad SQL path/name');
  const f=ensureInside(SQL_ROOT,path.resolve(ROOT,rel)),sql=fs.readFileSync(f,'utf8');
  if(sql.length>1024*1024)fail('SQL patch exceeds 1 MB');
  checkAdditiveSQL(sql,rel);
  migrations.push({path:rel,bytes:Buffer.byteLength(sql),sha256:sha256(sql)});
 }
 if(new Set(migrations.map(x=>x.path)).size!==migrations.length)fail('duplicate SQL patch');
 if(o.database.mode!=='none'){
  if(o.securityReviewed!==true)fail('schema patch requires explicit security review');
  if(o.database.migrations.some((p,i,a)=>i>0&&a[i-1]>=p))fail('SQL patches must be in version order');
 }
 return {release:o,files,migrations};
}
function plan({release,migrations},env){
 if(!['test','live'].includes(env))fail('explicit --env test|live is required');
 const project=env==='test'?'szzoubvhlwnojtzqjebc':'snqsxlyhontaepembaic';
 return [
  '# Club Control patch plan – NO ACTIONS PERFORMED','',
  '| Property | Value |','|---|---|',
  '| Release | '+release.id+' |','| Environment | '+env.toUpperCase()+' |',
  '| Supabase project | '+project+' |','| Components | '+release.components.join(', ')+' |',
  '| Database mode | '+release.database.mode+' |','| Data copy | NO |',
  '| Production records written | NO |','',
  'This tool NEVER connects to databases, changes data or deploys code.','',
  '## Steps',
  '1. Verify the current target schema and independent migration history: TEST and LIVE are NOT identical.',
  '2. Review backup, permissions, data invariants, deployment diff, and SQL by a human.',
  '3. If SQL is required, apply only these new reviewed additive patches to TEST; record applied IDs/checksums.',
  '4. Deploy the frontend to the separate TEST host and run all authorized and unauthorized role tests.',
  '5. Obtain explicit approval for LIVE; re-check LIVE schema compatibility and recovery.',
  '6. If approved, apply only new compatible schema patches to LIVE, then deploy matching LIVE frontend.',
  '7. Smoke test LIVE, watch errors, and never copy TEST user records into production.','',
  '## SQL patch checksums',
  ...(migrations.length?migrations.map(m=>'- '+m.path+' SHA-256: '+m.sha256):['None – frontend/tooling only.']),'',
  '## Rollback',release.rollback,'',
  '## Verification',release.verification,''
 ].join('\n');
}
function parseArgs(args){
 const o={};
 for(let i=0;i<args.length;i++){
  if(['--release','--env'].includes(args[i]))o[args[i].slice(2)]=args[++i];
  else fail('unknown parameter: '+args[i]);
 }
 return o;
}
function main(argv=process.argv.slice(2)){
 const [command,...args]=argv,o=parseArgs(args);
 if(!['validate','plan'].includes(command))fail('usage: patchkit.cjs validate|plan --release PATH [--env test|live]');
 if(!o.release)fail('--release is required');
 const result=normalizeRelease(o.release);
 if(command==='validate')process.stdout.write('PASS '+result.release.id+' mode='+result.release.database.mode+' migrations='+result.migrations.length+'\n');
 else process.stdout.write(plan(result,o.env));
}
if(require.main===module){try{main()}catch(e){console.error(e.message);process.exitCode=1}}
module.exports={normalizeRelease,checkAdditiveSQL,statements,plan,main};
