import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const file = new URL('../packages/domain/src/authorization.ts', import.meta.url);
const source = readFileSync(file,'utf8');
const js = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {canAccess} = await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const grant=(subjectId,teamId,action='view')=>({subjectId,scope:{kind:'team',teamId},resource:'events',action,role:'coach'});
test('same-team access is allowed',()=>assert.equal(canAccess([grant('u1','a')],{subjectId:'u1',resource:'events',action:'view',teamId:'a'}),true));
test('cross-team access is denied',()=>assert.equal(canAccess([grant('u1','a')],{subjectId:'u1',resource:'events',action:'view',teamId:'b'}),false));
test('wrong actor and action are denied',()=>{
 assert.equal(canAccess([grant('u1','a')],{subjectId:'u2',resource:'events',action:'view',teamId:'a'}),false);
 assert.equal(canAccess([grant('u1','a')],{subjectId:'u1',resource:'events',action:'edit',teamId:'a'}),false);
});
test('team grant cannot access unscoped event',()=>assert.equal(canAccess([grant('u1','a')],{subjectId:'u1',resource:'events',action:'view'}),false));
test('club grant can access any team',()=>assert.equal(canAccess([{subjectId:'admin',scope:{kind:'club'},resource:'events',action:'view',role:'club_admin'}],{subjectId:'admin',resource:'events',action:'view',teamId:'b'}),true));
