'use strict';
// Database migration reproducibility gate. Metadata only, no Supabase API calls.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
function readMigrations(json){
 if(!json || !Array.isArray(json.migrations))throw Error('Missing migration history');
 const seen=new Set();
 return json.migrations.map(item=>{
  const v=String(item?.version||'');
  if(!/^\d{14}$/.test(v)||seen.has(v))throw Error('Malformed or duplicate remote migration version');
  seen.add(v);return v;
 });
}
function localMigrations(directory){
 const files=fs.existsSync(directory)?fs.readdirSync(directory):[];
 const out=[];
 for(const name of files){
  if(!name.endsWith('.sql'))continue;
  const match=/^(\d{14})_[A-Za-z0-9_\-]+\.sql$/.exec(name);
  if(!match)throw Error('Malformed local migration filename: '+name);
  out.push(match[1]);
 }
 if(new Set(out).size!==out.length)throw Error('Duplicate local migration version');
 return out.sort();
}
function audit(remote,local){
 const a=new Set(remote),b=new Set(local);
 const onlyRemote=remote.filter(v=>!b.has(v));
 const onlyLocal=local.filter(v=>!a.has(v));
 return {
  status:onlyRemote.length===0&&onlyLocal.length===0&&remote.length>0?'READY':'BLOCKED',
  remoteMigrations:remote.length,trackedMigrations:local.length,
  matchingVersions:remote.filter(v=>b.has(v)).length,
  missingInGit:onlyRemote,unrecordedInSupabase:onlyLocal
 };
}
function evaluate(snapshot,dir){
 return audit(readMigrations(snapshot),localMigrations(dir));
}
function main(args=process.argv.slice(2)){
 const mode=args[0]||'--audit';
 if(!['--audit','--require-parity'].includes(mode))throw Error('Use --audit or --require-parity');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/qa/supabase-migration-history-20261026.json'),'utf8'));
 const result=evaluate(manifest,path.join(root,'supabase/migrations'));
 console.log(JSON.stringify(result,null,2));
 if(mode==='--require-parity'&&result.status!=='READY')process.exitCode=2;
 return result;
}
if(require.main===module){try{main()}catch(e){console.error('Migration audit failed: '+e.message);process.exitCode=2}}
module.exports={readMigrations,localMigrations,audit,evaluate,main};
