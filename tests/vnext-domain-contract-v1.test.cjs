'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const doc=JSON.parse(fs.readFileSync(path.join(root,'vnext/shared/domain-contract.v1.json'),'utf8'));
test('vNext starts as separate design contract, never an implicit LIVE migration',()=>{
 assert.equal(doc.contract,'club-control-vnext-domain');
 assert.equal(doc.status,'design-contract-only');
 assert.equal(doc.target.backendRef,'szzoubvhlwnojtzqjebc');
 assert.equal(doc.target.liveWritesAllowed,false);
 assert.equal(doc.target.externalNotificationDispatch,false);
});
test('Two PWA clients use one shared backend rather than separate data stores',()=>{
 assert.deepEqual(doc.target.clients,['Manager TEST vNext','Player TEST vNext']);
 assert.equal(new Set(doc.domain.map(x=>x.name)).size,doc.domain.length);
 assert.ok(doc.domain.find(x=>x.name==='rsvp').sources.includes('public.availability'));
 assert.ok(doc.domain.find(x=>x.name==='teams').sources.includes('public.teams'));
 assert.ok(doc.domain.find(x=>x.name==='membership').sources.includes('public.team_memberships'));
});
test('Role scope and team/league separation stay in the contract',()=>{
 assert.match(doc.rules.permission,/server-validated/);
 assert.equal(doc.rules.effectiveDay,'Europe/Budapest');
 assert.match(doc.domain.find(x=>x.name==='competition').rule,/BB1-BB2-Men-separated/);
 assert.match(doc.domain.find(x=>x.name==='identity').rule,/do-not-merge/);
});
test('Connected TEST PWA and LIVE parity are explicit outstanding gates',()=>{
 assert.equal(doc.runtime.connectedTestPwaHosted,false);
 assert.match(doc.rules.baseline,/not-LIVE-schema-parity/);
 assert.equal(doc.runtime.cloudflarePagesNeededForMobileE2E,true);
 assert.equal(doc.runtime.managerSourceConfig,'demo');
 assert.equal(doc.runtime.playerSourceConfig,'demo');
});
test('Phase list establishes auth first, keeps later features modular',()=>{
 assert.equal(doc.phases[0],'00-schema-inventory-and-reproducibility');
 assert.equal(doc.phases[1],'01-auth-and-scope');
 assert.equal(doc.phases.at(-1),'10-settings-import-audit-and-release');
});
