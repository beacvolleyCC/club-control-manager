'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('app.js','utf8');
const start=source.indexOf('function ccOpenCompetitionImportIntake_(){');
const end=source.indexOf('function renderCompetitionMatchCards_(){');
const intake=source.slice(start,end);
test('Manager match header offers gated import action in TEST branch',()=>{
 assert.ok(start>0&&end>start);
 assert.match(source,/id="ccCompetitionImportOpen"/);
 assert.match(source,/addEventListener\('click',ccOpenCompetitionImportIntake_\)/);
 assert.match(intake,/canAnyAction\('competition.matches','edit'\)/);
});
test('preview forces existing canonical matchId for protocol and score',()=>{
 assert.match(intake,/kind==='protocol'\|\|kind==='result'/);
 assert.match(intake,/available\.has\(league\+'\|'\+id\)/);
 assert.match(intake,/15\*1024\*1024/);
 assert.match(intake,/textContent=doc/);
});
test('no file upload, AI or database mutations in the preview implementation',()=>{
 assert.doesNotMatch(intake,/\b(?:fetch|rpc|\.upload|\.insert|\.update|\.upsert|save|write|FileReader)\s*\(/);
 assert.match(intake,/nem töltődik fel|NEM került feltöltésre/);
});
