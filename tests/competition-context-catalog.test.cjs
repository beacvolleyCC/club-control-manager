/* Shared Manager/Player competition context contract.
 * Run: node tests/competition-context-catalog.test.cjs
 */
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const catalog=require('../competition-context-catalog.js');
const a='Férfi Budapest I. osztály – A csoport';
const b='Férfi Budapest I. osztály – B csoport';
const w='Női Budapest I. osztály';
const wb='Női Budapest II. osztály – B csoport';
const fake={
 season:'2026/27',
 fixtures:[
  {competitionLabel:a,homeSourceTeamId:'101',homeName:'Klub Alfa',awaySourceTeamId:'102',awayName:'Klub Béta'},
  {competitionLabel:a,homeSourceTeamId:'101',homeName:'Alfa rövid',awaySourceTeamId:'103',awayName:'Klub Gamma'},
  {competitionLabel:b,homeSourceTeamId:'201',homeName:'Klub Delta',awaySourceTeamId:'202',awayName:'Klub Epszilon'},
  {competitionLabel:w,homeSourceTeamId:'301',homeName:'Klub Zéta',awaySourceTeamId:'302',awayName:'Klub Éta'},
  {competitionLabel:wb,homeSourceTeamId:'401',homeName:'Klub Théta',awaySourceTeamId:'402',awayName:'Klub Ióta'}
 ],
 matches:[{competitionLabel:a,homeName:'Alfa átírt',awayName:'Klub Béta',homeSets:3,awaySets:0}],
 tables:[
  {competitionLabel:a,rows:[{teamName:'Klub Alfa',position:1},{teamName:'Klub Béta',position:2}]},
  {competitionLabel:wb,rows:[{teamName:'Klub Théta',position:1}]},
  {competitionLabel:w,partial:true,rows:[{teamName:'Klub Éta',position:1}]}
 ]
};
test('Four observed contexts only: no invented women II/A',()=>{
 const rows=catalog.build(fake);
 assert.equal(rows.length,4);
 assert.equal(rows.some(c=>c.competitionLabel==='Női Budapest II. osztály – A csoport'),false);
 assert.deepEqual(rows.map(x=>x.group).filter(Boolean).sort(),['A','B','B']);
});
test('Source ID is identity even when team name differs',()=>{
 const row=catalog.build(fake).find(c=>c.competitionLabel===a);
 assert.equal(row.participantCount,3);
 const team=row.participants.find(x=>x.sourceTeamId==='101');
 assert.deepEqual(team.aliases,['Alfa rövid','Klub Alfa']);
 assert.equal(row.unresolvedNamesCount,3);
});
test('Standings status is honest and does not fabricate ranks',()=>{
 const rows=catalog.build(fake),byLabel=x=>rows.find(r=>r.competitionLabel===x);
 assert.equal(byLabel(a).standingsStatus,'snapshot');
 assert.equal(byLabel(b).standingsStatus,'missing');
 assert.equal(byLabel(w).standingsStatus,'partial');
 assert.equal(byLabel(b).standingsRowCount,0);
 assert.equal(Object.hasOwn(byLabel(b).participants[0],'position'),false);
});
test('Counts and season/group keys preserve context',()=>{
 const row=catalog.build(fake).find(c=>c.competitionLabel===a);
 assert.equal(row.id,'2026/27|'+a);
 assert.equal(row.fixtureCount,2);
 assert.equal(row.matchCount,1);
 assert.equal(row.group,'A');
});
test('Missing source IDs never produce fake participant identity',()=>{
 const only={season:'2026/27',matches:[{competitionLabel:'Teszt bajnokság',homeName:'Név A',awayName:'Név B'}]};
 const [row]=catalog.build(only);
 assert.equal(row.participantCount,0);
 assert.equal(row.unresolvedNamesCount,2);
});
test('Empty and malformed inputs are safe',()=>{
 assert.deepEqual(catalog.build({}),[]);
 assert.deepEqual(catalog.build({fixtures:[{competitionLabel:'A'}]}),[]);
 assert.equal(catalog.groupFromLabel('Női Budapest I. osztály'),null);
});
