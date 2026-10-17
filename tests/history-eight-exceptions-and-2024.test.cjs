'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {selectExceptions,rosterContext,seasonEvidence}=require('../scripts/history/inspect-eight-exceptions-and-2024.cjs');
const from=x=>JSON.parse(fs.readFileSync(path.join(__dirname,'../data/competition-history/'+x),'utf8'));
test('exactly eight source-listed exceptions, no fake or iterated IDs',()=>{
 const arr=selectExceptions(from('women1_2025_26_opponent_protocols.json'),from('women1_2025_26_beac_remaining_protocols.json'));
 assert.deepEqual(arr.map(x=>x.code),['2443','2667','3053','4071','7354','7777','7803','7822']);
 assert.ok(arr.every(x=>x.url.startsWith('https://www.hunvolley.info/pr_a/010/009/')));
});
test('reject an unofficial or altered protocol URL',()=>{
 const o=from('women1_2025_26_opponent_protocols.json'),b=from('women1_2025_26_beac_remaining_protocols.json');
 o.results.find(x=>x.code==='2443').officialSource='https://other.example/pr_a/010/009/p_009.asp?p_evad_kod=2025&p_merkozes_kod=2443&p_verseny_al_kod=93';
 assert.throws(()=>selectExceptions(o,b),/Unsafe/);
});
test('inspect player sections without inventing rows',()=>{
 const text='BEAC mez játékosok neve K CS C L kód figyelmeztet büntet kiállít kizár 10 MINTA ANNA K 12 345 hivatalos személyek neve';
 const a=rosterContext(text,'BEAC');
 assert.equal(a.found,true);
 assert.equal(a.parsedCount,1);
 assert.equal(a.parseReason,null);
 assert.equal(rosterContext(text,'OTHER').found,false);
});
test('2024 season index only returns evidence actually present',()=>{
 const a=seasonEvidence('<html><body>Női Budapest I. osztály</body></html>');
 assert.equal(a.women1HeaderOccurrences,1);
 assert.deepEqual(a.candidateLeagueLinks,[]);
});
