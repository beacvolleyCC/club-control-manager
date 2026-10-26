'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'../../data/qa/supabase-schema-fingerprint-20261026.json'),'utf8'));
function compare(expected,candidate){
 const ref=expected?.schema_structure||expected;
 const input=candidate?.schema_structure||candidate;
 if(!ref||!input||typeof ref!=='object'||typeof input!=='object')throw Error('Missing schema_structure');
 const categories=Object.keys(ref).sort();
 if(categories.length!==7)throw Error('Unexpected fingerprint category count');
 const discrepancies=[];
 for(const k of categories){
  const a=ref[k],b=input[k];
  if(!Number.isInteger(a?.objects)||!/^[a-f0-9]{32}$/.test(a.fingerprint))
   throw Error('Invalid baseline fingerprint metadata');
  if(!b||!Number.isInteger(b.objects)||!/^[a-f0-9]{32}$/.test(b.fingerprint))
   discrepancies.push(k+':missing_or_invalid');
  else if(a.objects!==b.objects||a.fingerprint!==b.fingerprint)
   discrepancies.push(k+':drift');
 }
 for(const k of Object.keys(input))if(!categories.includes(k))discrepancies.push(k+':unexpected');
 return {status:discrepancies.length?'BLOCKED':'MATCH',categories:categories.length,discrepancies};
}
function main(){
 const file=process.argv[2];
 if(!file||file==='--help'){
  console.error('Usage: node scripts/qa/compare-schema-fingerprint.cjs <staging-query-json-file>');
  process.exitCode=2;return;
 }
 const content=JSON.parse(fs.readFileSync(file,'utf8'));
 const result=compare(baseline,content);
 console.log(JSON.stringify(result,null,2));
 if(result.status!=='MATCH')process.exitCode=2;
}
if(require.main===module){try{main()}catch(e){console.error('Fingerprint comparison failed: '+e.message);process.exitCode=2}}
module.exports={compare,baseline};
