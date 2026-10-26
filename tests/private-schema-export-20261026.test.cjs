'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {compare,baseline}=require('../scripts/qa/compare-schema-fingerprint.cjs');
test('saved production fingerprint matches its own metadata',()=>{
 assert.equal(compare(baseline,baseline).status,'MATCH');
 assert.equal(Object.values(baseline.schema_structure).reduce((a,b)=>a+b.objects,0),1492);
});
test('missing, extra, altered and invalid fingerprints block staging',()=>{
 const copy=JSON.parse(JSON.stringify(baseline));
 copy.schema_structure.functions.objects++;
 assert.equal(compare(baseline,copy).status,'BLOCKED');
 delete copy.schema_structure.policies;
 assert.equal(compare(baseline,copy).status,'BLOCKED');
 const other=JSON.parse(JSON.stringify(baseline));
 other.schema_structure.indexes.fingerprint='x';
 assert.equal(compare(baseline,other).status,'BLOCKED');
 other.schema_structure.additional={objects:1,fingerprint:'0'.repeat(32)};
 assert.equal(compare(baseline,other).status,'BLOCKED');
});
test('PowerShell export is explicitly schema-only and blocks repository paths',()=>{
 const s=fs.readFileSync(path.join(__dirname,'../scripts/qa/export-private-supabase-schema.ps1'),'utf8');
 assert.match(s,/db dump --linked --schema public,private --file/);
 assert.match(s,/Assert-OutsideRepo \$PrivateDirectory/);
 assert.match(s,/\[switch\]\$SelfTest/);
 assert.doesNotMatch(s,/\& supabase db (?:push|pull|reset)/);
 assert.doesNotMatch(s,/\& supabase migration repair/);
});
