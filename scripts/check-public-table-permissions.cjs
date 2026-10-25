'use strict';
// Checks new PUBLIC TABLE definitions for RLS and an explicit client ACL choice.
// Applies to the source tree only. Does not query or alter LIVE Supabase.
const fs=require('node:fs');
const path=require('node:path');
const roots=['supabase/migrations','supabase/r1-attendance','sql'];
function strip(text){
 return String(text).replace(/\/\*[\s\S]*?\*\//g,' ')
   .replace(/^[ \t]*--[^\r\n]*$/gm,' ');
}
function names(sql){
 const pattern=/\bCREATE\s+(?:UNLOGGED\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:"?public"?\.)"?([a-z_][a-z0-9_]*)"?\s*\(/gi;
 return [...strip(sql).matchAll(pattern)].map(m=>m[1].toLowerCase());
}
function auditSql(sql,file='<inline>'){
 const clean=strip(sql);
 const acl=(clean.match(/\b(?:GRANT|REVOKE)\b[\s\S]*?;/gi)||[]).map(s=>s.trim());
 const errors=[];
 for(const table of names(clean)){
  const target='(?:"?public"?\\.)"?'+table+'"?';
  const scope=acl.filter(s=>new RegExp('\\bON\\s+(?:TABLE\\s+)?'+target+'\\b','i').test(s));
  const rls=new RegExp('\\bALTER\\s+TABLE\\s+(?:IF\\s+EXISTS\\s+)?'+target+'\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY','i').test(clean);
  const controlled=scope.some(s=>
   (/\bREVOKE\b/i.test(s)&&/\bFROM\b[\s\S]*\b(?:PUBLIC|anon|authenticated)\b/i.test(s))||
   (/\bGRANT\b/i.test(s)&&/\bTO\b[\s\S]*\b(?:anon|authenticated|service_role)\b/i.test(s))
  );
  if(!rls)errors.push({file,table,rule:'RLS_MISSING'});
  if(!controlled)errors.push({file,table,rule:'EXPLICIT_ACL_DECISION_MISSING'});
  if(scope.some(s=>/\bGRANT\s+ALL\b/i.test(s)&&/\bTO\b[\s\S]*\b(?:anon|authenticated)\b/i.test(s)))
   errors.push({file,table,rule:'BROAD_CLIENT_GRANT_ALL'});
  const write=scope.some(s=>/\bGRANT\b[^;]*\b(?:INSERT|UPDATE|DELETE)\b[^;]*\bTO\b[^;]*\bauthenticated\b/i.test(s));
  const policy=new RegExp('\\bCREATE\\s+POLICY\\b[\\s\\S]*?\\bON\\s+(?:TABLE\\s+)?'+target+'\\b','i').test(clean);
  if(write&&!policy)errors.push({file,table,rule:'CLIENT_WRITE_WITHOUT_POLICY'});
 }
 return errors;
}
function sqlFiles(dir){
 if(!fs.existsSync(dir))return [];
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(f=>{
  const full=path.join(dir,f.name);
  return f.isDirectory()?sqlFiles(full):f.isFile()&&f.name.endsWith('.sql')?[full]:[];
 });
}
function auditRepository(root='.'){
 const files=roots.flatMap(r=>sqlFiles(path.join(root,r)));
 return {
  count:files.length,
  tables:files.flatMap(file=>names(fs.readFileSync(file,'utf8'))
   .map(table=>({file:path.relative(root,file),table}))),
  errors:files.flatMap(file=>auditSql(fs.readFileSync(file,'utf8'),path.relative(root,file)))
 };
}
if(require.main===module){
 const result=auditRepository(process.argv[2]||'.');
 for(const err of result.errors)console.error('FAIL '+err.file+' public.'+err.table+' '+err.rule);
 console.log('CC_PUBLIC_ACL_QA: files='+result.count+
   ' tables='+result.tables.length+' errors='+result.errors.length);
 if(result.errors.length)process.exitCode=1;
}
module.exports={strip,names,auditSql,auditRepository};
