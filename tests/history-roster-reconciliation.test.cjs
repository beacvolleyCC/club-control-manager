'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {compareRosters,normalizedNameTokens,fromEvidence}=require('../scripts/history/reconcile-roster-evidence.cjs');

test('Hungarian and international name order match only as candidate hints',()=>{
 const old=[{name:'Anna Kiss',role:'Setter',communityProfileId:'1001'},{name:'Petra Nagy',role:'Libero'}];
 const current=[{name:'Kiss Anna',code:'100001',designation:'K'},{name:'Nagy Petra',code:'100002',designation:'CS'}];
 const x=compareRosters(old,current);
 assert.equal(x.nameHints.length,2);
 assert.equal(x.nameHints[0].status,'name_hint_only');
 assert.equal(x.nameHints[0].currentProtocolCode,'100001');
 assert.equal(x.nameHints[0].playedSets,null);
 assert.equal(x.retentionPercentage,null);
 assert.equal(x.confirmedOfficialCrossSeasonIds,0);
 assert.equal(x.playerRatingAllowed,false);
});

test('compound surname and different first names do not create implicit identities',()=>{
 assert.notEqual(normalizedNameTokens('Nagy-Tóth Csenge'),normalizedNameTokens('Tóth Csenge'));
 assert.notEqual(normalizedNameTokens('Lili Iglói'),normalizedNameTokens('Iglói Nóra'));
 const result=compareRosters([{name:'Tóth Csenge'},{name:'Nóra Iglói'}],
  [{name:'Nagy-Tóth Csenge',code:'200'},{name:'Iglói Lili',code:'201'}]);
 assert.equal(result.nameHints.length,0);
 assert.equal(result.unmatchedCurrentNames.length,2);
 assert.equal(result.retentionPercentage,null);
});

test('ambiguous duplicate names/codes fail closed',()=>{
 const result=compareRosters(
  [{name:'Kiss Anna'},{name:'Anna Kiss'}],
  [{name:'Anna Kiss',code:'400'},{name:'Nagy Eszter',code:'400'}]
 );
 assert.equal(result.nameHints.length,0);
 assert.equal(result.collisions.length,2);
});

test('protocol team selection must be exact and unique',()=>{
 const evidence={schemaVersion:1,seasons:[{season:'2025/26',rosterComplete:false,roster:[{name:'Kiss Anna'}]}]};
 const p={teamName:'BEAC',teams:[{name:'BEAC',players:[{name:'Anna Kiss',code:'400'}]},{name:'BEAC II.',players:[]}]};
 assert.equal(fromEvidence(evidence,p).nameHints.length,1);
 assert.throws(()=>fromEvidence(evidence,{...p,teamName:'BEA'}));
 assert.throws(()=>fromEvidence(evidence,{...p,teams:[...p.teams,p.teams[0]]}));
});

test('no historical roster allows retention calculation from one protocol alone',()=>{
 const r=compareRosters([], [{name:'Test Erika',code:'987'}]);
 assert.equal(r.oldListed,0);
 assert.equal(r.currentProtocolListed,1);
 assert.equal(r.retentionPercentage,null);
});
